import mongoose from "mongoose";

type MongooseCache = {
  promise: Promise<typeof mongoose> | null;
};

const globalWithCache = globalThis as typeof globalThis & {
  mongooseCache?: MongooseCache;
};

const cache: MongooseCache = globalWithCache.mongooseCache ?? {
  promise: null,
};
globalWithCache.mongooseCache = cache;

export function isDatabaseConnected(): boolean {
  return mongoose.connection.readyState === 1;
}

export async function connectDatabase(uri: string): Promise<void> {
  if (isDatabaseConnected()) {
    return;
  }

  if (!cache.promise) {
    mongoose.set("strictQuery", true);
    cache.promise = mongoose.connect(uri, {
      serverSelectionTimeoutMS: 8_000,
      connectTimeoutMS: 8_000,
      socketTimeoutMS: 45_000,
      maxPoolSize: 10,
      maxIdleTimeMS: 10_000,
      bufferCommands: false,
    });
  }

  try {
    await cache.promise;
  } catch (err) {
    cache.promise = null;
    throw err;
  }
}

export async function disconnectDatabase(): Promise<void> {
  cache.promise = null;
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
}
