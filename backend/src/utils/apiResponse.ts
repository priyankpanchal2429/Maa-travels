import { Response } from 'express';

/** Standard API response shape */
interface ApiPayload<T> {
  res: Response;
  statusCode: number;
  success: boolean;
  message: string;
  data?: T;
}

const send = <T>({ res, statusCode, success, message, data }: ApiPayload<T>): void => {
  res.status(statusCode).json({
    success,
    message,
    ...(data !== undefined && { data }),
    timestamp: new Date().toISOString(),
  });
};

export const sendSuccess = <T>(
  res: Response,
  message: string,
  data?: T,
  statusCode = 200
): void => send({ res, statusCode, success: true, message, data });

export const sendError = (res: Response, message: string, statusCode = 500): void =>
  send({ res, statusCode, success: false, message });
