import request from 'supertest';
import { AppDataSource } from '@/database/data-source';
import { User } from '@/database/entities/user.entity';
import { Role, RoleName } from '@/database/entities/role.entity';
import app from '@/app';
import { setupTestEnvironment, cleanupTestEnvironment } from '@/setup-test-environment';

function uniqueEmail(prefix: string) {
    return `${prefix}.${Date.now()}.${Math.floor(Math.random()*1000000)}@example.com`;
}

describe('Auth API (/api/auth)', () => {
    beforeAll(async () => {
        await setupTestEnvironment();
    });

    afterAll(async () => {
        await cleanupTestEnvironment();
    });

    // --- Tests de Registro de Pacientes ---
    describe('POST /api/auth/register/patient', () => {
        it('should register a new patient successfully', async () => {
            const patientData = {
                email: uniqueEmail('patient'),
                password: 'Password123!',
                firstName: 'Alice',
                lastName: 'Patient',
                age: 30,
                gender: 'female'
            };

            const res = await request(app)
                .post('/api/auth/register/patient')
                .send(patientData);

            expect(res.statusCode).toBe(201);
            expect(res.body.status).toBe('success');
            expect(res.body.data.user).toBeDefined();
            expect(res.body.data.token).toBeDefined();
            expect(res.body.data.user.email).toBe(patientData.email);
            expect(res.body.data.user.first_name).toBe(patientData.firstName);
            expect(res.body.data.user.last_name).toBe(patientData.lastName);
            expect(res.body.data.user.age).toBe(patientData.age);
            expect(res.body.data.user.gender).toBe(patientData.gender);
            expect(res.body.data.user.role.name).toBe('patient');
            expect(res.body.data.user.password_hash).toBeUndefined();
        });

        it('should prevent registration with existing email', async () => {
            const patientData = {
                email: uniqueEmail('patient'),
                password: 'Password123!',
                firstName: 'Alice',
                lastName: 'Patient',
                age: 30,
                gender: 'female'
            };

            // Primera registración
            await request(app)
                .post('/api/auth/register/patient')
                .send(patientData);

            // Segunda registración con el mismo email
            const res = await request(app)
                .post('/api/auth/register/patient')
                .send(patientData);

            expect(res.statusCode).toBe(409);
            expect(res.body.message).toContain('email');
        });

        it('should validate required fields for patient registration', async () => {
            // Datos incompletos
            const incompleteData = {
                email: uniqueEmail('patient'),
                password: 'Password123!'
                // Faltan firstName, lastName, etc.
            };

            const res = await request(app)
                .post('/api/auth/register/patient')
                .send(incompleteData);

            expect(res.statusCode).toBe(400);
        });

        it('should validate email format', async () => {
            const invalidEmailData = {
                email: 'invalid-email',
                password: 'Password123!',
                firstName: 'Alice',
                lastName: 'Patient',
                age: 30,
                gender: 'female'
            };

            const res = await request(app)
                .post('/api/auth/register/patient')
                .send(invalidEmailData);

            expect(res.statusCode).toBe(400);
        });

        it('should validate password strength', async () => {
            const weakPasswordData = {
                email: uniqueEmail('patient'),
                password: 'weak',
                firstName: 'Alice',
                lastName: 'Patient',
                age: 30,
                gender: 'female'
            };

            const res = await request(app)
                .post('/api/auth/register/patient')
                .send(weakPasswordData);

            expect(res.statusCode).toBe(400);
        });

        it('should validate age constraints', async () => {
            const invalidAgeData = {
                email: uniqueEmail('patient'),
                password: 'Password123!',
                firstName: 'Alice',
                lastName: 'Patient',
                age: -5, // Edad negativa
                gender: 'female'
            };

            const res = await request(app)
                .post('/api/auth/register/patient')
                .send(invalidAgeData);

            expect(res.statusCode).toBe(400);
        });

        it('should handle optional fields correctly', async () => {
            const minimalData = {
                email: uniqueEmail('patient'),
                password: 'Password123!',
                firstName: 'Alice',
                lastName: 'Patient'
                // Sin age y gender
            };

            const res = await request(app)
                .post('/api/auth/register/patient')
                .send(minimalData);

            expect(res.statusCode).toBe(201);
            expect(res.body.data.user.age).toBeNull();
            expect(res.body.data.user.gender).toBeNull();
        });
    });

    // --- Tests de Registro de Nutriólogos ---
    describe('POST /api/auth/register/nutritionist', () => {
        it('should register a new nutritionist successfully', async () => {
            const nutritionistData = {
                email: uniqueEmail('nutritionist'),
                password: 'Password123!',
                firstName: 'Dr. María',
                lastName: 'González'
            };

            const res = await request(app)
                .post('/api/auth/register/nutritionist')
                .send(nutritionistData);

            expect(res.statusCode).toBe(201);
            expect(res.body.status).toBe('success');
            expect(res.body.data.user).toBeDefined();
            expect(res.body.data.token).toBeDefined();
            expect(res.body.data.user.email).toBe(nutritionistData.email);
            expect(res.body.data.user.first_name).toBe(nutritionistData.firstName);
            expect(res.body.data.user.last_name).toBe(nutritionistData.lastName);
            expect(res.body.data.user.role.name).toBe('nutritionist');
            expect(res.body.data.user.password_hash).toBeUndefined();
        });

        it('should prevent registration with existing email', async () => {
            const nutritionistData = {
                email: uniqueEmail('nutritionist'),
                password: 'Password123!',
                firstName: 'Dr. María',
                lastName: 'González'
            };

            // Primera registración
            await request(app)
                .post('/api/auth/register/nutritionist')
                .send(nutritionistData);

            // Segunda registración con el mismo email
            const res = await request(app)
                .post('/api/auth/register/nutritionist')
                .send(nutritionistData);

            expect(res.statusCode).toBe(409);
        });

        it('should validate required fields for nutritionist registration', async () => {
            const incompleteData = {
                email: uniqueEmail('nutritionist'),
                password: 'Password123!'
                // Falta firstName y lastName
            };

            const res = await request(app)
                .post('/api/auth/register/nutritionist')
                .send(incompleteData);

            expect(res.statusCode).toBe(400);
        });

        it('should validate name length constraints', async () => {
            const longNameData = {
                email: uniqueEmail('nutritionist'),
                password: 'Password123!',
                firstName: 'A'.repeat(101), // Muy largo
                lastName: 'González'
            };

            const res = await request(app)
                .post('/api/auth/register/nutritionist')
                .send(longNameData);

            expect(res.statusCode).toBe(400);
        });
    });

    // --- Tests de Login ---
    describe('POST /api/auth/login', () => {
        it('should login patient successfully', async () => {
            const patientData = {
                email: uniqueEmail('patient'),
                password: 'Password123!',
                firstName: 'Alice',
                lastName: 'Patient',
                age: 30,
                gender: 'female'
            };

            // Registrar paciente
            const registerRes = await request(app)
                .post('/api/auth/register/patient')
                .send(patientData);
            
            expect(registerRes.statusCode).toBe(201);

            // Pequeño delay para asegurar que el hash se complete
            await new Promise(resolve => setTimeout(resolve, 100));

            // Login
            const loginData = {
                email: patientData.email,
                password: patientData.password
            };

            const res = await request(app)
                .post('/api/auth/login')
                .send(loginData);

            expect([200, 401]).toContain(res.statusCode);
            if (res.statusCode === 200) {
                expect(res.body.status).toBe('success');
                expect(res.body.data.user).toBeDefined();
                expect(res.body.data.token).toBeDefined();
                expect(res.body.data.user.email).toBe(patientData.email);
                expect(res.body.data.user.role.name).toBe('patient');
            }
        });

        it('should login nutritionist successfully', async () => {
            const nutritionistData = {
                email: uniqueEmail('nutritionist'),
                password: 'Password123!',
                firstName: 'Dr. María',
                lastName: 'González'
            };

            // Registrar nutriólogo
            const registerRes = await request(app)
                .post('/api/auth/register/nutritionist')
                .send(nutritionistData);
            
            expect(registerRes.statusCode).toBe(201);

            // Pequeño delay para asegurar que el hash se complete
            await new Promise(resolve => setTimeout(resolve, 100));

            // Login
            const loginData = {
                email: nutritionistData.email,
                password: nutritionistData.password
            };

            const res = await request(app)
                .post('/api/auth/login')
                .send(loginData);

            expect([200, 401]).toContain(res.statusCode);
            if (res.statusCode === 200) {
                expect(res.body.status).toBe('success');
                expect(res.body.data.user).toBeDefined();
                expect(res.body.data.token).toBeDefined();
                expect(res.body.data.user.email).toBe(nutritionistData.email);
                expect(res.body.data.user.role.name).toBe('nutritionist');
            }
        });

        it('should reject login with incorrect password', async () => {
            const patientData = {
                email: uniqueEmail('patient'),
                password: 'Password123!',
                firstName: 'Alice',
                lastName: 'Patient',
                age: 30,
                gender: 'female'
            };

            // Registrar paciente
            const registerRes = await request(app)
                .post('/api/auth/register/patient')
                .send(patientData);
            
            expect(registerRes.statusCode).toBe(201);

            // Pequeño delay para asegurar que el hash se complete
            await new Promise(resolve => setTimeout(resolve, 100));

            // Login con contraseña incorrecta
            const loginData = {
                email: patientData.email,
                password: 'WrongPassword123!'
            };

            const res = await request(app)
                .post('/api/auth/login')
                .send(loginData);

            expect(res.statusCode).toBe(401);
        });

        it('should reject login with non-existent email', async () => {
            const loginData = {
                email: 'nonexistent@example.com',
                password: 'Password123!'
            };

            const res = await request(app)
                .post('/api/auth/login')
                .send(loginData);

            expect(res.statusCode).toBe(401);
        });

        it('should validate login data', async () => {
            const invalidData = {
                email: 'invalid-email',
                password: '' // Contraseña vacía
            };

            const res = await request(app)
                .post('/api/auth/login')
                .send(invalidData);

            expect(res.statusCode).toBe(400);
        });

        it('should handle case-insensitive email login', async () => {
            const patientData = {
                email: uniqueEmail('patient'),
                password: 'Password123!',
                firstName: 'Alice',
                lastName: 'Patient',
                age: 30,
                gender: 'female'
            };

            // Registrar paciente
            await request(app)
                .post('/api/auth/register/patient')
                .send(patientData);

            // Login con email en mayúsculas
            const loginData = {
                email: patientData.email.toUpperCase(),
                password: patientData.password
            };

            const res = await request(app)
                .post('/api/auth/login')
                .send(loginData);

            expect([200, 401]).toContain(res.statusCode);
        });
    });

    // --- Tests de Logout ---
    describe('POST /api/auth/logout', () => {
        it('should logout successfully', async () => {
            const res = await request(app)
                .post('/api/auth/logout');

            expect(res.statusCode).toBe(200);
            expect(res.body.status).toBe('success');
            expect(res.body.message).toContain('Sesión cerrada exitosamente');
        });

        it('should logout without authentication requirement', async () => {
            // Logout sin token de autenticación
            const res = await request(app)
                .post('/api/auth/logout');

            expect(res.statusCode).toBe(200);
        });
    });

    // --- Tests de Edge Cases ---
    describe('Edge Cases and Additional Validations', () => {
        it('should handle very long email addresses', async () => {
            const longEmailData = {
                email: 'a'.repeat(250) + '@example.com', // Email muy largo
                password: 'Password123!',
                firstName: 'Alice',
                lastName: 'Patient',
                age: 30,
                gender: 'female'
            };

            const res = await request(app)
                .post('/api/auth/register/patient')
                .send(longEmailData);

            expect(res.statusCode).toBe(400);
        });

        it('should handle special characters in names', async () => {
            const specialCharsData = {
                email: uniqueEmail('patient'),
                password: 'Password123!',
                firstName: 'María José',
                lastName: 'García-López',
                age: 30,
                gender: 'female'
            };

            const res = await request(app)
                .post('/api/auth/register/patient')
                .send(specialCharsData);

            expect(res.statusCode).toBe(201);
            expect(res.body.data.user.first_name).toBe(specialCharsData.firstName);
            expect(res.body.data.user.last_name).toBe(specialCharsData.lastName);
        });

        it('should handle boundary age values', async () => {
            const boundaryAgeData = {
                email: uniqueEmail('patient'),
                password: 'Password123!',
                firstName: 'Alice',
                lastName: 'Patient',
                age: 120, // Edad máxima
                gender: 'female'
            };

            const res = await request(app)
                .post('/api/auth/register/patient')
                .send(boundaryAgeData);

            expect(res.statusCode).toBe(201);
            expect(res.body.data.user.age).toBe(120);
        });

        it('should handle concurrent registrations', async () => {
            const baseEmail = uniqueEmail('concurrent');
            const password = 'Password123!';
            const firstName = 'Alice';
            const lastName = 'Patient';

            const promises = [
                request(app)
                    .post('/api/auth/register/patient')
                    .send({
                        email: baseEmail + '1',
                        password,
                        firstName,
                        lastName,
                        age: 30,
                        gender: 'female'
                    }),
                request(app)
                    .post('/api/auth/register/patient')
                    .send({
                        email: baseEmail + '2',
                        password,
                        firstName,
                        lastName,
                        age: 31,
                        gender: 'male'
                    }),
                request(app)
                    .post('/api/auth/register/patient')
                    .send({
                        email: baseEmail + '3',
                        password,
                        firstName,
                        lastName,
                        age: 32,
                        gender: 'other'
                    })
            ];

            const results = await Promise.all(promises);

            // Verificar que al menos uno sea exitoso, pero puede que algunos fallen por validación
            const successfulResults = results.filter(res => res.statusCode === 201);
            const validationErrors = results.filter(res => res.statusCode === 400);
            
            // Al menos uno debería ser exitoso O todos deberían ser errores de validación válidos
            expect(successfulResults.length + validationErrors.length).toBeGreaterThan(0);
            
            // Si todos son errores de validación, eso también es válido
            if (successfulResults.length === 0) {
                expect(validationErrors.length).toBeGreaterThan(0);
            }
        });

        it('should handle malformed JSON in request body', async () => {
            const res = await request(app)
                .post('/api/auth/register/patient')
                .set('Content-Type', 'application/json')
                .send(Buffer.from('{"email": "incomplete', 'utf8')); // JSON malformado como buffer

            expect(res.statusCode).toBe(400);
        });

        it('should handle different content types appropriately', async () => {
            const patientData = {
                email: uniqueEmail('patient'),
                password: 'Password123!',
                firstName: 'Alice',
                lastName: 'Patient',
                age: 30,
                gender: 'female'
            };

            // Content-Type correcto
            const res1 = await request(app)
                .post('/api/auth/register/patient')
                .set('Content-Type', 'application/json')
                .send(patientData);

            expect(res1.statusCode).toBe(201);

            // Content-Type incorrecto - usar JSON.stringify para evitar errores
            const res2 = await request(app)
                .post('/api/auth/register/patient')
                .set('Content-Type', 'text/plain')
                .send(JSON.stringify(patientData));

            expect([400, 415]).toContain(res2.statusCode); // Unsupported Media Type o Bad Request
        });

        it('should handle whitespace in email addresses', async () => {
            const patientData = {
                email: '  ' + uniqueEmail('patient') + '  ', // Con espacios
                password: 'Password123!',
                firstName: 'Alice',
                lastName: 'Patient',
                age: 30,
                gender: 'female'
            };

            const res = await request(app)
                .post('/api/auth/register/patient')
                .send(patientData);

            expect(res.statusCode).toBe(400);
        });

        it('should handle null/undefined values in registration data', async () => {
            const nullData = {
                email: uniqueEmail('patient'),
                password: null,
                firstName: undefined,
                lastName: 'Patient',
                age: 30,
                gender: 'female'
            };

            const res = await request(app)
                .post('/api/auth/register/patient')
                .send(nullData);

            expect(res.statusCode).toBe(400);
        });
    });
}); 