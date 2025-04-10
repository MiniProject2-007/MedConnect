import { check } from "express-validator";

export const uploadAudioValidator = [
    check("slug")
        .exists().withMessage("Meeting slug is required")
        .isString().withMessage("Slug must be a string"),

    check("userId")
        .exists().withMessage("userId is required"),

    check("speaker")
        .exists().withMessage("Speaker identity is required")
        .isIn(["doctor", "patient"]).withMessage("Speaker must be either 'doctor' or 'patient'"),

    check("timestamp")
        .exists().withMessage("Timestamp is required")
        .isISO8601().withMessage("Timestamp must be a valid ISO 8601 date-time string"),
];
