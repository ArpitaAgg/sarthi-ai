import http from 'http';
import dotenv from 'dotenv';
dotenv.config();

import app from './app';
import { logger } from './utils/logger';
import { SocketManager } from './utils/socketManager';
import { startWorker } from './queues/taskWorker';

const PORT = process.env.PORT || 5000;

const server = http.createServer(app);

// Initialize Socket.IO
SocketManager.getInstance().init(server);

// Start worker in dev or single-process container mode
startWorker();

server.listen(PORT, () => {
  logger.info(`🚀 Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
  logger.info(`📡 API endpoint: http://localhost:${PORT}/api`);
});

// Graceful shutdown handling
process.on('SIGTERM', () => {
  logger.info('SIGTERM received. Shutting down gracefully...');
  server.close(() => {
    logger.info('Process terminated.');
    process.exit(0);
  });
});
