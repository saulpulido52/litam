// test-db-connection.ts
import 'dotenv/config';
import { AppDataSource } from './src/database/data-source';

async function testConnection() {
    try {
        console.log('🔍 Intentando conectar a la base de datos...');
        console.log('📊 Configuración:', {
            host: process.env.DB_HOST,
            port: process.env.DB_PORT,
            username: process.env.DB_USERNAME,
            database: process.env.DB_DATABASE,
            nodeEnv: process.env.NODE_ENV
        });

        if (!AppDataSource.isInitialized) {
            await AppDataSource.initialize();
            console.log('✅ Conexión exitosa a la base de datos!');
        } else {
            console.log('✅ La conexión ya estaba inicializada');
        }

        // Probar una consulta simple
        const result = await AppDataSource.query('SELECT NOW() as current_time');
        console.log('⏰ Hora actual de la BD:', result[0].current_time);

        await AppDataSource.destroy();
        console.log('🔌 Conexión cerrada correctamente');
        
    } catch (error) {
        console.error('❌ Error al conectar con la base de datos:');
        console.error(error);
        process.exit(1);
    }
}

testConnection(); 