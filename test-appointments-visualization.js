const axios = require('axios');

const BASE_URL = 'http://localhost:4000/api';

// Datos de login
const loginData = {
  email: 'nutri.admin@sistema.com',
  password: 'nutri123'
};

async function testAppointmentsVisualizations() {
  console.log('=== TEST DE VISUALIZACIÓN DE CITAS ===\n');
  
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
    
    // 2. Obtener mis citas
    console.log('\n2. Obteniendo mis citas...');
    try {
      const myAppointments = await axios.get(`${BASE_URL}/appointments/my-appointments`, { headers: authHeaders });
      console.log('✓ Mis citas:', JSON.stringify(myAppointments.data, null, 2));
    } catch (error) {
      console.log('! Error al obtener mis citas:', error.response?.data?.message || error.message);
    }
    
    // 3. Verificar datos en la base de datos directamente
    console.log('\n3. Verificando datos en la base de datos...');
    try {
      // Usar un endpoint de pacientes para ver si hay datos
      const patients = await axios.get(`${BASE_URL}/patients`, { headers: authHeaders });
      console.log('✓ Total de pacientes encontrados:', patients.data.data?.patients?.length || 0);
      
      if (patients.data.data?.patients?.length > 0) {
        console.log('Primer paciente:', patients.data.data.patients[0]);
      }
    } catch (error) {
      console.log('! Error al obtener pacientes:', error.response?.data?.message || error.message);
    }
    
    // 4. Verificar endpoint de buscar disponibilidad
    console.log('\n4. Verificando endpoint de búsqueda de disponibilidad...');
    try {
      const searchAvailability = await axios.get(`${BASE_URL}/appointments/search-availability`, { headers: authHeaders });
      console.log('✓ Disponibilidad para buscar:', JSON.stringify(searchAvailability.data, null, 2));
    } catch (error) {
      console.log('! Error al buscar disponibilidad:', error.response?.data?.message || error.message);
    }
    
    // 5. Crear una cita de prueba para visualización
    console.log('\n5. Intentando crear una cita de prueba...');
    
    // Primero necesitamos crear un paciente de prueba
    const testPatientData = {
      email: 'paciente.test@ejemplo.com',
      firstName: 'Juan',
      lastName: 'Pérez',
      phone: '555-0123',
      birthDate: '1990-01-01'
    };
    
    try {
      const createPatient = await axios.post(`${BASE_URL}/patients`, testPatientData, { headers: authHeaders });
      console.log('✓ Paciente de prueba creado:', createPatient.data.data?.patient?.id);
      
      // Ahora crear una cita
      const appointmentData = {
        patientId: createPatient.data.data.patient.id,
        startTime: '2025-07-08T09:00:00Z',
        endTime: '2025-07-08T10:00:00Z',
        notes: 'Cita de prueba para verificar visualización'
      };
      
      const createAppointment = await axios.post(`${BASE_URL}/appointments/schedule-for-patient`, appointmentData, { headers: authHeaders });
      console.log('✓ Cita de prueba creada:', JSON.stringify(createAppointment.data, null, 2));
      
      // Verificar que se creó correctamente
      const myAppointmentsAfter = await axios.get(`${BASE_URL}/appointments/my-appointments`, { headers: authHeaders });
      console.log('✓ Mis citas después de crear la de prueba:', JSON.stringify(myAppointmentsAfter.data, null, 2));
      
    } catch (error) {
      console.log('! Error al crear cita de prueba:', error.response?.data?.message || error.message);
      if (error.response?.data) {
        console.log('Detalles del error:', JSON.stringify(error.response.data, null, 2));
      }
    }
    
  } catch (error) {
    console.error('Error en test:', error.response?.data || error.message);
    if (error.response?.data) {
      console.error('Detalles del error:', JSON.stringify(error.response.data, null, 2));
    }
  }
}

// Ejecutar test
testAppointmentsVisualizations();
