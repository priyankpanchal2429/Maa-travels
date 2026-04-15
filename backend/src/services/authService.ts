import bcrypt from 'bcryptjs';
import { User, IUser } from '../models/User';
import { AppError } from '../middlewares/errorHandler';
import {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
  TokenPayload,
} from '../utils/tokenUtils';
import { generateNextUserId } from '../utils/userIdUtils';

const SALT_ROUNDS = 12;

/** Safe user shape returned to clients — never includes password/refreshToken */
export interface SafeUser {
  id: string;
  userId: string;
  name: string;
  role: string;
  mustChangePassword: boolean;
  isActive: boolean;
  createdAt: Date;
}

const toSafeUser = (user: IUser): SafeUser => ({
  id: (user._id as any).toString(),
  userId: user.userId,
  name: user.name,
  role: user.role,
  mustChangePassword: user.mustChangePassword,
  isActive: user.isActive,
  createdAt: user.createdAt,
});

// ─────────────────────────────────────────────
// AUTH
// ─────────────────────────────────────────────

export const loginUser = async (userId: string, password: string) => {
  const user = await User.findOne({ userId: userId.trim(), isActive: true }).select(
    '+password +refreshToken'
  );

  if (!user) throw new AppError('Invalid User ID or password', 401);

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) throw new AppError('Invalid User ID or password', 401);

  const payload: TokenPayload = {
    userId: user.userId,
    role: user.role,
    mongoId: (user._id as any).toString(),
  };

  const accessToken = signAccessToken(payload);
  const refreshToken = signRefreshToken(payload);

  // Persist refresh token for server-side invalidation on logout
  user.refreshToken = refreshToken;
  await user.save();

  return { accessToken, refreshToken, user: toSafeUser(user) };
};

export const logoutUser = async (userId: string): Promise<void> => {
  await User.updateOne({ userId }, { $unset: { refreshToken: '' } });
};

export const refreshAccessToken = async (token: string) => {
  let payload: TokenPayload;

  try {
    payload = verifyRefreshToken(token);
  } catch {
    throw new AppError('Invalid or expired refresh token', 401);
  }

  const user = await User.findOne({ userId: payload.userId, isActive: true }).select(
    '+refreshToken'
  );

  if (!user || user.refreshToken !== token) {
    throw new AppError('Refresh token revoked', 401);
  }

  const newAccessToken = signAccessToken({
    userId: user.userId,
    role: user.role,
    mongoId: (user._id as any).toString(),
  });

  return { accessToken: newAccessToken, user: toSafeUser(user) };
};

// ─────────────────────────────────────────────
// PASSWORD
// ─────────────────────────────────────────────

export const changeOwnPassword = async (
  userId: string,
  oldPassword: string,
  newPassword: string
): Promise<void> => {
  const user = await User.findOne({ userId }).select('+password');
  if (!user) throw new AppError('User not found', 404);

  const isMatch = await bcrypt.compare(oldPassword, user.password);
  if (!isMatch) throw new AppError('Current password is incorrect', 400);

  if (oldPassword === newPassword) {
    throw new AppError('New password must be different from current password', 400);
  }

  user.password = await bcrypt.hash(newPassword, SALT_ROUNDS);
  user.mustChangePassword = false;
  await user.save();
};

/** Force set new password (after admin reset — no old password needed) */
export const forceSetNewPassword = async (
  userId: string,
  newPassword: string
): Promise<void> => {
  const hashedPassword = await bcrypt.hash(newPassword, SALT_ROUNDS);
  await User.updateOne({ userId }, { password: hashedPassword, mustChangePassword: false });
};

// ─────────────────────────────────────────────
// ADMIN — USER MANAGEMENT
// ─────────────────────────────────────────────

export const createUser = async (
  name: string,
  role: 'admin' | 'driver' | 'staff',
  tempPassword: string
) => {
  const userId = await generateNextUserId();
  const hashedPassword = await bcrypt.hash(tempPassword, SALT_ROUNDS);

  const user = await User.create({
    userId,
    name,
    role,
    password: hashedPassword,
    mustChangePassword: true,
  });

  return { user: toSafeUser(user), tempPassword };
};

export const listUsers = async (): Promise<SafeUser[]> => {
  const users = await User.find().sort({ createdAt: -1 }).lean();
  return users.map((u) => ({
    id: (u._id as any).toString(),
    userId: u.userId,
    name: u.name,
    role: u.role,
    mustChangePassword: u.mustChangePassword,
    isActive: u.isActive,
    createdAt: u.createdAt,
  }));
};

export const adminResetPassword = async (
  targetUserId: string,
  newTempPassword: string
): Promise<void> => {
  const user = await User.findOne({ userId: targetUserId });
  if (!user) throw new AppError('User not found', 404);

  const hashedPassword = await bcrypt.hash(newTempPassword, SALT_ROUNDS);
  user.password = hashedPassword;
  user.mustChangePassword = true;
  // Revoke existing refresh token so user must re-login
  user.refreshToken = undefined;
  await user.save();
};

export const toggleUserActive = async (targetUserId: string): Promise<SafeUser> => {
  const user = await User.findOne({ userId: targetUserId });
  if (!user) throw new AppError('User not found', 404);

  user.isActive = !user.isActive;
  // Revoke refresh token if deactivating
  if (!user.isActive) user.refreshToken = undefined;
  await user.save();

  return toSafeUser(user);
};

export const deleteUser = async (targetUserId: string, requestingUserId: string): Promise<void> => {
  if (targetUserId === requestingUserId) {
    throw new AppError('You cannot delete your own account', 400);
  }

  const result = await User.deleteOne({ userId: targetUserId });
  if (result.deletedCount === 0) throw new AppError('User not found', 404);
};

export const getCurrentUser = async (userId: string): Promise<SafeUser> => {
  const user = await User.findOne({ userId, isActive: true });
  if (!user) throw new AppError('User not found', 404);
  return toSafeUser(user);
};
