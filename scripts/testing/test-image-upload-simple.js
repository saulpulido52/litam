const fs = require('fs');
const path = require('path');
const FormData = require('form-data');
const axios = require('axios');

async function testImageUpload() {
    try {
        console.log('🧪 Probando subida de imagen de perfil...');
        
        // Verificar archivo de prueba
        const testImagePath = path.join(__dirname, 'imagen-prueba.jpg');
        if (!fs.existsSync(testImagePath)) {
            console.error('❌ No se encontró imagen-prueba.jpg');
            return;
        }
        
        console.log('✅ Archivo encontrado:', testImagePath);
        
        // Crear FormData
        const formData = new FormData();
        formData.append('profile_image', fs.createReadStream(testImagePath));
        
        // Headers básicos (sin token por ahora para probar el endpoint)
        const headers = {
            ...formData.getHeaders()
        };
        
        console.log('📤 Enviando solicitud a /api/users/me/profile-image...');
        
        // Realizar solicitud
        const response = await axios.post('http://localhost:4000/api/users/me/profile-image', formData, {
            headers: headers,
            maxContentLength: Infinity,
            maxBodyLength: Infinity
        });
        
        console.log('✅ Respuesta exitosa!');
        console.log('📊 Status:', response.status);
        console.log('📄 Datos:', JSON.stringify(response.data, null, 2));
        
    } catch (error) {
        console.error('❌ Error:', error.message);
        
        if (error.response) {
            console.error('📊 Status:', error.response.status);
            console.error('📄 Respuesta:', error.response.data);
        }
    }
}

testImageUpload(); 