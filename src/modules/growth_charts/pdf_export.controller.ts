import { Request, Response, NextFunction } from 'express';
import path from 'path';
import fs from 'fs';
import pdfExportService from './pdf_export.service';
import { AppError } from '../../utils/app.error';
import { GrowthMetricType } from '../../database/entities/growth_reference.entity';

class PDFExportController {
    /**
     * Genera un reporte pediátrico completo en PDF
     * POST /growth-charts/export/pediatric-report
     */
    public async generatePediatricReport(req: Request, res: Response, next: NextFunction) {
        try {
            const {
                patientId,
                nutritionistId,
                includeGrowthCharts = true,
                includeAlerts = true,
                includeProgressHistory = true,
                includeClinicalData = true,
                includeRecommendations = true,
                chartSource = 'WHO',
                ageRangeMonths
            } = req.body;

            // Validar entrada
            if (!patientId) {
                return next(new AppError('ID de paciente requerido', 400));
            }

            if (chartSource && !['WHO', 'CDC'].includes(chartSource)) {
                return next(new AppError('Fuente de curvas debe ser WHO o CDC', 400));
            }

            // Preparar opciones de exportación
            const options = {
                includeGrowthCharts: Boolean(includeGrowthCharts),
                includeAlerts: Boolean(includeAlerts),
                includeProgressHistory: Boolean(includeProgressHistory),
                includeClinicalData: Boolean(includeClinicalData),
                includeRecommendations: Boolean(includeRecommendations),
                chartSource: chartSource as 'WHO' | 'CDC',
                ageRangeMonths: ageRangeMonths ? 
                    [Number(ageRangeMonths[0]), Number(ageRangeMonths[1])] as [number, number] : 
                    undefined,
                reportDate: new Date()
            };

            // Generar reporte
            const filePath = await pdfExportService.generatePediatricReport(
                patientId,
                options,
                nutritionistId
            );

            // Obtener información del archivo
            const fileName = path.basename(filePath);
            const fileStats = fs.statSync(filePath);

            res.status(200).json({
                status: 'success',
                message: 'Reporte pediátrico generado exitosamente',
                data: {
                    fileName,
                    filePath: filePath,
                    downloadUrl: pdfExportService.getFileUrl(filePath),
                    fileSize: fileStats.size,
                    generatedAt: new Date(),
                    options: options
                }
            });

        } catch (error: any) {
            console.error('Error en generatePediatricReport:', error);
            if (error instanceof AppError) {
                return next(error);
            }
            next(new AppError('Error al generar reporte pediátrico', 500));
        }
    }

    /**
     * Genera un reporte solo de curvas de crecimiento
     * POST /growth-charts/export/growth-charts
     */
    public async generateGrowthChartsReport(req: Request, res: Response, next: NextFunction) {
        try {
            const {
                patientId,
                metricTypes = ['weight_for_age', 'height_for_age', 'bmi_for_age'],
                source = 'WHO',
                ageRangeMonths
            } = req.body;

            // Validar entrada
            if (!patientId) {
                return next(new AppError('ID de paciente requerido', 400));
            }

            // Validar tipos de métricas
            const validMetricTypes = Object.values(GrowthMetricType);
            const invalidMetrics = metricTypes.filter((type: string) => !validMetricTypes.includes(type as GrowthMetricType));
            
            if (invalidMetrics.length > 0) {
                return next(new AppError(`Tipos de métrica inválidos: ${invalidMetrics.join(', ')}`, 400));
            }

            if (!['WHO', 'CDC'].includes(source)) {
                return next(new AppError('Fuente debe ser WHO o CDC', 400));
            }

            // Generar reporte de curvas
            const filePath = await pdfExportService.generateGrowthChartsReport(
                patientId,
                metricTypes as GrowthMetricType[],
                source as 'WHO' | 'CDC',
                ageRangeMonths ? [Number(ageRangeMonths[0]), Number(ageRangeMonths[1])] as [number, number] : undefined
            );

            // Obtener información del archivo
            const fileName = path.basename(filePath);
            const fileStats = fs.statSync(filePath);

            res.status(200).json({
                status: 'success',
                message: 'Reporte de curvas de crecimiento generado exitosamente',
                data: {
                    fileName,
                    filePath: filePath,
                    downloadUrl: pdfExportService.getFileUrl(filePath),
                    fileSize: fileStats.size,
                    generatedAt: new Date(),
                    metricTypes: metricTypes,
                    source: source,
                    ageRangeMonths: ageRangeMonths
                }
            });

        } catch (error: any) {
            console.error('Error en generateGrowthChartsReport:', error);
            if (error instanceof AppError) {
                return next(error);
            }
            next(new AppError('Error al generar reporte de curvas', 500));
        }
    }

