// Test directo de autenticación y citas desde Node.js
const fetch = require('node-fetch');

const testAuth = async () => {
    console.log('🔐 Probando autenticación...');
    
    try {
        // Login
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
        console.log('✅ Login exitoso');
        
        const token = loginData.data?.token || loginData.access_token || loginData.token;
        if (token) {
            console.log('🔑 Token obtenido:', token.substring(0, 30) + '...');
        } else {
            console.log('❌ No se encontró token en la respuesta');
            console.log('🔑 Respuesta completa:', loginData);
            return;
        }
        
        // Probar citas
        console.log('📋 Probando carga de citas...');
        const appointmentsResponse = await fetch('http://localhost:4000/api/appointments/my-appointments', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        });
        
        if (!appointmentsResponse.ok) {
            throw new Error(`Appointments failed: ${appointmentsResponse.status} ${await appointmentsResponse.text()}`);
        }
        
        const appointments = await appointmentsResponse.json();
        console.log('✅ Citas cargadas exitosamente');
        console.log('� Respuesta completa de citas:', appointments);
        
        const appointmentsList = appointments.data || appointments;
        console.log('�📊 Cantidad de citas:', Array.isArray(appointmentsList) ? appointmentsList.length : 'No es array');
        
        if (Array.isArray(appointmentsList) && appointmentsList.length > 0) {
            console.log('📋 Primera cita como ejemplo:');
            console.log(JSON.stringify(appointmentsList[0], null, 2));
        }
        
    } catch (error) {
        console.error('❌ Error en test:', error.message);
    }
};

testAuth();
