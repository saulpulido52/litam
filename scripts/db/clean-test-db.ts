import 'dotenv/config';
import { AppDataSource } from './src/database/data-source';

async function cleanTestDatabase() {
    try {
        console.log('🧹 Limpiando base de datos de pruebas...');
        
        if (!AppDataSource.isInitialized) {
            await AppDataSource.initialize();
        }

        // Desactivar restricciones de clave foránea temporalmente
        await AppDataSource.query('SET session_replication_role = replica;');

        // Limpiar todas las tablas en orden correcto (excepto roles)
        const tablesToClean = [
            'meal_items',
            'meals', 
            'diet_plans',
            'patient_nutritionist_relations',
            'patient_profiles',
            'nutritionist_profiles',
            'foods',
            'appointments',
            'nutritionist_availabilities',
            'patient_progress_logs',
            'user_subscriptions',
            'payment_transactions',
            'educational_content',
            'recipes',
            'conversations',
            'messages',
            'clinical_records',
            'users'
        ];

        for (const table of tablesToClean) {
            try {
                await AppDataSource.query(`TRUNCATE TABLE "${table}" RESTART IDENTITY CASCADE;`);
                console.log(`✅ Tabla ${table} limpiada`);
            } catch (error: any) {
                console.log(`⚠️ Error limpiando tabla ${table}:`, error.message);
            }
        }

        // Reactivar restricciones de clave foránea
        await AppDataSource.query('SET session_replication_role = DEFAULT;');

        // Verificar que los roles existen
        const roleRepository = AppDataSource.getRepository('Role');
        const roles = await roleRepository.find();
        console.log(`✅ Roles encontrados: ${roles.length}`);

        console.log('✅ Base de datos de pruebas limpiada exitosamente');
    } catch (error) {
        console.error('❌ Error limpiando base de datos:', error);
        throw error;
    }
}

// Ejecutar si se llama directamente
if (require.main === module) {
    cleanTestDatabase()
        .then(() => {
            console.log('✅ Limpieza completada');
            process.exit(0);
        })
        .catch((error) => {
            console.error('❌ Error en limpieza:', error);
            process.exit(1);
        });
}

export { cleanTestDatabase }; 