import { Router } from "express";
import { ClerkExpressRequireAuth } from "@clerk/clerk-sdk-node";
import { doctorSignin, isDoctor,doctors } from "../controllers/user.js";
import { doctorSigninValidator } from "../validators/user.js";
const router = Router();

router.post(
    "/doctorSignin",
    ClerkExpressRequireAuth({}),
    doctorSigninValidator,
    doctorSignin
);

router.get("/isDoctor", ClerkExpressRequireAuth({}), isDoctor);
router.get("/doctors",doctors);
export default router;
