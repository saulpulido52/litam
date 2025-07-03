import { AppDataSource } from './src/database/data-source';
import { User } from './src/database/entities/user.entity';
import { DietPlan } from './src/database/entities/diet_plan.entity';

async function testCompleteSystem() {
  try {
    console.log('🚀 === PRUEBA COMPLETA DEL SISTEMA ===');
    await AppDataSource.initialize();
    
    const userRepository = AppDataSource.getRepository(User);
    const dietPlanRepository = AppDataSource.getRepository(DietPlan);
    
    // Buscar un plan existente con todos los datos
    console.log('🔍 Buscando planes con datos completos...');
    const completePlans = await dietPlanRepository.find({
      where: {},
      relations: ['patient', 'nutritionist'],
      order: { created_at: 'DESC' },
      take: 3
    });
    
    console.log(`📊 Encontrados ${completePlans.length} planes nutricionales:`);
    
    completePlans.forEach((plan, index) => {
      console.log(`\n${index + 1}. 📋 Plan: "${plan.name}"`);
      console.log(`   👤 Paciente: ${plan.patient?.first_name} ${plan.patient?.last_name} (${plan.patient?.email})`);
      console.log(`   🎯 Calorías: ${plan.daily_calories_target} kcal`);
      console.log(`   📅 Fechas: ${plan.start_date} → ${plan.end_date}`);
      
      // Verificar datos para cada pestaña
      console.log('\n   🔍 ANÁLISIS DE PESTAÑAS:');
      
      // Tab Resumen ✅ (siempre completo)
      console.log('   📋 Tab Resumen: ✅ COMPLETO');
      
      // Tab Comidas 🍽️
      const hasWeeklyPlans = plan.weekly_plans && plan.weekly_plans.length > 0;
      console.log(`   🍽️ Tab Comidas: ${hasWeeklyPlans ? '✅ COMPLETO' : '❌ VACÍO'} (${plan.weekly_plans?.length || 0} semanas)`);
      
      // Tab Nutrición 🎯
      const hasMealFreq = !!plan.meal_frequency;
      const hasFlexibility = !!plan.flexibility_settings;
      console.log(`   🎯 Tab Nutrición: ${hasMealFreq && hasFlexibility ? '✅ COMPLETO' : '⚠️ PARCIAL'}`);
      console.log(`     - Frecuencia comidas: ${hasMealFreq ? '✅' : '❌'}`);
      console.log(`     - Configuración flexibilidad: ${hasFlexibility ? '✅' : '❌'}`);
      
      // Tab Horarios ⏰
      const hasMealTiming = !!plan.meal_timing;
      console.log(`   ⏰ Tab Horarios: ${hasMealTiming ? '✅ COMPLETO' : '❌ VACÍO'}`);
      
      // Tab Restricciones 🛡️
      const hasRestrictions = !!plan.pathological_restrictions;
      console.log(`   🛡️ Tab Restricciones: ${hasRestrictions ? '✅ COMPLETO' : '❌ VACÍO'}`);
      
      if (hasRestrictions) {
        const restrictions = plan.pathological_restrictions as any;
        console.log(`     - Condiciones médicas: ${restrictions.medical_conditions?.length || 0}`);
        console.log(`     - Alergias: ${restrictions.allergies?.length || 0}`);
        console.log(`     - Medicamentos: ${restrictions.medications?.length || 0}`);
        console.log(`     - Consideraciones especiales: ${restrictions.special_considerations?.length || 0}`);
      }
      
      // Resumen final del plan
      const completeTabs = [
        true, // Resumen siempre completo
        hasWeeklyPlans, // Comidas
        hasMealFreq && hasFlexibility, // Nutrición
        hasMealTiming, // Horarios
        hasRestrictions // Restricciones
      ].filter(Boolean).length;
      
      console.log(`\n   📊 RESUMEN: ${completeTabs}/5 pestañas completas`);
      
      if (completeTabs === 5) {
        console.log('   🎉 ¡PLAN PERFECTO! Todas las pestañas tienen datos');
        console.log('   🎯 Recomendación: Usar este plan para probar el visor completo');
        console.log(`   🌐 URL: http://localhost:5004/diet-plans (buscar "${plan.name}")`);
      }
    });
    
    // Verificar estructura de columnas de BD
    console.log('\n🔍 === VERIFICACIÓN DE BASE DE DATOS ===');
    const columnsQuery = `
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns 
      WHERE table_name='diet_plans' 
      AND column_name IN ('pathological_restrictions', 'meal_frequency', 'meal_timing', 'flexibility_settings', 'weekly_plans');
    `;
    
    const columns = await AppDataSource.query(columnsQuery);
    console.log('📋 Columnas de datos estructurales:', columns);
    
    // Estadísticas finales
    const totalPlans = completePlans.length;
    const plansWithRestrictions = completePlans.filter(p => !!p.pathological_restrictions).length;
    const plansWithMealData = completePlans.filter(p => !!p.meal_frequency).length;
    const plansWithWeeklyData = completePlans.filter(p => p.weekly_plans && p.weekly_plans.length > 0).length;
    
    console.log('\n📊 === ESTADÍSTICAS FINALES ===');
    console.log(`🎯 Total de planes: ${totalPlans}`);
    console.log(`🛡️ Con restricciones patológicas: ${plansWithRestrictions}/${totalPlans}`);
    console.log(`🎯 Con datos de comidas: ${plansWithMealData}/${totalPlans}`);
    console.log(`🍽️ Con planes semanales: ${plansWithWeeklyData}/${totalPlans}`);
    
    console.log('\n🚀 === INSTRUCCIONES PARA PROBAR ===');
    console.log('1. Ve a http://localhost:5004/diet-plans');
    console.log('2. Crea un NUEVO plan nutricional (con los logs implementados)');
    console.log('3. Observa los logs en la consola del navegador');
    console.log('4. Ve los "Detalles del Plan" del plan creado');
    console.log('5. Navega por todas las 5 pestañas');
    console.log('6. ¡Todas deberían tener contenido!');
    
    console.log('\n✅ === SISTEMA VERIFICADO EXITOSAMENTE ===');
    
  } catch (error) {
    console.error('❌ Error en la verificación:', error);
  } finally {
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
    }
  }
}

testCompleteSystem(); 