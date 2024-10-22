import mongoose from "mongoose";

const ratingSchema = new mongoose.Schema(
    {
        doctorId: {
            type: String,
            required: true,
        },
        userId: {
            type: String,
            required: true,
        },
        username: {
            type: String,
            required: true,
        },
        rating: {
            type: Number,
            required: true,
        },
        review: {
            type: String,
        },
    },
    { timestamps: true }
);

const Rating = mongoose.model("Rating", ratingSchema);

export default Rating;
