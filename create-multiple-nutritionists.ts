import 'dotenv/config';
import { AppDataSource } from './src/database/data-source';
import { Role, RoleName } from './src/database/entities/role.entity';
import { User } from './src/database/entities/user.entity';
import { NutritionistProfile } from './src/database/entities/nutritionist_profile.entity';
import { PatientProfile } from './src/database/entities/patient_profile.entity';
import { PatientNutritionistRelation, RelationshipStatus } from './src/database/entities/patient_nutritionist_relation.entity';
import bcrypt from 'bcrypt';

interface NutritionistData {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    specialties: string[];
    yearsOfExperience: number;
    consultationFee: number;
    bio: string;
    patients: PatientData[];
}

interface PatientData {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    age: number;
    gender: 'male' | 'female';
    height: number;
    weight: number;
    medicalConditions: string[];
    allergies: string[];
}

async function createMultipleNutritionists() {
    try {
        console.log('🌱 Creando múltiples nutriólogos con pacientes...');
        
        if (!AppDataSource.isInitialized) {
            await AppDataSource.initialize();
        }

        // 1. Obtener roles
        const roleRepository = AppDataSource.getRepository(Role);
        const nutritionistRole = await roleRepository.findOne({ where: { name: RoleName.NUTRITIONIST } });
        const patientRole = await roleRepository.findOne({ where: { name: RoleName.PATIENT } });

        if (!nutritionistRole || !patientRole) {
            throw new Error('Roles no encontrados');
        }

        // 2. Datos de nutriólogos y pacientes
        const nutritionistsData: NutritionistData[] = [
            {
                email: 'dr.maria.gonzalez@demo.com',
                password: 'demo123',
                firstName: 'Dr. María',
                lastName: 'González',
                specialties: ['Nutrición Clínica', 'Control de Peso', 'Diabetes'],
                yearsOfExperience: 8,
                consultationFee: 1200,
                bio: 'Especialista en nutrición clínica con amplia experiencia en control de peso y manejo de diabetes.',
                patients: [
                    {
                        email: 'ana.lopez@demo.com',
                        password: 'demo123',
                        firstName: 'Ana',
                        lastName: 'López',
                        age: 28,
                        gender: 'female',
                        height: 165,
                        weight: 68,
                        medicalConditions: ['Hipertensión'],
                        allergies: ['Lácteos']
                    },
                    {
                        email: 'carlos.ruiz@demo.com',
                        password: 'demo123',
                        firstName: 'Carlos',
                        lastName: 'Ruiz',
                        age: 35,
                        gender: 'male',
                        height: 175,
                        weight: 85,
                        medicalConditions: ['Diabetes Tipo 2'],
                        allergies: ['Nueces']
                    },
                    {
                        email: 'sofia.martinez@demo.com',
                        password: 'demo123',
                        firstName: 'Sofía',
                        lastName: 'Martínez',
                        age: 42,
                        gender: 'female',
                        height: 160,
                        weight: 72,
                        medicalConditions: ['Colesterol Alto'],
                        allergies: ['Gluten']
                    }
                ]
            },
            {
                email: 'dr.juan.perez@demo.com',
                password: 'demo123',
                firstName: 'Dr. Juan',
                lastName: 'Pérez',
                specialties: ['Nutrición Deportiva', 'Musculación', 'Rendimiento'],
                yearsOfExperience: 6,
                consultationFee: 1500,
                bio: 'Nutriólogo deportivo especializado en optimización del rendimiento y composición corporal.',
                patients: [
                    {
                        email: 'miguel.torres@demo.com',
                        password: 'demo123',
                        firstName: 'Miguel',
                        lastName: 'Torres',
                        age: 25,
                        gender: 'male',
                        height: 180,
                        weight: 75,
                        medicalConditions: [],
                        allergies: ['Mariscos']
                    },
                    {
                        email: 'lucia.hernandez@demo.com',
                        password: 'demo123',
                        firstName: 'Lucía',
                        lastName: 'Hernández',
                        age: 31,
                        gender: 'female',
                        height: 168,
                        weight: 58,
                        medicalConditions: ['Anemia'],
                        allergies: []
                    }
                ]
            },
            {
                email: 'dra.carmen.rodriguez@demo.com',
                password: 'demo123',
                firstName: 'Dra. Carmen',
                lastName: 'Rodríguez',
                specialties: ['Nutrición Pediátrica', 'Alergias Alimentarias', 'Desarrollo Infantil'],
                yearsOfExperience: 10,
                consultationFee: 1800,
                bio: 'Especialista en nutrición pediátrica con experiencia en alergias alimentarias y desarrollo infantil.',
                patients: [
                    {
                        email: 'jose.martin@demo.com',
                        password: 'demo123',
                        firstName: 'José',
                        lastName: 'Martín',
                        age: 45,
                        gender: 'male',
                        height: 172,
                        weight: 78,
                        medicalConditions: ['Obesidad'],
                        allergies: ['Huevos', 'Pescado']
                    },
                    {
                        email: 'elena.garcia@demo.com',
                        password: 'demo123',
                        firstName: 'Elena',
                        lastName: 'García',
                        age: 38,
                        gender: 'female',
                        height: 163,
                        weight: 65,
                        medicalConditions: ['Síndrome de Ovario Poliquístico'],
                        allergies: ['Lácteos', 'Gluten']
                    },
                    {
                        email: 'roberto.silva@demo.com',
                        password: 'demo123',
                        firstName: 'Roberto',
                        lastName: 'Silva',
                        age: 29,
                        gender: 'male',
                        height: 178,
                        weight: 82,
                        medicalConditions: ['Hipertensión'],
                        allergies: ['Soya']
                    }
                ]
            }
        ];

        const userRepository = AppDataSource.getRepository(User);
        const nutritionistProfileRepository = AppDataSource.getRepository(NutritionistProfile);
        const patientProfileRepository = AppDataSource.getRepository(PatientProfile);
        const relationRepository = AppDataSource.getRepository(PatientNutritionistRelation);

        const hashedPassword = await bcrypt.hash('demo123', 12);

        console.log('\n👨‍⚕️ Creando nutriólogos...');

        for (const nutriData of nutritionistsData) {
            // Verificar si el nutriólogo ya existe
            let nutritionist = await userRepository.findOne({ 
                where: { email: nutriData.email },
                relations: ['role']
            });

            if (!nutritionist) {
                // Crear nutriólogo
                nutritionist = userRepository.create({
                    email: nutriData.email,
                    password_hash: hashedPassword,
                    first_name: nutriData.firstName,
                    last_name: nutriData.lastName,
                    age: 35,
                    gender: 'male',
                    role: nutritionistRole,
                    is_active: true
                });
                await userRepository.save(nutritionist);

                // Crear perfil de nutriólogo
                const nutritionistProfile = nutritionistProfileRepository.create({
                    user: nutritionist,
                    license_number: `NUT-${Math.floor(Math.random() * 90000) + 10000}`,
                    specialties: nutriData.specialties,
                    years_of_experience: nutriData.yearsOfExperience,
                    education: ['Licenciatura en Nutrición - Universidad Nacional'],
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

            // Crear pacientes para este nutriólogo
            console.log(`\n👥 Creando pacientes para ${nutriData.firstName} ${nutriData.lastName}...`);

            for (const patientData of nutriData.patients) {
                // Verificar si el paciente ya existe
                let patient = await userRepository.findOne({ 
                    where: { email: patientData.email },
                    relations: ['role']
                });

                if (!patient) {
                    // Crear paciente
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

                    // Crear perfil de paciente
                    const patientProfile = patientProfileRepository.create({
                        user: patient,
                        height: patientData.height,
                        current_weight: patientData.weight,
                        medical_conditions: patientData.medicalConditions,
                        allergies: patientData.allergies,
                        activity_level: 'moderate',
                        dietary_preferences: []
                    });
                    await patientProfileRepository.save(patientProfile);

                    console.log(`  ✅ Paciente creado: ${patientData.email}`);
                } else {
                    console.log(`  ℹ️ Paciente ya existe: ${patientData.email}`);
                    
                    // Verificar si el paciente tiene perfil de paciente
                    const existingProfile = await patientProfileRepository.findOne({
                        where: { user: { id: patient.id } }
                    });

                    if (!existingProfile) {
                        console.log(`  🔧 Creando perfil faltante para: ${patientData.email}`);
                        
                        // Crear perfil de paciente faltante
                        const patientProfile = patientProfileRepository.create({
                            user: patient,
                            height: patientData.height,
                            current_weight: patientData.weight,
                            medical_conditions: patientData.medicalConditions,
                            allergies: patientData.allergies,
                            activity_level: 'moderate',
                            dietary_preferences: []
                        });
                        await patientProfileRepository.save(patientProfile);
                        
                        console.log(`  ✅ Perfil de paciente creado: ${patientData.email}`);
                    } else {
                        console.log(`  ℹ️ Perfil de paciente ya existe: ${patientData.email}`);
                    }
                }

                // Crear relación paciente-nutriólogo
                const existingRelation = await relationRepository.findOne({
                    where: {
                        patient: { id: patient.id },
                        nutritionist: { id: nutritionist.id },
                        status: RelationshipStatus.ACTIVE
                    }
                });

                if (!existingRelation) {
                    const relation = relationRepository.create({
                        patient,
                        nutritionist,
                        status: RelationshipStatus.ACTIVE,
                        requested_at: new Date(),
                        accepted_at: new Date()
                    });
                    await relationRepository.save(relation);
                    console.log(`  🔗 Relación creada: ${patientData.firstName} → ${nutriData.firstName}`);
                } else {
                    console.log(`  ℹ️ Relación ya existe: ${patientData.firstName} → ${nutriData.firstName}`);
                }
            }
        }

        console.log('\n🎯 Credenciales de acceso para múltiples cuentas:');
        console.log('\n👨‍⚕️ NUTRIÓLOGOS:');
        nutritionistsData.forEach((nutri, index) => {
            console.log(`\n${index + 1}. ${nutri.firstName} ${nutri.lastName}`);
            console.log(`   📧 Email: ${nutri.email}`);
            console.log(`   🔑 Password: ${nutri.password}`);
            console.log(`   🏥 Especialidades: ${nutri.specialties.join(', ')}`);
            console.log(`   💰 Consulta: $${nutri.consultationFee}`);
            console.log(`   👥 Pacientes asignados: ${nutri.patients.length}`);
            nutri.patients.forEach(patient => {
                console.log(`     - ${patient.firstName} ${patient.lastName} (${patient.email})`);
            });
        });

        console.log('\n👥 PACIENTES (pueden acceder con sus credenciales):');
        const allPatients = nutritionistsData.flatMap(nutri => nutri.patients);
        allPatients.forEach((patient, index) => {
            console.log(`${index + 1}. ${patient.firstName} ${patient.lastName}`);
            console.log(`   📧 Email: ${patient.email}`);
            console.log(`   🔑 Password: ${patient.password}`);
            console.log(`   📏 Altura: ${patient.height}cm, Peso: ${patient.weight}kg`);
            console.log(`   🏥 Condiciones: ${patient.medicalConditions.length > 0 ? patient.medicalConditions.join(', ') : 'Ninguna'}`);
        });

        console.log('\n🌐 URLs de acceso:');
        console.log('   Frontend: http://localhost:5000');
        console.log('   Backend: http://localhost:4000');
        console.log('\n💡 Para probar múltiples cuentas:');
        console.log('   1. Abre 2-3 navegadores diferentes');
        console.log('   2. Inicia sesión con diferentes nutriólogos');
        console.log('   3. Verifica que cada uno ve solo sus pacientes');
        console.log('   4. Prueba la funcionalidad de remoción de pacientes');
        
    } catch (error) {
        console.error('❌ Error creando múltiples nutriólogos:', error);
        throw error;
    } finally {
        if (AppDataSource.isInitialized) {
            await AppDataSource.destroy();
        }
    }
}

// Ejecutar el script
createMultipleNutritionists()
    .then(() => {
        console.log('\n✅ Script completado exitosamente');
        process.exit(0);
    })
    .catch((error) => {
        console.error('❌ Error en el script:', error);
        process.exit(1);
    }); 