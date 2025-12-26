-- ESCUDO DE SEGURIDAD PARA LA BASE DE DATOS
-- Ejecutar en SQL Editor de Supabase

-- 1. Extensiones necesarias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Reparar tabla 'roles' (Saltado para evitar conflictos de Enum)
-- La tabla roles parece estar bien configurada como Enum en Supabase.
-- Continuamos con las tablas faltantes críticas...

-- 3. Crear tabla 'nutritionist_availabilities' (Si no existe)
CREATE TABLE IF NOT EXISTS "nutritionist_availabilities" (
    "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
    "day_of_week" character varying NOT NULL,
    "start_time_minutes" integer NOT NULL,
    "end_time_minutes" integer NOT NULL,
    "is_active" boolean NOT NULL DEFAULT true,
    "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    "nutritionist_user_id" uuid NOT NULL,
    CONSTRAINT "PK_nutritionist_availabilities_id" PRIMARY KEY ("id")
);

-- Agregar Foreign Key a Users (si no existe)
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'FK_nutritionist_availabilities_user') THEN
        ALTER TABLE "nutritionist_availabilities" 
        ADD CONSTRAINT "FK_nutritionist_availabilities_user" 
        FOREIGN KEY ("nutritionist_user_id") 
        REFERENCES "users"("id") 
        ON DELETE CASCADE 
        ON UPDATE NO ACTION;
    END IF;
END $$;

-- Agregar Restricción Única (si no existe)
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'UQ_nutritionist_availability_slot') THEN
        ALTER TABLE "nutritionist_availabilities" 
        ADD CONSTRAINT "UQ_nutritionist_availability_slot" 
        UNIQUE ("nutritionist_user_id", "day_of_week", "start_time_minutes", "end_time_minutes");
    END IF;
END $$;

-- 4. Actualizar 'nutritionist_profiles' con TODAS las columnas nuevas
-- Si la tabla no existe, la crea:
CREATE TABLE IF NOT EXISTS "nutritionist_profiles" (
    "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
    "unique_user_id" uuid, 
    "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    CONSTRAINT "PK_nutritionist_profiles_id" PRIMARY KEY ("id")
);
-- Nota: 'unique_user_id' es un placeholder, la relación real es user_id.

-- Agregar columnas faltantes (Idempotente)
ALTER TABLE "nutritionist_profiles" ADD COLUMN IF NOT EXISTS "license_issuing_authority" varchar(255);
ALTER TABLE "nutritionist_profiles" ADD COLUMN IF NOT EXISTS "professional_id" varchar(20);
ALTER TABLE "nutritionist_profiles" ADD COLUMN IF NOT EXISTS "professional_id_issuer" varchar(255);
ALTER TABLE "nutritionist_profiles" ADD COLUMN IF NOT EXISTS "university" varchar(100);
ALTER TABLE "nutritionist_profiles" ADD COLUMN IF NOT EXISTS "degree_title" varchar(100);
ALTER TABLE "nutritionist_profiles" ADD COLUMN IF NOT EXISTS "graduation_date" date;
ALTER TABLE "nutritionist_profiles" ADD COLUMN IF NOT EXISTS "verification_status" varchar(20) DEFAULT 'pending';
ALTER TABLE "nutritionist_profiles" ADD COLUMN IF NOT EXISTS "verification_notes" text;
ALTER TABLE "nutritionist_profiles" ADD COLUMN IF NOT EXISTS "verified_by_admin_id" uuid;
ALTER TABLE "nutritionist_profiles" ADD COLUMN IF NOT EXISTS "verified_at" timestamptz;
ALTER TABLE "nutritionist_profiles" ADD COLUMN IF NOT EXISTS "uploaded_documents" jsonb;
ALTER TABLE "nutritionist_profiles" ADD COLUMN IF NOT EXISTS "rfc" varchar(15);
ALTER TABLE "nutritionist_profiles" ADD COLUMN IF NOT EXISTS "curp" varchar(18);
ALTER TABLE "nutritionist_profiles" ADD COLUMN IF NOT EXISTS "specialties" text[];
ALTER TABLE "nutritionist_profiles" ADD COLUMN IF NOT EXISTS "years_of_experience" integer;
ALTER TABLE "nutritionist_profiles" ADD COLUMN IF NOT EXISTS "education" text[];
ALTER TABLE "nutritionist_profiles" ADD COLUMN IF NOT EXISTS "certifications" text[];
ALTER TABLE "nutritionist_profiles" ADD COLUMN IF NOT EXISTS "areas_of_interest" text[];
ALTER TABLE "nutritionist_profiles" ADD COLUMN IF NOT EXISTS "treatment_approach" text;
ALTER TABLE "nutritionist_profiles" ADD COLUMN IF NOT EXISTS "languages" text[];
ALTER TABLE "nutritionist_profiles" ADD COLUMN IF NOT EXISTS "consultation_fee" decimal(10,2);
ALTER TABLE "nutritionist_profiles" ADD COLUMN IF NOT EXISTS "professional_summary" text;
ALTER TABLE "nutritionist_profiles" ADD COLUMN IF NOT EXISTS "offers_in_person" boolean DEFAULT true;
ALTER TABLE "nutritionist_profiles" ADD COLUMN IF NOT EXISTS "offers_online" boolean DEFAULT true;
ALTER TABLE "nutritionist_profiles" ADD COLUMN IF NOT EXISTS "clinic_name" varchar(255);
ALTER TABLE "nutritionist_profiles" ADD COLUMN IF NOT EXISTS "clinic_address" text;
ALTER TABLE "nutritionist_profiles" ADD COLUMN IF NOT EXISTS "clinic_city" varchar(100);
ALTER TABLE "nutritionist_profiles" ADD COLUMN IF NOT EXISTS "clinic_state" varchar(100);
ALTER TABLE "nutritionist_profiles" ADD COLUMN IF NOT EXISTS "clinic_zip_code" varchar(10);
ALTER TABLE "nutritionist_profiles" ADD COLUMN IF NOT EXISTS "clinic_country" varchar(100);
ALTER TABLE "nutritionist_profiles" ADD COLUMN IF NOT EXISTS "latitude" decimal(10,8);
ALTER TABLE "nutritionist_profiles" ADD COLUMN IF NOT EXISTS "longitude" decimal(11,8);
ALTER TABLE "nutritionist_profiles" ADD COLUMN IF NOT EXISTS "clinic_notes" text;
ALTER TABLE "nutritionist_profiles" ADD COLUMN IF NOT EXISTS "clinic_phone" varchar(20);
ALTER TABLE "nutritionist_profiles" ADD COLUMN IF NOT EXISTS "is_available" boolean DEFAULT true;
ALTER TABLE "nutritionist_profiles" ADD COLUMN IF NOT EXISTS "social_media" jsonb;
ALTER TABLE "nutritionist_profiles" ADD COLUMN IF NOT EXISTS "average_rating" decimal(3,2) DEFAULT 0;
ALTER TABLE "nutritionist_profiles" ADD COLUMN IF NOT EXISTS "total_reviews" integer DEFAULT 0 NOT NULL;
ALTER TABLE "nutritionist_profiles" ADD COLUMN IF NOT EXISTS "verified_reviews" integer DEFAULT 0 NOT NULL;

-- 5. Crear tabla 'clinical_records' (si falta)
CREATE TABLE IF NOT EXISTS "clinical_records" (
    "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
    "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    "patient_id" uuid,
    "nutritionist_id" uuid,
    "diagnosis" text,
    "notes" text,
    CONSTRAINT "PK_clinical_records_id" PRIMARY KEY ("id")
);
-- (Se añade básico para evitar crash si se consulta)
