import express from 'express';
import { logger } from './utils/logger';

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Server is healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Basic API endpoint
app.get('/api/status', (req, res) => {
  res.json({
    success: true,
    message: 'Live Timer Server is running',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// Start server
app.listen(PORT, () => {
  logger.info(`✅ Server running on port ${PORT}`);
  logger.info(`✅ Health check: http://localhost:${PORT}/health`);
  logger.info(`✅ API status: http://localhost:${PORT}/api/status`);
  logger.info(`✅ Environment: ${process.env.NODE_ENV || 'development'}`);
});
