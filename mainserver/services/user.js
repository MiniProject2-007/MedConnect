import { clerkClient } from "@clerk/express";
import { Webhook } from "svix";
import User from "../Models/User.js";
import whatsappService from "./whatsapp.js";

class UserService {
    getUserInfo = async (userId) => {
        return await clerkClient.users.getUser(userId);
    };

    getUserEmail = async (userId) => {
        const user = await clerkClient.users.getUser(userId);
        return user.emailAddresses[0].emailAddress;
    };

    userCreated = async (req, res) => {
        try {
            const wh = new Webhook(process.env.CLERK_SIGNING_SECRET);
            const headers = {
                "svix-id": req.header("svix-id"),
                "svix-timestamp": req.header("svix-timestamp"),
                "svix-signature": req.header("svix-signature"),
            };
            const payload = Buffer.isBuffer(req.body)
                ? req.body
                : Buffer.from(JSON.stringify(req.body));
            const event = wh.verify(payload, headers);
            if (event.type === "user.created") {
                const u = event.data;
                const newUser = new User({
                    userId: u.id,
                    firstName: u.first_name,
                    lastName: u.last_name,
                    emailAddresses: u.email_addresses.map(e => ({
                        emailAddress: e.email_address,
                        id: e.id,
                        verificationStatus: e.verification.status,
                        verificationStrategy: e.verification.strategy
                    })),
                    primaryEmailAddressId: u.primary_email_address_id,
                    profileImageUrl: u.profile_image_url,
                    passwordEnabled: u.password_enabled,
                    twoFactorEnabled: u.two_factor_enabled,
                    lastSignInAt: u.last_sign_in_at,
                    createdAt: u.created_at,
                    updatedAt: u.updated_at,
                    role: "user",
                    isVerified: u.email_addresses.some(e => e.verification.status === "verified")
                });
                await newUser.save();

                const to = u.phone_numbers?.[0]?.phone_number;
                if (to) {
                    await whatsappService.sendWelcomeMessage(to, u.first_name);
                }
            }
            res.status(200).send("OK");
        } catch (error) {
            console.log(error);
            res.status(500).json({ error: "Internal server error" });
        }
    };
}

export default new UserService();
