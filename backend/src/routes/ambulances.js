import express from 'express';
import { init, verify, register, updateAmbulanceStatus } from '../controllers/ambulances.controller.js';

const router = express.Router();

// Authentication flow
router.post('/init', init);
router.post('/verify', verify);
router.post('/register', register);

// Status updates
router.post('/status', updateAmbulanceStatus);

export default router; 