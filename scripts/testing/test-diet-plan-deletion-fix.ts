// scripts/testing/test-diet-plan-deletion-fix.ts
import axios from 'axios';

const BASE_URL = 'http://localhost:4000/api';

// Función para hacer login y obtener token
async function login(): Promise<string> {
    try {
        const response = await axios.post(`${BASE_URL}/auth/login`, {
            email: 'nutri.admin@sistema.com',
            password: 'Admin123!'
        });
        
        console.log('✅ Login exitoso');
        return response.data.token;
    } catch (error: any) {
        console.error('❌ Error en login:', error.response?.data || error.message);
        throw error;
    }
}

// Función para crear un plan de dieta de prueba
async function createTestDietPlan(token: string): Promise<string> {
    try {
        const response = await axios.post(`${BASE_URL}/diet-plans`, {
            name: 'Plan de Prueba para Eliminación',
            description: 'Plan temporal para probar eliminación',
            patientId: 'ffde8e9e-b6c5-46da-a2e6-67fa408ea051', // ID del usuario admin como paciente de prueba
            startDate: '2025-01-28',
            endDate: '2025-02-28',
            dailyCaloriesTarget: 2000,
            status: 'draft' // Estado borrador para poder eliminarlo
        }, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        
        console.log('✅ Plan de dieta creado:', response.data.data.id);
        return response.data.data.id;
    } catch (error: any) {
        console.error('❌ Error creando plan:', error.response?.data || error.message);
        throw error;
    }
}

// Función para eliminar plan de dieta
async function deleteDietPlan(token: string, planId: string): Promise<void> {
    try {
        const response = await axios.delete(`${BASE_URL}/diet-plans/${planId}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        console.log('✅ Respuesta de eliminación:', response.data);
        
        if (response.data.status === 'success') {
            console.log('✅ Plan eliminado exitosamente:', response.data.message);
        } else {
            console.log('⚠️ Respuesta inesperada:', response.data);
        }
    } catch (error: any) {
        console.error('❌ Error eliminando plan:', error.response?.data || error.message);
        throw error;
    }
}

// Función para verificar que el plan ya no existe
async function verifyPlanDeleted(token: string, planId: string): Promise<void> {
    try {
        const response = await axios.get(`${BASE_URL}/diet-plans/${planId}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        console.log('❌ El plan aún existe (esto es un error):', response.data);
    } catch (error: any) {
        if (error.response?.status === 404) {
            console.log('✅ Verificado: El plan ya no existe (404 esperado)');
        } else {
            console.error('❌ Error inesperado verificando eliminación:', error.response?.data || error.message);
        }
    }
}

// Función principal de prueba
async function testDietPlanDeletion() {
    try {
        console.log('🧪 Iniciando prueba de eliminación de planes de dieta...\n');
        
        // Step 1: Login
        console.log('1️⃣ Haciendo login...');
        const token = await login();
        
        // Step 2: Crear plan de prueba
        console.log('\n2️⃣ Creando plan de prueba...');
        const planId = await createTestDietPlan(token);
        
        // Step 3: Eliminar plan
        console.log('\n3️⃣ Eliminando plan...');
        await deleteDietPlan(token, planId);
        
        // Step 4: Verificar eliminación
        console.log('\n4️⃣ Verificando eliminación...');
        await verifyPlanDeleted(token, planId);
        
        console.log('\n🎉 ¡Prueba completada exitosamente!');
        
    } catch (error) {
        console.error('\n💥 Error en la prueba:', error);
        process.exit(1);
    }
}

// Ejecutar prueba si el archivo se ejecuta directamente
if (require.main === module) {
    testDietPlanDeletion();
}

export { testDietPlanDeletion }; 