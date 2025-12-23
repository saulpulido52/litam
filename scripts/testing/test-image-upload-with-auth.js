const fs = require('fs');
const path = require('path');
const FormData = require('form-data');
const axios = require('axios');

async function testImageUploadWithAuth() {
    try {
        console.log('🧪 Probando subida de imagen de perfil con autenticación...');
        
        // Verificar archivo de prueba
        const testImagePath = path.join(__dirname, 'imagen-prueba.jpg');
        if (!fs.existsSync(testImagePath)) {
            console.error('❌ No se encontró imagen-prueba.jpg');
            return;
        }
        
        console.log('✅ Archivo encontrado:', testImagePath);
        
        // Primero, hacer login para obtener token
        console.log('🔐 Iniciando sesión...');
        const loginResponse = await axios.post('http://localhost:4000/api/auth/login', {
            email: 'nutri.admin@sistema.com',
            password: 'nutri123'
        });
        
        if (loginResponse.data.status !== 'success') {
            console.error('❌ Error en login:', loginResponse.data);
            return;
        }
        
        const token = loginResponse.data.data.token;
        console.log('✅ Login exitoso, token obtenido');
        
        // Crear FormData para la imagen
        const formData = new FormData();
        formData.append('profile_image', fs.createReadStream(testImagePath));
        
        // Headers con autenticación
        const headers = {
            ...formData.getHeaders(),
            'Authorization': `Bearer ${token}`
        };
        
        console.log('📤 Enviando solicitud de subida de imagen...');
        
        // Realizar solicitud de subida
        const uploadResponse = await axios.post('http://localhost:4000/api/users/me/profile-image', formData, {
            headers: headers,
            maxContentLength: Infinity,
            maxBodyLength: Infinity
        });
        
        console.log('✅ Respuesta exitosa!');
        console.log('📊 Status:', uploadResponse.status);
        console.log('📄 Datos:', JSON.stringify(uploadResponse.data, null, 2));
        
        // Verificar que la imagen se guardó
        const imageUrl = uploadResponse.data.data.profile_image;
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
        
        // Verificar que el perfil se actualizó
        console.log('🔍 Verificando actualización del perfil...');
        const profileResponse = await axios.get('http://localhost:4000/api/users/me', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        console.log('📊 Perfil actualizado:', JSON.stringify(profileResponse.data, null, 2));
        
    } catch (error) {
        console.error('❌ Error en la prueba:', error.message);
        
        if (error.response) {
            console.error('📊 Status:', error.response.status);
            console.error('📄 Respuesta:', error.response.data);
        }
    }
}

testImageUploadWithAuth(); 