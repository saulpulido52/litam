import { AppDataSource } from './src/database/data-source';
import { DietPlan } from './src/database/entities/diet_plan.entity';

async function testDietPlanStatuses() {
  try {
    await AppDataSource.initialize();
    console.log('✅ Conectado a la base de datos');

    const dietPlanRepository = AppDataSource.getRepository(DietPlan);
    
    // Obtener todos los planes de dieta
    const dietPlans = await dietPlanRepository.find({
      relations: ['patient', 'nutritionist'],
      order: { created_at: 'DESC' }
    });

    console.log(`\n📊 Total de planes de dieta: ${dietPlans.length}`);
    
    if (dietPlans.length === 0) {
      console.log('❌ No hay planes de dieta en la base de datos');
      return;
    }

    // Mostrar cada plan con su estado
    console.log('\n📋 Estados de los planes de dieta:');
    console.log('=' .repeat(80));
    
    dietPlans.forEach((plan, index) => {
      const patientName = plan.patient ? `${plan.patient.first_name} ${plan.patient.last_name}` : 'N/A';
      const nutritionistName = plan.nutritionist ? `${plan.nutritionist.first_name} ${plan.nutritionist.last_name}` : 'N/A';
      
      // Simular el badge visual
      const getStatusDisplay = (status: string) => {
        const statusConfig = {
          draft: { icon: '📝', text: 'Borrador', color: 'gris' },
          pending_review: { icon: '⏳', text: 'En Revisión', color: 'amarillo' },
          active: { icon: '✅', text: 'Activo', color: 'verde' },
          archived: { icon: '📁', text: 'Archivado', color: 'negro' },
          completed: { icon: '🏁', text: 'Completado', color: 'azul' },
          cancelled: { icon: '❌', text: 'Cancelado', color: 'rojo' }
        };
        
        const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.draft;
        return `${config.icon} ${config.text} (${config.color})`;
      };

      // Manejar fechas correctamente
      const formatDate = (date: any) => {
        if (!date) return 'N/A';
        try {
          return new Date(date).toLocaleDateString('es-ES');
        } catch (error) {
          return 'N/A';
        }
      };

      console.log(`${index + 1}. Plan: "${plan.name}"`);
      console.log(`   Paciente: ${patientName}`);
      console.log(`   Nutriólogo: ${nutritionistName}`);
      console.log(`   Estado: ${getStatusDisplay(plan.status)}`);
      console.log(`   Fechas: ${formatDate(plan.start_date)} - ${formatDate(plan.end_date)}`);
      console.log(`   Creado: ${formatDate(plan.created_at)}`);
      console.log('');
    });

    // Estadísticas por estado
    const statusStats = dietPlans.reduce((acc, plan) => {
      acc[plan.status] = (acc[plan.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    console.log('📈 Estadísticas por estado:');
    console.log('=' .repeat(40));
    Object.entries(statusStats).forEach(([status, count]) => {
      const display = getStatusDisplay(status);
      console.log(`${display}: ${count} plan${count !== 1 ? 'es' : ''}`);
    });

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await AppDataSource.destroy();
  }
}

// Función auxiliar para simular getStatusDisplay
function getStatusDisplay(status: string) {
  const statusConfig = {
    draft: { icon: '📝', text: 'Borrador', color: 'gris' },
    pending_review: { icon: '⏳', text: 'En Revisión', color: 'amarillo' },
    active: { icon: '✅', text: 'Activo', color: 'verde' },
    archived: { icon: '📁', text: 'Archivado', color: 'negro' },
    completed: { icon: '🏁', text: 'Completado', color: 'azul' },
    cancelled: { icon: '❌', text: 'Cancelado', color: 'rojo' }
  };
  
  const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.draft;
  return `${config.icon} ${config.text} (${config.color})`;
}

testDietPlanStatuses().catch(console.error); 