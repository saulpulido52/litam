// src/modules/progress_tracking/progress_analysis.service.ts
import { AppDataSource } from '../../database/data-source';
import { ClinicalRecord } from '../../database/entities/clinical_record.entity';
import { DietPlan } from '../../database/entities/diet_plan.entity';
import { PatientProgressLog } from '../../database/entities/patient_progress_log.entity';
import { Repository } from 'typeorm';

interface ProgressAnalysis {
  // Datos de progreso calculados
  weightProgress: {
    currentWeight: number | null;
    previousWeight: number | null;
    weightChange: number;
    weightChangePercent: number;
    trend: 'improving' | 'stable' | 'concerning';
  };
  
  anthropometricProgress: {
    waistChange: number;
    bmiCurrent: number | null;
    bmiPrevious: number | null;
    bodyCompositionTrend: 'improving' | 'stable' | 'concerning';
  };

  // Análisis de adherencia al plan
  dietPlanAdherence: {
    currentPlan: any;
    planDuration: number; // días desde inicio
    expectedProgress: string;
    actualVsExpected: 'on_track' | 'ahead' | 'behind';
  };

  // Recomendaciones automáticas
  recommendations: {
    shouldAdjustPlan: boolean;
    suggestedChanges: string[];
    concernFlags: string[];
    positiveFactors: string[];
  };

  // Datos para gráficos
  timelineData: {
    date: string;
    weight: number | null;
    bmi: number | null;
    waist: number | null;
    planActive: boolean;
    notes: string;
  }[];
}

class ProgressAnalysisService {
  private clinicalRecordRepository: Repository<ClinicalRecord>;
  private dietPlanRepository: Repository<DietPlan>;
  private progressLogRepository: Repository<PatientProgressLog>;

  constructor() {
    this.clinicalRecordRepository = AppDataSource.getRepository(ClinicalRecord);
    this.dietPlanRepository = AppDataSource.getRepository(DietPlan);
    this.progressLogRepository = AppDataSource.getRepository(PatientProgressLog);
  }

  /**
   * Analiza el progreso completo de un paciente basándose en expedientes y planes de dieta
   */
  async analyzePatientProgress(patientId: string): Promise<ProgressAnalysis> {
    try {
      console.log('🔍 Iniciando análisis de progreso para paciente:', patientId);
      
      // 1. Obtener todos los expedientes clínicos ordenados por fecha
      const clinicalRecords = await this.clinicalRecordRepository.find({
        where: { patient: { id: patientId } },
        order: { record_date: 'ASC' },
        relations: ['patient', 'nutritionist']
      });

      console.log(`📋 Expedientes clínicos encontrados: ${clinicalRecords.length}`);

      // 2. Obtener planes de dieta del paciente
      const dietPlans = await this.dietPlanRepository.find({
        where: { patient: { id: patientId } },
        order: { start_date: 'DESC' },
        relations: ['patient', 'nutritionist']
      });

      console.log(`🍎 Planes de dieta encontrados: ${dietPlans.length}`);

      // 3. Verificar si hay datos mínimos para generar análisis
      if (clinicalRecords.length === 0) {
        console.log('⚠️ No se encontraron expedientes clínicos');
        return this.generateEmptyAnalysis('No se encontraron expedientes clínicos para este paciente.');
      }

      // 4. Generar análisis de progreso
      const analysis = await this.generateProgressAnalysis(clinicalRecords, dietPlans);

      // 5. Generar/actualizar logs de progreso automáticamente
      await this.generateProgressLogs(patientId, analysis);

      console.log('✅ Análisis de progreso completado');
      return analysis;

    } catch (error) {
      console.error('❌ Error analyzing patient progress:', error);
      return this.generateEmptyAnalysis('Error al analizar el progreso del paciente: ' + (error as Error).message);
    }
  }

