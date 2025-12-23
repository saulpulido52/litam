// src/modules/growth_charts/growth_charts.controller.ts
import { Request, Response, NextFunction } from 'express';
import growthChartsService from './growth_charts.service';
import { AppError } from '../../utils/app.error';
import { GrowthReferenceSource, GrowthMetricType, Gender } from '../../database/entities/growth_reference.entity';

class GrowthChartsController {
    /**
     * Calcula percentil para un valor específico
     * POST /growth-charts/calculate-percentile
     */
    public async calculatePercentile(req: Request, res: Response, next: NextFunction) {
        try {
            const {
                ageMonths,
                value,
                gender,
                metricType,
                source = GrowthReferenceSource.WHO
            } = req.body;

            // Validar entrada básica
            if (!ageMonths || !value || !gender || !metricType) {
                return next(new AppError('Faltan campos requeridos: ageMonths, value, gender, metricType', 400));
            }

            // Validar enums
            if (!Object.values(Gender).includes(gender)) {
                return next(new AppError('Género inválido. Debe ser "male" o "female"', 400));
            }

            if (!Object.values(GrowthMetricType).includes(metricType)) {
                return next(new AppError('Tipo de métrica inválido', 400));
            }

            if (source && !Object.values(GrowthReferenceSource).includes(source)) {
                return next(new AppError('Fuente de referencia inválida. Debe ser "WHO" o "CDC"', 400));
            }

            const result = await growthChartsService.calculateGrowthPercentile({
                ageMonths: Number(ageMonths),
                value: Number(value),
                gender,
                metricType,
                source
            });

            res.status(200).json({
                status: 'success',
                message: 'Percentil calculado exitosamente',
                data: result
            });

        } catch (error: any) {
            console.error('Error en calculatePercentile:', error);
            if (error instanceof AppError) {
                return next(error);
            }
            next(new AppError('Error al calcular percentil', 500));
        }
    }

    /**
     * Obtiene datos para generar curvas de crecimiento
     * GET /growth-charts/chart-data
     */
    public async getChartData(req: Request, res: Response, next: NextFunction) {
        try {
            const {
                metricType,
                gender,
                source = GrowthReferenceSource.WHO,
                startAge = '0',
                endAge = '240'
            } = req.query;

            // Validar parámetros requeridos
            if (!metricType || !gender) {
                return next(new AppError('Parámetros requeridos: metricType, gender', 400));
            }

            // Validar enums
            if (!Object.values(Gender).includes(gender as Gender)) {
                return next(new AppError('Género inválido', 400));
            }

            if (!Object.values(GrowthMetricType).includes(metricType as GrowthMetricType)) {
                return next(new AppError('Tipo de métrica inválido', 400));
            }

            const chartData = await growthChartsService.getGrowthChartData(
                metricType as GrowthMetricType,
                gender as Gender,
                source as GrowthReferenceSource,
                Number(startAge),
                Number(endAge)
            );

            res.status(200).json({
                status: 'success',
                message: 'Datos de curva obtenidos exitosamente',
                data: {
                    chartData,
                    metadata: {
                        metricType,
                        gender,
                        source,
                        startAge: Number(startAge),
                        endAge: Number(endAge),
                        dataPoints: chartData.length
                    }
                }
            });

        } catch (error: any) {
            console.error('Error en getChartData:', error);
            if (error instanceof AppError) {
                return next(error);
            }
            next(new AppError('Error al obtener datos de curva', 500));
        }
    }

    /**
     * Calcula múltiples métricas para un paciente pediátrico
     * POST /growth-charts/calculate-multiple
     */
    public async calculateMultipleMetrics(req: Request, res: Response, next: NextFunction) {
        try {
            const {
                ageMonths,
                weight,
                height,
                gender,
                source = GrowthReferenceSource.WHO
            } = req.body;

            // Validar entrada
            if (!ageMonths || !weight || !height || !gender) {
                return next(new AppError('Faltan campos requeridos: ageMonths, weight, height, gender', 400));
            }

            if (!Object.values(Gender).includes(gender)) {
                return next(new AppError('Género inválido', 400));
            }

            const results = await growthChartsService.calculateMultipleMetrics(
                Number(ageMonths),
                Number(weight),
                Number(height),
                gender,
                source
            );

            // Calcular resumen para interpretación fácil
            const summary = this.generateGrowthSummary(results);

            res.status(200).json({
                status: 'success',
                message: 'Métricas de crecimiento calculadas exitosamente',
                data: {
                    metrics: results,
                    summary,
                    input: {
                        ageMonths: Number(ageMonths),
                        weight: Number(weight),
                        height: Number(height),
                        gender,
                        source
                    }
                }
            });

        } catch (error: any) {
            console.error('Error en calculateMultipleMetrics:', error);
            if (error instanceof AppError) {
                return next(error);
            }
            next(new AppError('Error al calcular métricas múltiples', 500));
        }
    }

