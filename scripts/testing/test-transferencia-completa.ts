#!/usr/bin/env ts-node

/**
 * 🧪 TRANSFERENCIA COMPLETA DE NUTRIÓLOGO
 * 
 * CASO: Eliminar completamente al "Dr. Sistema Nutricional" del frontend
 * y transferir TODOS sus datos a "Dr. Juan Pérez"
 * 
 * Fecha: 03 de Julio de 2025
 */

import { AppDataSource } from '../../src/database/data-source';

class CompleteNutritionistTransfer {
    async initialize(): Promise<void> {
        try {
            console.log('🔌 Iniciando conexión a base de datos...');
            if (!AppDataSource.isInitialized) {
                await AppDataSource.initialize();
            }
            console.log('✅ Conexión establecida');
        } catch (error) {
            console.error('❌ Error conectando:', error);
            throw error;
        }
    }

    async findNutritionistByEmail(email: string): Promise<any> {
        const result = await AppDataSource.query(`
            SELECT u.id, u.email, u.first_name, u.last_name
            FROM users u 
            JOIN roles r ON u.role_id = r.id 
            WHERE u.email = $1 AND r.name = 'nutritionist'
        `, [email]);
        
        return result.length > 0 ? result[0] : null;
    }

    async getNutritionistData(nutritionistId: string): Promise<any> {
        // Contar relaciones activas
        const relationsResult = await AppDataSource.query(`
            SELECT COUNT(*) as active_patients
            FROM patient_nutritionist_relations 
            WHERE nutritionist_user_id = $1 AND status = 'active'
        `, [nutritionistId]);

        // Contar planes dietéticos
        const plansResult = await AppDataSource.query(`
            SELECT COUNT(*) as total_plans
            FROM diet_plans 
            WHERE nutritionist_user_id = $1
        `, [nutritionistId]);

        // Contar expedientes clínicos
        const recordsResult = await AppDataSource.query(`
            SELECT COUNT(*) as total_records
            FROM clinical_records 
            WHERE nutritionist_user_id = $1
        `, [nutritionistId]);

        return {
            activePatients: parseInt(relationsResult[0]?.active_patients || '0'),
            totalDietPlans: parseInt(plansResult[0]?.total_plans || '0'),
            totalClinicalRecords: parseInt(recordsResult[0]?.total_records || '0')
        };
    }

    async executeTransfer(fromNutritionistId: string, toNutritionistId: string): Promise<void> {
        console.log('\n🔄 EJECUTANDO TRANSFERENCIA COMPLETA');
        console.log('=' .repeat(50));

        try {
            // 1. DESACTIVAR RELACIONES DEL NUTRIÓLOGO ORIGEN
            console.log('\n📋 Paso 1: Desactivando relaciones del Dr. Sistema...');
            const deactivateResult = await AppDataSource.query(`
                UPDATE patient_nutritionist_relations 
                SET status = 'inactive', updated_at = NOW()
                WHERE nutritionist_user_id = $1 AND status = 'active'
            `, [fromNutritionistId]);
            
            const relationsDeactivated = deactivateResult[1] || 0;
            console.log(`   ✅ ${relationsDeactivated} relaciones desactivadas`);

            // 2. TRANSFERIR PLANES DIETÉTICOS
            console.log('\n📋 Paso 2: Transfiriendo planes dietéticos...');
            const dietPlansResult = await AppDataSource.query(`
                UPDATE diet_plans 
                SET nutritionist_user_id = $1, updated_at = NOW()
                WHERE nutritionist_user_id = $2
            `, [toNutritionistId, fromNutritionistId]);
            
            const plansTransferred = dietPlansResult[1] || 0;
            console.log(`   ✅ ${plansTransferred} planes dietéticos transferidos`);

            // 3. TRANSFERIR EXPEDIENTES CLÍNICOS
            console.log('\n📄 Paso 3: Transfiriendo expedientes clínicos...');
            const clinicalRecordsResult = await AppDataSource.query(`
                UPDATE clinical_records 
                SET nutritionist_user_id = $1, updated_at = NOW()
                WHERE nutritionist_user_id = $2
            `, [toNutritionistId, fromNutritionistId]);
            
            const recordsTransferred = clinicalRecordsResult[1] || 0;
            console.log(`   ✅ ${recordsTransferred} expedientes clínicos transferidos`);

            // 4. CREAR NUEVAS RELACIONES ACTIVAS
            console.log('\n👥 Paso 4: Creando nuevas relaciones con Dr. Juan Pérez...');
            
            // Obtener todos los pacientes únicos que tenían relación con el nutriólogo origen
            const oldPatients = await AppDataSource.query(`
                SELECT DISTINCT patient_user_id, 
                       u.first_name, u.last_name, u.email
                FROM patient_nutritionist_relations pnr
                JOIN users u ON pnr.patient_user_id = u.id
                WHERE pnr.nutritionist_user_id = $1
            `, [fromNutritionistId]);

            let newRelationsCreated = 0;
            
            for (const patient of oldPatients) {
                // Verificar si ya existe relación activa con el nuevo nutriólogo
                const existingRelation = await AppDataSource.query(`
                    SELECT id FROM patient_nutritionist_relations
                    WHERE patient_user_id = $1 AND nutritionist_user_id = $2 AND status = 'active'
                `, [patient.patient_user_id, toNutritionistId]);

                if (existingRelation.length === 0) {
                    // Crear nueva relación activa
                    await AppDataSource.query(`
                        INSERT INTO patient_nutritionist_relations 
                        (patient_user_id, nutritionist_user_id, status, requested_at, updated_at)
                        VALUES ($1, $2, 'active', NOW(), NOW())
                    `, [patient.patient_user_id, toNutritionistId]);
                    
                    console.log(`   ✅ Relación creada: ${patient.first_name} ${patient.last_name} → Dr. Juan Pérez`);
                    newRelationsCreated++;
                } else {
                    console.log(`   ⚠️ Relación ya existía: ${patient.first_name} ${patient.last_name} → Dr. Juan Pérez`);
                }
            }

            console.log(`\n🎉 TRANSFERENCIA COMPLETADA EXITOSAMENTE`);
            console.log(`   📊 Resumen:`);
            console.log(`     - Relaciones desactivadas: ${relationsDeactivated}`);
            console.log(`     - Planes transferidos: ${plansTransferred}`);
            console.log(`     - Expedientes transferidos: ${recordsTransferred}`);
            console.log(`     - Nuevas relaciones creadas: ${newRelationsCreated}`);

        } catch (error) {
            console.error('❌ Error durante la transferencia:', error);
            throw error;
        }
    }

