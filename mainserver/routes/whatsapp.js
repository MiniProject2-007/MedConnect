import { Router } from 'express'
import whatsappService from '../services/whatsapp';

const router = Router()

router.get("/receive", whatsappService.receiveMessage);

export default router