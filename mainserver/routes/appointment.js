import { requireAuth } from "@clerk/express";
import { Router } from "express";
import appointmentService from "../services/appointment.js";
import { createAppointmentValidator } from "../validators/appointment.js";
import doctorAuth from "../middlewares/doctorAuth.js";

const router = Router();

router.post(
    "/create",
    requireAuth({}),
    appointmentService.createAppointment
);

router.get(
    "/appointments",
    requireAuth({}),
    createAppointmentValidator,
    appointmentService.getAppointments
);

router.post(
    "/cancelAppointment/:id",
    requireAuth({}),
    appointmentService.cancelAppointment
);

router.get("/getAvailableTimeSlots/:date", requireAuth({}), appointmentService.getAvailableTimeSlots);

router.get("/upcomingAppointments/:date", requireAuth({}), appointmentService.getUpcomingAppointments);
router.get("/pastAppointments/:date", requireAuth({}), appointmentService.getPastAppointments);
router.get("/pastAppointmentsDoctor/:date", doctorAuth, appointmentService.getAppointmentsDoctorPast);
router.get("/upcomingAppointmentsDoctor/:date", doctorAuth, appointmentService.getAppointmentsDoctorUpcoming);

router.get(
    "/getAppointment/:id",
    requireAuth({}),
    appointmentService.getAppointment
);
export default router;
