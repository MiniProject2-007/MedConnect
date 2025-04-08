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

router.get("/getRecords/:meetingId", ClerkExpressRequireAuth(), recordService.getRecords);

export default router;
