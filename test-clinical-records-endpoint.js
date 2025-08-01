const axios = require('axios');

async function testClinicalRecordsEndpoint() {
    try {
        console.log('🔍 Probando endpoint de expedientes clínicos...');
        
        // Primero hacer login para obtener token
        const loginResponse = await axios.post('http://localhost:5000/api/auth/login', {
            email: 'test@litam.com',
            password: 'test123'
        });
        
        console.log('✅ Login exitoso');
        const token = loginResponse.data.data.token;
        
        // Probar el endpoint que estaba fallando
        const patientId = 'c87f29af-069c-4a14-bc01-ce7daa57b82d';
        const response = await axios.get(`http://localhost:5000/api/clinical-records/patient/${patientId}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        console.log('✅ Endpoint funcionando correctamente');
        console.log('📊 Respuesta:', response.data);
        
    } catch (error) {
        console.error('❌ Error:', error.response?.data || error.message);
        if (error.response?.status === 500) {
            console.error('🔍 Detalles del error:', error.response.data);
        }
    }
}

testClinicalRecordsEndpoint(); 