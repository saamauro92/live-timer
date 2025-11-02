import express from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import { createServer } from "http";

import { globalRateLimit, createRoomLimit, timerControlLimit } from "./middleware/rateLimit.middleware";
import { sanitizeInput } from "./middleware/validation.middleware";
import { errorHandler, notFoundHandler } from "./middleware/error.middleware";
import { authenticateToken, authenticateRoomOwner, optionalAuth } from "./middleware/auth.middleware";
import { checkRoomLimit, checkTimerLimit } from "./middleware/subscription.middleware";
import { RoomController } from "./controllers/room.controller";
import { TimerController } from "./controllers/timer.controller";
import { AuthController } from "./controllers/auth.controller";
import { MessageController } from "./controllers/message.controller";
import { StripeController } from "./controllers/stripe.controller";
import { SocketService } from "./services/socket.service";

export const createApp = (): express.Application => {
  const app = express();

  // Security middleware
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          connectSrc: ["'self'", "ws:", "wss:"],
          scriptSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          imgSrc: ["'self'", "data:", "https:"],
        },
      },
      crossOriginEmbedderPolicy: false,
    })
  );

  // CORS configuration
  app.use(
    cors({
      origin: ["http://localhost:3000", "http://localhost:5173", "http://localhost:3001", process.env["CORS_ORIGIN"] || "http://localhost:3000"],
      credentials: true,
      methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization", "X-API-Key"],
    })
  );

  // Compression middleware
  app.use(compression());

  // Body parsing middleware
  app.use(express.json({ limit: "10mb" }));
  app.use(express.urlencoded({ extended: true, limit: "10mb" }));

  // Trust proxy for accurate IP addresses
  app.set("trust proxy", 1);

  // Input sanitization
  app.use(sanitizeInput);

  // Global rate limiting
  app.use(globalRateLimit);

  // Health check endpoint
  app.get("/health", (_req, res) => {
    res.json({
      success: true,
      message: "Server is healthy",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    });
  });

  // API routes
  const authController = new AuthController();
  const roomController = new RoomController();
  const timerController = new TimerController();
  const messageController = new MessageController();
  const stripeController = new StripeController();

  // Authentication routes
  app.post("/auth/register", authController.register);
  app.post("/auth/login", authController.login);
  app.get("/auth/me", authenticateToken, authController.getCurrentUser);
  app.post("/auth/logout", authenticateToken, authController.logout);
  app.put("/auth/profile", authenticateToken, authController.updateProfile);

  // Email verification routes
  app.post("/auth/verify-email", authController.verifyEmail);
  app.post("/auth/resend-verification", authController.resendVerificationEmail);

  // Google OAuth routes
  app.post("/auth/google", authController.googleAuth.bind(authController));
  app.get("/auth/google/url", authController.getGoogleAuthUrl.bind(authController));
  app.post("/auth/google/callback", authController.googleCallback.bind(authController));
  app.get("/auth/google/callback", authController.googleCallbackRedirect.bind(authController));

  // Stripe routes
  app.post("/stripe/create-customer", authenticateToken, stripeController.createCustomer);
  app.post("/stripe/create-checkout-session", authenticateToken, stripeController.createCheckoutSession);
  app.post("/stripe/create-portal-session", authenticateToken, stripeController.createPortalSession);
  app.get("/stripe/subscription", authenticateToken, stripeController.getSubscription);
  app.post("/stripe/cancel-subscription", authenticateToken, stripeController.cancelSubscription);
  app.post("/stripe/reactivate-subscription", authenticateToken, stripeController.reactivateSubscription);
  app.post("/stripe/webhook", express.raw({ type: "application/json" }), stripeController.handleWebhook);

  // Room routes
  app.post("/api/rooms", createRoomLimit, authenticateToken, checkRoomLimit, roomController.createRoom);
  app.get("/api/rooms", authenticateToken, roomController.getAllRooms);
  app.get("/api/rooms/recent", authenticateToken, roomController.getRecentRooms);
  // Use specific routes to avoid conflicts
  app.get("/api/rooms/share/:shareToken", roomController.getRoomByShareToken);
  app.get("/api/rooms/:id", optionalAuth, roomController.getRoomById);
  app.get("/api/rooms/:id/stats", roomController.getRoomStats);
  app.get("/api/rooms/:id/connections", roomController.getRoomConnectionStats);
  app.put("/api/rooms/:id", authenticateRoomOwner, roomController.updateRoom);
  app.delete("/api/rooms/:id", authenticateRoomOwner, roomController.deleteRoom);

  // Timer routes
  app.post("/api/rooms/:roomId/timers", optionalAuth, checkTimerLimit, timerController.createTimer);
  app.get("/api/rooms/:roomId/timers", optionalAuth, timerController.getTimers);
  app.get("/api/timers/active", authenticateToken, timerController.getActiveTimers);
  app.put("/api/timers/:id", authenticateToken, timerController.updateTimer);
  app.delete("/api/timers/:id", authenticateToken, timerController.deleteTimer);

  // New timer management routes
  app.post("/api/rooms/:roomId/timers/reorder", authenticateToken, timerController.reorderTimers);
  app.post("/api/rooms/:roomId/timers/start-all", authenticateToken, timerController.startAllTimers);
  app.post("/api/rooms/:roomId/timers/pause-all", authenticateToken, timerController.pauseAllTimers);

  // Message routes
  app.post("/api/rooms/:roomId/messages/live", authenticateToken, messageController.updateLiveMessage);
  app.delete("/api/rooms/:roomId/messages/live", authenticateToken, messageController.clearLiveMessage);
  app.get("/api/rooms/:roomId/messages/live", optionalAuth, messageController.getLiveMessage);

  // Debug routes
  app.get("/api/debug/rooms", roomController.getAllRoomsDebug);
  app.get("/api/debug/test-share-token/:shareToken", roomController.testShareToken);
  app.get("/api/debug/connections", roomController.getAllConnectionsDebug);

  // Socket service test endpoint
  app.post("/api/debug/test-socket/:roomId", (req, res) => {
    try {
      const { roomId } = req.params;
      const socketService = (global as any).socketService;

      if (!socketService) {
        return res.status(500).json({
          success: false,
          message: "Socket service not available",
        });
      }

      // Test broadcast
      socketService.emitToRoom(roomId, "test-event", {
        message: "Test broadcast from backend",
        timestamp: new Date().toISOString(),
        roomId: roomId,
      });

      res.json({
        success: true,
        message: `Test broadcast sent to room ${roomId}`,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Error testing socket service",
        error: error.message,
      });
    }
  });

  // Test socket connection by shareToken
  app.post("/api/debug/test-socket-share/:shareToken", async (req, res) => {
    try {
      const { shareToken } = req.params;
      const socketService = (global as any).socketService;

      if (!socketService) {
        return res.status(500).json({
          success: false,
          message: "Socket service not available",
        });
      }

      // Find room by shareToken
      const { roomService } = require("./services/room.service");
      const room = await roomService.findByShareTokenWithTimers(shareToken);

      if (!room) {
        return res.status(404).json({
          success: false,
          message: "Room not found for shareToken",
        });
      }

      // Test broadcast to room
      socketService.emitToRoom(room.id, "test-event", {
        message: "Test broadcast from backend via shareToken",
        timestamp: new Date().toISOString(),
        roomId: room.id,
        shareToken: shareToken,
      });

      res.json({
        success: true,
        message: `Test broadcast sent to room ${room.id} via shareToken ${shareToken}`,
        roomId: room.id,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Error testing socket service with shareToken",
        error: error.message,
      });
    }
  });

  // Test timer events by shareToken
  app.post("/api/debug/test-timer-events/:shareToken", async (req, res) => {
    try {
      const { shareToken } = req.params;
      const { action } = req.body; // 'start', 'pause', 'stop'
      const socketService = (global as any).socketService;

      if (!socketService) {
        return res.status(500).json({
          success: false,
          message: "Socket service not available",
        });
      }

      // Find room by shareToken
      const { roomService } = require("./services/room.service");
      const room = await roomService.findByShareTokenWithTimers(shareToken);

      if (!room) {
        return res.status(404).json({
          success: false,
          message: "Room not found for shareToken",
        });
      }

      // Get the first timer from the room
      const timer = room.timers?.[0];
      if (!timer) {
        return res.status(404).json({
          success: false,
          message: "No timers found in room",
        });
      }

      // Simulate timer events
      const now = new Date();
      const endTime = new Date(now.getTime() + (timer.duration || 300000)); // 5 minutes default

      let eventData;
      switch (action) {
        case "start":
          eventData = {
            timerId: timer.id,
            roomId: room.id,
            isActive: true,
            endTimestamp: endTime,
            remainingTime: Math.floor(timer.duration / 1000),
          };
          socketService.emitToRoom(room.id, "timer-started", eventData);
          break;
        case "pause":
          eventData = {
            timerId: timer.id,
            roomId: room.id,
            isActive: false,
            isPaused: true,
            endTimestamp: endTime,
            remainingTime: Math.floor(timer.duration / 1000),
          };
          socketService.emitToRoom(room.id, "timer-paused", eventData);
          break;
        case "stop":
          eventData = {
            timerId: timer.id,
            roomId: room.id,
            isActive: false,
            isPaused: false,
            endTimestamp: endTime,
            remainingTime: 0,
          };
          socketService.emitToRoom(room.id, "timer-stopped", eventData);
          break;
        default:
          return res.status(400).json({
            success: false,
            message: "Invalid action. Use: start, pause, or stop",
          });
      }

      res.json({
        success: true,
        message: `Timer ${action} event sent to room ${room.id}`,
        roomId: room.id,
        timerId: timer.id,
        action: action,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Error testing timer events",
        error: error.message,
      });
    }
  });

  // Timer control routes (with specific rate limiting) - require authentication
  app.post("/api/timers/:id/start", timerControlLimit, authenticateToken, timerController.startTimer);
  app.post("/api/timers/:id/pause", timerControlLimit, authenticateToken, timerController.pauseTimer);
  app.post("/api/timers/:id/reset", timerControlLimit, authenticateToken, timerController.resetTimer);

  // Socket.IO stats endpoint (for monitoring)
  app.get("/api/stats/socket", (_req, res) => {
    try {
      const socketService = (global as any).socketService;
      if (!socketService) {
        res.status(500).json({
          success: false,
          message: "Socket service not available",
        });
        return;
      }

      const stats = socketService.getAllRoomStats();
      res.json({
        success: true,
        data: {
          rooms: stats,
          totalRooms: Object.keys(stats).length,
          totalConnections: Object.values(stats).reduce((sum, room: any) => sum + room.connectedUsers, 0),
        },
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Failed to get socket stats",
      });
    }
  });

  // CORS debug endpoint
  app.get("/api/debug/cors", (req, res) => {
    res.json({
      success: true,
      data: {
        origin: req.headers.origin,
        userAgent: req.headers["user-agent"],
        corsOrigin: process.env.CORS_ORIGIN,
        allowedOrigins: ["http://localhost:3000", "http://localhost:5173", "http://localhost:3001", process.env.CORS_ORIGIN || "http://localhost:3000"],
        timestamp: new Date().toISOString(),
      },
    });
  });

  // 404 handler
  app.use(notFoundHandler);

  // Error handling middleware
  app.use(errorHandler);

  return app;
};
