import axios from 'axios';

const API_BASE_URL = 'http://localhost:4000/api';

async function testDietPlanDelete() {
  try {
    // 1. Login como nutriólogo
    console.log('🔐 Iniciando sesión como nutriólogo...');
    const loginResponse = await axios.post(`${API_BASE_URL}/auth/login`, {
      email: 'dr.maria.gonzalez@demo.com',
      password: 'demo123'
    });

    const authToken = loginResponse.data.data.token;
    const headers = { Authorization: `Bearer ${authToken}` };

    console.log('✅ Login exitoso');

    // 2. Obtener todos los planes de dieta del nutriólogo
    console.log('\n📋 Obteniendo planes de dieta...');
    const plansResponse = await axios.get(`${API_BASE_URL}/diet-plans`, { headers });
    console.log('✅ Planes obtenidos:', plansResponse.data);

    if (plansResponse.data.data && plansResponse.data.data.length > 0) {
      const planToDelete = plansResponse.data.data[0];
      console.log(`\n🗑️ Intentando eliminar plan: ${planToDelete.id} - ${planToDelete.name}`);

      // 3. Eliminar el primer plan
      const deleteResponse = await axios.delete(`${API_BASE_URL}/diet-plans/${planToDelete.id}`, { headers });
      console.log('✅ Plan eliminado exitosamente:', deleteResponse.data);

      // 4. Verificar que el plan ya no existe
      console.log('\n🔍 Verificando que el plan fue eliminado...');
      try {
        const checkResponse = await axios.get(`${API_BASE_URL}/diet-plans/${planToDelete.id}`, { headers });
        console.log('❌ ERROR: El plan aún existe:', checkResponse.data);
      } catch (error: any) {
        if (error.response?.status === 404) {
          console.log('✅ Confirmado: El plan ya no existe (404)');
        } else {
          console.log('❌ Error inesperado al verificar eliminación:', error.response?.data);
        }
      }

      // 5. Obtener la lista actualizada
      console.log('\n📋 Obteniendo lista actualizada...');
      const updatedPlansResponse = await axios.get(`${API_BASE_URL}/diet-plans`, { headers });
      console.log('✅ Lista actualizada:', updatedPlansResponse.data);
      console.log(`📊 Total de planes después de eliminar: ${updatedPlansResponse.data.data?.length || 0}`);

    } else {
      console.log('⚠️ No hay planes de dieta para eliminar');
    }

  } catch (error: any) {
    console.error('❌ Error en la prueba:', error.response?.data || error.message);
  }
}

testDietPlanDelete(); 