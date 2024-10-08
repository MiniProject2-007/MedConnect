import mongoose from "mongoose";

const whiteBoardSchema = new mongoose.Schema(
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
    },
    {
        timestamps: true,
    }
);

const WhiteBoard = mongoose.model("WhiteBoard", whiteBoardSchema);

export default WhiteBoard;
