import { Repository } from 'typeorm';
import { AppDataSource } from '../../database/data-source';
import { GrowthAlert, AlertSeverity } from '../../database/entities/growth_alert.entity';
import { User } from '../../database/entities/user.entity';
import { PatientNutritionistRelation, RelationshipStatus } from '../../database/entities/patient_nutritionist_relation.entity';
import { AppError } from '../../utils/app.error';

interface NotificationData {
    alertId: string;
    patientId: string;
    patientName: string;
    alertTitle: string;
    alertDescription: string;
    severity: AlertSeverity;
    recommendations: any;
    nutritionistIds: string[];
}

interface EmailNotificationConfig {
    enabled: boolean;
    templates: {
        critical: string;
        high: string;
        medium: string;
        low: string;
    };
}

interface SMSNotificationConfig {
    enabled: boolean;
    criticalOnly: boolean;
}

class AutomatedNotificationsService {
    private growthAlertRepository: Repository<GrowthAlert>;
    private userRepository: Repository<User>;
    private relationRepository: Repository<PatientNutritionistRelation>;

    private emailConfig: EmailNotificationConfig = {
        enabled: process.env.EMAIL_NOTIFICATIONS_ENABLED === 'true',
        templates: {
            critical: 'growth_alert_critical',
            high: 'growth_alert_high',
            medium: 'growth_alert_medium',
            low: 'growth_alert_low'
        }
    };

    private smsConfig: SMSNotificationConfig = {
        enabled: process.env.SMS_NOTIFICATIONS_ENABLED === 'true',
        criticalOnly: true
    };

    constructor() {
        this.growthAlertRepository = AppDataSource.getRepository(GrowthAlert);
        this.userRepository = AppDataSource.getRepository(User);
        this.relationRepository = AppDataSource.getRepository(PatientNutritionistRelation);
    }

    /**
     * Procesa notificaciones automáticas para nuevas alertas
     */
    async processGrowthAlertNotifications(alert: GrowthAlert): Promise<void> {
        try {
            console.log(`🔔 Procesando notificaciones para alerta: ${alert.id}`);

            // Obtener datos del paciente
            const patient = await this.userRepository.findOne({
                where: { id: alert.patient_id }
            });

            if (!patient) {
                throw new AppError('Paciente no encontrado para la alerta', 404);
            }

            // Obtener nutriólogos asociados al paciente
            const nutritionistIds = await this.getNutritionistsForPatient(alert.patient_id);

            if (nutritionistIds.length === 0) {
                console.log(`⚠️ No hay nutriólogos asignados al paciente ${alert.patient_id}`);
                return;
            }

            const notificationData: NotificationData = {
                alertId: alert.id,
                patientId: alert.patient_id,
                patientName: `${patient.first_name} ${patient.last_name}`,
                alertTitle: alert.title,
                alertDescription: alert.description,
                severity: alert.severity,
                recommendations: alert.recommendations,
                nutritionistIds
            };

            // Procesar diferentes tipos de notificaciones según la severidad
            await this.processNotificationsBySeverity(notificationData);

            // Marcar alerta como notificada
            await this.markAlertAsNotified(alert.id, notificationData);

            console.log(`✅ Notificaciones procesadas para alerta ${alert.id}`);

        } catch (error: any) {
            console.error('Error procesando notificaciones de alerta:', error);
            throw new AppError('Error al procesar notificaciones automáticas', 500);
        }
    }

    /**
     * Procesa notificaciones según la severidad de la alerta
     */
    private async processNotificationsBySeverity(data: NotificationData): Promise<void> {
        switch (data.severity) {
            case AlertSeverity.CRITICAL:
                await this.sendCriticalNotifications(data);
                break;

            case AlertSeverity.HIGH:
                await this.sendHighPriorityNotifications(data);
                break;

            case AlertSeverity.MEDIUM:
                await this.sendMediumPriorityNotifications(data);
                break;

            case AlertSeverity.LOW:
                await this.sendLowPriorityNotifications(data);
                break;

            default:
                console.log(`⚠️ Severidad de alerta no reconocida: ${data.severity}`);
        }
    }

    /**
     * Envía notificaciones críticas (inmediatas, múltiples canales)
     */
    private async sendCriticalNotifications(data: NotificationData): Promise<void> {
        console.log(`🚨 CRÍTICO: Enviando notificaciones urgentes para ${data.patientName}`);

        // 1. Notificación en app (inmediata)
        await this.sendInAppNotification(data, true); // isUrgent = true

        // 2. Email inmediato
        if (this.emailConfig.enabled) {
            await this.sendEmailNotification(data, this.emailConfig.templates.critical);
        }

        // 3. SMS si está habilitado
        if (this.smsConfig.enabled) {
            await this.sendSMSNotification(data);
        }

        // 4. Notificación al dashboard en tiempo real
        await this.sendDashboardAlert(data);

        // 5. Log de auditoría
        await this.logCriticalAlert(data);
    }

