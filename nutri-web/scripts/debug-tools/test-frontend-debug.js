// Script para probar la integración frontend-backend
// Ejecutar en la consola del navegador cuando esté en la página de citas

console.log('=== DEBUG FRONTEND CITAS ===');

// 1. Verificar si el hook useAppointments está funcionando
console.log('1. Verificando estado del componente...');

// 2. Verificar llamadas de red
console.log('2. Verificando llamadas de red...');

// 3. Verificar autenticación
const token = localStorage.getItem('token') || sessionStorage.getItem('token');
console.log('3. Token de autenticación:', token ? 'Presente' : 'No encontrado');

// 4. Verificar si hay datos en el estado
console.log('4. Intentando obtener citas directamente...');

// Simulamos una llamada directa al servicio
async function testService() {
  try {
    const baseURL = 'http://localhost:4000/api';
    const authHeaders = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
    
    console.log('Haciendo llamada a:', `${baseURL}/appointments/my-appointments`);
    
    const response = await fetch(`${baseURL}/appointments/my-appointments`, {
      method: 'GET',
      headers: authHeaders
    });
    
    const data = await response.json();
    console.log('Respuesta del backend:', data);
    
    if (data.status === 'success') {
      console.log('✅ Backend funciona correctamente');
      console.log('📊 Número de citas:', data.data?.appointments?.length || 0);
      
      if (data.data?.appointments?.length > 0) {
        console.log('📋 Primera cita:', data.data.appointments[0]);
      }
    } else {
      console.log('❌ Error en backend:', data.message);
    }
    
  } catch (error) {
    console.error('❌ Error de red:', error);
  }
}

// 5. Verificar el componente React
console.log('5. Verificando componente React...');

// Intentamos acceder al estado del componente si es posible
const reactRoot = document.querySelector('#root');
if (reactRoot && reactRoot._reactInternalFiber) {
  console.log('React detectado');
} else {
  console.log('React no detectado o versión diferente');
}

// Ejecutar el test
testService();
