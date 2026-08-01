import dotenv from 'dotenv';
dotenv.config();

import { logger } from './utils/logger';
import { startWorker } from './queues/taskWorker';

logger.info('🤖 Dedicated BullMQ Worker Process initializing...');
startWorker();
