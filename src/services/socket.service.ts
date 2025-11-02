import { Server as SocketServer, Socket } from 'socket.io';
import { createAdapter } from '@socket.io/redis-adapter';
import { Server } from 'http';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import { redisClient } from '../config/redis';
import { roomService } from './room.service';
import { timerService } from './timer.service';
import { logger } from '../utils/logger';
import { parseUserAgent, getFriendlyDisplayName } from '../utils/userAgent';
import { 
  SocketData, 
  JoinRoomData, 
  RoomStats, 
  UserConnectionInfo, 
  UserJoinedEvent, 
  UserLeftEvent, 
  UserCountUpdateEvent 
} from '../types';

const prisma = new PrismaClient();

export class SocketService {
  private io: SocketServer;
  private roomConnections = new Map<string, Set<string>>(); // roomId -> Set of socketIds
  private connectionDetails = new Map<string, UserConnectionInfo>(); // socketId -> ConnectionInfo
  private roomOwners = new Map<string, string>(); // roomId -> ownerId
  private socketRoomOwners = new Map<string, string>(); // socketId -> roomOwnerId (for quick lookup)

  constructor(server: Server) {
    logger.info("Initializing Socket.IO server...");
    this.io = new SocketServer(server, {
      cors: {
        origin: ["http://localhost:3000", "http://localhost:5173", "http://localhost:3001", process.env.CORS_ORIGIN || "http://localhost:3000"],
        methods: ["GET", "POST"],
        credentials: true,
      },
      pingTimeout: 60000,
      pingInterval: 25000,
      transports: ["websocket", "polling"],
    });
    logger.info("Socket.IO server initialized with CORS origin:", process.env.CORS_ORIGIN || "http://localhost:3000");

    // Redis adapter for horizontal scaling
    if (process.env.NODE_ENV === "production") {
      const subClient = redisClient.duplicate();
      this.io.adapter(createAdapter(redisClient, subClient));
      logger.info("Socket.IO Redis adapter enabled for scaling");
    }

    this.setupAuthentication();
    this.setupEventHandlers();
    this.startExpiredTimerCleanup();
  }

  private createConnectionInfo(socket: Socket, userData?: any): UserConnectionInfo {
    try {
      const userAgent = socket.handshake.headers["user-agent"] || "";
      const parsedUA = parseUserAgent(userAgent);
      const ip = socket.handshake.address || socket.conn.remoteAddress || "unknown";

      return {
        socketId: socket.id,
        userId: userData?.id,
        userAgent,
        browser: parsedUA.browser,
        os: parsedUA.os,
        ip,
        connectedAt: new Date(),
        lastSeen: new Date(),
        isOnline: true,
        user: userData,
      };
    } catch (error) {
      logger.error("Error creating connection info:", error);
      // Return fallback connection info
      return {
        socketId: socket.id,
        userId: userData?.id,
        userAgent: "Unknown",
        browser: "Unknown",
        os: "Unknown",
        ip: "unknown",
        connectedAt: new Date(),
        lastSeen: new Date(),
        isOnline: true,
        user: userData,
      };
    }
  }

  private setupAuthentication(): void {
    this.io.use(async (socket, next) => {
      try {
        const token = socket.handshake.auth.token;

        if (!token) {
          // Allow anonymous connections for public room viewing
          next();
          return;
        }

        const jwtSecret = process.env.JWT_SECRET;
        if (!jwtSecret) {
          logger.error("JWT_SECRET not configured");
          next(new Error("Server configuration error"));
          return;
        }

        // Verify JWT token
        const decoded = jwt.verify(token, jwtSecret) as any;

        // Fetch user from database
        const user = await prisma.user.findUnique({
          where: { id: decoded.id },
          select: {
            id: true,
            email: true,
            name: true,
            role: true,
            emailVerified: true,
            banned: true,
            banExpires: true,
          },
        });

        if (!user) {
          next(new Error("User not found"));
          return;
        }

        // Check if user is banned
        if (user.banned) {
          const now = new Date();
          if (!user.banExpires || user.banExpires > now) {
            next(new Error("Account is banned"));
            return;
          }
        }

        // Attach user data to socket
        (socket.data as SocketData).user = {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role || undefined,
          emailVerified: user.emailVerified,
        };

        logger.info(`Socket authenticated for user: ${user.email} (${user.id})`);
        next();
      } catch (error) {
        logger.error("Socket authentication failed:", error);
        next(new Error("Authentication failed"));
      }
    });
  }

