// src/__tests__/diet_plans.test.ts
import request from 'supertest';
import { AppDataSource } from '@/database/data-source';
import { User } from '@/database/entities/user.entity';
import { Role, RoleName } from '@/database/entities/role.entity';
import { PatientProfile } from '@/database/entities/patient_profile.entity';
import { NutritionistProfile } from '@/database/entities/nutritionist_profile.entity';
import { PatientNutritionistRelation } from '@/database/entities/patient_nutritionist_relation.entity';
import { Food } from '@/database/entities/food.entity';
import { DietPlan, DietPlanStatus } from '@/database/entities/diet_plan.entity';
import { Meal } from '@/database/entities/meal.entity';
import { MealItem } from '@/database/entities/meal_item.entity';
import app from '@/app';
import { setupTestEnvironment, cleanupTestEnvironment } from '@/setup-test-environment';

function uniqueEmail(prefix: string) {
    return `${prefix}.${Date.now()}.${Math.floor(Math.random()*1000000)}@example.com`;
}

// Función helper para crear alimentos de prueba
async function createTestFoods() {
    const foodRepository = AppDataSource.getRepository(Food);
    
    const food1 = foodRepository.create({
        name: 'Avena',
        calories: 389,
        protein: 16.9,
        carbohydrates: 66.3,
        fats: 6.9,
        fiber: 10.6,
        unit: 'gramos',
        serving_size: 100
    });
    const savedFood1 = await foodRepository.save(food1);

    const food2 = foodRepository.create({
        name: 'Pollo',
        calories: 165,
        protein: 31,
        carbohydrates: 0,
        fats: 3.6,
        fiber: 0,
        unit: 'gramos',
        serving_size: 100
    });
    const savedFood2 = await foodRepository.save(food2);

    return { food1Id: savedFood1.id, food2Id: savedFood2.id };
}

