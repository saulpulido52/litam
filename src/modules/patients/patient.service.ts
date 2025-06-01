// src/modules/patients/patient.service.ts
import { Repository } from 'typeorm';
import { AppDataSource } from '@/database/data-source';
import { User } from '@/database/entities/user.entity';
import { PatientProfile } from '@/database/entities/patient_profile.entity';
import { CreateUpdatePatientProfileDto } from '@/modules/patients/patient.dto'; // Ruta corregida
import { AppError } from '@/utils/app.error';
import { RoleName } from '@/database/entities/role.entity';

class PatientService {
    private userRepository: Repository<User>;
    private patientProfileRepository: Repository<PatientProfile>;

    constructor() {
        this.userRepository = AppDataSource.getRepository(User);
        this.patientProfileRepository = AppDataSource.getRepository(PatientProfile);
    }

    public async getPatientProfile(userId: string) {
        const user = await this.userRepository.findOne({
            where: { id: userId, role: { name: RoleName.PATIENT } }, // Asegurarse que es un paciente
            relations: ['patient_profile'], // Cargar el perfil del paciente
        });

        if (!user) {
            throw new AppError('Usuario paciente no encontrado o no autorizado.', 404);
        }
        if (!user.patient_profile) {
            // Si el perfil no existe, podemos crearlo por primera vez (lazy initialization)
            const newProfile = this.patientProfileRepository.create({ user: user });
            await this.patientProfileRepository.save(newProfile);
            user.patient_profile = newProfile; // Asignar el nuevo perfil al usuario
        }
        return user.patient_profile;
    }

    public async createOrUpdatePatientProfile(userId: string, profileDto: CreateUpdatePatientProfileDto) {
        const user = await this.userRepository.findOne({
            where: { id: userId, role: { name: RoleName.PATIENT } },
            relations: ['patient_profile'],
        });

        if (!user) {
            throw new AppError('Usuario paciente no encontrado o no autorizado.', 404);
        }

        let patientProfile = user.patient_profile;

        if (!patientProfile) {
            patientProfile = this.patientProfileRepository.create({ user: user });
        }

        // Mapear los campos del DTO al perfil
        if (profileDto.currentWeight !== undefined) patientProfile.current_weight = profileDto.currentWeight;
        if (profileDto.height !== undefined) patientProfile.height = profileDto.height;
        if (profileDto.activityLevel !== undefined) patientProfile.activity_level = profileDto.activityLevel;
        if (profileDto.goals !== undefined) patientProfile.goals = profileDto.goals;
        if (profileDto.medicalConditions !== undefined) patientProfile.medical_conditions = profileDto.medicalConditions;
        if (profileDto.allergies !== undefined) patientProfile.allergies = profileDto.allergies;
        if (profileDto.intolerances !== undefined) patientProfile.intolerances = profileDto.intolerances;
        if (profileDto.medications !== undefined) patientProfile.medications = profileDto.medications;
        if (profileDto.clinicalNotes !== undefined) patientProfile.clinical_notes = profileDto.clinicalNotes;
        if (profileDto.pregnancyStatus !== undefined) patientProfile.pregnancy_status = profileDto.pregnancyStatus;
        if (profileDto.dietaryPreferences !== undefined) patientProfile.dietary_preferences = profileDto.dietaryPreferences;
        if (profileDto.foodPreferences !== undefined) patientProfile.food_preferences = profileDto.foodPreferences;
        if (profileDto.monthlyBudget !== undefined) patientProfile.monthly_budget = profileDto.monthlyBudget;
        if (profileDto.mealSchedule !== undefined) patientProfile.meal_schedule = profileDto.mealSchedule;

        // Si tienes otros campos como `preferences` que son JSONB no estructurados,
        // puedes actualizarlos de forma similar si tu DTO los incluye.
        // if (profileDto.preferences !== undefined) patientProfile.preferences = profileDto.preferences;


        await this.patientProfileRepository.save(patientProfile);
        return patientProfile;
    }

    // Puedes añadir más métodos aquí para añadir historial de peso, etc.
}

export default new PatientService();