import mongoose from "mongoose";

const patientInfo = {
    firstName:{
        type: String,
        required: true,
    },
    lastName:{
        type: String,
        required: true,
    },
    email:{
        type: String,
        required: true,
    },
    phone:{
        type: String,
        required: true,
    },
}

const appointmentSchema = new mongoose.Schema(
    {
        userId: {
            type: String,
            required: true,
        },
        patientInfo:{
            type: patientInfo,
            required: true,
        },
        slug:{
            type: String,
            required: true,
            unique: true,
        },
        date: {
            type: String,
            required: true,
        },
        timeSlot: {
            type: String,
            required: true,
        },
        reason: {
            type: String,
            required: true,
        },
        appointmentType: {
            type: String,
            enum: ["in-person", "video"],
        },
        status: {
            type: String,
            enum: ["pending", "approved", "rejected", "completed", "cancelled"],
            default: "pending",
        },
        meeting: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Meeting",
        },
        records: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Record",
            },
        ],
        whiteboard: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "WhiteBoard",
        },
        summary: {
            type: String,
        },
    },
    { timestamps: true }
);

const Appointment = mongoose.model("Appointment", appointmentSchema);

export default Appointment;
