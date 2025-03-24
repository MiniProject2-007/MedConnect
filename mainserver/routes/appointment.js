import { ClerkExpressRequireAuth } from "@clerk/clerk-sdk-node";
import { Router } from "express";
import appointmentService from "../services/appointment.js";
import { createAppointmentValidator } from "../validators/appointment.js";

const router = Router();

router.post(
    "/create",
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

router.get("/getAvailableTimeSlots/:date", ClerkExpressRequireAuth({}), appointmentService.getAvailableTimeSlots);

router.get("/upcomingAppointments/:date", ClerkExpressRequireAuth({}), appointmentService.getUpcomingAppointments);

router.get("/pastAppointments/:date", ClerkExpressRequireAuth({}), appointmentService.getPastAppointments);

// router.post(
//     "/approveAppointment/:id",
//     ClerkExpressRequireAuth({}),
//     appointmentService.approveAppointment
// );
// router.post(
//     "/rejectAppointment/:id",
//     ClerkExpressRequireAuth({}),
//     appointmentService.rejectAppointment
// );
// router.get(
//     "/getCompletedAppointments",
//     ClerkExpressRequireAuth({}),
//     appointmentService.getCompletedAppointments
// );

export default router;
