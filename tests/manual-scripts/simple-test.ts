import axios from 'axios';

async function simpleTest() {
    try {
        console.log('🔐 Logueando...');
        const loginResponse = await axios.post('http://localhost:4000/api/auth/login', {
            email: 'nutritionist@demo.com',
            password: 'demo123'
        });

        const token = loginResponse.data.data.token;
        console.log('✅ Login exitoso');

        console.log('📧 Probando actualización por email...');
        const response = await axios.put('http://localhost:4000/api/patients/by-email/maria.gonzalez@demo.com', {
            first_name: 'María Actualizada'
        }, {
            headers: { Authorization: `Bearer ${token}` }
        });

        console.log('✅ SUCCESS:', response.data);
    } catch (error: any) {
        console.log('❌ ERROR:', error.response?.data || error.message);
    }
}

simpleTest(); 