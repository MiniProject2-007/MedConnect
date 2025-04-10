import mongoose from "mongoose";

const transcriptSchema = new mongoose.Schema({
    slug: { type: String, required: true, unique: true },
    conversation: [
        {
            speaker: { type: String, enum: ['doctor', 'patient'], required: true },
            time: { type: Date, required: true },
            text: { type: String, required: true }
        }
    ]
}, { timestamps: true });

const Transcript = mongoose.model("Transcript", transcriptSchema);
export default Transcript;