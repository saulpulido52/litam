// src/modules/admin/admin.service.ts
import { Repository } from 'typeorm';
import { AppDataSource } from '../../database/data-source';
import { User } from '../../database/entities/user.entity';
import { Role, RoleName } from '../../database/entities/role.entity';
import { UserSubscription, SubscriptionStatus } from '../../database/entities/user_subscription.entity';
import { SubscriptionPlan, SubscriptionDurationType } from '../../database/entities/subscription_plan.entity'; // <-- AÑADIDO
import { NutritionistProfile } from '../../database/entities/nutritionist_profile.entity';
import { PatientNutritionistRelation, RelationshipStatus } from '../../database/entities/patient_nutritionist_relation.entity';
import { DietPlan } from '../../database/entities/diet_plan.entity';
import {
    AdminUpdateUserDto,
    AdminVerifyNutritionistDto,
    AdminUpdateUserSubscriptionDto,
} from '../../modules/admin/admin.dto';
import { AppError } from '../../utils/app.error';
import bcrypt from 'bcrypt';

class AdminService {
    private userRepository: Repository<User>;
    private roleRepository: Repository<Role>;
    private userSubscriptionRepository: Repository<UserSubscription>;
    private subscriptionPlanRepository: Repository<SubscriptionPlan>;
    private nutritionistProfileRepository: Repository<NutritionistProfile>;
    private relationRepository: Repository<PatientNutritionistRelation>;
    private dietPlanRepository: Repository<DietPlan>;

    constructor() {
        this.userRepository = AppDataSource.getRepository(User);
        this.roleRepository = AppDataSource.getRepository(Role);
        this.userSubscriptionRepository = AppDataSource.getRepository(UserSubscription);
        this.subscriptionPlanRepository = AppDataSource.getRepository(SubscriptionPlan);
        this.nutritionistProfileRepository = AppDataSource.getRepository(NutritionistProfile);
        this.relationRepository = AppDataSource.getRepository(PatientNutritionistRelation);
        this.dietPlanRepository = AppDataSource.getRepository(DietPlan);
    }

    // --- Gestión de Usuarios ---

    public async getAllUsers(role?: RoleName, isActive?: boolean, page: number = 1, limit: number = 20) {
        const skip = (page - 1) * limit;
        const whereClause: any = {};
        if (role) whereClause.role = { name: role };
        if (isActive !== undefined) whereClause.is_active = isActive;

        const [users, total] = await this.userRepository.findAndCount({
            where: whereClause,
            relations: ['role'],
            order: { created_at: 'DESC' },
            skip: skip,
            take: limit,
        });

        // Ocultar hashes de contraseña
        const usersWithoutHashes = users.map(user => {
            const { password_hash, ...userWithoutHash } = user;
            return userWithoutHash;
        });

        return {
            users: usersWithoutHashes,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        };
    }

    public async getUserById(userId: string) {
        const user = await this.userRepository.findOne({ where: { id: userId }, relations: ['role', 'patient_profile', 'nutritionist_profile'] });
        if (!user) {
            throw new AppError('Usuario no encontrado.', 404);
        }
        const { password_hash, ...userWithoutHash } = user;
        return userWithoutHash;
    }

