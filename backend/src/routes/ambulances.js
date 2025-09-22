import express from 'express';
import { upsertAmbulance, sendAmbulanceOtp, verifyAmbulanceOtp, updateAmbulanceStatus } from '../controllers/ambulances.controller.js';

const router = express.Router();

router.post('/init', upsertAmbulance);
router.post('/otp/send', sendAmbulanceOtp);
router.post('/otp/verify', verifyAmbulanceOtp);
router.post('/status', updateAmbulanceStatus);

export default router; 