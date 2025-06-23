// src/modules/patients/patient.routes.ts
import { Router } from 'express';
import patientController from '@/modules/patients/patient.controller';
import { protect, authorize } from '@/middleware/auth.middleware';
import { validateMiddleware } from '@/middleware/validation.middleware';
import { CreatePatientDTO, UpdatePatientDTO, PatientsSearchDTO } from '@/modules/patients/patient.dto';
import { RoleName } from '@/database/entities/role.entity';

const router = Router();

// ==================== RUTAS PARA NUTRIÓLOGOS ====================

// Obtener todos los pacientes del nutriólogo (con búsqueda y filtros)
router.get('/my-patients', protect, authorize(RoleName.NUTRITIONIST), patientController.getMyPatients);

// Crear un nuevo paciente
router.post('/', protect, authorize(RoleName.NUTRITIONIST), validateMiddleware(CreatePatientDTO), patientController.createPatient);

// Obtener un paciente específico por ID
router.get('/:patientId', protect, authorize(RoleName.NUTRITIONIST), patientController.getPatientById);

// Actualizar un paciente
router.put('/:patientId', protect, authorize(RoleName.NUTRITIONIST), validateMiddleware(UpdatePatientDTO), patientController.updatePatient);

// Obtener estadísticas de pacientes
router.get('/stats/summary', protect, authorize(RoleName.NUTRITIONIST), patientController.getPatientStats);

// ==================== RUTAS EXISTENTES ====================
// GET /api/patients - Obtener todos los pacientes del nutricionista autenticado
router.get('/', protect, patientController.getMyPatients);

// GET /api/patients/stats - Obtener estadísticas de pacientes
router.get('/stats', protect, patientController.getPatientStats);

// ==================== NUEVAS RUTAS PARA LOS DOS ESCENARIOS ====================

// POST /api/patients/register-by-nutritionist - ESCENARIO 1: Nutriólogo registra paciente con expediente completo
router.post('/register-by-nutritionist', protect, validateMiddleware, patientController.createPatientByNutritionist);

// POST /api/patients/register-basic - ESCENARIO 2: Registro básico del paciente (público)
router.post('/register-basic', validateMiddleware, patientController.registerBasicPatient);

// GET /api/patients/requiring-completion - Obtener pacientes que requieren completar expediente
router.get('/requiring-completion', protect, patientController.getPatientsRequiringCompletion);

// PUT /api/patients/:patientId/complete-clinical-record - Completar expediente clínico (nutriólogo)
router.put('/:patientId/complete-clinical-record', protect, validateMiddleware, patientController.completePatientClinicalRecord);

// ==================== RUTAS EXISTENTES CONTINUADAS ====================

// POST /api/patients - Crear nuevo paciente (método original)
router.post('/', protect, validateMiddleware, patientController.createPatient);

// GET /api/patients/:id - Obtener paciente específico por ID
router.get('/:id', protect, patientController.getPatientById);

// PUT /api/patients/:id - Actualizar paciente
router.put('/:id', protect, validateMiddleware, patientController.updatePatient);

// ==================== NUEVAS RUTAS ESPECIALIZADAS ====================

// DELETE /api/patients/:patientId/account - Eliminar cuenta completa del paciente
router.delete('/:patientId/account', protect, patientController.deletePatientAccount);

// POST /api/patients/change-nutritionist - Cambiar nutriólogo (para pacientes)
router.post('/change-nutritionist', protect, authorize(RoleName.PATIENT), patientController.requestNutritionistChange);

// GET /api/patients/my-profile - Ver propio perfil (para pacientes)
router.get('/my-profile', protect, authorize(RoleName.PATIENT), patientController.getMyProfile);

export default router;