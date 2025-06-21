import 'dotenv/config';
import { AppDataSource } from './src/database/data-source';
import { Role, RoleName } from '@/database/entities/role.entity';
import { User } from '@/database/entities/user.entity';
import { PatientNutritionistRelation, RelationshipStatus } from '@/database/entities/patient_nutritionist_relation.entity';

async function seedTestData() {
    try {
        console.log('🌱 Sembrando datos de prueba...');
        
        if (!AppDataSource.isInitialized) {
            await AppDataSource.initialize();
        }

        // 1. Crear roles básicos
        const roleRepository = AppDataSource.getRepository(Role);
        
        const patientRole = await roleRepository.findOne({ where: { name: RoleName.PATIENT } });
        if (!patientRole) {
            const newPatientRole = roleRepository.create({ name: RoleName.PATIENT });
            await roleRepository.save(newPatientRole);
            console.log('✅ Rol de paciente creado');
        } else {
            console.log('✅ Rol de paciente ya existe');
        }

        const nutritionistRole = await roleRepository.findOne({ where: { name: RoleName.NUTRITIONIST } });
        if (!nutritionistRole) {
            const newNutritionistRole = roleRepository.create({ name: RoleName.NUTRITIONIST });
            await roleRepository.save(newNutritionistRole);
            console.log('✅ Rol de nutricionista creado');
        } else {
            console.log('✅ Rol de nutricionista ya existe');
        }

        // 2. Crear relaciones de prueba para los tests de messaging
        const userRepository = AppDataSource.getRepository(User);
        const relationRepository = AppDataSource.getRepository(PatientNutritionistRelation);

        // Buscar usuarios existentes de las pruebas
        const testPatient = await userRepository.findOne({ 
            where: { email: 'patient.chat@example.com' },
            relations: ['role']
        });
        
        const testNutritionist = await userRepository.findOne({ 
            where: { email: 'nutri.chat@example.com' },
            relations: ['role']
        });

        if (testPatient && testNutritionist) {
            // Verificar si ya existe la relación
            const existingRelation = await relationRepository.findOne({
                where: {
                    patient: { id: testPatient.id },
                    nutritionist: { id: testNutritionist.id }
                }
            });

            if (!existingRelation) {
                const newRelation = relationRepository.create({
                    patient: testPatient,
                    nutritionist: testNutritionist,
                    status: RelationshipStatus.ACTIVE,
                    requested_at: new Date()
                });
                await relationRepository.save(newRelation);
                console.log('✅ Relación paciente-nutricionista creada para tests de messaging');
            } else {
                console.log('✅ Relación paciente-nutricionista ya existe');
            }
        }

        console.log('🎉 Datos de prueba sembrados exitosamente');
        
    } catch (error) {
        console.error('❌ Error sembrando datos de prueba:', error);
        throw error;
    } finally {
        if (AppDataSource.isInitialized) {
            await AppDataSource.destroy();
        }
    }
}

seedTestData(); 