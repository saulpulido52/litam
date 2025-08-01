import { AppDataSource } from '../src/database/data-source';

async function addPediatricColumns() {
    try {
        await AppDataSource.initialize();
        console.log('🔧 Agregando columnas pediátricas faltantes...');

        // Lista de todas las columnas pediátricas que deben existir
        const pediatricColumns = [
            { name: 'caregiver_info', type: 'jsonb', nullable: true },
            { name: 'birth_history', type: 'jsonb', nullable: true },
            { name: 'feeding_history', type: 'jsonb', nullable: true },
            { name: 'developmental_milestones', type: 'jsonb', nullable: true },
            { name: 'pediatric_growth_history', type: 'jsonb', nullable: true },
            { name: 'school_social_info', type: 'jsonb', nullable: true },
            { name: 'vaccination_status', type: 'jsonb', nullable: true },
            { name: 'pediatric_habits', type: 'jsonb', nullable: true },
            { name: 'pediatric_measurements', type: 'jsonb', nullable: true },
            { name: 'pediatric_medical_history', type: 'jsonb', nullable: true },
            { name: 'pediatric_nutrition_assessment', type: 'jsonb', nullable: true }
        ];

        for (const column of pediatricColumns) {
            const exists = await AppDataSource.query(`
                SELECT column_name FROM information_schema.columns 
                WHERE table_name = 'patient_profiles' AND column_name = $1
            `, [column.name]);

            if (exists.length === 0) {
                console.log(`⚠️  Columna ${column.name} no existe. Agregándola...`);
                await AppDataSource.query(`
                    ALTER TABLE "patient_profiles" ADD COLUMN "${column.name}" ${column.type} ${column.nullable ? 'NULL' : 'NOT NULL'}
                `);
                console.log(`✅ Columna ${column.name} agregada exitosamente`);
            } else {
                console.log(`✅ Columna ${column.name} ya existe`);
            }
        }

        // Verificar estado final
        const finalColumns = await AppDataSource.query(`
            SELECT column_name, data_type, is_nullable
            FROM information_schema.columns 
            WHERE table_name = 'patient_profiles' 
            ORDER BY ordinal_position
        `);
        
        console.log('\n📊 Estado final de patient_profiles:');
        finalColumns.forEach((col: any) => {
            console.log(`  - ${col.column_name}: ${col.data_type} ${col.is_nullable === 'YES' ? 'NULL' : 'NOT NULL'}`);
        });

        console.log('\n🎉 Todas las columnas pediátricas han sido agregadas');
        await AppDataSource.destroy();
    } catch (error) {
        console.error('❌ Error durante la adición de columnas:', error);
        process.exit(1);
    }
}

addPediatricColumns(); 