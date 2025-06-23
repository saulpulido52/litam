// src/modules/patients/patient.service.ts
import { Repository, DataSource, ILike } from 'typeorm';
import { User, UserRegistrationType } from '@/database/entities/user.entity';
import { PatientProfile } from '@/database/entities/patient_profile.entity';
import { PatientNutritionistRelation } from '@/database/entities/patient_nutritionist_relation.entity';
import { Role, RoleName } from '@/database/entities/role.entity';
import { Appointment } from '@/database/entities/appointment.entity';
import { PatientProgressLog } from '@/database/entities/patient_progress_log.entity';
import { AppError } from '@/utils/app.error';
import bcrypt from 'bcrypt';
import { RelationshipStatus } from '@/database/entities/patient_nutritionist_relation.entity';
import { CreatePatientDTO, UpdatePatientDTO, PatientResponseDTO, PatientsSearchDTO, CreatePatientByNutritionistDTO, BasicPatientRegistrationDTO } from './patient.dto';
import { UserSubscription, SubscriptionStatus } from '@/database/entities/user_subscription.entity';
import { SubscriptionPlan } from '@/database/entities/subscription_plan.entity';

export class PatientService {
    private userRepository: Repository<User>;
    private patientProfileRepository: Repository<PatientProfile>;
    private relationRepository: Repository<PatientNutritionistRelation>;
    private roleRepository: Repository<Role>;
    private appointmentRepository: Repository<Appointment>;
    private progressLogRepository: Repository<PatientProgressLog>;
    private dataSource: DataSource;

    constructor(dataSource: DataSource) {
        this.userRepository = dataSource.getRepository(User);
        this.patientProfileRepository = dataSource.getRepository(PatientProfile);
        this.relationRepository = dataSource.getRepository(PatientNutritionistRelation);
        this.roleRepository = dataSource.getRepository(Role);
        this.appointmentRepository = dataSource.getRepository(Appointment);
        this.progressLogRepository = dataSource.getRepository(PatientProgressLog);
        this.dataSource = dataSource;
    }

    // ==================== CREAR PACIENTE COMPLETO ====================
    async createPatient(nutritionistId: string, patientData: CreatePatientDTO): Promise<PatientResponseDTO> {
        // 1. Verificar que el nutricionista existe
        const nutritionist = await this.userRepository.findOneBy({ id: nutritionistId });
        if (!nutritionist) {
            throw new AppError('Nutricionista no encontrado', 404);
        }

        // 2. Buscar rol de paciente
        const patientRole = await this.roleRepository.findOne({ where: { name: RoleName.PATIENT } });
        if (!patientRole) {
            throw new AppError('Rol de paciente no encontrado en el sistema', 500);
        }

        // 3. Verificar que el email no esté en uso
        const existingUser = await this.userRepository.findOne({ where: { email: patientData.email } });
        if (existingUser) {
            throw new AppError('Ya existe un usuario con este email', 409);
        }

        // 4. Crear usuario del paciente
        const hashedPassword = await bcrypt.hash('temp123', 10); // Contraseña temporal

        const newUser = this.userRepository.create({
            email: patientData.email,
            password_hash: hashedPassword,
            first_name: patientData.first_name,
            last_name: patientData.last_name,
            age: patientData.age,
            gender: patientData.gender,
            role: patientRole,
            is_active: true,
        });

        const savedUser = await this.userRepository.save(newUser);

        // 5. Crear perfil completo del paciente
        const newPatientProfile = this.patientProfileRepository.create({
            user: savedUser,
            
            // Motivo de consulta
            consultation_reason: patientData.consultation_reason,
            
            // Datos biométricos
            current_weight: patientData.current_weight,
            height: patientData.height,
            activity_level: patientData.activity_level,
            
            // Antecedentes patológicos
            medical_conditions: patientData.medical_conditions,
            allergies: patientData.allergies,
            medications: patientData.medications,
            diagnosed_diseases: patientData.diagnosed_diseases,
            diagnosed_since: patientData.diagnosed_since,
            important_diseases_history: patientData.important_diseases_history,
            current_treatments: patientData.current_treatments,
            surgeries_history: patientData.surgeries_history,
            
            // Problemas actuales
            current_symptoms: patientData.current_symptoms,
            
            // Antecedentes familiares
            family_history: patientData.family_history,
            
            // Actividad física
            does_exercise: patientData.does_exercise,
            exercise_type: patientData.exercise_type,
            exercise_frequency: patientData.exercise_frequency,
            exercise_duration: patientData.exercise_duration,
            exercise_since: patientData.exercise_since,
            
            // Consumo de sustancias
            alcohol_consumption: patientData.alcohol_consumption,
            tobacco_consumption: patientData.tobacco_consumption,
            coffee_consumption: patientData.coffee_consumption,
            
            // Signos vitales y físicos
            general_appearance: patientData.general_appearance,
            knows_blood_pressure: patientData.knows_blood_pressure,
            usual_blood_pressure: patientData.usual_blood_pressure,
            
            // Indicadores bioquímicos
            biochemical_indicators: patientData.biochemical_indicators,
            
            // Indicadores dietéticos
            previous_nutritional_guidance: patientData.previous_nutritional_guidance,
            previous_guidance_when: patientData.previous_guidance_when,
            guidance_adherence_level: patientData.guidance_adherence_level,
            guidance_adherence_reason: patientData.guidance_adherence_reason,
            who_prepares_food: patientData.who_prepares_food,
            eats_home_or_out: patientData.eats_home_or_out,
            diet_modified_last_6_months: patientData.diet_modified_last_6_months,
            diet_modification_reason: patientData.diet_modification_reason,
            hungriest_time: patientData.hungriest_time,
            preferred_foods: patientData.preferred_foods,
            disliked_foods: patientData.disliked_foods,
            food_intolerances: patientData.food_intolerances,
            takes_supplements: patientData.takes_supplements,
            supplements_details: patientData.supplements_details,
            daily_water_glasses: patientData.daily_water_glasses,
            
            // Estilo de vida
            daily_schedule: patientData.daily_schedule,
            
            // Frecuencia de consumo por grupos
            food_frequency: patientData.food_frequency,
            
            // Campos existentes mantenidos
            goals: patientData.goals,
            intolerances: patientData.intolerances,
            clinical_notes: patientData.clinical_notes,
            pregnancy_status: patientData.pregnancy_status,
            dietary_preferences: patientData.dietary_preferences,
            food_preferences: patientData.food_preferences,
            monthly_budget: patientData.monthly_budget,
            meal_schedule: patientData.meal_schedule,
        });

        const savedProfile = await this.patientProfileRepository.save(newPatientProfile);

        // 6. Crear relación paciente-nutricionista
        const relationship = this.relationRepository.create({
            patient: savedUser,
            nutritionist: nutritionist,
            status: RelationshipStatus.ACTIVE,
            notes: 'Paciente registrado directamente por el nutricionista',
            requested_at: new Date(),
            accepted_at: new Date(),
        });

        await this.relationRepository.save(relationship);

        // 7. Retornar el paciente completo
        return this.formatPatientResponse(savedUser, savedProfile);
    }

