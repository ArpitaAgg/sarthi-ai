import { Role } from '@prisma/client';
import { TaskRepository } from '../repositories/TaskRepository';
import { getQueueMetrics } from '../queues/taskQueue';
import { redisClient } from '../config/redis';

export class DashboardService {
  private taskRepository: TaskRepository;

  constructor() {
    this.taskRepository = new TaskRepository();
  }

  async getDashboardStats(user: { id: string; role: Role }) {
    const cacheKey = user.role === Role.ADMIN ? 'dashboard:stats:global' : `dashboard:stats:${user.id}`;
    const cachedStats = await redisClient.get(cacheKey);

    if (cachedStats) {
      return JSON.parse(cachedStats);
    }

    const userIdFilter = user.role === Role.ADMIN ? undefined : user.id;

    const [taskStats, queueMetrics] = await Promise.all([
      this.taskRepository.getDashboardStats(userIdFilter),
      getQueueMetrics(),
    ]);

    const result = {
      taskStats,
      queueMetrics,
      updatedAt: new Date().toISOString(),
    };

    // Cache in Redis for 60 seconds
    await redisClient.setex(cacheKey, 60, JSON.stringify(result));

    return result;
  }
}
