import 'dotenv/config';
import { AppDataSource } from './src/database/data-source';
import { User } from './src/database/entities/user.entity';
import { PatientNutritionistRelation, RelationshipStatus } from './src/database/entities/patient_nutritionist_relation.entity';
import { Role, RoleName } from './src/database/entities/role.entity';
import { In } from 'typeorm';

async function testMyPatients() {
    try {
        console.log('🔍 Verificando relaciones paciente-nutriólogo...');
        
        if (!AppDataSource.isInitialized) {
            await AppDataSource.initialize();
        }

        const userRepository = AppDataSource.getRepository(User);
        const relationRepository = AppDataSource.getRepository(PatientNutritionistRelation);

        // 1. Verificar que los nutriólogos existen
        console.log('\n👨‍⚕️ Verificando nutriólogos...');
        
        const nutritionists = await userRepository.find({
            where: {
                email: In(['dr.maria.gonzalez@demo.com', 'dr.juan.perez@demo.com', 'dra.carmen.rodriguez@demo.com']),
                role: { name: RoleName.NUTRITIONIST }
            },
            relations: ['role']
        });

        console.log(`✅ Nutriólogos encontrados: ${nutritionists.length}`);
        nutritionists.forEach(nutri => {
            console.log(`  - ${nutri.email} (ID: ${nutri.id})`);
        });

        // 2. Verificar todas las relaciones activas
        console.log('\n🔗 Verificando relaciones activas...');
        
        const activeRelations = await relationRepository.find({
            where: { status: RelationshipStatus.ACTIVE },
            relations: ['patient', 'nutritionist']
        });

        console.log(`✅ Relaciones activas totales: ${activeRelations.length}`);
        
        // Agrupar por nutriólogo
        const relationsByNutritionist = new Map<string, PatientNutritionistRelation[]>();
        
        activeRelations.forEach((relation: PatientNutritionistRelation) => {
            const nutriEmail = relation.nutritionist.email;
            if (!relationsByNutritionist.has(nutriEmail)) {
                relationsByNutritionist.set(nutriEmail, []);
            }
            relationsByNutritionist.get(nutriEmail)!.push(relation);
        });

        relationsByNutritionist.forEach((relations: PatientNutritionistRelation[], nutriEmail: string) => {
            console.log(`\n👨‍⚕️ ${nutriEmail}:`);
            console.log(`  📊 Total pacientes: ${relations.length}`);
            relations.forEach((relation: PatientNutritionistRelation) => {
                console.log(`    - ${relation.patient.first_name} ${relation.patient.last_name} (${relation.patient.email})`);
            });
        });

        // 3. Verificar específicamente Dr. María González
        console.log('\n🔍 Verificación específica para Dr. María González...');
        
        const mariaGonzalez = await userRepository.findOne({
            where: { email: 'dr.maria.gonzalez@demo.com' },
            relations: ['role']
        });

        if (mariaGonzalez) {
            console.log(`✅ Dr. María González encontrada (ID: ${mariaGonzalez.id})`);
            
            const mariaRelations = await relationRepository.find({
                where: { 
                    nutritionist: { id: mariaGonzalez.id },
                    status: RelationshipStatus.ACTIVE 
                },
                relations: ['patient', 'nutritionist']
            });

            console.log(`📊 Relaciones activas para Dr. María: ${mariaRelations.length}`);
            mariaRelations.forEach(relation => {
                console.log(`  - ${relation.patient.first_name} ${relation.patient.last_name} (${relation.patient.email})`);
            });

            // 4. Verificar si hay relaciones inactivas
            const inactiveRelations = await relationRepository.find({
                where: { 
                    nutritionist: { id: mariaGonzalez.id },
                    status: RelationshipStatus.INACTIVE 
                },
                relations: ['patient', 'nutritionist']
            });

            if (inactiveRelations.length > 0) {
                console.log(`⚠️ Relaciones inactivas para Dr. María: ${inactiveRelations.length}`);
                inactiveRelations.forEach(relation => {
                    console.log(`  - ${relation.patient.first_name} ${relation.patient.last_name} (${relation.patient.email}) - ${relation.status}`);
                });
            }
        } else {
            console.log('❌ Dr. María González no encontrada');
        }

        // 5. Verificar pacientes que deberían estar asignados
        console.log('\n👥 Verificando pacientes esperados...');
        
        const expectedPatients = [
            'ana.lopez@demo.com',
            'carlos.ruiz@demo.com', 
            'sofia.martinez@demo.com'
        ];

        for (const patientEmail of expectedPatients) {
            const patient = await userRepository.findOne({
                where: { email: patientEmail },
                relations: ['role']
            });

            if (patient) {
                console.log(`✅ ${patientEmail} existe (ID: ${patient.id})`);
                
                const patientRelations = await relationRepository.find({
                    where: { patient: { id: patient.id } },
                    relations: ['patient', 'nutritionist']
                });

                console.log(`  📊 Relaciones totales: ${patientRelations.length}`);
                patientRelations.forEach(relation => {
                    console.log(`    - Con ${relation.nutritionist.email} (${relation.status})`);
                });
            } else {
                console.log(`❌ ${patientEmail} no encontrado`);
            }
        }

        // 6. Verificar API endpoint
        console.log('\n🌐 Verificando endpoint /api/patients/my-patients...');
        console.log('💡 Para probar manualmente:');
        console.log('   1. Inicia sesión con dr.maria.gonzalez@demo.com');
        console.log('   2. Haz GET a http://localhost:4000/api/patients/my-patients');
        console.log('   3. Verifica el token JWT en el header Authorization');

    } catch (error) {
        console.error('❌ Error verificando relaciones:', error);
        throw error;
    } finally {
        if (AppDataSource.isInitialized) {
            await AppDataSource.destroy();
        }
    }
}

// Ejecutar el script
testMyPatients()
    .then(() => {
        console.log('\n✅ Verificación completada');
        process.exit(0);
    })
    .catch((error) => {
        console.error('❌ Error en la verificación:', error);
        process.exit(1);
    }); 