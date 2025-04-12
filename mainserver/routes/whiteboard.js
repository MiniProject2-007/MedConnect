import { requireAuth } from "@clerk/express";
import { Router } from "express";
import whiteboardService from "../services/whiteboard.js";
import multer from "multer";
const router = Router();

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

router.post(
    "/uploadImage",
    upload.single("image"),
    whiteboardService.uploadImage
);

export default router;