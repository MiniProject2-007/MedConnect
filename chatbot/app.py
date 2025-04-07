import json
import chromadb
from fastapi import FastAPI, HTTPException, Depends, Request
from fastapi.middleware.cors import CORSMiddleware
from together import Together
import uvicorn
from auth import verify_clerk_token
import re
import logging
from motor.motor_asyncio import AsyncIOMotorClient
import os
from dotenv import load_dotenv
from datetime import datetime

load_dotenv()

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

MONGO_URI = os.getenv("MONGO_URI")
DATABASE_NAME = os.getenv("DATABASE_NAME", "PeerConnect")
if not MONGO_URI:
    raise ValueError("MONGO_URI must be set")
mongo_client = AsyncIOMotorClient(MONGO_URI)
mongo_db = mongo_client[DATABASE_NAME]
appointments_collection = mongo_db["appointments"]

chroma_client = chromadb.PersistentClient(path="./chroma_db")
collection = chroma_client.get_or_create_collection(name="medical_faqs")
client = Together()


def load_faqs():
    with open("faqs.json", "r") as file:
        faqs = json.load(file)
    existing_data = collection.count()
    if existing_data > 0:
        logger.info(
            f"ChromaDB already has {existing_data} FAQs. Skipping load.")
        return
    for idx, faq in enumerate(faqs):
        collection.add(
            ids=[str(idx)],
            documents=[faq["question"]],
            metadatas=[{"answer": faq["answer"]}]
        )
    logger.info(f"Loaded {len(faqs)} FAQs into ChromaDB ✅")


def refine_answer(query, initial_answer):
    try:
        response = client.chat.completions.create(
            model="meta-llama/Llama-3.3-70B-Instruct-Turbo",
            messages=[
                {"role": "system", "content": "You are a medical assistant."},
                {"role": "user", "content": f"{query}\nAnswer: {initial_answer}\nImprove this response and return only the enhanced answer, nothing else."}
            ]
        )
        return response.choices[0].message.content.strip()
    except Exception as e:
        logger.error("Error refining answer: %s", e)
        return initial_answer


async def get_next_appointment(user_data):
    """
    Query the appointments collection for the next upcoming appointment for the user.
    Assumes appointments have fields 'userId', 'date' (formatted as YYYY-MM-DD),
    'timeSlot', and 'status'.
    """
    user_id = user_data.get("sub")
    if not user_id:
        raise HTTPException(status_code=401, detail="Unauthorized access.")
    today_str = datetime.utcnow().strftime("%Y-%m-%d")
    cursor = appointments_collection.find({
        "userId": user_id,
        "date": {"$gte": today_str},
        "status": {"$nin": ["cancelled", "completed", "rejected"]}
    }).sort("date", 1)
    upcoming = await cursor.to_list(length=1)
    if not upcoming:
        return "No upcoming appointments found."
    appt = upcoming[0]
    return f"Your next appointment is on {appt['date']} at {appt['timeSlot']}."


from datetime import datetime, timedelta

async def get_next_free_slot(user_data):
    """
    Determine the next available free slot considering the current time.
    If no free slot is available today, return the first available slot for tomorrow.
    """
    available_slots = [
        "09:00 AM - 09:30 AM",
        "09:30 AM - 10:00 AM",
        "10:00 AM - 10:30 AM",
        "10:30 AM - 11:00 AM",
        "11:00 AM - 11:30 AM",
        "11:30 AM - 12:00 PM",
        "12:00 PM - 12:30 PM",
        "12:30 PM - 01:00 PM",
        "01:00 PM - 01:30 PM",
        "01:30 PM - 02:00 PM",
        "02:00 PM - 02:30 PM",
        "02:30 PM - 03:00 PM",
        "03:00 PM - 03:30 PM",
        "03:30 PM - 04:00 PM",
        "04:00 PM - 04:30 PM",
        "04:30 PM - 05:00 PM",
    ]
    now = datetime.now()

    # Check for free slots today.
    today_str = now.strftime("%Y-%m-%d")
    cursor = appointments_collection.find({
        "date": today_str,
        "status": {"$nin": ["cancelled", "completed", "rejected"]}
    })
    appointments_today = await cursor.to_list(length=None)
    booked_slots_today = {appt["timeSlot"] for appt in appointments_today if "timeSlot" in appt}
    for slot in available_slots:
        if slot in booked_slots_today:
            continue
        slot_start_str = slot.split(" - ")[0]
        try:
            slot_start_time = datetime.strptime(slot_start_str, "%I:%M %p").time()
        except ValueError:
            continue
        slot_start_datetime = datetime.combine(now.date(), slot_start_time)
        if slot_start_datetime > now:
            return f"The next free slot is available on {today_str} at {slot}."

    # If no free slots today, check for tomorrow.
    tomorrow_date = now.date() + timedelta(days=1)
    tomorrow_str = tomorrow_date.strftime("%Y-%m-%d")
    cursor = appointments_collection.find({
        "date": tomorrow_str,
        "status": {"$nin": ["cancelled", "completed", "rejected"]}
    })
    appointments_tomorrow = await cursor.to_list(length=None)
    booked_slots_tomorrow = {appt["timeSlot"] for appt in appointments_tomorrow if "timeSlot" in appt}
    for slot in available_slots:
        if slot not in booked_slots_tomorrow:
            return f"The next free slot is available on {tomorrow_str} at {slot}."

    return "No free slots available today or tomorrow."


def search_faq_answer(query: str):
    results = collection.query(query_texts=[query], n_results=1)
    if not results.get("documents") or not results.get("metadatas") or not results["documents"][0]:
        raise HTTPException(status_code=404, detail="No relevant FAQ found.")
    best_answer = results["metadatas"][0][0]["answer"]
    return refine_answer(query, best_answer)


intent_handlers = {
    "appointment": get_next_appointment,
    "free_slot": get_next_free_slot,
    "faq": search_faq_answer,
}


def classify_intent(query: str) -> str:
    query_lower = query.lower()
    if re.search(r"\b(appointment|schedule|book)\b", query_lower):
        return "appointment"
    elif re.search(r"\b(free slot|available)\b", query_lower):
        return "free_slot"
    else:
        return "faq"


async def process_query(query: str, user_data) -> str:
    intent = classify_intent(query)
    logger.info("Detected intent: %s", intent)
    handler = intent_handlers.get(intent, search_faq_answer)
    if intent == "faq":
        return handler(query)
    else:
        return await handler(user_data)


@app.get("/")
def root():
    return {"message": "Welcome to the Medical FAQ Chatbot!"}


@app.get("/search")
async def search_faq(query: str, user_data=Depends(verify_clerk_token)):
    answer = await process_query(query, user_data)
    return {"query": query, "answer": answer}

if __name__ == "__main__":
    load_faqs()
    uvicorn.run(app, host="0.0.0.0", port=10000)
