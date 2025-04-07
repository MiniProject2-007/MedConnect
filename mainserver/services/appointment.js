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
            const { userId, date, timeSlot, reason, appointmentType, user } = req.body;

            const isAvailable = await this.isTimeSlotAvailable(
                format(new Date(date), "yyyy-MM-dd"),
                timeSlot
            );

            if (!isAvailable) {
                return res
                    .status(400)
                    .json({ error: "Time Slot not available" });
            }
            let meeting, whiteboard;
            if (appointmentType.trim().toLocaleLowerCase() === "video") {
                meeting = await meetingService.createMeeting();
                whiteboard = new WhiteBoard({
                    slug: meeting.slug,
                    data: `{"clock": 3, "tombstones": {}, "schema": { "schemaVersion": 2, "sequences": { "com.tldraw.store": 4, "com.tldraw.asset": 1, "com.tldraw.camera": 1, "com.tldraw.document": 2, "com.tldraw.instance": 25, "com.tldraw.instance_page_state": 5, "com.tldraw.page": 1, "com.tldraw.instance_presence": 5, "com.tldraw.pointer": 1, "com.tldraw.shape": 4, "com.tldraw.asset.bookmark": 2, "com.tldraw.asset.image": 5, "com.tldraw.asset.video": 5, "com.tldraw.shape.arrow": 5, "com.tldraw.shape.bookmark": 2, "com.tldraw.shape.draw": 2, "com.tldraw.shape.embed": 4, "com.tldraw.shape.frame": 0, "com.tldraw.shape.geo": 9, "com.tldraw.shape.group": 0, "com.tldraw.shape.highlight": 1, "com.tldraw.shape.image": 4, "com.tldraw.shape.line": 5, "com.tldraw.shape.note": 8, "com.tldraw.shape.text": 2, "com.tldraw.shape.video": 2, "com.tldraw.binding.arrow": 0 } }, "documents": [{ "state": { "gridSize": 10, "name": "", "meta": {}, "id": "document:document", "typeName": "document" }, "lastChangedClock": 0 }, { "state": { "meta": {}, "id": "page:QJIaG7rq4rFZk0AcktF_Z", "name": "Page 1", "index": "a1", "typeName": "page" }, "lastChangedClock": 0 }]}`
                })
                await whiteboard.save();
            }
            const appointment = await Appointment.create({
                userId,
                slug: meeting.slug,
                date,
                timeSlot,
                reason,
                appointmentType,
                patientInfo: {
                    email: user.emailAddresses[0].emailAddress,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    phone: user.phoneNumbers[0].phoneNumber,
                },
                meeting: meeting && meeting.meeting._id,
                whiteboard: whiteboard && whiteboard._id,
                records: [],
            });

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
            }).populate("meeting records WhiteBoard");

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
            }).populate("meeting records WhiteBoard");
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
            }).populate("meeting records WhiteBoard");
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
            }).populate("meeting records WhiteBoard");

            appointments.sort((a, b) => {
                return new Date(a.date) - new Date(b.date);
            });

            res.status(200).json(appointments);
        } catch (err) {
            console.log("Get Upcoming Appointments Error: ", err);
            res.status(500).json({ error: "Internal Server Error" });
        }
    };

    getAppointment = async (req, res) => {
        try {
            const { id } = req.params;
            const appointment = await Appointment.findById(id)
                .populate("meeting records WhiteBoard")
                .exec();
            if (!appointment) {
                return res.status(404).json({ error: "Appointment not found" });
            }
            res.status(200).json(appointment);
        } catch (err) {
            console.log("Get Appointment Error: ", err);
            res.status(500).json({ error: "Internal Server Error" });
        }
    }
}

export default new AppointmentService();