    /**
     * Obtiene información sobre referencias disponibles
     * GET /growth-charts/available-references
     */
    public async getAvailableReferences(req: Request, res: Response, next: NextFunction) {
        try {
            const references = await growthChartsService.getAvailableReferences();

            res.status(200).json({
                status: 'success',
                message: 'Referencias disponibles obtenidas exitosamente',
                data: references
            });

        } catch (error: any) {
            console.error('Error en getAvailableReferences:', error);
            if (error instanceof AppError) {
                return next(error);
            }
            next(new AppError('Error al obtener referencias disponibles', 500));
        }
    }

    /**
     * Analiza el crecimiento de un paciente a lo largo del tiempo
     * POST /growth-charts/analyze-growth-trend
     */
    public async analyzeGrowthTrend(req: Request, res: Response, next: NextFunction) {
        try {
            const { patientId, measurements } = req.body;

            if (!patientId || !measurements || !Array.isArray(measurements)) {
                return next(new AppError('Se requiere patientId y un array de measurements', 400));
            }

            // Validar estructura de measurements
            for (const measurement of measurements) {
                if (!measurement.date || !measurement.ageMonths || !measurement.weight || !measurement.height || !measurement.gender) {
                    return next(new AppError('Cada medición debe incluir: date, ageMonths, weight, height, gender', 400));
                }
            }

            // Calcular percentiles para cada medición
            const analysisResults = [];

            for (const measurement of measurements) {
                const metrics = await growthChartsService.calculateMultipleMetrics(
                    measurement.ageMonths,
                    measurement.weight,
                    measurement.height,
                    measurement.gender
                );

                analysisResults.push({
                    date: measurement.date,
                    ageMonths: measurement.ageMonths,
                    measurements: {
                        weight: measurement.weight,
                        height: measurement.height
                    },
                    percentiles: metrics,
                    summary: this.generateGrowthSummary(metrics)
                });
            }

            // Generar análisis de tendencias
            const trendAnalysis = this.analyzeTrends(analysisResults);

            res.status(200).json({
                status: 'success',
                message: 'Análisis de tendencia de crecimiento completado',
                data: {
                    patientId,
                    totalMeasurements: measurements.length,
                    measurements: analysisResults,
                    trendAnalysis
                }
            });

        } catch (error: any) {
            console.error('Error en analyzeGrowthTrend:', error);
            if (error instanceof AppError) {
                return next(error);
            }
            next(new AppError('Error al analizar tendencia de crecimiento', 500));
        }
    }

    /**
     * Genera un resumen interpretativo de las métricas de crecimiento
     */
    private generateGrowthSummary(metrics: any): any {
        const summary: any = {
            overallStatus: 'normal',
            concerns: [],
            strengths: [],
            recommendations: []
        };

        // Analizar peso para edad
        if (metrics.weightForAge) {
            const weightPercentile = metrics.weightForAge.percentile;
            if (weightPercentile < 3) {
                summary.concerns.push('Peso significativamente bajo para la edad');
                summary.overallStatus = 'requires_attention';
            } else if (weightPercentile > 97) {
                summary.concerns.push('Peso significativamente alto para la edad');
                summary.overallStatus = 'requires_attention';
            } else if (weightPercentile >= 25 && weightPercentile <= 75) {
                summary.strengths.push('Peso apropiado para la edad');
            }
        }

        // Analizar altura para edad
        if (metrics.heightForAge) {
            const heightPercentile = metrics.heightForAge.percentile;
            if (heightPercentile < 3) {
                summary.concerns.push('Talla baja para la edad');
                summary.overallStatus = 'requires_attention';
            } else if (heightPercentile >= 25 && heightPercentile <= 75) {
                summary.strengths.push('Talla apropiada para la edad');
            }
        }

        // Analizar IMC para edad
        if (metrics.bmiForAge) {
            const bmiPercentile = metrics.bmiForAge.percentile;
            if (bmiPercentile < 5) {
                summary.concerns.push('Bajo peso (IMC < P5)');
                summary.recommendations.push('Evaluar ingesta calórica y nutritiva');
            } else if (bmiPercentile >= 85 && bmiPercentile < 95) {
                summary.concerns.push('Sobrepeso (IMC P85-P95)');
                summary.recommendations.push('Promover hábitos alimentarios saludables');
            } else if (bmiPercentile >= 95) {
                summary.concerns.push('Obesidad (IMC ≥ P95)');
                summary.recommendations.push('Intervención nutricional y de actividad física');
                summary.overallStatus = 'requires_attention';
            }
        }

        // Recomendaciones generales
        if (summary.concerns.length === 0) {
            summary.recommendations.push('Continuar con seguimiento regular del crecimiento');
            summary.recommendations.push('Mantener hábitos alimentarios saludables');
        } else {
            summary.recommendations.push('Seguimiento más frecuente del crecimiento');
            summary.recommendations.push('Consulta con nutriólogo pediátrico');
        }

        return summary;
    }

