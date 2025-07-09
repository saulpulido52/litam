#!/usr/bin/env ts-node

import { AppDataSource } from '../../src/database/data-source';
import { User } from '../../src/database/entities/user.entity';
import { PatientNutritionistRelation } from '../../src/database/entities/patient_nutritionist_relation.entity';
import { Role } from '../../src/database/entities/role.entity';

// ===============================================
// VERIFICACIÓN DE REGISTRO DE ELIMINACIONES
// ===============================================
// Verifica que las eliminaciones se registren correctamente
// ===============================================

interface EliminationLog {
    patientId: string;
    patientName: string;
    patientEmail: string;
    nutritionistId: string;
    nutritionistName: string;
    nutritionistEmail: string;
    relationStatus: string;
    endedAt: Date | null;
    notes: string | null;
    updatedAt: Date;
}

async function verifyEliminationLogs() {
    try {
        console.log('🔍 ===============================================');
        console.log('🔍 VERIFICACIÓN DE REGISTRO DE ELIMINACIONES');
        console.log('🔍 ===============================================');

        // Conectar a la base de datos
        await AppDataSource.initialize();
        console.log('📡 Conexión a base de datos establecida');

        // Obtener todas las relaciones inactivas
        const inactiveRelations = await AppDataSource
            .getRepository(PatientNutritionistRelation)
            .createQueryBuilder('relation')
            .leftJoinAndSelect('relation.patient', 'patient')
            .leftJoinAndSelect('relation.nutritionist', 'nutritionist')
            .where('relation.status = :status', { status: 'inactive' })
            .orderBy('relation.updated_at', 'DESC')
            .getMany();

        console.log(`📋 Total relaciones inactivas encontradas: ${inactiveRelations.length}`);

        if (inactiveRelations.length === 0) {
            console.log('✅ No hay eliminaciones registradas');
            return;
        }

        console.log('\n📊 ===============================================');
        console.log('📊 REGISTRO DE ELIMINACIONES');
        console.log('📊 ===============================================');

        const eliminationLogs: EliminationLog[] = [];

        for (const relation of inactiveRelations) {
            const log: EliminationLog = {
                patientId: relation.patient.id,
                patientName: `${relation.patient.first_name} ${relation.patient.last_name}`,
                patientEmail: relation.patient.email,
                nutritionistId: relation.nutritionist.id,
                nutritionistName: `${relation.nutritionist.first_name} ${relation.nutritionist.last_name}`,
                nutritionistEmail: relation.nutritionist.email,
                relationStatus: relation.status,
                endedAt: relation.ended_at,
                notes: relation.notes,
                updatedAt: relation.updated_at
            };
            eliminationLogs.push(log);
        }

        // Mostrar logs de eliminación
        eliminationLogs.forEach((log, index) => {
            console.log(`\n🔴 ELIMINACIÓN #${index + 1}:`);
            console.log(`   👤 Paciente: ${log.patientName} (${log.patientEmail})`);
            console.log(`   👨‍⚕️ Nutriólogo: ${log.nutritionistName} (${log.nutritionistEmail})`);
            console.log(`   📅 Fecha de eliminación: ${log.updatedAt.toLocaleString()}`);
            console.log(`   📝 Notas: ${log.notes || 'Sin notas'}`);
            console.log(`   🏁 Estado: ${log.relationStatus}`);
            if (log.endedAt) {
                console.log(`   ⏰ Terminada en: ${log.endedAt.toLocaleString()}`);
            }
        });

        // Estadísticas
        console.log('\n📈 ===============================================');
        console.log('📈 ESTADÍSTICAS DE ELIMINACIONES');
        console.log('📈 ===============================================');

        const uniquePatients = new Set(eliminationLogs.map(log => log.patientId));
        const uniqueNutritionists = new Set(eliminationLogs.map(log => log.nutritionistId));

        console.log(`👥 Pacientes únicos eliminados: ${uniquePatients.size}`);
        console.log(`👨‍⚕️ Nutriólogos involucrados: ${uniqueNutritionists.size}`);
        console.log(`📋 Total eliminaciones registradas: ${eliminationLogs.length}`);

        // Verificar si hay pacientes activos que fueron eliminados
        const activePatients = await AppDataSource
            .getRepository(User)
            .createQueryBuilder('user')
            .leftJoin('user.role', 'role')
            .where('role.name = :role', { role: 'patient' })
            .andWhere('user.is_active = :active', { active: true })
            .getMany();

        const activePatientIds = new Set(activePatients.map(p => p.id));
        const eliminatedPatientIds = new Set(eliminationLogs.map(log => log.patientId));

        const stillActivePatients = eliminationLogs.filter(log => 
            activePatientIds.has(log.patientId)
        );

        console.log(`\n⚠️  Pacientes eliminados pero aún activos: ${stillActivePatients.length}`);
        
        if (stillActivePatients.length > 0) {
            console.log('\n🔍 Pacientes que aparecen como eliminados pero siguen activos:');
            stillActivePatients.forEach(log => {
                console.log(`   - ${log.patientName} (${log.patientEmail})`);
            });
        }

        console.log('\n✅ Verificación completada');

    } catch (error) {
        console.error('❌ Error durante la verificación:', error);
    } finally {
        await AppDataSource.destroy();
    }
}

// Ejecutar si se llama directamente
if (require.main === module) {
    verifyEliminationLogs();
}

export { verifyEliminationLogs }; 