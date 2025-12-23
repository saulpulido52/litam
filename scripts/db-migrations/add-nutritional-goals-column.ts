import { AppDataSource } from './src/database/data-source';

async function addNutritionalGoalsColumn() {
  try {
    console.log('🔧 Verificando conexión a la base de datos...');
    
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
      console.log('✅ Base de datos conectada exitosamente');
    }

    console.log('🔍 Verificando si la columna nutritional_goals ya existe...');
    
    // Verificar si la columna ya existe
    const result = await AppDataSource.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'diet_plans' 
      AND column_name = 'nutritional_goals';
    `);

    if (result.length > 0) {
      console.log('⚠️ La columna nutritional_goals ya existe en la tabla diet_plans');
      return;
    }

    console.log('➕ Agregando columna nutritional_goals...');
    
    // Agregar la nueva columna
    await AppDataSource.query(`
      ALTER TABLE diet_plans 
      ADD COLUMN nutritional_goals JSONB;
    `);

    console.log('✅ Columna nutritional_goals agregada exitosamente');
    
    // Verificar el resultado
    const verification = await AppDataSource.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'diet_plans' 
      AND column_name = 'nutritional_goals';
    `);
    
    console.log('🔍 Verificación:', verification);
    
    console.log('🎯 ¡Proceso completado exitosamente!');
    console.log('');
    console.log('📋 PRÓXIMOS PASOS:');
    console.log('1. Reinicia el servidor backend: npm run dev');
    console.log('2. Ve a la aplicación web y crea un NUEVO plan nutricional');
    console.log('3. Los datos de objetivos nutricionales aparecerán en el TAB NUTRICIÓN');
    console.log('4. Los horarios de dormir aparecerán en el TAB HORARIOS');
    console.log('5. Las restricciones solo mostrarán preferencias dietéticas médicas');
    
  } catch (error) {
    console.error('❌ Error al agregar la columna nutritional_goals:', error);
  } finally {
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
      console.log('🔌 Conexión cerrada');
    }
  }
}

addNutritionalGoalsColumn(); 