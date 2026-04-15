import jwt, { SignOptions } from 'jsonwebtoken';
import { env } from '../config/env';

export interface TokenPayload {
  userId: string;
  role: string;
  mongoId: string;
}

/** Refresh token cookie name — single source of truth */
export const REFRESH_COOKIE = 'refreshToken';

export const REFRESH_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: env.NODE_ENV === 'production',
  sameSite: 'strict' as const,
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in ms
};

export const CLEAR_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: env.NODE_ENV === 'production',
  sameSite: 'strict' as const,
};

export const signAccessToken = (payload: TokenPayload): string =>
  jwt.sign(payload, env.JWT_ACCESS_SECRET, {
    expiresIn: env.JWT_ACCESS_EXPIRY,
  } as SignOptions);

export const signRefreshToken = (payload: TokenPayload): string =>
  jwt.sign(payload, env.JWT_REFRESH_SECRET, {
    expiresIn: env.JWT_REFRESH_EXPIRY,
  } as SignOptions);

export const verifyAccessToken = (token: string): TokenPayload =>
  jwt.verify(token, env.JWT_ACCESS_SECRET) as TokenPayload;

export const verifyRefreshToken = (token: string): TokenPayload =>
  jwt.verify(token, env.JWT_REFRESH_SECRET) as TokenPayload;
