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
          isActive: false
        }
      });

      logger.info(`Timer created: ${timer.id} in room ${data.roomId}`);
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
        orderBy: { createdAt: 'asc' }
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
}

export const timerService = new TimerService();
