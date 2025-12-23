// src/modules/monetization/monetization.service.ts
import { Repository, DataSource } from 'typeorm';
import { NutritionistTier, NutritionistTierType, PaymentModel } from '../../database/entities/nutritionist_tier.entity';
import { PatientTier, PatientTierType, PatientPaymentModel } from '../../database/entities/patient_tier.entity';
import { User } from '../../database/entities/user.entity';
import { AppError } from '../../utils/app.error';
import { AppDataSource } from '../../database/data-source';
import { RoleName } from '../../database/entities/role.entity';

export class MonetizationService {
    private nutritionistTierRepository: Repository<NutritionistTier>;
    private patientTierRepository: Repository<PatientTier>;
    private userRepository: Repository<User>;

    constructor() {
        this.nutritionistTierRepository = AppDataSource.getRepository(NutritionistTier);
        this.patientTierRepository = AppDataSource.getRepository(PatientTier);
        this.userRepository = AppDataSource.getRepository(User);
    }

    // ==================== GESTIÓN DE TIERS DE NUTRIÓLOGOS ====================

    async getNutritionistTiers(): Promise<NutritionistTier[]> {
        return await this.nutritionistTierRepository.find({
            where: { is_active: true },
            order: { tier_type: 'ASC' }
        });
    }

    async getNutritionistTierById(tierId: string): Promise<NutritionistTier> {
        const tier = await this.nutritionistTierRepository.findOne({
            where: { id: tierId, is_active: true }
        });

        if (!tier) {
            throw new AppError('Tier de nutriólogo no encontrado', 404);
        }

        return tier;
    }

    async assignNutritionistTier(userId: string, tierId: string): Promise<User> {
        const user = await this.userRepository.findOne({
            where: { id: userId },
            relations: ['role', 'nutritionist_tier']
        });

        if (!user) {
            throw new AppError('Usuario no encontrado', 404);
        }

        if (user.role.name !== RoleName.NUTRITIONIST) {
            throw new AppError('Solo los nutriólogos pueden tener tiers de nutriólogo', 403);
        }

        const tier = await this.getNutritionistTierById(tierId);
        user.nutritionist_tier = tier;

        return await this.userRepository.save(user);
    }

    async getNutritionistTierStats(): Promise<{
        total_nutritionists: number;
        basic_nutritionists: number;
        premium_nutritionists: number;
        total_commission_revenue: number;
        total_subscription_revenue: number;
    }> {
        const [totalNutritionists, basicNutritionists, premiumNutritionists] = await Promise.all([
            this.userRepository.count({
                where: { role: { name: RoleName.NUTRITIONIST } }
            }),
            this.userRepository.count({
                where: { 
                    role: { name: RoleName.NUTRITIONIST },
                    nutritionist_tier: { tier_type: NutritionistTierType.BASIC }
                }
            }),
            this.userRepository.count({
                where: { 
                    role: { name: RoleName.NUTRITIONIST },
                    nutritionist_tier: { tier_type: NutritionistTierType.PREMIUM }
                }
            })
        ]);

        // TODO: Implementar cálculo de ingresos reales
        const totalCommissionRevenue = 0; // Calcular desde transacciones
        const totalSubscriptionRevenue = 0; // Calcular desde suscripciones

        return {
            total_nutritionists: totalNutritionists,
            basic_nutritionists: basicNutritionists,
            premium_nutritionists: premiumNutritionists,
            total_commission_revenue: totalCommissionRevenue,
            total_subscription_revenue: totalSubscriptionRevenue,
        };
    }

    // ==================== GESTIÓN DE TIERS DE PACIENTES ====================

    async getPatientTiers(): Promise<PatientTier[]> {
        return await this.patientTierRepository.find({
            where: { is_active: true },
            order: { tier_type: 'ASC' }
        });
    }

    async getPatientTierById(tierId: string): Promise<PatientTier> {
        const tier = await this.patientTierRepository.findOne({
            where: { id: tierId, is_active: true }
        });

        if (!tier) {
            throw new AppError('Tier de paciente no encontrado', 404);
        }

        return tier;
    }

