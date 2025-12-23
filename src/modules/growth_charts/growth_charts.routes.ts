// src/modules/growth_charts/growth_charts.routes.ts
import { Router } from 'express';
import growthChartsController from './growth_charts.controller';
import { protect } from '../../middleware/auth.middleware';
import { RoleName } from '../../database/entities/role.entity';

const router = Router();

// Aplicar middleware de autenticación a todas las rutas
router.use(protect);

/**
 * @route POST /api/growth-charts/calculate-percentile
 * @desc Calcula el percentil y z-score para un valor específico
 * @access Nutriólogos y Administradores
 * @body {
 *   ageMonths: number,
 *   value: number,
 *   gender: 'male' | 'female',
 *   metricType: 'weight_for_age' | 'height_for_age' | 'bmi_for_age' | 'weight_for_height' | 'head_circumference',
 *   source?: 'WHO' | 'CDC'
 * }
 */
router.post(
    '/calculate-percentile',
    protect,
    growthChartsController.calculatePercentile
);

/**
 * @route GET /api/growth-charts/chart-data
 * @desc Obtiene datos para generar curvas de crecimiento
 * @access Nutriólogos y Administradores
 * @query {
 *   metricType: string,
 *   gender: string,
 *   source?: string,
 *   startAge?: string,
 *   endAge?: string
 * }
 */
router.get(
    '/chart-data',
    protect,
    growthChartsController.getChartData
);

/**
 * @route POST /api/growth-charts/calculate-multiple
 * @desc Calcula múltiples métricas de crecimiento para un paciente
 * @access Nutriólogos y Administradores
 * @body {
 *   ageMonths: number,
 *   weight: number,
 *   height: number,
 *   gender: 'male' | 'female',
 *   source?: 'WHO' | 'CDC'
 * }
 */
router.post(
    '/calculate-multiple',
    protect,
    growthChartsController.calculateMultipleMetrics
);

/**
 * @route GET /api/growth-charts/available-references
 * @desc Obtiene información sobre las referencias de crecimiento disponibles
 * @access Nutriólogos y Administradores
 */
router.get(
    '/available-references',
    protect,
    growthChartsController.getAvailableReferences
);

/**
 * @route POST /api/growth-charts/analyze-growth-trend
 * @desc Analiza la tendencia de crecimiento de un paciente a lo largo del tiempo
 * @access Nutriólogos y Administradores
 * @body {
 *   patientId: string,
 *   measurements: Array<{
 *     date: string,
 *     ageMonths: number,
 *     weight: number,
 *     height: number,
 *     gender: 'male' | 'female'
 *   }>
 * }
 */
router.post(
    '/analyze-growth-trend',
    protect,
    growthChartsController.analyzeGrowthTrend
);

export default router; 