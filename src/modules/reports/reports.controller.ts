import { Request, Response } from 'express';
import { ReportsService } from './reports.service';

const reportsService = new ReportsService();

export class ReportsController {

    async getFinancialReports(req: Request, res: Response) {
        try {
            const nutritionistId = (req as any).user.id;
            const data = await reportsService.getFinancialStats(nutritionistId);
            return res.json({
                status: 'success',
                data
            });
        } catch (error) {
            console.error('Error fetching financial reports:', error);
            return res.status(500).json({
                status: 'error',
                message: 'Error fetching financial reports'
            });
        }
    }

    async getPatientProgressReports(req: Request, res: Response) {
        try {
            const nutritionistId = (req as any).user.id;
            const data = await reportsService.getPatientProgress(nutritionistId);
            return res.json({
                status: 'success',
                data
            });
        } catch (error) {
            console.error('Error fetching patient progress:', error);
            return res.status(500).json({
                status: 'error',
                message: 'Error fetching patient progress'
            });
        }
    }

    async getServiceDistributionReports(req: Request, res: Response) {
        try {
            const nutritionistId = (req as any).user.id;
            const data = await reportsService.getServiceStats(nutritionistId);
            return res.json({
                status: 'success',
                data
            });
        } catch (error) {
            console.error('Error fetching service stats:', error);
            return res.status(500).json({
                status: 'error',
                message: 'Error fetching service stats'
            });
        }
    }
}
