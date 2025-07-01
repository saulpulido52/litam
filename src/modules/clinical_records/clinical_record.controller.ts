// src/modules/clinical_records/clinical_record.controller.ts
import { Request, Response, NextFunction } from 'express';
import clinicalRecordService from './clinical_record.service';
import { AppError } from '../../utils/app.error';
import { CreateUpdateClinicalRecordDto } from './clinical_record.dto';
import { RoleName } from '@/database/entities/role.entity';
import { validateMiddleware } from '@/middleware/validation.middleware';

// Interfaz para Request con file de multer
interface MulterRequest extends Request {
    file?: Express.Multer.File;
}

class ClinicalRecordController {
    // --- Métodos para Nutriólogos (y Administradores) ---

    public async createClinicalRecord(req: Request, res: Response, next: NextFunction) {
        try {
            if (!req.user || (req.user.role.name !== RoleName.NUTRITIONIST && req.user.role.name !== RoleName.ADMIN)) {
                return next(new AppError('Acceso denegado. Solo nutriólogos o administradores pueden crear registros clínicos.', 403, 'FORBIDDEN'));
            }
            const record = await clinicalRecordService.createClinicalRecord(req.body as CreateUpdateClinicalRecordDto, req.user.id);
            res.status(201).json({
                status: 'success',
                message: 'Registro clínico creado exitosamente.',
                data: { record },
                timestamp: new Date().toISOString(),
                createdBy: req.user.id,
                recordId: record.id
            });
        } catch (error: any) {
            console.error('Error en ClinicalRecordController.createClinicalRecord:', error);
            if (error instanceof AppError) {
                return next(error);
            }
            next(new AppError('Error al crear el registro clínico.', 500, 'CREATE_RECORD_ERROR'));
        }
    }

    public async getPatientClinicalRecords(req: Request, res: Response, next: NextFunction) {
        try {
            if (!req.user) {
                return next(new AppError('Usuario no autenticado.', 401, 'UNAUTHORIZED'));
            }
            const { patientId } = req.params; // ID del paciente cuyos logs se quieren ver
            const startDate = req.query.startDate as string | undefined;
            const endDate = req.query.endDate as string | undefined;

            const records = await clinicalRecordService.getPatientClinicalRecords(patientId, req.user.id, req.user.role.name, startDate, endDate);
            res.status(200).json({
                status: 'success',
                results: records.length,
                data: { records },
                timestamp: new Date().toISOString(),
                patientId: patientId,
                filters: {
                    startDate,
                    endDate
                },
                pagination: {
                    total: records.length,
                    page: 1,
                    limit: records.length
                }
            });
        } catch (error: any) {
            console.error('Error en ClinicalRecordController.getPatientClinicalRecords:', error);
            if (error instanceof AppError) {
                return next(error);
            }
            next(new AppError('Error al obtener los registros clínicos del paciente.', 500, 'GET_RECORDS_ERROR'));
        }
    }

    public async getClinicalRecordById(req: Request, res: Response, next: NextFunction) {
        try {
            if (!req.user) {
                return next(new AppError('Usuario no autenticado.', 401, 'UNAUTHORIZED'));
            }
            const { id } = req.params;
            const record = await clinicalRecordService.getClinicalRecordById(id, req.user.id, req.user.role.name);
            res.status(200).json({
                status: 'success',
                data: { record },
                timestamp: new Date().toISOString(),
                recordId: id,
                accessedBy: req.user.id
            });
        } catch (error: any) {
            console.error('Error en ClinicalRecordController.getClinicalRecordById:', error);
            if (error instanceof AppError) {
                return next(error);
            }
            next(new AppError('Error al obtener el registro clínico.', 500, 'GET_RECORD_ERROR'));
        }
    }

    public async updateClinicalRecord(req: Request, res: Response, next: NextFunction) {
        try {
            if (!req.user || (req.user.role.name !== RoleName.NUTRITIONIST && req.user.role.name !== RoleName.ADMIN)) {
                return next(new AppError('Acceso denegado. Solo nutriólogos o administradores pueden actualizar registros clínicos.', 403, 'FORBIDDEN'));
            }
            const { id } = req.params;
            const updatedRecord = await clinicalRecordService.updateClinicalRecord(id, req.body as CreateUpdateClinicalRecordDto, req.user.id);
            res.status(200).json({
                status: 'success',
                message: 'Registro clínico actualizado exitosamente.',
                data: { record: updatedRecord },
                timestamp: new Date().toISOString(),
                recordId: id,
                updatedBy: req.user.id
            });
        } catch (error: any) {
            console.error('Error en ClinicalRecordController.updateClinicalRecord:', error);
            if (error instanceof AppError) {
                return next(error);
            }
            next(new AppError('Error al actualizar el registro clínico.', 500, 'UPDATE_RECORD_ERROR'));
        }
    }

