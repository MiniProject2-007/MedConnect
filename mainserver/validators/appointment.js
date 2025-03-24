import { check } from "express-validator"

export const createAppointmentValidator = [
    check("userId").exists().withMessage("userId is required"),
    check("date").exists().withMessage("date is required"),
    check("timeSlot").exists().withMessage("timeSlot is required"),
    check("reason").exists().withMessage("reason is required"),
    check("appointmentType").exists().withMessage("appointmentType is required"),
];
