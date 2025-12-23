import { Request, Response, NextFunction } from 'express';
import growthAlertsService from './growth_alerts.service';
import { AppError } from '../../utils/app.error';
import { GrowthAlertType, AlertSeverity, AlertStatus } from '../../database/entities/growth_alert.entity';
import { Gender } from '../../database/entities/growth_reference.entity';

class GrowthAlertsController {
    /**
     * Evalúa una nueva medición y genera alertas automáticas
     * POST /growth-alerts/evaluate-measurement
     */
    public async evaluateMeasurement(req: Request, res: Response, next: NextFunction) {
        try {
            const {
                patientId,
                date,
                ageMonths,
                weight,
                height,
                headCircumference,
                gender
            } = req.body;

            // Validar entrada
            if (!patientId || !date || !ageMonths || !gender) {
                return next(new AppError('Faltan campos requeridos: patientId, date, ageMonths, gender', 400));
            }

            if (!Object.values(Gender).includes(gender)) {
                return next(new AppError('Género inválido', 400));
            }

            // Evaluar medición y generar alertas
            const alerts = await growthAlertsService.evaluateGrowthMeasurement({
                patientId,
                date: new Date(date),
                ageMonths: Number(ageMonths),
                weight: weight ? Number(weight) : undefined,
                height: height ? Number(height) : undefined,
                headCircumference: headCircumference ? Number(headCircumference) : undefined,
                gender
            });

            res.status(200).json({
                status: 'success',
                message: 'Evaluación de crecimiento completada',
                data: {
                    alertsGenerated: alerts.length,
                    alerts: alerts.map(alert => ({
                        id: alert.id,
                        type: alert.alert_type,
                        severity: alert.severity,
                        title: alert.title,
                        description: alert.description,
                        executiveSummary: alert.getExecutiveSummary(),
                        requiresImmediateAction: alert.requiresImmediateAction(),
                        recommendations: alert.recommendations,
                        created_at: alert.created_at
                    }))
                }
            });

        } catch (error: any) {
            console.error('Error en evaluateMeasurement:', error);
            if (error instanceof AppError) {
                return next(error);
            }
            next(new AppError('Error al evaluar medición de crecimiento', 500));
        }
    }

    /**
     * Obtiene alertas activas para un paciente
     * GET /growth-alerts/patient/:patientId
     */
    public async getPatientAlerts(req: Request, res: Response, next: NextFunction) {
        try {
            const { patientId } = req.params;

            if (!patientId) {
                return next(new AppError('ID de paciente requerido', 400));
            }

            const alerts = await growthAlertsService.getActiveAlertsForPatient(patientId);

            // Agrupar alertas por severidad
            const alertsBySeverity = {
                critical: alerts.filter(a => a.severity === AlertSeverity.CRITICAL),
                high: alerts.filter(a => a.severity === AlertSeverity.HIGH),
                medium: alerts.filter(a => a.severity === AlertSeverity.MEDIUM),
                low: alerts.filter(a => a.severity === AlertSeverity.LOW)
            };

            res.status(200).json({
                status: 'success',
                message: 'Alertas del paciente obtenidas exitosamente',
                data: {
                    totalAlerts: alerts.length,
                    requiresImmediateAttention: alerts.filter(a => a.requiresImmediateAction()).length,
                    alertsBySeverity,
                    alerts: alerts.map(alert => ({
                        id: alert.id,
                        type: alert.alert_type,
                        severity: alert.severity,
                        status: alert.status,
                        title: alert.title,
                        description: alert.description,
                        icon: alert.getAlertIcon(),
                        color: alert.getSeverityColor(),
                        executiveSummary: alert.getExecutiveSummary(),
                        requiresImmediateAction: alert.requiresImmediateAction(),
                        recommendations: alert.recommendations,
                        created_at: alert.created_at,
                        acknowledged_at: alert.acknowledged_at,
                        alert_data: alert.alert_data
                    }))
                }
            });

        } catch (error: any) {
            console.error('Error en getPatientAlerts:', error);
            if (error instanceof AppError) {
                return next(error);
            }
            next(new AppError('Error al obtener alertas del paciente', 500));
        }
    }

