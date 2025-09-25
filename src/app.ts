import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import { createServer } from 'http';

import { globalRateLimit, createRoomLimit, timerControlLimit } from './middleware/rateLimit.middleware';
import { sanitizeInput } from './middleware/validation.middleware';
import { errorHandler, notFoundHandler } from './middleware/error.middleware';
import { authenticateToken, authenticateRoomOwner, optionalAuth } from './middleware/auth.middleware';
import { RoomController } from './controllers/room.controller';
import { TimerController } from './controllers/timer.controller';
import { AuthController } from './controllers/auth.controller';
import { SocketService } from './services/socket.service';

export const createApp = (): express.Application => {
  const app = express();

  // Security middleware
  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        connectSrc: ["'self'", "ws:", "wss:"],
        scriptSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", "data:", "https:"],
      },
    },
    crossOriginEmbedderPolicy: false
  }));

  // CORS configuration
  app.use(cors({
    origin: process.env['CORS_ORIGIN'] || "http://localhost:3000",
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-API-Key']
  }));

  // Compression middleware
  app.use(compression());

  // Body parsing middleware
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // Trust proxy for accurate IP addresses
  app.set('trust proxy', 1);

  // Input sanitization
  app.use(sanitizeInput);

  // Global rate limiting
  app.use(globalRateLimit);

  // Health check endpoint
  app.get('/health', (_req, res) => {
    res.json({
      success: true,
      message: 'Server is healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime()
    });
  });

  // API routes
  const authController = new AuthController();
  const roomController = new RoomController();
  const timerController = new TimerController();

  // Authentication routes
  app.post('/auth/register', authController.register);
  app.post('/auth/login', authController.login);
  app.get('/auth/me', authenticateToken, authController.getCurrentUser);
  app.post('/auth/logout', authenticateToken, authController.logout);
  app.put('/auth/profile', authenticateToken, authController.updateProfile);

  // Room routes
  app.post('/api/rooms', createRoomLimit, authenticateToken, roomController.createRoom);
  app.get('/api/rooms', authenticateToken, roomController.getAllRooms);
  app.get('/api/rooms/recent', authenticateToken, roomController.getRecentRooms);
  // Use specific routes to avoid conflicts
  app.get('/api/rooms/share/:shareToken', roomController.getRoomByShareToken);
  app.get('/api/rooms/:id', optionalAuth, roomController.getRoomById);
  app.get('/api/rooms/:id/stats', roomController.getRoomStats);
  app.put('/api/rooms/:id', authenticateRoomOwner, roomController.updateRoom);
  app.delete('/api/rooms/:id', authenticateRoomOwner, roomController.deleteRoom);

  // Timer routes
  app.post('/api/rooms/:roomId/timers', optionalAuth, timerController.createTimer);
  app.get('/api/rooms/:roomId/timers', optionalAuth, timerController.getTimers);
  app.get('/api/timers/active', authenticateToken, timerController.getActiveTimers);
  app.put('/api/timers/:id', authenticateToken, timerController.updateTimer);
  app.delete('/api/timers/:id', authenticateToken, timerController.deleteTimer);

  // Debug routes
  app.get('/api/debug/rooms', roomController.getAllRoomsDebug);
  app.get('/api/debug/test-share-token/:shareToken', roomController.testShareToken);
  
  // Socket service test endpoint
  app.post('/api/debug/test-socket/:roomId', (req, res) => {
    try {
      const { roomId } = req.params;
      const socketService = (global as any).socketService;
      
      if (!socketService) {
        return res.status(500).json({
          success: false,
          message: 'Socket service not available'
        });
      }
      
      // Test broadcast
      socketService.emitToRoom(roomId, 'test-event', {
        message: 'Test broadcast from backend',
        timestamp: new Date().toISOString(),
        roomId: roomId
      });
      
      res.json({
        success: true,
        message: `Test broadcast sent to room ${roomId}`,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error testing socket service',
        error: error.message
      });
    }
  });
  
  // Timer control routes (with specific rate limiting) - require authentication
  app.post('/api/timers/:id/start', timerControlLimit, authenticateToken, timerController.startTimer);
  app.post('/api/timers/:id/pause', timerControlLimit, authenticateToken, timerController.pauseTimer);
  app.post('/api/timers/:id/reset', timerControlLimit, authenticateToken, timerController.resetTimer);

  // Socket.IO stats endpoint (for monitoring)
  app.get('/api/stats/socket', (_req, res) => {
    try {
      const socketService = (global as any).socketService;
      if (!socketService) {
        res.status(500).json({
          success: false,
          message: 'Socket service not available'
        });
        return;
      }
      
      const stats = socketService.getAllRoomStats();
      res.json({
        success: true,
        data: {
          rooms: stats,
          totalRooms: Object.keys(stats).length,
          totalConnections: Object.values(stats).reduce((sum, room: any) => sum + room.connectedUsers, 0)
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to get socket stats'
      });
    }
  });

  // 404 handler
  app.use(notFoundHandler);

  // Error handling middleware
  app.use(errorHandler);

  return app;
};
