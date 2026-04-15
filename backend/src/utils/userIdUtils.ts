import { User } from '../models/User';
import { env } from '../config/env';

/**
 * Generates the next sequential User ID.
 * Format: {PREFIX}{padded-3-digit-number}  →  Bus001, Bus002 …
 * Thread-safe enough for low-concurrency admin usage.
 */
export const generateNextUserId = async (): Promise<string> => {
  const prefix = env.USER_ID_PREFIX;
  const pattern = new RegExp(`^${prefix}\\d+$`);

  const lastUser = await User.findOne({ userId: pattern }, { userId: 1 })
    .sort({ userId: -1 })
    .lean();

  if (!lastUser) {
    return `${prefix}001`;
  }

  const lastNumber = parseInt(lastUser.userId.replace(prefix, ''), 10);
  const next = lastNumber + 1;
  return `${prefix}${String(next).padStart(3, '0')}`;
};
