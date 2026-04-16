import express from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import { corsMiddleware } from './config/cors';
import { errorHandler } from './middlewares/errorHandler';
import { generalRateLimiter } from './middlewares/rateLimiter';
import { env } from './config/env';
import studentRoutes from './routes/studentRoutes';
import driverRoutes from './routes/driverRoutes';
import busRoutes from './routes/busRoutes';
import routeRoutes from './routes/routeRoutes';
import expenseRoutes from './routes/expenseRoutes';
import collegeRoutes from './routes/collegeRoutes';

const app = express();

// ─── Security headers ───────────────────────
app.use(helmet());

// ─── CORS ───────────────────────────────────
app.use(corsMiddleware);

// ─── Parsers ────────────────────────────────
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(cookieParser(env.COOKIE_SECRET));

// ─── Logging ────────────────────────────────
if (env.NODE_ENV !== 'test') {
  app.use(morgan(env.NODE_ENV === 'development' ? 'dev' : 'combined'));
}

// ─── Rate limiting ───────────────────────────
app.use('/api', generalRateLimiter);

// ─── Health check ────────────────────────────
app.get('/api/health', (_req, res) => {
  res.json({ success: true, message: 'Bus Management API is running', timestamp: new Date().toISOString() });
});

// ─── Routes ──────────────────────────────────
app.use('/api/students', studentRoutes);
app.use('/api/drivers', driverRoutes);
app.use('/api/buses', busRoutes);
app.use('/api/routes', routeRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/colleges', collegeRoutes);

// ─── 404 handler ─────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

// ─── Global error handler ────────────────────
app.use(errorHandler);

export default app;
