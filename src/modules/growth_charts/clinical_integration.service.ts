import { Repository } from 'typeorm';
import { AppDataSource } from '../../database/data-source';
import { ClinicalRecord } from '../../database/entities/clinical_record.entity';
import { PatientProfile } from '../../database/entities/patient_profile.entity';
import { PatientProgressLog } from '../../database/entities/patient_progress_log.entity';
import { User } from '../../database/entities/user.entity';
import growthChartsService from './growth_charts.service';
import growthAlertsService from './growth_alerts.service';
import { GrowthMetricType, Gender } from '../../database/entities/growth_reference.entity';
import { AppError } from '../../utils/app.error';

interface GrowthIntegrationData {
    currentGrowthAssessment: any;
    growthHistory: any[];
    activeAlerts: any[];
    growthChartInterpretation: string;
    nutritionalRecommendations: string[];
    followUpSchedule: string;
}

class ClinicalIntegrationService {
    private clinicalRecordRepository: Repository<ClinicalRecord>;
    private patientProfileRepository: Repository<PatientProfile>;
    private progressLogRepository: Repository<PatientProgressLog>;
    private userRepository: Repository<User>;

    constructor() {
        this.clinicalRecordRepository = AppDataSource.getRepository(ClinicalRecord);
        this.patientProfileRepository = AppDataSource.getRepository(PatientProfile);
        this.progressLogRepository = AppDataSource.getRepository(PatientProgressLog);
        this.userRepository = AppDataSource.getRepository(User);
    }

    /**
     * Integra datos de crecimiento en un expediente clínico existente
     */
    async integrateGrowthDataToRecord(
        clinicalRecordId: string,
        includeAlerts = true,
        includeHistory = true
    ): Promise<ClinicalRecord> {
        try {
            // Obtener expediente clínico
            const clinicalRecord = await this.clinicalRecordRepository.findOne({
                where: { id: clinicalRecordId },
                relations: ['patient', 'nutritionist']
            });

            if (!clinicalRecord) {
                throw new AppError('Expediente clínico no encontrado', 404);
            }

            // Verificar si es paciente pediátrico
            const patientProfile = await this.patientProfileRepository.findOne({
                where: { user: { id: clinicalRecord.patient.id } }
            });

            if (!patientProfile?.is_pediatric_patient) {
                throw new AppError('La integración de crecimiento solo aplica a pacientes pediátricos', 400);
            }

            // Recopilar datos de crecimiento
            const growthData = await this.gatherGrowthDataForRecord(
                clinicalRecord.patient.id,
                includeAlerts,
                includeHistory
            );

            // Integrar datos en el expediente
            await this.updateClinicalRecordWithGrowthData(clinicalRecord, growthData);

            return clinicalRecord;

        } catch (error: any) {
            console.error('Error integrando datos de crecimiento:', error);
            throw error instanceof AppError ? error : new AppError('Error al integrar datos de crecimiento', 500);
        }
    }

