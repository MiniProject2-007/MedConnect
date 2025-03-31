import { Router } from 'express'
import doctorService from '../services/doctor.js'
import doctorAuth from '../middlewares/doctorAuth.js'

const router = Router()

router.post('/signin', doctorService.doctorSignin)
router.post('/approveAppointment/:id', doctorAuth,
    doctorService.approveAppointment)

export default router