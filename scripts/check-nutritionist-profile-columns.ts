import { AppDataSource } from '../src/database/data-source';

async function checkColumns() {
  try {
    await AppDataSource.initialize();
    console.log('✅ Base de datos conectada');
    
    const queryRunner = AppDataSource.createQueryRunner();
    const columns = await queryRunner.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'nutritionist_profiles' 
      AND table_schema = 'public'
      ORDER BY ordinal_position;
    `);
    
    console.log('📋 Columnas existentes en nutritionist_profiles:');
    columns.forEach((col: any) => {
      console.log(`- ${col.column_name}: ${col.data_type} (nullable: ${col.is_nullable}, default: ${col.column_default})`);
    });
    
    await AppDataSource.destroy();
    console.log('✅ Conexión cerrada');
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

checkColumns(); 