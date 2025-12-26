// src/database/data-source.ts
import 'reflect-metadata';
import { DataSource } from 'typeorm';
import dotenv from 'dotenv';
import path from 'path';
import { User } from './entities/user.entity';
import { Role } from './entities/role.entity';
import { PatientProfile } from './entities/patient_profile.entity';
import { NutritionistProfile } from './entities/nutritionist_profile.entity';
import { PatientNutritionistRelation } from './entities/patient_nutritionist_relation.entity';
import { Food } from './entities/food.entity';
import { MealItem } from './entities/meal_item.entity';
import { Meal } from './entities/meal.entity';
import { DietPlan } from './entities/diet_plan.entity';
import { Appointment } from './entities/appointment.entity';
import { NutritionistAvailability } from './entities/nutritionist_availability.entity';
import { PatientProgressLog } from './entities/patient_progress_log.entity';
import { SubscriptionPlan } from './entities/subscription_plan.entity';
import { UserSubscription } from './entities/user_subscription.entity';
import { PaymentTransaction } from './entities/payment_transaction.entity';
import { EducationalContent } from './entities/educational_content.entity';
import { Recipe, RecipeIngredient } from './entities/recipe.entity';
import { Conversation } from './entities/conversation.entity';
import { Message } from './entities/message.entity';
import { ClinicalRecord } from './entities/clinical_record.entity';
import { NutritionistTier } from './entities/nutritionist_tier.entity';
import { PatientTier } from './entities/patient_tier.entity';
import { NutritionistReview } from './entities/nutritionist_review.entity';
import { GrowthReference } from './entities/growth_reference.entity';
import { GrowthAlert } from './entities/growth_alert.entity';
import { WeeklyPlanTemplate } from './entities/weekly-plan-template.entity';
import { TemplateMeal } from './entities/template-meal.entity';
import { TemplateFood } from './entities/template-food.entity';
import { TemplateRecipe } from './entities/template-recipe.entity';

dotenv.config();

export const AppDataSource = new DataSource({
    type: 'postgres',

    // **CONFIGURACIÓN OPTIMIZADA PARA SUPABASE**
    ...(process.env.NODE_ENV === 'production' ? {
        // Configuración para Supabase
        // Si existe DATABASE_URL la usamos (recomendado), si no, usamos las variables individuales
        ...(process.env.DATABASE_URL ? { url: process.env.DATABASE_URL } : {
            host: process.env.DB_HOST,
            port: parseInt(process.env.DB_PORT || '5432', 10),
            username: process.env.DB_USERNAME,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_DATABASE,
        }),
        ssl: {
            rejectUnauthorized: false,
            require: true
        }
    } : {
        // Configuración para desarrollo local
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT || '5432', 10),
        username: process.env.DB_USERNAME,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_DATABASE,
    }),

    // **CONNECTION POOLING OPTIMIZADO PARA MILES DE USUARIOS**
    extra: {
        // **CONFIGURACIÓN DE POOL PARA ALTA CONCURRENCIA**
        max: process.env.NODE_ENV === 'production' ? 25 : 20,    // Máximo para miles de usuarios
        min: process.env.NODE_ENV === 'production' ? 5 : 5,      // Mínimo siempre activo

        // **TIMEOUTS AGRESIVOS PARA ALTA ROTACIÓN**
        acquireTimeoutMillis: process.env.NODE_ENV === 'production' ? 15000 : 60000,  // Más agresivo
        idleTimeoutMillis: process.env.NODE_ENV === 'production' ? 5000 : 30000,      // Liberar rápido
        connectionTimeoutMillis: process.env.NODE_ENV === 'production' ? 3000 : 10000, // Conectar rápido

        // **TIMEOUTS DE QUERY OPTIMIZADOS PARA MÓVILES**
        statement_timeout: process.env.NODE_ENV === 'production' ? 15000 : 30000,     // 15s max
        idle_in_transaction_session_timeout: process.env.NODE_ENV === 'production' ? 20000 : 60000, // 20s max

        // **CONFIGURACIONES ESPECÍFICAS PARA SUPABASE + ALTA ESCALA**
        ...(process.env.NODE_ENV === 'production' && {
            // Configuraciones para miles de usuarios
            application_name: 'nutri-backend-prod',
            connect_timeout: 5,                    // Conexión rápida
            keepalive: true,
            keepalive_idle: 10,                    // Keep-alive más frecuente
            tcp_keepalives_interval: 150,          // Detección de conexiones muertas
            tcp_keepalives_count: 3,

            // **CONFIGURACIONES DE PERFORMANCE PARA MÓVILES**
            lock_timeout: 10000,                   // 10s timeout en locks
            log_statement: 'none',                 // Sin logging de statements
            log_duration: false,                   // Sin logging de duración

            // **SSL OPTIMIZADO PARA SUPABASE**
            ssl: {
                rejectUnauthorized: false,
                require: true,
                mode: 'require',
                // Optimizaciones SSL para conexiones rápidas
            },

            // **CONFIGURACIONES ADICIONALES PARA ALTA CONCURRENCIA**
            search_path: 'public',                 // Schema por defecto
            timezone: 'UTC',                       // UTC siempre para consistencia

            // **OPTIMIZACIONES DE MEMORIA**
            shared_preload_libraries: 'pg_stat_statements',
            work_mem: '4MB',                       // Memoria por query
            maintenance_work_mem: '64MB',
        })
    },

    // **OPTIMIZACIONES DE PERFORMANCE PARA SUPABASE**
    maxQueryExecutionTime: process.env.NODE_ENV === 'production' ? 5000 : 10000,  // 5s en prod, 10s en dev

    // **CONFIGURACIONES DE SEGURIDAD PARA PRODUCCIÓN**
    synchronize: true, // TEMPORAL: True para crear tablas faltantes
    dropSchema: false,  // Seguridad adicional
    migrationsRun: false, // Desactivar migraciones mientras usamos synchronize

    // **LOGGING OPTIMIZADO PARA SUPABASE**
    logging: process.env.NODE_ENV === 'production'
        ? ['error', 'warn', 'migration'] // Solo errores y migraciones en producción
        : ['query', 'error', 'warn', 'info'], // Más detalle en desarrollo

    // **CONFIGURACIONES DE CACHE PARA PERFORMANCE**
    cache: process.env.NODE_ENV === 'production' ? {
        duration: 30000, // 30 segundos de cache en producción
        type: 'database',
        options: {
            max: 100 // Máximo 100 queries en cache
        }
    } : false,

    entities: [
        User,
        Role,
        PatientProfile,
        NutritionistProfile,
        PatientNutritionistRelation,
        Food,
        MealItem,
        Meal,
        DietPlan,
        Appointment,
        NutritionistAvailability,
        PatientProgressLog,
        SubscriptionPlan,
        UserSubscription,
        PaymentTransaction,
        EducationalContent,
        Recipe,
        RecipeIngredient,
        Conversation,
        Message,
        ClinicalRecord,
        NutritionistTier,
        PatientTier,
        NutritionistReview,
        GrowthReference,
        GrowthAlert,
        WeeklyPlanTemplate,
        TemplateMeal,
        TemplateFood,
        TemplateRecipe,
    ],
    migrations: [path.join(__dirname, 'migrations', '*{.ts,.js}')],
    subscribers: [],
});