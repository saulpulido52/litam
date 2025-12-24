import PDFDocument from 'pdfkit';

// Tipo para el documento PDF
type PDFDocumentType = any;
import fs from 'fs';
import path from 'path';
import { AppDataSource } from '../../database/data-source';
import { User } from '../../database/entities/user.entity';
import { PatientProfile } from '../../database/entities/patient_profile.entity';
import { PatientProgressLog } from '../../database/entities/patient_progress_log.entity';
import { GrowthAlert } from '../../database/entities/growth_alert.entity';
import growthChartsService from './growth_charts.service';
import growthAlertsService from './growth_alerts.service';
import { GrowthMetricType, Gender } from '../../database/entities/growth_reference.entity';
import { AppError } from '../../utils/app.error';

interface PediatricReportData {
    patient: User;
    patientProfile: PatientProfile;
    progressLogs: PatientProgressLog[];
    growthData: any;
    alerts: GrowthAlert[];
    nutritionist?: User;
}

interface ExportOptions {
    includeGrowthCharts: boolean;
    includeAlerts: boolean;
    includeProgressHistory: boolean;
    includeClinicalData: boolean;
    includeRecommendations: boolean;
    chartSource: 'WHO' | 'CDC';
    ageRangeMonths?: [number, number];
    reportDate?: Date;
}

class PDFExportService {
    private readonly logoPath: string;
    private readonly outputDir: string;

    constructor() {
        this.logoPath = path.join(__dirname, '../../../assets/logo.png');
        this.outputDir = path.join(__dirname, '../../../generated/reports');

        // Crear directorio si no existe
        if (!fs.existsSync(this.outputDir)) {
            fs.mkdirSync(this.outputDir, { recursive: true });
        }
    }

    /**
     * Genera un reporte pediátrico completo en PDF
     */
    async generatePediatricReport(
        patientId: string,
        options: ExportOptions,
        nutritionistId?: string
    ): Promise<string> {
        try {
            // Obtener datos del paciente
            const reportData = await this.gatherReportData(patientId, nutritionistId);

            // Crear documento PDF
            const doc = new PDFDocument({
                size: 'A4',
                margins: { top: 50, bottom: 50, left: 50, right: 50 },
                info: {
                    Title: `Reporte Pediátrico - ${reportData.patient.first_name} ${reportData.patient.last_name}`,
                    Author: reportData.nutritionist ?
                        `${reportData.nutritionist.first_name} ${reportData.nutritionist.last_name}` :
                        'Sistema Nutri',
                    Subject: 'Reporte de Crecimiento Pediátrico',
                    Keywords: 'pediatría, crecimiento, nutrición, OMS, CDC',
                    Creator: 'Sistema Nutri - Plataforma de Nutrición',
                    Producer: 'PDFKit'
                }
            });

            // Generar nombre de archivo único
            const fileName = `reporte_pediatrico_${patientId}_${Date.now()}.pdf`;
            const filePath = path.join(this.outputDir, fileName);

            // Stream hacia archivo
            const stream = fs.createWriteStream(filePath);
            doc.pipe(stream);

            // Generar contenido del reporte
            await this.generateReportContent(doc, reportData, options);

            // Finalizar documento
            doc.end();

            // Esperar a que termine la escritura
            return new Promise((resolve, reject) => {
                stream.on('finish', () => resolve(filePath));
                stream.on('error', reject);
            });

        } catch (error: any) {
            console.error('Error generando reporte PDF:', error);
            throw new AppError('Error al generar reporte PDF', 500);
        }
    }

