import express from 'express';
import { verifyOtp, updateOfficer, updateStatus, handleRequest } from '../controllers/officers.controller.js';

const router = express.Router();

router.post('/verifyotp', verifyOtp);
router.post('/update', updateOfficer);
router.post('/status', updateStatus);
router.post('/request', handleRequest);

export default router; 