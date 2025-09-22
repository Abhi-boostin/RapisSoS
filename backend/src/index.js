import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';

import usersRouter from './routes/users.js';
import otpRouter from './routes/otp.js';
import sosRouter from './routes/sos.js';
import officersRouter from './routes/officers.js';
import ambulancesRouter from './routes/ambulances.js';

dotenv.config();

const REQUIRED_ENV_VARS = [
	'MONGODB_URI',
	'TWILIO_ACCOUNT_SID',
	'TWILIO_AUTH_TOKEN',
	'TWILIO_VERIFY_SERVICE_SID',
	'TWILIO_MESSAGING_SERVICE_SID'
];

for (const key of REQUIRED_ENV_VARS) {
	if (!process.env[key]) {
		console.error(`Missing required env var: ${key}`);
		process.exit(1);
	}
}

const app = express();
app.use(cors());
app.use(express.json());

// Health
app.get('/api/health', (_req, res) => res.json({ ok: true }));

// Routes
app.use('/api/users', usersRouter);
app.use('/api/otp', otpRouter);
app.use('/api/sos', sosRouter);
app.use('/api/officers', officersRouter);
app.use('/api/ambulances', ambulancesRouter);

// Global error handler
// eslint-disable-next-line no-unused-vars
app.use((err, _req, res, _next) => {
	console.error('Unhandled error:', err);
	res.status(500).json({ error: 'Internal Server Error' });
});

const PORT = process.env.PORT || 4000;

async function start() {
	try {
		await mongoose.connect(process.env.MONGODB_URI);
		console.log('MongoDB connected');
		app.listen(PORT, () => console.log(`Server listening on :${PORT}`));
	} catch (err) {
		console.error('Failed to start server:', err);
		process.exit(1);
	}
}

start();
