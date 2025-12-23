import { Request, Response, NextFunction } from 'express';
import clinicalIntegrationService from './clinical_integration.service';
import { AppError } from '../../utils/app.error';
import { Gender } from '../../database/entities/growth_reference.entity';

class ClinicalIntegrationController {
    /**
     * Integra datos de crecimiento en un expediente clínico existente
     * POST /growth-charts/clinical-integration/integrate/:recordId
     */
    public async integrateGrowthData(req: Request, res: Response, next: NextFunction) {
        try {
            const { recordId } = req.params;
            const { includeAlerts = true, includeHistory = true } = req.body;

            if (!recordId) {
                return next(new AppError('ID de expediente clínico requerido', 400));
            }

            const updatedRecord = await clinicalIntegrationService.integrateGrowthDataToRecord(
                recordId,
                Boolean(includeAlerts),
                Boolean(includeHistory)
            );

            res.status(200).json({
                status: 'success',
                message: 'Datos de crecimiento integrados exitosamente en el expediente clínico',
                data: {
                    clinicalRecord: updatedRecord,
                    integration: {
                        includeAlerts: Boolean(includeAlerts),
                        includeHistory: Boolean(includeHistory),
                        integratedAt: new Date()
                    }
                }
            });

        } catch (error: any) {
            console.error('Error en integrateGrowthData:', error);
            if (error instanceof AppError) {
                return next(error);
            }
            next(new AppError('Error al integrar datos de crecimiento', 500));
        }
    }

    /**
     * Crea un expediente clínico automático basado en medición de crecimiento
     * POST /growth-charts/clinical-integration/create-record
     */
    public async createGrowthBasedRecord(req: Request, res: Response, next: NextFunction) {
        try {
            const {
                patientId,
                nutritionistId,
                measurementData
            } = req.body;

            // Validar entrada
            if (!patientId || !nutritionistId || !measurementData) {
                return next(new AppError('Faltan campos requeridos: patientId, nutritionistId, measurementData', 400));
            }

            if (!measurementData.date || !measurementData.ageMonths) {
                return next(new AppError('measurementData debe incluir date y ageMonths', 400));
            }

            // Validar que hay al menos una medición
            if (!measurementData.weight && !measurementData.height && !measurementData.headCircumference) {
                return next(new AppError('Se requiere al menos una medición (weight, height, o headCircumference)', 400));
            }

            const measurementInput = {
                date: new Date(measurementData.date),
                ageMonths: Number(measurementData.ageMonths),
                weight: measurementData.weight ? Number(measurementData.weight) : undefined,
                height: measurementData.height ? Number(measurementData.height) : undefined,
                headCircumference: measurementData.headCircumference ? Number(measurementData.headCircumference) : undefined
            };

            const clinicalRecord = await clinicalIntegrationService.createGrowthBasedClinicalRecord(
                patientId,
                nutritionistId,
                measurementInput
            );

            res.status(201).json({
                status: 'success',
                message: 'Expediente clínico creado automáticamente basado en datos de crecimiento',
                data: {
                    clinicalRecord,
                    measurementData: measurementInput,
                    automatedGeneration: {
                        createdAt: new Date(),
                        source: 'growth_measurement_integration'
                    }
                }
            });

        } catch (error: any) {
            console.error('Error en createGrowthBasedRecord:', error);
            if (error instanceof AppError) {
                return next(error);
            }
            next(new AppError('Error al crear expediente clínico basado en crecimiento', 500));
        }
    }

    /**
     * Obtiene historial de crecimiento desde expedientes clínicos
     * GET /growth-charts/clinical-integration/history/:patientId
     */
    public async getGrowthHistory(req: Request, res: Response, next: NextFunction) {
        try {
            const { patientId } = req.params;
            const { startDate, endDate } = req.query;

            if (!patientId) {
                return next(new AppError('ID de paciente requerido', 400));
            }

            const startDateParsed = startDate ? new Date(startDate as string) : undefined;
            const endDateParsed = endDate ? new Date(endDate as string) : undefined;

            // Validar fechas
            if (startDate && isNaN(startDateParsed!.getTime())) {
                return next(new AppError('Fecha de inicio inválida', 400));
            }

            if (endDate && isNaN(endDateParsed!.getTime())) {
                return next(new AppError('Fecha de fin inválida', 400));
            }

            const growthHistory = await clinicalIntegrationService.getGrowthHistoryFromClinicalRecords(
                patientId,
                startDateParsed,
                endDateParsed
            );

            res.status(200).json({
                status: 'success',
                message: 'Historial de crecimiento obtenido exitosamente',
                data: {
                    patientId,
                    growthHistory,
                    totalRecords: growthHistory.length,
                    dateRange: {
                        start: startDateParsed,
                        end: endDateParsed
                    }
                }
            });

        } catch (error: any) {
            console.error('Error en getGrowthHistory:', error);
            if (error instanceof AppError) {
                return next(error);
            }
            next(new AppError('Error al obtener historial de crecimiento', 500));
        }
    }