    public async deleteClinicalRecord(req: Request, res: Response, next: NextFunction) {
        try {
            if (!req.user || (req.user.role.name !== RoleName.NUTRITIONIST && req.user.role.name !== RoleName.ADMIN)) {
                return next(new AppError('Acceso denegado. Solo nutriólogos o administradores pueden eliminar registros clínicos.', 403, 'FORBIDDEN'));
            }
            const { id } = req.params;
            await clinicalRecordService.deleteClinicalRecord(id, req.user.id);
            res.status(200).json({
                status: 'success',
                message: 'Registro clínico eliminado con éxito.',
                data: null,
                timestamp: new Date().toISOString(),
                recordId: id,
                deletedBy: req.user.id
            });
        } catch (error: any) {
            console.error('Error en ClinicalRecordController.deleteClinicalRecord:', error);
            if (error instanceof AppError) {
                return next(error);
            }
            next(new AppError('Error al eliminar el registro clínico.', 500, 'DELETE_RECORD_ERROR'));
        }
    }

    // --- MÉTODOS ESPECIALIZADOS PARA GESTIÓN DE EXPEDIENTES ---

    public async transferPatientRecords(req: Request, res: Response, next: NextFunction) {
        try {
            if (!req.user || req.user.role.name !== RoleName.ADMIN) {
                return next(new AppError('Acceso denegado. Solo administradores pueden transferir expedientes.', 403, 'FORBIDDEN'));
            }

            const { patientId, fromNutritionistId, toNutritionistId } = req.body;

            if (!patientId || !fromNutritionistId || !toNutritionistId) {
                return next(new AppError('Faltan parámetros requeridos: patientId, fromNutritionistId, toNutritionistId.', 400, 'MISSING_PARAMETERS'));
            }

            const result = await clinicalRecordService.transferPatientRecords(
                patientId,
                fromNutritionistId,
                toNutritionistId
            );

            res.status(200).json({
                status: 'success',
                message: 'Transferencia de expedientes completada.',
                data: result,
                timestamp: new Date().toISOString(),
                transferredBy: req.user.id,
                transferDetails: {
                    patientId,
                    fromNutritionistId,
                    toNutritionistId
                }
            });
        } catch (error: any) {
            console.error('Error en ClinicalRecordController.transferPatientRecords:', error);
            if (error instanceof AppError) {
                return next(error);
            }
            next(new AppError('Error al transferir los expedientes.', 500, 'TRANSFER_RECORDS_ERROR'));
        }
    }

    public async deleteAllPatientRecords(req: Request, res: Response, next: NextFunction) {
        try {
            if (!req.user) {
                return next(new AppError('Usuario no autenticado.', 401, 'UNAUTHORIZED'));
            }

            const { patientId } = req.params;

            // Solo el propio paciente o un administrador pueden eliminar todos los expedientes
            if (req.user.role.name !== RoleName.ADMIN && req.user.id !== patientId) {
                return next(new AppError('Solo el paciente o un administrador pueden eliminar todos los expedientes.', 403, 'FORBIDDEN'));
            }

            const result = await clinicalRecordService.deleteAllPatientRecords(
                patientId,
                req.user.id,
                req.user.role.name
            );

            res.status(200).json({
                status: 'success',
                message: 'Todos los expedientes han sido eliminados.',
                data: result,
                timestamp: new Date().toISOString(),
                patientId: patientId,
                deletedBy: req.user.id,
                deletionReason: 'User request'
            });
        } catch (error: any) {
            console.error('Error en ClinicalRecordController.deleteAllPatientRecords:', error);
            if (error instanceof AppError) {
                return next(error);
            }
            next(new AppError('Error al eliminar todos los expedientes.', 500, 'DELETE_ALL_RECORDS_ERROR'));
        }
    }

    public async getPatientRecordsStats(req: Request, res: Response, next: NextFunction) {
        try {
            if (!req.user) {
                return next(new AppError('Usuario no autenticado.', 401, 'UNAUTHORIZED'));
            }

            const { patientId } = req.params;

            const stats = await clinicalRecordService.getPatientRecordsStats(
                patientId,
                req.user.id,
                req.user.role.name
            );

            res.status(200).json({
                status: 'success',
                data: { stats },
                timestamp: new Date().toISOString(),
                patientId: patientId,
                requestedBy: req.user.id
            });
        } catch (error: any) {
            console.error('Error en ClinicalRecordController.getPatientRecordsStats:', error);
            if (error instanceof AppError) {
                return next(error);
            }
            next(new AppError('Error al obtener estadísticas de expedientes.', 500, 'GET_STATS_ERROR'));
        }
    }

