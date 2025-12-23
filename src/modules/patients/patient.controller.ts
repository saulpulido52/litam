// src/modules/patients/patient.controller.ts
import { Request, Response, NextFunction } from 'express';
import { PatientService } from './patient.service';
import { AppError } from '../../utils/app.error';
import { CreatePatientDTO, UpdatePatientDTO, PatientsSearchDTO } from './patient.dto';
import { AppDataSource } from '../../database/data-source';
import { RelationshipStatus } from '../../database/entities/patient_nutritionist_relation.entity';
<<<<<<< HEAD

const patientService = new PatientService(AppDataSource);
=======
import { emailService } from '../../services/email.service';

const patientService = new PatientService();
>>>>>>> nutri/main

class PatientController {
    // ==================== MÉTODOS PARA NUTRIÓLOGOS ====================

    // Verificar si un email ya existe
    public async checkEmailExists(req: Request, res: Response, next: NextFunction) {
        try {
            const email = req.query.email as string;
            
            if (!email) {
                return next(new AppError('Email es requerido', 400));
            }

            const exists = await patientService.checkEmailExists(email);

            res.status(200).json({
                status: 'success',
                data: {
                    exists: exists,
                    email: email
                }
            });
        } catch (error: any) {
            console.error('Error checking email:', error);
            next(new AppError('Error al verificar el email.', 500));
        }
    }

    // Obtener todos los pacientes del nutriólogo
    public async getMyPatients(req: Request, res: Response, next: NextFunction) {
        try {
            if (!req.user || req.user.role.name !== 'nutritionist') {
                return next(new AppError('Acceso denegado. Solo nutriólogos pueden ver sus pacientes.', 403));
            }
            
            const searchParams: PatientsSearchDTO = {
                search: req.query.search as string,
                gender: req.query.gender as string,
                age_min: req.query.age_min ? parseInt(req.query.age_min as string) : undefined,
                age_max: req.query.age_max ? parseInt(req.query.age_max as string) : undefined,
                activity_level: req.query.activity_level as string,
                page: req.query.page ? parseInt(req.query.page as string) : 1,
                limit: req.query.limit ? parseInt(req.query.limit as string) : 10,
                sort_by: req.query.sort_by as string,
                sort_order: req.query.sort_order as 'ASC' | 'DESC'
            };

            const result = await patientService.getPatientsByNutritionist(req.user.id, searchParams);
            
            res.status(200).json({
                status: 'success',
                data: result,
            });
        } catch (error: any) {
            if (error instanceof AppError) {
                return next(error);
            }
            next(new AppError('Error al obtener la lista de pacientes.', 500));
        }
    }

    // Crear un nuevo paciente
    public async createPatient(req: Request, res: Response, next: NextFunction) {
        try {
            if (!req.user || req.user.role.name !== 'nutritionist') {
                return next(new AppError('Acceso denegado. Solo nutriólogos pueden crear pacientes.', 403));
            }

            const patient = await patientService.createPatient(req.user.id, req.body as CreatePatientDTO);
            
            res.status(201).json({
                status: 'success',
                data: { patient },
            });
        } catch (error: any) {
            if (error instanceof AppError) {
                return next(error);
            }
            next(new AppError('Error al crear el paciente.', 500));
        }
    }

    // Obtener un paciente específico
    public async getPatientById(req: Request, res: Response, next: NextFunction) {
        try {
            if (!req.user || req.user.role.name !== 'nutritionist') {
                return next(new AppError('Acceso denegado. Solo nutriólogos pueden ver pacientes.', 403));
            }

            const { patientId } = req.params;
            const patient = await patientService.getPatientById(patientId, req.user.id);
            
            res.status(200).json({
                status: 'success',
                data: { patient },
            });
        } catch (error: any) {
            if (error instanceof AppError) {
                return next(error);
            }
            next(new AppError('Error al obtener el paciente.', 500));
        }
    }

