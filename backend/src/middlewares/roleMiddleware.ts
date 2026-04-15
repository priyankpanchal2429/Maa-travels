import { Response, NextFunction } from 'express';
import { AuthRequest } from './authMiddleware';
import { sendError } from '../utils/apiResponse';

/**
 * Role-based access control middleware.
 * Must be used AFTER authMiddleware.
 *
 * Usage: router.get('/admin/users', authMiddleware, requireRole('admin'), handler)
 */
export const requireRole =
  (...allowedRoles: string[]) =>
  (req: AuthRequest, res: Response, next: NextFunction): void => {
    const role = req.user?.role;

    if (!role || !allowedRoles.includes(role)) {
      sendError(res, 'Forbidden — insufficient permissions', 403);
      return;
    }

    next();
  };
