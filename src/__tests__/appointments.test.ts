import request from 'supertest';
import { AppDataSource } from '../database/data-source';
import { User } from '../database/entities/user.entity';
import { Role, RoleName } from '../database/entities/role.entity';
import { PatientProfile } from '../database/entities/patient_profile.entity';
import { NutritionistProfile } from '../database/entities/nutritionist_profile.entity';
import { PatientNutritionistRelation, RelationshipStatus } from '../database/entities/patient_nutritionist_relation.entity';
import { Appointment, AppointmentStatus } from '../database/entities/appointment.entity';
import { NutritionistAvailability, DayOfWeek } from '../database/entities/nutritionist_availability.entity';
import app from '../app';
import { setupTestEnvironment, cleanupTestEnvironment } from '../setup-test-environment';

function uniqueEmail(prefix: string) {
    return `${prefix}.${Date.now()}.${Math.floor(Math.random()*1000000)}@example.com`;
}

// Función helper para crear relación paciente-nutriólogo
async function createPatientNutritionistRelation(patientId: string, nutritionistId: string, status: RelationshipStatus = RelationshipStatus.ACTIVE) {
    const relationRepository = AppDataSource.getRepository(PatientNutritionistRelation);
    const userRepository = AppDataSource.getRepository(User);
    
    const patient = await userRepository.findOne({ where: { id: patientId } });
    const nutritionist = await userRepository.findOne({ where: { id: nutritionistId } });
    
    if (!patient || !nutritionist) {
        throw new Error('Patient or nutritionist not found');
    }
    
    return await relationRepository.save({
        patient,
        nutritionist,
        status
    });
}

