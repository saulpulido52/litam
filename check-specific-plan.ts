import { AppDataSource } from './src/database/data-source';
import { DietPlan } from './src/database/entities/diet_plan.entity';

async function checkSpecificPlan() {
  try {
    console.log('🔧 Inicializando conexión a base de datos...');
    await AppDataSource.initialize();
    
    const dietPlanRepository = AppDataSource.getRepository(DietPlan);
    
    console.log('🔍 Buscando plan específico creado...');
    const plan = await dietPlanRepository.findOne({
      where: { name: 'Plan Nutricional Integral con Restricciones Completas' },
      relations: ['patient', 'nutritionist']
    });
    
    if (!plan) {
      console.log('❌ Plan no encontrado');
      return;
    }
    
    console.log('✅ Plan encontrado:');
    console.log(`📋 ID: ${plan.id}`);
    console.log(`👤 Paciente: ${plan.patient?.email}`);
    console.log(`👨‍⚕️ Nutricionista: ${plan.nutritionist?.email}`);
    
    console.log('\n🔍 Verificando pathological_restrictions...');
    
    if (plan.pathological_restrictions) {
      console.log('✅ pathological_restrictions existe');
      
      // Verificar estructura
      const restrictions = plan.pathological_restrictions as any;
      console.log('\n📊 Estructura de datos:');
      console.log(`- medical_conditions: ${Array.isArray(restrictions.medical_conditions) ? 'Array' : typeof restrictions.medical_conditions} (${restrictions.medical_conditions?.length || 0} elementos)`);
      console.log(`- allergies: ${Array.isArray(restrictions.allergies) ? 'Array' : typeof restrictions.allergies} (${restrictions.allergies?.length || 0} elementos)`);
      console.log(`- intolerances: ${Array.isArray(restrictions.intolerances) ? 'Array' : typeof restrictions.intolerances} (${restrictions.intolerances?.length || 0} elementos)`);
      console.log(`- medications: ${Array.isArray(restrictions.medications) ? 'Array' : typeof restrictions.medications} (${restrictions.medications?.length || 0} elementos)`);
      console.log(`- special_considerations: ${Array.isArray(restrictions.special_considerations) ? 'Array' : typeof restrictions.special_considerations} (${restrictions.special_considerations?.length || 0} elementos)`);
      console.log(`- emergency_contacts: ${Array.isArray(restrictions.emergency_contacts) ? 'Array' : typeof restrictions.emergency_contacts} (${restrictions.emergency_contacts?.length || 0} elementos)`);
      
      console.log('\n📋 Contenido completo:');
      console.log(JSON.stringify(restrictions, null, 2));
      
    } else {
      console.log('❌ pathological_restrictions es null o undefined');
      console.log('📋 Campos disponibles en el plan:', Object.keys(plan));
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
    }
  }
}

checkSpecificPlan(); 