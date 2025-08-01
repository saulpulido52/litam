// src/modules/commissions/commission.routes.ts
import { Router } from 'express';
import { CommissionController } from './commission.controller';
import { CommissionService } from './commission.service';
import { protect, authorize } from '../../middleware/auth.middleware';
import { RoleName } from '../../database/entities/role.entity';
import { AppDataSource } from '../../database/data-source';
import { NutritionistCommission } from '../../database/entities/nutritionist_commission.entity';
import { User } from '../../database/entities/user.entity';
import { Appointment } from '../../database/entities/appointment.entity';
import { PatientNutritionistRelation } from '../../database/entities/patient_nutritionist_relation.entity';

const router = Router();

// Crear el servicio con las dependencias necesarias
const commissionService = new CommissionService(
    AppDataSource.getRepository(NutritionistCommission),
    AppDataSource.getRepository(User),
    AppDataSource.getRepository(Appointment),
    AppDataSource.getRepository(PatientNutritionistRelation)
);
const commissionController = new CommissionController(commissionService);

// ==================== RUTAS ADMIN ====================

// Calcular comisión mensual para un nutriólogo
router.post(
    '/calculate/:nutritionistId',
    protect,
    authorize(RoleName.ADMIN),
    commissionController.calculateMonthlyCommission.bind(commissionController)
);

// Obtener todas las comisiones (solo admin)
router.get(
    '/all',
    protect,
    authorize(RoleName.ADMIN),
    commissionController.getAllCommissions.bind(commissionController)
);

// Obtener estadísticas de comisiones (solo admin)
router.get(
    '/stats',
    protect,
    authorize(RoleName.ADMIN),
    commissionController.getCommissionStats.bind(commissionController)
);

// Generar reporte de comisiones (solo admin)
router.get(
    '/report',
    protect,
    authorize(RoleName.ADMIN),
    commissionController.generateCommissionReport.bind(commissionController)
);

// Marcar comisión como pagada (solo admin)
router.patch(
    '/:commissionId/mark-paid',
    protect,
    authorize(RoleName.ADMIN),
    commissionController.markCommissionAsPaid.bind(commissionController)
);

// Cancelar comisión (solo admin)
router.patch(
    '/:commissionId/cancel',
    protect,
    authorize(RoleName.ADMIN),
    commissionController.cancelCommission.bind(commissionController)
);

// ==================== RUTAS NUTRIÓLOGO ====================

// Obtener comisiones de un nutriólogo específico
router.get(
    '/nutritionist/:nutritionistId',
    protect,
    commissionController.getCommissionsByNutritionist.bind(commissionController)
);

// Obtener comisión específica
router.get(
    '/:commissionId',
    protect,
    commissionController.getCommissionById.bind(commissionController)
);

export default router; 