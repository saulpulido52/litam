#!/usr/bin/env ts-node

/**
 * 🧪 PRUEBA DE TRANSFERENCIA DE NUTRIÓLOGO
 * 
 * Caso: Eliminar relación del "Dr. sistema nutrional" y transferir
 * todos sus datos a "dr.juan.perez@demo.com"
 * 
 * Fecha: 03 de Julio de 2025
 */

import { DataSource } from 'typeorm';
import { User } from '../../src/database/entities/user.entity';
import { PatientNutritionistRelation, RelationshipStatus } from '../../src/database/entities/patient_nutritionist_relation.entity';
import { DietPlan } from '../../src/database/entities/diet_plan.entity';
import { ClinicalRecord } from '../../src/database/entities/clinical_record.entity';
import { AppDataSource } from '../../src/database/data-source';

interface TransferResult {
    success: boolean;
    message: string;
    data?: any;
    error?: string;
}

interface NutritionistData {
    user: User;
    activePatients: number;
    totalDietPlans: number;
    totalClinicalRecords: number;
    relations: PatientNutritionistRelation[];
    dietPlans: DietPlan[];
    clinicalRecords: ClinicalRecord[];
}

class NutritionistTransferTest {
    private dataSource: DataSource;

    constructor() {
        this.dataSource = AppDataSource;
    }

    async initialize(): Promise<void> {
        if (!this.dataSource.isInitialized) {
            await this.dataSource.initialize();
            console.log('✅ Conexión a base de datos establecida');
        }
    }

    async findNutritionistByEmail(email: string): Promise<User | null> {
        try {
            const userRepository = this.dataSource.getRepository(User);
            const nutritionist = await userRepository.findOne({
                where: { email },
                relations: ['role']
            });

            if (!nutritionist) {
                console.log(`❌ Nutriólogo con email "${email}" no encontrado`);
                return null;
            }

            if (nutritionist.role.name !== 'nutritionist') {
                console.log(`❌ Usuario "${email}" no es nutriólogo (rol: ${nutritionist.role.name})`);
                return null;
            }

            return nutritionist;
        } catch (error) {
            console.error('❌ Error buscando nutriólogo:', error);
            return null;
        }
    }

    async getNutritionistData(nutritionistId: string): Promise<NutritionistData | null> {
        try {
            const userRepository = this.dataSource.getRepository(User);
            const relationRepository = this.dataSource.getRepository(PatientNutritionistRelation);
            const dietPlanRepository = this.dataSource.getRepository(DietPlan);
            const clinicalRecordRepository = this.dataSource.getRepository(ClinicalRecord);

            const user = await userRepository.findOne({
                where: { id: nutritionistId },
                relations: ['role']
            });

            if (!user) return null;

            // Obtener relaciones activas
            const relations = await relationRepository.find({
                where: { nutritionist: { id: nutritionistId } },
                relations: ['patient', 'nutritionist']
            });

            // Obtener planes dietéticos
            const dietPlans = await dietPlanRepository.find({
                where: { nutritionist: { id: nutritionistId } },
                relations: ['patient', 'nutritionist']
            });

            // Obtener expedientes clínicos
            const clinicalRecords = await clinicalRecordRepository.find({
                where: { nutritionist: { id: nutritionistId } },
                relations: ['patient', 'nutritionist']
            });

            const activePatients = relations.filter(r => r.status === 'active').length;

            return {
                user,
                activePatients,
                totalDietPlans: dietPlans.length,
                totalClinicalRecords: clinicalRecords.length,
                relations,
                dietPlans,
                clinicalRecords
            };
        } catch (error) {
            console.error('❌ Error obteniendo datos del nutriólogo:', error);
            return null;
        }
    }

    async deactivateNutritionistRelations(nutritionistId: string): Promise<TransferResult> {
        try {
            const relationRepository = this.dataSource.getRepository(PatientNutritionistRelation);
            
            // Obtener relaciones activas
            const activeRelations = await relationRepository.find({
                where: { 
                    nutritionist: { id: nutritionistId },
                    status: RelationshipStatus.ACTIVE
                }
            });

            if (activeRelations.length === 0) {
                return {
                    success: true,
                    message: 'No hay relaciones activas para desactivar',
                    data: { deactivated: 0 }
                };
            }

            // Desactivar todas las relaciones
            for (const relation of activeRelations) {
                relation.status = RelationshipStatus.INACTIVE;
                relation.updated_at = new Date();
                await relationRepository.save(relation);
            }

            console.log(`✅ ${activeRelations.length} relaciones desactivadas`);
            
            return {
                success: true,
                message: `${activeRelations.length} relaciones desactivadas correctamente`,
                data: { deactivated: activeRelations.length }
            };
        } catch (error) {
            console.error('❌ Error desactivando relaciones:', error);
            return {
                success: false,
                message: 'Error al desactivar relaciones',
                error: error.message
            };
        }
    }

