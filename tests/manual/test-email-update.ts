import axios from 'axios';

const API_BASE = 'http://localhost:4000/api';

async function testEmailBasedUpdate() {
    console.log('🧪 TESTING: Actualización de pacientes por email\n');

    try {
        // 1. Autenticarse como nutricionista
        console.log('📝 1. Autenticando como nutricionista...');
        const loginResponse = await axios.post(`${API_BASE}/auth/login`, {
            email: 'nutritionist@demo.com',
            password: 'demo123'
        });

        const token = loginResponse.data.data.token;
        console.log('✅ Login exitoso');

        // 2. Probar actualización por ID tradicional (fallará)
        console.log('\n📝 2. Probando actualización por ID obsoleto (debe fallar)...');
        try {
            await axios.put(`${API_BASE}/patients/4c8855cc-5039-4742-8580-bd731af6f870`, {
                email: 'maria.gonzalez@demo.com',
                age: 29,
                first_name: 'María Actualizada'
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            console.log('❌ INESPERADO: No debería haber funcionado');
        } catch (error: any) {
            console.log('✅ ESPERADO: Falló como se esperaba:', error.response?.data?.message || error.message);
        }

        // 3. Probar actualización usando la nueva ruta por EMAIL
        console.log('\n📝 3. Probando actualización por EMAIL (nueva funcionalidad)...');
        try {
            const emailUpdateResponse = await axios.put(`${API_BASE}/patients/by-email/maria.gonzalez@demo.com`, {
                age: 29,
                first_name: 'María González Actualizada'
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            console.log('✅ EXITOSO: Actualización por email funcionó');
            console.log('📊 Datos actualizados:', {
                id: emailUpdateResponse.data.data.patient.id,
                name: emailUpdateResponse.data.data.patient.user.first_name,
                age: emailUpdateResponse.data.data.patient.user.age,
                email: emailUpdateResponse.data.data.patient.user.email
            });
        } catch (error: any) {
            console.log('❌ FALLÓ:', error.response?.data?.message || error.message);
            console.log('📊 Detalles del error:', error.response?.data);
        }

        // 4. Verificar que la actualización por ID con email en body también funciona
        console.log('\n📝 4. Probando actualización por ID con email en body (fallback mejorado)...');
        try {
            const fallbackResponse = await axios.put(`${API_BASE}/patients/4c8855cc-5039-4742-8580-bd731af6f870`, {
                email: 'carlos.ruiz@demo.com',
                age: 31,
                first_name: 'Carlos Ruiz Actualizado'
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            console.log('✅ EXITOSO: Fallback por email funcionó');
            console.log('📊 Datos actualizados:', {
                id: fallbackResponse.data.data.patient.id,
                name: fallbackResponse.data.data.patient.user.first_name,
                age: fallbackResponse.data.data.patient.user.age,
                email: fallbackResponse.data.data.patient.user.email
            });
        } catch (error: any) {
            console.log('❌ FALLÓ:', error.response?.data?.message || error.message);
        }

        console.log('\n🎉 PRUEBAS COMPLETADAS');

    } catch (error: any) {
        console.error('💥 Error en las pruebas:', error.message);
        if (error.response) {
            console.error('📊 Detalles:', error.response.data);
        }
    }
}

// Ejecutar pruebas
testEmailBasedUpdate(); 