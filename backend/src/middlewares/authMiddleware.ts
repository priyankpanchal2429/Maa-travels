import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken, TokenPayload } from '../utils/tokenUtils';
import { sendError } from '../utils/apiResponse';

/** Extends Express Request with authenticated user payload */
export interface AuthRequest extends Request {
  user?: TokenPayload;
}

/**
 * Verifies the JWT Bearer token from the Authorization header.
 * Attaches decoded payload to req.user on success.
 */
export const authMiddleware = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    sendError(res, 'Unauthorized — no token provided', 401);
    return;
  }

  const token = authHeader.split(' ')[1];

  try {
    req.user = verifyAccessToken(token);
    next();
  } catch {
    sendError(res, 'Unauthorized — invalid or expired token', 401);
  }
};