    async assignPatientTier(userId: string, tierId: string): Promise<User> {
        const user = await this.userRepository.findOne({
            where: { id: userId },
            relations: ['role', 'patient_tier']
        });

        if (!user) {
            throw new AppError('Usuario no encontrado', 404);
        }

        if (user.role.name !== RoleName.PATIENT) {
            throw new AppError('Solo los pacientes pueden tener tiers de paciente', 403);
        }

        const tier = await this.getPatientTierById(tierId);
        user.patient_tier = tier;

        return await this.userRepository.save(user);
    }

    async getPatientTierStats(): Promise<{
        total_patients: number;
        free_patients: number;
        pro_patients: number;
        premium_patients: number;
        total_revenue: number;
    }> {
        const [totalPatients, freePatients, proPatients, premiumPatients] = await Promise.all([
            this.userRepository.count({
                where: { role: { name: RoleName.PATIENT } }
            }),
            this.userRepository.count({
                where: { 
                    role: { name: RoleName.PATIENT },
                    patient_tier: { tier_type: PatientTierType.FREE }
                }
            }),
            this.userRepository.count({
                where: { 
                    role: { name: RoleName.PATIENT },
                    patient_tier: { tier_type: PatientTierType.PRO }
                }
            }),
            this.userRepository.count({
                where: { 
                    role: { name: RoleName.PATIENT },
                    patient_tier: { tier_type: PatientTierType.PREMIUM }
                }
            })
        ]);

        // TODO: Implementar cálculo de ingresos reales
        const totalRevenue = 0; // Calcular desde transacciones

        return {
            total_patients: totalPatients,
            free_patients: freePatients,
            pro_patients: proPatients,
            premium_patients: premiumPatients,
            total_revenue: totalRevenue,
        };
    }

    // ==================== MÉTODOS DE VALIDACIÓN DE FUNCIONALIDADES ====================
    // TEMPORALMENTE DESACTIVADO PARA DESARROLLO

    async canNutritionistUseAI(userId: string): Promise<boolean> {
        // TODO: Activar cuando el modelo de negocio esté listo
        return true; // Temporalmente permitir acceso a todos
    }

    async canNutritionistHaveUnlimitedPatients(userId: string): Promise<boolean> {
        // TODO: Activar cuando el modelo de negocio esté listo
        return true; // Temporalmente permitir acceso a todos
    }

    async canPatientUseAIFoodScanning(userId: string): Promise<boolean> {
        // TODO: Activar cuando el modelo de negocio esté listo
        return true; // Temporalmente permitir acceso a todos
    }

    async canPatientUseBarcodeScanning(userId: string): Promise<boolean> {
        // TODO: Activar cuando el modelo de negocio esté listo
        return true; // Temporalmente permitir acceso a todos
    }

    async shouldPatientSeeAds(userId: string): Promise<boolean> {
        // TODO: Activar cuando el modelo de negocio esté listo
        return false; // Temporalmente no mostrar anuncios
    }

    // ==================== INICIALIZACIÓN DE TIERS POR DEFECTO ====================

