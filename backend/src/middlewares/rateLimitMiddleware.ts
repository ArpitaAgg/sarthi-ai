import { Request, Response, NextFunction } from 'express';
import { redisClient } from '../config/redis';
import { TooManyRequestsError } from '../utils/AppError';
import { logger } from '../utils/logger';

export const rateLimiter = (options: { windowMs: number; max: number; message?: string }) => {
  return async (req: Request, _res: Response, next: NextFunction) => {
    try {
      const ip = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || '127.0.0.1';
      const key = `ratelimit:${req.baseUrl || ''}${req.path}:${ip}`;
      const windowSeconds = Math.max(1, Math.ceil(options.windowMs / 1000));

      const current = await redisClient.incr(key);

      if (current === 1) {
        await redisClient.expire(key, windowSeconds);
      }

      if (current > options.max) {
        logger.warn(`⚠️ Rate limit exceeded for IP ${ip} on path ${req.path} (${current}/${options.max})`);
        return next(new TooManyRequestsError(options.message || 'Too many requests, please try again later'));
      }

      next();
    } catch (err) {
      // In case Redis connection has temporary issue, fail open to avoid breaking requests
      next();
    }
  };
};
