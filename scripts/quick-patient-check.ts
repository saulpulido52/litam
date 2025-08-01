import { AppDataSource } from '../src/database/data-source';
import { User } from '../src/database/entities/user.entity';
import { ClinicalRecord } from '../src/database/entities/clinical_record.entity';
import { DietPlan } from '../src/database/entities/diet_plan.entity';

async function quickPatientCheck() {
  try {
    await AppDataSource.initialize();
    
    const patientId = '66f1ff30-6075-4fc0-8ceb-a3fd0bf2d90f';
    
    const userRepo = AppDataSource.getRepository(User);
    const recordRepo = AppDataSource.getRepository(ClinicalRecord);
    const planRepo = AppDataSource.getRepository(DietPlan);
    
    // Verificar paciente
    const patient = await userRepo.findOne({
      where: { id: patientId },
      relations: ['role']
    });
    
    if (!patient) {
      console.log('❌ PACIENTE NO ENCONTRADO');
      return;
    }
    
    console.log('✅ PACIENTE:', patient.first_name, patient.last_name);
    console.log('📧 Email:', patient.email);
    
    // Verificar expedientes
    const records = await recordRepo.find({
      where: { patient: { id: patientId } },
      order: { record_date: 'ASC' }
    });
    
    console.log('\n📋 EXPEDIENTES:', records.length);
    
    let hasAnthropometric = false;
    let hasWeight = false;
    let recordsWithData = 0;
    
    records.forEach((record, i) => {
      console.log(`  ${i+1}. Fecha: ${record.record_date}`);
      if (record.anthropometric_measurements) {
        hasAnthropometric = true;
        recordsWithData++;
        if (record.anthropometric_measurements.current_weight_kg) {
          hasWeight = true;
          console.log(`     Peso: ${record.anthropometric_measurements.current_weight_kg} kg`);
        }
        if (record.anthropometric_measurements.height_m) {
          console.log(`     Altura: ${record.anthropometric_measurements.height_m} m`);
        }
        if (record.anthropometric_measurements.waist_circ_cm) {
          console.log(`     Cintura: ${record.anthropometric_measurements.waist_circ_cm} cm`);
        }
      } else {
        console.log('     ❌ Sin medidas antropométricas');
      }
    });
    
    // Verificar planes
    const plans = await planRepo.find({
      where: { patient: { id: patientId } },
      order: { start_date: 'DESC' }
    });
    
    console.log('\n🍎 PLANES DE DIETA:', plans.length);
    const hasActivePlan = plans.some(p => p.status === 'active');
    
    plans.forEach((plan, i) => {
      console.log(`  ${i+1}. ${plan.name} - Estado: ${plan.status}`);
    });
    
    // Evaluación final
    console.log('\n🎯 EVALUACIÓN:');
    console.log('✅ Expedientes clínicos:', records.length > 0 ? 'SÍ' : 'NO');
    console.log('📏 Medidas antropométricas:', hasAnthropometric ? 'SÍ' : 'NO');
    console.log('⚖️ Datos de peso:', hasWeight ? 'SÍ' : 'NO');
    console.log('📊 Expedientes con datos:', `${recordsWithData}/${records.length}`);
    console.log('🍎 Planes de dieta:', plans.length > 0 ? 'SÍ' : 'NO');
    console.log('🔄 Plan activo:', hasActivePlan ? 'SÍ' : 'NO');
    
    console.log('\n🎯 RESULTADO:');
    if (records.length > 0 && hasAnthropometric && hasWeight) {
      console.log('✅ ¡PUEDE GENERAR ANÁLISIS AUTOMÁTICO!');
      console.log('🚀 Usa el botón "Análisis Automático" en la página de progreso');
      
      if (records.length === 1) {
        console.log('⚠️ Solo 1 expediente - análisis limitado (no puede comparar cambios)');
      }
      
      if (!plans.length) {
        console.log('💡 Recomendación: Crear plan de dieta para análisis completo');
      }
      
    } else {
      console.log('❌ NO PUEDE GENERAR ANÁLISIS AUTOMÁTICO');
      
      if (!records.length) {
        console.log('📋 Necesita: Crear expedientes clínicos');
      }
      if (!hasAnthropometric) {
        console.log('📏 Necesita: Agregar medidas antropométricas a los expedientes');
      }
      if (!hasWeight) {
        console.log('⚖️ Necesita: Agregar datos de peso en las medidas');
      }
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
    }
  }
}

quickPatientCheck(); 