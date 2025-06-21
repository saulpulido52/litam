// src/modules/clinical_records/clinical_record.service.ts
import { Repository, Between } from 'typeorm';
import { AppDataSource } from '@/database/data-source';
import { User } from '@/database/entities/user.entity';
import { ClinicalRecord } from '@/database/entities/clinical_record.entity';
import { PatientNutritionistRelation, RelationshipStatus } from '@/database/entities/patient_nutritionist_relation.entity';
import { CreateUpdateClinicalRecordDto } from '@/modules/clinical_records/clinical_record.dto';
import { AppError } from '@/utils/app.error';
import { RoleName } from '@/database/entities/role.entity';

class ClinicalRecordService {
    private userRepository: Repository<User>;
    private clinicalRecordRepository: Repository<ClinicalRecord>;
    private relationRepository: Repository<PatientNutritionistRelation>;

    constructor() {
        this.userRepository = AppDataSource.getRepository(User);
        this.clinicalRecordRepository = AppDataSource.getRepository(ClinicalRecord);
        this.relationRepository = AppDataSource.getRepository(PatientNutritionistRelation);
    }

    // --- Métodos para Nutriólogos y Administradores ---

    public async createClinicalRecord(recordDto: CreateUpdateClinicalRecordDto, creatorId: string) {
        const creator = await this.userRepository.findOne({
            where: { id: creatorId }, // Creator can be Nutritionist or Admin
            relations: ['role'],
        });

        if (!creator || (creator.role.name !== RoleName.NUTRITIONIST && creator.role.name !== RoleName.ADMIN)) {
            throw new AppError('Usuario no encontrado o no tiene permisos (Nutriólogo/Admin) para crear registros clínicos.', 403);
        }

        const patient = await this.userRepository.findOne({
            where: { id: recordDto.patientId, role: { name: RoleName.PATIENT } },
        });
        if (!patient) {
            throw new AppError('Paciente no encontrado.', 404);
        }

        // Verificar relación activa si el creador es un nutriólogo
        if (creator.role.name === RoleName.NUTRITIONIST) {
            const activeRelation = await this.relationRepository.findOne({
                where: {
                    patient: { id: patient.id },
                    nutritionist: { id: creator.id }, // Check relation against the creator if they are a nutritionist
                    status: RelationshipStatus.ACTIVE,
                },
            });
            if (!activeRelation) {
                throw new AppError('El nutriólogo no está vinculado activamente con este paciente.', 403);
            }
        }

        const newRecord = this.clinicalRecordRepository.create({
            record_date: new Date(recordDto.recordDate), // Ensure snake_case for entity property
            patient: patient,
            nutritionist: creator, 
            expedient_number: recordDto.expedientNumber,
            consultation_reason: recordDto.consultationReason,
            current_problems: recordDto.currentProblems === undefined ? undefined : (recordDto.currentProblems === null ? null : {
                diarrhea: recordDto.currentProblems.diarrhea,
                constipation: recordDto.currentProblems.constipation,
                gastritis: recordDto.currentProblems.gastritis,
                ulcer: recordDto.currentProblems.ulcer,
                nausea: recordDto.currentProblems.nausea,
                pyrosis: recordDto.currentProblems.pyrosis,
                vomiting: recordDto.currentProblems.vomiting,
                colitis: recordDto.currentProblems.colitis,
                mouth_mechanics: recordDto.currentProblems.mouthMechanics,
                other_problems: recordDto.currentProblems.otherProblems,
                observations: recordDto.currentProblems.observations,
            }),
            diagnosed_diseases: recordDto.diagnosedDiseases === undefined ? undefined : (recordDto.diagnosedDiseases === null ? null : {
                has_disease: recordDto.diagnosedDiseases.hasDisease,
                disease_name: recordDto.diagnosedDiseases.diseaseName,
                since_when: recordDto.diagnosedDiseases.sinceWhen,
                takes_medication: recordDto.diagnosedDiseases.takesMedication,
                medications_list: recordDto.diagnosedDiseases.medicationsList,
                has_important_disease: recordDto.diagnosedDiseases.hasImportantDisease,
                important_disease_name: recordDto.diagnosedDiseases.importantDiseaseName,
                takes_special_treatment: recordDto.diagnosedDiseases.takesSpecialTreatment,
                special_treatment_details: recordDto.diagnosedDiseases.specialTreatmentDetails,
                has_surgery: recordDto.diagnosedDiseases.hasSurgery,
                surgery_details: recordDto.diagnosedDiseases.surgeryDetails,
            }),
            family_medical_history: recordDto.familyMedicalHistory === undefined ? undefined : (recordDto.familyMedicalHistory === null ? null : {
                obesity: recordDto.familyMedicalHistory.obesity,
                diabetes: recordDto.familyMedicalHistory.diabetes,
                hta: recordDto.familyMedicalHistory.hta,
                cancer: recordDto.familyMedicalHistory.cancer,
                hypo_hyperthyroidism: recordDto.familyMedicalHistory.hypoHyperthyroidism,
                dyslipidemia: recordDto.familyMedicalHistory.dyslipidemia,
                other_history: recordDto.familyMedicalHistory.otherHistory,
            }),
            gynecological_aspects: recordDto.gynecologicalAspects,
            daily_activities: recordDto.dailyActivities === undefined ? undefined : (recordDto.dailyActivities === null ? null : {
                wake_up: recordDto.dailyActivities.wakeUp,
                breakfast: recordDto.dailyActivities.breakfast,
                lunch: recordDto.dailyActivities.lunch,
                dinner: recordDto.dailyActivities.dinner,
                sleep: recordDto.dailyActivities.sleep,
                other_hours: recordDto.dailyActivities.otherHours, // Assuming sub-properties match
            }),
            activity_level_description: recordDto.activityLevelDescription,
            physical_exercise: recordDto.physicalExercise === undefined ? undefined : (recordDto.physicalExercise === null ? null : {
                performs_exercise: recordDto.physicalExercise.performsExercise,
                type: recordDto.physicalExercise.type,
                frequency: recordDto.physicalExercise.frequency,
                duration: recordDto.physicalExercise.duration,
                since_when: recordDto.physicalExercise.sinceWhen,
            }),
            consumption_habits: recordDto.consumptionHabits === undefined ? undefined : (recordDto.consumptionHabits === null ? null : {
                alcohol: recordDto.consumptionHabits.alcohol,
                tobacco: recordDto.consumptionHabits.tobacco,
                coffee: recordDto.consumptionHabits.coffee,
                other_substances: recordDto.consumptionHabits.otherSubstances,
            }),
            general_appearance: recordDto.generalAppearance,
            blood_pressure: recordDto.bloodPressure === undefined ? undefined : (recordDto.bloodPressure === null ? null : {
                knows_bp: recordDto.bloodPressure.knowsBp,
                habitual_bp: recordDto.bloodPressure.habitualBp,
                systolic: recordDto.bloodPressure.systolic,
                diastolic: recordDto.bloodPressure.diastolic,
            }),
            biochemical_indicators: recordDto.biochemicalIndicators,
            dietary_history: recordDto.dietaryHistory === undefined ? undefined : (recordDto.dietaryHistory === null ? null : {
                received_nutritional_guidance: recordDto.dietaryHistory.receivedNutritionalGuidance,
                when_received: recordDto.dietaryHistory.whenReceived,
                adherence_level: recordDto.dietaryHistory.adherenceLevel,
                adherence_reason: recordDto.dietaryHistory.adherenceReason,
                food_preparer: recordDto.dietaryHistory.foodPreparer,
                eats_at_home_or_out: recordDto.dietaryHistory.eatsAtHomeOrOut,
                modified_alimentation_last_6_months: recordDto.dietaryHistory.modifiedAlimentationLast6Months,
                modification_reason: recordDto.dietaryHistory.modificationReason,
                most_hungry_time: recordDto.dietaryHistory.mostHungryTime,
                preferred_foods: recordDto.dietaryHistory.preferredFoods,
                disliked_foods: recordDto.dietaryHistory.dislikedFoods,
                malestar_alergia_foods: recordDto.dietaryHistory.malestarAlergiaFoods,
                takes_supplements: recordDto.dietaryHistory.takesSupplements,
                supplement_details: recordDto.dietaryHistory.supplementDetails,
            }),
            food_group_consumption_frequency: recordDto.foodGroupConsumptionFrequency === undefined ? undefined : (recordDto.foodGroupConsumptionFrequency === null ? null : {
                vegetables: recordDto.foodGroupConsumptionFrequency.vegetables,
                fruits: recordDto.foodGroupConsumptionFrequency.fruits,
                cereals: recordDto.foodGroupConsumptionFrequency.cereals,
                legumes: recordDto.foodGroupConsumptionFrequency.legumes,
                animal_products: recordDto.foodGroupConsumptionFrequency.animalProducts,
                milk_products: recordDto.foodGroupConsumptionFrequency.milkProducts,
                fats: recordDto.foodGroupConsumptionFrequency.fats,
                sugars: recordDto.foodGroupConsumptionFrequency.sugars,
                alcohol: recordDto.foodGroupConsumptionFrequency.alcohol,
                other_frequency: recordDto.foodGroupConsumptionFrequency.otherFrequency, // Assuming sub-properties match
            }),
            water_consumption_liters: recordDto.waterConsumptionLiters,
            daily_diet_record: recordDto.dailyDietRecord === undefined ? undefined : (recordDto.dailyDietRecord === null ? null : {
                time_intervals: recordDto.dailyDietRecord.timeIntervals?.map(ti => ({
                    time: ti.time,
                    foods: ti.foods,
                    quantity: ti.quantity ?? '', // Default to empty string if undefined
                })),
                estimated_kcal: recordDto.dailyDietRecord.estimatedKcal,
            }),
            anthropometric_measurements: recordDto.anthropometricMeasurements === undefined ? undefined : (recordDto.anthropometricMeasurements === null ? null : {
                current_weight_kg: recordDto.anthropometricMeasurements.currentWeightKg,
                habitual_weight_kg: recordDto.anthropometricMeasurements.habitualWeightKg,
                height_m: recordDto.anthropometricMeasurements.heightM,
                arm_circ_cm: recordDto.anthropometricMeasurements.armCircCm,
                waist_circ_cm: recordDto.anthropometricMeasurements.waistCircCm,
                abdominal_circ_cm: recordDto.anthropometricMeasurements.abdominalCircCm,
                hip_circ_cm: recordDto.anthropometricMeasurements.hipCircCm,
                calf_circ_cm: recordDto.anthropometricMeasurements.calfCircCm,
                triceps_skinfold_mm: recordDto.anthropometricMeasurements.tricepsSkinfoldMm,
                bicipital_skinfold_mm: recordDto.anthropometricMeasurements.bicipitalSkinfoldMm,
                subscapular_skinfold_mm: recordDto.anthropometricMeasurements.subscapularSkinfoldMm,
                suprailiac_skinfold_mm: recordDto.anthropometricMeasurements.suprailiacSkinfoldMm,
            }),
            anthropometric_evaluations: recordDto.anthropometricEvaluations === undefined ? undefined : (recordDto.anthropometricEvaluations === null ? null : {
                complexion: recordDto.anthropometricEvaluations.complexion,
                ideal_weight_kg: recordDto.anthropometricEvaluations.idealWeightKg,
                imc_kg_t2: recordDto.anthropometricEvaluations.imcKgT2,
                weight_variation_percent: recordDto.anthropometricEvaluations.weightVariationPercent,
                habitual_weight_variation_percent: recordDto.anthropometricEvaluations.habitualWeightVariationPercent,
                min_max_imc_weight_kg: (recordDto.anthropometricEvaluations.minMaxImcWeightKg &&
                                        typeof recordDto.anthropometricEvaluations.minMaxImcWeightKg.min === 'number' &&
                                        typeof recordDto.anthropometricEvaluations.minMaxImcWeightKg.max === 'number')
                                       ? { 
                                           min: recordDto.anthropometricEvaluations.minMaxImcWeightKg.min,
                                           max: recordDto.anthropometricEvaluations.minMaxImcWeightKg.max
                                         }
                                       : undefined,
                adjusted_ideal_weight_kg: recordDto.anthropometricEvaluations.adjustedIdealWeightKg,
                waist_hip_ratio_cm: recordDto.anthropometricEvaluations.waistHipRatioCm,
                arm_muscle_area_cm2: recordDto.anthropometricEvaluations.armMuscleAreaCm2,
                total_muscle_mass_kg: recordDto.anthropometricEvaluations.totalMuscleMassKg,
                body_fat_percentage: recordDto.anthropometricEvaluations.bodyFatPercentage,
                total_body_fat_kg: recordDto.anthropometricEvaluations.totalBodyFatKg,
                fat_free_mass_kg: recordDto.anthropometricEvaluations.fatFreeMassKg,
                fat_excess_deficiency_percent: recordDto.anthropometricEvaluations.fatExcessDeficiencyPercent,
                fat_excess_deficiency_kg: recordDto.anthropometricEvaluations.fatExcessDeficiencyKg,
                triceps_skinfold_percentile: recordDto.anthropometricEvaluations.tricepsSkinfoldPercentile,
                subscapular_skinfold_percentile: recordDto.anthropometricEvaluations.subscapularSkinfoldPercentile,
                total_body_water_liters: recordDto.anthropometricEvaluations.totalBodyWaterLiters,
            }),
            nutritional_diagnosis: recordDto.nutritionalDiagnosis,
            energy_nutrient_needs: recordDto.energyNutrientNeeds === undefined ? undefined : (recordDto.energyNutrientNeeds === null ? null : {
                get: recordDto.energyNutrientNeeds.get,
                geb: recordDto.energyNutrientNeeds.geb,
                eta: recordDto.energyNutrientNeeds.eta,
                fa: recordDto.energyNutrientNeeds.fa,
                total_calories: recordDto.energyNutrientNeeds.totalCalories,
            }),
            nutritional_plan_and_management: recordDto.nutritionalPlanAndManagement,
            macronutrient_distribution: recordDto.macronutrientDistribution === undefined ? undefined : (recordDto.macronutrientDistribution === null ? null : {
                carbohydrates_g: recordDto.macronutrientDistribution.carbohydratesG,
                carbohydrates_kcal: recordDto.macronutrientDistribution.carbohydratesKcal,
                carbohydrates_percent: recordDto.macronutrientDistribution.carbohydratesPercent,
                proteins_g: recordDto.macronutrientDistribution.proteinsG,
                proteins_kcal: recordDto.macronutrientDistribution.proteinsKcal,
                proteins_percent: recordDto.macronutrientDistribution.proteinsPercent,
                lipids_g: recordDto.macronutrientDistribution.lipidsG,
                lipids_kcal: recordDto.macronutrientDistribution.lipidsKcal,
                lipids_percent: recordDto.macronutrientDistribution.lipidsPercent,
            }),
            dietary_calculation_scheme: recordDto.dietaryCalculationScheme,
            menu_details: recordDto.menuDetails,
            evolution_and_follow_up_notes: recordDto.evolutionAndFollowUpNotes,
            graph_url: recordDto.graphUrl,
        });

        await this.clinicalRecordRepository.save(newRecord);
        return newRecord;
    }