    /**
     * Genera un reporte simple de curvas de crecimiento
     */
    async generateGrowthChartsReport(
        patientId: string,
        metricTypes: GrowthMetricType[],
        source: 'WHO' | 'CDC' = 'WHO',
        ageRangeMonths?: [number, number]
    ): Promise<string> {
        try {
            const reportData = await this.gatherReportData(patientId);

            const doc = new PDFDocument({
                size: 'A4',
                layout: 'landscape', // Mejor para gráficos
                margins: { top: 40, bottom: 40, left: 40, right: 40 }
            });

            const fileName = `curvas_crecimiento_${patientId}_${Date.now()}.pdf`;
            const filePath = path.join(this.outputDir, fileName);

            const stream = fs.createWriteStream(filePath);
            doc.pipe(stream);

            // Generar contenido de curvas
            await this.generateChartsOnlyContent(doc, reportData, metricTypes, source, ageRangeMonths);

            doc.end();

            return new Promise((resolve, reject) => {
                stream.on('finish', () => resolve(filePath));
                stream.on('error', reject);
            });

        } catch (error: any) {
            console.error('Error generando reporte de curvas:', error);
            throw new AppError('Error al generar reporte de curvas', 500);
        }
    }

    /**
     * Reúne todos los datos necesarios para el reporte
     */
    private async gatherReportData(patientId: string, nutritionistId?: string): Promise<PediatricReportData> {
        const userRepository = AppDataSource.getRepository(User);
        const profileRepository = AppDataSource.getRepository(PatientProfile);
        const progressRepository = AppDataSource.getRepository(PatientProgressLog);

        // Obtener paciente
        const patient = await userRepository.findOne({
            where: { id: patientId },
            relations: ['role']
        });

        if (!patient) {
            throw new AppError('Paciente no encontrado', 404);
        }

        // Obtener perfil del paciente
        const patientProfile = await profileRepository.findOne({
            where: { user: { id: patientId } },
            relations: ['user']
        });

        if (!patientProfile) {
            throw new AppError('Perfil del paciente no encontrado', 404);
        }

        // Obtener nutriólogo si se especifica
        let nutritionist: User | undefined;
        if (nutritionistId) {
            const foundNutritionist = await userRepository.findOne({
                where: { id: nutritionistId }
            });
            if (foundNutritionist) {
                nutritionist = foundNutritionist;
            }
        }

        // Obtener historial de progreso
        const progressLogs = await progressRepository.find({
            where: { patient: { id: patientId } },
            order: { date: 'ASC' },
            take: 50 // Últimas 50 mediciones
        });

        // Obtener datos de crecimiento calculados
        const growthData = await this.calculateGrowthDataForReport(patient, progressLogs);

        // Obtener alertas activas
        const alerts = await growthAlertsService.getActiveAlertsForPatient(patientId);

        return {
            patient,
            patientProfile,
            progressLogs,
            growthData,
            alerts,
            nutritionist
        };
    }

    /**
     * Calcula datos de crecimiento para el reporte
     */
    private async calculateGrowthDataForReport(patient: User, progressLogs: PatientProgressLog[]): Promise<any> {
        const growthData: any = {
            currentMetrics: null,
            historicalPercentiles: [],
            trendAnalysis: null
        };

        if (progressLogs.length === 0) {
            return growthData;
        }

        // Obtener medición más reciente
        const latestLog = progressLogs[progressLogs.length - 1];

        if (latestLog.weight && patient.age && patient.gender) {
            const ageMonths = patient.age * 12; // Conversión aproximada

            // Calcular métricas actuales
            const height = 150; // Valor por defecto - en implementación real vendría del log
            growthData.currentMetrics = await growthChartsService.calculateMultipleMetrics(
                ageMonths,
                latestLog.weight,
                height,
                patient.gender as Gender
            );

            // Calcular percentiles históricos (simplificado)
            for (const log of progressLogs.slice(-10)) { // Últimas 10 mediciones
                if (log.weight) {
                    try {
                        const result = await growthChartsService.calculateGrowthPercentile({
                            ageMonths: ageMonths - (progressLogs.length - progressLogs.indexOf(log)),
                            value: log.weight,
                            gender: patient.gender as Gender,
                            metricType: GrowthMetricType.WEIGHT_FOR_AGE
                        });

                        growthData.historicalPercentiles.push({
                            date: log.date,
                            percentile: result.percentile,
                            zScore: result.zScore
                        });
                    } catch (error) {
                        console.warn('Error calculando percentil histórico:', error);
                    }
                }
            }
        }

        return growthData;
    }

