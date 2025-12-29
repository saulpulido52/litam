import axios from 'axios';

interface LoginResponse {
  status: string;
  message: string;
  data: {
    user: {
      id: string;
      email: string;
      role: string;
    };
    token: string;
  };
}

interface DietPlan {
  id: string;
  name: string;
  patient_id: string;
  nutritionist_id: string;
  status: string;
  start_date?: string;
  end_date?: string;
  target_calories?: number;
  target_protein?: number;
  target_carbs?: number;
  target_fats?: number;
  notes?: string;
  is_weekly_plan?: boolean;
  total_weeks?: number;
  weekly_plans?: any[];
  created_at: string;
  updated_at: string;
  patient?: any;
  nutritionist?: any;
}

async function getAuthToken(credentials: { email: string; password: string }): Promise<string> {
  try {
    const response = await axios.post<LoginResponse>('http://localhost:4000/api/auth/login', credentials);
    console.log('✅ Login exitoso:', response.data.message);
    return response.data.data.token;
  } catch (error) {
    console.error('❌ Error en login:', error);
    throw error;
  }
}

async function getAllDietPlans(token: string): Promise<DietPlan[]> {
  try {
    const response = await axios.get<{ status: string; data: { dietPlans: DietPlan[] } }>(
      'http://localhost:4000/api/diet-plans',
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );
    
    console.log(`✅ Obtenidos ${response.data.data.dietPlans.length} planes de dieta`);
    return response.data.data.dietPlans;
  } catch (error) {
    console.error('❌ Error obteniendo planes:', error);
    throw error;
  }
}

async function deleteDietPlan(token: string, planId: string): Promise<void> {
  try {
    console.log(`🗑️ Intentando eliminar plan ${planId}...`);
    
    const response = await axios.delete<{ status: string; message: string; data: null }>(
      `http://localhost:4000/api/diet-plans/${planId}`,
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );
    
    console.log('✅ Respuesta del backend:', {
      status: response.status,
      statusText: response.statusText,
      data: response.data
    });
    
    if (response.data.status === 'success') {
      console.log('✅ Plan eliminado exitosamente');
    } else {
      console.error('❌ Error en la respuesta del backend:', response.data);
    }
  } catch (error: any) {
    console.error('❌ Error eliminando plan:', {
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      message: error.message
    });
    throw error;
  }
}

async function testDietPlanDeletion() {
  try {
    console.log('🧪 Iniciando prueba de eliminación de planes de dieta...\n');
    
    // 1. Login
    const token = await getAuthToken({
      email: 'dr.maria.gonzalez@demo.com',
      password: 'demo123'
    });
    
    // 2. Obtener planes existentes
    const plans = await getAllDietPlans(token);
    
    if (plans.length === 0) {
      console.log('ℹ️ No hay planes para eliminar. Creando uno de prueba...');
      
      // Crear un plan de prueba
      const testPlan = await axios.post<{ status: string; data: { dietPlan: DietPlan } }>(
        'http://localhost:4000/api/diet-plans',
        {
          patientId: '3cc3e7d4-9417-4811-9e6a-8ef120374c95', // ID de paciente demo
          name: 'Plan de prueba para eliminación',
          description: 'Plan temporal para probar eliminación',
          startDate: '2024-01-01',
          endDate: '2024-01-07',
          dailyCaloriesTarget: 2000,
          dailyMacrosTarget: {
            protein: 150,
            carbohydrates: 200,
            fats: 50
          },
          notes: 'Plan temporal',
          isWeeklyPlan: true,
          totalWeeks: 1
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      
      console.log('✅ Plan de prueba creado:', testPlan.data.data.dietPlan.id);
      plans.push(testPlan.data.data.dietPlan);
    }
    
    // 3. Seleccionar el primer plan para eliminar
    const planToDelete = plans[0];
    console.log(`🎯 Plan seleccionado para eliminar: ${planToDelete.name} (ID: ${planToDelete.id})`);
    
    // 4. Eliminar el plan
    await deleteDietPlan(token, planToDelete.id);
    
    // 5. Verificar que el plan fue eliminado
    console.log('\n🔍 Verificando que el plan fue eliminado...');
    const remainingPlans = await getAllDietPlans(token);
    
    const planStillExists = remainingPlans.find(p => p.id === planToDelete.id);
    
    if (planStillExists) {
      console.log('❌ ERROR: El plan aún existe después de la eliminación');
    } else {
      console.log('✅ ÉXITO: El plan fue eliminado correctamente');
    }
    
    console.log(`📊 Planes restantes: ${remainingPlans.length}`);
    
  } catch (error) {
    console.error('❌ Error en la prueba:', error);
  }
}

// Ejecutar la prueba
testDietPlanDeletion()
  .then(() => {
    console.log('\n✅ Prueba completada');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Prueba falló:', error);
    process.exit(1);
  }); 