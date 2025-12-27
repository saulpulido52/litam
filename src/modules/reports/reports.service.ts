import { AppDataSource } from '../../database/data-source';
import { Appointment, AppointmentStatus } from '../../database/entities/appointment.entity';
import { ClinicalRecord } from '../../database/entities/clinical_record.entity';
import { PatientNutritionistRelation, RelationshipStatus } from '../../database/entities/patient_nutritionist_relation.entity';
import { MoreThanOrEqual, LessThanOrEqual, Between } from 'typeorm';

export class ReportsService {
    private appointmentRepository = AppDataSource.getRepository(Appointment);
    private clinicalRecordRepository = AppDataSource.getRepository(ClinicalRecord);
    private relationRepository = AppDataSource.getRepository(PatientNutritionistRelation);

    /**
     * Get financial stats aggregated by month for the last 12 months
     */
    async getFinancialStats(nutritionistId: string) {
        const today = new Date();
        const twelveMonthsAgo = new Date();
        twelveMonthsAgo.setMonth(today.getMonth() - 11);
        twelveMonthsAgo.setDate(1); // Start of month

        // Get all appointments in range
        const appointments = await this.appointmentRepository.find({
            where: {
                nutritionist: { id: nutritionistId },
                start_time: MoreThanOrEqual(twelveMonthsAgo),
            },
            order: { start_time: 'ASC' }
        });

        // Group by Month
        const statsMap = new Map<string, { month: string, appointments: number, revenue: number, newPatients: number }>();

        // Initialize all 12 months with 0
        for (let i = 0; i < 12; i++) {
            const d = new Date(twelveMonthsAgo);
            d.setMonth(d.getMonth() + i);
            const monthKey = d.toLocaleString('es-ES', { month: 'long' });
            const year = d.getFullYear();
            const key = `${monthKey} ${year}`; // Unique key
            statsMap.set(key, { month: monthKey, appointments: 0, revenue: 0, newPatients: 0 });
        }

        // Aggregate Appointments & Revenue (Est. $500 per completed, $0 others)
        appointments.forEach(app => {
            const d = new Date(app.start_time);
            const monthKey = d.toLocaleString('es-ES', { month: 'long' });
            const year = d.getFullYear();
            const key = `${monthKey} ${year}`;

            if (statsMap.has(key)) {
                const stat = statsMap.get(key)!;
                stat.appointments += 1;
                if (app.status === AppointmentStatus.COMPLETED) {
                    stat.revenue += 500; // Estimated revenue per consultation
                }
            }
        });

        // Get New Patients Count (Joined in period)
        const newRelations = await this.relationRepository.find({
            where: {
                nutritionist: { id: nutritionistId },
                requested_at: MoreThanOrEqual(twelveMonthsAgo),
                status: RelationshipStatus.ACTIVE
            }
        });

        newRelations.forEach(rel => {
            const d = new Date(rel.requested_at);
            const monthKey = d.toLocaleString('es-ES', { month: 'long' });
            const year = d.getFullYear();
            const key = `${monthKey} ${year}`;

            if (statsMap.has(key)) {
                const stat = statsMap.get(key)!;
                stat.newPatients += 1;
            }
        });

        return Array.from(statsMap.values());
    }

    /**
     * Get progress for all active patients
     */
    async getPatientProgress(nutritionistId: string) {
        // 1. Get all active patients
        const relations = await this.relationRepository.find({
            where: {
                nutritionist: { id: nutritionistId },
                status: RelationshipStatus.ACTIVE
            },
            relations: ['patient', 'patient.patient_profile']
        });

        const patientIds = relations.map(r => r.patient.id);

        if (patientIds.length === 0) return [];

        // 2. Build summary for each patient
        const progressData = await Promise.all(relations.map(async (rel) => {
            const patient = rel.patient;

            // Get FIRST and LAST clinical record with weight
            const records = await this.clinicalRecordRepository.find({
                where: { patient: { id: patient.id } },
                order: { record_date: 'ASC' },
                select: ['record_date', 'anthropometric_measurements']
            });

            const firstRecord = records.length > 0 ? records[0] : null;
            const lastRecord = records.length > 0 ? records[records.length - 1] : null;

            const initialWeight = firstRecord?.anthropometric_measurements?.current_weight_kg || 0;
            const currentWeight = lastRecord?.anthropometric_measurements?.current_weight_kg || initialWeight;

            // Mock target weight (Current - 5kg or Initial - 10%) if not in profile
            const targetWeight = initialWeight > 0 ? Math.round(initialWeight * 0.9) : 0;

            // Progress Calculation (Simplified)
            let progress = 0;
            if (initialWeight > targetWeight) {
                const totalToLose = initialWeight - targetWeight;
                const lost = initialWeight - currentWeight;
                progress = Math.min(100, Math.max(0, Math.round((lost / totalToLose) * 100)));
            }

            return {
                id: patient.id,
                name: `${patient.first_name} ${patient.last_name}`,
                startDate: rel.requested_at.toISOString(),
                initialWeight,
                currentWeight,
                targetWeight,
                progress,
                status: progress >= 80 ? 'completed' : (progress >= 10 ? 'on-track' : 'behind')
            };
        }));

        // Filter out patients with 0 weight (no data)
        return progressData.filter(p => p.initialWeight > 0);
    }

    /**
     * Get service distribution stats
     */
    async getServiceStats(nutritionistId: string) {
        const appointmentsCount = await this.appointmentRepository.count({
            where: { nutritionist: { id: nutritionistId }, status: AppointmentStatus.COMPLETED }
        });

        // Assuming we had a "DietPlans" sold concept, but we can just count generated plans
        const dietPlansCount = await AppDataSource.getRepository('diet_plans').count({ // using string repo for standard entity
            where: { nutritionist: { id: nutritionistId } }
        }) || 0;

        return {
            appointments: { count: appointmentsCount, revenue: appointmentsCount * 500 },
            dietPlans: { count: dietPlansCount, revenue: dietPlansCount * 250 }, // Est $250
            followUps: { count: Math.round(appointmentsCount * 0.4), revenue: Math.round(appointmentsCount * 0.4) * 300 } // Mock specific types
        };
    }
}
