import 'dotenv/config';

interface LoginResponse {
  token: string;
  user: {
    id: string;
    email: string;
    role: string;
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

async function getAuthToken(credentials: { email: string; password: string }) {
  const response = await fetch('http://localhost:4000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(credentials)
  });
  
  const data = await response.json();
  if (data.status === 'success') {
    return data.data.token;
  }
  throw new Error('Login failed');
}

async function getAllDietPlans(token: string) {
  const response = await fetch('http://localhost:4000/api/diet-plans', {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
  
  const data = await response.json();
  console.log('🟢 Respuesta completa del backend:', data);
  
  if (data.status === 'success') {
    return data.data.dietPlans || [];
  }
  throw new Error('Failed to fetch diet plans');
}

async function testDietPlansVisualization() {
  try {
    console.log('🟢 Iniciando prueba de visualización de planes de dieta...');
    
    // Login
    const token = await getAuthToken({
      email: 'dr.maria.gonzalez@demo.com',
      password: 'demo123'
    });
    console.log('✅ Login exitoso');
    
    // Obtener todos los planes
    const dietPlans = await getAllDietPlans(token);
    console.log('✅ Planes obtenidos:', dietPlans.length);
    console.log('📋 Detalles de los planes:');
    
    dietPlans.forEach((plan: DietPlan, index: number) => {
      console.log(`\n--- Plan ${index + 1} ---`);
      console.log('ID:', plan.id);
      console.log('Nombre:', plan.name);
      console.log('Estado:', plan.status);
      console.log('Paciente:', plan.patient?.first_name, plan.patient?.last_name);
      console.log('Fecha inicio:', plan.start_date);
      console.log('Fecha fin:', plan.end_date);
      console.log('Calorías objetivo:', plan.target_calories);
      console.log('Es plan semanal:', plan.is_weekly_plan);
      console.log('Total semanas:', plan.total_weeks);
      console.log('Semanas del plan:', plan.weekly_plans?.length || 0);
    });
    
    console.log('\n🎯 Prueba completada exitosamente');
    
  } catch (error) {
    console.error('🔴 Error en la prueba:', error);
  }
}

testDietPlansVisualization(); 