import axios from 'axios';

async function testRecipeEndpoint() {
    try {
        console.log('🔍 Probando endpoint de recetas...');
        
        // Primero hacer login para obtener token
        console.log('🔐 Intentando login...');
        const loginResponse = await axios.post('http://localhost:4000/api/auth/login', {
            email: 'nutri.admin@sistema.com',
            password: 'admin123'
        });
        
        console.log('📝 Respuesta de login:', loginResponse.status);
        console.log('📝 Estructura de login:', Object.keys(loginResponse.data));
        
        const token = loginResponse.data.data?.token || loginResponse.data.token;
        console.log('✅ Login exitoso, token obtenido:', token ? 'SÍ' : 'NO');
        
        if (!token) {
            console.error('❌ No se pudo obtener el token');
            console.log('Respuesta completa:', JSON.stringify(loginResponse.data, null, 2));
            return;
        }
        
        // Ahora probar el endpoint de recetas
        console.log('🍳 Probando endpoint de recetas...');
        const recipesResponse = await axios.get('http://localhost:4000/api/recipes?page=1&limit=2', {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        
        console.log('✅ Respuesta de recetas:', recipesResponse.status);
        console.log('\n🔍 ESTRUCTURA COMPLETA DE LA RESPUESTA:');
        console.log(JSON.stringify(recipesResponse.data, null, 2));
        
        console.log('\n🔍 CLAVES EN EL NIVEL SUPERIOR:');
        console.log(Object.keys(recipesResponse.data));
        
        console.log('\n🔍 ANÁLISIS DE ESTRUCTURA:');
        console.log('¿Tiene campo "data"?', 'data' in recipesResponse.data);
        console.log('¿Tiene campo "recipes"?', 'recipes' in recipesResponse.data);
        console.log('¿Tiene campo "pagination"?', 'pagination' in recipesResponse.data);
        console.log('¿Tiene campo "status"?', 'status' in recipesResponse.data);
        console.log('¿Tiene campo "results"?', 'results' in recipesResponse.data);
        
        if ('data' in recipesResponse.data) {
            console.log('\n🔍 CLAVES DENTRO DE "data":');
            console.log(Object.keys(recipesResponse.data.data));
        }
        
    } catch (error: any) {
        console.error('❌ Error en diagnóstico:', error.message);
        
        if (error.response) {
            console.error('Status:', error.response.status);
            console.error('Headers:', error.response.headers);
            console.error('Data:', error.response.data);
        } else if (error.request) {
            console.error('No response received:', error.request);
        } else {
            console.error('Request error:', error.message);
        }
    }
}

testRecipeEndpoint().catch(console.error); 