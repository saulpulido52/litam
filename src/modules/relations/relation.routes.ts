// src/modules/relations/relation.routes.ts
import { Router } from 'express';
import relationController from '@/modules/relations/relation.controller';
import { protect, authorize } from '@/middleware/auth.middleware';
import { validateMiddleware } from '@/middleware/validation.middleware';
import { RequestRelationDto, UpdateRelationStatusDto } from '@/modules/relations/relation.dto';
import { RoleName } from '@/database/entities/role.entity';
import { RelationshipStatus } from '@/database/entities/patient_nutritionist_relation.entity'; // Asegúrate de importar el enum

const router = Router();

// Rutas para Pacientes
router.route('/request')
    .post(
        protect,
        authorize(RoleName.PATIENT),
        validateMiddleware(RequestRelationDto),
        relationController.requestRelation
    );

router.route('/my-requests')
    .get(
        protect,
        authorize(RoleName.PATIENT),
        relationController.getMyRequests
    );

router.route('/my-nutritionist')
    .get(
        protect,
        authorize(RoleName.PATIENT),
        relationController.getMyActiveNutritionist
    );

// Rutas para Nutriólogos
router.route('/pending-requests')
    .get(
        protect,
        authorize(RoleName.NUTRITIONIST),
        relationController.getMyPendingRequests
    );

router.route('/my-patients')
    .get(
        protect,
        authorize(RoleName.NUTRITIONIST),
        relationController.getMyPatients
    );

router.route('/:id/status') // Para aceptar, rechazar, etc.
    .patch(
        protect,
        authorize(RoleName.NUTRITIONIST),
        validateMiddleware(UpdateRelationStatusDto),
        relationController.updateRelationStatus
    );

export default router;