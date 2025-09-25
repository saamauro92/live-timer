import { z } from 'zod';

// Room schemas
export const createRoomSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().optional(),
  ownerId: z.string().uuid()
});

export const updateRoomSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().optional()
});

export const getRoomByShareTokenSchema = z.object({
  shareToken: z.string().uuid()
});

// Timer schemas
export const createTimerSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().optional(),
  duration: z.number().min(1000).max(86400000) // 1 second to 24 hours in ms
});

export const updateTimerSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z.string().optional(),
  duration: z.number().min(1000).max(86400000).optional()
});

export const timerActionSchema = z.object({
  action: z.enum(['start', 'pause', 'reset'])
});

// Socket schemas
export const joinRoomSchema = z.object({
  shareToken: z.string().uuid(),
  userId: z.string().optional()
});

export const createTimerSocketSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().optional(),
  duration: z.number().min(1000).max(86400000)
});

export const deleteTimerSocketSchema = z.object({
  timerId: z.string().uuid()
});

// Query schemas
export const getTimersQuerySchema = z.object({
  shareToken: z.string().uuid().optional()
});

// JWT payload schema
export const jwtPayloadSchema = z.object({
  userId: z.string().uuid(),
  email: z.string().email().optional(),
  iat: z.number().optional(),
  exp: z.number().optional()
});
