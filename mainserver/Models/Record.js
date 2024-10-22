import mongoose from "mongoose";

const recordSchema = new mongoose.Schema(
    {
        ownerId: {
            type: String,
            required: true,
        },
        sharedWith: {
            type: [String],
        },
        meetingId: {
            type: String,
            required: true,
        },
        name: {
            type: String,
            required: true,
        },
        description: {
            type: String,
        },
        recordType: {
            type: String,
            required: true,
            enum: ["prescription", "report", "recording", "other"],
            default: "other",
        },
        key: {
            type: String,
            required: true,
        },
        status: {
            type: String,
            enum: ["active", "inactive"],
            default: "active",
        },
    },
    { timestamps: true }
);

const Record = mongoose.model("Record", recordSchema);

export default Record;
