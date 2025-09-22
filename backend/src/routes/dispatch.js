import express from 'express';
import { createDispatch, acceptDispatch, declineDispatch, updateOfficerStatusLocation } from '../controllers/dispatch.controller.js';

const router = express.Router();

router.post('/create', createDispatch);
router.post('/accept', acceptDispatch);
router.post('/decline', declineDispatch);
router.post('/officers/status-location', updateOfficerStatusLocation);

export default router; 