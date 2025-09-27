import { prisma } from '../config/database';
import { generateId, validateDuration } from '../utils/helpers';
import { logger } from '../utils/logger';
import { CreateTimerData, Timer } from '../types';

export class TimerService {
  async create(data: CreateTimerData): Promise<Timer> {
    try {
      if (!validateDuration(data.duration)) {
        throw new Error('Invalid duration: must be between 1 second and 24 hours');
      }

      // Get the next order number for this room
      const lastTimer = await prisma.timer.findFirst({
        where: { roomId: data.roomId },
        orderBy: { order: 'desc' }
      });
      const nextOrder = (lastTimer?.order || 0) + 1;

      const now = new Date();
      const timer = await prisma.timer.create({
        data: {
          id: generateId(),
          roomId: data.roomId,
          title: data.title,
          description: data.description,
          startTimestamp: now,
          endTimestamp: new Date(now.getTime() + data.duration),
          duration: data.duration,
          isActive: false,
          order: nextOrder
        }
      });

      logger.info(`Timer created: ${timer.id} in room ${data.roomId} with order ${nextOrder}`);
      return timer;
    } catch (error) {
      logger.error('Error creating timer:', error);
      throw new Error('Failed to create timer');
    }
  }

  async findById(id: string): Promise<Timer | null> {
    try {
      return await prisma.timer.findUnique({
        where: { id }
      });
    } catch (error) {
      logger.error('Error finding timer by ID:', error);
      throw new Error('Failed to find timer');
    }
  }

  async findByRoomId(roomId: string): Promise<Timer[]> {
    try {
      return await prisma.timer.findMany({
        where: { roomId },
        orderBy: [{ order: 'asc' }, { createdAt: 'asc' }]
      });
    } catch (error) {
      logger.error('Error finding timers by room ID:', error);
      throw new Error('Failed to find timers');
    }
  }

  async updateTimerState(timerId: string, action: 'start' | 'pause' | 'reset'): Promise<Timer | null> {
    try {
      const timer = await this.findById(timerId);
      if (!timer) {
        return null;
      }

      const now = new Date();
      let updateData: Partial<Timer> = {};

      switch (action) {
        case 'start':
          updateData = {
            isActive: true,
            startTimestamp: now,
            endTimestamp: new Date(now.getTime() + timer.duration)
          };
          break;
          
        case 'pause':
          updateData = {
            isActive: false,
            duration: Math.max(0, timer.endTimestamp.getTime() - now.getTime())
          };
          break;
          
        case 'reset':
          updateData = {
            isActive: false,
            startTimestamp: now,
            endTimestamp: new Date(now.getTime() + timer.duration),
            duration: timer.duration
          };
          break;
      }

      const updatedTimer = await prisma.timer.update({
        where: { id: timerId },
        data: updateData
      });

      logger.info(`Timer ${timerId} ${action} - room ${timer.roomId}`);
      return updatedTimer;
    } catch (error) {
      logger.error('Error updating timer state:', error);
      throw new Error('Failed to update timer state');
    }
  }

  async update(timerId: string, data: Partial<CreateTimerData>, roomId: string): Promise<Timer | null> {
    try {
      // Verify timer belongs to room
      const timer = await this.findById(timerId);
      if (!timer || timer.roomId !== roomId) {
        return null;
      }

      const updateData: Partial<Timer> = {};
      
      if (data.title) updateData.title = data.title;
      if (data.description !== undefined) updateData.description = data.description;
      
      if (data.duration && validateDuration(data.duration)) {
        updateData.duration = data.duration;
        if (!timer.isActive) {
          updateData.endTimestamp = new Date(timer.startTimestamp.getTime() + data.duration);
        }
      }

      return await prisma.timer.update({
        where: { id: timerId },
        data: updateData
      });
    } catch (error) {
      logger.error('Error updating timer:', error);
      throw new Error('Failed to update timer');
    }
  }

  async delete(timerId: string, roomId: string): Promise<boolean> {
    try {
      // Verify timer belongs to room
      const timer = await this.findById(timerId);
      if (!timer || timer.roomId !== roomId) {
        return false;
      }

      await prisma.timer.delete({
        where: { id: timerId }
      });

      logger.info(`Timer deleted: ${timerId} from room ${roomId}`);
      return true;
    } catch (error) {
      logger.error('Error deleting timer:', error);
      throw new Error('Failed to delete timer');
    }
  }

