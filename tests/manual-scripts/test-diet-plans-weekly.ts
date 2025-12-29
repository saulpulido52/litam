import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

// Credenciales de nutricionista
const NUTRITIONIST_CREDENTIALS = {
    email: 'nutri1@test.com',
    password: 'password123'
};

// Función para obtener token
async function getAuthToken(credentials: { email: string; password: string }) {
    try {
        const response = await axios.post(`${API_BASE_URL}/auth/login`, credentials);
        return response.data.data.token;
    } catch (error: any) {
        console.error('Error al obtener token:', error.response?.data || error.message);
        throw error;
    }
}

// Función para obtener pacientes del nutricionista
async function getPatients(token: string) {
    try {
        const response = await axios.get(`${API_BASE_URL}/patients/my-patients`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data.data.patients;
    } catch (error: any) {
        console.error('Error al obtener pacientes:', error.response?.data || error.message);
        throw error;
    }
}

// Función para crear un plan semanal básico
async function createWeeklyDietPlan(token: string, patientId: string) {
    try {
        const planData = {
            patientId: patientId,
            name: 'Plan Semanal de Pérdida de Peso - Semana 1',
            description: 'Plan nutricional semanal para pérdida de peso',
            startDate: '2024-01-15',
            endDate: '2024-01-21',
            dailyCaloriesTarget: 1800,
            dailyMacrosTarget: {
                protein: 135,
                carbohydrates: 180,
                fats: 60
            },
            notes: 'Plan semanal personalizado',
            isWeeklyPlan: true,
            totalWeeks: 1,
            weeklyPlans: [
                {
                    weekNumber: 1,
                    startDate: '2024-01-15',
                    endDate: '2024-01-21',
                    dailyCaloriesTarget: 1800,
                    dailyMacrosTarget: {
                        protein: 135,
                        carbohydrates: 180,
                        fats: 60
                    },
                    meals: [
                        {
                            day: 'monday',
                            mealType: 'breakfast',
                            foods: [
                                {
                                    foodId: 'food-1',
                                    foodName: 'Avena',
                                    quantityGrams: 50,
                                    calories: 170,
                                    protein: 6,
                                    carbs: 30,
                                    fats: 3
                                },
                                {
                                    foodId: 'food-2',
                                    foodName: 'Plátano',
                                    quantityGrams: 100,
                                    calories: 89,
                                    protein: 1,
                                    carbs: 23,
                                    fats: 0
                                }
                            ],
                            notes: 'Desayuno energético'
                        }
                    ],
                    notes: 'Semana 1 del plan de pérdida de peso'
                }
            ]
        };

        const response = await axios.post(`${API_BASE_URL}/diet-plans`, planData, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data.data.dietPlan;
    } catch (error: any) {
        console.error('Error al crear plan semanal:', error.response?.data || error.message);
        throw error;
    }
}

// Función para generar plan con IA
async function generateAIDietPlan(token: string, patientId: string) {
    try {
        const aiPlanData = {
            patientId: patientId,
            name: 'Plan IA - Ganancia de Músculo',
            goal: 'muscle_gain',
            startDate: '2024-01-22',
            endDate: '2024-02-18',
            totalWeeks: 4,
            dailyCaloriesTarget: 2500,
            dietaryRestrictions: ['lactosa'],
            allergies: ['nueces'],
            preferredFoods: ['pollo', 'arroz', 'brócoli'],
            dislikedFoods: ['pescado'],
            notesForAI: 'Paciente busca ganar masa muscular de forma saludable'
        };

        const response = await axios.post(`${API_BASE_URL}/diet-plans/generate-ai`, aiPlanData, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data.data.dietPlan;
    } catch (error: any) {
        console.error('Error al generar plan con IA:', error.response?.data || error.message);
        throw error;
    }
}

// Función para agregar una semana a un plan existente
async function addWeekToPlan(token: string, dietPlanId: string) {
    try {
        const weekData = {
            weekNumber: 2,
            startDate: '2024-01-22',
            endDate: '2024-01-28',
            dailyCaloriesTarget: 1800,
            dailyMacrosTarget: {
                protein: 135,
                carbohydrates: 180,
                fats: 60
            },
            meals: [
                {
                    day: 'monday',
                    mealType: 'breakfast',
                    foods: [
                        {
                            foodId: 'food-3',
                            foodName: 'Huevos',
                            quantityGrams: 100,
                            calories: 155,
                            protein: 13,
                            carbs: 1,
                            fats: 11
                        }
                    ],
                    notes: 'Desayuno con proteína'
                }
            ],
            notes: 'Semana 2 del plan de pérdida de peso'
        };

        const response = await axios.post(`${API_BASE_URL}/diet-plans/${dietPlanId}/weeks`, weekData, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data.data.dietPlan;
    } catch (error: any) {
        console.error('Error al agregar semana:', error.response?.data || error.message);
        throw error;
    }
}

// Función para obtener planes de un paciente
async function getPatientDietPlans(token: string, patientId: string) {
    try {
        const response = await axios.get(`${API_BASE_URL}/diet-plans/patient/${patientId}`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data.data.dietPlans;
    } catch (error: any) {
        console.error('Error al obtener planes del paciente:', error.response?.data || error.message);
        throw error;
    }
}

// Función para actualizar estado del plan
async function updateDietPlanStatus(token: string, dietPlanId: string, status: string) {
    try {
        const response = await axios.patch(`${API_BASE_URL}/diet-plans/${dietPlanId}/status`, 
            { status }, 
            { headers: { Authorization: `Bearer ${token}` } }
        );
        return response.data.data.dietPlan;
    } catch (error: any) {
        console.error('Error al actualizar estado:', error.response?.data || error.message);
        throw error;
    }
}

// Función principal de prueba
async function testWeeklyDietPlans() {
    console.log('🧪 Iniciando pruebas del sistema de planes nutricionales semanales...\n');

    try {
        // 1. Obtener token de nutricionista
        console.log('1️⃣ Obteniendo token de nutricionista...');
        const token = await getAuthToken(NUTRITIONIST_CREDENTIALS);
        console.log('✅ Token obtenido correctamente\n');

        // 2. Obtener pacientes
        console.log('2️⃣ Obteniendo pacientes del nutricionista...');
        const patients = await getPatients(token);
        console.log(`✅ Encontrados ${patients.length} pacientes`);
        
        if (patients.length === 0) {
            console.log('❌ No hay pacientes disponibles para las pruebas');
            return;
        }

        const patient = patients[0];
        console.log(`📋 Usando paciente: ${patient.first_name} ${patient.last_name}\n`);

        // 3. Crear plan semanal básico
        console.log('3️⃣ Creando plan semanal básico...');
        const weeklyPlan = await createWeeklyDietPlan(token, patient.id);
        console.log(`✅ Plan semanal creado: ${weeklyPlan.name}`);
        console.log(`📊 Semanas: ${weeklyPlan.total_weeks}`);
        console.log(`📅 Fecha inicio: ${weeklyPlan.start_date}`);
        console.log(`📅 Fecha fin: ${weeklyPlan.end_date}\n`);

        // 4. Generar plan con IA
        console.log('4️⃣ Generando plan con IA...');
        const aiPlan = await generateAIDietPlan(token, patient.id);
        console.log(`✅ Plan IA generado: ${aiPlan.name}`);
        console.log(`🤖 Generado por IA: ${aiPlan.generated_by_ia}`);
        console.log(`📊 Semanas: ${aiPlan.total_weeks}`);
        console.log(`📅 Fecha inicio: ${aiPlan.start_date}`);
        console.log(`📅 Fecha fin: ${aiPlan.end_date}\n`);

        // 5. Agregar semana al plan semanal
        console.log('5️⃣ Agregando semana adicional al plan semanal...');
        const updatedPlan = await addWeekToPlan(token, weeklyPlan.id);
        console.log(`✅ Semana agregada. Total de semanas: ${updatedPlan.total_weeks}\n`);

        // 6. Obtener todos los planes del paciente
        console.log('6️⃣ Obteniendo todos los planes del paciente...');
        const allPlans = await getPatientDietPlans(token, patient.id);
        console.log(`✅ Encontrados ${allPlans.length} planes para el paciente`);
        
        allPlans.forEach((plan: any, index: number) => {
            console.log(`   ${index + 1}. ${plan.name} (${plan.status}) - ${plan.total_weeks} semanas`);
        });
        console.log();

        // 7. Actualizar estado del plan semanal
        console.log('7️⃣ Actualizando estado del plan semanal a activo...');
        const activatedPlan = await updateDietPlanStatus(token, weeklyPlan.id, 'active');
        console.log(`✅ Plan activado: ${activatedPlan.status}\n`);

        // 8. Mostrar resumen final
        console.log('📋 RESUMEN DE PRUEBAS:');
        console.log('✅ Token de nutricionista obtenido');
        console.log('✅ Pacientes obtenidos');
        console.log('✅ Plan semanal creado manualmente');
        console.log('✅ Plan generado con IA');
        console.log('✅ Semana adicional agregada');
        console.log('✅ Planes del paciente obtenidos');
        console.log('✅ Estado del plan actualizado');
        console.log('\n🎉 ¡Todas las pruebas del sistema semanal completadas exitosamente!');

    } catch (error: any) {
        console.error('\n❌ Error en las pruebas:', error.response?.data || error.message);
        
        if (error.response?.data?.message) {
            console.error('Mensaje de error:', error.response.data.message);
        }
        
        if (error.response?.data?.errors) {
            console.error('Errores de validación:');
            error.response.data.errors.forEach((err: any) => {
                console.error(`  - ${err.field}: ${err.message}`);
            });
        }
    }
}

// Ejecutar pruebas
testWeeklyDietPlans(); 