#!/usr/bin/env ts-node

import { AppDataSource } from '../../src/database/data-source';
import { User } from '../../src/database/entities/user.entity';
import { PatientNutritionistRelation } from '../../src/database/entities/patient_nutritionist_relation.entity';
import { Role } from '../../src/database/entities/role.entity';
import { RelationshipStatus } from '../../src/database/entities/patient_nutritionist_relation.entity';

// ===============================================
// VALIDACIÓN: UN PACIENTE = UN NUTRIÓLOGO
// ===============================================
// Regla de negocio: Cada paciente debe tener solo UN nutriólogo activo
// Los nutriólogos pueden tener MÚLTIPLES pacientes
// ===============================================

interface ValidationResult {
    isValid: boolean;
    issues: {
        patientId: string;
        patientEmail: string;
        patientName: string;
        nutritionistIds: string[];
        nutritionistEmails: string[];
        nutritionistNames: string[];
        message: string;
    }[];
    summary: {
        totalPatients: number;
        patientsWithMultipleNutritionists: number;
        patientsWithNoNutritionist: number;
        patientsWithOneNutritionist: number;
    };
}

async function validatePatientNutritionistRelations(): Promise<ValidationResult> {
    console.log('🩺 ===============================================');
    console.log('🩺 VALIDACIÓN: UN PACIENTE = UN NUTRIÓLOGO');
    console.log('🩺 Regla de negocio: Cada paciente debe tener solo UN nutriólogo activo');
    console.log('🩺 ===============================================\n');

    const issues: ValidationResult['issues'] = [];
    let totalPatients = 0;
    let patientsWithMultipleNutritionists = 0;
    let patientsWithNoNutritionist = 0;
    let patientsWithOneNutritionist = 0;

    try {
        // Obtener todos los pacientes
        const patients = await AppDataSource
            .getRepository(User)
            .createQueryBuilder('user')
            .leftJoinAndSelect('user.role', 'role')
            .where('role.name = :roleName', { roleName: 'patient' })
            .andWhere('user.is_active = :isActive', { isActive: true })
            .getMany();

        totalPatients = patients.length;
        console.log(`📊 Total pacientes activos: ${totalPatients}`);

        // Verificar cada paciente
        for (const patient of patients) {
            console.log(`\n🔍 Validando paciente: ${patient.first_name} ${patient.last_name} (${patient.email})`);

            // Obtener todas las relaciones activas del paciente
            const activeRelations = await AppDataSource
                .getRepository(PatientNutritionistRelation)
                .createQueryBuilder('relation')
                .leftJoinAndSelect('relation.nutritionist', 'nutritionist')
                .where('relation.patient_user_id = :patientId', { patientId: patient.id })
                .andWhere('relation.status = :status', { status: RelationshipStatus.ACTIVE })
                .getMany();

            console.log(`   📋 Relaciones activas encontradas: ${activeRelations.length}`);

            if (activeRelations.length === 0) {
                // Paciente sin nutriólogo
                patientsWithNoNutritionist++;
                issues.push({
                    patientId: patient.id,
                    patientEmail: patient.email,
                    patientName: `${patient.first_name} ${patient.last_name}`,
                    nutritionistIds: [],
                    nutritionistEmails: [],
                    nutritionistNames: [],
                    message: 'Paciente sin nutriólogo asignado'
                });
                console.log(`   ❌ PROBLEMA: Paciente sin nutriólogo asignado`);
            } else if (activeRelations.length === 1) {
                // Paciente con un nutriólogo (CORRECTO)
                patientsWithOneNutritionist++;
                const nutritionist = activeRelations[0].nutritionist;
                console.log(`   ✅ CORRECTO: Un nutriólogo asignado - ${nutritionist.first_name} ${nutritionist.last_name} (${nutritionist.email})`);
            } else {
                // Paciente con múltiples nutriólogos (PROBLEMA)
                patientsWithMultipleNutritionists++;
                const nutritionistIds = activeRelations.map(r => r.nutritionist.id);
                const nutritionistEmails = activeRelations.map(r => r.nutritionist.email);
                const nutritionistNames = activeRelations.map(r => `${r.nutritionist.first_name} ${r.nutritionist.last_name}`);

                issues.push({
                    patientId: patient.id,
                    patientEmail: patient.email,
                    patientName: `${patient.first_name} ${patient.last_name}`,
                    nutritionistIds,
                    nutritionistEmails,
                    nutritionistNames,
                    message: `Paciente con ${activeRelations.length} nutriólogos activos`
                });

                console.log(`   ❌ PROBLEMA: Paciente con ${activeRelations.length} nutriólogos activos:`);
                activeRelations.forEach((relation, index) => {
                    const nutritionist = relation.nutritionist;
                    console.log(`      ${index + 1}. ${nutritionist.first_name} ${nutritionist.last_name} (${nutritionist.email})`);
                });
            }
        }

        // Generar resumen
        const summary = {
            totalPatients,
            patientsWithMultipleNutritionists,
            patientsWithNoNutritionist,
            patientsWithOneNutritionist
        };

        console.log('\n📊 ===============================================');
        console.log('📊 RESUMEN DE VALIDACIÓN');
        console.log('📊 ===============================================');
        console.log(`👥 Total pacientes: ${summary.totalPatients}`);
        console.log(`✅ Pacientes con UN nutriólogo: ${summary.patientsWithOneNutritionist}`);
        console.log(`❌ Pacientes con MÚLTIPLES nutriólogos: ${summary.patientsWithMultipleNutritionists}`);
        console.log(`⚠️  Pacientes SIN nutriólogo: ${summary.patientsWithNoNutritionist}`);

        // Mostrar también pacientes inactivos
        const inactivePatients = await AppDataSource
            .getRepository(User)
            .createQueryBuilder('user')
            .leftJoinAndSelect('user.role', 'role')
            .where('role.name = :roleName', { roleName: 'patient' })
            .andWhere('user.is_active = :isActive', { isActive: false })
            .getMany();

        console.log(`\n📋 PACIENTES INACTIVOS: ${inactivePatients.length}`);
        if (inactivePatients.length > 0) {
            console.log('   Los siguientes pacientes están marcados como inactivos:');
            inactivePatients.forEach(patient => {
                console.log(`   - ${patient.first_name} ${patient.last_name} (${patient.email})`);
            });
        }

        // Mostrar relaciones inactivas
        const inactiveRelations = await AppDataSource
            .getRepository(PatientNutritionistRelation)
            .createQueryBuilder('relation')
            .leftJoinAndSelect('relation.patient', 'patient')
            .leftJoinAndSelect('relation.nutritionist', 'nutritionist')
            .where('relation.status = :status', { status: RelationshipStatus.INACTIVE })
            .getMany();

        console.log(`\n📋 RELACIONES INACTIVAS: ${inactiveRelations.length}`);
        if (inactiveRelations.length > 0) {
            console.log('   Las siguientes relaciones están marcadas como inactivas:');
            inactiveRelations.forEach(relation => {
                console.log(`   - ${relation.patient.first_name} ${relation.patient.last_name} ↔ ${relation.nutritionist.first_name} ${relation.nutritionist.last_name} (${relation.notes || 'Sin notas'})`);
            });
        }

        const isValid = summary.patientsWithMultipleNutritionists === 0 && summary.patientsWithNoNutritionist === 0;

        if (isValid) {
            console.log('\n🎉 ¡VALIDACIÓN EXITOSA!');
            console.log('✅ Todos los pacientes cumplen con la regla de negocio');
        } else {
            console.log('\n🚨 PROBLEMAS DETECTADOS:');
            console.log('❌ Algunos pacientes no cumplen con la regla de negocio');
        }

        return {
            isValid,
            issues,
            summary
        };

    } catch (error) {
        console.error('❌ Error durante la validación:', error);
        throw error;
    }
}

