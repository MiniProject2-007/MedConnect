import { Router } from 'express'
import whatsappService from '../services/whatsapp.js';

const router = Router()

router.post("/receive", whatsappService.receiveMessage);

export default router