    public async adminUpdateUser(userId: string, updateDto: AdminUpdateUserDto) {
        const user = await this.userRepository.findOne({ where: { id: userId }, relations: ['role'] });
        if (!user) {
            throw new AppError('Usuario no encontrado.', 404);
        }

        // Actualizar campos básicos
        if (updateDto.firstName !== undefined) user.first_name = updateDto.firstName;
        if (updateDto.lastName !== undefined) user.last_name = updateDto.lastName;
        if (updateDto.email !== undefined) {
            const existingEmail = await this.userRepository.findOneBy({ email: updateDto.email });
            if (existingEmail && existingEmail.id !== user.id) {
                throw new AppError('El email ya está en uso por otro usuario.', 409);
            }
            user.email = updateDto.email;
        }
        if (updateDto.isActive !== undefined) user.is_active = updateDto.isActive;

        // Cambiar rol (requiere cuidado, asegurarse de que el nuevo rol exista)
        if (updateDto.roleName !== undefined && updateDto.roleName !== user.role.name) {
            const newRole = await this.roleRepository.findOneBy({ name: updateDto.roleName });
            if (!newRole) {
                throw new AppError('Rol especificado no encontrado.', 400);
            }
            user.role = newRole;
        }

        // Resetear contraseña (requiere hasheo)
        if (updateDto.newPassword) {
            user.password_hash = await bcrypt.hash(updateDto.newPassword, 10);
            user.passwordChangedAt = new Date(); // Marcar que la contraseña fue cambiada
        }

        await this.userRepository.save(user);
        const { password_hash, ...userWithoutHash } = user;
        return userWithoutHash;
    }

    public async adminDeleteUser(userId: string) {
        const user = await this.userRepository.findOneBy({ id: userId });
        if (!user) {
            throw new AppError('Usuario no encontrado.', 404);
        }
        // No permitir eliminar administradores a menos que sea el único admin (lógica más compleja)
        if (user.role.name === RoleName.ADMIN) {
            throw new AppError('No se puede eliminar un usuario administrador directamente.', 403);
        }

        await this.userRepository.remove(user);
        return { message: 'Usuario eliminado con éxito.' };
    }

    public async adminVerifyNutritionist(nutritionistId: string, verifyDto: AdminVerifyNutritionistDto) {
        const nutritionist = await this.userRepository.findOne({
            where: { id: nutritionistId, role: { name: RoleName.NUTRITIONIST } },
            relations: ['nutritionist_profile'],
        });
        if (!nutritionist) {
            throw new AppError('Nutriólogo no encontrado o no tiene el rol de nutriólogo.', 404);
        }
        if (!nutritionist.nutritionist_profile) {
            throw new AppError('Perfil de nutriólogo no encontrado. El nutriólogo debe completar su perfil primero.', 400);
        }

        nutritionist.nutritionist_profile.is_verified = verifyDto.isVerified;
        await this.nutritionistProfileRepository.save(nutritionist.nutritionist_profile);
        return { message: `Estado de verificación de nutriólogo actualizado a ${verifyDto.isVerified}.` };
    }

    // --- Gestión de Suscripciones de Usuario (por Admin) ---

    public async getAllUserSubscriptions(status?: SubscriptionStatus, page: number = 1, limit: number = 20) {
        const skip = (page - 1) * limit;
        const whereClause: any = {};
        if (status) whereClause.status = status;

        const [subscriptions, total] = await this.userSubscriptionRepository.findAndCount({
            where: whereClause,
            relations: ['user', 'user.role', 'subscription_plan'],
            order: { created_at: 'DESC' },
            skip: skip,
            take: limit,
        });

        // Ocultar hash de contraseña de los usuarios
        const subscriptionsWithCleanUsers = subscriptions.map(sub => {
            const { password_hash, ...userWithoutHash } = sub.user;
            return { ...sub, user: userWithoutHash };
        });

        return {
            subscriptions: subscriptionsWithCleanUsers,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        };
    }

