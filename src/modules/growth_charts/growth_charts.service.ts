// src/modules/growth_charts/growth_charts.service.ts
import { Repository } from 'typeorm';
import { AppDataSource } from '../../database/data-source';
import { GrowthReference, GrowthReferenceSource, GrowthMetricType, Gender } from '../../database/entities/growth_reference.entity';
import { AppError } from '../../utils/app.error';

interface GrowthCalculationInput {
    ageMonths: number;
    value: number; // peso en kg, altura en cm, etc.
    gender: Gender;
    metricType: GrowthMetricType;
    source?: GrowthReferenceSource; // Por defecto WHO
}

interface GrowthCalculationResult {
    percentile: number;
    zScore: number;
    interpretation: string;
    reference: {
        source: string;
        metricType: string;
        ageMonths: number;
        gender: string;
    };
    percentileRanges: {
        p3: number;
        p10: number;
        p25: number;
        p50: number;
        p75: number;
        p90: number;
        p97: number;
    };
}

interface GrowthChartData {
    ageMonths: number;
    p3: number;
    p10: number;
    p25: number;
    p50: number;
    p75: number;
    p90: number;
    p97: number;
}

class GrowthChartsService {
    private growthReferenceRepository: Repository<GrowthReference>;

    constructor() {
        this.growthReferenceRepository = AppDataSource.getRepository(GrowthReference);
    }

    /**
     * Calcula el percentil y z-score para un valor específico
     */
    async calculateGrowthPercentile(input: GrowthCalculationInput): Promise<GrowthCalculationResult> {
        const { ageMonths, value, gender, metricType, source = GrowthReferenceSource.WHO } = input;

        // Validar entrada
        if (ageMonths < 0 || ageMonths > 240) {
            throw new AppError('La edad debe estar entre 0 y 240 meses', 400);
        }

        if (value <= 0) {
            throw new AppError('El valor debe ser mayor que 0', 400);
        }

        // Buscar la referencia más cercana
        const reference = await this.findClosestReference(ageMonths, gender, metricType, source);
        
        if (!reference) {
            throw new AppError(`No se encontró referencia para ${metricType} en ${source}`, 404);
        }

        // Calcular z-score
        const zScore = reference.calculateZScore(value);
        if (zScore === null) {
            throw new AppError('No se pudo calcular el z-score', 500);
        }

        // Calcular percentil aproximado usando z-score
        const percentile = this.zScoreToPercentile(zScore);

        // Obtener rangos de percentiles
        const percentileRanges = {
            p3: reference.p3,
            p10: reference.p10,
            p25: reference.p25,
            p50: reference.p50,
            p75: reference.p75,
            p90: reference.p90,
            p97: reference.p97
        };

        return {
            percentile,
            zScore,
            interpretation: reference.interpretPercentile(percentile),
            reference: {
                source: reference.source,
                metricType: reference.metric_type,
                ageMonths: reference.age_months,
                gender: reference.gender
            },
            percentileRanges
        };
    }

    /**
     * Obtiene datos para generar curvas de crecimiento
     */
    async getGrowthChartData(
        metricType: GrowthMetricType,
        gender: Gender,
        source: GrowthReferenceSource = GrowthReferenceSource.WHO,
        startAge: number = 0,
        endAge: number = 240
    ): Promise<GrowthChartData[]> {
        const references = await this.growthReferenceRepository.find({
            where: {
                metric_type: metricType,
                gender,
                source
            },
            order: {
                age_months: 'ASC'
            }
        });

        return references
            .filter(ref => ref.age_months >= startAge && ref.age_months <= endAge)
            .map(ref => ({
                ageMonths: ref.age_months,
                p3: ref.p3,
                p10: ref.p10,
                p25: ref.p25,
                p50: ref.p50,
                p75: ref.p75,
                p90: ref.p90,
                p97: ref.p97
            }));
    }

