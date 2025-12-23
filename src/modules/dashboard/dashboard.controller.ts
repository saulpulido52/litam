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

<<<<<<< HEAD
      const stats = await this.dashboardService.getDashboardStats(nutritionistId);
=======
      const stats = await this.dashboardService.getSimpleDashboardStats(nutritionistId);
>>>>>>> nutri/main
      
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
<<<<<<< HEAD

  // GET /api/dashboard/recent-activities
  getRecentActivities = async (req: Request, res: Response) => {
    try {
      const nutritionistId = req.user?.id;
      const limit = parseInt(req.query.limit as string) || 10;
      
      if (!nutritionistId) {
        throw new AppError('Usuario no autenticado', 401);
      }

      const activities = await this.dashboardService.getRecentActivities(nutritionistId, limit);
      
      res.json({
        status: 'success',
        data: {
          activities
        }
      });
    } catch (error: any) {
      console.error('Error in getRecentActivities:', error);
      res.status(error.statusCode || 500).json({
        status: 'fail',
        message: error.message || 'Error al obtener actividades recientes'
      });
    }
  };

  // GET /api/dashboard/income-summary
  getIncomeSummary = async (req: Request, res: Response) => {
    try {
      const nutritionistId = req.user?.id;
      const period = (req.query.period as 'week' | 'month' | 'year') || 'month';
      
      if (!nutritionistId) {
        throw new AppError('Usuario no autenticado', 401);
      }

      const incomeSummary = await this.dashboardService.getIncomeSummary(nutritionistId, period);
      
      res.json({
        status: 'success',
        data: incomeSummary
      });
    } catch (error: any) {
      console.error('Error in getIncomeSummary:', error);
      res.status(error.statusCode || 500).json({
        status: 'fail',
        message: error.message || 'Error al obtener resumen de ingresos'
      });
    }
  };
=======
>>>>>>> nutri/main
} 