    public async adminUpdateUserSubscription(userSubscriptionId: string, updateDto: AdminUpdateUserSubscriptionDto) {
        const subscription = await this.userSubscriptionRepository.findOne({
            where: { id: userSubscriptionId },
            relations: ['user', 'subscription_plan'],
        });
        if (!subscription) {
            throw new AppError('Suscripción de usuario no encontrada.', 404);
        }

        // Cambiar plan de suscripción
        if (updateDto.planId !== undefined && updateDto.planId !== subscription.subscription_plan.id) {
            const newPlan = await this.subscriptionPlanRepository.findOneBy({ id: updateDto.planId });
            if (!newPlan) {
                throw new AppError('Nuevo plan de suscripción no encontrado.', 400);
            }
            subscription.subscription_plan = newPlan;
        }

        // Actualizar fechas
        if (updateDto.startDate !== undefined) subscription.start_date = new Date(updateDto.startDate);
        if (updateDto.endDate !== undefined) subscription.end_date = new Date(updateDto.endDate);

        // Actualizar estado
        if (updateDto.status !== undefined) {
            if (updateDto.status === SubscriptionStatus.CANCELLED) {
                subscription.cancelled_at = new Date();
                subscription.cancellation_reason = updateDto.cancelReason || 'Cancelado por administrador.';
            } else if (updateDto.status === SubscriptionStatus.ACTIVE) {
                 subscription.cancelled_at = null;
                 subscription.cancellation_reason = null;
            }
            subscription.status = updateDto.status;
        }

        // Forzar renovación (ej: para reintentar un pago fallido)
        if (updateDto.forceRenewal) {
            // Note: next_renewal_date no existe en la entidad actual
            // Esta funcionalidad requiere agregar campos adicionales a la entidad
        }

        await this.userSubscriptionRepository.save(subscription);
        return subscription;
    }

    public async adminDeleteUserSubscription(userSubscriptionId: string) {
        const subscription = await this.userSubscriptionRepository.findOneBy({ id: userSubscriptionId });
        if (!subscription) {
            throw new AppError('Suscripción de usuario no encontrada.', 404);
        }
        await this.userSubscriptionRepository.remove(subscription);
        return { message: 'Suscripción de usuario eliminada con éxito.' };
    }

    // --- HERRAMIENTAS DE INTEGRIDAD DE DATOS ---

    public async diagnosisDataIntegrity() {
        try {
            console.log('🩺 Ejecutando diagnóstico de integridad de datos...');

            // 1. Análisis de usuarios
            const users = await this.userRepository.find({
                relations: ['role'],
                order: { created_at: 'DESC' }
            });

            const nutritionists = users.filter(u => u.role.name === RoleName.NUTRITIONIST);
            const patients = users.filter(u => u.role.name === RoleName.PATIENT);
            const activeUsers = users.filter(u => u.is_active);

            // 2. Análisis de relaciones
            const relations = await this.relationRepository.find({
                relations: ['patient', 'nutritionist', 'patient.role', 'nutritionist.role'],
                order: { requested_at: 'DESC' }
            });

            const activeRelations = relations.filter(r => r.status === RelationshipStatus.ACTIVE);
            const inactiveRelations = relations.filter(r => r.status !== RelationshipStatus.ACTIVE);

            // 3. Análisis de planes de dieta
            const dietPlans = await this.dietPlanRepository.find({
                relations: ['patient', 'nutritionist'],
                order: { created_at: 'DESC' }
            });

            // 4. Detectar planes huérfanos
            const orphanPlans = [];
            for (const plan of dietPlans) {
                const hasActiveRelation = await this.relationRepository.findOne({
                    where: {
                        nutritionist: { id: plan.nutritionist.id },
                        patient: { id: plan.patient.id },
                        status: RelationshipStatus.ACTIVE
                    }
                });

                if (!hasActiveRelation) {
                    orphanPlans.push({
                        planId: plan.id,
                        planName: plan.name,
                        nutritionistEmail: plan.nutritionist?.email,
                        patientEmail: plan.patient?.email,
                        createdAt: plan.created_at,
                        status: plan.status,
                        reason: 'Sin relación activa'
                    });
                }
            }

            // 5. Estadísticas finales
            const diagnosis = {
                timestamp: new Date().toISOString(),
                users: {
                    total: users.length,
                    nutritionists: nutritionists.length,
                    patients: patients.length,
                    active: activeUsers.length,
                    inactive: users.length - activeUsers.length
                },
                relations: {
                    total: relations.length,
                    active: activeRelations.length,
                    inactive: inactiveRelations.length,
                    pending: relations.filter(r => r.status === RelationshipStatus.PENDING).length,
                    rejected: relations.filter(r => r.status === RelationshipStatus.REJECTED).length
                },
                dietPlans: {
                    total: dietPlans.length,
                    orphan: orphanPlans.length,
                    valid: dietPlans.length - orphanPlans.length
                },
                integrity: {
                    status: orphanPlans.length === 0 ? 'EXCELENTE' : 'PROBLEMAS_DETECTADOS',
                    hasProblems: orphanPlans.length > 0,
                    problemsCount: orphanPlans.length
                },
                orphanPlans: orphanPlans.slice(0, 20), // Limitar a 20 para el API
                recommendations: orphanPlans.length > 0 ? [
                    'Se detectaron planes huérfanos (sin relación activa)',
                    'Ejecutar reparación automática para crear relaciones necesarias',
                    'Verificar que no se hayan eliminado relaciones accidentalmente'
                ] : [
                    'No se detectaron problemas de integridad',
                    'Sistema funcionando correctamente'
                ]
            };

            console.log(`✅ Diagnóstico completado: ${diagnosis.integrity.status}`);
            return diagnosis;

        } catch (error) {
            console.error('❌ Error en diagnóstico de integridad:', error);
            throw new AppError('Error al ejecutar diagnóstico de integridad', 500);
        }
    }