    public async getPatientClinicalRecords(patientId: string, callerId: string, callerRole: RoleName, startDate?: string, endDate?: string) {
        const patient = await this.userRepository.findOne({ where: { id: patientId } });
        if (!patient) {
            throw new AppError('Paciente no encontrado.', 404);
        }

        // Permisos: Paciente solo ve los suyos. Nutriólogo solo ve los de sus pacientes vinculados. Admin ve todo.
        if (callerRole === RoleName.PATIENT) {
            if (patientId !== callerId) {
                throw new AppError('No tienes permiso para ver registros clínicos de otros pacientes.', 403);
            }
        } else if (callerRole === RoleName.NUTRITIONIST) {
            const activeRelation = await this.relationRepository.findOne({
                where: {
                    patient: { id: patientId },
                    nutritionist: { id: callerId },
                    status: RelationshipStatus.ACTIVE,
                },
            });
            if (!activeRelation) {
                throw new AppError('No estás vinculado con este paciente o no tienes permiso para ver sus registros clínicos.', 403);
            }
        } else if (callerRole !== RoleName.ADMIN) {
            throw new AppError('Acceso denegado. Rol no autorizado para ver registros clínicos.', 403);
        }

        const whereClause: any = { patient: { id: patientId } };
        if (startDate && endDate) {
            whereClause.record_date = Between(new Date(startDate), new Date(endDate));
        } else if (startDate) {
            whereClause.record_date = Between(new Date(startDate), new Date());
        } else if (endDate) {
            whereClause.record_date = Between(new Date('1900-01-01'), new Date(endDate));
        }

        const records = await this.clinicalRecordRepository.find({
            where: whereClause,
            relations: ['nutritionist', 'patient'], // Cargar nutriólogo y paciente para detalles
            order: { record_date: 'DESC', created_at: 'DESC' }, // Ordenar por fecha de registro
        });

        return records.map(record => {
            const { password_hash: nutriHash, ...nutriClean } = record.nutritionist;
            const { password_hash: patientHash, ...patientClean } = record.patient;
            // Consider verifying if User.password_hash (select: false) is effective for relations.
            // If so, this manual removal might be redundant.
            return { ...record, nutritionist: nutriClean, patient: patientClean };
        });
    }

