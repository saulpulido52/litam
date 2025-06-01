// src/modules/patients/patient.routes.ts
import { Router } from 'express';
import patientController from '@/modules/patients/patient.controller';
import { protect, authorize } from '@/middleware/auth.middleware';
import { validateMiddleware } from '@/middleware/validation.middleware';
import { CreateUpdatePatientProfileDto } from '@/modules/patients/patient.dto'; // Importar el DTO
import { RoleName } from '@/database/entities/role.entity';

const router = Router();

// Todas estas rutas requieren que el usuario esté autenticado y sea un paciente
router.use(protect, authorize(RoleName.PATIENT));

router.get('/me/profile', patientController.getMyProfile);
router.patch( // Usamos PATCH para permitir actualizaciones parciales
    '/me/profile',
    validateMiddleware(CreateUpdatePatientProfileDto),
    patientController.createOrUpdateMyProfile
);

// Podrías tener un POST si siempre se crea el perfil inicial
// router.post(
//     '/me/profile',
//     validateMiddleware(CreateUpdatePatientProfileDto),
//     patientController.createOrUpdateMyProfile
// );

export default router;