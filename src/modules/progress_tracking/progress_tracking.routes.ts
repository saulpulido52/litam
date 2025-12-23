// src/modules/progress_tracking/progress_tracking.routes.ts
import { Router } from 'express';
import progressTrackingController from '../../modules/progress_tracking/progress_tracking.controller';
import { protect } from '../../middleware/auth.middleware';
import { validateMiddleware } from '../../middleware/validation.middleware';
import { CreateUpdateProgressLogDto, SearchProgressLogsDto } from './progress_tracking.dto';

const router = Router();

// Aplicar autenticación a todas las rutas
router.use(protect);

// Rutas para pacientes (gestionar su propio progreso)
router.post(
    '/create',
    validateMiddleware(CreateUpdateProgressLogDto),
    progressTrackingController.createProgressLog
);

router.get(
    '/me',
    progressTrackingController.getMyProgressLogs
);

router.put(
    '/:id',
    validateMiddleware(CreateUpdateProgressLogDto),
    progressTrackingController.updateProgressLog
);

router.delete(
    '/:id',
    progressTrackingController.deleteProgressLog
);

// Rutas para nutriólogos (ver progreso de sus pacientes)
router.get(
    '/patient/:patientId',
    progressTrackingController.getPatientProgressLogs
);

// --- NUEVAS RUTAS PARA ANÁLISIS AUTOMÁTICO ---

// Generar análisis automático y crear logs basados en expedientes y planes de dieta
router.post(
    '/patient/:patientId/generate-automatic',
    progressTrackingController.generateAutomaticProgress
);

// Obtener análisis de progreso sin generar logs
router.get(
    '/patient/:patientId/analysis',
    progressTrackingController.getProgressAnalysis
);

export default router;