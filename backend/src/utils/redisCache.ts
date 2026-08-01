import { redisClient } from '../config/redis';
import { logger } from './logger';

/**
 * Redis Cache Utility for API Caching and Session Management
 */
export class RedisCache {
  /**
   * Cache User Session Data in Redis
   * @param token JWT Access Token or Refresh Token
   * @param userPayload User Object
   * @param ttlSeconds Time to Live in seconds (default 15 minutes)
   */
  public static async cacheSession(token: string, userPayload: any, ttlSeconds: number = 900): Promise<void> {
    try {
      const key = `session:${token}`;
      await redisClient.setex(key, ttlSeconds, JSON.stringify(userPayload));
    } catch (error) {
      logger.error('Failed to cache user session in Redis:', error);
    }
  }

  /**
   * Retrieve Cached User Session from Redis
   */
  public static async getCachedSession(token: string): Promise<any | null> {
    try {
      const key = `session:${token}`;
      const data = await redisClient.get(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      logger.error('Failed to get cached session from Redis:', error);
      return null;
    }
  }

  /**
   * Invalidate User Session from Redis on Logout
   */
  public static async invalidateSession(token: string): Promise<void> {
    try {
      const key = `session:${token}`;
      await redisClient.del(key);
    } catch (error) {
      logger.error('Failed to invalidate Redis session:', error);
    }
  }

  /**
   * Cache Frequently Accessed API Response
   */
  public static async setApiCache(key: string, data: any, ttlSeconds: number = 60): Promise<void> {
    try {
      const redisKey = `api_cache:${key}`;
      await redisClient.setex(redisKey, ttlSeconds, JSON.stringify(data));
    } catch (error) {
      logger.error(`Failed to set API cache for key ${key}:`, error);
    }
  }

  /**
   * Fetch Cached API Response
   */
  public static async getApiCache(key: string): Promise<any | null> {
    try {
      const redisKey = `api_cache:${key}`;
      const data = await redisClient.get(redisKey);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      logger.error(`Failed to get API cache for key ${key}:`, error);
      return null;
    }
  }

  /**
   * Invalidate API Cache Pattern
   */
  public static async invalidateApiCache(keyPattern: string): Promise<void> {
    try {
      const keys = await redisClient.keys(`api_cache:${keyPattern}*`);
      if (keys.length > 0) {
        await redisClient.del(...keys);
      }
    } catch (error) {
      logger.error(`Failed to invalidate API cache pattern ${keyPattern}:`, error);
    }
  }
}
