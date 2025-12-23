import axios from 'axios';
import jwt from 'jsonwebtoken';

const API_BASE_URL = 'http://localhost:5000/api';

// Función para generar un token JWT de prueba
function generateTestToken(userId: string, role: string) {
    const payload = {
        userId,
        role,
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + (60 * 60 * 24) // 24 horas
    };
    
    return jwt.sign(payload, process.env.JWT_SECRET || 'supersecretjwtkey');
}

async function testUsersEndpoint() {
    try {
        console.log('🔍 Probando endpoint /users/me...');
        
        // Generar token de prueba
        const testUserId = '0169af6d-f37b-4eb0-a48d-22a8cb32bf7b'; // ID de ejemplo
        const token = generateTestToken(testUserId, 'patient');
        
        console.log('📝 Token generado:', token.substring(0, 50) + '...');
        
        // Hacer petición al endpoint
        const response = await axios.get(`${API_BASE_URL}/users/me`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            timeout: 10000
        });
        
        console.log('✅ Respuesta exitosa:', {
            status: response.status,
            data: response.data
        });
        
    } catch (error: any) {
        console.error('❌ Error en la petición:', {
            message: error.message,
            status: error.response?.status,
            data: error.response?.data,
            config: {
                url: error.config?.url,
                method: error.config?.method,
                headers: error.config?.headers
            }
        });
        
        // Si es un error de red, mostrar más detalles
        if (error.code === 'ECONNREFUSED') {
            console.error('🔌 Error de conexión: El servidor no está ejecutándose en el puerto 5000');
        }
    }
}

async function testDatabaseConnection() {
    try {
        console.log('🔍 Probando conexión a la base de datos...');
        
        const response = await axios.get(`${API_BASE_URL}/health`, {
            timeout: 5000
        });
        
        console.log('✅ Conexión a la base de datos exitosa:', response.data);
        
    } catch (error: any) {
        console.error('❌ Error de conexión a la base de datos:', {
            message: error.message,
            status: error.response?.status,
            data: error.response?.data
        });
    }
}

async function main() {
    console.log('🚀 Iniciando diagnóstico del endpoint /users/me...\n');
    
    // Probar conexión a la base de datos primero
    await testDatabaseConnection();
    console.log('');
    
    // Probar el endpoint de usuarios
    await testUsersEndpoint();
    
    console.log('\n🏁 Diagnóstico completado.');
}

main().catch(console.error); 