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

async function getAuthToken(credentials: { email: string; password: string }): Promise<string> {
  const response = await fetch('http://localhost:4000/api/auth/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(credentials),
  });

  if (!response.ok) {
    throw new Error(`Login failed: ${response.statusText}`);
  }

  const data: LoginResponse = await response.json();
  console.log('🔍 Login response:', JSON.stringify(data, null, 2));
  return data.token;
}

async function getPatients(token: string) {
  const response = await fetch('http://localhost:4000/api/patients/my-patients', {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to get patients: ${response.statusText}`);
  }

  const data = await response.json();
  return data.patients || [];
}

async function getDietPlansForPatient(token: string, patientId: string) {
  const response = await fetch(`http://localhost:4000/api/diet-plans/patient/${patientId}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to get diet plans: ${response.statusText}`);
  }

  const data = await response.json();
  console.log('🔍 Raw response from backend:');
  console.log(JSON.stringify(data, null, 2));
  return data.dietPlans || [];
}

async function verifyDietPlansData() {
  try {
    console.log('🔍 Verificando datos de diet plans...\n');

    // 1. Login
    const token = await getAuthToken({
      email: 'dr.maria.gonzalez@demo.com',
      password: 'demo123'
    });
    console.log('✅ Login exitoso');

    // 2. Obtener pacientes
    const patients = await getPatients(token);
    console.log(`✅ Encontrados ${patients.length} pacientes`);

    if (patients.length === 0) {
      console.log('❌ No hay pacientes disponibles');
      return;
    }

    // 3. Verificar datos del primer paciente
    const firstPatient = patients[0];
    console.log(`\n📋 Datos del primer paciente:`);
    console.log(`   ID: ${firstPatient.id}`);
    console.log(`   Nombre: ${firstPatient.user?.first_name} ${firstPatient.user?.last_name}`);
    console.log(`   Email: ${firstPatient.user?.email}`);
    console.log(`   Peso: ${firstPatient.current_weight}kg`);
    console.log(`   Altura: ${firstPatient.height}cm`);

    // 4. Obtener diet plans para este paciente
    console.log(`\n🍽️ Obteniendo diet plans para paciente ${firstPatient.id}...`);
    const dietPlans = await getDietPlansForPatient(token, firstPatient.id);
    
    console.log(`\n📊 Diet Plans encontrados: ${dietPlans.length}`);
    
    if (dietPlans.length > 0) {
      console.log('\n🔍 Detalles del primer diet plan:');
      const firstPlan = dietPlans[0];
      console.log(`   ID: ${firstPlan.id}`);
      console.log(`   Nombre: ${firstPlan.name}`);
      console.log(`   Estado: ${firstPlan.status}`);
      console.log(`   Fecha inicio: ${firstPlan.start_date}`);
      console.log(`   Fecha fin: ${firstPlan.end_date}`);
      console.log(`   Calorías objetivo: ${firstPlan.target_calories || 'N/A'}`);
      console.log(`   Proteínas: ${firstPlan.target_protein || 'N/A'}g`);
      console.log(`   Carbohidratos: ${firstPlan.target_carbs || 'N/A'}g`);
      console.log(`   Grasas: ${firstPlan.target_fats || 'N/A'}g`);
      console.log(`   Es plan semanal: ${firstPlan.is_weekly_plan}`);
      console.log(`   Total semanas: ${firstPlan.total_weeks || 'N/A'}`);
      console.log(`   Semanas del plan: ${firstPlan.weekly_plans ? firstPlan.weekly_plans.length : 0}`);
      console.log(`   Paciente: ${firstPlan.patient?.first_name || 'N/A'}`);
      console.log(`   Nutriólogo: ${firstPlan.nutritionist?.first_name || 'N/A'}`);
      
      if (firstPlan.weekly_plans && firstPlan.weekly_plans.length > 0) {
        console.log('\n📅 Detalles de la primera semana:');
        const firstWeek = firstPlan.weekly_plans[0];
        console.log(`   Semana: ${firstWeek.weekNumber}`);
        console.log(`   Fecha inicio: ${firstWeek.startDate}`);
        console.log(`   Fecha fin: ${firstWeek.endDate}`);
        console.log(`   Calorías diarias: ${firstWeek.dailyCaloriesTarget}`);
        console.log(`   Comidas: ${firstWeek.meals ? firstWeek.meals.length : 0}`);
      }
    } else {
      console.log('❌ No se encontraron diet plans para este paciente');
    }

    // 5. Verificar todos los pacientes
    console.log('\n🔍 Verificando diet plans para todos los pacientes...');
    for (const patient of patients) {
      try {
        const patientPlans = await getDietPlansForPatient(token, patient.id);
        console.log(`   ${patient.user?.first_name} ${patient.user?.last_name}: ${patientPlans.length} planes`);
      } catch (error) {
        console.log(`   ❌ Error con ${patient.user?.first_name}: ${error}`);
      }
    }

  } catch (error) {
    console.error('❌ Error en la verificación:', error);
  }
}

verifyDietPlansData(); 