  /**
   * Genera el análisis basándose en expedientes y planes
   */
  private async generateProgressAnalysis(
    clinicalRecords: ClinicalRecord[], 
    dietPlans: DietPlan[]
  ): Promise<ProgressAnalysis> {
    
    console.log('📊 Generando análisis de progreso...');
    
    // Análisis de peso
    console.log('⚖️ Analizando progreso de peso...');
    const weightProgress = this.analyzeWeightProgress(clinicalRecords);
    console.log('Peso actual:', weightProgress.currentWeight, 'Tendencia:', weightProgress.trend);
    
    // Análisis antropométrico
    console.log('📏 Analizando medidas antropométricas...');
    const anthropometricProgress = this.analyzeAnthropometricProgress(clinicalRecords);
    console.log('IMC actual:', anthropometricProgress.bmiCurrent, 'Cambio cintura:', anthropometricProgress.waistChange);
    
    // Análisis de adherencia al plan
    console.log('🍎 Analizando adherencia al plan...');
    const dietPlanAdherence = this.analyzeDietPlanAdherence(clinicalRecords, dietPlans);
    console.log('Plan activo:', dietPlanAdherence.currentPlan?.name || 'Ninguno', 'Progreso:', dietPlanAdherence.actualVsExpected);
    
    // Generar recomendaciones
    console.log('💡 Generando recomendaciones...');
    const recommendations = this.generateRecommendations(weightProgress, anthropometricProgress, dietPlanAdherence);
    console.log('Recomendaciones generadas:', recommendations.suggestedChanges.length, 'cambios sugeridos');
    
    // Generar datos para timeline
    console.log('📈 Generando datos de timeline...');
    const timelineData = this.generateTimelineData(clinicalRecords, dietPlans);
    console.log('Puntos de datos en timeline:', timelineData.length);

    const analysis = {
      weightProgress,
      anthropometricProgress,
      dietPlanAdherence,
      recommendations,
      timelineData
    };

    console.log('✅ Análisis generado exitosamente');
    return analysis;
  }

  /**
   * Genera un análisis vacío con mensaje de error
   */
  private generateEmptyAnalysis(message: string): ProgressAnalysis {
    return {
      weightProgress: {
        currentWeight: null,
        previousWeight: null,
        weightChange: 0,
        weightChangePercent: 0,
        trend: 'stable'
      },
      anthropometricProgress: {
        waistChange: 0,
        bmiCurrent: null,
        bmiPrevious: null,
        bodyCompositionTrend: 'stable'
      },
      dietPlanAdherence: {
        currentPlan: null,
        planDuration: 0,
        expectedProgress: 'No hay datos disponibles',
        actualVsExpected: 'behind'
      },
      recommendations: {
        shouldAdjustPlan: false,
        suggestedChanges: ['Crear expedientes clínicos para poder generar análisis'],
        concernFlags: [message],
        positiveFactors: []
      },
      timelineData: []
    };
  }

  /**
   * Analiza la evolución del peso
   */
  private analyzeWeightProgress(clinicalRecords: ClinicalRecord[]) {
    const recordsWithWeight = clinicalRecords.filter(
      record => record.anthropometric_measurements?.current_weight_kg
    );

    if (recordsWithWeight.length === 0) {
      return {
        currentWeight: null,
        previousWeight: null,
        weightChange: 0,
        weightChangePercent: 0,
        trend: 'stable' as const
      };
    }

    const currentRecord = recordsWithWeight[recordsWithWeight.length - 1];
    const previousRecord = recordsWithWeight.length > 1 ? recordsWithWeight[recordsWithWeight.length - 2] : null;

    const currentWeight = currentRecord.anthropometric_measurements?.current_weight_kg || null;
    const previousWeight = previousRecord?.anthropometric_measurements?.current_weight_kg || null;

    let weightChange = 0;
    let weightChangePercent = 0;
    let trend: 'improving' | 'stable' | 'concerning' = 'stable';

    if (currentWeight && previousWeight) {
      weightChange = currentWeight - previousWeight;
      weightChangePercent = (weightChange / previousWeight) * 100;

      // Determinar tendencia (asumiendo que pérdida de peso es objetivo común)
      if (Math.abs(weightChange) < 0.5) {
        trend = 'stable';
      } else if (weightChange < 0) {
        trend = 'improving'; // Pérdida de peso
      } else {
        trend = 'concerning'; // Ganancia de peso no deseada
      }
    }

    return {
      currentWeight,
      previousWeight,
      weightChange,
      weightChangePercent,
      trend
    };
  }

