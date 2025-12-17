import axios from 'axios';

async function verifyLogin() {
    const baseUrl = 'http://localhost:4000/api';
    
    // Credenciales existentes conocidas
    const credentialsToTest = [
        { email: 'dr.maria.gonzalez@demo.com', password: 'demo123', name: 'Dr. María González' },
        { email: 'dr.juan.perez@demo.com', password: 'demo123', name: 'Dr. Juan Pérez' },
        { email: 'dra.carmen.rodriguez@demo.com', password: 'demo123', name: 'Dra. Carmen Rodríguez' },
        { email: 'ana.lopez@demo.com', password: 'demo123', name: 'Ana López (Paciente)' },
        { email: 'carlos.ruiz@demo.com', password: 'demo123', name: 'Carlos Ruiz (Paciente)' },
    ];

    console.log('🔍 Verificando credenciales existentes...\n');

    try {
        // Primero verificar si el backend está corriendo
        console.log('📡 Verificando conexión con el backend...');
        try {
            const healthCheck = await axios.get(`${baseUrl}/auth/login`, { timeout: 5000 });
        } catch (error: any) {
            if (error.code === 'ECONNREFUSED') {
                console.log('❌ El backend no está corriendo en http://localhost:4000');
                console.log('💡 Inicia el backend con: npm run dev');
                return;
            }
        }

        console.log('✅ Backend conectado\n');

        let workingCredentials = [];
        let failedCredentials = [];

        for (const credential of credentialsToTest) {
            try {
                console.log(`🔐 Probando: ${credential.name} (${credential.email})`);
                
                const response = await axios.post(`${baseUrl}/auth/login`, {
                    email: credential.email,
                    password: credential.password
                }, {
                    timeout: 10000,
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });

                if (response.status === 200 && response.data.status === 'success') {
                    const user = response.data.data.user;
                    console.log(`   ✅ LOGIN EXITOSO`);
                    console.log(`   👤 Usuario: ${user.first_name} ${user.last_name}`);
                    console.log(`   🏷️ Rol: ${user.role.name}`);
                    console.log(`   🆔 ID: ${user.id}\n`);
                    
                    workingCredentials.push({
                        ...credential,
                        userId: user.id,
                        role: user.role.name,
                        fullName: `${user.first_name} ${user.last_name}`
                    });
                } else {
                    console.log(`   ❌ Login falló: ${response.data.message || 'Error desconocido'}\n`);
                    failedCredentials.push(credential);
                }

            } catch (error: any) {
                if (error.response) {
                    console.log(`   ❌ Error ${error.response.status}: ${error.response.data?.message || 'Error de autenticación'}\n`);
                } else if (error.code === 'ECONNREFUSED') {
                    console.log(`   ❌ No se puede conectar al backend\n`);
                } else {
                    console.log(`   ❌ Error: ${error.message}\n`);
                }
                failedCredentials.push(credential);
            }
        }

        // Resumen final
        console.log('📊 RESUMEN DE CREDENCIALES:');
        console.log('═'.repeat(50));
        
        if (workingCredentials.length > 0) {
            console.log('\n✅ CREDENCIALES FUNCIONALES:');
            workingCredentials.forEach((cred, index) => {
                console.log(`${index + 1}. ${cred.fullName} (${cred.role})`);
                console.log(`   📧 Email: ${cred.email}`);
                console.log(`   🔑 Password: ${cred.password}`);
                console.log(`   🆔 ID: ${cred.userId}\n`);
            });
        }

        if (failedCredentials.length > 0) {
            console.log('❌ CREDENCIALES QUE NO FUNCIONAN:');
            failedCredentials.forEach((cred, index) => {
                console.log(`${index + 1}. ${cred.name} - ${cred.email}`);
            });
        }

        console.log('\n🌐 URLs del sistema:');
        console.log('   Frontend: http://localhost:5000');
        console.log('   Backend: http://localhost:4000');
        console.log('   Login: http://localhost:5000/login');

        if (workingCredentials.length > 0) {
            console.log('\n💡 Para probar el frontend:');
            console.log('1. Ve a http://localhost:5000/login');
            console.log('2. Usa cualquiera de las credenciales funcionales listadas arriba');
        }

    } catch (error: any) {
        console.error('❌ Error general:', error.message);
    }
}

verifyLogin(); 