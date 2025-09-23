import express from 'express';
import { 
    verifyOtp, 
    updateOfficer, 
    updateStatus, 
    getRequests, 
    acceptRequest,
    declineRequest 
} from '../controllers/officers.controller.js';

const router = express.Router();

// Authentication & Profile
router.post('/verifyotp', verifyOtp);
router.post('/update', updateOfficer);
router.post('/status', updateStatus);

// Request handling
router.get('/requests', getRequests);
router.post('/requests/:id/accept', acceptRequest);
router.post('/requests/:id/decline', declineRequest);

export default router; 