    /**
     * Obtiene alertas activas para un nutriólogo
     * GET /growth-alerts/nutritionist/:nutritionistId
     */
    public async getNutritionistAlerts(req: Request, res: Response, next: NextFunction) {
        try {
            const { nutritionistId } = req.params;
            const { page = '1', limit = '20', severity, alertType } = req.query;

            if (!nutritionistId) {
                return next(new AppError('ID de nutriólogo requerido', 400));
            }

            let alerts = await growthAlertsService.getActiveAlertsForNutritionist(nutritionistId);

            // Filtros opcionales
            if (severity && Object.values(AlertSeverity).includes(severity as AlertSeverity)) {
                alerts = alerts.filter(a => a.severity === severity);
            }

            if (alertType && Object.values(GrowthAlertType).includes(alertType as GrowthAlertType)) {
                alerts = alerts.filter(a => a.alert_type === alertType);
            }

            // Paginación
            const pageNum = Math.max(1, parseInt(page as string));
            const limitNum = Math.max(1, Math.min(100, parseInt(limit as string)));
            const startIndex = (pageNum - 1) * limitNum;
            const endIndex = startIndex + limitNum;
            const paginatedAlerts = alerts.slice(startIndex, endIndex);

            // Estadísticas rápidas
            const stats = {
                total: alerts.length,
                critical: alerts.filter(a => a.severity === AlertSeverity.CRITICAL).length,
                requiresImmediateAction: alerts.filter(a => a.requiresImmediateAction()).length,
                byType: this.getAlertTypeStats(alerts)
            };

            res.status(200).json({
                status: 'success',
                message: 'Alertas del nutriólogo obtenidas exitosamente',
                data: {
                    stats,
                    pagination: {
                        currentPage: pageNum,
                        totalPages: Math.ceil(alerts.length / limitNum),
                        totalItems: alerts.length,
                        itemsPerPage: limitNum
                    },
                    alerts: paginatedAlerts.map(alert => ({
                        id: alert.id,
                        patient: {
                            id: alert.patient.id,
                            name: `${alert.patient.first_name} ${alert.patient.last_name}`,
                            age: alert.patient.age
                        },
                        type: alert.alert_type,
                        severity: alert.severity,
                        status: alert.status,
                        title: alert.title,
                        description: alert.description,
                        icon: alert.getAlertIcon(),
                        color: alert.getSeverityColor(),
                        executiveSummary: alert.getExecutiveSummary(),
                        requiresImmediateAction: alert.requiresImmediateAction(),
                        created_at: alert.created_at,
                        acknowledged_at: alert.acknowledged_at,
                        alert_data: {
                            // Solo incluir datos esenciales para la lista
                            current_measurement: alert.alert_data.current_measurement,
                            percentiles: alert.alert_data.percentiles
                        }
                    }))
                }
            });

        } catch (error: any) {
            console.error('Error en getNutritionistAlerts:', error);
            if (error instanceof AppError) {
                return next(error);
            }
            next(new AppError('Error al obtener alertas del nutriólogo', 500));
        }
    }

    /**
     * Reconoce una alerta
     * PUT /growth-alerts/:alertId/acknowledge
     */
    public async acknowledgeAlert(req: Request, res: Response, next: NextFunction) {
        try {
            const { alertId } = req.params;
            const { acknowledgedById } = req.body;

            if (!alertId || !acknowledgedById) {
                return next(new AppError('ID de alerta y usuario requeridos', 400));
            }

            const alert = await growthAlertsService.acknowledgeAlert(alertId, acknowledgedById);

            res.status(200).json({
                status: 'success',
                message: 'Alerta reconocida exitosamente',
                data: {
                    id: alert.id,
                    status: alert.status,
                    acknowledged_at: alert.acknowledged_at,
                    acknowledged_by_id: alert.acknowledged_by_id
                }
            });

        } catch (error: any) {
            console.error('Error en acknowledgeAlert:', error);
            if (error instanceof AppError) {
                return next(error);
            }
            next(new AppError('Error al reconocer alerta', 500));
        }
    }