    async verifyTransfer(nutritionistEmail: string, label: string): Promise<void> {
        const nutritionist = await this.findNutritionistByEmail(nutritionistEmail);
        if (!nutritionist) {
            console.log(`❌ No se encontró: ${nutritionistEmail}`);
            return;
        }

        const data = await this.getNutritionistData(nutritionist.id);
        
        console.log(`\n📊 ${label}:`);
        console.log(`   👤 ${nutritionist.first_name} ${nutritionist.last_name} (${nutritionist.email})`);
        console.log(`   👥 Pacientes activos: ${data.activePatients}`);
        console.log(`   📋 Planes dietéticos: ${data.totalDietPlans}`);
        console.log(`   📄 Expedientes clínicos: ${data.totalClinicalRecords}`);

        if (data.activePatients > 0) {
            const patients = await AppDataSource.query(`
                SELECT u.first_name, u.last_name, u.email
                FROM patient_nutritionist_relations pnr
                JOIN users u ON pnr.patient_user_id = u.id
                WHERE pnr.nutritionist_user_id = $1 AND pnr.status = 'active'
                ORDER BY u.first_name
            `, [nutritionist.id]);

            console.log(`\n   👥 PACIENTES ASIGNADOS:`);
            patients.forEach((patient: any, index: number) => {
                console.log(`      ${index + 1}. ${patient.first_name} ${patient.last_name} (${patient.email})`);
            });
        }
    }

    async runCompleteTransfer(): Promise<void> {
        console.log('🚀 CASO DE PRUEBA: TRANSFERENCIA COMPLETA DE NUTRIÓLOGO');
        console.log('=' .repeat(70));
        console.log('📝 OBJETIVO: Eliminar Dr. Sistema del frontend y transferir todo a Dr. Juan Pérez');
        console.log('=' .repeat(70));

        try {
            // 1. Buscar nutriólogos
            console.log('\n📋 PASO 1: Identificar nutriólogos involucrados');
            const drSistema = await this.findNutritionistByEmail('nutri.admin@sistema.com');
            const drJuan = await this.findNutritionistByEmail('dr.juan.perez@demo.com');

            if (!drSistema || !drJuan) {
                console.log('❌ Error: No se encontraron ambos nutriólogos');
                return;
            }

            console.log(`✅ Dr. Sistema encontrado: ${drSistema.first_name} ${drSistema.last_name}`);
            console.log(`✅ Dr. Juan Pérez encontrado: ${drJuan.first_name} ${drJuan.last_name}`);

            // 2. Estado inicial
            console.log('\n📊 PASO 2: Estado inicial (ANTES)');
            await this.verifyTransfer('nutri.admin@sistema.com', 'DR. SISTEMA (ORIGEN)');
            await this.verifyTransfer('dr.juan.perez@demo.com', 'DR. JUAN PÉREZ (DESTINO)');

            // 3. Ejecutar transferencia
            await this.executeTransfer(drSistema.id, drJuan.id);

            // 4. Estado final
            console.log('\n📊 PASO 3: Estado final (DESPUÉS)');
            await this.verifyTransfer('nutri.admin@sistema.com', 'DR. SISTEMA (YA SIN DATOS)');
            await this.verifyTransfer('dr.juan.perez@demo.com', 'DR. JUAN PÉREZ (CON TODOS LOS DATOS)');

            console.log('\n✅ CASO DE PRUEBA COMPLETADO EXITOSAMENTE');
            console.log('=' .repeat(70));
            console.log('🎯 RESULTADO ESPERADO:');
            console.log('   ✅ Dr. Sistema: 0 pacientes, 0 planes, 0 expedientes');
            console.log('   ✅ Dr. Juan Pérez: Todos los datos transferidos');
            console.log('   ✅ En el frontend, Dr. Sistema no debería mostrar nada');
            console.log('   ✅ En el frontend, Dr. Juan Pérez debería mostrar todo');
            
        } catch (error) {
            console.error('❌ Error en la prueba completa:', error);
        }
    }

    async cleanup(): Promise<void> {
        if (AppDataSource.isInitialized) {
            await AppDataSource.destroy();
        }
    }
}

// Ejecutar la transferencia completa
async function main() {
    const transferTest = new CompleteNutritionistTransfer();
    
    try {
        await transferTest.initialize();
        await transferTest.runCompleteTransfer();
    } finally {
        await transferTest.cleanup();
    }
}

if (require.main === module) {
    main().catch(console.error);
}

export { CompleteNutritionistTransfer }; 