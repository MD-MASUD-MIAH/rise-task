import app from './app';
import { connectDB, disconnectDB } from './config/db';
import { warmupBrowser, closeBrowser } from './services/posterRenderer';

const PORT = parseInt(process.env.PORT ?? '5000', 10);

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
