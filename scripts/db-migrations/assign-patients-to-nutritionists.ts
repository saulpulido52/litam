import { AppDataSource } from './src/database/data-source';
import { User } from './src/database/entities/user.entity';
import { Role, RoleName } from './src/database/entities/role.entity';
import { PatientNutritionistRelation, RelationshipStatus } from './src/database/entities/patient_nutritionist_relation.entity';

async function assignPatientsToNutritionists() {
  try {
    await AppDataSource.initialize();
    console.log('🔍 Conectando a base de datos...');

    const userRepo = AppDataSource.getRepository(User);
    const relationRepo = AppDataSource.getRepository(PatientNutritionistRelation);

    // Obtener todos los nutriólogos
    const nutritionists = await userRepo.find({
      where: { role: { name: RoleName.NUTRITIONIST } },
      relations: ['role']
    });

    // Obtener todos los pacientes
    const patients = await userRepo.find({
      where: { role: { name: RoleName.PATIENT } },
      relations: ['role']
    });

    console.log(`👨‍⚕️ Nutriólogos encontrados: ${nutritionists.length}`);
    console.log(`👥 Pacientes encontrados: ${patients.length}`);

    let assigned = 0;
    let skipped = 0;

    // Asignar pacientes a nutriólogos de manera equitativa
    for (let i = 0; i < patients.length; i++) {
      const patient = patients[i];
      const nutritionist = nutritionists[i % nutritionists.length];

      // Verificar si ya existe relación
      const existingRelation = await relationRepo.findOne({
        where: {
          patient: { id: patient.id },
          nutritionist: { id: nutritionist.id }
        }
      });

      if (existingRelation) {
        console.log(`⚠️ Ya existe: ${nutritionist.email} -> ${patient.email}`);
        skipped++;
        continue;
      }

      // Crear nueva relación
      const newRelation = relationRepo.create({
        patient: patient,
        nutritionist: nutritionist,
        status: RelationshipStatus.ACTIVE,
        requested_at: new Date(),
        accepted_at: new Date()
      });

      await relationRepo.save(newRelation);
      console.log(`✅ Asignado: ${nutritionist.email} -> ${patient.email}`);
      assigned++;
    }

    console.log(`\n📊 RESUMEN:`);
    console.log(`✅ Nuevas asignaciones: ${assigned}`);
    console.log(`⚠️ Ya existían: ${skipped}`);

    await AppDataSource.destroy();
    console.log('✅ Proceso completado');

  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

assignPatientsToNutritionists(); 