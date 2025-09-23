import express from 'express';
import { 
    verifyAmbulance, 
    updateAmbulance, 
    updateStatus, 
    getRequests,
    acceptRequest,
    declineRequest 
} from '../controllers/ambulances.controller.js';

const router = express.Router();

// Authentication & Profile
router.post('/verifyotp', verifyAmbulance);
router.post('/update', updateAmbulance);
router.post('/status', updateStatus);

// Request handling
router.get('/requests', getRequests);
router.post('/requests/:id/accept', acceptRequest);
router.post('/requests/:id/decline', declineRequest);

export default router;