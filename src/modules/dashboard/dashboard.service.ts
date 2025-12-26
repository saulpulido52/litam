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
import { Between, MoreThanOrEqual, LessThanOrEqual, MoreThan, Equal, In } from 'typeorm';

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
  appointments_today: number;
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

  // **OPTIMIZACIÓN**: Método para obtener estadísticas básicas en batch
  private async getBatchedCounts(nutritionistId: string): Promise<{
    total_patients: number;
    total_appointments: number;
    total_diet_plans: number;
    total_clinical_records: number;
  }> {
    // **OPTIMIZACIÓN**: Ejecutar todas las consultas de conteo en paralelo
    const [
      total_patients,
      total_appointments,
      total_diet_plans,
      total_clinical_records
    ] = await Promise.all([
      this.relationRepository.count({
        where: {
          nutritionist: { id: nutritionistId },
          status: RelationshipStatus.ACTIVE
        }
      }),
      this.appointmentRepository.count({
        where: { nutritionist: { id: nutritionistId } }
      }),
      this.dietPlanRepository.count({
        where: { nutritionist: { id: nutritionistId } }
      }),
      this.clinicalRecordRepository.count({
        where: { nutritionist: { id: nutritionistId } }
      })
    ]);

    return {
      total_patients,
      total_appointments,
      total_diet_plans,
      total_clinical_records
    };
  }

  // **OPTIMIZACIÓN**: Método para obtener actividades recientes de forma eficiente
  private async getRecentActivitiesBatch(nutritionistId: string): Promise<Array<{ type: string; id: string; date: string; description: string }>> {
    try {
      // **OPTIMIZACIÓN**: Obtener actividades recientes en paralelo - versión simplificada
      const [
        recent_diet_plans,
        recent_appointments,
        recent_clinical_records
      ] = await Promise.all([
        this.dietPlanRepository.find({
          where: { nutritionist: { id: nutritionistId } },
          order: { created_at: 'DESC' },
          take: 3
        }),
        this.appointmentRepository.find({
          where: { nutritionist: { id: nutritionistId } },
          relations: ['patient'],
          order: { created_at: 'DESC' },
          take: 3
        }),
        this.clinicalRecordRepository.find({
          where: { nutritionist: { id: nutritionistId } },
          order: { created_at: 'DESC' },
          take: 3
        })
      ]);

      // **OPTIMIZACIÓN**: Crear actividades de forma más eficiente
      const recent_activities: Array<{ type: string; id: string; date: string; description: string }> = [
        ...recent_diet_plans.map(d => ({
          type: 'diet_plan',
          id: d.id,
          date: d.created_at.toISOString(),
          description: `Plan: ${d.name || 'Plan nutricional'}`
        })),
        ...recent_appointments.map(a => ({
          type: 'appointment',
          id: a.id,
          date: a.created_at.toISOString(),
          description: `Cita: ${a.patient?.first_name || ''} ${a.patient?.last_name || ''}`.trim() || 'Cita programada'
        })),
        ...recent_clinical_records.map(c => ({
          type: 'clinical_record',
          id: c.id,
          date: c.created_at.toISOString(),
          description: `Expediente: ${c.expedient_number || 'Registro clínico'}`
        }))
      ];

      // Ordenar y limitar a las últimas 10 actividades
      return recent_activities
        .sort((a, b) => b.date.localeCompare(a.date))
        .slice(0, 10);
    } catch (error) {
      console.error('Error en getRecentActivitiesBatch:', error);
      return []; // Devolver array vacío en caso de error
    }
  }

  // **OPTIMIZACIÓN**: Método para obtener resumen semanal en batch
  private async getWeeklySummaryBatch(nutritionistId: string): Promise<{
    new_patients: number;
    new_appointments: number;
  }> {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    // **OPTIMIZACIÓN**: Ejecutar consultas semanales en paralelo
    const [new_patients, new_appointments] = await Promise.all([
      this.relationRepository.count({
        where: {
          nutritionist: { id: nutritionistId },
          status: RelationshipStatus.ACTIVE,
          requested_at: MoreThan(oneWeekAgo)
        }
      }),
      this.appointmentRepository.count({
        where: {
          nutritionist: { id: nutritionistId },
          created_at: MoreThan(oneWeekAgo)
        }
      })
    ]);

    return { new_patients, new_appointments };
  }

  // **OPTIMIZACIÓN**: Método para obtener métricas de rendimiento optimizadas
  private async getPerformanceMetrics(nutritionistId: string, total_appointments: number): Promise<{
    completion_rate: number;
  }> {
    if (total_appointments === 0) {
      return { completion_rate: 0 };
    }

    const total_completed = await this.appointmentRepository.count({
      where: {
        nutritionist: { id: nutritionistId },
        status: AppointmentStatus.COMPLETED
      }
    });

    return {
      completion_rate: Math.round((total_completed / total_appointments) * 100)
    };
  }

  // **OPTIMIZACIÓN**: Método para obtener rendimiento del sistema en batch
  private async getSystemPerformanceBatch(nutritionistId: string): Promise<{
    last_patient: string | null;
    last_appointment: string | null;
    last_diet_plan: string | null;
    last_clinical_record: string | null;
  }> {
    // **OPTIMIZACIÓN**: Obtener últimos registros en paralelo con campos mínimos
    const [
      last_patient_relation,
      last_appointment,
      last_diet_plan,
      last_clinical_record
    ] = await Promise.all([
      this.relationRepository.findOne({
        where: { nutritionist: { id: nutritionistId } },
        order: { requested_at: 'DESC' },
        select: ['requested_at']
      }),
      this.appointmentRepository.findOne({
        where: { nutritionist: { id: nutritionistId } },
        order: { created_at: 'DESC' },
        select: ['created_at']
      }),
      this.dietPlanRepository.findOne({
        where: { nutritionist: { id: nutritionistId } },
        order: { created_at: 'DESC' },
        select: ['created_at']
      }),
      this.clinicalRecordRepository.findOne({
        where: { nutritionist: { id: nutritionistId } },
        order: { created_at: 'DESC' },
        select: ['created_at']
      })
    ]);

    return {
      last_patient: last_patient_relation?.requested_at?.toISOString() || null,
      last_appointment: last_appointment?.created_at?.toISOString() || null,
      last_diet_plan: last_diet_plan?.created_at?.toISOString() || null,
      last_clinical_record: last_clinical_record?.created_at?.toISOString() || null,
    };
  }

  // **MÉTODO SIMPLIFICADO**: Dashboard stats sin optimizaciones complejas
  async getSimpleDashboardStats(nutritionistId: string): Promise<SimpleDashboardStats> {
    try {
      // Conteos básicos
      const total_patients = await this.relationRepository.count({
        where: {
          nutritionist: { id: nutritionistId },
          status: RelationshipStatus.ACTIVE
        }
      });

      const total_appointments = await this.appointmentRepository.count({
        where: { nutritionist: { id: nutritionistId } }
      });

      const total_diet_plans = await this.dietPlanRepository.count({
        where: { nutritionist: { id: nutritionistId } }
      });

      const total_clinical_records = await this.clinicalRecordRepository.count({
        where: { nutritionist: { id: nutritionistId } }
      });

      // Actividades recientes simplificadas
      const recent_activities: Array<{ type: string; id: string; date: string; description: string }> = [];

      // Resumen semanal
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

      const new_patients = await this.relationRepository.count({
        where: {
          nutritionist: { id: nutritionistId },
          status: RelationshipStatus.ACTIVE,
          requested_at: MoreThan(oneWeekAgo)
        }
      });

      const new_appointments = await this.appointmentRepository.count({
        where: {
          nutritionist: { id: nutritionistId },
          created_at: MoreThan(oneWeekAgo)
        }
      });

      // Métricas de rendimiento
      const total_completed = await this.appointmentRepository.count({
        where: {
          nutritionist: { id: nutritionistId },
          status: AppointmentStatus.COMPLETED
        }
      });
      const completion_rate = total_appointments > 0 ? Math.round((total_completed / total_appointments) * 100) : 0;

      // Citas de hoy (Nuevo cálculo para Profile V2)
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const appointments_today = await this.appointmentRepository.count({
        where: {
          nutritionist: { id: nutritionistId },
          start_time: Between(today, tomorrow)
        }
      });

      return {
        total_patients,
        total_appointments,
        total_diet_plans,
        total_clinical_records,
        recent_activities,
        weekly_summary: { new_patients, new_appointments },
        performance_metrics: { completion_rate },
        system_performance: {
          last_patient: null,
          last_appointment: null,
          last_diet_plan: null,
          last_clinical_record: null,
        },
        appointments_today
      };
    } catch (error) {
      console.error('Error en getSimpleDashboardStats:', error);
      throw new AppError('Error al obtener estadísticas del dashboard', 500);
    }
  }
} 