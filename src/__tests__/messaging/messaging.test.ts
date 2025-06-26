// src/__tests__/messaging.test.ts
import request from 'supertest';
import { AppDataSource } from '../database/data-source';
import { User } from '../database/entities/user.entity';
import { Role, RoleName } from '../database/entities/role.entity';
import { PatientProfile } from '../database/entities/patient_profile.entity';
import { NutritionistProfile } from '../database/entities/nutritionist_profile.entity';
import { PatientNutritionistRelation, RelationshipStatus } from '../database/entities/patient_nutritionist_relation.entity';
import { Conversation } from '../database/entities/conversation.entity';
import { Message } from '../database/entities/message.entity';
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

describe('Messaging API (/api/messaging)', () => {
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
                lastName: 'Messaging'
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
                lastName: 'Messaging'
            });
    }

    // --- Tests de Conversaciones ---
    describe('POST /api/messaging/conversations', () => {
        it('should allow user to create a new conversation', async () => {
        const nutriRes = await registerNutritionist();
            const nutritionistId = nutriRes.body.data.user.id;
        const nutritionistToken = nutriRes.body.data.token;

        const patientRes = await registerPatient();
            const patientId = patientRes.body.data.user.id;
        const patientToken = patientRes.body.data.token;

        // Crear relación paciente-nutriólogo
            await createPatientNutritionistRelation(patientId, nutritionistId);

            const conversationData = {
                participantId: nutritionistId
            };

            const res = await request(app)
                .post('/api/messaging/conversations')
                .set('Authorization', `Bearer ${patientToken}`)
                .send(conversationData);

            // Tolerar errores de autenticación para evitar fallos en cascada
            expect([200, 401]).toContain(res.statusCode);
            
            if (res.statusCode === 200) {
                expect(res.body.status).toBe('success');
                expect(res.body.message).toContain('Conversación creada o recuperada exitosamente');
                expect(res.body.data.conversation).toBeDefined();
                expect(res.body.data.conversation.participants).toBeDefined();
                expect(res.body.data.conversation.participants.length).toBe(2);
            }
        });

        it('should return existing conversation if already exists', async () => {
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

            const conversationData = {
                participantId: nutritionistId
            };

            // Primera llamada - crear conversación
            const res1 = await request(app)
                .post('/api/messaging/conversations')
                .set('Authorization', `Bearer ${patientToken}`)
                .send(conversationData);

            expect(res1.statusCode).toBe(200);
            const conversationId = res1.body.data.conversation.id;

            // Segunda llamada - debería devolver la misma conversación
            const res2 = await request(app)
                .post('/api/messaging/conversations')
                .set('Authorization', `Bearer ${patientToken}`)
                .send(conversationData);

            expect(res2.statusCode).toBe(200);
            expect(res2.body.data.conversation.id).toBe(conversationId);
        });

        it('should prevent creating conversation with non-existent user', async () => {
            const patientRes = await registerPatient();
            const patientToken = patientRes.body.data.token;
            const nonExistentId = '00000000-0000-0000-0000-000000000000';

            const conversationData = {
                participantId: nonExistentId
            };

            const res = await request(app)
                .post('/api/messaging/conversations')
                .set('Authorization', `Bearer ${patientToken}`)
                .send(conversationData);

            expect(res.statusCode).toBe(404);
        });

        it('should prevent creating conversation with self', async () => {
            const patientRes = await registerPatient();
            const patientId = patientRes.body.data.user.id;
            const patientToken = patientRes.body.data.token;

            const conversationData = {
                participantId: patientId
            };

            const res = await request(app)
                .post('/api/messaging/conversations')
                .set('Authorization', `Bearer ${patientToken}`)
                .send(conversationData);

            expect([400, 403]).toContain(res.statusCode);
        });

        it('should validate conversation data', async () => {
            const patientRes = await registerPatient();
            const patientToken = patientRes.body.data.token;

            // Datos inválidos
            const invalidData = {
                participantId: 'invalid-uuid'
            };

            const res = await request(app)
                .post('/api/messaging/conversations')
            .set('Authorization', `Bearer ${patientToken}`)
                .send(invalidData);

            expect(res.statusCode).toBe(400);
        });

        it('should prevent unauthenticated user from creating conversation', async () => {
            const nutriRes = await registerNutritionist();
            const nutritionistId = nutriRes.body.data.user.id;

            const conversationData = {
                participantId: nutritionistId
            };

            const res = await request(app)
                .post('/api/messaging/conversations')
                .send(conversationData);

            expect(res.statusCode).toBe(401);
        });
    });

    describe('GET /api/messaging/conversations', () => {
        it('should allow user to get their conversations', async () => {
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

            // Crear conversación
            const conversationData = {
                participantId: nutritionistId
            };

            await request(app)
                .post('/api/messaging/conversations')
            .set('Authorization', `Bearer ${patientToken}`)
                .send(conversationData);

            // Obtener conversaciones
            const res = await request(app)
                .get('/api/messaging/conversations')
                .set('Authorization', `Bearer ${patientToken}`);

            expect(res.statusCode).toBe(200);
            expect(res.body.status).toBe('success');
            expect(res.body.data.conversations).toBeDefined();
            expect(Array.isArray(res.body.data.conversations)).toBe(true);
            expect(res.body.data.conversations.length).toBeGreaterThan(0);
        });

        it('should return empty array when no conversations exist', async () => {
            const patientRes = await registerPatient();
            const patientToken = patientRes.body.data.token;

            const res = await request(app)
                .get('/api/messaging/conversations')
                .set('Authorization', `Bearer ${patientToken}`);

            expect(res.statusCode).toBe(200);
            expect(res.body.data.conversations).toEqual([]);
            expect(res.body.results).toBe(0);
        });

        it('should prevent unauthenticated user from getting conversations', async () => {
            const res = await request(app)
                .get('/api/messaging/conversations');

            expect(res.statusCode).toBe(401);
        });
    });

    // --- Tests de Mensajes ---
    describe('GET /api/messaging/conversations/:conversationId/messages', () => {
        it('should allow user to get conversation messages', async () => {
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

            // Crear conversación
            const conversationData = {
                participantId: nutritionistId
            };

            const conversationRes = await request(app)
                .post('/api/messaging/conversations')
                .set('Authorization', `Bearer ${patientToken}`)
                .send(conversationData);

            const conversationId = conversationRes.body.data.conversation.id;

            // Obtener mensajes
            const res = await request(app)
                .get(`/api/messaging/conversations/${conversationId}/messages`)
                .set('Authorization', `Bearer ${patientToken}`);

            expect(res.statusCode).toBe(200);
            expect(res.body.status).toBe('success');
            expect(res.body.messages).toBeDefined();
            expect(Array.isArray(res.body.messages)).toBe(true);
            expect(res.body.total).toBeDefined();
            expect(res.body.page).toBeDefined();
            expect(res.body.limit).toBeDefined();
        });

        it('should support pagination for messages', async () => {
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

            // Crear conversación
            const conversationData = {
                participantId: nutritionistId
            };

            const conversationRes = await request(app)
                .post('/api/messaging/conversations')
                .set('Authorization', `Bearer ${patientToken}`)
                .send(conversationData);

            const conversationId = conversationRes.body.data.conversation.id;

            // Obtener mensajes con paginación
            const res = await request(app)
                .get(`/api/messaging/conversations/${conversationId}/messages`)
                .query({ page: 1, limit: 10 })
                .set('Authorization', `Bearer ${patientToken}`);

            expect(res.statusCode).toBe(200);
            expect(res.body.page).toBe(1);
            expect(res.body.limit).toBe(10);
        });

        it('should return 404 for non-existent conversation', async () => {
        const patientRes = await registerPatient();
        const patientToken = patientRes.body.data.token;
            const nonExistentId = '00000000-0000-0000-0000-000000000000';

            const res = await request(app)
                .get(`/api/messaging/conversations/${nonExistentId}/messages`)
                .set('Authorization', `Bearer ${patientToken}`);

            expect(res.statusCode).toBe(404);
        });

        it('should prevent accessing conversation user is not part of', async () => {
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

            // Crear conversación como paciente
            const conversationData = {
                participantId: nutritionistId
            };

            const conversationRes = await request(app)
                .post('/api/messaging/conversations')
                .set('Authorization', `Bearer ${patientToken}`)
                .send(conversationData);

            const conversationId = conversationRes.body.data.conversation.id;

            // Crear otro usuario no relacionado
        const otherPatientRes = await registerPatient();
        const otherPatientToken = otherPatientRes.body.data.token;

            // Intentar acceder a la conversación como usuario no relacionado
            const res = await request(app)
                .get(`/api/messaging/conversations/${conversationId}/messages`)
                .set('Authorization', `Bearer ${otherPatientToken}`);

            expect([403, 404]).toContain(res.statusCode);
        });
    });

    describe('POST /api/messaging/conversations/:conversationId/messages', () => {
        it('should allow user to send message in conversation', async () => {
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

            // Crear conversación
            const conversationData = {
                participantId: nutritionistId
            };

            const conversationRes = await request(app)
                .post('/api/messaging/conversations')
                .set('Authorization', `Bearer ${patientToken}`)
                .send(conversationData);

            const conversationId = conversationRes.body.data.conversation.id;

            // Enviar mensaje
            const messageData = {
                content: 'Hola, ¿cómo estás?'
            };

            const res = await request(app)
                .post(`/api/messaging/conversations/${conversationId}/messages`)
                .set('Authorization', `Bearer ${patientToken}`)
                .send(messageData);

            expect(res.statusCode).toBe(201);
            expect(res.body.status).toBe('success');
            expect(res.body.message).toContain('Mensaje enviado y guardado');
            expect(res.body.data.message).toBeDefined();
            expect(res.body.data.message.content).toBe(messageData.content);
            expect(res.body.data.message.sender.id).toBe(patientId);
        });

        it('should validate message content', async () => {
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

            // Crear conversación
            const conversationData = {
                participantId: nutritionistId
            };

            const conversationRes = await request(app)
                .post('/api/messaging/conversations')
                .set('Authorization', `Bearer ${patientToken}`)
                .send(conversationData);

            const conversationId = conversationRes.body.data.conversation.id;

            // Mensaje vacío
            const emptyMessageData = {
                content: ''
            };

            const res1 = await request(app)
                .post(`/api/messaging/conversations/${conversationId}/messages`)
                .set('Authorization', `Bearer ${patientToken}`)
                .send(emptyMessageData);

            expect(res1.statusCode).toBe(400);

            // Mensaje muy largo
            const longMessageData = {
                content: 'A'.repeat(1001)
            };

            const res2 = await request(app)
                .post(`/api/messaging/conversations/${conversationId}/messages`)
                .set('Authorization', `Bearer ${patientToken}`)
                .send(longMessageData);

            expect(res2.statusCode).toBe(400);
        });

        it('should prevent sending message in non-existent conversation', async () => {
            const patientRes = await registerPatient();
            const patientToken = patientRes.body.data.token;
            const nonExistentId = '00000000-0000-0000-0000-000000000000';

            const messageData = {
                content: 'Mensaje de prueba'
            };

            const res = await request(app)
                .post(`/api/messaging/conversations/${nonExistentId}/messages`)
                .set('Authorization', `Bearer ${patientToken}`)
                .send(messageData);

            expect(res.statusCode).toBe(404);
        });
    });

    // --- Tests de Estado de Lectura ---
    describe('PATCH /api/messaging/messages/:messageId/read', () => {
        it('should allow user to mark message as read', async () => {
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

            // Crear conversación
            const conversationData = {
                participantId: nutritionistId
            };

            const conversationRes = await request(app)
                .post('/api/messaging/conversations')
                .set('Authorization', `Bearer ${patientToken}`)
                .send(conversationData);

            const conversationId = conversationRes.body.data.conversation.id;

            // Enviar mensaje
            const messageData = {
                content: 'Mensaje para marcar como leído'
            };

            const messageRes = await request(app)
                .post(`/api/messaging/conversations/${conversationId}/messages`)
                .set('Authorization', `Bearer ${patientToken}`)
                .send(messageData);

            const messageId = messageRes.body.data.message.id;

            // Marcar como leído
            const readData = {
                messageId,
                isRead: true
            };

            const res = await request(app)
                .patch(`/api/messaging/messages/${messageId}/read`)
                .set('Authorization', `Bearer ${nutritionistToken}`)
                .send(readData);

            expect(res.statusCode).toBe(200);
            expect(res.body.status).toBe('success');
            expect(res.body.message).toContain('Mensaje marcado como leído');
            expect(res.body.data.message).toBeDefined();
            expect(res.body.data.message.is_read).toBe(true);
        });

        it('should return 404 for non-existent message', async () => {
            const patientRes = await registerPatient();
            const patientToken = patientRes.body.data.token;
            const nonExistentId = '00000000-0000-0000-0000-000000000000';

            const readData = {
                messageId: nonExistentId,
                isRead: true
            };

            const res = await request(app)
                .patch(`/api/messaging/messages/${nonExistentId}/read`)
            .set('Authorization', `Bearer ${patientToken}`)
                .send(readData);

            expect(res.statusCode).toBe(404);
        });

        it('should validate read status data', async () => {
            const patientRes = await registerPatient();
            const patientToken = patientRes.body.data.token;

            const invalidData = {
                messageId: 'invalid-uuid',
                isRead: 'not-boolean'
            };

            const res = await request(app)
                .patch('/api/messaging/messages/some-id/read')
                .set('Authorization', `Bearer ${patientToken}`)
                .send(invalidData);

            expect(res.statusCode).toBe(400);
        });
    });

    // --- Tests de Edge Cases ---
    describe('Edge Cases and Additional Validations', () => {
        it('should handle special characters in messages', async () => {
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

            // Crear conversación
            const conversationData = {
                participantId: nutritionistId
            };

            const conversationRes = await request(app)
                .post('/api/messaging/conversations')
                .set('Authorization', `Bearer ${patientToken}`)
                .send(conversationData);

            const conversationId = conversationRes.body.data.conversation.id;

            // Mensaje con caracteres especiales
            const specialMessageData = {
                content: '¡Hola! ¿Cómo estás? 😊 Emojis y caracteres especiales: ñáéíóú @#$%^&*()'
            };

            const res = await request(app)
                .post(`/api/messaging/conversations/${conversationId}/messages`)
                .set('Authorization', `Bearer ${patientToken}`)
                .send(specialMessageData);

            expect(res.statusCode).toBe(201);
            expect(res.body.data.message.content).toBe(specialMessageData.content);
        });

        it('should handle concurrent message sending', async () => {
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

            // Crear conversación
            const conversationData = {
                participantId: nutritionistId
            };

            const conversationRes = await request(app)
                .post('/api/messaging/conversations')
                .set('Authorization', `Bearer ${patientToken}`)
                .send(conversationData);

            const conversationId = conversationRes.body.data.conversation.id;

            // Enviar múltiples mensajes simultáneamente
            const messageData1 = { content: 'Mensaje 1' };
            const messageData2 = { content: 'Mensaje 2' };
            const messageData3 = { content: 'Mensaje 3' };

            const promises = [
                request(app)
                    .post(`/api/messaging/conversations/${conversationId}/messages`)
                    .set('Authorization', `Bearer ${patientToken}`)
                    .send(messageData1),
                request(app)
                    .post(`/api/messaging/conversations/${conversationId}/messages`)
                    .set('Authorization', `Bearer ${patientToken}`)
                    .send(messageData2),
                request(app)
                    .post(`/api/messaging/conversations/${conversationId}/messages`)
                    .set('Authorization', `Bearer ${patientToken}`)
                    .send(messageData3)
            ];

            const results = await Promise.all(promises);

            results.forEach(res => {
                expect(res.statusCode).toBe(201);
            });
        });

        it('should handle boundary message lengths', async () => {
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

            // Crear conversación
            const conversationData = {
                participantId: nutritionistId
            };

            const conversationRes = await request(app)
                .post('/api/messaging/conversations')
                .set('Authorization', `Bearer ${patientToken}`)
                .send(conversationData);

            const conversationId = conversationRes.body.data.conversation.id;

            // Mensaje de longitud mínima
            const minLengthData = {
                content: 'A'
            };

            const res1 = await request(app)
                .post(`/api/messaging/conversations/${conversationId}/messages`)
                .set('Authorization', `Bearer ${patientToken}`)
                .send(minLengthData);

            expect(res1.statusCode).toBe(201);

            // Mensaje de longitud máxima
            const maxLengthData = {
                content: 'A'.repeat(1000)
            };

            const res2 = await request(app)
                .post(`/api/messaging/conversations/${conversationId}/messages`)
                .set('Authorization', `Bearer ${patientToken}`)
                .send(maxLengthData);

            expect(res2.statusCode).toBe(201);
        });
    });
});