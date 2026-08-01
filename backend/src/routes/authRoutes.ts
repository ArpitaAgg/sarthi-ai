import { Router } from 'express';
import { AuthController } from '../controllers/AuthController';
import { validateRequest } from '../middlewares/validationMiddleware';
import { registerSchema, loginSchema, refreshTokenSchema } from '../validators/authValidator';
import { authenticateToken } from '../middlewares/authMiddleware';

const router = Router();
const authController = new AuthController();

router.post('/register', validateRequest(registerSchema), authController.register);
router.post('/login', validateRequest(loginSchema), authController.login);
router.post('/refresh-token', validateRequest(refreshTokenSchema), authController.refreshToken);
router.post('/logout', authController.logout);
router.get('/me', authenticateToken, authController.me);

export default router;
