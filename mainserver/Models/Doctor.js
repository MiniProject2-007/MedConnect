import mongoose from "mongoose";

const doctorSchema = new mongoose.Schema(
    {
        firstName: {
            type: String,
            required: true,
        },
        lastName: {
            type: String,
            required: true,
        },
        userId: {
            type: String,
            required: true,
            unique: true,
        },
        specialization: {
            type: String,
        },
        experience: {
            type: Number,
        },
        qualifications: {
            type: String,
        },
        rating: {
            type: Number,
            default: 0,
        },
        role: {
            type: String,
            enum: ["doctor"],
            default: "doctor",
        },
    },
    { timestamps: true }
);

const Doctor = mongoose.model("Doctor", doctorSchema);

export default Doctor;
