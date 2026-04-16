import cors from 'cors';
import { env } from './env';

/**
 * CORS configuration.
 * In production: locked to CLIENT_URL only.
 * In development: allows localhost:3000.
 */
export const corsMiddleware = cors({
  origin: (origin, callback) => {
    // Strip trailing slash from CLIENT_URL robustly
    const clientUrl = env.CLIENT_URL ? env.CLIENT_URL.replace(/\/+$/, '') : '';
    
    const allowed =
      env.NODE_ENV === 'development'
        ? ['http://localhost:3000', clientUrl]
        : [clientUrl];

    // Allow requests with no origin (e.g. Postman, server-to-server)
    if (!origin || allowed.includes(origin) || allowed.includes(origin.replace(/\/+$/, ''))) {
      callback(null, true);
    } else {
      callback(new Error(`CORS: origin ${origin} not allowed`));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
});
