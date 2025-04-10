import { ClerkExpressRequireAuth } from "@clerk/clerk-sdk-node";
import { Router } from "express";
import multer from "multer";
import transcriptService from "../services/transcript.js";
import { uploadAudioValidator } from "../validators/transcript.js";
const router = Router();

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

router.post(
    "/uploadAudio",
    ClerkExpressRequireAuth(),
    uploadAudioValidator,
    upload.single("audio"),
    transcriptService.uploadAudio
);


export default router;
