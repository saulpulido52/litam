import request from 'supertest';
import app from '../../app';

describe('Sistema de Monetización - Pruebas Básicas', () => {
  let adminToken: string;
  let nutritionistToken: string;
  let patientToken: string;

  beforeAll(async () => {
    // Obtener tokens de prueba (asumiendo que existen usuarios de prueba)
    try {
      const adminResponse = await request(app)
        .post('/api/auth/login')
        .send({ email: 'admin@test.com', password: 'password123' });
      adminToken = adminResponse.body.data.token;
    } catch (error) {
      console.log('No se pudo obtener token de admin, continuando con pruebas básicas');
    }

    try {
      const nutritionistResponse = await request(app)
        .post('/api/auth/login')
        .send({ email: 'nutritionist@test.com', password: 'password123' });
      nutritionistToken = nutritionistResponse.body.data.token;
    } catch (error) {
      console.log('No se pudo obtener token de nutriólogo');
    }

    try {
      const patientResponse = await request(app)
        .post('/api/auth/login')
        .send({ email: 'patient@test.com', password: 'password123' });
      patientToken = patientResponse.body.data.token;
    } catch (error) {
      console.log('No se pudo obtener token de paciente');
    }
  });

  describe('GET /api/monetization/nutritionist-tiers', () => {
    it('debería obtener todos los tiers de nutriólogos', async () => {
      const response = await request(app)
        .get('/api/monetization/nutritionist-tiers')
        .expect(200);

      expect(response.body.status).toBe('success');
      expect(response.body.data.tiers).toBeDefined();
      expect(Array.isArray(response.body.data.tiers)).toBe(true);
    });
  });

  describe('GET /api/monetization/patient-tiers', () => {
    it('debería obtener todos los tiers de pacientes', async () => {
      const response = await request(app)
        .get('/api/monetization/patient-tiers')
        .expect(200);

      expect(response.body.status).toBe('success');
      expect(response.body.data.tiers).toBeDefined();
      expect(Array.isArray(response.body.data.tiers)).toBe(true);
    });
  });

  describe('Validación de Funcionalidades - Endpoints Públicos', () => {
    it('debería responder correctamente a endpoints de validación', async () => {
      // Probar que los endpoints existen y responden
      const endpoints = [
        '/api/monetization/check/nutritionist/ai-access',
        '/api/monetization/check/nutritionist/unlimited-patients',
        '/api/monetization/check/patient/ai-food-scanning',
        '/api/monetization/check/patient/barcode-scanning',
        '/api/monetization/check/patient/ads'
      ];

      for (const endpoint of endpoints) {
        const response = await request(app)
          .get(endpoint)
          .expect(401); // Debería requerir autenticación

        expect(response.body).toBeDefined();
      }
    });
  });

  describe('Estadísticas - Solo Admin', () => {
    it('debería requerir autenticación para estadísticas', async () => {
      const endpoints = [
        '/api/monetization/stats/nutritionist-tiers',
        '/api/monetization/stats/patient-tiers'
      ];

      for (const endpoint of endpoints) {
        await request(app)
          .get(endpoint)
          .expect(401); // Debería requerir autenticación
      }
    });
  });

  describe('Asignación de Tiers - Solo Admin', () => {
    it('debería requerir autenticación para asignar tiers', async () => {
      const endpoints = [
        '/api/monetization/assign/nutritionist-tier',
        '/api/monetization/assign/patient-tier'
      ];

      for (const endpoint of endpoints) {
        await request(app)
          .post(endpoint)
          .send({ userId: 'test', tierId: 'test' })
          .expect(401); // Debería requerir autenticación
      }
    });
  });

  describe('Inicialización de Tiers', () => {
    it('debería requerir autenticación para inicializar tiers', async () => {
      await request(app)
        .post('/api/monetization/initialize-default-tiers')
        .expect(401); // Debería requerir autenticación
    });
  });
}); 