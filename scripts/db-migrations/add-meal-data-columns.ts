import { AppDataSource } from './src/database/data-source';

async function addMealDataColumns() {
  try {
    console.log('🔧 Inicializando conexión a base de datos...');
    await AppDataSource.initialize();
    
    console.log('📊 Verificando columnas existentes en diet_plans...');
    
    const columns = ['meal_frequency', 'meal_timing', 'flexibility_settings'];
    
    for (const columnName of columns) {
      // Verificar si la columna ya existe
      const checkColumnQuery = `
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name='diet_plans' 
        AND column_name='${columnName}';
      `;
      
      const existingColumn = await AppDataSource.query(checkColumnQuery);
      
      if (existingColumn.length > 0) {
        console.log(`✅ La columna ${columnName} ya existe`);
        continue;
      }
      
      console.log(`➕ Agregando columna ${columnName}...`);
      
      const addColumnQuery = `
        ALTER TABLE diet_plans 
        ADD COLUMN ${columnName} jsonb NULL;
      `;
      
      await AppDataSource.query(addColumnQuery);
      console.log(`✅ Columna ${columnName} agregada exitosamente`);
    }
    
    console.log('🎉 Todas las columnas de meal data han sido procesadas');
    
    // Verificar estructura final
    const finalStructureQuery = `
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns 
      WHERE table_name='diet_plans' 
      AND column_name IN ('meal_frequency', 'meal_timing', 'flexibility_settings', 'pathological_restrictions');
    `;
    
    const finalStructure = await AppDataSource.query(finalStructureQuery);
    console.log('📋 Estructura final de columnas relacionadas:', finalStructure);
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
    }
  }
}

addMealDataColumns(); 