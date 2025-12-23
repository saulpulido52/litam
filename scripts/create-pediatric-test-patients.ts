import 'reflect-metadata';
import { AppDataSource } from '../src/database/data-source';
import { User } from '../src/database/entities/user.entity';
import { PatientProfile } from '../src/database/entities/patient_profile.entity';
import { Role, RoleName } from '../src/database/entities/role.entity';
import { ClinicalRecord } from '../src/database/entities/clinical_record.entity';
import { hash } from 'bcrypt';

interface PediatricTestPatient {
    email: string;
    first_name: string;
    last_name: string;
    birth_date: string;
    gender: 'male' | 'female';
    category: string;
    measurements: {
        weight: number;
        height: number;
        date: string;
    }[];
}

// Generar pacientes de diferentes categorías pediátricas
const pediatricPatients: PediatricTestPatient[] = [
    // Lactante (6 meses)
    {
        email: 'bebe.garcia@test.com',
        first_name: 'Sofía',
        last_name: 'García',
        birth_date: new Date(Date.now() - 6 * 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        gender: 'female',
        category: 'Lactante',
        measurements: [
            { weight: 3.2, height: 48, date: 'nacimiento' },
            { weight: 5.4, height: 58, date: '2 meses' },
            { weight: 7.1, height: 64, date: '6 meses' }
        ]
    },
    // Niño pequeño (2 años)
    {
        email: 'carlos.martinez@test.com',
        first_name: 'Carlos',
        last_name: 'Martínez',
        birth_date: new Date(Date.now() - 2 * 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        gender: 'male',
        category: 'Niño pequeño',
        measurements: [
            { weight: 3.5, height: 50, date: 'nacimiento' },
            { weight: 10.2, height: 76, date: '1 año' },
            { weight: 12.5, height: 87, date: '2 años' }
        ]
    },
    // Preescolar (4 años)
    {
        email: 'ana.lopez@test.com',
        first_name: 'Ana',
        last_name: 'López',
        birth_date: new Date(Date.now() - 4 * 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        gender: 'female',
        category: 'Preescolar',
        measurements: [
            { weight: 3.0, height: 49, date: 'nacimiento' },
            { weight: 14.0, height: 95, date: '3 años' },
            { weight: 16.5, height: 103, date: '4 años' }
        ]
    },
    // Escolar (8 años)
    {
        email: 'miguel.rodriguez@test.com',
        first_name: 'Miguel',
        last_name: 'Rodríguez',
        birth_date: new Date(Date.now() - 8 * 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        gender: 'male',
        category: 'Escolar',
        measurements: [
            { weight: 3.3, height: 50, date: 'nacimiento' },
            { weight: 20.0, height: 115, date: '6 años' },
            { weight: 26.5, height: 128, date: '8 años' }
        ]
    },
    // Adolescente (15 años)
    {
        email: 'laura.fernandez@test.com',
        first_name: 'Laura',
        last_name: 'Fernández',
        birth_date: new Date(Date.now() - 15 * 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        gender: 'female',
        category: 'Adolescente',
        measurements: [
            { weight: 3.1, height: 49, date: 'nacimiento' },
            { weight: 45.0, height: 155, date: '13 años' },
            { weight: 52.0, height: 162, date: '15 años' }
        ]
    }
];

async function createPediatricTestPatients() {
    try {
        await AppDataSource.initialize();
        console.log('🔍 Creando pacientes pediátricos de prueba...\n');

        const userRepository = AppDataSource.getRepository(User);
        const profileRepository = AppDataSource.getRepository(PatientProfile);
        const roleRepository = AppDataSource.getRepository(Role);
        const recordRepository = AppDataSource.getRepository(ClinicalRecord);

        // Obtener rol de paciente
        const patientRole = await roleRepository.findOne({ where: { name: RoleName.PATIENT } });
        if (!patientRole) {
            console.error('❌ No se encontró el rol de paciente');
            return;
        }

        // Obtener nutricionista por defecto
        const nutritionistRole = await roleRepository.findOne({ where: { name: RoleName.NUTRITIONIST } });
        const defaultNutritionist = await userRepository.findOne({ 
            where: { 
                role: { id: nutritionistRole?.id } 
            } 
        });

        if (!defaultNutritionist) {
            console.error('❌ No se encontró un nutricionista por defecto');
            return;
        }

        // Crear cada paciente
        for (const patientData of pediatricPatients) {
            // Verificar si ya existe
            const existingUser = await userRepository.findOne({ where: { email: patientData.email } });
            if (existingUser) {
                console.log(`⚠️  Paciente ${patientData.email} ya existe`);
                continue;
            }

            // Crear usuario
            const user = new User();
            user.email = patientData.email;
            user.first_name = patientData.first_name;
            user.last_name = patientData.last_name;
            user.birth_date = new Date(patientData.birth_date);
            user.gender = patientData.gender;
            user.password_hash = await hash('pediatric123', 10);
            user.role = patientRole;
            user.is_active = true;
            user.requires_initial_setup = false;
            user.registration_type = 'in_person' as any;

            const savedUser = await userRepository.save(user);

            // Crear perfil de paciente con datos pediátricos
            const profile = new PatientProfile();
            profile.user = savedUser;
            (profile as any).has_diabetes = false;
            (profile as any).has_hypertension = false;
            (profile as any).has_obesity = false;
            (profile as any).has_dyslipidemia = false;
            
            // Agregar datos del primer registro (nacimiento)
            const birthMeasurement = patientData.measurements[0];
            (profile as any).birth_weight_kg = birthMeasurement.weight;
            (profile as any).birth_height_cm = birthMeasurement.height;
            
            await profileRepository.save(profile);

            // Crear expedientes clínicos con mediciones
            for (let i = 1; i < patientData.measurements.length; i++) {
                const measurement = patientData.measurements[i];
                const measurementDate = new Date();
                
                // Calcular fecha aproximada de la medición
                if (measurement.date.includes('mes')) {
                    const months = parseInt(measurement.date);
                    measurementDate.setMonth(measurementDate.getMonth() - (6 - months)); // Ajustar desde 6 meses actual
                } else if (measurement.date.includes('año')) {
                    const years = parseInt(measurement.date);
                    measurementDate.setFullYear(measurementDate.getFullYear() - (parseInt(patientData.category === 'Lactante' ? '0' : 
                                                                                      patientData.category === 'Niño pequeño' ? '2' :
                                                                                      patientData.category === 'Preescolar' ? '4' :
                                                                                      patientData.category === 'Escolar' ? '8' : '15') - years));
                }

                const record = new ClinicalRecord();
                record.patient = savedUser;
                record.nutritionist = defaultNutritionist;
                record.record_date = measurementDate;
                (record as any).reason_for_consultation = `Control de crecimiento - ${measurement.date}`;
                (record as any).personal_history = `Paciente pediátrico en seguimiento de crecimiento`;
                (record as any).family_history = 'Sin antecedentes relevantes';
                
                record.anthropometric_measurements = {
                    current_weight_kg: measurement.weight,
                    height_m: measurement.height / 100 // Convertir cm a m
                };
                
                (record as any).vital_signs = {
                    blood_pressure_systolic: null,
                    blood_pressure_diastolic: null,
                    heart_rate_bpm: null,
                    temperature_celsius: null
                };
                
                (record as any).medical_conditions = {
                    diabetes: false,
                    hypertension: false,
                    dyslipidemia: false,
                    obesity: false,
                    other_conditions: []
                };
                
                record.created_at = measurementDate;
                
                await recordRepository.save(record);
            }

            console.log(`✅ Creado paciente pediátrico: ${patientData.first_name} ${patientData.last_name} (${patientData.category})`);
        }

        console.log('\n🎉 Pacientes pediátricos de prueba creados exitosamente');
        console.log('📝 Credenciales de acceso:');
        console.log('   - Contraseña: pediatric123');
        
    } catch (error) {
        console.error('❌ Error creando pacientes pediátricos:', error);
    } finally {
        await AppDataSource.destroy();
    }
}

createPediatricTestPatients(); 