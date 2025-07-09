// Test de subida de imagen para verificar la estructura de respuesta
const fetch = require('node-fetch');
const FormData = require('form-data');
const fs = require('fs');

const testImageUpload = async () => {
    console.log('🔐 Probando subida de imagen...');
    
    try {
        // Primero hacer login
        const loginResponse = await fetch('http://localhost:4000/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email: 'nutri.admin@sistema.com',
                password: 'nutri123'
            }),
        });
        
        if (!loginResponse.ok) {
            throw new Error(`Login failed: ${loginResponse.status} ${await loginResponse.text()}`);
        }
        
        const loginData = await loginResponse.json();
        const token = loginData.data?.token;
        
        if (!token) {
            throw new Error('No se pudo obtener el token');
        }
        
        console.log('✅ Login exitoso');
        
        // Crear un archivo de prueba simple
        const testImagePath = './test-image.jpg';
        const testImageData = Buffer.from('fake-image-data');
        fs.writeFileSync(testImagePath, testImageData);
        
        // Probar subida de imagen
        const formData = new FormData();
        formData.append('profile_image', fs.createReadStream(testImagePath));
        
        const uploadResponse = await fetch('http://localhost:4000/api/users/me/profile-image', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                ...formData.getHeaders()
            },
            body: formData
        });
        
        console.log('📤 Estado de respuesta:', uploadResponse.status);
        console.log('📤 Headers de respuesta:', uploadResponse.headers.raw());
        
        const responseText = await uploadResponse.text();
        console.log('📤 Respuesta completa como texto:', responseText);
        
        try {
            const responseJson = JSON.parse(responseText);
            console.log('📤 Respuesta parseada como JSON:', JSON.stringify(responseJson, null, 2));
        } catch (parseError) {
            console.log('❌ No se pudo parsear como JSON:', parseError.message);
        }
        
        // Limpiar archivo de prueba
        fs.unlinkSync(testImagePath);
        
    } catch (error) {
        console.error('❌ Error en test:', error.message);
    }
};

testImageUpload();