    async initializeDefaultTiers(): Promise<void> {
        // Crear tiers de nutriólogos por defecto
        const nutritionistTiers = [
            {
                name: 'Modelo de Comisión por Consulta',
                description: 'El nutriólogo establece su tarifa base y paga 15% de comisión por cada consulta realizada. Ideal para nutriólogos que están comenzando o prefieren pago por uso.',
                tier_type: NutritionistTierType.BASIC,
                payment_model: PaymentModel.COMMISSION,
                commission_rate: 15.00, // ✅ 15% según especificación
                subscription_price: null,
                annual_price: null,
                max_active_patients: -1, // Sin límite en modelo comisión
                includes_ai_meal_planning: true,
                includes_advanced_management: true,
                includes_priority_support: false,
                is_active: true
            },
            {
                name: 'Modelo de Suscripción Mensual (Premium)',
                description: 'Tarifa fija de $600 MXN por mes. El nutriólogo retiene el 100% de sus ingresos por consulta. Ideal para nutriólogos con volumen moderado a alto de consultas.',
                tier_type: NutritionistTierType.PREMIUM,
                payment_model: PaymentModel.SUBSCRIPTION,
                commission_rate: null,
                subscription_price: 600.00, // ✅ $600 MXN según especificación
                annual_price: 6600.00, // 10% descuento anual (11 meses)
                max_active_patients: -1,
                includes_ai_meal_planning: true,
                includes_advanced_management: true,
                includes_priority_support: true,
                is_active: true
            }
        ];

        // Crear tiers de pacientes por defecto
        const patientTiers = [
            {
                name: 'Paciente Gratuito',
                description: 'Acceso básico con anuncios publicitarios',
                tier_type: PatientTierType.FREE,
                payment_model: PatientPaymentModel.FREE,
                one_time_price: null,
                monthly_price: null,
                annual_price: null,
                shows_ads: true,
                includes_ai_food_scanning: false,
                includes_barcode_scanning: false,
                includes_smart_shopping_list: false,
                includes_advanced_tracking: false,
                includes_device_integration: false,
                is_active: true
            },
            {
                name: 'Paciente Pro',
                description: 'Sin anuncios por pago único de $40 MXN',
                tier_type: PatientTierType.PRO,
                payment_model: PatientPaymentModel.ONE_TIME,
                one_time_price: 40.00,
                monthly_price: null,
                annual_price: null,
                shows_ads: false,
                includes_ai_food_scanning: false,
                includes_barcode_scanning: false,
                includes_smart_shopping_list: false,
                includes_advanced_tracking: false,
                includes_device_integration: false,
                is_active: true
            },
            {
                name: 'Paciente Premium',
                description: 'Herramientas avanzadas de IA y seguimiento',
                tier_type: PatientTierType.PREMIUM,
                payment_model: PatientPaymentModel.SUBSCRIPTION,
                one_time_price: null,
                monthly_price: 99.99,
                annual_price: 999.99,
                shows_ads: false,
                includes_ai_food_scanning: true,
                includes_barcode_scanning: true,
                includes_smart_shopping_list: true,
                includes_advanced_tracking: true,
                includes_device_integration: true,
                is_active: true
            }
        ];

        // Verificar si ya existen tiers
        const existingNutritionistTiers = await this.nutritionistTierRepository.count();
        const existingPatientTiers = await this.patientTierRepository.count();

        if (existingNutritionistTiers === 0) {
            for (const tierData of nutritionistTiers) {
                const tier = this.nutritionistTierRepository.create(tierData);
                await this.nutritionistTierRepository.save(tier);
            }
            console.log('✅ Tiers de nutriólogos inicializados');
        }

        if (existingPatientTiers === 0) {
            for (const tierData of patientTiers) {
                const tier = this.patientTierRepository.create(tierData);
                await this.patientTierRepository.save(tier);
            }
            console.log('✅ Tiers de pacientes inicializados');
        }
    }

  // ==================== REPORTES DE INGRESOS Y USO ====================

  async getRevenueReport(startDate: Date, endDate: Date): Promise<{
    total_revenue: number;
    nutritionist_revenue: number;
    patient_revenue: number;
    commission_revenue: number;
    subscription_revenue: number;
    one_time_revenue: number;
    monthly_breakdown: Array<{
      month: string;
      revenue: number;
      nutritionist_count: number;
      patient_count: number;
    }>;
  }> {
    try {
      // Simular datos de ingresos (en producción esto vendría de transacciones reales)
      const totalRevenue = 15000.00;
      const nutritionistRevenue = 8000.00;
      const patientRevenue = 7000.00;
      const commissionRevenue = 3000.00;
      const subscriptionRevenue = 10000.00;
      const oneTimeRevenue = 2000.00;

      const monthlyBreakdown = [
        { month: 'Enero 2025', revenue: 2500.00, nutritionist_count: 15, patient_count: 45 },
        { month: 'Febrero 2025', revenue: 2800.00, nutritionist_count: 18, patient_count: 52 },
        { month: 'Marzo 2025', revenue: 3200.00, nutritionist_count: 22, patient_count: 58 },
        { month: 'Abril 2025', revenue: 2900.00, nutritionist_count: 20, patient_count: 55 },
        { month: 'Mayo 2025', revenue: 3600.00, nutritionist_count: 25, patient_count: 62 }
      ];

      return {
        total_revenue: totalRevenue,
        nutritionist_revenue: nutritionistRevenue,
        patient_revenue: patientRevenue,
        commission_revenue: commissionRevenue,
        subscription_revenue: subscriptionRevenue,
        one_time_revenue: oneTimeRevenue,
        monthly_breakdown: monthlyBreakdown
      };
    } catch (error) {
      console.error('Error generating revenue report:', error);
      throw new Error('Error al generar reporte de ingresos');
    }
  }

