// src/modules/monetization/monetization.controller.ts
import { Request, Response, NextFunction } from 'express';
import monetizationService from '../../modules/monetization/monetization.service';
import { AppError } from '../../utils/app.error';
import { RoleName } from '../../database/entities/role.entity';

class MonetizationController {
    // ==================== ENDPOINTS PARA NUTRIÓLOGOS ====================

    public async getNutritionistTiers(req: Request, res: Response, next: NextFunction) {
        try {
            const tiers = await monetizationService.getNutritionistTiers();
            res.status(200).json({
                status: 'success',
                results: tiers.length,
                data: { tiers },
            });
        } catch (error: any) {
            console.error('Error en MonetizationController.getNutritionistTiers:', error);
            if (error instanceof AppError) {
                return next(error);
            }
            next(new AppError('Error al obtener los tiers de nutriólogos.', 500));
        }
    }

    public async getNutritionistTierById(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;
            const tier = await monetizationService.getNutritionistTierById(id);
            res.status(200).json({
                status: 'success',
                data: { tier },
            });
        } catch (error: any) {
            console.error('Error en MonetizationController.getNutritionistTierById:', error);
            if (error instanceof AppError) {
                return next(error);
            }
            next(new AppError('Error al obtener el tier de nutriólogo.', 500));
        }
    }

    public async assignNutritionistTier(req: Request, res: Response, next: NextFunction) {
        try {
            if (!req.user || req.user.role.name !== RoleName.ADMIN) {
                return next(new AppError('Acceso denegado. Solo administradores pueden asignar tiers.', 403));
            }

            const { userId, tierId } = req.body;
            const updatedUser = await monetizationService.assignNutritionistTier(userId, tierId);
            
            res.status(200).json({
                status: 'success',
                message: 'Tier asignado exitosamente.',
                data: { user: updatedUser },
            });
        } catch (error: any) {
            console.error('Error en MonetizationController.assignNutritionistTier:', error);
            if (error instanceof AppError) {
                return next(error);
            }
            next(new AppError('Error al asignar el tier de nutriólogo.', 500));
        }
    }

    public async getNutritionistTierStats(req: Request, res: Response, next: NextFunction) {
        try {
            if (!req.user || req.user.role.name !== RoleName.ADMIN) {
                return next(new AppError('Acceso denegado. Solo administradores pueden ver estadísticas.', 403));
            }

            const stats = await monetizationService.getNutritionistTierStats();
            res.status(200).json({
                status: 'success',
                data: { stats },
            });
        } catch (error: any) {
            console.error('Error en MonetizationController.getNutritionistTierStats:', error);
            if (error instanceof AppError) {
                return next(error);
            }
            next(new AppError('Error al obtener estadísticas de tiers de nutriólogos.', 500));
        }
    }

    // ==================== ENDPOINTS PARA PACIENTES ====================

    public async getPatientTiers(req: Request, res: Response, next: NextFunction) {
        try {
            const tiers = await monetizationService.getPatientTiers();
            res.status(200).json({
                status: 'success',
                results: tiers.length,
                data: { tiers },
            });
        } catch (error: any) {
            console.error('Error en MonetizationController.getPatientTiers:', error);
            if (error instanceof AppError) {
                return next(error);
            }
            next(new AppError('Error al obtener los tiers de pacientes.', 500));
        }
    }

    public async getPatientTierById(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;
            const tier = await monetizationService.getPatientTierById(id);
            res.status(200).json({
                status: 'success',
                data: { tier },
            });
        } catch (error: any) {
            console.error('Error en MonetizationController.getPatientTierById:', error);
            if (error instanceof AppError) {
                return next(error);
            }
            next(new AppError('Error al obtener el tier de paciente.', 500));
        }
    }

    public async assignPatientTier(req: Request, res: Response, next: NextFunction) {
        try {
            if (!req.user || req.user.role.name !== RoleName.ADMIN) {
                return next(new AppError('Acceso denegado. Solo administradores pueden asignar tiers.', 403));
            }

            const { userId, tierId } = req.body;
            const updatedUser = await monetizationService.assignPatientTier(userId, tierId);
            
            res.status(200).json({
                status: 'success',
                message: 'Tier asignado exitosamente.',
                data: { user: updatedUser },
            });
        } catch (error: any) {
            console.error('Error en MonetizationController.assignPatientTier:', error);
            if (error instanceof AppError) {
                return next(error);
            }
            next(new AppError('Error al asignar el tier de paciente.', 500));
        }
    }

    public async getPatientTierStats(req: Request, res: Response, next: NextFunction) {
        try {
            if (!req.user || req.user.role.name !== RoleName.ADMIN) {
                return next(new AppError('Acceso denegado. Solo administradores pueden ver estadísticas.', 403));
            }

            const stats = await monetizationService.getPatientTierStats();
            res.status(200).json({
                status: 'success',
                data: { stats },
            });
        } catch (error: any) {
            console.error('Error en MonetizationController.getPatientTierStats:', error);
            if (error instanceof AppError) {
                return next(error);
            }
            next(new AppError('Error al obtener estadísticas de tiers de pacientes.', 500));
        }
    }

    // ==================== ENDPOINTS DE VALIDACIÓN DE FUNCIONALIDADES ====================

    public async checkNutritionistAIAccess(req: Request, res: Response, next: NextFunction) {
        try {
            if (!req.user) {
                return next(new AppError('Usuario no autenticado.', 401));
            }

            const canUseAI = await monetizationService.canNutritionistUseAI(req.user.id);
            res.status(200).json({
                status: 'success',
                data: { canUseAI },
            });
        } catch (error: any) {
            console.error('Error en MonetizationController.checkNutritionistAIAccess:', error);
            if (error instanceof AppError) {
                return next(error);
            }
            next(new AppError('Error al verificar acceso a IA.', 500));
        }
    }

    public async checkNutritionistUnlimitedPatients(req: Request, res: Response, next: NextFunction) {
        try {
            if (!req.user) {
                return next(new AppError('Usuario no autenticado.', 401));
            }

            const canHaveUnlimited = await monetizationService.canNutritionistHaveUnlimitedPatients(req.user.id);
            res.status(200).json({
                status: 'success',
                data: { canHaveUnlimited },
            });
        } catch (error: any) {
            console.error('Error en MonetizationController.checkNutritionistUnlimitedPatients:', error);
            if (error instanceof AppError) {
                return next(error);
            }
            next(new AppError('Error al verificar acceso a pacientes ilimitados.', 500));
        }
    }

    public async checkPatientAIFoodScanning(req: Request, res: Response, next: NextFunction) {
        try {
            if (!req.user) {
                return next(new AppError('Usuario no autenticado.', 401));
            }

            const canUseAI = await monetizationService.canPatientUseAIFoodScanning(req.user.id);
            res.status(200).json({
                status: 'success',
                data: { canUseAI },
            });
        } catch (error: any) {
            console.error('Error en MonetizationController.checkPatientAIFoodScanning:', error);
            if (error instanceof AppError) {
                return next(error);
            }
            next(new AppError('Error al verificar acceso a escaneo de alimentos con IA.', 500));
        }
    }

    public async checkPatientBarcodeScanning(req: Request, res: Response, next: NextFunction) {
        try {
            if (!req.user) {
                return next(new AppError('Usuario no autenticado.', 401));
            }

            const canUseBarcode = await monetizationService.canPatientUseBarcodeScanning(req.user.id);
            res.status(200).json({
                status: 'success',
                data: { canUseBarcode },
            });
        } catch (error: any) {
            console.error('Error en MonetizationController.checkPatientBarcodeScanning:', error);
            if (error instanceof AppError) {
                return next(error);
            }
            next(new AppError('Error al verificar acceso a escaneo de códigos de barras.', 500));
        }
    }

    public async checkPatientAds(req: Request, res: Response, next: NextFunction) {
        try {
            if (!req.user) {
                return next(new AppError('Usuario no autenticado.', 401));
            }

            const shouldShowAds = await monetizationService.shouldPatientSeeAds(req.user.id);
            res.status(200).json({
                status: 'success',
                data: { shouldShowAds },
            });
        } catch (error: any) {
            console.error('Error en MonetizationController.checkPatientAds:', error);
            if (error instanceof AppError) {
                return next(error);
            }
            next(new AppError('Error al verificar configuración de anuncios.', 500));
        }
    }

    // ==================== ENDPOINTS DE REPORTES ====================

    public async getRevenueReport(req: Request, res: Response, next: NextFunction) {
        try {
            if (!req.user || req.user.role.name !== RoleName.ADMIN) {
                return next(new AppError('Acceso denegado. Solo administradores pueden ver reportes de ingresos.', 403));
            }

            const { startDate, endDate } = req.query;
            const start = startDate ? new Date(startDate as string) : new Date(new Date().getFullYear(), 0, 1);
            const end = endDate ? new Date(endDate as string) : new Date();

            const report = await monetizationService.getRevenueReport(start, end);
            res.status(200).json({
                status: 'success',
                data: { report },
            });
        } catch (error: any) {
            console.error('Error en MonetizationController.getRevenueReport:', error);
            if (error instanceof AppError) {
                return next(error);
            }
            next(new AppError('Error al generar reporte de ingresos.', 500));
        }
    }

    public async getUsageReport(req: Request, res: Response, next: NextFunction) {
        try {
            if (!req.user || req.user.role.name !== RoleName.ADMIN) {
                return next(new AppError('Acceso denegado. Solo administradores pueden ver reportes de uso.', 403));
            }

            const report = await monetizationService.getUsageReport();
            res.status(200).json({
                status: 'success',
                data: { report },
            });
        } catch (error: any) {
            console.error('Error en MonetizationController.getUsageReport:', error);
            if (error instanceof AppError) {
                return next(error);
            }
            next(new AppError('Error al generar reporte de uso.', 500));
        }
    }

    public async getTierConversionReport(req: Request, res: Response, next: NextFunction) {
        try {
            if (!req.user || req.user.role.name !== RoleName.ADMIN) {
                return next(new AppError('Acceso denegado. Solo administradores pueden ver reportes de conversión.', 403));
            }

            const report = await monetizationService.getTierConversionReport();
            res.status(200).json({
                status: 'success',
                data: { report },
            });
        } catch (error: any) {
            console.error('Error en MonetizationController.getTierConversionReport:', error);
            if (error instanceof AppError) {
                return next(error);
            }
            next(new AppError('Error al generar reporte de conversión.', 500));
        }
    }

    // ==================== ENDPOINT DE INICIALIZACIÓN ====================

    public async initializeDefaultTiers(req: Request, res: Response, next: NextFunction) {
        try {
            if (!req.user || req.user.role.name !== RoleName.ADMIN) {
                return next(new AppError('Acceso denegado. Solo administradores pueden inicializar tiers.', 403));
            }

            await monetizationService.initializeDefaultTiers();
            
            res.status(200).json({
                status: 'success',
                message: 'Tiers por defecto inicializados exitosamente.',
            });
        } catch (error: any) {
            console.error('Error en MonetizationController.initializeDefaultTiers:', error);
            if (error instanceof AppError) {
                return next(error);
            }
            next(new AppError('Error al inicializar tiers por defecto.', 500));
        }
    }
}

export default new MonetizationController(); 