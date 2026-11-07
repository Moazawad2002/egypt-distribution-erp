import { PrismaClient } from '@prisma/client';

let prisma: PrismaClient;

try {
  prisma = new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error']
  });
} catch (error) {
  console.warn('PrismaClient initialization warning:', error);
  prisma = new PrismaClient();
}

export { prisma };

export async function checkDatabaseHealth(): Promise<{ connected: boolean; message: string }> {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return { connected: true, message: 'Database connection healthy' };
  } catch (error: any) {
    return { connected: false, message: error.message || 'Cannot reach PostgreSQL database' };
  }
}
