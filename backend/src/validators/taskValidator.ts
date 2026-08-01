import { z } from 'zod';

const scheduledAtSchema = z.preprocess(
  (val) => (val === '' || val === 'null' || val === 'undefined' ? null : val),
  z.string().datetime().optional().nullable()
);

export const createTaskSchema = z.object({
  body: z.object({
    title: z.string().min(3, 'Title must be at least 3 characters'),
    description: z.string().optional(),
    priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).optional(),
    type: z.string().optional(),
    scheduledAt: scheduledAtSchema,
  }),
});

export const updateTaskSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid task ID format'),
  }),
  body: z.object({
    title: z.string().min(3).optional(),
    description: z.string().optional(),
    priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).optional(),
    type: z.string().optional(),
    scheduledAt: scheduledAtSchema,
  }),
});

export const taskIdParamSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid task ID format'),
  }),
});

export const taskQuerySchema = z.object({
  query: z.object({
    search: z.string().optional(),
    status: z.enum(['PENDING', 'PROCESSING', 'COMPLETED', 'FAILED']).optional(),
    priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).optional(),
    type: z.string().optional(),
    page: z.string().regex(/^\d+$/).transform(Number).optional(),
    limit: z.string().regex(/^\d+$/).transform(Number).optional(),
    sortBy: z.enum(['createdAt', 'priority', 'scheduledAt', 'title', 'status']).optional(),
    sortOrder: z.enum(['asc', 'desc']).optional(),
  }),
});