    /**
     * Genera el contenido completo del reporte pediátrico
     */
    private async generateReportContent(
        doc: any,
        data: PediatricReportData,
        options: ExportOptions
    ): Promise<void> {
        let currentY = 50;

        // Encabezado
        currentY = this.addHeader(doc, currentY);

        // Información del paciente
        currentY = this.addPatientInfo(doc, data, currentY);

        // Datos actuales de crecimiento
        if (data.growthData.currentMetrics) {
            currentY = this.addCurrentGrowthData(doc, data.growthData.currentMetrics, currentY);
        }

        // Alertas activas
        if (options.includeAlerts && data.alerts.length > 0) {
            currentY = this.addAlertsSection(doc, data.alerts, currentY);
        }

        // Historial de progreso
        if (options.includeProgressHistory && data.progressLogs.length > 0) {
            currentY = this.addProgressHistory(doc, data.progressLogs, currentY);
        }

        // Datos clínicos pediátricos
        if (options.includeClinicalData && data.patientProfile.is_pediatric_patient) {
            currentY = this.addPediatricClinicalData(doc, data.patientProfile, currentY);
        }

        // Recomendaciones
        if (options.includeRecommendations) {
            currentY = this.addRecommendations(doc, data, currentY);
        }

        // Pie de página en todas las páginas
        this.addFooter(doc, data);
    }

    /**
     * Genera contenido solo de curvas de crecimiento
     */
    private async generateChartsOnlyContent(
        doc: any,
        data: PediatricReportData,
        metricTypes: GrowthMetricType[],
        source: 'WHO' | 'CDC',
        ageRangeMonths?: [number, number]
    ): Promise<void> {
        let currentY = 40;

        // Encabezado simplificado
        currentY = this.addSimpleHeader(doc, `Curvas de Crecimiento - ${data.patient.first_name} ${data.patient.last_name}`, currentY);

        // Información básica del paciente
        currentY = this.addBasicPatientInfo(doc, data.patient, currentY);

        // Nota sobre las curvas
        doc.fontSize(10)
            .fillColor('#666666')
            .text(`Referencia: ${source === 'WHO' ? 'Organización Mundial de la Salud (OMS)' : 'Centers for Disease Control (CDC)'}`, 50, currentY)
            .text(`Fecha del reporte: ${new Date().toLocaleDateString('es-ES')}`, 50, currentY + 15);

        currentY += 50;

        // Placeholder para gráficos (en implementación real se generarían gráficos SVG o canvas)
        for (const metricType of metricTypes) {
            currentY = this.addChartPlaceholder(doc, metricType, source, currentY);
            currentY += 20;
        }

        this.addFooter(doc, data);
    }

    /**
     * Agrega encabezado principal
     */
    private addHeader(doc: any, y: number): number {
        // Logo (si existe)
        if (fs.existsSync(this.logoPath)) {
            try {
                doc.image(this.logoPath, 50, y, { width: 60 });
            } catch (error) {
                console.warn('No se pudo cargar el logo:', error);
            }
        }

        // Título principal
        doc.fontSize(20)
            .fillColor('#2c3e50')
            .text('REPORTE PEDIÁTRICO DE CRECIMIENTO', 120, y + 10);

        doc.fontSize(12)
            .fillColor('#7f8c8d')
            .text('Sistema de Monitoreo Nutricional Pediátrico', 120, y + 35);

        // Línea separadora
        doc.strokeColor('#3498db')
            .lineWidth(2)
            .moveTo(50, y + 65)
            .lineTo(545, y + 65)
            .stroke();

        return y + 85;
    }

    /**
     * Agrega encabezado simple
     */
    private addSimpleHeader(doc: any, title: string, y: number): number {
        doc.fontSize(16)
            .fillColor('#2c3e50')
            .text(title, 50, y);

        doc.strokeColor('#3498db')
            .lineWidth(1)
            .moveTo(50, y + 25)
            .lineTo(792 - 50, y + 25) // Ancho de página landscape
            .stroke();

        return y + 40;
    }

