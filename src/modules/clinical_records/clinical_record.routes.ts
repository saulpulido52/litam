// src/modules/clinical_records/clinical_record.routes.ts
import { Router, Request } from 'express';
import multer, { FileFilterCallback } from 'multer';
import path from 'path';
import { promises as fs } from 'fs';
import clinicalRecordController from '../../modules/clinical_records/clinical_record.controller';
import { protect, authorize } from '../../middleware/auth.middleware';
import { validateMiddleware } from '../../middleware/validation.middleware';
import { CreateUpdateClinicalRecordDto } from '../../modules/clinical_records/clinical_record.dto';
import { RoleName } from '../../database/entities/role.entity';

const router = Router();

// Configuración de multer para upload de documentos PDF
const storage = multer.memoryStorage(); // Guardamos en memoria para procesar
const upload = multer({
    storage: storage,
    limits: {
        fileSize: 10 * 1024 * 1024, // 10MB máximo
    },
    fileFilter: (req: Request, file: Express.Multer.File, cb: FileFilterCallback) => {
        // Solo permitir PDFs
        if (file.mimetype === 'application/pdf') {
            cb(null, true);
        } else {
            cb(new Error('Solo se permiten archivos PDF'));
        }
    }
});

// Todas las rutas de registros clínicos requieren autenticación
router.use(protect);

// ============== NUEVAS RUTAS PARA SISTEMA EVOLUTIVO DE EXPEDIENTES (ESPECÍFICAS PRIMERO) ==============

// 📊 Obtener estadísticas de seguimiento para nutriólogo
router.get(
    '/stats/seguimiento',
    authorize(RoleName.NUTRITIONIST),
    clinicalRecordController.getEstadisticasSeguimiento
);

// 🤖 Detectar tipo de expediente automáticamente
router.post(
    '/detect-type',
    authorize(RoleName.NUTRITIONIST, RoleName.ADMIN),
    clinicalRecordController.detectarTipoExpediente
);

// 📋 Crear expediente con detección automática de tipo
router.post(
    '/evolutivo',
    authorize(RoleName.NUTRITIONIST, RoleName.ADMIN),
    clinicalRecordController.createClinicalRecordEvolutivo
);

// 📊 Obtener datos previos del paciente para expediente de seguimiento
router.get(
    '/patient/:patientId/previous-data',
    authorize(RoleName.NUTRITIONIST, RoleName.ADMIN, RoleName.PATIENT),
    clinicalRecordController.obtenerDatosPreviosPaciente
);

// 📈 Generar comparativo automático entre dos expedientes
router.get(
    '/compare/:expedienteActualId/:expedienteBaseId',
    authorize(RoleName.NUTRITIONIST, RoleName.ADMIN),
    clinicalRecordController.generarComparativo
);


// --- Rutas para Nutriólogos y Administradores (Crear, Actualizar, Eliminar) ---
router.route('/')
    .post(
        authorize(RoleName.NUTRITIONIST, RoleName.ADMIN),
        validateMiddleware(CreateUpdateClinicalRecordDto),
        clinicalRecordController.createClinicalRecord
    );

// Obtener registros clínicos de un paciente específico (Nutriólogo, Admin)
// Nota: Un paciente puede ver sus propios registros vía /api/clinical-records/me
router.get(
    '/patient/:patientId',
    authorize(RoleName.NUTRITIONIST, RoleName.ADMIN),
    clinicalRecordController.getPatientClinicalRecords // Filtrado por query params
);

router.route('/:id') // Gestión de un registro específico por su ID
    .get(
        // Acceso para paciente (si es su registro), nutriólogo (si es su paciente o lo creó), admin
        clinicalRecordController.getClinicalRecordById
    )
    .patch(
        authorize(RoleName.NUTRITIONIST, RoleName.ADMIN),
        validateMiddleware(CreateUpdateClinicalRecordDto),
        clinicalRecordController.updateClinicalRecord
    )
    .delete(
        authorize(RoleName.NUTRITIONIST, RoleName.ADMIN),
        clinicalRecordController.deleteClinicalRecord
    );

// --- NUEVAS RUTAS PARA DOCUMENTOS DE LABORATORIO ---

// 📄 Upload de documento de laboratorio (PDF)
router.post(
    '/:recordId/laboratory-documents',
    upload.single('laboratory_pdf'),
    clinicalRecordController.uploadLaboratoryDocument
);

// 📁 Obtener documentos de laboratorio de un expediente
router.get(
    '/:recordId/laboratory-documents',
    clinicalRecordController.getLaboratoryDocuments
);

// 🗑️ Eliminar documento de laboratorio específico
router.delete(
    '/:recordId/laboratory-documents/:documentId',
    authorize(RoleName.NUTRITIONIST, RoleName.ADMIN),
    clinicalRecordController.deleteLaboratoryDocument
);

// 📋 Generar PDF del expediente completo
router.get(
    '/:recordId/generate-pdf',
    authorize(RoleName.NUTRITIONIST, RoleName.ADMIN), // Agregar autorización
    clinicalRecordController.generateExpedientePDF
);

// --- Rutas especializadas para gestión de expedientes ---

// Transferir expedientes entre nutriólogos (solo administradores)
router.post(
    '/transfer',
    authorize(RoleName.ADMIN),
    clinicalRecordController.transferPatientRecords
);

// Eliminar todos los expedientes de un paciente (solo cuando elimina su cuenta)
router.delete(
    '/patient/:patientId/all',
    clinicalRecordController.deleteAllPatientRecords
);

// Obtener estadísticas de expedientes de un paciente
router.get(
    '/patient/:patientId/stats',
    clinicalRecordController.getPatientRecordsStats
);

// Contar expedientes de un paciente
router.get(
    '/patient/:patientId/count',
    clinicalRecordController.getPatientRecordsCount
);

// === 💊 RUTAS PARA INTERACCIONES FÁRMACO-NUTRIENTE ===

// 🔬 Agregar interacción fármaco-nutriente
router.post(
    '/:recordId/drug-nutrient-interactions',
    authorize(RoleName.NUTRITIONIST, RoleName.ADMIN),
    clinicalRecordController.addDrugNutrientInteraction
);

// 📋 Obtener todas las interacciones fármaco-nutriente de un expediente
router.get(
    '/:recordId/drug-nutrient-interactions',
    clinicalRecordController.getDrugNutrientInteractions
);

// ✏️ Actualizar interacción fármaco-nutriente específica
router.patch(
    '/:recordId/drug-nutrient-interactions/:interactionId',
    authorize(RoleName.NUTRITIONIST, RoleName.ADMIN),
    clinicalRecordController.updateDrugNutrientInteraction
);

// 🗑️ Eliminar interacción fármaco-nutriente específica
router.delete(
    '/:recordId/drug-nutrient-interactions/:interactionId',
    authorize(RoleName.NUTRITIONIST, RoleName.ADMIN),
    clinicalRecordController.deleteDrugNutrientInteraction
);

// ============== NUEVAS RUTAS PARA SISTEMA EVOLUTIVO DE EXPEDIENTES ==============



export default router;