  private setupEventHandlers(): void {
    this.io.on("connection", (socket: Socket) => {
      logger.info(`Client connected: ${socket.id}`);
      logger.info(`Socket handshake auth:`, socket.handshake.auth);
      logger.info(`Socket handshake headers:`, socket.handshake.headers);
      logger.info(`Socket handshake address:`, socket.handshake.address);
      logger.info(`Socket handshake time:`, socket.handshake.time);

      // Debug: Log all events received
      socket.onAny((eventName, ...args) => {
        logger.info(`Socket ${socket.id} received event: ${eventName}`, args);
      });

      // JOIN ROOM - Both admin and viewers use this
      socket.on("join-room", async (data: JoinRoomData) => {
        try {
          logger.info(`Socket ${socket.id} attempting to join room with shareToken: ${data.shareToken}`);
          const room = await roomService.findByShareTokenWithTimers(data.shareToken);
          if (!room) {
            logger.warn(`Room not found for shareToken: ${data.shareToken}`);
            socket.emit("error", { message: "Room not found" });
            return;
          }

          const roomKey = `room:${room.id}`;
          logger.info(`Socket ${socket.id} joining room: ${roomKey} (room ID: ${room.id})`);

          // Leave any previous rooms first
          const socketData = socket.data as SocketData;
          if (socketData.roomId) {
            const previousRoomKey = `room:${socketData.roomId}`;
            socket.leave(previousRoomKey);
            const previousConnections = this.roomConnections.get(previousRoomKey);
            if (previousConnections) {
              previousConnections.delete(socket.id);
              if (previousConnections.size === 0) {
                this.roomConnections.delete(previousRoomKey);
              }
            }
          }

          socket.join(roomKey);

          // Get user ID from authenticated socket data or from request
          const userId = socketData.user?.id || data.userId;

          // Create detailed connection info
          const connectionInfo = this.createConnectionInfo(socket, socketData.user);

          // Store connection data
          socketData.roomId = room.id;
          socketData.userId = userId;
          socketData.isAdmin = userId === room.ownerId;
          socketData.connectionInfo = connectionInfo;

          // Store room owner for filtering admin connections
          this.roomOwners.set(room.id, room.ownerId);
          if (socketData.isAdmin) {
            this.socketRoomOwners.set(socket.id, room.ownerId);
          }

          // Track connection
          if (!this.roomConnections.has(roomKey)) {
            this.roomConnections.set(roomKey, new Set());
          }
          this.roomConnections.get(roomKey)!.add(socket.id);
          this.connectionDetails.set(socket.id, connectionInfo);

          // Send initial room state with all timers
          socket.emit("room-state", {
            ...room,
            isAdmin: socketData.isAdmin,
          });

          // Get viewer-only connections (excluding admin)
          const viewerConnections = this.getViewerConnections(room.id);
          const viewerCount = viewerConnections.length;

          // Only send user-joined event if this is a viewer (not admin)
          // Admin connections should not trigger viewer count updates
          if (!socketData.isAdmin) {
            const userJoinedEvent: UserJoinedEvent = {
              roomId: room.id,
              connection: connectionInfo,
              totalUsers: viewerCount, // Use viewer count instead of total
            };
            this.io.to(roomKey).emit("user-joined", userJoinedEvent);
          }

          const userCountUpdate: UserCountUpdateEvent = {
            roomId: room.id,
            count: viewerCount, // Use viewer count instead of total
            connections: viewerConnections, // Only viewer connections
          };

          logger.info(`Broadcasting viewer-count: ${viewerCount} to room: ${roomKey} (admin excluded: ${socketData.isAdmin})`);
          this.io.to(roomKey).emit("user-count", viewerCount); // Send viewer count
          this.io.to(roomKey).emit("user-count-update", userCountUpdate);

          // Send a test event to verify the connection works
          socket.emit("test-event", {
            message: "Successfully joined room",
            roomId: room.id,
            shareToken: data.shareToken,
            timestamp: new Date().toISOString(),
          });

          logger.info(`User joined room ${room.id} as ${socketData.isAdmin ? "admin" : "viewer"}`);
          logger.info(`Room ${roomKey} now has ${viewerCount} viewers (excluding admin)`);
        } catch (error) {
          logger.error("Error joining room:", error);
          socket.emit("error", { message: "Failed to join room" });
        }
      });

      // HEARTBEAT - Keep connection alive and sync state
      socket.on("ping", () => {
        socket.emit("pong");
      });

      // SYNC REQUEST - Manual sync when needed
      socket.on("request-sync", async () => {
        const socketData = socket.data as SocketData;
        if (socketData.roomId) {
          try {
            const room = await roomService.findByIdWithTimers(socketData.roomId);
            if (room) {
              socket.emit("room-state", {
                ...room,
                isAdmin: socketData.isAdmin,
              });
            }
          } catch (error) {
            logger.error("Error syncing room state:", error);
            socket.emit("error", { message: "Failed to sync room state" });
          }
        }
      });

      // TIMER SELECTION - Admin selects a timer to display
      socket.on("timer-selected", (data: { roomId: string; timerId: string }) => {
        const socketData = socket.data as SocketData;

        // Only allow admins to select timers
        if (!socketData.isAdmin) {
          logger.warn(`Non-admin user ${socket.id} attempted to select timer`);
          socket.emit("error", { message: "Only room admin can select timers" });
          return;
        }

        if (socketData.roomId === data.roomId) {
          const roomKey = `room:${socketData.roomId}`;
          // Broadcast timer selection to all room members (including viewers)
          this.io.to(roomKey).emit("timer-selected", {
            roomId: data.roomId,
            timerId: data.timerId,
          });
          logger.info(`Timer ${data.timerId} selected in room ${data.roomId} by admin`);
        }
      });

      // DISCONNECT HANDLER
      socket.on("disconnect", () => {
        const socketData = socket.data as SocketData;

        if (socketData.roomId) {
          const roomKey = `room:${socketData.roomId}`;
          const connections = this.roomConnections.get(roomKey);

          if (connections) {
            connections.delete(socket.id);

            // Leave the room
            socket.leave(roomKey);

            // Check if this was an admin connection before cleanup
            const wasAdmin = this.socketRoomOwners.has(socket.id);

            // Clean up socket owner mapping before calculating viewer count
            this.socketRoomOwners.delete(socket.id);

            // Get viewer-only connections (excluding admin) - calculate after cleanup
            const viewerConnections = this.getViewerConnections(socketData.roomId);
            const viewerCount = viewerConnections.length;

            // Only send user-left event if this was a viewer (not admin)
            // Admin disconnections should not trigger viewer count updates
            if (!wasAdmin) {
              const userLeftEvent: UserLeftEvent = {
                roomId: socketData.roomId,
                socketId: socket.id,
                totalUsers: viewerCount, // Use viewer count instead of total
              };
              this.io.to(roomKey).emit("user-left", userLeftEvent);
            }

            const userCountUpdate: UserCountUpdateEvent = {
              roomId: socketData.roomId,
              count: viewerCount, // Use viewer count instead of total
              connections: viewerConnections, // Only viewer connections
            };

            // Always broadcast count update (even if admin left, count might change due to cleanup)
            logger.info(`Broadcasting viewer-count: ${viewerCount} to room: ${roomKey} (disconnect, wasAdmin: ${wasAdmin})`);
            this.io.to(roomKey).emit("user-count", viewerCount); // Send viewer count
            this.io.to(roomKey).emit("user-count-update", userCountUpdate);

            // Clean up empty rooms
            if (connections.size === 0) {
              this.roomConnections.delete(roomKey);
            }

            logger.info(`User left room ${socketData.roomId}, ${connections.size} users remaining`);
          }
        }

        // Clean up connection details
        this.connectionDetails.delete(socket.id);

        logger.info(`Client disconnected: ${socket.id}`);
      });
    });
  }

