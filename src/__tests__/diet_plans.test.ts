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
import { PatientProfile } from '@/database/entities/patient_profile.entity'; // Importado para limpieza
import { NutritionistProfile } from '@/database/entities/nutritionist_profile.entity'; // Importado para limpieza
import app from '@/app';

// Variables para almacenar tokens y IDs entre tests
let nutritionistToken: string;
let nutritionistId: string;
let patientToken: string;
let patientId: string;
let relationId: string;
let foodId: string;
let dietPlanId: string;

// Datos de prueba
const nutritionistCredentials = {
    email: 'nutriologo.test@example.com',
    password: 'Password123!',
    firstName: 'Test',
    lastName: 'Nutri',
};

const patientCredentials = {
    email: 'paciente.test@example.com',
    password: 'Password123!',
    firstName: 'Test',
    lastName: 'Paci',
    age: 25,
    gender: 'female',
};

const foodData = {
    name: 'Pechuga de Pollo',
    description: 'Carne magra de pollo',
    calories: 165,
    protein: 31,
    carbohydrates: 0,
    fats: 3.6,
    fiber: 0,
    sugar: 0,
    unit: 'g',
    servingSize: 100,
    category: 'Proteínas',
};

describe('Diet Plans API Flow', () => {
    // Aumentar el timeout global de Jest para beforeAll/afterAll si la configuración de BD es lenta
    jest.setTimeout(40000); // 40 segundos

    beforeAll(async () => {
        // Inicializar la base de datos para las pruebas
        if (!AppDataSource.isInitialized) {
            await AppDataSource.initialize();
        }

        // LIMPIAR TODAS LAS TABLAS EN EL ORDEN INVERSO DE SUS DEPENDENCIAS DE CLAVE FORÁNEA
        // Usando TRUNCATE CASCADE para asegurar un estado limpio y borrar dependencias.
        // El orden es importante para que CASCADE funcione en cascada y evite errores de FK.
        await AppDataSource.query(`TRUNCATE TABLE "meal_items" RESTART IDENTITY CASCADE;`);
        await AppDataSource.query(`TRUNCATE TABLE "meals" RESTART IDENTITY CASCADE;`);
        await AppDataSource.query(`TRUNCATE TABLE "diet_plans" RESTART IDENTITY CASCADE;`);
        await AppDataSource.query(`TRUNCATE TABLE "patient_nutritionist_relations" RESTART IDENTITY CASCADE;`);
        await AppDataSource.query(`TRUNCATE TABLE "patient_profiles" RESTART IDENTITY CASCADE;`);
        await AppDataSource.query(`TRUNCATE TABLE "nutritionist_profiles" RESTART IDENTITY CASCADE;`);
        await AppDataSource.query(`TRUNCATE TABLE "foods" RESTART IDENTITY CASCADE;`);
        await AppDataSource.query(`TRUNCATE TABLE "users" RESTART IDENTITY CASCADE;`);
        await AppDataSource.query(`TRUNCATE TABLE "roles" RESTART IDENTITY CASCADE;`);

        // Resembrar roles después de limpiarlos, ya que son la base para User
        const roleRepository = AppDataSource.getRepository(Role);
        const rolesToSeed = [RoleName.PATIENT, RoleName.NUTRITIONIST, RoleName.ADMIN];
        for (const roleName of rolesToSeed) {
            let role = await roleRepository.findOneBy({ name: roleName });
            if (!role) {
                role = roleRepository.create({ name: roleName });
                await roleRepository.save(role);
            }
        }

        // 1. Registrar y loguear Nutriólogo
        const nutriRegRes = await request(app)
            .post('/api/auth/register/nutritionist')
            .send(nutritionistCredentials);
        expect(nutriRegRes.statusCode).toBe(201);
        nutritionistToken = nutriRegRes.body.data.token;
        nutritionistId = nutriRegRes.body.data.user.id;

        // **IMPORTANTE**: Asegurar que el perfil del nutriólogo se crea/inicializa
        // Al hacer un GET a su propio perfil, el servicio lo crea si no existe
        const nutriProfileRes = await request(app)
            .get('/api/nutritionists/me/profile')
            .set('Authorization', `Bearer ${nutritionistToken}`);
        expect(nutriProfileRes.statusCode).toBe(200);

        // 2. Registrar y loguear Paciente
        const patientRegRes = await request(app)
            .post('/api/auth/register/patient')
            .send(patientCredentials);
        expect(patientRegRes.statusCode).toBe(201);
        patientToken = patientRegRes.body.data.token;
        patientId = patientRegRes.body.data.user.id;

        // **IMPORTANTE**: Asegurar que el perfil del paciente se crea/inicializa
        // Al hacer un GET a su propio perfil, el servicio lo crea si no existe
        const patientProfileRes = await request(app)
            .get('/api/patients/me/profile')
            .set('Authorization', `Bearer ${patientToken}`);
        expect(patientProfileRes.statusCode).toBe(200);


        // 3. Establecer relación activa entre Paciente y Nutriólogo
        const relationReqRes = await request(app)
            .post('/api/relations/request')
            .set('Authorization', `Bearer ${patientToken}`)
            .send({ nutritionistId: nutritionistId });
        expect(relationReqRes.statusCode).toBe(201);
        relationId = relationReqRes.body.data.relation.id;

        const relationAcceptRes = await request(app)
            .patch(`/api/relations/${relationId}/status`)
            .set('Authorization', `Bearer ${nutritionistToken}`)
            .send({ status: RelationshipStatus.ACTIVE });
        expect(relationAcceptRes.statusCode).toBe(200);

        // 4. Crear un alimento (necesario para que la IA genere planes con items reales)
        const foodRes = await request(app)
            .post('/api/foods')
            .set('Authorization', `Bearer ${nutritionistToken}`)
            .send(foodData);
        expect(foodRes.statusCode).toBe(201);
        foodId = foodRes.body.data.food.id;
    });

    afterAll(async () => {
        // Cerrar la conexión a la base de datos después de todas las pruebas
        if (AppDataSource.isInitialized) {
            await AppDataSource.destroy();
        }
    });


    it('should generate a diet plan with AI for a patient (POST /api/diet-plans/generate-ai)', async () => {
        const res = await request(app)
            .post('/api/diet-plans/generate-ai')
            .set('Authorization', `Bearer ${nutritionistToken}`)
            .send({
                patientId: patientId,
                name: 'Plan IA: Pérdida de Peso - Semana 1',
                startDate: '2025-06-10',
                endDate: '2025-06-16',
                notesForAI: 'Paciente con alergia a cacahuetes, objetivo de 1800 calorías.',
            });

        expect(res.statusCode).toBe(201);
        expect(res.body.status).toBe('success');
        expect(res.body.data.dietPlan).toBeDefined();
        expect(res.body.data.dietPlan.generated_by_ia).toBe(true);
        expect(res.body.data.dietPlan.status).toBe(DietPlanStatus.PENDING_REVIEW);
        expect(res.body.data.dietPlan.meals).toBeInstanceOf(Array);
        expect(res.body.data.dietPlan.meals.length).toBeGreaterThan(0);
        
        dietPlanId = res.body.data.dietPlan.id; // Guardar el ID del plan de dieta
    });

    it('should allow nutritionist to get a diet plan by ID (GET /api/diet-plans/:id)', async () => {
        const res = await request(app)
            .get(`/api/diet-plans/${dietPlanId}`)
            .set('Authorization', `Bearer ${nutritionistToken}`);

        expect(res.statusCode).toBe(200);
        expect(res.body.status).toBe('success');
        expect(res.body.data.dietPlan).toBeDefined();
        expect(res.body.data.dietPlan.id).toBe(dietPlanId);
        expect(res.body.data.dietPlan.nutritionist.id).toBe(nutritionistId);
        expect(res.body.data.dietPlan.patient.id).toBe(patientId);
        expect(res.body.data.dietPlan.meals).toBeInstanceOf(Array);
        expect(res.body.data.dietPlan.meals.length).toBeGreaterThan(0);
        expect(res.body.data.dietPlan.meals[0].meal_items).toBeInstanceOf(Array);
        expect(res.body.data.dietPlan.meals[0].meal_items.length).toBeGreaterThan(0);
        expect(res.body.data.dietPlan.meals[0].meal_items[0].food).toBeDefined();
    });

    it('should allow patient to get their diet plan by ID (GET /api/diet-plans/:id)', async () => {
        const res = await request(app)
            .get(`/api/diet-plans/${dietPlanId}`)
            .set('Authorization', `Bearer ${patientToken}`);

        expect(res.statusCode).toBe(200);
        expect(res.body.status).toBe('success');
        expect(res.body.data.dietPlan).toBeDefined();
        expect(res.body.data.dietPlan.id).toBe(dietPlanId);
        expect(res.body.data.dietPlan.patient.id).toBe(patientId);
    });

    it('should prevent unauthorized users (non-related patient) from getting a diet plan', async () => {
        // Crear un paciente no relacionado para esta prueba
        const unrelatedPatientCredentials = { email: 'unrelated.paci@example.com', password: 'Password123!', firstName: 'Unrelated', lastName: 'Patient' };
        const unrelatedPatientRegRes = await request(app)
            .post('/api/auth/register/patient')
            .send(unrelatedPatientCredentials);
        expect(unrelatedPatientRegRes.statusCode).toBe(201);
        const unrelatedPatientToken = unrelatedPatientRegRes.body.data.token;

        const res = await request(app)
            .get(`/api/diet-plans/${dietPlanId}`)
            .set('Authorization', `Bearer ${unrelatedPatientToken}`);

        expect(res.statusCode).toBe(403); // Acceso denegado
    });

    it('should allow nutritionist to update a diet plan (PATCH /api/diet-plans/:id)', async () => {
        const res = await request(app)
            .patch(`/api/diet-plans/${dietPlanId}`)
            .set('Authorization', `Bearer ${nutritionistToken}`)
            .send({
                name: 'Plan IA: Pérdida de Peso - Revisado',
                notes: 'Plan inicial ajustado tras primera consulta.',
                dailyCaloriesTarget: 1800, // Añadir campos de ejemplo
            });

        expect(res.statusCode).toBe(200);
        expect(res.body.status).toBe('success');
        expect(res.body.data.dietPlan.id).toBe(dietPlanId);
        expect(res.body.data.dietPlan.name).toBe('Plan IA: Pérdida de Peso - Revisado');
        expect(res.body.data.dietPlan.notes).toBe('Plan inicial ajustado tras primera consulta.');
        expect(res.body.data.dietPlan.daily_calories_target).toBe(1800); // Verificar el campo numérico
    });

    it('should allow nutritionist to update diet plan status to ACTIVE (PATCH /api/diet-plans/:id/status)', async () => {
        const res = await request(app)
            .patch(`/api/diet-plans/${dietPlanId}/status`)
            .set('Authorization', `Bearer ${nutritionistToken}`)
            .send({
                status: DietPlanStatus.ACTIVE,
            });

        expect(res.statusCode).toBe(200);
        expect(res.body.status).toBe('success');
        expect(res.body.data.dietPlan.id).toBe(dietPlanId);
        expect(res.body.data.dietPlan.status).toBe(DietPlanStatus.ACTIVE);
    });

    it('should prevent deletion of an active diet plan', async () => {
        const res = await request(app)
            .delete(`/api/diet-plans/${dietPlanId}`)
            .set('Authorization', `Bearer ${nutritionistToken}`);
        
        expect(res.statusCode).toBe(400); // Bad Request por intentar borrar activo
        expect(res.body.message).toContain('No se puede eliminar un plan de dieta activo.');
    });

    it('should allow nutritionist to update diet plan status to ARCHIVED then delete it (PATCH /api/diet-plans/:id/status & DELETE /api/diet-plans/:id)', async () => {
        // Primero, archivar el plan
        const archiveRes = await request(app)
            .patch(`/api/diet-plans/${dietPlanId}/status`)
            .set('Authorization', `Bearer ${nutritionistToken}`)
            .send({
                status: DietPlanStatus.ARCHIVED,
            });
        expect(archiveRes.statusCode).toBe(200);
        expect(archiveRes.body.data.dietPlan.status).toBe(DietPlanStatus.ARCHIVED);

        // Luego, eliminar el plan archivado
        const deleteRes = await request(app)
            .delete(`/api/diet-plans/${dietPlanId}`)
            .set('Authorization', `Bearer ${nutritionistToken}`);
        
        expect(deleteRes.statusCode).toBe(204); // No Content para eliminación exitosa

        // Verificar que el plan ya no existe
        const getRes = await request(app)
            .get(`/api/diet-plans/${dietPlanId}`)
            .set('Authorization', `Bearer ${nutritionistToken}`);
        expect(getRes.statusCode).toBe(404); // No encontrado
    });

    it('should prevent patients from creating diet plans', async () => {
        const res = await request(app)
            .post('/api/diet-plans')
            .set('Authorization', `Bearer ${patientToken}`)
            .send({
                patientId: patientId,
                name: 'Plan Paciente - Invalido',
                startDate: '2025-07-01',
                endDate: '2025-07-07',
            });
        expect(res.statusCode).toBe(403); // Prohibido
    });
});