import { AppDataSource } from '../../database/data-source';
import { User } from '../../database/entities/user.entity';
import { PatientNutritionistRelation, RelationshipStatus } from '../../database/entities/patient_nutritionist_relation.entity';
import { Appointment, AppointmentStatus } from '../../database/entities/appointment.entity';
import { DietPlan, DietPlanStatus } from '../../database/entities/diet_plan.entity';
import { ClinicalRecord } from '../../database/entities/clinical_record.entity';
import { PatientProfile } from '../../database/entities/patient_profile.entity';
import { AppError } from '../../utils/app.error';
import { Between, MoreThanOrEqual, LessThanOrEqual } from 'typeorm';

interface DashboardStats {
  total_patients: number;
  new_patients_last_month: number;
  patients_with_medical_conditions: number;
  active_relationships: number;
  total_appointments: number;
  appointments_today: number;
  appointments_this_week: number;
  completed_appointments: number;
  pending_appointments: number;
  total_diet_plans: number;
  active_diet_plans: number;
  completed_diet_plans: number;
  recent_activities: Array<{
    id: string;
    type: 'appointment' | 'patient' | 'diet_plan' | 'clinical_record';
    title: string;
    description: string;
    date: string;
    patient_name?: string;
  }>;
}

interface RecentActivity {
  id: string;
  type: 'appointment' | 'patient' | 'diet_plan' | 'clinical_record';
  title: string;
  description: string;
  date: string;
  patient_name?: string;
}

