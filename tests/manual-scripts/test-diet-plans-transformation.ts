import 'dotenv/config';

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

interface BackendDietPlan {
  id: string;
  name: string;
  patient: {
    id: string;
    email: string;
    first_name: string;
    last_name: string;
  };
  nutritionist: {
    id: string;
    email: string;
    first_name: string;
    last_name: string;
  };
  status: string;
  start_date?: string;
  end_date?: string;
  daily_calories_target?: string;
  daily_macros_target?: {
    protein: number;
    carbohydrates: number;
    fats: number;
  };
  notes?: string;
  description?: string;
  is_weekly_plan?: boolean;
  total_weeks?: number;
  weekly_plans?: any[];
  meals?: any[];
  created_at: string;
  updated_at: string;
}

interface TransformedDietPlan {
  id: string;
  patient_id: string;
  nutritionist_id: string;
  name: string;
  description?: string;
  status: string;
  start_date?: string;
  end_date?: string;
  target_calories?: number;
  target_protein?: number;
  target_carbs?: number;
  target_fats?: number;
  notes?: string;
  created_at: string;
  updated_at: string;
  meals?: any[];
  patient?: any;
  nutritionist?: any;
  is_weekly_plan?: boolean;
  total_weeks?: number;
  weekly_plans?: any[];
}

async function getAuthToken(credentials: { email: string; password: string }): Promise<string> {
  const response = await fetch('http://localhost:4000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(credentials)
  });

  const data: LoginResponse = await response.json();
  
  if (data.status !== 'success') {
    throw new Error(`Login failed: ${data.message}`);
  }

  return data.data.token;
}

function transformBackendPlan(backendPlan: BackendDietPlan): TransformedDietPlan {
  return {
    id: backendPlan.id,
    patient_id: backendPlan.patient?.id,
    nutritionist_id: backendPlan.nutritionist?.id,
    name: backendPlan.name,
    description: backendPlan.description,
    status: backendPlan.status,
    start_date: backendPlan.start_date,
    end_date: backendPlan.end_date,
    target_calories: backendPlan.daily_calories_target ? parseFloat(backendPlan.daily_calories_target) : undefined,
    target_protein: backendPlan.daily_macros_target?.protein,
    target_carbs: backendPlan.daily_macros_target?.carbohydrates,
    target_fats: backendPlan.daily_macros_target?.fats,
    notes: backendPlan.notes,
    created_at: backendPlan.created_at,
    updated_at: backendPlan.updated_at,
    meals: backendPlan.meals || [],
    patient: backendPlan.patient,
    nutritionist: backendPlan.nutritionist,
    is_weekly_plan: backendPlan.is_weekly_plan,
    total_weeks: backendPlan.total_weeks,
    weekly_plans: backendPlan.weekly_plans || []
  };
}

async function testDietPlansTransformation() {
  try {
    console.log('🧪 Probando transformación de datos de diet plans...\n');

    // 1. Login
    const token = await getAuthToken({
      email: 'dr.maria.gonzalez@demo.com',
      password: 'demo123'
    });
    console.log('✅ Login exitoso');

    // 2. Obtener planes del backend
    const response = await fetch('http://localhost:4000/api/diet-plans', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    const data = await response.json();
    console.log('📡 Respuesta del backend:', JSON.stringify(data, null, 2));

    if (data.status !== 'success' || !data.data?.dietPlans) {
      throw new Error('No se pudieron obtener los planes de dieta');
    }

    const backendPlans: BackendDietPlan[] = data.data.dietPlans;
    console.log(`\n📊 Planes encontrados: ${backendPlans.length}`);

    // 3. Transformar cada plan
    const transformedPlans = backendPlans.map(plan => {
      const transformed = transformBackendPlan(plan);
      console.log(`\n🔄 Transformando plan: ${plan.name}`);
      console.log(`   Backend patient_id: ${plan.patient?.id}`);
      console.log(`   Transformed patient_id: ${transformed.patient_id}`);
      console.log(`   Backend nutritionist_id: ${plan.nutritionist?.id}`);
      console.log(`   Transformed nutritionist_id: ${transformed.nutritionist_id}`);
      console.log(`   Backend calories: ${plan.daily_calories_target}`);
      console.log(`   Transformed calories: ${transformed.target_calories}`);
      return transformed;
    });

    console.log(`\n✅ Transformación completada para ${transformedPlans.length} planes`);

    // 4. Verificar que todos los planes tienen IDs válidos
    const validPlans = transformedPlans.filter(plan => 
      plan.id && 
      plan.patient_id && 
      plan.nutritionist_id
    );

    console.log(`\n📋 Planes válidos: ${validPlans.length}/${transformedPlans.length}`);

    if (validPlans.length !== transformedPlans.length) {
      console.log('⚠️ Algunos planes no tienen IDs válidos:');
      transformedPlans.forEach((plan, index) => {
        if (!plan.id || !plan.patient_id || !plan.nutritionist_id) {
          console.log(`   Plan ${index}: ${plan.name} - ID: ${plan.id}, Patient: ${plan.patient_id}, Nutritionist: ${plan.nutritionist_id}`);
        }
      });
    }

    // 5. Mostrar ejemplo de plan transformado
    if (transformedPlans.length > 0) {
      console.log('\n📄 Ejemplo de plan transformado:');
      console.log(JSON.stringify(transformedPlans[0], null, 2));
    }

    console.log('\n🎯 Prueba de transformación completada');

  } catch (error) {
    console.error('❌ Error en la prueba:', error);
  }
}

// Ejecutar la prueba
testDietPlansTransformation()
  .then(() => {
    console.log('\n✅ Script completado');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Error en el script:', error);
    process.exit(1);
  }); 