    /**
     * Crea un expediente clínico automático basado en una nueva medición de crecimiento
     */
    async createGrowthBasedClinicalRecord(
        patientId: string,
        nutritionistId: string,
        measurementData: {
            date: Date;
            ageMonths: number;
            weight?: number;
            height?: number;
            headCircumference?: number;
        }
    ): Promise<ClinicalRecord> {
        try {
            // Verificar que el paciente existe y es pediátrico
            const patient = await this.userRepository.findOne({
                where: { id: patientId }
            });

            if (!patient) {
                throw new AppError('Paciente no encontrado', 404);
            }

            const patientProfile = await this.patientProfileRepository.findOne({
                where: { user: { id: patientId } }
            });

            if (!patientProfile?.is_pediatric_patient) {
                throw new AppError('Solo se pueden crear expedientes automáticos para pacientes pediátricos', 400);
            }

            // Calcular métricas de crecimiento
            const growthMetrics = await this.calculateGrowthMetrics(
                measurementData,
                patient.gender as Gender
            );

            // Evaluar alertas
            const alerts = await growthAlertsService.evaluateGrowthMeasurement({
                patientId,
                date: measurementData.date,
                ageMonths: measurementData.ageMonths,
                weight: measurementData.weight,
                height: measurementData.height,
                headCircumference: measurementData.headCircumference,
                gender: patient.gender as Gender
            });

            // Generar interpretación y recomendaciones
            const interpretation = this.generateGrowthInterpretation(growthMetrics, alerts);
            const recommendations = this.generateNutritionalRecommendations(growthMetrics, alerts);

            // Crear expediente clínico usando los campos disponibles en la entidad
            const clinicalRecordData = {
                patient: patient,
                nutritionist: { id: nutritionistId } as User,
                record_date: measurementData.date,
                consultation_reason: 'Evaluación de crecimiento pediátrico',
                
                // Datos antropométricos usando campos disponibles
                anthropometric_measurements: {
                    current_weight_kg: measurementData.weight,
                    height_m: measurementData.height ? measurementData.height / 100 : undefined
                },

                // Diagnóstico nutricional con información de crecimiento
                nutritional_diagnosis: `${interpretation.diagnosis}\n\nPercentiles:\n- Peso/Edad: ${growthMetrics.weightForAge?.percentile || 'N/A'}%\n- Talla/Edad: ${growthMetrics.heightForAge?.percentile || 'N/A'}%\n- IMC/Edad: ${growthMetrics.bmiForAge?.percentile || 'N/A'}%`,

                // Plan y manejo nutricional
                nutritional_plan_and_management: recommendations.plan,

                // Notas de evolución con datos completos de crecimiento
                evolution_and_follow_up_notes: `Evaluación automática de crecimiento realizada el ${measurementData.date.toLocaleDateString('es-ES')}.\n\n${interpretation.notes}\n\nAlertas: ${alerts.length > 0 ? alerts.map(a => `${a.title}: ${a.description}`).join('; ') : 'Ninguna'}`
            };

            const clinicalRecord = this.clinicalRecordRepository.create(clinicalRecordData);
            return await this.clinicalRecordRepository.save(clinicalRecord);

        } catch (error: any) {
            console.error('Error creando expediente basado en crecimiento:', error);
            throw error instanceof AppError ? error : new AppError('Error al crear expediente de crecimiento', 500);
        }
    }

    /**
     * Obtiene el historial de crecimiento integrado con expedientes clínicos
     */
    async getGrowthHistoryFromClinicalRecords(
        patientId: string,
        startDate?: Date,
        endDate?: Date
    ): Promise<any[]> {
        try {
            const queryBuilder = this.clinicalRecordRepository
                .createQueryBuilder('record')
                .where('record.patient_user_id = :patientId', { patientId })
                .andWhere('record.anthropometric_measurements IS NOT NULL')
                .orderBy('record.record_date', 'ASC');

            if (startDate) {
                queryBuilder.andWhere('record.record_date >= :startDate', { startDate });
            }

            if (endDate) {
                queryBuilder.andWhere('record.record_date <= :endDate', { endDate });
            }

            const records = await queryBuilder.getMany();

            return records.map(record => ({
                date: record.record_date,
                measurements: record.anthropometric_measurements,
                evaluations: record.anthropometric_evaluations,
                diagnosis: record.nutritional_diagnosis,
                notes: record.evolution_and_follow_up_notes,
                nutritionist: record.nutritionist,
                record_id: record.id
            }));

        } catch (error: any) {
            console.error('Error obteniendo historial de crecimiento:', error);
            throw new AppError('Error al obtener historial de crecimiento', 500);
        }
    }

