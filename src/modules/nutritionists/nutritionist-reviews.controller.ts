// src/modules/nutritionists/nutritionist-reviews.controller.ts
import { Request, Response } from 'express';
import nutritionistReviewsService, { CreateReviewDTO } from './nutritionist-reviews.service';

export class NutritionistReviewsController {
    
    // ==================== CREAR REVIEW ====================
    async createReview(req: Request, res: Response): Promise<void> {
        try {
            if (!req.user) {
                res.status(401).json({
                    success: false,
                    message: 'Usuario no autenticado'
                });
                return;
            }

            const data: CreateReviewDTO = {
                nutritionist_id: req.params.nutritionistId,
                patient_id: req.user.id, // Del middleware de autenticación
                rating: req.body.rating,
                comment: req.body.comment,
                communication_rating: req.body.communication_rating,
                professionalism_rating: req.body.professionalism_rating,
                results_rating: req.body.results_rating,
                punctuality_rating: req.body.punctuality_rating,
                would_recommend: req.body.would_recommend,
                consultation_duration_months: req.body.consultation_duration_months,
                treatment_type: req.body.treatment_type
            };

            const review = await nutritionistReviewsService.createReview(data);

            res.status(201).json({
                success: true,
                message: 'Reseña creada exitosamente',
                data: review
            });
        } catch (error: any) {
            console.error('Error creating review:', error);
            res.status(error.statusCode || 500).json({
                success: false,
                message: error.message || 'Error interno del servidor'
            });
        }
    }

    // ==================== OBTENER REVIEWS DE UN NUTRIÓLOGO ====================
    async getNutritionistReviews(req: Request, res: Response): Promise<void> {
        try {
            const nutritionistId = req.params.nutritionistId;
            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 10;

            const result = await nutritionistReviewsService.getNutritionistReviews(nutritionistId, page, limit);

            res.status(200).json({
                success: true,
                message: 'Reseñas obtenidas exitosamente',
                data: result
            });
        } catch (error: any) {
            console.error('Error getting nutritionist reviews:', error);
            res.status(error.statusCode || 500).json({
                success: false,
                message: error.message || 'Error interno del servidor'
            });
        }
    }

    // ==================== OBTENER ESTADÍSTICAS DE REVIEWS ====================
    async getNutritionistReviewsStats(req: Request, res: Response): Promise<void> {
        try {
            const nutritionistId = req.params.nutritionistId;
            const stats = await nutritionistReviewsService.getNutritionistReviewsStats(nutritionistId);

            res.status(200).json({
                success: true,
                message: 'Estadísticas obtenidas exitosamente',
                data: stats
            });
        } catch (error: any) {
            console.error('Error getting nutritionist review stats:', error);
            res.status(error.statusCode || 500).json({
                success: false,
                message: error.message || 'Error interno del servidor'
            });
        }
    }

    // ==================== VERIFICAR SI PACIENTE PUEDE DEJAR REVIEW ====================
    async canPatientReview(req: Request, res: Response): Promise<void> {
        try {
            if (!req.user) {
                res.status(401).json({
                    success: false,
                    message: 'Usuario no autenticado'
                });
                return;
            }

            const nutritionistId = req.params.nutritionistId;
            const patientId = req.user.id;

            const result = await nutritionistReviewsService.canPatientReviewNutritionist(patientId, nutritionistId);

            res.status(200).json({
                success: true,
                message: 'Verificación completada',
                data: result
            });
        } catch (error: any) {
            console.error('Error checking if patient can review:', error);
            res.status(error.statusCode || 500).json({
                success: false,
                message: error.message || 'Error interno del servidor'
            });
        }
    }

    // ==================== OBTENER REVIEW EXISTENTE DE PACIENTE ====================
    async getPatientReview(req: Request, res: Response): Promise<void> {
        try {
            if (!req.user) {
                res.status(401).json({
                    success: false,
                    message: 'Usuario no autenticado'
                });
                return;
            }

            const nutritionistId = req.params.nutritionistId;
            const patientId = req.user.id;

            const review = await nutritionistReviewsService.getPatientReviewForNutritionist(patientId, nutritionistId);

            res.status(200).json({
                success: true,
                message: review ? 'Reseña encontrada' : 'No hay reseña',
                data: review
            });
        } catch (error: any) {
            console.error('Error getting patient review:', error);
            res.status(error.statusCode || 500).json({
                success: false,
                message: error.message || 'Error interno del servidor'
            });
        }
    }

    // ==================== MODERAR REVIEW (SOLO ADMIN) ====================
    async moderateReview(req: Request, res: Response): Promise<void> {
        try {
            const reviewId = req.params.reviewId;
            const { action, reason } = req.body;

            const review = await nutritionistReviewsService.moderateReview(reviewId, action, reason);

            res.status(200).json({
                success: true,
                message: `Reseña ${action === 'flag' ? 'reportada' : action === 'hide' ? 'ocultada' : action === 'show' ? 'mostrada' : 'verificada'} exitosamente`,
                data: review
            });
        } catch (error: any) {
            console.error('Error moderating review:', error);
            res.status(error.statusCode || 500).json({
                success: false,
                message: error.message || 'Error interno del servidor'
            });
        }
    }
}

export default new NutritionistReviewsController(); 