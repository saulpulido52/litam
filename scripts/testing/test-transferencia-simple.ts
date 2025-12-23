#!/usr/bin/env ts-node

/**
 * 🧪 PRUEBA SIMPLE DE TRANSFERENCIA DE NUTRIÓLOGO
 * 
 * Caso: Eliminar relación del "Dr. sistema nutrional" y transferir
 * todos sus datos a "dr.juan.perez@demo.com"
 * 
 * Fecha: 03 de Julio de 2025
 */

import { AppDataSource } from '../../src/database/data-source';

class SimpleNutritionistTransfer {
    async initialize(): Promise<void> {
        try {
            console.log('🔌 Iniciando conexión a base de datos...');
            if (!AppDataSource.isInitialized) {
                await AppDataSource.initialize();
                console.log('✅ Conexión a base de datos establecida');
            } else {
                console.log('✅ Base de datos ya inicializada');
            }
        } catch (error) {
            console.error('❌ Error conectando a base de datos:', error);
            throw error;
        }
    }

    async findNutritionistByEmail(email: string): Promise<any> {
        try {
            console.log(`🔍 Buscando nutriólogo: ${email}`);
            const result = await AppDataSource.query(`
                SELECT u.id, u.email, u.first_name, u.last_name, r.name as role_name
                FROM users u 
                JOIN roles r ON u.role_id = r.id 
                WHERE u.email = $1 AND r.name = 'nutritionist'
            `, [email]);

            if (result.length > 0) {
                console.log(`✅ Nutriólogo encontrado: ${result[0].first_name} ${result[0].last_name}`);
                return result[0];
            } else {
                console.log(`❌ Nutriólogo no encontrado: ${email}`);
                return null;
            }
        } catch (error) {
            console.error('❌ Error buscando nutriólogo:', error);
            return null;
        }
    }

    async getNutritionistData(nutritionistId: string): Promise<any> {
        try {
            console.log(`📊 Obteniendo datos del nutriólogo: ${nutritionistId}`);
            
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

            const data = {
                activePatients: parseInt(relationsResult[0]?.active_patients || '0'),
                totalDietPlans: parseInt(plansResult[0]?.total_plans || '0'),
                totalClinicalRecords: parseInt(recordsResult[0]?.total_records || '0')
            };

            console.log(`   📈 Datos obtenidos: ${data.activePatients} pacientes, ${data.totalDietPlans} planes, ${data.totalClinicalRecords} expedientes`);
            
            return data;
        } catch (error) {
            console.error('❌ Error obteniendo datos:', error);
            return {
                activePatients: 0,
                totalDietPlans: 0,
                totalClinicalRecords: 0
            };
        }
    }

    async runTransferTest(): Promise<void> {
        console.log('🧪 INICIANDO PRUEBA SIMPLE DE TRANSFERENCIA DE NUTRIÓLOGO');
        console.log('=' .repeat(65));

        try {
            // 1. Buscar nutriólogos
            console.log('\n📋 PASO 1: Identificar nutriólogos');
            const sourceNutritionist = await this.findNutritionistByEmail('nutri.admin@sistema.com');
            const targetNutritionist = await this.findNutritionistByEmail('dr.juan.perez@demo.com');

            if (!sourceNutritionist || !targetNutritionist) {
                console.log('❌ No se pudieron encontrar ambos nutriólogos');
                console.log('   Asegúrate de que ambos usuarios existen y tienen rol de nutriólogo');
                return;
            }

            console.log(`✅ Nutriólogo origen: ${sourceNutritionist.first_name} ${sourceNutritionist.last_name}`);
            console.log(`✅ Nutriólogo destino: ${targetNutritionist.first_name} ${targetNutritionist.last_name}`);

            // 2. Obtener datos iniciales
            console.log('\n📊 PASO 2: Obtener datos iniciales');
            const sourceDataBefore = await this.getNutritionistData(sourceNutritionist.id);
            const targetDataBefore = await this.getNutritionistData(targetNutritionist.id);

            console.log(`\n🔍 ESTADO INICIAL:`);
            console.log(`   Dr. Sistema (origen):`);
            console.log(`     - Pacientes activos: ${sourceDataBefore.activePatients}`);
            console.log(`     - Planes dietéticos: ${sourceDataBefore.totalDietPlans}`);
            console.log(`     - Expedientes clínicos: ${sourceDataBefore.totalClinicalRecords}`);
            
            console.log(`   Dr. Juan Pérez (destino):`);
            console.log(`     - Pacientes activos: ${targetDataBefore.activePatients}`);
            console.log(`     - Planes dietéticos: ${targetDataBefore.totalDietPlans}`);
            console.log(`     - Expedientes clínicos: ${targetDataBefore.totalClinicalRecords}`);

            console.log('\n🎯 CASO DE PRUEBA COMPLETADO');
            console.log('Para continuar con la transferencia real, ejecuta el diagnóstico de integridad.');
            
        } catch (error) {
            console.error('❌ Error en la prueba:', error);
        }
    }

    async cleanup(): Promise<void> {
        if (AppDataSource.isInitialized) {
            await AppDataSource.destroy();
            console.log('✅ Conexión a base de datos cerrada');
        }
    }
}

// Ejecutar la prueba
async function main() {
    const transferTest = new SimpleNutritionistTransfer();
    
    try {
        await transferTest.initialize();
        await transferTest.runTransferTest();
    } finally {
        await transferTest.cleanup();
    }
}

// Ejecutar si es llamado directamente
if (require.main === module) {
    main().catch(console.error);
}

export { SimpleNutritionistTransfer }; 