    // Actualizar un paciente
    public async updatePatient(req: Request, res: Response, next: NextFunction) {
        try {
            console.log(`🔍 UPDATE PATIENT - User: ${req.user?.id || 'NONE'} - Role: ${req.user?.role?.name || 'NONE'}`);
            console.log(`🔍 UPDATE PATIENT - Patient ID: ${req.params.patientId}`);
            console.log(`🔍 UPDATE PATIENT - Body:`, JSON.stringify(req.body, null, 2));
            
            if (!req.user || req.user.role.name !== 'nutritionist') {
                console.log(`❌ UPDATE PATIENT - Access denied: User=${req.user?.id}, Role=${req.user?.role?.name}`);
                return next(new AppError('Acceso denegado. Solo nutriólogos pueden actualizar pacientes.', 403));
            }

            const { patientId } = req.params;
            console.log(`🔄 UPDATE PATIENT - Calling service with nutritionist ${req.user.id}`);
            
            const patient = await patientService.updatePatient(patientId, req.user.id, req.body as UpdatePatientDTO);
            
            console.log(`✅ UPDATE PATIENT - Success for patient ${patientId}`);
            res.status(200).json({
                status: 'success',
                data: { patient },
            });
        } catch (error: any) {
            console.error(`💥 UPDATE PATIENT - Error:`, error);
            if (error instanceof AppError) {
                return next(error);
            }
            next(new AppError('Error al actualizar el paciente.', 500));
        }
    }

    // 🎯 NUEVO: Actualizar paciente por EMAIL (más robusto)
    public async updatePatientByEmail(req: Request, res: Response, next: NextFunction) {
        try {
            console.log(`🔍 UPDATE BY EMAIL - User: ${req.user?.id || 'NONE'} - Role: ${req.user?.role?.name || 'NONE'}`);
            console.log(`🔍 UPDATE BY EMAIL - Email: ${req.params.email}`);
            console.log(`🔍 UPDATE BY EMAIL - Body:`, JSON.stringify(req.body, null, 2));
            
            if (!req.user || req.user.role.name !== 'nutritionist') {
                console.log(`❌ UPDATE BY EMAIL - Access denied`);
                return next(new AppError('Acceso denegado. Solo nutriólogos pueden actualizar pacientes.', 403));
            }

            const { email } = req.params;
            const updateData = req.body as UpdatePatientDTO;
            
            // Usar el nuevo método que busca directamente por email
            const patient = await patientService.updatePatientByEmail(email, req.user.id, updateData);
            
            console.log(`✅ UPDATE BY EMAIL - Success for email ${email}`);
            res.status(200).json({
                status: 'success',
                data: { patient },
            });
        } catch (error: any) {
            console.error(`💥 UPDATE BY EMAIL - Error:`, error);
            if (error instanceof AppError) {
                return next(error);
            }
            next(new AppError('Error al actualizar el paciente por email.', 500));
        }
    }

    // Obtener estadísticas de pacientes
    public async getPatientStats(req: Request, res: Response, next: NextFunction) {
        try {
            if (!req.user || req.user.role.name !== 'nutritionist') {
                return next(new AppError('Acceso denegado. Solo nutriólogos pueden ver estadísticas.', 403));
            }

            const stats = await patientService.getPatientStats(req.user.id);
            
            res.status(200).json({
                status: 'success',
                data: { stats },
            });
        } catch (error: any) {
            if (error instanceof AppError) {
                return next(error);
            }
            next(new AppError('Error al obtener estadísticas de pacientes.', 500));
        }
    }

    // ==================== ESCENARIO 1: REGISTRO POR NUTRIÓLOGO ====================
    
