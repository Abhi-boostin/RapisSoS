import express from 'express';
import { upsertOfficer, sendOfficerOtp, verifyOfficerOtp } from '../controllers/officers.controller.js';

const router = express.Router();

router.post('/init', upsertOfficer);
router.post('/otp/send', sendOfficerOtp);
router.post('/otp/verify', verifyOfficerOtp);

export default router; 