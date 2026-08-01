import { Worker, Job } from 'bullmq';
import { TASK_QUEUE_NAME, TaskJobData, getQueueMetrics } from './taskQueue';
import { redisConfig } from '../config/redis';
import { prisma } from '../config/prisma';
import { TaskStatus } from '@prisma/client';
import { logger } from '../utils/logger';
import { SocketManager } from '../utils/socketManager';

export const startWorker = () => {
  const worker = new Worker<TaskJobData>(
    TASK_QUEUE_NAME,
    async (job: Job<TaskJobData>) => {
      const { taskId, userId, type } = job.data;
      logger.info(`⚙️ [Worker] Processing task ${taskId} (Attempt ${job.attemptsMade + 1})`);

      // 1. Fetch Task
      const task = await prisma.task.findUnique({ where: { id: taskId } });
      if (!task) {
        throw new Error(`Task ${taskId} not found in database`);
      }

      // 2. Mark as PROCESSING
      const updatedTaskProcessing = await prisma.task.update({
        where: { id: taskId },
        data: { status: TaskStatus.PROCESSING },
      });

      // Emit real-time status update
      const socketManager = SocketManager.getInstance();
      socketManager.emitToUser(userId, 'task:updated', updatedTaskProcessing);
      socketManager.emitToAll('dashboard:updated', { event: 'TASK_PROCESSING', taskId });

      // 3. Simulate processing time (2 to 4 seconds)
      const processingMs = Math.floor(Math.random() * 2000) + 2000;
      await new Promise((resolve) => setTimeout(resolve, processingMs));

      // 4. Determine outcome (fail if title includes '[SIMULATE_FAIL]' or 'fail' keyword explicitly)
      const isSimulatedFailure = task.title.toLowerCase().includes('fail') || task.description?.toLowerCase().includes('fail');

      if (isSimulatedFailure && job.attemptsMade < 2) {
        // Trigger retry via BullMQ error throwing
        throw new Error(`Simulated transient error during ${type} execution (Attempt ${job.attemptsMade + 1})`);
      }

      if (isSimulatedFailure) {
        // Permanent failure
        const failedTask = await prisma.task.update({
          where: { id: taskId },
          data: {
            status: TaskStatus.FAILED,
            failedAt: new Date(),
            errorMessage: 'Task failed after reaching maximum retry attempts in background worker engine.',
            retryCount: job.attemptsMade + 1,
          },
        });

        socketManager.emitToUser(userId, 'task:updated', failedTask);
        socketManager.emitToAll('dashboard:updated', { event: 'TASK_FAILED', taskId });
        return { success: false, taskId, status: 'FAILED' };
      }

      // 5. Success execution
      const executionResult = {
        executionTimeMs: processingMs,
        processedAt: new Date().toISOString(),
        taskType: type,
        summary: `Successfully executed ${type} background job.`,
        output: {
          itemsProcessed: Math.floor(Math.random() * 500) + 50,
          status: 'SUCCESS',
        },
      };

      const completedTask = await prisma.task.update({
        where: { id: taskId },
        data: {
          status: TaskStatus.COMPLETED,
          completedAt: new Date(),
          result: JSON.stringify(executionResult),
          retryCount: job.attemptsMade,
        },
      });

      // Emit completion socket event
      socketManager.emitToUser(userId, 'task:updated', completedTask);
      socketManager.emitToAll('dashboard:updated', { event: 'TASK_COMPLETED', taskId });

      const currentMetrics = await getQueueMetrics();
      socketManager.emitToAll('queue:metrics', currentMetrics);

      logger.info(`✅ [Worker] Task ${taskId} completed successfully in ${processingMs}ms`);
      return { success: true, taskId, status: 'COMPLETED' };
    },
    {
      connection: redisConfig,
      concurrency: 5,
    }
  );

  worker.on('failed', async (job, err) => {
    if (job) {
      logger.error(`❌ [Worker] Job ${job.id} (Task: ${job.data.taskId}) failed: ${err.message}`);
      const maxAttempts = job.opts.attempts || 3;
      if (job.attemptsMade >= maxAttempts) {
        try {
          const failedTask = await prisma.task.update({
            where: { id: job.data.taskId },
            data: {
              status: TaskStatus.FAILED,
              failedAt: new Date(),
              errorMessage: err.message || 'Task failed after reaching maximum retry attempts in background worker engine.',
              retryCount: job.attemptsMade,
            },
          });

          const socketManager = SocketManager.getInstance();
          socketManager.emitToUser(job.data.userId, 'task:updated', failedTask);
          socketManager.emitToAll('dashboard:updated', { event: 'TASK_FAILED', taskId: job.data.taskId });
        } catch (e) {
          logger.error(`Failed to update task ${job.data.taskId} status to FAILED in DB:`, e);
        }
      }
    }
  });

  worker.on('completed', (job) => {
    logger.info(`🎉 [Worker] Job ${job.id} finished successfully`);
  });

  logger.info('✅ BullMQ Task Worker started and listening for jobs...');
  return worker;
};
