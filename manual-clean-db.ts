import 'reflect-metadata';
import { AppDataSource } from './src/database/data-source';

async function manualCleanDatabase() {
    try {
        // Inicializar sin sincronización
        const tempDataSource = AppDataSource.setOptions({
            synchronize: false,
            dropSchema: false
        });
        
        await tempDataSource.initialize();
        console.log('🔗 Conexión establecida');

        // Eliminar tablas en orden (respetando foreign keys)
        const tablesToDrop = [
            'user_subscriptions',
            'subscription_plans',
            'payment_transactions'
        ];

        for (const table of tablesToDrop) {
            try {
                await tempDataSource.query(`DROP TABLE IF EXISTS "${table}" CASCADE;`);
                console.log(`✅ Tabla ${table} eliminada`);
            } catch (error) {
                console.log(`⚠️  Tabla ${table} no existe o ya fue eliminada`);
            }
        }

        // Eliminar tipos de enum relacionados
        const enumsToDelete = [
            'subscription_plans_duration_type_enum',
            'subscription_plans_type_enum',
            'user_subscriptions_status_enum'
        ];

        for (const enumType of enumsToDelete) {
            try {
                await tempDataSource.query(`DROP TYPE IF EXISTS "public"."${enumType}" CASCADE;`);
                console.log(`✅ Enum ${enumType} eliminado`);
            } catch (error) {
                console.log(`⚠️  Enum ${enumType} no existe o ya fue eliminado`);
            }
        }

        console.log('🎉 Base de datos limpiada exitosamente');
        await tempDataSource.destroy();

    } catch (error) {
        console.error('❌ Error limpiando base de datos:', error);
    }
}

if (require.main === module) {
    manualCleanDatabase();
}
