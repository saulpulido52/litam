import { Router } from 'express';
import clinicalIntegrationController from './clinical_integration.controller';
import { protect } from '../../middleware/auth.middleware';

const router = Router();

// Aplicar middleware de autenticación a todas las rutas
router.use(protect);

/**
 * @route POST /api/growth-charts/clinical-integration/integrate/:recordId
 * @desc Integra datos de crecimiento en un expediente clínico existente
 * @access Nutriólogos y Administradores
 * @params {
 *   recordId: string
 * }
 * @body {
 *   includeAlerts?: boolean,
 *   includeHistory?: boolean
 * }
 */
router.post(
    '/integrate/:recordId',
    clinicalIntegrationController.integrateGrowthData
);

/**
 * @route POST /api/growth-charts/clinical-integration/create-record
 * @desc Crea un expediente clínico automático basado en medición de crecimiento
 * @access Nutriólogos y Administradores
 * @body {
 *   patientId: string,
 *   nutritionistId: string,
 *   measurementData: {
 *     date: string,
 *     ageMonths: number,
 *     weight?: number,
 *     height?: number,
 *     headCircumference?: number
 *   }
 * }
 */
router.post(
    '/create-record',
    clinicalIntegrationController.createGrowthBasedRecord
);

/**
 * @route GET /api/growth-charts/clinical-integration/history/:patientId
 * @desc Obtiene historial de crecimiento desde expedientes clínicos
 * @access Nutriólogos y Administradores
 * @params {
 *   patientId: string
 * }
 * @query {
 *   startDate?: string,
 *   endDate?: string
 * }
 */
router.get(
    '/history/:patientId',
    clinicalIntegrationController.getGrowthHistory
);

/**
 * @route POST /api/growth-charts/clinical-integration/update-existing/:patientId
 * @desc Actualiza expedientes existentes con datos de crecimiento recalculados
 * @access Nutriólogos y Administradores
 * @params {
 *   patientId: string
 * }
 */
router.post(
    '/update-existing/:patientId',
    clinicalIntegrationController.updateExistingRecords
);

/**
 * @route POST /api/growth-charts/clinical-integration/bulk-analysis
 * @desc Análisis de integración masiva para todos los pacientes pediátricos
 * @access Administradores
 * @body {
 *   dryRun?: boolean,
 *   limit?: number
 * }
 */
router.post(
    '/bulk-analysis',
    clinicalIntegrationController.bulkIntegrationAnalysis
);

/**
 * @route GET /api/growth-charts/clinical-integration/stats
 * @desc Obtiene estadísticas de integración de crecimiento
 * @access Nutriólogos y Administradores
 */
router.get(
    '/stats',
    clinicalIntegrationController.getIntegrationStats
);

export default router; 