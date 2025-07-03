import { AppDataSource } from './src/database/data-source';
import { User } from './src/database/entities/user.entity';
import { PatientNutritionistRelation, RelationshipStatus } from './src/database/entities/patient_nutritionist_relation.entity';
import { RoleName } from './src/database/entities/role.entity';

async function checkRelations() {
  try {
    console.log('🔍 Conectando a base de datos...');
    await AppDataSource.initialize();

    const userRepo = AppDataSource.getRepository(User);
    const relationRepo = AppDataSource.getRepository(PatientNutritionistRelation);

    // Contar usuarios por rol
    const nutritionists = await userRepo.count({
      where: { role: { name: RoleName.NUTRITIONIST } }
    });
    
    const patients = await userRepo.count({
      where: { role: { name: RoleName.PATIENT } }
    });

    console.log(`👨‍⚕️ Nutriólogos: ${nutritionists}`);
    console.log(`👥 Pacientes: ${patients}`);

    // Verificar relaciones
    const totalRelations = await relationRepo.count();
    const activeRelations = await relationRepo.count({
      where: { status: RelationshipStatus.ACTIVE }
    });

    console.log(`🔗 Total relaciones: ${totalRelations}`);
    console.log(`✅ Relaciones activas: ${activeRelations}`);

    if (activeRelations === 0) {
      console.log('⚠️ NO HAY RELACIONES ACTIVAS');
      console.log('💡 Las tarjetas nutricionales necesitan relaciones activas para funcionar');
    } else {
      // Mostrar algunas relaciones
      const relations = await relationRepo.find({
        where: { status: RelationshipStatus.ACTIVE },
        relations: ['patient', 'nutritionist'],
        take: 5
      });

      console.log('\n📋 Relaciones activas:');
      relations.forEach((rel, i) => {
        const nutriName = rel.nutritionist?.first_name || 'N/A';
        const patientName = rel.patient?.first_name || 'N/A';
        console.log(`  ${i+1}. ${nutriName} ← → ${patientName}`);
      });
    }

    await AppDataSource.destroy();
    console.log('✅ Verificación completada');

  } catch (error) {
    console.error('❌ Error:', error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
}

checkRelations(); 