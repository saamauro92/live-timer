import { Request, Response } from 'express';
import { z } from 'zod';
import { timerService } from '../services/timer.service';
import { roomService } from '../services/room.service';
import { logger } from '../utils/logger';
import { ApiResponse } from '../types';

const createTimerSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().optional(),
  duration: z.number().min(1000).max(86400000) // 1 second to 24 hours in ms
});

const updateTimerSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z.string().optional(),
  duration: z.number().min(1000).max(86400000).optional()
});

export class TimerController {
  // POST /api/timers/:id/start
  async startTimer(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const userId = req.user?.id;

      const timer = await timerService.findById(id);
      if (!timer) {
        const response: ApiResponse = {
          success: false,
          message: 'Timer not found'
        };
        res.status(404).json(response);
        return;
      }
      
      // If authenticated, validate room ownership
      if (userId) {
        const room = await roomService.findById(timer.roomId);
        if (!room || room.ownerId !== userId) {
          const response: ApiResponse = {
            success: false,
            message: 'Unauthorized: Only room owner can control timers'
          };
          res.status(403).json(response);
          return;
        }
      }
   
      const updatedTimer = await timerService.updateTimerState(id, 'start');
      
      // Broadcast to all room members via Socket.IO
      try {
        const socketService = (global as any).socketService;
        logger.info(`=== TIMER START BROADCAST DEBUG ===`);
        logger.info(`Timer ID: ${id}`);
        logger.info(`Room ID: ${timer.roomId}`);
        logger.info(`User ID: ${userId}`);
        logger.info(`Socket service available: ${!!socketService}`);
        
        if (socketService) {
          // Get room stats before broadcasting
          const roomStats = socketService.getRoomStats(timer.roomId);
          logger.info(`Room ${timer.roomId} stats:`, roomStats);
          
          const broadcastData = {
            timerId: updatedTimer.id,
            roomId: timer.roomId,
            isActive: updatedTimer.isActive,
            endTimestamp: updatedTimer.endTimestamp,
            remainingTime: Math.max(0, Math.floor((new Date(updatedTimer.endTimestamp).getTime() - new Date().getTime()) / 1000))
          };
          
          logger.info(`Broadcasting timer-started with data:`, broadcastData);
          socketService.emitToRoom(timer.roomId, 'timer-started', broadcastData);
          
          // Also emit a general timer update
          logger.info(`Broadcasting timer-update with timer:`, updatedTimer);
          socketService.emitToRoom(timer.roomId, 'timer-update', updatedTimer);
          
          // Send a test event to verify connectivity
          socketService.emitToRoom(timer.roomId, 'test-event', {
            message: 'Timer started - test broadcast',
            timerId: updatedTimer.id,
            roomId: timer.roomId,
            timestamp: new Date().toISOString()
          });
          
          // Get room stats after broadcasting
          const roomStatsAfter = socketService.getRoomStats(timer.roomId);
          logger.info(`Room ${timer.roomId} stats after broadcast:`, roomStatsAfter);
          
          logger.info(`Timer ${id} started and broadcasted to room ${timer.roomId}`);
        } else {
          logger.error('Socket service not available for timer broadcast - this is a critical issue!');
          logger.error('Global socket service:', (global as any).socketService);
        }
      } catch (socketError) {
        logger.error('Error broadcasting timer start:', socketError);
        logger.error('Socket error details:', socketError.message, socketError.stack);
      }
      
      logger.info(`Timer ${id} started by user ${userId} in room ${timer.roomId}`);
      
      const response: ApiResponse = {
        success: true,
        data: updatedTimer,
        message: 'Timer started successfully'
      };
      res.json(response);
    } catch (error) {
      logger.error('Error starting timer:', error);
      const response: ApiResponse = {
        success: false,
        message: 'Failed to start timer'
      };
      res.status(500).json(response);
    }
  }

  // POST /api/timers/:id/pause
  async pauseTimer(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const userId = req.user?.id;

      const timer = await timerService.findById(id);
      if (!timer) {
        const response: ApiResponse = {
          success: false,
          message: 'Timer not found'
        };
        res.status(404).json(response);
        return;
      }
      
      // If authenticated, validate room ownership
      if (userId) {
        const room = await roomService.findById(timer.roomId);
        if (!room || room.ownerId !== userId) {
          const response: ApiResponse = {
            success: false,
            message: 'Unauthorized'
          };
          res.status(403).json(response);
          return;
        }
      }
      
      const updatedTimer = await timerService.updateTimerState(id, 'pause');
      
      // Broadcast to all room members via Socket.IO
      try {
        const socketService = (global as any).socketService;
        logger.info(`Attempting to broadcast timer pause for room ${timer.roomId}`);
        logger.info(`Socket service available: ${!!socketService}`);
        
        if (socketService) {
          const broadcastData = {
            timerId: updatedTimer.id,
            roomId: timer.roomId,
            isActive: updatedTimer.isActive,
            isPaused: !updatedTimer.isActive,
            endTimestamp: updatedTimer.endTimestamp,
            remainingTime: Math.max(0, Math.floor((new Date(updatedTimer.endTimestamp).getTime() - new Date().getTime()) / 1000))
          };
          
          logger.info(`Broadcasting timer-paused with data:`, broadcastData);
          socketService.emitToRoom(timer.roomId, 'timer-paused', broadcastData);
          
          // Also emit a general timer update
          logger.info(`Broadcasting timer-update with timer:`, updatedTimer);
          socketService.emitToRoom(timer.roomId, 'timer-update', updatedTimer);
          
          // Send a test event to verify connectivity
          socketService.emitToRoom(timer.roomId, 'test-event', {
            message: 'Timer paused - test broadcast',
            timerId: updatedTimer.id,
            roomId: timer.roomId,
            timestamp: new Date().toISOString()
          });
          
          logger.info(`Timer ${id} paused and broadcasted to room ${timer.roomId}`);
        } else {
          logger.error('Socket service not available for timer broadcast - this is a critical issue!');
          logger.error('Global socket service:', (global as any).socketService);
        }
      } catch (socketError) {
        logger.error('Error broadcasting timer pause:', socketError);
        logger.error('Socket error details:', socketError.message, socketError.stack);
      }
      
      logger.info(`Timer ${id} paused by user ${userId}`);
      
      const response: ApiResponse = {
        success: true,
        data: updatedTimer,
        message: 'Timer paused successfully'
      };
      res.json(response);
    } catch (error) {
      logger.error('Error pausing timer:', error);
      const response: ApiResponse = {
        success: false,
        message: 'Failed to pause timer'
      };
      res.status(500).json(response);
    }
  }

  // POST /api/timers/:id/reset
  async resetTimer(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const userId = req.user?.id;

      const timer = await timerService.findById(id);
      if (!timer) {
        const response: ApiResponse = {
          success: false,
          message: 'Timer not found'
        };
        res.status(404).json(response);
        return;
      }
      
      // If authenticated, validate room ownership
      if (userId) {
        const room = await roomService.findById(timer.roomId);
        if (!room || room.ownerId !== userId) {
          const response: ApiResponse = {
            success: false,
            message: 'Unauthorized'
          };
          res.status(403).json(response);
          return;
        }
      }
      
      const updatedTimer = await timerService.updateTimerState(id, 'reset');
      
      // Broadcast to all room members via Socket.IO
      try {
        const socketService = (global as any).socketService;
        logger.info(`Attempting to broadcast timer reset for room ${timer.roomId}`);
        logger.info(`Socket service available: ${!!socketService}`);
        
        if (socketService) {
          const broadcastData = {
            timerId: updatedTimer.id,
            roomId: timer.roomId,
            isActive: updatedTimer.isActive,
            isPaused: false,
            endTimestamp: updatedTimer.endTimestamp,
            remainingTime: 0
          };
          
          logger.info(`Broadcasting timer-stopped with data:`, broadcastData);
          socketService.emitToRoom(timer.roomId, 'timer-stopped', broadcastData);
          
          // Also emit a general timer update
          logger.info(`Broadcasting timer-update with timer:`, updatedTimer);
          socketService.emitToRoom(timer.roomId, 'timer-update', updatedTimer);
          
          // Send a test event to verify connectivity
          socketService.emitToRoom(timer.roomId, 'test-event', {
            message: 'Timer stopped - test broadcast',
            timerId: updatedTimer.id,
            roomId: timer.roomId,
            timestamp: new Date().toISOString()
          });
          
          logger.info(`Timer ${id} stopped and broadcasted to room ${timer.roomId}`);
        } else {
          logger.error('Socket service not available for timer broadcast - this is a critical issue!');
          logger.error('Global socket service:', (global as any).socketService);
        }
      } catch (socketError) {
        logger.error('Error broadcasting timer stop:', socketError);
        logger.error('Socket error details:', socketError.message, socketError.stack);
      }
      
      logger.info(`Timer ${id} reset by user ${userId}`);
      
      const response: ApiResponse = {
        success: true,
        data: updatedTimer,
        message: 'Timer reset successfully'
      };
      res.json(response);
    } catch (error) {
      logger.error('Error resetting timer:', error);
      const response: ApiResponse = {
        success: false,
        message: 'Failed to reset timer'
      };
      res.status(500).json(response);
    }
  }

  // POST /api/rooms/:roomId/timers - Create new timer
  async createTimer(req: Request, res: Response): Promise<void> {
    try {
      const { roomId } = req.params;
      const userId = req.user?.id;
      const data = createTimerSchema.parse(req.body);
      
      // If authenticated, validate room ownership
      if (userId) {
        const room = await roomService.findById(roomId);
        if (!room || room.ownerId !== userId) {
          const response: ApiResponse = {
            success: false,
            message: 'Unauthorized'
          };
          res.status(403).json(response);
          return;
        }
      } else {
        // For unauthenticated requests, just verify room exists
        const room = await roomService.findById(roomId);
        if (!room) {
          const response: ApiResponse = {
            success: false,
            message: 'Room not found'
          };
          res.status(404).json(response);
          return;
        }
      }
      
      const newTimer = await timerService.create({
        roomId,
        ...data
      } as any);
      
      // Broadcast new timer to all room members
      const socketService = (global as any).socketService;
      if (socketService) {
        socketService.emitToRoom(roomId, 'timer-created', newTimer);
      }
      
      logger.info(`New timer created in room ${roomId} by user ${userId}`);
      
      const response: ApiResponse = {
        success: true,
        data: newTimer,
        message: 'Timer created successfully'
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
      
      logger.error('Error creating timer:', error);
      const response: ApiResponse = {
        success: false,
        message: 'Failed to create timer'
      };
      res.status(500).json(response);
    }
  }

  // PUT /api/timers/:id - Update timer
  async updateTimer(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const userId = req.user?.id;
      const data = updateTimerSchema.parse(req.body);
      
      const timer = await timerService.findById(id);
      if (!timer) {
        const response: ApiResponse = {
          success: false,
          message: 'Timer not found'
        };
        res.status(404).json(response);
        return;
      }
      
      // If authenticated, validate room ownership
      if (userId) {
        const room = await roomService.findById(timer.roomId);
        if (!room || room.ownerId !== userId) {
          const response: ApiResponse = {
            success: false,
            message: 'Unauthorized'
          };
          res.status(403).json(response);
          return;
        }
      }
      
      const updatedTimer = await timerService.update(id, data, timer.roomId);
      
      if (!updatedTimer) {
        const response: ApiResponse = {
          success: false,
          message: 'Failed to update timer'
        };
        res.status(400).json(response);
        return;
      }
      
      // Broadcast update
      const socketService = (global as any).socketService;
      if (socketService) {
        socketService.emitToRoom(timer.roomId, 'timer-update', updatedTimer);
      }
      
      logger.info(`Timer ${id} updated by user ${userId}`);
      
      const response: ApiResponse = {
        success: true,
        data: updatedTimer,
        message: 'Timer updated successfully'
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
      
      logger.error('Error updating timer:', error);
      const response: ApiResponse = {
        success: false,
        message: 'Failed to update timer'
      };
      res.status(500).json(response);
    }
  }

  // DELETE /api/timers/:id
  async deleteTimer(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const userId = req.user?.id;

      const timer = await timerService.findById(id);
      if (!timer) {
        const response: ApiResponse = {
          success: false,
          message: 'Timer not found'
        };
        res.status(404).json(response);
        return;
      }
      
      // If authenticated, validate room ownership
      if (userId) {
        const room = await roomService.findById(timer.roomId);
        if (!room || room.ownerId !== userId) {
          const response: ApiResponse = {
            success: false,
            message: 'Unauthorized'
          };
          res.status(403).json(response);
          return;
        }
      }
      
      const deleted = await timerService.delete(id, timer.roomId);
      
      if (!deleted) {
        const response: ApiResponse = {
          success: false,
          message: 'Failed to delete timer'
        };
        res.status(400).json(response);
        return;
      }
      
      // Broadcast deletion to all room members
      const socketService = (global as any).socketService;
      if (socketService) {
        socketService.emitToRoom(timer.roomId, 'timer-deleted', { timerId: id });
      }
      
      logger.info(`Timer ${id} deleted by user ${userId}`);
      
      const response: ApiResponse = {
        success: true,
        message: 'Timer deleted successfully'
      };
      res.json(response);
    } catch (error) {
      logger.error('Error deleting timer:', error);
      const response: ApiResponse = {
        success: false,
        message: 'Failed to delete timer'
      };
      res.status(500).json(response);
    }
  }

  // GET /api/rooms/:roomId/timers - Get all timers (for fallback sync)
  async getTimers(req: Request, res: Response): Promise<void> {
    try {
      const { roomId } = req.params;
      const shareToken = req.query.shareToken as string;
      const userId = req.user?.id;
      
      let room;
      
      // Allow access via shareToken OR admin ownership
      if (shareToken) {
        room = await roomService.findByShareTokenWithTimers(shareToken);
      } else if (userId) {
        room = await roomService.findByIdWithTimers(roomId);
        if (room && room.ownerId !== userId) {
          room = null; // Not authorized
        }
      }
      
      if (!room) {
        const response: ApiResponse = {
          success: false,
          message: 'Room not found or unauthorized'
        };
        res.status(404).json(response);
        return;
      }
      
      const response: ApiResponse = {
        success: true,
        data: {
          room,
          isAdmin: userId === room.ownerId
        }
      };
      res.json(response);
    } catch (error) {
      logger.error('Error fetching timers:', error);
      const response: ApiResponse = {
        success: false,
        message: 'Failed to fetch timers'
      };
      res.status(500).json(response);
    }
  }

  // Get active timers for a user
  async getActiveTimers(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        const response: ApiResponse = {
          success: false,
          message: 'Authentication required'
        };
        res.status(401).json(response);
        return;
      }

      const timers = await timerService.getActiveTimers(req.user.id);
      
      const response: ApiResponse = {
        success: true,
        data: { timers }
      };
      res.json(response);
    } catch (error) {
      logger.error('Error getting active timers:', error);
      const response: ApiResponse = {
        success: false,
        message: 'Internal server error'
      };
      res.status(500).json(response);
    }
  }
}
