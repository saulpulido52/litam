import { AppDataSource } from '../src/database/data-source';

async function checkClinicalRecordsTable() {
    try {
        await AppDataSource.initialize();
        console.log('🔍 Verificando tabla clinical_records...');

        // Verificar si la tabla existe
        const tableExists = await AppDataSource.query(`
            SELECT EXISTS (
                SELECT FROM information_schema.tables 
                WHERE table_schema = 'public' 
                AND table_name = 'clinical_records'
            )
        `);
        
        console.log('📋 Tabla clinical_records existe:', tableExists[0].exists);

        if (!tableExists[0].exists) {
            console.log('⚠️  La tabla clinical_records NO existe. Creándola...');
            
            // Crear la tabla clinical_records con las columnas básicas
            await AppDataSource.query(`
                CREATE TABLE "clinical_records" (
                    "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                    "record_date" date NOT NULL,
                    "patient_user_id" uuid NOT NULL,
                    "nutritionist_user_id" uuid NOT NULL,
                    "expedient_number" character varying(50),
                    "tipo_expediente" "tipo_expediente_enum" NOT NULL DEFAULT 'inicial',
                    "expediente_base_id" uuid,
                    "seguimiento_metadata" jsonb,
                    "consultation_reason" text,
                    "current_problems" jsonb,
                    "diagnosed_diseases" jsonb,
                    "family_medical_history" jsonb,
                    "gynecological_aspects" text,
                    "daily_activities" jsonb,
                    "nutritional_plan_and_management" character varying(255),
                    "macronutrient_distribution" jsonb,
                    "dietary_calculation_scheme" text,
                    "menu_details" jsonb,
                    "evolution_and_follow_up_notes" text,
                    "graph_url" character varying(255),
                    "laboratory_documents" jsonb,
                    "document_metadata" jsonb,
                    "drug_nutrient_interactions" jsonb,
                    "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                    "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                    CONSTRAINT "PK_clinical_records" PRIMARY KEY ("id")
                )
            `);
            
            console.log('✅ Tabla clinical_records creada exitosamente');
        } else {
            console.log('✅ Tabla clinical_records ya existe');
        }

        // Verificar columnas específicas
        const columns = await AppDataSource.query(`
            SELECT column_name, data_type, is_nullable
            FROM information_schema.columns 
            WHERE table_name = 'clinical_records' 
            ORDER BY ordinal_position
        `);
        
        console.log('\n📊 Columnas en clinical_records:');
        columns.forEach((col: any) => {
            console.log(`  - ${col.column_name}: ${col.data_type} ${col.is_nullable === 'YES' ? 'NULL' : 'NOT NULL'}`);
        });

        // Verificar si existe el enum tipo_expediente_enum
        const enumExists = await AppDataSource.query(`
            SELECT EXISTS (
                SELECT FROM pg_type 
                WHERE typname = 'tipo_expediente_enum'
            )
        `);
        
        console.log('\n🎯 Enum tipo_expediente_enum existe:', enumExists[0].exists);

        if (!enumExists[0].exists) {
            console.log('⚠️  El enum tipo_expediente_enum NO existe. Creándolo...');
            
            await AppDataSource.query(`
                CREATE TYPE "tipo_expediente_enum" AS ENUM(
                    'inicial', 
                    'seguimiento', 
                    'urgencia', 
                    'control', 
                    'pre_operatorio', 
                    'post_operatorio', 
                    'consulta_especialidad', 
                    'anual', 
                    'telehealth'
                )
            `);
            
            console.log('✅ Enum tipo_expediente_enum creado exitosamente');
        }

        // Verificar si hay datos en la tabla
        const recordCount = await AppDataSource.query(`
            SELECT COUNT(*) as count FROM "clinical_records"
        `);
        
        console.log(`\n📈 Total de registros en clinical_records: ${recordCount[0].count}`);

        await AppDataSource.destroy();
        console.log('\n🎉 Verificación completada');
    } catch (error) {
        console.error('❌ Error durante la verificación:', error);
        process.exit(1);
    }
}

checkClinicalRecordsTable(); 