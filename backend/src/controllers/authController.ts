import { Request, Response, NextFunction } from 'express';
import { AuthRequest } from '../middlewares/authMiddleware';
import { sendSuccess, sendError } from '../utils/apiResponse';
import { REFRESH_COOKIE, REFRESH_COOKIE_OPTIONS, CLEAR_COOKIE_OPTIONS } from '../utils/tokenUtils';
import * as authService from '../services/authService';

// ─────────────────────────────────────────────
// AUTH
// ─────────────────────────────────────────────

export const login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { userId, password } = req.body;

    if (!userId || !password) {
      sendError(res, 'User ID and password are required', 400);
      return;
    }

    const { accessToken, refreshToken, user } = await authService.loginUser(userId, password);

    res.cookie(REFRESH_COOKIE, refreshToken, REFRESH_COOKIE_OPTIONS);
    sendSuccess(res, 'Login successful', { accessToken, user });
  } catch (err) {
    next(err);
  }
};

export const logout = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (req.user) {
      await authService.logoutUser(req.user.userId);
    }
    res.clearCookie(REFRESH_COOKIE, CLEAR_COOKIE_OPTIONS);
    sendSuccess(res, 'Logged out successfully');
  } catch (err) {
    next(err);
  }
};

export const refresh = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const token = req.cookies?.[REFRESH_COOKIE];

    if (!token) {
      sendError(res, 'No refresh token', 401);
      return;
    }

    const { accessToken, user } = await authService.refreshAccessToken(token);
    sendSuccess(res, 'Token refreshed', { accessToken, user });
  } catch (err) {
    next(err);
  }
};

export const getMe = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const user = await authService.getCurrentUser(req.user!.userId);
    sendSuccess(res, 'User fetched', user);
  } catch (err) {
    next(err);
  }
};

// ─────────────────────────────────────────────
// PASSWORD
// ─────────────────────────────────────────────

export const changePassword = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
      sendError(res, 'Old password and new password are required', 400);
      return;
    }

    if (newPassword.length < 8) {
      sendError(res, 'New password must be at least 8 characters', 400);
      return;
    }

    await authService.changeOwnPassword(req.user!.userId, oldPassword, newPassword);
    sendSuccess(res, 'Password changed successfully');
  } catch (err) {
    next(err);
  }
};

export const forceChangePassword = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { newPassword } = req.body;

    if (!newPassword || newPassword.length < 8) {
      sendError(res, 'New password must be at least 8 characters', 400);
      return;
    }

    await authService.forceSetNewPassword(req.user!.userId, newPassword);
    sendSuccess(res, 'Password updated — please log in again');
  } catch (err) {
    next(err);
  }
};

// ─────────────────────────────────────────────
// ADMIN — USER MANAGEMENT
// ─────────────────────────────────────────────

export const createUser = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { name, role, tempPassword } = req.body;

    if (!name || !role || !tempPassword) {
      sendError(res, 'name, role, and tempPassword are required', 400);
      return;
    }

    if (!['admin', 'driver', 'staff'].includes(role)) {
      sendError(res, 'role must be admin, driver, or staff', 400);
      return;
    }

    if (tempPassword.length < 8) {
      sendError(res, 'Temporary password must be at least 8 characters', 400);
      return;
    }

    const result = await authService.createUser(name, role, tempPassword);
    sendSuccess(res, `User created — share User ID and temp password with ${name}`, result, 201);
  } catch (err) {
    next(err);
  }
};

export const listUsers = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const users = await authService.listUsers();
    sendSuccess(res, 'Users fetched', users);
  } catch (err) {
    next(err);
  }
};

export const resetUserPassword = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { userId } = req.params;
    const { newTempPassword } = req.body;

    if (!newTempPassword || newTempPassword.length < 8) {
      sendError(res, 'New temp password must be at least 8 characters', 400);
      return;
    }

    await authService.adminResetPassword(userId, newTempPassword);
    sendSuccess(res, `Password reset for ${userId} — user will be forced to change on next login`);
  } catch (err) {
    next(err);
  }
};

export const toggleUserActive = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { userId } = req.params;
    const user = await authService.toggleUserActive(userId);
    sendSuccess(res, `User ${user.isActive ? 'activated' : 'deactivated'}`, user);
  } catch (err) {
    next(err);
  }
};

export const deleteUser = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { userId } = req.params;
    await authService.deleteUser(userId, req.user!.userId);
    sendSuccess(res, 'User deleted');
  } catch (err) {
    next(err);
  }
};
