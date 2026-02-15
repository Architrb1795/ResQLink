import { PrismaClient } from '@prisma/client';
import { env } from '../config/env';

// ─── Prisma Singleton ─────────────────────────────────────────────
// Prevents multiple PrismaClient instances during hot-reloading in dev.
// Connects to Neon Postgres via the DATABASE_URL env var.
// ───────────────────────────────────────────────────────────────────

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: env.NODE_ENV === 'development' ? ['query', 'warn', 'error'] : ['error'],
  });

if (env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

// Health check helper
export const checkDatabaseConnection = async (): Promise<boolean> => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return true;
  } catch {
    return false;
  }
};
