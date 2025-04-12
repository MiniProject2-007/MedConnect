import mongoose from "mongoose";

const emailAddressSchema = new mongoose.Schema(
    {
        emailAddress: {
            type: String,
            required: true,
        },
        id: {
            type: String,
            required: true,
        },
        verificationStatus: {
            type: String,
        },
        verificationStrategy: {
            type: String,
        },
    },
    { _id: false }
);

const userSchema = new mongoose.Schema(
    {
        userId: {
            type: String,
            required: true,
            unique: true, // Clerk user ID (e.g., user_abc123)
        },
        firstName: {
            type: String,
            required: true,
        },
        lastName: {
            type: String,
            required: true,
        },
        emailAddresses: {
            type: [emailAddressSchema],
            required: true,
        },
        primaryEmailAddressId: {
            type: String,
        },
        profileImageUrl: {
            type: String,
        },
        passwordEnabled: {
            type: Boolean,
            default: false,
        },
        twoFactorEnabled: {
            type: Boolean,
            default: false,
        },
        lastSignInAt: {
            type: Number,
        },
        createdAt: {
            type: Number,
        },
        updatedAt: {
            type: Number,
        },
        role: {
            type: String,
            enum: ["user", "doctor", "admin"],
            default: "user",
        },
        isVerified: {
            type: Boolean,
            default: false,
        },
    },
    { timestamps: true }
);

export default mongoose.model("User", userSchema);
