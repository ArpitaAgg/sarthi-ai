import { Router } from 'express';
import { TaskController } from '../controllers/TaskController';
import { authenticateToken } from '../middlewares/authMiddleware';
import { uploadSingleFile } from '../middlewares/uploadMiddleware';
import { validateRequest } from '../middlewares/validationMiddleware';
import {
  createTaskSchema,
  updateTaskSchema,
  taskIdParamSchema,
  taskQuerySchema,
} from '../validators/taskValidator';

const router = Router();
const taskController = new TaskController();

// Protect all task routes
router.use(authenticateToken);

router.post('/', uploadSingleFile, validateRequest(createTaskSchema), taskController.createTask);
router.get('/', validateRequest(taskQuerySchema), taskController.getTasks);
router.get('/:id', validateRequest(taskIdParamSchema), taskController.getTaskById);
router.put('/:id', uploadSingleFile, validateRequest(updateTaskSchema), taskController.updateTask);
router.delete('/:id', validateRequest(taskIdParamSchema), taskController.deleteTask);
router.post('/:id/retry', validateRequest(taskIdParamSchema), taskController.retryTask);

export default router;
