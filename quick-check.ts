import { AppDataSource } from './src/database/data-source';
import { PatientNutritionistRelation, RelationshipStatus } from './src/database/entities/patient_nutritionist_relation.entity';

async function quickCheck() {
  await AppDataSource.initialize();
  
  const relationRepo = AppDataSource.getRepository(PatientNutritionistRelation);
  const activeRelations = await relationRepo.count({
    where: { status: RelationshipStatus.ACTIVE }
  });
  
  console.log('Relaciones activas:', activeRelations);
  
  if (activeRelations === 0) {
    console.log('⚠️ NO HAY RELACIONES - Creando relaciones de prueba...');
    // Aquí podríamos crear relaciones de prueba
  }
  
  await AppDataSource.destroy();
}

quickCheck().catch(console.error); 