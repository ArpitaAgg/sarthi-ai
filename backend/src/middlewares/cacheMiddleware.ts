import { Request, Response, NextFunction } from 'express';
import { RedisCache } from '../utils/redisCache';

/**
 * Express Middleware for Caching Frequently Accessed API Endpoints in Redis
 * @param ttlSeconds Cache duration in seconds (default 30 seconds)
 */
export const redisCacheMiddleware = (ttlSeconds: number = 30) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    // Only cache GET requests
    if (req.method !== 'GET') {
      return next();
    }

    const userId = (req as any).user?.id || 'anonymous';
    const cacheKey = `${req.baseUrl}${req.path}:${userId}:${JSON.stringify(req.query)}`;

    try {
      const cachedResponse = await RedisCache.getApiCache(cacheKey);
      if (cachedResponse) {
        return res.status(200).json(cachedResponse);
      }

      // Monkey-patch res.json to capture response payload and cache it in Redis
      const originalJson = res.json.bind(res);
      res.json = (body: any) => {
        if (res.statusCode === 200) {
          RedisCache.setApiCache(cacheKey, body, ttlSeconds);
        }
        return originalJson(body);
      };

      next();
    } catch (error) {
      next();
    }
  };
};
