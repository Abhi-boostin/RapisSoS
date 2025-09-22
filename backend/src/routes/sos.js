import express from 'express';
import { triggerSOS } from '../controllers/sos.controller.js';

const router = express.Router();

router.post('/', triggerSOS);

export default router; 