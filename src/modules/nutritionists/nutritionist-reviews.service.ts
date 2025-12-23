// src/modules/nutritionists/nutritionist-reviews.service.ts
import { Repository } from 'typeorm';
import { NutritionistReview } from '../../database/entities/nutritionist_review.entity';
import { NutritionistProfile } from '../../database/entities/nutritionist_profile.entity';
import { User } from '../../database/entities/user.entity';
import { Appointment, AppointmentStatus } from '../../database/entities/appointment.entity';
import { AppDataSource } from '../../database/data-source';
import { AppError } from '../../utils/app.error';
import { RoleName } from '../../database/entities/role.entity';

export interface CreateReviewDTO {
    nutritionist_id: string;
    patient_id: string;
    rating: number;
    comment?: string;
    communication_rating?: number;
    professionalism_rating?: number;
    results_rating?: number;
    punctuality_rating?: number;
    would_recommend?: boolean;
    consultation_duration_months?: number;
    treatment_type?: string;
}

export interface ReviewsStatsDTO {
    average_rating: number;
    total_reviews: number;
    verified_reviews: number;
    rating_distribution: {
        5: number;
        4: number;
        3: number;
        2: number;
        1: number;
    };
    recommendation_percentage: number;
}

export class NutritionistReviewsService {
    private reviewRepository: Repository<NutritionistReview>;
    private userRepository: Repository<User>;
    private appointmentRepository: Repository<Appointment>;
    private nutritionistProfileRepository: Repository<NutritionistProfile>;

    constructor() {
        this.reviewRepository = AppDataSource.getRepository(NutritionistReview);
        this.userRepository = AppDataSource.getRepository(User);
        this.appointmentRepository = AppDataSource.getRepository(Appointment);
        this.nutritionistProfileRepository = AppDataSource.getRepository(NutritionistProfile);
    }

    // ==================== CREAR REVIEW ====================
    async createReview(data: CreateReviewDTO): Promise<NutritionistReview> {
        // Validar que el nutriólogo existe y es nutriólogo
        const nutritionist = await this.userRepository.findOne({
            where: { id: data.nutritionist_id },
            relations: ['role']
        });

        if (!nutritionist || nutritionist.role.name !== RoleName.NUTRITIONIST) {
            throw new AppError('Nutriólogo no encontrado', 404);
        }

        // Validar que el paciente existe y es paciente
        const patient = await this.userRepository.findOne({
            where: { id: data.patient_id },
            relations: ['role']
        });

        if (!patient || patient.role.name !== RoleName.PATIENT) {
            throw new AppError('Paciente no encontrado', 404);
        }

        // Verificar que no existe ya una review de este paciente para este nutriólogo
        const existingReview = await this.reviewRepository.findOne({
            where: {
                nutritionist: { id: data.nutritionist_id },
                patient: { id: data.patient_id }
            }
        });

        if (existingReview) {
            throw new AppError('Ya has dejado una reseña para este nutriólogo', 409);
        }

        // Verificar que el paciente ha tenido al menos una consulta con el nutriólogo
        const hasConsultation = await this.appointmentRepository.findOne({
            where: {
                patient: { id: data.patient_id },
                nutritionist: { id: data.nutritionist_id },
                status: AppointmentStatus.COMPLETED
            }
        });

        // Crear la review
        const review = this.reviewRepository.create({
            nutritionist,
            patient,
            rating: data.rating,
            comment: data.comment || null,
            communication_rating: data.communication_rating || null,
            professionalism_rating: data.professionalism_rating || null,
            results_rating: data.results_rating || null,
            punctuality_rating: data.punctuality_rating || null,
            would_recommend: data.would_recommend || false,
            consultation_duration_months: data.consultation_duration_months || null,
            treatment_type: data.treatment_type || null,
            is_verified: !!hasConsultation // Verificada si ha tenido consultas
        });

        const savedReview = await this.reviewRepository.save(review);

        // Actualizar estadísticas del nutriólogo
        await this.updateNutritionistStats(data.nutritionist_id);

        return savedReview;
    }

    // ==================== OBTENER REVIEWS DE UN NUTRIÓLOGO ====================
    async getNutritionistReviews(nutritionistId: string, page: number = 1, limit: number = 10): Promise<{
        reviews: NutritionistReview[];
        total: number;
        stats: ReviewsStatsDTO;
    }> {
        const offset = (page - 1) * limit;

        // Obtener reviews visibles
        const [reviews, total] = await this.reviewRepository.findAndCount({
            where: {
                nutritionist: { id: nutritionistId },
                is_visible: true,
                is_flagged: false
            },
            relations: ['patient'],
            order: { created_at: 'DESC' },
            skip: offset,
            take: limit
        });

        // Obtener estadísticas
        const stats = await this.getNutritionistReviewsStats(nutritionistId);

        return { reviews, total, stats };
    }

