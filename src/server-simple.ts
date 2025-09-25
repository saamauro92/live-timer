import express from 'express';
import { PrismaClient } from '@prisma/client';
import { createClient } from 'redis';
import { logger } from './utils/logger';
import { createApp } from './app';

const PORT = process.env.PORT || 3000;

// Initialize Prisma
const prisma = new PrismaClient();

// Initialize Redis
const redisClient = createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379'
});

// Start server
async function startServer() {
  try {
    logger.info('Starting server...');
    
    // Connect to Redis
    await redisClient.connect();
    logger.info('✅ Redis connected');
    
    // Test database connection
    await prisma.$connect();
    logger.info('✅ Database connected');
    
    // Create and start the app
    const app = createApp();
    
    // Create HTTP server
    const http = require('http');
    const server = http.createServer(app);
    
    // Initialize Socket.IO service
    const { SocketService } = require('./services/socket.service');
    const socketService = new SocketService(server);
    
    server.listen(PORT, () => {
      logger.info(`✅ Server running on port ${PORT}`);
      logger.info(`✅ Environment: ${process.env.NODE_ENV || 'development'}`);
      logger.info(`✅ CORS Origin: ${process.env.CORS_ORIGIN || 'http://localhost:5173'}`);
      logger.info(`✅ Health check: http://localhost:${PORT}/health`);
    });
    
  } catch (error) {
    logger.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

startServer();
