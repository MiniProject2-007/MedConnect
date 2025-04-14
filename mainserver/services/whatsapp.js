import twilio from "twilio";
import { config } from "dotenv";
import appointmentService from "./appointment.js";
import userService from "./user.js";

config();

class WhatsappService {
    constructor() {
        this.twilioClient = twilio(
            process.env.TWILIO_ACCOUNT_SID,
            process.env.TWILIO_AUTH_TOKEN
        );

        this.withLinksSid = "HXe65e2874c67d8d4e0b2514f566d041e7";
        this.optionsSid = "HX0c2de79f80c5293c31b093e649c96e41";
        this.timeslotSid = "HXc808fa9097fc911e10607603d6dfe76a";
        this.confirmationSid = "HXf1a0b8c4d2e5b3c7e6f9a0d4f5e6d7e1";
        this.twilioSenderId = process.env.TWILIO_SENDER_ID;

        this.bookAppointmentUsersSteps = {};
    }

    receiveMessage = async (req, res) => {
        try {
            const { Body: rawBody, From: from, To: to, ListTitle } = req.body;
            const message = (rawBody || "").trim();

            if (!message) {
                return res.status(400).send("No message received");
            }

            if (ListTitle) {
                await this.handleTimeSlotSelection(from, req.body);
                return res.status(200).send("List selection handled");
            }

            const lower = message.toLowerCase();
            switch (true) {
                case lower === "help":
                    await this.sendOptions(from);
                    break;

                case lower === "next free slot":
                    await this.sendNextFreeSlot(from);
                    break;

                case lower === "my next appointment":
                    await this.sendNextAppointment(from);
                    break;

                case lower === "book appointment":
                    await this.startAppointmentBooking(from);
                    break;

                case lower === "cancel":
                    await this.cancelAppointmentBooking(from);
                    break;

                case lower === "confirm":
                    await this.bookAppointmentFromUserSteps(from);
                    break;

                case /^\d{4}-\d{2}-\d{2}$/.test(message):
                    await this.sendTimeSlots(from, message);
                    break;

                case lower.startsWith("reason:"):
                    await this.handleReason(from, message.split(":")[1].trim());
                    break;

                default:
                    await this.sendWelcomeMessage(from, "User");
            }

            res.status(200).send("Message received");
        } catch (error) {
            console.error("Error in receiveMessage:", error);
            res.status(500).send("Internal Server Error");
        }
    };


    sendWelcomeMessage = async (to, firstName) => {
        try {
            return await this.twilioClient.messages.create({
                contentSid: this.withLinksSid,
                contentVariables: JSON.stringify({
                    1: `Hello ${firstName},\nWelcome to MedConnect!\nMessage help to access more options.`,
                    2: "https://med-connect-nu.vercel.app/dashboard"
                }),
                from: this.twilioSenderId,
                to: `whatsapp:${to}`,
            });
        } catch (error) {
            console.error("sendWelcomeMessage error:", error);
        }
    };

    sendOptions = async (to) => {
        try {
            return await this.twilioClient.messages.create({
                contentSid: this.optionsSid,
                from: this.twilioSenderId,
                to,
            });
        } catch (error) {
            console.error("sendOptions error:", error);
        }
    };

    sendNormalMessage = async (to, body) => {
        try {
            return await this.twilioClient.messages.create({
                body,
                from: this.twilioSenderId,
                to,
            });
        } catch (error) {
            console.error("sendNormalMessage error:", error);
        }
    };

    sendNextFreeSlot = async (to) => {
        try {
            const freeSlot = await appointmentService.nextFreeSlot();
            await this.sendNormalMessage(to, freeSlot);
        } catch (error) {
            console.error("sendNextFreeSlot error:", error);
        }
    };

    sendNextAppointment = async (to) => {
        try {
            const phone = to.split(":")[1];
            const userId = await userService.getUserIdFromPhone(phone);
            if (!userId) {
                return this.sendNormalMessage(to, "No user found with this phone number.");
            }

            const info = await appointmentService.nextAppointment(userId);
            if (!info) {
                return this.sendNormalMessage(to, "No upcoming appointments found.");
            }

            return await this.twilioClient.messages.create({
                contentSid: this.withLinksSid,
                contentVariables: JSON.stringify({
                    1: `Hello,\nYour upcoming appointment is on\n*Date: ${info.date}*\n*Time: ${info.time}*.`,
                    2: `dashboard/consultations`
                }),
                from: this.twilioSenderId,
                to,
            });
        } catch (error) {
            console.error("sendNextAppointment error:", error);
        }
    };

