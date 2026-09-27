import { Router, Request, Response } from 'express';
import mongoose from 'mongoose';

const router = Router();

/**
 * GET /api/health
 * Returns the server and database health status.
 */
router.get('/', (_req: Request, res: Response): void => {
  const dbState = mongoose.connection.readyState;

  // Mongoose readyState: 0=disconnected, 1=connected, 2=connecting, 3=disconnecting
  const dbStatusMap: Record<number, string> = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting',
  };

  const isHealthy = dbState === 1;

  res.status(isHealthy ? 200 : 503).json({
    status: isHealthy ? 'ok' : 'degraded',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV ?? 'development',
    services: {
      server: 'ok',
      database: {
        status: dbStatusMap[dbState] ?? 'unknown',
        name: mongoose.connection.name,
        host: mongoose.connection.host,
      },
    },
  });
});

export default router;
