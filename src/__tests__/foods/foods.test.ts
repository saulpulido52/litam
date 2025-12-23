import request from 'supertest';
import { AppDataSource } from '../database/data-source';
import { User } from '../database/entities/user.entity';
import { Role, RoleName } from '../database/entities/role.entity';
import { Food } from '../database/entities/food.entity';
import app from '../app';
import { setupTestEnvironment, cleanupTestEnvironment } from '../setup-test-environment';

function uniqueEmail(prefix: string) {
    return `${prefix}.${Date.now()}.${Math.floor(Math.random()*1000000)}@example.com`;
}

describe('Foods API (/api/foods)', () => {
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
                lastName: 'Foods'
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

    function registerAdmin() {
        const email = uniqueEmail('admin');
        return request(app)
            .post('/api/auth/register/admin')
            .send({
                email,
                password: 'Password123!',
                firstName: 'Admin',
                lastName: 'Foods'
            });
    }

    // --- Tests de Obtención de Alimentos ---
    describe('GET /api/foods', () => {
        it('should allow anyone to get all foods', async () => {
            const res = await request(app)
                .get('/api/foods');

            expect(res.statusCode).toBe(200);
            expect(res.body.status).toBe('success');
            expect(Array.isArray(res.body.data.foods)).toBe(true);
            expect(typeof res.body.results).toBe('number');
        });

        it('should return empty array when no foods exist', async () => {
            // Limpiar alimentos existentes
            await AppDataSource.getRepository(Food).clear();

            const res = await request(app)
                .get('/api/foods');

            expect(res.statusCode).toBe(200);
            expect(res.body.status).toBe('success');
            expect(res.body.data.foods).toEqual([]);
            expect(res.body.results).toBe(0);
        });

        it('should return foods with creator information when available', async () => {
            // Crear un nutriólogo y un alimento
            const nutriRes = await registerNutritionist();
            const nutritionistToken = nutriRes.body.data.token;
            const nutritionistId = nutriRes.body.data.user.id;

            const foodData = {
                name: 'Avena',
                description: 'Avena integral rica en fibra',
                calories: 389,
                protein: 16.9,
                carbohydrates: 66.3,
                fats: 6.9,
                fiber: 10.6,
                unit: 'gramos',
                servingSize: 100,
                category: 'Cereales'
            };

            await request(app)
                .post('/api/foods')
                .set('Authorization', `Bearer ${nutritionistToken}`)
                .send(foodData);

            const res = await request(app)
                .get('/api/foods');

            expect(res.statusCode).toBe(200);
            expect(res.body.data.foods.length).toBeGreaterThan(0);
            
            const food = res.body.data.foods.find((f: any) => f.name === 'Avena');
            expect(food).toBeDefined();
            expect(food.created_by_user).toBeDefined();
            expect(food.created_by_user.id).toBe(nutritionistId);
            expect(food.created_by_user.password_hash).toBeUndefined(); // No debe incluir password
        });
    });

    describe('GET /api/foods/:id', () => {
        it('should allow anyone to get a specific food by ID', async () => {
            // Crear un alimento primero
            const nutriRes = await registerNutritionist();
            const nutritionistToken = nutriRes.body.data.token;

            const foodData = {
                name: 'Pollo',
                description: 'Pechuga de pollo',
                calories: 165,
                protein: 31,
                carbohydrates: 0,
                fats: 3.6,
                unit: 'gramos',
                servingSize: 100,
                category: 'Proteínas'
            };

            const createRes = await request(app)
                .post('/api/foods')
                .set('Authorization', `Bearer ${nutritionistToken}`)
                .send(foodData);

            expect(createRes.statusCode).toBe(201);
            const foodId = createRes.body.data.food.id;

            // Obtener el alimento por ID
            const res = await request(app)
                .get(`/api/foods/${foodId}`);

            expect(res.statusCode).toBe(200);
            expect(res.body.status).toBe('success');
            expect(res.body.data.food).toBeDefined();
            expect(res.body.data.food.id).toBe(foodId);
            expect(res.body.data.food.name).toBe('Pollo');
        });

        it('should return 404 for non-existent food ID', async () => {
            const nonExistentId = '00000000-0000-0000-0000-000000000000';
            
            const res = await request(app)
                .get(`/api/foods/${nonExistentId}`);

            expect(res.statusCode).toBe(404);
        });

        it('should return 400 for invalid UUID format', async () => {
            const invalidId = 'invalid-uuid';
            
            const res = await request(app)
                .get(`/api/foods/${invalidId}`);

            expect(res.statusCode).toBe(400);
        });
    });

    // --- Tests de Creación de Alimentos ---
    describe('POST /api/foods', () => {
        it('should allow nutritionist to create a food', async () => {
            const nutriRes = await registerNutritionist();
            const nutritionistToken = nutriRes.body.data.token;

            const foodData = {
                name: 'Salmón',
                description: 'Salmón rico en omega-3',
                calories: 208,
                protein: 25,
                carbohydrates: 0,
                fats: 12,
                fiber: 0,
                sugar: 0,
                unit: 'gramos',
                servingSize: 100,
                category: 'Pescados'
            };

            const res = await request(app)
                .post('/api/foods')
                .set('Authorization', `Bearer ${nutritionistToken}`)
                .send(foodData);

            expect(res.statusCode).toBe(201);
            expect(res.body.status).toBe('success');
            expect(res.body.data.food).toBeDefined();
            expect(res.body.data.food.name).toBe(foodData.name);
            expect(res.body.data.food.calories).toBe(foodData.calories);
            expect(res.body.data.food.is_custom).toBe(true);
            expect(res.body.data.food.created_by_user).toBeDefined();
        });

        it('should allow admin to create a food', async () => {
            const adminRes = await registerAdmin();
            const adminToken = adminRes.body.data.token;

            const foodData = {
                name: 'Quinoa',
                description: 'Quinoa integral',
                calories: 120,
                protein: 4.4,
                carbohydrates: 22,
                fats: 1.9,
                fiber: 2.8,
                unit: 'gramos',
                servingSize: 100,
                category: 'Granos'
            };

            const res = await request(app)
                .post('/api/foods')
                .set('Authorization', `Bearer ${adminToken}`)
                .send(foodData);

            expect(res.statusCode).toBe(201);
            expect(res.body.status).toBe('success');
            expect(res.body.data.food).toBeDefined();
            expect(res.body.data.food.name).toBe(foodData.name);
        });

        it('should prevent patient from creating a food', async () => {
            const patientRes = await registerPatient();
            const patientToken = patientRes.body.data.token;

            const foodData = {
                name: 'Manzana',
                description: 'Manzana roja',
                calories: 52,
                protein: 0.3,
                carbohydrates: 14,
                fats: 0.2,
                unit: 'gramos',
                servingSize: 100,
                category: 'Frutas'
            };

            const res = await request(app)
                .post('/api/foods')
                .set('Authorization', `Bearer ${patientToken}`)
                .send(foodData);

            expect(res.statusCode).toBe(403);
        });

        it('should prevent unauthenticated user from creating a food', async () => {
            const foodData = {
                name: 'Plátano',
                description: 'Plátano amarillo',
                calories: 89,
                protein: 1.1,
                carbohydrates: 23,
                fats: 0.3,
                unit: 'gramos',
                servingSize: 100,
                category: 'Frutas'
            };

            const res = await request(app)
                .post('/api/foods')
                .send(foodData);

            expect(res.statusCode).toBe(401);
        });

        it('should validate required fields for food creation', async () => {
            const nutriRes = await registerNutritionist();
            const nutritionistToken = nutriRes.body.data.token;

            // Datos incompletos
            const incompleteData = {
                name: 'Alimento Incompleto'
                // Faltan campos requeridos
            };

            const res = await request(app)
                .post('/api/foods')
                .set('Authorization', `Bearer ${nutritionistToken}`)
                .send(incompleteData);

            expect(res.statusCode).toBe(400);
        });

        it('should validate numeric constraints for food creation', async () => {
            const nutriRes = await registerNutritionist();
            const nutritionistToken = nutriRes.body.data.token;

            // Datos con valores inválidos
            const invalidData = {
                name: 'Alimento Inválido',
                description: 'Alimento con valores inválidos',
                calories: -100, // Calorías negativas
                protein: 1500, // Proteína muy alta
                carbohydrates: -50, // Carbohidratos negativos
                fats: 2000, // Grasas muy altas
                unit: 'gramos',
                servingSize: 0, // Tamaño de porción inválido
                category: 'Test'
            };

            const res = await request(app)
                .post('/api/foods')
                .set('Authorization', `Bearer ${nutritionistToken}`)
                .send(invalidData);

            expect(res.statusCode).toBe(400);
        });

        it('should validate string length constraints', async () => {
            const nutriRes = await registerNutritionist();
            const nutritionistToken = nutriRes.body.data.token;

            // Nombre muy corto
            const shortNameData = {
                name: 'A', // Muy corto
                calories: 100,
                protein: 10,
                carbohydrates: 20,
                fats: 5,
                unit: 'gramos',
                servingSize: 100
            };

            const res1 = await request(app)
                .post('/api/foods')
                .set('Authorization', `Bearer ${nutritionistToken}`)
                .send(shortNameData);

            expect(res1.statusCode).toBe(400);

            // Descripción muy larga
            const longDescData = {
                name: 'Alimento Normal',
                description: 'A'.repeat(1001), // Muy larga
                calories: 100,
                protein: 10,
                carbohydrates: 20,
                fats: 5,
                unit: 'gramos',
                servingSize: 100
            };

            const res2 = await request(app)
                .post('/api/foods')
                .set('Authorization', `Bearer ${nutritionistToken}`)
                .send(longDescData);

            expect(res2.statusCode).toBe(400);
        });
    });

    // --- Tests de Actualización de Alimentos ---
    describe('PATCH /api/foods/:id', () => {
        it('should allow nutritionist to update their own food', async () => {
            // Crear un nutriólogo y un alimento
            const nutriRes = await registerNutritionist();
            const nutritionistToken = nutriRes.body.data.token;

            const foodData = {
                name: 'Arroz',
                description: 'Arroz blanco',
                calories: 130,
                protein: 2.7,
                carbohydrates: 28,
                fats: 0.3,
                unit: 'gramos',
                servingSize: 100,
                category: 'Granos'
            };

            const createRes = await request(app)
                .post('/api/foods')
                .set('Authorization', `Bearer ${nutritionistToken}`)
                .send(foodData);

            expect(createRes.statusCode).toBe(201);
            const foodId = createRes.body.data.food.id;

            // Actualizar el alimento
            const updateData = {
                name: 'Arroz Integral',
                description: 'Arroz integral más saludable',
                calories: 111,
                protein: 2.6,
                fiber: 1.8
            };

            const res = await request(app)
                .patch(`/api/foods/${foodId}`)
                .set('Authorization', `Bearer ${nutritionistToken}`)
                .send(updateData);

            expect(res.statusCode).toBe(200);
            expect(res.body.status).toBe('success');
            expect(res.body.data.food.name).toBe(updateData.name);
            expect(res.body.data.food.description).toBe(updateData.description);
            expect(res.body.data.food.calories).toBe(updateData.calories);
            expect(res.body.data.food.fiber).toBe(updateData.fiber);
        });

        it('should allow admin to update any food', async () => {
            // Crear un nutriólogo y un alimento
            const nutriRes = await registerNutritionist();
            const nutritionistToken = nutriRes.body.data.token;

            const foodData = {
                name: 'Lechuga',
                description: 'Lechuga fresca',
                calories: 15,
                protein: 1.4,
                carbohydrates: 2.9,
                fats: 0.1,
                unit: 'gramos',
                servingSize: 100,
                category: 'Verduras'
            };

            const createRes = await request(app)
                .post('/api/foods')
                .set('Authorization', `Bearer ${nutritionistToken}`)
                .send(foodData);

            expect(createRes.statusCode).toBe(201);
            const foodId = createRes.body.data.food.id;

            // Crear admin y actualizar el alimento
            const adminRes = await registerAdmin();
            const adminToken = adminRes.body.data.token;

            const updateData = {
                name: 'Lechuga Romana',
                description: 'Lechuga romana más nutritiva',
                calories: 17,
                fiber: 1.2
            };

            const res = await request(app)
                .patch(`/api/foods/${foodId}`)
                .set('Authorization', `Bearer ${adminToken}`)
                .send(updateData);

            expect(res.statusCode).toBe(200);
            expect(res.body.data.food.name).toBe(updateData.name);
        });

        it('should prevent nutritionist from updating another nutritionist\'s food', async () => {
            // Crear primer nutriólogo y alimento
            const nutri1Res = await registerNutritionist();
            const nutri1Token = nutri1Res.body.data.token;

            const foodData = {
                name: 'Tomate',
                description: 'Tomate rojo',
                calories: 18,
                protein: 0.9,
                carbohydrates: 3.9,
                fats: 0.2,
                unit: 'gramos',
                servingSize: 100,
                category: 'Verduras'
            };

            const createRes = await request(app)
                .post('/api/foods')
                .set('Authorization', `Bearer ${nutri1Token}`)
                .send(foodData);

            expect(createRes.statusCode).toBe(201);
            const foodId = createRes.body.data.food.id;

            // Crear segundo nutriólogo e intentar actualizar
            const nutri2Res = await registerNutritionist();
            const nutri2Token = nutri2Res.body.data.token;

            const updateData = {
                name: 'Tomate Modificado'
            };

            const res = await request(app)
                .patch(`/api/foods/${foodId}`)
                .set('Authorization', `Bearer ${nutri2Token}`)
                .send(updateData);

            expect(res.statusCode).toBe(403);
        });

        it('should prevent patient from updating any food', async () => {
            // Crear nutriólogo y alimento
            const nutriRes = await registerNutritionist();
            const nutritionistToken = nutriRes.body.data.token;

            const foodData = {
                name: 'Zanahoria',
                description: 'Zanahoria naranja',
                calories: 41,
                protein: 0.9,
                carbohydrates: 10,
                fats: 0.2,
                unit: 'gramos',
                servingSize: 100,
                category: 'Verduras'
            };

            const createRes = await request(app)
                .post('/api/foods')
                .set('Authorization', `Bearer ${nutritionistToken}`)
                .send(foodData);

            expect(createRes.statusCode).toBe(201);
            const foodId = createRes.body.data.food.id;

            // Crear paciente e intentar actualizar
            const patientRes = await registerPatient();
            const patientToken = patientRes.body.data.token;

            const updateData = {
                name: 'Zanahoria Modificada'
            };

            const res = await request(app)
                .patch(`/api/foods/${foodId}`)
                .set('Authorization', `Bearer ${patientToken}`)
                .send(updateData);

            expect(res.statusCode).toBe(403);
        });

        it('should return 404 for non-existent food ID', async () => {
            const nutriRes = await registerNutritionist();
            const nutritionistToken = nutriRes.body.data.token;
            const nonExistentId = '00000000-0000-0000-0000-000000000000';

            const updateData = {
                name: 'Alimento Inexistente'
            };

            const res = await request(app)
                .patch(`/api/foods/${nonExistentId}`)
                .set('Authorization', `Bearer ${nutritionistToken}`)
                .send(updateData);

            expect(res.statusCode).toBe(404);
        });

        it('should validate update data constraints', async () => {
            // Crear nutriólogo y alimento
            const nutriRes = await registerNutritionist();
            const nutritionistToken = nutriRes.body.data.token;

            const foodData = {
                name: 'Espinaca',
                description: 'Espinaca fresca',
                calories: 23,
                protein: 2.9,
                carbohydrates: 3.6,
                fats: 0.4,
                unit: 'gramos',
                servingSize: 100,
                category: 'Verduras'
            };

            const createRes = await request(app)
                .post('/api/foods')
                .set('Authorization', `Bearer ${nutritionistToken}`)
                .send(foodData);

            expect(createRes.statusCode).toBe(201);
            const foodId = createRes.body.data.food.id;

            // Intentar actualizar con datos inválidos
            const invalidUpdateData = {
                calories: -50, // Calorías negativas
                protein: 2000 // Proteína muy alta
            };

            const res = await request(app)
                .patch(`/api/foods/${foodId}`)
                .set('Authorization', `Bearer ${nutritionistToken}`)
                .send(invalidUpdateData);

            expect(res.statusCode).toBe(400);
        });
    });

    // --- Tests de Eliminación de Alimentos ---
    describe('DELETE /api/foods/:id', () => {
        it('should allow nutritionist to delete their own food', async () => {
            // Crear nutriólogo y alimento
            const nutriRes = await registerNutritionist();
            const nutritionistToken = nutriRes.body.data.token;

            const foodData = {
                name: 'Brócoli',
                description: 'Brócoli verde',
                calories: 34,
                protein: 2.8,
                carbohydrates: 7,
                fats: 0.4,
                unit: 'gramos',
                servingSize: 100,
                category: 'Verduras'
            };

            const createRes = await request(app)
                .post('/api/foods')
                .set('Authorization', `Bearer ${nutritionistToken}`)
                .send(foodData);

            expect(createRes.statusCode).toBe(201);
            const foodId = createRes.body.data.food.id;

            // Eliminar el alimento
            const res = await request(app)
                .delete(`/api/foods/${foodId}`)
                .set('Authorization', `Bearer ${nutritionistToken}`);

            expect(res.statusCode).toBe(204);

            // Verificar que el alimento ya no existe
            const getRes = await request(app)
                .get(`/api/foods/${foodId}`);

            expect(getRes.statusCode).toBe(404);
        });

        it('should allow admin to delete any food', async () => {
            // Crear nutriólogo y alimento
            const nutriRes = await registerNutritionist();
            const nutritionistToken = nutriRes.body.data.token;

            const foodData = {
                name: 'Coliflor',
                description: 'Coliflor blanca',
                calories: 25,
                protein: 1.9,
                carbohydrates: 5,
                fats: 0.3,
                unit: 'gramos',
                servingSize: 100,
                category: 'Verduras'
            };

            const createRes = await request(app)
                .post('/api/foods')
                .set('Authorization', `Bearer ${nutritionistToken}`)
                .send(foodData);

            expect(createRes.statusCode).toBe(201);
            const foodId = createRes.body.data.food.id;

            // Crear admin y eliminar el alimento
            const adminRes = await registerAdmin();
            const adminToken = adminRes.body.data.token;

            const res = await request(app)
                .delete(`/api/foods/${foodId}`)
                .set('Authorization', `Bearer ${adminToken}`);

            expect(res.statusCode).toBe(204);
        });

        it('should prevent nutritionist from deleting another nutritionist\'s food', async () => {
            // Crear primer nutriólogo y alimento
            const nutri1Res = await registerNutritionist();
            const nutri1Token = nutri1Res.body.data.token;

            const foodData = {
                name: 'Pepino',
                description: 'Pepino fresco',
                calories: 16,
                protein: 0.7,
                carbohydrates: 3.6,
                fats: 0.1,
                unit: 'gramos',
                servingSize: 100,
                category: 'Verduras'
            };

            const createRes = await request(app)
                .post('/api/foods')
                .set('Authorization', `Bearer ${nutri1Token}`)
                .send(foodData);

            expect(createRes.statusCode).toBe(201);
            const foodId = createRes.body.data.food.id;

            // Crear segundo nutriólogo e intentar eliminar
            const nutri2Res = await registerNutritionist();
            const nutri2Token = nutri2Res.body.data.token;

            const res = await request(app)
                .delete(`/api/foods/${foodId}`)
                .set('Authorization', `Bearer ${nutri2Token}`);

            expect(res.statusCode).toBe(403);
        });

        it('should prevent patient from deleting any food', async () => {
            // Crear nutriólogo y alimento
            const nutriRes = await registerNutritionist();
            const nutritionistToken = nutriRes.body.data.token;

            const foodData = {
                name: 'Apio',
                description: 'Apio verde',
                calories: 16,
                protein: 0.7,
                carbohydrates: 3,
                fats: 0.2,
                unit: 'gramos',
                servingSize: 100,
                category: 'Verduras'
            };

            const createRes = await request(app)
                .post('/api/foods')
                .set('Authorization', `Bearer ${nutritionistToken}`)
                .send(foodData);

            expect(createRes.statusCode).toBe(201);
            const foodId = createRes.body.data.food.id;

            // Crear paciente e intentar eliminar
            const patientRes = await registerPatient();
            const patientToken = patientRes.body.data.token;

            const res = await request(app)
                .delete(`/api/foods/${foodId}`)
                .set('Authorization', `Bearer ${patientToken}`);

            expect(res.statusCode).toBe(403);
        });

        it('should return 404 for non-existent food ID', async () => {
            const nutriRes = await registerNutritionist();
            const nutritionistToken = nutriRes.body.data.token;
            const nonExistentId = '00000000-0000-0000-0000-000000000000';

            const res = await request(app)
                .delete(`/api/foods/${nonExistentId}`)
                .set('Authorization', `Bearer ${nutritionistToken}`);

            expect(res.statusCode).toBe(404);
        });
    });

    // --- Tests de Edge Cases y Validaciones Adicionales ---
    describe('Edge Cases and Additional Validations', () => {
        it('should handle foods with maximum allowed values', async () => {
            const nutriRes = await registerNutritionist();
            const nutritionistToken = nutriRes.body.data.token;

            const maxValuesData = {
                name: 'Alimento Máximo',
                description: 'A'.repeat(1000), // Máxima longitud
                calories: 10000, // Máximo permitido
                protein: 1000, // Máximo permitido
                carbohydrates: 1000, // Máximo permitido
                fats: 1000, // Máximo permitido
                fiber: 1000,
                sugar: 1000,
                unit: 'A'.repeat(50), // Máxima longitud
                servingSize: 999999.99,
                category: 'A'.repeat(100) // Máxima longitud
            };

            const res = await request(app)
                .post('/api/foods')
                .set('Authorization', `Bearer ${nutritionistToken}`)
                .send(maxValuesData);

            expect(res.statusCode).toBe(201);
            expect(res.body.data.food.name).toBe(maxValuesData.name);
        });

        it('should handle foods with minimum required values', async () => {
            const nutriRes = await registerNutritionist();
            const nutritionistToken = nutriRes.body.data.token;

            const minValuesData = {
                name: 'AB', // Mínima longitud
                calories: 0, // Mínimo permitido
                protein: 0, // Mínimo permitido
                carbohydrates: 0, // Mínimo permitido
                fats: 0, // Mínimo permitido
                unit: 'A', // Mínima longitud
                servingSize: 0.01 // Mínimo permitido
            };

            const res = await request(app)
                .post('/api/foods')
                .set('Authorization', `Bearer ${nutritionistToken}`)
                .send(minValuesData);

            expect(res.statusCode).toBe(201);
            expect(res.body.data.food.name).toBe(minValuesData.name);
        });

        it('should handle concurrent food creation gracefully', async () => {
            const nutriRes = await registerNutritionist();
            const nutritionistToken = nutriRes.body.data.token;

            const foodData = {
                name: 'Alimento Concurrente',
                calories: 100,
                protein: 10,
                carbohydrates: 20,
                fats: 5,
                unit: 'gramos',
                servingSize: 100
            };

            // Crear múltiples alimentos simultáneamente
            const promises = [
                request(app)
                    .post('/api/foods')
                    .set('Authorization', `Bearer ${nutritionistToken}`)
                    .send(foodData),
                request(app)
                    .post('/api/foods')
                    .set('Authorization', `Bearer ${nutritionistToken}`)
                    .send(foodData),
                request(app)
                    .post('/api/foods')
                    .set('Authorization', `Bearer ${nutritionistToken}`)
                    .send(foodData)
            ];

            const results = await Promise.all(promises);

            // Todos deberían ser exitosos
            results.forEach(res => {
                expect(res.statusCode).toBe(201);
            });
        });

        it('should handle special characters in food names and descriptions', async () => {
            const nutriRes = await registerNutritionist();
            const nutritionistToken = nutriRes.body.data.token;

            const specialCharsData = {
                name: 'Alimento con Ñ, á, é, í, ó, ú y símbolos: @#$%^&*()',
                description: 'Descripción con emojis 🍎🥕🥦 y caracteres especiales: ñáéíóú',
                calories: 100,
                protein: 10,
                carbohydrates: 20,
                fats: 5,
                unit: 'gramos',
                servingSize: 100
            };

            const res = await request(app)
                .post('/api/foods')
                .set('Authorization', `Bearer ${nutritionistToken}`)
                .send(specialCharsData);

            expect(res.statusCode).toBe(201);
            expect(res.body.data.food.name).toBe(specialCharsData.name);
            expect(res.body.data.food.description).toBe(specialCharsData.description);
        });

        it('should handle decimal values correctly', async () => {
            const nutriRes = await registerNutritionist();
            const nutritionistToken = nutriRes.body.data.token;

            const decimalData = {
                name: 'Alimento Decimal',
                calories: 123.45,
                protein: 12.34,
                carbohydrates: 23.45,
                fats: 5.67,
                fiber: 8.9,
                sugar: 3.21,
                unit: 'gramos',
                servingSize: 99.99
            };

            const res = await request(app)
                .post('/api/foods')
                .set('Authorization', `Bearer ${nutritionistToken}`)
                .send(decimalData);

            expect(res.statusCode).toBe(201);
            expect(res.body.data.food.calories).toBe(decimalData.calories);
            expect(res.body.data.food.protein).toBe(decimalData.protein);
            expect(res.body.data.food.serving_size).toBe(decimalData.servingSize);
        });

        it('should handle very long category names appropriately', async () => {
            const nutriRes = await registerNutritionist();
            const nutritionistToken = nutriRes.body.data.token;

            const longCategoryData = {
                name: 'Alimento Categoría Larga',
                calories: 100,
                protein: 10,
                carbohydrates: 20,
                fats: 5,
                unit: 'gramos',
                servingSize: 100,
                category: 'A'.repeat(101) // Excede el límite de 100 caracteres
            };

            const res = await request(app)
                .post('/api/foods')
                .set('Authorization', `Bearer ${nutritionistToken}`)
                .send(longCategoryData);

            expect(res.statusCode).toBe(400);
        });

        it('should handle foods with only required fields', async () => {
            const nutriRes = await registerNutritionist();
            const nutritionistToken = nutriRes.body.data.token;

            const minimalData = {
                name: 'Alimento Mínimo',
                calories: 100,
                protein: 10,
                carbohydrates: 20,
                fats: 5,
                unit: 'gramos',
                servingSize: 100
                // Sin campos opcionales
            };

            const res = await request(app)
                .post('/api/foods')
                .set('Authorization', `Bearer ${nutritionistToken}`)
                .send(minimalData);

            expect(res.statusCode).toBe(201);
            expect(res.body.data.food.name).toBe(minimalData.name);
            expect(res.body.data.food.description).toBeNull();
            expect(res.body.data.food.fiber).toBeNull();
            expect(res.body.data.food.sugar).toBeNull();
            expect(res.body.data.food.category).toBeNull();
        });
    });
}); 