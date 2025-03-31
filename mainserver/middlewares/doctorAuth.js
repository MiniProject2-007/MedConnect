import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

const doctorAuth = (req, res, next) => {
    try {
        const token = req.headers["authorization"];
        if (!token) {
            return res.status(401).json({ error: "Unauthorized" });
        }
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const { email } = decoded;
        if (email !== process.env.ADMIN_EMAIL) {
            return res.status(401).json({ error: "Unauthorized" });
        }
        req.user = decoded;
        next();
    } catch (err) {
        console.log("Doctor Auth Error: ", err);
        res.status(401).json({ error: "Unauthorized" });
    }
}

export default doctorAuth;