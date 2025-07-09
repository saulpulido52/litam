// src/modules/monetization/monetization.routes.ts
import { Router } from 'express';
import monetizationController from '../../modules/monetization/monetization.controller';
import { protect, authorize } from '../../middleware/auth.middleware';
import { RoleName } from '../../database/entities/role.entity';

const router = Router();

// ==================== RUTAS PÚBLICAS ====================

// Obtener tiers de nutriólogos (público para que los nutriólogos vean las opciones)
router.get('/nutritionist-tiers', monetizationController.getNutritionistTiers);

// Obtener un tier específico de nutriólogo
router.get('/nutritionist-tiers/:id', monetizationController.getNutritionistTierById);

// Obtener tiers de pacientes (público para que los pacientes vean las opciones)
router.get('/patient-tiers', monetizationController.getPatientTiers);

// Obtener un tier específico de paciente
router.get('/patient-tiers/:id', monetizationController.getPatientTierById);

// ==================== RUTAS PROTEGIDAS PARA VALIDACIÓN DE FUNCIONALIDADES ====================

// Verificar acceso a IA para nutriólogos
router.get('/check/nutritionist/ai-access', protect, authorize(RoleName.NUTRITIONIST), monetizationController.checkNutritionistAIAccess);

// Verificar acceso a pacientes ilimitados para nutriólogos
router.get('/check/nutritionist/unlimited-patients', protect, authorize(RoleName.NUTRITIONIST), monetizationController.checkNutritionistUnlimitedPatients);

// Verificar acceso a escaneo de alimentos con IA para pacientes
router.get('/check/patient/ai-food-scanning', protect, authorize(RoleName.PATIENT), monetizationController.checkPatientAIFoodScanning);

// Verificar acceso a escaneo de códigos de barras para pacientes
router.get('/check/patient/barcode-scanning', protect, authorize(RoleName.PATIENT), monetizationController.checkPatientBarcodeScanning);

// Verificar configuración de anuncios para pacientes
router.get('/check/patient/ads', protect, authorize(RoleName.PATIENT), monetizationController.checkPatientAds);

// ==================== RUTAS SOLO PARA ADMINISTRADORES ====================

// Asignar tier a nutriólogo
router.post('/assign/nutritionist-tier', protect, authorize(RoleName.ADMIN), monetizationController.assignNutritionistTier);

// Asignar tier a paciente
router.post('/assign/patient-tier', protect, authorize(RoleName.ADMIN), monetizationController.assignPatientTier);

// Obtener estadísticas de tiers de nutriólogos
router.get('/stats/nutritionist-tiers', protect, authorize(RoleName.ADMIN), monetizationController.getNutritionistTierStats);

// Obtener estadísticas de tiers de pacientes
router.get('/stats/patient-tiers', protect, authorize(RoleName.ADMIN), monetizationController.getPatientTierStats);

// Inicializar tiers por defecto
router.post('/initialize-default-tiers', protect, authorize(RoleName.ADMIN), monetizationController.initializeDefaultTiers);

// ==================== RUTAS DE REPORTES ====================

// Reporte de ingresos
router.get('/reports/revenue', protect, authorize(RoleName.ADMIN), monetizationController.getRevenueReport);

// Reporte de uso
router.get('/reports/usage', protect, authorize(RoleName.ADMIN), monetizationController.getUsageReport);

// Reporte de conversión de tiers
router.get('/reports/conversion', protect, authorize(RoleName.ADMIN), monetizationController.getTierConversionReport);

export default router; 