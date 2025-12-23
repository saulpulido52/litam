import { AppDataSource } from '../../database/data-source';
import { User } from '../../database/entities/user.entity';
import { Role, RoleName } from '../../database/entities/role.entity';
import { PatientNutritionistRelation, RelationshipStatus } from '../../database/entities/patient_nutritionist_relation.entity';
import { Appointment, AppointmentStatus } from '../../database/entities/appointment.entity';
import { DietPlan, DietPlanStatus } from '../../database/entities/diet_plan.entity';
import { ClinicalRecord } from '../../database/entities/clinical_record.entity';
import { DashboardService } from '../../modules/dashboard/dashboard.service';
import { Repository, Like, In } from 'typeorm';

describe('Dashboard Individualization Tests', () => {
  let dashboardService: DashboardService;
  let userRepository: Repository<User>;
  let roleRepository: Repository<Role>;
  let relationRepository: Repository<PatientNutritionistRelation>;
  let appointmentRepository: Repository<Appointment>;
  let dietPlanRepository: Repository<DietPlan>;
  let clinicalRecordRepository: Repository<ClinicalRecord>;

  // Test data
  let nutritionist1: User;
  let nutritionist2: User;
  let patient1: User;
  let patient2: User;
  let patient3: User;
  let patientRole: Role;
  let nutritionistRole: Role;

  beforeAll(async () => {
    // Initialize database connection
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
    }

    // Initialize repositories
    userRepository = AppDataSource.getRepository(User);
    roleRepository = AppDataSource.getRepository(Role);
    relationRepository = AppDataSource.getRepository(PatientNutritionistRelation);
    appointmentRepository = AppDataSource.getRepository(Appointment);
    dietPlanRepository = AppDataSource.getRepository(DietPlan);
    clinicalRecordRepository = AppDataSource.getRepository(ClinicalRecord);

    // Initialize service
    dashboardService = new DashboardService();
  });

  beforeEach(async () => {
    // Clean up test data before each test
    await cleanupTestData();
    
    // Create test roles (or get existing ones)
    let foundPatientRole = await roleRepository.findOne({ where: { name: RoleName.PATIENT } });
    if (!foundPatientRole) {
      patientRole = await roleRepository.save({
        name: RoleName.PATIENT
      });
    } else {
      patientRole = foundPatientRole;
    }

    let foundNutritionistRole = await roleRepository.findOne({ where: { name: RoleName.NUTRITIONIST } });
    if (!foundNutritionistRole) {
      nutritionistRole = await roleRepository.save({
        name: RoleName.NUTRITIONIST
      });
    } else {
      nutritionistRole = foundNutritionistRole;
    }

    // Create test users
    nutritionist1 = await userRepository.save({
      email: 'test.nutritionist1@test.com',
      first_name: 'Test',
      last_name: 'Nutritionist1',
      password: 'hashedpassword',
      role: nutritionistRole,
      is_active: true
    });

    nutritionist2 = await userRepository.save({
      email: 'test.nutritionist2@test.com',
      first_name: 'Test',
      last_name: 'Nutritionist2',
      password: 'hashedpassword',
      role: nutritionistRole,
      is_active: true
    });

    patient1 = await userRepository.save({
      email: 'test.patient1@test.com',
      first_name: 'Test',
      last_name: 'Patient1',
      password: 'hashedpassword',
      role: patientRole,
      is_active: true
    });

    patient2 = await userRepository.save({
      email: 'test.patient2@test.com',
      first_name: 'Test',
      last_name: 'Patient2',
      password: 'hashedpassword',
      role: patientRole,
      is_active: true
    });

    patient3 = await userRepository.save({
      email: 'test.patient3@test.com',
      first_name: 'Test',
      last_name: 'Patient3',
      password: 'hashedpassword',
      role: patientRole,
      is_active: true
    });
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
    // Clean up in correct order due to foreign key constraints
    try {
      // Use direct DELETE queries instead of clear() to avoid TRUNCATE issues
      const queryRunner = AppDataSource.createQueryRunner();
      await queryRunner.connect();
      
      // Delete in correct order to respect foreign key constraints
      await queryRunner.query(`DELETE FROM clinical_records WHERE patient_user_id IN (SELECT id FROM users WHERE email LIKE '%@test.com') OR nutritionist_user_id IN (SELECT id FROM users WHERE email LIKE '%@test.com')`);
      await queryRunner.query(`DELETE FROM diet_plans WHERE patient_user_id IN (SELECT id FROM users WHERE email LIKE '%@test.com') OR nutritionist_user_id IN (SELECT id FROM users WHERE email LIKE '%@test.com')`);
      await queryRunner.query(`DELETE FROM appointments WHERE patient_user_id IN (SELECT id FROM users WHERE email LIKE '%@test.com') OR nutritionist_user_id IN (SELECT id FROM users WHERE email LIKE '%@test.com')`);
      await queryRunner.query(`DELETE FROM patient_nutritionist_relations WHERE patient_user_id IN (SELECT id FROM users WHERE email LIKE '%@test.com') OR nutritionist_user_id IN (SELECT id FROM users WHERE email LIKE '%@test.com')`);
      
      // Delete test users specifically
      await queryRunner.query(`DELETE FROM users WHERE email LIKE '%@test.com'`);
      
      // Only delete test roles if they exist and aren't used by other entities
      await queryRunner.query(`DELETE FROM roles WHERE name IN ('patient', 'nutritionist') AND id NOT IN (SELECT DISTINCT role_id FROM users WHERE role_id IS NOT NULL)`);
      
      await queryRunner.release();
    } catch (error) {
      console.warn('Cleanup warning:', error);
      // Continue with tests even if cleanup fails
    }
  }

  describe('Patient Assignment Isolation', () => {
    beforeEach(async () => {
      // Nutritionist1 has Patient1 and Patient2
      await relationRepository.save({
        nutritionist: nutritionist1,
        patient: patient1,
        status: RelationshipStatus.ACTIVE,
        requested_at: new Date()
      });

      await relationRepository.save({
        nutritionist: nutritionist1,
        patient: patient2,
        status: RelationshipStatus.ACTIVE,
        requested_at: new Date()
      });

      // Nutritionist2 has Patient3
      await relationRepository.save({
        nutritionist: nutritionist2,
        patient: patient3,
        status: RelationshipStatus.ACTIVE,
        requested_at: new Date()
      });
    });

    test('should return only assigned patients for nutritionist1', async () => {
      const stats = await dashboardService.getSimpleDashboardStats(nutritionist1.id);
      
      expect(stats.total_patients).toBe(2);
      
      // Check recent activities contain only nutritionist1's patients
      const patientActivities = stats.recent_activities.filter(activity => activity.type === 'patient');
      const patientNames = patientActivities.map(activity => activity.description);
      
      expect(patientNames).toContain('Nuevo paciente: Test Patient1');
      expect(patientNames).toContain('Nuevo paciente: Test Patient2');
      expect(patientNames).not.toContain('Nuevo paciente: Test Patient3');
    });

    test('should return only assigned patients for nutritionist2', async () => {
      const stats = await dashboardService.getSimpleDashboardStats(nutritionist2.id);
      
      expect(stats.total_patients).toBe(1);
      
      // Check recent activities contain only nutritionist2's patients
      const patientActivities = stats.recent_activities.filter(activity => activity.type === 'patient');
      const patientNames = patientActivities.map(activity => activity.description);
      
      expect(patientNames).toContain('Nuevo paciente: Test Patient3');
      expect(patientNames).not.toContain('Nuevo paciente: Test Patient1');
      expect(patientNames).not.toContain('Nuevo paciente: Test Patient2');
    });

    test('should have different patient counts for different nutritionists', async () => {
      const stats1 = await dashboardService.getSimpleDashboardStats(nutritionist1.id);
      const stats2 = await dashboardService.getSimpleDashboardStats(nutritionist2.id);
      
      expect(stats1.total_patients).not.toBe(stats2.total_patients);
      expect(stats1.total_patients).toBe(2);
      expect(stats2.total_patients).toBe(1);
    });
  });

  describe('Appointments Isolation', () => {
    beforeEach(async () => {
      // Create appointments for nutritionist1
      await appointmentRepository.save({
        nutritionist: nutritionist1,
        patient: patient1,
        start_time: new Date('2025-07-01T10:00:00Z'),
        end_time: new Date('2025-07-01T11:00:00Z'),
        status: AppointmentStatus.SCHEDULED
      });

      await appointmentRepository.save({
        nutritionist: nutritionist1,
        patient: patient2,
        start_time: new Date('2025-07-01T14:00:00Z'),
        end_time: new Date('2025-07-01T15:00:00Z'),
        status: AppointmentStatus.COMPLETED
      });

      // Create appointment for nutritionist2
      await appointmentRepository.save({
        nutritionist: nutritionist2,
        patient: patient3,
        start_time: new Date('2025-07-01T16:00:00Z'),
        end_time: new Date('2025-07-01T17:00:00Z'),
        status: AppointmentStatus.SCHEDULED
      });
    });

    test('should return only own appointments for nutritionist1', async () => {
      const stats = await dashboardService.getSimpleDashboardStats(nutritionist1.id);
      
      expect(stats.total_appointments).toBe(2);
      
      // Check completion rate calculation is based only on own appointments
      expect(stats.performance_metrics.completion_rate).toBe(50); // 1 completed out of 2 total
    });

    test('should return only own appointments for nutritionist2', async () => {
      const stats = await dashboardService.getSimpleDashboardStats(nutritionist2.id);
      
      expect(stats.total_appointments).toBe(1);
      expect(stats.performance_metrics.completion_rate).toBe(0); // 0 completed out of 1 total
    });

    test('should show appointment activities only for respective nutritionist', async () => {
      const stats1 = await dashboardService.getSimpleDashboardStats(nutritionist1.id);
      const stats2 = await dashboardService.getSimpleDashboardStats(nutritionist2.id);
      
      const appointmentActivities1 = stats1.recent_activities.filter(activity => activity.type === 'appointment');
      const appointmentActivities2 = stats2.recent_activities.filter(activity => activity.type === 'appointment');
      
      expect(appointmentActivities1.length).toBe(2);
      expect(appointmentActivities2.length).toBe(1);
      
      // Check descriptions
      expect(appointmentActivities1.some(a => a.description.includes('completada'))).toBe(true);
      expect(appointmentActivities1.some(a => a.description.includes('programada'))).toBe(true);
      expect(appointmentActivities2.some(a => a.description.includes('programada'))).toBe(true);
    });
  });

  describe('Diet Plans Isolation', () => {
    beforeEach(async () => {
      // Create diet plans for nutritionist1
      await dietPlanRepository.save({
        name: 'Plan para Patient1',
        nutritionist: nutritionist1,
        patient: patient1,
        status: DietPlanStatus.ACTIVE,
        start_date: new Date('2025-07-01'),
        end_date: new Date('2025-07-31'),
        is_weekly_plan: true,
        total_weeks: 4
      });

      await dietPlanRepository.save({
        name: 'Plan para Patient2',
        nutritionist: nutritionist1,
        patient: patient2,
        status: DietPlanStatus.DRAFT,
        start_date: new Date('2025-07-01'),
        end_date: new Date('2025-07-31'),
        is_weekly_plan: true,
        total_weeks: 4
      });

      // Create diet plan for nutritionist2
      await dietPlanRepository.save({
        name: 'Plan para Patient3',
        nutritionist: nutritionist2,
        patient: patient3,
        status: DietPlanStatus.ACTIVE,
        start_date: new Date('2025-07-01'),
        end_date: new Date('2025-07-31'),
        is_weekly_plan: true,
        total_weeks: 4
      });
    });

    test('should return only own diet plans for nutritionist1', async () => {
      const stats = await dashboardService.getSimpleDashboardStats(nutritionist1.id);
      
      expect(stats.total_diet_plans).toBe(2);
      
      // Check diet plan activities
      const dietPlanActivities = stats.recent_activities.filter(activity => activity.type === 'diet_plan');
      expect(dietPlanActivities.length).toBe(2);
      
      const planNames = dietPlanActivities.map(activity => activity.description);
      expect(planNames).toContain('Plan nutricional: Plan para Patient1');
      expect(planNames).toContain('Plan nutricional: Plan para Patient2');
      expect(planNames).not.toContain('Plan nutricional: Plan para Patient3');
    });

    test('should return only own diet plans for nutritionist2', async () => {
      const stats = await dashboardService.getSimpleDashboardStats(nutritionist2.id);
      
      expect(stats.total_diet_plans).toBe(1);
      
      // Check diet plan activities
      const dietPlanActivities = stats.recent_activities.filter(activity => activity.type === 'diet_plan');
      expect(dietPlanActivities.length).toBe(1);
      
      const planNames = dietPlanActivities.map(activity => activity.description);
      expect(planNames).toContain('Plan nutricional: Plan para Patient3');
      expect(planNames).not.toContain('Plan nutricional: Plan para Patient1');
      expect(planNames).not.toContain('Plan nutricional: Plan para Patient2');
    });
  });

  describe('Clinical Records Isolation', () => {
    beforeEach(async () => {
      // Create clinical records for nutritionist1
      await clinicalRecordRepository.save({
        expedient_number: 'EXP-001',
        nutritionist: nutritionist1,
        patient: patient1,
        record_date: new Date(),
        consultation_reason: 'Consulta inicial Patient1'
      });

      await clinicalRecordRepository.save({
        expedient_number: 'EXP-002',
        nutritionist: nutritionist1,
        patient: patient2,
        record_date: new Date(),
        consultation_reason: 'Consulta inicial Patient2'
      });

      // Create clinical record for nutritionist2
      await clinicalRecordRepository.save({
        expedient_number: 'EXP-003',
        nutritionist: nutritionist2,
        patient: patient3,
        record_date: new Date(),
        consultation_reason: 'Consulta inicial Patient3'
      });
    });

    test('should return only own clinical records for nutritionist1', async () => {
      const stats = await dashboardService.getSimpleDashboardStats(nutritionist1.id);
      
      expect(stats.total_clinical_records).toBe(2);
      
      // Check clinical record activities
      const clinicalRecordActivities = stats.recent_activities.filter(activity => activity.type === 'clinical_record');
      expect(clinicalRecordActivities.length).toBe(2);
      
      const expedientNumbers = clinicalRecordActivities.map(activity => activity.description);
      expect(expedientNumbers).toContain('Expediente: EXP-001');
      expect(expedientNumbers).toContain('Expediente: EXP-002');
      expect(expedientNumbers).not.toContain('Expediente: EXP-003');
    });

    test('should return only own clinical records for nutritionist2', async () => {
      const stats = await dashboardService.getSimpleDashboardStats(nutritionist2.id);
      
      expect(stats.total_clinical_records).toBe(1);
      
      // Check clinical record activities
      const clinicalRecordActivities = stats.recent_activities.filter(activity => activity.type === 'clinical_record');
      expect(clinicalRecordActivities.length).toBe(1);
      
      const expedientNumbers = clinicalRecordActivities.map(activity => activity.description);
      expect(expedientNumbers).toContain('Expediente: EXP-003');
      expect(expedientNumbers).not.toContain('Expediente: EXP-001');
      expect(expedientNumbers).not.toContain('Expediente: EXP-002');
    });
  });

  describe('Weekly Summary Isolation', () => {
    beforeEach(async () => {
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 3); // 3 days ago (within week)
      
      const twoWeeksAgo = new Date();
      twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 10); // 10 days ago (outside week)

      // Recent relations for nutritionist1 (within week)
      await relationRepository.save({
        nutritionist: nutritionist1,
        patient: patient1,
        status: RelationshipStatus.ACTIVE,
        requested_at: oneWeekAgo
      });

      // Old relation for nutritionist1 (outside week)
      await relationRepository.save({
        nutritionist: nutritionist1,
        patient: patient2,
        status: RelationshipStatus.ACTIVE,
        requested_at: twoWeeksAgo
      });

      // Recent relation for nutritionist2 (within week)
      await relationRepository.save({
        nutritionist: nutritionist2,
        patient: patient3,
        status: RelationshipStatus.ACTIVE,
        requested_at: oneWeekAgo
      });

      // Recent appointments
      await appointmentRepository.save({
        nutritionist: nutritionist1,
        patient: patient1,
        start_time: oneWeekAgo,
        end_time: oneWeekAgo,
        status: AppointmentStatus.SCHEDULED,
        created_at: oneWeekAgo
      });

      await appointmentRepository.save({
        nutritionist: nutritionist2,
        patient: patient3,
        start_time: oneWeekAgo,
        end_time: oneWeekAgo,
        status: AppointmentStatus.SCHEDULED,
        created_at: oneWeekAgo
      });
    });

    test('should calculate weekly summary only for own data', async () => {
      const stats1 = await dashboardService.getSimpleDashboardStats(nutritionist1.id);
      const stats2 = await dashboardService.getSimpleDashboardStats(nutritionist2.id);
      
      // Each nutritionist should have 1 new patient and 1 new appointment in the last week
      expect(stats1.weekly_summary.new_patients).toBe(1);
      expect(stats1.weekly_summary.new_appointments).toBe(1);
      
      expect(stats2.weekly_summary.new_patients).toBe(1);
      expect(stats2.weekly_summary.new_appointments).toBe(1);
      
      // Verify they are counting different patients/appointments
      expect(stats1.total_patients).toBe(2); // patient1 + patient2 (both relations active)
      expect(stats2.total_patients).toBe(1); // patient3 only
    });
  });

  describe('System Performance Isolation', () => {
    test('should return last activity timestamps only for own data', async () => {
      // Setup some activities with different timestamps
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      
      const today = new Date();

      // Create relation for nutritionist1 yesterday
      await relationRepository.save({
        nutritionist: nutritionist1,
        patient: patient1,
        status: RelationshipStatus.ACTIVE,
        requested_at: yesterday
      });

      // Create relation for nutritionist2 today
      await relationRepository.save({
        nutritionist: nutritionist2,
        patient: patient3,
        status: RelationshipStatus.ACTIVE,
        requested_at: today
      });

      const stats1 = await dashboardService.getSimpleDashboardStats(nutritionist1.id);
      const stats2 = await dashboardService.getSimpleDashboardStats(nutritionist2.id);

      // Each should have their own last patient timestamp
      expect(stats1.system_performance.last_patient).toBeTruthy();
      expect(stats2.system_performance.last_patient).toBeTruthy();
      
      // The timestamps should be different
      expect(stats1.system_performance.last_patient).not.toBe(stats2.system_performance.last_patient);
      
      // Nutritionist2's timestamp should be more recent
      const date1 = new Date(stats1.system_performance.last_patient!);
      const date2 = new Date(stats2.system_performance.last_patient!);
      expect(date2.getTime()).toBeGreaterThan(date1.getTime());
    });
  });

  describe('No Data Leakage Between Nutritionists', () => {
    test('should never show other nutritionist data', async () => {
      // Create comprehensive test data for both nutritionists
      await setupComprehensiveTestData();

      const stats1 = await dashboardService.getSimpleDashboardStats(nutritionist1.id);
      const stats2 = await dashboardService.getSimpleDashboardStats(nutritionist2.id);

      // Verify completely different activity sets
      const activities1 = stats1.recent_activities.map(a => a.id);
      const activities2 = stats2.recent_activities.map(a => a.id);
      
      // No activity ID should appear in both lists
      const intersection = activities1.filter(id => activities2.includes(id));
      expect(intersection).toHaveLength(0);

      // Verify different totals (since they have different data)
      expect(stats1.total_patients).not.toBe(stats2.total_patients);
      expect(stats1.total_appointments).not.toBe(stats2.total_appointments);
      expect(stats1.total_diet_plans).not.toBe(stats2.total_diet_plans);
      expect(stats1.total_clinical_records).not.toBe(stats2.total_clinical_records);
    });

    async function setupComprehensiveTestData() {
      // Relations
      await relationRepository.save([
        { nutritionist: nutritionist1, patient: patient1, status: RelationshipStatus.ACTIVE, requested_at: new Date() },
        { nutritionist: nutritionist1, patient: patient2, status: RelationshipStatus.ACTIVE, requested_at: new Date() },
        { nutritionist: nutritionist2, patient: patient3, status: RelationshipStatus.ACTIVE, requested_at: new Date() }
      ]);

      // Appointments
      await appointmentRepository.save([
        { nutritionist: nutritionist1, patient: patient1, start_time: new Date(), end_time: new Date(), status: AppointmentStatus.SCHEDULED },
        { nutritionist: nutritionist1, patient: patient2, start_time: new Date(), end_time: new Date(), status: AppointmentStatus.COMPLETED },
        { nutritionist: nutritionist2, patient: patient3, start_time: new Date(), end_time: new Date(), status: AppointmentStatus.SCHEDULED }
      ]);

      // Diet Plans
      await dietPlanRepository.save([
        { name: 'Plan N1P1', nutritionist: nutritionist1, patient: patient1, status: DietPlanStatus.ACTIVE, start_date: new Date(), end_date: new Date(), is_weekly_plan: true, total_weeks: 4 },
        { name: 'Plan N1P2', nutritionist: nutritionist1, patient: patient2, status: DietPlanStatus.ACTIVE, start_date: new Date(), end_date: new Date(), is_weekly_plan: true, total_weeks: 4 },
        { name: 'Plan N2P3', nutritionist: nutritionist2, patient: patient3, status: DietPlanStatus.ACTIVE, start_date: new Date(), end_date: new Date(), is_weekly_plan: true, total_weeks: 4 }
      ]);

      // Clinical Records
      await clinicalRecordRepository.save([
        { expedient_number: 'N1P1-001', nutritionist: nutritionist1, patient: patient1, record_date: new Date(), consultation_reason: 'Test N1P1' },
        { expedient_number: 'N1P2-001', nutritionist: nutritionist1, patient: patient2, record_date: new Date(), consultation_reason: 'Test N1P2' },
        { expedient_number: 'N2P3-001', nutritionist: nutritionist2, patient: patient3, record_date: new Date(), consultation_reason: 'Test N2P3' }
      ]);
    }
  });
}); 