// src/modules/nutritionists/nutritionist-registration.routes.ts
import { Router } from 'express';
import { nutritionistRegistrationController } from './nutritionist-registration.controller';
import { protect, authorize } from '../../middleware/auth.middleware';
import { RoleName } from '../../database/entities/role.entity';
import { validateMiddleware } from '../../middleware/validation.middleware';
import { NutritionistRegistrationDto, NutritionistVerificationDto, DocumentUploadDto } from './nutritionist-registration.dto';

const router = Router();

// ==================== RUTAS PÚBLICAS ====================

// Registro de nutriólogos (público)
router.post(
    '/register', 
    validateMiddleware(NutritionistRegistrationDto), 
    nutritionistRegistrationController.registerNutritionist
);

// ==================== RUTAS PROTEGIDAS ====================

// Subir documentos (nutriólogo propietario o admin)
router.post(
    '/:profileId/documents',
    protect,
    validateMiddleware(DocumentUploadDto),
    nutritionistRegistrationController.uploadDocument
);

// ==================== RUTAS DE ADMINISTRACIÓN ====================

// Buscar nutriólogos (solo admins)
router.get(
    '/admin/search',
    protect,
    authorize(RoleName.ADMIN),
    nutritionistRegistrationController.searchNutritionists
);

// Obtener estadísticas (solo admins)
router.get(
    '/admin/stats',
    protect,
    authorize(RoleName.ADMIN),
    nutritionistRegistrationController.getNutritionistsStats
);

// Obtener detalles completos de un nutriólogo (solo admins)
router.get(
    '/admin/:profileId',
    protect,
    authorize(RoleName.ADMIN),
    nutritionistRegistrationController.getNutritionistDetails
);

// Verificar (aprobar/rechazar) nutriólogo (solo admins)
router.put(
    '/admin/:profileId/verify',
    protect,
    authorize(RoleName.ADMIN),
    validateMiddleware(NutritionistVerificationDto),
    nutritionistRegistrationController.verifyNutritionist
);

export default router;