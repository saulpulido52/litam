// test-diet-plans.ts
import axios from 'axios';

const API_BASE_URL = 'http://localhost:4000/api';

// Test data
let testNutritionistToken = '';

const testPatientId = '77dbb39a-549c-4097-928a-4711f7f128fc'; // Use a real patient ID from your database

async function testDietPlansAPI() {
  console.log('🧪 Testing Diet Plans API...\n');

  const headers = {
    'Authorization': `Bearer ${testNutritionistToken}`,
    'Content-Type': 'application/json'
  };

  try {
    // 1. Test getting diet plans for a patient
    console.log('1️⃣ Testing GET /diet-plans/patient/:patientId');
    try {
      const response = await axios.get(`${API_BASE_URL}/diet-plans/patient/${testPatientId}`, { headers });
      console.log('✅ Success:', response.status, response.data);
      console.log(`📊 Found ${response.data.data?.dietPlans?.length || 0} diet plans\n`);
    } catch (error: any) {
      console.log('❌ Error:', error.response?.status, error.response?.data || error.message);
    }

    // 2. Test creating a new diet plan
    console.log('2️⃣ Testing POST /diet-plans');
    const newDietPlan = {
      patientId: testPatientId,
      name: 'Plan de Prueba - Pérdida de Peso',
      notes: 'Plan de prueba creado desde el script de testing',
      startDate: '2025-01-01',
      endDate: '2025-01-31',
      dailyCaloriesTarget: 1500,
      dailyMacrosTarget: {
        protein: 120,
        carbohydrates: 150,
        fats: 50
      }
    };

    try {
      const response = await axios.post(`${API_BASE_URL}/diet-plans`, newDietPlan, { headers });
      console.log('✅ Success:', response.status, response.data);
      const createdPlanId = response.data.data?.dietPlan?.id;
      console.log(`📝 Created diet plan with ID: ${createdPlanId}\n`);

      // 3. Test getting the specific diet plan
      if (createdPlanId) {
        console.log('3️⃣ Testing GET /diet-plans/:id');
        try {
          const getResponse = await axios.get(`${API_BASE_URL}/diet-plans/${createdPlanId}`, { headers });
          console.log('✅ Success:', getResponse.status, getResponse.data);
        } catch (error: any) {
          console.log('❌ Error:', error.response?.status, error.response?.data || error.message);
        }

        // 4. Test updating diet plan status
        console.log('\n4️⃣ Testing PATCH /diet-plans/:id/status');
        try {
          const updateResponse = await axios.patch(
            `${API_BASE_URL}/diet-plans/${createdPlanId}/status`, 
            { status: 'active' }, 
            { headers }
          );
          console.log('✅ Success:', updateResponse.status, updateResponse.data);
        } catch (error: any) {
          console.log('❌ Error:', error.response?.status, error.response?.data || error.message);
        }

        // 5. Test generating diet plan with AI
        console.log('\n5️⃣ Testing POST /diet-plans/generate-ai');
        const aiPlanData = {
          patientId: testPatientId,
          name: 'Plan IA - Ganancia Muscular',
          notesForAI: 'Paciente quiere ganar masa muscular, entrenamiento 4 veces por semana',
          startDate: '2025-02-01',
          endDate: '2025-02-28',
          dailyCaloriesTarget: 2200
        };

        try {
          const aiResponse = await axios.post(`${API_BASE_URL}/diet-plans/generate-ai`, aiPlanData, { headers });
          console.log('✅ Success:', aiResponse.status, aiResponse.data);
          const aiPlanId = aiResponse.data.data?.dietPlan?.id;
          console.log(`🤖 Generated AI diet plan with ID: ${aiPlanId}`);
        } catch (error: any) {
          console.log('❌ Error:', error.response?.status, error.response?.data || error.message);
        }

        // 6. Test deleting the created diet plan
        console.log('\n6️⃣ Testing DELETE /diet-plans/:id');
        try {
          const deleteResponse = await axios.delete(`${API_BASE_URL}/diet-plans/${createdPlanId}`, { headers });
          console.log('✅ Success:', deleteResponse.status, deleteResponse.data);
        } catch (error: any) {
          console.log('❌ Error:', error.response?.status, error.response?.data || error.message);
        }
      }

    } catch (error: any) {
      console.log('❌ Error creating diet plan:', error.response?.status, error.response?.data || error.message);
    }

  } catch (error) {
    console.error('❌ General error:', error);
  }
}

// Test authentication first
async function testAuth() {
  console.log('🔐 Testing authentication...\n');
  
  try {
    const loginResponse = await axios.post(`${API_BASE_URL}/auth/login`, {
      email: 'dr.maria.gonzalez@demo.com',
      password: 'demo123'
    });

    console.log('🔍 Login response:', loginResponse.data);

    if (loginResponse.data.status === 'success' && loginResponse.data.data?.access_token) {
      testNutritionistToken = loginResponse.data.data.access_token;
      console.log('✅ Authentication successful');
      console.log(`🔑 Token: ${testNutritionistToken.substring(0, 50)}...\n`);
      return true;
    } else {
      console.log('❌ No access token in response');
      return false;
    }
  } catch (error: any) {
    console.log('❌ Authentication failed:', error.response?.data || error.message);
    return false;
  }
}

// Main test function
async function runTests() {
  console.log('🚀 Starting Diet Plans API Tests\n');
  
  // Test authentication first
  const authSuccess = await testAuth();
  if (!authSuccess) {
    console.log('❌ Cannot proceed without authentication');
    return;
  }
  
  // Run diet plans tests
  await testDietPlansAPI();
  
  console.log('\n✅ All tests completed!');
}

// Run the tests
runTests().catch(console.error); 