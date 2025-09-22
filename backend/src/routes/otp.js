import express from 'express';
import { verifyPhone } from '../controllers/otp.controller.js';

const router = express.Router();

router.post('/verify-phone', verifyPhone);

export default router;
