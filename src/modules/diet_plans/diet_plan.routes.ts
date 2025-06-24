// src/modules/diet_plans/diet_plan.routes.ts
import { Router } from 'express';
import dietPlanController from '../../modules/diet_plans/diet_plan.controller';
import { protect, authorize } from '../../middleware/auth.middleware';
import { validateMiddleware } from '../../middleware/validation.middleware';
import {
    CreateDietPlanDto,
    UpdateDietPlanDto,
    GenerateDietPlanAiDto,
    UpdateDietPlanStatusDto, // Importar el nuevo DTO
} from '../../modules/diet_plans/diet_plan.dto';
import { RoleName } from '../../database/entities/role.entity';

const router = Router();

// Rutas protegidas (todos deben estar logueados)
router.use(protect);

// Obtener un plan de dieta específico por ID (Nutriólogo, Paciente, Admin)
router.get('/:id', dietPlanController.getDietPlanById);

// Obtener todos los planes de dieta para un paciente específico (Paciente, Nutriólogo, Admin)
router.get('/patient/:patientId', dietPlanController.getDietPlansForPatient);

// Rutas solo para Nutriólogos (y Admin si se quiere dar ese permiso)
router.use(authorize(RoleName.NUTRITIONIST)); // Las siguientes rutas son solo para nutriólogos

// Crear un plan de dieta manualmente
router.post(
    '/',
    validateMiddleware(CreateDietPlanDto),
    dietPlanController.createDietPlan
);

// Generar un plan de dieta usando IA
router.post(
    '/generate-ai',
    validateMiddleware(GenerateDietPlanAiDto),
    dietPlanController.generateDietPlanByAI
);

// Actualizar un plan de dieta (parcialmente)
router.patch(
    '/:id',
    validateMiddleware(UpdateDietPlanDto),
    dietPlanController.updateDietPlan
);

// Actualizar solo el estado de un plan de dieta
router.patch(
    '/:id/status',
    validateMiddleware(UpdateDietPlanStatusDto), // Usar el DTO para el estado
    dietPlanController.updateDietPlanStatus
);

// Eliminar un plan de dieta
router.delete(
    '/:id',
    authorize(RoleName.NUTRITIONIST, RoleName.ADMIN), // Autorización explícita para eliminar
    dietPlanController.deleteDietPlan
);

export default router;