    /**
     * Resuelve una alerta
     * PUT /growth-alerts/:alertId/resolve
     */
    public async resolveAlert(req: Request, res: Response, next: NextFunction) {
        try {
            const { alertId } = req.params;
            const { resolvedById, resolutionNotes } = req.body;

            if (!alertId || !resolvedById) {
                return next(new AppError('ID de alerta y usuario requeridos', 400));
            }

            const alert = await growthAlertsService.resolveAlert(alertId, resolvedById, resolutionNotes);

            res.status(200).json({
                status: 'success',
                message: 'Alerta resuelta exitosamente',
                data: {
                    id: alert.id,
                    status: alert.status,
                    resolved_at: alert.resolved_at,
                    resolved_by_id: alert.resolved_by_id,
                    resolution_notes: alert.resolution_notes
                }
            });

        } catch (error: any) {
            console.error('Error en resolveAlert:', error);
            if (error instanceof AppError) {
                return next(error);
            }
            next(new AppError('Error al resolver alerta', 500));
        }
    }

    /**
     * Obtiene detalle completo de una alerta
     * GET /growth-alerts/:alertId
     */
    public async getAlertDetail(req: Request, res: Response, next: NextFunction) {
        try {
            const { alertId } = req.params;

            if (!alertId) {
                return next(new AppError('ID de alerta requerido', 400));
            }

            const alert = await growthAlertsService['growthAlertRepository'].findOne({
                where: { id: alertId },
                relations: ['patient', 'nutritionist']
            });

            if (!alert) {
                return next(new AppError('Alerta no encontrada', 404));
            }

            res.status(200).json({
                status: 'success',
                message: 'Detalle de alerta obtenido exitosamente',
                data: {
                    id: alert.id,
                    patient: alert.patient ? {
                        id: alert.patient.id,
                        name: `${alert.patient.first_name} ${alert.patient.last_name}`,
                        email: alert.patient.email,
                        age: alert.patient.age,
                        gender: alert.patient.gender
                    } : null,
                    nutritionist: alert.nutritionist ? {
                        id: alert.nutritionist.id,
                        name: `${alert.nutritionist.first_name} ${alert.nutritionist.last_name}`,
                        email: alert.nutritionist.email
                    } : null,
                    type: alert.alert_type,
                    severity: alert.severity,
                    status: alert.status,
                    title: alert.title,
                    description: alert.description,
                    clinical_interpretation: alert.clinical_interpretation,
                    icon: alert.getAlertIcon(),
                    color: alert.getSeverityColor(),
                    executiveSummary: alert.getExecutiveSummary(),
                    requiresImmediateAction: alert.requiresImmediateAction(),
                    recommendations: alert.recommendations,
                    alert_data: alert.alert_data,
                    is_automated: alert.is_automated,
                    trigger_source: alert.trigger_source,
                    created_at: alert.created_at,
                    updated_at: alert.updated_at,
                    acknowledged_at: alert.acknowledged_at,
                    acknowledged_by_id: alert.acknowledged_by_id,
                    resolved_at: alert.resolved_at,
                    resolved_by_id: alert.resolved_by_id,
                    resolution_notes: alert.resolution_notes,
                    notifications_sent: alert.notifications_sent
                }
            });

        } catch (error: any) {
            console.error('Error en getAlertDetail:', error);
            if (error instanceof AppError) {
                return next(error);
            }
            next(new AppError('Error al obtener detalle de alerta', 500));
        }
    }

