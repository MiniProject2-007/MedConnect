import { uploadFileBoard } from "../lib/S3board.js";

class WhiteBoard {
    uploadImage = async (req, res) => {
        try {
            const file = req.file;
            const buffer = file.buffer;
            const key = req.body.key;
            const data = await uploadFileBoard(
                { buffer, mimetype: file.mimetype },
                key
            );
            console.log(data);
            res.status(201).send({
                url: data.url,
                success: data.success,
                error: data.error,
            });
        } catch (e) {
            console.log(e);
            res.status(500).send({ message: "Internal Server Error" });
        }
    };
}

export default new WhiteBoard();
