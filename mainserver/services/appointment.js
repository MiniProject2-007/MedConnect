import { validationResult } from "express-validator";
import Appointment from "../Models/Appointment.js";
import { format } from "date-fns";
import Doctor from "../Models/Doctor.js";
import meetingService from "./meeting.js";
import userService from "./user.js";
import { sendAppointmentMessage } from "../lib/email.js";

class AppointmentService {
    createAppointment = async (req, res) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }
            const { userId1, userId2, date, timeSlot } = req.body;

            let userAppointments = await Appointment.find({
                userId1: userId1,
                date: format(new Date(date), "yyyy-MM-dd"),
                timeSlot: timeSlot,
            });

            if (userAppointments.length > 0) {
                return res
                    .status(400)
                    .json({ error: "Appointment already exists" });
            }

            userAppointments = await Appointment.find({
                userId1: userId1,
            });

            if (userAppointments.length >= 2) {
                return res
                    .status(400)
                    .json({ error: "Maximum 2 appointments allowed" });
            }
            const isAvailable = await this.isTimeSlotAvailable(
                format(new Date(date), "yyyy-MM-dd"),
                timeSlot,
                userId2
            );

            if (!isAvailable) {
                return res
                    .status(400)
                    .json({ error: "Time Slot not available" });
            }

            const appointment = await Appointment.create({
                userId1,
                userId2,
                date,
                timeSlot,
            });

            res.status(201).json(appointment);
        } catch (err) {
            console.log("Create Appointment Error: ", err);
            res.status(500).json({ error: "Internal Server Error" });
        }
    };

    isTimeSlotAvailable = async (date, timeSlot, userid2) => {
        try {
            const appointments = await Appointment.find({
                date,
                timeSlot,
                userid2,
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
                $or: [{ userId1: userid }, { userId2: userid }],
            });

            const appointmentsRes = await Promise.all(
                appointments.map(async (appointment) => {
                    const meeting = await meetingService.getAppointmentMeeting(
                        appointment._id
                    );

                    if (
                        await this.isAppointmentPassed(
                            appointment.date,
                            appointment.timeSlot
                        )
                    ) {
                        await Appointment.findByIdAndUpdate(appointment._id, {
                            status: "completed",
                        });
                        appointment.status = "completed";
                    }
                    if (appointment.userId1 === userid) {
                        const user2 = await Doctor.findOne({
                            userId: appointment.userId2,
                        });

                        return {
                            _id: appointment._id,
                            userId1: appointment.userId1,
                            userId2: appointment.userId2,
                            date: appointment.date,
                            timeSlot: appointment.timeSlot,
                            status: appointment.status,
                            with: `${user2.firstName} ${user2.lastName}`,
                            meeting: meeting?.slug,
                        };
                    } else {
                        const user1 = await userService.getUserInfo(
                            appointment.userId1
                        );
                        return {
                            _id: appointment._id,
                            userId1: appointment.userId1,
                            userId2: appointment.userId2,
                            date: appointment.date,
                            timeSlot: appointment.timeSlot,
                            status: appointment.status,
                            with: `${user1.firstName} ${user1.lastName}`,
                            meeting: meeting?.slug,
                        };
                    }
                })
            );

            res.status(200).json(appointmentsRes);
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

            if (appointment.userId1 !== userid) {
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

    approveAppointment = async (req, res) => {
        try {
            const { userid } = req.headers;
            const { id } = req.params;
            const appointment = await Appointment.findById(id);

            if (appointment.userId2 !== userid) {
                return res.status(403).json({ error: "Unauthorized" });
            }
            if (!appointment) {
                return res.status(404).json({ error: "Appointment not found" });
            }
            await Appointment.findByIdAndUpdate(id, { status: "approved" });
            const meeting = await meetingService.createMeeting(appointment);
            const link = `${process.env.FRONTEND_URL}/meeting/joinmeeting/${meeting.slug}`;

            const userids = [appointment.userId1, appointment.userId2];

            userids.map(async (userid) => {
                try {
                    const email = await userService.getUserEmail(userid);
                    await sendAppointmentMessage(email, link);
                } catch (err) {
                    console.log("Email Error: ", err);
                }
            });
            res.status(200).json({ message: "Appointment approved" });
        } catch (err) {
            console.log("Approve Appointment Error: ", err);
            res.status(500).json({ error: "Internal Server Error" });
        }
    };

    rejectAppointment = async (req, res) => {
        try {
            const { userid } = req.headers;
            const { id } = req.params;
            const appointment = await Appointment.findById(id);

            if (appointment.userId2 !== userid) {
                return res.status(403).json({ error: "Unauthorized" });
            }
            if (!appointment) {
                return res.status(404).json({ error: "Appointment not found" });
            }
            await Appointment.findByIdAndUpdate(id, { status: "rejected" });
            res.status(200).json({ message: "Appointment rejected" });
        } catch (err) {
            console.log("Reject Appointment Error: ", err);
            res.status(500).json({ error: "Internal Server Error" });
        }
    };

    getCompletedAppointments = async (req, res) => {
        try {
            const { userid } = req.headers;
            console.log(userid);
            const appointments = await Appointment.find({
                $or: [{ userId1: userid }, { userId2: userid }],
                $or: [
                    {
                        status: "completed",
                    },
                    {
                        status: "approved",
                    },
                ],
            });

            const appointmentsRes = await Promise.all(
                appointments.map(async (appointment) => {
                    const meeting = await meetingService.getAppointmentMeeting(
                        appointment._id
                    );
                    if (appointment.userId1 === userid) {
                        const user2 = await Doctor.findOne({
                            userId: appointment.userId2,
                        });

                        return {
                            _id: appointment._id,
                            userId1: appointment.userId1,
                            userId2: appointment.userId2,
                            date: appointment.date,
                            timeSlot: appointment.timeSlot,
                            status: appointment.status,
                            with: `${user2.firstName} ${user2.lastName}`,
                            meeting: meeting?.slug,
                        };
                    } else {
                        const user1 = await userService.getUserInfo(
                            appointment.userId1
                        );
                        return {
                            _id: appointment._id,
                            userId1: appointment.userId1,
                            userId2: appointment.userId2,
                            date: appointment.date,
                            timeSlot: appointment.timeSlot,
                            status: appointment.status,
                            with: `${user1.firstName} ${user1.lastName}`,
                            meeting: meeting?.slug,
                        };
                    }
                })
            );

            res.status(200).json(appointmentsRes);
        } catch (err) {
            console.log("Get Completed Appointments Error: ", err);
            res.status(500).json({ error: "Internal Server Error" });
        }
    };

    isAppointmentPassed = async (date, timeSlot) => {
        try {
            const currentTime = new Date();
            const appointmentTime = new Date(`${date}T${timeSlot}:00`);
            return currentTime > appointmentTime;
        } catch (err) {
            console.log("Is Appointment Passed Error: ", err);
            return false;
        }
    };
}

export default new AppointmentService();
