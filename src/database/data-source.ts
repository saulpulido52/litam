// src/database/data-source.ts
import 'reflect-metadata';
import { DataSource } from 'typeorm';
import dotenv from 'dotenv';
<<<<<<< HEAD
import { User } from '../database/entities/user.entity';
import { Role } from '../database/entities/role.entity';
import { PatientProfile } from '../database/entities/patient_profile.entity';
import { NutritionistProfile } from '../database/entities/nutritionist_profile.entity';
import { PatientNutritionistRelation } from '../database/entities/patient_nutritionist_relation.entity';
import { Food } from '../database/entities/food.entity';
import { MealItem } from '../database/entities/meal_item.entity';
import { Meal } from '../database/entities/meal.entity';
import { DietPlan } from '../database/entities/diet_plan.entity';
import { Appointment } from '../database/entities/appointment.entity';
import { NutritionistAvailability } from '../database/entities/nutritionist_availability.entity';
import { PatientProgressLog } from '../database/entities/patient_progress_log.entity';
import { SubscriptionPlan } from '../database/entities/subscription_plan.entity';
import { UserSubscription } from '../database/entities/user_subscription.entity';
import { PaymentTransaction } from '../database/entities/payment_transaction.entity';
import { EducationalContent } from '../database/entities/educational_content.entity';
import { Recipe, RecipeIngredient } from '../database/entities/recipe.entity';
import { Conversation } from '../database/entities/conversation.entity';
import { Message } from '../database/entities/message.entity';
import { ClinicalRecord } from '../database/entities/clinical_record.entity';
=======
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
>>>>>>> nutri/main

dotenv.config();

export const AppDataSource = new DataSource({
    type: 'postgres',
<<<<<<< HEAD
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    
    // Configuración optimizada para múltiples usuarios
    extra: {
        // Pool de conexiones - configuración para manejar múltiples usuarios concurrentes
        max: 20,           // Máximo 20 conexiones simultáneas
        min: 5,            // Mínimo 5 conexiones mantenidas
        acquireTimeoutMillis: 60000,    // 60 segundos timeout para obtener conexión
        idleTimeoutMillis: 30000,       // 30 segundos antes de cerrar conexión inactiva
        connectionTimeoutMillis: 10000,  // 10 segundos timeout para conectar
        
        // Configuraciones adicionales de PostgreSQL
        statement_timeout: 30000,        // 30 segundos timeout para queries
        idle_in_transaction_session_timeout: 60000, // 60 segundos timeout para transacciones inactivas
        
        // Configuración SSL para producción (opcional)
        ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
    },
    
    // Pool de conexiones a nivel de TypeORM
    maxQueryExecutionTime: 10000,  // Log queries que tomen más de 10 segundos
    
    // Solo sincronizar si es la base de datos de pruebas Y no estamos en modo test
    synchronize: false, // DESHABILITADO TEMPORALMENTE PARA DIAGNÓSTICO
    logging: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
=======
    
    // **CONFIGURACIÓN OPTIMIZADA PARA SUPABASE**
    ...(process.env.NODE_ENV === 'production' ? {
        // Configuración para Supabase (usando connection string)
        url: process.env.DATABASE_URL,
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
                secureOptions: 'SSL_OP_NO_SSLv2 | SSL_OP_NO_SSLv3',
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
    synchronize: false, // NUNCA en producción
    dropSchema: false,  // Seguridad adicional
    migrationsRun: process.env.NODE_ENV === 'production', // Auto-run migrations en prod
    
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
>>>>>>> nutri/main
    
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
<<<<<<< HEAD
=======
        NutritionistTier,
        PatientTier,
        NutritionistReview,
        GrowthReference,
        GrowthAlert,
        WeeklyPlanTemplate,
        TemplateMeal,
        TemplateFood,
        TemplateRecipe,
>>>>>>> nutri/main
    ],
    migrations: ['src/database/migrations/**/*.ts'],
    subscribers: [],
});