import { AppDataSource } from '../../database/data-source';
import { User } from '../../database/entities/user.entity';
import { Role, RoleName } from '../../database/entities/role.entity';
import { PatientNutritionistRelation, RelationshipStatus } from '../../database/entities/patient_nutritionist_relation.entity';
import { Appointment, AppointmentStatus } from '../../database/entities/appointment.entity';
import { DietPlan, DietPlanStatus } from '../../database/entities/diet_plan.entity';
import { ClinicalRecord } from '../../database/entities/clinical_record.entity';
import { PatientProfile } from '../../database/entities/patient_profile.entity';
import { NutritionistProfile } from '../../database/entities/nutritionist_profile.entity';
import { PaymentTransaction } from '../../database/entities/payment_transaction.entity';
import { AppError } from '../../utils/app.error';
import { Between, MoreThanOrEqual, LessThanOrEqual, MoreThan, Equal } from 'typeorm';

export interface SimpleDashboardStats {
  total_patients: number;
  total_appointments: number;
  total_diet_plans: number;
  total_clinical_records: number;
  recent_activities: Array<{ type: string; id: string; date: string; description: string }>;
  weekly_summary: {
    new_patients: number;
    new_appointments: number;
  };
  performance_metrics: {
    completion_rate: number; // % de citas completadas
  };
  system_performance: {
    last_patient: string | null;
    last_appointment: string | null;
    last_diet_plan: string | null;
    last_clinical_record: string | null;
  };
}

export class DashboardService {
  private userRepository = AppDataSource.getRepository(User);
  private roleRepository = AppDataSource.getRepository(Role);
  private patientProfileRepository = AppDataSource.getRepository(PatientProfile);
  private nutritionistProfileRepository = AppDataSource.getRepository(NutritionistProfile);
  private relationRepository = AppDataSource.getRepository(PatientNutritionistRelation);
  private appointmentRepository = AppDataSource.getRepository(Appointment);
  private dietPlanRepository = AppDataSource.getRepository(DietPlan);
  private clinicalRecordRepository = AppDataSource.getRepository(ClinicalRecord);
  private paymentRepository = AppDataSource.getRepository(PaymentTransaction);

  async getSimpleDashboardStats(): Promise<SimpleDashboardStats> {
    // Buscar el rol de paciente
    const patientRole = await this.roleRepository.findOneByOrFail({ name: RoleName.PATIENT });

    // Totales
    const total_patients = await this.userRepository.count({ where: { role: { id: patientRole.id } } });
    const total_appointments = await this.appointmentRepository.count();
    const total_diet_plans = await this.dietPlanRepository.count();
    const total_clinical_records = await this.clinicalRecordRepository.count();

    // Actividades recientes (últimos 5 de cada uno)
    const recent_patients = await this.userRepository.find({ where: { role: { id: patientRole.id } }, order: { created_at: 'DESC' }, take: 5 });
    const recent_appointments = await this.appointmentRepository.find({ order: { created_at: 'DESC' }, take: 5 });
    const recent_diet_plans = await this.dietPlanRepository.find({ order: { created_at: 'DESC' }, take: 5 });
    const recent_clinical_records = await this.clinicalRecordRepository.find({ order: { created_at: 'DESC' }, take: 5 });

    const recent_activities: Array<{ type: string; id: string; date: string; description: string }> = [
      ...recent_patients.map(p => ({ type: 'patient', id: p.id, date: p.created_at.toISOString(), description: `${p.first_name || ''} ${p.last_name || ''}`.trim() })),
      ...recent_appointments.map(a => ({ type: 'appointment', id: a.id, date: a.created_at.toISOString(), description: a.status })),
      ...recent_diet_plans.map(d => ({ type: 'diet_plan', id: d.id, date: d.created_at.toISOString(), description: d.name || 'Plan de dieta' })),
      ...recent_clinical_records.map(c => ({ type: 'clinical_record', id: c.id, date: c.created_at.toISOString(), description: c.expedient_number || 'Expediente' })),
    ].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 10);

    // Resumen semanal
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    const new_patients = await this.userRepository.count({ where: { role: { id: patientRole.id }, created_at: MoreThan(oneWeekAgo) } });
    const new_appointments = await this.appointmentRepository.count({ where: { created_at: MoreThan(oneWeekAgo) } });

    // Métricas de rendimiento
    const total_completed = await this.appointmentRepository.count({ where: { status: AppointmentStatus.COMPLETED } });
    const completion_rate = total_appointments > 0 ? Math.round((total_completed / total_appointments) * 100) : 0;

    // Rendimiento del sistema (último registro)
    const last_patient = recent_patients[0]?.created_at?.toISOString() || null;
    const last_appointment = recent_appointments[0]?.created_at?.toISOString() || null;
    const last_diet_plan = recent_diet_plans[0]?.created_at?.toISOString() || null;
    const last_clinical_record = recent_clinical_records[0]?.created_at?.toISOString() || null;

    return {
      total_patients,
      total_appointments,
      total_diet_plans,
      total_clinical_records,
      recent_activities,
      weekly_summary: { new_patients, new_appointments },
      performance_metrics: { completion_rate },
      system_performance: { last_patient, last_appointment, last_diet_plan, last_clinical_record },
    };
  }
} 