    // ==================== OBTENER ESTADÍSTICAS DE REVIEWS ====================
    async getNutritionistReviewsStats(nutritionistId: string): Promise<ReviewsStatsDTO> {
        const reviews = await this.reviewRepository.find({
            where: {
                nutritionist: { id: nutritionistId },
                is_visible: true,
                is_flagged: false
            }
        });

        if (reviews.length === 0) {
            return {
                average_rating: 0,
                total_reviews: 0,
                verified_reviews: 0,
                rating_distribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
                recommendation_percentage: 0
            };
        }

        // Calcular estadísticas
        const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
        const averageRating = Math.round((totalRating / reviews.length) * 10) / 10;
        const verifiedReviews = reviews.filter(review => review.is_verified).length;
        const recommendCount = reviews.filter(review => review.would_recommend).length;
        const recommendationPercentage = Math.round((recommendCount / reviews.length) * 100);

        // Distribución de calificaciones
        const ratingDistribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
        reviews.forEach(review => {
            ratingDistribution[review.rating as keyof typeof ratingDistribution]++;
        });

        return {
            average_rating: averageRating,
            total_reviews: reviews.length,
            verified_reviews: verifiedReviews,
            rating_distribution: ratingDistribution,
            recommendation_percentage: recommendationPercentage
        };
    }

    // ==================== ACTUALIZAR ESTADÍSTICAS DEL NUTRIÓLOGO ====================
    private async updateNutritionistStats(nutritionistId: string): Promise<void> {
        const stats = await this.getNutritionistReviewsStats(nutritionistId);

        // Buscar el perfil del nutriólogo
        const profile = await this.nutritionistProfileRepository.findOne({
            where: { user: { id: nutritionistId } }
        });

        if (profile) {
            profile.average_rating = stats.average_rating;
            profile.total_reviews = stats.total_reviews;
            profile.verified_reviews = stats.verified_reviews;
            await this.nutritionistProfileRepository.save(profile);
        }
    }

    // ==================== MODERAR REVIEW ====================
    async moderateReview(reviewId: string, action: 'flag' | 'hide' | 'show' | 'verify', reason?: string): Promise<NutritionistReview> {
        const review = await this.reviewRepository.findOne({
            where: { id: reviewId },
            relations: ['nutritionist']
        });

        if (!review) {
            throw new AppError('Reseña no encontrada', 404);
        }

        switch (action) {
            case 'flag':
                review.is_flagged = true;
                review.flag_reason = reason || 'Contenido inapropiado';
                break;
            case 'hide':
                review.is_visible = false;
                break;
            case 'show':
                review.is_visible = true;
                review.is_flagged = false;
                review.flag_reason = null;
                break;
            case 'verify':
                review.is_verified = true;
                break;
        }

        const updatedReview = await this.reviewRepository.save(review);

        // Actualizar estadísticas del nutriólogo
        await this.updateNutritionistStats(review.nutritionist.id);

        return updatedReview;
    }

    // ==================== OBTENER REVIEW DE UN PACIENTE PARA UN NUTRIÓLOGO ====================
    async getPatientReviewForNutritionist(patientId: string, nutritionistId: string): Promise<NutritionistReview | null> {
        return await this.reviewRepository.findOne({
            where: {
                patient: { id: patientId },
                nutritionist: { id: nutritionistId }
            },
            relations: ['nutritionist', 'patient']
        });
    }

    // ==================== VERIFICAR SI PACIENTE PUEDE DEJAR REVIEW ====================
    async canPatientReviewNutritionist(patientId: string, nutritionistId: string): Promise<{
        canReview: boolean;
        reason?: string;
        hasExistingReview: boolean;
        hasConsultations: boolean;
    }> {
        // Verificar si ya tiene una review
        const existingReview = await this.getPatientReviewForNutritionist(patientId, nutritionistId);
        
        // Verificar si ha tenido consultas
        const consultationCount = await this.appointmentRepository.count({
            where: {
                patient: { id: patientId },
                nutritionist: { id: nutritionistId },
                status: AppointmentStatus.COMPLETED
            }
        });

        const hasConsultations = consultationCount > 0;
        const hasExistingReview = !!existingReview;

        if (hasExistingReview) {
            return {
                canReview: false,
                reason: 'Ya has dejado una reseña para este nutriólogo',
                hasExistingReview: true,
                hasConsultations
            };
        }

        if (!hasConsultations) {
            return {
                canReview: false,
                reason: 'Debes tener al menos una consulta completada para dejar una reseña',
                hasExistingReview: false,
                hasConsultations: false
            };
        }

        return {
            canReview: true,
            hasExistingReview: false,
            hasConsultations: true
        };
    }
}

export default new NutritionistReviewsService(); 