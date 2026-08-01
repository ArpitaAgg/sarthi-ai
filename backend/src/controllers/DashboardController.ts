import { Request, Response, NextFunction } from 'express';
import { DashboardService } from '../services/DashboardService';
import { ApiResponse } from '../utils/ApiResponse';

export class DashboardController {
  private dashboardService: DashboardService;

  constructor() {
    this.dashboardService = new DashboardService();
  }

  getDashboardStats = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = req.user!;
      const stats = await this.dashboardService.getDashboardStats(user);
      return ApiResponse.success(res, 'Dashboard statistics retrieved successfully', stats);
    } catch (error) {
      next(error);
    }
  };
}
