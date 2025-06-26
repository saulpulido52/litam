import { Request, Response } from 'express';
import { DashboardService } from './dashboard.service';
import { AppError } from '../../utils/app.error';

export class DashboardController {
  private dashboardService: DashboardService;

  constructor() {
    this.dashboardService = new DashboardService();
  }

  // GET /api/dashboard/stats
  getDashboardStats = async (req: Request, res: Response) => {
    try {
      const nutritionistId = req.user?.id;
      
      if (!nutritionistId) {
        throw new AppError('Usuario no autenticado', 401);
      }

      const stats = await this.dashboardService.getSimpleDashboardStats();
      
      res.json({
        status: 'success',
        data: stats
      });
    } catch (error: any) {
      console.error('Error in getDashboardStats:', error);
      res.status(error.statusCode || 500).json({
        status: 'fail',
        message: error.message || 'Error al obtener estadísticas del dashboard'
      });
    }
  };
} 