import { validationResult } from "express-validator";
import Doctor from "../Models/Doctor.js";
import { format } from "date-fns";
import Appointment from "../Models/Appointment.js";
import Rating from "../Models/Rating.js";

class DoctorService {
    doctorSignin = async (req, res) => {
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

    isDoctor = async (req, res) => {
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

    doctors = async (req, res) => {
        try {
            const { userid } = req.headers;
            const doctors = await Doctor.find({
                userId: { $ne: userid },
            });

            // Await each doctor and fetch available dates
            const doctorsRes = await Promise.all(
                doctors.map(async (doctor) => {
                    const availableDates =
                        await this.getAvailableDatesAndTimeSlots(doctor.userId);

                    const ratings = await this.getDoctorRatings(doctor.userId);
                    return {
                        _id: doctor._id,
                        firstName: doctor.firstName,
                        lastName: doctor.lastName,
                        experience: doctor.experience,
                        qualifications: doctor.qualifications,
                        specialization: doctor.specialization,
                        userId: doctor.userId,
                        availableDates,
                        ratings,
                    };
                })
            );

            res.status(200).json(doctorsRes);
        } catch (err) {
            res.status(500).json({
                message: "Error fetching doctors",
                error: err.message,
            });
        }
    };

    getAvailableDatesAndTimeSlots = async (doctorId) => {
        try {
            const doctor = await Doctor.find({
                userId: doctorId,
            });

            const totalSlots = [10, 11, 12, 13, 14, 15, 16];

            const today = new Date();
            const oneMonthFromNow = new Date(today);

            oneMonthFromNow.setMonth(oneMonthFromNow.getMonth() + 1);

            const availableDates = {};
            for (
                let date = new Date(today);
                date < oneMonthFromNow;
                date.setDate(date.getDate() + 1)
            ) {
                const day = date.getDay();
                if (day === 0 || day === 6) {
                    continue;
                }

                const bookedAlready = await Appointment.find({
                    userId2: doctorId,
                    date: format(date, "yyyy-MM-dd"),
                    $or: [{ status: "pending" }, { status: "approved" }],
                });

                let slotsAvailable = totalSlots.filter((slot) => {
                    let isAvailable = true;
                    for (let i = 0; i < bookedAlready.length; i++) {
                        if (bookedAlready[i].timeSlot === slot) {
                            isAvailable = false;
                            break;
                        }
                    }

                    if (isAvailable) return slot;
                    else return null;
                });

                if (slotsAvailable.length > 0) {
                    availableDates[format(date, "yyyy-MM-dd")] = slotsAvailable;
                }
            }

            return availableDates;
        } catch (err) {
            console.log("Get Available Dates and Time Slots Error: ", err);
            return [];
        }
    };

    rateDoctor = async (req, res) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }

            const { doctorId } = req.params;
            const { rating, review,username } = req.body;
            const { userid } = req.headers;

            const doctor = await Doctor.findOne({ userId: doctorId });
            if (!doctor) {
                return res.status(404).json({ error: "Doctor not found" });
            }

            const newRating = await Rating.create({
                doctorId,
                userId: userid,
                rating,
                review,
                username,
            });
            const ratings = await Rating.find({ doctorId });
            let totalRating = 0;
            ratings.forEach((rating) => {
                totalRating += rating.rating;
            });

            doctor.rating = totalRating / ratings.length;
            await doctor.save();

            res.status(201).json(newRating);
        } catch (err) {
            console.log("Rate Doctor Error: ", err);
            res.status(500).json({ error: "Internal Server Error" });
        }
    };

    getDoctorRatings = async (doctorId) => {
        try {
            console.log("Doctor ID: ", doctorId);   
            const ratings = await Rating.find({ doctorId });
            console.log("Ratings: ", ratings);
            return ratings;
        } catch (err) {
            console.log("Get Doctor Ratings Error: ", err);
            return [];
        }
    };
}

export default new DoctorService();
