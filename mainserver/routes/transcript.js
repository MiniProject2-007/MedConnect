import { requireAuth } from "@clerk/express";
import { Router } from "express";
import multer from "multer";
import transcriptService from "../services/transcript.js";
import { uploadAudioValidator } from "../validators/transcript.js";
const router = Router();

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

router.post(
    "/uploadAudio",
    requireAuth(),
    uploadAudioValidator,
    upload.single("audio"),
    transcriptService.uploadAudio
);

router.post(
    "/generateTranscript/:slug",
    requireAuth(),
    transcriptService.generateTranscript
);


export default router;