    // ==================== OBTENER PACIENTES DEL NUTRICIONISTA ====================
    async getPatientsByNutritionist(nutritionistId: string, searchParams?: PatientsSearchDTO): Promise<{
        patients: PatientResponseDTO[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }> {
        const page = searchParams?.page || 1;
        const limit = searchParams?.limit || 10;
        const skip = (page - 1) * limit;

        let query = this.relationRepository
            .createQueryBuilder('relation')
            .leftJoinAndSelect('relation.patient', 'patient')
            .leftJoinAndSelect('patient.role', 'role')
            .leftJoinAndSelect('patient.patient_profile', 'profile')
            .leftJoinAndSelect('relation.nutritionist', 'nutritionist')
            .where('nutritionist.id = :nutritionistId', { nutritionistId })
            .andWhere('relation.status = :status', { status: RelationshipStatus.ACTIVE });

        // Aplicar filtros de búsqueda
        if (searchParams?.search) {
            query = query.andWhere(
                '(LOWER(patient.first_name) LIKE LOWER(:search) OR LOWER(patient.last_name) LIKE LOWER(:search) OR LOWER(patient.email) LIKE LOWER(:search))',
                { search: `%${searchParams.search}%` }
            );
        }

        if (searchParams?.gender) {
            query = query.andWhere('patient.gender = :gender', { gender: searchParams.gender });
        }

        if (searchParams?.age_min || searchParams?.age_max) {
            if (searchParams.age_min) {
                query = query.andWhere('patient.age >= :age_min', { age_min: searchParams.age_min });
            }
            if (searchParams.age_max) {
                query = query.andWhere('patient.age <= :age_max', { age_max: searchParams.age_max });
            }
        }

        if (searchParams?.activity_level) {
            query = query.andWhere('profile.activity_level = :activity_level', { activity_level: searchParams.activity_level });
        }

        if (searchParams?.medical_conditions && searchParams.medical_conditions.length > 0) {
            query = query.andWhere('profile.medical_conditions && :conditions', { conditions: searchParams.medical_conditions });
        }

        // Aplicar ordenamiento
        const sortBy = searchParams?.sort_by || 'created_at';
        const sortOrder = searchParams?.sort_order || 'DESC';
        
        if (sortBy === 'name') {
            query = query.orderBy('patient.first_name', sortOrder).addOrderBy('patient.last_name', sortOrder);
        } else if (sortBy === 'weight') {
            query = query.orderBy('profile.current_weight', sortOrder);
        } else {
            query = query.orderBy(`patient.${sortBy}`, sortOrder);
        }

        // Obtener total y resultados paginados
        const [relations, total] = await query.skip(skip).take(limit).getManyAndCount();

        const patients = relations.map(relation => {
            if (!relation.patient.patient_profile) {
                throw new AppError('Perfil de paciente no encontrado', 404);
            }
            return this.formatPatientResponse(relation.patient, relation.patient.patient_profile);
        });

        return {
            patients,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        };
    }

    // ==================== OBTENER PACIENTE POR ID ====================
    async getPatientById(patientId: string, nutritionistId: string): Promise<PatientResponseDTO> {
        const patient = await this.userRepository.findOne({
            where: { id: patientId },
            relations: ['role', 'patient_profile'],
        });

        if (!patient || !patient.patient_profile) {
            throw new AppError('Paciente no encontrado', 404);
        }

        // Verificar que el nutricionista tenga acceso a este paciente
        const relation = await this.relationRepository.findOne({
            where: {
                patient: { id: patientId },
                nutritionist: { id: nutritionistId },
                status: RelationshipStatus.ACTIVE,
            },
        });

        if (!relation) {
            throw new AppError('No tienes acceso a este paciente', 403);
        }

        return this.formatPatientResponse(patient, patient.patient_profile);
    }

    // ==================== ACTUALIZAR PACIENTE ====================
    async updatePatient(patientId: string, nutritionistId: string, updateData: UpdatePatientDTO): Promise<PatientResponseDTO> {
        // Verificar acceso
        const relation = await this.relationRepository.findOne({
            where: {
                patient: { id: patientId },
                nutritionist: { id: nutritionistId },
                status: RelationshipStatus.ACTIVE,
            },
        });

        if (!relation) {
            throw new AppError('No tienes acceso a este paciente', 403);
        }

        // Obtener el paciente
        const patient = await this.userRepository.findOne({
            where: { id: patientId },
            relations: ['patient_profile'],
        });

        if (!patient || !patient.patient_profile) {
            throw new AppError('Paciente no encontrado', 404);
        }

        // Actualizar datos del usuario
        if (updateData.first_name !== undefined) patient.first_name = updateData.first_name;
        if (updateData.last_name !== undefined) patient.last_name = updateData.last_name;
        if (updateData.age !== undefined) patient.age = updateData.age;
        if (updateData.gender !== undefined) patient.gender = updateData.gender;

        await this.userRepository.save(patient);

        // Actualizar perfil del paciente con todos los campos
        const profile = patient.patient_profile;
        
        // Motivo de consulta
        if (updateData.consultation_reason !== undefined) profile.consultation_reason = updateData.consultation_reason;
        
        // Datos biométricos
        if (updateData.current_weight !== undefined) profile.current_weight = updateData.current_weight;
        if (updateData.height !== undefined) profile.height = updateData.height;
        if (updateData.activity_level !== undefined) profile.activity_level = updateData.activity_level;
        
        // Antecedentes patológicos
        if (updateData.medical_conditions !== undefined) profile.medical_conditions = updateData.medical_conditions;
        if (updateData.allergies !== undefined) profile.allergies = updateData.allergies;
        if (updateData.medications !== undefined) profile.medications = updateData.medications;
        if (updateData.diagnosed_diseases !== undefined) profile.diagnosed_diseases = updateData.diagnosed_diseases;
        if (updateData.diagnosed_since !== undefined) profile.diagnosed_since = updateData.diagnosed_since;
        if (updateData.important_diseases_history !== undefined) profile.important_diseases_history = updateData.important_diseases_history;
        if (updateData.current_treatments !== undefined) profile.current_treatments = updateData.current_treatments;
        if (updateData.surgeries_history !== undefined) profile.surgeries_history = updateData.surgeries_history;
        
        // Problemas actuales
        if (updateData.current_symptoms !== undefined) profile.current_symptoms = updateData.current_symptoms;
        
        // Antecedentes familiares
        if (updateData.family_history !== undefined) profile.family_history = updateData.family_history;
        
        // Actividad física
        if (updateData.does_exercise !== undefined) profile.does_exercise = updateData.does_exercise;
        if (updateData.exercise_type !== undefined) profile.exercise_type = updateData.exercise_type;
        if (updateData.exercise_frequency !== undefined) profile.exercise_frequency = updateData.exercise_frequency;
        if (updateData.exercise_duration !== undefined) profile.exercise_duration = updateData.exercise_duration;
        if (updateData.exercise_since !== undefined) profile.exercise_since = updateData.exercise_since;
        
        // Consumo de sustancias
        if (updateData.alcohol_consumption !== undefined) profile.alcohol_consumption = updateData.alcohol_consumption;
        if (updateData.tobacco_consumption !== undefined) profile.tobacco_consumption = updateData.tobacco_consumption;
        if (updateData.coffee_consumption !== undefined) profile.coffee_consumption = updateData.coffee_consumption;
        
        // Signos vitales y físicos
        if (updateData.general_appearance !== undefined) profile.general_appearance = updateData.general_appearance;
        if (updateData.knows_blood_pressure !== undefined) profile.knows_blood_pressure = updateData.knows_blood_pressure;
        if (updateData.usual_blood_pressure !== undefined) profile.usual_blood_pressure = updateData.usual_blood_pressure;
        
        // Indicadores bioquímicos
        if (updateData.biochemical_indicators !== undefined) {
            profile.biochemical_indicators = {
                ...profile.biochemical_indicators,
                ...updateData.biochemical_indicators,
                last_update: new Date()
            };
        }
        
        // Indicadores dietéticos
        if (updateData.previous_nutritional_guidance !== undefined) profile.previous_nutritional_guidance = updateData.previous_nutritional_guidance;
        if (updateData.previous_guidance_when !== undefined) profile.previous_guidance_when = updateData.previous_guidance_when;
        if (updateData.guidance_adherence_level !== undefined) profile.guidance_adherence_level = updateData.guidance_adherence_level;
        if (updateData.guidance_adherence_reason !== undefined) profile.guidance_adherence_reason = updateData.guidance_adherence_reason;
        if (updateData.who_prepares_food !== undefined) profile.who_prepares_food = updateData.who_prepares_food;
        if (updateData.eats_home_or_out !== undefined) profile.eats_home_or_out = updateData.eats_home_or_out;
        if (updateData.diet_modified_last_6_months !== undefined) profile.diet_modified_last_6_months = updateData.diet_modified_last_6_months;
        if (updateData.diet_modification_reason !== undefined) profile.diet_modification_reason = updateData.diet_modification_reason;
        if (updateData.hungriest_time !== undefined) profile.hungriest_time = updateData.hungriest_time;
        if (updateData.preferred_foods !== undefined) profile.preferred_foods = updateData.preferred_foods;
        if (updateData.disliked_foods !== undefined) profile.disliked_foods = updateData.disliked_foods;
        if (updateData.food_intolerances !== undefined) profile.food_intolerances = updateData.food_intolerances;
        if (updateData.takes_supplements !== undefined) profile.takes_supplements = updateData.takes_supplements;
        if (updateData.supplements_details !== undefined) profile.supplements_details = updateData.supplements_details;
        if (updateData.daily_water_glasses !== undefined) profile.daily_water_glasses = updateData.daily_water_glasses;
        
        // Estilo de vida
        if (updateData.daily_schedule !== undefined) profile.daily_schedule = updateData.daily_schedule;
        
        // Frecuencia de consumo por grupos
        if (updateData.food_frequency !== undefined) profile.food_frequency = updateData.food_frequency;
        
        // Campos existentes mantenidos
        if (updateData.goals !== undefined) profile.goals = updateData.goals;
        if (updateData.intolerances !== undefined) profile.intolerances = updateData.intolerances;
        if (updateData.clinical_notes !== undefined) profile.clinical_notes = updateData.clinical_notes;
        if (updateData.pregnancy_status !== undefined) profile.pregnancy_status = updateData.pregnancy_status;
        if (updateData.dietary_preferences !== undefined) profile.dietary_preferences = updateData.dietary_preferences;
        if (updateData.food_preferences !== undefined) profile.food_preferences = updateData.food_preferences;
        if (updateData.monthly_budget !== undefined) profile.monthly_budget = updateData.monthly_budget;
        if (updateData.meal_schedule !== undefined) profile.meal_schedule = updateData.meal_schedule;

        await this.patientProfileRepository.save(profile);

        return this.formatPatientResponse(patient, profile);
    }

    // ==================== OBTENER ESTADÍSTICAS ====================
    async getPatientStats(nutritionistId: string): Promise<any> {
        // Total de pacientes activos
        const totalPatients = await this.relationRepository.count({
            where: {
                nutritionist: { id: nutritionistId },
                status: RelationshipStatus.ACTIVE,
            },
        });

        // Pacientes nuevos (último mes)
        const oneMonthAgo = new Date();
        oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

        const newPatientsLastMonth = await this.relationRepository
            .createQueryBuilder('relation')
            .where('relation.nutritionist_user_id = :nutritionistId', { nutritionistId })
            .andWhere('relation.status = :status', { status: RelationshipStatus.ACTIVE })
            .andWhere('relation.accepted_at >= :oneMonthAgo', { oneMonthAgo })
            .getCount();

        // Pacientes con condiciones médicas
        const patientsWithConditions = await this.relationRepository
            .createQueryBuilder('relation')
            .leftJoin('relation.patient', 'patient')
            .leftJoin('patient.patient_profile', 'profile')
            .where('relation.nutritionist_user_id = :nutritionistId', { nutritionistId })
            .andWhere('relation.status = :status', { status: RelationshipStatus.ACTIVE })
            .andWhere('profile.medical_conditions IS NOT NULL')
            .andWhere('array_length(profile.medical_conditions, 1) > 0')
            .getCount();

        return {
            total_patients: totalPatients,
            new_patients_last_month: newPatientsLastMonth,
            patients_with_medical_conditions: patientsWithConditions,
            active_relationships: totalPatients,
        };
    }

    // ==================== FORMATEAR RESPUESTA ====================
    private formatPatientResponse(user: User, profile: PatientProfile): PatientResponseDTO {
        const bmi = this.calculateBMI(profile.current_weight, profile.height);
        
        return {
            id: profile.id,
            user: {
                id: user.id,
                email: user.email,
                first_name: user.first_name ?? '',
                last_name: user.last_name ?? '',
                age: user.age ?? undefined,
                gender: user.gender ?? undefined,
                created_at: user.created_at,
            },
            
            // Expediente clínico completo
            consultation_reason: profile.consultation_reason ?? undefined,
            current_weight: profile.current_weight ?? undefined,
            height: profile.height ?? undefined,
            activity_level: profile.activity_level ?? undefined,
            
            // Antecedentes
            medical_conditions: profile.medical_conditions ?? undefined,
            allergies: profile.allergies ?? undefined,
            medications: profile.medications ?? undefined,
            diagnosed_diseases: profile.diagnosed_diseases ?? undefined,
            diagnosed_since: profile.diagnosed_since ?? undefined,
            important_diseases_history: profile.important_diseases_history ?? undefined,
            current_treatments: profile.current_treatments ?? undefined,
            surgeries_history: profile.surgeries_history ?? undefined,
            
            // Problemas actuales y antecedentes familiares
            current_symptoms: profile.current_symptoms ?? undefined,
            family_history: profile.family_history ?? undefined,
            
            // Actividad física y consumo
            does_exercise: profile.does_exercise ?? undefined,
            exercise_type: profile.exercise_type ?? undefined,
            exercise_frequency: profile.exercise_frequency ?? undefined,
            exercise_duration: profile.exercise_duration ?? undefined,
            exercise_since: profile.exercise_since ?? undefined,
            alcohol_consumption: profile.alcohol_consumption ?? undefined,
            tobacco_consumption: profile.tobacco_consumption ?? undefined,
            coffee_consumption: profile.coffee_consumption ?? undefined,
            
            // Signos vitales
            general_appearance: profile.general_appearance ?? undefined,
            knows_blood_pressure: profile.knows_blood_pressure ?? undefined,
            usual_blood_pressure: profile.usual_blood_pressure ?? undefined,
            biochemical_indicators: profile.biochemical_indicators ?? undefined,
            
            // Indicadores dietéticos
            previous_nutritional_guidance: profile.previous_nutritional_guidance ?? undefined,
            previous_guidance_when: profile.previous_guidance_when ?? undefined,
            guidance_adherence_level: profile.guidance_adherence_level ?? undefined,
            guidance_adherence_reason: profile.guidance_adherence_reason ?? undefined,
            who_prepares_food: profile.who_prepares_food ?? undefined,
            eats_home_or_out: profile.eats_home_or_out ?? undefined,
            diet_modified_last_6_months: profile.diet_modified_last_6_months ?? undefined,
            diet_modification_reason: profile.diet_modification_reason ?? undefined,
            hungriest_time: profile.hungriest_time ?? undefined,
            preferred_foods: profile.preferred_foods ?? undefined,
            disliked_foods: profile.disliked_foods ?? undefined,
            food_intolerances: profile.food_intolerances ?? undefined,
            takes_supplements: profile.takes_supplements ?? undefined,
            supplements_details: profile.supplements_details ?? undefined,
            daily_water_glasses: profile.daily_water_glasses ?? undefined,
            
            // Estilo de vida
            daily_schedule: profile.daily_schedule ?? undefined,
            food_frequency: profile.food_frequency ?? undefined,
            
            // Campos existentes
            goals: profile.goals ?? undefined,
            intolerances: profile.intolerances ?? undefined,
            clinical_notes: profile.clinical_notes ?? undefined,
            pregnancy_status: profile.pregnancy_status ?? undefined,
            dietary_preferences: profile.dietary_preferences ?? undefined,
            food_preferences: profile.food_preferences ?? undefined,
            monthly_budget: profile.monthly_budget ?? undefined,
            meal_schedule: profile.meal_schedule ?? undefined,
            
            // Metadatos
            created_at: profile.created_at,
            updated_at: profile.updated_at,
            
            // Campos calculados
            bmi: bmi,
            bmi_category: this.getBMICategory(bmi),
            age_calculated: user.age ?? undefined,
        };
    }

    // ==================== UTILIDADES ====================
    private calculateBMI(weight: number | null, height: number | null): number | undefined {
        if (!weight || !height || height === 0) return undefined;
        const heightInMeters = height / 100;
        return parseFloat((weight / (heightInMeters * heightInMeters)).toFixed(1));
    }

    private getBMICategory(bmi: number | undefined): string {
        if (!bmi) return 'No calculado';
        if (bmi < 18.5) return 'Bajo peso';
        if (bmi < 25) return 'Normal';
        if (bmi < 30) return 'Sobrepeso';
        return 'Obesidad';
    }

    // ==================== ESCENARIO 1: REGISTRO POR NUTRIÓLOGO ====================
    async createPatientByNutritionist(
        nutritionistId: string, 
        patientData: CreatePatientByNutritionistDTO
    ): Promise<{
        patient: PatientResponseDTO;
        temporary_password: string;
        expires_at: Date;
    }> {
        // 1. Verificar que el nutricionista existe
        const nutritionist = await this.userRepository.findOneBy({ id: nutritionistId });
        if (!nutritionist) {
            throw new AppError('Nutricionista no encontrado', 404);
        }

        // 2. Buscar rol de paciente
        const patientRole = await this.roleRepository.findOne({ where: { name: RoleName.PATIENT } });
        if (!patientRole) {
            throw new AppError('Rol de paciente no encontrado en el sistema', 500);
        }

        // 3. Verificar que el email no esté en uso
        const existingUser = await this.userRepository.findOne({ where: { email: patientData.email } });
        if (existingUser) {
            throw new AppError('Ya existe un usuario con este email', 409);
        }

        // 4. Generar contraseña temporal
        const temporaryPassword = this.generateTemporaryPassword();
        const hashedPassword = await bcrypt.hash(temporaryPassword, 10);
        const expiresAt = new Date();
        expiresAt.setHours(expiresAt.getHours() + 24); // Expira en 24 horas

        // 5. Crear usuario del paciente
        const newUser = this.userRepository.create({
            email: patientData.email,
            password_hash: hashedPassword,
            first_name: patientData.first_name,
            last_name: patientData.last_name,
            age: patientData.age,
            gender: patientData.gender,
            phone: patientData.phone,
            role: patientRole,
            is_active: true,
            registration_type: UserRegistrationType.IN_PERSON,
            has_temporary_password: true,
            temporary_password_expires_at: expiresAt,
            requires_initial_setup: false, // El nutriólogo ya completó el perfil
            created_by_nutritionist_id: nutritionistId,
        });

        const savedUser = await this.userRepository.save(newUser);

        // 6. Crear perfil completo del paciente (todos los datos del expediente)
        const newPatientProfile = this.patientProfileRepository.create({
            user: savedUser,
            
            // Motivo de consulta
            consultation_reason: patientData.consultation_reason,
            
            // Datos biométricos
            current_weight: patientData.current_weight,
            height: patientData.height,
            activity_level: patientData.activity_level,
            
            // ... (todos los campos del expediente clínico como en el método original)
            medical_conditions: patientData.medical_conditions,
            allergies: patientData.allergies,
            medications: patientData.medications,
            diagnosed_diseases: patientData.diagnosed_diseases,
            diagnosed_since: patientData.diagnosed_since,
            important_diseases_history: patientData.important_diseases_history,
            current_treatments: patientData.current_treatments,
            surgeries_history: patientData.surgeries_history,
            current_symptoms: patientData.current_symptoms,
            family_history: patientData.family_history,
            does_exercise: patientData.does_exercise,
            exercise_type: patientData.exercise_type,
            exercise_frequency: patientData.exercise_frequency,
            exercise_duration: patientData.exercise_duration,
            exercise_since: patientData.exercise_since,
            alcohol_consumption: patientData.alcohol_consumption,
            tobacco_consumption: patientData.tobacco_consumption,
            coffee_consumption: patientData.coffee_consumption,
            general_appearance: patientData.general_appearance,
            knows_blood_pressure: patientData.knows_blood_pressure,
            usual_blood_pressure: patientData.usual_blood_pressure,
            biochemical_indicators: patientData.biochemical_indicators,
            previous_nutritional_guidance: patientData.previous_nutritional_guidance,
            previous_guidance_when: patientData.previous_guidance_when,
            guidance_adherence_level: patientData.guidance_adherence_level,
            guidance_adherence_reason: patientData.guidance_adherence_reason,
            who_prepares_food: patientData.who_prepares_food,
            eats_home_or_out: patientData.eats_home_or_out,
            diet_modified_last_6_months: patientData.diet_modified_last_6_months,
            diet_modification_reason: patientData.diet_modification_reason,
            hungriest_time: patientData.hungriest_time,
            preferred_foods: patientData.preferred_foods,
            disliked_foods: patientData.disliked_foods,
            food_intolerances: patientData.food_intolerances,
            takes_supplements: patientData.takes_supplements,
            supplements_details: patientData.supplements_details,
            daily_water_glasses: patientData.daily_water_glasses,
            daily_schedule: patientData.daily_schedule,
            food_frequency: patientData.food_frequency,
            goals: patientData.goals,
            intolerances: patientData.intolerances,
            clinical_notes: patientData.clinical_notes,
            pregnancy_status: patientData.pregnancy_status,
            dietary_preferences: patientData.dietary_preferences,
            food_preferences: patientData.food_preferences,
            monthly_budget: patientData.monthly_budget,
            meal_schedule: patientData.meal_schedule,
        });

        const savedProfile = await this.patientProfileRepository.save(newPatientProfile);

        // 7. Crear relación paciente-nutricionista directa
        const relationship = this.relationRepository.create({
            patient: savedUser,
            nutritionist: nutritionist,
            status: RelationshipStatus.ACTIVE,
            notes: 'Paciente registrado directamente por el nutricionista con expediente completo',
            requested_at: new Date(),
            accepted_at: new Date(),
        });

        await this.relationRepository.save(relationship);

        return {
            patient: this.formatPatientResponse(savedUser, savedProfile),
            temporary_password: temporaryPassword,
            expires_at: expiresAt,
        };
    }

    // ==================== ESCENARIO 2: REGISTRO BÁSICO DEL PACIENTE ====================
    async registerBasicPatient(registrationData: BasicPatientRegistrationDTO): Promise<{
        user: User;
        subscription: UserSubscription;
        requires_profile_completion: boolean;
    }> {
        // 1. Buscar rol de paciente
        const patientRole = await this.roleRepository.findOne({ where: { name: RoleName.PATIENT } });
        if (!patientRole) {
            throw new AppError('Rol de paciente no encontrado en el sistema', 500);
        }

        // 2. Verificar que el email no esté en uso
        const existingUser = await this.userRepository.findOne({ where: { email: registrationData.email } });
        if (existingUser) {
            throw new AppError('Ya existe un usuario con este email', 409);
        }

        // 3. Crear usuario del paciente con datos básicos
        const hashedPassword = await bcrypt.hash(registrationData.password, 10);

        const newUser = this.userRepository.create({
            email: registrationData.email,
            password_hash: hashedPassword,
            first_name: registrationData.first_name,
            last_name: registrationData.last_name,
            age: registrationData.age,
            gender: registrationData.gender,
            phone: registrationData.phone,
            role: patientRole,
            is_active: true,
            registration_type: UserRegistrationType.ONLINE,
            has_temporary_password: false,
            requires_initial_setup: true, // Necesita completar datos con nutriólogo
        });

        const savedUser = await this.userRepository.save(newUser);

        // 4. Crear perfil básico del paciente (solo datos que proporcionó)
        const basicProfile = this.patientProfileRepository.create({
            user: savedUser,
            consultation_reason: registrationData.consultation_reason,
            current_weight: registrationData.current_weight,
            height: registrationData.height,
            activity_level: registrationData.activity_level,
            goals: registrationData.goals,
            allergies: registrationData.allergies,
            dietary_preferences: registrationData.dietary_preferences,
        });

        await this.patientProfileRepository.save(basicProfile);

        // 5. Crear suscripción al plan seleccionado
        const subscription = await this.createUserSubscription(
            savedUser.id, 
            registrationData.selected_plan_id
        );

        return {
            user: savedUser,
            subscription: subscription,
            requires_profile_completion: true,
        };
    }

    // ==================== ASIGNACIÓN DE NUTRIÓLOGO (ESCENARIO 2) ====================
    async assignNutritionistToPatient(patientId: string): Promise<User | null> {
        // Buscar nutriólogos disponibles (con menos pacientes asignados)
        const availableNutritionists = await this.userRepository
            .createQueryBuilder('user')
            .leftJoin('user.role', 'role')
            .leftJoin('user.nutritionist_relations', 'relations')
            .select('user.*')
            .addSelect('COUNT(relations.id)', 'patient_count')
            .where('role.name = :role', { role: RoleName.NUTRITIONIST })
            .andWhere('user.is_active = true')
            .groupBy('user.id')
            .orderBy('patient_count', 'ASC')
            .limit(1)
            .getRawOne();

        if (!availableNutritionists) {
            return null; // No hay nutriólogos disponibles
        }

        const nutritionist = await this.userRepository.findOneBy({ id: availableNutritionists.user_id });
        const patient = await this.userRepository.findOneBy({ id: patientId });

        if (!nutritionist || !patient) {
            throw new AppError('Usuario no encontrado', 404);
        }

        // Crear relación paciente-nutricionista
        const relationship = this.relationRepository.create({
            patient: patient,
            nutritionist: nutritionist,
            status: RelationshipStatus.ACTIVE,
            notes: 'Asignación automática por suscripción online',
            requested_at: new Date(),
            accepted_at: new Date(),
        });

        await this.relationRepository.save(relationship);

        return nutritionist;
    }

    // ==================== UTILIDADES ====================
    private generateTemporaryPassword(): string {
        const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789';
        let password = '';
        for (let i = 0; i < 8; i++) {
            password += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return password;
    }

    private async createUserSubscription(userId: string, planId: string): Promise<UserSubscription> {
        // Aquí integraremos con el SubscriptionService
        // Por ahora, importaremos directamente el repositorio
        const userSubscriptionRepository = this.dataSource.getRepository(UserSubscription);
        const subscriptionPlanRepository = this.dataSource.getRepository(SubscriptionPlan);

        const plan = await subscriptionPlanRepository.findOne({ where: { id: planId } });
        const user = await this.userRepository.findOne({ where: { id: userId } });

        if (!plan || !user) {
            throw new AppError('Plan o usuario no encontrado', 404);
        }

        const startDate = new Date();
        const endDate = new Date();
        endDate.setDate(startDate.getDate() + plan.duration_days);

        const subscription = userSubscriptionRepository.create({
            user: user,
            subscription_plan: plan,
            status: SubscriptionStatus.PENDING, // Pendiente de pago
            start_date: startDate,
            end_date: endDate,
            amount_paid: plan.price,
            currency: 'MXN',
            consultations_used: 0,
        });

        return await userSubscriptionRepository.save(subscription);
    }

    // ==================== MÉTODOS ADICIONALES PARA GESTIÓN DE PERFILES ====================
    
    async markProfileAsCompleted(patientId: string): Promise<void> {
        const user = await this.userRepository.findOne({ where: { id: patientId } });
        if (!user) {
            throw new AppError('Paciente no encontrado', 404);
        }

        user.requires_initial_setup = false;
        await this.userRepository.save(user);
    }

    async getPatientsRequiringProfileCompletion(nutritionistId: string): Promise<PatientResponseDTO[]> {
        const relations = await this.relationRepository
            .createQueryBuilder('relation')
            .leftJoinAndSelect('relation.patient', 'patient')
            .leftJoinAndSelect('patient.role', 'role')
            .leftJoinAndSelect('patient.patient_profile', 'profile')
            .leftJoinAndSelect('relation.nutritionist', 'nutritionist')
            .where('nutritionist.id = :nutritionistId', { nutritionistId })
            .andWhere('relation.status = :status', { status: RelationshipStatus.ACTIVE })
            .andWhere('patient.requires_initial_setup = true')
            .andWhere('patient.registration_type = :regType', { regType: UserRegistrationType.ONLINE })
            .getMany();

        return relations.map(relation => {
            if (!relation.patient.patient_profile) {
                throw new AppError('Perfil de paciente no encontrado', 404);
            }
            return this.formatPatientResponse(relation.patient, relation.patient.patient_profile);
        });
    }

    // ==================== ELIMINACIÓN COMPLETA DE CUENTA ====================
    
    /**
     * Elimina completamente la cuenta de un paciente y todos sus datos relacionados
     * Esto incluye: expedientes clínicos, relaciones, citas, progreso, suscripciones, etc.
     * Solo puede ser ejecutado por el propio paciente o un administrador
     */
    async deletePatientAccount(patientId: string, requesterId: string, requesterRole: RoleName): Promise<{
        message: string;
        deleted_data: {
            clinical_records: number;
            appointments: number;
            progress_logs: number;
            relations: number;
            patient_profile: boolean;
            user_account: boolean;
        };
    }> {
        // Verificar permisos - solo el propio paciente o admin pueden eliminar
        if (requesterRole !== RoleName.ADMIN && requesterId !== patientId) {
            throw new AppError('Solo el paciente o un administrador pueden eliminar esta cuenta.', 403);
        }

        // Verificar que el paciente existe
        const patient = await this.userRepository.findOne({
            where: { id: patientId, role: { name: RoleName.PATIENT } },
            relations: ['role', 'patient_profile'],
        });

        if (!patient) {
            throw new AppError('Paciente no encontrado.', 404);
        }

        // Usar transacción para asegurar consistencia
        return await this.dataSource.transaction(async manager => {
            const deletedData = {
                clinical_records: 0,
                appointments: 0,
                progress_logs: 0,
                relations: 0,
                patient_profile: false,
                user_account: false,
            };

            // 1. Eliminar expedientes clínicos
            const clinicalRecordsRepo = manager.getRepository('ClinicalRecord');
            const clinicalRecords = await clinicalRecordsRepo.find({
                where: { patient: { id: patientId } },
            });
            if (clinicalRecords.length > 0) {
                await clinicalRecordsRepo.remove(clinicalRecords);
                deletedData.clinical_records = clinicalRecords.length;
            }

            // 2. Eliminar citas
            const appointmentsRepo = manager.getRepository(Appointment);
            const appointments = await appointmentsRepo.find({
                where: { patient: { id: patientId } },
            });
            if (appointments.length > 0) {
                await appointmentsRepo.remove(appointments);
                deletedData.appointments = appointments.length;
            }

            // 3. Eliminar logs de progreso
            const progressLogsRepo = manager.getRepository(PatientProgressLog);
            const progressLogs = await progressLogsRepo.find({
                where: { patient: { id: patientId } },
            });
            if (progressLogs.length > 0) {
                await progressLogsRepo.remove(progressLogs);
                deletedData.progress_logs = progressLogs.length;
            }

            // 4. Eliminar relaciones con nutriólogos
            const relationsRepo = manager.getRepository(PatientNutritionistRelation);
            const relations = await relationsRepo.find({
                where: { patient: { id: patientId } },
            });
            if (relations.length > 0) {
                await relationsRepo.remove(relations);
                deletedData.relations = relations.length;
            }

            // 5. Eliminar mensajes/conversaciones (si existen)
            try {
                const messagesRepo = manager.getRepository('Message');
                const messages = await messagesRepo.find({
                    where: [
                        { sender: { id: patientId } },
                        { recipient: { id: patientId } },
                    ],
                });
                if (messages.length > 0) {
                    await messagesRepo.remove(messages);
                }

                const conversationsRepo = manager.getRepository('Conversation');
                const conversations = await conversationsRepo.find({
                    where: [
                        { patient: { id: patientId } },
                        { nutritionist: { id: patientId } },
                    ],
                });
                if (conversations.length > 0) {
                    await conversationsRepo.remove(conversations);
                }
            } catch (error) {
                // Si las entidades no existen, continuamos
                console.log('Mensajes/conversaciones no encontradas, continuando...');
            }

            // 6. Eliminar suscripciones
            try {
                const subscriptionsRepo = manager.getRepository('UserSubscription');
                const subscriptions = await subscriptionsRepo.find({
                    where: { user: { id: patientId } },
                });
                if (subscriptions.length > 0) {
                    await subscriptionsRepo.remove(subscriptions);
                }
            } catch (error) {
                console.log('Suscripciones no encontradas, continuando...');
            }

            // 7. Eliminar perfil del paciente
            if (patient.patient_profile) {
                const profileRepo = manager.getRepository(PatientProfile);
                await profileRepo.remove(patient.patient_profile);
                deletedData.patient_profile = true;
            }

            // 8. Finalmente, eliminar el usuario
            const userRepo = manager.getRepository(User);
            await userRepo.remove(patient);
            deletedData.user_account = true;

            return {
                message: `Cuenta del paciente ${patient.first_name} ${patient.last_name} eliminada completamente.`,
                deleted_data: deletedData,
            };
        });
    }

    /**
     * Solicitar cambio de nutriólogo
     * Esto automáticamente transferirá todos los expedientes al nuevo nutriólogo
     */
    async requestNutritionistChange(
        patientId: string, 
        newNutritionistId: string, 
        reason?: string
    ): Promise<{
        message: string;
        new_relation: PatientNutritionistRelation;
        transfer_result?: any;
    }> {
        // Verificar que el paciente existe
        const patient = await this.userRepository.findOne({
            where: { id: patientId, role: { name: RoleName.PATIENT } },
            relations: ['role'],
        });

        if (!patient) {
            throw new AppError('Paciente no encontrado.', 404);
        }

        // Verificar que el nuevo nutriólogo existe
        const newNutritionist = await this.userRepository.findOne({
            where: { id: newNutritionistId, role: { name: RoleName.NUTRITIONIST } },
            relations: ['role'],
        });

        if (!newNutritionist) {
            throw new AppError('Nuevo nutriólogo no encontrado.', 404);
        }

        // Buscar relación activa actual
        const currentRelation = await this.relationRepository.findOne({
            where: {
                patient: { id: patientId },
                status: RelationshipStatus.ACTIVE,
            },
            relations: ['nutritionist'],
        });

        if (!currentRelation) {
            throw new AppError('No tienes una relación activa con ningún nutriólogo.', 404);
        }

        // Verificar que no sea el mismo nutriólogo
        if (currentRelation.nutritionist.id === newNutritionistId) {
            throw new AppError('Ya tienes una relación activa con este nutriólogo.', 400);
        }

        return await this.dataSource.transaction(async manager => {
            const relationRepo = manager.getRepository(PatientNutritionistRelation);

            // Terminar relación actual
            currentRelation.status = RelationshipStatus.INACTIVE;
            currentRelation.ended_at = new Date();
            currentRelation.notes = `${currentRelation.notes || ''}\n--- CAMBIO SOLICITADO ---\nPaciente solicitó cambio de nutriólogo el ${new Date().toLocaleString('es-MX')}. Motivo: ${reason || 'No especificado'}`;
            await relationRepo.save(currentRelation);

            // Crear nueva relación
            const newRelation = relationRepo.create({
                patient: patient,
                nutritionist: newNutritionist,
                status: RelationshipStatus.ACTIVE,
                notes: `Relación iniciada por cambio solicitado por el paciente. Relación anterior con Dr./Dra. ${currentRelation.nutritionist.first_name} ${currentRelation.nutritionist.last_name}. Motivo del cambio: ${reason || 'No especificado'}`,
                requested_at: new Date(),
                accepted_at: new Date(),
            });

            const savedRelation = await relationRepo.save(newRelation);

            // Transferir expedientes automáticamente
            const clinicalRecordsService = await import('@/modules/clinical_records/clinical_record.service');
            const transferResult = await clinicalRecordsService.default.transferPatientRecords(
                patientId,
                currentRelation.nutritionist.id,
                newNutritionistId
            );

            return {
                message: `Cambio de nutriólogo realizado exitosamente. ${transferResult.message}`,
                new_relation: savedRelation,
                transfer_result: transferResult,
            };
        });
    }
}