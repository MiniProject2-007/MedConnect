import { Router } from "express";
import userService from "../services/user.js";

const router = Router();

router.post('/user-created', userService.userCreated);

export default router;