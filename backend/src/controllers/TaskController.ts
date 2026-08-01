import { Request, Response, NextFunction } from 'express';
import { TaskService } from '../services/TaskService';
import { ApiResponse } from '../utils/ApiResponse';

export class TaskController {
  private taskService: TaskService;

  constructor() {
    this.taskService = new TaskService();
  }

  createTask = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.id;
      const file = req.file;
      const task = await this.taskService.createTask(userId, req.body, file);
      return ApiResponse.created(res, 'Task created and queued successfully', task);
    } catch (error) {
      next(error);
    }
  };

  getTasks = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = req.user!;
      const result = await this.taskService.getTasks(req.query as any, user);
      return ApiResponse.success(res, 'Tasks retrieved successfully', result.data, result.meta);
    } catch (error) {
      next(error);
    }
  };

  getTaskById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = req.user!;
      const { id } = req.params;
      const task = await this.taskService.getTaskById(id, user);
      return ApiResponse.success(res, 'Task details retrieved', task);
    } catch (error) {
      next(error);
    }
  };

  updateTask = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = req.user!;
      const { id } = req.params;
      const file = req.file;
      const task = await this.taskService.updateTask(id, req.body, user, file);
      return ApiResponse.success(res, 'Task updated successfully', task);
    } catch (error) {
      next(error);
    }
  };

  deleteTask = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = req.user!;
      const { id } = req.params;
      const result = await this.taskService.deleteTask(id, user);
      return ApiResponse.success(res, 'Task deleted successfully', result);
    } catch (error) {
      next(error);
    }
  };

  retryTask = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = req.user!;
      const { id } = req.params;
      const task = await this.taskService.retryTask(id, user);
      return ApiResponse.success(res, 'Task retry triggered successfully', task);
    } catch (error) {
      next(error);
    }
  };
}
