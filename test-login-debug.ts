// test-login-debug.ts
import axios from 'axios';

async function testLogin() {
  console.log('🔐 Probando login...');
  
  try {
    const response = await axios.post('http://localhost:4000/api/auth/login', {
      email: 'nutritionist@demo.com',
      password: 'demo123'
    });
    
    console.log('✅ Login exitoso');
    console.log('Status:', response.status);
    console.log('Data:', JSON.stringify(response.data, null, 2));
    
  } catch (error: any) {
    console.error('❌ Error en login:', error.message);
    
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', JSON.stringify(error.response.data, null, 2));
    }
  }
}

testLogin().catch(console.error); 