// Función para reparar problemas detectados
async function repairPatientNutritionistIssues(issues: ValidationResult['issues']): Promise<void> {
    console.log('\n🔧 ===============================================');
    console.log('🔧 REPARACIÓN DE PROBLEMAS DETECTADOS');
    console.log('🔧 ===============================================');

    for (const issue of issues) {
        console.log(`\n🔍 Reparando problema para: ${issue.patientName} (${issue.patientEmail})`);
        console.log(`📝 Problema: ${issue.message}`);

        if (issue.nutritionistIds.length === 0) {
            // Paciente sin nutriólogo - asignar al nutriólogo por defecto
            console.log('   ➤ Asignando nutriólogo por defecto...');
            
            const defaultNutritionist = await AppDataSource
                .getRepository(User)
                .createQueryBuilder('user')
                .leftJoinAndSelect('user.role', 'role')
                .where('role.name = :roleName', { roleName: 'nutritionist' })
                .andWhere('user.is_active = :isActive', { isActive: true })
                .orderBy('user.created_at', 'ASC')
                .getOne();

            if (defaultNutritionist) {
                const patient = await AppDataSource.getRepository(User).findOneByOrFail({ id: issue.patientId });
                const newRelation = AppDataSource.getRepository(PatientNutritionistRelation).create({
                    patient,
                    nutritionist: defaultNutritionist,
                    status: RelationshipStatus.ACTIVE,
                    requested_at: new Date(),
                    accepted_at: new Date(),
                    notes: 'Relación creada automáticamente para cumplir regla de negocio'
                });

                await AppDataSource.getRepository(PatientNutritionistRelation).save(newRelation);
                console.log(`   ✅ Asignado a: ${defaultNutritionist.first_name} ${defaultNutritionist.last_name}`);
            } else {
                console.log('   ❌ No se encontró nutriólogo por defecto');
            }
        } else if (issue.nutritionistIds.length > 1) {
            // Paciente con múltiples nutriólogos - mantener solo el más reciente
            console.log('   ➤ Manteniendo solo el nutriólogo más reciente...');
            
            // Obtener la relación más reciente
            const latestRelation = await AppDataSource
                .getRepository(PatientNutritionistRelation)
                .createQueryBuilder('relation')
                .where('relation.patient_user_id = :patientId', { patientId: issue.patientId })
                .andWhere('relation.status = :status', { status: RelationshipStatus.ACTIVE })
                .orderBy('relation.accepted_at', 'DESC')
                .leftJoinAndSelect('relation.nutritionist', 'nutritionist')
                .getOne();

            if (latestRelation) {
                // Desactivar todas las relaciones excepto la más reciente
                await AppDataSource
                    .getRepository(PatientNutritionistRelation)
                    .createQueryBuilder()
                    .update(PatientNutritionistRelation)
                    .set({
                        status: RelationshipStatus.INACTIVE,
                        ended_at: new Date(),
                        notes: 'Relación desactivada automáticamente para cumplir regla de negocio'
                    })
                    .where('patient_user_id = :patientId', { patientId: issue.patientId })
                    .andWhere('status = :status', { status: RelationshipStatus.ACTIVE })
                    .andWhere('id != :relationId', { relationId: latestRelation.id })
                    .execute();

                console.log(`   ✅ Mantenido nutriólogo: ${latestRelation.nutritionist.first_name} ${latestRelation.nutritionist.last_name} (${latestRelation.nutritionist.email})`);
            }
        }
    }

    console.log('\n✅ Reparación completada');
}

