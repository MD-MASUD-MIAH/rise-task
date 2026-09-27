import 'dotenv/config';
import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import * as path from 'path';
import { connectDB } from './config/db';

// Routes
import healthRouter from './routes/health.route';
import authRouter from './routes/auth.route';
import posterRouter from './routes/poster.route';

// ─── App Setup ───────────────────────────────────────────────────────────────

const app: Application = express();
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN ?? 'https://client-psi-rust-86.vercel.app';

// ─── Middleware ───────────────────────────────────────────────────────────────

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (
        process.env.NODE_ENV !== 'production' ||
        origin === CLIENT_ORIGIN ||
        origin === 'http://localhost:3000' ||
        /\.vercel\.app$/.test(origin) ||
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

// Ensure DB connection for serverless invocations
app.use(async (_req: Request, _res: Response, next: NextFunction) => {
  try {
    await connectDB();
  } catch (err) {
    console.error('DB middleware connection error:', err);
  }
  next();
});

// ─── Static File Serving ──────────────────────────────────────────────────────
const uploadsDir = process.env.VERCEL ? '/tmp/uploads' : path.resolve(process.cwd(), 'uploads');
const outputDir = process.env.VERCEL ? '/tmp/output' : path.resolve(process.cwd(), 'output');
app.use('/uploads', express.static(uploadsDir));
app.use('/output', express.static(outputDir));

// ─── Routes ───────────────────────────────────────────────────────────────────

app.use('/api/health', healthRouter);
app.use('/api/auth', authRouter);
app.use('/api/posters', posterRouter);

app.get('/', (_req: Request, res: Response): void => {
  res.json({
    status: 'ok',
    message: 'Rise Task Political Poster Generator Backend API',
    endpoints: {
      health: '/api/health',
      auth: '/api/auth',
      posters: '/api/posters',
    },
  });
});

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

export default app;
