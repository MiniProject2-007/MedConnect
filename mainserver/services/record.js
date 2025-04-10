import { getPresignedUrl, uploadFile } from "../lib/S3.js";
import { generateKey } from "../lib/utils/file.js";
import Appointment from "../Models/Appointment.js";
import Record from "../Models/Record.js";

class RecordService {
    createRecord = async (req, res) => {
        try {
            const file = req.file;
            const originalname = file.originalname;
            const buffer = file.buffer;

            const key = generateKey(originalname);

            await uploadFile({ buffer, mimetype: file.mimetype }, key);
            const { userId, description, meetingId } = req.body;

            const appointment = await Appointment.findOne({
                slug: meetingId,
                userId: userId,
            });
            if (!appointment) {
                return res.status(400).send({ message: "Invalid meetingId" });
            }

            const record = new Record({
                userId: userId,
                name: originalname,
                description: description,
                key: key,
                recordType: "other",
                status: "active",
            });

            await record.save();
            const temp = await Appointment.updateOne({
                slug: meetingId,
                userId: userId,
            },
                { $push: { records: record._id } }
            );
            console.log(meetingId)
            console.log(temp)
            res.status(201).send({ message: "Record created successfully" });
        } catch (e) {
            console.log(e);
            res.status(500).send({ message: "Internal Server Error" });
        }
    };

    getRecords = async (req, res) => {
        try {
            const { meetingId } = req.params;
            if (!meetingId) {
                return res.status(400).send({ message: "meetingId is required" });
            }

            const appointment = await Appointment.findOne({
                slug: meetingId,
            }).populate("records");
            if (!appointment) {
                return res.status(400).send({ message: "Invalid meetingId" });
            }
            const records = appointment.records;
            for (let i = 0; i < records.length; i++) {
                const record = records[i];
                const url = await getPresignedUrl(record.key);
                records[i] = { ...record._doc, url: url.url };
            }
            res.status(200).send(records);
        } catch (e) {
            console.log(e);
            res.status(500).send({ message: "Internal Server Error" });
        }
    };
}

export default new RecordService();
