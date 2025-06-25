import 'dotenv/config';
import { AppDataSource } from './src/database/data-source';
import { User } from './src/database/entities/user.entity';
import { Role, RoleName } from './src/database/entities/role.entity';
import jwt from 'jsonwebtoken';

async function testDashboard() {
    try {
        console.log('🔍 Probando Dashboard...');
        
        if (!AppDataSource.isInitialized) {
            await AppDataSource.initialize();
        }

        const userRepository = AppDataSource.getRepository(User);
        const roleRepository = AppDataSource.getRepository(Role);

        // Buscar un nutriólogo
        const nutritionistRole = await roleRepository.findOne({
            where: { name: RoleName.NUTRITIONIST }
        });

        if (!nutritionistRole) {
            console.error('❌ No se encontró el rol de nutriólogo');
            return;
        }

        const nutritionist = await userRepository.findOne({
            where: { 
                email: 'dr.maria.gonzalez@demo.com',
                is_active: true
            },
            relations: ['role']
        });

        if (!nutritionist) {
            console.error('❌ No se encontró ningún nutriólogo activo');
            return;
        }

        console.log(`✅ Nutriólogo encontrado: ${nutritionist.first_name} ${nutritionist.last_name} (${nutritionist.email})`);

        // Generar token JWT
        const JWT_SECRET = process.env.JWT_SECRET || 'supersecretjwtkey';
        const token = jwt.sign(
            { 
                userId: nutritionist.id, 
                role: nutritionist.role.name 
            },
            JWT_SECRET,
            { expiresIn: '1h' }
        );

        console.log(`🔑 Token generado: ${token.substring(0, 50)}...`);

        // Probar endpoint del dashboard
        const response = await fetch('http://localhost:4000/api/dashboard/stats', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (response.ok) {
            const data = await response.json();
            console.log('✅ Dashboard Stats:');
            console.log(JSON.stringify(data, null, 2));
        } else {
            const error = await response.text();
            console.error('❌ Error en dashboard:', error);
        }

        // Probar endpoint de actividades recientes
        const activitiesResponse = await fetch('http://localhost:4000/api/dashboard/recent-activities?limit=5', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (activitiesResponse.ok) {
            const activitiesData = await activitiesResponse.json();
            console.log('✅ Recent Activities:');
            console.log(JSON.stringify(activitiesData, null, 2));
        } else {
            const error = await activitiesResponse.text();
            console.error('❌ Error en actividades recientes:', error);
        }

    } catch (error) {
        console.error('❌ Error en test:', error);
    } finally {
        await AppDataSource.destroy();
    }
}

testDashboard(); 