    /**
     * Obtiene estadísticas de alertas
     * GET /growth-alerts/statistics/:nutritionistId?
     */
    public async getStatistics(req: Request, res: Response, next: NextFunction) {
        try {
            const { nutritionistId } = req.params;

            const stats = await growthAlertsService.getAlertStatistics(nutritionistId);

            // Estadísticas adicionales por tipo
            const alertsByType = await this.getDetailedAlertStats(nutritionistId);

            res.status(200).json({
                status: 'success',
                message: 'Estadísticas de alertas obtenidas exitosamente',
                data: {
                    overview: stats,
                    byType: alertsByType,
                    generatedAt: new Date()
                }
            });

        } catch (error: any) {
            console.error('Error en getStatistics:', error);
            if (error instanceof AppError) {
                return next(error);
            }
            next(new AppError('Error al obtener estadísticas de alertas', 500));
        }
    }

    /**
     * Genera estadísticas por tipo de alerta
     */
    private getAlertTypeStats(alerts: any[]): any {
        const stats: any = {};
        
        Object.values(GrowthAlertType).forEach(type => {
            stats[type] = alerts.filter(a => a.alert_type === type).length;
        });

        return stats;
    }

    /**
     * Obtiene estadísticas detalladas por tipo de alerta
     */
    private async getDetailedAlertStats(nutritionistId?: string): Promise<any> {
        const repository = growthAlertsService['growthAlertRepository'];
        
        const queryBuilder = repository.createQueryBuilder('alert')
            .select(['alert.alert_type', 'alert.severity', 'COUNT(*) as count'])
            .groupBy('alert.alert_type, alert.severity');

        if (nutritionistId) {
            queryBuilder.where('alert.nutritionist_id = :nutritionistId', { nutritionistId });
        }

        const results = await queryBuilder.getRawMany();

        const stats: any = {};
        
        results.forEach(result => {
            const type = result.alert_alert_type;
            const severity = result.alert_severity;
            const count = parseInt(result.count);

            if (!stats[type]) {
                stats[type] = {
                    total: 0,
                    bySeverity: {}
                };
            }

            stats[type].total += count;
            stats[type].bySeverity[severity] = count;
        });

        return stats;
    }

    /**
     * Obtiene resumen de alertas para dashboard
     * GET /growth-alerts/dashboard-summary/:nutritionistId?
     */
    public async getDashboardSummary(req: Request, res: Response, next: NextFunction) {
        try {
            const { nutritionistId } = req.params;

            const alerts = nutritionistId ? 
                await growthAlertsService.getActiveAlertsForNutritionist(nutritionistId) :
                await growthAlertsService['growthAlertRepository'].find({
                    where: { status: AlertStatus.ACTIVE },
                    relations: ['patient'],
                    order: { created_at: 'DESC' },
                    take: 50
                });

            const summary = {
                totalActive: alerts.length,
                critical: alerts.filter(a => a.severity === AlertSeverity.CRITICAL).length,
                requiresImmediateAction: alerts.filter(a => a.requiresImmediateAction()).length,
                mostCommonTypes: this.getMostCommonAlertTypes(alerts),
                recentAlerts: alerts.slice(0, 5).map(alert => ({
                    id: alert.id,
                    patient_name: alert.patient ? `${alert.patient.first_name} ${alert.patient.last_name}` : 'N/A',
                    type: alert.alert_type,
                    severity: alert.severity,
                    title: alert.title,
                    executiveSummary: alert.getExecutiveSummary(),
                    created_at: alert.created_at
                }))
            };

            res.status(200).json({
                status: 'success',
                message: 'Resumen de dashboard obtenido exitosamente',
                data: summary
            });

        } catch (error: any) {
            console.error('Error en getDashboardSummary:', error);
            if (error instanceof AppError) {
                return next(error);
            }
            next(new AppError('Error al obtener resumen de dashboard', 500));
        }
    }

    /**
     * Obtiene los tipos de alerta más comunes
     */
    private getMostCommonAlertTypes(alerts: any[]): any[] {
        const typeCounts: any = {};
        
        alerts.forEach(alert => {
            typeCounts[alert.alert_type] = (typeCounts[alert.alert_type] || 0) + 1;
        });

        return Object.entries(typeCounts)
            .sort(([,a], [,b]) => (b as number) - (a as number))
            .slice(0, 5)
            .map(([type, count]) => ({ type, count }));
    }
}

export default new GrowthAlertsController(); 