import { S3Client, PutObjectCommand,GetObjectCommand} from "@aws-sdk/client-s3";
import {getSignedUrl} from "@aws-sdk/s3-request-presigner"
 
const client = new S3Client({
    region: process.env.S3_REGION,
    credentials: {
        accessKeyId: process.env.S3_ACCESS_KEY,
        secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
    },
});

export const uploadFile = async (file, key) => {
    try {
        const command = new PutObjectCommand({
            Bucket: process.env.S3_BUCKET_NAME,
            Key: key,
            Body: file.buffer,
            ContentType: file.mimetype,
        });

        await client.send(command);

        const url = await getPresignedUrl(key);
        return { url:url.url, success: true};
    } catch (err) {
        console.log(err);
        return { error: "Failed to upload file" };
    }
};

export const getPresignedUrl = async (key) => {
    try {
        const object = new GetObjectCommand({
            Bucket: process.env.S3_BUCKET_NAME,
            Key: key,
        })

        const url = await getSignedUrl(client, object, { expiresIn: 3600 });
        return { url, success: true };
    } catch (err) {
        console.log(err);
        throw new Error("Failed to get presigned URL");
    }
}    


export const deleteFile = async (key) => {

}