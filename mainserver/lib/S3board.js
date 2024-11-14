import {
    S3Client,
    PutObjectCommand,
} from "@aws-sdk/client-s3";

const client = new S3Client({
    region: process.env.S3_REGION,
    credentials: {
        accessKeyId: process.env.S3_ACCESS_KEY,
        secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
    },
});

export const uploadFileBoard = async (file, key) => {
    try {
        const command = new PutObjectCommand({
            Bucket: process.env.S3_BUCKET_NAME2,
            Key: key,
            Body: file.buffer,
            ContentType: file.mimetype,
        });

        await client.send(command);

        const url = `https://${process.env.S3_BUCKET_NAME2}.s3.${process.env.S3_REGION}.amazonaws.com/${key}`;
        return { url: url, success: true };
    } catch (err) {
        console.log(err);
        return { error: "Failed to upload file" };
    }
};
