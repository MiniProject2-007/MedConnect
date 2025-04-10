import { getPresignedUrl, uploadFile } from "../lib/S3.js";
import { generateKey } from "../lib/utils/file.js";
import Appointment from "../Models/Appointment.js";
import AudioChunk from "../Models/AudioChunk.js";
import ffmpeg from "fluent-ffmpeg";
import { Model, Recognizer } from "vosk";
import fs from "fs";
import path from "path";
import { Readable } from "stream";
import Transcript from "../Models/Transcript.js";
import { PassThrough } from 'stream'

class TranscriptService {
    constructor() {
        const modelPath = path.resolve("speechmodels/vosk-model-small-en-us-0.15");
        if (!fs.existsSync(modelPath)) {
            throw new Error("Vosk model not found. Please download and place it in the project directory.");
        }
        this.model = new Model(modelPath);
    }

    uploadAudio = async (req, res) => {
        try {
            const { slug, userId, speaker, timestamp } = req.body;
            const appointment = await Appointment.findOne({ slug: slug });
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
                key: `audios/${slug}/${key}`,
                timestamp: new Date(timestamp),
                transcriptionStatus: "pending",
            });

            await audioChunk.save();
            return res.status(201).send({ message: "Audio chunk created successfully" });
        } catch (e) {
            console.error(e);
            res.status(500).send({ message: "Internal Server Error" });
        }
    };

    convertToText = async (audioChunk) => {
        try {
            const { key } = audioChunk;
            const presignedUrl = (await getPresignedUrl(key)).url;
            if (!presignedUrl) {
                throw new Error("Failed to get presigned URL");
            }

            const audioResponse = await fetch(presignedUrl);
            const audioBuffer = Buffer.from(await audioResponse.arrayBuffer());

            const wavBuffer = await this.convertWebMToWav(audioBuffer);

            const transcriptionResult = await this.transcribeAudio(wavBuffer);

            console.log(`Transcription result for ${audioChunk.slug}: ${transcriptionResult}`);

            await AudioChunk.updateOne(
                { _id: audioChunk._id },
                { transcript: transcriptionResult, transcriptionStatus: "completed" }
            );
            return true;
        } catch (e) {
            console.error(e);
            return false;
        }
    };

    stitchTranscripts = async (slug) => {
        try {
            const audioChunks = await AudioChunk.find({ slug: slug }).sort({ timestamp: 1 });
            if (!audioChunks || audioChunks.length === 0) {
                return false;
            }

            let conversation = []
            for (const chunk of audioChunks) {
                if (chunk.transcriptionStatus === "completed") {
                    if (chunk.transcript.length > 0) {
                        conversation.push({
                            speaker: chunk.speaker,
                            text: chunk.transcript,
                            time: chunk.timestamp
                        })
                    }
                }
            }

            if (conversation.length === 0) {
                return false;
            }

            const transcript = new Transcript({
                slug: slug,
                conversation: conversation
            })
            await transcript.save();
            return true;
        } catch (e) {
            console.error(e);
            return false;
        }
    };

    generateTranscript = async (req, res) => {
        try {
            const { slug } = req.params;
            if (!slug) {
                return res.status(400).send({ message: "meetingId is required" });
            }

            const appointment = await Appointment.findOne({ slug: slug });
            if (!appointment) {
                return res.status(400).send({ message: "Invalid meetingId" });
            }

            const audioChunks = await AudioChunk.find({ slug: slug }).sort({ timestamp: 1 });
            if (!audioChunks || audioChunks.length === 0) {
                return res.status(400).send({ message: "No recordings found" });
            }

            for (const chunk of audioChunks) {
                await this.convertToText(chunk);
            }

            await this.stitchTranscripts(slug);

            return res.status(200).send({ message: "Transcription completed successfully" });
        } catch (e) {
            console.error(e);
            res.status(500).send({ message: "Internal Server Error" });
        }
    };

    convertWebMToWav = (webmBuffer) => {
        return new Promise((resolve, reject) => {
            const inputStream = new PassThrough();
            inputStream.end(webmBuffer);

            const outputStream = new PassThrough();
            const chunks = [];
            outputStream.on('data', chunk => chunks.push(chunk));
            outputStream.on('error', reject);
            outputStream.on('end', () => {
                resolve(Buffer.concat(chunks));
            });

            ffmpeg({ source: inputStream })
                .inputFormat('webm')                    // tell ffmpeg the container type
                .outputOptions(['-ar 16000', '-ac 1'])  // 16 kHz, mono
                .format('wav')                          // to WAV format
                .on('error', reject)
                .pipe(outputStream, { end: true });
        });
    }

    transcribeAudio = (wavBuffer) => {
        return new Promise((resolve, reject) => {
            const recognizer = new Recognizer({ model: this.model, sampleRate: 16000 });
            const audioStream = new Readable();
            audioStream.push(wavBuffer);
            audioStream.push(null);

            audioStream.on("data", (chunk) => {
                recognizer.acceptWaveform(chunk);
            });

            audioStream.on("end", () => {
                const result = recognizer.finalResult();
                recognizer.free();
                resolve(result.text);
            });

            audioStream.on("error", (err) => {
                recognizer.free();
                reject(err);
            });
        });
    };
}

export default new TranscriptService();
