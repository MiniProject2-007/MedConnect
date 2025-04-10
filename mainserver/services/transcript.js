import { uploadFile } from "../lib/S3.js";
import { generateKey } from "../lib/utils/file.js";
import Appointment from "../Models/Appointment.js";
import AudioChunk from "../Models/AudioChunk.js";

class TranscriptService {
    uploadAudio = async (req, res) => {
        try {
            const { slug, userId, speaker, timestamp } = req.body;
            const appointment = Appointment.findOne({ slug: slug });
            if (!appointment) {
                return res.status(400).send({ message: "Invalid meetingId" });
            }
            const audio = req.file;
            if (!audio) {
                return res.status(400).send({ message: "Audio file is required" });
            }
            const key = generateKey(`${slug}_${userId}_${speaker}_${timestamp}`);
            await uploadFile({ buffer: audio.buffer, mimetype: audio.mimetype }, `audios/${slug}/${key}`);

            const audioChunk = new AudioChunk({
                slug: slug,
                userId: userId,
                speaker: speaker,
                key: key,
                timestamp: new Date(timestamp),
                transcriptionStatus: "pending",
            })

            await audioChunk.save();
            return res.status(201).send({ message: "Audio chunk created successfully" });
        } catch (e) {
            console.log(e);
            res.status(500).send({ message: "Internal Server Error" });
        }
    }
}

export default new TranscriptService();