    /**
     * Agrega información del paciente
     */
    private addPatientInfo(doc: any, data: PediatricReportData, y: number): number {
        const { patient, patientProfile } = data;

        doc.fontSize(14)
            .fillColor('#2c3e50')
            .text('INFORMACIÓN DEL PACIENTE', 50, y);

        y += 25;

        const info = [
            ['Nombre completo:', `${patient.first_name} ${patient.last_name}`],
            ['Fecha de nacimiento:', patient.birth_date ? new Date(patient.birth_date).toLocaleDateString('es-ES') : 'No especificada'],
            ['Edad:', `${patient.age} años`],
            ['Género:', patient.gender === 'male' ? 'Masculino' : 'Femenino'],
            ['Email:', patient.email],
            ['Teléfono:', patient.phone || 'No especificado'],
            ['Tipo de paciente:', patientProfile.is_pediatric_patient ? 'Pediátrico' : 'Adulto']
        ];

        // Información en dos columnas
        const leftColumn = info.slice(0, 4);
        const rightColumn = info.slice(4);

        doc.fontSize(10).fillColor('#333333');

        leftColumn.forEach(([label, value], index) => {
            const lineY = y + (index * 18);
            doc.font('Helvetica-Bold').text(label, 50, lineY);
            doc.font('Helvetica').text(value, 150, lineY);
        });

        rightColumn.forEach(([label, value], index) => {
            const lineY = y + (index * 18);
            doc.font('Helvetica-Bold').text(label, 300, lineY);
            doc.font('Helvetica').text(value, 400, lineY);
        });

        return y + Math.max(leftColumn.length, rightColumn.length) * 18 + 20;
    }

    /**
     * Agrega información básica del paciente (versión simplificada)
     */
    private addBasicPatientInfo(doc: any, patient: User, y: number): number {
        doc.fontSize(12)
            .fillColor('#333333')
            .text(`Paciente: ${patient.first_name} ${patient.last_name}`, 50, y)
            .text(`Edad: ${patient.age} años`, 300, y)
            .text(`Género: ${patient.gender === 'male' ? 'Masculino' : 'Femenino'}`, 450, y);

        return y + 30;
    }

    /**
     * Agrega datos actuales de crecimiento
     */
    private addCurrentGrowthData(doc: any, metrics: any, y: number): number {
        doc.fontSize(14)
            .fillColor('#2c3e50')
            .text('EVALUACIÓN ACTUAL DE CRECIMIENTO', 50, y);

        y += 25;

        if (metrics.weightForAge) {
            doc.fontSize(11)
                .fillColor('#333333')
                .font('Helvetica-Bold')
                .text('Peso para Edad:', 50, y)
                .font('Helvetica')
                .text(`P${metrics.weightForAge.percentile.toFixed(1)} (Z: ${metrics.weightForAge.zScore.toFixed(2)})`, 150, y)
                .text(metrics.weightForAge.interpretation, 300, y);
            y += 18;
        }

        if (metrics.heightForAge) {
            doc.font('Helvetica-Bold')
                .text('Talla para Edad:', 50, y)
                .font('Helvetica')
                .text(`P${metrics.heightForAge.percentile.toFixed(1)} (Z: ${metrics.heightForAge.zScore.toFixed(2)})`, 150, y)
                .text(metrics.heightForAge.interpretation, 300, y);
            y += 18;
        }

        if (metrics.bmiForAge) {
            doc.font('Helvetica-Bold')
                .text('IMC para Edad:', 50, y)
                .font('Helvetica')
                .text(`P${metrics.bmiForAge.percentile.toFixed(1)} (Z: ${metrics.bmiForAge.zScore.toFixed(2)})`, 150, y)
                .text(metrics.bmiForAge.interpretation, 300, y);
            y += 18;
        }

        return y + 20;
    }