  /**
   * Analiza medidas antropométricas
   */
  private analyzeAnthropometricProgress(clinicalRecords: ClinicalRecord[]) {
    const recordsWithMeasurements = clinicalRecords.filter(
      record => record.anthropometric_measurements
    );

    if (recordsWithMeasurements.length === 0) {
      return {
        waistChange: 0,
        bmiCurrent: null,
        bmiPrevious: null,
        bodyCompositionTrend: 'stable' as const
      };
    }

    const currentRecord = recordsWithMeasurements[recordsWithMeasurements.length - 1];
    const previousRecord = recordsWithMeasurements.length > 1 ? recordsWithMeasurements[recordsWithMeasurements.length - 2] : null;

    const currentMeasurements = currentRecord.anthropometric_measurements;
    const previousMeasurements = previousRecord?.anthropometric_measurements;

    const waistChange = (currentMeasurements?.waist_circ_cm || 0) - (previousMeasurements?.waist_circ_cm || 0);
    
    // Calcular IMC
    const bmiCurrent = this.calculateBMI(
      currentMeasurements?.current_weight_kg, 
      currentMeasurements?.height_m
    );
    const bmiPrevious = this.calculateBMI(
      previousMeasurements?.current_weight_kg, 
      previousMeasurements?.height_m
    );

    // Determinar tendencia de composición corporal
    let bodyCompositionTrend: 'improving' | 'stable' | 'concerning' = 'stable';
    if (waistChange < -2) {
      bodyCompositionTrend = 'improving';
    } else if (waistChange > 2) {
      bodyCompositionTrend = 'concerning';
    }

    return {
      waistChange,
      bmiCurrent,
      bmiPrevious,
      bodyCompositionTrend
    };
  }

  /**
   * Analiza adherencia al plan de dieta
   */
  private analyzeDietPlanAdherence(clinicalRecords: ClinicalRecord[], dietPlans: DietPlan[]) {
    const activePlan = dietPlans.find(plan => plan.status === 'active');
    
    if (!activePlan) {
      return {
        currentPlan: null,
        planDuration: 0,
        expectedProgress: 'No hay plan activo',
        actualVsExpected: 'behind' as const
      };
    }

    const planStartDate = new Date(activePlan.start_date);
    const currentDate = new Date();
    const planDuration = Math.floor((currentDate.getTime() - planStartDate.getTime()) / (1000 * 60 * 60 * 24));

    // Analizar progreso esperado vs real basándose en objetivos del plan
    const expectedProgress = this.calculateExpectedProgress(activePlan, planDuration);
    const actualVsExpected = this.compareActualVsExpected(clinicalRecords, activePlan, planDuration);

    return {
      currentPlan: {
        name: activePlan.name,
        startDate: activePlan.start_date,
        dailyCaloriesTarget: activePlan.daily_calories_target,
        macrosTarget: activePlan.daily_macros_target
      },
      planDuration,
      expectedProgress,
      actualVsExpected
    };
  }

  /**
   * Genera recomendaciones automáticas
   */
  private generateRecommendations(weightProgress: any, anthropometricProgress: any, dietPlanAdherence: any) {
    const recommendations = {
      shouldAdjustPlan: false,
      suggestedChanges: [] as string[],
      concernFlags: [] as string[],
      positiveFactors: [] as string[]
    };

    // Analizar tendencias de peso
    if (weightProgress.trend === 'concerning') {
      recommendations.shouldAdjustPlan = true;
      recommendations.concernFlags.push('Ganancia de peso no deseada');
      recommendations.suggestedChanges.push('Revisar adherencia al plan alimentario');
      recommendations.suggestedChanges.push('Evaluar necesidad de ajustar calorías diarias');
    } else if (weightProgress.trend === 'improving') {
      recommendations.positiveFactors.push('Progreso positivo en pérdida de peso');
    }

    // Analizar composición corporal
    if (anthropometricProgress.bodyCompositionTrend === 'improving') {
      recommendations.positiveFactors.push('Mejora en medidas corporales');
    } else if (anthropometricProgress.bodyCompositionTrend === 'concerning') {
      recommendations.concernFlags.push('Aumento en medidas corporales');
    }

    // Analizar adherencia al plan
    if (dietPlanAdherence.actualVsExpected === 'behind') {
      recommendations.shouldAdjustPlan = true;
      recommendations.suggestedChanges.push('Considerar modificar el plan para mejorar adherencia');
      recommendations.suggestedChanges.push('Revisar barreras para seguimiento del plan');
    } else if (dietPlanAdherence.actualVsExpected === 'on_track') {
      recommendations.positiveFactors.push('Buena adherencia al plan nutricional');
    }

    return recommendations;
  }

