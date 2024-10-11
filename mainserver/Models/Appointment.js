import mongoose from "mongoose";

const appointmentSchema = new mongoose.Schema(
    {
        userId1: {
            type: String,
            required: true,
        },
        userId2: {
            type: String,
            required: true,
        },
        date: {
            type: String,
            required: true,
        },
        timeSlot: {
            type: Number,
            required: true,
        },
        status: {
            type: String,
            enum: ["pending", "approved", "rejected", "completed", "cancelled"],
            default: "pending",
        },
    },
    { timestamps: true }
);

const Appointment = mongoose.model("Appointment", appointmentSchema);

export default Appointment;
