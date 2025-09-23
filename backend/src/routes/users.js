import express from 'express';
import { verifyOtp, updateUser, sosAmbulance, sosOfficer } from '../controllers/users.controller.js';

const router = express.Router();

// Authentication & Profile
router.post('/verifyotp', verifyOtp);
router.post('/update', updateUser);
// SOS Routes
router.post('/sos/ambulance', sosAmbulance);
router.post('/sos/officer', sosOfficer);

export default router;