  /**
   * Genera datos para timeline/gráficos
   */
  private generateTimelineData(clinicalRecords: ClinicalRecord[], dietPlans: DietPlan[]) {
    return clinicalRecords.map(record => {
      const measurements = record.anthropometric_measurements;
      const weight = measurements?.current_weight_kg || null;
      const height = measurements?.height_m || null;
      const bmi = this.calculateBMI(weight, height);
      const waist = measurements?.waist_circ_cm || null;

      // Verificar si había un plan activo en esta fecha
      const recordDate = new Date(record.record_date);
      const planActive = dietPlans.some(plan => {
        const startDate = new Date(plan.start_date);
        const endDate = new Date(plan.end_date);
        return recordDate >= startDate && recordDate <= endDate;
      });

      return {
        date: record.record_date.toString(),
        weight,
        bmi,
        waist,
        planActive,
        notes: record.consultation_reason || 'Consulta de seguimiento'
      };
    });
  }

  /**
   * Calcula IMC
   */
  private calculateBMI(weight: number | null | undefined, height: number | null | undefined): number | null {
    if (!weight || !height || height === 0) return null;
    return weight / (height * height);
  }

  /**
   * Calcula progreso esperado según el plan
   */
  private calculateExpectedProgress(plan: DietPlan, durationDays: number): string {
    const weeksElapsed = Math.floor(durationDays / 7);
    const expectedWeightLoss = weeksElapsed * 0.5; // Asumiendo 0.5kg por semana como objetivo saludable
    
    return `Se esperaba una pérdida de aproximadamente ${expectedWeightLoss.toFixed(1)}kg en ${weeksElapsed} semanas`;
  }

  /**
   * Compara progreso real vs esperado
   */
  private compareActualVsExpected(
    clinicalRecords: ClinicalRecord[], 
    plan: DietPlan, 
    durationDays: number
  ): 'on_track' | 'ahead' | 'behind' {
    const recordsWithWeight = clinicalRecords.filter(
      record => record.anthropometric_measurements?.current_weight_kg
    );

    if (recordsWithWeight.length < 2) return 'behind';

    const initialRecord = recordsWithWeight[0];
    const latestRecord = recordsWithWeight[recordsWithWeight.length - 1];

    const initialWeight = initialRecord.anthropometric_measurements?.current_weight_kg || 0;
    const currentWeight = latestRecord.anthropometric_measurements?.current_weight_kg || 0;
    const actualWeightLoss = initialWeight - currentWeight;

    const weeksElapsed = Math.floor(durationDays / 7);
    const expectedWeightLoss = weeksElapsed * 0.5;

    if (actualWeightLoss >= expectedWeightLoss * 0.8) {
      return 'on_track';
    } else if (actualWeightLoss > expectedWeightLoss * 1.2) {
      return 'ahead';
    } else {
      return 'behind';
    }
  }