// Función principal
async function main() {
    try {
        // Inicializar conexión a base de datos
        await AppDataSource.initialize();
        console.log('📡 Conexión a base de datos establecida');

        // Ejecutar validación
        const result = await validatePatientNutritionistRelations();

        // Si hay problemas y se solicita reparación
        if (!result.isValid && process.argv.includes('--reparar')) {
            console.log('\n🔧 Iniciando reparación automática...');
            await repairPatientNutritionistIssues(result.issues);
            
            // Re-validar después de la reparación
            console.log('\n🔄 Re-validando después de la reparación...');
            const revalidationResult = await validatePatientNutritionistRelations();
            
            if (revalidationResult.isValid) {
                console.log('\n🎉 ¡Reparación exitosa!');
                process.exit(0);
            } else {
                console.log('\n⚠️  Algunos problemas persisten después de la reparación');
                process.exit(1);
            }
        } else if (!result.isValid) {
            console.log('\n💡 Para reparar automáticamente, ejecuta:');
            console.log('   npx ts-node scripts/utils/validacion-relaciones-paciente-nutriologo.ts --reparar');
            process.exit(1);
        } else {
            process.exit(0);
        }

    } catch (error) {
        console.error('\n❌ Error durante la ejecución:', error);
        process.exit(1);
    } finally {
        if (AppDataSource.isInitialized) {
            await AppDataSource.destroy();
        }
    }
}

// Ejecutar si es llamado directamente
if (require.main === module) {
    main();
}

export { validatePatientNutritionistRelations, repairPatientNutritionistIssues }; 