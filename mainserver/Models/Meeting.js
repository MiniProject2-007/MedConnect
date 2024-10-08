import mongoose from "mongoose";

const meetingSchema = new mongoose.Schema(
    {
        slug: {
            type: String,
            required: true,
            unique: true,
        },
        appointmentId: {
            type: String,
            required: true,
        },
        duration: {
            type: Number,
            required: true,
            default: 0,
        },
        date: {
            type: Date,
            required: true,
        },
        time: {
            type: String,
            required: true,
        },
        status: {
            type: String,
            enum: ["ucoming", "ongoing", "completed"],
            default: "upcoming",
        },
    },
    {
        timestamps: true,
    }
);

const Meeting = mongoose.model("Meeting", meetingSchema);

export default Meeting;