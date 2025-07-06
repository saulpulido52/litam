// src/modules/nutritionists/nutritionist.service.ts
import { Repository } from 'typeorm';
import { AppDataSource } from '../../database/data-source';
import { User } from '../../database/entities/user.entity';
import { NutritionistProfile } from '../../database/entities/nutritionist_profile.entity';
import { CreateUpdateNutritionistProfileDto } from '../../modules/nutritionists/nutritionist.dto';
import { AppError } from '../../utils/app.error';
import { RoleName } from '../../database/entities/role.entity';

class NutritionistService {
    private userRepository: Repository<User>;
    private nutritionistProfileRepository: Repository<NutritionistProfile>;

    constructor() {
        this.userRepository = AppDataSource.getRepository(User);
        this.nutritionistProfileRepository = AppDataSource.getRepository(NutritionistProfile);
    }

    public async getNutritionistProfile(userId: string) {
        const user = await this.userRepository.findOne({
            where: { id: userId, role: { name: RoleName.NUTRITIONIST } },
            relations: ['nutritionist_profile'],
        });

        if (!user) {
            throw new AppError('Usuario nutriólogo no encontrado o no autorizado.', 404);
        }
        if (!user.nutritionist_profile) {
            const newProfile = this.nutritionistProfileRepository.create({ user: user });
            await this.nutritionistProfileRepository.save(newProfile);
            user.nutritionist_profile = newProfile;
        }
        return user.nutritionist_profile;
    }

    public async createOrUpdateNutritionistProfile(userId: string, profileDto: CreateUpdateNutritionistProfileDto) {
        const user = await this.userRepository.findOne({
            where: { id: userId, role: { name: RoleName.NUTRITIONIST } },
            relations: ['nutritionist_profile'],
        });

        if (!user) {
            throw new AppError('Usuario nutriólogo no encontrado o no autorizado.', 404);
        }

        let nutritionistProfile = user.nutritionist_profile;

        if (!nutritionistProfile) {
            nutritionistProfile = this.nutritionistProfileRepository.create({ user: user });
        }

        // Mapear los campos del DTO al perfil (camelCase a snake_case)
        if (profileDto.licenseNumber !== undefined) nutritionistProfile.license_number = profileDto.licenseNumber;
        if (profileDto.licenseIssuingAuthority !== undefined) nutritionistProfile.license_issuing_authority = profileDto.licenseIssuingAuthority;
        if (profileDto.specialties !== undefined) nutritionistProfile.specialties = profileDto.specialties;
        if (profileDto.yearsOfExperience !== undefined) nutritionistProfile.years_of_experience = profileDto.yearsOfExperience;
        if (profileDto.education !== undefined) nutritionistProfile.education = profileDto.education;
        if (profileDto.certifications !== undefined) nutritionistProfile.certifications = profileDto.certifications;
        if (profileDto.areasOfInterest !== undefined) nutritionistProfile.areas_of_interest = profileDto.areasOfInterest;
        if (profileDto.treatmentApproach !== undefined) nutritionistProfile.treatment_approach = profileDto.treatmentApproach;
        if (profileDto.languages !== undefined) nutritionistProfile.languages = profileDto.languages;
        if (profileDto.consultationFee !== undefined) nutritionistProfile.consultation_fee = profileDto.consultationFee;
        if (profileDto.bio !== undefined) nutritionistProfile.bio = profileDto.bio;
        if (profileDto.officeHours !== undefined) nutritionistProfile.office_hours = profileDto.officeHours;

        // --- NUEVOS CAMPOS PARA APP MÓVIL ---
        if (profileDto.professionalSummary !== undefined) nutritionistProfile.professional_summary = profileDto.professionalSummary;
        if (profileDto.offersInPerson !== undefined) nutritionistProfile.offers_in_person = profileDto.offersInPerson;
        if (profileDto.offersOnline !== undefined) nutritionistProfile.offers_online = profileDto.offersOnline;
        if (profileDto.clinicName !== undefined) nutritionistProfile.clinic_name = profileDto.clinicName;
        if (profileDto.clinicAddress !== undefined) nutritionistProfile.clinic_address = profileDto.clinicAddress;
        if (profileDto.clinicCity !== undefined) nutritionistProfile.clinic_city = profileDto.clinicCity;
        if (profileDto.clinicState !== undefined) nutritionistProfile.clinic_state = profileDto.clinicState;
        if (profileDto.clinicZipCode !== undefined) nutritionistProfile.clinic_zip_code = profileDto.clinicZipCode;
        if (profileDto.clinicCountry !== undefined) nutritionistProfile.clinic_country = profileDto.clinicCountry;
        if (profileDto.latitude !== undefined) nutritionistProfile.latitude = profileDto.latitude;
        if (profileDto.longitude !== undefined) nutritionistProfile.longitude = profileDto.longitude;
        if (profileDto.clinicNotes !== undefined) nutritionistProfile.clinic_notes = profileDto.clinicNotes;
        if (profileDto.clinicPhone !== undefined) nutritionistProfile.clinic_phone = profileDto.clinicPhone;
        if (profileDto.isAvailable !== undefined) nutritionistProfile.is_available = profileDto.isAvailable;

        await this.nutritionistProfileRepository.save(nutritionistProfile);
        return nutritionistProfile;
    }

