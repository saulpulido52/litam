// seed-subscription-plans.ts
import 'reflect-metadata';
import { AppDataSource } from './src/database/data-source';
import { SubscriptionPlan, PlanType, PlanStatus } from './src/database/entities/subscription_plan.entity';

async function seedSubscriptionPlans() {
    try {
        await AppDataSource.initialize();
        console.log('🔗 Conexión a la base de datos establecida');

        const planRepository = AppDataSource.getRepository(SubscriptionPlan);

        // Verificar si ya existen planes
        const existingPlans = await planRepository.count();
        if (existingPlans > 0) {
            console.log('⚠️  Ya existen planes de suscripción en la base de datos');
            return;
        }

        // Crear planes de suscripción
        const plans = [
            {
                name: 'Plan Básico Mensual',
                description: 'Plan ideal para comenzar tu transformación nutricional. Incluye consulta inicial, plan nutricional personalizado y seguimiento básico.',
                type: PlanType.MONTHLY,
                price: 599.00,
                duration_days: 30,
                max_consultations: 2,
                includes_nutrition_plan: true,
                includes_progress_tracking: true,
                includes_messaging: false,
                status: PlanStatus.ACTIVE,
            },
            {
                name: 'Plan Premium Mensual',
                description: 'Plan completo con seguimiento intensivo. Incluye consultas ilimitadas, chat directo con nutriólogo y planes personalizados con recetas.',
                type: PlanType.MONTHLY,
                price: 999.00,
                duration_days: 30,
                max_consultations: null, // ilimitadas
                includes_nutrition_plan: true,
                includes_progress_tracking: true,
                includes_messaging: true,
                status: PlanStatus.ACTIVE,
            },
            {
                name: 'Plan Básico Anual',
                description: 'Compromiso anual con descuento especial. Perfect para objetivos a largo plazo con seguimiento constante durante todo el año.',
                type: PlanType.ANNUAL,
                price: 5999.00, // Equivale a 10 meses (2 meses gratis)
                duration_days: 365,
                max_consultations: 24, // 2 por mes
                includes_nutrition_plan: true,
                includes_progress_tracking: true,
                includes_messaging: false,
                status: PlanStatus.ACTIVE,
            },
            {
                name: 'Plan Premium Anual',
                description: 'El plan más completo para transformación total. Consultas ilimitadas, chat 24/7, planes premium y seguimiento especializado.',
                type: PlanType.ANNUAL,
                price: 9999.00, // Equivale a 10 meses premium
                duration_days: 365,
                max_consultations: null, // ilimitadas
                includes_nutrition_plan: true,
                includes_progress_tracking: true,
                includes_messaging: true,
                status: PlanStatus.ACTIVE,
            },
        ];

        console.log('📦 Creando planes de suscripción...');

        for (const planData of plans) {
            const plan = planRepository.create(planData);
            await planRepository.save(plan);
            console.log(`✅ Plan creado: ${plan.name} - $${plan.price} MXN`);
        }

        console.log('🎉 Todos los planes de suscripción han sido creados exitosamente');

        // Mostrar resumen
        console.log('\n📊 RESUMEN DE PLANES CREADOS:');
        console.log('┌─────────────────────────────┬──────────┬─────────────┬───────────────────┐');
        console.log('│ Plan                        │ Precio   │ Duración    │ Consultas         │');
        console.log('├─────────────────────────────┼──────────┼─────────────┼───────────────────┤');
        console.log('│ Plan Básico Mensual         │ $599     │ 30 días     │ 2                 │');
        console.log('│ Plan Premium Mensual        │ $999     │ 30 días     │ Ilimitadas        │');
        console.log('│ Plan Básico Anual           │ $5,999   │ 365 días    │ 24 (2/mes)        │');
        console.log('│ Plan Premium Anual          │ $9,999   │ 365 días    │ Ilimitadas        │');
        console.log('└─────────────────────────────┴──────────┴─────────────┴───────────────────┘');

    } catch (error) {
        console.error('❌ Error al crear los planes de suscripción:', error);
    } finally {
        await AppDataSource.destroy();
        console.log('🔌 Conexión a la base de datos cerrada');
    }
}

// Ejecutar el script
if (require.main === module) {
    seedSubscriptionPlans();
} 