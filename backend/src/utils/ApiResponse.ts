import { Response } from 'express';

export interface ApiResponsePayload<T = any> {
  success: boolean;
  message: string;
  data?: T;
  meta?: Record<string, any>;
  errors?: any;
}

export class ApiResponse {
  static success<T>(
    res: Response,
    message: string = 'Operation successful',
    data?: T,
    meta?: Record<string, any>,
    statusCode: number = 200
  ): Response {
    const payload: ApiResponsePayload<T> = {
      success: true,
      message,
      data,
      meta,
    };
    return res.status(statusCode).json(payload);
  }

  static created<T>(
    res: Response,
    message: string = 'Resource created successfully',
    data?: T
  ): Response {
    return this.success(res, message, data, undefined, 201);
  }

  static error(
    res: Response,
    message: string = 'An error occurred',
    statusCode: number = 500,
    errors?: any
  ): Response {
    const payload: ApiResponsePayload = {
      success: false,
      message,
      errors,
    };
    return res.status(statusCode).json(payload);
  }
}
