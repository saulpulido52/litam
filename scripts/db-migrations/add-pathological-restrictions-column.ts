import { AppDataSource } from './src/database/data-source';

async function addPathologicalRestrictionsColumn() {
  try {
    console.log('🔧 Inicializando conexión a base de datos...');
    await AppDataSource.initialize();
    
    console.log('📊 Verificando si la columna pathological_restrictions ya existe...');
    
    // Verificar si la columna ya existe
    const checkColumnQuery = `
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name='diet_plans' 
      AND column_name='pathological_restrictions';
    `;
    
    const existingColumn = await AppDataSource.query(checkColumnQuery);
    
    if (existingColumn.length > 0) {
      console.log('✅ La columna pathological_restrictions ya existe en la tabla diet_plans');
      return;
    }
    
    console.log('➕ Añadiendo columna pathological_restrictions a la tabla diet_plans...');
    
    // Añadir la columna
    const addColumnQuery = `
      ALTER TABLE diet_plans 
      ADD COLUMN pathological_restrictions jsonb;
    `;
    
    await AppDataSource.query(addColumnQuery);
    
    console.log('✅ Columna pathological_restrictions añadida exitosamente!');
    
    // Verificar que se añadió correctamente
    const verifyQuery = `
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns 
      WHERE table_name='diet_plans' 
      AND column_name='pathological_restrictions';
    `;
    
    const result = await AppDataSource.query(verifyQuery);
    console.log('📋 Detalles de la columna añadida:', result[0]);
    
  } catch (error) {
    console.error('❌ Error al añadir la columna:', error);
  } finally {
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
    }
  }
}

addPathologicalRestrictionsColumn(); 