import { AppDataSource } from '../src/database/data-source';

async function fixMigrations() {
    try {
        await AppDataSource.initialize();
        console.log('🔧 Solucionando migraciones...');

        // Verificar migraciones ejecutadas
        const executedMigrations = await AppDataSource.query(`
            SELECT * FROM "migrations" ORDER BY "id" DESC
        `);
        console.log('📋 Migraciones ejecutadas:', executedMigrations.length);

        // Verificar qué columnas ya existen en las tablas principales
        const tables = ['diet_plans', 'patient_profiles', 'nutritionist_profiles'];
        
        for (const table of tables) {
            console.log(`\n📊 Verificando tabla: ${table}`);
            const columns = await AppDataSource.query(`
                SELECT column_name, data_type, is_nullable
                FROM information_schema.columns 
                WHERE table_name = '${table}' 
                ORDER BY ordinal_position
            `);
            
            console.log(`Columnas en ${table}:`);
            columns.forEach((col: any) => {
                console.log(`  - ${col.column_name}: ${col.data_type}`);
            });
        }

        // Verificar específicamente las columnas problemáticas
        const dietPlansColumns = await AppDataSource.query(`
            SELECT column_name FROM information_schema.columns 
            WHERE table_name = 'diet_plans' AND column_name = 'pathological_restrictions'
        `);

        if (dietPlansColumns.length === 0) {
            console.log('\n⚠️  Columna pathological_restrictions no existe en diet_plans. Agregándola...');
            await AppDataSource.query(`
                ALTER TABLE "diet_plans" ADD COLUMN "pathological_restrictions" jsonb
            `);
            console.log('✅ Columna pathological_restrictions agregada');
        } else {
            console.log('✅ Columna pathological_restrictions ya existe');
        }

        // Verificar columnas de patient_profiles
        const patientProfileColumns = await AppDataSource.query(`
            SELECT column_name FROM information_schema.columns 
            WHERE table_name = 'patient_profiles' AND column_name = 'is_pediatric_patient'
        `);

        if (patientProfileColumns.length === 0) {
            console.log('\n⚠️  Columna is_pediatric_patient no existe en patient_profiles. Agregándola...');
            await AppDataSource.query(`
                ALTER TABLE "patient_profiles" ADD COLUMN "is_pediatric_patient" boolean DEFAULT false
            `);
            console.log('✅ Columna is_pediatric_patient agregada');
        } else {
            console.log('✅ Columna is_pediatric_patient ya existe');
        }

        // Marcar las migraciones problemáticas como ejecutadas manualmente
        const problematicMigrations = [
            { name: 'AddPathologicalRestrictionsToDietPlans1704073200000', timestamp: 1704073200000 },
            { name: 'AddPediatricFieldsToPatientProfiles1704073500000', timestamp: 1704073500000 }
        ];

        for (const migration of problematicMigrations) {
            const exists = await AppDataSource.query(`
                SELECT 1 FROM "migrations" WHERE "name" = $1
            `, [migration.name]);

            if (exists.length === 0) {
                console.log(`\n📝 Marcando migración ${migration.name} como ejecutada...`);
                await AppDataSource.query(`
                    INSERT INTO "migrations" ("name", "timestamp") VALUES ($1, $2)
                `, [migration.name, migration.timestamp]);
                console.log(`✅ Migración ${migration.name} marcada como ejecutada`);
            } else {
                console.log(`✅ Migración ${migration.name} ya está marcada como ejecutada`);
            }
        }

        console.log('\n🎉 Todas las migraciones han sido solucionadas');
        await AppDataSource.destroy();
    } catch (error) {
        console.error('❌ Error durante la solución de migraciones:', error);
        process.exit(1);
    }
}

fixMigrations(); 