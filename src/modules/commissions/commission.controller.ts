// src/modules/commissions/commission.controller.ts
import { Request, Response, NextFunction } from 'express';
import { CommissionService } from './commission.service';
import { AppError } from '../../utils/app.error';

class CommissionController {
    constructor(private commissionService: CommissionService) {}

    // ==================== CALCULAR COMISIONES ====================

    public async calculateMonthlyCommission(req: Request, res: Response, next: NextFunction) {
        try {
            const { nutritionistId } = req.params;
            const { month, year } = req.body;

            if (!month || !year) {
                return res.status(400).json({
                    success: false,
                    message: 'Mes y año son requeridos'
                });
            }

            const commission = await this.commissionService.calculateMonthlyCommission(
                nutritionistId,
                parseInt(month),
                parseInt(year)
            );

            res.status(201).json({
                success: true,
                message: 'Comisión calculada exitosamente',
                data: commission
            });
        } catch (error: any) {
            next(new AppError(error.message || 'Error al calcular comisión', error.statusCode || 500));
        }
    }

    // ==================== OBTENER COMISIONES ====================

    public async getCommissionsByNutritionist(req: Request, res: Response, next: NextFunction) {
        try {
            const { nutritionistId } = req.params;
            const commissions = await this.commissionService.getCommissionsByNutritionist(nutritionistId);

            res.status(200).json({
                success: true,
                data: commissions
            });
        } catch (error: any) {
            next(new AppError(error.message || 'Error al obtener comisiones', error.statusCode || 500));
        }
    }

    public async getAllCommissions(req: Request, res: Response, next: NextFunction) {
        try {
            const commissions = await this.commissionService.getAllCommissions();

            res.status(200).json({
                success: true,
                data: commissions
            });
        } catch (error: any) {
            next(new AppError(error.message || 'Error al obtener comisiones', error.statusCode || 500));
        }
    }

    public async getCommissionById(req: Request, res: Response, next: NextFunction) {
        try {
            const { commissionId } = req.params;
            const commission = await this.commissionService.getCommissionById(commissionId);

            res.status(200).json({
                success: true,
                data: commission
            });
        } catch (error: any) {
            next(new AppError(error.message || 'Error al obtener comisión', error.statusCode || 500));
        }
    }

    // ==================== GESTIONAR COMISIONES ====================

    public async markCommissionAsPaid(req: Request, res: Response, next: NextFunction) {
        try {
            const { commissionId } = req.params;
            const { paymentReference } = req.body;

            const commission = await this.commissionService.markCommissionAsPaid(commissionId, paymentReference);

            res.status(200).json({
                success: true,
                message: 'Comisión marcada como pagada',
                data: commission
            });
        } catch (error: any) {
            next(new AppError(error.message || 'Error al marcar comisión como pagada', error.statusCode || 500));
        }
    }

    public async cancelCommission(req: Request, res: Response, next: NextFunction) {
        try {
            const { commissionId } = req.params;
            const { reason } = req.body;

            const commission = await this.commissionService.cancelCommission(commissionId, reason);

            res.status(200).json({
                success: true,
                message: 'Comisión cancelada',
                data: commission
            });
        } catch (error: any) {
            next(new AppError(error.message || 'Error al cancelar comisión', error.statusCode || 500));
        }
    }

    // ==================== ESTADÍSTICAS ====================

    public async getCommissionStats(req: Request, res: Response, next: NextFunction) {
        try {
            const stats = await this.commissionService.getCommissionStats();

            res.status(200).json({
                success: true,
                data: stats
            });
        } catch (error: any) {
            next(new AppError(error.message || 'Error al obtener estadísticas', error.statusCode || 500));
        }
    }

    // ==================== REPORTES ====================

    public async generateCommissionReport(req: Request, res: Response, next: NextFunction) {
        try {
            const { startDate, endDate } = req.query;

            if (!startDate || !endDate) {
                return res.status(400).json({
                    success: false,
                    message: 'Fecha de inicio y fin son requeridas'
                });
            }

            const report = await this.commissionService.generateCommissionReport(
                new Date(startDate as string),
                new Date(endDate as string)
            );

            res.status(200).json({
                success: true,
                data: report
            });
        } catch (error: any) {
            next(new AppError(error.message || 'Error al generar reporte', error.statusCode || 500));
        }
    }
}

export { CommissionController }; 