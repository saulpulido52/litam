import { Router } from 'express';
import pdfExportController from './pdf_export.controller';
import { protect } from '../../middleware/auth.middleware';

const router = Router();

/**
 * @route GET /api/growth-charts/export/download/:fileName
 * @desc Descarga un archivo de reporte generado
 * @access Public (no requiere autenticación para permitir descarga directa)
 * @params {
 *   fileName: string
 * }
 * @note Esta ruta DEBE estar ANTES de router.use(protect) para permitir descargas sin auth
 */
router.get(
    '/download/:fileName',
    pdfExportController.downloadReport
);

// Aplicar middleware de autenticación a las rutas restantes
router.use(protect);

/**
 * @route POST /api/growth-charts/export/pediatric-report
 * @desc Genera un reporte pediátrico completo en PDF
 * @access Nutriólogos y Administradores
 * @body {
 *   patientId: string,
 *   nutritionistId?: string,
 *   includeGrowthCharts?: boolean,
 *   includeAlerts?: boolean,
 *   includeProgressHistory?: boolean,
 *   includeClinicalData?: boolean,
 *   includeRecommendations?: boolean,
 *   chartSource?: 'WHO' | 'CDC',
 *   ageRangeMonths?: [number, number]
 * }
 */
router.post(
    '/pediatric-report',
    pdfExportController.generatePediatricReport
);

/**
 * @route POST /api/growth-charts/export/growth-charts
 * @desc Genera un reporte solo de curvas de crecimiento
 * @access Nutriólogos y Administradores
 * @body {
 *   patientId: string,
 *   metricTypes?: string[],
 *   source?: 'WHO' | 'CDC',
 *   ageRangeMonths?: [number, number]
 * }
 */
router.post(
    '/growth-charts',
    pdfExportController.generateGrowthChartsReport
);

/**
 * @route GET /api/growth-charts/export/reports/:patientId
 * @desc Obtiene la lista de reportes disponibles para un paciente
 * @access Nutriólogos y Administradores
 * @params {
 *   patientId: string
 * }
 * @query {
 *   limit?: string
 * }
 */
router.get(
    '/reports/:patientId',
    pdfExportController.getAvailableReports
);

/**
 * @route DELETE /api/growth-charts/export/reports/:fileName
 * @desc Elimina un reporte específico
 * @access Nutriólogos y Administradores
 * @params {
 *   fileName: string
 * }
 */
router.delete(
    '/reports/:fileName',
    pdfExportController.deleteReport
);

/**
 * @route POST /api/growth-charts/export/cleanup
 * @desc Limpia reportes antiguos (más de 24 horas por defecto)
 * @access Administradores
 * @body {
 *   maxAgeHours?: number
 * }
 */
router.post(
    '/cleanup',
    pdfExportController.cleanupOldReports
);

/**
 * @route GET /api/growth-charts/export/preview/:fileName
 * @desc Obtiene vista previa de un reporte (metadata)
 * @access Nutriólogos y Administradores
 * @params {
 *   fileName: string
 * }
 */
router.get(
    '/preview/:fileName',
    pdfExportController.getReportPreview
);

export default router; 