    // Método para obtener nutriólogos disponibles para la app móvil
    public async getAvailableNutritionistsForMobile(query: {
        specialty?: string;
        location?: string;
        rating_min?: number;
        price_range?: 'budget' | 'standard' | 'premium';
        availability?: boolean;
        page?: number;
        limit?: number;
        sort_by?: 'rating' | 'price' | 'availability' | 'reviews';
        sort_order?: 'asc' | 'desc';
    }) {
        const page = query.page || 1;
        const limit = query.limit || 10;
        const offset = (page - 1) * limit;

        let queryBuilder = this.nutritionistProfileRepository
            .createQueryBuilder('profile')
            .leftJoinAndSelect('profile.user', 'user')
            .where('profile.is_verified = :verified', { verified: true })
            .andWhere('profile.is_available = :available', { available: true });

        // Filtros adicionales
        if (query.specialty) {
            queryBuilder = queryBuilder.andWhere("profile.specialties @> ARRAY[:specialty]", { specialty: query.specialty });
        }

        if (query.location) {
            queryBuilder = queryBuilder.andWhere(
                '(profile.clinic_city ILIKE :location OR profile.clinic_state ILIKE :location)',
                { location: `%${query.location}%` }
            );
        }

        if (query.availability) {
            queryBuilder = queryBuilder.andWhere('(profile.offers_in_person = :inPerson OR profile.offers_online = :online)', {
                inPerson: true,
                online: true
            });
        }

        // Ordenamiento
        const sortBy = query.sort_by || 'rating';
        const sortOrder = query.sort_order || 'desc';

        switch (sortBy) {
            case 'price':
                queryBuilder = queryBuilder.orderBy('profile.consultation_fee', sortOrder.toUpperCase() as 'ASC' | 'DESC');
                break;
            case 'availability':
                queryBuilder = queryBuilder.orderBy('profile.is_available', sortOrder.toUpperCase() as 'ASC' | 'DESC');
                break;
            default:
                queryBuilder = queryBuilder.orderBy('profile.years_of_experience', sortOrder.toUpperCase() as 'ASC' | 'DESC');
        }

        const [nutritionists, total] = await queryBuilder
            .skip(offset)
            .take(limit)
            .getManyAndCount();

        return {
            data: nutritionists,
            total,
            page,
            limit,
            hasNext: offset + limit < total,
            hasPrevious: page > 1
        };
    }

    // Método para obtener perfil completo de un nutriólogo para la app móvil
    public async getNutritionistProfileForMobile(nutritionistId: string) {
        const profile = await this.nutritionistProfileRepository.findOne({
            where: { 
                user: { id: nutritionistId },
                is_verified: true,
                is_available: true
            },
            relations: ['user']
        });

        if (!profile) {
            throw new AppError('Nutriólogo no encontrado o no disponible.', 404);
        }

        return profile;
    }
}

export default new NutritionistService();