import { Request, Response } from 'express';
import { z } from 'zod';
import { roomService } from '../services/room.service';
import { logger } from '../utils/logger';
import { ApiResponse } from '../types';

const createRoomSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().optional()
});

const updateRoomSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().optional(),
  showTimerName: z.boolean().optional()
});

export class RoomController {
  async createRoom(req: Request, res: Response): Promise<void> {
    try {
      // Get user ID from authenticated request
      const userId = req.user?.id;
      if (!userId) {
        const response: ApiResponse = {
          success: false,
          message: 'Authentication required to create room'
        };
        res.status(401).json(response);
        return;
      }

      const data = createRoomSchema.parse(req.body);
      const room = await roomService.create({
        name: data.name,
        description: data.description,
        ownerId: userId
      });
      
      logger.info(`Room created: ${room.id} by ${userId}`);
      
      const response: ApiResponse = {
        success: true,
        data: room,
        message: 'Room created successfully'
      };
      
      res.status(201).json(response);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const response: ApiResponse = {
          success: false,
          message: 'Validation error',
          errors: error.errors
        };
        res.status(400).json(response);
        return;
      }
      
      logger.error('Error creating room:', error);
      const response: ApiResponse = {
        success: false,
        message: 'Internal server error'
      };
      res.status(500).json(response);
    }
  }

  async getRoomByShareToken(req: Request, res: Response): Promise<void> {
    try {
      const { shareToken } = req.params;
      logger.info(`Looking for room with shareToken: ${shareToken}`);
      
      const room = await roomService.findByShareTokenWithTimers(shareToken);
      
      if (!room) {
        logger.warn(`Room not found for shareToken: ${shareToken}`);
        const response: ApiResponse = {
          success: false,
          message: 'Room not found'
        };
        res.status(404).json(response);
        return;
      }

      logger.info(`Found room: ${room.id} with shareToken: ${room.shareToken}`);
      const response: ApiResponse = {
        success: true,
        data: room
      };
      res.json(response);
    } catch (error) {
      logger.error('Error fetching room by shareToken:', error);
      const response: ApiResponse = {
        success: false,
        message: 'Internal server error'
      };
      res.status(500).json(response);
    }
  }

  async updateRoom(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const userId = req.user?.id;
      const data = updateRoomSchema.parse(req.body);
      
      if (!userId) {
        const response: ApiResponse = {
          success: false,
          message: 'Authentication required to update room'
        };
        res.status(401).json(response);
        return;
      }

      const room = await roomService.update(id, data, userId);
      
      if (!room) {
        const response: ApiResponse = {
          success: false,
          message: 'Room not found or unauthorized'
        };
        res.status(404).json(response);
        return;
      }

      // Broadcast room setting changes to all connected users
      if (data.showTimerName !== undefined) {
        const socketService = (global as any).socketService;
        if (socketService && room) {
          socketService.emitToRoom(id, "room-setting-changed", {
            roomId: id,
            shareToken: room.shareToken,
            setting: "showTimerName",
            value: data.showTimerName,
          });
          logger.info(`Broadcasted showTimerName setting change: ${data.showTimerName} for room ${id}`);
        }
      }

      const response: ApiResponse = {
        success: true,
        data: room,
        message: 'Room updated successfully'
      };
      res.json(response);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const response: ApiResponse = {
          success: false,
          message: 'Validation error',
          errors: error.errors
        };
        res.status(400).json(response);
        return;
      }
      
      logger.error('Error updating room:', error);
      const response: ApiResponse = {
        success: false,
        message: 'Internal server error'
      };
      res.status(500).json(response);
    }
  }

  async deleteRoom(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const userId = req.user?.id;
      
      if (!userId) {
        const response: ApiResponse = {
          success: false,
          message: 'Authentication required to delete room'
        };
        res.status(401).json(response);
        return;
      }

      const deleted = await roomService.delete(id, userId);
      
      if (!deleted) {
        const response: ApiResponse = {
          success: false,
          message: 'Room not found or unauthorized'
        };
        res.status(404).json(response);
        return;
      }

      const response: ApiResponse = {
        success: true,
        message: 'Room deleted successfully'
      };
      res.json(response);
    } catch (error) {
      logger.error('Error deleting room:', error);
      const response: ApiResponse = {
        success: false,
        message: 'Internal server error'
      };
      res.status(500).json(response);
    }
  }

  async getRoomStats(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const stats = await roomService.getRoomStats(id);
      
      const response: ApiResponse = {
        success: true,
        data: stats
      };
      res.json(response);
    } catch (error) {
      logger.error('Error getting room stats:', error);
      const response: ApiResponse = {
        success: false,
        message: 'Internal server error'
      };
      res.status(500).json(response);
    }
  }

  async getRoomConnectionStats(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const socketService = (global as any).socketService;
      
      if (!socketService) {
        const response: ApiResponse = {
          success: false,
          message: 'Socket service not available'
        };
        res.status(503).json(response);
        return;
      }
      
      const connectionStats = socketService.getRoomStats(id);
      
      const response: ApiResponse = {
        success: true,
        data: connectionStats
      };
      res.json(response);
    } catch (error) {
      logger.error('Error getting room connection stats:', error);
      const response: ApiResponse = {
        success: false,
        message: 'Internal server error'
      };
      res.status(500).json(response);
    }
  }

  async getAllConnectionsDebug(req: Request, res: Response): Promise<void> {
    try {
      const socketService = (global as any).socketService;
      
      if (!socketService) {
        const response: ApiResponse = {
          success: false,
          message: 'Socket service not available'
        };
        res.status(503).json(response);
        return;
      }
      
      const allConnections = socketService.getAllConnections();
      const allStats = socketService.getAllRoomStats();
      
      const response: ApiResponse = {
        success: true,
        data: {
          connections: allConnections,
          stats: allStats
        }
      };
      res.json(response);
    } catch (error) {
      logger.error('Error getting all connections debug:', error);
      const response: ApiResponse = {
        success: false,
        message: 'Internal server error'
      };
      res.status(500).json(response);
    }
  }

  // Get all rooms for a user
  async getAllRooms(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        const response: ApiResponse = {
          success: false,
          message: 'Authentication required'
        };
        res.status(401).json(response);
        return;
      }

      const rooms = await roomService.getAllRooms(req.user.id);
      
      const response: ApiResponse = {
        success: true,
        data: { rooms }
      };
      res.json(response);
    } catch (error) {
      logger.error('Error getting all rooms:', error);
      const response: ApiResponse = {
        success: false,
        message: 'Internal server error'
      };
      res.status(500).json(response);
    }
  }

  // Debug: Get all rooms (no auth required)
  async getAllRoomsDebug(req: Request, res: Response): Promise<void> {
    try {
      const rooms = await roomService.getAllRoomsDebug();
      
      const response: ApiResponse = {
        success: true,
        data: rooms
      };
      res.json(response);
    } catch (error) {
      logger.error('Error getting all rooms for debug:', error);
      const response: ApiResponse = {
        success: false,
        message: 'Internal server error'
      };
      res.status(500).json(response);
    }
  }

  // Debug: Test specific share token
  async testShareToken(req: Request, res: Response): Promise<void> {
    try {
      const { shareToken } = req.params;
      logger.info(`Testing shareToken: ${shareToken}`);
      
      const room = await roomService.findByShareTokenWithTimers(shareToken);
      
      const response: ApiResponse = {
        success: true,
        data: {
          shareToken,
          found: !!room,
          room: room || null
        }
      };
      res.json(response);
    } catch (error) {
      logger.error('Error testing share token:', error);
      const response: ApiResponse = {
        success: false,
        message: 'Internal server error'
      };
      res.status(500).json(response);
    }
  }

  // Get room by ID (authenticated users only)
  async getRoomById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const userId = req.user?.id; // Optional authentication
      
      const room = await roomService.findByIdWithTimers(id);
      
      if (!room) {
        const response: ApiResponse = {
          success: false,
          message: 'Room not found'
        };
        res.status(404).json(response);
        return;
      }

      // If user is authenticated, check if they're the owner
      const isAdmin = userId && room.ownerId === userId;

      const response: ApiResponse = {
        success: true,
        data: { 
          room,
          isAdmin 
        }
      };
      res.json(response);
    } catch (error) {
      logger.error('Error getting room by ID:', error);
      const response: ApiResponse = {
        success: false,
        message: 'Internal server error'
      };
      res.status(500).json(response);
    }
  }

  // Get recent rooms for a user
  async getRecentRooms(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        const response: ApiResponse = {
          success: false,
          message: 'Authentication required'
        };
        res.status(401).json(response);
        return;
      }

      const rooms = await roomService.getRecentRooms(req.user.id);
      
      const response: ApiResponse = {
        success: true,
        data: { rooms }
      };
      res.json(response);
    } catch (error) {
      logger.error('Error getting recent rooms:', error);
      const response: ApiResponse = {
        success: false,
        message: 'Internal server error'
      };
      res.status(500).json(response);
    }
  }
}
