// Script para depurar el problema de las citas que desaparecen
const axios = require('axios');

const API_BASE_URL = 'http://localhost:4000/api';

// Token de autenticación (obtenido del login)
let authToken = '';

async function login() {
  try {
    console.log('🔐 Haciendo login...');
    const response = await axios.post(`${API_BASE_URL}/auth/login`, {
      email: 'nutri.admin@sistema.com',
      password: 'nutri123'
    });
    
    console.log('✅ Login exitoso');
    console.log('Respuesta completa:', JSON.stringify(response.data, null, 2));
    
    authToken = response.data.data.token;
    
    if (authToken) {
      console.log('Token obtenido:', authToken.substring(0, 20) + '...');
    } else {
      console.log('❌ No se pudo obtener el token de la respuesta');
    }
    
    return response.data;
  } catch (error) {
    console.error('❌ Error en login:', error.response?.data || error.message);
    throw error;
  }
}

// Función para obtener todas las citas
async function getAllAppointments() {
  try {
    console.log('\n📅 Obteniendo todas las citas...');
    const response = await axios.get(`${API_BASE_URL}/appointments/my-appointments`, {
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Citas obtenidas exitosamente');
    console.log('Respuesta completa:', JSON.stringify(response.data, null, 2));
    
    const appointments = response.data.data.appointments || response.data.data || response.data;
    console.log('📊 Total de citas:', appointments.length);
    
    // Mostrar detalles de cada cita
    appointments.forEach((appointment, index) => {
      console.log(`\n--- Cita ${index + 1} ---`);
      console.log('ID:', appointment.id);
      console.log('Paciente:', appointment.patient ? `${appointment.patient.first_name} ${appointment.patient.last_name}` : 'Sin paciente');
      console.log('Email:', appointment.patient?.email || 'Sin email');
      console.log('Fecha inicio:', appointment.start_time);
      console.log('Fecha fin:', appointment.end_time);
      console.log('Estado:', appointment.status);
      console.log('Notas:', appointment.notes || 'Sin notas');
      console.log('Link de reunión:', appointment.meeting_link || 'Sin link');
      
      // Verificar formato de fecha para el frontend
      const startDate = new Date(appointment.start_time);
      const dateStr = startDate.toISOString().split('T')[0];
      const timeStr = startDate.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
      
      console.log('📅 Fecha formateada para frontend:', dateStr);
      console.log('🕐 Hora formateada para frontend:', timeStr);
    });
    
    return appointments;
  } catch (error) {
    console.error('❌ Error obteniendo citas:', error.response?.data || error.message);
    throw error;
  }
}

// Función para crear una cita de prueba
async function createTestAppointment() {
  try {
    console.log('\n🆕 Creando cita de prueba...');
    
    // Primero obtener el ID del primer paciente
    const patientsResponse = await axios.get(`${API_BASE_URL}/patients/my-patients`, {
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (patientsResponse.data.length === 0) {
      console.log('⚠️ No hay pacientes disponibles para crear cita');
      return;
    }
    
    const patient = patientsResponse.data[0];
    console.log('👤 Usando paciente:', patient.first_name, patient.last_name);
    
    // Crear fecha para hoy a las 14:00
    const now = new Date();
    const startTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 14, 0, 0);
    const endTime = new Date(startTime.getTime() + (30 * 60000)); // 30 minutos después
    
    const appointmentData = {
      patientId: patient.id,
      startTime: startTime.toISOString(),
      endTime: endTime.toISOString(),
      notes: 'Cita de prueba para depuración',
      meetingLink: undefined
    };
    
    console.log('📝 Datos de la cita:', appointmentData);
    
    const response = await axios.post(`${API_BASE_URL}/appointments/schedule-for-patient`, appointmentData, {
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Cita creada exitosamente');
    console.log('📋 Cita creada:', response.data);
    
    return response.data;
  } catch (error) {
    console.error('❌ Error creando cita:', error.response?.data || error.message);
    throw error;
  }
}

// Función principal
async function main() {
  try {
    console.log('🚀 Iniciando depuración de citas...\n');
    
    // 1. Hacer login
    await login();
    
    // 2. Ver citas actuales
    console.log('\n=== ESTADO INICIAL ===');
    const initialAppointments = await getAllAppointments();
    
    // 3. Crear una cita de prueba
    console.log('\n=== CREANDO CITA DE PRUEBA ===');
    await createTestAppointment();
    
    // 4. Ver citas después de crear
    console.log('\n=== ESTADO DESPUÉS DE CREAR ===');
    const finalAppointments = await getAllAppointments();
    
    console.log('\n📊 RESUMEN:');
    console.log(`Citas iniciales: ${initialAppointments.length}`);
    console.log(`Citas finales: ${finalAppointments.length}`);
    console.log(`Citas nuevas: ${finalAppointments.length - initialAppointments.length}`);
    
  } catch (error) {
    console.error('💥 Error en el script principal:', error.message);
  }
}

// Ejecutar el script
main();