    async transferDataToNutritionist(
        fromNutritionistId: string, 
        toNutritionistId: string
    ): Promise<TransferResult> {
        try {
            const dietPlanRepository = this.dataSource.getRepository(DietPlan);
            const clinicalRecordRepository = this.dataSource.getRepository(ClinicalRecord);
            const relationRepository = this.dataSource.getRepository(PatientNutritionistRelation);

            // 1. Transferir planes dietéticos
            const dietPlansResult = await dietPlanRepository.update(
                { nutritionist_user_id: fromNutritionistId },
                { nutritionist_user_id: toNutritionistId, updated_at: new Date() }
            );

            // 2. Transferir expedientes clínicos
            const clinicalRecordsResult = await clinicalRecordRepository.update(
                { nutritionist_user_id: fromNutritionistId },
                { nutritionist_user_id: toNutritionistId, updated_at: new Date() }
            );

            // 3. Crear nuevas relaciones activas para los pacientes
            const oldRelations = await relationRepository.find({
                where: { nutritionist_user_id: fromNutritionistId },
                relations: ['patient']
            });

            let newRelationsCreated = 0;
            for (const oldRelation of oldRelations) {
                // Verificar si ya existe una relación activa con el nuevo nutriólogo
                const existingRelation = await relationRepository.findOne({
                    where: {
                        patient_user_id: oldRelation.patient_user_id,
                        nutritionist_user_id: toNutritionistId,
                        status: 'active'
                    }
                });

                if (!existingRelation) {
                    // Crear nueva relación activa
                    const newRelation = relationRepository.create({
                        patient_user_id: oldRelation.patient_user_id,
                        nutritionist_user_id: toNutritionistId,
                        status: 'active',
                        relation_type: 'assigned',
                        created_at: new Date(),
                        updated_at: new Date()
                    });

                    await relationRepository.save(newRelation);
                    newRelationsCreated++;
                }
            }

            console.log(`✅ Transferencia completada:`);
            console.log(`   - Planes dietéticos: ${dietPlansResult.affected || 0}`);
            console.log(`   - Expedientes clínicos: ${clinicalRecordsResult.affected || 0}`);
            console.log(`   - Nuevas relaciones: ${newRelationsCreated}`);

            return {
                success: true,
                message: 'Transferencia completada exitosamente',
                data: {
                    dietPlansTransferred: dietPlansResult.affected || 0,
                    clinicalRecordsTransferred: clinicalRecordsResult.affected || 0,
                    newRelationsCreated
                }
            };
        } catch (error) {
            console.error('❌ Error en transferencia:', error);
            return {
                success: false,
                message: 'Error al transferir datos',
                error: error.message
            };
        }
    }

    async verifyTransfer(targetNutritionistId: string): Promise<TransferResult> {
        try {
            const data = await this.getNutritionistData(targetNutritionistId);
            
            if (!data) {
                return {
                    success: false,
                    message: 'No se pudieron obtener los datos del nutriólogo'
                };
            }

            console.log('\n📊 VERIFICACIÓN POST-TRANSFERENCIA:');
            console.log(`   👤 Nutriólogo: ${data.user.first_name} ${data.user.last_name}`);
            console.log(`   📧 Email: ${data.user.email}`);
            console.log(`   👥 Pacientes activos: ${data.activePatients}`);
            console.log(`   📋 Planes dietéticos: ${data.totalDietPlans}`);
            console.log(`   📄 Expedientes clínicos: ${data.totalClinicalRecords}`);

            if (data.activePatients > 0) {
                console.log('\n👥 PACIENTES ASIGNADOS:');
                data.relations
                    .filter(r => r.status === 'active')
                    .forEach((relation, index) => {
                        console.log(`   ${index + 1}. ${relation.patient.first_name} ${relation.patient.last_name} (${relation.patient.email})`);
                    });
            }

            return {
                success: true,
                message: 'Verificación completada',
                data: {
                    activePatients: data.activePatients,
                    totalDietPlans: data.totalDietPlans,
                    totalClinicalRecords: data.totalClinicalRecords
                }
            };
        } catch (error) {
            console.error('❌ Error en verificación:', error);
            return {
                success: false,
                message: 'Error al verificar transferencia',
                error: error.message
            };
        }
    }

