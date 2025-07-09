const axios = require('axios');

const BASE_URL = 'http://localhost:4001/api';

// Datos de login
const loginData = {
  email: 'nutri.admin@sistema.com',
  password: 'nutri123'
};

// Datos limpios para disponibilidad (sin campos extra)
const cleanAvailabilityData = {
  slots: [
    {
      day_of_week: 'MONDAY',
      start_time_minutes: 540, // 9:00 AM
      end_time_minutes: 720,   // 12:00 PM
      is_active: true
    },
    {
      day_of_week: 'TUESDAY',
      start_time_minutes: 540, // 9:00 AM
      end_time_minutes: 720,   // 12:00 PM
      is_active: true
    }
  ]
};

async function testAvailabilityDebug() {
  console.log('=== TEST DE DISPONIBILIDAD DEBUG ===\n');
  
  try {
    // 1. Login
    console.log('1. Iniciando sesión...');
    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, loginData);
    
    if (loginResponse.data.status !== 'success') {
      console.error('Error en login:', loginResponse.data.message);
      return;
    }
    
    const token = loginResponse.data.data.token;
    console.log('✓ Login exitoso');
    
    // Configurar headers para requests autenticados
    const authHeaders = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
    
    // 2. Obtener disponibilidad actual
    console.log('\n2. Obteniendo disponibilidad actual...');
    try {
      const currentAvailability = await axios.get(`${BASE_URL}/appointments/availability`, { headers: authHeaders });
      console.log('✓ Disponibilidad actual:', JSON.stringify(currentAvailability.data, null, 2));
    } catch (error) {
      console.log('! No hay disponibilidad actual o error:', error.response?.data?.message || error.message);
    }
    
    // 3. Enviar datos exactos que envía el frontend
    console.log('\n3. Enviando datos limpios de disponibilidad...');
    console.log('Datos a enviar:', JSON.stringify(cleanAvailabilityData, null, 2));
    
    const availabilityResponse = await axios.post(`${BASE_URL}/appointments/availability`, cleanAvailabilityData, { headers: authHeaders });
    
    if (availabilityResponse.data.status === 'success') {
      console.log('✓ Disponibilidad guardada exitosamente');
      console.log('Respuesta:', JSON.stringify(availabilityResponse.data, null, 2));
    } else {
      console.error('✗ Error al guardar disponibilidad:', availabilityResponse.data.message);
    }
    
    // 4. Verificar que se guardó correctamente
    console.log('\n4. Verificando disponibilidad guardada...');
    const verifyResponse = await axios.get(`${BASE_URL}/appointments/availability`, { headers: authHeaders });
    console.log('✓ Disponibilidad verificada:', JSON.stringify(verifyResponse.data, null, 2));
    
  } catch (error) {
    console.error('Error en test:', error.response?.data || error.message);
    if (error.response?.data) {
      console.error('Detalles del error:', JSON.stringify(error.response.data, null, 2));
    }
  }
}

// Ejecutar test
testAvailabilityDebug();
