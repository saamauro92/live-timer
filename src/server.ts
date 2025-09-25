import cluster from 'cluster';
import os from 'os';
import { createApp } from './app';
import { logger } from './utils/logger';
import { redisClient } from './config/redis';
import { prisma } from './config/database';

const numCPUs = os.cpus().length;
const isProduction = process.env.NODE_ENV === 'production';

// Graceful shutdown handler
const gracefulShutdown = async (signal: string) => {
  logger.info(`${signal} received, shutting down gracefully...`);
  
  try {
    // Close database connections
    await prisma.$disconnect();
    logger.info('Database disconnected');
    
    // Close Redis connections
    if (redisClient && redisClient.isOpen) {
      await redisClient.quit();
      logger.info('Redis disconnected');
    }
    
    logger.info('Graceful shutdown completed');
    process.exit(0);
  } catch (error) {
    logger.error('Error during graceful shutdown:', error);
    process.exit(1);
  }
};

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error);
  gracefulShutdown('UNCAUGHT_EXCEPTION');
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
  logger.error('Full error details:', reason);
  if (reason instanceof Error) {
    logger.error('Error stack:', reason.stack);
  }
  gracefulShutdown('UNHANDLED_REJECTION');
});

// Handle termination signals
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

if (cluster.isPrimary && isProduction) {
  logger.info(`Master ${process.pid} is running`);
  logger.info(`Starting ${numCPUs} workers`);
  
  // Fork workers
  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }

  // Handle worker exit
  cluster.on('exit', (worker, code, signal) => {
    if (signal) {
      logger.warn(`Worker ${worker.process.pid} was killed by signal: ${signal}`);
    } else if (code !== 0) {
      logger.warn(`Worker ${worker.process.pid} exited with error code: ${code}`);
    } else {
      logger.info(`Worker ${worker.process.pid} exited successfully`);
    }
    
    // Restart worker if it died unexpectedly
    if (!worker.exitedAfterDisconnect) {
      logger.info(`Starting a new worker to replace ${worker.process.pid}`);
      cluster.fork();
    }
  });

  // Handle worker disconnect
  cluster.on('disconnect', (worker) => {
    logger.info(`Worker ${worker.process.pid} disconnected`);
  });

  // Handle worker listening
  cluster.on('listening', (worker, address) => {
    logger.info(`Worker ${worker.process.pid} is listening on ${address.address}:${address.port}`);
  });

} else {
  // Worker process
  const startServer = async () => {
    try {
      logger.info('Starting worker process...');
      
      // Connect to Redis
      if (redisClient && !redisClient.isOpen) {
        await redisClient.connect();
        logger.info('Redis connected');
      }

      // Test database connection
      await prisma.$connect();
      logger.info('Database connected');

      // Create and start the app
      const app = createApp();
      const PORT = process.env.PORT || 3000;
      
      // Create HTTP server
      const http = require('http');
      const server = http.createServer(app);
      
      // Initialize Socket.IO service
      logger.info('Creating Socket.IO service...');
      const { SocketService } = require('./services/socket.service');
      const socketService = new SocketService(server);
      
      // Make socketService available globally for the app
      global.socketService = socketService;
      logger.info('Socket.IO service created and set as global');
      
      server.listen(PORT, () => {
        logger.info(`Worker ${process.pid} started on port ${PORT}`);
        logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
        logger.info(`CORS Origin: ${process.env.CORS_ORIGIN || 'http://localhost:5173'}`);
      });

      // Graceful shutdown for worker
      const workerGracefulShutdown = async (signal: string) => {
        logger.info(`Worker ${process.pid} received ${signal}, shutting down...`);
        
        server.close(async () => {
          await gracefulShutdown(signal);
        });
      };

      process.on('SIGTERM', () => workerGracefulShutdown('SIGTERM'));
      process.on('SIGINT', () => workerGracefulShutdown('SIGINT'));

    } catch (error) {
      logger.error('Failed to start server:', error);
      process.exit(1);
    }
  };

  startServer().catch((error) => {
    logger.error('Unhandled error in startServer:', error);
    process.exit(1);
  });
}
