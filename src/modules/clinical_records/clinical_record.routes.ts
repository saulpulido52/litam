// src/modules/clinical_records/clinical_record.routes.ts
import { Router } from 'express';
import clinicalRecordController from '@/modules/clinical_records/clinical_record.controller';
import { protect, authorize } from '@/middleware/auth.middleware';
import { validateMiddleware } from '@/middleware/validation.middleware';
import { CreateUpdateClinicalRecordDto } from '@/modules/clinical_records/clinical_record.dto';
import { RoleName } from '@/database/entities/role.entity';

const router = Router();

// Todas las rutas de registros clínicos requieren autenticación
router.use(protect);

// --- Rutas para Nutriólogos y Administradores (Crear, Actualizar, Eliminar) ---
router.route('/')
    .post(
        authorize(RoleName.NUTRITIONIST, RoleName.ADMIN),
        validateMiddleware(CreateUpdateClinicalRecordDto),
        clinicalRecordController.createClinicalRecord
    );

// Obtener registros clínicos de un paciente específico (Nutriólogo, Admin)
// Nota: Un paciente puede ver sus propios registros vía /api/clinical-records/me
router.get(
    '/patient/:patientId',
    authorize(RoleName.NUTRITIONIST, RoleName.ADMIN),
    clinicalRecordController.getPatientClinicalRecords // Filtrado por query params
);

router.route('/:id') // Gestión de un registro específico por su ID
    .get(
        // Acceso para paciente (si es su registro), nutriólogo (si es su paciente o lo creó), admin
        clinicalRecordController.getClinicalRecordById
    )
    .patch(
        authorize(RoleName.NUTRITIONIST, RoleName.ADMIN),
        validateMiddleware(CreateUpdateClinicalRecordDto),
        clinicalRecordController.updateClinicalRecord
    )
    .delete(
        authorize(RoleName.NUTRITIONIST, RoleName.ADMIN),
        clinicalRecordController.deleteClinicalRecord
    );

// --- Rutas especializadas para gestión de expedientes ---

// Transferir expedientes entre nutriólogos (solo administradores)
router.post(
    '/transfer',
    authorize(RoleName.ADMIN),
    clinicalRecordController.transferPatientRecords
);

// Eliminar todos los expedientes de un paciente (solo cuando elimina su cuenta)
router.delete(
    '/patient/:patientId/all',
    clinicalRecordController.deleteAllPatientRecords
);

// Obtener estadísticas de expedientes de un paciente
router.get(
    '/patient/:patientId/stats',
    clinicalRecordController.getPatientRecordsStats
);

export default router;