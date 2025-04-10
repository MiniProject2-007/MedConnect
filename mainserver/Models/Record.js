import mongoose from "mongoose";

const recordSchema = new mongoose.Schema(
    {
        userId: {
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
            enum: ["prescription", "report", "other"],
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
