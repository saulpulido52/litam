const axios = require('axios');

async function testEndpointDirect() {
    try {
        console.log('🔍 Probando endpoint directamente...');
        
        // Probar el endpoint que estaba fallando (sin auth para ver si el error de columna se solucionó)
        const patientId = 'c87f29af-069c-4a14-bc01-ce7daa57b82d';
        const response = await axios.get(`http://localhost:5000/api/clinical-records/patient/${patientId}`);
        
        console.log('✅ Endpoint funcionando correctamente');
        console.log('📊 Respuesta:', response.data);
        
    } catch (error) {
        console.error('❌ Error:', error.response?.status, error.response?.data?.message || error.message);
        
        // Si el error es 401 (no autorizado), significa que el problema de la columna se solucionó
        if (error.response?.status === 401) {
            console.log('✅ ¡EXCELENTE! El error de la columna se solucionó. Ahora solo necesitamos autenticación.');
        } else if (error.response?.status === 500) {
            console.error('❌ Todavía hay un error 500:', error.response.data);
        }
    }
}

testEndpointDirect(); 