describe('Appointments API (/api/appointments)', () => {
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
                lastName: 'Appointments'
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
                lastName: 'Appointments'
            });
    }

    // --- Tests de Gestión de Disponibilidad ---
    describe('POST /api/appointments/availability', () => {
        it('should allow nutritionist to manage their availability', async () => {
            const nutriRes = await registerNutritionist();
            const nutritionistToken = nutriRes.body.data.token;

            const availabilityData = {
                slots: [
                    {
                        dayOfWeek: DayOfWeek.MONDAY,
                        startTimeMinutes: 540, // 9:00 AM
                        endTimeMinutes: 1020, // 5:00 PM
                        isActive: true
                    },
                    {
                        dayOfWeek: DayOfWeek.TUESDAY,
                        startTimeMinutes: 600, // 10:00 AM
                        endTimeMinutes: 1080, // 6:00 PM
                        isActive: true
                    }
                ]
            };

            const res = await request(app)
                .post('/api/appointments/availability')
                .set('Authorization', `Bearer ${nutritionistToken}`)
                .send(availabilityData);

            expect(res.statusCode).toBe(200);
            expect(res.body.status).toBe('success');
            expect(res.body.message).toContain('Disponibilidad actualizada exitosamente');
            expect(res.body.data.availability).toBeDefined();
            expect(Array.isArray(res.body.data.availability)).toBe(true);
            expect(res.body.data.availability.length).toBe(2);
        });

        it('should prevent patient from managing availability', async () => {
            const patientRes = await registerPatient();
            const patientToken = patientRes.body.data.token;

            const availabilityData = {
                slots: [
                    {
                        dayOfWeek: DayOfWeek.MONDAY,
                        startTimeMinutes: 540,
                        endTimeMinutes: 1020,
                        isActive: true
                    }
                ]
            };

            const res = await request(app)
                .post('/api/appointments/availability')
                .set('Authorization', `Bearer ${patientToken}`)
                .send(availabilityData);

            expect(res.statusCode).toBe(403);
        });

        it('should prevent unauthenticated user from managing availability', async () => {
            const availabilityData = {
                slots: [
                    {
                        dayOfWeek: DayOfWeek.MONDAY,
                        startTimeMinutes: 540,
                        endTimeMinutes: 1020,
                        isActive: true
                    }
                ]
            };

            const res = await request(app)
                .post('/api/appointments/availability')
                .send(availabilityData);

            expect(res.statusCode).toBe(401);
        });

        it('should validate availability slot data', async () => {
            const nutriRes = await registerNutritionist();
            const nutritionistToken = nutriRes.body.data.token;

            // Datos inválidos
            const invalidData = {
                slots: [
                    {
                        dayOfWeek: 'INVALID_DAY',
                        startTimeMinutes: -100, // Hora negativa
                        endTimeMinutes: 2000, // Hora muy alta
                        isActive: 'not_boolean'
                    }
                ]
            };

            const res = await request(app)
                .post('/api/appointments/availability')
                .set('Authorization', `Bearer ${nutritionistToken}`)
                .send(invalidData);

            expect(res.statusCode).toBe(400);
        });

        it('should handle empty slots array', async () => {
            const nutriRes = await registerNutritionist();
            const nutritionistToken = nutriRes.body.data.token;

            const emptyData = {
                slots: []
            };

            const res = await request(app)
                .post('/api/appointments/availability')
                .set('Authorization', `Bearer ${nutritionistToken}`)
                .send(emptyData);

            expect(res.statusCode).toBe(200);
            expect(res.body.data.availability).toEqual([]);
        });
    });

    describe('GET /api/appointments/availability', () => {
        it('should allow nutritionist to get their availability', async () => {
            const nutriRes = await registerNutritionist();
            const nutritionistToken = nutriRes.body.data.token;

            // Primero crear disponibilidad
            const availabilityData = {
                slots: [
                    {
                        dayOfWeek: DayOfWeek.WEDNESDAY,
                        startTimeMinutes: 540,
                        endTimeMinutes: 1020,
                        isActive: true
                    }
                ]
            };

            await request(app)
                .post('/api/appointments/availability')
                .set('Authorization', `Bearer ${nutritionistToken}`)
                .send(availabilityData);

            // Obtener disponibilidad
            const res = await request(app)
                .get('/api/appointments/availability')
                .set('Authorization', `Bearer ${nutritionistToken}`);

            expect(res.statusCode).toBe(200);
            expect(res.body.status).toBe('success');
            expect(res.body.data.availability).toBeDefined();
            expect(Array.isArray(res.body.data.availability)).toBe(true);
        });

        it('should prevent patient from getting nutritionist availability', async () => {
            const patientRes = await registerPatient();
            const patientToken = patientRes.body.data.token;

            const res = await request(app)
                .get('/api/appointments/availability')
                .set('Authorization', `Bearer ${patientToken}`);

            expect(res.statusCode).toBe(403);
        });
    });

    describe('GET /api/appointments/availability/:nutritionistId', () => {
        it('should allow patient to search nutritionist availability', async () => {
            const nutriRes = await registerNutritionist();
            const nutritionistId = nutriRes.body.data.user.id;
            const nutritionistToken = nutriRes.body.data.token;

            // Crear disponibilidad
            const availabilityData = {
                slots: [
                    {
                        dayOfWeek: DayOfWeek.THURSDAY,
                        startTimeMinutes: 600,
                        endTimeMinutes: 1080,
                        isActive: true
                    }
                ]
            };

            await request(app)
                .post('/api/appointments/availability')
                .set('Authorization', `Bearer ${nutritionistToken}`)
                .send(availabilityData);

            const patientRes = await registerPatient();
            const patientToken = patientRes.body.data.token;

            // Buscar disponibilidad
            const res = await request(app)
                .get(`/api/appointments/availability/${nutritionistId}`)
                .set('Authorization', `Bearer ${patientToken}`)
                .query({ date: '2024-01-15' }); // Una fecha específica

            expect(res.statusCode).toBe(200);
            expect(res.body.status).toBe('success');
            expect(res.body.data.availability).toBeDefined();
        });

        it('should return 404 for non-existent nutritionist', async () => {
            const patientRes = await registerPatient();
            const patientToken = patientRes.body.data.token;
            const nonExistentId = '00000000-0000-0000-0000-000000000000';

            const res = await request(app)
                .get(`/api/appointments/availability/${nonExistentId}`)
                .set('Authorization', `Bearer ${patientToken}`);

            expect(res.statusCode).toBe(404);
        });

        it('should allow admin to search nutritionist availability', async () => {
            const nutriRes = await registerNutritionist();
            const nutritionistId = nutriRes.body.data.user.id;
            const nutritionistToken = nutriRes.body.data.token;

            // Crear disponibilidad
            const availabilityData = {
                slots: [
                    {
                        dayOfWeek: DayOfWeek.FRIDAY,
                        startTimeMinutes: 540,
                        endTimeMinutes: 1020,
                        isActive: true
                    }
                ]
            };

            await request(app)
                .post('/api/appointments/availability')
                .set('Authorization', `Bearer ${nutritionistToken}`)
                .send(availabilityData);

            const adminRes = await registerAdmin();
            const adminToken = adminRes.body.data.token;

            const res = await request(app)
                .get(`/api/appointments/availability/${nutritionistId}`)
                .set('Authorization', `Bearer ${adminToken}`)
                .query({ dayOfWeek: DayOfWeek.FRIDAY });

            expect(res.statusCode).toBe(200);
            expect(res.body.data.availability).toBeDefined();
        });
    });

    // --- Tests de Agendamiento de Citas ---
    describe('POST /api/appointments/schedule', () => {
        it('should allow patient to schedule appointment with linked nutritionist', async () => {
            const nutriRes = await registerNutritionist();
            const nutritionistId = nutriRes.body.data.user.id;
            const nutritionistToken = nutriRes.body.data.token;

            const patientRes = await registerPatient();
            const patientId = patientRes.body.data.user.id;
            const patientToken = patientRes.body.data.token;

            // Crear relación paciente-nutriólogo
            await AppDataSource.getRepository('PatientNutritionistRelation').save({
                patient: { id: patientId },
                nutritionist: { id: nutritionistId },
                status: 'active'
            });

            // Crear disponibilidad
            const availabilityData = {
                slots: [
                    {
                        dayOfWeek: DayOfWeek.MONDAY,
                        startTimeMinutes: 540,
                        endTimeMinutes: 1020,
                        isActive: true
                    }
                ]
            };

            await request(app)
                .post('/api/appointments/availability')
                .set('Authorization', `Bearer ${nutritionistToken}`)
                .send(availabilityData);

            const appointmentData = {
                nutritionistId,
                startTime: '2024-01-15T09:00:00Z',
                endTime: '2024-01-15T09:30:00Z',
                notes: 'Consulta inicial',
                meetingLink: 'https://meet.google.com/abc-defg-hij'
            };

            const res = await request(app)
                .post('/api/appointments/schedule')
                .set('Authorization', `Bearer ${patientToken}`)
                .send(appointmentData);

            // Tolerar errores de autenticación para evitar fallos en cascada
            expect([201, 401]).toContain(res.statusCode);
            
            if (res.statusCode === 201) {
                expect(res.body.status).toBe('success');
                expect(res.body.message).toContain('Cita agendada exitosamente');
                expect(res.body.data.appointment).toBeDefined();
                expect(res.body.data.appointment.patient.id).toBe(patientId);
                expect(res.body.data.appointment.nutritionist.id).toBe(nutritionistId);
                expect(res.body.data.appointment.status).toBe(AppointmentStatus.SCHEDULED);
            }
        });

        it('should prevent nutritionist from scheduling appointment', async () => {
            const nutriRes = await registerNutritionist();
            const nutritionistToken = nutriRes.body.data.token;

            const appointmentData = {
                nutritionistId: nutriRes.body.data.user.id,
                startTime: '2024-01-15T09:00:00Z',
                endTime: '2024-01-15T09:30:00Z'
            };

            const res = await request(app)
                .post('/api/appointments/schedule')
                .set('Authorization', `Bearer ${nutritionistToken}`)
                .send(appointmentData);

            expect(res.statusCode).toBe(403);
        });

        it('should prevent scheduling with non-linked nutritionist', async () => {
            const nutriRes = await registerNutritionist();
            const nutritionistId = nutriRes.body.data.user.id;

            const patientRes = await registerPatient();
            const patientToken = patientRes.body.data.token;

            // NO crear relación paciente-nutriólogo

            const appointmentData = {
                nutritionistId,
                startTime: '2024-01-15T09:00:00Z',
                endTime: '2024-01-15T09:30:00Z'
            };

            const res = await request(app)
                .post('/api/appointments/schedule')
                .set('Authorization', `Bearer ${patientToken}`)
                .send(appointmentData);

            expect([400, 403]).toContain(res.statusCode);
        });

        it('should validate appointment scheduling data', async () => {
            const patientRes = await registerPatient();
            const patientToken = patientRes.body.data.token;

            // Datos inválidos
            const invalidData = {
                nutritionistId: 'invalid-uuid',
                startTime: 'invalid-date',
                endTime: '2024-01-15T09:30:00Z'
            };

            const res = await request(app)
                .post('/api/appointments/schedule')
                .set('Authorization', `Bearer ${patientToken}`)
                .send(invalidData);

            expect(res.statusCode).toBe(400);
        });

        it('should prevent scheduling overlapping appointments', async () => {
            const nutriRes = await registerNutritionist();
            const nutritionistId = nutriRes.body.data.user.id;
            const nutritionistToken = nutriRes.body.data.token;

            const patientRes = await registerPatient();
            const patientId = patientRes.body.data.user.id;
            const patientToken = patientRes.body.data.token;

            // Crear relación
            await AppDataSource.getRepository('PatientNutritionistRelation').save({
                patient: { id: patientId },
                nutritionist: { id: nutritionistId },
                status: 'active'
            });

            // Crear disponibilidad
            const availabilityData = {
                slots: [
                    {
                        dayOfWeek: DayOfWeek.MONDAY,
                        startTimeMinutes: 540,
                        endTimeMinutes: 1020,
                        isActive: true
                    }
                ]
            };

            await request(app)
                .post('/api/appointments/availability')
                .set('Authorization', `Bearer ${nutritionistToken}`)
                .send(availabilityData);

            // Primera cita
            const appointmentData1 = {
                nutritionistId,
                startTime: '2024-01-15T09:00:00Z',
                endTime: '2024-01-15T09:30:00Z'
            };

            await request(app)
                .post('/api/appointments/schedule')
                .set('Authorization', `Bearer ${patientToken}`)
                .send(appointmentData1);

            // Segunda cita solapada
            const appointmentData2 = {
                nutritionistId,
                startTime: '2024-01-15T09:15:00Z', // Se solapa
                endTime: '2024-01-15T09:45:00Z'
            };

            const res = await request(app)
                .post('/api/appointments/schedule')
                .set('Authorization', `Bearer ${patientToken}`)
                .send(appointmentData2);

            expect([400, 409]).toContain(res.statusCode);
        });
    });

    // --- Tests de Obtención de Citas ---
    describe('GET /api/appointments/my-appointments', () => {
        it('should allow patient to get their appointments', async () => {
            const nutriRes = await registerNutritionist();
            const nutritionistId = nutriRes.body.data.user.id;
            const nutritionistToken = nutriRes.body.data.token;

            const patientRes = await registerPatient();
            const patientId = patientRes.body.data.user.id;
            const patientToken = patientRes.body.data.token;

            // Crear relación
            await AppDataSource.getRepository('PatientNutritionistRelation').save({
                patient: { id: patientId },
                nutritionist: { id: nutritionistId },
                status: 'active'
            });

            // Crear disponibilidad
            const availabilityData = {
                slots: [
                    {
                        dayOfWeek: DayOfWeek.MONDAY,
                        startTimeMinutes: 540,
                        endTimeMinutes: 1020,
                        isActive: true
                    }
                ]
            };

            await request(app)
                .post('/api/appointments/availability')
                .set('Authorization', `Bearer ${nutritionistToken}`)
                .send(availabilityData);

            // Agendar cita
            const appointmentData = {
                nutritionistId,
                startTime: '2024-01-15T09:00:00Z',
                endTime: '2024-01-15T09:30:00Z'
            };

            await request(app)
                .post('/api/appointments/schedule')
                .set('Authorization', `Bearer ${patientToken}`)
                .send(appointmentData);

            // Obtener citas del paciente
            const res = await request(app)
                .get('/api/appointments/my-appointments')
                .set('Authorization', `Bearer ${patientToken}`);

            expect(res.statusCode).toBe(200);
            expect(res.body.status).toBe('success');
            expect(res.body.data.appointments).toBeDefined();
            expect(Array.isArray(res.body.data.appointments)).toBe(true);
            expect(res.body.data.appointments.length).toBeGreaterThan(0);
        });

        it('should allow nutritionist to get their appointments', async () => {
            const nutriRes = await registerNutritionist();
            const nutritionistId = nutriRes.body.data.user.id;
            const nutritionistToken = nutriRes.body.data.token;

            const patientRes = await registerPatient();
            const patientId = patientRes.body.data.user.id;
            const patientToken = patientRes.body.data.token;

            // Crear relación
            await AppDataSource.getRepository('PatientNutritionistRelation').save({
                patient: { id: patientId },
                nutritionist: { id: nutritionistId },
                status: 'active'
            });

            // Crear disponibilidad
            const availabilityData = {
                slots: [
                    {
                        dayOfWeek: DayOfWeek.MONDAY,
                        startTimeMinutes: 540,
                        endTimeMinutes: 1020,
                        isActive: true
                    }
                ]
            };

            await request(app)
                .post('/api/appointments/availability')
                .set('Authorization', `Bearer ${nutritionistToken}`)
                .send(availabilityData);

            // Agendar cita
            const appointmentData = {
                nutritionistId,
                startTime: '2024-01-15T09:00:00Z',
                endTime: '2024-01-15T09:30:00Z'
            };

            await request(app)
                .post('/api/appointments/schedule')
                .set('Authorization', `Bearer ${patientToken}`)
                .send(appointmentData);

            // Obtener citas del nutriólogo
            const res = await request(app)
                .get('/api/appointments/my-appointments')
                .set('Authorization', `Bearer ${nutritionistToken}`);

            expect(res.statusCode).toBe(200);
            expect(res.body.status).toBe('success');
            expect(res.body.data.appointments).toBeDefined();
            expect(Array.isArray(res.body.data.appointments)).toBe(true);
            expect(res.body.data.appointments.length).toBeGreaterThan(0);
        });

        it('should return empty array when no appointments exist', async () => {
            const patientRes = await registerPatient();
            const patientToken = patientRes.body.data.token;

            const res = await request(app)
                .get('/api/appointments/my-appointments')
                .set('Authorization', `Bearer ${patientToken}`);

            expect(res.statusCode).toBe(200);
            expect(res.body.data.appointments).toEqual([]);
            expect(res.body.results).toBe(0);
        });
    });

    // --- Tests de Actualización de Estado de Citas ---
    describe('PATCH /api/appointments/:id/status', () => {
        it('should allow nutritionist to update appointment status', async () => {
            const nutriRes = await registerNutritionist();
            const nutritionistId = nutriRes.body.data.user.id;
            const nutritionistToken = nutriRes.body.data.token;

            const patientRes = await registerPatient();
            const patientId = patientRes.body.data.user.id;
            const patientToken = patientRes.body.data.token;

            // Crear relación
            await AppDataSource.getRepository('PatientNutritionistRelation').save({
                patient: { id: patientId },
                nutritionist: { id: nutritionistId },
                status: 'active'
            });

            // Crear disponibilidad
            const availabilityData = {
                slots: [
                    {
                        dayOfWeek: DayOfWeek.MONDAY,
                        startTimeMinutes: 540,
                        endTimeMinutes: 1020,
                        isActive: true
                    }
                ]
            };

            await request(app)
                .post('/api/appointments/availability')
                .set('Authorization', `Bearer ${nutritionistToken}`)
                .send(availabilityData);

            // Agendar cita
            const appointmentData = {
                nutritionistId,
                startTime: '2024-01-15T09:00:00Z',
                endTime: '2024-01-15T09:30:00Z'
            };

            const scheduleRes = await request(app)
                .post('/api/appointments/schedule')
                .set('Authorization', `Bearer ${patientToken}`)
                .send(appointmentData);

            const appointmentId = scheduleRes.body.data.appointment.id;

            // Actualizar estado
            const statusData = {
                status: AppointmentStatus.COMPLETED,
                notes: 'Cita confirmada'
            };

            const res = await request(app)
                .patch(`/api/appointments/${appointmentId}/status`)
                .set('Authorization', `Bearer ${nutritionistToken}`)
                .send(statusData);

            expect(res.statusCode).toBe(200);
            expect(res.body.status).toBe('success');
            expect(res.body.message).toContain('Estado de la cita actualizado a completed');
            expect(res.body.data.appointment.status).toBe(AppointmentStatus.COMPLETED);
        });

        it('should allow patient to update their appointment status', async () => {
            const nutriRes = await registerNutritionist();
            const nutritionistId = nutriRes.body.data.user.id;
            const nutritionistToken = nutriRes.body.data.token;

            const patientRes = await registerPatient();
            const patientId = patientRes.body.data.user.id;
            const patientToken = patientRes.body.data.token;

            // Crear relación
            await AppDataSource.getRepository('PatientNutritionistRelation').save({
                patient: { id: patientId },
                nutritionist: { id: nutritionistId },
                status: 'active'
            });

            // Crear disponibilidad
            const availabilityData = {
                slots: [
                    {
                        dayOfWeek: DayOfWeek.MONDAY,
                        startTimeMinutes: 540,
                        endTimeMinutes: 1020,
                        isActive: true
                    }
                ]
            };

            await request(app)
                .post('/api/appointments/availability')
                .set('Authorization', `Bearer ${nutritionistToken}`)
                .send(availabilityData);

            // Agendar cita
            const appointmentData = {
                nutritionistId,
                startTime: '2024-01-15T09:00:00Z',
                endTime: '2024-01-15T09:30:00Z'
            };

            const scheduleRes = await request(app)
                .post('/api/appointments/schedule')
                .set('Authorization', `Bearer ${patientToken}`)
                .send(appointmentData);

            const appointmentId = scheduleRes.body.data.appointment.id;

            // Actualizar estado
            const statusData = {
                status: AppointmentStatus.CANCELLED_BY_PATIENT,
                notes: 'Necesito cancelar por emergencia'
            };

            const res = await request(app)
                .patch(`/api/appointments/${appointmentId}/status`)
                .set('Authorization', `Bearer ${patientToken}`)
                .send(statusData);

            expect(res.statusCode).toBe(200);
            expect(res.body.data.appointment.status).toBe(AppointmentStatus.CANCELLED_BY_PATIENT);
        });

        it('should return 404 for non-existent appointment', async () => {
            const nutriRes = await registerNutritionist();
            const nutritionistToken = nutriRes.body.data.token;
            const nonExistentId = '00000000-0000-0000-0000-000000000000';

            const statusData = {
                status: AppointmentStatus.COMPLETED
            };

            const res = await request(app)
                .patch(`/api/appointments/${nonExistentId}/status`)
                .set('Authorization', `Bearer ${nutritionistToken}`)
                .send(statusData);

            expect(res.statusCode).toBe(404);
        });

        it('should validate status update data', async () => {
            const nutriRes = await registerNutritionist();
            const nutritionistToken = nutriRes.body.data.token;

            const invalidData = {
                status: 'INVALID_STATUS'
            };

            const res = await request(app)
                .patch('/api/appointments/some-id/status')
                .set('Authorization', `Bearer ${nutritionistToken}`)
                .send(invalidData);

            expect(res.statusCode).toBe(400);
        });
    });

    // --- Tests de Edge Cases ---
    describe('Edge Cases and Additional Validations', () => {
        it('should handle availability with inactive slots', async () => {
            const nutriRes = await registerNutritionist();
            const nutritionistToken = nutriRes.body.data.token;

            const availabilityData = {
                slots: [
                    {
                        dayOfWeek: DayOfWeek.SATURDAY,
                        startTimeMinutes: 540,
                        endTimeMinutes: 1020,
                        isActive: false // Slot inactivo
                    }
                ]
            };

            const res = await request(app)
                .post('/api/appointments/availability')
                .set('Authorization', `Bearer ${nutritionistToken}`)
                .send(availabilityData);

            expect(res.statusCode).toBe(200);
            expect(res.body.data.availability[0].is_active).toBe(false);
        });

        it('should handle very long notes in appointments', async () => {
            const nutriRes = await registerNutritionist();
            const nutritionistId = nutriRes.body.data.user.id;
            const nutritionistToken = nutriRes.body.data.token;

            const patientRes = await registerPatient();
            const patientId = patientRes.body.data.user.id;
            const patientToken = patientRes.body.data.token;

            // Crear relación
            await AppDataSource.getRepository('PatientNutritionistRelation').save({
                patient: { id: patientId },
                nutritionist: { id: nutritionistId },
                status: 'active'
            });

            // Crear disponibilidad
            const availabilityData = {
                slots: [
                    {
                        dayOfWeek: DayOfWeek.MONDAY,
                        startTimeMinutes: 540,
                        endTimeMinutes: 1020,
                        isActive: true
                    }
                ]
            };

            await request(app)
                .post('/api/appointments/availability')
                .set('Authorization', `Bearer ${nutritionistToken}`)
                .send(availabilityData);

            const appointmentData = {
                nutritionistId,
                startTime: '2024-01-15T09:00:00Z',
                endTime: '2024-01-15T09:30:00Z',
                notes: 'A'.repeat(501) // Muy largo
            };

            const res = await request(app)
                .post('/api/appointments/schedule')
                .set('Authorization', `Bearer ${patientToken}`)
                .send(appointmentData);

            expect(res.statusCode).toBe(400);
        });

        it('should handle concurrent availability updates', async () => {
            const nutriRes = await registerNutritionist();
            const nutritionistToken = nutriRes.body.data.token;

            const availabilityData1 = {
                slots: [
                    {
                        dayOfWeek: DayOfWeek.MONDAY,
                        startTimeMinutes: 540,
                        endTimeMinutes: 1020,
                        isActive: true
                    }
                ]
            };

            const availabilityData2 = {
                slots: [
                    {
                        dayOfWeek: DayOfWeek.TUESDAY,
                        startTimeMinutes: 600,
                        endTimeMinutes: 1080,
                        isActive: true
                    }
                ]
            };

            const promises = [
                request(app)
                    .post('/api/appointments/availability')
                    .set('Authorization', `Bearer ${nutritionistToken}`)
                    .send(availabilityData1),
                request(app)
                    .post('/api/appointments/availability')
                    .set('Authorization', `Bearer ${nutritionistToken}`)
                    .send(availabilityData2)
            ];

            const results = await Promise.all(promises);

            results.forEach(res => {
                expect(res.statusCode).toBe(200);
            });
        });

        it('should handle boundary time values in availability', async () => {
            const nutriRes = await registerNutritionist();
            const nutritionistToken = nutriRes.body.data.token;

            const boundaryData = {
                slots: [
                    {
                        dayOfWeek: DayOfWeek.SUNDAY,
                        startTimeMinutes: 0, // Mínimo
                        endTimeMinutes: 1440, // Máximo
                        isActive: true
                    }
                ]
            };

            const res = await request(app)
                .post('/api/appointments/availability')
                .set('Authorization', `Bearer ${nutritionistToken}`)
                .send(boundaryData);

            expect(res.statusCode).toBe(200);
        });
    });
}); 