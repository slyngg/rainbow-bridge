import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
  pool: Pool | undefined;
};

let _prisma: PrismaClient | null = null;

function createPrismaClient(): PrismaClient {
  const connectionString = process.env.DATABASE_URL;
  
  if (!connectionString) {
    console.error("❌ DATABASE_URL is not set - database operations will fail");
    // Return a proxy that throws meaningful errors on access
    return new Proxy({} as PrismaClient, {
      get(_, prop) {
        if (prop === 'then') return undefined; // Allow Promise checks
        throw new Error(
          `DATABASE_URL environment variable is not set. ` +
          `Please configure it in Vercel: Settings → Environment Variables`
        );
      }
    });
  }
  
  // Create pool with serverless-friendly settings
  const pool = new Pool({ 
    connectionString,
    max: 1, // Limit connections for serverless
    idleTimeoutMillis: 10000,
    connectionTimeoutMillis: 10000,
  });
  
  globalForPrisma.pool = pool;
  
  const adapter = new PrismaPg(pool);
  
  return new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  });
}

function getPrisma(): PrismaClient {
  if (!_prisma) {
    _prisma = globalForPrisma.prisma ?? createPrismaClient();
    if (process.env.NODE_ENV !== "production") {
      globalForPrisma.prisma = _prisma;
    }
  }
  return _prisma;
}

export const prisma = getPrisma();

export default prisma;