    /**
     * Envía notificaciones de alta prioridad
     */
    private async sendHighPriorityNotifications(data: NotificationData): Promise<void> {
        console.log(`🔴 ALTA: Enviando notificaciones de alta prioridad para ${data.patientName}`);

        // 1. Notificación en app
        await this.sendInAppNotification(data, false);

        // 2. Email
        if (this.emailConfig.enabled) {
            await this.sendEmailNotification(data, this.emailConfig.templates.high);
        }

        // 3. Dashboard
        await this.sendDashboardAlert(data);
    }

    /**
     * Envía notificaciones de prioridad media
     */
    private async sendMediumPriorityNotifications(data: NotificationData): Promise<void> {
        console.log(`🟡 MEDIA: Enviando notificaciones de prioridad media para ${data.patientName}`);

        // 1. Notificación en app
        await this.sendInAppNotification(data, false);

        // 2. Email consolidado (puede agruparse)
        if (this.emailConfig.enabled) {
            await this.scheduleEmailNotification(data, this.emailConfig.templates.medium, 30); // 30 minutos de delay
        }
    }

    /**
     * Envía notificaciones de baja prioridad
     */
    private async sendLowPriorityNotifications(data: NotificationData): Promise<void> {
        console.log(`🟢 BAJA: Enviando notificaciones de baja prioridad para ${data.patientName}`);

        // Solo notificación en app
        await this.sendInAppNotification(data, false);
    }

    /**
     * Envía notificación dentro de la aplicación
     */
    private async sendInAppNotification(data: NotificationData, isUrgent: boolean): Promise<void> {
        try {
            for (const nutritionistId of data.nutritionistIds) {
                // Crear notificación en base de datos (si existe tabla de notificaciones)
                const notificationPayload = {
                    user_id: nutritionistId,
                    type: 'growth_alert',
                    title: `🚨 ${data.alertTitle}`,
                    message: `Paciente: ${data.patientName}\n${data.alertDescription}`,
                    data: {
                        alertId: data.alertId,
                        patientId: data.patientId,
                        severity: data.severity,
                        isUrgent,
                        recommendations: data.recommendations
                    },
                    is_urgent: isUrgent,
                    created_at: new Date()
                };

                // Aquí se guardaría en tabla de notificaciones
                console.log(`📱 Notificación in-app creada para nutriólogo ${nutritionistId}:`, notificationPayload.title);

                // Si hay WebSocket/Socket.IO implementado, enviar notificación en tiempo real
                await this.sendRealTimeNotification(nutritionistId, notificationPayload);
            }
        } catch (error) {
            console.error('Error enviando notificación in-app:', error);
        }
    }

    /**
     * Envía notificación por email
     */
    private async sendEmailNotification(data: NotificationData, template: string): Promise<void> {
        try {
            for (const nutritionistId of data.nutritionistIds) {
                const nutritionist = await this.userRepository.findOne({
                    where: { id: nutritionistId }
                });

                if (nutritionist?.email) {
                    const emailData = {
                        to: nutritionist.email,
                        template: template,
                        data: {
                            nutritionistName: `${nutritionist.first_name} ${nutritionist.last_name}`,
                            patientName: data.patientName,
                            alertTitle: data.alertTitle,
                            alertDescription: data.alertDescription,
                            severity: data.severity,
                            recommendations: data.recommendations,
                            dashboardUrl: `${process.env.FRONTEND_URL}/patients/${data.patientId}/growth`,
                            timestamp: new Date().toLocaleString('es-ES')
                        }
                    };

                    // Aquí se enviaría el email (usando servicio de email como SendGrid, Nodemailer, etc.)
                    console.log(`📧 Email programado para ${nutritionist.email}:`, data.alertTitle);
                    
                    // Simular envío
                    await this.simulateEmailSend(emailData);
                }
            }
        } catch (error) {
            console.error('Error enviando email:', error);
        }
    }

    /**
     * Programa email con delay (para notificaciones no urgentes)
     */
    private async scheduleEmailNotification(data: NotificationData, template: string, delayMinutes: number): Promise<void> {
        // En implementación real, esto usaría un sistema de colas como Redis/Bull
        setTimeout(async () => {
            await this.sendEmailNotification(data, template);
        }, delayMinutes * 60 * 1000);

        console.log(`📅 Email programado para envío en ${delayMinutes} minutos`);
    }

    /**
     * Envía SMS para alertas críticas
     */
    private async sendSMSNotification(data: NotificationData): Promise<void> {
        try {
            for (const nutritionistId of data.nutritionistIds) {
                const nutritionist = await this.userRepository.findOne({
                    where: { id: nutritionistId }
                });

                if (nutritionist?.phone) {
                    const smsMessage = `🚨 ALERTA CRÍTICA NutriWeb\n` +
                                     `Paciente: ${data.patientName}\n` +
                                     `${data.alertTitle}\n` +
                                     `Revisar dashboard inmediatamente.`;

                    // Aquí se enviaría SMS (usando Twilio, AWS SNS, etc.)
                    console.log(`📱 SMS enviado a ${nutritionist.phone}:`, smsMessage.substring(0, 50) + '...');
                }
            }
        } catch (error) {
            console.error('Error enviando SMS:', error);
        }
    }

