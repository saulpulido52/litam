import { AppDataSource } from './src/database/data-source';
import { PatientNutritionistRelation } from './src/database/entities/patient_nutritionist_relation.entity';
import { User } from './src/database/entities/user.entity';
import { NutritionistProfile } from './src/database/entities/nutritionist_profile.entity';
import { PatientProfile } from './src/database/entities/patient_profile.entity';

async function verifyRelationsDebug() {
    try {
        console.log('🔍 Iniciando verificación de relaciones...');
        
        if (!AppDataSource.isInitialized) {
            await AppDataSource.initialize();
            console.log('✅ Base de datos inicializada');
        }

        // 1. Verificar usuarios nutriólogos
        const userRepo = AppDataSource.getRepository(User);
        const nutritionists = await userRepo
            .createQueryBuilder('user')
            .leftJoinAndSelect('user.role', 'role')
            .where('role.name = :role', { role: 'nutritionist' })
            .getMany();

        console.log('👨‍⚕️ NUTRIÓLOGOS ENCONTRADOS:', nutritionists.length);
        nutritionists.forEach((nutri, i) => {
            console.log(`${i+1}. ${nutri.email} (ID: ${nutri.id})`);
        });

        // 2. Verificar pacientes
        const patients = await userRepo
            .createQueryBuilder('user')
            .leftJoinAndSelect('user.role', 'role')
            .where('role.name = :role', { role: 'patient' })
            .getMany();

        console.log('🏥 PACIENTES ENCONTRADOS:', patients.length);
        patients.forEach((patient, i) => {
            console.log(`${i+1}. ${patient.email} (ID: ${patient.id})`);
        });

        // 3. Verificar relaciones activas
        const relationRepo = AppDataSource.getRepository(PatientNutritionistRelation);
        const relations = await relationRepo
            .createQueryBuilder('relation')
            .leftJoinAndSelect('relation.nutritionist', 'nutritionist')
            .leftJoinAndSelect('relation.patient', 'patient')
            .where('relation.status = :status', { status: 'active' })
            .getMany();

        console.log('🔗 RELACIONES ACTIVAS:', relations.length);
        relations.forEach((rel, i) => {
            console.log(`${i+1}. Nutriólogo: ${rel.nutritionist.email} -> Paciente: ${rel.patient.email}`);
        });

        // 4. Verificar específicamente para cada nutriólogo
        console.log('🔍 VERIFICACIÓN POR NUTRIÓLOGO:');
        for (let nutri of nutritionists) {
            const nutriRelations = await relationRepo
                .createQueryBuilder('relation')
                .leftJoinAndSelect('relation.patient', 'patient')
                .where('relation.nutritionist = :nutriId', { nutriId: nutri.id })
                .andWhere('relation.status = :status', { status: 'active' })
                .getMany();

            console.log(`📋 ${nutri.email}: ${nutriRelations.length} pacientes`);
            nutriRelations.forEach((rel, i) => {
                console.log(`   ${i+1}. ${rel.patient.email}`);
            });
        }

        await AppDataSource.destroy();
        console.log('✅ Verificación completada');

    } catch (error) {
        console.error('❌ Error en verificación:', error);
    }
}

verifyRelationsDebug(); 