// src/modules/clinical_records/clinical_record.service.ts
import { Repository, Between } from 'typeorm';
import { AppDataSource } from '../../database/data-source';
import { User } from '../../database/entities/user.entity';
import { ClinicalRecord } from '../../database/entities/clinical_record.entity';
import { PatientNutritionistRelation, RelationshipStatus } from '../../database/entities/patient_nutritionist_relation.entity';
import { CreateUpdateClinicalRecordDto } from '../../modules/clinical_records/clinical_record.dto';
import { AppError } from '../../utils/app.error';
import { RoleName } from '../../database/entities/role.entity';
import { promises as fs } from 'fs';
import * as path from 'path';
import * as PDFDocument from 'pdfkit';

class ClinicalRecordService {
    private userRepository: Repository<User>;
    private clinicalRecordRepository: Repository<ClinicalRecord>;
    private relationRepository: Repository<PatientNutritionistRelation>;

    constructor() {
        this.userRepository = AppDataSource.getRepository(User);
        this.clinicalRecordRepository = AppDataSource.getRepository(ClinicalRecord);
        this.relationRepository = AppDataSource.getRepository(PatientNutritionistRelation);
    }

    /**
     * 🩺 Validaciones adicionales de datos clínicos
     */
    private validateClinicalData(recordDto: CreateUpdateClinicalRecordDto): void {
        // Validar presión arterial
        if (recordDto.bloodPressure && recordDto.bloodPressure.knowsBp) {
            const { systolic, diastolic } = recordDto.bloodPressure;
            
            if (systolic && diastolic) {
                if (diastolic >= systolic) {
                    throw new AppError(
                        `La presión diastólica (${diastolic}) no puede ser mayor o igual que la sistólica (${systolic}). Por favor verifica los valores.`,
                        400,
                        'INVALID_BLOOD_PRESSURE'
                    );
                }
                
                // Validaciones de rangos anormales
                if (systolic > 200 || diastolic > 120) {
                    throw new AppError(
                        `Valores de presión arterial anormalmente altos (${systolic}/${diastolic}). Por favor verifica los datos.`,
                        400,
                        'ABNORMAL_BLOOD_PRESSURE'
                    );
                }
                
                if (systolic < 60 || diastolic < 40) {
                    throw new AppError(
                        `Valores de presión arterial anormalmente bajos (${systolic}/${diastolic}). Por favor verifica los datos.`,
                        400,
                        'ABNORMAL_BLOOD_PRESSURE'
                    );
                }
            }
        }

        // Validar mediciones antropométricas
        if (recordDto.anthropometricMeasurements) {
            const { currentWeightKg, heightM, waistCircCm, hipCircCm } = recordDto.anthropometricMeasurements;
            
            // Validar IMC extremo
            if (currentWeightKg && heightM) {
                const bmi = currentWeightKg / (heightM * heightM);
                if (bmi < 10 || bmi > 70) {
                    throw new AppError(
                        `El IMC calculado (${bmi.toFixed(1)}) está fuera de rangos realistas. Por favor verifica peso (${currentWeightKg}kg) y altura (${heightM}m).`,
                        400,
                        'INVALID_BMI'
                    );
                }
            }
            
            // Validar relación cintura-cadera
            if (waistCircCm && hipCircCm && waistCircCm > hipCircCm * 1.5) {
                throw new AppError(
                    `La circunferencia de cintura (${waistCircCm}cm) es desproporcionalmente mayor que la de cadera (${hipCircCm}cm). Por favor verifica los datos.`,
                    400,
                    'INVALID_WAIST_HIP_RATIO'
                );
            }
        }
    }

    // --- Métodos para Nutriólogos y Administradores ---

