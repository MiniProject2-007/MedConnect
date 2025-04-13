import twilio from "twilio"
import { config } from "dotenv";
config();

class WhatsappService {
    constructor() {
        this.twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
        this.welcomesid = "HXd3ecd5e94d0c107a70307f967c61692a"
        this.optionsid = "HX0c2de79f80c5293c31b093e649c96e41"
        this.twilioSenderId = process.env.TWILIO_SENDER_ID;
    }

    sendWelcomeMessage = async (to, first_name) => {
        try {
            const message = await this.twilioClient.messages.create({
                contentSid: this.welcomesid,
                contentVariables: JSON.stringify({
                    1: `${first_name}`,
                }),
                from: `${this.twilioSenderId}`,
                to: `whatsapp:${to}`,
            });

            return message;
        } catch (error) {
            console.error("Error sending WhatsApp message:", error);
        }
    };

    receiveMessage = async (req, res) => {
        try {
            console.log("Received WhatsApp message:", req.Body);
            res.send("OK");
        } catch (error) {
            console.error("Error receiving WhatsApp message:", error);
        }
    };

    sendOptions = async (to) => {
        try {
            const message = await this.twilioClient.messages.create({
                contentSid: this.optionsid,
                from: `${this.twilioSenderId}`,
                to: `whatsapp:${to}`,
            });

            return message;
        }
        catch (error) {
            console.error("Error sending WhatsApp message:", error);
        }
    }
}

export default new WhatsappService();