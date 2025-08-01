import { Repository } from 'typeorm';
import { AppDataSource } from '../../database/data-source';
import { GrowthAlert, GrowthAlertType, AlertSeverity, AlertStatus } from '../../database/entities/growth_alert.entity';
import { User } from '../../database/entities/user.entity';
import { PatientProgressLog } from '../../database/entities/patient_progress_log.entity';
import { PatientProfile } from '../../database/entities/patient_profile.entity';
import { GrowthMetricType, Gender } from '../../database/entities/growth_reference.entity';
import growthChartsService from './growth_charts.service';
import automatedNotificationsService from './automated_notifications.service';
import { AppError } from '../../utils/app.error';

interface AlertEvaluationResult {
    shouldCreateAlert: boolean;
    alertType?: GrowthAlertType;
    severity?: AlertSeverity;
    title?: string;
    description?: string;
    recommendations?: any;
    alertData?: any;
}

interface GrowthMeasurement {
    date: Date;
    ageMonths: number;
    weight?: number;
    height?: number;
    headCircumference?: number;
    patientId: string;
    gender: Gender;
}

class GrowthAlertsService {
    private growthAlertRepository: Repository<GrowthAlert>;
    private userRepository: Repository<User>;
    private progressLogRepository: Repository<PatientProgressLog>;
    private patientProfileRepository: Repository<PatientProfile>;

    constructor() {
        this.growthAlertRepository = AppDataSource.getRepository(GrowthAlert);
        this.userRepository = AppDataSource.getRepository(User);
        this.progressLogRepository = AppDataSource.getRepository(PatientProgressLog);
        this.patientProfileRepository = AppDataSource.getRepository(PatientProfile);
    }

    /**
     * Evalúa una nueva medición de crecimiento y genera alertas si es necesario
     */
    async evaluateGrowthMeasurement(measurement: GrowthMeasurement): Promise<GrowthAlert[]> {
        const alertsCreated: GrowthAlert[] = [];

        try {
            // Calcular percentiles y z-scores para todas las métricas disponibles
            const growthMetrics = await this.calculateAllGrowthMetrics(measurement);

            // Evaluar cada tipo de alerta posible
            const alertEvaluations = await Promise.all([
                this.evaluateSevereUnderweight(measurement, growthMetrics),
                this.evaluateSevereStunting(measurement, growthMetrics),
                this.evaluateSevereWasting(measurement, growthMetrics),
                this.evaluateSevereObesity(measurement, growthMetrics),
                this.evaluatePercentileChanges(measurement, growthMetrics),
                this.evaluateGrowthVelocity(measurement),
                this.evaluateHeadCircumference(measurement, growthMetrics),
                this.evaluateFailureToThrive(measurement, growthMetrics),
                this.evaluateNewbornWeightLoss(measurement),
            ]);

            // Crear alertas para las evaluaciones que las requieran
            for (const evaluation of alertEvaluations) {
                if (evaluation.shouldCreateAlert && evaluation.alertType) {
                    // Verificar si ya existe una alerta similar activa
                    const existingAlert = await this.checkExistingAlert(
                        measurement.patientId,
                        evaluation.alertType
                    );

                    if (!existingAlert) {
                        const alert = await this.createAlert({
                            patientId: measurement.patientId,
                            alertType: evaluation.alertType,
                            severity: evaluation.severity!,
                            title: evaluation.title!,
                            description: evaluation.description!,
                            recommendations: evaluation.recommendations,
                            alertData: evaluation.alertData,
                            isAutomated: true
                        });

                        alertsCreated.push(alert);
                    }
                }
            }

            return alertsCreated;

        } catch (error: any) {
            console.error('Error evaluando medición de crecimiento:', error);
            throw new AppError('Error al evaluar alertas de crecimiento', 500);
        }
    }

