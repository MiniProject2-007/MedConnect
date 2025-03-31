import { ClerkExpressRequireAuth } from "@clerk/clerk-sdk-node";
import { Router } from "express";
import appointmentService from "../services/appointment.js";
import { createAppointmentValidator } from "../validators/appointment.js";
import doctorAuth from "../middlewares/doctorAuth.js";

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
router.get("/pastAppointmentsDoctor/:date", doctorAuth, appointmentService.getAppointmentsDoctorPast);
router.get("/upcomingAppointmentsDoctor/:date", doctorAuth, appointmentService.getAppointmentsDoctorUpcoming);

router.get(
    "/getAppointment/:id",
    ClerkExpressRequireAuth({}),
    appointmentService.getAppointment
);
export default router;