    /**
     * Analiza tendencias en las mediciones a lo largo del tiempo
     */
    private analyzeTrends(measurements: any[]): any {
        if (measurements.length < 2) {
            return {
                message: 'Se necesitan al menos 2 mediciones para análisis de tendencias'
            };
        }

        const trends: any = {
            weight: { trend: 'stable', rate: 0 },
            height: { trend: 'stable', rate: 0 },
            weightPercentile: { trend: 'stable', change: 0 },
            heightPercentile: { trend: 'stable', change: 0 }
        };

        const first = measurements[0];
        const last = measurements[measurements.length - 1];
        const timeSpan = last.ageMonths - first.ageMonths;

        if (timeSpan > 0) {
            // Tendencia de peso
            const weightChange = last.measurements.weight - first.measurements.weight;
            trends.weight.rate = weightChange / timeSpan; // kg por mes
            trends.weight.trend = weightChange > 0 ? 'increasing' : weightChange < 0 ? 'decreasing' : 'stable';

            // Tendencia de altura
            const heightChange = last.measurements.height - first.measurements.height;
            trends.height.rate = heightChange / timeSpan; // cm por mes
            trends.height.trend = heightChange > 0 ? 'increasing' : heightChange < 0 ? 'decreasing' : 'stable';

            // Tendencia de percentiles
            if (first.percentiles.weightForAge && last.percentiles.weightForAge) {
                const percentileChange = last.percentiles.weightForAge.percentile - first.percentiles.weightForAge.percentile;
                trends.weightPercentile.change = percentileChange;
                trends.weightPercentile.trend = Math.abs(percentileChange) > 10 ? 
                    (percentileChange > 0 ? 'increasing' : 'decreasing') : 'stable';
            }

            if (first.percentiles.heightForAge && last.percentiles.heightForAge) {
                const percentileChange = last.percentiles.heightForAge.percentile - first.percentiles.heightForAge.percentile;
                trends.heightPercentile.change = percentileChange;
                trends.heightPercentile.trend = Math.abs(percentileChange) > 10 ? 
                    (percentileChange > 0 ? 'increasing' : 'decreasing') : 'stable';
            }
        }

        return {
            timeSpanMonths: timeSpan,
            measurementCount: measurements.length,
            trends,
            interpretation: this.interpretTrends(trends)
        };
    }

    /**
     * Interpreta las tendencias de crecimiento
     */
    private interpretTrends(trends: any): string[] {
        const interpretations: string[] = [];

        // Interpretar tendencia de peso
        if (trends.weight.trend === 'increasing' && trends.weight.rate > 0.5) {
            interpretations.push('Ganancia de peso acelerada');
        } else if (trends.weight.trend === 'decreasing') {
            interpretations.push('Pérdida de peso - requiere evaluación');
        }

        // Interpretar tendencia de altura
        if (trends.height.trend === 'decreasing' || trends.height.rate < 0.3) {
            interpretations.push('Velocidad de crecimiento lineal reducida');
        }

        // Interpretar cambios en percentiles
        if (trends.weightPercentile.trend === 'decreasing' && Math.abs(trends.weightPercentile.change) > 20) {
            interpretations.push('Caída significativa en percentil de peso');
        }

        if (trends.heightPercentile.trend === 'decreasing' && Math.abs(trends.heightPercentile.change) > 20) {
            interpretations.push('Caída significativa en percentil de talla');
        }

        if (interpretations.length === 0) {
            interpretations.push('Patrón de crecimiento normal');
        }

        return interpretations;
    }
}

export default new GrowthChartsController(); 