  /**
   * Genera automáticamente logs de progreso basándose en el análisis
   */
  private async generateProgressLogs(patientId: string, analysis: ProgressAnalysis): Promise<void> {
    try {
      // Crear un registro de progreso sintético basado en el análisis más reciente
      const latestData = analysis.timelineData[analysis.timelineData.length - 1];
      
      if (!latestData) return;

      // Verificar si ya existe un log para esta fecha
      const existingLog = await this.progressLogRepository.findOne({
        where: {
          patient: { id: patientId },
          date: new Date(latestData.date)
        }
      });

      if (existingLog) {
        // Actualizar log existente
        existingLog.weight = latestData.weight;
        existingLog.measurements = {
          waist: latestData.waist,
          bmi: latestData.bmi
        };
        existingLog.notes = this.generateProgressNotes(analysis);
        existingLog.adherence_to_plan = this.calculateAdherenceScore(analysis);
        existingLog.feeling_level = this.estimateFeelingLevel(analysis);

        await this.progressLogRepository.save(existingLog);
      } else {
        // Crear nuevo log
        const newLog = this.progressLogRepository.create({
          patient: { id: patientId },
          date: new Date(latestData.date),
          weight: latestData.weight,
          measurements: {
            waist: latestData.waist,
            bmi: latestData.bmi
          },
          notes: this.generateProgressNotes(analysis),
          adherence_to_plan: this.calculateAdherenceScore(analysis),
          feeling_level: this.estimateFeelingLevel(analysis)
        });

        await this.progressLogRepository.save(newLog);
      }

    } catch (error) {
      console.error('Error generating progress logs:', error);
    }
  }

  /**
   * Genera notas automáticas basadas en el análisis
   */
  private generateProgressNotes(analysis: ProgressAnalysis): string {
    const notes: string[] = [];

    // Agregar observaciones sobre peso
    if (analysis.weightProgress.trend === 'improving') {
      notes.push(`Progreso positivo: pérdida de ${Math.abs(analysis.weightProgress.weightChange).toFixed(1)}kg`);
    } else if (analysis.weightProgress.trend === 'concerning') {
      notes.push(`Atención: ganancia de ${analysis.weightProgress.weightChange.toFixed(1)}kg`);
    }

    // Agregar observaciones sobre medidas
    if (analysis.anthropometricProgress.waistChange < -2) {
      notes.push(`Reducción de cintura: ${Math.abs(analysis.anthropometricProgress.waistChange).toFixed(1)}cm`);
    }

    // Agregar estado del plan
    if (analysis.dietPlanAdherence.actualVsExpected === 'on_track') {
      notes.push('Adherencia al plan nutricional satisfactoria');
    } else if (analysis.dietPlanAdherence.actualVsExpected === 'behind') {
      notes.push('Se requiere mejorar adherencia al plan nutricional');
    }

    return notes.join('. ') || 'Seguimiento de progreso automático';
  }

  /**
   * Calcula score de adherencia (0-100)
   */
  private calculateAdherenceScore(analysis: ProgressAnalysis): number {
    let score = 50; // Base

    if (analysis.weightProgress.trend === 'improving') score += 30;
    if (analysis.anthropometricProgress.bodyCompositionTrend === 'improving') score += 20;
    if (analysis.dietPlanAdherence.actualVsExpected === 'on_track') score += 30;
    if (analysis.dietPlanAdherence.actualVsExpected === 'ahead') score += 40;

    if (analysis.weightProgress.trend === 'concerning') score -= 20;
    if (analysis.anthropometricProgress.bodyCompositionTrend === 'concerning') score -= 15;
    if (analysis.dietPlanAdherence.actualVsExpected === 'behind') score -= 25;

    return Math.max(0, Math.min(100, score));
  }

  /**
   * Estima nivel de bienestar (1-5)
   */
  private estimateFeelingLevel(analysis: ProgressAnalysis): number {
    let level = 3; // Neutro

    if (analysis.weightProgress.trend === 'improving') level += 1;
    if (analysis.anthropometricProgress.bodyCompositionTrend === 'improving') level += 1;
    if (analysis.recommendations.positiveFactors.length > analysis.recommendations.concernFlags.length) level += 1;

    if (analysis.weightProgress.trend === 'concerning') level -= 1;
    if (analysis.recommendations.concernFlags.length > 2) level -= 1;

    return Math.max(1, Math.min(5, level));
  }
}

export default new ProgressAnalysisService(); 