import { AppDataSource } from './src/database/data-source';
import { PatientNutritionistRelation } from './src/database/entities/patient_nutritionist_relation.entity';
import { User } from './src/database/entities/user.entity';
import { NutritionistProfile } from './src/database/entities/nutritionist_profile.entity';

async function verifyRelations() {
    try {
        if (!AppDataSource.isInitialized) {
            await AppDataSource.initialize();
        }

        const userRepo = AppDataSource.getRepository(User);
        const nutritionists = await userRepo
            .createQueryBuilder('user')
            .leftJoinAndSelect('user.role', 'role')
            .where('role.name = :role', { role: 'nutritionist' })
            .getMany();

        console.log(' NUTRIÓLOGOS:', nutritionists.length);

        const relationRepo = AppDataSource.getRepository(PatientNutritionistRelation);
        const relations = await relationRepo
            .createQueryBuilder('relation')
            .leftJoinAndSelect('relation.nutritionist', 'nutritionist')
            .leftJoinAndSelect('nutritionist.user', 'nutri_user')
            .leftJoinAndSelect('relation.patient', 'patient')
            .leftJoinAndSelect('patient.user', 'patient_user')
            .where('relation.status = :status', { status: 'active' })
            .getMany();

        console.log(' RELACIONES:', relations.length);
        relations.forEach((rel, i) => {
            console.log(${i+1}.  -> );
        });

        await AppDataSource.destroy();
    } catch (error) {
        console.error('Error:', error.message);
    }
}

verifyRelations();
