import request from 'supertest';
import { AppDataSource } from '../../database/data-source';
import { User } from '../../database/entities/user.entity';
import { Role, RoleName } from '../../database/entities/role.entity';
import { PatientNutritionistRelation, RelationshipStatus } from '../../database/entities/patient_nutritionist_relation.entity';
import app from '../../app';
import jwt from 'jsonwebtoken';
import { Repository } from 'typeorm';

describe('Dashboard API Integration Tests - Individualization', () => {
  let userRepository: Repository<User>;
  let roleRepository: Repository<Role>;
  let relationRepository: Repository<PatientNutritionistRelation>;
  
  let nutritionist1: User;
  let nutritionist2: User;
  let patient1: User;
  let patient2: User;
  let patient3: User;
  let token1: string;
  let token2: string;

  beforeAll(async () => {
    // Initialize database connection
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
    }

    // Initialize repositories
    userRepository = AppDataSource.getRepository(User);
    roleRepository = AppDataSource.getRepository(Role);
    relationRepository = AppDataSource.getRepository(PatientNutritionistRelation);
  });

  beforeEach(async () => {
    // Clean up test data
    await cleanupTestData();
    
    // Create test roles
    const patientRole = await roleRepository.save({
      name: RoleName.PATIENT
    });

    const nutritionistRole = await roleRepository.save({
      name: RoleName.NUTRITIONIST
    });

    // Create test users
    nutritionist1 = await userRepository.save({
      email: 'integration.nutritionist1@test.com',
      first_name: 'Integration',
      last_name: 'Nutritionist1',
      password: '$2b$10$hashedpassword1',
      role: nutritionistRole,
      is_active: true
    });

    nutritionist2 = await userRepository.save({
      email: 'integration.nutritionist2@test.com',
      first_name: 'Integration',
      last_name: 'Nutritionist2',
      password: '$2b$10$hashedpassword2',
      role: nutritionistRole,
      is_active: true
    });

    patient1 = await userRepository.save({
      email: 'integration.patient1@test.com',
      first_name: 'Integration',
      last_name: 'Patient1',
      password: '$2b$10$hashedpassword',
      role: patientRole,
      is_active: true
    });

    patient2 = await userRepository.save({
      email: 'integration.patient2@test.com',
      first_name: 'Integration',
      last_name: 'Patient2',
      password: '$2b$10$hashedpassword',
      role: patientRole,
      is_active: true
    });

    patient3 = await userRepository.save({
      email: 'integration.patient3@test.com',
      first_name: 'Integration',
      last_name: 'Patient3',
      password: '$2b$10$hashedpassword',
      role: patientRole,
      is_active: true
    });

    // Create JWT tokens for authentication
    const jwtSecret = process.env.JWT_SECRET || 'test-secret';
    token1 = jwt.sign(
      { 
        userId: nutritionist1.id, 
        email: nutritionist1.email, 
        role: nutritionist1.role.name 
      },
      jwtSecret,
      { expiresIn: '1h' }
    );

    token2 = jwt.sign(
      { 
        userId: nutritionist2.id, 
        email: nutritionist2.email, 
        role: nutritionist2.role.name 
      },
      jwtSecret,
      { expiresIn: '1h' }
    );

    // Create patient-nutritionist relations
    await relationRepository.save([
      {
        nutritionist: nutritionist1,
        patient: patient1,
        status: RelationshipStatus.ACTIVE,
        requested_at: new Date()
      },
      {
        nutritionist: nutritionist1,
        patient: patient2,
        status: RelationshipStatus.ACTIVE,
        requested_at: new Date()
      },
      {
        nutritionist: nutritionist2,
        patient: patient3,
        status: RelationshipStatus.ACTIVE,
        requested_at: new Date()
      }
    ]);
  });

  afterEach(async () => {
    await cleanupTestData();
  });

  afterAll(async () => {
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
    }
  });

  async function cleanupTestData() {
    try {
      // Clean up relations first
      await relationRepository.clear();
      
      // Delete test users specifically
      await userRepository.createQueryBuilder()
        .delete()
        .where("email LIKE :pattern", { pattern: '%@test.com' })
        .execute();
        
      // Delete test roles specifically
      await roleRepository.createQueryBuilder()
        .delete()
        .where("name IN (:...names)", { names: [RoleName.PATIENT, RoleName.NUTRITIONIST] })
        .execute();
    } catch (error) {
      // Ignore cleanup errors to avoid test failures
      console.warn('Cleanup warning:', error);
    }
  }

  describe('GET /dashboard/stats', () => {
    test('should return different patient counts for different nutritionists', async () => {
      // Request from nutritionist1
      const response1 = await request(app)
        .get('/dashboard/stats')
        .set('Authorization', `Bearer ${token1}`)
        .expect(200);

      // Request from nutritionist2
      const response2 = await request(app)
        .get('/dashboard/stats')
        .set('Authorization', `Bearer ${token2}`)
        .expect(200);

      // Verify different patient counts
      expect(response1.body.total_patients).toBe(2); // patient1 and patient2
      expect(response2.body.total_patients).toBe(1); // patient3 only
      
      // Ensure they are different
      expect(response1.body.total_patients).not.toBe(response2.body.total_patients);
    });

    test('should return individual recent activities', async () => {
      const response1 = await request(app)
        .get('/dashboard/stats')
        .set('Authorization', `Bearer ${token1}`)
        .expect(200);

      const response2 = await request(app)
        .get('/dashboard/stats')
        .set('Authorization', `Bearer ${token2}`)
        .expect(200);

      // Extract patient activities
      const activities1 = response1.body.recent_activities.filter((a: any) => a.type === 'patient');
      const activities2 = response2.body.recent_activities.filter((a: any) => a.type === 'patient');

      // Verify different number of activities
      expect(activities1.length).toBe(2); // Two patients for nutritionist1
      expect(activities2.length).toBe(1); // One patient for nutritionist2

      // Verify no overlap in activity IDs
      const activityIds1 = activities1.map((a: any) => a.id);
      const activityIds2 = activities2.map((a: any) => a.id);
      const intersection = activityIds1.filter((id: any) => activityIds2.includes(id));
      expect(intersection).toHaveLength(0);

      // Verify patient names in activities
      const patientNames1 = activities1.map((a: any) => a.description);
      const patientNames2 = activities2.map((a: any) => a.description);

      expect(patientNames1).toContain('Nuevo paciente: Integration Patient1');
      expect(patientNames1).toContain('Nuevo paciente: Integration Patient2');
      expect(patientNames1).not.toContain('Nuevo paciente: Integration Patient3');

      expect(patientNames2).toContain('Nuevo paciente: Integration Patient3');
      expect(patientNames2).not.toContain('Nuevo paciente: Integration Patient1');
      expect(patientNames2).not.toContain('Nuevo paciente: Integration Patient2');
    });

    test('should require authentication', async () => {
      await request(app)
        .get('/dashboard/stats')
        .expect(401);
    });

    test('should reject invalid tokens', async () => {
      await request(app)
        .get('/dashboard/stats')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);
    });

    test('should return consistent results for same nutritionist', async () => {
      // Make multiple requests with same token
      const response1 = await request(app)
        .get('/dashboard/stats')
        .set('Authorization', `Bearer ${token1}`)
        .expect(200);

      const response2 = await request(app)
        .get('/dashboard/stats')
        .set('Authorization', `Bearer ${token1}`)
        .expect(200);

      // Results should be identical
      expect(response1.body.total_patients).toBe(response2.body.total_patients);
      expect(response1.body.total_appointments).toBe(response2.body.total_appointments);
      expect(response1.body.total_diet_plans).toBe(response2.body.total_diet_plans);
      expect(response1.body.total_clinical_records).toBe(response2.body.total_clinical_records);
    });

    test('should handle nutritionist with no patients', async () => {
      // Create a new nutritionist with no patients
      const nutritionistRole = await roleRepository.findOne({ where: { name: RoleName.NUTRITIONIST } });
      const nutritionist3 = await userRepository.save({
        email: 'nutritionist.nopatientstest@test.com',
        first_name: 'No',
        last_name: 'Patients',
        password: '$2b$10$hashedpassword',
        role: nutritionistRole!,
        is_active: true
      });

      const token3 = jwt.sign(
        { 
          userId: nutritionist3.id, 
          email: nutritionist3.email, 
          role: nutritionist3.role.name 
        },
        process.env.JWT_SECRET || 'test-secret',
        { expiresIn: '1h' }
      );

      const response = await request(app)
        .get('/dashboard/stats')
        .set('Authorization', `Bearer ${token3}`)
        .expect(200);

      // Should return zeros
      expect(response.body.total_patients).toBe(0);
      expect(response.body.total_appointments).toBe(0);
      expect(response.body.total_diet_plans).toBe(0);
      expect(response.body.total_clinical_records).toBe(0);
      expect(response.body.recent_activities).toHaveLength(0);
    });

    test('should include proper structure in response', async () => {
      const response = await request(app)
        .get('/dashboard/stats')
        .set('Authorization', `Bearer ${token1}`)
        .expect(200);

      // Verify response structure
      expect(response.body).toHaveProperty('total_patients');
      expect(response.body).toHaveProperty('total_appointments');
      expect(response.body).toHaveProperty('total_diet_plans');
      expect(response.body).toHaveProperty('total_clinical_records');
      expect(response.body).toHaveProperty('recent_activities');
      expect(response.body).toHaveProperty('weekly_summary');
      expect(response.body).toHaveProperty('performance_metrics');
      expect(response.body).toHaveProperty('system_performance');

      // Verify types
      expect(typeof response.body.total_patients).toBe('number');
      expect(typeof response.body.total_appointments).toBe('number');
      expect(typeof response.body.total_diet_plans).toBe('number');
      expect(typeof response.body.total_clinical_records).toBe('number');
      expect(Array.isArray(response.body.recent_activities)).toBe(true);
      expect(typeof response.body.weekly_summary).toBe('object');
      expect(typeof response.body.performance_metrics).toBe('object');
      expect(typeof response.body.system_performance).toBe('object');
    });
  });

  describe('Cross-User Data Isolation Verification', () => {
    test('should never expose other nutritionist IDs in responses', async () => {
      const response1 = await request(app)
        .get('/dashboard/stats')
        .set('Authorization', `Bearer ${token1}`)
        .expect(200);

      const response2 = await request(app)
        .get('/dashboard/stats')
        .set('Authorization', `Bearer ${token2}`)
        .expect(200);

      // Convert responses to strings and check for other nutritionist IDs
      const response1Str = JSON.stringify(response1.body);
      const response2Str = JSON.stringify(response2.body);

      // Nutritionist1's response should not contain nutritionist2's ID
      expect(response1Str).not.toContain(nutritionist2.id);
      // Nutritionist2's response should not contain nutritionist1's ID
      expect(response2Str).not.toContain(nutritionist1.id);

      // Also check that patient IDs are properly segregated
      expect(response1Str).toContain(patient1.id);
      expect(response1Str).toContain(patient2.id);
      expect(response1Str).not.toContain(patient3.id);

      expect(response2Str).toContain(patient3.id);
      expect(response2Str).not.toContain(patient1.id);
      expect(response2Str).not.toContain(patient2.id);
    });

    test('should maintain data isolation under concurrent requests', async () => {
      // Make concurrent requests from both nutritionists
      const promises = [
        request(app).get('/dashboard/stats').set('Authorization', `Bearer ${token1}`),
        request(app).get('/dashboard/stats').set('Authorization', `Bearer ${token2}`),
        request(app).get('/dashboard/stats').set('Authorization', `Bearer ${token1}`),
        request(app).get('/dashboard/stats').set('Authorization', `Bearer ${token2}`)
      ];

      const responses = await Promise.all(promises);

      // All requests should succeed
      responses.forEach(response => expect(response.status).toBe(200));

      // Verify that nutritionist1 requests have consistent results
      expect(responses[0].body.total_patients).toBe(responses[2].body.total_patients);
      expect(responses[0].body.total_patients).toBe(2);

      // Verify that nutritionist2 requests have consistent results
      expect(responses[1].body.total_patients).toBe(responses[3].body.total_patients);
      expect(responses[1].body.total_patients).toBe(1);

      // Verify isolation between different nutritionists
      expect(responses[0].body.total_patients).not.toBe(responses[1].body.total_patients);
      expect(responses[2].body.total_patients).not.toBe(responses[3].body.total_patients);
    });
  });
}); 