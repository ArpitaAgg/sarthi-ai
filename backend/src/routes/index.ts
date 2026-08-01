import { Router, Request, Response } from 'express';
import authRoutes from './authRoutes';
import taskRoutes from './taskRoutes';
import dashboardRoutes from './dashboardRoutes';
import { rateLimiter } from '../middlewares/rateLimitMiddleware';

const router = Router();

// Global API Rate Limiting (100 requests / minute)
router.use(rateLimiter({ windowMs: 60 * 1000, max: 100 }));

router.get('/', (_req: Request, res: Response) => {
  res.status(200).json({
    status: 'API_ACTIVE',
    message: 'Saarthi TaskEngine REST API router mounted and active.',
    availableModules: [
      '/api/auth',
      '/api/tasks',
      '/api/dashboard',
    ],
  });
});

router.use('/auth', authRoutes);
router.use('/tasks', taskRoutes);
router.use('/dashboard', dashboardRoutes);

export default router;
