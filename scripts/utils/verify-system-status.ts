import { AppDataSource } from './src/database/data-source';
import { PatientNutritionistRelation, RelationshipStatus } from './src/database/entities/patient_nutritionist_relation.entity';
import { User } from './src/database/entities/user.entity';

async function verifySystemStatus() {
  try {
    await AppDataSource.initialize();
    console.log('🔍 Verificando estado del sistema...\n');

    const relationRepository = AppDataSource.getRepository(PatientNutritionistRelation);
    const userRepository = AppDataSource.getRepository(User);

    const nutritionistId = 'dd58261c-a7aa-461f-a45d-4028dca0145a';

    // 1. Verificar relaciones activas
    console.log('1️⃣ Verificando relaciones activas...');
    const activeRelations = await relationRepository.find({
      where: {
        nutritionist: { id: nutritionistId },
        status: RelationshipStatus.ACTIVE
      },
      relations: ['patient', 'nutritionist']
    });

    console.log(`   ✅ ${activeRelations.length} relaciones activas encontradas\n`);

    // 2. Verificar que todos los pacientes existen
    console.log('2️⃣ Verificando existencia de pacientes...');
    for (const relation of activeRelations) {
      const patient = await userRepository.findOne({
        where: { id: relation.patient.id }
      });

      if (patient) {
        console.log(`   ✅ ${patient.first_name} ${patient.last_name} (${patient.email}) - ID: ${patient.id}`);
      } else {
        console.log(`   ❌ Paciente no encontrado: ${relation.patient.id}`);
      }
    }

    // 3. Verificar IDs problemáticos
    console.log('\n3️⃣ Verificando IDs problemáticos...');
    const problematicId = '73a9ef86-60fc-4b3a-b8a0-8b87998b86a8';
    const problematicPatient = await userRepository.findOne({
      where: { id: problematicId }
    });

    if (problematicPatient) {
      console.log(`   ⚠️  El ID problemático SÍ existe: ${problematicPatient.first_name} ${problematicPatient.last_name}`);
    } else {
      console.log(`   ✅ El ID problemático NO existe (correcto): ${problematicId}`);
    }

    // 4. Verificar relaciones con el ID problemático
    const problematicRelation = await relationRepository.findOne({
      where: {
        patient: { id: problematicId },
        nutritionist: { id: nutritionistId }
      }
    });

    if (problematicRelation) {
      console.log(`   ⚠️  Existe relación con el ID problemático: ${problematicRelation.status}`);
    } else {
      console.log(`   ✅ No existe relación con el ID problemático (correcto)`);
    }

    console.log('\n🎯 RESUMEN DEL SISTEMA:');
    console.log(`   • Relaciones activas: ${activeRelations.length}`);
    console.log(`   • Pacientes válidos: ${activeRelations.length}`);
    console.log(`   • ID problemático: ${problematicPatient ? 'EXISTE' : 'NO EXISTE'}`);
    console.log(`   • Relación problemática: ${problematicRelation ? 'EXISTE' : 'NO EXISTE'}`);

    if (!problematicPatient && !problematicRelation) {
      console.log('\n✅ SISTEMA EN ESTADO CORRECTO');
      console.log('   El frontend debería funcionar correctamente con los pacientes válidos.');
    } else {
      console.log('\n⚠️  PROBLEMAS DETECTADOS');
      console.log('   Se encontraron inconsistencias en la base de datos.');
    }

  } catch (error) {
    console.error('❌ Error verificando sistema:', error);
  } finally {
    await AppDataSource.destroy();
  }
}

verifySystemStatus(); 