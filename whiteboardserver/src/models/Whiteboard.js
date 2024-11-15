import mongoose from "mongoose";

const whiteBoardSchema = new mongoose.Schema(
    {
        id: {
            type: String,
            required: true,
            unique: true,
        },
        data: {
            type: String,
            required: true, 
        },
        lastModified: {
            type: Date,
            default: Date.now, 
        },
    },
    {
        timestamps: true,
    }
);

const WhiteBoard = mongoose.model("WhiteBoard", whiteBoardSchema);

export default WhiteBoard;
