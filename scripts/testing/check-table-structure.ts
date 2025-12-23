import { AppDataSource } from '../../src/database/data-source';

async function checkTableStructure() {
    try {
        console.log('🔍 Verificando estructura de la tabla nutritionist_profiles...');
        
        await AppDataSource.initialize();
        
        // Consultar la estructura de la tabla
        const result = await AppDataSource.query(`
            SELECT column_name, data_type, is_nullable, column_default
            FROM information_schema.columns 
            WHERE table_name = 'nutritionist_profiles' 
            ORDER BY ordinal_position
        `);
        
        console.log('📋 Estructura actual de la tabla nutritionist_profiles:');
        result.forEach((column: any) => {
            console.log(`  - ${column.column_name}: ${column.data_type} ${column.is_nullable === 'YES' ? '(nullable)' : '(NOT NULL)'} ${column.column_default ? `DEFAULT: ${column.column_default}` : ''}`);
        });
        
        // Verificar si existen las columnas problemáticas
        const problematicColumns = ['professional_id', 'professional_id_issuer', 'university', 'degree_title', 'graduation_date', 'verification_status'];
        
        console.log('\n🔍 Verificando columnas problemáticas:');
        problematicColumns.forEach(column => {
            const exists = result.some((col: any) => col.column_name === column);
            console.log(`  - ${column}: ${exists ? '✅ Existe' : '❌ No existe'}`);
        });
        
        await AppDataSource.destroy();
        
    } catch (error: any) {
        console.error('❌ Error al verificar la estructura:', error.message);
        
        if (AppDataSource.isInitialized) {
            await AppDataSource.destroy();
        }
    }
}

checkTableStructure().catch(console.error); 