import express from 'express';
import { verifyOtp, updateAmbulance, updateStatus } from '../controllers/ambulances.controller.js';

const router = express.Router();

router.post('/verifyotp', verifyOtp);
router.post('/update', updateAmbulance);
router.post('/status', updateStatus);

export default router; 