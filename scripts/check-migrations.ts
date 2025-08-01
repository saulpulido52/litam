import { AppDataSource } from '../src/database/data-source';

async function checkMigrations() {
    try {
        await AppDataSource.initialize();
        console.log('🔍 Verificando estado de migraciones...');

        // Verificar migraciones ejecutadas
        const migrations = await AppDataSource.query(`
            SELECT * FROM "migrations" ORDER BY "id" DESC
        `);
        console.log('📋 Migraciones ejecutadas:', migrations.length);
        migrations.forEach((migration: any) => {
            console.log(`  - ${migration.name} (${migration.timestamp})`);
        });

        // Verificar estructura de patient_profiles
        const columns = await AppDataSource.query(`
            SELECT column_name, data_type, is_nullable, column_default
            FROM information_schema.columns 
            WHERE table_name = 'patient_profiles' 
            ORDER BY ordinal_position
        `);
        
        console.log('\n📊 Columnas en patient_profiles:');
        columns.forEach((col: any) => {
            console.log(`  - ${col.column_name}: ${col.data_type} ${col.is_nullable === 'YES' ? 'NULL' : 'NOT NULL'}`);
        });

        // Verificar si existe la columna is_pediatric_patient
        const hasPediatricColumn = columns.some((col: any) => col.column_name === 'is_pediatric_patient');
        console.log(`\n🎯 Columna is_pediatric_patient existe: ${hasPediatricColumn}`);

        if (!hasPediatricColumn) {
            console.log('⚠️  La columna is_pediatric_patient NO existe. Agregándola...');
            
            await AppDataSource.query(`
                ALTER TABLE "patient_profiles" 
                ADD COLUMN "is_pediatric_patient" boolean DEFAULT false
            `);
            
            console.log('✅ Columna is_pediatric_patient agregada exitosamente');
        }

        await AppDataSource.destroy();
        console.log('✅ Verificación completada');
    } catch (error) {
        console.error('❌ Error durante la verificación:', error);
        process.exit(1);
    }
}

checkMigrations(); 