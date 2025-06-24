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

        await this.nutritionistProfileRepository.save(nutritionistProfile);
        return nutritionistProfile;
    }
}

export default new NutritionistService();