import { clerkClient } from "@clerk/clerk-sdk-node";
class UserService {
    getUserInfo = async (userId) => {
        return await clerkClient.users.getUser(userId);
    };
}

export default new UserService();
