const axios = require('axios');

const BASE_URL = 'http://localhost:4000/api';

// Simular exactamente lo que hace el frontend
async function simulateFrontendFlow() {
  console.log('=== SIMULACIÓN FLUJO FRONTEND ===\n');
  
  try {
    // 1. Login (simula lo que hace useAuth)
    console.log('1. 🔐 Simulando login...');
    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'nutri.admin@sistema.com',
      password: 'nutri123'
    });
    
    if (loginResponse.data.status !== 'success') {
      console.error('❌ Error en login:', loginResponse.data.message);
      return;
    }
    
    const token = loginResponse.data.data.token;
    console.log('✅ Login exitoso, token obtenido');
    
    // Configurar headers exactos como en el frontend
    const authHeaders = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
    
    // 2. Simular la llamada exacta que hace appointmentsService.getMyAppointments()
    console.log('\n2. 📡 Simulando appointmentsService.getMyAppointments()...');
    
    try {
      const appointmentsResponse = await axios.get(`${BASE_URL}/appointments/my-appointments`, { 
        headers: authHeaders 
      });
      
      console.log('📥 Respuesta completa:', JSON.stringify(appointmentsResponse.data, null, 2));
      
      if (appointmentsResponse.data.status === 'success') {
        const appointments = appointmentsResponse.data.data.appointments;
        console.log('✅ appointmentsService: Datos procesados correctamente');
        console.log('📊 appointmentsService: Número de citas:', appointments.length);
        
        // 3. Simular el formateo que hace AppointmentsPage
        console.log('\n3. 🖥️ Simulando formateo de AppointmentsPage...');
        
        const formattedAppointments = appointments.map(apt => {
          const formatted = {
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
          };
          
          console.log(`  📋 Cita ${apt.id}:`);
          console.log(`     - Paciente: ${formatted.patient_name}`);
          console.log(`     - Fecha: ${formatted.date}`);
          console.log(`     - Hora: ${formatted.time}`);
          console.log(`     - Estado: ${formatted.status}`);
          
          return formatted;
        });
        
        // 4. Simular el filtrado
        console.log('\n4. 🔍 Simulando filtrado...');
        const searchTerm = ''; // Sin filtro de búsqueda
        const statusFilter = 'all'; // Sin filtro de estado
        
        const filteredAppointments = formattedAppointments.filter(appointment => {
          const matchesSearch = appointment.patient_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                               appointment.type.toLowerCase().includes(searchTerm.toLowerCase());
          const matchesStatus = statusFilter === 'all' || appointment.status === statusFilter;
          return matchesSearch && matchesStatus;
        });
        
        console.log('✅ Filtrado completado');
        console.log('📊 Citas después del filtrado:', filteredAppointments.length);
        
        if (filteredAppointments.length > 0) {
          console.log('\n5. 🎯 RESULTADO FINAL - Citas que deberían mostrarse:');
          filteredAppointments.forEach((apt, index) => {
            console.log(`   ${index + 1}. ${apt.patient_name} - ${apt.date} ${apt.time} (${apt.status})`);
          });
          
          console.log('\n✅ ¡El flujo completo funciona! Las citas deberían mostrarse en el frontend.');
          console.log('🔍 Si no se muestran, el problema está en el renderizado de React.');
        } else {
          console.log('\n❌ No hay citas después del filtrado');
        }
        
      } else {
        console.log('❌ appointmentsService: Error en respuesta:', appointmentsResponse.data.message);
      }
      
    } catch (error) {
      console.log('❌ appointmentsService: Error de red:', error.response?.data?.message || error.message);
    }
    
  } catch (error) {
    console.error('❌ Error general:', error.response?.data || error.message);
  }
}

// Ejecutar simulación
simulateFrontendFlow();