    /**
     * Actualiza todas las evaluaciones de crecimiento en expedientes existentes
     */
    async updateExistingRecordsWithGrowthData(patientId: string): Promise<number> {
        try {
            const records = await this.clinicalRecordRepository.find({
                where: { 
                    patient: { id: patientId },
                    anthropometric_measurements: { current_weight_kg: 'NOT NULL' as any }
                },
                relations: ['patient']
            });

            let updatedCount = 0;

            for (const record of records) {
                if (record.anthropometric_measurements?.current_weight_kg) {
                    // Recalcular métricas de crecimiento si tiene fecha de nacimiento
                    if (!record.patient.birth_date) continue;
                    
                    const ageMonths = this.calculateAgeInMonths(
                        record.patient.birth_date,
                        record.record_date
                    );

                    if (ageMonths > 0) {
                        const growthMetrics = await this.calculateGrowthMetrics({
                            date: record.record_date,
                            ageMonths,
                            weight: record.anthropometric_measurements.current_weight_kg,
                            height: record.anthropometric_measurements.height_m ? 
                                record.anthropometric_measurements.height_m * 100 : undefined,
                            headCircumference: undefined // Campo no disponible en entidad actual
                        }, record.patient.gender as Gender);

                        // Actualizar evaluaciones con campos existentes
                        record.anthropometric_evaluations = {
                            ...record.anthropometric_evaluations,
                            // Datos de crecimiento guardados en campos de texto existentes
                            complexion: `Percentiles - Peso: ${growthMetrics.weightForAge?.percentile || 'N/A'}%, Talla: ${growthMetrics.heightForAge?.percentile || 'N/A'}%, IMC: ${growthMetrics.bmiForAge?.percentile || 'N/A'}%`
                        };

                        await this.clinicalRecordRepository.save(record);
                        updatedCount++;
                    }
                }
            }

            return updatedCount;

        } catch (error: any) {
            console.error('Error actualizando expedientes existentes:', error);
            throw new AppError('Error al actualizar expedientes existentes', 500);
        }
    }

    /**
     * Recopila datos de crecimiento para un expediente
     */
    private async gatherGrowthDataForRecord(
        patientId: string,
        includeAlerts: boolean,
        includeHistory: boolean
    ): Promise<GrowthIntegrationData> {
        // Obtener progreso más reciente
        const latestProgress = await this.progressLogRepository.findOne({
            where: { patient: { id: patientId } },
            order: { date: 'DESC' }
        });

        const patient = await this.userRepository.findOne({
            where: { id: patientId }
        });

        let currentGrowthAssessment = null;
        let activeAlerts: any[] = [];
        let growthHistory: any[] = [];

        if (latestProgress && patient?.age && patient?.gender) {
            // Calcular evaluación actual
            const ageMonths = patient.age * 12; // Aproximación
            if (latestProgress.weight) {
                currentGrowthAssessment = await growthChartsService.calculateMultipleMetrics(
                    ageMonths,
                    latestProgress.weight,
                    150, // Altura por defecto
                    patient.gender as Gender
                );
            }
        }

        if (includeAlerts) {
            activeAlerts = await growthAlertsService.getActiveAlertsForPatient(patientId);
        }

        if (includeHistory) {
            growthHistory = await this.getGrowthHistoryFromClinicalRecords(patientId);
        }

        return {
            currentGrowthAssessment,
            growthHistory,
            activeAlerts,
            growthChartInterpretation: this.generateGrowthChartInterpretation(currentGrowthAssessment, activeAlerts),
            nutritionalRecommendations: this.generateNutritionalRecommendations(currentGrowthAssessment, activeAlerts).recommendations,
            followUpSchedule: this.determineFollowUpSchedule(currentGrowthAssessment, activeAlerts)
        };
    }

