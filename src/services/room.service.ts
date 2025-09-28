import { prisma } from '../config/database';
import { generateId, generateShareToken } from '../utils/helpers';
import { logger } from '../utils/logger';
import { CreateRoomData, Room } from '../types';

export class RoomService {
  async create(data: CreateRoomData): Promise<Room> {
    try {
      const room = await prisma.room.create({
        data: {
          id: generateId(),
          name: data.name,
          description: data.description,
          shareToken: generateShareToken(),
          ownerId: data.ownerId
        }
      });

      logger.info(`Room created: ${room.id} by ${data.ownerId}`);
      return room;
    } catch (error) {
      logger.error('Error creating room:', error);
      throw new Error('Failed to create room');
    }
  }

  async findById(id: string): Promise<Room | null> {
    try {
      return await prisma.room.findUnique({
        where: { id }
      });
    } catch (error) {
      logger.error('Error finding room by ID:', error);
      throw new Error('Failed to find room');
    }
  }

  async findByShareToken(shareToken: string): Promise<Room | null> {
    try {
      // Validate share token format before querying
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
      if (!uuidRegex.test(shareToken)) {
        logger.warn(`Invalid share token format: ${shareToken}`);
        return null;
      }

      return await prisma.room.findUnique({
        where: { shareToken }
      });
    } catch (error) {
      logger.error('Error finding room by share token:', error);
      throw new Error('Failed to find room');
    }
  }

  async findByIdWithTimers(id: string): Promise<Room | null> {
    try {
      return await prisma.room.findUnique({
        where: { id },
        include: {
          timers: {
            orderBy: { createdAt: 'asc' }
          }
        }
      });
    } catch (error) {
      logger.error('Error finding room with timers:', error);
      throw new Error('Failed to find room with timers');
    }
  }

  async findByShareTokenWithTimers(shareToken: string): Promise<Room | null> {
    try {
      logger.info(`Searching for room with shareToken: ${shareToken}`);
      
      // Validate share token format before querying
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
      if (!uuidRegex.test(shareToken)) {
        logger.warn(`Invalid share token format: ${shareToken}`);
        return null;
      }

      // First, let's test if we can find any room with this shareToken
      const testRoom = await prisma.room.findFirst({
        where: { shareToken },
        select: { id: true, shareToken: true }
      });
      
      logger.info(`Test query result: ${JSON.stringify(testRoom)}`);

      const room = await prisma.room.findUnique({
        where: { shareToken },
        include: {
          timers: {
            orderBy: { createdAt: 'asc' }
          }
        }
      });

      if (room) {
        logger.info(`Found room: ${room.id} with ${room.timers.length} timers`);
      } else {
        logger.warn(`No room found for shareToken: ${shareToken}`);
        
        // Let's also check if there are any rooms at all
        const allRooms = await prisma.room.findMany({
          select: { id: true, shareToken: true, name: true }
        });
        logger.info(`All rooms in database: ${JSON.stringify(allRooms)}`);
      }

      return room;
    } catch (error) {
      logger.error('Error finding room with timers by share token:', error);
      throw new Error('Failed to find room with timers');
    }
  }

  async update(id: string, data: Partial<CreateRoomData>, ownerId: string): Promise<Room | null> {
    try {
      // Verify ownership
      const room = await this.findById(id);
      if (!room || room.ownerId !== ownerId) {
        return null;
      }

      return await prisma.room.update({
        where: { id },
        data: {
          name: data.name,
          description: data.description,
          showTimerName: data.showTimerName
        }
      });
    } catch (error) {
      logger.error('Error updating room:', error);
      throw new Error('Failed to update room');
    }
  }

  async delete(id: string, ownerId: string): Promise<boolean> {
    try {
      // Verify ownership
      const room = await this.findById(id);
      if (!room || room.ownerId !== ownerId) {
        return false;
      }

      await prisma.room.delete({
        where: { id }
      });

      logger.info(`Room deleted: ${id} by ${ownerId}`);
      return true;
    } catch (error) {
      logger.error('Error deleting room:', error);
      throw new Error('Failed to delete room');
    }
  }

  async getRoomStats(id: string): Promise<{ totalTimers: number; activeTimers: number }> {
    try {
      const timers = await prisma.timer.findMany({
        where: { roomId: id },
        select: { isActive: true }
      });

      return {
        totalTimers: timers.length,
        activeTimers: timers.filter(t => t.isActive).length
      };
    } catch (error) {
      logger.error('Error getting room stats:', error);
      throw new Error('Failed to get room stats');
    }
  }

  async getAllRooms(userId: string): Promise<Room[]> {
    try {
      return await prisma.room.findMany({
        where: { ownerId: userId },
        orderBy: { updatedAt: 'desc' }
      });
    } catch (error) {
      logger.error('Error getting all rooms:', error);
      throw new Error('Failed to get all rooms');
    }
  }

  async getAllRoomsDebug(): Promise<Room[]> {
    try {
      const rooms = await prisma.room.findMany({
        select: {
          id: true,
          name: true,
          shareToken: true,
          ownerId: true,
          createdAt: true,
          updatedAt: true
        },
        orderBy: { updatedAt: 'desc' }
      });
      
      logger.info(`Debug: Found ${rooms.length} rooms in database`);
      rooms.forEach(room => {
        logger.info(`Debug: Room ${room.id} - shareToken: ${room.shareToken} - name: ${room.name}`);
      });
      
      return rooms;
    } catch (error) {
      logger.error('Error getting all rooms for debug:', error);
      throw new Error('Failed to get all rooms for debug');
    }
  }

  async getRecentRooms(userId: string): Promise<Room[]> {
    try {
      return await prisma.room.findMany({
        where: { ownerId: userId },
        orderBy: { updatedAt: 'desc' },
        take: 10
      });
    } catch (error) {
      logger.error('Error getting recent rooms:', error);
      throw new Error('Failed to get recent rooms');
    }
  }
}

export const roomService = new RoomService();
