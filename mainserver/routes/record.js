import { requireAuth } from "@clerk/express";
import { Router } from "express";
import recordService from "../services/record.js";
import multer from "multer";
const router = Router();

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

router.post(
    "/createRecord",
    requireAuth(),
    upload.single("file"),
    recordService.createRecord
);

router.get("/getRecords/:meetingId", requireAuth(), recordService.getRecords);

export default router;
