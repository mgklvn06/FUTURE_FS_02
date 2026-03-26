/* eslint-disable no-undef */
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';

import connectDB from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import leadRoutes from './routes/leadRoutes.js';
import { getJwtSecret } from './utils/token.js';
import { backfillLegacyWorkspace } from './utils/workspaceMigration.js';

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 5000;

app.disable('x-powered-by');
app.use(cors());
app.use(express.json());

app.get('/', (_req, res) => {
  res.status(200).json({
    message: 'CRM API running',
  });
});

app.get('/api/health', (_req, res) => {
  const readyStateLabels = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting',
  };

  res.status(200).json({
    status: 'ok',
    database: readyStateLabels[mongoose.connection.readyState] || 'unknown',
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/leads', leadRoutes);

app.use((req, res) => {
  res.status(404).json({
    message: `Route ${req.method} ${req.originalUrl} was not found.`,
  });
});

const startServer = async () => {
  try {
    getJwtSecret();
    await connectDB();
    await backfillLegacyWorkspace();

    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Startup failed:', error.message);
    process.exit(1);
  }
};

startServer();
