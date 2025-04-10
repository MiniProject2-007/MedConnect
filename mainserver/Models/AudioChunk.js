import mongoose from "mongoose";


const audioChunkSchema = new mongoose.Schema({
    meetingId: {
        type: String,
        required: true
    },
    userId: {
        type: String,
        required: true
    },
    speaker: {
        type: String,
        enum: ['doctor', 'patient'],
        required: true
    },
    key: {
        type: String,
        required: true
    },
    timestamp: {
        type: Date,
        required: true,
    },
    transcript: {
        type: String
    },
    transcriptionStatus: {
        type: String,
        enum: ['pending', 'processing', 'completed', 'failed'],
        default: 'pending'
    },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
})

const AudioChunk = mongoose.model("AudioChunk", audioChunkSchema);
export default AudioChunk;