    /**
     * Actualiza un expediente clínico con datos de crecimiento
     */
    private async updateClinicalRecordWithGrowthData(
        clinicalRecord: ClinicalRecord,
        growthData: GrowthIntegrationData
    ): Promise<void> {
        // Actualizar evaluaciones antropométricas
        if (growthData.currentGrowthAssessment) {
            clinicalRecord.anthropometric_evaluations = {
                ...clinicalRecord.anthropometric_evaluations,
                // Guardar datos de crecimiento en campo de texto existente
                complexion: `Percentiles: Peso=${growthData.currentGrowthAssessment.weightForAge?.percentile || 'N/A'}%, Talla=${growthData.currentGrowthAssessment.heightForAge?.percentile || 'N/A'}%, IMC=${growthData.currentGrowthAssessment.bmiForAge?.percentile || 'N/A'}%`
            };
        }

        // Actualizar plan nutricional con recomendaciones de crecimiento
        const currentPlan = clinicalRecord.nutritional_plan_and_management || '';
        const growthRecommendations = growthData.nutritionalRecommendations.join('\n• ');
        
        clinicalRecord.nutritional_plan_and_management = currentPlan + 
            `\n\n=== RECOMENDACIONES BASADAS EN CRECIMIENTO ===\n• ${growthRecommendations}`;

        // Actualizar notas de evolución con alertas
        if (growthData.activeAlerts.length > 0) {
            const alertSummary = growthData.activeAlerts
                .map(alert => `${alert.getAlertIcon()} ${alert.title}`)
                .join('\n• ');
            
            const currentNotes = clinicalRecord.evolution_and_follow_up_notes || '';
            clinicalRecord.evolution_and_follow_up_notes = currentNotes + 
                `\n\n=== ALERTAS DE CRECIMIENTO ACTIVAS ===\n• ${alertSummary}`;
        }

        // Agregar información de integración de crecimiento en notas
        const integrationNotes = `\n\n=== INTEGRACIÓN DE DATOS DE CRECIMIENTO ===\nIntegrado el: ${new Date().toLocaleDateString('es-ES')}\nSeguimiento: ${growthData.followUpSchedule}`;
        
        clinicalRecord.evolution_and_follow_up_notes = (clinicalRecord.evolution_and_follow_up_notes || '') + integrationNotes;

        await this.clinicalRecordRepository.save(clinicalRecord);
    }

    /**
     * Calcula métricas de crecimiento para una medición
     */
    private async calculateGrowthMetrics(
        measurementData: any,
        gender: Gender
    ): Promise<any> {
        const metrics: any = {};

        try {
            if (measurementData.weight && measurementData.height) {
                const results = await growthChartsService.calculateMultipleMetrics(
                    measurementData.ageMonths,
                    measurementData.weight,
                    measurementData.height,
                    gender
                );
                
                Object.assign(metrics, results);
            }

            if (measurementData.headCircumference) {
                metrics.headCircumferenceForAge = await growthChartsService.calculateGrowthPercentile({
                    ageMonths: measurementData.ageMonths,
                    value: measurementData.headCircumference,
                    gender,
                    metricType: GrowthMetricType.HEAD_CIRCUMFERENCE
                });
            }

            return metrics;

        } catch (error) {
            console.error('Error calculando métricas de crecimiento:', error);
            return {};
        }
    }

    /**
     * Genera interpretación clínica del crecimiento
     */
    private generateGrowthInterpretation(growthMetrics: any, alerts: any[]): any {
        let assessment = 'Normal';
        let diagnosis = 'Crecimiento dentro de parámetros normales';
        let notes = '';

        // Evaluar estado nutricional
        if (growthMetrics.weightForAge?.percentile < 3) {
            assessment = 'Desnutrición';
            diagnosis = 'Desnutrición - peso significativamente bajo para la edad';
        } else if (growthMetrics.bmiForAge?.percentile > 97) {
            assessment = 'Sobrepeso/Obesidad';
            diagnosis = 'Sobrepeso u obesidad - IMC elevado para la edad';
        } else if (growthMetrics.heightForAge?.percentile < 3) {
            assessment = 'Retraso del crecimiento';
            diagnosis = 'Retraso del crecimiento - talla baja para la edad';
        }

        // Agregar información de alertas
        if (alerts.length > 0) {
            notes = `Se detectaron ${alerts.length} alerta(s) de crecimiento que requieren seguimiento.`;
        }

        return { assessment, diagnosis, notes };
    }

