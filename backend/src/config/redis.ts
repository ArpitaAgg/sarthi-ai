import Redis from 'ioredis';
import { logger } from '../utils/logger';

const redisHost = process.env.REDIS_HOST || 'localhost';
const redisPort = parseInt(process.env.REDIS_PORT || '6379', 10);
const redisPassword = process.env.REDIS_PASSWORD || undefined;

export const redisConfig = {
  host: redisHost,
  port: redisPort,
  password: redisPassword,
  maxRetriesPerRequest: null, // Required for BullMQ
  enableReadyCheck: false,
};

export const redisClient = new Redis({
  ...redisConfig,
  lazyConnect: true,
});

redisClient.on('connect', () => logger.info('✅ Redis client connected successfully'));
redisClient.on('error', (err) => logger.error('❌ Redis client error:', err));
