import type { Request, Response, NextFunction } from 'express';
import { ApiError } from '../utils/apiError.js';
import { logger } from '../utils/logger.js';
import { env } from '../config/env.js';

export const errorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({
      success: false,
      error: {
        code: err.code,
        message: err.message,
        details: err.details,
      },
    });
  }

  // Handle Mongoose duplicate key error
  if ((err as { code?: number }).code === 11000) {
    return res.status(409).json({
      success: false,
      error: {
        code: 'CONFLICT',
        message: 'Duplicate record already exists',
      },
    });
  }

  // Handle Mongoose ValidationError
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: err.message,
      },
    });
  }

  logger.error(err, 'Unhandled Server Error:');

  return res.status(500).json({
    success: false,
    error: {
      code: 'INTERNAL_SERVER_ERROR',
      message:
        env.NODE_ENV === 'production'
          ? 'An internal error occurred. Please try again later.'
          : err.message || 'Internal server error',
    },
  });
};
