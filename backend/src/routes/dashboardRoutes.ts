import { Router } from 'express';
import { DashboardController } from '../controllers/DashboardController';
import { authenticateToken } from '../middlewares/authMiddleware';
import { redisCacheMiddleware } from '../middlewares/cacheMiddleware';

const router = Router();
const dashboardController = new DashboardController();

// Cache live dashboard stats in Redis for 10 seconds to protect PostgreSQL database
router.get('/stats', authenticateToken, redisCacheMiddleware(10), dashboardController.getDashboardStats);

export default router;
