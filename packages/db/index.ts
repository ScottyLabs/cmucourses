import { PrismaClient } from "@prisma/client";
export * from "@prisma/client";

// Singleton pattern to prevent multiple PrismaClient instances
// and reduce memory usage in containerized environments like Railway
const globalForPrisma = globalThis as unknown as {
  db: PrismaClient | undefined;
};

// Configurable connection pool size for MongoDB
// Defaults to 3 for smaller containers (MongoDB default is 100!)
// Set MONGO_POOL_SIZE env var to override, or add maxPoolSize to MONGODB_URI directly
const poolSize = process.env.MONGO_POOL_SIZE 
  ? parseInt(process.env.MONGO_POOL_SIZE, 10) 
  : 3;

// Get the MongoDB URI and append maxPoolSize if not present
const mongoUri = process.env.MONGODB_URI;
let connectionString = mongoUri;

if (connectionString && !connectionString.includes("maxPoolSize=")) {
  const separator = connectionString.includes("?") ? "&" : "?";
  connectionString = `${connectionString}${separator}maxPoolSize=${poolSize}`;
}

const db =
  globalForPrisma.db ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" 
      ? ["query", "error", "warn"] 
      : ["error"],
    ...(connectionString && {
      datasources: {
        db: {
          url: connectionString,
        },
      },
    }),
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.db = db;
}

export default db;
