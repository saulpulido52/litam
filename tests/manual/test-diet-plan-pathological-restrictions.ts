import { AppDataSource } from './src/database/data-source';
import { DietPlan } from './src/database/entities/diet_plan.entity';

async function testPathologicalRestrictions() {
  try {
    console.log('🔧 Inicializando conexión a base de datos...');
    await AppDataSource.initialize();
    
    console.log('📋 Buscando planes nutricionales recientes...');
    const dietPlanRepository = AppDataSource.getRepository(DietPlan);
    
    // Buscar los últimos 3 planes creados
    const recentPlans = await dietPlanRepository.find({
      order: { created_at: 'DESC' },
      take: 3
    });
    
    console.log(`\n📊 Encontrados ${recentPlans.length} planes nutricionales:`);
    
    recentPlans.forEach((plan, index) => {
      console.log(`\n${index + 1}. 📄 Plan: "${plan.name}"`);
      console.log(`   📅 Creado: ${plan.created_at}`);
      console.log(`   👤 Paciente: ${plan.patient?.email || 'N/A'}`);
      
      // Verificar si existe campo pathological_restrictions en cualquier formato
      const restrictions = (plan as any).pathological_restrictions || 
                          (plan as any).pathologicalRestrictions ||
                          null;
      
      if (restrictions) {
        console.log(`   🔍 Restricciones patológicas encontradas:`);
        
        // const restrictions = plan.pathological_restrictions as any;
        
        // Verificar condiciones médicas
        if (restrictions.medical_conditions && restrictions.medical_conditions.length > 0) {
          console.log(`   ❤️  Condiciones médicas: ${restrictions.medical_conditions.length}`);
          restrictions.medical_conditions.forEach((condition: any, i: number) => {
            console.log(`      ${i + 1}. ${condition.name}: ${condition.description}`);
          });
        }
        
        // Verificar alergias
        if (restrictions.allergies && restrictions.allergies.length > 0) {
          console.log(`   ⚠️  Alergias: ${restrictions.allergies.length}`);
          restrictions.allergies.forEach((allergy: any, i: number) => {
            console.log(`      ${i + 1}. ${allergy.allergen} (${allergy.severity})`);
            console.log(`         Evitar: ${allergy.avoidance_instructions}`);
          });
        }
        
        // Verificar medicamentos
        if (restrictions.medications && restrictions.medications.length > 0) {
          console.log(`   💊 Medicamentos: ${restrictions.medications.length}`);
          restrictions.medications.forEach((med: any, i: number) => {
            console.log(`      ${i + 1}. ${med.name} - ${med.dosage}, ${med.frequency}`);
          });
        }
        
        // Verificar intolerancias
        if (restrictions.intolerances && restrictions.intolerances.length > 0) {
          console.log(`   🤧 Intolerancias: ${restrictions.intolerances.length}`);
          restrictions.intolerances.forEach((intol: any, i: number) => {
            console.log(`      ${i + 1}. ${intol.substance} (${intol.severity})`);
          });
        }
        
        // Verificar consideraciones especiales
        if (restrictions.special_considerations && restrictions.special_considerations.length > 0) {
          console.log(`   ✨ Consideraciones especiales: ${restrictions.special_considerations.length}`);
          restrictions.special_considerations.forEach((consideration: string, i: number) => {
            console.log(`      ${i + 1}. ${consideration}`);
          });
        }
        
        // Mostrar JSON completo para el primer plan
        if (index === 0) {
          console.log(`\n📋 JSON completo de restricciones del plan más reciente:`);
          console.log(JSON.stringify(restrictions, null, 2));
        }
      } else {
        console.log(`   ⚪ Sin restricciones patológicas`);
      }
    });
    
    console.log('\n✅ Verificación completada');
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
    }
  }
}

testPathologicalRestrictions(); 