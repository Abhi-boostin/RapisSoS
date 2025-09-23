import express from 'express';
import { verifyOtp, updateAmbulance, updateStatus, handleRequest, getRequests } from '../controllers/ambulances.controller.js';

const router = express.Router();

router.post('/verifyotp', verifyOtp);
router.post('/update', updateAmbulance);
router.post('/status', updateStatus);
router.post('/request', handleRequest);
router.get('/requests', getRequests);

export default router; 