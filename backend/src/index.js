// src/index.js
import 'dotenv/config'; // must run before any other imports

import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';

import usersRouter from './routes/users.js';
import officersRouter from './routes/officers.js';
import ambulancesRouter from './routes/ambulances.js';

// Required environment variables
const REQUIRED_ENV_VARS = [
  'MONGODB_URI',
  'TWILIO_ACCOUNT_SID',
  'TWILIO_AUTH_TOKEN',
  'TWILIO_VERIFY_SERVICE_SID',
];

// Validate environment variables (now populated)
for (const key of REQUIRED_ENV_VARS) {
  if (!process.env[key]) {
    console.error(`Missing required environment variable: ${key}`);
    process.exit(1);
  }
}

// Create Express app
const app = express();

// Middleware
app.use(
  cors({
    origin: process.env.FRONTEND_URL || '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type'],
  })
);
app.use(express.json());

// Health check
app.get('/health', (_req, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }));

// API Routes
app.use('/users', usersRouter);
app.use('/officers', officersRouter);
app.use('/ambulances', ambulancesRouter);

// 404
app.use((_req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

// Global error handler
app.use((err, _req, res, _next) => {
  console.error('Unhandled error:', err);
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      message: 'Validation Error',
      errors: Object.values(err.errors).map((e) => e.message),
    });
  }
  if (err.code === 11000) {
    return res.status(400).json({
      success: false,
      message: 'Duplicate Error',
      field: Object.keys(err.keyPattern)[0],
    });
  }
  res.status(500).json({
    success: false,
    message: process.env.NODE_ENV === 'development' ? err.message : 'Internal Server Error',
  });
});

// Server startup
const PORT = process.env.PORT || 5000;

async function start() {
  try {
    await mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log('✅ MongoDB connected');

    const collections = ['ambulances', 'officers'];
    for (const collection of collections) {
      await mongoose.connection.collection(collection).createIndex({ currentLocation: '2dsphere' });
    }
    console.log('✅ Geospatial indexes created');

    app.listen(PORT, () => {
      console.log(`✅ Server running on port ${PORT}`);
      console.log(`🚀 API ready at http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error('❌ Server startup failed:', err);
    process.exit(1);
  }
}

start();
