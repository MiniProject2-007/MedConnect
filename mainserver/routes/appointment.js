import { ClerkExpressRequireAuth } from "@clerk/clerk-sdk-node";
import { Router } from "express";
// import Appointment from "../Models/Appointment";
import appointmentService from "../services/appointment.js";
import { createAppointmentValidator } from "../validators/appointment.js";

const router = Router();

router.post(
    "/bookAppointment",
    ClerkExpressRequireAuth({}),
    appointmentService.createAppointment
);

router.get(
    "/appointments",
    ClerkExpressRequireAuth({}),
    createAppointmentValidator,
    appointmentService.getAppointments
);

router.post(
    "/cancelAppointment/:id",
    ClerkExpressRequireAuth({}),
    appointmentService.cancelAppointment
);
router.post(
    "/approveAppointment/:id",
    ClerkExpressRequireAuth({}),
    appointmentService.approveAppointment
);
router.post(
    "/rejectAppointment/:id",
    ClerkExpressRequireAuth({}),
    appointmentService.rejectAppointment
);
router.get(
    "/getCompletedAppointments",
    ClerkExpressRequireAuth({}),
    appointmentService.getCompletedAppointments
);

export default router;
