// src/modules/commissions/commission.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { NutritionistCommission, CommissionStatus, CommissionType } from '../../database/entities/nutritionist_commission.entity';
import { User } from '../../database/entities/user.entity';
import { Appointment } from '../../database/entities/appointment.entity';
import { Relation } from '../../database/entities/relation.entity';
import { AppError } from '../../utils/app.error';

@Injectable()
export class CommissionService {
    constructor(
        @InjectRepository(NutritionistCommission)
        private commissionRepository: Repository<NutritionistCommission>,
        @InjectRepository(User)
        private userRepository: Repository<User>,
        @InjectRepository(Appointment)
        private appointmentRepository: Repository<Appointment>,
        @InjectRepository(Relation)
        private relationRepository: Repository<Relation>,
    ) {}

    // ==================== CALCULAR COMISIONES ====================

    async calculateMonthlyCommission(nutritionistId: string, month: number, year: number): Promise<NutritionistCommission> {
        const nutritionist = await this.userRepository.findOne({
            where: { id: nutritionistId },
            relations: ['role']
        });

        if (!nutritionist || nutritionist.role.name !== 'nutritionist') {
            throw new AppError('Nutriólogo no encontrado', 404);
        }

        // Calcular período
        const periodStart = new Date(year, month - 1, 1);
        const periodEnd = new Date(year, month, 0); // Último día del mes

        // Verificar si ya existe una comisión para este período
        const existingCommission = await this.commissionRepository.findOne({
            where: {
                nutritionist: { id: nutritionistId },
                period_start: periodStart,
                period_end: periodEnd
            }
        });

        if (existingCommission) {
            throw new AppError('Ya existe una comisión calculada para este período', 409);
        }

        // Obtener estadísticas del nutriólogo
        const stats = await this.getNutritionistStats(nutritionistId, periodStart, periodEnd);

        // Calcular comisión (porcentaje por defecto: 15%)
        const commissionPercentage = 15.00; // Esto podría venir de configuración
        const commissionAmount = (stats.totalRevenue * commissionPercentage) / 100;

        // Crear comisión
        const commission = this.commissionRepository.create({
            nutritionist: nutritionist,
            commission_percentage: commissionPercentage,
            total_revenue: stats.totalRevenue,
            commission_amount: commissionAmount,
            total_patients: stats.totalPatients,
            total_consultations: stats.totalConsultations,
            commission_type: CommissionType.PERCENTAGE,
            status: CommissionStatus.PENDING,
            period_start: periodStart,
            period_end: periodEnd
        });

        return await this.commissionRepository.save(commission);
    }

    // ==================== OBTENER ESTADÍSTICAS ====================

    private async getNutritionistStats(nutritionistId: string, startDate: Date, endDate: Date) {
        // Contar pacientes activos
        const totalPatients = await this.relationRepository.count({
            where: {
                nutritionist: { id: nutritionistId },
                status: 'active'
            }
        });

        // Contar consultas realizadas
        const totalConsultations = await this.appointmentRepository.count({
            where: {
                nutritionist: { id: nutritionistId },
                status: 'completed',
                appointment_date: Between(startDate, endDate)
            }
        });

        // Calcular ingresos (simulado por ahora)
        // En un sistema real, esto vendría de transacciones de pago
        const totalRevenue = totalConsultations * 500; // $500 por consulta

        return {
            totalPatients,
            totalConsultations,
            totalRevenue
        };
    }

    // ==================== GESTIÓN DE COMISIONES ====================

    async getCommissionsByNutritionist(nutritionistId: string): Promise<NutritionistCommission[]> {
        return await this.commissionRepository.find({
            where: { nutritionist: { id: nutritionistId } },
            order: { period_start: 'DESC' }
        });
    }

    async getAllCommissions(): Promise<NutritionistCommission[]> {
        return await this.commissionRepository.find({
            relations: ['nutritionist'],
            order: { period_start: 'DESC' }
        });
    }

    async getCommissionById(commissionId: string): Promise<NutritionistCommission> {
        const commission = await this.commissionRepository.findOne({
            where: { id: commissionId },
            relations: ['nutritionist']
        });

        if (!commission) {
            throw new AppError('Comisión no encontrada', 404);
        }

        return commission;
    }

    async markCommissionAsPaid(commissionId: string, paymentReference?: string): Promise<NutritionistCommission> {
        const commission = await this.getCommissionById(commissionId);

        commission.status = CommissionStatus.PAID;
        commission.payment_date = new Date();
        commission.payment_reference = paymentReference || null;

        return await this.commissionRepository.save(commission);
    }

    async cancelCommission(commissionId: string, reason?: string): Promise<NutritionistCommission> {
        const commission = await this.getCommissionById(commissionId);

        commission.status = CommissionStatus.CANCELLED;
        commission.notes = reason || null;

        return await this.commissionRepository.save(commission);
    }

    // ==================== ESTADÍSTICAS ADMIN ====================

    async getCommissionStats(): Promise<{
        totalPending: number;
        totalPaid: number;
        totalRevenue: number;
        totalCommissions: number;
        averageCommission: number;
    }> {
        const [pending, paid] = await Promise.all([
            this.commissionRepository.count({ where: { status: CommissionStatus.PENDING } }),
            this.commissionRepository.count({ where: { status: CommissionStatus.PAID } })
        ]);

        const revenueResult = await this.commissionRepository
            .createQueryBuilder('commission')
            .select('SUM(commission.total_revenue)', 'total')
            .getRawOne();

        const commissionResult = await this.commissionRepository
            .createQueryBuilder('commission')
            .select('SUM(commission.commission_amount)', 'total')
            .getRawOne();

        const totalRevenue = parseFloat(revenueResult?.total || '0');
        const totalCommissions = parseFloat(commissionResult?.total || '0');
        const averageCommission = totalCommissions / (pending + paid) || 0;

        return {
            totalPending: pending,
            totalPaid: paid,
            totalRevenue,
            totalCommissions,
            averageCommission
        };
    }

    // ==================== REPORTES ====================

    async generateCommissionReport(startDate: Date, endDate: Date): Promise<{
        period: { start: Date; end: Date };
        totalCommissions: number;
        totalRevenue: number;
        totalPaid: number;
        totalPending: number;
        commissions: NutritionistCommission[];
    }> {
        const commissions = await this.commissionRepository.find({
            where: {
                period_start: Between(startDate, endDate)
            },
            relations: ['nutritionist'],
            order: { period_start: 'ASC' }
        });

        const totalCommissions = commissions.length;
        const totalRevenue = commissions.reduce((sum, c) => sum + parseFloat(c.total_revenue.toString()), 0);
        const totalPaid = commissions.filter(c => c.status === CommissionStatus.PAID).length;
        const totalPending = commissions.filter(c => c.status === CommissionStatus.PENDING).length;

        return {
            period: { start: startDate, end: endDate },
            totalCommissions,
            totalRevenue,
            totalPaid,
            totalPending,
            commissions
        };
    }
} 