  async getActiveTimers(): Promise<Timer[]> {
    try {
      return await prisma.timer.findMany({
        where: { isActive: true },
        orderBy: { endTimestamp: 'asc' }
      });
    } catch (error) {
      logger.error('Error getting active timers:', error);
      throw new Error('Failed to get active timers');
    }
  }

  async getExpiredTimers(): Promise<Timer[]> {
    try {
      const now = new Date();
      return await prisma.timer.findMany({
        where: {
          isActive: true,
          endTimestamp: {
            lte: now
          }
        }
      });
    } catch (error) {
      logger.error('Error getting expired timers:', error);
      throw new Error('Failed to get expired timers');
    }
  }

  async markAsExpired(timerId: string): Promise<Timer | null> {
    try {
      return await prisma.timer.update({
        where: { id: timerId },
        data: { isActive: false }
      });
    } catch (error) {
      logger.error('Error marking timer as expired:', error);
      throw new Error('Failed to mark timer as expired');
    }
  }

  async getActiveTimers(userId: string): Promise<Timer[]> {
    try {
      // Get all rooms owned by the user
      const userRooms = await prisma.room.findMany({
        where: { ownerId: userId },
        select: { id: true }
      });

      const roomIds = userRooms.map(room => room.id);

      // Get active timers from user's rooms
      return await prisma.timer.findMany({
        where: {
          roomId: { in: roomIds },
          isActive: true
        },
        include: {
          room: {
            select: {
              id: true,
              name: true
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      });
    } catch (error) {
      logger.error('Error getting active timers:', error);
      throw new Error('Failed to get active timers');
    }
  }

  async reorderTimers(roomId: string, timerIds: string[]): Promise<boolean> {
    try {
      // Verify all timers belong to the room
      const timers = await prisma.timer.findMany({
        where: { 
          id: { in: timerIds },
          roomId: roomId
        }
      });

      if (timers.length !== timerIds.length) {
        throw new Error('Some timers do not belong to this room');
      }

      // Update order for each timer
      const updatePromises = timerIds.map((timerId, index) => 
        prisma.timer.update({
          where: { id: timerId },
          data: { order: index + 1 }
        })
      );

      await Promise.all(updatePromises);

      logger.info(`Reordered ${timerIds.length} timers in room ${roomId}`);
      return true;
    } catch (error) {
      logger.error('Error reordering timers:', error);
      throw new Error('Failed to reorder timers');
    }
  }

  async startAllTimers(roomId: string): Promise<Timer[]> {
    try {
      // Get all inactive timers in the room, ordered by order field
      const timers = await prisma.timer.findMany({
        where: { 
          roomId: roomId,
          isActive: false
        },
        orderBy: { order: 'asc' }
      });

      const now = new Date();
      const updatePromises = timers.map(timer => 
        prisma.timer.update({
          where: { id: timer.id },
          data: {
            isActive: true,
            startTimestamp: now,
            endTimestamp: new Date(now.getTime() + timer.duration)
          }
        })
      );

      const updatedTimers = await Promise.all(updatePromises);

      logger.info(`Started ${updatedTimers.length} timers in room ${roomId}`);
      return updatedTimers;
    } catch (error) {
      logger.error('Error starting all timers:', error);
      throw new Error('Failed to start all timers');
    }
  }

  async pauseAllTimers(roomId: string): Promise<Timer[]> {
    try {
      // Get all active timers in the room
      const timers = await prisma.timer.findMany({
        where: { 
          roomId: roomId,
          isActive: true
        }
      });

      const now = new Date();
      const updatePromises = timers.map(timer => 
        prisma.timer.update({
          where: { id: timer.id },
          data: {
            isActive: false,
            duration: Math.max(0, timer.endTimestamp.getTime() - now.getTime())
          }
        })
      );

      const updatedTimers = await Promise.all(updatePromises);

      logger.info(`Paused ${updatedTimers.length} timers in room ${roomId}`);
      return updatedTimers;
    } catch (error) {
      logger.error('Error pausing all timers:', error);
      throw new Error('Failed to pause all timers');
    }
  }
}

export const timerService = new TimerService();
