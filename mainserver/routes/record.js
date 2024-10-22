import { ClerkExpressRequireAuth } from "@clerk/clerk-sdk-node";
import { Router } from "express";
import recordService from "../services/record.js";
import multer from "multer";
const router = Router();

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

router.post(
    "/createRecord",
    ClerkExpressRequireAuth(),
    upload.single("file"),
    recordService.createRecord
);

router.get("/getRecords", ClerkExpressRequireAuth(), recordService.getRecords);
router.get(
    "/getRecordsMeeting/:meetingId",
    ClerkExpressRequireAuth(),
    recordService.getRecordsMeetingId
);

export default router;
