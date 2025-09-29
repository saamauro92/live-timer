import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import { logger } from '../utils/logger';

const prisma = new PrismaClient();

// Enhanced user interface for Better Auth compatibility
interface AuthenticatedUser {
  id: string;
  email: string;
  name: string;
  role?: string;
  emailVerified: boolean;
  image?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Extend Request interface to include user
declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
    }
  }
}

// Enhanced authentication middleware that works with Better Auth tokens
export const authenticateToken = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      res.status(401).json({
        success: false,
        message: 'Access token required'
      });
      return;
    }

    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      logger.error('JWT_SECRET not configured');
      res.status(500).json({
        success: false,
        message: 'Server configuration error'
      });
      return;
    }

    // Verify JWT token
    const decoded = jwt.verify(token, jwtSecret) as any;
    
    // Fetch user from database to ensure they still exist and are not banned
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        emailVerified: true,
        image: true,
        createdAt: true,
        updatedAt: true,
        banned: true,
        banExpires: true
      }
    });

    if (!user) {
      logger.warn(`User not found for ID: ${decoded.id}`);
      res.status(401).json({
        success: false,
        message: 'User not found'
      });
      return;
    }

    // Check if user is banned
    if (user.banned) {
      const now = new Date();
      if (!user.banExpires || user.banExpires > now) {
        logger.warn(`Banned user attempted access: ${user.email} (${user.id})`);
        res.status(403).json({
          success: false,
          message: 'Account is banned'
        });
        return;
      }
    }

    // Check if email is verified (optional, depending on your requirements)
    if (!user.emailVerified) {
      logger.warn(`Unverified user attempted access: ${user.email} (${user.id})`);
      res.status(403).json({
        success: false,
        message: 'Email verification required'
      });
      return;
    }

    req.user = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role || undefined,
      emailVerified: user.emailVerified,
      image: user.image || undefined,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    };
    
    logger.info(`User authenticated: ${req.user.email} (${req.user.id})`);
    next();
  } catch (error) {
    logger.error('Token verification failed:', error);
    res.status(403).json({
      success: false,
      message: 'Invalid or expired token'
    });
  }
};

// Admin authentication middleware
export const authenticateAdmin = (req: Request, res: Response, next: NextFunction): void => {
  authenticateToken(req, res, (err) => {
    if (err) return;

    if (req.user?.role !== 'admin') {
      res.status(403).json({
        success: false,
        message: 'Admin access required'
      });
      return;
    }

    next();
  });
};

// Room owner authentication middleware
export const authenticateRoomOwner = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    // First authenticate the user
    await new Promise<void>((resolve, reject) => {
      authenticateToken(req, res, (err) => {
        if (err) reject(err);
        else resolve();
      });
    });

    const roomId = req.params.roomId || req.params.id;
    if (!roomId) {
      res.status(400).json({
        success: false,
        message: 'Room ID required'
      });
      return;
    }

    // Check if user owns the room
    const room = await prisma.room.findUnique({
      where: { id: roomId },
      select: { ownerId: true, name: true }
    });

    if (!room) {
      res.status(404).json({
        success: false,
        message: 'Room not found'
      });
      return;
    }

    if (room.ownerId !== req.user!.id) {
      res.status(403).json({
        success: false,
        message: 'Access denied: You are not the owner of this room'
      });
      return;
    }

    logger.info(`Room owner authenticated: ${req.user!.email} for room ${room.name}`);
    next();
  } catch (error) {
    logger.error('Room owner authentication failed:', error);
    res.status(500).json({
      success: false,
      message: 'Authentication failed'
    });
  }
};

// Optional authentication middleware (doesn't fail if no token)
export const optionalAuth = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      next(); // No token, continue without authentication
      return;
    }

    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      next(); // No secret configured, continue without authentication
      return;
    }

    const decoded = jwt.verify(token, jwtSecret) as any;
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
        createdAt: true,
        updatedAt: true
      }
    });

    if (user && !user.banned) {
      req.user = {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role || undefined,
        emailVerified: user.emailVerified,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      };
    }

    next();
  } catch (error) {
    // Token invalid, but continue without authentication
    next();
  }
};
