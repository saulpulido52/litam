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

// Múltiples configuraciones de base de datos para probar
const dbConfigs = [
    {
        name: 'postgres (sin password)',
        config: {
            username: 'postgres',
            password: '',
            database: 'postgres'
        }
    },
    {
        name: 'saulh (usuario sistema)',
        config: {
            username: 'saulh',
            password: '',
            database: 'postgres'
        }
    },
    {
        name: 'Usuario por defecto',
        config: {
            username: process.env.USERNAME || process.env.USER || 'postgres',
            password: '',
            database: 'postgres'
        }
    }
];

async function testConnection(configName: string, config: any): Promise<DataSource | null> {
    const dataSource = new DataSource({
        type: 'postgres',
        host: 'localhost',
        port: 5432,
        username: config.username,
        password: config.password,
        database: config.database,
        synchronize: false,
        logging: false,
        entities: [
            User, Role, PatientProfile, NutritionistProfile, PatientNutritionistRelation,
            Food, MealItem, Meal, DietPlan, Appointment, NutritionistAvailability,
            PatientProgressLog, SubscriptionPlan, UserSubscription, PaymentTransaction,
            EducationalContent, Recipe, RecipeIngredient, Conversation, Message, ClinicalRecord
        ]
    });

    try {
        console.log(`🔍 Probando conexión: ${configName} (${config.username}@localhost:5432/${config.database})`);
        await dataSource.initialize();
        console.log(`✅ Conexión exitosa con: ${configName}`);
        return dataSource;
    } catch (error: any) {
        console.log(`❌ Falló conexión con ${configName}: ${error.message}`);
        return null;
    }
}

async function createNutriDatabase(workingDataSource: DataSource): Promise<string> {
    try {
        // Verificar si nutri_dev ya existe
        const databases = await workingDataSource.query("SELECT datname FROM pg_database WHERE datistemplate = false;");
        const dbNames = databases.map((db: any) => db.datname);
        
        console.log('\n📋 Bases de datos existentes:', dbNames.join(', '));
        
        if (dbNames.includes('nutri_dev')) {
            console.log('✅ Base de datos nutri_dev ya existe');
            return 'nutri_dev';
        }
        
        if (dbNames.includes('nutri_test')) {
            console.log('✅ Base de datos nutri_test ya existe');
            return 'nutri_test';
        }
        
        // Intentar crear nutri_dev
        try {
            await workingDataSource.query('CREATE DATABASE nutri_dev;');
            console.log('✅ Base de datos nutri_dev creada');
            return 'nutri_dev';
        } catch (error: any) {
            console.log('⚠️ No se pudo crear nutri_dev:', error.message);
            
            // Intentar crear nutri_test
            try {
                await workingDataSource.query('CREATE DATABASE nutri_test;');
                console.log('✅ Base de datos nutri_test creada');
                return 'nutri_test';
            } catch (error2: any) {
                console.log('⚠️ No se pudo crear nutri_test:', error2.message);
                console.log('ℹ️ Usando base de datos postgres por defecto');
                return 'postgres';
            }
        }
    } catch (error: any) {
        console.log('⚠️ Error verificando bases de datos:', error.message);
        return 'postgres';
    }
}

