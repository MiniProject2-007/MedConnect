import { Router } from "express";
import { ClerkExpressRequireAuth } from "@clerk/clerk-sdk-node";
import doctorService from "../services/doctor.js";
import { doctorSigninValidator } from "../validators/user.js";
const router = Router();

router.post(
    "/doctorSignin",
    ClerkExpressRequireAuth({}),
    doctorSigninValidator,
    doctorService.doctorSignin
);

router.get("/isDoctor", ClerkExpressRequireAuth({}), doctorService.isDoctor);
router.get("/doctors", ClerkExpressRequireAuth({}), doctorService.doctors);
router.post(
    "/rateDoctor/:doctorId",
    ClerkExpressRequireAuth({}),
    doctorService.rateDoctor
);
router.get(
    "/getDoctorRating/:doctorId",
    ClerkExpressRequireAuth({}),
    doctorService.getDoctorRatings
);

export default router;
