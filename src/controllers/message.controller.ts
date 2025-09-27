import { Request, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../config/database';
import { roomService } from '../services/room.service';
import { logger } from '../utils/logger';
import { ApiResponse } from '../types';

const liveMessageSchema = z.object({
  message: z.string().min(1).max(500)
});

export class MessageController {
  // POST /api/rooms/:roomId/messages/live - Update live message
  async updateLiveMessage(req: Request, res: Response): Promise<void> {
    try {
      const { roomId } = req.params;
      const userId = req.user?.id;
      const data = liveMessageSchema.parse(req.body);

      if (!userId) {
        const response: ApiResponse = {
          success: false,
          message: 'Authentication required'
        };
        res.status(401).json(response);
        return;
      }

      // Validate room ownership
      const room = await roomService.findById(roomId);
      if (!room || room.ownerId !== userId) {
        const response: ApiResponse = {
          success: false,
          message: 'Unauthorized'
        };
        res.status(403).json(response);
        return;
      }

      // Deactivate existing live messages
      await prisma.roomMessage.updateMany({
        where: {
          roomId,
          messageType: 'live',
          isActive: true
        },
        data: { isActive: false }
      });

      // Create new live message
      const newMessage = await prisma.roomMessage.create({
        data: {
          roomId,
          message: data.message,
          messageType: 'live',
          isActive: true
        }
      });

      // Broadcast to all room members
      const socketService = (global as any).socketService;
      logger.info(`=== LIVE MESSAGE BROADCAST DEBUG ===`);
      logger.info(`Room ID: ${roomId}`);
      logger.info(`Message: ${data.message}`);
      logger.info(`Socket service available: ${!!socketService}`);
      
      if (socketService) {
        // Get room stats before broadcasting
        const roomStats = socketService.getRoomStats(roomId);
        logger.info(`Room ${roomId} stats before broadcast:`, roomStats);
        
        const broadcastData = {
          roomId,
          message: data.message,
          messageId: newMessage.id
        };
        
        logger.info(`Broadcasting live-message-updated with data:`, broadcastData);
        socketService.emitToRoom(roomId, 'live-message-updated', broadcastData);
        
        // Get room stats after broadcasting
        const roomStatsAfter = socketService.getRoomStats(roomId);
        logger.info(`Room ${roomId} stats after broadcast:`, roomStatsAfter);
        
        logger.info(`Live message broadcasted to room ${roomId}`);
      } else {
        logger.error('Socket service not available for live message broadcast');
      }

      logger.info(`Live message updated in room ${roomId} by user ${userId}`);

      const response: ApiResponse = {
        success: true,
        data: newMessage,
        message: 'Live message updated successfully'
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

      logger.error('Error updating live message:', error);
      const response: ApiResponse = {
        success: false,
        message: 'Failed to update live message'
      };
      res.status(500).json(response);
    }
  }

  // DELETE /api/rooms/:roomId/messages/live - Clear live message
  async clearLiveMessage(req: Request, res: Response): Promise<void> {
    try {
      const { roomId } = req.params;
      const userId = req.user?.id;

      if (!userId) {
        const response: ApiResponse = {
          success: false,
          message: 'Authentication required'
        };
        res.status(401).json(response);
        return;
      }

      // Validate room ownership
      const room = await roomService.findById(roomId);
      if (!room || room.ownerId !== userId) {
        const response: ApiResponse = {
          success: false,
          message: 'Unauthorized'
        };
        res.status(403).json(response);
        return;
      }

      // Deactivate all live messages
      await prisma.roomMessage.updateMany({
        where: {
          roomId,
          messageType: 'live',
          isActive: true
        },
        data: { isActive: false }
      });

      // Broadcast to all room members
      const socketService = (global as any).socketService;
      logger.info(`=== LIVE MESSAGE CLEAR DEBUG ===`);
      logger.info(`Room ID: ${roomId}`);
      logger.info(`Socket service available: ${!!socketService}`);
      
      if (socketService) {
        const roomStats = socketService.getRoomStats(roomId);
        logger.info(`Room ${roomId} stats before clear broadcast:`, roomStats);
        
        const broadcastData = {
          roomId,
          message: null
        };
        
        logger.info(`Broadcasting live-message-updated (clear) with data:`, broadcastData);
        socketService.emitToRoom(roomId, 'live-message-updated', broadcastData);
        
        logger.info(`Live message clear broadcasted to room ${roomId}`);
      } else {
        logger.error('Socket service not available for live message clear broadcast');
      }

      logger.info(`Live message cleared in room ${roomId} by user ${userId}`);

      const response: ApiResponse = {
        success: true,
        message: 'Live message cleared successfully'
      };
      res.json(response);
    } catch (error) {
      logger.error('Error clearing live message:', error);
      const response: ApiResponse = {
        success: false,
        message: 'Failed to clear live message'
      };
      res.status(500).json(response);
    }
  }

  // GET /api/rooms/:roomId/messages/live - Get current live message
  async getLiveMessage(req: Request, res: Response): Promise<void> {
    try {
      const { roomId } = req.params;

      const liveMessage = await prisma.roomMessage.findFirst({
        where: {
          roomId,
          messageType: 'live',
          isActive: true
        },
        orderBy: { createdAt: 'desc' }
      });

      const response: ApiResponse = {
        success: true,
        data: {
          message: liveMessage?.message || null,
          messageId: liveMessage?.id || null
        }
      };
      res.json(response);
    } catch (error) {
      logger.error('Error getting live message:', error);
      const response: ApiResponse = {
        success: false,
        message: 'Failed to get live message'
      };
      res.status(500).json(response);
    }
  }

  // Broadcast timer completion message
  async broadcastTimerCompletion(timerId: string, roomId: string, message: string): Promise<void> {
    try {
      const socketService = (global as any).socketService;
      if (socketService && message) {
        socketService.emitToRoom(roomId, 'timer-completion-message', {
          roomId,
          timerId,
          message,
          timestamp: new Date().toISOString()
        });
        logger.info(`Timer completion message broadcasted: ${message}`);
      }
    } catch (error) {
      logger.error('Error broadcasting timer completion message:', error);
    }
  }
}

export const messageController = new MessageController();
