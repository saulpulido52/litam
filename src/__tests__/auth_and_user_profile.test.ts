// src/__tests__/auth_and_user_profile.test.ts
import request from 'supertest';
import { AppDataSource } from '@/database/data-source';
import { User } from '@/database/entities/user.entity';
import { Role } from '@/database/entities/role.entity'; // Necesario para limpiar la tabla de roles
import app from '@/app'; // Importa tu aplicación Express

// Variables para almacenar tokens y IDs entre tests
let patientToken: string;
let patientId: string;
let nutritionistToken: string;
let nutritionistId: string;
let adminToken: string; // Para futuras pruebas de admin

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

const adminCredentials = { // Necesitaríamos una ruta de registro para admins, pero por ahora para el test
    email: 'admin.auth@example.com',
    password: 'SecurePass1!',
    firstName: 'Admin',
    lastName: 'User',
};

describe('Authentication and Basic User Profile Flow', () => {
    beforeAll(async () => {
        // 1. Inicializar la base de datos (si no está inicializada)
        if (!AppDataSource.isInitialized) {
            await AppDataSource.initialize();
        }

        // 2. Limpiar todas las tablas relevantes en el orden correcto usando TRUNCATE CASCADE
        // Esto es crucial para un entorno de prueba limpio en cada ejecución
        await AppDataSource.query(`TRUNCATE TABLE "users" RESTART IDENTITY CASCADE;`);
        await AppDataSource.query(`TRUNCATE TABLE "roles" RESTART IDENTITY CASCADE;`); // Aunque users cascade, lo hacemos para asegurar roles limpios

        // 3. Resembrar los roles, ya que TRUNCATE los elimina
        const roleRepository = AppDataSource.getRepository(Role);
        const rolesToSeed = ['patient', 'nutritionist', 'admin'];
        for (const roleName of rolesToSeed) {
            let role = await roleRepository.findOneBy({ name: roleName as Role['name'] });
            if (!role) {
                role = roleRepository.create({ name: roleName as Role['name'] }); // Casteo correcto al tipo de la entidad
                await roleRepository.save(role);
            }
        }
    }, 30000); // Aumentar el timeout para la configuración inicial

    afterAll(async () => {
        // Cerrar la conexión a la base de datos después de todas las pruebas
        if (AppDataSource.isInitialized) {
            await AppDataSource.destroy();
        }
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

        expect(res.statusCode).toBe(409); // Conflict
        expect(res.body.message).toContain('El email ya está registrado.');
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
        const res = await request(app)
            .post('/api/auth/login')
            .send({ email: patientCredentials.email, password: patientCredentials.password });

        expect(res.statusCode).toBe(200);
        expect(res.body.status).toBe('success');
        expect(res.body.data.user).toBeDefined();
        expect(res.body.data.user.email).toBe(patientCredentials.email);
        expect(res.body.data.token).toBeDefined();
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

        expect(res.statusCode).toBe(200);
        expect(res.body.status).toBe('success');
        expect(res.body.data.user).toBeDefined();
        expect(res.body.data.user.id).toBe(patientId);
        expect(res.body.data.user.email).toBe(patientCredentials.email);
        expect(res.body.data.user.first_name).toBe(patientCredentials.firstName);
        expect(res.body.data.user.password_hash).toBeUndefined(); // Seguridad: no debe devolver el hash
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

        expect(res.statusCode).toBe(200);
        expect(res.body.status).toBe('success');
        expect(res.body.data.user).toBeDefined();
        expect(res.body.data.user.first_name).toBe(updatedFirstName);
        expect(res.body.data.user.age).toBe(updatedAge);

        // Verificar que los cambios se reflejan al obtener el perfil de nuevo
        const getRes = await request(app)
            .get('/api/users/me')
            .set('Authorization', `Bearer ${patientToken}`);
        expect(getRes.statusCode).toBe(200);
        expect(getRes.body.data.user.first_name).toBe(updatedFirstName);
        expect(getRes.body.data.user.age).toBe(updatedAge);
    });

    it('should prevent unauthenticated users from updating profile', async () => {
        const res = await request(app)
            .patch('/api/users/me')
            .send({ firstName: 'Should not update' });

        expect(res.statusCode).toBe(401); // Unauthorized
    });
});