    /**
     * Agrega sección de alertas
     */
    private addAlertsSection(doc: any, alerts: GrowthAlert[], y: number): number {
        doc.fontSize(14)
            .fillColor('#e74c3c')
            .text('ALERTAS ACTIVAS', 50, y);

        y += 25;

        if (alerts.length === 0) {
            doc.fontSize(10)
                .fillColor('#27ae60')
                .text('✅ No hay alertas activas', 50, y);
            return y + 30;
        }

        alerts.slice(0, 5).forEach(alert => { // Máximo 5 alertas
            const icon = alert.getAlertIcon();
            const color = alert.getSeverityColor();

            doc.fontSize(10)
                .fillColor(color)
                .text(`${icon} ${alert.title}`, 50, y)
                .fillColor('#333333')
                .text(alert.description.substring(0, 100) + '...', 70, y + 12);

            y += 35;
        });

        return y + 15;
    }

    /**
     * Agrega historial de progreso
     */
    private addProgressHistory(doc: any, progressLogs: PatientProgressLog[], y: number): number {
        doc.fontSize(14)
            .fillColor('#2c3e50')
            .text('HISTORIAL DE PROGRESO (ÚLTIMAS 10 MEDICIONES)', 50, y);

        y += 25;

        // Encabezados de tabla
        doc.fontSize(9)
            .fillColor('#7f8c8d')
            .text('Fecha', 50, y)
            .text('Peso (kg)', 120, y)
            .text('% Grasa', 180, y)
            .text('% Músculo', 240, y)
            .text('Notas', 300, y);

        y += 15;

        // Línea de encabezado
        doc.strokeColor('#bdc3c7')
            .lineWidth(0.5)
            .moveTo(50, y)
            .lineTo(545, y)
            .stroke();

        y += 10;

        // Datos
        progressLogs.slice(-10).forEach(log => {
            doc.fontSize(8)
                .fillColor('#333333')
                .text(new Date(log.date).toLocaleDateString('es-ES'), 50, y)
                .text(log.weight?.toFixed(1) || 'N/A', 120, y)
                .text(log.body_fat_percentage?.toFixed(1) || 'N/A', 180, y)
                .text(log.muscle_mass_percentage?.toFixed(1) || 'N/A', 240, y)
                .text(log.notes?.substring(0, 30) || '', 300, y);

            y += 15;
        });

        return y + 20;
    }

    /**
     * Agrega datos clínicos pediátricos específicos
     */
    private addPediatricClinicalData(doc: any, profile: PatientProfile, y: number): number {
        if (!profile.is_pediatric_patient) return y;

        doc.fontSize(14)
            .fillColor('#2c3e50')
            .text('INFORMACIÓN PEDIÁTRICA ESPECÍFICA', 50, y);

        y += 25;

        // Datos de nacimiento
        if (profile.birth_history) {
            doc.fontSize(11)
                .fillColor('#333333')
                .font('Helvetica-Bold')
                .text('Datos de Nacimiento:', 50, y);

            y += 15;

            if (profile.birth_history.birth_weight_kg) {
                doc.fontSize(9)
                    .font('Helvetica')
                    .text(`• Peso al nacer: ${profile.birth_history.birth_weight_kg} kg`, 60, y);
                y += 12;
            }

            if (profile.birth_history.birth_length_cm) {
                doc.text(`• Talla al nacer: ${profile.birth_history.birth_length_cm} cm`, 60, y);
                y += 12;
            }

            if (profile.birth_history.gestational_age_weeks) {
                doc.text(`• Edad gestacional: ${profile.birth_history.gestational_age_weeks} semanas`, 60, y);
                y += 12;
            }
        }

        // Alimentación
        if (profile.feeding_history) {
            y += 10;
            doc.fontSize(11)
                .font('Helvetica-Bold')
                .text('Historial de Alimentación:', 50, y);

            y += 15;

            if (profile.feeding_history.breastfeeding_duration_months) {
                doc.fontSize(9)
                    .font('Helvetica')
                    .text(`• Lactancia materna: ${profile.feeding_history.breastfeeding_duration_months} meses`, 60, y);
                y += 12;
            }

            if (profile.feeding_history.complementary_feeding_start_months) {
                doc.text(`• Inicio alimentación complementaria: ${profile.feeding_history.complementary_feeding_start_months} meses`, 60, y);
                y += 12;
            }
        }

        return y + 20;
    }

