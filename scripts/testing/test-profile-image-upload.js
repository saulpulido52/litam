const fs = require('fs');
const path = require('path');
const FormData = require('form-data');
const axios = require('axios');

async function testProfileImageUpload() {
    try {
        console.log('🧪 Iniciando prueba de subida de imagen de perfil...');
        
        // Verificar que el archivo de prueba existe
        const testImagePath = path.join(__dirname, 'imagen-prueba.jpg');
        if (!fs.existsSync(testImagePath)) {
            console.error('❌ Error: No se encontró el archivo imagen-prueba.jpg en la raíz del proyecto');
            console.log('📝 Por favor, coloca una imagen llamada "imagen-prueba.jpg" en la raíz del proyecto');
            return;
        }

        console.log('✅ Archivo de prueba encontrado:', testImagePath);

        // Crear FormData
        const formData = new FormData();
        formData.append('profile_image', fs.createReadStream(testImagePath));

        // Configurar headers
        const headers = {
            ...formData.getHeaders(),
            'Authorization': 'Bearer YOUR_TOKEN_HERE' // Reemplazar con token real
        };

        console.log('📤 Enviando solicitud de subida...');
        
        // Realizar la solicitud
        const response = await axios.post('http://localhost:4000/api/users/me/profile-image', formData, {
            headers: headers,
            maxContentLength: Infinity,
            maxBodyLength: Infinity
        });

        console.log('✅ Respuesta exitosa:', response.status);
        console.log('📊 Datos de respuesta:', JSON.stringify(response.data, null, 2));

        // Verificar que la imagen se guardó en el servidor
        const imageUrl = response.data.data.profile_image;
        if (imageUrl) {
            console.log('🖼️ URL de imagen guardada:', imageUrl);
            
            // Verificar que el archivo existe en el servidor
            const serverImagePath = path.join(__dirname, 'src', imageUrl);
            if (fs.existsSync(serverImagePath)) {
                console.log('✅ Archivo guardado correctamente en el servidor');
            } else {
                console.log('⚠️ Archivo no encontrado en el servidor (puede ser normal si está en uploads/)');
            }
        }

    } catch (error) {
        console.error('❌ Error en la prueba:', error.message);
        
        if (error.response) {
            console.error('📊 Status:', error.response.status);
            console.error('📄 Respuesta:', error.response.data);
        }
    }
}

// Ejecutar la prueba
testProfileImageUpload(); 