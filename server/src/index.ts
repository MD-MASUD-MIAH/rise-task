import 'dotenv/config';
import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import * as path from 'path';
import { connectDB, disconnectDB } from './config/db';
import { warmupBrowser, closeBrowser } from './services/posterRenderer';

// Routes
import healthRouter from './routes/health.route';
import authRouter from './routes/auth.route';
import posterRouter from './routes/poster.route';

// ─── App Setup ───────────────────────────────────────────────────────────────

const app: Application = express();
const PORT = parseInt(process.env.PORT ?? '5000', 10);
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN ?? 'http://localhost:3000';

// ─── Middleware ───────────────────────────────────────────────────────────────

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (
        process.env.NODE_ENV !== 'production' ||
        origin === CLIENT_ORIGIN ||
        origin === 'http://localhost:3000' ||
        /^http:\/\/localhost:\d+$/.test(origin) ||
        /^http:\/\/127\.0\.0\.1:\d+$/.test(origin)
      ) {
        return callback(null, true);
      }
      callback(new Error('Not allowed by CORS'));
    },
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  })
);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ─── Static File Serving ──────────────────────────────────────────────────────
// Serve uploaded leader photos and generated poster PNGs
app.use('/uploads', express.static(path.resolve(process.cwd(), 'uploads')));
app.use('/output',  express.static(path.resolve(process.cwd(), 'output')));

// ─── Routes ───────────────────────────────────────────────────────────────────

app.use('/api/health',  healthRouter);
app.use('/api/auth',    authRouter);
app.use('/api/posters', posterRouter);

// 404 handler — must come after all routes
app.use((_req: Request, res: Response): void => {
  res.status(404).json({
    status: 'error',
    message: 'Route not found',
  });
});

// Global error handler — must have 4 parameters
app.use((err: Error, _req: Request, res: Response, _next: NextFunction): void => {
  console.error('💥 Unhandled error:', err.message);
  res.status(500).json({
    status: 'error',
    message: process.env.NODE_ENV === 'production' ? 'Internal Server Error' : err.message,
  });
});

// ─── Bootstrap ────────────────────────────────────────────────────────────────

const startServer = async (): Promise<void> => {
  await connectDB();

  // Pre-warm Chromium so the first /api/posters call isn't slow
  await warmupBrowser();

  const server = app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`🩺 Health:   http://localhost:${PORT}/api/health`);
    console.log(`🔐 Auth:     http://localhost:${PORT}/api/auth`);
    console.log(`🖼️  Posters:  http://localhost:${PORT}/api/posters`);
    console.log(`🌍 Env:      ${process.env.NODE_ENV ?? 'development'}`);
    console.log(`💾 Storage:  ${process.env.STORAGE_MODE ?? 'local'}`);
  });

  // Graceful shutdown
  const shutdown = async (signal: string): Promise<void> => {
    console.log(`\n⚠️  Received ${signal}. Shutting down gracefully…`);
    server.close(async () => {
      await closeBrowser();
      await disconnectDB();
      console.log('✅ Server closed.');
      process.exit(0);
    });
  };

  process.on('SIGINT', () => void shutdown('SIGINT'));
  process.on('SIGTERM', () => void shutdown('SIGTERM'));
};

void startServer();
