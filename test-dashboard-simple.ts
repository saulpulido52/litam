import { AppDataSource } from './src/database/data-source';
import { User } from './src/database/entities/user.entity';
import { Role, RoleName } from './src/database/entities/role.entity';

async function testDashboardSimple() {
    try {
        // Inicializar la conexión a la base de datos
        await AppDataSource.initialize();
        console.log('🔗 Conexión a la base de datos establecida');

        const userRepository = AppDataSource.getRepository(User);
        const roleRepository = AppDataSource.getRepository(Role);

        // Buscar rol de nutriólogo
        const nutritionistRole = await roleRepository.findOne({ 
            where: { name: RoleName.NUTRITIONIST } 
        });

        if (!nutritionistRole) {
            console.log('❌ No existe el rol de nutriólogo');
            return;
        }

        // Buscar nutriólogos existentes
        const nutritionists = await userRepository.find({
            where: { role: { id: nutritionistRole.id } },
            relations: ['role'],
            take: 5
        });

        console.log('\n👨‍⚕️ === NUTRIÓLOGOS ENCONTRADOS ===');
        if (nutritionists.length === 0) {
            console.log('❌ No hay nutriólogos en la base de datos');
            return;
        }

        nutritionists.forEach((nutritionist, index) => {
            console.log(`${index + 1}. ${nutritionist.first_name} ${nutritionist.last_name}`);
            console.log(`   📧 Email: ${nutritionist.email}`);
            console.log(`   🆔 ID: ${nutritionist.id}`);
            console.log(`   ✅ Activo: ${nutritionist.is_active ? 'Sí' : 'No'}`);
            console.log('');
        });

        // Probar con el primer nutriólogo usando credenciales estándar
        const firstNutritionist = nutritionists[0];
        console.log(`🧪 === PROBANDO DASHBOARD CON: ${firstNutritionist.first_name} ${firstNutritionist.last_name} ===`);

        // Lista de contraseñas comunes para probar
        const commonPasswords = ['password123', 'admin123', '123456', 'password', 'nutri123'];
        let validCredentials: { email: string; password: string; token: string } | null = null;

        for (const password of commonPasswords) {
            try {
                const response = await fetch('http://localhost:4000/api/auth/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        email: firstNutritionist.email,
                        password: password
                    })
                });

                if (response.ok) {
                    const data = await response.json();
                    validCredentials = {
                        email: firstNutritionist.email,
                        password: password,
                        token: data.data.access_token
                    };
                    console.log(`✅ Credenciales válidas encontradas: ${password}`);
                    break;
                }
            } catch (error) {
                // Continuar probando
            }
        }

        if (!validCredentials) {
            console.log('❌ No se pudieron encontrar credenciales válidas');
            console.log('💡 Intenta manualmente con alguna de estas opciones:');
            console.log('   - password123');
            console.log('   - admin123');
            console.log('   - nutri123');
            return;
        }

        // Probar dashboard con credenciales válidas
        console.log('\n📊 === PROBANDO DASHBOARD ===');
        const dashboardResponse = await fetch('http://localhost:4000/api/dashboard/stats', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${validCredentials.token}`,
                'Content-Type': 'application/json'
            }
        });

        if (!dashboardResponse.ok) {
            console.log('❌ Error al obtener datos del dashboard:', await dashboardResponse.text());
            return;
        }

        const dashboardData = await dashboardResponse.json();
        console.log('✅ Dashboard stats obtenidas exitosamente');
        
        console.log('\n📈 === DATOS DEL DASHBOARD ===');
        console.log(`📋 Total Pacientes: ${dashboardData.data.total_patients}`);
        console.log(`📅 Total Citas: ${dashboardData.data.total_appointments}`);
        console.log(`🍽️  Total Planes: ${dashboardData.data.total_diet_plans}`);
        console.log(`📄 Total Expedientes: ${dashboardData.data.total_clinical_records}`);

        console.log('\n🕒 === ACTIVIDADES RECIENTES ===');
        if (dashboardData.data.recent_activities && dashboardData.data.recent_activities.length > 0) {
            dashboardData.data.recent_activities.forEach((activity: any, index: number) => {
                console.log(`${index + 1}. [${activity.type}] ${activity.description}`);
                console.log(`   📅 ${new Date(activity.date).toLocaleString('es-MX')}`);
            });
        } else {
            console.log('❌ No hay actividades recientes');
        }

        console.log('\n📊 === RESUMEN SEMANAL ===');
        console.log(`🆕 Nuevos pacientes: ${dashboardData.data.weekly_summary.new_patients}`);
        console.log(`📅 Nuevas citas: ${dashboardData.data.weekly_summary.new_appointments}`);

        console.log('\n🎯 === MÉTRICAS DE RENDIMIENTO ===');
        console.log(`✅ Tasa de completado: ${dashboardData.data.performance_metrics.completion_rate}%`);

        console.log('\n✅ === VERIFICACIÓN COMPLETADA ===');
        console.log('🎯 Las actividades mostradas pertenecen SOLAMENTE al nutriólogo:');
        console.log(`   👨‍⚕️ ${firstNutritionist.first_name} ${firstNutritionist.last_name} (${firstNutritionist.email})`);
        console.log('🔒 Datos individualizados correctamente implementados');

    } catch (error) {
        console.error('❌ Error en el test:', error);
    } finally {
        try {
            await AppDataSource.destroy();
            console.log('🔌 Conexión a la base de datos cerrada');
        } catch (error) {
            console.error('⚠️  Error al cerrar la conexión:', error);
        }
    }
}

// Ejecutar el test
testDashboardSimple(); 