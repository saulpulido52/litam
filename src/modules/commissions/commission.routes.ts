// src/modules/commissions/commission.routes.ts
import { Router } from 'express';
import { CommissionController } from './commission.controller';
import { CommissionService } from './commission.service';
import { authMiddleware } from '../../middleware/auth.middleware';
import { adminMiddleware } from '../../middleware/admin.middleware';

const router = Router();
const commissionService = new CommissionService();
const commissionController = new CommissionController(commissionService);

// ==================== RUTAS ADMIN ====================

// Calcular comisión mensual para un nutriólogo
router.post(
    '/calculate/:nutritionistId',
    authMiddleware,
    adminMiddleware,
    commissionController.calculateMonthlyCommission.bind(commissionController)
);

// Obtener todas las comisiones (solo admin)
router.get(
    '/all',
    authMiddleware,
    adminMiddleware,
    commissionController.getAllCommissions.bind(commissionController)
);

// Obtener estadísticas de comisiones (solo admin)
router.get(
    '/stats',
    authMiddleware,
    adminMiddleware,
    commissionController.getCommissionStats.bind(commissionController)
);

// Generar reporte de comisiones (solo admin)
router.get(
    '/report',
    authMiddleware,
    adminMiddleware,
    commissionController.generateCommissionReport.bind(commissionController)
);

// Marcar comisión como pagada (solo admin)
router.patch(
    '/:commissionId/mark-paid',
    authMiddleware,
    adminMiddleware,
    commissionController.markCommissionAsPaid.bind(commissionController)
);

// Cancelar comisión (solo admin)
router.patch(
    '/:commissionId/cancel',
    authMiddleware,
    adminMiddleware,
    commissionController.cancelCommission.bind(commissionController)
);

// ==================== RUTAS NUTRIÓLOGO ====================

// Obtener comisiones de un nutriólogo específico
router.get(
    '/nutritionist/:nutritionistId',
    authMiddleware,
    commissionController.getCommissionsByNutritionist.bind(commissionController)
);

// Obtener comisión específica
router.get(
    '/:commissionId',
    authMiddleware,
    commissionController.getCommissionById.bind(commissionController)
);

export default router; 