    /**
     * Descarga un archivo de reporte generado
     * GET /growth-charts/export/download/:fileName
     */
    public async downloadReport(req: Request, res: Response, next: NextFunction) {
        try {
            const { fileName } = req.params;

            if (!fileName) {
                return next(new AppError('Nombre de archivo requerido', 400));
            }

            // Validar que el archivo existe y es seguro
            const safePath = this.validateAndGetSafePath(fileName);
            
            if (!fs.existsSync(safePath)) {
                return next(new AppError('Archivo no encontrado', 404));
            }

            // Verificar que es un PDF
            if (!fileName.toLowerCase().endsWith('.pdf')) {
                return next(new AppError('Tipo de archivo no válido', 400));
            }

            // Configurar headers para descarga
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
            res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
            res.setHeader('Pragma', 'no-cache');
            res.setHeader('Expires', '0');

            // Stream del archivo
            const fileStream = fs.createReadStream(safePath);
            
            fileStream.on('error', (error) => {
                console.error('Error leyendo archivo:', error);
                if (!res.headersSent) {
                    return next(new AppError('Error al leer archivo', 500));
                }
            });

            fileStream.pipe(res);

        } catch (error: any) {
            console.error('Error en downloadReport:', error);
            if (error instanceof AppError) {
                return next(error);
            }
            next(new AppError('Error al descargar reporte', 500));
        }
    }

    /**
     * Obtiene la lista de reportes disponibles para un paciente
     * GET /growth-charts/export/reports/:patientId
     */
    public async getAvailableReports(req: Request, res: Response, next: NextFunction) {
        try {
            const { patientId } = req.params;
            const { limit = '10' } = req.query;

            if (!patientId) {
                return next(new AppError('ID de paciente requerido', 400));
            }

            const reportsDir = path.join(__dirname, '../../../generated/reports');
            
            if (!fs.existsSync(reportsDir)) {
                return res.status(200).json({
                    status: 'success',
                    message: 'No hay reportes disponibles',
                    data: {
                        reports: [],
                        total: 0
                    }
                });
            }

            // Buscar archivos que contengan el ID del paciente
            const files = fs.readdirSync(reportsDir)
                .filter(file => file.includes(patientId) && file.endsWith('.pdf'))
                .map(file => {
                    const filePath = path.join(reportsDir, file);
                    const stats = fs.statSync(filePath);
                    
                    return {
                        fileName: file,
                        downloadUrl: pdfExportService.getFileUrl(filePath),
                        fileSize: stats.size,
                        createdAt: stats.birthtime,
                        modifiedAt: stats.mtime,
                        type: this.determineReportType(file)
                    };
                })
                .sort((a, b) => b.modifiedAt.getTime() - a.modifiedAt.getTime()) // Más recientes primero
                .slice(0, Number(limit));

            res.status(200).json({
                status: 'success',
                message: 'Reportes disponibles obtenidos exitosamente',
                data: {
                    reports: files,
                    total: files.length,
                    patientId
                }
            });

        } catch (error: any) {
            console.error('Error en getAvailableReports:', error);
            if (error instanceof AppError) {
                return next(error);
            }
            next(new AppError('Error al obtener reportes disponibles', 500));
        }
    }

