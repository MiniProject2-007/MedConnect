import { validationResult } from "express-validator";
import Doctor from "../Models/Doctor.js";

export const doctorSignin = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        const { userid } = req.headers;
        const {
            firstName,
            lastName,
            experience,
            qualification,
            specialization,
        } = req.body;

        const doctor = await Doctor.create({
            firstName,
            lastName,
            experience,
            qualification,
            specialization,
            userId: userid,
        });

        res.status(201).json(doctor);
    } catch (err) {
        console.log("Doctor Signin Error: ", err);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

export const isDoctor = async (req, res) => {
    try {
        const { userid } = req.headers;
        const doctor = await Doctor.findOne({ userId: userid });
        if (doctor) {
            return res.status(200).json({ isDoctor: true });
        } else {
            return res.status(200).json({ isDoctor: false });
        }
    } catch (err) {
        console.log("Is Doctor Error: ", err);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

export const doctors = async (req, res) => {
    try {
        const doctors = await Doctor.find(); 
        res.status(200).json(doctors);
    } catch (err) {
        res.status(500).json({ message: "Error fetching doctors", error: err.message });
    }
}