    public async getClinicalRecordById(recordId: string, callerId: string, callerRole: RoleName) {
        const record = await this.clinicalRecordRepository.findOne({
            where: { id: recordId },
            relations: ['patient', 'patient.role', 'nutritionist', 'nutritionist.role'],
        });

        if (!record) {
            throw new AppError('Registro clínico no encontrado.', 404);
        }

        // Permisos de lectura
        if (callerRole === RoleName.PATIENT && record.patient.id !== callerId) {
            throw new AppError('No tienes permiso para ver este registro clínico.', 403);
        } else if (callerRole === RoleName.NUTRITIONIST && record.nutritionist.id !== callerId) {
            // Un nutriólogo solo puede ver los registros que él mismo creó o los de sus pacientes activos (lógica más avanzada)
            const activeRelation = await this.relationRepository.findOne({
                where: { patient: { id: record.patient.id }, nutritionist: { id: callerId }, status: RelationshipStatus.ACTIVE },
            });
            if (!activeRelation) {
                throw new AppError('No tienes permiso para ver este registro clínico.', 403);
            }
        } else if (callerRole !== RoleName.ADMIN && callerRole !== RoleName.NUTRITIONIST && callerRole !== RoleName.PATIENT) {
            throw new AppError('Acceso denegado. Rol no autorizado para ver registros clínicos.', 403);
        }

        const { password_hash: nutriHash, ...nutriClean } = record.nutritionist;
        const { password_hash: patientHash, ...patientClean } = record.patient;
        // Consider verifying if User.password_hash (select: false) is effective for relations.
        // If so, this manual removal might be redundant.
        return { ...record, nutritionist: nutriClean, patient: patientClean };
    }