    public async getPatientRecordsCount(req: Request, res: Response, next: NextFunction) {
        try {
            if (!req.user) {
                return next(new AppError('Usuario no autenticado.', 401, 'UNAUTHORIZED'));
            }

            const { patientId } = req.params;

            const count = await clinicalRecordService.getPatientRecordsCount(
                patientId,
                req.user.id,
                req.user.role.name
            );

            res.status(200).json({
                status: 'success',
                data: { count },
                timestamp: new Date().toISOString(),
                patientId: patientId,
                requestedBy: req.user.id
            });
        } catch (error: any) {
            console.error('Error en ClinicalRecordController.getPatientRecordsCount:', error);
            if (error instanceof AppError) {
                return next(error);
            }
            next(new AppError('Error al obtener el conteo de expedientes.', 500, 'GET_COUNT_ERROR'));
        }
    }

    /**
     * 📄 UPLOAD DE DOCUMENTO DE LABORATORIO
     */
    public async uploadLaboratoryDocument(req: MulterRequest, res: Response, next: NextFunction) {
        try {
            const { recordId } = req.params;
            const { labDate, description } = req.body;
            const file = req.file; // Multer file
            
            if (!file) {
                return res.status(400).json({
                    status: 'error',
                    message: 'No se ha proporcionado ningún archivo',
                    errorCode: 'NO_FILE_PROVIDED'
                });
            }

            // Verificar que sea un PDF
            if (file.mimetype !== 'application/pdf') {
                return res.status(400).json({
                    status: 'error',
                    message: 'Solo se permiten archivos PDF',
                    errorCode: 'INVALID_FILE_TYPE'
                });
            }

            const result = await clinicalRecordService.uploadLaboratoryDocument(
                recordId,
                file,
                req.user!.id,
                req.user!.role.name,
                labDate,
                description
            );

            res.status(201).json({
                status: 'success',
                message: result.message,
                data: {
                    document: result.document
                }
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * 📋 GENERAR PDF DEL EXPEDIENTE COMPLETO
     */
    public async generateExpedientePDF(req: Request, res: Response, next: NextFunction) {
        try {
            const { recordId } = req.params;

            console.log(`🔄 PDF generation request for record ${recordId} by user ${req.user!.id}`);

            const result = await clinicalRecordService.generateExpedientePDF(
                recordId,
                req.user!.id,
                req.user!.role.name
            );

            // Leer el archivo PDF generado y enviarlo como respuesta
            if (result.pdf_path && result.filename) {
                const fs = require('fs').promises;
                
                try {
                    const pdfBuffer = await fs.readFile(result.pdf_path);
                    
                    res.setHeader('Content-Type', 'application/pdf');
                    res.setHeader('Content-Disposition', `inline; filename="${result.filename}"`);
                    res.setHeader('Content-Length', pdfBuffer.length);
                    
                    console.log(`✅ Sending PDF file: ${result.filename}, size: ${pdfBuffer.length} bytes`);
                    return res.send(pdfBuffer);
                } catch (fileError) {
                    console.error('❌ Error reading PDF file:', fileError);
                    throw new Error('No se pudo leer el archivo PDF generado');
                }
            }

            // Si no se pudo generar el archivo, devolver error
            throw new Error('No se pudo generar el archivo PDF');
        } catch (error) {
            console.error('❌ Error in generateExpedientePDF controller:', error);
            next(error);
        }
    }

    /**
     * 🗑️ ELIMINAR DOCUMENTO DE LABORATORIO
     */
    public async deleteLaboratoryDocument(req: Request, res: Response, next: NextFunction) {
        try {
            const { recordId, documentId } = req.params;

            const result = await clinicalRecordService.deleteLaboratoryDocument(
                recordId,
                documentId,
                req.user!.id,
                req.user!.role.name
            );

            res.status(200).json({
                status: 'success',
                message: result.message
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * 📁 OBTENER DOCUMENTOS DE LABORATORIO
     */
    public async getLaboratoryDocuments(req: Request, res: Response, next: NextFunction) {
        try {
            const { recordId } = req.params;

            const record = await clinicalRecordService.getClinicalRecordById(
                recordId,
                req.user!.id,
                req.user!.role.name
            );

            res.status(200).json({
                status: 'success',
                message: 'Documentos de laboratorio obtenidos exitosamente',
                data: {
                    documents: record.laboratory_documents || [],
                    total: record.laboratory_documents?.length || 0,
                    metadata: record.document_metadata
                }
            });
        } catch (error) {
            next(error);
        }
    }

    // === 💊 MÉTODOS PARA INTERACCIONES FÁRMACO-NUTRIENTE ===

    /**
     * 🔬 AGREGAR INTERACCIÓN FÁRMACO-NUTRIENTE
     */
    public async addDrugNutrientInteraction(req: Request, res: Response, next: NextFunction) {
        try {
            if (!req.user || (req.user.role.name !== RoleName.NUTRITIONIST && req.user.role.name !== RoleName.ADMIN)) {
                return next(new AppError('Acceso denegado. Solo nutriólogos o administradores pueden agregar interacciones.', 403, 'FORBIDDEN'));
            }

            const { recordId } = req.params;
            const interactionData = req.body;

            const result = await clinicalRecordService.addDrugNutrientInteraction(
                recordId,
                interactionData,
                req.user.id,
                req.user.role.name
            );

            res.status(201).json({
                status: 'success',
                message: result.message,
                data: {
                    interaction: result.interaction
                },
                timestamp: new Date().toISOString(),
                recordId: recordId,
                createdBy: req.user.id
            });
        } catch (error: any) {
            console.error('Error en ClinicalRecordController.addDrugNutrientInteraction:', error);
            if (error instanceof AppError) {
                return next(error);
            }
            next(new AppError('Error al agregar la interacción fármaco-nutriente.', 500, 'ADD_INTERACTION_ERROR'));
        }
    }

    /**
     * ✏️ ACTUALIZAR INTERACCIÓN FÁRMACO-NUTRIENTE
     */
    public async updateDrugNutrientInteraction(req: Request, res: Response, next: NextFunction) {
        try {
            if (!req.user || (req.user.role.name !== RoleName.NUTRITIONIST && req.user.role.name !== RoleName.ADMIN)) {
                return next(new AppError('Acceso denegado. Solo nutriólogos o administradores pueden actualizar interacciones.', 403, 'FORBIDDEN'));
            }

            const { recordId, interactionId } = req.params;
            const updateData = req.body;

            const result = await clinicalRecordService.updateDrugNutrientInteraction(
                recordId,
                interactionId,
                updateData,
                req.user.id,
                req.user.role.name
            );

            res.status(200).json({
                status: 'success',
                message: result.message,
                data: {
                    interaction: result.interaction
                },
                timestamp: new Date().toISOString(),
                recordId: recordId,
                interactionId: interactionId,
                updatedBy: req.user.id
            });
        } catch (error: any) {
            console.error('Error en ClinicalRecordController.updateDrugNutrientInteraction:', error);
            if (error instanceof AppError) {
                return next(error);
            }
            next(new AppError('Error al actualizar la interacción fármaco-nutriente.', 500, 'UPDATE_INTERACTION_ERROR'));
        }
    }

    /**
     * 🗑️ ELIMINAR INTERACCIÓN FÁRMACO-NUTRIENTE
     */
    public async deleteDrugNutrientInteraction(req: Request, res: Response, next: NextFunction) {
        try {
            if (!req.user || (req.user.role.name !== RoleName.NUTRITIONIST && req.user.role.name !== RoleName.ADMIN)) {
                return next(new AppError('Acceso denegado. Solo nutriólogos o administradores pueden eliminar interacciones.', 403, 'FORBIDDEN'));
            }

            const { recordId, interactionId } = req.params;

            const result = await clinicalRecordService.deleteDrugNutrientInteraction(
                recordId,
                interactionId,
                req.user.id,
                req.user.role.name
            );

            res.status(200).json({
                status: 'success',
                message: result.message,
                data: {
                    interaction_id: result.interaction_id
                },
                timestamp: new Date().toISOString(),
                recordId: recordId,
                interactionId: interactionId,
                deletedBy: req.user.id
            });
        } catch (error: any) {
            console.error('Error en ClinicalRecordController.deleteDrugNutrientInteraction:', error);
            if (error instanceof AppError) {
                return next(error);
            }
            next(new AppError('Error al eliminar la interacción fármaco-nutriente.', 500, 'DELETE_INTERACTION_ERROR'));
        }
    }

    /**
     * 📋 OBTENER INTERACCIONES FÁRMACO-NUTRIENTE
     */
    public async getDrugNutrientInteractions(req: Request, res: Response, next: NextFunction) {
        try {
            if (!req.user) {
                return next(new AppError('Usuario no autenticado.', 401, 'UNAUTHORIZED'));
            }

            const { recordId } = req.params;

            const result = await clinicalRecordService.getDrugNutrientInteractions(
                recordId,
                req.user.id,
                req.user.role.name
            );

            res.status(200).json({
                status: 'success',
                message: 'Interacciones fármaco-nutriente obtenidas exitosamente',
                data: {
                    interactions: result.interactions,
                    total: result.total
                },
                timestamp: new Date().toISOString(),
                recordId: recordId,
                requestedBy: req.user.id
            });
        } catch (error: any) {
            console.error('Error en ClinicalRecordController.getDrugNutrientInteractions:', error);
            if (error instanceof AppError) {
                return next(error);
            }
            next(new AppError('Error al obtener las interacciones fármaco-nutriente.', 500, 'GET_INTERACTIONS_ERROR'));
        }
    }
}

export default new ClinicalRecordController();