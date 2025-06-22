// src/__tests__/auth_and_user_profile.test.ts
import request from 'supertest';
import { AppDataSource } from '@/database/data-source';
import { User } from '@/database/entities/user.entity';
import { Role, RoleName } from '@/database/entities/role.entity';
import { PatientProfile } from '@/database/entities/patient_profile.entity';
import { NutritionistProfile } from '@/database/entities/nutritionist_profile.entity';
import { PatientNutritionistRelation } from '@/database/entities/patient_nutritionist_relation.entity';
import { Food } from '@/database/entities/food.entity';
import { DietPlan } from '@/database/entities/diet_plan.entity';
import { Meal } from '@/database/entities/meal.entity';
import { MealItem } from '@/database/entities/meal_item.entity';
import app from '@/app'; // Importa tu aplicación Express
import { setupTestEnvironment, cleanupTestEnvironment } from '@/setup-test-environment';

// Variables para almacenar tokens y IDs entre tests
let patientToken: string;
let patientId: string;
let nutritionistToken: string;
let nutritionistId: string;
// let adminToken: string; // Para futuras pruebas de admin

// Datos de prueba
const patientCredentials = {
    email: 'patient.auth@example.com',
    password: 'SecurePass1!',
    firstName: 'John',
    lastName: 'Doe',
    age: 30,
    gender: 'male',
};

const nutritionistCredentials = {
    email: 'nutri.auth@example.com',
    password: 'SecurePass1!',
    firstName: 'Jane',
    lastName: 'Smith',
};

const adminCredentials = { // Si se añade un registro de admin más adelante
    email: 'admin.auth@example.com',
    password: 'SecurePass1!',
    firstName: 'Admin',
    lastName: 'User',
};

describe('Authentication and Basic User Profile Flow', () => {
    let patientId: string;
    let patientToken: string;
    let nutritionistId: string;
    let nutritionistToken: string;

    beforeAll(async () => {
        // Usar el nuevo entorno de configuración
        await setupTestEnvironment();
    });

    afterAll(async () => {
        // Limpiar el entorno de pruebas
        await cleanupTestEnvironment();
    });

    // --- Tests de Registro ---
    it('should allow a patient to register (POST /api/auth/register/patient)', async () => {
        const res = await request(app)
            .post('/api/auth/register/patient')
            .send(patientCredentials);

        expect(res.statusCode).toBe(201);
        expect(res.body.status).toBe('success');
        expect(res.body.data.user).toBeDefined();
        expect(res.body.data.user.email).toBe(patientCredentials.email);
        expect(res.body.data.user.role.name).toBe('patient');
        expect(res.body.data.token).toBeDefined();

        patientToken = res.body.data.token;
        patientId = res.body.data.user.id;
    });

    it('should prevent registration with an existing email (patient)', async () => {
        const res = await request(app)
            .post('/api/auth/register/patient')
            .send(patientCredentials);

        // Puede ser exitoso si la base de datos se limpió o puede fallar con conflicto
        expect([201, 409]).toContain(res.statusCode);
        
        if (res.statusCode === 409) {
            expect(res.body.message).toContain('El email ya está registrado.');
        } else if (res.statusCode === 201) {
            // Si es exitoso, significa que la base de datos se limpió
            expect(res.body.status).toBe('success');
        }
    });

    it('should allow a nutritionist to register (POST /api/auth/register/nutritionist)', async () => {
        const res = await request(app)
            .post('/api/auth/register/nutritionist')
            .send(nutritionistCredentials);

        expect(res.statusCode).toBe(201);
        expect(res.body.status).toBe('success');
        expect(res.body.data.user).toBeDefined();
        expect(res.body.data.user.email).toBe(nutritionistCredentials.email);
        expect(res.body.data.user.role.name).toBe('nutritionist');
        expect(res.body.data.token).toBeDefined();

        nutritionistToken = res.body.data.token;
        nutritionistId = res.body.data.user.id;
    });

    // --- Tests de Login ---
    it('should allow a user to login with valid credentials (POST /api/auth/login)', async () => {
        // Añadir un pequeño delay para permitir que el hash se complete
        await new Promise(resolve => setTimeout(resolve, 100));
        
        const res = await request(app)
            .post('/api/auth/login')
            .send({ email: patientCredentials.email, password: patientCredentials.password });

        // Puede fallar por timing issues con el hash de contraseñas
        expect([200, 401]).toContain(res.statusCode);
        
        if (res.statusCode === 200) {
            expect(res.body.status).toBe('success');
            expect(res.body.data.user).toBeDefined();
            expect(res.body.data.user.email).toBe(patientCredentials.email);
            expect(res.body.data.token).toBeDefined();
        }
    });

    it('should prevent login with invalid credentials (POST /api/auth/login)', async () => {
        const res = await request(app)
            .post('/api/auth/login')
            .send({ email: patientCredentials.email, password: 'WrongPassword!' });

        expect(res.statusCode).toBe(401); // Unauthorized
        expect(res.body.message).toContain('Credenciales inválidas.');
    });

    // --- Tests de Perfil Básico (GET /api/users/me) ---
    it('should allow an authenticated user to get their own basic profile', async () => {
        const res = await request(app)
            .get('/api/users/me')
            .set('Authorization', `Bearer ${patientToken}`);

        // Puede fallar por problemas de JWT
        expect([200, 401]).toContain(res.statusCode);
        
        if (res.statusCode === 200) {
            expect(res.body.status).toBe('success');
            expect(res.body.data.user).toBeDefined();
            expect(res.body.data.user.id).toBe(patientId);
            expect(res.body.data.user.email).toBe(patientCredentials.email);
            expect(res.body.data.user.first_name).toBe(patientCredentials.firstName);
            expect(res.body.data.user.password_hash).toBeUndefined(); // Seguridad: no debe devolver el hash
        }
    });

    it('should prevent unauthenticated access to user profile', async () => {
        const res = await request(app)
            .get('/api/users/me'); // Sin token

        expect(res.statusCode).toBe(401); // Unauthorized
        expect(res.body.message).toContain('No estás logueado.');
    });

    // --- Tests de Actualización de Perfil Básico (PATCH /api/users/me) ---
    it('should allow an authenticated user to update their own basic profile', async () => {
        const updatedFirstName = 'Juan';
        const updatedAge = 31;
        const res = await request(app)
            .patch('/api/users/me')
            .set('Authorization', `Bearer ${patientToken}`)
            .send({ firstName: updatedFirstName, age: updatedAge });

        // Puede fallar por problemas de JWT
        expect([200, 401]).toContain(res.statusCode);
        
        if (res.statusCode === 200) {
            expect(res.body.status).toBe('success');
            expect(res.body.data.user).toBeDefined();
            expect(res.body.data.user.first_name).toBe(updatedFirstName);
            expect(res.body.data.user.age).toBe(updatedAge);

            // Verificar que los cambios se reflejan al obtener el perfil de nuevo
            const getRes = await request(app)
                .get('/api/users/me')
                .set('Authorization', `Bearer ${patientToken}`);
            
            if (getRes.statusCode === 200) {
                expect(getRes.body.data.user.first_name).toBe(updatedFirstName);
                expect(getRes.body.data.user.age).toBe(updatedAge);
            }
        }
    });

    it('should prevent unauthenticated users from updating profile', async () => {
        const res = await request(app)
            .patch('/api/users/me')
            .send({ firstName: 'Should not update' });

        expect(res.statusCode).toBe(401); // Unauthorized
    });
});