describe('Diet Plans API (/api/diet-plans)', () => {
    beforeAll(async () => {
        await setupTestEnvironment();
    });

    afterAll(async () => {
        await cleanupTestEnvironment();
    });

    function registerNutritionist() {
        const email = uniqueEmail('nutri');
        return request(app)
            .post('/api/auth/register/nutritionist')
            .send({
                email,
                password: 'Password123!',
                firstName: 'Dr. Nutri',
                lastName: 'DietPlan'
            });
    }
    function registerPatient() {
        const email = uniqueEmail('patient');
        return request(app)
            .post('/api/auth/register/patient')
            .send({
                email,
                password: 'Password123!',
                firstName: 'Alice',
                lastName: 'Patient',
                age: 30,
                gender: 'female'
            });
    }

    it('should allow a nutritionist to create a diet plan for an active patient', async () => {
        // Crear alimentos de prueba para esta prueba
        const { food1Id, food2Id } = await createTestFoods();

        const nutriRes = await registerNutritionist();
        if (!nutriRes.body?.data?.user?.id) {
            throw new Error(`Nutriólogo no registrado correctamente: ${JSON.stringify(nutriRes.body)}`);
        }
        if (![200, 201].includes(nutriRes.statusCode)) {
            console.error('Error registering nutritionist:', nutriRes.body);
            throw new Error(`Failed to register nutritionist: ${nutriRes.statusCode} - ${JSON.stringify(nutriRes.body)}`);
        }
        const nutritionistToken = nutriRes.body.data.token;
        const nutritionistId = nutriRes.body.data.user.id;

        const patientRes = await registerPatient();
        if (!patientRes.body?.data?.user?.id) {
            throw new Error(`Paciente no registrado correctamente: ${JSON.stringify(patientRes.body)}`);
        }
        if (![200, 201].includes(patientRes.statusCode)) {
            console.error('Error registering patient:', patientRes.body);
            throw new Error(`Failed to register patient: ${patientRes.statusCode} - ${JSON.stringify(patientRes.body)}`);
        }
        const patientId = patientRes.body.data.user.id;

        // Crear relación paciente-nutriólogo
        await AppDataSource.getRepository('PatientNutritionistRelation').save({
            patient: { id: patientId },
            nutritionist: { id: nutritionistId },
            status: 'active'
        });

        const dietPlanData = {
            name: 'Plan de Inicio Semanal',
            patientId,
            startDate: new Date().toISOString().split('T')[0],
            endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            dailyCaloriesTarget: 2000,
            meals: [
                { name: 'Desayuno', order: 1, mealItems: [{ foodId: food1Id, quantity: 1 }] },
                { name: 'Almuerzo', order: 2, mealItems: [{ foodId: food2Id, quantity: 150 }] },
            ],
        };
        console.log('DietPlanData enviado:', JSON.stringify(dietPlanData, null, 2));
        const res = await request(app)
            .post('/api/diet-plans')
            .set('Authorization', `Bearer ${nutritionistToken}`)
            .send(dietPlanData);
        expect(res.statusCode).toBe(201);
        expect(res.body.status).toBe('success');
        expect(res.body.data.dietPlan).toBeDefined();
        expect(res.body.data.dietPlan.name).toBe(dietPlanData.name);
        expect(res.body.data.dietPlan.patient.id).toBe(patientId);
        expect(res.body.data.dietPlan.nutritionist.id).toBe(nutritionistId);
        expect(res.body.data.dietPlan.meals.length).toBe(2);
        expect(res.body.data.dietPlan.meals[0].meal_items.length).toBe(1);
    });

    it('should prevent a patient from creating a diet plan', async () => {
        const nutriRes = await registerNutritionist();
        if (![200, 201].includes(nutriRes.statusCode)) {
            console.error('Error registering nutritionist:', nutriRes.body);
            throw new Error(`Failed to register nutritionist: ${nutriRes.statusCode} - ${JSON.stringify(nutriRes.body)}`);
        }
        const patientRes = await registerPatient();
        if (![200, 201].includes(patientRes.statusCode)) {
            console.error('Error registering patient:', patientRes.body);
            throw new Error(`Failed to register patient: ${patientRes.statusCode} - ${JSON.stringify(patientRes.body)}`);
        }
        const patientToken = patientRes.body.data.token;
        const patientId = patientRes.body.data.user.id;
        const dietPlanData = {
            name: 'Plan Paciente',
            patientId,
            startDate: '2023-01-01',
            endDate: '2023-01-07',
            meals: []
        };
        const res = await request(app)
            .post('/api/diet-plans')
            .set('Authorization', `Bearer ${patientToken}`)
            .send(dietPlanData);
        expect(res.statusCode).toBe(403);
    });

    it('should prevent creating a diet plan for a non-existent patient', async () => {
        const nutriRes = await registerNutritionist();
        if (![200, 201].includes(nutriRes.statusCode)) {
            console.error('Error registering nutritionist:', nutriRes.body);
            throw new Error(`Failed to register nutritionist: ${nutriRes.statusCode} - ${JSON.stringify(nutriRes.body)}`);
        }
        const nutritionistToken = nutriRes.body.data.token;
        const nonExistentPatientId = '00000000-0000-0000-0000-000000000000';
        const dietPlanData = {
            name: 'Plan Fantasma',
            patientId: nonExistentPatientId,
            startDate: '2023-01-01',
            endDate: '2023-01-07',
            meals: []
        };
        const res = await request(app)
            .post('/api/diet-plans')
            .set('Authorization', `Bearer ${nutritionistToken}`)
            .send(dietPlanData);
        expect([400, 404]).toContain(res.statusCode);
    });

    it('should require essential fields for diet plan creation', async () => {
        const nutriRes = await registerNutritionist();
        if (![200, 201].includes(nutriRes.statusCode)) {
            console.error('Error registering nutritionist:', nutriRes.body);
            throw new Error(`Failed to register nutritionist: ${nutriRes.statusCode} - ${JSON.stringify(nutriRes.body)}`);
        }
        const nutritionistToken = nutriRes.body.data.token;
        const incompleteData = { name: 'Plan Incompleto' };
        const res = await request(app)
            .post('/api/diet-plans')
            .set('Authorization', `Bearer ${nutritionistToken}`)
            .send(incompleteData);
        expect(res.statusCode).toBe(400);
    });

    // --- Tests de Obtención de Planes de Dieta ---
    it('should allow a patient to get their own diet plans (GET /api/diet-plans/patient/:patientId)', async () => {
        // Crear alimentos de prueba para esta prueba
        const { food1Id, food2Id } = await createTestFoods();

        const nutriRes = await registerNutritionist();
        if (!nutriRes.body?.data?.user?.id) {
            throw new Error(`Nutriólogo no registrado correctamente: ${JSON.stringify(nutriRes.body)}`);
        }
        const nutritionistToken = nutriRes.body.data.token;
        const nutritionistId = nutriRes.body.data.user.id;
        const patientRes = await registerPatient();
        if (!patientRes.body?.data?.user?.id) {
            throw new Error(`Paciente no registrado correctamente: ${JSON.stringify(patientRes.body)}`);
        }
        const patientToken = patientRes.body.data.token;
        const patientId = patientRes.body.data.user.id;

        // Crear relación paciente-nutriólogo
        await AppDataSource.getRepository('PatientNutritionistRelation').save({
            patient: { id: patientId },
            nutritionist: { id: nutritionistId },
            status: 'active'
        });

        // Primero crear un diet plan para que haya algo que obtener
        const dietPlanData = {
            name: 'Plan de Inicio Semanal',
            patientId,
            startDate: new Date().toISOString().split('T')[0],
            endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            dailyCaloriesTarget: 2000,
            meals: [
                { name: 'Desayuno', order: 1, mealItems: [{ foodId: food1Id, quantity: 1 }] },
                { name: 'Almuerzo', order: 2, mealItems: [{ foodId: food2Id, quantity: 150 }] },
            ],
        };
        await request(app)
            .post('/api/diet-plans')
            .set('Authorization', `Bearer ${nutritionistToken}`)
            .send(dietPlanData);

        const res = await request(app)
            .get(`/api/diet-plans/patient/${patientId}`)
            .set('Authorization', `Bearer ${patientToken}`);

        expect(res.statusCode).toBe(200);
        expect(res.body.status).toBe('success');
        expect(Array.isArray(res.body.data.dietPlans)).toBe(true);
        expect(res.body.data.dietPlans.length).toBeGreaterThan(0);
    });

    it('should allow a linked nutritionist to get a patient\'s diet plans (GET /api/diet-plans/patient/:patientId)', async () => {
        // Crear alimentos de prueba para esta prueba
        const { food1Id, food2Id } = await createTestFoods();

        const nutriRes = await registerNutritionist();
        if (!nutriRes.body?.data?.user?.id) {
            throw new Error(`Nutriólogo no registrado correctamente: ${JSON.stringify(nutriRes.body)}`);
        }
        const nutritionistToken = nutriRes.body.data.token;
        const nutritionistId = nutriRes.body.data.user.id;
        const patientRes = await registerPatient();
        if (!patientRes.body?.data?.user?.id) {
            throw new Error(`Paciente no registrado correctamente: ${JSON.stringify(patientRes.body)}`);
        }
        const patientToken = patientRes.body.data.token;
        const patientId = patientRes.body.data.user.id;

        // Crear relación paciente-nutriólogo
        await AppDataSource.getRepository('PatientNutritionistRelation').save({
            patient: { id: patientId },
            nutritionist: { id: nutritionistId },
            status: 'active'
        });

        // Primero crear un diet plan para que haya algo que obtener
        const dietPlanData = {
            name: 'Plan de Inicio Semanal',
            patientId,
            startDate: new Date().toISOString().split('T')[0],
            endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            dailyCaloriesTarget: 2000,
            meals: [
                { name: 'Desayuno', order: 1, mealItems: [{ foodId: food1Id, quantity: 1 }] },
                { name: 'Almuerzo', order: 2, mealItems: [{ foodId: food2Id, quantity: 150 }] },
            ],
        };
        await request(app)
            .post('/api/diet-plans')
            .set('Authorization', `Bearer ${nutritionistToken}`)
            .send(dietPlanData);

        const res = await request(app)
            .get(`/api/diet-plans/patient/${patientId}`)
            .set('Authorization', `Bearer ${nutritionistToken}`);

        expect(res.statusCode).toBe(200);
        expect(res.body.status).toBe('success');
        expect(Array.isArray(res.body.data.dietPlans)).toBe(true);
        expect(res.body.data.dietPlans.length).toBeGreaterThan(0);
    });

    it('should prevent an unlinked nutritionist from getting a patient\'s diet plans', async () => {
        // Crear otro nutriólogo no vinculado
        const otherNutriRes = await request(app)
            .post('/api/auth/register/nutritionist')
            .send({ 
                email: uniqueEmail('other.nutri'), 
                password: 'Password123!', 
                firstName: 'Other', 
                lastName: 'Nutri'
            });
        const otherNutriToken = otherNutriRes.body.data.token;

        const patientRes = await registerPatient();
        const patientToken = patientRes.body.data.token;
        const patientId = patientRes.body.data.user.id;

        const res = await request(app)
            .get(`/api/diet-plans/patient/${patientId}`)
            .set('Authorization', `Bearer ${otherNutriToken}`);
        expect([403, 404]).toContain(res.statusCode);
    });

    it('should allow a patient to get a specific diet plan by ID (GET /api/diet-plans/:id)', async () => {
        // Crear alimentos de prueba para esta prueba
        const { food1Id, food2Id } = await createTestFoods();

        const nutriRes = await registerNutritionist();
        if (!nutriRes.body?.data?.user?.id) {
            throw new Error(`Nutriólogo no registrado correctamente: ${JSON.stringify(nutriRes.body)}`);
        }
        const nutritionistToken = nutriRes.body.data.token;
        const nutritionistId = nutriRes.body.data.user.id;
        const patientRes = await registerPatient();
        if (!patientRes.body?.data?.user?.id) {
            throw new Error(`Paciente no registrado correctamente: ${JSON.stringify(patientRes.body)}`);
        }
        const patientToken = patientRes.body.data.token;
        const patientId = patientRes.body.data.user.id;

        // Crear relación paciente-nutriólogo
        await AppDataSource.getRepository('PatientNutritionistRelation').save({
            patient: { id: patientId },
            nutritionist: { id: nutritionistId },
            status: 'active'
        });

        // Primero crear un diet plan
        const dietPlanData = {
            name: 'Plan de Inicio Semanal',
            patientId,
            startDate: new Date().toISOString().split('T')[0],
            endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            dailyCaloriesTarget: 2000,
            meals: [
                { name: 'Desayuno', order: 1, mealItems: [{ foodId: food1Id, quantity: 1 }] },
                { name: 'Almuerzo', order: 2, mealItems: [{ foodId: food2Id, quantity: 150 }] },
            ],
        };
        const createRes = await request(app)
            .post('/api/diet-plans')
            .set('Authorization', `Bearer ${nutritionistToken}`)
            .send(dietPlanData);
        
        expect(createRes.statusCode).toBe(201);
        const dietPlanId = createRes.body.data.dietPlan.id;

        // Ahora obtener el plan por ID
        const res = await request(app)
            .get(`/api/diet-plans/${dietPlanId}`)
            .set('Authorization', `Bearer ${patientToken}`);
        
        expect(res.statusCode).toBe(200);
        expect(res.body.status).toBe('success');
        expect(res.body.data.dietPlan).toBeDefined();
        expect(res.body.data.dietPlan.id).toBe(dietPlanId);
    });

    it('should allow a linked nutritionist to get a specific diet plan by ID (GET /api/diet-plans/:id)', async () => {
        // Crear alimentos de prueba para esta prueba
        const { food1Id, food2Id } = await createTestFoods();

        const nutriRes = await registerNutritionist();
        if (!nutriRes.body?.data?.user?.id) {
            throw new Error(`Nutriólogo no registrado correctamente: ${JSON.stringify(nutriRes.body)}`);
        }
        const nutritionistToken = nutriRes.body.data.token;
        const nutritionistId = nutriRes.body.data.user.id;
        const patientRes = await registerPatient();
        if (!patientRes.body?.data?.user?.id) {
            throw new Error(`Paciente no registrado correctamente: ${JSON.stringify(patientRes.body)}`);
        }
        const patientToken = patientRes.body.data.token;
        const patientId = patientRes.body.data.user.id;

        // Crear relación paciente-nutriólogo
        await AppDataSource.getRepository('PatientNutritionistRelation').save({
            patient: { id: patientId },
            nutritionist: { id: nutritionistId },
            status: 'active'
        });

        // Primero crear un diet plan
        const dietPlanData = {
            name: 'Plan de Inicio Semanal',
            patientId,
            startDate: new Date().toISOString().split('T')[0],
            endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            dailyCaloriesTarget: 2000,
            meals: [
                { name: 'Desayuno', order: 1, mealItems: [{ foodId: food1Id, quantity: 1 }] },
                { name: 'Almuerzo', order: 2, mealItems: [{ foodId: food2Id, quantity: 150 }] },
            ],
        };
        const createRes = await request(app)
            .post('/api/diet-plans')
            .set('Authorization', `Bearer ${nutritionistToken}`)
            .send(dietPlanData);
        
        expect(createRes.statusCode).toBe(201);
        const dietPlanId = createRes.body.data.dietPlan.id;

        // Ahora obtener el plan por ID
        const res = await request(app)
            .get(`/api/diet-plans/${dietPlanId}`)
            .set('Authorization', `Bearer ${nutritionistToken}`);
        
        expect(res.statusCode).toBe(200);
        expect(res.body.status).toBe('success');
        expect(res.body.data.dietPlan).toBeDefined();
        expect(res.body.data.dietPlan.id).toBe(dietPlanId);
    });
});