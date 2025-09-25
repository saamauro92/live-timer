import { createClient, RedisClientType } from 'redis';
import { logger } from '../utils/logger';

const createRedisClient = (): RedisClientType => {
  const client = createClient({
    url: process.env.REDIS_URL || 'redis://localhost:6379',
    socket: {
      connectTimeout: 10000,
    }
  });

  client.on('error', (err) => {
    logger.error('Redis client error:', err);
  });

  client.on('connect', () => {
    logger.info('Redis client connected');
  });

  client.on('ready', () => {
    logger.info('Redis client ready');
  });

  client.on('end', () => {
    logger.info('Redis client disconnected');
  });

  return client as RedisClientType;
};

let redisClientInstance: RedisClientType;

export const getRedisClient = (): RedisClientType => {
  if (!redisClientInstance) {
    redisClientInstance = createRedisClient();
  }
  return redisClientInstance;
};

export const redisClient = getRedisClient();

// Graceful shutdown
process.on('beforeExit', async () => {
  if (redisClient && redisClient.isOpen) {
    logger.info('Disconnecting from Redis...');
    await redisClient.quit();
  }
});
