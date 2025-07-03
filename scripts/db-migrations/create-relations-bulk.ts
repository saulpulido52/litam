import { AppDataSource } from './src/database/data-source';
import { PatientNutritionistRelation } from './src/database/entities/patient_nutritionist_relation.entity';
import { User } from './src/database/entities/user.entity';

async function createMultipleRelations() {
    try {
        if (!AppDataSource.isInitialized) {
            await AppDataSource.initialize();
        }

        const userRepo = AppDataSource.getRepository(User);
        const relationRepo = AppDataSource.getRepository(PatientNutritionistRelation);

        const nutritionists = await userRepo
            .createQueryBuilder('user')
            .leftJoinAndSelect('user.role', 'role')
            .where('role.name = :role', { role: 'nutritionist' })
            .getMany();

        const patients = await userRepo
            .createQueryBuilder('user')
            .leftJoinAndSelect('user.role', 'role')
            .where('role.name = :role', { role: 'patient' })
            .getMany();

        console.log(\ Encontrados \ nutriólogos y \ pacientes\);

        let relationsCreated = 0;

        for (let i = 0; i < patients.length; i++) {
            const patient = patients[i];
            const nutritionist = nutritionists[i % nutritionists.length];

            const existingRelation = await relationRepo
                .createQueryBuilder('relation')
                .where('relation.patient_user_id = :patientId', { patientId: patient.id })
                .andWhere('relation.nutritionist_user_id = :nutritionistId', { nutritionistId: nutritionist.id })
                .getOne();

            if (existingRelation) {
                continue;
            }

            const newRelation = new PatientNutritionistRelation();
            newRelation.patient_user_id = patient.id;
            newRelation.nutritionist_user_id = nutritionist.id;
            newRelation.status = 'active';
            newRelation.requested_at = new Date();
            newRelation.accepted_at = new Date();

            await relationRepo.save(newRelation);
            console.log(\ Creada: \ -> \\);
            relationsCreated++;
        }

        console.log(\\n Relaciones creadas: \\);
        await AppDataSource.destroy();

    } catch (error) {
        console.error(' Error:', error);
    }
}

createMultipleRelations();
