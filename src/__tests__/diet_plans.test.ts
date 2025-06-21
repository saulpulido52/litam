// src/__tests__/diet_plans.test.ts
import request from 'supertest';
import { AppDataSource } from '@/database/data-source';
import { User } from '@/database/entities/user.entity';
import { Role, RoleName } from '@/database/entities/role.entity';
import { PatientNutritionistRelation, RelationshipStatus } from '@/database/entities/patient_nutritionist_relation.entity';
import { Food } from '@/database/entities/food.entity';
import { DietPlan, DietPlanStatus } from '@/database/entities/diet_plan.entity';
import { Meal } from '@/database/entities/meal.entity';
import { MealItem } from '@/database/entities/meal_item.entity';
import app from '@/app';

let patientToken: string;
let patientId: string;
let nutritionistToken: string;
let nutritionistId: string;
let food1Id: string;
let food2Id: string;
let createdDietPlanId: string;

const patientCredentials = {
    email: 'patient.dietplan@example.com',
    password: 'SecurePass1!',
    firstName: 'Alice',
    lastName: 'Diet',
};

const nutritionistCredentials = {
    email: 'nutri.dietplan@example.com',
    password: 'SecurePass1!',
    firstName: 'Dr. Plan',
    lastName: 'Creator',
};

describe('Diet Plans API (/api/diet-plans)', () => {
    jest.setTimeout(45000); // Aumentar timeout para operaciones de BD

    beforeAll(async () => {
        if (!AppDataSource.isInitialized) {
            await AppDataSource.initialize();
        }

        // Limpiar tablas en orden inverso de dependencias
        await AppDataSource.query(`TRUNCATE TABLE "meal_items" RESTART IDENTITY CASCADE;`);
        await AppDataSource.query(`TRUNCATE TABLE "meals" RESTART IDENTITY CASCADE;`);
        await AppDataSource.query(`TRUNCATE TABLE "diet_plans" RESTART IDENTITY CASCADE;`);
        await AppDataSource.query(`TRUNCATE TABLE "patient_nutritionist_relations" RESTART IDENTITY CASCADE;`);
        await AppDataSource.query(`TRUNCATE TABLE "patient_profiles" RESTART IDENTITY CASCADE;`);
        await AppDataSource.query(`TRUNCATE TABLE "nutritionist_profiles" RESTART IDENTITY CASCADE;`);
        await AppDataSource.query(`TRUNCATE TABLE "foods" RESTART IDENTITY CASCADE;`);
        await AppDataSource.query(`TRUNCATE TABLE "users" RESTART IDENTITY CASCADE;`);
        await AppDataSource.query(`TRUNCATE TABLE "roles" RESTART IDENTITY CASCADE;`);

        // Sembrar roles
        const roleRepository = AppDataSource.getRepository(Role);
        const rolesToSeed = [RoleName.PATIENT, RoleName.NUTRITIONIST, RoleName.ADMIN];
        for (const roleName of rolesToSeed) {
            let role = await roleRepository.findOneBy({ name: roleName });
            if (!role) {
                role = roleRepository.create({ name: roleName });
                await roleRepository.save(role);
            }
        }

        // Registrar y loguear Nutriólogo
        const nutriRegRes = await request(app)
            .post('/api/auth/register/nutritionist')
            .send(nutritionistCredentials);
        expect([200, 201]).toContain(nutriRegRes.statusCode);
        nutritionistToken = nutriRegRes.body.data.token;
        nutritionistId = nutriRegRes.body.data.user.id;

        // Registrar y loguear Paciente
        const patientRegRes = await request(app)
            .post('/api/auth/register/patient')
            .send(patientCredentials);
        expect([200, 201]).toContain(patientRegRes.statusCode);
        patientToken = patientRegRes.body.data.token;
        patientId = patientRegRes.body.data.user.id;

        // Establecer relación activa
        const relationReqRes = await request(app)
            .post('/api/relations/request')
            .set('Authorization', `Bearer ${patientToken}`)
            .send({ nutritionistId: nutritionistId });
        expect([200, 201]).toContain(relationReqRes.statusCode);
        const relationId = relationReqRes.body.data.relation.id;

        const relationAcceptRes = await request(app)
            .patch(`/api/relations/${relationId}/status`)
            .set('Authorization', `Bearer ${nutritionistToken}`)
            .send({ status: RelationshipStatus.ACTIVE });
        expect([200, 201]).toContain(relationAcceptRes.statusCode);

        // Crear algunos alimentos para usar en los planes
        const foodRepository = AppDataSource.getRepository(Food);
        const food1 = foodRepository.create({
            name: 'Manzana', calories: 95, protein: 0.5, carbohydrates: 25, fats: 0.3, unit: 'unidad', serving_size: 1,
            created_by_user: await AppDataSource.getRepository(User).findOneBy({id: nutritionistId})
        });
        const food2 = foodRepository.create({
            name: 'Pechuga de Pollo', calories: 165, protein: 31, carbohydrates: 0, fats: 3.6, unit: 'gramos', serving_size: 100,
            created_by_user: await AppDataSource.getRepository(User).findOneBy({id: nutritionistId})
        });
        await foodRepository.save([food1, food2]);
        food1Id = food1.id;
        food2Id = food2.id;
    });

    afterAll(async () => {
        if (AppDataSource.isInitialized) {
            await AppDataSource.destroy();
        }
    });

    // --- Tests de Creación de Plan de Dieta ---
    it('should allow a nutritionist to create a diet plan for an active patient (POST /api/diet-plans)', async () => {
        const dietPlanData = {
            name: 'Plan de Inicio Semanal',
            patientId: patientId,
            startDate: new Date().toISOString().split('T')[0], // YYYY-MM-DD
            endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Una semana después
            status: DietPlanStatus.ACTIVE,
            dailyCaloriesTarget: 2000,
            meals: [
                {
                    name: 'Desayuno',
                    order: 1,
                    mealItems: [{ foodId: food1Id, quantity: 1 }],
                },
                {
                    name: 'Almuerzo',
                    order: 2,
                    mealItems: [{ foodId: food2Id, quantity: 150 }],
                },
            ],
        };

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
        createdDietPlanId = res.body.data.dietPlan.id;
    });

    it('should prevent a patient from creating a diet plan', async () => {
        const dietPlanData = { name: 'Plan Paciente', patientId: patientId, startDate: '2023-01-01', endDate: '2023-01-07', meals: [] };
        const res = await request(app)
            .post('/api/diet-plans')
            .set('Authorization', `Bearer ${patientToken}`)
            .send(dietPlanData);
        expect(res.statusCode).toBe(403); // Forbidden
    });

    it('should prevent creating a diet plan for a non-existent patient', async () => {
        const nonExistentPatientId = '00000000-0000-0000-0000-000000000000';
        const dietPlanData = { name: 'Plan Fantasma', patientId: nonExistentPatientId, startDate: '2023-01-01', endDate: '2023-01-07', meals: [] };
        const res = await request(app)
            .post('/api/diet-plans')
            .set('Authorization', `Bearer ${nutritionistToken}`)
            .send(dietPlanData);
        expect(res.statusCode).toBe(404); // Not Found (patient)
    });

    it('should require essential fields for diet plan creation', async () => {
        const incompleteData = { name: 'Plan Incompleto' /* Faltan patientId, startDate, endDate, meals */ };
        const res = await request(app)
            .post('/api/diet-plans')
            .set('Authorization', `Bearer ${nutritionistToken}`)
            .send(incompleteData);
        expect(res.statusCode).toBe(400); // Bad Request
    });

    // --- Tests de Obtención de Planes de Dieta ---
    it('should allow a patient to get their own diet plans (GET /api/diet-plans/patient/:patientId)', async () => {
        const res = await request(app)
            .get(`/api/diet-plans/patient/${patientId}`)
            .set('Authorization', `Bearer ${patientToken}`);

        expect(res.statusCode).toBe(200);
        expect(res.body.status).toBe('success');
        expect(Array.isArray(res.body.data.dietPlans)).toBe(true);
        expect(res.body.data.dietPlans.length).toBeGreaterThan(0);
        expect(res.body.data.dietPlans[0].id).toBe(createdDietPlanId);
    });

    it('should allow a linked nutritionist to get a patient\'s diet plans (GET /api/diet-plans/patient/:patientId)', async () => {
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
            .send({ email: 'other.nutri.diet@example.com', password: 'Password123!', firstName: 'Other', lastName: 'Nutri' });
        const otherNutriToken = otherNutriRes.body.data.token;

        const res = await request(app)
            .get(`/api/diet-plans/patient/${patientId}`)
            .set('Authorization', `Bearer ${otherNutriToken}`);
        expect(res.statusCode).toBe(403); // Forbidden
    });

    it('should allow a patient to get a specific diet plan by ID (GET /api/diet-plans/:id)', async () => {
        const res = await request(app)
            .get(`/api/diet-plans/${createdDietPlanId}`)
            .set('Authorization', `Bearer ${patientToken}`);

        expect(res.statusCode).toBe(200);
        expect(res.body.status).toBe('success');
        expect(res.body.data.dietPlan.id).toBe(createdDietPlanId);
        expect(res.body.data.dietPlan.patient.id).toBe(patientId);
    });

    it('should allow a linked nutritionist to get a specific diet plan by ID (GET /api/diet-plans/:id)', async () => {
        const res = await request(app)
            .get(`/api/diet-plans/${createdDietPlanId}`)
            .set('Authorization', `Bearer ${nutritionistToken}`);

        expect(res.statusCode).toBe(200);
        expect(res.body.status).toBe('success');
        expect(res.body.data.dietPlan.id).toBe(createdDietPlanId);
    });

    it('should return 404 for a non-existent diet plan ID', async () => {
        const nonExistentPlanId = '00000000-0000-0000-0000-000000000000';
        const res = await request(app)
            .get(`/api/diet-plans/${nonExistentPlanId}`)
            .set('Authorization', `Bearer ${nutritionistToken}`);
        expect(res.statusCode).toBe(404);
    });

    // --- Tests de Actualización de Plan de Dieta ---
    it('should allow the creating nutritionist to update a diet plan (PATCH /api/diet-plans/:id)', async () => {
        const updatedData = {
            name: 'Plan de Inicio Semanal (Actualizado)',
            notes: 'Añadidas algunas notas.',
            status: DietPlanStatus.ACTIVE,
            dailyCaloriesTarget: 2100,
            meals: [ // Se puede enviar el array completo de comidas para actualizar
                {
                    name: 'Desayuno Actualizado',
                    order: 1,
                    mealItems: [{ foodId: food1Id, quantity: 2 }], // Cambió la cantidad
                },
                {
                    name: 'Almuerzo', // Se mantiene
                    order: 2,
                    mealItems: [{ foodId: food2Id, quantity: 150 }],
                },
                { // Nueva comida
                    name: 'Cena Ligera',
                    order: 3,
                    mealItems: [{ foodId: food1Id, quantity: 1 }],
                }
            ]
        };

        const res = await request(app)
            .patch(`/api/diet-plans/${createdDietPlanId}`)
            .set('Authorization', `Bearer ${nutritionistToken}`)
            .send(updatedData);

        expect(res.statusCode).toBe(200);
        expect(res.body.status).toBe('success');
        expect(res.body.data.dietPlan.name).toBe(updatedData.name);
        expect(res.body.data.dietPlan.notes).toBe(updatedData.notes);
        expect(res.body.data.dietPlan.daily_calories_target).toBe(updatedData.dailyCaloriesTarget.toString()); // TypeORM puede devolver decimal como string
        expect(res.body.data.dietPlan.meals.length).toBe(3);
        
        const breakfast = res.body.data.dietPlan.meals.find((m:any) => m.name === 'Desayuno Actualizado');
        expect(breakfast).toBeDefined();
        expect(breakfast.meal_items[0].quantity).toBe("2.00"); // TypeORM puede devolver decimal como string
    });

    it('should prevent a patient from updating a diet plan', async () => {
        const res = await request(app)
            .patch(`/api/diet-plans/${createdDietPlanId}`)
            .set('Authorization', `Bearer ${patientToken}`)
            .send({ name: 'Intento de Paciente' });
        expect(res.statusCode).toBe(403);
    });

    it('should prevent an unlinked nutritionist from updating a diet plan', async () => {
        const otherNutriRes = await request(app)
            .post('/api/auth/register/nutritionist')
            .send({ email: 'other.nutri.diet2@example.com', password: 'Password123!', firstName: 'Another', lastName: 'Nutri' });
        const otherNutriToken = otherNutriRes.body.data.token;

        const res = await request(app)
            .patch(`/api/diet-plans/${createdDietPlanId}`)
            .set('Authorization', `Bearer ${otherNutriToken}`)
            .send({ name: 'Intento de Otro Nutri' });
        expect(res.statusCode).toBe(403);
    });

    // --- Tests de Eliminación de Plan de Dieta ---
    it('should prevent a patient from deleting a diet plan', async () => {
        const res = await request(app)
            .delete(`/api/diet-plans/${createdDietPlanId}`)
            .set('Authorization', `Bearer ${patientToken}`);
        expect(res.statusCode).toBe(403);
    });

    it('should prevent an unlinked nutritionist from deleting a diet plan', async () => {
        const otherNutriRes = await request(app)
            .post('/api/auth/register/nutritionist')
            .send({ email: 'other.nutri.diet3@example.com', password: 'Password123!', firstName: 'YetAnother', lastName: 'Nutri' });
        const otherNutriToken = otherNutriRes.body.data.token;

        const res = await request(app)
            .delete(`/api/diet-plans/${createdDietPlanId}`)
            .set('Authorization', `Bearer ${otherNutriToken}`);
        expect(res.statusCode).toBe(403);
    });

    it('should allow the creating nutritionist to delete a diet plan (DELETE /api/diet-plans/:id)', async () => {
        const res = await request(app)
            .delete(`/api/diet-plans/${createdDietPlanId}`)
            .set('Authorization', `Bearer ${nutritionistToken}`);

        expect(res.statusCode).toBe(204); // No Content

        // Verificar que ya no se puede obtener
        const getRes = await request(app)
            .get(`/api/diet-plans/${createdDietPlanId}`)
            .set('Authorization', `Bearer ${nutritionistToken}`);
        expect(getRes.statusCode).toBe(404);
    });

    it('should return 404 when trying to delete a non-existent diet plan', async () => {
        const nonExistentPlanId = '00000000-0000-0000-0000-000000000000';
        const res = await request(app)
            .delete(`/api/diet-plans/${nonExistentPlanId}`)
            .set('Authorization', `Bearer ${nutritionistToken}`);
        expect(res.statusCode).toBe(404);
    });
});