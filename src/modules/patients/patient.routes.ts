// src/modules/patients/patient.routes.ts
import { Router } from 'express';
import patientController from './patient.controller';
import { protect, authorize } from '../../middleware/auth.middleware';
import { validateMiddleware } from '../../middleware/validation.middleware';
import { CreatePatientDTO, UpdatePatientDTO, PatientsSearchDTO, CreatePatientByNutritionistDTO, BasicPatientRegistrationDTO } from './patient.dto';
import { RoleName } from '../../database/entities/role.entity';

const router = Router();

// ==================== RUTAS PARA NUTRIÓLOGOS ====================

// Verificar si un email ya existe
// ==================== NUEVAS RUTAS PARA LOS DOS ESCENARIOS ====================

// POST /api/patients/register-by-nutritionist - ESCENARIO 1: Nutriólogo registra paciente con expediente completo
router.post('/register-by-nutritionist', protect, authorize(RoleName.NUTRITIONIST), validateMiddleware(CreatePatientByNutritionistDTO), patientController.createPatientByNutritionist);

// POST /api/patients/register-basic - ESCENARIO 2: Registro básico del paciente (público)
router.post('/register-basic', validateMiddleware(BasicPatientRegistrationDTO), patientController.registerBasicPatient);

// ==================== RUTAS PARA NUTRIÓLOGOS ====================

// Verificar si un email ya existe
router.get('/check-email', protect, authorize(RoleName.NUTRITIONIST), patientController.checkEmailExists);

// Obtener todos los pacientes del nutriólogo (con búsqueda y filtros)
router.get('/my-patients', protect, authorize(RoleName.NUTRITIONIST), patientController.getMyPatients);

// Crear un nuevo paciente (RUTA GENÉRICA - DEBE IR DESPUÉS DE LAS ESPECÍFICAS)
router.post('/', protect, authorize(RoleName.NUTRITIONIST), validateMiddleware(CreatePatientDTO), patientController.createPatient);

// Obtener estadísticas de pacientes (PRIMERO - rutas específicas)
router.get('/stats/summary', protect, authorize(RoleName.NUTRITIONIST), patientController.getPatientStats);

// Obtener acciones rápidas para el dashboard (ANTES de /:patientId)
router.get('/quick-actions', protect, authorize(RoleName.NUTRITIONIST), patientController.getQuickActions);

// Obtener un paciente específico por ID (DESPUÉS - rutas con parámetros)
router.get('/:patientId', protect, authorize(RoleName.NUTRITIONIST), patientController.getPatientById);

// Actualizar un paciente
router.put('/:patientId', protect, authorize(RoleName.NUTRITIONIST), validateMiddleware(UpdatePatientDTO), patientController.updatePatient);

// 🎯 NUEVO: Actualizar paciente por EMAIL (más robusto que por ID)
router.put('/by-email/:email', protect, authorize(RoleName.NUTRITIONIST), validateMiddleware(UpdatePatientDTO), patientController.updatePatientByEmail);

// POST /api/patients/register-basic - ESCENARIO 2: Registro básico del paciente (público)
router.post('/register-basic', validateMiddleware(BasicPatientRegistrationDTO), patientController.registerBasicPatient);

// GET /api/patients/requiring-completion - Obtener pacientes que requieren completar expediente
router.get('/requiring-completion', protect, patientController.getPatientsRequiringCompletion);

// PUT /api/patients/:patientId/complete-clinical-record - Completar expediente clínico (nutriólogo)
router.put('/:patientId/complete-clinical-record', protect, authorize(RoleName.NUTRITIONIST), validateMiddleware(UpdatePatientDTO), patientController.completePatientClinicalRecord);

// ==================== RUTAS EXISTENTES CONTINUADAS ====================

// Estas rutas están duplicadas arriba, las comentamos para evitar conflictos
// POST /api/patients - Crear nuevo paciente (método original) - DUPLICADA
// router.post('/', protect, validateMiddleware(CreatePatientDTO), patientController.createPatient);

// GET /api/patients/:id - Obtener paciente específico por ID - DUPLICADA
// router.get('/:id', protect, patientController.getPatientById);

// PUT /api/patients/:id - Actualizar paciente - DUPLICADA  
// router.put('/:id', protect, validateMiddleware(UpdatePatientDTO), patientController.updatePatient);

// ==================== NUEVAS RUTAS ESPECIALIZADAS ====================

// ==================== FUNCIONALIDADES DE ELIMINACIÓN ====================

// DELETE /api/patients/:patientId/relationship - Remover paciente de la lista del nutriólogo (terminar relación)
router.delete('/:patientId/relationship', protect, authorize(RoleName.NUTRITIONIST), patientController.removePatientRelationship);

// DELETE /api/patients/:patientId/account - Eliminar cuenta completa del paciente (solo pacientes/admin)
router.delete('/:patientId/account', protect, patientController.deletePatientAccount);

// POST /api/patients/change-nutritionist - Cambiar nutriólogo (para pacientes)
router.post('/change-nutritionist', protect, authorize(RoleName.PATIENT), patientController.requestNutritionistChange);

// GET /api/patients/my-profile - Ver propio perfil (para pacientes)
router.get('/my-profile', protect, authorize(RoleName.PATIENT), patientController.getMyProfile);

export default router;