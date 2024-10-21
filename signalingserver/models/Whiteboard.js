const mongoose = require("mongoose");

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
        data: {
            type: String,
            required: true,
        },
    },
    {
        timestamps: true,
    }
);

const WhiteBoard = mongoose.model("WhiteBoard", whiteBoardSchema);

module.exports = WhiteBoard;
