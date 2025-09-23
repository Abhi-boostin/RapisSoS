import express from 'express';
import { verifyUser, updateUser, sosAmbulance, sosOfficer } from '../controllers/users.controller.js';

const router = express.Router();

// Authentication & Profile
router.post('/verifyotp', verifyUser);
router.post('/update', updateUser);
// SOS Routes
router.post('/sos/ambulance', sosAmbulance);
router.post('/sos/officer', sosOfficer);

export default router;
