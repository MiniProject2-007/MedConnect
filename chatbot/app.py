import json
import chromadb
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from together import Together
import uvicorn

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

chroma_client = chromadb.PersistentClient(path="./chroma_db")
collection = chroma_client.get_or_create_collection(name="medical_faqs")

client = Together()


def load_faqs():
    with open("faqs.json", "r") as file:
        faqs = json.load(file)

    existing_data = collection.count()
    if existing_data > 0:
        print(f"ChromaDB already has {existing_data} FAQs. Skipping load.")
        return

    for idx, faq in enumerate(faqs):
        collection.add(
            ids=[str(idx)],
            documents=[faq["question"]],
            metadatas=[{"answer": faq["answer"]}]
        )
    print(f"Loaded {len(faqs)} FAQs into ChromaDB ✅")


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
        print("Error refining answer:", e)
        return initial_answer

@app.get("/")
def root():
    return {"message": "Welcome to the Medical FAQ Chatbot!"}

@app.get("/search")
def search_faq(query: str):
    results = collection.query(query_texts=[query], n_results=1)
    print(results)
    if not results.get("documents") or not results.get("metadatas") or not results["documents"][0]:
        raise HTTPException(status_code=404, detail="No relevant FAQ found.")

    best_answer = results["metadatas"][0][0]["answer"]
    refined_answer = refine_answer(query, best_answer)

    return {"query": query, "answer": refined_answer}


if __name__ == "__main__":
    load_faqs()
    uvicorn.run(app, host="0.0.0.0", port=10000)
