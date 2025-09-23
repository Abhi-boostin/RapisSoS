// routes/officers.js
import express from 'express';
import {
  verifyOfficer,
  updateOfficer,
  updateStatus,
  getRequests,
  acceptRequest,
  declineRequest,
  sendOfficerOtp
} from '../controllers/officers.controller.js';

const router = express.Router();

router.post('/sendotp', sendOfficerOtp);
router.post('/verifyotp', verifyOfficer);
router.post('/update', updateOfficer);
router.post('/status', updateStatus);

router.get('/requests', getRequests);
router.post('/requests/:id/accept', acceptRequest);
router.post('/requests/:id/decline', declineRequest);

export default router;
