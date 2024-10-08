import { body } from "express-validator";

export const doctorSigninValidator = [
    body("firstName").isString().withMessage("firstName is required"),
    body("lastName").isString().withMessage("lastName is required"),
    body("specialization").isString().withMessage("Specialization is required"),
    body("experience")
        .isNumeric()
        .withMessage("Experience is required,should be numeric"),
    body("qualifications").isString().withMessage("Qualifications is required"),
];