    public async createClinicalRecord(recordDto: CreateUpdateClinicalRecordDto, creatorId: string) {
        // 🩺 Validaciones adicionales de datos clínicos
        this.validateClinicalData(recordDto);
        const creator = await this.userRepository.findOne({
            where: { id: creatorId }, // Creator can be Nutritionist or Admin
            relations: ['role'],
        });

        if (!creator || (creator.role.name !== RoleName.NUTRITIONIST && creator.role.name !== RoleName.ADMIN)) {
            throw new AppError('Usuario no encontrado o no tiene permisos (Nutriólogo/Admin) para crear registros clínicos.', 403);
        }

        // Intentar buscar primero por ID de usuario
        let patient = await this.userRepository.findOne({ 
            where: { id: recordDto.patientId, role: { name: RoleName.PATIENT } },
            relations: ['role']
        });
        
        // Si no se encuentra por ID de usuario, buscar por ID de perfil de paciente
        if (!patient) {
            const patientProfile = await this.userRepository.findOne({
                where: { patient_profile: { id: recordDto.patientId } },
                relations: ['patient_profile', 'role']
            });
            if (patientProfile && patientProfile.role.name === RoleName.PATIENT) {
                patient = patientProfile;
            }
        }
        
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
                mouth_mechanics: recordDto.currentProblems.mouth_mechanics,
                other_problems: recordDto.currentProblems.other_problems,
                observations: recordDto.currentProblems.observations,
            }),
            diagnosed_diseases: recordDto.diagnosedDiseases === undefined ? undefined : (recordDto.diagnosedDiseases === null ? null : {
                has_disease: recordDto.diagnosedDiseases.hasDisease,
                disease_name: recordDto.diagnosedDiseases.diseaseName,
                since_when: recordDto.diagnosedDiseases.sinceWhen,
                takes_medication: recordDto.diagnosedDiseases.takesMedication,
                medications_list: recordDto.diagnosedDiseases.medications_list,
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
        // Intentar buscar primero por ID de usuario
        let patient = await this.userRepository.findOne({ where: { id: patientId } });
        
        // Si no se encuentra por ID de usuario, buscar por ID de perfil de paciente
        if (!patient) {
            const patientProfile = await this.userRepository.findOne({
                where: { patient_profile: { id: patientId } },
                relations: ['patient_profile']
            });
            if (patientProfile) {
                patient = patientProfile;
                // Usar el ID del usuario para las consultas posteriores
                patientId = patient.id;
            }
        }
        
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
                mouth_mechanics: dto.currentProblems.mouth_mechanics,
                other_problems: dto.currentProblems.other_problems,
                observations: dto.currentProblems.observations,
            };
        }
        if (dto.diagnosedDiseases !== undefined) {
            entityUpdate.diagnosed_diseases = dto.diagnosedDiseases === null ? null : {
                has_disease: dto.diagnosedDiseases.hasDisease,
                disease_name: dto.diagnosedDiseases.diseaseName,
                since_when: dto.diagnosedDiseases.sinceWhen,
                takes_medication: dto.diagnosedDiseases.takesMedication,
                medications_list: dto.diagnosedDiseases.medications_list,
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

    // --- MÉTODOS PARA GESTIÓN DE EXPEDIENTES ESPECIALIZADOS ---

    /**
     * Transfiere todos los expedientes de un paciente de un nutriólogo anterior a uno nuevo
     * Se ejecuta automáticamente cuando el paciente cambia de nutriólogo
     */
    public async transferPatientRecords(patientId: string, fromNutritionistId: string, toNutritionistId: string) {
        // Verificar que el nuevo nutriólogo existe
        const newNutritionist = await this.userRepository.findOne({
            where: { id: toNutritionistId, role: { name: RoleName.NUTRITIONIST } },
            relations: ['role'],
        });
        if (!newNutritionist) {
            throw new AppError('Nuevo nutriólogo no encontrado.', 404);
        }

        // Obtener todos los registros clínicos del paciente con el nutriólogo anterior
        const recordsToTransfer = await this.clinicalRecordRepository.find({
            where: {
                patient: { id: patientId },
                nutritionist: { id: fromNutritionistId },
            },
            relations: ['patient', 'nutritionist'],
        });

        if (recordsToTransfer.length === 0) {
            return { message: 'No hay expedientes que transferir.', transferred_count: 0 };
        }

        // Transferir cada registro al nuevo nutriólogo
        for (const record of recordsToTransfer) {
            record.nutritionist = newNutritionist;
            
            // Agregar nota de transferencia en las notas de evolución
            const transferNote = `\n\n--- TRANSFERENCIA ---\nExpediente transferido del Dr./Dra. ${record.nutritionist.first_name} ${record.nutritionist.last_name} al Dr./Dra. ${newNutritionist.first_name} ${newNutritionist.last_name} el ${new Date().toLocaleString('es-MX')}\n`;
            
            if (record.evolution_and_follow_up_notes) {
                record.evolution_and_follow_up_notes += transferNote;
            } else {
                record.evolution_and_follow_up_notes = transferNote;
            }
        }

        await this.clinicalRecordRepository.save(recordsToTransfer);

        return {
            message: `${recordsToTransfer.length} expediente(s) transferido(s) exitosamente.`,
            transferred_count: recordsToTransfer.length,
            new_nutritionist: {
                id: newNutritionist.id,
                name: `${newNutritionist.first_name} ${newNutritionist.last_name}`,
            },
        };
    }

    /**
     * Elimina todos los expedientes clínicos de un paciente
     * Solo debe llamarse cuando el paciente elimine completamente su cuenta
     */
    public async deleteAllPatientRecords(patientId: string, requesterId: string, requesterRole: RoleName) {
        // Solo el propio paciente o un administrador pueden eliminar todos los expedientes
        if (requesterRole !== RoleName.ADMIN && requesterId !== patientId) {
            throw new AppError('Solo el paciente o un administrador pueden eliminar todos los expedientes.', 403);
        }

        // Verificar que el paciente existe
        const patient = await this.userRepository.findOne({
            where: { id: patientId, role: { name: RoleName.PATIENT } },
            relations: ['role'],
        });
        if (!patient) {
            throw new AppError('Paciente no encontrado.', 404);
        }

        // Obtener todos los registros clínicos del paciente
        const allPatientRecords = await this.clinicalRecordRepository.find({
            where: { patient: { id: patientId } },
        });

        if (allPatientRecords.length === 0) {
            return { message: 'No hay expedientes para eliminar.', deleted_count: 0 };
        }

        // Eliminar todos los registros
        await this.clinicalRecordRepository.remove(allPatientRecords);

        return {
            message: `${allPatientRecords.length} expediente(s) eliminado(s) permanentemente debido a la eliminación de cuenta del paciente.`,
            deleted_count: allPatientRecords.length,
            patient: {
                id: patient.id,
                name: `${patient.first_name} ${patient.last_name}`,
            },
        };
    }

    /**
     * Obtiene estadísticas de expedientes de un paciente
     */
    public async getPatientRecordsStats(patientId: string, callerId: string, callerRole: RoleName) {
        // Verificar permisos
        if (callerRole === RoleName.PATIENT && patientId !== callerId) {
            throw new AppError('No tienes permiso para ver estadísticas de otros pacientes.', 403);
        } else if (callerRole === RoleName.NUTRITIONIST) {
            const activeRelation = await this.relationRepository.findOne({
                where: {
                    patient: { id: patientId },
                    nutritionist: { id: callerId },
                    status: RelationshipStatus.ACTIVE,
                },
            });
            if (!activeRelation) {
                throw new AppError('No tienes una relación activa con este paciente.', 403);
            }
        } else if (callerRole !== RoleName.ADMIN) {
            throw new AppError('Rol no autorizado.', 403);
        }

        const totalRecords = await this.clinicalRecordRepository.count({
            where: { patient: { id: patientId } },
        });

        const recordsByNutritionist = await this.clinicalRecordRepository
            .createQueryBuilder('record')
            .leftJoin('record.nutritionist', 'nutritionist')
            .select('nutritionist.id', 'nutritionist_id')
            .addSelect('nutritionist.first_name', 'first_name')
            .addSelect('nutritionist.last_name', 'last_name')
            .addSelect('COUNT(record.id)', 'record_count')
            .where('record.patient_user_id = :patientId', { patientId })
            .groupBy('nutritionist.id, nutritionist.first_name, nutritionist.last_name')
            .getRawMany();

        const latestRecord = await this.clinicalRecordRepository.findOne({
            where: { patient: { id: patientId } },
            relations: ['nutritionist'],
            order: { record_date: 'DESC', created_at: 'DESC' },
        });

        return {
            total_records: totalRecords,
            records_by_nutritionist: recordsByNutritionist.map(item => ({
                nutritionist: {
                    id: item.nutritionist_id,
                    name: `${item.first_name} ${item.last_name}`,
                },
                record_count: parseInt(item.record_count),
            })),
            latest_record: latestRecord ? {
                id: latestRecord.id,
                date: latestRecord.record_date,
                nutritionist: {
                    id: latestRecord.nutritionist.id,
                    name: `${latestRecord.nutritionist.first_name} ${latestRecord.nutritionist.last_name}`,
                },
            } : null,
        };
    }

    /**
     * Obtiene el conteo de expedientes de un paciente
     */
    public async getPatientRecordsCount(patientId: string, callerId: string, callerRole: RoleName) {
        // Verificar permisos
        if (callerRole === RoleName.PATIENT && patientId !== callerId) {
            throw new AppError('No tienes permiso para ver el conteo de expedientes de otros pacientes.', 403);
        } else if (callerRole === RoleName.NUTRITIONIST) {
            const activeRelation = await this.relationRepository.findOne({
                where: {
                    patient: { id: patientId },
                    nutritionist: { id: callerId },
                    status: RelationshipStatus.ACTIVE,
                },
            });
            if (!activeRelation) {
                throw new AppError('No tienes una relación activa con este paciente.', 403);
            }
        } else if (callerRole !== RoleName.ADMIN) {
            throw new AppError('Rol no autorizado.', 403);
        }

        const count = await this.clinicalRecordRepository.count({
            where: { patient: { id: patientId } },
        });

        return count;
    }

    /**
     * 📄 UPLOAD DE LABORATORIO EN PDF
     */
    public async uploadLaboratoryDocument(
        recordId: string, 
        file: Express.Multer.File,
        uploaderId: string,
        uploaderRole: RoleName,
        labDate?: string,
        description?: string
    ) {
        try {
            // Verificar permisos
            const record = await this.getClinicalRecordById(recordId, uploaderId, uploaderRole);
            
            // Crear directorio si no existe
            const uploadsDir = path.join(process.cwd(), 'uploads', 'laboratory-documents');
            await fs.mkdir(uploadsDir, { recursive: true });
            
            // Generar nombre único para el archivo
            const fileExtension = path.extname(file.originalname);
            const uniqueFilename = `lab_${recordId}_${Date.now()}${fileExtension}`;
            const filePath = path.join(uploadsDir, uniqueFilename);
            
            // Guardar archivo
            await fs.writeFile(filePath, file.buffer);
            
            // Crear metadata del documento
            const documentMetadata = {
                id: require('crypto').randomUUID(),
                filename: uniqueFilename,
                original_name: file.originalname,
                file_path: filePath,
                file_url: `/uploads/laboratory-documents/${uniqueFilename}`,
                file_size: file.size,
                upload_date: new Date(),
                uploaded_by: (uploaderRole === RoleName.PATIENT ? 'patient' : 'nutritionist') as 'patient' | 'nutritionist',
                description: description || '',
                lab_date: labDate ? new Date(labDate) : undefined
            };
            
            // Actualizar expediente con el nuevo documento
            const currentDocs = record.laboratory_documents || [];
            currentDocs.push(documentMetadata);
            
            await this.clinicalRecordRepository.update(recordId, {
                laboratory_documents: currentDocs,
                document_metadata: {
                    ...record.document_metadata,
                    total_attachments: currentDocs.length
                }
            });
            
            return {
                status: 'success',
                message: 'Documento de laboratorio subido exitosamente',
                document: documentMetadata
            };
            
        } catch (error) {
            console.error('Error uploading laboratory document:', error);
            throw new AppError('Error al subir el documento de laboratorio', 500);
        }
    }

    /**
     * 📋 GENERACIÓN DE PDF DEL EXPEDIENTE COMPLETO
     */
    public async generateExpedientePDF(recordId: string, requesterId: string, requesterRole: RoleName) {
        try {
            // Obtener expediente completo
            const record = await this.getClinicalRecordById(recordId, requesterId, requesterRole);
            
            // Importar PDFKit dinámicamente
            const PDFDocument = require('pdfkit');
            const fs = require('fs').promises;
            const path = require('path');
            
            // Crear directorio para PDFs generados
            const pdfDir = path.join(process.cwd(), 'generated-pdfs');
            await fs.mkdir(pdfDir, { recursive: true });
            
            const pdfFilename = `expediente_${recordId}_${Date.now()}.pdf`;
            const pdfPath = path.join(pdfDir, pdfFilename);
            
            // Crear documento PDF con márgenes optimizados
            const doc = new PDFDocument({ 
                margin: 40,  // Reducido de 60 a 40 para más espacio útil
                size: 'A4',
                info: {
                    Title: `Expediente Clínico - ${record.patient.first_name} ${record.patient.last_name}`,
                    Author: `Dr./Dra. ${record.nutritionist.first_name} ${record.nutritionist.last_name}`,
                    Subject: 'Expediente Clínico Nutricional',
                    Creator: 'NutriWeb - Sistema de Gestión Nutricional'
                },
                bufferPages: true // CLAVE: Permite calcular número total de páginas correctamente
            });
            
            const stream = require('fs').createWriteStream(pdfPath);
            doc.pipe(stream);
            
            // HEADER PRINCIPAL Y CONTENIDO COMPACTO
            this.addPDFCompactHeader(doc, record);
            
            // 1. DATOS GENERALES DEL PACIENTE (directamente después del header)
            this.addPDFPatientInfo(doc, record);
            
            // 2. MOTIVO DE CONSULTA
            if (record.consultation_reason) {
                this.addPDFSection(doc, '2. MOTIVO DE CONSULTA', {
                    'Descripción': record.consultation_reason
                }, false);
            }
            
            // 3. PROBLEMAS ACTUALES
            if (record.current_problems) {
                this.addPDFCurrentProblems(doc, record.current_problems);
            }
            
            // 4. ENFERMEDADES DIAGNOSTICADAS
            if (record.diagnosed_diseases) {
                this.addPDFDiagnosedDiseases(doc, record.diagnosed_diseases);
            }
            
            // 5. ANTECEDENTES FAMILIARES - Siempre agregar para mantener numeración
            this.addPDFFamilyHistory(doc, record.family_medical_history || {});
            
            // 6. ESTILO DE VIDA
            this.addPDFLifestyle(doc, record);
            
            // 7. MEDICIONES ANTROPOMÉTRICAS
            if (record.anthropometric_measurements) {
                this.addPDFAnthropometricMeasurements(doc, record.anthropometric_measurements, record.anthropometric_evaluations);
            }
            
            // 8. HISTORIA DIETÉTICA
            if (record.dietary_history) {
                this.addPDFDietaryHistory(doc, record.dietary_history, record.food_group_consumption_frequency, record.water_consumption_liters);
            }
            
            // 9. PRESIÓN ARTERIAL
            if (record.blood_pressure) {
                this.addPDFBloodPressure(doc, record.blood_pressure);
            }
            
            // 10. DIAGNÓSTICO Y PLAN NUTRICIONAL
            this.addPDFNutritionalDiagnosisAndPlan(doc, record);
            
            // 11. EVOLUCIÓN Y SEGUIMIENTO
            if (record.evolution_and_follow_up_notes) {
                this.addPDFSection(doc, '11. EVOLUCIÓN Y SEGUIMIENTO', {
                    'Notas': record.evolution_and_follow_up_notes
                }, true);
            }
            
            // 12. DOCUMENTOS ADJUNTOS
            if (record.laboratory_documents && record.laboratory_documents.length > 0) {
                this.addPDFLaboratoryDocuments(doc, record.laboratory_documents);
            }
            
            // 🎨 FONDO GENERAL APLICADO EN TIEMPO REAL
            
            // FOOTER EN TODAS LAS PÁGINAS
            this.addPDFFooter(doc, record);
            
            doc.end();
            
            // Esperar a que el PDF se complete
            await new Promise((resolve) => {
                stream.on('finish', resolve);
            });
            
            // Actualizar metadata del expediente
            await this.clinicalRecordRepository.update(recordId, {
                document_metadata: {
                    ...record.document_metadata,
                    last_pdf_generated: new Date(),
                    pdf_version: (record.document_metadata?.pdf_version || 0) + 1
                }
            });
            
            return {
                status: 'success',
                message: 'PDF del expediente generado exitosamente',
                pdf_path: pdfPath,
                pdf_url: `/generated-pdfs/${pdfFilename}`,
                filename: pdfFilename
            };
            
        } catch (error) {
            console.error('Error generating PDF:', error);
            throw new AppError('Error al generar el PDF del expediente', 500);
        }
    }

    /**
     * 🗑️ ELIMINAR DOCUMENTO DE LABORATORIO
     */
    public async deleteLaboratoryDocument(recordId: string, documentId: string, deleterId: string, deleterRole: RoleName) {
        try {
            const record = await this.getClinicalRecordById(recordId, deleterId, deleterRole);
            
            if (!record.laboratory_documents) {
                throw new AppError('No hay documentos para eliminar', 404);
            }
            
            const documentIndex = record.laboratory_documents.findIndex(doc => doc.id === documentId);
            if (documentIndex === -1) {
                throw new AppError('Documento no encontrado', 404);
            }
            
            const documentToDelete = record.laboratory_documents[documentIndex];
            
            // Eliminar archivo físico
            try {
                await fs.unlink(documentToDelete.file_path);
            } catch (error) {
                console.warn('No se pudo eliminar el archivo físico:', error);
            }
            
            // Remover del array
            record.laboratory_documents.splice(documentIndex, 1);
            
            // Actualizar en base de datos
            await this.clinicalRecordRepository.update(recordId, {
                laboratory_documents: record.laboratory_documents,
                document_metadata: {
                    ...record.document_metadata,
                    total_attachments: record.laboratory_documents.length
                }
            });
            
            return {
                status: 'success',
                message: 'Documento eliminado exitosamente'
            };
            
        } catch (error) {
            console.error('Error deleting laboratory document:', error);
            throw new AppError('Error al eliminar el documento', 500);
        }
    }

    /**
     * 🔧 UTILIDAD SIMPLIFICADA: Agregar sección profesional al PDF
     * Sin cajas individuales - usa fondo general de página
     */
    private addPDFSection(doc: any, title: string, data: Record<string, string | number | null | undefined>, longText: boolean = false) {
        // Filtrar SOLO entradas realmente vacías
        const filteredData = Object.fromEntries(
            Object.entries(data).filter(([_, value]) => 
                value !== null && 
                value !== undefined && 
                String(value).trim() !== ''
            )
        );

        if (Object.keys(filteredData).length === 0) {
            return; // No renderizar la sección si está completamente vacía
        }

        // Control de salto de página simple
        if (doc.y + 60 > doc.page.height - 80) {
            doc.addPage();
            // 🎨 APLICAR FONDO A LA NUEVA PÁGINA (sin header)
            this.addPDFPageBackgroundToNewPage(doc);
        }
        
        const sectionStartY = doc.y;
        
        // SOLO línea lateral azul como decoración (sin fondo individual)
        doc.rect(40, sectionStartY - 5, 4, 25)
           .fillAndStroke('#1e40af', '#1e40af');
        
        // Título de la sección
        doc.fontSize(12).font('Helvetica-Bold')
           .fillColor('#1e40af')
           .text(`>> ${title}`, 55, sectionStartY + 8);
        
        doc.moveDown(1.0);
        
        // RENDERIZAR CONTENIDO
        Object.entries(filteredData).forEach(([key, value], index) => {
            const valueStr = String(value);
            
            // Control de salto de página
            const itemEstimatedHeight = longText && valueStr.length > 100 ? 50 : 30;
            
            if (doc.y + itemEstimatedHeight > doc.page.height - 80) {
                doc.addPage();
                // 🎨 APLICAR FONDO A LA NUEVA PÁGINA (sin header)
                this.addPDFPageBackgroundToNewPage(doc);
                doc.moveDown(0.5);
            }
            
            if (longText && valueStr.length > 100) {
                // Campo de texto largo
                doc.fontSize(10).font('Helvetica-Bold')
                   .fillColor('#374151')
                   .text(`• ${key}:`, 55, doc.y);
                
                doc.moveDown(0.5);
                
                doc.fontSize(9).font('Helvetica')
                   .fillColor('#4b5563')
                   .text(valueStr, 65, doc.y, { 
                       width: 460, 
                       align: 'justify',
                       lineGap: 2
                   });
                
                doc.moveDown(0.8);
            } else {
                // Campo normal
                const labelWidth = 155;
                
                doc.fontSize(10).font('Helvetica-Bold')
                   .fillColor('#374151')
                   .text(`• ${key}:`, 55, doc.y, { width: labelWidth });
                
                const valueX = 55 + labelWidth + 10;
                const currentY = doc.y;
                doc.fontSize(10).font('Helvetica')
                   .fillColor('#4b5563')
                   .text(valueStr, valueX, currentY, { width: 345 });
                
                doc.moveDown(0.8);
            }
            
            // Separador visual entre elementos
            if (index < Object.keys(filteredData).length - 1) {
                doc.moveTo(65, doc.y + 1)
                   .lineTo(525, doc.y + 1)
                   .strokeColor('#e5e7eb')
                   .lineWidth(0.3)
                   .stroke();
                doc.moveDown(0.4);
            }
        });
        
        doc.moveDown(1.0);
    }

    /**
     * 🔧 HELPER: Añadir header profesional del PDF
     */
    private addPDFCompactHeader(doc: any, record: any) {
        // 🎨 APLICAR FONDO GENERAL DE LA PRIMERA PÁGINA
        this.addPDFPageBackgroundToCurrentPage(doc);
        
        // Fondo degradado para el header
        doc.rect(40, 40, 515, 80)
           .fillAndStroke('#1e3a8a', '#1e40af');
        
        // Logo/Icono simulado (círculo con cruz médica)
        doc.circle(70, 70, 12)
           .fillAndStroke('#ffffff', '#ffffff');
        doc.moveTo(65, 70).lineTo(75, 70).strokeColor('#1e3a8a').lineWidth(2).stroke();
        doc.moveTo(70, 65).lineTo(70, 75).strokeColor('#1e3a8a').lineWidth(2).stroke();
        
        // Título principal
        doc.fontSize(18).font('Helvetica-Bold')
           .fillColor('#ffffff')
           .text('NUTRIWEB', 95, 55);
        
        doc.fontSize(12).font('Helvetica')
           .fillColor('#e0e7ff')
           .text('Sistema de Gestión Nutricional', 95, 75);
        
        // Título del documento
        doc.fontSize(14).font('Helvetica-Bold')
           .fillColor('#ffffff')
           .text('EXPEDIENTE CLÍNICO NUTRICIONAL', 95, 95);
        
        // Información del expediente en caja con fondo
        const infoY = 140;
        doc.rect(40, infoY, 515, 60)
           .fillAndStroke('#f8fafc', '#e2e8f0');
        
        // Información en dos columnas con etiquetas
        doc.fontSize(11).font('Helvetica-Bold').fillColor('#1e40af');
        
        // Columna izquierda
        doc.text('» PACIENTE', 50, infoY + 10);
        doc.fontSize(10).font('Helvetica').fillColor('#374151')
           .text(`${record.patient.first_name} ${record.patient.last_name}`, 50, infoY + 25);
        
        doc.fontSize(11).font('Helvetica-Bold').fillColor('#1e40af')
           .text('» NUTRIOLOGO', 50, infoY + 40);
        doc.fontSize(10).font('Helvetica').fillColor('#374151')
           .text(`Dr./Dra. ${record.nutritionist.first_name} ${record.nutritionist.last_name}`, 50, infoY + 55);
        
        // Columna derecha
        doc.fontSize(11).font('Helvetica-Bold').fillColor('#1e40af')
           .text('» FECHA', 350, infoY + 10);
        doc.fontSize(10).font('Helvetica').fillColor('#374151')
           .text(new Date(record.record_date).toLocaleDateString('es-ES'), 350, infoY + 25);
        
        doc.fontSize(11).font('Helvetica-Bold').fillColor('#1e40af')
           .text('» NO. EXPEDIENTE', 350, infoY + 40);
        doc.fontSize(10).font('Helvetica').fillColor('#374151')
           .text(record.expedient_number || 'N/A', 350, infoY + 55);
        
        doc.y = infoY + 80;
        doc.moveDown(0.5);
    }



    /**
     * 🔧 HELPER: Añadir información del paciente
     */
    private addPDFPatientInfo(doc: any, record: any) {
        const patientData: Record<string, string> = {
            'Nombre Completo': `${record.patient.first_name} ${record.patient.last_name}`,
            'Email': record.patient.email,
            'Edad': record.patient.age ? `${record.patient.age} años` : 'N/A',
            'Género': record.patient.gender || 'N/A',
            'Teléfono': record.patient.phone || 'N/A'
        };
        
        this.addPDFSection(doc, '1. DATOS GENERALES DEL PACIENTE', patientData, false);
    }

    /**
     * 🔧 HELPER: Añadir problemas actuales
     */
    private addPDFCurrentProblems(doc: any, currentProblems: any) {
        const problems = [];
        if (currentProblems.diarrhea) problems.push('Diarrea');
        if (currentProblems.constipation) problems.push('Estreñimiento');
        if (currentProblems.gastritis) problems.push('Gastritis');
        if (currentProblems.nausea) problems.push('Náuseas');
        if (currentProblems.vomiting) problems.push('Vómito');
        if (currentProblems.abdominal_pain) problems.push('Dolor Abdominal');
        if (currentProblems.mouth_mechanics) problems.push(`Mecánicos de la Boca: ${currentProblems.mouth_mechanics}`);
        if (currentProblems.other_problems) problems.push(`Otros: ${currentProblems.other_problems}`);
        
        const problemsData: Record<string, string> = {
            'Síntomas Reportados': problems.length > 0 ? problems.join(', ') : 'Ninguno reportado',
            'Observaciones Adicionales': currentProblems.observations || 'N/A'
        };
        
        this.addPDFSection(doc, '3. PROBLEMAS ACTUALES', problemsData, false);
    }

    /**
     * 🔧 HELPER: Añadir enfermedades diagnosticadas
     */
    private addPDFDiagnosedDiseases(doc: any, diagnosedDiseases: any) {
        const diseasesData: Record<string, string> = {};
        
        // Verificar si tiene enfermedad general
        if (diagnosedDiseases.has_disease && diagnosedDiseases.disease_name) {
            diseasesData['Enfermedades Diagnosticadas'] = diagnosedDiseases.disease_name;
            if (diagnosedDiseases.since_when) {
                diseasesData['Desde Cuándo'] = diagnosedDiseases.since_when;
            }
        } else {
            diseasesData['Enfermedades Diagnosticadas'] = 'Ninguna';
        }
        
        // Medicamentos
        diseasesData['Toma Medicamentos'] = diagnosedDiseases.takes_medication ? 'Sí' : 'No';
        if (diagnosedDiseases.takes_medication && diagnosedDiseases.medications_list && diagnosedDiseases.medications_list.length > 0) {
            diseasesData['Lista de Medicamentos'] = diagnosedDiseases.medications_list.join(', ');
        }
        
        // Enfermedad importante adicional
        if (diagnosedDiseases.has_important_disease && diagnosedDiseases.important_disease_name) {
            diseasesData['Enfermedad Importante'] = diagnosedDiseases.important_disease_name;
        }
        
        // Tratamiento especial
        if (diagnosedDiseases.takes_special_treatment && diagnosedDiseases.special_treatment_details) {
            diseasesData['Tratamiento Especial'] = diagnosedDiseases.special_treatment_details;
        }
        
        // Cirugías
        if (diagnosedDiseases.has_surgery && diagnosedDiseases.surgery_details) {
            diseasesData['Detalles de Cirugías'] = diagnosedDiseases.surgery_details;
        }
        
        this.addPDFSection(doc, '4. ENFERMEDADES DIAGNOSTICADAS', diseasesData, false);
    }

    /**
     * 🔧 HELPER: Añadir antecedentes familiares (FORMATO CONSISTENTE)
     */
    private addPDFFamilyHistory(doc: any, familyHistory: any) {
        const conditions = [];
        if (familyHistory && familyHistory.obesity) conditions.push('Obesidad');
        if (familyHistory && familyHistory.diabetes) conditions.push('Diabetes');
        if (familyHistory && familyHistory.hta) conditions.push('Hipertensión Arterial');
        if (familyHistory && familyHistory.cancer) conditions.push('Cáncer');
        if (familyHistory && familyHistory.hypo_hyperthyroidism) conditions.push('Hipo/Hipertiroidismo');
        if (familyHistory && familyHistory.dyslipidemia) conditions.push('Dislipidemia');
        
        const familyData: Record<string, string> = {
            'Condiciones Familiares': conditions.length > 0 ? conditions.join(', ') : 'Ninguna reportada'
        };
        
        // Agregar otros antecedentes si existen
        if (familyHistory && familyHistory.other_history && familyHistory.other_history.trim() && familyHistory.other_history.trim() !== 'N/A') {
            familyData['Otros Antecedentes'] = familyHistory.other_history;
        }
        
        this.addPDFSection(doc, '5. ANTECEDENTES FAMILIARES', familyData, false);
    }

    /**
     * 🔧 HELPER: Añadir estilo de vida
     */
    private addPDFLifestyle(doc: any, record: any) {
        const lifestyleData: Record<string, string> = {};
        
        if (record.activity_level_description && record.activity_level_description.trim()) {
            lifestyleData['Nivel de Actividad'] = record.activity_level_description;
        }
        
        if (record.physical_exercise) {
            if (record.physical_exercise.performs_exercise) {
                lifestyleData['Realiza Ejercicio'] = 'Sí';
                if (record.physical_exercise.type && record.physical_exercise.type.trim()) {
                    lifestyleData['Tipo de Ejercicio'] = record.physical_exercise.type;
                }
                if (record.physical_exercise.frequency && record.physical_exercise.frequency.trim()) {
                    lifestyleData['Frecuencia'] = record.physical_exercise.frequency;
                }
                if (record.physical_exercise.duration && record.physical_exercise.duration.trim()) {
                    lifestyleData['Duración'] = record.physical_exercise.duration;
                }
                if (record.physical_exercise.since_when && record.physical_exercise.since_when.trim()) {
                    lifestyleData['Desde Cuándo'] = record.physical_exercise.since_when;
                }
            }
        }
        
        if (record.consumption_habits) {
            const habits = [];
            if (record.consumption_habits.alcohol && record.consumption_habits.alcohol.trim()) {
                habits.push(`Alcohol: ${record.consumption_habits.alcohol}`);
            }
            if (record.consumption_habits.tobacco && record.consumption_habits.tobacco.trim()) {
                habits.push(`Tabaco: ${record.consumption_habits.tobacco}`);
            }
            if (record.consumption_habits.coffee && record.consumption_habits.coffee.trim()) {
                habits.push(`Café: ${record.consumption_habits.coffee}`);
            }
            if (record.consumption_habits.other_substances && record.consumption_habits.other_substances.trim()) {
                habits.push(`Otras sustancias: ${record.consumption_habits.other_substances}`);
            }
            
            if (habits.length > 0) {
                lifestyleData['Hábitos de Consumo'] = habits.join(', ');
            }
        }
        
        if (record.water_consumption_liters && record.water_consumption_liters > 0) {
            lifestyleData['Consumo de Agua'] = `${record.water_consumption_liters} litros/día`;
        }
        
        // Solo agregar si hay contenido real
        if (Object.keys(lifestyleData).length > 0) {
            this.addPDFSection(doc, '6. ESTILO DE VIDA', lifestyleData, false);
        }
    }

    /**
     * 🔧 HELPER: Añadir mediciones antropométricas
     */
    private addPDFAnthropometricMeasurements(doc: any, measurements: any, evaluations: any) {
        const measurementsData: Record<string, string> = {};
        
        // Mediciones básicas
        if (measurements.current_weight_kg && measurements.current_weight_kg > 0) {
            measurementsData['Peso Actual'] = `${measurements.current_weight_kg} kg`;
        }
        if (measurements.height_m && measurements.height_m > 0) {
            measurementsData['Altura'] = `${measurements.height_m} m`;
        }
        if (measurements.habitual_weight_kg && measurements.habitual_weight_kg > 0) {
            measurementsData['Peso Habitual'] = `${measurements.habitual_weight_kg} kg`;
        }
        
        // Circunferencias
        if (measurements.arm_circ_cm && measurements.arm_circ_cm > 0) {
            measurementsData['Circunferencia Brazo'] = `${measurements.arm_circ_cm} cm`;
        }
        if (measurements.waist_circ_cm && measurements.waist_circ_cm > 0) {
            measurementsData['Circunferencia Cintura'] = `${measurements.waist_circ_cm} cm`;
        }
        if (measurements.abdominal_circ_cm && measurements.abdominal_circ_cm > 0) {
            measurementsData['Circunferencia Abdominal'] = `${measurements.abdominal_circ_cm} cm`;
        }
        if (measurements.hip_circ_cm && measurements.hip_circ_cm > 0) {
            measurementsData['Circunferencia Cadera'] = `${measurements.hip_circ_cm} cm`;
        }
        if (measurements.calf_circ_cm && measurements.calf_circ_cm > 0) {
            measurementsData['Circunferencia Pantorrilla'] = `${measurements.calf_circ_cm} cm`;
        }
        
        // Pliegues cutáneos
        if (measurements.triceps_skinfold_mm && measurements.triceps_skinfold_mm > 0) {
            measurementsData['Pliegue Tricipital'] = `${measurements.triceps_skinfold_mm} mm`;
        }
        if (measurements.bicipital_skinfold_mm && measurements.bicipital_skinfold_mm > 0) {
            measurementsData['Pliegue Bicipital'] = `${measurements.bicipital_skinfold_mm} mm`;
        }
        if (measurements.subscapular_skinfold_mm && measurements.subscapular_skinfold_mm > 0) {
            measurementsData['Pliegue Subescapular'] = `${measurements.subscapular_skinfold_mm} mm`;
        }
        if (measurements.suprailiac_skinfold_mm && measurements.suprailiac_skinfold_mm > 0) {
            measurementsData['Pliegue Suprailíaco'] = `${measurements.suprailiac_skinfold_mm} mm`;
        }
        
        // Evaluaciones antropométricas
        if (evaluations) {
            if (evaluations.complexion) {
                measurementsData['Complexión'] = evaluations.complexion;
            }
            if (evaluations.ideal_weight_kg && evaluations.ideal_weight_kg > 0) {
                measurementsData['Peso Ideal'] = `${evaluations.ideal_weight_kg} kg`;
            }
            if (evaluations.imc_kg_t2 && evaluations.imc_kg_t2 > 0) {
                measurementsData['IMC'] = `${evaluations.imc_kg_t2} kg/m²`;
            }
            if (evaluations.weight_variation_percent) {
                measurementsData['Variación de Peso Ideal'] = `${evaluations.weight_variation_percent}%`;
            }
            if (evaluations.waist_hip_ratio_cm && evaluations.waist_hip_ratio_cm > 0) {
                measurementsData['Índice Cintura-Cadera'] = `${evaluations.waist_hip_ratio_cm}`;
            }
            if (evaluations.body_fat_percentage && evaluations.body_fat_percentage > 0) {
                measurementsData['Porcentaje Grasa Corporal'] = `${evaluations.body_fat_percentage}%`;
            }
            if (evaluations.total_body_fat_kg && evaluations.total_body_fat_kg > 0) {
                measurementsData['Grasa Corporal Total'] = `${evaluations.total_body_fat_kg} kg`;
            }
            if (evaluations.fat_free_mass_kg && evaluations.fat_free_mass_kg > 0) {
                measurementsData['Masa Libre de Grasa'] = `${evaluations.fat_free_mass_kg} kg`;
            }
            if (evaluations.total_body_water_liters && evaluations.total_body_water_liters > 0) {
                measurementsData['Agua Corporal Total'] = `${evaluations.total_body_water_liters} litros`;
            }
        }
        
        // Solo agregar si hay mediciones reales
        if (Object.keys(measurementsData).length > 0) {
            this.addPDFSection(doc, '7. MEDICIONES ANTROPOMÉTRICAS', measurementsData, false);
        }
    }

    /**
     * 🔧 HELPER: Añadir historia dietética
     */
    private addPDFDietaryHistory(doc: any, dietaryHistory: any, foodFrequency: any, waterConsumption: any) {
        const historyData: Record<string, string> = {};
        
        // Mapear correctamente los campos de la entidad
        if (dietaryHistory.received_nutritional_guidance !== undefined) {
            historyData['Ha Recibido Orientación Nutricional'] = dietaryHistory.received_nutritional_guidance ? 'Sí' : 'No';
            if (dietaryHistory.when_received) {
                historyData['Cuándo la Recibió'] = dietaryHistory.when_received;
            }
        }
        
        if (dietaryHistory.adherence_level) {
            historyData['Nivel de Adherencia'] = dietaryHistory.adherence_level;
        }
        if (dietaryHistory.adherence_reason) {
            historyData['Razón de Adherencia'] = dietaryHistory.adherence_reason;
        }
        if (dietaryHistory.food_preparer) {
            historyData['Quién Prepara los Alimentos'] = dietaryHistory.food_preparer;
        }
        if (dietaryHistory.eats_at_home_or_out) {
            historyData['Come en Casa o Fuera'] = dietaryHistory.eats_at_home_or_out;
        }
        
        if (dietaryHistory.modified_alimentation_last_6_months !== undefined) {
            historyData['Modificó Alimentación (Últimos 6 meses)'] = dietaryHistory.modified_alimentation_last_6_months ? 'Sí' : 'No';
            if (dietaryHistory.modification_reason) {
                historyData['Razón de Modificación'] = dietaryHistory.modification_reason;
            }
        }
        
        if (dietaryHistory.most_hungry_time) {
            historyData['Hora de Mayor Hambre'] = dietaryHistory.most_hungry_time;
        }
        
        if (dietaryHistory.preferred_foods && dietaryHistory.preferred_foods.length > 0) {
            historyData['Alimentos Preferidos'] = dietaryHistory.preferred_foods.join(', ');
        }
        
        if (dietaryHistory.disliked_foods && dietaryHistory.disliked_foods.length > 0) {
            historyData['Alimentos que No Le Gustan'] = dietaryHistory.disliked_foods.join(', ');
        }
        
        if (dietaryHistory.malestar_alergia_foods && dietaryHistory.malestar_alergia_foods.length > 0) {
            historyData['Alimentos que Causan Malestar/Alergia'] = dietaryHistory.malestar_alergia_foods.join(', ');
        }
        
        if (dietaryHistory.takes_supplements !== undefined) {
            historyData['Toma Suplementos'] = dietaryHistory.takes_supplements ? 'Sí' : 'No';
            if (dietaryHistory.supplement_details) {
                historyData['Detalles de Suplementos'] = dietaryHistory.supplement_details;
            }
        }
        
        if (waterConsumption && waterConsumption > 0) {
            historyData['Consumo de Agua'] = `${waterConsumption} litros/día`;
        }
        
        // Solo agregar sección si hay datos reales
        if (Object.keys(historyData).length > 0) {
            this.addPDFSection(doc, '8. HISTORIA DIETÉTICA', historyData, false);
        }
        
        // Frecuencia de consumo de grupos de alimentos
        if (foodFrequency && Object.keys(foodFrequency).length > 0) {
            const frequencyData: Record<string, string> = {};
            Object.entries(foodFrequency).forEach(([group, freq]: [string, any]) => {
                if (freq && freq !== 0) {
                    const groupName = group.charAt(0).toUpperCase() + group.slice(1).replace('_', ' ');
                    frequencyData[groupName] = `${freq} veces/semana`;
                }
            });
            
            if (Object.keys(frequencyData).length > 0) {
                this.addPDFSection(doc, '8.1 FRECUENCIA DE CONSUMO POR GRUPOS DE ALIMENTOS', frequencyData, false);
            }
        }
    }

    /**
     * 🔧 HELPER: Añadir presión arterial
     */
    private addPDFBloodPressure(doc: any, bloodPressure: any) {
        const bpData: Record<string, string> = {};
        
        if (bloodPressure.systolic && bloodPressure.diastolic) {
            bpData['Presión Arterial'] = `${bloodPressure.systolic}/${bloodPressure.diastolic} mmHg`;
        }
        if (bloodPressure.measurement_date) {
            bpData['Fecha de Medición'] = new Date(bloodPressure.measurement_date).toLocaleDateString('es-ES');
        }
        if (bloodPressure.notes) {
            bpData['Observaciones'] = bloodPressure.notes;
        }
        
        this.addPDFSection(doc, '9. PRESIÓN ARTERIAL', bpData, false);
    }

    /**
     * 🔧 HELPER: Añadir diagnóstico y plan nutricional
     */
    private addPDFNutritionalDiagnosisAndPlan(doc: any, record: any) {
        const diagnosisData: Record<string, string> = {};
        
        if (record.nutritional_diagnosis && record.nutritional_diagnosis.trim()) {
            diagnosisData['Diagnóstico Nutricional'] = record.nutritional_diagnosis;
        }
        if (record.nutritional_plan_and_management && record.nutritional_plan_and_management.trim()) {
            diagnosisData['Plan y Manejo Nutricional'] = record.nutritional_plan_and_management;
        }
        if (record.goals_and_objectives && record.goals_and_objectives.trim()) {
            diagnosisData['Objetivos y Metas'] = record.goals_and_objectives;
        }
        if (record.recommendations && record.recommendations.trim()) {
            diagnosisData['Recomendaciones'] = record.recommendations;
        }
        
        // Solo agregar si hay contenido real
        if (Object.keys(diagnosisData).length > 0) {
            this.addPDFSection(doc, '10. DIAGNÓSTICO Y PLAN NUTRICIONAL', diagnosisData, true);
        }
    }

    /**
     * 🔧 HELPER: Añadir documentos de laboratorio usando formato consistente
     */
    private addPDFLaboratoryDocuments(doc: any, documents: any[]) {
        // Solo agregar si hay documentos reales
        if (!documents || documents.length === 0) {
            return;
        }
        
        // Preparar datos de documentos para formato común
        const documentsData: Record<string, string> = {};
        
        documents.forEach((document, index) => {
            const docNumber = `Documento ${index + 1}`;
            const docInfo = [
                `» ${document.original_name}`,
                `» Fecha: ${new Date(document.upload_date).toLocaleDateString('es-ES')}`,
                `» Subido por: ${document.uploaded_by === 'patient' ? 'Paciente' : 'Nutriólogo'}`,
                `» Tamaño: ${(document.file_size / 1024 / 1024).toFixed(2)} MB`,
                document.description ? `» Descripción: ${document.description}` : '» Sin descripción'
            ].join(' | ');
            
            documentsData[docNumber] = docInfo;
        });
        
        // Usar el método común para formato consistente
        this.addPDFSection(doc, '12. DOCUMENTOS DE LABORATORIO ADJUNTOS', documentsData, true);
    }

    /**
     * 🎨 FUNCIÓN: Agregar fondo a la primera página (con header)
     * Cubre el área de contenido respetando header y footer
     */
    private addPDFPageBackgroundToCurrentPage(doc: any) {
        const pageWidth = doc.page.width;   // ~595pt para A4
        const pageHeight = doc.page.height; // ~842pt para A4
        const margin = 40;
        
        // Área de contenido: evita el header (primeros 200pt) y footer (últimos 80pt)
        const contentX = margin;
        const contentY = 210; // Después del header + info del expediente
        const contentWidth = pageWidth - (margin * 2);  // 515pt
        const contentHeight = pageHeight - contentY - 90; // Hasta antes del footer
        
        // Dibujar el fondo principal con bordes suaves - solo área de contenido
        doc.rect(contentX, contentY, contentWidth, contentHeight)
           .fillAndStroke('#f8fafc', '#e2e8f0');
           
        // Línea decorativa izquierda para toda la altura de contenido
        doc.rect(contentX, contentY, 4, contentHeight)
           .fillAndStroke('#1e40af', '#1e40af');
    }

    /**
     * 🎨 FUNCIÓN: Agregar fondo a páginas adicionales (sin header)
     * Cubre toda el área de contenido respetando solo márgenes y footer
     */
    private addPDFPageBackgroundToNewPage(doc: any) {
        const pageWidth = doc.page.width;   // ~595pt para A4
        const pageHeight = doc.page.height; // ~842pt para A4
        const margin = 40;
        
        // Área de contenido completa: desde margen superior hasta antes del footer
        const contentX = margin;
        const contentY = margin; // Desde el margen superior
        const contentWidth = pageWidth - (margin * 2);  // 515pt
        const contentHeight = pageHeight - margin - 90; // Hasta antes del footer
        
        // Dibujar el fondo principal con bordes suaves
        doc.rect(contentX, contentY, contentWidth, contentHeight)
           .fillAndStroke('#f8fafc', '#e2e8f0');
           
        // Línea decorativa izquierda para toda la altura
        doc.rect(contentX, contentY, 4, contentHeight)
           .fillAndStroke('#1e40af', '#1e40af');
    }

    /**
     * 🔧 HELPER: Añadir footer profesional a todas las páginas (CORREGIDO)
     */
    private addPDFFooter(doc: any, record: any) {
        const range = doc.bufferedPageRange();
        
        for (let i = range.start; i < range.start + range.count; i++) {
            doc.switchToPage(i);
            
            // Fondo específico del footer (sobre el fondo general)
            doc.rect(40, doc.page.height - 80, 515, 40)
               .fillAndStroke('#f1f5f9', '#e2e8f0');
            
            // Línea superior decorativa del footer
            doc.rect(40, doc.page.height - 80, 515, 3)
               .fillAndStroke('#1e40af', '#1e40af');
            
            // Información del footer
            doc.fontSize(8).font('Helvetica').fillColor('#475569');
            
            // Izquierda: Fecha y hora de generación
            doc.text(`Generado: ${new Date().toLocaleDateString('es-ES')} ${new Date().toLocaleTimeString('es-ES')}`, 
                     50, doc.page.height - 65, { width: 180 });
            
            // Centro: Sistema y expediente
            doc.text(`NutriWeb - Exp: ${record.expedient_number || 'N/A'}`, 
                     230, doc.page.height - 65, { align: 'center', width: 140 });
            
            // Derecha: Número de página (CORREGIDO)
            const currentPageNumber = (i - range.start) + 1;
            const totalPages = range.count;
            doc.text(`Página ${currentPageNumber} de ${totalPages}`, 
                     370, doc.page.height - 65, { align: 'right', width: 175 });
            
            // Línea inferior sutil
            doc.moveTo(50, doc.page.height - 50)
               .lineTo(545, doc.page.height - 50)
               .strokeColor('#cbd5e1')
               .lineWidth(0.5)
               .stroke();
        }
    }

    // === 💊 MÉTODOS PARA INTERACCIONES FÁRMACO-NUTRIENTE ===

    /**
     * 🔬 AGREGAR INTERACCIÓN FÁRMACO-NUTRIENTE
     */
    public async addDrugNutrientInteraction(
        recordId: string, 
        interactionData: {
            medicationId: string;
            nutrientsAffected: string[];
            interactionType: 'absorption' | 'metabolism' | 'excretion' | 'antagonism';
            severity: 'low' | 'moderate' | 'high' | 'critical';
            description: string;
            recommendations: string[];
            timingConsiderations?: string;
            foodsToAvoid?: string[];
            foodsToIncrease?: string[];
            monitoringRequired?: boolean;
        },
        userId: string,
        userRole: RoleName
    ) {
        // Verificar acceso al registro
        const record = await this.getClinicalRecordById(recordId, userId, userRole);
        
        // Validar que el medicamento existe en la lista de medicamentos del expediente
        const medications = record.diagnosed_diseases?.medications_list || [];
        const medicationIndex = parseInt(interactionData.medicationId.replace('med_', ''));
        
        if (isNaN(medicationIndex) || medicationIndex < 0 || medicationIndex >= medications.length) {
            throw new AppError('El medicamento seleccionado no existe en la lista de medicamentos del paciente', 400);
        }

        // Crear la nueva interacción
        const newInteraction = {
            id: require('crypto').randomUUID(),
            medication: {
                id: interactionData.medicationId,
                name: medications[medicationIndex],
                generic_name: undefined,
                dosage: undefined,
                frequency: undefined
            },
            nutrients_affected: interactionData.nutrientsAffected,
            interaction_type: interactionData.interactionType,
            severity: interactionData.severity,
            description: interactionData.description,
            recommendations: interactionData.recommendations,
            timing_considerations: interactionData.timingConsiderations,
            foods_to_avoid: interactionData.foodsToAvoid || [],
            foods_to_increase: interactionData.foodsToIncrease || [],
            monitoring_required: interactionData.monitoringRequired || false,
            created_date: new Date(),
            updated_date: new Date()
        };

        // Agregar a la lista de interacciones
        if (!record.drug_nutrient_interactions) {
            record.drug_nutrient_interactions = [];
        }
        record.drug_nutrient_interactions.push(newInteraction);

        // Guardar cambios
        await this.clinicalRecordRepository.save(record);

        return {
            message: 'Interacción fármaco-nutriente agregada exitosamente',
            interaction: newInteraction
        };
    }

    /**
     * ✏️ ACTUALIZAR INTERACCIÓN FÁRMACO-NUTRIENTE
     */
    public async updateDrugNutrientInteraction(
        recordId: string,
        interactionId: string,
        updateData: Partial<{
            nutrientsAffected: string[];
            interactionType: 'absorption' | 'metabolism' | 'excretion' | 'antagonism';
            severity: 'low' | 'moderate' | 'high' | 'critical';
            description: string;
            recommendations: string[];
            timingConsiderations?: string;
            foodsToAvoid?: string[];
            foodsToIncrease?: string[];
            monitoringRequired?: boolean;
        }>,
        userId: string,
        userRole: RoleName
    ) {
        // Verificar acceso al registro
        const record = await this.getClinicalRecordById(recordId, userId, userRole);
        
        if (!record.drug_nutrient_interactions || record.drug_nutrient_interactions.length === 0) {
            throw new AppError('No hay interacciones en este registro', 404);
        }

        const interactionIndex = record.drug_nutrient_interactions.findIndex(interaction => interaction.id === interactionId);
        if (interactionIndex === -1) {
            throw new AppError('Interacción no encontrada', 404);
        }

        // Actualizar la interacción
        const updatedInteraction = {
            ...record.drug_nutrient_interactions[interactionIndex],
            ...updateData,
            updated_date: new Date()
        };
        
        record.drug_nutrient_interactions[interactionIndex] = updatedInteraction;

        // Guardar cambios
        await this.clinicalRecordRepository.save(record);

        return {
            message: 'Interacción actualizada exitosamente',
            interaction: updatedInteraction
        };
    }

    /**
     * 🗑️ ELIMINAR INTERACCIÓN FÁRMACO-NUTRIENTE
     */
    public async deleteDrugNutrientInteraction(recordId: string, interactionId: string, userId: string, userRole: RoleName) {
        // Verificar acceso al registro
        const record = await this.getClinicalRecordById(recordId, userId, userRole);
        
        if (!record.drug_nutrient_interactions || record.drug_nutrient_interactions.length === 0) {
            throw new AppError('No hay interacciones en este registro', 404);
        }

        const interactionIndex = record.drug_nutrient_interactions.findIndex(interaction => interaction.id === interactionId);
        if (interactionIndex === -1) {
            throw new AppError('Interacción no encontrada', 404);
        }

        // Remover la interacción
        record.drug_nutrient_interactions.splice(interactionIndex, 1);

        // Guardar cambios
        await this.clinicalRecordRepository.save(record);

        return {
            message: 'Interacción eliminada exitosamente',
            interaction_id: interactionId
        };
    }

    /**
     * 📋 OBTENER INTERACCIONES FÁRMACO-NUTRIENTE
     */
    public async getDrugNutrientInteractions(recordId: string, userId: string, userRole: RoleName) {
        // Verificar acceso al registro
        const record = await this.getClinicalRecordById(recordId, userId, userRole);
        
        return {
            interactions: record.drug_nutrient_interactions || [],
            total: record.drug_nutrient_interactions?.length || 0
        };
    }
}

export default new ClinicalRecordService();