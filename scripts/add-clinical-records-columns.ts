import { AppDataSource } from '../src/database/data-source';

async function addClinicalRecordsColumns() {
    try {
        await AppDataSource.initialize();
        console.log('🔧 Agregando columnas faltantes a clinical_records...');

        // Verificar si existe la columna tipo_expediente
        const tipoExpedienteExists = await AppDataSource.query(`
            SELECT column_name FROM information_schema.columns 
            WHERE table_name = 'clinical_records' AND column_name = 'tipo_expediente'
        `);

        if (tipoExpedienteExists.length === 0) {
            console.log('⚠️  Columna tipo_expediente no existe. Agregándola...');
            await AppDataSource.query(`
                ALTER TABLE "clinical_records" ADD COLUMN "tipo_expediente" "tipo_expediente_enum" NOT NULL DEFAULT 'inicial'
            `);
            console.log('✅ Columna tipo_expediente agregada exitosamente');
        } else {
            console.log('✅ Columna tipo_expediente ya existe');
        }

        // Verificar si existe la columna expediente_base_id
        const expedienteBaseIdExists = await AppDataSource.query(`
            SELECT column_name FROM information_schema.columns 
            WHERE table_name = 'clinical_records' AND column_name = 'expediente_base_id'
        `);

        if (expedienteBaseIdExists.length === 0) {
            console.log('⚠️  Columna expediente_base_id no existe. Agregándola...');
            await AppDataSource.query(`
                ALTER TABLE "clinical_records" ADD COLUMN "expediente_base_id" uuid
            `);
            console.log('✅ Columna expediente_base_id agregada exitosamente');
        } else {
            console.log('✅ Columna expediente_base_id ya existe');
        }

        // Verificar si existe la columna seguimiento_metadata
        const seguimientoMetadataExists = await AppDataSource.query(`
            SELECT column_name FROM information_schema.columns 
            WHERE table_name = 'clinical_records' AND column_name = 'seguimiento_metadata'
        `);

        if (seguimientoMetadataExists.length === 0) {
            console.log('⚠️  Columna seguimiento_metadata no existe. Agregándola...');
            await AppDataSource.query(`
                ALTER TABLE "clinical_records" ADD COLUMN "seguimiento_metadata" jsonb
            `);
            console.log('✅ Columna seguimiento_metadata agregada exitosamente');
        } else {
            console.log('✅ Columna seguimiento_metadata ya existe');
        }

        // Verificar estado final
        const finalColumns = await AppDataSource.query(`
            SELECT column_name, data_type, is_nullable
            FROM information_schema.columns 
            WHERE table_name = 'clinical_records' 
            ORDER BY ordinal_position
        `);
        
        console.log('\n📊 Estado final de clinical_records:');
        finalColumns.forEach((col: any) => {
            console.log(`  - ${col.column_name}: ${col.data_type} ${col.is_nullable === 'YES' ? 'NULL' : 'NOT NULL'}`);
        });

        console.log('\n🎉 Todas las columnas han sido agregadas');
        await AppDataSource.destroy();
    } catch (error) {
        console.error('❌ Error durante la adición de columnas:', error);
        process.exit(1);
    }
}

addClinicalRecordsColumns(); 