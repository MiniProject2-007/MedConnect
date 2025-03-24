import mongoose from "mongoose";

const meetingSchema = new mongoose.Schema(
    {
        slug: {
            type: String,
            required: true,
            unique: true,
        },
        duration: {
            type: Number,
            required: true,
            default: 0,
        },
    },
    {
        timestamps: true,
    }
);

const Meeting = mongoose.model("Meeting", meetingSchema);

export default Meeting;