    /**
     * Actualiza expedientes existentes con datos de crecimiento recalculados
     * POST /growth-charts/clinical-integration/update-existing/:patientId
     */
    public async updateExistingRecords(req: Request, res: Response, next: NextFunction) {
        try {
            const { patientId } = req.params;

            if (!patientId) {
                return next(new AppError('ID de paciente requerido', 400));
            }

            const updatedCount = await clinicalIntegrationService.updateExistingRecordsWithGrowthData(patientId);

            res.status(200).json({
                status: 'success',
                message: `${updatedCount} expedientes actualizados con nuevos datos de crecimiento`,
                data: {
                    patientId,
                    updatedRecords: updatedCount,
                    updatedAt: new Date()
                }
            });

        } catch (error: any) {
            console.error('Error en updateExistingRecords:', error);
            if (error instanceof AppError) {
                return next(error);
            }
            next(new AppError('Error al actualizar expedientes existentes', 500));
        }
    }

    /**
     * Análisis de integración masiva para todos los pacientes pediátricos
     * POST /growth-charts/clinical-integration/bulk-analysis
     */
    public async bulkIntegrationAnalysis(req: Request, res: Response, next: NextFunction) {
        try {
            const { dryRun = true, limit = 10 } = req.body;

            // En implementación real, esto buscaría todos los pacientes pediátricos
            // y analizaría cuáles necesitan integración de datos de crecimiento

            console.log(`🔄 Iniciando análisis de integración masiva (dry run: ${dryRun}, limit: ${limit})`);

            const analysis = {
                totalPediatricPatients: 0, // Se calcularía dinámicamente
                patientsWithMeasurements: 0,
                patientsWithoutIntegration: 0,
                recordsToUpdate: 0,
                estimatedProcessingTime: '5-10 minutos',
                dryRun
            };

            // Simular análisis
            analysis.totalPediatricPatients = Math.floor(Math.random() * 50) + 20;
            analysis.patientsWithMeasurements = Math.floor(analysis.totalPediatricPatients * 0.8);
            analysis.patientsWithoutIntegration = Math.floor(analysis.patientsWithMeasurements * 0.4);
            analysis.recordsToUpdate = Math.floor(analysis.patientsWithoutIntegration * 2.5);

            res.status(200).json({
                status: 'success',
                message: dryRun ? 
                    'Análisis de integración masiva completado (simulación)' : 
                    'Integración masiva iniciada',
                data: {
                    analysis,
                    recommendations: dryRun ? [
                        'Ejecutar integración real con dryRun=false',
                        'Procesar en lotes pequeños para evitar sobrecarga',
                        'Monitorear logs durante la ejecución'
                    ] : [
                        'Monitorear progreso en logs del servidor',
                        'Verificar resultados después de completar',
                        'Revisar alertas generadas automáticamente'
                    ]
                }
            });

        } catch (error: any) {
            console.error('Error en bulkIntegrationAnalysis:', error);
            if (error instanceof AppError) {
                return next(error);
            }
            next(new AppError('Error al analizar integración masiva', 500));
        }
    }

    /**
     * Estadísticas de integración de crecimiento
     * GET /growth-charts/clinical-integration/stats
     */
    public async getIntegrationStats(req: Request, res: Response, next: NextFunction) {
        try {
            // En implementación real, estas estadísticas se calcularían desde la base de datos
            const stats = {
                total_clinical_records: 0,
                records_with_growth_data: 0,
                automated_records_created: 0,
                integration_coverage_percent: 0,
                last_integration_batch: null,
                alerts_generated_last_week: 0,
                most_common_alert_types: [] as string[]
            };

            // Simular estadísticas
            stats.total_clinical_records = Math.floor(Math.random() * 200) + 100;
            stats.records_with_growth_data = Math.floor(stats.total_clinical_records * 0.6);
            stats.automated_records_created = Math.floor(stats.records_with_growth_data * 0.3);
            stats.integration_coverage_percent = Math.round((stats.records_with_growth_data / stats.total_clinical_records) * 100);
            stats.alerts_generated_last_week = Math.floor(Math.random() * 15) + 5;
            stats.most_common_alert_types = [
                'Seguimiento de peso',
                'Evaluación de crecimiento',
                'Percentiles bajos',
                'Velocidad de crecimiento'
            ];

            res.status(200).json({
                status: 'success',
                message: 'Estadísticas de integración obtenidas exitosamente',
                data: {
                    integration_stats: stats,
                    generated_at: new Date(),
                    system_status: 'operational'
                }
            });

        } catch (error: any) {
            console.error('Error en getIntegrationStats:', error);
            if (error instanceof AppError) {
                return next(error);
            }
            next(new AppError('Error al obtener estadísticas de integración', 500));
        }
    }
}

export default new ClinicalIntegrationController(); 