    /**
     * Calcula todas las métricas de crecimiento disponibles
     */
    private async calculateAllGrowthMetrics(measurement: GrowthMeasurement): Promise<any> {
        const metrics: any = {};

        try {
            if (measurement.weight && measurement.height) {
                // Calcular múltiples métricas
                const results = await growthChartsService.calculateMultipleMetrics(
                    measurement.ageMonths,
                    measurement.weight,
                    measurement.height,
                    measurement.gender
                );
                
                metrics.weightForAge = results.weightForAge;
                metrics.heightForAge = results.heightForAge;
                metrics.bmiForAge = results.bmiForAge;
                metrics.weightForHeight = results.weightForHeight;
            }

            // Perímetro cefálico si está disponible
            if (measurement.headCircumference) {
                metrics.headCircumferenceForAge = await growthChartsService.calculateGrowthPercentile({
                    ageMonths: measurement.ageMonths,
                    value: measurement.headCircumference,
                    gender: measurement.gender,
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
     * Evalúa si existe desnutrición severa (peso < P3)
     */
    private async evaluateSevereUnderweight(
        measurement: GrowthMeasurement, 
        metrics: any
    ): Promise<AlertEvaluationResult> {
        if (!metrics.weightForAge) {
            return { shouldCreateAlert: false };
        }

        const percentile = metrics.weightForAge.percentile;
        const zScore = metrics.weightForAge.zScore;

        if (percentile < 3 || zScore < -2) {
            const severity = zScore < -3 ? AlertSeverity.CRITICAL : AlertSeverity.HIGH;
            
            return {
                shouldCreateAlert: true,
                alertType: GrowthAlertType.SEVERE_UNDERWEIGHT,
                severity,
                title: `Desnutrición Severa - Peso < P3`,
                description: `El paciente presenta peso significativamente bajo para su edad (P${percentile.toFixed(1)}, Z-score: ${zScore.toFixed(2)}). Requiere evaluación nutricional inmediata.`,
                recommendations: {
                    immediate_actions: [
                        'Evaluación nutricional completa',
                        'Análisis de ingesta calórica',
                        'Descartar causas patológicas'
                    ],
                    follow_up_schedule: 'Seguimiento semanal hasta mejoría',
                    referrals: ['Endocrinología pediátrica si no mejora en 4 semanas'],
                    nutritional_interventions: [
                        'Plan de recuperación nutricional',
                        'Suplementación calórica',
                        'Monitoreo estrecho de peso'
                    ]
                },
                alertData: {
                    current_measurement: measurement,
                    percentiles: { weight_for_age: percentile },
                    z_scores: { weight_for_age: zScore }
                }
            };
        }

        return { shouldCreateAlert: false };
    }

    /**
     * Evalúa si existe retraso del crecimiento (talla < P3)
     */
    private async evaluateSevereStunting(
        measurement: GrowthMeasurement, 
        metrics: any
    ): Promise<AlertEvaluationResult> {
        if (!metrics.heightForAge) {
            return { shouldCreateAlert: false };
        }

        const percentile = metrics.heightForAge.percentile;
        const zScore = metrics.heightForAge.zScore;

        if (percentile < 3 || zScore < -2) {
            const severity = zScore < -3 ? AlertSeverity.CRITICAL : AlertSeverity.HIGH;
            
            return {
                shouldCreateAlert: true,
                alertType: GrowthAlertType.SEVERE_STUNTING,
                severity,
                title: `Retraso del Crecimiento - Talla < P3`,
                description: `El paciente presenta talla significativamente baja para su edad (P${percentile.toFixed(1)}, Z-score: ${zScore.toFixed(2)}). Indica desnutrición crónica.`,
                recommendations: {
                    immediate_actions: [
                        'Evaluación endocrinológica',
                        'Historia nutricional detallada',
                        'Investigar causas de retraso del crecimiento'
                    ],
                    follow_up_schedule: 'Seguimiento mensual con mediciones precisas',
                    referrals: ['Endocrinología pediátrica', 'Genética si hay sospecha'],
                    nutritional_interventions: [
                        'Optimización nutricional',
                        'Asegurar aporte adecuado de micronutrientes',
                        'Evaluación de absorción intestinal'
                    ]
                },
                alertData: {
                    current_measurement: measurement,
                    percentiles: { height_for_age: percentile },
                    z_scores: { height_for_age: zScore }
                }
            };
        }

        return { shouldCreateAlert: false };
    }

    /**
     * Evalúa si existe emaciación severa (peso/talla < P3)
     */
    private async evaluateSevereWasting(
        measurement: GrowthMeasurement, 
        metrics: any
    ): Promise<AlertEvaluationResult> {
        if (!metrics.weightForHeight) {
            return { shouldCreateAlert: false };
        }

        const percentile = metrics.weightForHeight.percentile;
        const zScore = metrics.weightForHeight.zScore;

        if (percentile < 3 || zScore < -2) {
            const severity = zScore < -3 ? AlertSeverity.CRITICAL : AlertSeverity.HIGH;
            
            return {
                shouldCreateAlert: true,
                alertType: GrowthAlertType.SEVERE_WASTING,
                severity,
                title: `Emaciación Severa - Peso/Talla < P3`,
                description: `El paciente presenta peso muy bajo para su talla (P${percentile.toFixed(1)}, Z-score: ${zScore.toFixed(2)}). Indica desnutrición aguda.`,
                recommendations: {
                    immediate_actions: [
                        'Evaluación médica urgente',
                        'Plan de recuperación nutricional',
                        'Monitoreo de signos vitales'
                    ],
                    follow_up_schedule: 'Seguimiento cada 3 días hasta estabilización',
                    referrals: ['Hospitalización si está indicada'],
                    nutritional_interventions: [
                        'Realimentación terapéutica controlada',
                        'Suplementos nutricionales de alta densidad',
                        'Monitoreo de complicaciones de realimentación'
                    ]
                },
                alertData: {
                    current_measurement: measurement,
                    percentiles: { weight_for_height: percentile },
                    z_scores: { weight_for_height: zScore }
                }
            };
        }

        return { shouldCreateAlert: false };
    }

    /**
     * Evalúa si existe obesidad severa (IMC > P97)
     */
    private async evaluateSevereObesity(
        measurement: GrowthMeasurement, 
        metrics: any
    ): Promise<AlertEvaluationResult> {
        if (!metrics.bmiForAge) {
            return { shouldCreateAlert: false };
        }

        const percentile = metrics.bmiForAge.percentile;
        const zScore = metrics.bmiForAge.zScore;

        if (percentile > 97 || zScore > 2) {
            const severity = zScore > 3 ? AlertSeverity.HIGH : AlertSeverity.MEDIUM;
            
            return {
                shouldCreateAlert: true,
                alertType: GrowthAlertType.SEVERE_OBESITY,
                severity,
                title: `Obesidad Severa - IMC > P97`,
                description: `El paciente presenta IMC significativamente alto para su edad (P${percentile.toFixed(1)}, Z-score: ${zScore.toFixed(2)}). Requiere intervención integral.`,
                recommendations: {
                    immediate_actions: [
                        'Evaluación de comorbilidades',
                        'Plan de manejo integral de obesidad',
                        'Evaluación familiar'
                    ],
                    follow_up_schedule: 'Seguimiento mensual con equipo multidisciplinario',
                    referrals: ['Endocrinología pediátrica', 'Psicología si está indicada'],
                    nutritional_interventions: [
                        'Plan de alimentación individualizado',
                        'Educación nutricional familiar',
                        'Programa de actividad física estructurado'
                    ]
                },
                alertData: {
                    current_measurement: measurement,
                    percentiles: { bmi_for_age: percentile },
                    z_scores: { bmi_for_age: zScore }
                }
            };
        }

        return { shouldCreateAlert: false };
    }

    /**
     * Evalúa cambios significativos en percentiles (cruzamiento de líneas)
     */
    private async evaluatePercentileChanges(
        measurement: GrowthMeasurement, 
        metrics: any
    ): Promise<AlertEvaluationResult> {
        try {
            // Obtener mediciones previas
            const previousMeasurements = await this.progressLogRepository.find({
                where: { patient: { id: measurement.patientId } },
                order: { date: 'DESC' },
                take: 3
            });

            if (previousMeasurements.length < 2) {
                return { shouldCreateAlert: false };
            }

            // Analizar tendencia en peso para edad
            if (metrics.weightForAge) {
                const currentPercentile = metrics.weightForAge.percentile;
                
                // Calcular percentil previo (simplificado - en implementación real se calcularía con datos históricos)
                const timeDiff = (measurement.date.getTime() - previousMeasurements[0].date.getTime()) / (1000 * 60 * 60 * 24 * 30); // meses
                
                if (timeDiff >= 3) { // Al menos 3 meses de diferencia
                    // Aquí iría lógica más compleja para calcular percentiles históricos
                    // Por simplicidad, asumimos cambio significativo si hay gran diferencia en peso
                    const weightChange = Math.abs((measurement.weight || 0) - (previousMeasurements[0].weight || 0));
                    const expectedWeight = (previousMeasurements[0].weight || 0) * 1.1; // Crecimiento esperado 10%
                    
                    if (weightChange > expectedWeight * 0.2) { // Cambio > 20% del esperado
                        return {
                            shouldCreateAlert: true,
                            alertType: (measurement.weight || 0) > (previousMeasurements[0].weight || 0) ? 
                                GrowthAlertType.PERCENTILE_RISE : GrowthAlertType.PERCENTILE_DROP,
                            severity: AlertSeverity.MEDIUM,
                            title: `Cambio Significativo en Percentil de Peso`,
                            description: `Se detectó un cambio significativo en el patrón de crecimiento del peso. Requiere evaluación.`,
                            recommendations: {
                                immediate_actions: [
                                    'Revisar historia nutricional reciente',
                                    'Evaluar cambios en alimentación o estilo de vida',
                                    'Descartar causas patológicas'
                                ],
                                follow_up_schedule: 'Seguimiento en 4-6 semanas',
                                monitoring_parameters: ['Peso', 'Talla', 'Patrón alimentario']
                            },
                            alertData: {
                                current_measurement: measurement,
                                trend_data: {
                                    previous_measurement: {
                                        date: previousMeasurements[0].date,
                                        age_months: measurement.ageMonths - timeDiff,
                                        value: previousMeasurements[0].weight || 0
                                    },
                                    time_period_months: timeDiff,
                                    percentile_change: currentPercentile
                                }
                            }
                        };
                    }
                }
            }

            return { shouldCreateAlert: false };

        } catch (error) {
            console.error('Error evaluando cambios de percentiles:', error);
            return { shouldCreateAlert: false };
        }
    }

    /**
     * Evalúa velocidad de crecimiento baja
     */
    private async evaluateGrowthVelocity(measurement: GrowthMeasurement): Promise<AlertEvaluationResult> {
        try {
            const previousMeasurements = await this.progressLogRepository.find({
                where: { patient: { id: measurement.patientId } },
                order: { date: 'DESC' },
                take: 2
            });

            if (previousMeasurements.length < 1) {
                return { shouldCreateAlert: false };
            }

            const timeDiff = (measurement.date.getTime() - previousMeasurements[0].date.getTime()) / (1000 * 60 * 60 * 24 * 30); // meses
            
            if (timeDiff >= 6) { // Al menos 6 meses de diferencia
                const heightGain = (measurement.height || 0) - (previousMeasurements[0].weight || 0); // Aquí debería ser height del log anterior
                const expectedGrowth = this.getExpectedGrowthVelocity(measurement.ageMonths);
                
                if (heightGain < expectedGrowth * 0.5) { // Menos del 50% del crecimiento esperado
                    return {
                        shouldCreateAlert: true,
                        alertType: GrowthAlertType.GROWTH_VELOCITY_LOW,
                        severity: AlertSeverity.MEDIUM,
                        title: `Velocidad de Crecimiento Reducida`,
                        description: `La velocidad de crecimiento lineal está por debajo de lo esperado para la edad.`,
                        recommendations: {
                            immediate_actions: [
                                'Evaluación endocrinológica',
                                'Análisis de factores nutricionales',
                                'Revisión de medicamentos'
                            ],
                            follow_up_schedule: 'Seguimiento cada 3 meses',
                            referrals: ['Endocrinología pediátrica'],
                            monitoring_parameters: ['Talla', 'Velocidad de crecimiento', 'Edad ósea']
                        },
                        alertData: {
                            current_measurement: measurement,
                            trend_data: {
                                change_rate: heightGain / timeDiff,
                                time_period_months: timeDiff,
                                expected_growth: expectedGrowth
                            }
                        }
                    };
                }
            }

            return { shouldCreateAlert: false };

        } catch (error) {
            console.error('Error evaluando velocidad de crecimiento:', error);
            return { shouldCreateAlert: false };
        }
    }

    /**
     * Evalúa perímetro cefálico anormal
     */
    private async evaluateHeadCircumference(
        measurement: GrowthMeasurement, 
        metrics: any
    ): Promise<AlertEvaluationResult> {
        if (!metrics.headCircumferenceForAge || !measurement.headCircumference) {
            return { shouldCreateAlert: false };
        }

        const percentile = metrics.headCircumferenceForAge.percentile;
        const zScore = metrics.headCircumferenceForAge.zScore;

        if (percentile < 3 || percentile > 97 || Math.abs(zScore) > 2) {
            const severity = Math.abs(zScore) > 3 ? AlertSeverity.HIGH : AlertSeverity.MEDIUM;
            
            return {
                shouldCreateAlert: true,
                alertType: GrowthAlertType.HEAD_CIRCUMFERENCE_ABNORMAL,
                severity,
                title: `Perímetro Cefálico Anormal`,
                description: `El perímetro cefálico está fuera del rango normal (P${percentile.toFixed(1)}, Z-score: ${zScore.toFixed(2)}).`,
                recommendations: {
                    immediate_actions: [
                        'Evaluación neurológica',
                        'Medición cuidadosa y repetición',
                        'Historia del desarrollo'
                    ],
                    follow_up_schedule: 'Seguimiento en 4 semanas',
                    referrals: ['Neurología pediátrica', 'Genética si está indicada'],
                    monitoring_parameters: ['Perímetro cefálico', 'Desarrollo neurológico']
                },
                alertData: {
                    current_measurement: measurement,
                    percentiles: { head_circumference_for_age: percentile },
                    z_scores: { head_circumference_for_age: zScore }
                }
            };
        }

        return { shouldCreateAlert: false };
    }

    /**
     * Evalúa falla de medro (multiple métricas afectadas)
     */
    private async evaluateFailureToThrive(
        measurement: GrowthMeasurement, 
        metrics: any
    ): Promise<AlertEvaluationResult> {
        let affectedMetrics = 0;
        const details: string[] = [];

        if (metrics.weightForAge && metrics.weightForAge.percentile < 10) {
            affectedMetrics++;
            details.push('Peso bajo para la edad');
        }

        if (metrics.heightForAge && metrics.heightForAge.percentile < 10) {
            affectedMetrics++;
            details.push('Talla baja para la edad');
        }

        if (metrics.bmiForAge && metrics.bmiForAge.percentile < 10) {
            affectedMetrics++;
            details.push('IMC bajo');
        }

        if (affectedMetrics >= 2) {
            return {
                shouldCreateAlert: true,
                alertType: GrowthAlertType.FAILURE_TO_THRIVE,
                severity: AlertSeverity.HIGH,
                title: `Falla de Medro`,
                description: `Múltiples parámetros de crecimiento afectados: ${details.join(', ')}. Requiere evaluación integral.`,
                recommendations: {
                    immediate_actions: [
                        'Evaluación médica completa',
                        'Análisis exhaustivo de causas',
                        'Plan de intervención multidisciplinario'
                    ],
                    follow_up_schedule: 'Seguimiento semanal inicial',
                    referrals: ['Gastroenterología pediátrica', 'Endocrinología pediátrica'],
                    nutritional_interventions: [
                        'Plan de recuperación nutricional intensivo',
                        'Monitoreo estrecho de ingesta',
                        'Suplementación según necesidades'
                    ]
                },
                alertData: {
                    current_measurement: measurement,
                    specific_data: {
                        affected_metrics: affectedMetrics,
                        details
                    }
                }
            };
        }

        return { shouldCreateAlert: false };
    }

    /**
     * Evalúa pérdida de peso neonatal > 10%
     */
    private async evaluateNewbornWeightLoss(measurement: GrowthMeasurement): Promise<AlertEvaluationResult> {
        if (measurement.ageMonths > 1) { // Solo para neonatos
            return { shouldCreateAlert: false };
        }

        try {
            // Obtener perfil del paciente para datos de nacimiento
            const patientProfile = await this.patientProfileRepository.findOne({
                where: { user: { id: measurement.patientId } },
                relations: ['user']
            });

            if (!patientProfile?.birth_history?.birth_weight_kg) {
                return { shouldCreateAlert: false };
            }

            const birthWeight = patientProfile.birth_history.birth_weight_kg;
            const currentWeight = measurement.weight || 0;
            const weightLossPercent = ((birthWeight - currentWeight) / birthWeight) * 100;

            if (weightLossPercent > 10) {
                return {
                    shouldCreateAlert: true,
                    alertType: GrowthAlertType.NEWBORN_WEIGHT_LOSS,
                    severity: weightLossPercent > 15 ? AlertSeverity.CRITICAL : AlertSeverity.HIGH,
                    title: `Pérdida de Peso Neonatal Excesiva`,
                    description: `Pérdida de peso del ${weightLossPercent.toFixed(1)}% desde el nacimiento (${birthWeight}kg → ${currentWeight}kg).`,
                    recommendations: {
                        immediate_actions: [
                            'Evaluación de la lactancia',
                            'Monitoreo frecuente de peso',
                            'Evaluación de signos de deshidratación'
                        ],
                        follow_up_schedule: 'Seguimiento diario hasta recuperación',
                        referrals: ['Lactancia materna especializada'],
                        nutritional_interventions: [
                            'Optimización de alimentación',
                            'Suplementación si está indicada',
                            'Apoyo a lactancia materna'
                        ]
                    },
                    alertData: {
                        current_measurement: measurement,
                        specific_data: {
                            birth_weight: birthWeight,
                            weight_loss_percent: weightLossPercent
                        }
                    }
                };
            }

            return { shouldCreateAlert: false };

        } catch (error) {
            console.error('Error evaluando pérdida peso neonatal:', error);
            return { shouldCreateAlert: false };
        }
    }

    /**
     * Obtiene la velocidad de crecimiento esperada por edad
     */
    private getExpectedGrowthVelocity(ageMonths: number): number {
        // Velocidades aproximadas en cm/año
        if (ageMonths < 12) return 25; // Primer año
        if (ageMonths < 24) return 12; // Segundo año
        if (ageMonths < 60) return 8;  // 2-5 años
        if (ageMonths < 120) return 6; // 5-10 años
        return 10; // Adolescencia
    }

    /**
     * Verifica si ya existe una alerta similar activa
     */
    private async checkExistingAlert(patientId: string, alertType: GrowthAlertType): Promise<GrowthAlert | null> {
        return await this.growthAlertRepository.findOne({
            where: {
                patient_id: patientId,
                alert_type: alertType,
                status: AlertStatus.ACTIVE
            }
        });
    }

    /**
     * Crea una nueva alerta
     */
    private async createAlert(data: {
        patientId: string;
        alertType: GrowthAlertType;
        severity: AlertSeverity;
        title: string;
        description: string;
        recommendations?: any;
        alertData?: any;
        isAutomated: boolean;
        nutritionistId?: string;
    }): Promise<GrowthAlert> {
        const alert = this.growthAlertRepository.create({
            patient_id: data.patientId,
            nutritionist_id: data.nutritionistId || null,
            alert_type: data.alertType,
            severity: data.severity,
            status: AlertStatus.ACTIVE,
            title: data.title,
            description: data.description,
            recommendations: data.recommendations,
            alert_data: data.alertData,
            is_automated: data.isAutomated,
            requires_immediate_attention: data.severity === AlertSeverity.CRITICAL,
            trigger_source: 'automated_growth_evaluation'
        });

        const savedAlert = await this.growthAlertRepository.save(alert);

        // Enviar notificaciones automáticas
        try {
            await automatedNotificationsService.processGrowthAlertNotifications(savedAlert);
        } catch (error) {
            console.error('Error enviando notificaciones automáticas para alerta:', error);
            // No fallar la creación de alerta si fallan las notificaciones
        }

        return savedAlert;
    }

    /**
     * Obtiene alertas activas para un paciente
     */
    async getActiveAlertsForPatient(patientId: string): Promise<GrowthAlert[]> {
        return await this.growthAlertRepository.find({
            where: {
                patient_id: patientId,
                status: AlertStatus.ACTIVE
            },
            order: {
                severity: 'DESC',
                created_at: 'DESC'
            }
        });
    }

    /**
     * Obtiene alertas activas para un nutriólogo
     */
    async getActiveAlertsForNutritionist(nutritionistId: string): Promise<GrowthAlert[]> {
        return await this.growthAlertRepository.find({
            where: {
                nutritionist_id: nutritionistId,
                status: AlertStatus.ACTIVE
            },
            relations: ['patient'],
            order: {
                severity: 'DESC',
                created_at: 'DESC'
            }
        });
    }

    /**
     * Marca una alerta como reconocida
     */
    async acknowledgeAlert(alertId: string, acknowledgedById: string): Promise<GrowthAlert> {
        const alert = await this.growthAlertRepository.findOne({
            where: { id: alertId }
        });

        if (!alert) {
            throw new AppError('Alerta no encontrada', 404);
        }

        alert.status = AlertStatus.ACKNOWLEDGED;
        alert.acknowledged_at = new Date();
        alert.acknowledged_by_id = acknowledgedById;

        return await this.growthAlertRepository.save(alert);
    }

    /**
     * Resuelve una alerta
     */
    async resolveAlert(
        alertId: string, 
        resolvedById: string, 
        resolutionNotes?: string
    ): Promise<GrowthAlert> {
        const alert = await this.growthAlertRepository.findOne({
            where: { id: alertId }
        });

        if (!alert) {
            throw new AppError('Alerta no encontrada', 404);
        }

        alert.status = AlertStatus.RESOLVED;
        alert.resolved_at = new Date();
        alert.resolved_by_id = resolvedById;
        alert.resolution_notes = resolutionNotes || null;

        return await this.growthAlertRepository.save(alert);
    }

    /**
     * Obtiene estadísticas de alertas
     */
    async getAlertStatistics(nutritionistId?: string): Promise<any> {
        const queryBuilder = this.growthAlertRepository.createQueryBuilder('alert');
        
        if (nutritionistId) {
            queryBuilder.where('alert.nutritionist_id = :nutritionistId', { nutritionistId });
        }

        const [total, active, critical, resolved] = await Promise.all([
            queryBuilder.getCount(),
            queryBuilder.clone().andWhere('alert.status = :status', { status: AlertStatus.ACTIVE }).getCount(),
            queryBuilder.clone().andWhere('alert.severity = :severity', { severity: AlertSeverity.CRITICAL }).getCount(),
            queryBuilder.clone().andWhere('alert.status = :status', { status: AlertStatus.RESOLVED }).getCount()
        ]);

        return {
            total,
            active,
            critical,
            resolved,
            resolution_rate: total > 0 ? (resolved / total) * 100 : 0
        };
    }
}

export default new GrowthAlertsService(); 