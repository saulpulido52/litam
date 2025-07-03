import { AppDataSource } from './src/database/data-source';

async function testDashboardActivities() {
    try {
        // Inicializar la conexión a la base de datos
        await AppDataSource.initialize();
        console.log('🔗 Conexión a la base de datos establecida');

        // URL del backend
        const BASE_URL = 'http://localhost:4000/api';

        // Credenciales del nutriólogo 1
        const nutritionist1 = {
            email: 'maria.gonzalez@nutricion.com',
            password: 'password123'
        };

        // Credenciales del nutriólogo 2 (si existe)
        const nutritionist2 = {
            email: 'carlos.ruiz@nutricion.com', 
            password: 'password123'
        };

        console.log('\n🧪 === PRUEBA DE ACTIVIDADES INDIVIDUALES POR NUTRIÓLOGO ===\n');

        // Función para hacer login y obtener token
        async function login(credentials: any) {
            const response = await fetch(`${BASE_URL}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(credentials)
            });

            if (!response.ok) {
                throw new Error(`Login failed: ${await response.text()}`);
            }

            const data = await response.json();
            return data.data.access_token;
        }

        // Función para obtener stats del dashboard
        async function getDashboardStats(token: string) {
            const response = await fetch(`${BASE_URL}/dashboard/stats`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error(`Dashboard stats failed: ${await response.text()}`);
            }

            return await response.json();
        }

        // Probar con Nutriólogo 1
        console.log('👨‍⚕️ === NUTRIÓLOGO 1 (María González) ===');
        try {
            const token1 = await login(nutritionist1);
            console.log('✅ Login exitoso para María González');

            const stats1 = await getDashboardStats(token1);
            console.log('📊 Estadísticas de María González:');
            console.log(`   📋 Total Pacientes: ${stats1.data.total_patients}`);
            console.log(`   📅 Total Citas: ${stats1.data.total_appointments}`);
            console.log(`   🍽️  Total Planes: ${stats1.data.total_diet_plans}`);
            console.log(`   📄 Total Expedientes: ${stats1.data.total_clinical_records}`);
            
            console.log('\n🕒 Actividades Recientes:');
            if (stats1.data.recent_activities && stats1.data.recent_activities.length > 0) {
                stats1.data.recent_activities.forEach((activity: any, index: number) => {
                    console.log(`   ${index + 1}. [${activity.type}] ${activity.description}`);
                    console.log(`      📅 ${new Date(activity.date).toLocaleString('es-MX')}`);
                });
            } else {
                console.log('   ❌ No hay actividades recientes');
            }

            console.log('\n📈 Resumen Semanal:');
            console.log(`   🆕 Nuevos pacientes: ${stats1.data.weekly_summary.new_patients}`);
            console.log(`   📅 Nuevas citas: ${stats1.data.weekly_summary.new_appointments}`);

            console.log('\n🎯 Métricas de Rendimiento:');
            console.log(`   ✅ Tasa de completado: ${stats1.data.performance_metrics.completion_rate}%`);

            // Guardar actividades para comparación
            const activitiesNutritionist1 = stats1.data.recent_activities || [];

            // Probar con Nutriólogo 2 si existe
            console.log('\n👨‍⚕️ === NUTRIÓLOGO 2 (Carlos Ruiz) ===');
            try {
                const token2 = await login(nutritionist2);
                console.log('✅ Login exitoso para Carlos Ruiz');

                const stats2 = await getDashboardStats(token2);
                console.log('📊 Estadísticas de Carlos Ruiz:');
                console.log(`   📋 Total Pacientes: ${stats2.data.total_patients}`);
                console.log(`   📅 Total Citas: ${stats2.data.total_appointments}`);
                console.log(`   🍽️  Total Planes: ${stats2.data.total_diet_plans}`);
                console.log(`   📄 Total Expedientes: ${stats2.data.total_clinical_records}`);
                
                console.log('\n🕒 Actividades Recientes:');
                if (stats2.data.recent_activities && stats2.data.recent_activities.length > 0) {
                    stats2.data.recent_activities.forEach((activity: any, index: number) => {
                        console.log(`   ${index + 1}. [${activity.type}] ${activity.description}`);
                        console.log(`      📅 ${new Date(activity.date).toLocaleString('es-MX')}`);
                    });
                } else {
                    console.log('   ❌ No hay actividades recientes');
                }

                const activitiesNutritionist2 = stats2.data.recent_activities || [];

                // Comparar actividades
                console.log('\n🔍 === ANÁLISIS DE INDIVIDUALIZACIÓN ===');
                
                const sameActivities = JSON.stringify(activitiesNutritionist1) === JSON.stringify(activitiesNutritionist2);
                
                if (sameActivities && activitiesNutritionist1.length > 0) {
                    console.log('❌ PROBLEMA: Ambos nutriólogos tienen las mismas actividades (datos globales)');
                    console.log('   🔧 Las actividades NO están filtradas por nutriólogo');
                } else {
                    console.log('✅ CORRECTO: Cada nutriólogo tiene actividades diferentes (datos individuales)');
                    console.log('   🎯 Las actividades SÍ están filtradas por nutriólogo');
                }

                console.log(`\n📊 Comparación de actividades:`);
                console.log(`   María González: ${activitiesNutritionist1.length} actividades`);
                console.log(`   Carlos Ruiz: ${activitiesNutritionist2.length} actividades`);

            } catch (error) {
                console.log('ℹ️  No se pudo probar con el segundo nutriólogo (puede no existir)');
                console.log('   Esto es normal si solo hay un nutriólogo en el sistema');
            }

        } catch (error) {
            console.error('❌ Error con el primer nutriólogo:', error);
        }

        console.log('\n🎉 === PRUEBA COMPLETADA ===');
        console.log('✅ Verificación de actividades individuales por nutriólogo finalizada');

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
testDashboardActivities(); 