    public async repairDataIntegrity(dryRun: boolean = true) {
        try {
            console.log(`🔧 Ejecutando reparación de integridad (${dryRun ? 'SIMULACIÓN' : 'REAL'})...`);

            // Obtener planes huérfanos
            const dietPlans = await this.dietPlanRepository.find({
                relations: ['patient', 'nutritionist']
            });

            const repairActions = [];
            const relationsToCreate = new Map();

            // Identificar relaciones que necesitan crearse
            for (const plan of dietPlans) {
                const hasActiveRelation = await this.relationRepository.findOne({
                    where: {
                        nutritionist: { id: plan.nutritionist.id },
                        patient: { id: plan.patient.id },
                        status: RelationshipStatus.ACTIVE
                    }
                });

                if (!hasActiveRelation) {
                    const relationKey = `${plan.nutritionist.id}_${plan.patient.id}`;
                    if (!relationsToCreate.has(relationKey)) {
                        relationsToCreate.set(relationKey, {
                            nutritionist_id: plan.nutritionist.id,
                            patient_id: plan.patient.id,
                            nutritionistEmail: plan.nutritionist?.email,
                            patientEmail: plan.patient?.email,
                            plansCount: 0,
                            planNames: []
                        });
                    }
                    
                    const relationData = relationsToCreate.get(relationKey);
                    relationData.plansCount++;
                    relationData.planNames.push(plan.name);
                }
            }

            // Ejecutar reparaciones si no es simulación
            let successCount = 0;
            let errorCount = 0;

            if (!dryRun && relationsToCreate.size > 0) {
                for (const [key, relationData] of relationsToCreate) {
                    try {
                        // Verificar que ambos usuarios existan y tengan roles correctos
                        const nutritionist = await this.userRepository.findOne({
                            where: { id: relationData.nutritionist_id },
                            relations: ['role']
                        });
                        
                        const patient = await this.userRepository.findOne({
                            where: { id: relationData.patient_id },
                            relations: ['role']
                        });

                        if (!nutritionist || !patient) {
                            errorCount++;
                            repairActions.push({
                                action: 'ERROR',
                                nutritionistEmail: relationData.nutritionistEmail,
                                patientEmail: relationData.patientEmail,
                                error: 'Usuario no encontrado'
                            });
                            continue;
                        }

                        if (nutritionist.role.name !== RoleName.NUTRITIONIST || patient.role.name !== RoleName.PATIENT) {
                            errorCount++;
                            repairActions.push({
                                action: 'ERROR',
                                nutritionistEmail: relationData.nutritionistEmail,
                                patientEmail: relationData.patientEmail,
                                error: 'Roles incorrectos'
                            });
                            continue;
                        }

                        // Crear la relación
                        const newRelation = new PatientNutritionistRelation();
                        newRelation.nutritionist = nutritionist;
                        newRelation.patient = patient;
                        newRelation.status = RelationshipStatus.ACTIVE;
                        newRelation.notes = 'Relación creada automáticamente para reparar integridad de datos';
                        newRelation.requested_at = new Date();
                        newRelation.accepted_at = new Date();

                        await this.relationRepository.save(newRelation);
                        successCount++;

                        repairActions.push({
                            action: 'CREATED',
                            nutritionistEmail: relationData.nutritionistEmail,
                            patientEmail: relationData.patientEmail,
                            plansCount: relationData.plansCount,
                            planNames: relationData.planNames.slice(0, 3) // Máximo 3 nombres
                        });

                    } catch (error: any) {
                        errorCount++;
                        repairActions.push({
                            action: 'ERROR',
                            nutritionistEmail: relationData.nutritionistEmail,
                            patientEmail: relationData.patientEmail,
                            error: error.message || 'Error desconocido'
                        });
                    }
                }
            } else {
                // Modo simulación - solo preparar acciones
                for (const [key, relationData] of relationsToCreate) {
                    repairActions.push({
                        action: 'SIMULATED',
                        nutritionistEmail: relationData.nutritionistEmail,
                        patientEmail: relationData.patientEmail,
                        plansCount: relationData.plansCount,
                        planNames: relationData.planNames.slice(0, 3)
                    });
                }
            }

            const result = {
                timestamp: new Date().toISOString(),
                mode: dryRun ? 'SIMULACIÓN' : 'EJECUCIÓN REAL',
                summary: {
                    relationsToCreate: relationsToCreate.size,
                    successfulCreations: successCount,
                    errors: errorCount,
                    totalActions: repairActions.length
                },
                actions: repairActions,
                message: dryRun 
                    ? `Simulación completada: ${relationsToCreate.size} relaciones serían creadas`
                    : `Reparación completada: ${successCount} relaciones creadas, ${errorCount} errores`
            };

            console.log(`✅ Reparación completada: ${result.message}`);
            return result;

        } catch (error) {
            console.error('❌ Error en reparación de integridad:', error);
            throw new AppError('Error al ejecutar reparación de integridad', 500);
        }
    }

