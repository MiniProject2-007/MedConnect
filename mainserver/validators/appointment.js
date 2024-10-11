import {check} from "express-validator"

export const createAppointmentValidator = [
    check("userId1").exists().withMessage("userId1 is required"),
    check("userId2").exists().withMessage("userId2 is required"),
    check("date").exists().withMessage("date is required"),
    check("timeSlot").exists().withMessage("timeSlot is required"),
];
