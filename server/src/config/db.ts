import mongoose from 'mongoose';

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Returns true when the URI still has the `<placeholder>` values from .env.example */
const isPlaceholderUri = (uri: string): boolean =>
  !uri || uri.includes('<') || uri.includes('>') || uri === '';

// ─── In-memory MongoDB (dev only) ─────────────────────────────────────────────

let _memServer: import('mongodb-memory-server').MongoMemoryServer | null = null;

const startMemoryServer = async (): Promise<string> => {
  const { MongoMemoryServer } = await import('mongodb-memory-server');
  _memServer = await MongoMemoryServer.create({
    instance: { dbName: 'rise_poster_dev' },
  });
  const uri = _memServer.getUri();
  console.log('🧪 Using in-memory MongoDB (dev mode)');
  console.log(`   URI: ${uri}`);
  return uri;
};

// ─── Connect ──────────────────────────────────────────────────────────────────

export const connectDB = async (): Promise<void> => {
  let uri = process.env.MONGODB_URI ?? '';

  if (isPlaceholderUri(uri)) {
    if (process.env.NODE_ENV === 'production') {
      console.error('❌ MONGODB_URI must be set in production.');
      process.exit(1);
    }
    // Dev mode: spin up an in-memory MongoDB automatically
    uri = await startMemoryServer();
  }

  try {
    mongoose.set('strictQuery', true);
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 10_000,
    });
    console.log(`✅ MongoDB connected: ${conn.connection.host} — DB: ${conn.connection.name}`);
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

// ─── Disconnect ────────────────────────────────────────────────────────────────

export const disconnectDB = async (): Promise<void> => {
  await mongoose.disconnect();
  if (_memServer) {
    await _memServer.stop();
    _memServer = null;
  }
  console.log('🔌 MongoDB disconnected.');
};
