// src/modules/progress_tracking/progress_tracking.routes.ts
import { Router } from 'express';
import progressTrackingController from '../../modules/progress_tracking/progress_tracking.controller';
import { protect, authorize } from '../../middleware/auth.middleware';
import { validateMiddleware } from '../../middleware/validation.middleware';
import {
    CreateUpdateProgressLogDto,
    SearchProgressLogsDto,
} from '../../modules/progress_tracking/progress_tracking.dto';
import { RoleName } from '../../database/entities/role.entity';

const router = Router();

// Todas las rutas debajo de este punto requieren autenticación
router.use(protect);

// --- Rutas para Pacientes (gestionan su propio progreso) ---
router.route('/me')
    .post(
        authorize(RoleName.PATIENT),
        validateMiddleware(CreateUpdateProgressLogDto),
        progressTrackingController.createProgressLog
    )
    .get(
        authorize(RoleName.PATIENT),
        validateMiddleware(SearchProgressLogsDto), // Validar query params
        progressTrackingController.getMyProgressLogs
    );

router.route('/:id') // Para actualizar o eliminar un registro específico del paciente
    .patch(
        authorize(RoleName.PATIENT),
        validateMiddleware(CreateUpdateProgressLogDto),
        progressTrackingController.updateProgressLog
    )
    .delete(
        authorize(RoleName.PATIENT),
        progressTrackingController.deleteProgressLog
    );

// --- Rutas para Nutriólogos (ver progreso de sus pacientes) ---
router.route('/patient/:patientId') // Para que el nutriólogo vea los logs de un paciente específico
    .get(
        authorize(RoleName.NUTRITIONIST), // Admin también podría tener acceso si se desea
        validateMiddleware(SearchProgressLogsDto),
        progressTrackingController.getPatientProgressLogs
    );

export default router;