    public async getSystemHealth() {
        try {
            // Métricas básicas del sistema
            const userCount = await this.userRepository.count();
            const activeUserCount = await this.userRepository.count({ where: { is_active: true } });
            const relationCount = await this.relationRepository.count();
            const activeRelationCount = await this.relationRepository.count({ where: { status: RelationshipStatus.ACTIVE } });
            const dietPlanCount = await this.dietPlanRepository.count();

            // Ejecutar diagnóstico rápido
            const diagnosis = await this.diagnosisDataIntegrity();

            return {
                timestamp: new Date().toISOString(),
                metrics: {
                    users: {
                        total: userCount,
                        active: activeUserCount,
                        activePercentage: Math.round((activeUserCount / userCount) * 100)
                    },
                    relations: {
                        total: relationCount,
                        active: activeRelationCount,
                        activePercentage: relationCount > 0 ? Math.round((activeRelationCount / relationCount) * 100) : 0
                    },
                    dietPlans: {
                        total: dietPlanCount
                    }
                },
                integrity: diagnosis.integrity,
                status: diagnosis.integrity.hasProblems ? 'WARNING' : 'HEALTHY',
                lastCheck: diagnosis.timestamp
            };

        } catch (error) {
            console.error('❌ Error obteniendo salud del sistema:', error);
            throw new AppError('Error al obtener métricas de salud del sistema', 500);
        }
    }
}

export default new AdminService();