import jwt from "jsonwebtoken"
import dotenv from "dotenv";
import Appointment from "../Models/Appointment.js";

dotenv.config();
class DoctorService {
    doctorSignin = async (req, res) => {
        try {
            const { email, password } = req.body;
            if (!email || !password) {
                return res.status(400).json({ error: "All fields are required" });
            }

            if (email !== process.env.ADMIN_EMAIL || password !== process.env.ADMIN_PASSWORD) {
                return res.status(401).json({ error: "Invalid credentials" });
            }

            const doctor = {
                email
            };

            const token = jwt.sign(doctor, process.env.JWT_SECRET, {
                expiresIn: "1h",
            });
            res.status(201).json({
                message: "Doctor signed in successfully",
                token,
            });
        } catch (err) {
            console.log("Doctor Signin Error: ", err);
            res.status(500).json({ error: "Internal Server Error" });
        }
    };

    approveAppointment = async (req, res) => {
        try {
            const { id } = req.params;

            const appointment = await Appointment.findById(id);
            if (!appointment) {
                return res.status(404).json({ error: "Appointment not found" });
            }

            appointment.status = "approved";
            await appointment.save();

            res.status(200).json({
                message: "Appointment status updated successfully",
                appointment,
            });
        } catch (err) {
            console.log("Confirm Appointment Error: ", err);
            res.status(500).json({ error: "Internal Server Error" });
        }
    }

}

export default new DoctorService();
