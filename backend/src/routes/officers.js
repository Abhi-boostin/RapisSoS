import express from 'express';
import { 
    verifyOfficer, 
    updateOfficer, 
    updateStatus, 
    getRequests, 
    acceptRequest,
    declineRequest 
} from '../controllers/officers.controller.js';

const router = express.Router();

// Authentication & Profile
router.post('/verifyotp', verifyOfficer);
router.post('/update', updateOfficer);
router.post('/status', updateStatus);

// Request handling
router.get('/requests', getRequests);
router.post('/requests/:id/accept', acceptRequest);
router.post('/requests/:id/decline', declineRequest);

export default router; 