    public async createPatientByNutritionist(req: Request, res: Response, next: NextFunction) {
        try {
            if (!req.user || req.user.role.name !== 'nutritionist') {
                return next(new AppError('Acceso denegado. Solo nutriólogos pueden registrar pacientes.', 403));
            }

            const nutritionistId = req.user.id;
            const patientData = req.body;

<<<<<<< HEAD
            const result = await patientService.createPatientByNutritionist(nutritionistId, patientData);

            res.status(201).json({
                success: true,
                message: 'Paciente registrado exitosamente con expediente clínico completo',
=======
            console.log(`🏥 Creando paciente por nutriólogo: ${req.user.first_name} ${req.user.last_name}`);
            const result = await patientService.createPatientByNutritionist(nutritionistId, patientData);

            // 📧 Enviar credenciales por email
            try {
                console.log(`📧 Enviando credenciales de acceso a: ${result.patient.user.email}`);
                
                await emailService.sendPatientCredentials({
                    email: result.patient.user.email,
                    temporary_password: result.temporary_password,
                    expires_at: result.expires_at,
                    patient_name: `${result.patient.user.first_name} ${result.patient.user.last_name}`,
                    nutritionist_name: `${req.user.first_name} ${req.user.last_name}`
                });

                console.log(`✅ Email de credenciales enviado exitosamente a: ${result.patient.user.email}`);
                
            } catch (emailError) {
                console.error('❌ Error enviando email de credenciales:', emailError);
                // No fallar todo el proceso si el email falla, solo logear el error
                console.warn('⚠️ Paciente creado exitosamente pero falló el envío del email');
            }

            res.status(201).json({
                success: true,
                message: 'Paciente registrado exitosamente en Litam con expediente clínico completo. Credenciales enviadas por email.',
>>>>>>> nutri/main
                data: {
                    patient: result.patient,
                    temporary_credentials: {
                        email: result.patient.user.email,
                        temporary_password: result.temporary_password,
                        expires_at: result.expires_at,
<<<<<<< HEAD
                        instructions: 'El paciente debe cambiar su contraseña en su primer inicio de sesión'
=======
                        instructions: 'Las credenciales han sido enviadas al email del paciente. Debe cambiar su contraseña en su primer inicio de sesión.',
                        email_sent: true
>>>>>>> nutri/main
                    }
                }
            });
        } catch (error) {
<<<<<<< HEAD
=======
            console.error('💥 Error en createPatientByNutritionist:', error);
>>>>>>> nutri/main
            next(error);
        }
    }

    // ==================== ESCENARIO 2: REGISTRO BÁSICO DEL PACIENTE ====================
    
    public async registerBasicPatient(req: Request, res: Response, next: NextFunction) {
        try {
            const registrationData = req.body;

            const result = await patientService.registerBasicPatient(registrationData);

            // Intentar asignar nutriólogo disponible
            let assignedNutritionist = null;
            try {
                assignedNutritionist = await patientService.assignNutritionistToPatient(result.user.id);
            } catch (error) {
                console.warn('No se pudo asignar nutriólogo automáticamente:', error);
            }

            res.status(201).json({
                success: true,
                message: 'Registro exitoso. Se ha creado tu cuenta y suscripción.',
                data: {
                    user_id: result.user.id,
                    email: result.user.email,
                    subscription: {
                        id: result.subscription.id,
                        plan_name: result.subscription.subscription_plan?.name || 'Plan básico',
                        status: result.subscription.status,
                        start_date: result.subscription.start_date,
                        end_date: result.subscription.end_date,
                        amount_to_pay: result.subscription.amount_paid
                    },
                    assigned_nutritionist: assignedNutritionist ? {
                        id: assignedNutritionist.id,
                        name: `${assignedNutritionist.first_name} ${assignedNutritionist.last_name}`,
                        email: assignedNutritionist.email
                    } : null,
                    next_steps: {
                        payment_required: result.subscription.status === 'pending',
                        profile_completion_required: result.requires_profile_completion,
                        message: 'Por favor completa el pago y tu nutriólogo te contactará para completar tu expediente clínico.'
                    }
                }
            });
        } catch (error) {
            next(error);
        }
    }

    // ==================== COMPLETAR EXPEDIENTE CLÍNICO (PARA PACIENTES ONLINE) ====================
    
    public async completePatientClinicalRecord(req: Request, res: Response, next: NextFunction) {
        try {
            if (!req.user || req.user.role.name !== 'nutritionist') {
                return next(new AppError('Solo nutriólogos pueden completar expedientes clínicos', 403));
            }

            const { patientId } = req.params;
            const clinicalData = req.body;

            const updatedPatient = await patientService.updatePatient(patientId, req.user.id, clinicalData);

            // Marcar como perfil completado
            await patientService.markProfileAsCompleted(patientId);

            res.status(200).json({
                success: true,
                message: 'Expediente clínico completado exitosamente',
                data: updatedPatient
            });
        } catch (error) {
            next(error);
        }
    }

    // ==================== OBTENER PACIENTES QUE REQUIEREN COMPLETAR PERFIL ====================
    
    public async getPatientsRequiringCompletion(req: Request, res: Response, next: NextFunction) {
        try {
            if (!req.user || req.user.role.name !== 'nutritionist') {
                return next(new AppError('Acceso denegado', 403));
            }

            const patientsRequiringCompletion = await patientService.getPatientsRequiringProfileCompletion(req.user.id);

            res.status(200).json({
                success: true,
                message: 'Pacientes que requieren completar expediente clínico',
                data: patientsRequiringCompletion,
                count: patientsRequiringCompletion.length
            });
        } catch (error) {
            next(error);
        }
    }

    // ==================== FUNCIONALIDADES DE ELIMINACIÓN ====================
    
    // Remover paciente de la lista del nutriólogo (terminar relación)
    public async removePatientRelationship(req: Request, res: Response, next: NextFunction) {
        try {
            if (!req.user || req.user.role.name !== 'nutritionist') {
                return next(new AppError('Solo nutriólogos pueden remover pacientes de su lista.', 403));
            }

            const { patientId } = req.params;
            const { reason } = req.body;

            const result = await patientService.endPatientRelationship(patientId, req.user.id, reason);

            res.status(200).json({
                status: 'success',
                message: 'Paciente removido de tu lista exitosamente.',
                data: result,
            });
        } catch (error: any) {
            if (error instanceof AppError) {
                return next(error);
            }
            next(new AppError('Error al remover paciente de la lista.', 500));
        }
    }

    // Eliminación completa de cuenta del paciente
    public async deletePatientAccount(req: Request, res: Response, next: NextFunction) {
        try {
            if (!req.user) {
                return next(new AppError('Usuario no autenticado.', 401));
            }

            const { patientId } = req.params;
            const { confirmPassword } = req.body;

            // Si es un paciente, solo puede eliminar su propia cuenta
            if (req.user.role.name === 'patient' && req.user.id !== patientId) {
                return next(new AppError('Solo puedes eliminar tu propia cuenta.', 403));
            }

            // Si es un administrador, puede eliminar cualquier cuenta
            if (req.user.role.name !== 'patient' && req.user.role.name !== 'admin') {
                return next(new AppError('Solo pacientes o administradores pueden eliminar cuentas.', 403));
            }

            // Verificar contraseña si es el propio paciente
            if (req.user.role.name === 'patient' && !confirmPassword) {
                return next(new AppError('Debes proporcionar tu contraseña para confirmar la eliminación.', 400));
            }

            const result = await patientService.deletePatientAccount(patientId, req.user.id, req.user.role.name);

            res.status(200).json({
                status: 'success',
                message: 'Cuenta eliminada completamente.',
                data: result,
            });
        } catch (error: any) {
            if (error instanceof AppError) {
                return next(error);
            }
            next(new AppError('Error al eliminar la cuenta del paciente.', 500));
        }
    }

    // ==================== CAMBIO DE NUTRIÓLOGO ====================
    
    public async requestNutritionistChange(req: Request, res: Response, next: NextFunction) {
        try {
            if (!req.user || req.user.role.name !== 'patient') {
                return next(new AppError('Solo pacientes pueden solicitar cambio de nutriólogo.', 403));
            }

            const { newNutritionistId, reason } = req.body;

            if (!newNutritionistId) {
                return next(new AppError('Debes especificar el ID del nuevo nutriólogo.', 400));
            }

            const result = await patientService.requestNutritionistChange(
                req.user.id,
                newNutritionistId,
                reason
            );

            res.status(200).json({
                status: 'success',
                message: 'Cambio de nutriólogo realizado exitosamente.',
                data: result,
            });
        } catch (error: any) {
            if (error instanceof AppError) {
                return next(error);
            }
            next(new AppError('Error al procesar el cambio de nutriólogo.', 500));
        }
    }

    // ==================== MÉTODOS PARA PACIENTES (VER SU PROPIA INFORMACIÓN) ====================
    
    public async getMyProfile(req: Request, res: Response, next: NextFunction) {
        try {
            if (!req.user || req.user.role.name !== 'patient') {
                return next(new AppError('Solo pacientes pueden ver su propio perfil.', 403));
            }

            // Buscar la relación activa para obtener el nutriólogo actual
            const currentRelation = await patientService['relationRepository'].findOne({
                where: {
                    patient: { id: req.user.id },
                    status: RelationshipStatus.ACTIVE,
                },
                relations: ['nutritionist'],
            });

            const patient = await patientService.getPatientById(req.user.id, currentRelation?.nutritionist.id || '');

            res.status(200).json({
                status: 'success',
                data: {
                    patient,
                    current_nutritionist: currentRelation ? {
                        id: currentRelation.nutritionist.id,
                        name: `${currentRelation.nutritionist.first_name} ${currentRelation.nutritionist.last_name}`,
                        email: currentRelation.nutritionist.email,
                    } : null,
                },
            });
        } catch (error: any) {
            if (error instanceof AppError) {
                return next(error);
            }
            next(new AppError('Error al obtener el perfil del paciente.', 500));
        }
    }
<<<<<<< HEAD
=======

    // ==================== QUICK ACTIONS ====================
    
    public async getQuickActions(req: Request, res: Response, next: NextFunction) {
        try {
            if (!req.user || req.user.role.name !== 'nutritionist') {
                return next(new AppError('Acceso denegado. Solo nutriólogos pueden acceder a acciones rápidas.', 403));
            }

            // Obtener acciones rápidas comunes para el dashboard
            const quickActions = [
                {
                    id: 'new-patient',
                    title: 'Nuevo Paciente',
                    description: 'Agregar un nuevo paciente',
                    icon: 'user-plus',
                    action: '/patients/new',
                    priority: 1
                },
                {
                    id: 'schedule-appointment',
                    title: 'Programar Cita',
                    description: 'Agendar nueva consulta',
                    icon: 'calendar-plus',
                    action: '/appointments/new',
                    priority: 2
                },
                {
                    id: 'create-diet-plan',
                    title: 'Plan Nutricional',
                    description: 'Crear nuevo plan',
                    icon: 'clipboard-list',
                    action: '/diet-plans/new',
                    priority: 3
                },
                {
                    id: 'view-patients',
                    title: 'Ver Pacientes',
                    description: 'Lista de pacientes',
                    icon: 'users',
                    action: '/patients',
                    priority: 4
                }
            ];

            res.status(200).json({
                status: 'success',
                data: {
                    actions: quickActions,
                    timestamp: new Date().toISOString()
                }
            });
        } catch (error: any) {
            console.error('Error getting quick actions:', error);
            next(new AppError('Error al obtener acciones rápidas.', 500));
        }
    }
>>>>>>> nutri/main
}

export default new PatientController();