  async getUsageReport(): Promise<{
    total_users: number;
    active_users: number;
    nutritionist_usage: {
      basic: { count: number; features_used: string[] };
      premium: { count: number; features_used: string[] };
    };
    patient_usage: {
      free: { count: number; features_used: string[] };
      pro: { count: number; features_used: string[] };
      premium: { count: number; features_used: string[] };
    };
    feature_usage: {
      ai_meal_planning: number;
      unlimited_patients: number;
      ai_food_scanning: number;
      barcode_scanning: number;
      smart_shopping_list: number;
      advanced_tracking: number;
    };
  }> {
    try {
      // Obtener estadísticas reales de la base de datos
      const totalUsers = await this.userRepository.count();
      const activeUsers = await this.userRepository.count({ where: { is_active: true } });

      // Estadísticas de nutriólogos por tier
      const nutritionistStats = await this.userRepository
        .createQueryBuilder('user')
        .leftJoin('user.nutritionist_tier', 'tier')
        .leftJoin('user.role', 'role')
        .where('role.name = :role', { role: 'NUTRITIONIST' })
        .select([
          'tier.tier_type as tier_type',
          'COUNT(user.id) as count'
        ])
        .groupBy('tier.tier_type')
        .getRawMany();

      // Estadísticas de pacientes por tier
      const patientStats = await this.userRepository
        .createQueryBuilder('user')
        .leftJoin('user.patient_tier', 'tier')
        .leftJoin('user.role', 'role')
        .where('role.name = :role', { role: 'PATIENT' })
        .select([
          'tier.tier_type as tier_type',
          'COUNT(user.id) as count'
        ])
        .groupBy('tier.tier_type')
        .getRawMany();

      // Simular uso de funcionalidades
      const featureUsage = {
        ai_meal_planning: 45,
        unlimited_patients: 22,
        ai_food_scanning: 78,
        barcode_scanning: 65,
        smart_shopping_list: 34,
        advanced_tracking: 28
      };

      return {
        total_users: totalUsers,
        active_users: activeUsers,
        nutritionist_usage: {
          basic: { 
            count: nutritionistStats.find(s => s.tier_type === 'BASIC')?.count || 0,
            features_used: ['Gestión básica de pacientes']
          },
          premium: { 
            count: nutritionistStats.find(s => s.tier_type === 'PREMIUM')?.count || 0,
            features_used: ['IA para planificación', 'Pacientes ilimitados', 'Gestión avanzada']
          }
        },
        patient_usage: {
          free: { 
            count: patientStats.find(s => s.tier_type === 'FREE')?.count || 0,
            features_used: ['Acceso básico']
          },
          pro: { 
            count: patientStats.find(s => s.tier_type === 'PRO')?.count || 0,
            features_used: ['Sin anuncios']
          },
          premium: { 
            count: patientStats.find(s => s.tier_type === 'PREMIUM')?.count || 0,
            features_used: ['Escaneo IA', 'Códigos de barras', 'Lista inteligente']
          }
        },
        feature_usage: featureUsage
      };
    } catch (error) {
      console.error('Error generating usage report:', error);
      throw new Error('Error al generar reporte de uso');
    }
  }

  async getTierConversionReport(): Promise<{
    nutritionist_conversions: {
      basic_to_premium: number;
      conversion_rate: number;
      avg_time_to_upgrade: number;
    };
    patient_conversions: {
      free_to_pro: number;
      free_to_premium: number;
      pro_to_premium: number;
      conversion_rate: number;
    };
    revenue_impact: {
      monthly_recurring_revenue: number;
      annual_recurring_revenue: number;
      projected_growth: number;
    };
  }> {
    try {
      // Simular datos de conversión
      return {
        nutritionist_conversions: {
          basic_to_premium: 12,
          conversion_rate: 15.5,
          avg_time_to_upgrade: 45 // días
        },
        patient_conversions: {
          free_to_pro: 28,
          free_to_premium: 15,
          pro_to_premium: 8,
          conversion_rate: 8.2
        },
        revenue_impact: {
          monthly_recurring_revenue: 8500.00,
          annual_recurring_revenue: 102000.00,
          projected_growth: 25.5
        }
      };
    } catch (error) {
      console.error('Error generating conversion report:', error);
      throw new Error('Error al generar reporte de conversión');
    }
  }
}

export default new MonetizationService(); 