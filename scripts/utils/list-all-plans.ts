import { AppDataSource } from './src/database/data-source';
import { DietPlan } from './src/database/entities/diet_plan.entity';

async function listAllPlans() {
  try {
    console.log('🔧 Inicializando conexión a base de datos...');
    await AppDataSource.initialize();
    
    const dietPlanRepository = AppDataSource.getRepository(DietPlan);
    
    console.log('📋 Listando TODOS los planes nutricionales...');
    const plans = await dietPlanRepository.find({
      relations: ['patient', 'nutritionist'],
      order: { created_at: 'DESC' }
    });
    
    console.log(`\n🎯 Encontrados ${plans.length} planes nutricionales:\n`);
    
    plans.forEach((plan, index) => {
      console.log(`${index + 1}. 📋 ID: ${plan.id}`);
      console.log(`   📝 Nombre: "${plan.name}"`);
      console.log(`   📖 Descripción: "${plan.description || 'Sin descripción'}"`);
      console.log(`   👤 Paciente: ${plan.patient?.email || 'N/A'}`);
      console.log(`   👨‍⚕️ Nutricionista: ${plan.nutritionist?.email || 'N/A'}`);
      console.log(`   📅 Creado: ${plan.created_at.toLocaleDateString()}`);
      console.log(`   📅 Inicio: ${plan.start_date ? new Date(plan.start_date).toLocaleDateString() : 'N/A'}`);
      console.log(`   🔥 Calorías: ${plan.daily_calories_target || 'N/A'} kcal`);
      console.log(`   🛡️ Restricciones: ${plan.pathological_restrictions ? 'SÍ ✅' : 'NO ❌'}`);
      
      if (plan.pathological_restrictions) {
        const restrictions = plan.pathological_restrictions as any;
        console.log(`        - Condiciones médicas: ${restrictions.medical_conditions?.length || 0}`);
        console.log(`        - Alergias: ${restrictions.allergies?.length || 0}`);
        console.log(`        - Medicamentos: ${restrictions.medications?.length || 0}`);
      }
      
      console.log('   ' + '─'.repeat(80));
    });
    
    // Buscar específicamente el plan que creamos
    const targetPlan = plans.find(p => p.name === 'Plan Nutricional Integral con Restricciones Completas');
    
    if (targetPlan) {
      console.log('\n🎯 ¡PLAN OBJETIVO ENCONTRADO!');
      console.log(`📋 Nombre exacto: "${targetPlan.name}"`);
      console.log(`👤 Paciente: ${targetPlan.patient?.email}`);
      console.log(`🆔 ID: ${targetPlan.id}`);
      console.log(`📅 Fecha de creación: ${targetPlan.created_at}`);
      console.log('\n🔍 INSTRUCCIONES PARA ENCONTRARLO:');
      console.log('1. Ve al frontend en el puerto actual');
      console.log('2. Navega a "Planes Nutricionales"');
      console.log('3. Busca por el nombre EXACTO: "Plan Nutricional Integral con Restricciones Completas"');
      console.log('4. O busca por paciente: "hiradprueba@gmail.com"');
      console.log('5. Haz clic en "Ver Detalles" de ESE plan específico');
      console.log('6. Ve al tab "Restricciones" 🛡️');
    } else {
      console.log('\n❌ Plan objetivo no encontrado. Puede necesitar recrearse.');
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
    }
  }
}

listAllPlans(); 