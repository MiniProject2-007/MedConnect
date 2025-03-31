import { validationResult } from "express-validator";
import Appointment from "../Models/Appointment.js";
import { format } from "date-fns";
import meetingService from "./meeting.js";
import Record from "../Models/Record.js";
import WhiteBoard from "../Models/WhiteBoard.js";

class AppointmentService {
    createAppointment = async (req, res) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }
            const { userId, date, timeSlot, reason, appointmentType } = req.body;

            const isAvailable = await this.isTimeSlotAvailable(
                format(new Date(date), "yyyy-MM-dd"),
                timeSlot
            );

            if (!isAvailable) {
                return res
                    .status(400)
                    .json({ error: "Time Slot not available" });
            }

            const appointment = await Appointment.create({
                userId,
                date,
                timeSlot,
                reason,
                appointmentType,
            });

            if (appointment.appointmentType.trim().toLocaleLowerCase() === "video") {
                const meeting = await meetingService.createMeeting();
                await Appointment.findByIdAndUpdate(appointment._id, {
                    meeting: meeting.meeting._id,
                });
            }

            res.status(201).json(appointment);
        } catch (err) {
            console.log("Create Appointment Error: ", err);
            res.status(500).json({ error: "Internal Server Error" });
        }
    };

    isTimeSlotAvailable = async (date, timeSlot) => {
        try {
            const appointments = await Appointment.find({
                date,
                timeSlot
            });
            return appointments.length === 0;
        } catch (err) {
            console.log("Is Time Slot Available Error: ", err);
            return false;
        }
    };

    getAppointments = async (req, res) => {
        try {
            const { userid } = req.headers;
            const appointments = await Appointment.find({
                userId: userid,
            });

            res.status(200).json(appointments);
        } catch (err) {
            console.log("Get Appointments Error: ", err);
            res.status(500).json({ error: "Internal Server Error" });
        }
    };

    cancelAppointment = async (req, res) => {
        try {
            const { userid } = req.headers;
            const { id } = req.params;
            const appointment = await Appointment.findById(id);

            if (appointment.userId !== userid) {
                return res.status(403).json({ error: "Unauthorized" });
            }
            if (!appointment) {
                return res.status(404).json({ error: "Appointment not found" });
            }
            await Appointment.findByIdAndUpdate(id, { status: "cancelled" });
            res.status(200).json({ message: "Appointment cancelled" });
        } catch (err) {
            console.log("Cancel Appointment Error: ", err);
            res.status(500).json({ error: "Internal Server Error" });
        }
    };

    getAvailableTimeSlots = async (req, res) => {
        try {
            const { date } = req.params;
            console.log("Date: ", date);
            const appointments = await Appointment.find({ date });

            const availableSlots = [
                "09:00 AM - 09:30 AM",
                "09:30 AM - 10:00 AM",
                "10:00 AM - 10:30 AM",
                "10:30 AM - 11:00 AM",
                "11:00 AM - 11:30 AM",
                "11:30 AM - 12:00 PM",
                "12:00 PM - 12:30 PM",
                "12:30 PM - 01:00 PM",
                "01:00 PM - 01:30 PM",
                "01:30 PM - 02:00 PM",
                "02:00 PM - 02:30 PM",
                "02:30 PM - 03:00 PM",
                "03:00 PM - 03:30 PM",
                "03:30 PM - 04:00 PM",
                "04:00 PM - 04:30 PM",
                "04:30 PM - 05:00 PM",
            ];

            const availableSlotsFiltered = availableSlots.filter((slot) => {
                let isAvailable = true;
                for (let i = 0; i < appointments.length; i++) {
                    if (
                        appointments[i].date === date &&
                        appointments[i].status !== "cancelled" &&
                        appointments[i].status !== "completed" &&
                        appointments[i].status !== "rejected"
                    ) {
                        if (appointments[i].timeSlot === slot) {
                            isAvailable = false;
                            break;
                        }
                    }
                }
                return isAvailable;
            });

            res.status(200).json(availableSlotsFiltered);
        } catch (err) {
            console.log("Get Available Time Slots Error: ", err);
            res.status(500).json({ error: "Internal Server Error" });
        }
    };

    getUpcomingAppointments = async (req, res) => {
        try {
            const { userid } = req.headers;
            const { date } = req.params;
            console.log("Date: ", date, userid);
            const appointments = await Appointment.find({
                userId: userid,
                date: { $gte: date },
            }).populate("meeting records whiteboard");

            appointments.sort((a, b) => {
                return new Date(a.date) - new Date(b.date);
            });

            res.status(200).json(appointments);
        } catch (err) {
            console.log("Get Upcoming Appointments Error: ", err);
            res.status(500).json({ error: "Internal Server Error" });
        }
    };

    getPastAppointments = async (req, res) => {
        try {
            const { userid } = req.headers;
            const { date } = req.params;
            const appointments = await Appointment.find({
                userId: userid,
                date: { $lt: date },
            }).populate("meeting records whiteboard");
            for (let i = 0; i < appointments.length; i++) {
                if (appointments[i].status === "approved") {
                    appointments[i].status = "completed"
                    await appointments[i].save();
                }
            }
            appointments.sort((a, b) => {
                return new Date(b.date) - new Date(a.date);
            })
            res.status(200).json(appointments);
        } catch (err) {
            console.log("Get Past Appointments Error: ", err);
            res.status(500).json({ error: "Internal Server Error" });
        }
    };

    getAppointmentsDoctorPast = async (req, res) => {
        try {
            const { date } = req.params;
            const appointments = await Appointment.find({
                date: { $lt: date },
            }).populate("meeting records whiteboard");
            for (let i = 0; i < appointments.length; i++) {
                if (appointments[i].status === "approved") {
                    appointments[i].status = "completed"
                    await appointments[i].save();
                }
            }
            appointments.sort((a, b) => {
                return new Date(b.date) - new Date(a.date);
            })
            res.status(200).json(appointments);
        } catch (err) {
            console.log("Get Past Appointments Error: ", err);
            res.status(500).json({ error: "Internal Server Error" });
        }
    }

    getAppointmentsDoctorUpcoming = async (req, res) => {
        try {
            const { date } = req.params;
            const appointments = await Appointment.find({
                date: { $gte: date },
            }).populate("meeting records whiteboard");

            appointments.sort((a, b) => {
                return new Date(a.date) - new Date(b.date);
            });

            res.status(200).json(appointments);
        } catch (err) {
            console.log("Get Upcoming Appointments Error: ", err);
            res.status(500).json({ error: "Internal Server Error" });
        }
    };
}

export default new AppointmentService();
