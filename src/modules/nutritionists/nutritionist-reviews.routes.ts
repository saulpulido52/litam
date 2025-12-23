// src/modules/nutritionists/nutritionist-reviews.routes.ts
import { Router } from 'express';
import nutritionistReviewsController from './nutritionist-reviews.controller';
import { protect } from '../../middleware/auth.middleware';

const router = Router();

// ==================== RUTAS PÚBLICAS ====================
// Obtener reseñas de un nutriólogo (público - no requiere autenticación)
router.get('/nutritionist/:nutritionistId/reviews', nutritionistReviewsController.getNutritionistReviews);

// Obtener estadísticas de reviews de un nutriólogo (público)
router.get('/nutritionist/:nutritionistId/reviews/stats', nutritionistReviewsController.getNutritionistReviewsStats);

// ==================== RUTAS QUE REQUIEREN AUTENTICACIÓN ====================
// Verificar si un paciente puede dejar una reseña
router.get('/nutritionist/:nutritionistId/can-review', protect, nutritionistReviewsController.canPatientReview);

// Obtener la reseña existente de un paciente para un nutriólogo
router.get('/nutritionist/:nutritionistId/my-review', protect, nutritionistReviewsController.getPatientReview);

// Crear una nueva reseña (solo pacientes)
router.post('/nutritionist/:nutritionistId/reviews', protect, nutritionistReviewsController.createReview);

// ==================== RUTAS ADMINISTRATIVAS ====================
// Moderar reseñas (solo admin)
router.patch('/reviews/:reviewId/moderate', protect, nutritionistReviewsController.moderateReview);

export default router; 