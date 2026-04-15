import { Request, Response, NextFunction } from 'express';
import { env } from '../config/env';

/** Typed application error with HTTP status */
export class AppError extends Error {
  constructor(
    public message: string,
    public statusCode: number = 500
  ) {
    super(message);
    this.name = 'AppError';
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Global Express error handler.
 * All thrown AppErrors and unexpected errors land here.
 */
export const errorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction
): void => {
  const isDev = env.NODE_ENV === 'development';

  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      success: false,
      message: err.message,
      timestamp: new Date().toISOString(),
      ...(isDev && { stack: err.stack }),
    });
    return;
  }

  // Mongoose duplicate key error
  if ((err as NodeJS.ErrnoException).name === 'MongoServerError' && (err as any).code === 11000) {
    res.status(409).json({
      success: false,
      message: 'A record with this value already exists.',
      timestamp: new Date().toISOString(),
    });
    return;
  }

  // Unexpected errors
  console.error('Unhandled error:', err);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    timestamp: new Date().toISOString(),
    ...(isDev && { stack: err.stack }),
  });
};
