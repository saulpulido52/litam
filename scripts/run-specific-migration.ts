import { AppDataSource } from '../src/database/data-source';

async function runSpecificMigration() {
  try {
    await AppDataSource.initialize();
    console.log('✅ Base de datos conectada');
    
    // Ejecutar solo la migración específica
    const migration = new (await import('../src/database/migrations/1704073500000-AddMobileFieldsToNutritionistProfiles')).AddMobileFieldsToNutritionistProfiles1704073500000();
    
    await migration.up(AppDataSource.createQueryRunner());
    console.log('✅ Migración ejecutada exitosamente');
    
    await AppDataSource.destroy();
    console.log('✅ Conexión cerrada');
  } catch (error) {
    console.error('❌ Error ejecutando migración:', error);
    process.exit(1);
  }
}

runSpecificMigration(); 