    startAppointmentBooking = async (to) => {
        try {
            const phone = to.split(":")[1];
            const userId = await userService.getUserIdFromPhone(phone);
            if (!userId) {
                return this.sendNormalMessage(to, "No user found with this phone number.");
            }

            this.bookAppointmentUsersSteps[to] = {
                userId,
                currStep: 0,
                selectedDate: "",
                reason: "",
                selectedTime: "",
            };

            await this.sendNormalMessage(
                to,
                "Please select a date for your appointment in the format *YYYY-MM-DD* (between tomorrow and 1 month from now)."
            );
        } catch (error) {
            console.error("startAppointmentBooking error:", error);
        }
    };

    cancelAppointmentBooking = async (to) => {
        try {
            const phone = to.split(":")[1];
            const userId = await userService.getUserIdFromPhone(phone);
            if (!userId) {
                return this.sendNormalMessage(to, "No user found with this phone number.");
            }

            delete this.bookAppointmentUsersSteps[to];
            await this.sendNormalMessage(to, "Cancelled appointment booking.");
        } catch (error) {
            console.error("cancelAppointmentBooking error:", error);
        }
    };

    sendTimeSlots = async (to, date) => {
        try {
            let slots = await appointmentService.getAvailableSlots(date);
            if (!slots.length) {
                return this.sendNormalMessage(
                    to,
                    "No available time slots for this date.\nPlease select another date."
                );
            }
            if (slots.length > 10) {
                slots = slots.slice(0, 10);
            }

            const variables = slots.reduce((acc, slot, idx) => {
                acc[idx + 1] = slot;
                return acc;
            }, {});

            await this.twilioClient.messages.create({
                contentSid: this.timeslotSid,
                contentVariables: JSON.stringify(variables),
                from: this.twilioSenderId,
                to,
            });

            const state = this.bookAppointmentUsersSteps[to];
            state.selectedDate = date;
            state.currStep = 1;
        } catch (error) {
            console.error("sendTimeSlots error:", error);
        }
    };

    handleTimeSlotSelection = async (from, { ListTitle }) => {
        try {
            const state = this.bookAppointmentUsersSteps[from];
            state.selectedTime = ListTitle;

            await this.sendNormalMessage(
                from,
                "Send reason for appointment booking in the format:\n*Reason*: <your reason>"
            );
            state.currStep = 2;
        } catch (error) {
            console.error("handleTimeSlotSelection error:", error);
        }
    };

    handleReason = async (from, reason) => {
        try {
            const state = this.bookAppointmentUsersSteps[from];
            state.reason = reason;

            await this.askBookingConfirmation(from);
            state.currStep = 3;
        } catch (error) {
            console.error("handleReason error:", error);
        }
    };

    askBookingConfirmation = async (to) => {
        try {
            await this.twilioClient.messages.create({
                contentSid: this.confirmationSid,
                from: this.twilioSenderId,
                to,
            });
        } catch (error) {
            console.error("askBookingConfirmation error:", error);
        }
    };

    bookAppointmentFromUserSteps = async (from) => {
        try {
            const state = this.bookAppointmentUsersSteps[from];
            if (!state) {
                return this.sendNormalMessage(from, "No appointment booking in progress.");
            }

            const { userId, selectedDate, selectedTime, reason } = state;
            const user = await userService.getUserInfo(userId);

            await appointmentService.createAppointment({
                userId,
                date: selectedDate,
                timeSlot: selectedTime,
                reason,
                appointmentType: "video",
                user
            });

            await this.sendNormalMessage(from, "✅ Appointment booked successfully.");
            delete this.bookAppointmentUsersSteps[from];
        } catch (error) {
            console.error("bookAppointmentFromUserSteps error:", error);
            await this.sendNormalMessage(from, "❌ Error booking appointment.");
        }
    };
}

export default new WhatsappService();
