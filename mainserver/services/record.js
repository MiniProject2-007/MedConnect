import { getPresignedUrl, uploadFile } from "../lib/S3.js";
import { generateKey } from "../lib/utils/file.js";
import Record from "../Models/Record.js";

class RecordService {
    createRecord = async (req, res) => {
        try {
            const file = req.file;
            const originalname = file.originalname;
            const buffer = file.buffer;

            const key = generateKey(originalname);

            await uploadFile({ buffer, mimetype: file.mimetype }, key);
            const { ownerId, description, meetingId } = req.body;

            const record = new Record({
                ownerId,
                sharedWith:[],
                name: originalname,
                description,
                key,
                meetingId,
            });

            await record.save();
            res.status(201).send({ message: "Record created successfully" });
        } catch (e) {
            console.log(e);
            res.status(500).send({ message: "Internal Server Error" });
        }
    };

    getRecords = async (req, res) => {
        try {
            const { meetingId } = req.query;
            const records = await Record.find({ meetingId });
            for(let i = 0; i < records.length; i++) {
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