    /**
     * Genera recomendaciones nutricionales basadas en crecimiento
     */
    private generateNutritionalRecommendations(growthMetrics: any, alerts: any[]): any {
        const recommendations: string[] = [];
        let plan = '';

        // Recomendaciones generales
        recommendations.push('Mantener alimentación balanceada y variada');
        recommendations.push('Asegurar ingesta adecuada de macronutrientes');
        recommendations.push('Monitorear crecimiento regularmente');

        // Recomendaciones específicas basadas en métricas
        if (growthMetrics.weightForAge?.percentile < 10) {
            recommendations.push('Incrementar densidad calórica de la alimentación');
            recommendations.push('Considerar suplementación nutricional');
            plan += 'Plan de recuperación nutricional con seguimiento semanal. ';
        }

        if (growthMetrics.heightForAge?.percentile < 10) {
            recommendations.push('Optimizar ingesta de proteínas de alto valor biológico');
            recommendations.push('Asegurar aporte adecuado de calcio y vitamina D');
            plan += 'Evaluación de factores que afectan el crecimiento lineal. ';
        }

        if (growthMetrics.bmiForAge?.percentile > 85) {
            recommendations.push('Moderar ingesta calórica y azúcares simples');
            recommendations.push('Incrementar actividad física');
            plan += 'Plan de manejo integral del sobrepeso/obesidad infantil. ';
        }

        // Recomendaciones basadas en alertas
        alerts.forEach(alert => {
            if (alert.recommendations?.nutritional_interventions) {
                recommendations.push(...alert.recommendations.nutritional_interventions);
            }
        });

        return { recommendations, plan };
    }

    /**
     * Genera interpretación de curvas de crecimiento
     */
    private generateGrowthChartInterpretation(growthMetrics: any, alerts: any[]): string {
        if (!growthMetrics) {
            return 'Datos insuficientes para interpretación de curvas de crecimiento.';
        }

        let interpretation = '';

        if (growthMetrics.weightForAge) {
            interpretation += `Peso para edad: P${growthMetrics.weightForAge.percentile.toFixed(1)} (${growthMetrics.weightForAge.interpretation}). `;
        }

        if (growthMetrics.heightForAge) {
            interpretation += `Talla para edad: P${growthMetrics.heightForAge.percentile.toFixed(1)} (${growthMetrics.heightForAge.interpretation}). `;
        }

        if (growthMetrics.bmiForAge) {
            interpretation += `IMC para edad: P${growthMetrics.bmiForAge.percentile.toFixed(1)} (${growthMetrics.bmiForAge.interpretation}). `;
        }

        if (alerts.length > 0) {
            interpretation += `ALERTAS: ${alerts.length} alertas activas requieren atención.`;
        }

        return interpretation || 'Sin datos suficientes para interpretación.';
    }

    /**
     * Determina cronograma de seguimiento
     */
    private determineFollowUpSchedule(growthMetrics: any, alerts: any[]): string {
        // Seguimiento basado en alertas críticas
        const criticalAlerts = alerts.filter(alert => alert.severity === 'critical');
        if (criticalAlerts.length > 0) {
            return 'Seguimiento semanal hasta estabilización';
        }

        // Seguimiento basado en percentiles
        if (growthMetrics?.weightForAge?.percentile < 10 || 
            growthMetrics?.heightForAge?.percentile < 10 ||
            growthMetrics?.bmiForAge?.percentile > 90) {
            return 'Seguimiento mensual con evaluación antropométrica';
        }

        return 'Seguimiento trimestral regular';
    }

    /**
     * Calcula edad en meses entre dos fechas
     */
    private calculateAgeInMonths(birthDate: Date | string, currentDate: Date): number {
        const birth = new Date(birthDate);
        const current = new Date(currentDate);
        
        const yearDiff = current.getFullYear() - birth.getFullYear();
        const monthDiff = current.getMonth() - birth.getMonth();
        
        return yearDiff * 12 + monthDiff;
    }
}

export default new ClinicalIntegrationService(); 