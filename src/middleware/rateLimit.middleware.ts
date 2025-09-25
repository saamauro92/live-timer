import rateLimit from 'express-rate-limit';
import { RedisStore } from 'rate-limit-redis';
import { redisClient } from '../config/redis';
import { logger } from '../utils/logger';

// Create a compatible Redis client for rate limiting
const createRedisStore = () => {
  // Temporarily disable Redis store to avoid connection issues
  return undefined;
};

// Global rate limiting
export const globalRateLimit = rateLimit({
  store: createRedisStore(),
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '60000'), // 1 minute
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '1000'), // 1000 requests per minute for development
  message: {
    success: false,
    message: 'Too many requests, please try again later'
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    logger.warn(`Rate limit exceeded for IP: ${req.ip}`);
    res.status(429).json({
      success: false,
      message: 'Too many requests, please try again later'
    });
  }
});

// Room creation rate limiting
export const createRoomLimit = rateLimit({
  store: createRedisStore(),
  windowMs: 60000, // 1 minute
  max: 5, // 5 rooms per minute per IP
  message: {
    success: false,
    message: 'Too many rooms created, please try again later'
  },
  handler: (req, res) => {
    logger.warn(`Room creation rate limit exceeded for IP: ${req.ip}`);
    res.status(429).json({
      success: false,
      message: 'Too many rooms created, please try again later'
    });
  }
});

// Timer control rate limiting
export const timerControlLimit = rateLimit({
  store: createRedisStore(),
  windowMs: 10000, // 10 seconds
  max: 20, // 20 timer actions per 10 seconds per IP
  message: {
    success: false,
    message: 'Too many timer actions, please slow down'
  },
  handler: (req, res) => {
    logger.warn(`Timer control rate limit exceeded for IP: ${req.ip}`);
    res.status(429).json({
      success: false,
      message: 'Too many timer actions, please slow down'
    });
  }
});

// Socket connection rate limiting
export const socketConnectionLimit = rateLimit({
  store: createRedisStore(),
  windowMs: 60000, // 1 minute
  max: 10, // 10 socket connections per minute per IP
  message: {
    success: false,
    message: 'Too many socket connections, please try again later'
  },
  handler: (req, res) => {
    logger.warn(`Socket connection rate limit exceeded for IP: ${req.ip}`);
    res.status(429).json({
      success: false,
      message: 'Too many socket connections, please try again later'
    });
  }
});

// API key rate limiting (for external integrations)
export const apiKeyLimit = rateLimit({
  store: createRedisStore(),
  windowMs: 60000, // 1 minute
  max: 1000, // 1000 requests per minute per API key
  keyGenerator: (req) => {
    const apiKey = req.headers['x-api-key'] as string;
    return apiKey || req.ip;
  },
  message: {
    success: false,
    message: 'API rate limit exceeded'
  },
  handler: (req, res) => {
    const apiKey = req.headers['x-api-key'] as string;
    logger.warn(`API rate limit exceeded for key: ${apiKey || req.ip}`);
    res.status(429).json({
      success: false,
      message: 'API rate limit exceeded'
    });
  }
});