  // Public method for HTTP controllers to broadcast updates
  public emitToRoom(roomId: string, event: string, data: any): void {
    const roomKey = `room:${roomId}`;
    const connections = this.roomConnections.get(roomKey);
    const connectedCount = connections ? connections.size : 0;

    // Debug: Log all rooms and their connections
    logger.info(`All room connections:`, Array.from(this.roomConnections.entries()));
    logger.info(`Target room key: ${roomKey}`);
    logger.info(`Target room connections:`, connections ? Array.from(connections) : "No connections");

    this.io.to(roomKey).emit(event, data);
    logger.info(`Broadcasting ${event} to room ${roomId} (${connectedCount} connected users)`, {
      event,
      roomId,
      connectedUsers: connectedCount,
      data: {
        timerId: data.timerId,
        isActive: data.isActive,
        remainingTime: data.remainingTime,
      },
    });
  }

  // Get room statistics (returns viewer count, excluding admin)
  public getRoomStats(roomId: string): RoomStats {
    const roomKey = `room:${roomId}`;
    const connections = this.roomConnections.get(roomKey);
    const viewerConnections = this.getViewerConnections(roomId);

    return {
      connectedUsers: viewerConnections.length, // Viewer count only
      isActive: connections ? connections.size > 0 : false,
      connections: viewerConnections, // Only viewer connections
    };
  }

