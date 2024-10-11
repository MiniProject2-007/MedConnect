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
            type: String,
            required: true,
        },
        time: {
            type: Number,
            required: true,
        },
        status: {
            type: String,
            enum: ["upcoming", "ongoing", "completed"],
            default: "upcoming",
        },
    },
    {
        timestamps: true,
    }
);

const Meeting = mongoose.model("Meeting", meetingSchema);

export default Meeting;