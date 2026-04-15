import { Router } from 'express';
import * as authController from '../controllers/authController';
import { authMiddleware } from '../middlewares/authMiddleware';
import { requireRole } from '../middlewares/roleMiddleware';
import { authRateLimiter } from '../middlewares/rateLimiter';

const router = Router();

// ─────────────────────────────────────────────
// Public auth routes
// ─────────────────────────────────────────────
router.post('/login', authRateLimiter, authController.login);
router.post('/logout', authMiddleware, authController.logout);
router.post('/refresh', authController.refresh);

// ─────────────────────────────────────────────
// Protected — any authenticated user
// ─────────────────────────────────────────────
router.get('/me', authMiddleware, authController.getMe);
router.put('/change-password', authMiddleware, authController.changePassword);
router.put('/force-change-password', authMiddleware, authController.forceChangePassword);

// ─────────────────────────────────────────────
// Admin-only user management
// ─────────────────────────────────────────────
router.post('/admin/users', authMiddleware, requireRole('admin'), authController.createUser);
router.get('/admin/users', authMiddleware, requireRole('admin'), authController.listUsers);
router.put(
  '/admin/users/:userId/reset-password',
  authMiddleware,
  requireRole('admin'),
  authController.resetUserPassword
);
router.patch(
  '/admin/users/:userId/toggle-active',
  authMiddleware,
  requireRole('admin'),
  authController.toggleUserActive
);
router.delete(
  '/admin/users/:userId',
  authMiddleware,
  requireRole('admin'),
  authController.deleteUser
);

export default router;
