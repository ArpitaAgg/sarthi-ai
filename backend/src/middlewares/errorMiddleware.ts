import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/AppError';
import { ApiResponse } from '../utils/ApiResponse';
import { logger } from '../utils/logger';

export const errorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  if (err instanceof AppError) {
    logger.warn(`Operational Error: ${err.message} (${err.statusCode})`);
    return ApiResponse.error(res, err.message, err.statusCode, err.errors);
  }

  logger.error('Unhandled System Error:', err);

  const message = process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message;
  return ApiResponse.error(res, message, 500);
};
