import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { Role, RoleName } from './src/database/entities/role.entity';
import { User } from './src/database/entities/user.entity';
import { NutritionistProfile } from './src/database/entities/nutritionist_profile.entity';
import { PatientProfile } from './src/database/entities/patient_profile.entity';
import { PatientNutritionistRelation } from './src/database/entities/patient_nutritionist_relation.entity';
import { Food } from './src/database/entities/food.entity';
import { MealItem } from './src/database/entities/meal_item.entity';
import { Meal } from './src/database/entities/meal.entity';
import { DietPlan } from './src/database/entities/diet_plan.entity';
import { Appointment } from './src/database/entities/appointment.entity';
import { NutritionistAvailability } from './src/database/entities/nutritionist_availability.entity';
import { PatientProgressLog } from './src/database/entities/patient_progress_log.entity';
import { SubscriptionPlan } from './src/database/entities/subscription_plan.entity';
import { UserSubscription } from './src/database/entities/user_subscription.entity';
import { PaymentTransaction } from './src/database/entities/payment_transaction.entity';
import { EducationalContent } from './src/database/entities/educational_content.entity';
import { Recipe, RecipeIngredient } from './src/database/entities/recipe.entity';
import { Conversation } from './src/database/entities/conversation.entity';
import { Message } from './src/database/entities/message.entity';
import { ClinicalRecord } from './src/database/entities/clinical_record.entity';
import bcrypt from 'bcrypt';

// Configuración directa de la base de datos
const DirectDataSource = new DataSource({
    type: 'postgres',
    host: 'localhost',
    port: 5432,
    username: 'postgres',
    password: '', // Sin password por defecto
    database: 'nutri_test',
    synchronize: true,
    logging: ['error'],
    entities: [
        User,
        Role,
        PatientProfile,
        NutritionistProfile,
        PatientNutritionistRelation,
        Food,
        MealItem,
        Meal,
        DietPlan,
        Appointment,
        NutritionistAvailability,
        PatientProgressLog,
        SubscriptionPlan,
        UserSubscription,
        PaymentTransaction,
        EducationalContent,
        Recipe,
        RecipeIngredient,
        Conversation,
        Message,
        ClinicalRecord,
    ]
});

