import express from 'express';
import { upsertOfficer, sendOfficerOtp, verifyOfficerOtp } from '../controllers/officers.controller.js';
import { updateOfficerStatusLocation } from '../controllers/dispatch.controller.js';

const router = express.Router();

router.post('/init', upsertOfficer);
router.post('/otp/send', sendOfficerOtp);
router.post('/otp/verify', verifyOfficerOtp);

// status alias for symmetry
router.post('/status', updateOfficerStatusLocation);

export default router; 