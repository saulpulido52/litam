const axios = require('axios');

async function testFrontendBackend() {
  console.log('🔍 Probando comunicación frontend -> backend...\n');

  try {
    // 1. Login para obtener token
    console.log('1. Haciendo login...');
    const loginResponse = await axios.post('http://localhost:4000/api/auth/login', {
      email: 'nutri.admin@sistema.com',
      password: 'nutri123'
    });

    if (loginResponse.data.status !== 'success') {
      throw new Error('Login falló');
    }

    const token = loginResponse.data.data.token;
    console.log('✅ Login exitoso, token obtenido');

    // 2. Probar endpoint de citas
    console.log('\n2. Probando endpoint de citas...');
    const appointmentsResponse = await axios.get('http://localhost:4000/api/appointments/my-appointments', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    console.log('✅ Respuesta del backend:');
    console.log('Status:', appointmentsResponse.status);
    console.log('Data:', JSON.stringify(appointmentsResponse.data, null, 2));

    // 3. Simular lo que hace el frontend
    console.log('\n3. Simulando procesamiento del frontend...');
    if (appointmentsResponse.data.status === 'success' && appointmentsResponse.data.data) {
      const appointments = appointmentsResponse.data.data.appointments;
      console.log('📊 Cantidad de citas:', appointments.length);
      
      if (appointments.length > 0) {
        console.log('📋 Primera cita:', appointments[0]);
        
        // Formatear como lo hace el frontend
        const formatted = appointments.map(apt => ({
          id: apt.id,
          patient_name: apt.patient ? `${apt.patient.first_name} ${apt.patient.last_name}` : 'Paciente desconocido',
          patient_email: apt.patient?.email || '',
          patient_phone: apt.patient?.phone || '',
          date: new Date(apt.start_time).toISOString().split('T')[0],
          time: new Date(apt.start_time).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }),
          type: 'Consulta',
          status: apt.status,
          notes: apt.notes || '',
          location: apt.meeting_link ? 'virtual' : 'presencial',
          original: apt
        }));
        
        console.log('✅ Citas formateadas para frontend:', formatted);
      } else {
        console.log('⚠️ No hay citas en la respuesta');
      }
    } else {
      console.log('❌ Estructura de respuesta incorrecta');
    }

  } catch (error) {
    console.error('❌ Error en el test:', error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    }
  }
}

testFrontendBackend();
