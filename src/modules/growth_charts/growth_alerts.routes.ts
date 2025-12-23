import { Router } from 'express';
import growthAlertsController from './growth_alerts.controller';
import { protect } from '../../middleware/auth.middleware';

const router = Router();

// Aplicar middleware de autenticación a todas las rutas
router.use(protect);

/**
 * @route POST /api/growth-alerts/evaluate-measurement
 * @desc Evalúa una nueva medición y genera alertas automáticas
 * @access Nutriólogos y Administradores
 * @body {
 *   patientId: string,
 *   date: string,
 *   ageMonths: number,
 *   weight?: number,
 *   height?: number,
 *   headCircumference?: number,
 *   gender: 'male' | 'female'
 * }
 */
router.post(
    '/evaluate-measurement',
    growthAlertsController.evaluateMeasurement
);

/**
 * @route GET /api/growth-alerts/patient/:patientId
 * @desc Obtiene alertas activas para un paciente específico
 * @access Nutriólogos y Administradores
 * @params {
 *   patientId: string
 * }
 */
router.get(
    '/patient/:patientId',
    growthAlertsController.getPatientAlerts
);

/**
 * @route GET /api/growth-alerts/nutritionist/:nutritionistId
 * @desc Obtiene alertas activas para un nutriólogo
 * @access Nutriólogos y Administradores
 * @params {
 *   nutritionistId: string
 * }
 * @query {
 *   page?: string,
 *   limit?: string,
 *   severity?: 'low' | 'medium' | 'high' | 'critical',
 *   alertType?: string
 * }
 */
router.get(
    '/nutritionist/:nutritionistId',
    growthAlertsController.getNutritionistAlerts
);

/**
 * @route PUT /api/growth-alerts/:alertId/acknowledge
 * @desc Marca una alerta como reconocida
 * @access Nutriólogos y Administradores
 * @params {
 *   alertId: string
 * }
 * @body {
 *   acknowledgedById: string
 * }
 */
router.put(
    '/:alertId/acknowledge',
    growthAlertsController.acknowledgeAlert
);

/**
 * @route PUT /api/growth-alerts/:alertId/resolve
 * @desc Resuelve una alerta
 * @access Nutriólogos y Administradores
 * @params {
 *   alertId: string
 * }
 * @body {
 *   resolvedById: string,
 *   resolutionNotes?: string
 * }
 */
router.put(
    '/:alertId/resolve',
    growthAlertsController.resolveAlert
);

/**
 * @route GET /api/growth-alerts/:alertId
 * @desc Obtiene detalle completo de una alerta
 * @access Nutriólogos y Administradores
 * @params {
 *   alertId: string
 * }
 */
router.get(
    '/:alertId',
    growthAlertsController.getAlertDetail
);

/**
 * @route GET /api/growth-alerts/statistics/:nutritionistId?
 * @desc Obtiene estadísticas de alertas
 * @access Nutriólogos y Administradores
 * @params {
 *   nutritionistId?: string (opcional para estadísticas globales)
 * }
 */
router.get(
    '/statistics/:nutritionistId?',
    growthAlertsController.getStatistics
);

/**
 * @route GET /api/growth-alerts/dashboard-summary/:nutritionistId?
 * @desc Obtiene resumen de alertas para dashboard
 * @access Nutriólogos y Administradores
 * @params {
 *   nutritionistId?: string (opcional para resumen global)
 * }
 */
router.get(
    '/dashboard-summary/:nutritionistId?',
    growthAlertsController.getDashboardSummary
);

export default router; 