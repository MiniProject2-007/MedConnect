import twilio from "twilio"
import { config } from "dotenv";
import appointmentService from "./appointment.js";
import userService from "./user.js"
config();

class WhatsappService {
    constructor() {
        this.twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
        this.withlinksid = "HXe65e2874c67d8d4e0b2514f566d041e7"
        this.optionsid = "HX0c2de79f80c5293c31b093e649c96e41"
        this.twilioSenderId = process.env.TWILIO_SENDER_ID;
    }

    receiveMessage = async (req, res) => {
        try {
            const body = req.body;
            const message = body.Body;
            console.log(body)
            if (!message) {
                return res.status(400).send("No message received");
            }
            const from = body.From;
            const to = body.To;
            console.log("Received message:", body);
            switch (message.toLowerCase().trim()) {
                case "help":
                    await this.sendOptions(from);
                    break;
                case "next free slot":
                    await this.sendNextFreeSlot(from);
                    break;
                case "my next appointment":
                    await this.sendNextAppointment(from);
                    break;
                default:
                    console.log("Invalid option");
            }
            res.status(200).send("Message received");
        } catch (error) {
            console.error("Error receiving WhatsApp message:", error);
        }
    };


    sendWelcomeMessage = async (to, first_name) => {
        try {
            const message = await this.twilioClient.messages.create({
                contentSid: this.withlinksid,
                contentVariables: JSON.stringify({
                    1: `Hello ${first_name},\nWelcome to MedConnect!
                    \nMessage help to access more options.`,
                    2: "https://med-connect-nu.vercel.app/dashboard"
                }),
                from: `${this.twilioSenderId}`,
                to: `whatsapp:${to}`,
            });

            console.log("Sent welcome message");

            return message;
        } catch (error) {
            console.error("Error sending WhatsApp message:", error);
        }
    };

    sendOptions = async (to) => {
        try {
            const message = await this.twilioClient.messages.create({
                contentSid: this.optionsid,
                from: `${this.twilioSenderId}`,
                to: `${to}`,
            });

            console.log("Sent options");
            return message;
        }
        catch (error) {
            console.error("Error sending WhatsApp message:", error);
        }
    }

    sendNormalMessage = async (to, message) => {
        try {
            const msg = await this.twilioClient.messages.create({
                body: message,
                from: `${this.twilioSenderId}`,
                to: `${to}`,
            });

            return msg;
        } catch (error) {
            console.error("Error sending WhatsApp message:", error);
        }
    }

    sendNextFreeSlot = async (to) => {
        try {
            const freeSlot = await appointmentService.nextFreeSlot();
            await this.sendNormalMessage(to, freeSlot);
            console.log("Sent free slot message");
        } catch (error) {
            console.error("Error sending WhatsApp message:", error);
        }
    }

    sendNextAppointment = async (to) => {
        try {
            const userId = await userService.getUserIdFromPhone(to.split(":")[1]);
            if(!userId) {
                await this.sendNormalMessage(to, "No user found with this phone number.");
                return;
            }
            const info = await appointmentService.nextAppointment(userId);
            if (!info) {
                await this.sendNormalMessage(to, "No upcoming appointments found.");
                return;
            }
            const message = await this.twilioClient.messages.create({
                contentSid: this.withlinksid,
                contentVariables: JSON.stringify({
                    1: `Hello,\nYour upcomng appointment is on \n*Date : ${info.date}* \n*Time : ${info.time}*.`,
                    2: `dashboard/consultations`,
                }),
                from: `${this.twilioSenderId}`,
                to: `${to}`,
            })
            console.log("Sent next appointment message",info);
        } catch (error) {
            console.error("Error sending WhatsApp message:", error);
        }
    }
}

export default new WhatsappService();