    public async updateClinicalRecord(recordId: string, updateDto: CreateUpdateClinicalRecordDto, updaterId: string) {
        const updater = await this.userRepository.findOne({
            where: { id: updaterId },
            relations: ['role'],
        });
        if (!updater || (updater.role.name !== RoleName.NUTRITIONIST && updater.role.name !== RoleName.ADMIN)) {
            throw new AppError('Acceso denegado. Solo nutriólogos o administradores pueden actualizar registros clínicos.', 403);
        }

        const record = await this.clinicalRecordRepository.findOne({
            where: { id: recordId },
            relations: ['patient', 'nutritionist'], // Para verificar permisos
        });
        if (!record) {
            throw new AppError('Registro clínico no encontrado.', 404);
        }

        // Solo el nutriólogo que lo creó o un administrador puede actualizarlo
        if (record.nutritionist.id !== updaterId && updater.role.name !== RoleName.ADMIN) {
            throw new AppError('No tienes permiso para actualizar este registro clínico.', 403);
        }

        const updates = this.mapDtoToEntityUpdate(updateDto);
        Object.assign(record, updates);

        await this.clinicalRecordRepository.save(record);
        return record;
    }

    public async deleteClinicalRecord(recordId: string, deleterId: string) {
        const deleter = await this.userRepository.findOne({
            where: { id: deleterId },
            relations: ['role'],
        });
        if (!deleter || (deleter.role.name !== RoleName.NUTRITIONIST && deleter.role.name !== RoleName.ADMIN)) {
            throw new AppError('Acceso denegado. Solo nutriólogos o administradores pueden eliminar registros clínicos.', 403);
        }

        const record = await this.clinicalRecordRepository.findOne({
            where: { id: recordId },
            relations: ['nutritionist'],
        });
        if (!record) {
            throw new AppError('Registro clínico no encontrado.', 404);
        }

        // Solo el nutriólogo que lo creó o un administrador puede eliminarlo
        if (record.nutritionist.id !== deleterId && deleter.role.name !== RoleName.ADMIN) {
            throw new AppError('No tienes permiso para eliminar este registro clínico.', 403);
        }

        await this.clinicalRecordRepository.remove(record);
        return { message: 'Registro clínico eliminado con éxito.' };
    }

