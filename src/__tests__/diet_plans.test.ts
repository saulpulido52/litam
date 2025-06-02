// src/__tests__/diet_plans.test.ts
// ESTE ES UN ARCHIVO DE PRUEBA TEMPORAL PARA DEPURACIÓN. NO ES EL CÓDIGO COMPLETO DE PRUEBAS.

import request from 'supertest';
import app from '@/app';

describe('Diet Plans Basic Connectivity Test', () => {
    it('should return 200 OK for /api/health endpoint', async () => {
        const res = await request(app).get('/api/health');
        expect(res.statusCode).toBe(200);
        expect(res.body.status).toBe('UP');
    });
});