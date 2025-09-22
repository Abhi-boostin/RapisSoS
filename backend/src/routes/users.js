import express from 'express';
import { upsertUser } from '../controllers/users.controller.js';

const router = express.Router();

router.post('/init', upsertUser);

export default router;
