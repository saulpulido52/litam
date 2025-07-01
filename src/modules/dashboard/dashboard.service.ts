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

  async getSimpleDashboardStats(nutritionistId: string): Promise<SimpleDashboardStats> {
    // Buscar el rol de paciente
    const patientRole = await this.roleRepository.findOneByOrFail({ name: RoleName.PATIENT });

    // 🎯 FILTRADO POR NUTRIÓLOGO: Solo pacientes de este nutriólogo
    const myPatientRelations = await this.relationRepository.find({
      where: { 
        nutritionist: { id: nutritionistId },
        status: RelationshipStatus.ACTIVE 
      },
      relations: ['patient']
    });

    const patientUserIds = myPatientRelations.map(rel => rel.patient.id);

    // Totales filtrados por pacientes del nutriólogo
    const total_patients = patientUserIds.length;
    
    // Solo citas que involucren a este nutriólogo
    const total_appointments = await this.appointmentRepository.count({ 
      where: { nutritionist: { id: nutritionistId } } 
    });
    
    // Solo planes de dieta de este nutriólogo
    const total_diet_plans = await this.dietPlanRepository.count({ 
      where: { nutritionist: { id: nutritionistId } } 
    });
    
    // Solo expedientes clínicos de este nutriólogo
    const total_clinical_records = await this.clinicalRecordRepository.count({ 
      where: { nutritionist: { id: nutritionistId } } 
    });

    // 🎯 ACTIVIDADES RECIENTES FILTRADAS: Solo del nutriólogo actual
    let recent_activities: Array<{ type: string; id: string; date: string; description: string }> = [];

    // Pacientes recientes (sus pacientes)
    if (patientUserIds.length > 0) {
      const recent_patients = await this.userRepository.find({ 
        where: { 
          role: { id: patientRole.id },
          id: patientUserIds.length > 0 ? In(patientUserIds) : undefined
        }, 
        order: { created_at: 'DESC' }, 
        take: 3 
      });
      
      recent_activities.push(
        ...recent_patients.map(p => ({ 
          type: 'patient', 
          id: p.id, 
          date: p.created_at.toISOString(), 
          description: `Nuevo paciente: ${p.first_name || ''} ${p.last_name || ''}`.trim() 
        }))
      );
    }

    // Citas recientes (del nutriólogo)
    const recent_appointments = await this.appointmentRepository.find({ 
      where: { nutritionist: { id: nutritionistId } },
      order: { created_at: 'DESC' }, 
      take: 3 
    });
    
    recent_activities.push(
      ...recent_appointments.map(a => ({ 
        type: 'appointment', 
        id: a.id, 
        date: a.created_at.toISOString(), 
        description: `Cita ${a.status === AppointmentStatus.COMPLETED ? 'completada' : a.status === AppointmentStatus.SCHEDULED ? 'programada' : a.status}` 
      }))
    );

    // Planes de dieta recientes (del nutriólogo)
    const recent_diet_plans = await this.dietPlanRepository.find({ 
      where: { nutritionist: { id: nutritionistId } },
      order: { created_at: 'DESC' }, 
      take: 3 
    });
    
    recent_activities.push(
      ...recent_diet_plans.map(d => ({ 
        type: 'diet_plan', 
        id: d.id, 
        date: d.created_at.toISOString(), 
        description: `Plan nutricional: ${d.name || 'Plan de dieta'}` 
      }))
    );

    // Expedientes clínicos recientes (del nutriólogo)
    const recent_clinical_records = await this.clinicalRecordRepository.find({ 
      where: { nutritionist: { id: nutritionistId } },
      order: { created_at: 'DESC' }, 
      take: 3 
    });
    
    recent_activities.push(
      ...recent_clinical_records.map(c => ({ 
        type: 'clinical_record', 
        id: c.id, 
        date: c.created_at.toISOString(), 
        description: `Expediente: ${c.expedient_number || 'Registro clínico'}` 
      }))
    );

    // Ordenar actividades por fecha (más recientes primero) y tomar las últimas 10
    recent_activities = recent_activities
      .sort((a, b) => b.date.localeCompare(a.date))
      .slice(0, 10);

    // 🎯 RESUMEN SEMANAL FILTRADO: Solo actividades del nutriólogo
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    
    // Nuevos pacientes en relaciones activas de este nutriólogo
    const new_patients = await this.relationRepository.count({ 
      where: { 
        nutritionist: { id: nutritionistId },
        status: RelationshipStatus.ACTIVE,
        requested_at: MoreThan(oneWeekAgo) 
      } 
    });
    
    // Nuevas citas de este nutriólogo
    const new_appointments = await this.appointmentRepository.count({ 
      where: { 
        nutritionist: { id: nutritionistId },
        created_at: MoreThan(oneWeekAgo) 
      } 
    });

    // 🎯 MÉTRICAS DE RENDIMIENTO FILTRADAS: Solo del nutriólogo
    const total_completed = await this.appointmentRepository.count({ 
      where: { 
        nutritionist: { id: nutritionistId },
        status: AppointmentStatus.COMPLETED 
      } 
    });
    const completion_rate = total_appointments > 0 ? Math.round((total_completed / total_appointments) * 100) : 0;

    // 🎯 RENDIMIENTO DEL SISTEMA FILTRADO: Últimos registros del nutriólogo
    const last_patient_relation = await this.relationRepository.findOne({
      where: { nutritionist: { id: nutritionistId } },
      order: { requested_at: 'DESC' }
    });
    
    const last_appointment = await this.appointmentRepository.findOne({
      where: { nutritionist: { id: nutritionistId } },
      order: { created_at: 'DESC' }
    });
    
    const last_diet_plan = await this.dietPlanRepository.findOne({
      where: { nutritionist: { id: nutritionistId } },
      order: { created_at: 'DESC' }
    });
    
    const last_clinical_record = await this.clinicalRecordRepository.findOne({
      where: { nutritionist: { id: nutritionistId } },
      order: { created_at: 'DESC' }
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
        last_patient: last_patient_relation?.requested_at?.toISOString() || null,
        last_appointment: last_appointment?.created_at?.toISOString() || null,
        last_diet_plan: last_diet_plan?.created_at?.toISOString() || null,
        last_clinical_record: last_clinical_record?.created_at?.toISOString() || null,
      },
    };
  }
} 