export class DashboardService {
  // Obtener estadísticas del dashboard
  async getDashboardStats(nutritionistId: string): Promise<DashboardStats> {
    try {
      const userRepository = AppDataSource.getRepository(User);
      const relationRepository = AppDataSource.getRepository(PatientNutritionistRelation);
      const appointmentRepository = AppDataSource.getRepository(Appointment);
      const dietPlanRepository = AppDataSource.getRepository(DietPlan);
      const clinicalRecordRepository = AppDataSource.getRepository(ClinicalRecord);
      const patientProfileRepository = AppDataSource.getRepository(PatientProfile);

      // Fechas para cálculos
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      const weekStart = new Date(today);
      weekStart.setDate(weekStart.getDate() - weekStart.getDay());
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekEnd.getDate() + 7);
      
      const monthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const monthEnd = new Date(now.getFullYear(), now.getMonth(), 0);

      // 1. Estadísticas de pacientes
      const activeRelations = await relationRepository.find({
        where: {
          nutritionist: { id: nutritionistId },
          status: RelationshipStatus.ACTIVE
        },
        relations: ['patient', 'patient.patient_profile']
      });

      const totalPatients = activeRelations.length;
      
      const newPatientsLastMonth = await relationRepository.count({
        where: {
          nutritionist: { id: nutritionistId },
          status: RelationshipStatus.ACTIVE,
          requested_at: Between(monthStart, monthEnd)
        }
      });

      const patientsWithMedicalConditions = activeRelations.filter(
        relation => relation.patient.patient_profile?.medical_conditions && 
        relation.patient.patient_profile.medical_conditions.length > 0
      ).length;

      // 2. Estadísticas de citas
      const totalAppointments = await appointmentRepository.count({
        where: {
          nutritionist: { id: nutritionistId }
        }
      });

      const appointmentsToday = await appointmentRepository.count({
        where: {
          nutritionist: { id: nutritionistId },
          start_time: Between(today, tomorrow)
        }
      });

      const appointmentsThisWeek = await appointmentRepository.count({
        where: {
          nutritionist: { id: nutritionistId },
          start_time: Between(weekStart, weekEnd)
        }
      });

      const completedAppointments = await appointmentRepository.count({
        where: {
          nutritionist: { id: nutritionistId },
          status: AppointmentStatus.COMPLETED
        }
      });

      const pendingAppointments = await appointmentRepository.count({
        where: {
          nutritionist: { id: nutritionistId },
          status: AppointmentStatus.SCHEDULED
        }
      });

      // 3. Estadísticas de planes nutricionales
      const totalDietPlans = await dietPlanRepository.count({
        where: {
          nutritionist: { id: nutritionistId }
        }
      });

      const activeDietPlans = await dietPlanRepository.count({
        where: {
          nutritionist: { id: nutritionistId },
          status: DietPlanStatus.ACTIVE
        }
      });

      const completedDietPlans = await dietPlanRepository.count({
        where: {
          nutritionist: { id: nutritionistId },
          status: DietPlanStatus.ARCHIVED
        }
      });

      // 4. Actividades recientes
      const recentActivities = await this.getRecentActivities(nutritionistId, 10);

      return {
        total_patients: totalPatients,
        new_patients_last_month: newPatientsLastMonth,
        patients_with_medical_conditions: patientsWithMedicalConditions,
        active_relationships: totalPatients,
        total_appointments: totalAppointments,
        appointments_today: appointmentsToday,
        appointments_this_week: appointmentsThisWeek,
        completed_appointments: completedAppointments,
        pending_appointments: pendingAppointments,
        total_diet_plans: totalDietPlans,
        active_diet_plans: activeDietPlans,
        completed_diet_plans: completedDietPlans,
        recent_activities: recentActivities
      };
    } catch (error) {
      console.error('Error getting dashboard stats:', error);
      throw new AppError('Error al obtener estadísticas del dashboard', 500);
    }
  }

  // Obtener actividades recientes
  async getRecentActivities(nutritionistId: string, limit: number = 10): Promise<RecentActivity[]> {
    try {
      const appointmentRepository = AppDataSource.getRepository(Appointment);
      const dietPlanRepository = AppDataSource.getRepository(DietPlan);
      const clinicalRecordRepository = AppDataSource.getRepository(ClinicalRecord);
      const relationRepository = AppDataSource.getRepository(PatientNutritionistRelation);

      const activities: RecentActivity[] = [];

      // Citas recientes
      const recentAppointments = await appointmentRepository.find({
        where: {
          nutritionist: { id: nutritionistId }
        },
        relations: ['patient'],
        order: { created_at: 'DESC' },
        take: Math.ceil(limit / 4)
      });

      recentAppointments.forEach(appointment => {
        activities.push({
          id: appointment.id,
          type: 'appointment',
          title: `Cita ${appointment.status === AppointmentStatus.COMPLETED ? 'completada' : 'programada'}`,
          description: `${appointment.notes || 'Sin notas'}`,
          date: appointment.created_at.toISOString(),
          patient_name: `${appointment.patient.first_name} ${appointment.patient.last_name}`
        });
      });

      // Planes nutricionales recientes
      const recentDietPlans = await dietPlanRepository.find({
        where: {
          nutritionist: { id: nutritionistId }
        },
        relations: ['patient'],
        order: { created_at: 'DESC' },
        take: Math.ceil(limit / 4)
      });

      recentDietPlans.forEach(plan => {
        activities.push({
          id: plan.id,
          type: 'diet_plan',
          title: `Plan nutricional ${plan.status}`,
          description: `${plan.name} - ${plan.daily_calories_target || 0} kcal/día`,
          date: plan.created_at.toISOString(),
          patient_name: `${plan.patient.first_name} ${plan.patient.last_name}`
        });
      });

      // Expedientes clínicos recientes
      const recentClinicalRecords = await clinicalRecordRepository.find({
        where: {
          nutritionist: { id: nutritionistId }
        },
        relations: ['patient'],
        order: { created_at: 'DESC' },
        take: Math.ceil(limit / 4)
      });

      recentClinicalRecords.forEach(record => {
        activities.push({
          id: record.id,
          type: 'clinical_record',
          title: 'Expediente clínico creado',
          description: record.consultation_reason || 'Consulta nutricional',
          date: record.created_at.toISOString(),
          patient_name: `${record.patient.first_name} ${record.patient.last_name}`
        });
      });

      // Nuevas relaciones de pacientes
      const recentRelations = await relationRepository.find({
        where: {
          nutritionist: { id: nutritionistId },
          status: RelationshipStatus.ACTIVE
        },
        relations: ['patient'],
        order: { requested_at: 'DESC' },
        take: Math.ceil(limit / 4)
      });

      recentRelations.forEach(relation => {
        activities.push({
          id: relation.id,
          type: 'patient',
          title: 'Nuevo paciente agregado',
          description: 'Relación establecida',
          date: relation.requested_at.toISOString(),
          patient_name: `${relation.patient.first_name} ${relation.patient.last_name}`
        });
      });

      // Ordenar por fecha y limitar
      return activities
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, limit);
    } catch (error) {
      console.error('Error getting recent activities:', error);
      throw new AppError('Error al obtener actividades recientes', 500);
    }
  }

  // Obtener resumen de ingresos (para futura integración de pagos)
  async getIncomeSummary(nutritionistId: string, period: 'week' | 'month' | 'year' = 'month'): Promise<{
    total_income: number;
    total_consultations: number;
    average_per_consultation: number;
    period: string;
  }> {
    try {
      // Por ahora retornamos datos simulados
      // En el futuro esto se conectará con el sistema de pagos
      const mockData = {
        week: { income: 1200, consultations: 8 },
        month: { income: 4800, consultations: 32 },
        year: { income: 57600, consultations: 384 }
      };

      const data = mockData[period];
      const average = data.income / data.consultations;

      return {
        total_income: data.income,
        total_consultations: data.consultations,
        average_per_consultation: average,
        period: period === 'week' ? 'Esta semana' : period === 'month' ? 'Este mes' : 'Este año'
      };
    } catch (error) {
      console.error('Error getting income summary:', error);
      throw new AppError('Error al obtener resumen de ingresos', 500);
    }
  }
} 