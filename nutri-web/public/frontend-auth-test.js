// Script para verificar el estado actual del frontend y la autenticación
const testFrontendAuth = async () => {
    console.log('🔍 Verificando estado de autenticación en frontend...');
    
    // Verificar token en localStorage
    const token = localStorage.getItem('access_token');
    console.log('🔑 Token en localStorage:', token ? `${token.substring(0, 30)}...` : 'NO HAY TOKEN');
    
    if (!token) {
        console.log('❌ No hay token de autenticación');
        
        // Intentar login automático
        console.log('🔐 Intentando login automático...');
        try {
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
            
            if (loginResponse.ok) {
                const loginData = await loginResponse.json();
                console.log('✅ Login exitoso:', loginData);
                localStorage.setItem('access_token', loginData.data.token);
                localStorage.setItem('user', JSON.stringify(loginData.data.user));
                console.log('💾 Token guardado en localStorage');
            } else {
                console.error('❌ Error en login:', await loginResponse.text());
                return;
            }
        } catch (error) {
            console.error('❌ Error en login automático:', error);
            return;
        }
    }
    
    // Verificar citas con el token actual
    console.log('📋 Verificando citas...');
    try {
        const updatedToken = localStorage.getItem('access_token');
        const response = await fetch('http://localhost:4000/api/appointments/my-appointments', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${updatedToken}`,
                'Content-Type': 'application/json',
            },
        });
        
        if (response.ok) {
            const appointments = await response.json();
            console.log('✅ Citas cargadas exitosamente:', appointments.length, 'citas');
            console.log('📋 Citas encontradas:', appointments);
            
            // Intentar forzar una recarga de la página si estamos en el contexto del navegador
            if (typeof window !== 'undefined' && window.location.pathname.includes('appointments')) {
                console.log('🔄 Forzando recarga de página...');
                window.location.reload();
            }
        } else {
            console.error('❌ Error al cargar citas:', response.status, await response.text());
        }
    } catch (error) {
        console.error('❌ Error en petición de citas:', error);
    }
};

// Ejecutar la verificación
testFrontendAuth();
