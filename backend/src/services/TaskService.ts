import { TaskPriority, TaskStatus, Role } from '@prisma/client';
import { TaskRepository, TaskFilterOptions } from '../repositories/TaskRepository';
import { addTaskToQueue } from '../queues/taskQueue';
import { NotFoundError, ForbiddenError, BadRequestError } from '../utils/AppError';
import { SocketManager } from '../utils/socketManager';
import { redisClient } from '../config/redis';

export class TaskService {
  private taskRepository: TaskRepository;

  constructor() {
    this.taskRepository = new TaskRepository();
  }

  async createTask(
    userId: string,
    data: {
      title: string;
      description?: string;
      priority?: TaskPriority;
      type?: string;
      scheduledAt?: string | null;
    },
    file?: Express.Multer.File
  ) {
    let scheduledDate: Date | undefined = undefined;
    let delayMs: number | undefined = undefined;

    if (data.scheduledAt) {
      scheduledDate = new Date(data.scheduledAt);
      const now = new Date();
      if (scheduledDate > now) {
        delayMs = scheduledDate.getTime() - now.getTime();
      }
    }

    const task = await this.taskRepository.create({
      title: data.title,
      description: data.description,
      priority: data.priority,
      type: data.type || 'GENERAL',
      scheduledAt: scheduledDate,
      fileUrl: file ? `/uploads/${file.filename}` : undefined,
      fileName: file ? file.originalname : undefined,
      fileSize: file ? file.size : undefined,
      fileType: file ? file.mimetype : undefined,
      userId,
    });

    // Enqueue job to BullMQ
    await addTaskToQueue(task.id, userId, task.type, task.priority, delayMs);

    // Invalidate Redis dashboard cache
    await redisClient.del(`dashboard:stats:${userId}`);
    await redisClient.del('dashboard:stats:global');

    // Notify real-time clients
    const socketManager = SocketManager.getInstance();
    socketManager.emitToUser(userId, 'task:created', task);
    socketManager.emitToAll('dashboard:updated', { event: 'TASK_CREATED', taskId: task.id });

    return task;
  }

  async getTasks(options: TaskFilterOptions, requestingUser: { id: string; role: Role }) {
    // If not admin, restrict to requesting user's tasks
    if (requestingUser.role !== Role.ADMIN) {
      options.userId = requestingUser.id;
    }

    return this.taskRepository.findManyWithPagination(options);
  }

  async getTaskById(taskId: string, requestingUser: { id: string; role: Role }) {
    const task = await this.taskRepository.findById(taskId);
    if (!task) {
      throw new NotFoundError('Task not found');
    }

    if (requestingUser.role !== Role.ADMIN && task.userId !== requestingUser.id) {
      throw new ForbiddenError('You do not have access to view this task');
    }

    return task;
  }

  async updateTask(
    taskId: string,
    data: {
      title?: string;
      description?: string;
      priority?: TaskPriority;
      type?: string;
      scheduledAt?: string | null;
    },
    requestingUser: { id: string; role: Role },
    file?: Express.Multer.File
  ) {
    const task = await this.getTaskById(taskId, requestingUser);

    if (task.status === TaskStatus.PROCESSING) {
      throw new BadRequestError('Cannot update a task while it is actively processing');
    }

    let scheduledDate: Date | null | undefined = undefined;
    if (data.scheduledAt !== undefined) {
      scheduledDate = data.scheduledAt ? new Date(data.scheduledAt) : null;
    }

    const updatePayload: any = {
      ...(data.title !== undefined && { title: data.title }),
      ...(data.description !== undefined && { description: data.description }),
      ...(data.priority !== undefined && { priority: data.priority }),
      ...(data.type !== undefined && { type: data.type }),
      ...(data.scheduledAt !== undefined && { scheduledAt: scheduledDate }),
    };

    if (file) {
      updatePayload.fileUrl = `/uploads/${file.filename}`;
      updatePayload.fileName = file.originalname;
      updatePayload.fileSize = file.size;
      updatePayload.fileType = file.mimetype;
    }

    const updatedTask = await this.taskRepository.update(taskId, updatePayload);

    // Invalidate Redis dashboard cache
    await redisClient.del(`dashboard:stats:${task.userId}`);
    await redisClient.del('dashboard:stats:global');

    const socketManager = SocketManager.getInstance();
    socketManager.emitToUser(task.userId, 'task:updated', updatedTask);
    socketManager.emitToAll('dashboard:updated', { event: 'TASK_UPDATED', taskId: updatedTask.id });

    return updatedTask;
  }

  async deleteTask(taskId: string, requestingUser: { id: string; role: Role }) {
    const task = await this.getTaskById(taskId, requestingUser);

    await this.taskRepository.delete(taskId);

    // Invalidate Redis dashboard cache
    await redisClient.del(`dashboard:stats:${task.userId}`);
    await redisClient.del('dashboard:stats:global');

    const socketManager = SocketManager.getInstance();
    socketManager.emitToUser(task.userId, 'task:deleted', { id: taskId });
    socketManager.emitToAll('dashboard:updated', { event: 'TASK_DELETED', taskId });

    return { id: taskId };
  }

  async retryTask(taskId: string, requestingUser: { id: string; role: Role }) {
    const task = await this.getTaskById(taskId, requestingUser);

    if (task.status === TaskStatus.PROCESSING) {
      throw new BadRequestError('Task is already processing');
    }

    const retriedTask = await this.taskRepository.update(taskId, {
      status: TaskStatus.PENDING,
      errorMessage: null,
      result: null,
      failedAt: null,
      completedAt: null,
      retryCount: task.retryCount + 1,
    });

    // Re-queue to BullMQ
    await addTaskToQueue(task.id, task.userId, task.type, task.priority);

    // Invalidate Redis cache
    await redisClient.del(`dashboard:stats:${task.userId}`);
    await redisClient.del('dashboard:stats:global');

    const socketManager = SocketManager.getInstance();
    socketManager.emitToUser(task.userId, 'task:updated', retriedTask);
    socketManager.emitToAll('dashboard:updated', { event: 'TASK_RETRIED', taskId: task.id });

    return retriedTask;
  }
}
