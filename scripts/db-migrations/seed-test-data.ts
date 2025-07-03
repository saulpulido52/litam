import 'dotenv/config';
import { AppDataSource } from './src/database/data-source';
import { Role, RoleName } from './src/database/entities/role.entity';
import { User } from './src/database/entities/user.entity';
import { NutritionistProfile } from './src/database/entities/nutritionist_profile.entity';
import bcrypt from 'bcrypt';

async function seedTestData() {
    try {
        console.log('🌱 Sembrando datos de prueba esenciales...');
        
        if (!AppDataSource.isInitialized) {
            await AppDataSource.initialize();
        }

        // 1. Crear roles básicos
        console.log('📋 Creando roles...');
        const roleRepository = AppDataSource.getRepository(Role);
        
        let patientRole = await roleRepository.findOne({ where: { name: RoleName.PATIENT } });
        if (!patientRole) {
            patientRole = roleRepository.create({ name: RoleName.PATIENT });
            await roleRepository.save(patientRole);
        }

        let nutritionistRole = await roleRepository.findOne({ where: { name: RoleName.NUTRITIONIST } });
        if (!nutritionistRole) {
            nutritionistRole = roleRepository.create({ name: RoleName.NUTRITIONIST });
            await roleRepository.save(nutritionistRole);
        }

        let adminRole = await roleRepository.findOne({ where: { name: RoleName.ADMIN } });
        if (!adminRole) {
            adminRole = roleRepository.create({ name: RoleName.ADMIN });
            await roleRepository.save(adminRole);
        }

        // 2. Crear usuarios de prueba
        console.log('👥 Creando usuarios de prueba...');
        const userRepository = AppDataSource.getRepository(User);
        const nutritionistProfileRepository = AppDataSource.getRepository(NutritionistProfile);

        const hashedPassword = await bcrypt.hash('demo123', 12);

        // 2.1 Nutriólogo principal
        let testNutritionist = await userRepository.findOne({ 
            where: { email: 'nutritionist@demo.com' },
            relations: ['role']
        });

        if (!testNutritionist) {
            testNutritionist = userRepository.create({
                email: 'nutritionist@demo.com',
                password_hash: hashedPassword,
                first_name: 'Dr. Juan',
                last_name: 'Pérez',
                age: 35,
                gender: 'male',
                role: nutritionistRole,
                is_active: true
            });
            await userRepository.save(testNutritionist);

            const nutritionistProfile = nutritionistProfileRepository.create({
                user: testNutritionist,
                license_number: 'NUT-12345',
                specialties: ['Nutrición Clínica', 'Nutrición Deportiva', 'Control de Peso'],
                years_of_experience: 5,
                education: ['Licenciatura en Nutrición - Universidad Nacional', 'Maestría en Nutrición Clínica'],
                certifications: ['Certificación en Nutrición Deportiva', 'Certificación en Diabetes'],
                languages: ['Español', 'Inglés'],
                consultation_fee: 800,
                bio: 'Nutriólogo especializado en planes personalizados para mejorar la salud y el bienestar. Experiencia en nutrición clínica y deportiva.',
                is_verified: true
            });
            await nutritionistProfileRepository.save(nutritionistProfile);
            console.log('✅ Nutriólogo principal creado');
        }

        // 2.2 Administrador
        let adminUser = await userRepository.findOne({ 
            where: { email: 'admin@demo.com' },
            relations: ['role']
        });

        if (!adminUser) {
            adminUser = userRepository.create({
                email: 'admin@demo.com',
                password_hash: hashedPassword,
                first_name: 'Carlos',
                last_name: 'Administrador',
                age: 40,
                gender: 'male',
                role: adminRole,
                is_active: true
            });
            await userRepository.save(adminUser);
            console.log('✅ Administrador creado');
        }

        // 2.3 Usuarios pacientes básicos
        const patientEmails = [
            'maria.gonzalez@demo.com',
            'carlos.ruiz@demo.com', 
            'ana.lopez@demo.com',
            'jose.martin@demo.com'
        ];

        const patientNames = [
            { first: 'María', last: 'González' },
            { first: 'Carlos', last: 'Ruiz' },
            { first: 'Ana', last: 'López' },
            { first: 'José', last: 'Martín' }
        ];

        for (let i = 0; i < patientEmails.length; i++) {
            const email = patientEmails[i];
            const name = patientNames[i];
            
            let patient = await userRepository.findOne({ 
                where: { email: email },
                relations: ['role']
            });

            if (!patient) {
                patient = userRepository.create({
                    email: email,
                    password_hash: hashedPassword,
                    first_name: name.first,
                    last_name: name.last,
                    age: 25 + i * 5,
                    gender: i % 2 === 0 ? 'female' : 'male',
                    role: patientRole,
                    is_active: true
                });
                await userRepository.save(patient);
                console.log(`✅ Paciente ${name.first} ${name.last} creado`);
            }
        }

        console.log('🎉 Datos básicos de prueba sembrados exitosamente!');
        console.log('');
        console.log('🎯 Credenciales de acceso:');
        console.log('   👨‍⚕️ Nutriólogo: nutritionist@demo.com / demo123');
        console.log('   ⚙️ Administrador: admin@demo.com / demo123');
        console.log('   👥 Pacientes: maria.gonzalez@demo.com / demo123');
        console.log('                carlos.ruiz@demo.com / demo123');
        console.log('                ana.lopez@demo.com / demo123');
        console.log('                jose.martin@demo.com / demo123');
        console.log('');
        console.log('📊 Datos creados:');
        console.log('   - 1 nutriólogo con perfil completo');
        console.log('   - 1 administrador');
        console.log('   - 4 pacientes básicos');
        console.log('');
        console.log('🌐 Frontend listo en: http://localhost:5000');
        console.log('🔧 API disponible en: http://localhost:4000/api');
        console.log('');
        console.log('💡 Las páginas web usarán datos de ejemplo adicionales');
        console.log('   generados dinámicamente en el frontend.');
        
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