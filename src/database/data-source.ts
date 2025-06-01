import 'reflect-metadata';
import { DataSource } from 'typeorm';
import dotenv from 'dotenv';
import { User } from '@/database/entities/user.entity'; // Ruta corregida
import { Role } from '@/database/entities/role.entity'; // Ruta corregida
import { PatientProfile } from '@/database/entities/patient_profile.entity'; // Ruta corregida
import { NutritionistProfile } from '@/database/entities/nutritionist_profile.entity'; // Ruta corregida
import { PatientNutritionistRelation } from '@/database/entities/patient_nutritionist_relation.entity'; // Ruta corregida

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
    entities: [User, Role, PatientProfile, NutritionistProfile, PatientNutritionistRelation],
    migrations: ['src/database/migrations/**/*.ts'],
    subscribers: [],
});