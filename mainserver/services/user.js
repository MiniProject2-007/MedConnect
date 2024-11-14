import { clerkClient } from "@clerk/clerk-sdk-node";
class UserService {
    getUserInfo = async (userId) => {
        return await clerkClient.users.getUser(userId);
    };

    getUserEmail = async (userId) => {
        const user = await clerkClient.users.getUser(userId);
        return user.emailAddresses[0].emailAddress;
    };
}

export default new UserService();
