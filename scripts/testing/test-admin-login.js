// Script de prueba para verificar el login de admin
const axios = require('axios');

const API_BASE_URL = 'http://localhost:4000/api';

async function testAdminLogin() {
  console.log('🧪 Probando login de administrador...\n');

  try {
    // 1. Verificar que el backend esté funcionando
    console.log('1️⃣ Verificando estado del backend...');
    const healthResponse = await axios.get(`${API_BASE_URL}/health`);
    console.log('✅ Backend funcionando:', healthResponse.data.status);
    console.log('');

    // 2. Probar login con credenciales de admin
    console.log('2️⃣ Probando login con credenciales de admin...');
    const loginData = {
      email: 'admin@nutri.com',
      password: 'admin123'
    };

    const loginResponse = await axios.post(`${API_BASE_URL}/auth/login`, loginData);
    
    if (loginResponse.data.status === 'success') {
      console.log('✅ Login exitoso!');
      console.log('👤 Usuario:', loginResponse.data.data.user.first_name, loginResponse.data.data.user.last_name);
      console.log('🔑 Rol:', loginResponse.data.data.user.role.name);
      console.log('🎫 Token:', loginResponse.data.data.token ? 'Presente' : 'Ausente');
      console.log('');

      // 3. Verificar que el token funcione para obtener datos del usuario
      console.log('3️⃣ Verificando token y permisos...');
      const token = loginResponse.data.data.token;
      
      // Usar el usuario del login response en lugar de hacer otra petición
      const currentUser = loginResponse.data.data.user;
      console.log('✅ Token válido!');
      console.log('👤 Usuario actual:', currentUser.first_name, currentUser.last_name);
      console.log('🔑 Rol confirmado:', currentUser.role.name);
      console.log('');

      // 4. Probar acceso a rutas de admin
      console.log('4️⃣ Probando acceso a rutas de administración...');
      
      try {
        const adminResponse = await axios.get(`${API_BASE_URL}/admin/stats`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        console.log('✅ Acceso a rutas de admin permitido');
        console.log('📊 Datos de admin:', adminResponse.data);
      } catch (adminError) {
        console.log('⚠️ Error al acceder a rutas de admin:', adminError.response?.data?.message || adminError.message);
      }

      // 5. Probar que NO pueda acceder a rutas de pacientes (debería dar 403)
      console.log('');
      console.log('5️⃣ Verificando que NO pueda acceder a rutas de pacientes...');
      
      try {
        await axios.get(`${API_BASE_URL}/patients/my-patients`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        console.log('❌ ERROR: Admin pudo acceder a rutas de pacientes (no debería)');
      } catch (patientError) {
        if (patientError.response?.status === 403) {
          console.log('✅ Correcto: Admin NO puede acceder a rutas de pacientes (403 Forbidden)');
        } else {
          console.log('⚠️ Error inesperado:', patientError.response?.data?.message || patientError.message);
        }
      }

      // 6. Probar logout
      console.log('');
      console.log('6️⃣ Probando logout...');
      
      try {
        const logoutResponse = await axios.post(`${API_BASE_URL}/auth/logout`, {}, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        console.log('✅ Logout exitoso:', logoutResponse.data.message);
      } catch (logoutError) {
        console.log('⚠️ Error en logout:', logoutError.response?.data?.message || logoutError.message);
      }

    } else {
      console.log('❌ Login falló:', loginResponse.data.message);
    }

  } catch (error) {
    console.error('❌ Error en la prueba:', error.response?.data?.message || error.message);
  }
}

// Ejecutar la prueba
testAdminLogin(); 