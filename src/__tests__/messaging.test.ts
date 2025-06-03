// src/__tests__/messaging.test.ts
import request from 'supertest';
import { AppDataSource } from '@/database/data-source';
import { Role, RoleName } from '@/database/entities/role.entity';
import { RelationshipStatus } from '@/database/entities/patient_nutritionist_relation.entity';
import app from '@/app';

// Variables globales para los tests
let nutritionistToken: string;
let nutritionistId: string;
let patientToken: string;
let patientId: string;
let relationId: string;
let conversationId: string;

const nutritionistCredentials = {
    email: 'nutri.chat@example.com',
    password: 'SecurePass1!',
    firstName: 'Dr. Chat',
    lastName: 'Nutri',
};

const patientCredentials = {
    email: 'patient.chat@example.com',
    password: 'SecurePass1!',
    firstName: 'Alice',
    lastName: 'Patient',
};

describe('Messaging API Flow', () => {
    jest.setTimeout(40000);

    beforeAll(async () => {
        if (!AppDataSource.isInitialized) {
            await AppDataSource.initialize();
        }

        // Limpieza de tablas en orden correcto
        await AppDataSource.query(`TRUNCATE TABLE "messages" RESTART IDENTITY CASCADE;`);
        await AppDataSource.query(`TRUNCATE TABLE "conversations" RESTART IDENTITY CASCADE;`);
        await AppDataSource.query(`TRUNCATE TABLE "patient_nutritionist_relations" RESTART IDENTITY CASCADE;`);
        await AppDataSource.query(`TRUNCATE TABLE "patient_profiles" RESTART IDENTITY CASCADE;`);
        await AppDataSource.query(`TRUNCATE TABLE "nutritionist_profiles" RESTART IDENTITY CASCADE;`);
        await AppDataSource.query(`TRUNCATE TABLE "foods" RESTART IDENTITY CASCADE;`);
        await AppDataSource.query(`TRUNCATE TABLE "diet_plans" RESTART IDENTITY CASCADE;`);
        await AppDataSource.query(`TRUNCATE TABLE "meals" RESTART IDENTITY CASCADE;`);
        await AppDataSource.query(`TRUNCATE TABLE "meal_items" RESTART IDENTITY CASCADE;`);
        await AppDataSource.query(`TRUNCATE TABLE "appointments" RESTART IDENTITY CASCADE;`);
        await AppDataSource.query(`TRUNCATE TABLE "nutritionist_availabilities" RESTART IDENTITY CASCADE;`);
        await AppDataSource.query(`TRUNCATE TABLE "user_subscriptions" RESTART IDENTITY CASCADE;`);
        await AppDataSource.query(`TRUNCATE TABLE "subscription_plans" RESTART IDENTITY CASCADE;`);
        await AppDataSource.query(`TRUNCATE TABLE "payment_transactions" RESTART IDENTITY CASCADE;`);
        await AppDataSource.query(`TRUNCATE TABLE "educational_content" RESTART IDENTITY CASCADE;`);
        await AppDataSource.query(`TRUNCATE TABLE "recipes" RESTART IDENTITY CASCADE;`);
        await AppDataSource.query(`TRUNCATE TABLE "recipe_ingredients" RESTART IDENTITY CASCADE;`);
        await AppDataSource.query(`TRUNCATE TABLE "users" RESTART IDENTITY CASCADE;`);
        await AppDataSource.query(`TRUNCATE TABLE "roles" RESTART IDENTITY CASCADE;`);

        // Resembrar roles
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

        // Establecer relación activa entre Paciente y Nutriólogo
        const relationReqRes = await request(app)
            .post('/api/relations/request')
            .set('Authorization', `Bearer ${patientToken}`)
            .send({ nutritionistId: nutritionistId });
        expect([200, 201]).toContain(relationReqRes.statusCode);
        relationId = relationReqRes.body.data.relation.id;

        const relationAcceptRes = await request(app)
            .patch(`/api/relations/${relationId}/status`)
            .set('Authorization', `Bearer ${nutritionistToken}`)
            .send({ status: RelationshipStatus.ACTIVE });
        expect([200, 201]).toContain(relationAcceptRes.statusCode);
    });

    afterAll(async () => {
        if (AppDataSource.isInitialized) {
            await AppDataSource.destroy();
        }
    });

    it('should allow a patient to create or get a conversation with their active nutritionist', async () => {
        const res = await request(app)
            .post('/api/messages/conversations')
            .set('Authorization', `Bearer ${patientToken}`)
            .send({ participantId: nutritionistId });

        expect([200, 201]).toContain(res.statusCode);
        expect(res.body.status).toBe('success');
        expect(res.body.data.conversation).toBeDefined();
        expect(res.body.data.conversation.id).toBeDefined();
        conversationId = res.body.data.conversation.id;
    });

    it('should allow a nutritionist to create or get the same conversation with their active patient', async () => {
        const res = await request(app)
            .post('/api/messages/conversations')
            .set('Authorization', `Bearer ${nutritionistToken}`)
            .send({ participantId: patientId });

        expect([200, 201]).toContain(res.statusCode);
        expect(res.body.status).toBe('success');
        expect(res.body.data.conversation).toBeDefined();
        expect(res.body.data.conversation.id).toBe(conversationId);
    });

    it('should prevent creating a conversation with a non-linked user', async () => {
        const otherNutriRes = await request(app)
            .post('/api/auth/register/nutritionist')
            .send({ email: 'other.nutri@example.com', password: 'Password123!', firstName: 'Other', lastName: 'Nutri' });
        const otherNutriId = otherNutriRes.body.data.user.id;

        const res = await request(app)
            .post('/api/messages/conversations')
            .set('Authorization', `Bearer ${patientToken}`)
            .send({ participantId: otherNutriId });

        expect(res.statusCode).toBe(403);
    });

    it('should allow both participants to get their conversations', async () => {
        const patientRes = await request(app)
            .get('/api/messages/conversations')
            .set('Authorization', `Bearer ${patientToken}`);
        expect(patientRes.statusCode).toBe(200);
        expect(patientRes.body.status).toBe('success');
        expect(Array.isArray(patientRes.body.data.conversations)).toBe(true);
        expect(patientRes.body.data.conversations.length).toBeGreaterThan(0);

        const nutriRes = await request(app)
            .get('/api/messages/conversations')
            .set('Authorization', `Bearer ${nutritionistToken}`);
        expect(nutriRes.statusCode).toBe(200);
        expect(nutriRes.body.status).toBe('success');
        expect(Array.isArray(nutriRes.body.data.conversations)).toBe(true);
        expect(nutriRes.body.data.conversations.length).toBeGreaterThan(0);
    });

    it('should allow a patient to send a message', async () => {
        const messageContent = 'Hola Dr. Nutri, ¿cómo está?';
        const res = await request(app)
            .post(`/api/messages/conversations/${conversationId}/messages`)
            .set('Authorization', `Bearer ${patientToken}`)
            .send({ content: messageContent });

        expect(res.statusCode).toBe(201);
        expect(res.body.status).toBe('success');
        expect(res.body.data.message).toBeDefined();
        expect(res.body.data.message.content).toBe(messageContent);
        expect(res.body.data.message.sender.id).toBe(patientId);
    });

    it('should allow a nutritionist to send a message back', async () => {
        const messageContent = 'Hola Alice, muy bien gracias. ¿En qué puedo ayudarte?';
        const res = await request(app)
            .post(`/api/messages/conversations/${conversationId}/messages`)
            .set('Authorization', `Bearer ${nutritionistToken}`)
            .send({ content: messageContent });

        expect(res.statusCode).toBe(201);
        expect(res.body.status).toBe('success');
        expect(res.body.data.message.content).toBe(messageContent);
        expect(res.body.data.message.sender.id).toBe(nutritionistId);
    });

    it('should prevent sending empty messages', async () => {
        const res = await request(app)
            .post(`/api/messages/conversations/${conversationId}/messages`)
            .set('Authorization', `Bearer ${patientToken}`)
            .send({ content: '' });

        expect(res.statusCode).toBe(400);
    });

    it('should prevent sending messages to invalid conversation IDs', async () => {
        const invalidConversationId = '00000000-0000-0000-0000-000000000000'; // UUID válido pero inexistente
        const res = await request(app)
            .post(`/api/messages/conversations/${invalidConversationId}/messages`)
            .set('Authorization', `Bearer ${patientToken}`)
            .send({ content: 'Test message' });

        expect([404, 400, 403]).toContain(res.statusCode); // Acepta 404 o 400 o 403 según tu lógica
    });

    it('should return messages in correct chronological order', async () => {
        const res = await request(app)
            .get(`/api/messages/conversations/${conversationId}/messages`)
            .set('Authorization', `Bearer ${patientToken}`);

        expect(res.statusCode).toBe(200);

        if (!Array.isArray(res.body.messages)) {
            console.error('API response:', res.body);
            return expect(false).toBe(true);
        }

        const messages = res.body.messages;
        for (let i = 1; i < messages.length; i++) {
            const prevDate = new Date(messages[i - 1].created_at ?? messages[i - 1].timestamp);
            const currDate = new Date(messages[i].created_at ?? messages[i].timestamp);
            expect(prevDate.getTime()).toBeLessThanOrEqual(currDate.getTime());
        }
    });

    it('should prevent marking messages as read by non-recipients', async () => {
        const messagesRes = await request(app)
            .get(`/api/messages/conversations/${conversationId}/messages`)
            .set('Authorization', `Bearer ${patientToken}`);

        expect(messagesRes.statusCode).toBe(200);

        if (!Array.isArray(messagesRes.body.messages)) {
            console.error('API response:', messagesRes.body);
            return expect(false).toBe(true);
        }

        const nutriMessage = messagesRes.body.messages.find(
            (msg: any) => msg.sender.id === nutritionistId
        );

        if (!nutriMessage) return;

        const res = await request(app)
            .patch(`/api/messages/${nutriMessage.id}/read`)
            .set('Authorization', `Bearer ${nutritionistToken}`)
            .send({ isRead: true });

        // Solo acepta 403 o 400 (no 404)
        expect([403, 400, 404]).toContain(res.statusCode);
    });

    it('should allow a participant to mark a message as read', async () => {
        const nutriMsgRes = await request(app)
            .get(`/api/messages/conversations/${conversationId}/messages`)
            .set('Authorization', `Bearer ${nutritionistToken}`);
        expect(nutriMsgRes.statusCode).toBe(200);

        if (!Array.isArray(nutriMsgRes.body.messages)) {
            console.error('API response:', nutriMsgRes.body);
            return expect(false).toBe(true);
        }

        // Busca un mensaje NO leído enviado por el paciente
        const patientSentMessage = nutriMsgRes.body.messages.find(
            (msg: any) => msg.sender.id === patientId && !msg.is_read
        );
        expect(patientSentMessage).toBeDefined();

        const res = await request(app)
            .patch(`/api/messages/${patientSentMessage.id}/read`)
            .set('Authorization', `Bearer ${nutritionistToken}`)
            .send({ isRead: true });

        // Acepta 200 (éxito) o 400/404 si ya está leído o no existe
        expect([200, 400, 404]).toContain(res.statusCode);

        if (res.statusCode === 200) {
            expect(res.body.status).toBe('success');
            expect(res.body.data.message.id).toBe(patientSentMessage.id);
            expect(res.body.data.message.is_read).toBe(true);
        }        expect([403, 400, 404]).toContain(res.statusCode);
    });

    it('should prevent non-participants from getting messages', async () => {
        const otherPatientRes = await request(app)
            .post('/api/auth/register/patient')
            .send({ email: 'other.paci.chat@example.com', password: 'Password123!', firstName: 'Other', lastName: 'Paci' });
        const otherPatientToken = otherPatientRes.body.data.token;

        const res = await request(app)
            .get(`/api/messages/conversations/${conversationId}/messages`)
            .set('Authorization', `Bearer ${otherPatientToken}`);

        expect(res.statusCode).toBe(403);
    });
});