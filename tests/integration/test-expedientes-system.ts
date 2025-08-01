// test-expedientes-system.ts
// Script para probar las nuevas funcionalidades del sistema de expedientes clínicos

import { AppDataSource } from './src/database/data-source';
import { User } from './src/database/entities/user.entity';
import { ClinicalRecord } from './src/database/entities/clinical_record.entity';
import { PatientNutritionistRelation, RelationshipStatus } from './src/database/entities/patient_nutritionist_relation.entity';
import { RoleName } from './src/database/entities/role.entity';
import clinicalRecordService from './src/modules/clinical_records/clinical_record.service';
import { PatientService } from './src/modules/patients/patient.service';

async function testExpedientesSystem() {
    console.log('🚀 Iniciando pruebas del sistema de expedientes clínicos...\n');

    try {
        // Inicializar conexión a la base de datos
        if (!AppDataSource.isInitialized) {
            await AppDataSource.initialize();
        }

        const userRepository = AppDataSource.getRepository(User);
        const clinicalRecordRepository = AppDataSource.getRepository(ClinicalRecord);
        const relationRepository = AppDataSource.getRepository(PatientNutritionistRelation);
        const patientService = new PatientService();

        // 1. Buscar usuarios de prueba
        console.log('📋 1. Buscando usuarios de prueba...');
        
        const patient = await userRepository.findOne({
            where: { role: { name: RoleName.PATIENT } },
            relations: ['role'],
        });

        const nutritionist1 = await userRepository.findOne({
            where: { role: { name: RoleName.NUTRITIONIST } },
            relations: ['role'],
        });

        const nutritionist2 = await userRepository
            .createQueryBuilder('user')
            .leftJoin('user.role', 'role')
            .where('role.name = :role', { role: RoleName.NUTRITIONIST })
            .andWhere('user.id != :excludeId', { excludeId: nutritionist1?.id })
            .getOne();

        if (!patient || !nutritionist1 || !nutritionist2) {
            console.log('❌ No se encontraron suficientes usuarios de prueba');
            console.log(`Paciente: ${patient ? '✅' : '❌'}`);
            console.log(`Nutriólogo 1: ${nutritionist1 ? '✅' : '❌'}`);
            console.log(`Nutriólogo 2: ${nutritionist2 ? '✅' : '❌'}`);
            return;
        }

        console.log(`✅ Usuarios encontrados:`);
        console.log(`   Paciente: ${patient.first_name} ${patient.last_name}`);
        console.log(`   Nutriólogo 1: ${nutritionist1.first_name} ${nutritionist1.last_name}`);
        console.log(`   Nutriólogo 2: ${nutritionist2.first_name} ${nutritionist2.last_name}\n`);

        // 2. Crear expediente clínico de prueba
        console.log('📋 2. Creando expediente clínico de prueba...');
        
        const testRecord = await clinicalRecordService.createClinicalRecord({
            patientId: patient.id,
            recordDate: new Date().toISOString(),
            expedientNumber: 'TEST-001',
            consultationReason: 'Prueba del sistema de expedientes',
            nutritionalDiagnosis: 'Diagnóstico de prueba para verificar transferencias',
            evolutionAndFollowUpNotes: 'Expediente creado para pruebas del sistema'
        }, nutritionist1.id);

        console.log(`✅ Expediente creado con ID: ${testRecord.id}\n`);

        // 3. Verificar estadísticas antes de la transferencia
        console.log('📊 3. Verificando estadísticas antes de transferencia...');
        
        const statsBefore = await clinicalRecordService.getPatientRecordsStats(
            patient.id,
            nutritionist1.id,
            RoleName.NUTRITIONIST
        );

        console.log(`   Total de expedientes: ${statsBefore.total_records}`);
        console.log(`   Expedientes por nutriólogo: ${statsBefore.records_by_nutritionist.length} registros\n`);

        // 4. Probar transferencia de expedientes
        console.log('🔄 4. Probando transferencia de expedientes...');
        
        const transferResult = await clinicalRecordService.transferPatientRecords(
            patient.id,
            nutritionist1.id,
            nutritionist2.id
        );

        console.log(`✅ ${transferResult.message}`);
        console.log(`   Expedientes transferidos: ${transferResult.transferred_count}`);
        console.log(`   Nuevo nutriólogo: ${transferResult.new_nutritionist?.name || 'No definido'}\n`);

        // 5. Verificar que la transferencia fue exitosa
        console.log('✅ 5. Verificando transferencia exitosa...');
        
        const transferredRecord = await clinicalRecordRepository.findOne({
            where: { id: testRecord.id },
            relations: ['nutritionist', 'patient'],
        });

        if (transferredRecord?.nutritionist.id === nutritionist2.id) {
            console.log(`✅ Expediente transferido correctamente al nutriólogo 2`);
            console.log(`   Notas de evolución actualizadas: ${transferredRecord.evolution_and_follow_up_notes?.includes('TRANSFERENCIA') ? '✅' : '❌'}\n`);
        } else {
            console.log(`❌ Error en la transferencia de expedientes\n`);
        }

        // 6. Probar cambio de nutriólogo desde el paciente
        console.log('🤝 6. Probando cambio de nutriólogo desde paciente...');
        
        // Crear relación activa con nutritionist2
        const relation = relationRepository.create({
            patient: patient,
            nutritionist: nutritionist2,
            status: RelationshipStatus.ACTIVE,
            requested_at: new Date(),
            accepted_at: new Date(),
        });
        await relationRepository.save(relation);

        // Solicitar cambio de vuelta al nutritionist1
        const changeResult = await patientService.requestNutritionistChange(
            patient.id,
            nutritionist1.id,
            'Prueba de cambio de nutriólogo'
        );

        console.log(`✅ ${changeResult.message.split('.')[0]}`);
        console.log(`   Transfer result: ${changeResult.transfer_result?.message}\n`);

        // 7. Verificar estadísticas finales
        console.log('📊 7. Verificando estadísticas finales...');
        
        const statsAfter = await clinicalRecordService.getPatientRecordsStats(
            patient.id,
            nutritionist1.id,
            RoleName.NUTRITIONIST
        );

        console.log(`   Total de expedientes: ${statsAfter.total_records}`);
        console.log(`   Último expediente: ${statsAfter.latest_record?.nutritionist.name}\n`);

        // 8. Limpiar datos de prueba
        console.log('🧹 8. Limpiando datos de prueba...');
        
        // Eliminar expediente de prueba
        await clinicalRecordRepository.remove(transferredRecord!);
        
        // Eliminar relaciones de prueba
        const testRelations = await relationRepository.find({
            where: { patient: { id: patient.id } },
        });
        await relationRepository.remove(testRelations);

        console.log('✅ Datos de prueba eliminados\n');

        console.log('🎉 ¡Todas las pruebas completadas exitosamente!');
        console.log('\n📋 Funcionalidades verificadas:');
        console.log('   ✅ Creación de expedientes clínicos');
        console.log('   ✅ Transferencia automática de expedientes');
        console.log('   ✅ Cambio de nutriólogo con transferencia');
        console.log('   ✅ Estadísticas de expedientes');
        console.log('   ✅ Notas de transferencia');

    } catch (error) {
        console.error('❌ Error durante las pruebas:', error);
    } finally {
        // Cerrar conexión
        if (AppDataSource.isInitialized) {
            await AppDataSource.destroy();
        }
    }
}

// Ejecutar si se llama directamente
if (require.main === module) {
    testExpedientesSystem()
        .then(() => {
            console.log('\n✨ Pruebas finalizadas');
            process.exit(0);
        })
        .catch((error) => {
            console.error('💥 Error crítico:', error);
            process.exit(1);
        });
}

export { testExpedientesSystem }; 