    private mapDtoToEntityUpdate(dto: CreateUpdateClinicalRecordDto): Partial<ClinicalRecord> {
        const entityUpdate: Partial<ClinicalRecord> = {};

        if (dto.recordDate !== undefined) entityUpdate.record_date = new Date(dto.recordDate);
        if (dto.expedientNumber !== undefined) entityUpdate.expedient_number = dto.expedientNumber;
        if (dto.consultationReason !== undefined) entityUpdate.consultation_reason = dto.consultationReason;       

        if (dto.currentProblems !== undefined) {
            entityUpdate.current_problems = dto.currentProblems === null ? null : {
                diarrhea: dto.currentProblems.diarrhea,
                constipation: dto.currentProblems.constipation,
                gastritis: dto.currentProblems.gastritis,
                ulcer: dto.currentProblems.ulcer,
                nausea: dto.currentProblems.nausea,
                pyrosis: dto.currentProblems.pyrosis,
                vomiting: dto.currentProblems.vomiting,
                colitis: dto.currentProblems.colitis,
                mouth_mechanics: dto.currentProblems.mouthMechanics,
                other_problems: dto.currentProblems.otherProblems,
                observations: dto.currentProblems.observations,
            };
        }
        if (dto.diagnosedDiseases !== undefined) {
            entityUpdate.diagnosed_diseases = dto.diagnosedDiseases === null ? null : {
                has_disease: dto.diagnosedDiseases.hasDisease,
                disease_name: dto.diagnosedDiseases.diseaseName,
                since_when: dto.diagnosedDiseases.sinceWhen,
                takes_medication: dto.diagnosedDiseases.takesMedication,
                medications_list: dto.diagnosedDiseases.medicationsList,
                has_important_disease: dto.diagnosedDiseases.hasImportantDisease,
                important_disease_name: dto.diagnosedDiseases.importantDiseaseName,
                takes_special_treatment: dto.diagnosedDiseases.takesSpecialTreatment,
                special_treatment_details: dto.diagnosedDiseases.specialTreatmentDetails,
                has_surgery: dto.diagnosedDiseases.hasSurgery,
                surgery_details: dto.diagnosedDiseases.surgeryDetails,
            };
        }
        if (dto.familyMedicalHistory !== undefined) {
            entityUpdate.family_medical_history = dto.familyMedicalHistory === null ? null : {
                obesity: dto.familyMedicalHistory.obesity,
                diabetes: dto.familyMedicalHistory.diabetes,
                hta: dto.familyMedicalHistory.hta,
                cancer: dto.familyMedicalHistory.cancer,
                hypo_hyperthyroidism: dto.familyMedicalHistory.hypoHyperthyroidism,
                dyslipidemia: dto.familyMedicalHistory.dyslipidemia,
                other_history: dto.familyMedicalHistory.otherHistory,
            };
        }
        if (dto.gynecologicalAspects !== undefined) entityUpdate.gynecological_aspects = dto.gynecologicalAspects;
        if (dto.dailyActivities !== undefined) {
            entityUpdate.daily_activities = dto.dailyActivities === null ? null : {
                wake_up: dto.dailyActivities.wakeUp,
                breakfast: dto.dailyActivities.breakfast,
                lunch: dto.dailyActivities.lunch,
                dinner: dto.dailyActivities.dinner,
                sleep: dto.dailyActivities.sleep,
                other_hours: dto.dailyActivities.otherHours,
            };
        }
        if (dto.activityLevelDescription !== undefined) entityUpdate.activity_level_description = dto.activityLevelDescription;
        if (dto.physicalExercise !== undefined) {
            entityUpdate.physical_exercise = dto.physicalExercise === null ? null : {
                performs_exercise: dto.physicalExercise.performsExercise,
                type: dto.physicalExercise.type,
                frequency: dto.physicalExercise.frequency,
                duration: dto.physicalExercise.duration,
                since_when: dto.physicalExercise.sinceWhen,
            };
        }
        if (dto.consumptionHabits !== undefined) {
            entityUpdate.consumption_habits = dto.consumptionHabits === null ? null : {
                alcohol: dto.consumptionHabits.alcohol,
                tobacco: dto.consumptionHabits.tobacco,
                coffee: dto.consumptionHabits.coffee,
                other_substances: dto.consumptionHabits.otherSubstances,
            };
        }
        if (dto.generalAppearance !== undefined) entityUpdate.general_appearance = dto.generalAppearance;
        if (dto.bloodPressure !== undefined) {
            entityUpdate.blood_pressure = dto.bloodPressure === null ? null : {
                knows_bp: dto.bloodPressure.knowsBp,
                habitual_bp: dto.bloodPressure.habitualBp,
                systolic: dto.bloodPressure.systolic,
                diastolic: dto.bloodPressure.diastolic,
            };
        }
        if (dto.biochemicalIndicators !== undefined) entityUpdate.biochemical_indicators = dto.biochemicalIndicators;
        if (dto.dietaryHistory !== undefined) {
            entityUpdate.dietary_history = dto.dietaryHistory === null ? null : {
                received_nutritional_guidance: dto.dietaryHistory.receivedNutritionalGuidance,
                when_received: dto.dietaryHistory.whenReceived,
                adherence_level: dto.dietaryHistory.adherenceLevel,
                adherence_reason: dto.dietaryHistory.adherenceReason,
                food_preparer: dto.dietaryHistory.foodPreparer,
                eats_at_home_or_out: dto.dietaryHistory.eatsAtHomeOrOut,
                modified_alimentation_last_6_months: dto.dietaryHistory.modifiedAlimentationLast6Months,
                modification_reason: dto.dietaryHistory.modificationReason,
                most_hungry_time: dto.dietaryHistory.mostHungryTime,
                preferred_foods: dto.dietaryHistory.preferredFoods,
                disliked_foods: dto.dietaryHistory.dislikedFoods,
                malestar_alergia_foods: dto.dietaryHistory.malestarAlergiaFoods,
                takes_supplements: dto.dietaryHistory.takesSupplements,
                supplement_details: dto.dietaryHistory.supplementDetails,
            };
        }
        if (dto.foodGroupConsumptionFrequency !== undefined) {
            entityUpdate.food_group_consumption_frequency = dto.foodGroupConsumptionFrequency === null ? null : {
                vegetables: dto.foodGroupConsumptionFrequency.vegetables,
                fruits: dto.foodGroupConsumptionFrequency.fruits,
                cereals: dto.foodGroupConsumptionFrequency.cereals,
                legumes: dto.foodGroupConsumptionFrequency.legumes,
                animal_products: dto.foodGroupConsumptionFrequency.animalProducts,
                milk_products: dto.foodGroupConsumptionFrequency.milkProducts,
                fats: dto.foodGroupConsumptionFrequency.fats,
                sugars: dto.foodGroupConsumptionFrequency.sugars,
                alcohol: dto.foodGroupConsumptionFrequency.alcohol,
                other_frequency: dto.foodGroupConsumptionFrequency.otherFrequency,
            };
        }
        if (dto.waterConsumptionLiters !== undefined) entityUpdate.water_consumption_liters = dto.waterConsumptionLiters;
        if (dto.dailyDietRecord !== undefined) {
            entityUpdate.daily_diet_record = dto.dailyDietRecord === null ? null : {
                time_intervals: dto.dailyDietRecord.timeIntervals?.map(ti => ({
                    time: ti.time,
                    foods: ti.foods,
                    quantity: ti.quantity ?? '', // Default to empty string if undefined
                })),
                estimated_kcal: dto.dailyDietRecord.estimatedKcal,
            };
        }
        if (dto.anthropometricMeasurements !== undefined) {
            entityUpdate.anthropometric_measurements = dto.anthropometricMeasurements === null ? null : {
                current_weight_kg: dto.anthropometricMeasurements.currentWeightKg,
                habitual_weight_kg: dto.anthropometricMeasurements.habitualWeightKg,
                height_m: dto.anthropometricMeasurements.heightM,
                arm_circ_cm: dto.anthropometricMeasurements.armCircCm,
                waist_circ_cm: dto.anthropometricMeasurements.waistCircCm,
                abdominal_circ_cm: dto.anthropometricMeasurements.abdominalCircCm,
                hip_circ_cm: dto.anthropometricMeasurements.hipCircCm,
                calf_circ_cm: dto.anthropometricMeasurements.calfCircCm,
                triceps_skinfold_mm: dto.anthropometricMeasurements.tricepsSkinfoldMm,
                bicipital_skinfold_mm: dto.anthropometricMeasurements.bicipitalSkinfoldMm,
                subscapular_skinfold_mm: dto.anthropometricMeasurements.subscapularSkinfoldMm,
                suprailiac_skinfold_mm: dto.anthropometricMeasurements.suprailiacSkinfoldMm,
            };
        }
        if (dto.anthropometricEvaluations !== undefined) {
            entityUpdate.anthropometric_evaluations = dto.anthropometricEvaluations === null ? null : {
                complexion: dto.anthropometricEvaluations.complexion,
                ideal_weight_kg: dto.anthropometricEvaluations.idealWeightKg,
                imc_kg_t2: dto.anthropometricEvaluations.imcKgT2,
                weight_variation_percent: dto.anthropometricEvaluations.weightVariationPercent,
                habitual_weight_variation_percent: dto.anthropometricEvaluations.habitualWeightVariationPercent,
                min_max_imc_weight_kg: (dto.anthropometricEvaluations.minMaxImcWeightKg &&
                                        typeof dto.anthropometricEvaluations.minMaxImcWeightKg.min === 'number' &&
                                        typeof dto.anthropometricEvaluations.minMaxImcWeightKg.max === 'number')
                                       ? { 
                                           min: dto.anthropometricEvaluations.minMaxImcWeightKg.min,
                                           max: dto.anthropometricEvaluations.minMaxImcWeightKg.max
                                         }
                                       : undefined,
                adjusted_ideal_weight_kg: dto.anthropometricEvaluations.adjustedIdealWeightKg,
                waist_hip_ratio_cm: dto.anthropometricEvaluations.waistHipRatioCm,
                arm_muscle_area_cm2: dto.anthropometricEvaluations.armMuscleAreaCm2,
                total_muscle_mass_kg: dto.anthropometricEvaluations.totalMuscleMassKg,
                body_fat_percentage: dto.anthropometricEvaluations.bodyFatPercentage,
                total_body_fat_kg: dto.anthropometricEvaluations.totalBodyFatKg,
                fat_free_mass_kg: dto.anthropometricEvaluations.fatFreeMassKg,
                fat_excess_deficiency_percent: dto.anthropometricEvaluations.fatExcessDeficiencyPercent,
                fat_excess_deficiency_kg: dto.anthropometricEvaluations.fatExcessDeficiencyKg,
                triceps_skinfold_percentile: dto.anthropometricEvaluations.tricepsSkinfoldPercentile,
                subscapular_skinfold_percentile: dto.anthropometricEvaluations.subscapularSkinfoldPercentile,
                total_body_water_liters: dto.anthropometricEvaluations.totalBodyWaterLiters,
            };
        }
        if (dto.nutritionalDiagnosis !== undefined) entityUpdate.nutritional_diagnosis = dto.nutritionalDiagnosis;
        if (dto.energyNutrientNeeds !== undefined) {
            entityUpdate.energy_nutrient_needs = dto.energyNutrientNeeds === null ? null : {
                get: dto.energyNutrientNeeds.get,
                geb: dto.energyNutrientNeeds.geb,
                eta: dto.energyNutrientNeeds.eta,
                fa: dto.energyNutrientNeeds.fa,
                total_calories: dto.energyNutrientNeeds.totalCalories,
            };
        }
        if (dto.nutritionalPlanAndManagement !== undefined) entityUpdate.nutritional_plan_and_management = dto.nutritionalPlanAndManagement;
        if (dto.macronutrientDistribution !== undefined) {
            entityUpdate.macronutrient_distribution = dto.macronutrientDistribution === null ? null : {
                carbohydrates_g: dto.macronutrientDistribution.carbohydratesG,
                carbohydrates_kcal: dto.macronutrientDistribution.carbohydratesKcal,
                carbohydrates_percent: dto.macronutrientDistribution.carbohydratesPercent,
                proteins_g: dto.macronutrientDistribution.proteinsG,
                proteins_kcal: dto.macronutrientDistribution.proteinsKcal,
                proteins_percent: dto.macronutrientDistribution.proteinsPercent,
                lipids_g: dto.macronutrientDistribution.lipidsG,
                lipids_kcal: dto.macronutrientDistribution.lipidsKcal,
                lipids_percent: dto.macronutrientDistribution.lipidsPercent,
            };
        }
        if (dto.dietaryCalculationScheme !== undefined) entityUpdate.dietary_calculation_scheme = dto.dietaryCalculationScheme;
        if (dto.menuDetails !== undefined) entityUpdate.menu_details = dto.menuDetails;
        if (dto.evolutionAndFollowUpNotes !== undefined) entityUpdate.evolution_and_follow_up_notes = dto.evolutionAndFollowUpNotes;
        if (dto.graphUrl !== undefined) entityUpdate.graph_url = dto.graphUrl;
        
        return entityUpdate;
    }
}

export default new ClinicalRecordService();