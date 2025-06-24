import { AppDataSource } from './src/database/data-source';
import { PatientNutritionistRelation, RelationshipStatus } from './src/database/entities/patient_nutritionist_relation.entity';
import { User } from './src/database/entities/user.entity';

async function testMyPatients() {
  try {
    await AppDataSource.initialize();
    console.log('🔍 Verificando pacientes del nutricionista...\n');

    const relationRepository = AppDataSource.getRepository(PatientNutritionistRelation);
    const userRepository = AppDataSource.getRepository(User);

    const nutritionistId = 'dd58261c-a7aa-461f-a45d-4028dca0145a';

    // Obtener relaciones activas
    const activeRelations = await relationRepository.find({
      where: {
        nutritionist: { id: nutritionistId },
        status: RelationshipStatus.ACTIVE
      },
      relations: ['patient', 'nutritionist']
    });

    console.log(`📊 Total de relaciones activas: ${activeRelations.length}\n`);

    // Verificar cada paciente
    const problematicIds = ['73a9ef86-60fc-4b3a-b8a0-8b87998b86a8'];
    let problematicPatientsFound = 0;

    for (const relation of activeRelations) {
      const patient = relation.patient;
      const isProblematic = problematicIds.includes(patient.id);
      
      if (isProblematic) {
        problematicPatientsFound++;
        console.log(`⚠️  PACIENTE PROBLEMÁTICO ENCONTRADO:`);
      } else {
        console.log(`✅ Paciente válido:`);
      }
      
      console.log(`   ID: ${patient.id}`);
      console.log(`   Nombre: ${patient.first_name} ${patient.last_name}`);
      console.log(`   Email: ${patient.email}`);
      console.log(`   Activo: ${patient.is_active}`);
      console.log(`   Relación ID: ${relation.id}`);
      console.log(`   Relación Status: ${relation.status}`);
      console.log('');

      // Verificar que el paciente existe en la tabla users
      const userExists = await userRepository.findOne({
        where: { id: patient.id }
      });

      if (!userExists) {
        console.log(`❌ ERROR: El paciente ${patient.id} NO existe en la tabla users!\n`);
      } else {
        console.log(`✅ El paciente ${patient.id} existe en la tabla users\n`);
      }
    }

    console.log('🎯 RESUMEN:');
    console.log(`   • Relaciones activas: ${activeRelations.length}`);
    console.log(`   • Pacientes problemáticos encontrados: ${problematicPatientsFound}`);
    
    if (problematicPatientsFound > 0) {
      console.log('\n🚨 PROBLEMA DETECTADO:');
      console.log('   Hay pacientes con IDs problemáticos en las relaciones activas.');
      console.log('   Esto explica por qué el frontend está intentando acceder a pacientes inexistentes.');
    } else {
      console.log('\n✅ NO SE ENCONTRARON PROBLEMAS:');
      console.log('   Todos los pacientes en las relaciones activas tienen IDs válidos.');
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await AppDataSource.destroy();
  }
}

testMyPatients(); 