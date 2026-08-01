import { Task, TaskStatus, TaskPriority, Prisma } from '@prisma/client';
import { prisma } from '../config/prisma';

export interface TaskFilterOptions {
  userId?: string;
  search?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  type?: string;
  page?: number;
  limit?: number;
  sortBy?: 'createdAt' | 'priority' | 'scheduledAt' | 'title' | 'status';
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResult<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

export class TaskRepository {
  async create(data: {
    title: string;
    description?: string;
    priority?: TaskPriority;
    type?: string;
    scheduledAt?: Date;
    fileUrl?: string;
    fileName?: string;
    fileSize?: number;
    fileType?: string;
    userId: string;
  }): Promise<Task> {
    return prisma.task.create({
      data: {
        title: data.title,
        description: data.description,
        priority: data.priority || TaskPriority.MEDIUM,
        type: data.type || 'GENERAL',
        scheduledAt: data.scheduledAt,
        fileUrl: data.fileUrl,
        fileName: data.fileName,
        fileSize: data.fileSize,
        fileType: data.fileType,
        userId: data.userId,
      },
    });
  }

  async findById(id: string): Promise<Task | null> {
    return prisma.task.findUnique({
      where: { id },
      include: { user: { select: { id: true, name: true, email: true } } },
    });
  }

  async findManyWithPagination(options: TaskFilterOptions): Promise<PaginatedResult<Task>> {
    const page = Math.max(1, options.page || 1);
    const limit = Math.min(100, Math.max(1, options.limit || 10));
    const skip = (page - 1) * limit;

    const where: Prisma.TaskWhereInput = {};

    if (options.userId) {
      where.userId = options.userId;
    }

    if (options.status) {
      where.status = options.status;
    }

    if (options.priority) {
      where.priority = options.priority;
    }

    if (options.type) {
      where.type = options.type;
    }

    if (options.search) {
      where.OR = [
        { title: { contains: options.search, mode: 'insensitive' } },
        { description: { contains: options.search, mode: 'insensitive' } },
      ];
    }

    const sortBy = options.sortBy || 'createdAt';
    const sortOrder = options.sortOrder || 'desc';

    const [total, data] = await Promise.all([
      prisma.task.count({ where }),
      prisma.task.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: { user: { select: { id: true, name: true, email: true } } },
      }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    };
  }

  async update(id: string, data: Partial<Task>): Promise<Task> {
    return prisma.task.update({
      where: { id },
      data,
    });
  }

  async delete(id: string): Promise<Task> {
    return prisma.task.delete({
      where: { id },
    });
  }

  async getDashboardStats(userId?: string) {
    const where: Prisma.TaskWhereInput = userId ? { userId } : {};

    const [totalTasks, completedTasks, failedTasks, pendingTasks, processingTasks] = await Promise.all([
      prisma.task.count({ where }),
      prisma.task.count({ where: { ...where, status: TaskStatus.COMPLETED } }),
      prisma.task.count({ where: { ...where, status: TaskStatus.FAILED } }),
      prisma.task.count({ where: { ...where, status: TaskStatus.PENDING } }),
      prisma.task.count({ where: { ...where, status: TaskStatus.PROCESSING } }),
    ]);

    return {
      totalTasks,
      completedTasks,
      failedTasks,
      pendingTasks,
      processingTasks,
    };
  }
}
