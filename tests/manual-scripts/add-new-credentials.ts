import 'dotenv/config';
import { AppDataSource } from './src/database/data-source';
import { Role, RoleName } from './src/database/entities/role.entity';
import { User } from './src/database/entities/user.entity';
import { NutritionistProfile } from './src/database/entities/nutritionist_profile.entity';
import { PatientProfile } from './src/database/entities/patient_profile.entity';
import { PatientNutritionistRelation, RelationshipStatus } from './src/database/entities/patient_nutritionist_relation.entity';
import bcrypt from 'bcrypt';

interface NewNutritionistData {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    age: number;
    gender: 'male' | 'female';
    specialties: string[];
    yearsOfExperience: number;
    consultationFee: number;
    bio: string;
    licenseNumber: string;
    patients: NewPatientData[];
}

interface NewPatientData {
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
    activityLevel: string;
}

async function addNewCredentials() {
    try {
        console.log('🌟 Agregando nuevas credenciales al sistema...');
        
        if (!AppDataSource.isInitialized) {
            await AppDataSource.initialize();
        }

        // Obtener roles
        const roleRepository = AppDataSource.getRepository(Role);
        const nutritionistRole = await roleRepository.findOne({ where: { name: RoleName.NUTRITIONIST } });
        const patientRole = await roleRepository.findOne({ where: { name: RoleName.PATIENT } });
        const adminRole = await roleRepository.findOne({ where: { name: RoleName.ADMIN } });

        if (!nutritionistRole || !patientRole || !adminRole) {
            throw new Error('Roles no encontrados en la base de datos');
        }

        const userRepository = AppDataSource.getRepository(User);
        const nutritionistProfileRepository = AppDataSource.getRepository(NutritionistProfile);
        const patientProfileRepository = AppDataSource.getRepository(PatientProfile);
        const relationRepository = AppDataSource.getRepository(PatientNutritionistRelation);

        const hashedPassword = await bcrypt.hash('nutricion123', 12);

        // Nuevos nutriólogos
        const newNutritionists = [
            {
                email: 'dra.ana.martinez@nutri.com',
                firstName: 'Dra. Ana',
                lastName: 'Martínez Sánchez',
                specialties: ['Nutrición Oncológica', 'Terapia Nutricional'],
                consultationFee: 1600,
                bio: 'Especialista en nutrición oncológica con 7 años de experiencia.'
            },
            {
                email: 'dr.carlos.lopez@nutri.com',
                firstName: 'Dr. Carlos',
                lastName: 'López Herrera',
                specialties: ['Nutrición Geriátrica', 'Enfermedades Metabólicas'],
                consultationFee: 1400,
                bio: 'Especialista en nutrición geriátrica con 12 años de experiencia.'
            },
            {
                email: 'dra.patricia.torres@nutri.com',
                firstName: 'Dra. Patricia',
                lastName: 'Torres Morales',
                specialties: ['Nutrición Infantil', 'Trastornos Alimentarios'],
                consultationFee: 1300,
                bio: 'Especialista en nutrición infantil con 5 años de experiencia.'
            }
        ];

        // Nuevos pacientes
        const newPatients = [
            {
                email: 'maria.gonzalez@test.com',
                firstName: 'María',
                lastName: 'González López',
                age: 45,
                gender: 'female',
                height: 162,
                weight: 70
            },
            {
                email: 'pedro.ramirez@test.com',
                firstName: 'Pedro',
                lastName: 'Ramírez Castro',
                age: 58,
                gender: 'male',
                height: 175,
                weight: 88
            },
            {
                email: 'laura.jimenez@test.com',
                firstName: 'Laura',
                lastName: 'Jiménez Ruiz',
                age: 25,
                gender: 'female',
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
                    license_number: `NUT-${Math.floor(Math.random() * 90000) + 10000}`,
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
        
    } catch (error) {
        console.error('❌ Error agregando credenciales:', error);
        throw error;
    } finally {
        if (AppDataSource.isInitialized) {
            await AppDataSource.destroy();
        }
    }
}

addNewCredentials()
    .then(() => {
        console.log('\n✅ Nuevas credenciales agregadas exitosamente');
        process.exit(0);
    })
    .catch((error) => {
        console.error('❌ Error en el script:', error);
        process.exit(1);
    }); 