async function addNewCredentialsWorking() {
    console.log('🌟 Intentando agregar nuevas credenciales al sistema...');
    
    let workingDataSource: DataSource | null = null;
    let workingConfig: any = null;

    // Probar diferentes configuraciones
    for (const { name, config } of dbConfigs) {
        const dataSource = await testConnection(name, config);
        if (dataSource) {
            workingDataSource = dataSource;
            workingConfig = config;
            break;
        }
    }

    if (!workingDataSource) {
        console.log('\n❌ No se pudo establecer conexión con PostgreSQL');
        console.log('\n💡 Soluciones posibles:');
        console.log('1. Verificar que PostgreSQL esté corriendo:');
        console.log('   - Buscar "Services" en Windows');
        console.log('   - Buscar servicio "postgresql" y verificar que esté iniciado');
        console.log('2. Crear usuario postgres si no existe:');
        console.log('   - Abrir cmd como administrador');
        console.log('   - Ejecutar: createuser -s postgres');
        console.log('3. Verificar que el puerto 5432 esté disponible');
        return;
    }

    try {
        // Determinar qué base de datos usar
        const dbToUse = await createNutriDatabase(workingDataSource);
        await workingDataSource.destroy();

        // Crear nueva conexión a la base de datos específica
        const nutriDataSource = new DataSource({
            type: 'postgres',
            host: 'localhost',
            port: 5432,
            username: workingConfig.username,
            password: workingConfig.password,
            database: dbToUse,
            synchronize: true, // Crear tablas automáticamente
            logging: ['error'],
            entities: [
                User, Role, PatientProfile, NutritionistProfile, PatientNutritionistRelation,
                Food, MealItem, Meal, DietPlan, Appointment, NutritionistAvailability,
                PatientProgressLog, SubscriptionPlan, UserSubscription, PaymentTransaction,
                EducationalContent, Recipe, RecipeIngredient, Conversation, Message, ClinicalRecord
            ]
        });

        console.log(`\n🔧 Conectando a base de datos: ${dbToUse}`);
        await nutriDataSource.initialize();
        console.log('✅ Conexión a base de datos nutricional establecida');

        // Verificar o crear roles
        const roleRepository = nutriDataSource.getRepository(Role);
        let nutritionistRole = await roleRepository.findOne({ where: { name: RoleName.NUTRITIONIST } });
        let patientRole = await roleRepository.findOne({ where: { name: RoleName.PATIENT } });

        if (!nutritionistRole) {
            nutritionistRole = roleRepository.create({ name: RoleName.NUTRITIONIST });
            await roleRepository.save(nutritionistRole);
            console.log('✅ Rol NUTRITIONIST creado');
        }

        if (!patientRole) {
            patientRole = roleRepository.create({ name: RoleName.PATIENT });
            await roleRepository.save(patientRole);
            console.log('✅ Rol PATIENT creado');
        }

        const userRepository = nutriDataSource.getRepository(User);
        const nutritionistProfileRepository = nutriDataSource.getRepository(NutritionistProfile);
        const patientProfileRepository = nutriDataSource.getRepository(PatientProfile);

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

        console.log('\n🎯 ¡CREDENCIALES AGREGADAS EXITOSAMENTE!');
        console.log('\n👨‍⚕️ NUTRIÓLOGOS (password: nutricion123):');
        newNutritionists.forEach((nutri, index) => {
            console.log(`${index + 1}. ${nutri.firstName} ${nutri.lastName}`);
            console.log(`   📧 Email: ${nutri.email}`);
            console.log(`   🏥 Especialidades: ${nutri.specialties.join(', ')}`);
            console.log(`   💰 Consulta: $${nutri.consultationFee} MXN`);
        });

        console.log('\n👥 PACIENTES (password: nutricion123):');
        newPatients.forEach((patient, index) => {
            console.log(`${index + 1}. ${patient.firstName} ${patient.lastName}`);
            console.log(`   📧 Email: ${patient.email}`);
            console.log(`   👤 ${patient.age} años, ${patient.gender === 'female' ? 'Femenino' : 'Masculino'}`);
        });

        console.log('\n🎯 INSTRUCCIONES PARA EL FRONTEND:');
        console.log('1. Asegúrate de que el backend esté corriendo:');
        console.log('   npm run dev');
        console.log('2. Abre el frontend en: http://localhost:5000/login');
        console.log('3. Usa cualquiera de las credenciales listadas arriba');
        console.log('4. Password para todos: nutricion123');

        console.log(`\n📊 Base de datos utilizada: ${dbToUse}`);
        console.log(`🔧 Usuario de DB: ${workingConfig.username}`);

        await nutriDataSource.destroy();

    } catch (error: any) {
        console.error('❌ Error durante la creación de credenciales:', error.message);
        if (workingDataSource && workingDataSource.isInitialized) {
            await workingDataSource.destroy();
        }
        throw error;
    }
}

addNewCredentialsWorking()
    .then(() => {
        console.log('\n✅ ¡Proceso completado exitosamente!');
        console.log('🌐 ¡Las credenciales están listas para usar en el frontend!');
        process.exit(0);
    })
    .catch((error) => {
        console.error('\n❌ Error en el script:', error.message || error);
        console.log('\n💡 Si el problema persiste, verifica que PostgreSQL esté correctamente instalado y configurado.');
        process.exit(1);
    }); 