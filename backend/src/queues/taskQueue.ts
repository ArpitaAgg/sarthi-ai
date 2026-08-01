import { Queue } from 'bullmq';
import { redisConfig } from '../config/redis';
import { logger } from '../utils/logger';

export const TASK_QUEUE_NAME = 'task-processing-queue';

export interface TaskJobData {
  taskId: string;
  userId: string;
  type: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
}

const getJobPriorityNumber = (priority: string): number => {
  switch (priority) {
    case 'URGENT':
      return 1;
    case 'HIGH':
      return 2;
    case 'MEDIUM':
      return 3;
    case 'LOW':
      return 4;
    default:
      return 3;
  }
};

export const taskQueue = new Queue<TaskJobData>(TASK_QUEUE_NAME, {
  connection: redisConfig,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 2000,
    },
    removeOnComplete: { age: 3600, count: 100 },
    removeOnFail: { age: 86400, count: 500 },
  },
});

export const addTaskToQueue = async (
  taskId: string,
  userId: string,
  type: string = 'GENERAL',
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT' = 'MEDIUM',
  delayMs?: number
) => {
  try {
    const jobPriority = getJobPriorityNumber(priority);
    const options: any = {
      priority: jobPriority,
      jobId: `task-${taskId}-${Date.now()}`,
    };

    if (delayMs && delayMs > 0) {
      options.delay = delayMs;
    }

    const job = await taskQueue.add(
      type,
      { taskId, userId, type, priority },
      options
    );

    logger.info(`📥 Task ${taskId} added to BullMQ queue (Job ID: ${job.id}, Delay: ${delayMs || 0}ms, Priority: ${priority})`);
    return job;
  } catch (error) {
    logger.error(`❌ Failed to add task ${taskId} to BullMQ queue:`, error);
    throw error;
  }
};

export const getQueueMetrics = async () => {
  const [waiting, active, completed, failed, delayed] = await Promise.all([
    taskQueue.getWaitingCount(),
    taskQueue.getActiveCount(),
    taskQueue.getCompletedCount(),
    taskQueue.getFailedCount(),
    taskQueue.getDelayedCount(),
  ]);

  return {
    waiting,
    active,
    completed,
    failed,
    delayed,
    total: waiting + active + completed + failed + delayed,
  };
};
