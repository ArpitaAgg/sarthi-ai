import Redis from 'ioredis';
import { logger } from '../utils/logger';

let rawHost = process.env.REDIS_HOST || 'localhost';
// Clean hostname: strip http/https protocol and trailing slashes
const redisHost = rawHost.replace(/^https?:\/\//, '').replace(/\/$/, '');

const redisPort = parseInt(process.env.REDIS_PORT || '6379', 10);
const redisPassword = process.env.REDIS_PASSWORD || undefined;

// Upstash or cloud TLS detection
const isTls = redisHost.includes('upstash.io') || process.env.REDIS_TLS === 'true';

export const redisConfig = {
  host: redisHost,
  port: redisPort,
  password: redisPassword,
  maxRetriesPerRequest: null, // Required for BullMQ
  enableReadyCheck: false,
  ...(isTls ? { tls: { rejectUnauthorized: false } } : {}),
};

export const redisClient = new Redis({
  ...redisConfig,
  lazyConnect: true,
});

redisClient.on('connect', () => logger.info('✅ Redis client connected successfully'));
redisClient.on('error', (err) => logger.error('❌ Redis client error:', err));