    /**
     * Envía alerta al dashboard en tiempo real
     */
    private async sendDashboardAlert(data: NotificationData): Promise<void> {
        const dashboardAlert = {
            type: 'growth_alert',
            patientId: data.patientId,
            patientName: data.patientName,
            severity: data.severity,
            title: data.alertTitle,
            timestamp: new Date(),
            actionRequired: data.severity === AlertSeverity.CRITICAL
        };

        // Broadcast a todos los nutriólogos conectados
        console.log(`📊 Alerta enviada al dashboard:`, dashboardAlert);
        
        // En implementación real, esto se enviaría via WebSocket
        await this.broadcastToDashboard(dashboardAlert);
    }

    /**
     * Log de auditoría para alertas críticas
     */
    private async logCriticalAlert(data: NotificationData): Promise<void> {
        const auditLog = {
            timestamp: new Date(),
            action: 'critical_growth_alert_generated',
            patient_id: data.patientId,
            alert_id: data.alertId,
            severity: data.severity,
            notifications_sent: {
                in_app: true,
                email: this.emailConfig.enabled,
                sms: this.smsConfig.enabled,
                dashboard: true
            },
            nutritionists_notified: data.nutritionistIds.length
        };

        console.log(`📋 Audit log creado:`, auditLog);
        // Guardar en tabla de audit logs
    }

    /**
     * Obtiene nutriólogos asociados a un paciente
     */
    private async getNutritionistsForPatient(patientId: string): Promise<string[]> {
        const relations = await this.relationRepository.find({
            where: { 
                patient: { id: patientId },
                status: RelationshipStatus.ACTIVE
            },
            relations: ['nutritionist']
        });

        return relations.map(relation => relation.nutritionist.id);
    }

    /**
     * Marca alerta como notificada
     */
    private async markAlertAsNotified(alertId: string, notificationData: NotificationData): Promise<void> {
        await this.growthAlertRepository.update(alertId, {
            notifications_sent: {
                email_sent: this.emailConfig.enabled,
                sms_sent: this.smsConfig.enabled && notificationData.severity === AlertSeverity.CRITICAL,
                push_sent: false, // Implementar cuando haya push notifications
                in_app_sent: true,
                sent_at: new Date(),
                recipients: notificationData.nutritionistIds
            }
        });
    }

    /**
     * Simula envío de email (implementación real usaría servicio externo)
     */
    private async simulateEmailSend(emailData: any): Promise<void> {
        // Simular delay de envío
        await new Promise(resolve => setTimeout(resolve, 100));
        console.log(`✉️ Email simulado enviado a ${emailData.to}`);
    }

    /**
     * Envía notificación en tiempo real (WebSocket)
     */
    private async sendRealTimeNotification(userId: string, notification: any): Promise<void> {
        // En implementación real, esto usaría Socket.IO o WebSockets
        console.log(`🔴 Notificación tiempo real para usuario ${userId}:`, notification.title);
    }

    /**
     * Broadcast al dashboard
     */
    private async broadcastToDashboard(alert: any): Promise<void> {
        // En implementación real, esto usaría WebSocket broadcast
        console.log(`📢 Broadcast al dashboard:`, alert.title);
    }

    /**
     * Procesa alertas en lote (para ejecución programada)
     */
    async processPendingAlerts(): Promise<void> {
        try {
            // Buscar alertas que no tengan notificaciones enviadas
            const allAlerts = await this.growthAlertRepository.find({
                order: {
                    severity: 'DESC',
                    created_at: 'ASC'
                },
                take: 50 // Procesar máximo 50 a la vez
            });

            // Filtrar alertas sin notificaciones
            const pendingAlerts = allAlerts.filter(alert => !alert.notifications_sent);

            console.log(`🔄 Procesando ${pendingAlerts.length} alertas pendientes`);

            for (const alert of pendingAlerts) {
                await this.processGrowthAlertNotifications(alert);
                
                // Pequeño delay para evitar saturar servicios externos
                await new Promise(resolve => setTimeout(resolve, 200));
            }

            console.log(`✅ Procesamiento de alertas pendientes completado`);

        } catch (error) {
            console.error('Error procesando alertas pendientes:', error);
        }
    }

    /**
     * Configuración de notificaciones por usuario
     */
    async updateUserNotificationPreferences(
        userId: string, 
        preferences: {
            emailEnabled?: boolean;
            smsEnabled?: boolean;
            inAppEnabled?: boolean;
            severityFilter?: AlertSeverity[];
        }
    ): Promise<void> {
        // Guardar preferencias en base de datos
        console.log(`⚙️ Actualizando preferencias de notificación para usuario ${userId}:`, preferences);
    }
}

export default new AutomatedNotificationsService(); 