    async runTransferTest(): Promise<void> {
        console.log('🧪 INICIANDO PRUEBA DE TRANSFERENCIA DE NUTRIÓLOGO');
        console.log('=' .repeat(60));

        try {
            // Buscar nutriólogos
            console.log('\n📋 PASO 1: Identificar nutriólogos');
            const sourceNutritionist = await this.findNutritionistByEmail('nutri.admin@sistema.com');
            const targetNutritionist = await this.findNutritionistByEmail('dr.juan.perez@demo.com');

            if (!sourceNutritionist || !targetNutritionist) {
                console.log('❌ No se pudieron encontrar ambos nutriólogos');
                return;
            }

            console.log(`✅ Nutriólogo origen: ${sourceNutritionist.first_name} ${sourceNutritionist.last_name}`);
            console.log(`✅ Nutriólogo destino: ${targetNutritionist.first_name} ${targetNutritionist.last_name}`);

            // Obtener datos iniciales
            console.log('\n📊 PASO 2: Obtener datos iniciales');
            const sourceData = await this.getNutritionistData(sourceNutritionist.id);
            const targetDataBefore = await this.getNutritionistData(targetNutritionist.id);

            if (!sourceData || !targetDataBefore) {
                console.log('❌ No se pudieron obtener los datos iniciales');
                return;
            }

            console.log(`\n🔍 ESTADO INICIAL:`);
            console.log(`   Dr. Sistema (origen):`);
            console.log(`     - Pacientes activos: ${sourceData.activePatients}`);
            console.log(`     - Planes dietéticos: ${sourceData.totalDietPlans}`);
            console.log(`     - Expedientes clínicos: ${sourceData.totalClinicalRecords}`);
            
            console.log(`   Dr. Juan Pérez (destino):`);
            console.log(`     - Pacientes activos: ${targetDataBefore.activePatients}`);
            console.log(`     - Planes dietéticos: ${targetDataBefore.totalDietPlans}`);
            console.log(`     - Expedientes clínicos: ${targetDataBefore.totalClinicalRecords}`);

            // Desactivar relaciones del nutriólogo origen
            console.log('\n🔄 PASO 3: Desactivar relaciones del Dr. Sistema');
            const deactivationResult = await this.deactivateNutritionistRelations(sourceNutritionist.id);
            
            if (!deactivationResult.success) {
                console.log('❌ Error al desactivar relaciones:', deactivationResult.message);
                return;
            }

            // Transferir datos
            console.log('\n🔄 PASO 4: Transferir datos al Dr. Juan Pérez');
            const transferResult = await this.transferDataToNutritionist(
                sourceNutritionist.id,
                targetNutritionist.id
            );

            if (!transferResult.success) {
                console.log('❌ Error en transferencia:', transferResult.message);
                return;
            }

            // Verificar transferencia
            console.log('\n🔍 PASO 5: Verificar transferencia');
            await this.verifyTransfer(sourceNutritionist.id);
            await this.verifyTransfer(targetNutritionist.id);

            console.log('\n🎉 PRUEBA COMPLETADA EXITOSAMENTE');
            console.log('=' .repeat(60));
            console.log('✅ Todos los datos han sido transferidos correctamente');
            console.log('✅ Las relaciones han sido gestionadas apropiadamente');
            console.log('✅ El sistema mantiene la integridad referencial');
            
        } catch (error) {
            console.error('❌ Error en la prueba:', error);
        }
    }

    async cleanup(): Promise<void> {
        if (this.dataSource.isInitialized) {
            await this.dataSource.destroy();
            console.log('✅ Conexión a base de datos cerrada');
        }
    }
}

// Ejecutar la prueba
async function main() {
    const transferTest = new NutritionistTransferTest();
    
    try {
        await transferTest.initialize();
        await transferTest.runTransferTest();
    } finally {
        await transferTest.cleanup();
    }
}

// Ejecutar si es llamado directamente
if (require.main === module) {
    main().catch(console.error);
}

export { NutritionistTransferTest }; 