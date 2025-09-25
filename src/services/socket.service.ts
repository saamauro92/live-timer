import { Server as SocketServer, Socket } from 'socket.io';
import { createAdapter } from '@socket.io/redis-adapter';
import { Server } from 'http';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import { redisClient } from '../config/redis';
import { roomService } from './room.service';
import { timerService } from './timer.service';
import { logger } from '../utils/logger';
import { SocketData, JoinRoomData, RoomStats } from '../types';

const prisma = new PrismaClient();

export class SocketService {
  private io: SocketServer;
  private roomConnections = new Map<string, Set<string>>(); // roomId -> Set of socketIds

  constructor(server: Server) {
    logger.info('Initializing Socket.IO server...');
    this.io = new SocketServer(server, {
      cors: {
        origin: process.env.CORS_ORIGIN || "http://localhost:3000",
        methods: ['GET', 'POST'],
        credentials: true
      },
      pingTimeout: 60000,
      pingInterval: 25000,
      transports: ['websocket', 'polling']
    });
    logger.info('Socket.IO server initialized with CORS origin:', process.env.CORS_ORIGIN || "http://localhost:3000");

    // Redis adapter for horizontal scaling
    if (process.env.NODE_ENV === 'production') {
      const subClient = redisClient.duplicate();
      this.io.adapter(createAdapter(redisClient, subClient));
      logger.info('Socket.IO Redis adapter enabled for scaling');
    }

    this.setupAuthentication();
    this.setupEventHandlers();
    this.startExpiredTimerCleanup();
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
          logger.error('JWT_SECRET not configured');
          next(new Error('Server configuration error'));
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
            banExpires: true
          }
        });

        if (!user) {
          next(new Error('User not found'));
          return;
        }

        // Check if user is banned
        if (user.banned) {
          const now = new Date();
          if (!user.banExpires || user.banExpires > now) {
            next(new Error('Account is banned'));
            return;
          }
        }

        // Attach user data to socket
        (socket.data as SocketData).user = {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role || undefined,
          emailVerified: user.emailVerified
        };

        logger.info(`Socket authenticated for user: ${user.email} (${user.id})`);
        next();
      } catch (error) {
        logger.error('Socket authentication failed:', error);
        next(new Error('Authentication failed'));
      }
    });
  }

  private setupEventHandlers(): void {
    this.io.on('connection', (socket: Socket) => {
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
      socket.on('join-room', async (data: JoinRoomData) => {
        try {
          logger.info(`Socket ${socket.id} attempting to join room with shareToken: ${data.shareToken}`);
          const room = await roomService.findByShareTokenWithTimers(data.shareToken);
          if (!room) {
            logger.warn(`Room not found for shareToken: ${data.shareToken}`);
            socket.emit('error', { message: 'Room not found' });
            return;
          }

          const roomKey = `room:${room.id}`;
          logger.info(`Socket ${socket.id} joining room: ${roomKey} (room ID: ${room.id})`);
          socket.join(roomKey);

          // Get user ID from authenticated socket data or from request
          const socketData = socket.data as SocketData;
          const userId = socketData.user?.id || data.userId;

          // Store connection data
          socketData.roomId = room.id;
          socketData.userId = userId;
          socketData.isAdmin = userId === room.ownerId;

          // Track connection
          if (!this.roomConnections.has(roomKey)) {
            this.roomConnections.set(roomKey, new Set());
          }
          this.roomConnections.get(roomKey)!.add(socket.id);

          // Send initial room state with all timers
          socket.emit('room-state', {
            ...room,
            isAdmin: socketData.isAdmin
          });

          // Broadcast user count to all room members
          const userCount = this.roomConnections.get(roomKey)!.size;
          this.io.to(roomKey).emit('user-count', userCount);

          logger.info(`User joined room ${room.id} as ${socketData.isAdmin ? 'admin' : 'viewer'}`);
        } catch (error) {
          logger.error('Error joining room:', error);
          socket.emit('error', { message: 'Failed to join room' });
        }
      });

      // HEARTBEAT - Keep connection alive and sync state
      socket.on('ping', () => {
        socket.emit('pong');
      });

      // SYNC REQUEST - Manual sync when needed
      socket.on('request-sync', async () => {
        const socketData = socket.data as SocketData;
        if (socketData.roomId) {
          try {
            const room = await roomService.findByIdWithTimers(socketData.roomId);
            if (room) {
              socket.emit('room-state', {
                ...room,
                isAdmin: socketData.isAdmin
              });
            }
          } catch (error) {
            logger.error('Error syncing room state:', error);
            socket.emit('error', { message: 'Failed to sync room state' });
          }
        }
      });

      // DISCONNECT HANDLER
      socket.on('disconnect', () => {
        const socketData = socket.data as SocketData;
        
        if (socketData.roomId) {
          const roomKey = `room:${socketData.roomId}`;
          const connections = this.roomConnections.get(roomKey);
          
          if (connections) {
            connections.delete(socket.id);
            
            // Update user count
            this.io.to(roomKey).emit('user-count', connections.size);
            
            // Clean up empty rooms
            if (connections.size === 0) {
              this.roomConnections.delete(roomKey);
            }
          }
        }
        
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
    logger.info(`Target room connections:`, connections ? Array.from(connections) : 'No connections');
    
    this.io.to(roomKey).emit(event, data);
    logger.info(`Broadcasting ${event} to room ${roomId} (${connectedCount} connected users)`, { 
      event, 
      roomId, 
      connectedUsers: connectedCount,
      data: {
        timerId: data.timerId,
        isActive: data.isActive,
        remainingTime: data.remainingTime
      }
    });
  }

  // Get room statistics
  public getRoomStats(roomId: string): RoomStats {
    const roomKey = `room:${roomId}`;
    const connections = this.roomConnections.get(roomKey);
    return {
      connectedUsers: connections ? connections.size : 0,
      isActive: connections ? connections.size > 0 : false
    };
  }

  // Get all room statistics
  public getAllRoomStats(): Record<string, RoomStats> {
    const stats: Record<string, RoomStats> = {};
    this.roomConnections.forEach((connections, roomKey) => {
      const roomId = roomKey.replace('room:', '');
      stats[roomId] = {
        connectedUsers: connections.size,
        isActive: connections.size > 0
      };
    });
    return stats;
  }

  // Start background task to clean up expired timers
  private startExpiredTimerCleanup(): void {
    setInterval(async () => {
      try {
        const expiredTimers = await timerService.getExpiredTimers();
        for (const timer of expiredTimers) {
          await timerService.markAsExpired(timer.id);
          this.emitToRoom(timer.roomId, 'timer-finished', {
            timerId: timer.id,
            title: timer.title
          });
          logger.info(`Timer ${timer.id} expired and marked as inactive`);
        }
      } catch (error) {
        logger.error('Error in expired timer cleanup:', error);
      }
    }, 30000); // Check every 30 seconds
  }

  // Graceful shutdown
  public async close(): Promise<void> {
    logger.info('Closing Socket.IO server...');
    this.io.close();
  }
}