    /**
     * Agrega recomendaciones
     */
    private addRecommendations(doc: any, data: PediatricReportData, y: number): number {
        doc.fontSize(14)
            .fillColor('#27ae60')
            .text('RECOMENDACIONES', 50, y);

        y += 25;

        const recommendations = [
            'Continuar con seguimiento regular del crecimiento',
            'Mantener hábitos alimentarios saludables y balanceados',
            'Asegurar ingesta adecuada de micronutrientes esenciales',
            'Promover actividad física apropiada para la edad',
            'Monitorear tendencias de crecimiento a largo plazo'
        ];

        recommendations.forEach(rec => {
            doc.fontSize(10)
                .fillColor('#333333')
                .text(`• ${rec}`, 60, y);
            y += 15;
        });

        return y + 20;
    }

    /**
     * Agrega placeholder para gráfico
     */
    private addChartPlaceholder(doc: any, metricType: GrowthMetricType, source: string, y: number): number {
        const titles = {
            weight_for_age: 'Peso para Edad',
            height_for_age: 'Talla para Edad',
            bmi_for_age: 'IMC para Edad',
            weight_for_height: 'Peso para Talla',
            head_circumference: 'Perímetro Cefálico'
        };

        const title = titles[metricType] || metricType;

        // Marco del gráfico
        doc.rect(50, y, 692, 200) // Ancho landscape - márgenes
            .stroke('#bdc3c7');

        // Título del gráfico
        doc.fontSize(12)
            .fillColor('#2c3e50')
            .text(`${title} - Referencia ${source}`, 60, y + 10);

        // Placeholder
        doc.fontSize(10)
            .fillColor('#7f8c8d')
            .text('[Gráfico de curvas de crecimiento]', 300, y + 90)
            .text('En desarrollo: integración con librería de gráficos', 300, y + 110);

        return y + 220;
    }

    /**
     * Agrega pie de página
     */
    private addFooter(doc: any, data: PediatricReportData): void {
        const bottomMargin = 50;
        const pageHeight = doc.page.height;
        const footerY = pageHeight - bottomMargin;

        doc.fontSize(8)
            .fillColor('#7f8c8d')
            .text(`Generado el ${new Date().toLocaleDateString('es-ES')} a las ${new Date().toLocaleTimeString('es-ES')}`, 50, footerY)
            .text('Sistema Nutri - Plataforma de Nutrición Pediátrica', 50, footerY + 12);

        if (data.nutritionist) {
            doc.text(`Nutriólogo: ${data.nutritionist.first_name} ${data.nutritionist.last_name}`, 50, footerY + 24);
        }

        // Número de página
        const pageNumber = doc.bufferedPageRange().start + doc.bufferedPageRange().count;
        doc.text(`Página ${pageNumber}`, 500, footerY);
    }

    /**
     * Obtiene la URL del archivo generado
     */
    getFileUrl(filePath: string): string {
        const fileName = path.basename(filePath);
        return `/growth-charts/export/download/${fileName}`;
    }

    /**
     * Limpia archivos antiguos (más de 24 horas)
     */
    async cleanupOldFiles(): Promise<void> {
        try {
            const files = fs.readdirSync(this.outputDir);
            const now = Date.now();
            const maxAge = 24 * 60 * 60 * 1000; // 24 horas

            files.forEach(file => {
                const filePath = path.join(this.outputDir, file);
                const stats = fs.statSync(filePath);

                if (now - stats.mtime.getTime() > maxAge) {
                    fs.unlinkSync(filePath);
                    console.log(`Archivo limpiado: ${file}`);
                }
            });
        } catch (error) {
            console.error('Error limpiando archivos antiguos:', error);
        }
    }
}

export default new PDFExportService(); 
