import { PrismaClient } from '@prisma/client';
import { logger } from '../utils/logger';

export const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'info', 'warn', 'error'] : ['error'],
});

prisma.$connect()
  .then(() => logger.info('✅ Prisma connected to PostgreSQL successfully'))
  .catch((err) => logger.error('❌ Prisma failed to connect to PostgreSQL:', err));