    /**
     * Calcula múltiples métricas para un niño
     */
    async calculateMultipleMetrics(
        ageMonths: number,
        weight: number, // kg
        height: number, // cm
        gender: Gender,
        source: GrowthReferenceSource = GrowthReferenceSource.WHO
    ): Promise<{
        weightForAge?: GrowthCalculationResult;
        heightForAge?: GrowthCalculationResult;
        weightForHeight?: GrowthCalculationResult;
        bmiForAge?: GrowthCalculationResult;
    }> {
        const results: any = {};

        try {
            // Peso para edad
            results.weightForAge = await this.calculateGrowthPercentile({
                ageMonths,
                value: weight,
                gender,
                metricType: GrowthMetricType.WEIGHT_FOR_AGE,
                source
            });
        } catch (error) {
            console.warn('No se pudo calcular peso para edad:', error);
        }

        try {
            // Altura para edad
            results.heightForAge = await this.calculateGrowthPercentile({
                ageMonths,
                value: height,
                gender,
                metricType: GrowthMetricType.HEIGHT_FOR_AGE,
                source
            });
        } catch (error) {
            console.warn('No se pudo calcular altura para edad:', error);
        }

        try {
            // Peso para altura (solo válido para ciertas edades)
            if (ageMonths <= 60) { // Hasta 5 años
                results.weightForHeight = await this.calculateGrowthPercentile({
                    ageMonths: height, // Para peso/altura, el "age" es realmente la altura
                    value: weight,
                    gender,
                    metricType: GrowthMetricType.WEIGHT_FOR_HEIGHT,
                    source
                });
            }
        } catch (error) {
            console.warn('No se pudo calcular peso para altura:', error);
        }

        try {
            // IMC para edad
            const bmi = weight / Math.pow(height / 100, 2);
            results.bmiForAge = await this.calculateGrowthPercentile({
                ageMonths,
                value: bmi,
                gender,
                metricType: GrowthMetricType.BMI_FOR_AGE,
                source
            });
        } catch (error) {
            console.warn('No se pudo calcular IMC para edad:', error);
        }

        return results;
    }

    /**
     * Busca la referencia más cercana para la edad dada
     */
    private async findClosestReference(
        ageMonths: number,
        gender: Gender,
        metricType: GrowthMetricType,
        source: GrowthReferenceSource
    ): Promise<GrowthReference | null> {
        // Intentar encontrar coincidencia exacta
        let reference = await this.growthReferenceRepository.findOne({
            where: {
                age_months: ageMonths,
                gender,
                metric_type: metricType,
                source
            }
        });

        if (reference) {
            return reference;
        }

        // Si no hay coincidencia exacta, buscar la más cercana
        const allReferences = await this.growthReferenceRepository.find({
            where: {
                gender,
                metric_type: metricType,
                source
            },
            order: {
                age_months: 'ASC'
            }
        });

        if (allReferences.length === 0) {
            return null;
        }

        // Encontrar la referencia más cercana
        let closest = allReferences[0];
        let minDiff = Math.abs(closest.age_months - ageMonths);

        for (const ref of allReferences) {
            const diff = Math.abs(ref.age_months - ageMonths);
            if (diff < minDiff) {
                minDiff = diff;
                closest = ref;
            }
        }

        return closest;
    }

    /**
     * Convierte z-score a percentil aproximado
     */
    private zScoreToPercentile(zScore: number): number {
        // Función de distribución normal acumulativa aproximada
        const cdf = (x: number): number => {
            return 0.5 * (1 + this.erf(x / Math.sqrt(2)));
        };

        return Math.round(cdf(zScore) * 100 * 100) / 100; // Redondear a 2 decimales
    }

    /**
     * Función de error (erf) para cálculo de distribución normal
     */
    private erf(x: number): number {
        // Aproximación de Abramowitz y Stegun
        const a1 =  0.254829592;
        const a2 = -0.284496736;
        const a3 =  1.421413741;
        const a4 = -1.453152027;
        const a5 =  1.061405429;
        const p  =  0.3275911;

        const sign = x >= 0 ? 1 : -1;
        x = Math.abs(x);

        const t = 1.0 / (1.0 + p * x);
        const y = 1.0 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-x * x);

        return sign * y;
    }

    /**
     * Obtiene información sobre las referencias disponibles
     */
    async getAvailableReferences(): Promise<{
        sources: string[];
        metricTypes: string[];
        ageRanges: { [key: string]: { min: number; max: number } };
    }> {
        const references = await this.growthReferenceRepository.find();
        
        const sources = [...new Set(references.map(r => r.source))];
        const metricTypes = [...new Set(references.map(r => r.metric_type))];
        
        const ageRanges: { [key: string]: { min: number; max: number } } = {};
        
        for (const metricType of metricTypes) {
            const metricsOfType = references.filter(r => r.metric_type === metricType);
            const ages = metricsOfType.map(r => r.age_months);
            ageRanges[metricType] = {
                min: Math.min(...ages),
                max: Math.max(...ages)
            };
        }

        return {
            sources,
            metricTypes,
            ageRanges
        };
    }
}

export default new GrowthChartsService(); 