    /**
     * Elimina un reporte específico
     * DELETE /growth-charts/export/reports/:fileName
     */
    public async deleteReport(req: Request, res: Response, next: NextFunction) {
        try {
            const { fileName } = req.params;

            if (!fileName) {
                return next(new AppError('Nombre de archivo requerido', 400));
            }

            const safePath = this.validateAndGetSafePath(fileName);

            if (!fs.existsSync(safePath)) {
                return next(new AppError('Archivo no encontrado', 404));
            }

            // Eliminar archivo
            fs.unlinkSync(safePath);

            res.status(200).json({
                status: 'success',
                message: 'Reporte eliminado exitosamente',
                data: {
                    fileName,
                    deletedAt: new Date()
                }
            });

        } catch (error: any) {
            console.error('Error en deleteReport:', error);
            if (error instanceof AppError) {
                return next(error);
            }
            next(new AppError('Error al eliminar reporte', 500));
        }
    }

    /**
     * Limpia reportes antiguos
     * POST /growth-charts/export/cleanup
     */
    public async cleanupOldReports(req: Request, res: Response, next: NextFunction) {
        try {
            const { maxAgeHours = 24 } = req.body;

            await pdfExportService.cleanupOldFiles();

            res.status(200).json({
                status: 'success',
                message: 'Limpieza de archivos antiguos completada',
                data: {
                    maxAgeHours: Number(maxAgeHours),
                    cleanedAt: new Date()
                }
            });

        } catch (error: any) {
            console.error('Error en cleanupOldReports:', error);
            if (error instanceof AppError) {
                return next(error);
            }
            next(new AppError('Error al limpiar reportes antiguos', 500));
        }
    }

    /**
     * Obtiene vista previa de un reporte (metadata)
     * GET /growth-charts/export/preview/:fileName
     */
    public async getReportPreview(req: Request, res: Response, next: NextFunction) {
        try {
            const { fileName } = req.params;

            if (!fileName) {
                return next(new AppError('Nombre de archivo requerido', 400));
            }

            const safePath = this.validateAndGetSafePath(fileName);

            if (!fs.existsSync(safePath)) {
                return next(new AppError('Archivo no encontrado', 404));
            }

            const stats = fs.statSync(safePath);
            const reportType = this.determineReportType(fileName);

            // Extraer información del nombre del archivo
            const parts = fileName.replace('.pdf', '').split('_');
            const patientId = parts[2] || 'unknown';

            const preview = {
                fileName,
                reportType,
                patientId,
                fileSize: stats.size,
                fileSizeFormatted: this.formatFileSize(stats.size),
                createdAt: stats.birthtime,
                modifiedAt: stats.mtime,
                downloadUrl: pdfExportService.getFileUrl(safePath),
                isAvailable: true
            };

            res.status(200).json({
                status: 'success',
                message: 'Vista previa del reporte obtenida exitosamente',
                data: preview
            });

        } catch (error: any) {
            console.error('Error en getReportPreview:', error);
            if (error instanceof AppError) {
                return next(error);
            }
            next(new AppError('Error al obtener vista previa', 500));
        }
    }

    /**
     * Valida y obtiene ruta segura del archivo
     */
    private validateAndGetSafePath(fileName: string): string {
        // Validaciones de seguridad
        if (fileName.includes('..') || fileName.includes('/') || fileName.includes('\\')) {
            throw new AppError('Nombre de archivo no válido', 400);
        }

        const reportsDir = path.join(__dirname, '../../../generated/reports');
        return path.join(reportsDir, fileName);
    }

    /**
     * Determina el tipo de reporte basado en el nombre del archivo
     */
    private determineReportType(fileName: string): string {
        if (fileName.includes('reporte_pediatrico')) {
            return 'Reporte Pediátrico Completo';
        } else if (fileName.includes('curvas_crecimiento')) {
            return 'Curvas de Crecimiento';
        } else {
            return 'Reporte General';
        }
    }

    /**
     * Formatea el tamaño del archivo de manera legible
     */
    private formatFileSize(bytes: number): string {
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        if (bytes === 0) return '0 Bytes';
        
        const i = Math.floor(Math.log(bytes) / Math.log(1024));
        return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
    }
}

export default new PDFExportController(); 