  // Get detailed connection information for a room (all connections)
  private getRoomConnections(roomId: string): UserConnectionInfo[] {
    const roomKey = `room:${roomId}`;
    const socketIds = this.roomConnections.get(roomKey);

    if (!socketIds) {
      return [];
    }

    return Array.from(socketIds)
      .map((socketId) => this.connectionDetails.get(socketId))
      .filter((info): info is UserConnectionInfo => info !== undefined)
      .map((info) => ({
        ...info,
        lastSeen: new Date(), // Update last seen time
      }));
  }

  // Get viewer-only connections (excluding admin/room owner)
  private getViewerConnections(roomId: string): UserConnectionInfo[] {
    const roomKey = `room:${roomId}`;
    const socketIds = this.roomConnections.get(roomKey);
    const ownerId = this.roomOwners.get(roomId);

    if (!socketIds) {
      return [];
    }

    return Array.from(socketIds)
      .map((socketId) => this.connectionDetails.get(socketId))
      .filter((info): info is UserConnectionInfo => info !== undefined)
      .filter((info) => {
        // Exclude admin connections (where userId matches room owner)
        if (ownerId && info.userId === ownerId) {
          return false;
        }
        // Also check socket owner mapping as fallback
        if (this.socketRoomOwners.has(info.socketId)) {
          return false;
        }
        return true;
      })
      .map((info) => ({
        ...info,
        lastSeen: new Date(), // Update last seen time
      }));
  }

  // Get all room statistics
  public getAllRoomStats(): Record<string, RoomStats> {
    const stats: Record<string, RoomStats> = {};
    this.roomConnections.forEach((connections, roomKey) => {
      const roomId = roomKey.replace("room:", "");
      stats[roomId] = {
        connectedUsers: connections.size,
        isActive: connections.size > 0,
      };
    });
    return stats;
  }

  // Debug method to get all connections
  public getAllConnections(): Record<string, string[]> {
    const connections: Record<string, string[]> = {};
    this.roomConnections.forEach((socketIds, roomKey) => {
      connections[roomKey] = Array.from(socketIds);
    });
    return connections;
  }

  // Start background task to clean up expired timers
  private startExpiredTimerCleanup(): void {
    setInterval(async () => {
      try {
        const expiredTimers = await timerService.getExpiredTimers();
        for (const timer of expiredTimers) {
          await this.handleTimerExpiration(timer);

          // Send timer-finished event
          this.emitToRoom(timer.roomId, "timer-finished", {
            timerId: timer.id,
            title: timer.title,
            roomId: timer.roomId,
            completionMessage: timer.completionMessage || null,
          });

          logger.info(`Timer ${timer.id} expired and marked as inactive`);
        }
      } catch (error) {
        logger.error("Error in expired timer cleanup:", error);
      }
    }, 30000); // Check every 30 seconds
  }

  // Handle timer expiration
  private async handleTimerExpiration(timer: any): Promise<boolean> {
    try {
      // Mark timer as expired
      await timerService.markAsExpired(timer.id);
      return false;
    } catch (error) {
      logger.error("Error handling timer expiration:", error);
      return false;
    }
  }

  // Graceful shutdown
  public async close(): Promise<void> {
    logger.info("Closing Socket.IO server...");
    this.io.close();
  }
}
