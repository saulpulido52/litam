import { AppDataSource } from '../src/database/data-source';
import { User } from '../src/database/entities/user.entity';
import { ClinicalRecord } from '../src/database/entities/clinical_record.entity';
import { DietPlan } from '../src/database/entities/diet_plan.entity';

async function checkPatientData() {
  try {
    await AppDataSource.initialize();
    
    const patientId = '66f1ff30-6075-4fc0-8ceb-a3fd0bf2d90f';
    console.log('🔍 Verificando paciente ID:', patientId);
    
    const userRepo = AppDataSource.getRepository(User);
    const recordRepo = AppDataSource.getRepository(ClinicalRecord);
    const planRepo = AppDataSource.getRepository(DietPlan);
    
    // 1. Verificar que el paciente existe
    const patient = await userRepo.findOne({
      where: { id: patientId },
      relations: ['role']
    });
    
    if (!patient) {
      console.log('❌ Paciente no encontrado');
      return;
    }
    
    console.log('\n✅ PACIENTE ENCONTRADO:');
    console.log('  📧 Email:', patient.email);
    console.log('  👤 Nombre:', patient.first_name, patient.last_name);
    console.log('  👥 Rol:', patient.role?.name);
    console.log('  📅 Fecha nacimiento:', patient.birth_date);
    console.log('  🚻 Género:', patient.gender);
    
    // 2. Verificar expedientes clínicos
    const clinicalRecords = await recordRepo.find({
      where: { patient: { id: patient.id } },
      order: { record_date: 'ASC' },
      relations: ['patient', 'nutritionist']
    });
    
    console.log('\n📋 EXPEDIENTES CLÍNICOS:');
    console.log('  📊 Cantidad total:', clinicalRecords.length);
    
    if (clinicalRecords.length === 0) {
      console.log('  ❌ No tiene expedientes clínicos - NECESARIOS para análisis automático');
    } else {
      let recordsWithAnthropometric = 0;
      
      clinicalRecords.forEach((record, index) => {
        console.log(`\n  📋 Expediente ${index + 1}:`);
        console.log('    📅 Fecha:', record.record_date);
        console.log('    🩺 Nutriólogo:', record.nutritionist?.first_name, record.nutritionist?.last_name);
        
        const anthropometric = record.anthropometric_measurements;
        if (anthropometric) {
          recordsWithAnthropometric++;
          console.log('    📏 MEDIDAS ANTROPOMÉTRICAS:');
          console.log('      ⚖️ Peso:', anthropometric.current_weight_kg ? `${anthropometric.current_weight_kg} kg` : '❌ No registrado');
          console.log('      📏 Altura:', anthropometric.height_m ? `${anthropometric.height_m} m` : '❌ No registrado');
          console.log('      📐 Cintura:', anthropometric.waist_circ_cm ? `${anthropometric.waist_circ_cm} cm` : '❌ No registrado');
          console.log('      💪 Brazo:', anthropometric.arm_circ_cm ? `${anthropometric.arm_circ_cm} cm` : '❌ No registrado');
          console.log('      🍑 Cadera:', anthropometric.hip_circ_cm ? `${anthropometric.hip_circ_cm} cm` : '❌ No registrado');
          console.log('      🦵 Pantorrilla:', anthropometric.calf_circ_cm ? `${anthropometric.calf_circ_cm} cm` : '❌ No registrado');
        } else {
          console.log('    ❌ Sin medidas antropométricas');
        }
        
        const evaluations = record.anthropometric_evaluations;
        if (evaluations) {
          console.log('    📊 EVALUACIONES:');
          console.log('      📊 IMC:', evaluations.imc_kg_t2 ? `${evaluations.imc_kg_t2} kg/m²` : '❌ No calculado');
          console.log('      🎯 Peso ideal:', evaluations.ideal_weight_kg ? `${evaluations.ideal_weight_kg} kg` : '❌ No calculado');
          console.log('      📈 Variación peso ideal:', evaluations.weight_variation_percent ? `${evaluations.weight_variation_percent}%` : '❌ No calculado');
        }
      });
      
      console.log(`\n  📊 Expedientes con medidas antropométricas: ${recordsWithAnthropometric}/${clinicalRecords.length}`);
    }
    
    // 3. Verificar planes de dieta
    const dietPlans = await planRepo.find({
      where: { patient: { id: patient.id } },
      order: { start_date: 'DESC' },
      relations: ['patient', 'nutritionist']
    });
    
    console.log('\n🍎 PLANES DE DIETA:');
    console.log('  📊 Cantidad total:', dietPlans.length);
    
    if (dietPlans.length === 0) {
      console.log('  ⚠️ No tiene planes de dieta - RECOMENDADO para análisis completo');
    } else {
      dietPlans.forEach((plan, index) => {
        console.log(`\n  🍎 Plan ${index + 1}:`);
        console.log('    📝 Nombre:', plan.name);
        console.log('    📅 Inicio:', plan.start_date);
        console.log('    📅 Fin:', plan.end_date);
        console.log('    🔄 Estado:', plan.status);
        console.log('    🔥 Calorías objetivo:', plan.daily_calories_target ? `${plan.daily_calories_target} kcal/día` : '❌ No especificado');
        console.log('    🥗 Macros objetivo:', plan.daily_macros_target ? 'Configurado' : '❌ No configurado');
        console.log('    🤖 Generado por IA:', plan.generated_by_ia ? 'Sí' : 'No');
        console.log('    🩺 Nutriólogo:', plan.nutritionist?.first_name, plan.nutritionist?.last_name);
      });
    }
    
    // 4. Evaluación final para análisis automático
    console.log('\n🎯 EVALUACIÓN PARA ANÁLISIS AUTOMÁTICO:');
    
    const hasRecords = clinicalRecords.length > 0;
    const hasAnthropometric = clinicalRecords.some(r => r.anthropometric_measurements);
    const hasWeight = clinicalRecords.some(r => r.anthropometric_measurements?.current_weight_kg);
    const hasHeight = clinicalRecords.some(r => r.anthropometric_measurements?.height_m);
    const hasMultipleRecords = clinicalRecords.length >= 2;
    const hasPlans = dietPlans.length > 0;
    const hasActivePlan = dietPlans.some(p => p.status === 'active');
    
    console.log('  ✅ Expedientes clínicos:', hasRecords ? '✅ SÍ' : '❌ NO');
    console.log('  📏 Medidas antropométricas:', hasAnthropometric ? '✅ SÍ' : '❌ NO');
    console.log('  ⚖️ Datos de peso:', hasWeight ? '✅ SÍ' : '❌ NO');
    console.log('  📏 Datos de altura:', hasHeight ? '✅ SÍ' : '❌ NO');
    console.log('  📊 Múltiples expedientes (para comparar):', hasMultipleRecords ? '✅ SÍ' : '⚠️ NO (solo ' + clinicalRecords.length + ')');
    console.log('  🍎 Planes de dieta:', hasPlans ? '✅ SÍ' : '⚠️ NO');
    console.log('  🔄 Plan activo:', hasActivePlan ? '✅ SÍ' : '⚠️ NO');
    
    // Resultado final
    console.log('\n🎯 RESULTADO FINAL:');
    
    if (hasRecords && hasAnthropometric && hasWeight) {
      console.log('✅ ¡El paciente SÍ puede generar análisis automático!');
      console.log('\n💡 RECOMENDACIONES:');
      console.log('  1. 🚀 Usar el botón "Análisis Automático" en la página de progreso');
      console.log('  2. 📊 El sistema generará datos basados en los expedientes clínicos');
      
      if (!hasMultipleRecords) {
        console.log('  3. ⚠️ Con solo 1 expediente, el análisis será limitado (no puede comparar cambios)');
        console.log('  4. 📋 Recomendado: Crear más expedientes clínicos para análisis completo');
      }
      
      if (!hasPlans) {
        console.log('  3. 🍎 Recomendado: Crear un plan de dieta para análisis de adherencia');
      }
      
      if (!hasActivePlan && hasPlans) {
        console.log('  4. 🔄 Recomendado: Activar un plan de dieta para seguimiento actual');
      }
      
    } else {
      console.log('❌ El paciente NO puede generar análisis automático completo');
      console.log('\n📋 REQUISITOS FALTANTES:');
      
      if (!hasRecords) {
        console.log('  ❌ Necesita: Expedientes clínicos');
      }
      if (!hasAnthropometric) {
        console.log('  ❌ Necesita: Medidas antropométricas en los expedientes');
      }
      if (!hasWeight) {
        console.log('  ❌ Necesita: Datos de peso en las medidas antropométricas');
      }
      
      console.log('\n🔧 ACCIONES REQUERIDAS:');
      console.log('  1. 📋 Crear/editar expedientes clínicos');
      console.log('  2. 📏 Agregar medidas antropométricas (peso, altura, circunferencias)');
      console.log('  3. 🍎 Opcional: Crear planes de dieta para análisis completo');
    }
    
  } catch (error) {
    console.error('❌ Error verificando paciente:', error);
  } finally {
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
    }
  }
}

checkPatientData(); 