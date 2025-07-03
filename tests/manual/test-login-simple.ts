import axios from 'axios';

const BASE_URL = 'http://localhost:4000/api';

async function testLogin() {
  const users = [
    { email: 'nutritionist@demo.com', password: 'password123' },
    { email: 'nutri.demo@example.com', password: 'nutri123' },
    { email: 'dr.juan.perez@demo.com', password: 'password123' },
    { email: 'nutri.auth@example.com', password: 'password123' },
    { email: 'test.nutri@example.com', password: 'password123' }
  ];

  for (const user of users) {
    try {
      console.log(`🔐 Probando login con ${user.email}...`);
      const response = await axios.post(`${BASE_URL}/auth/login`, user);
      console.log(`✅ ÉXITO: Login exitoso para ${user.email}`);
      console.log(`🎟️ Token obtenido: ${response.data.data.token.substring(0, 20)}...`);
      return { email: user.email, token: response.data.data.token };
    } catch (error: any) {
      console.log(`❌ FALLO: ${user.email} - ${error.response?.data?.message || error.message}`);
    }
  }
  
  console.log('🚨 No se pudo hacer login con ningún usuario');
  return null;
}

testLogin().catch(console.error); 