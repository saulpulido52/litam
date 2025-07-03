import { AppDataSource } from './src/database/data-source';
import { PatientNutritionistRelation, RelationshipStatus } from './src/database/entities/patient_nutritionist_relation.entity';
import { User } from './src/database/entities/user.entity';

async function createMultipleRelations() {
    try {
        if (!AppDataSource.isInitialized) {
            await AppDataSource.initialize();
        }

        const userRepo = AppDataSource.getRepository(User);
        const relationRepo = AppDataSource.getRepository(PatientNutritionistRelation);

        // Obtener todos los nutriólogos
        const nutritionists = await userRepo
            .createQueryBuilder('user')
            .leftJoinAndSelect('user.role', 'role')
            .where('role.name = :role', { role: 'nutritionist' })
            .getMany();

        // Obtener todos los pacientes
        const patients = await userRepo
            .createQueryBuilder('user')
            .leftJoinAndSelect('user.role', 'role')
            .where('role.name = :role', { role: 'patient' })
            .getMany();

        console.log(`🔍 Encontrados ${nutritionists.length} nutriólogos y ${patients.length} pacientes`);

        let relationsCreated = 0;
        let relationsSkipped = 0;

        // Asignar pacientes a nutriólogos de manera distribuida
        for (let i = 0; i < patients.length; i++) {
            const patient = patients[i];
            const nutritionist = nutritionists[i % nutritionists.length]; // Distribuir de manera circular

            // Verificar si ya existe una relación
            const existingRelation = await relationRepo
                .createQueryBuilder('relation')
                .where('relation.patient = :patientId', { patientId: patient.id })
                .andWhere('relation.nutritionist = :nutritionistId', { nutritionistId: nutritionist.id })
                .getOne();

            if (existingRelation) {
                console.log(`⚠️ Relación ya existe: ${nutritionist.email} -> ${patient.email}`);
                relationsSkipped++;
                continue;
            }

            // Crear nueva relación
            const newRelation = relationRepo.create({
                patient: patient,
                nutritionist: nutritionist,
                status: RelationshipStatus.ACTIVE,
                requested_at: new Date(),
                accepted_at: new Date(),
            });

            await relationRepo.save(newRelation);
            console.log(`✅ Creada relación: ${nutritionist.email} -> ${patient.email}`);
            relationsCreated++;
        }

        console.log(`\n📊 RESUMEN:`);
        console.log(`✅ Relaciones creadas: ${relationsCreated}`);
        console.log(`⚠️ Relaciones omitidas (ya existían): ${relationsSkipped}`);
        console.log(`🔗 Total relaciones procesadas: ${relationsCreated + relationsSkipped}`);

        await AppDataSource.destroy();
        console.log('✅ Proceso completado');

    } catch (error) {
        console.error('❌ Error:', error);
    }
}

createMultipleRelations(); 