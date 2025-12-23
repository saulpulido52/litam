// src/modules/nutritionists/nutritionist.controller.ts
import { Request, Response, NextFunction } from 'express';
import nutritionistService from '../../modules/nutritionists/nutritionist.service';
import { AppError } from '../../utils/app.error';
import { CreateUpdateNutritionistProfileDto } from '../../modules/nutritionists/nutritionist.dto';

class NutritionistController {
    public async getMyProfile(req: Request, res: Response, next: NextFunction) {
        try {
            if (!req.user || req.user.role.name !== 'nutritionist') {
                return next(new AppError('Acceso denegado. Solo nutriólogos pueden ver este perfil.', 403));
            }
            const profile = await nutritionistService.getNutritionistProfile(req.user.id);
            // Incluir datos del usuario base
            const user = req.user;
            res.status(200).json({
                status: 'success',
                data: {
                    user: {
                        id: user.id,
                        email: user.email,
                        first_name: user.first_name,
                        last_name: user.last_name,
                        phone: user.phone,
                        age: user.age,
                        gender: user.gender
                    },
                    profile
                },
            });
        } catch (error: any) {
            if (error instanceof AppError) {
                return next(error);
            }
            next(new AppError('Error al obtener el perfil del nutriólogo.', 500));
        }
    }

    public async createOrUpdateMyProfile(req: Request, res: Response, next: NextFunction) {
        try {
            if (!req.user || req.user.role.name !== 'nutritionist') {
                return next(new AppError('Acceso denegado. Solo nutriólogos pueden actualizar su perfil.', 403));
            }
            const updatedProfile = await nutritionistService.createOrUpdateNutritionistProfile(req.user.id, req.body as CreateUpdateNutritionistProfileDto);
            res.status(200).json({
                status: 'success',
                data: { profile: updatedProfile },
            });
        } catch (error: any) {
            if (error instanceof AppError) {
                return next(error);
            }
            next(new AppError('Error al crear/actualizar el perfil del nutriólogo.', 500));
        }
    }

    // --- NUEVOS ENDPOINTS PARA APP MÓVIL ---

    public async getAvailableNutritionists(req: Request, res: Response, next: NextFunction) {
        try {
            const query = {
                specialty: req.query.specialty as string,
                location: req.query.location as string,
                rating_min: req.query.rating_min ? Number(req.query.rating_min) : undefined,
                price_range: req.query.price_range as 'budget' | 'standard' | 'premium',
                availability: req.query.availability === 'true',
                page: req.query.page ? Number(req.query.page) : 1,
                limit: req.query.limit ? Number(req.query.limit) : 10,
                sort_by: req.query.sort_by as 'rating' | 'price' | 'availability' | 'reviews',
                sort_order: req.query.sort_order as 'asc' | 'desc'
            };

            const result = await nutritionistService.getAvailableNutritionistsForMobile(query);

            // Transformar datos para la app móvil
            const nutritionists = result.data.map(profile => ({
                id: profile.user.id,
                name: `${profile.user.first_name} ${profile.user.last_name}`,
                specialty: profile.specialties?.[0] || 'Nutrición General',
                rating: 4.5, // Placeholder - implementar sistema de ratings
                total_reviews: 0, // Placeholder
                location: `${profile.clinic_city || ''}, ${profile.clinic_state || ''}`.trim(),
                price_range: this.getPriceRange(profile.consultation_fee),
                availability: profile.is_available,
                profile_image: null, // Placeholder
                languages: profile.languages || ['Español'],
                is_new: false, // Placeholder
                response_time: 'Usually responds within 2 hours', // Placeholder
                professional_summary: profile.professional_summary,
                offers_in_person: profile.offers_in_person,
                offers_online: profile.offers_online,
                clinic_name: profile.clinic_name,
                clinic_address: profile.clinic_address,
                coordinates: profile.latitude && profile.longitude ? {
                    latitude: profile.latitude,
                    longitude: profile.longitude
                } : null
            }));

            res.status(200).json({
                status: 'success',
                data: {
                    nutritionists,
                    pagination: {
                        total: result.total,
                        page: result.page,
                        limit: result.limit,
                        has_next: result.hasNext,
                        has_previous: result.hasPrevious
                    }
                }
            });
        } catch (error: any) {
            if (error instanceof AppError) {
                return next(error);
            }
            next(new AppError('Error al obtener nutriólogos disponibles.', 500));
        }
    }

    public async getNutritionistProfileForMobile(req: Request, res: Response, next: NextFunction) {
        try {
            const { nutritionistId } = req.params;
            const profile = await nutritionistService.getNutritionistProfileForMobile(nutritionistId);

            // Transformar datos para la app móvil
            const nutritionistData = {
                id: profile.user.id,
                name: `${profile.user.first_name} ${profile.user.last_name}`,
                email: profile.user.email,
                phone: profile.user.phone,
                professional_summary: profile.professional_summary,
                bio: profile.bio,
                specialties: profile.specialties || [],
                years_of_experience: profile.years_of_experience,
                education: profile.education || [],
                certifications: profile.certifications || [],
                languages: profile.languages || ['Español'],
                consultation_fee: profile.consultation_fee,
                offers_in_person: profile.offers_in_person,
                offers_online: profile.offers_online,
                clinic: {
                    name: profile.clinic_name,
                    address: profile.clinic_address,
                    city: profile.clinic_city,
                    state: profile.clinic_state,
                    zip_code: profile.clinic_zip_code,
                    country: profile.clinic_country,
                    phone: profile.clinic_phone,
                    notes: profile.clinic_notes,
                    coordinates: profile.latitude && profile.longitude ? {
                        latitude: profile.latitude,
                        longitude: profile.longitude
                    } : null
                },
                office_hours: profile.office_hours,
                is_verified: profile.is_verified,
                is_available: profile.is_available,
                rating: 4.5, // Placeholder
                total_reviews: 0, // Placeholder
                response_time: 'Usually responds within 2 hours' // Placeholder
            };

            res.status(200).json({
                status: 'success',
                data: nutritionistData
            });
        } catch (error: any) {
            if (error instanceof AppError) {
                return next(error);
            }
            next(new AppError('Error al obtener el perfil del nutriólogo.', 500));
        }
    }

    private getPriceRange(consultationFee: number | null): string {
        if (!consultationFee) return 'standard';
        if (consultationFee < 500) return 'budget';
        if (consultationFee > 1000) return 'premium';
        return 'standard';
    }
}

export default new NutritionistController();