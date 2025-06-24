// src/database/data-source.ts
import 'reflect-metadata';
import { DataSource } from 'typeorm';
import dotenv from 'dotenv';
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

dotenv.config();

export const AppDataSource = new DataSource({
    type: 'postgres',
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
    synchronize: process.env.DB_DATABASE === 'nutri_test' && process.env.NODE_ENV !== 'test' || process.env.NODE_ENV === 'development',
    logging: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    
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
    ],
    migrations: ['src/database/migrations/**/*.ts'],
    subscribers: [],
});