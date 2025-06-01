import 'reflect-metadata';
import { DataSource } from 'typeorm';
import dotenv from 'dotenv';
import { User } from '@/database/entities/user.entity';
import { Role } from '@/database/entities/role.entity';
import { PatientProfile } from '@/database/entities/patient_profile.entity';
import { NutritionistProfile } from '@/database/entities/nutritionist_profile.entity';
import { PatientNutritionistRelation } from '@/database/entities/patient_nutritionist_relation.entity';
import { Food } from '@/database/entities/food.entity'; // NUEVA ENTIDAD
import { MealItem } from '@/database/entities/meal_item.entity'; // NUEVA ENTIDAD
import { Meal } from '@/database/entities/meal.entity'; // NUEVA ENTIDAD
import { DietPlan } from '@/database/entities/diet_plan.entity'; // NUEVA ENTIDAD

dotenv.config();

export const AppDataSource = new DataSource({
    type: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    synchronize: process.env.NODE_ENV === 'development',
    logging: process.env.NODE_ENV === 'development',
    entities: [
        User,
        Role,
        PatientProfile,
        NutritionistProfile,
        PatientNutritionistRelation,
        Food, // Añadidas
        MealItem, // Añadidas
        Meal, // Añadidas
        DietPlan, // Añadidas
    ],
    migrations: ['src/database/migrations/**/*.ts'],
    subscribers: [],
});