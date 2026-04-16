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
    
    // Allow requests with no origin (e.g. Postman, server-to-server)
    if (!origin) {
      return callback(null, true);
    }
    
    // In development mode, reliably reflect localhost origins
    if (env.NODE_ENV === 'development' && (origin.startsWith('http://localhost') || origin.startsWith('http://127.0.0.1'))) {
      return callback(null, true);
    }

    const allowed =
      env.NODE_ENV === 'development'
        ? ['http://localhost:3000', clientUrl]
        : [clientUrl];

    if (allowed.includes(origin) || allowed.includes(origin.replace(/\/+$/, ''))) {
      callback(null, true);
    } else {
      callback(new Error(`CORS: origin ${origin} not allowed`));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
});
