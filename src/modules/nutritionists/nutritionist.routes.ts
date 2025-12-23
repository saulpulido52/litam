// src/modules/nutritionists/nutritionist.routes.ts
import { Router } from 'express';
import nutritionistController from '../../modules/nutritionists/nutritionist.controller';
import { protect, authorize } from '../../middleware/auth.middleware';
import { validateMiddleware } from '../../middleware/validation.middleware';
import { CreateUpdateNutritionistProfileDto } from '../../modules/nutritionists/nutritionist.dto';
import { RoleName } from '../../database/entities/role.entity';
<<<<<<< HEAD

const router = Router();

=======
import nutritionistReviewsRoutes from './nutritionist-reviews.routes';

const router = Router();

// --- RUTAS PÚBLICAS PARA APP MÓVIL ---
router.get('/available', nutritionistController.getAvailableNutritionists);
router.get('/:nutritionistId/profile', nutritionistController.getNutritionistProfileForMobile);

// --- RUTAS DE REVIEWS (PÚBLICAS Y PROTEGIDAS) ---
router.use('/reviews', nutritionistReviewsRoutes);

// --- RUTAS PROTEGIDAS PARA NUTRIÓLOGOS ---
>>>>>>> nutri/main
router.use(protect, authorize(RoleName.NUTRITIONIST));

router.get('/me/profile', nutritionistController.getMyProfile);
router.patch(
    '/me/profile',
    validateMiddleware(CreateUpdateNutritionistProfileDto),
    nutritionistController.createOrUpdateMyProfile
);

export default router;