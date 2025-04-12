import { clerkClient } from "@clerk/express";
class UserService {
    getUserInfo = async (userId) => {
        return await clerkClient.users.getUser(userId);
    };

    getUserEmail = async (userId) => {
        const user = await clerkClient.users.getUser(userId);
        return user.emailAddresses[0].emailAddress;
    };

    userCreated = async (req, res) => {
        console.log(req)
        res.status(200).send("User created");   
    }
}

export default new UserService();