async function addNewCredentialsDirect() {
    try {
        console.log('🌟 Agregando nuevas credenciales al sistema (conexión directa)...');
        console.log('🔧 Configuración de DB: postgres@localhost:5432/nutri_dev');
        
        if (!DirectDataSource.isInitialized) {
            await DirectDataSource.initialize();
            console.log('✅ Conexión a base de datos establecida');
        }

        // Obtener roles
        const roleRepository = DirectDataSource.getRepository(Role);
        const nutritionistRole = await roleRepository.findOne({ where: { name: RoleName.NUTRITIONIST } });
        const patientRole = await roleRepository.findOne({ where: { name: RoleName.PATIENT } });

        if (!nutritionistRole || !patientRole) {
            throw new Error('Roles no encontrados en la base de datos');
        }

        const userRepository = DirectDataSource.getRepository(User);
        const nutritionistProfileRepository = DirectDataSource.getRepository(NutritionistProfile);
        const patientProfileRepository = DirectDataSource.getRepository(PatientProfile);

        const hashedPassword = await bcrypt.hash('nutricion123', 12);

        // Nuevos nutriólogos
        const newNutritionists = [
            {
                email: 'dra.ana.martinez@nutri.com',
                firstName: 'Dra. Ana',
                lastName: 'Martínez Sánchez',
                specialties: ['Nutrición Oncológica', 'Terapia Nutricional'],
                consultationFee: 1600,
                bio: 'Especialista en nutrición oncológica con 7 años de experiencia.',
                licenseNumber: 'NUT-12345'
            },
            {
                email: 'dr.carlos.lopez@nutri.com',
                firstName: 'Dr. Carlos',
                lastName: 'López Herrera',
                specialties: ['Nutrición Geriátrica', 'Enfermedades Metabólicas'],
                consultationFee: 1400,
                bio: 'Especialista en nutrición geriátrica con 12 años de experiencia.',
                licenseNumber: 'NUT-12346'
            },
            {
                email: 'dra.patricia.torres@nutri.com',
                firstName: 'Dra. Patricia',
                lastName: 'Torres Morales',
                specialties: ['Nutrición Infantil', 'Trastornos Alimentarios'],
                consultationFee: 1300,
                bio: 'Especialista en nutrición infantil con 5 años de experiencia.',
                licenseNumber: 'NUT-12347'
            }
        ];

        // Nuevos pacientes
        const newPatients = [
            {
                email: 'maria.gonzalez@test.com',
                firstName: 'María',
                lastName: 'González López',
                age: 45,
                gender: 'female' as const,
                height: 162,
                weight: 70
            },
            {
                email: 'pedro.ramirez@test.com',
                firstName: 'Pedro',
                lastName: 'Ramírez Castro',
                age: 58,
                gender: 'male' as const,
                height: 175,
                weight: 88
            },
            {
                email: 'laura.jimenez@test.com',
                firstName: 'Laura',
                lastName: 'Jiménez Ruiz',
                age: 25,
                gender: 'female' as const,
                height: 165,
                weight: 52
            }
        ];

        // Crear nutriólogos
        console.log('\n👨‍⚕️ Creando nuevos nutriólogos...');
        for (const nutriData of newNutritionists) {
            let nutritionist = await userRepository.findOne({ 
                where: { email: nutriData.email },
                relations: ['role']
            });

            if (!nutritionist) {
                nutritionist = userRepository.create({
                    email: nutriData.email,
                    password_hash: hashedPassword,
                    first_name: nutriData.firstName,
                    last_name: nutriData.lastName,
                    age: 35,
                    gender: 'female',
                    role: nutritionistRole,
                    is_active: true
                });
                await userRepository.save(nutritionist);

                const nutritionistProfile = nutritionistProfileRepository.create({
                    user: nutritionist,
                    license_number: nutriData.licenseNumber,
                    specialties: nutriData.specialties,
                    years_of_experience: 8,
                    education: ['Licenciatura en Nutrición'],
                    certifications: ['Certificación en Nutrición Clínica'],
                    languages: ['Español', 'Inglés'],
                    consultation_fee: nutriData.consultationFee,
                    bio: nutriData.bio,
                    is_verified: true
                });
                await nutritionistProfileRepository.save(nutritionistProfile);

                console.log(`✅ Nutriólogo creado: ${nutriData.email}`);
            } else {
                console.log(`ℹ️ Nutriólogo ya existe: ${nutriData.email}`);
            }
        }

        // Crear pacientes
        console.log('\n👥 Creando nuevos pacientes...');
        for (const patientData of newPatients) {
            let patient = await userRepository.findOne({ 
                where: { email: patientData.email },
                relations: ['role']
            });

            if (!patient) {
                patient = userRepository.create({
                    email: patientData.email,
                    password_hash: hashedPassword,
                    first_name: patientData.firstName,
                    last_name: patientData.lastName,
                    age: patientData.age,
                    gender: patientData.gender,
                    role: patientRole,
                    is_active: true
                });
                await userRepository.save(patient);

                const patientProfile = patientProfileRepository.create({
                    user: patient,
                    height: patientData.height,
                    current_weight: patientData.weight,
                    medical_conditions: [],
                    allergies: [],
                    activity_level: 'moderate',
                    dietary_preferences: []
                });
                await patientProfileRepository.save(patientProfile);

                console.log(`✅ Paciente creado: ${patientData.email}`);
            } else {
                console.log(`ℹ️ Paciente ya existe: ${patientData.email}`);
            }
        }

        console.log('\n🎯 CREDENCIALES AGREGADAS:');
        console.log('\n👨‍⚕️ NUTRIÓLOGOS (password: nutricion123):');
        newNutritionists.forEach((nutri, index) => {
            console.log(`${index + 1}. ${nutri.firstName} ${nutri.lastName}`);
            console.log(`   📧 Email: ${nutri.email}`);
            console.log(`   🏥 Especialidades: ${nutri.specialties.join(', ')}`);
        });

        console.log('\n👥 PACIENTES (password: nutricion123):');
        newPatients.forEach((patient, index) => {
            console.log(`${index + 1}. ${patient.firstName} ${patient.lastName}`);
            console.log(`   📧 Email: ${patient.email}`);
        });

        console.log('\n🌐 URL del frontend: http://localhost:5000');
        
    } catch (error: any) {
        console.error('❌ Error agregando credenciales:', error.message || error);
        
        // Sugerencias de solución si falla la conexión
        if (error.message && error.message.includes('rol')) {
            console.log('\n💡 Sugerencias para resolver el problema:');
            console.log('1. Crear el usuario postgres en PostgreSQL:');
            console.log('   createuser -s postgres');
            console.log('2. O crear la base de datos con otro usuario:');
            console.log('   createdb nutri_dev');
            console.log('3. Verificar que PostgreSQL esté configurado correctamente');
        }
        
        throw error;
    } finally {
        if (DirectDataSource.isInitialized) {
            await DirectDataSource.destroy();
        }
    }
}

addNewCredentialsDirect()
    .then(() => {
        console.log('\n✅ Nuevas credenciales agregadas exitosamente');
        process.exit(0);
    })
    .catch((error) => {
        console.error('❌ Error en el script:', error.message || error);
        process.exit(1);
    }); 