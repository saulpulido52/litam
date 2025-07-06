import { AppDataSource } from '../src/database/data-source';

async function runMigration() {
  try {
    await AppDataSource.initialize();
    console.log('✅ Base de datos conectada');
    
    await AppDataSource.runMigrations();
    console.log('✅ Migraciones ejecutadas exitosamente');
    
    await AppDataSource.destroy();
    console.log('✅ Conexión cerrada');
  } catch (error) {
    console.error('❌ Error ejecutando migraciones:', error);
    process.exit(1);
  }
}

runMigration(); 