import express from 'express';
import { verifyUser, updateUser, sosAmbulance, sosOfficer, sendUserOtp, getUserRequestStatus } from '../controllers/users.controller.js';

const router = express.Router();

// Authentication & Profile
router.post('/sendotp', sendUserOtp);
router.post('/verifyotp', verifyUser);
router.post('/update', updateUser);

// SOS Routes
router.post('/sos/ambulance', sosAmbulance);
router.post('/sos/officer', sosOfficer);

// New: poll request status
router.get('/request/:id', getUserRequestStatus);

export default router;
