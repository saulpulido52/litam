--
-- PostgreSQL database dump
--

-- Dumped from database version 17.5
-- Dumped by pg_dump version 17.5

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

ALTER TABLE IF EXISTS ONLY public.weekly_plan_templates DROP CONSTRAINT IF EXISTS weekly_plan_templates_created_by_nutritionist_id_fkey;
ALTER TABLE IF EXISTS ONLY public.template_recipes DROP CONSTRAINT IF EXISTS template_recipes_recipe_id_fkey;
ALTER TABLE IF EXISTS ONLY public.template_recipes DROP CONSTRAINT IF EXISTS template_recipes_meal_id_fkey;
ALTER TABLE IF EXISTS ONLY public.template_meals DROP CONSTRAINT IF EXISTS template_meals_template_id_fkey;
ALTER TABLE IF EXISTS ONLY public.template_foods DROP CONSTRAINT IF EXISTS template_foods_meal_id_fkey;
ALTER TABLE IF EXISTS ONLY public.template_foods DROP CONSTRAINT IF EXISTS template_foods_food_id_fkey;
ALTER TABLE IF EXISTS ONLY public.recipes DROP CONSTRAINT IF EXISTS "FK_ffe73c4a762b6ea55540de6073a";
ALTER TABLE IF EXISTS ONLY public.diet_plans DROP CONSTRAINT IF EXISTS "FK_fa3657f7281f01d5bd578839efd";
ALTER TABLE IF EXISTS ONLY public.recipe_ingredients DROP CONSTRAINT IF EXISTS "FK_f240137e0e13bed80bdf64fed53";
ALTER TABLE IF EXISTS ONLY public.clinical_records DROP CONSTRAINT IF EXISTS "FK_ef306ff4312a0ea9b1dacfacb6c";
ALTER TABLE IF EXISTS ONLY public.recipes DROP CONSTRAINT IF EXISTS "FK_eca8a05e00f1567b91f52ad18a3";
ALTER TABLE IF EXISTS ONLY public.patient_profiles DROP CONSTRAINT IF EXISTS "FK_e296010b9088277148d109ba75a";
ALTER TABLE IF EXISTS ONLY public.educational_content DROP CONSTRAINT IF EXISTS "FK_bab50cc53915a5b438f8dfbef91";
ALTER TABLE IF EXISTS ONLY public.nutritionist_profiles DROP CONSTRAINT IF EXISTS "FK_b8752bab86e4aa8803feeb67b43";
ALTER TABLE IF EXISTS ONLY public.user_subscriptions DROP CONSTRAINT IF EXISTS "FK_b6e02561ba40a3798a7e1432f2e";
ALTER TABLE IF EXISTS ONLY public.messages DROP CONSTRAINT IF EXISTS "FK_b183972e0b84c9022884433195e";
ALTER TABLE IF EXISTS ONLY public.users DROP CONSTRAINT IF EXISTS "FK_a2cecd1a3531c0b041e29ba46e1";
ALTER TABLE IF EXISTS ONLY public.recipe_ingredients DROP CONSTRAINT IF EXISTS "FK_9f441dc9f69622084db183ccd2e";
ALTER TABLE IF EXISTS ONLY public.diet_plans DROP CONSTRAINT IF EXISTS "FK_9ca1e0d765a296f5c130b770776";
ALTER TABLE IF EXISTS ONLY public.meal_items DROP CONSTRAINT IF EXISTS "FK_9b47372fc798d7e31000902dc09";
ALTER TABLE IF EXISTS ONLY public.meals DROP CONSTRAINT IF EXISTS "FK_99b7443f60922ce8744d88af2b0";
ALTER TABLE IF EXISTS ONLY public.payment_transactions DROP CONSTRAINT IF EXISTS "FK_95c9cc2e6f7487c9344aba10f3c";
ALTER TABLE IF EXISTS ONLY public.educational_content DROP CONSTRAINT IF EXISTS "FK_9572234f0e221870236aef8a2a1";
ALTER TABLE IF EXISTS ONLY public.nutritionist_availabilities DROP CONSTRAINT IF EXISTS "FK_8fcc49625e881f090e7b1b54737";
ALTER TABLE IF EXISTS ONLY public.appointments DROP CONSTRAINT IF EXISTS "FK_8cd86f8376020c81f7b3a65f48d";
ALTER TABLE IF EXISTS ONLY public.patient_nutritionist_relations DROP CONSTRAINT IF EXISTS "FK_8bab104d9d7b4c5dcdd318f4fdb";
ALTER TABLE IF EXISTS ONLY public.payment_transactions DROP CONSTRAINT IF EXISTS "FK_77fab0556decc83a81a5bf8c25d";
ALTER TABLE IF EXISTS ONLY public.conversations DROP CONSTRAINT IF EXISTS "FK_72da74cc4ebad45c7359156402f";
ALTER TABLE IF EXISTS ONLY public.clinical_records DROP CONSTRAINT IF EXISTS "FK_5d3ed6dfec0c9d04e1f590bf193";
ALTER TABLE IF EXISTS ONLY public.foods DROP CONSTRAINT IF EXISTS "FK_5bcb2f8a482bf328beab432f8eb";
ALTER TABLE IF EXISTS ONLY public.appointments DROP CONSTRAINT IF EXISTS "FK_4a58b3418955cdc6aa967e5f82f";
ALTER TABLE IF EXISTS ONLY public.conversations DROP CONSTRAINT IF EXISTS "FK_46dbfcab6238df06834b9edec4a";
ALTER TABLE IF EXISTS ONLY public.messages DROP CONSTRAINT IF EXISTS "FK_3bc55a7c3f9ed54b520bb5cfe23";
ALTER TABLE IF EXISTS ONLY public.patient_progress_logs DROP CONSTRAINT IF EXISTS "FK_305172e4d9fe0565f520610ed7a";
ALTER TABLE IF EXISTS ONLY public.users DROP CONSTRAINT IF EXISTS "FK_302084de91dd471653292c44e26";
ALTER TABLE IF EXISTS ONLY public.patient_nutritionist_relations DROP CONSTRAINT IF EXISTS "FK_1cab3a7599551476434e954a41e";
ALTER TABLE IF EXISTS ONLY public.meal_items DROP CONSTRAINT IF EXISTS "FK_18e0df2ed0d1d1ade493a6b6819";
ALTER TABLE IF EXISTS ONLY public.user_subscriptions DROP CONSTRAINT IF EXISTS "FK_0641da02314913e28f6131310eb";
ALTER TABLE IF EXISTS ONLY public.users DROP CONSTRAINT IF EXISTS "FK_05003db6371ffb6894d2cca4af9";
DROP INDEX IF EXISTS public.idx_weekly_plan_templates_nutritionist_category_public;
DROP INDEX IF EXISTS public.idx_patient_profiles_is_pediatric;
DROP INDEX IF EXISTS public.idx_growth_references_source_metric_gender_age;
DROP INDEX IF EXISTS public.idx_clinical_records_patient_tipo;
DROP INDEX IF EXISTS public.idx_clinical_records_expediente_base;
DROP INDEX IF EXISTS public.idx_clinical_records_date_tipo;
ALTER TABLE IF EXISTS ONLY public.weekly_plan_templates DROP CONSTRAINT IF EXISTS weekly_plan_templates_pkey;
ALTER TABLE IF EXISTS ONLY public.template_recipes DROP CONSTRAINT IF EXISTS template_recipes_pkey;
ALTER TABLE IF EXISTS ONLY public.template_meals DROP CONSTRAINT IF EXISTS template_meals_pkey;
ALTER TABLE IF EXISTS ONLY public.template_foods DROP CONSTRAINT IF EXISTS template_foods_pkey;
ALTER TABLE IF EXISTS ONLY public.growth_references DROP CONSTRAINT IF EXISTS growth_references_pkey;
ALTER TABLE IF EXISTS ONLY public.nutritionist_availabilities DROP CONSTRAINT IF EXISTS "UQ_d80681c293b0d16adfa4581894f";
ALTER TABLE IF EXISTS ONLY public.nutritionist_profiles DROP CONSTRAINT IF EXISTS "UQ_c3cf0be61f4b3f275e5fc69c429";
ALTER TABLE IF EXISTS ONLY public.users DROP CONSTRAINT IF EXISTS "UQ_97672ac88f789774dd47f7c8be3";
ALTER TABLE IF EXISTS ONLY public.conversations DROP CONSTRAINT IF EXISTS "UQ_78576ed0499ae93fb10a8f14830";
ALTER TABLE IF EXISTS ONLY public.patient_nutritionist_relations DROP CONSTRAINT IF EXISTS "UQ_77bf3ffe53b4be71055286f69c4";
ALTER TABLE IF EXISTS ONLY public.roles DROP CONSTRAINT IF EXISTS "UQ_648e3f5447f725579d7d4ffdfb7";
ALTER TABLE IF EXISTS ONLY public.users DROP CONSTRAINT IF EXISTS "UQ_0bd5012aeb82628e07f6a1be53b";
ALTER TABLE IF EXISTS ONLY public.patient_profiles DROP CONSTRAINT IF EXISTS "REL_e296010b9088277148d109ba75";
ALTER TABLE IF EXISTS ONLY public.nutritionist_profiles DROP CONSTRAINT IF EXISTS "REL_b8752bab86e4aa8803feeb67b4";
ALTER TABLE IF EXISTS ONLY public.conversations DROP CONSTRAINT IF EXISTS "PK_ee34f4f7ced4ec8681f26bf04ef";
ALTER TABLE IF EXISTS ONLY public.meals DROP CONSTRAINT IF EXISTS "PK_e6f830ac9b463433b58ad6f1a59";
ALTER TABLE IF EXISTS ONLY public.nutritionist_availabilities DROP CONSTRAINT IF EXISTS "PK_e4f7db4b91d9ba978241c36a3ee";
ALTER TABLE IF EXISTS ONLY public.payment_transactions DROP CONSTRAINT IF EXISTS "PK_d32b3c6b0d2c1d22604cbcc8c49";
ALTER TABLE IF EXISTS ONLY public.roles DROP CONSTRAINT IF EXISTS "PK_c1433d71a4838793a49dcad46ab";
ALTER TABLE IF EXISTS ONLY public.users DROP CONSTRAINT IF EXISTS "PK_a3ffb1c0c8416b9fc6f907b7433";
ALTER TABLE IF EXISTS ONLY public.user_subscriptions DROP CONSTRAINT IF EXISTS "PK_9e928b0954e51705ab44988812c";
ALTER TABLE IF EXISTS ONLY public.nutritionist_profiles DROP CONSTRAINT IF EXISTS "PK_9e1462784b64498818a4214f9c9";
ALTER TABLE IF EXISTS ONLY public.subscription_plans DROP CONSTRAINT IF EXISTS "PK_9ab8fe6918451ab3d0a4fb6bb0c";
ALTER TABLE IF EXISTS ONLY public.patient_progress_logs DROP CONSTRAINT IF EXISTS "PK_952dd6ba716cd233af4d40c8d3a";
ALTER TABLE IF EXISTS ONLY public.recipe_ingredients DROP CONSTRAINT IF EXISTS "PK_8f15a314e55970414fc92ffb532";
ALTER TABLE IF EXISTS ONLY public.recipes DROP CONSTRAINT IF EXISTS "PK_8f09680a51bf3669c1598a21682";
ALTER TABLE IF EXISTS ONLY public.migrations DROP CONSTRAINT IF EXISTS "PK_8c82d7f526340ab734260ea46be";
ALTER TABLE IF EXISTS ONLY public.clinical_records DROP CONSTRAINT IF EXISTS "PK_88bb9264ee0dcf6cea9c92d07d9";
ALTER TABLE IF EXISTS ONLY public.patient_profiles DROP CONSTRAINT IF EXISTS "PK_7297a6976f065cc75e798674aa8";
ALTER TABLE IF EXISTS ONLY public.patient_tiers DROP CONSTRAINT IF EXISTS "PK_5e7038a447840c87f09229fc486";
ALTER TABLE IF EXISTS ONLY public.diet_plans DROP CONSTRAINT IF EXISTS "PK_5575ae2747f628340b7ac33beed";
ALTER TABLE IF EXISTS ONLY public.patient_nutritionist_relations DROP CONSTRAINT IF EXISTS "PK_4c98911110e1bd4471c6a4cc32b";
ALTER TABLE IF EXISTS ONLY public.appointments DROP CONSTRAINT IF EXISTS "PK_4a437a9a27e948726b8bb3e36ad";
ALTER TABLE IF EXISTS ONLY public.educational_content DROP CONSTRAINT IF EXISTS "PK_428b812a274f59b636fb9caed75";
ALTER TABLE IF EXISTS ONLY public.nutritionist_tiers DROP CONSTRAINT IF EXISTS "PK_27500486f14de1de2ebc8011e60";
ALTER TABLE IF EXISTS ONLY public.meal_items DROP CONSTRAINT IF EXISTS "PK_1e2d1209132a6ae53837e349a60";
ALTER TABLE IF EXISTS ONLY public.messages DROP CONSTRAINT IF EXISTS "PK_18325f38ae6de43878487eff986";
ALTER TABLE IF EXISTS ONLY public.foods DROP CONSTRAINT IF EXISTS "PK_0cc83421325632f61fa27a52b59";
ALTER TABLE IF EXISTS public.roles ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.migrations ALTER COLUMN id DROP DEFAULT;
DROP TABLE IF EXISTS public.weekly_plan_templates;
DROP TABLE IF EXISTS public.users;
DROP TABLE IF EXISTS public.user_subscriptions;
DROP TABLE IF EXISTS public.template_recipes;
DROP TABLE IF EXISTS public.template_meals;
DROP TABLE IF EXISTS public.template_foods;
DROP TABLE IF EXISTS public.subscription_plans;
DROP SEQUENCE IF EXISTS public.roles_id_seq;
DROP TABLE IF EXISTS public.roles;
DROP TABLE IF EXISTS public.recipes;
DROP TABLE IF EXISTS public.recipe_ingredients;
DROP TABLE IF EXISTS public.payment_transactions;
DROP TABLE IF EXISTS public.patient_tiers;
DROP TABLE IF EXISTS public.patient_progress_logs;
DROP TABLE IF EXISTS public.patient_profiles;
DROP TABLE IF EXISTS public.patient_nutritionist_relations;
DROP TABLE IF EXISTS public.nutritionist_tiers;
DROP TABLE IF EXISTS public.nutritionist_profiles;
DROP TABLE IF EXISTS public.nutritionist_availabilities;
DROP SEQUENCE IF EXISTS public.migrations_id_seq;
DROP TABLE IF EXISTS public.migrations;
DROP TABLE IF EXISTS public.messages;
DROP TABLE IF EXISTS public.meals;
DROP TABLE IF EXISTS public.meal_items;
DROP TABLE IF EXISTS public.growth_references;
DROP TABLE IF EXISTS public.foods;
DROP TABLE IF EXISTS public.educational_content;
DROP TABLE IF EXISTS public.diet_plans;
DROP TABLE IF EXISTS public.conversations;
DROP TABLE IF EXISTS public.clinical_records;
DROP TABLE IF EXISTS public.appointments;
DROP TYPE IF EXISTS public.users_registration_type_enum;
DROP TYPE IF EXISTS public.user_subscriptions_status_enum;
DROP TYPE IF EXISTS public.subscription_plans_type_enum;
DROP TYPE IF EXISTS public.subscription_plans_status_enum;
DROP TYPE IF EXISTS public.roles_name_enum;
DROP TYPE IF EXISTS public.payment_transactions_status_enum;
DROP TYPE IF EXISTS public.patient_tiers_tier_type_enum;
DROP TYPE IF EXISTS public.patient_tiers_payment_model_enum;
DROP TYPE IF EXISTS public.patient_nutritionist_relations_status_enum;
DROP TYPE IF EXISTS public.nutritionist_tiers_tier_type_enum;
DROP TYPE IF EXISTS public.nutritionist_tiers_payment_model_enum;
DROP TYPE IF EXISTS public.nutritionist_availabilities_day_of_week_enum;
DROP TYPE IF EXISTS public.educational_content_type_enum;
DROP TYPE IF EXISTS public.diet_plans_status_enum;
DROP TYPE IF EXISTS public.appointments_status_enum;
DROP EXTENSION IF EXISTS "uuid-ossp";
--
-- Name: uuid-ossp; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA public;


--
-- Name: EXTENSION "uuid-ossp"; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION "uuid-ossp" IS 'generate universally unique identifiers (UUIDs)';


--
-- Name: appointments_status_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.appointments_status_enum AS ENUM (
    'scheduled',
    'completed',
    'cancelled_by_patient',
    'cancelled_by_nutritionist',
    'rescheduled',
    'no_show'
);


ALTER TYPE public.appointments_status_enum OWNER TO postgres;

--
-- Name: diet_plans_status_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.diet_plans_status_enum AS ENUM (
    'draft',
    'pending_review',
    'active',
    'archived'
);


ALTER TYPE public.diet_plans_status_enum OWNER TO postgres;

--
-- Name: educational_content_type_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.educational_content_type_enum AS ENUM (
    'article',
    'recipe',
    'guide',
    'video'
);


ALTER TYPE public.educational_content_type_enum OWNER TO postgres;

--
-- Name: nutritionist_availabilities_day_of_week_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.nutritionist_availabilities_day_of_week_enum AS ENUM (
    'SUNDAY',
    'MONDAY',
    'TUESDAY',
    'WEDNESDAY',
    'THURSDAY',
    'FRIDAY',
    'SATURDAY'
);


ALTER TYPE public.nutritionist_availabilities_day_of_week_enum OWNER TO postgres;

--
-- Name: nutritionist_tiers_payment_model_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.nutritionist_tiers_payment_model_enum AS ENUM (
    'commission',
    'subscription'
);


ALTER TYPE public.nutritionist_tiers_payment_model_enum OWNER TO postgres;

--
-- Name: nutritionist_tiers_tier_type_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.nutritionist_tiers_tier_type_enum AS ENUM (
    'basic',
    'premium'
);


ALTER TYPE public.nutritionist_tiers_tier_type_enum OWNER TO postgres;

--
-- Name: patient_nutritionist_relations_status_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.patient_nutritionist_relations_status_enum AS ENUM (
    'pending',
    'active',
    'inactive',
    'rejected',
    'blocked'
);


ALTER TYPE public.patient_nutritionist_relations_status_enum OWNER TO postgres;

--
-- Name: patient_tiers_payment_model_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.patient_tiers_payment_model_enum AS ENUM (
    'free',
    'one_time',
    'subscription'
);


ALTER TYPE public.patient_tiers_payment_model_enum OWNER TO postgres;

--
-- Name: patient_tiers_tier_type_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.patient_tiers_tier_type_enum AS ENUM (
    'free',
    'pro',
    'premium'
);


ALTER TYPE public.patient_tiers_tier_type_enum OWNER TO postgres;

--
-- Name: payment_transactions_status_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.payment_transactions_status_enum AS ENUM (
    'success',
    'pending',
    'failed',
    'refunded'
);


ALTER TYPE public.payment_transactions_status_enum OWNER TO postgres;

--
-- Name: roles_name_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.roles_name_enum AS ENUM (
    'patient',
    'nutritionist',
    'admin'
);


ALTER TYPE public.roles_name_enum OWNER TO postgres;

--
-- Name: subscription_plans_status_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.subscription_plans_status_enum AS ENUM (
    'active',
    'inactive',
    'suspended'
);


ALTER TYPE public.subscription_plans_status_enum OWNER TO postgres;

--
-- Name: subscription_plans_type_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.subscription_plans_type_enum AS ENUM (
    'monthly',
    'annual'
);


ALTER TYPE public.subscription_plans_type_enum OWNER TO postgres;

--
-- Name: user_subscriptions_status_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.user_subscriptions_status_enum AS ENUM (
    'active',
    'expired',
    'cancelled',
    'pending'
);


ALTER TYPE public.user_subscriptions_status_enum OWNER TO postgres;

--
-- Name: users_registration_type_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.users_registration_type_enum AS ENUM (
    'online',
    'in_person'
);


ALTER TYPE public.users_registration_type_enum OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: appointments; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.appointments (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    start_time timestamp with time zone NOT NULL,
    end_time timestamp with time zone NOT NULL,
    status public.appointments_status_enum DEFAULT 'scheduled'::public.appointments_status_enum NOT NULL,
    notes text,
    meeting_link character varying(500),
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    patient_user_id uuid NOT NULL,
    nutritionist_user_id uuid NOT NULL,
    google_calendar_event_id character varying(255),
    synced_to_google_calendar boolean DEFAULT false NOT NULL,
    last_sync_to_google timestamp with time zone
);


ALTER TABLE public.appointments OWNER TO postgres;

--
-- Name: clinical_records; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.clinical_records (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    record_date date NOT NULL,
    expedient_number character varying(50),
    consultation_reason text,
    current_problems jsonb,
    diagnosed_diseases jsonb,
    family_medical_history jsonb,
    gynecological_aspects text,
    daily_activities jsonb,
    activity_level_description character varying(50),
    physical_exercise jsonb,
    consumption_habits jsonb,
    general_appearance text,
    blood_pressure jsonb,
    biochemical_indicators jsonb,
    dietary_history jsonb,
    food_group_consumption_frequency jsonb,
    water_consumption_liters numeric(5,2),
    daily_diet_record jsonb,
    anthropometric_measurements jsonb,
    anthropometric_evaluations jsonb,
    nutritional_diagnosis text,
    energy_nutrient_needs jsonb,
    nutritional_plan_and_management text,
    macronutrient_distribution jsonb,
    dietary_calculation_scheme text,
    menu_details jsonb,
    evolution_and_follow_up_notes text,
    graph_url character varying(255),
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    patient_user_id uuid NOT NULL,
    nutritionist_user_id uuid NOT NULL,
    laboratory_documents jsonb,
    document_metadata jsonb,
    drug_nutrient_interactions jsonb,
    tipo_expediente character varying(50) DEFAULT 'inicial'::character varying NOT NULL,
    expediente_base_id uuid,
    seguimiento_metadata jsonb,
    analisis_riesgo_beneficio jsonb,
    juicio_clinico jsonb,
    capacidad_paciente jsonb
);


ALTER TABLE public.clinical_records OWNER TO postgres;

--
-- Name: conversations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.conversations (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    last_message_at timestamp with time zone DEFAULT now() NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    participant1_user_id uuid NOT NULL,
    participant2_user_id uuid NOT NULL
);


ALTER TABLE public.conversations OWNER TO postgres;

--
-- Name: diet_plans; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.diet_plans (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    name character varying(255) NOT NULL,
    generated_by_ia boolean DEFAULT false NOT NULL,
    ia_version character varying(50),
    status public.diet_plans_status_enum DEFAULT 'draft'::public.diet_plans_status_enum NOT NULL,
    notes text,
    start_date date NOT NULL,
    end_date date NOT NULL,
    daily_calories_target numeric(10,2),
    daily_macros_target jsonb,
    is_weekly_plan boolean DEFAULT true NOT NULL,
    total_weeks integer DEFAULT 1 NOT NULL,
    weekly_plans jsonb,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    patient_user_id uuid NOT NULL,
    nutritionist_user_id uuid NOT NULL,
    description text,
    pathological_restrictions jsonb,
    meal_frequency jsonb,
    meal_timing jsonb,
    nutritional_goals jsonb,
    flexibility_settings jsonb,
    meal_schedules jsonb
);


ALTER TABLE public.diet_plans OWNER TO postgres;

--
-- Name: educational_content; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.educational_content (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    title character varying(255) NOT NULL,
    summary text,
    content_body text NOT NULL,
    type public.educational_content_type_enum DEFAULT 'article'::public.educational_content_type_enum NOT NULL,
    tags text[],
    cover_image_url character varying(255),
    is_published boolean DEFAULT true NOT NULL,
    published_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    created_by_user_id uuid NOT NULL,
    last_modified_by_user_id uuid
);


ALTER TABLE public.educational_content OWNER TO postgres;

--
-- Name: foods; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.foods (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    name character varying(255) NOT NULL,
    description text,
    calories numeric(10,2) NOT NULL,
    protein numeric(10,2) NOT NULL,
    carbohydrates numeric(10,2) NOT NULL,
    fats numeric(10,2) NOT NULL,
    fiber numeric(10,2) DEFAULT '0'::numeric,
    sugar numeric(10,2) DEFAULT '0'::numeric,
    unit character varying(50) NOT NULL,
    serving_size numeric(10,2) NOT NULL,
    category character varying(100),
    is_custom boolean DEFAULT false NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    created_by_user_id uuid
);


ALTER TABLE public.foods OWNER TO postgres;

--
-- Name: growth_references; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.growth_references (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    source character varying(10) NOT NULL,
    metric_type character varying(20) NOT NULL,
    gender character varying(10) NOT NULL,
    age_months integer NOT NULL,
    p3 numeric(8,4),
    p5 numeric(8,4),
    p10 numeric(8,4),
    p15 numeric(8,4),
    p25 numeric(8,4),
    p50 numeric(8,4),
    p75 numeric(8,4),
    p85 numeric(8,4),
    p90 numeric(8,4),
    p95 numeric(8,4),
    p97 numeric(8,4),
    l_lambda numeric(10,6),
    m_mu numeric(10,6),
    s_sigma numeric(10,6),
    notes text,
    version character varying(50),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.growth_references OWNER TO postgres;

--
-- Name: meal_items; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.meal_items (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    quantity numeric(10,2) NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    food_id uuid NOT NULL,
    meal_id uuid NOT NULL
);


ALTER TABLE public.meal_items OWNER TO postgres;

--
-- Name: meals; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.meals (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    name character varying(100) NOT NULL,
    "order" integer DEFAULT 0 NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    diet_plan_id uuid NOT NULL,
    day character varying(50),
    meal_type character varying(50),
    meal_time time without time zone,
    notes text
);


ALTER TABLE public.meals OWNER TO postgres;

--
-- Name: messages; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.messages (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    content text NOT NULL,
    is_read boolean DEFAULT false NOT NULL,
    "timestamp" timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    conversation_id uuid NOT NULL,
    sender_user_id uuid NOT NULL
);


ALTER TABLE public.messages OWNER TO postgres;

--
-- Name: migrations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.migrations (
    id integer NOT NULL,
    "timestamp" bigint NOT NULL,
    name character varying NOT NULL
);


ALTER TABLE public.migrations OWNER TO postgres;

--
-- Name: migrations_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.migrations_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.migrations_id_seq OWNER TO postgres;

--
-- Name: migrations_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.migrations_id_seq OWNED BY public.migrations.id;


--
-- Name: nutritionist_availabilities; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.nutritionist_availabilities (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    day_of_week public.nutritionist_availabilities_day_of_week_enum NOT NULL,
    start_time_minutes integer NOT NULL,
    end_time_minutes integer NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    nutritionist_user_id uuid NOT NULL
);


ALTER TABLE public.nutritionist_availabilities OWNER TO postgres;

--
-- Name: nutritionist_profiles; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.nutritionist_profiles (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    license_number character varying(100),
    license_issuing_authority character varying(255),
    specialties text[],
    years_of_experience integer,
    education text[],
    certifications text[],
    areas_of_interest text[],
    treatment_approach text,
    languages text[],
    consultation_fee numeric(10,2),
    bio text,
    office_hours jsonb,
    is_verified boolean DEFAULT false NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    user_id uuid,
    professional_summary text,
    offers_in_person boolean DEFAULT true NOT NULL,
    offers_online boolean DEFAULT true NOT NULL,
    clinic_name character varying(255),
    clinic_address text,
    clinic_city character varying(100),
    clinic_state character varying(100),
    clinic_zip_code character varying(10),
    clinic_country character varying(100),
    latitude numeric(10,8),
    longitude numeric(11,8),
    clinic_notes text,
    clinic_phone character varying(20),
    is_available boolean DEFAULT true NOT NULL
);


ALTER TABLE public.nutritionist_profiles OWNER TO postgres;

--
-- Name: nutritionist_tiers; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.nutritionist_tiers (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    name character varying(100) NOT NULL,
    description text,
    tier_type public.nutritionist_tiers_tier_type_enum NOT NULL,
    payment_model public.nutritionist_tiers_payment_model_enum NOT NULL,
    commission_rate numeric(5,2),
    subscription_price numeric(10,2),
    annual_price numeric(10,2),
    max_active_patients integer DEFAULT 1 NOT NULL,
    includes_ai_meal_planning boolean DEFAULT false NOT NULL,
    includes_advanced_management boolean DEFAULT false NOT NULL,
    includes_priority_support boolean DEFAULT false NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.nutritionist_tiers OWNER TO postgres;

--
-- Name: patient_nutritionist_relations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.patient_nutritionist_relations (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    status public.patient_nutritionist_relations_status_enum DEFAULT 'pending'::public.patient_nutritionist_relations_status_enum NOT NULL,
    notes text,
    requested_at timestamp with time zone DEFAULT now() NOT NULL,
    accepted_at timestamp with time zone,
    ended_at timestamp with time zone,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    patient_user_id uuid NOT NULL,
    nutritionist_user_id uuid NOT NULL,
    elimination_reason text
);


ALTER TABLE public.patient_nutritionist_relations OWNER TO postgres;

--
-- Name: patient_profiles; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.patient_profiles (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    current_weight numeric(5,2),
    height numeric(5,2),
    activity_level character varying(50),
    consultation_reason text,
    medical_conditions text[],
    allergies text[],
    medications text[],
    diagnosed_diseases text,
    diagnosed_since character varying(100),
    important_diseases_history text,
    current_treatments text,
    surgeries_history text,
    current_symptoms jsonb,
    family_history jsonb,
    does_exercise boolean,
    exercise_type character varying(100),
    exercise_frequency character varying(50),
    exercise_duration character varying(50),
    exercise_since character varying(50),
    alcohol_consumption character varying(100),
    tobacco_consumption character varying(100),
    coffee_consumption character varying(100),
    general_appearance text,
    knows_blood_pressure boolean,
    usual_blood_pressure character varying(20),
    biochemical_indicators jsonb,
    previous_nutritional_guidance boolean,
    previous_guidance_when character varying(100),
    guidance_adherence_level character varying(50),
    guidance_adherence_reason text,
    who_prepares_food character varying(100),
    eats_home_or_out character varying(50),
    diet_modified_last_6_months boolean,
    diet_modification_reason text,
    hungriest_time character varying(50),
    preferred_foods text[],
    disliked_foods text[],
    food_intolerances text[],
    takes_supplements boolean,
    supplements_details text,
    daily_water_glasses integer,
    daily_schedule jsonb,
    food_frequency jsonb,
    goals text[],
    intolerances text[],
    clinical_notes text,
    pregnancy_status character varying(50),
    dietary_preferences text[],
    food_preferences text[],
    monthly_budget numeric(10,2),
    meal_schedule text,
    preferences jsonb,
    weight_history jsonb[],
    measurements jsonb[],
    photos jsonb[],
    clinical_studies_docs jsonb[],
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    user_id uuid,
    is_pediatric_patient boolean DEFAULT false,
    caregiver_info jsonb,
    birth_history jsonb,
    feeding_history jsonb,
    developmental_milestones jsonb,
    pediatric_growth_history jsonb,
    school_social_info jsonb,
    vaccination_status jsonb,
    pediatric_habits jsonb,
    pediatric_measurements jsonb,
    pediatric_medical_history jsonb,
    pediatric_nutrition_assessment jsonb
);


ALTER TABLE public.patient_profiles OWNER TO postgres;

--
-- Name: patient_progress_logs; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.patient_progress_logs (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    date date NOT NULL,
    weight numeric(5,2),
    body_fat_percentage numeric(5,2),
    muscle_mass_percentage numeric(5,2),
    measurements jsonb,
    notes text,
    photos jsonb[],
    adherence_to_plan numeric(5,2),
    feeling_level integer,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    patient_user_id uuid NOT NULL
);


ALTER TABLE public.patient_progress_logs OWNER TO postgres;

--
-- Name: patient_tiers; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.patient_tiers (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    name character varying(100) NOT NULL,
    description text,
    tier_type public.patient_tiers_tier_type_enum NOT NULL,
    payment_model public.patient_tiers_payment_model_enum NOT NULL,
    one_time_price numeric(10,2),
    monthly_price numeric(10,2),
    annual_price numeric(10,2),
    shows_ads boolean DEFAULT true NOT NULL,
    includes_ai_food_scanning boolean DEFAULT false NOT NULL,
    includes_barcode_scanning boolean DEFAULT false NOT NULL,
    includes_smart_shopping_list boolean DEFAULT false NOT NULL,
    includes_advanced_tracking boolean DEFAULT false NOT NULL,
    includes_device_integration boolean DEFAULT false NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.patient_tiers OWNER TO postgres;

--
-- Name: payment_transactions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.payment_transactions (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    amount numeric(10,2) NOT NULL,
    currency character varying(10) NOT NULL,
    status public.payment_transactions_status_enum DEFAULT 'pending'::public.payment_transactions_status_enum NOT NULL,
    gateway_transaction_id character varying(255),
    payment_method_type character varying(50),
    gateway_response_code character varying(255),
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    user_id uuid NOT NULL,
    subscription_plan_id uuid
);


ALTER TABLE public.payment_transactions OWNER TO postgres;

--
-- Name: recipe_ingredients; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.recipe_ingredients (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    ingredient_name character varying(255) NOT NULL,
    quantity numeric(10,2) NOT NULL,
    unit character varying(50) NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    food_id uuid,
    recipe_id uuid NOT NULL
);


ALTER TABLE public.recipe_ingredients OWNER TO postgres;

--
-- Name: recipes; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.recipes (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    title character varying(255) NOT NULL,
    description text,
    instructions text NOT NULL,
    tags text[],
    image_url character varying(255),
    prep_time_minutes integer,
    cook_time_minutes integer,
    servings integer,
    total_calories numeric(10,2),
    total_macros jsonb,
    is_published boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    created_by_user_id uuid NOT NULL,
    last_modified_by_user_id uuid
);


ALTER TABLE public.recipes OWNER TO postgres;

--
-- Name: roles; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.roles (
    id integer NOT NULL,
    name public.roles_name_enum NOT NULL
);


ALTER TABLE public.roles OWNER TO postgres;

--
-- Name: roles_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.roles_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.roles_id_seq OWNER TO postgres;

--
-- Name: roles_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.roles_id_seq OWNED BY public.roles.id;


--
-- Name: subscription_plans; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.subscription_plans (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    name character varying(100) NOT NULL,
    description text,
    type public.subscription_plans_type_enum NOT NULL,
    price numeric(10,2) NOT NULL,
    duration_days integer NOT NULL,
    max_consultations integer,
    includes_nutrition_plan boolean DEFAULT true NOT NULL,
    includes_progress_tracking boolean DEFAULT false NOT NULL,
    includes_messaging boolean DEFAULT false NOT NULL,
    status public.subscription_plans_status_enum DEFAULT 'active'::public.subscription_plans_status_enum NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.subscription_plans OWNER TO postgres;

--
-- Name: template_foods; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.template_foods (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    meal_id uuid,
    food_id uuid,
    name character varying(255),
    quantity numeric(8,2) DEFAULT 1,
    unit character varying(50),
    caloriesperserving numeric(8,2),
    proteinperserving numeric(8,2),
    carbohydratesperserving numeric(8,2),
    fatsperserving numeric(8,2),
    fiberperserving numeric(8,2),
    notes text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.template_foods OWNER TO postgres;

--
-- Name: template_meals; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.template_meals (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    template_id uuid,
    dayofweek character varying(20) NOT NULL,
    mealtype character varying(20) NOT NULL,
    name character varying(255),
    description text,
    suggestedtime time without time zone,
    totalcalories numeric(8,2) DEFAULT 0,
    totalprotein numeric(8,2) DEFAULT 0,
    totalcarbohydrates numeric(8,2) DEFAULT 0,
    totalfats numeric(8,2) DEFAULT 0,
    totalfiber numeric(8,2) DEFAULT 0,
    preptimeminutes integer,
    difficulty character varying(20) DEFAULT 'medium'::character varying,
    notes text,
    meal_order integer DEFAULT 1,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.template_meals OWNER TO postgres;

--
-- Name: template_recipes; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.template_recipes (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    meal_id uuid,
    recipe_id uuid,
    name character varying(255),
    servings numeric(8,2) DEFAULT 1,
    caloriesperserving numeric(8,2),
    proteinperserving numeric(8,2),
    carbohydratesperserving numeric(8,2),
    fatsperserving numeric(8,2),
    fiberperserving numeric(8,2),
    notes text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.template_recipes OWNER TO postgres;

--
-- Name: user_subscriptions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.user_subscriptions (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    status public.user_subscriptions_status_enum DEFAULT 'pending'::public.user_subscriptions_status_enum NOT NULL,
    start_date timestamp with time zone NOT NULL,
    end_date timestamp with time zone NOT NULL,
    amount_paid numeric(10,2) NOT NULL,
    currency character varying(10) DEFAULT 'MXN'::character varying NOT NULL,
    payment_method character varying(200),
    payment_reference character varying(100),
    consultations_used integer DEFAULT 0 NOT NULL,
    auto_renew boolean DEFAULT false NOT NULL,
    cancelled_at timestamp with time zone,
    cancellation_reason text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    user_id uuid NOT NULL,
    subscription_plan_id uuid NOT NULL
);


ALTER TABLE public.user_subscriptions OWNER TO postgres;

--
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    email character varying(255) NOT NULL,
    password_hash character varying(255) NOT NULL,
    first_name character varying(100),
    last_name character varying(100),
    phone character varying(20),
    birth_date date,
    age integer,
    gender character varying(50),
    is_active boolean DEFAULT true NOT NULL,
    registration_type public.users_registration_type_enum DEFAULT 'online'::public.users_registration_type_enum NOT NULL,
    has_temporary_password boolean DEFAULT false NOT NULL,
    temporary_password_expires_at timestamp with time zone,
    requires_initial_setup boolean DEFAULT false NOT NULL,
    created_by_nutritionist_id uuid,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    "passwordChangedAt" timestamp with time zone,
    role_id integer NOT NULL,
    profile_image character varying(500),
    google_id character varying(255),
    google_email character varying(255),
    google_access_token text,
    google_refresh_token text,
    google_token_expires_at timestamp with time zone,
    google_calendar_id character varying(255),
    google_calendar_sync_enabled boolean DEFAULT false NOT NULL,
    google_calendar_last_sync timestamp with time zone,
    auth_provider character varying(50) DEFAULT 'local'::character varying NOT NULL,
    nutritionist_tier_id uuid,
    patient_tier_id uuid
);


ALTER TABLE public.users OWNER TO postgres;

--
-- Name: weekly_plan_templates; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.weekly_plan_templates (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name character varying(255) NOT NULL,
    description text,
    category character varying(50) DEFAULT 'custom'::character varying,
    tags character varying(100)[] DEFAULT '{}'::character varying[],
    created_by_nutritionist_id uuid,
    ispublic boolean DEFAULT false,
    targetcalories numeric(8,2),
    targetmacros jsonb,
    usagecount integer DEFAULT 0,
    rating numeric(3,2) DEFAULT 0,
    ratingcount integer DEFAULT 0,
    notes text,
    mealtiming jsonb,
    dietaryrestrictions jsonb,
    difficultylevel character varying(20) DEFAULT 'medium'::character varying,
    avgpreptimeminutes integer,
    estimatedweeklycost numeric(8,2),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.weekly_plan_templates OWNER TO postgres;

--
-- Name: migrations id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.migrations ALTER COLUMN id SET DEFAULT nextval('public.migrations_id_seq'::regclass);


--
-- Name: roles id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.roles ALTER COLUMN id SET DEFAULT nextval('public.roles_id_seq'::regclass);


--
-- Data for Name: appointments; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.appointments (id, start_time, end_time, status, notes, meeting_link, created_at, updated_at, patient_user_id, nutritionist_user_id, google_calendar_event_id, synced_to_google_calendar, last_sync_to_google) VALUES ('ffdcdc1e-c020-4a7a-826c-7b95735e458a', '2025-07-30 09:00:00-07', '2025-07-30 09:30:00-07', 'no_show', 'traer peso actualizado', 'https://meet.google.com/generated-link', '2025-07-09 07:32:25.325085-07', '2025-07-09 07:32:48.388515-07', '3209877c-350e-4a2d-a620-dffd4675aaef', '741a971b-b0de-4ead-a030-0f5b906adac3', NULL, false, NULL);
INSERT INTO public.appointments (id, start_time, end_time, status, notes, meeting_link, created_at, updated_at, patient_user_id, nutritionist_user_id, google_calendar_event_id, synced_to_google_calendar, last_sync_to_google) VALUES ('3207cede-b234-43ca-9b97-a2f07799544a', '2025-08-05 15:42:00-07', '2025-08-05 16:12:00-07', 'scheduled', NULL, NULL, '2025-08-05 00:42:18.291036-07', '2025-08-05 00:42:18.291036-07', '3209877c-350e-4a2d-a620-dffd4675aaef', '741a971b-b0de-4ead-a030-0f5b906adac3', NULL, false, NULL);
INSERT INTO public.appointments (id, start_time, end_time, status, notes, meeting_link, created_at, updated_at, patient_user_id, nutritionist_user_id, google_calendar_event_id, synced_to_google_calendar, last_sync_to_google) VALUES ('f8c1fec0-0ff6-4810-b8aa-6d45d9894526', '2025-08-06 16:30:00-07', '2025-08-06 17:00:00-07', 'scheduled', 'super gordo', NULL, '2025-08-05 09:32:55.808998-07', '2025-08-05 09:32:55.808998-07', 'c82a1e56-e7bd-44fb-87a5-5a81f4b4afd1', '741a971b-b0de-4ead-a030-0f5b906adac3', NULL, false, NULL);


--
-- Data for Name: clinical_records; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.clinical_records (id, record_date, expedient_number, consultation_reason, current_problems, diagnosed_diseases, family_medical_history, gynecological_aspects, daily_activities, activity_level_description, physical_exercise, consumption_habits, general_appearance, blood_pressure, biochemical_indicators, dietary_history, food_group_consumption_frequency, water_consumption_liters, daily_diet_record, anthropometric_measurements, anthropometric_evaluations, nutritional_diagnosis, energy_nutrient_needs, nutritional_plan_and_management, macronutrient_distribution, dietary_calculation_scheme, menu_details, evolution_and_follow_up_notes, graph_url, created_at, updated_at, patient_user_id, nutritionist_user_id, laboratory_documents, document_metadata, drug_nutrient_interactions, tipo_expediente, expediente_base_id, seguimiento_metadata, analisis_riesgo_beneficio, juicio_clinico, capacidad_paciente) VALUES ('1f1bc482-992b-47c2-83ad-a565fb764b1b', '2025-06-25', '1', '12222222
', '{"ulcer": true, "nausea": false, "colitis": false, "pyrosis": true, "diarrhea": true, "vomiting": false, "gastritis": false, "constipation": false, "observations": ",mm,", "other_problems": ",m,mm", "mouth_mechanics": ",m,m,"}', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '{"knows_bp": false}', NULL, '{"takes_supplements": false, "received_nutritional_guidance": true}', NULL, NULL, NULL, '{"height_m": 1.89, "hip_circ_cm": 90, "waist_circ_cm": 95, "current_weight_kg": 102, "habitual_weight_kg": 55}', NULL, '12121212', NULL, '3112', NULL, NULL, NULL, '212
', NULL, '2025-06-26 02:44:24.472139-07', '2025-06-26 02:44:24.472139-07', 'dc77923e-3df2-4d1d-95dc-c33efa0884a8', '79e3bb0e-eb72-4eb5-8ebf-ee4e390b4aec', NULL, NULL, NULL, 'inicial', NULL, NULL, NULL, NULL, NULL);
INSERT INTO public.clinical_records (id, record_date, expedient_number, consultation_reason, current_problems, diagnosed_diseases, family_medical_history, gynecological_aspects, daily_activities, activity_level_description, physical_exercise, consumption_habits, general_appearance, blood_pressure, biochemical_indicators, dietary_history, food_group_consumption_frequency, water_consumption_liters, daily_diet_record, anthropometric_measurements, anthropometric_evaluations, nutritional_diagnosis, energy_nutrient_needs, nutritional_plan_and_management, macronutrient_distribution, dietary_calculation_scheme, menu_details, evolution_and_follow_up_notes, graph_url, created_at, updated_at, patient_user_id, nutritionist_user_id, laboratory_documents, document_metadata, drug_nutrient_interactions, tipo_expediente, expediente_base_id, seguimiento_metadata, analisis_riesgo_beneficio, juicio_clinico, capacidad_paciente) VALUES ('416ad267-692c-40ee-8f20-fed64d44f16e', '2025-06-26', '1', 'plan nutricional tono muscular', '{"ulcer": true, "nausea": false, "colitis": false, "pyrosis": false, "diarrhea": false, "vomiting": true, "gastritis": false, "constipation": true, "observations": "observaciones", "other_problems": "problemas", "mouth_mechanics": "ninguno"}', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '{"knows_bp": true}', NULL, '{"when_received": "hace 2 meses", "disliked_foods": ["camaron pulpo"], "adherence_level": "Buena adherencia", "preferred_foods": ["manzanas peras brocoli"], "takes_supplements": false, "malestar_alergia_foods": ["lacteos"], "received_nutritional_guidance": true}', NULL, NULL, NULL, '{"height_m": 1.83, "hip_circ_cm": 95, "waist_circ_cm": 80, "current_weight_kg": 105, "habitual_weight_kg": 80}', NULL, 'este plan es el primero de muchos', NULL, 'noososo', NULL, NULL, NULL, 'primera nota', NULL, '2025-06-26 18:56:43.9251-07', '2025-06-26 18:56:43.9251-07', 'edee0e5f-8cc0-4870-bc19-b423df2e0829', '16061724-6bbd-48eb-ae2a-c23b29dcdad8', NULL, NULL, NULL, 'inicial', NULL, NULL, NULL, NULL, NULL);
INSERT INTO public.clinical_records (id, record_date, expedient_number, consultation_reason, current_problems, diagnosed_diseases, family_medical_history, gynecological_aspects, daily_activities, activity_level_description, physical_exercise, consumption_habits, general_appearance, blood_pressure, biochemical_indicators, dietary_history, food_group_consumption_frequency, water_consumption_liters, daily_diet_record, anthropometric_measurements, anthropometric_evaluations, nutritional_diagnosis, energy_nutrient_needs, nutritional_plan_and_management, macronutrient_distribution, dietary_calculation_scheme, menu_details, evolution_and_follow_up_notes, graph_url, created_at, updated_at, patient_user_id, nutritionist_user_id, laboratory_documents, document_metadata, drug_nutrient_interactions, tipo_expediente, expediente_base_id, seguimiento_metadata, analisis_riesgo_beneficio, juicio_clinico, capacidad_paciente) VALUES ('8a77f244-ba09-445b-ad16-ee39752545ea', '2025-07-02', '1', 'plan nutricional tono muscular', '{"ulcer": true, "nausea": false, "colitis": false, "pyrosis": false, "diarrhea": false, "vomiting": true, "gastritis": false, "constipation": true, "observations": "observaciones", "other_problems": "problemas", "mouth_mechanics": "ninguno"}', '{"since_when": "hace un mes", "has_disease": true, "has_surgery": false, "disease_name": "diabetes", "medications_list": ["paracetamol"], "takes_medication": true, "has_important_disease": false, "takes_special_treatment": false}', '{"hta": false, "cancer": false, "obesity": false, "diabetes": false, "dyslipidemia": false, "hypo_hyperthyroidism": false}', NULL, NULL, NULL, '{"performs_exercise": false}', '{}', NULL, '{"knows_bp": true}', NULL, '{"when_received": "hace 2 meses", "disliked_foods": ["camaron pulpo"], "adherence_level": "Buena adherencia", "preferred_foods": ["manzanas peras brocoli"], "takes_supplements": false, "malestar_alergia_foods": ["lacteos"], "received_nutritional_guidance": true}', NULL, NULL, NULL, '{"height_m": 1.83, "hip_circ_cm": 95, "waist_circ_cm": 80, "current_weight_kg": 105, "habitual_weight_kg": 80}', NULL, 'este plan es el primero de muchos', NULL, 'noososo', NULL, NULL, NULL, 'primera nota', NULL, '2025-06-26 18:56:44.138961-07', '2025-07-02 23:28:26.120111-07', 'edee0e5f-8cc0-4870-bc19-b423df2e0829', '16061724-6bbd-48eb-ae2a-c23b29dcdad8', '[{"id": "0eb0dfff-33d9-438b-a8ac-0600cb5ae696", "file_url": "/uploads/laboratory-documents/lab_8a77f244-ba09-445b-ad16-ee39752545ea_1751524106071.pdf", "filename": "lab_8a77f244-ba09-445b-ad16-ee39752545ea_1751524106071.pdf", "file_path": "C:\\Users\\saulh\\OneDrive\\Documentos\\nutri-latest\\uploads\\laboratory-documents\\lab_8a77f244-ba09-445b-ad16-ee39752545ea_1751524106071.pdf", "file_size": 41020, "description": "", "upload_date": "2025-07-03T06:28:26.114Z", "uploaded_by": "nutritionist", "original_name": "2705111_97275537_2025011.pdf"}]', '{"pdf_version": 1, "total_attachments": 1, "last_pdf_generated": "2025-07-03T06:28:10.546Z"}', NULL, 'inicial', NULL, NULL, NULL, NULL, NULL);
INSERT INTO public.clinical_records (id, record_date, expedient_number, consultation_reason, current_problems, diagnosed_diseases, family_medical_history, gynecological_aspects, daily_activities, activity_level_description, physical_exercise, consumption_habits, general_appearance, blood_pressure, biochemical_indicators, dietary_history, food_group_consumption_frequency, water_consumption_liters, daily_diet_record, anthropometric_measurements, anthropometric_evaluations, nutritional_diagnosis, energy_nutrient_needs, nutritional_plan_and_management, macronutrient_distribution, dietary_calculation_scheme, menu_details, evolution_and_follow_up_notes, graph_url, created_at, updated_at, patient_user_id, nutritionist_user_id, laboratory_documents, document_metadata, drug_nutrient_interactions, tipo_expediente, expediente_base_id, seguimiento_metadata, analisis_riesgo_beneficio, juicio_clinico, capacidad_paciente) VALUES ('7fa9973d-6417-42e8-bbc7-edaed20ecef4', '2025-07-02', '1', 'lllkj', '{"ulcer": true, "nausea": true, "colitis": false, "pyrosis": false, "diarrhea": false, "vomiting": true, "gastritis": false, "constipation": false}', '{"since_when": "ayer", "has_disease": true, "has_surgery": false, "disease_name": "daibetes", "medications_list": ["loratadina"], "takes_medication": true, "has_important_disease": false, "takes_special_treatment": false}', '{"hta": false, "cancer": false, "obesity": false, "diabetes": false, "dyslipidemia": false, "hypo_hyperthyroidism": false}', NULL, NULL, NULL, '{"performs_exercise": false}', '{}', NULL, '{"knows_bp": true, "systolic": 150, "diastolic": 100}', NULL, '{"when_received": "1 año", "disliked_foods": ["leche", "brocoli y el curcuma"], "adherence_level": "Baja adherencia", "preferred_foods": ["tortillas", "la fruta"], "takes_supplements": true, "supplement_details": "omega 3", "malestar_alergia_foods": ["camaron"], "received_nutritional_guidance": true}', NULL, NULL, NULL, '{"height_m": 1.8, "hip_circ_cm": 200, "waist_circ_cm": 200, "current_weight_kg": 512, "habitual_weight_kg": 500}', NULL, '11111o', NULL, '2222222', NULL, NULL, NULL, NULL, NULL, '2025-06-27 09:47:25.471201-07', '2025-07-03 10:25:00.75899-07', '3209877c-350e-4a2d-a620-dffd4675aaef', '741a971b-b0de-4ead-a030-0f5b906adac3', '[{"id": "623bf923-c028-4f2b-bd3f-c706a6e0bf89", "file_url": "/uploads/laboratory-documents/lab_7fa9973d-6417-42e8-bbc7-edaed20ecef4_1751563321927.pdf", "filename": "lab_7fa9973d-6417-42e8-bbc7-edaed20ecef4_1751563321927.pdf", "lab_date": "2025-07-02T00:00:00.000Z", "file_path": "C:\\Users\\saulh\\OneDrive\\Documentos\\nutri-latest\\uploads\\laboratory-documents\\lab_7fa9973d-6417-42e8-bbc7-edaed20ecef4_1751563321927.pdf", "file_size": 41020, "description": "dislipidemia", "upload_date": "2025-07-03T17:22:01.959Z", "uploaded_by": "nutritionist", "original_name": "2705111_97275537_2025011.pdf"}]', '{"pdf_version": 1, "total_attachments": 1, "last_pdf_generated": "2025-07-03T17:21:07.826Z"}', '[{"id": "a362da8c-8ac7-417f-a1b6-a4981454f169", "severity": "low", "medication": {"id": "med_0", "name": "loratadina"}, "description": "mala absorción del mineral zinc junto con los alimentos", "created_date": "2025-07-03T17:25:00.673Z", "updated_date": "2025-07-03T17:25:00.673Z", "foods_to_avoid": ["lácteos"], "recommendations": ["comer separado de los alimentos", "ver la serie del calamar"], "interaction_type": "excretion", "foods_to_increase": ["ninugno"], "nutrients_affected": ["Zinc"], "monitoring_required": false, "timing_considerations": "consumir 30 min antes de los alimentos"}]', 'inicial', NULL, NULL, NULL, NULL, NULL);
INSERT INTO public.clinical_records (id, record_date, expedient_number, consultation_reason, current_problems, diagnosed_diseases, family_medical_history, gynecological_aspects, daily_activities, activity_level_description, physical_exercise, consumption_habits, general_appearance, blood_pressure, biochemical_indicators, dietary_history, food_group_consumption_frequency, water_consumption_liters, daily_diet_record, anthropometric_measurements, anthropometric_evaluations, nutritional_diagnosis, energy_nutrient_needs, nutritional_plan_and_management, macronutrient_distribution, dietary_calculation_scheme, menu_details, evolution_and_follow_up_notes, graph_url, created_at, updated_at, patient_user_id, nutritionist_user_id, laboratory_documents, document_metadata, drug_nutrient_interactions, tipo_expediente, expediente_base_id, seguimiento_metadata, analisis_riesgo_beneficio, juicio_clinico, capacidad_paciente) VALUES ('299e0b74-3358-49bd-bb94-52c7fe9f6bbe', '2025-07-08', '1', 'control de peso', '{"ulcer": false, "nausea": false, "colitis": false, "pyrosis": false, "diarrhea": false, "vomiting": false, "gastritis": false, "constipation": true, "other_problems": "alergias aliementarias", "mouth_mechanics": "ninguno"}', '{"since_when": "hace 2 años", "has_disease": true, "has_surgery": true, "disease_name": "diabeters tipo 2", "surgery_details": "columna", "medications_list": ["metformina"], "takes_medication": true, "has_important_disease": true, "important_disease_name": "diabetes mellitus tipo 2", "takes_special_treatment": false}', '{"hta": true, "cancer": false, "obesity": true, "diabetes": true, "dyslipidemia": true, "other_history": "artritis", "hypo_hyperthyroidism": false}', NULL, NULL, 'sedentarismo', '{"performs_exercise": false}', '{"coffee": "diario q taza", "alcohol": "muy habitualmente", "tobacco": "canabis", "other_substances": "1 monster diario"}', NULL, '{"knows_bp": true, "systolic": 133, "diastolic": 85}', NULL, '{"when_received": "hace 2 años", "disliked_foods": ["brocoli"], "adherence_level": "Sin apego", "preferred_foods": ["chicharrones", "bebidas carbonatadas", "nusita", "mazapan"], "takes_supplements": true, "supplement_details": "omega 3", "malestar_alergia_foods": ["lacteos"], "received_nutritional_guidance": true}', NULL, 1.50, NULL, '{"height_m": 1.9, "hip_circ_cm": 115, "waist_circ_cm": 115, "current_weight_kg": 122, "habitual_weight_kg": 115}', NULL, 'obesidad ginecoide tipo 2', NULL, 'dieta hipocalorica, modificada en carbohidratos', NULL, NULL, NULL, NULL, NULL, '2025-07-09 07:43:17.48221-07', '2025-07-09 07:45:38.609584-07', 'c82a1e56-e7bd-44fb-87a5-5a81f4b4afd1', '741a971b-b0de-4ead-a030-0f5b906adac3', '[{"id": "65c48945-2a41-4f14-9860-7844c1e0038c", "file_url": "/uploads/laboratory-documents/lab_299e0b74-3358-49bd-bb94-52c7fe9f6bbe_1752072313945.pdf", "filename": "lab_299e0b74-3358-49bd-bb94-52c7fe9f6bbe_1752072313945.pdf", "lab_date": "2025-07-01T00:00:00.000Z", "file_path": "C:\\Users\\saulh\\OneDrive\\Documentos\\Nueva carpeta\\nutri\\uploads\\laboratory-documents\\lab_299e0b74-3358-49bd-bb94-52c7fe9f6bbe_1752072313945.pdf", "file_size": 1486661, "description": "quimica sanguinea", "upload_date": "2025-07-09T14:45:14.282Z", "uploaded_by": "nutritionist", "original_name": "guia para elaboracion de protocolos IMSS 2024-1.pdf"}]', '{"pdf_version": 2, "total_attachments": 1, "last_pdf_generated": "2025-07-09T14:45:38.491Z"}', NULL, 'inicial', NULL, NULL, NULL, NULL, NULL);
INSERT INTO public.clinical_records (id, record_date, expedient_number, consultation_reason, current_problems, diagnosed_diseases, family_medical_history, gynecological_aspects, daily_activities, activity_level_description, physical_exercise, consumption_habits, general_appearance, blood_pressure, biochemical_indicators, dietary_history, food_group_consumption_frequency, water_consumption_liters, daily_diet_record, anthropometric_measurements, anthropometric_evaluations, nutritional_diagnosis, energy_nutrient_needs, nutritional_plan_and_management, macronutrient_distribution, dietary_calculation_scheme, menu_details, evolution_and_follow_up_notes, graph_url, created_at, updated_at, patient_user_id, nutritionist_user_id, laboratory_documents, document_metadata, drug_nutrient_interactions, tipo_expediente, expediente_base_id, seguimiento_metadata, analisis_riesgo_beneficio, juicio_clinico, capacidad_paciente) VALUES ('f799eb61-1a1e-4d6c-808f-86b9470ec87f', '2025-08-04', NULL, 'mejorar estilo de vida ', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '{"knows_bp": true, "systolic": 120, "diastolic": 80}', NULL, NULL, NULL, NULL, NULL, '{"height_m": 1.9, "waist_circ_cm": 100, "current_weight_kg": 105}', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'optimizar horarios de preparacion de alimentos para llevar correctamente dietoterapia', NULL, '2025-08-05 10:24:51.997926-07', '2025-08-05 10:24:51.997926-07', 'c82a1e56-e7bd-44fb-87a5-5a81f4b4afd1', '741a971b-b0de-4ead-a030-0f5b906adac3', NULL, NULL, NULL, 'seguimiento', '299e0b74-3358-49bd-bb94-52c7fe9f6bbe', '{"dificultades": "horarios de trabajo", "satisfaccion": 3, "adherencia_plan": 100, "mejoras_notadas": "tono muscular", "nuevos_sintomas": "", "proximos_objetivos": "perder 2% de grasa corporal", "cambios_medicamentos": false}', NULL, NULL, '{"observaciones": "", "nivel_independencia": "alto", "puede_auto_monitoreo": true, "comprende_medicamentos": true, "conoce_sintomas_alarma": true, "requiere_apoyo_familiar": false, "sabe_contacto_emergencia": true}');


--
-- Data for Name: conversations; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: diet_plans; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.diet_plans (id, name, generated_by_ia, ia_version, status, notes, start_date, end_date, daily_calories_target, daily_macros_target, is_weekly_plan, total_weeks, weekly_plans, created_at, updated_at, patient_user_id, nutritionist_user_id, description, pathological_restrictions, meal_frequency, meal_timing, nutritional_goals, flexibility_settings, meal_schedules) VALUES ('08c56d45-f10a-483d-9142-c1449a0c5a74', 'plan 1', false, NULL, 'draft', 'primer vistazo', '2025-06-29', '2025-07-19', 1500.00, '{"fats": 67, "protein": 150, "carbohydrates": 200}', true, 1, '[]', '2025-06-26 18:59:25.893908-07', '2025-06-26 18:59:25.893908-07', 'edee0e5f-8cc0-4870-bc19-b423df2e0829', '16061724-6bbd-48eb-ae2a-c23b29dcdad8', NULL, NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO public.diet_plans (id, name, generated_by_ia, ia_version, status, notes, start_date, end_date, daily_calories_target, daily_macros_target, is_weekly_plan, total_weeks, weekly_plans, created_at, updated_at, patient_user_id, nutritionist_user_id, description, pathological_restrictions, meal_frequency, meal_timing, nutritional_goals, flexibility_settings, meal_schedules) VALUES ('4a126438-d410-44d2-96dc-02cfa82f463f', 'qqq', false, NULL, 'draft', '', '2025-06-28', '2025-07-26', 2000.00, '{"fats": 67, "protein": 150, "carbohydrates": 200}', true, 1, '[]', '2025-06-27 09:51:57.652423-07', '2025-06-27 09:51:57.652423-07', '3209877c-350e-4a2d-a620-dffd4675aaef', '741a971b-b0de-4ead-a030-0f5b906adac3', NULL, NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO public.diet_plans (id, name, generated_by_ia, ia_version, status, notes, start_date, end_date, daily_calories_target, daily_macros_target, is_weekly_plan, total_weeks, weekly_plans, created_at, updated_at, patient_user_id, nutritionist_user_id, description, pathological_restrictions, meal_frequency, meal_timing, nutritional_goals, flexibility_settings, meal_schedules) VALUES ('df819340-f29e-47b9-b944-b574eb5ccff2', 'dieta hipocalorica para pérdida de peso ', false, NULL, 'draft', NULL, '2025-07-01', '2025-07-29', 1800.00, '{"fats": 72, "protein": 100, "carbohydrates": 200}', true, 4, '[{"meals": [], "notes": "Semana 1 - Plan generado automáticamente", "end_date": "2025-07-08", "start_date": "2025-07-02", "week_number": 1, "daily_macros_target": {"fats": 72, "protein": 100, "carbohydrates": 200}, "daily_calories_target": 1800}, {"meals": [], "notes": "Semana 2 - Plan generado automáticamente", "end_date": "2025-07-15", "start_date": "2025-07-09", "week_number": 2, "daily_macros_target": {"fats": 72, "protein": 100, "carbohydrates": 200}, "daily_calories_target": 1800}, {"meals": [], "notes": "Semana 3 - Plan generado automáticamente", "end_date": "2025-07-22", "start_date": "2025-07-16", "week_number": 3, "daily_macros_target": {"fats": 72, "protein": 100, "carbohydrates": 200}, "daily_calories_target": 1800}, {"meals": [], "notes": "Semana 4 - Plan generado automáticamente", "end_date": "2025-07-29", "start_date": "2025-07-23", "week_number": 4, "daily_macros_target": {"fats": 72, "protein": 100, "carbohydrates": 200}, "daily_calories_target": 1800}]', '2025-07-03 10:30:46.096721-07', '2025-07-03 10:30:46.41776-07', '3209877c-350e-4a2d-a620-dffd4675aaef', '741a971b-b0de-4ead-a030-0f5b906adac3', 'dieta de 1800 kcal, modificada en carbohidratos', '{"allergies": [{"type": "food", "allergen": "camaron", "severity": "medium", "symptoms": [], "cross_reactions": [], "emergency_medication": "", "avoidance_instructions": "Evitar completamente: camaron"}], "medications": [{"name": "loratadina", "dosage": "Ver expediente clínico", "frequency": "Según prescripción médica", "food_interactions": [], "timing_requirements": ""}], "intolerances": [{"type": "food", "severity": "mild", "symptoms": [], "substance": "ninguna", "alternatives": [], "threshold_amount": "", "preparation_notes": ""}], "emergency_contacts": [], "medical_conditions": [{"name": "Condiciones médicas registradas", "category": "medical", "severity": "medium", "description": "daibetes", "restricted_foods": [], "recommended_foods": [], "dietary_implications": [], "emergency_instructions": "", "monitoring_requirements": []}], "special_considerations": ["🧂 Bajo en sodio"]}', '{"lunch": true, "dinner": true, "breakfast": true, "evening_snack": false, "morning_snack": true, "afternoon_snack": true}', '{"bed_time": "22:00", "lunch_time": "13:00", "dinner_time": "19:00", "snack_times": ["10:00", "16:00"], "breakfast_time": "07:00"}', '{"meals_per_day": 5, "fiber_target_grams": 30, "water_intake_liters": 2.5, "calorie_distribution": "balanced"}', '{"allow_meal_swapping": true, "cheat_days_per_week": 1, "free_meals_per_week": 2, "allow_food_substitution": false, "allow_portion_adjustment": true}', NULL);
INSERT INTO public.diet_plans (id, name, generated_by_ia, ia_version, status, notes, start_date, end_date, daily_calories_target, daily_macros_target, is_weekly_plan, total_weeks, weekly_plans, created_at, updated_at, patient_user_id, nutritionist_user_id, description, pathological_restrictions, meal_frequency, meal_timing, nutritional_goals, flexibility_settings, meal_schedules) VALUES ('fee5a342-cc4d-41b2-8ee8-f262af95184b', 'uno', false, NULL, 'draft', NULL, '2025-08-03', '2025-08-31', 2000.00, '{"fats": 56, "protein": 150, "carbohydrates": 225}', true, 4, '[{"meals": [], "notes": "Semana 1 - Plan generado automáticamente", "end_date": "2025-08-10", "start_date": "2025-08-04", "week_number": 1, "daily_macros_target": {"fats": 56, "protein": 150, "carbohydrates": 225}, "daily_calories_target": 2000}, {"meals": [], "notes": "Semana 2 - Plan generado automáticamente", "end_date": "2025-08-17", "start_date": "2025-08-11", "week_number": 2, "daily_macros_target": {"fats": 56, "protein": 150, "carbohydrates": 225}, "daily_calories_target": 2000}, {"meals": [], "notes": "Semana 3 - Plan generado automáticamente", "end_date": "2025-08-24", "start_date": "2025-08-18", "week_number": 3, "daily_macros_target": {"fats": 56, "protein": 150, "carbohydrates": 225}, "daily_calories_target": 2000}, {"meals": [], "notes": "Semana 4 - Plan generado automáticamente", "end_date": "2025-08-31", "start_date": "2025-08-25", "week_number": 4, "daily_macros_target": {"fats": 56, "protein": 150, "carbohydrates": 225}, "daily_calories_target": 2000}]', '2025-08-05 00:00:27.432271-07', '2025-08-05 00:00:27.47394-07', 'c82a1e56-e7bd-44fb-87a5-5a81f4b4afd1', '741a971b-b0de-4ead-a030-0f5b906adac3', NULL, '{"allergies": [], "medications": [], "intolerances": [], "emergency_contacts": [], "medical_conditions": [], "special_considerations": []}', '{"lunch": true, "dinner": true, "breakfast": true, "evening_snack": false, "morning_snack": true, "afternoon_snack": true}', '{"bed_time": "22:00", "lunch_time": "13:00", "dinner_time": "19:00", "snack_times": ["10:00", "16:00"], "breakfast_time": "07:00"}', '{"meals_per_day": 5, "fiber_target_grams": 25, "water_intake_liters": 2.5, "calorie_distribution": "balanced"}', '{"allow_meal_swapping": true, "cheat_days_per_week": 1, "free_meals_per_week": 2, "allow_food_substitution": true, "allow_portion_adjustment": true}', NULL);
INSERT INTO public.diet_plans (id, name, generated_by_ia, ia_version, status, notes, start_date, end_date, daily_calories_target, daily_macros_target, is_weekly_plan, total_weeks, weekly_plans, created_at, updated_at, patient_user_id, nutritionist_user_id, description, pathological_restrictions, meal_frequency, meal_timing, nutritional_goals, flexibility_settings, meal_schedules) VALUES ('42bec8c1-f73c-4680-b6b3-0642aba571f0', 'CONTROL DE PESO', false, NULL, 'draft', NULL, '2025-07-08', '2025-07-15', 11504.00, '{"fats": 383, "protein": 719, "carbohydrates": 1294}', true, 1, '[{"meals": [], "notes": "Semana 1 - Plan generado automáticamente", "end_date": "2025-07-15", "start_date": "2025-07-09", "week_number": 1, "daily_macros_target": {"fats": 383, "protein": 719, "carbohydrates": 1294}, "daily_calories_target": 11504}]', '2025-07-09 07:18:13.81518-07', '2025-07-09 07:18:14.700742-07', '3209877c-350e-4a2d-a620-dffd4675aaef', '741a971b-b0de-4ead-a030-0f5b906adac3', 'DIETA HIPOCALORICA CON COLACIONES, SIN IRRTANTES', '{"allergies": [{"type": "food", "allergen": "camaron", "severity": "medium", "symptoms": [], "cross_reactions": [], "emergency_medication": "", "avoidance_instructions": "Evitar completamente: camaron"}], "medications": [{"name": "METFORMINA", "dosage": "Ver expediente clínico", "frequency": "Según prescripción médica", "food_interactions": [], "timing_requirements": ""}], "intolerances": [{"type": "food", "severity": "mild", "symptoms": [], "substance": "LACTOSA", "alternatives": [], "threshold_amount": "", "preparation_notes": ""}], "emergency_contacts": [], "medical_conditions": [{"name": "Condiciones médicas registradas", "category": "medical", "severity": "medium", "description": "daibetes", "restricted_foods": [], "recommended_foods": [], "dietary_implications": [], "emergency_instructions": "", "monitoring_requirements": []}], "special_considerations": ["🥛 Sin lactosa", "🧂 Bajo en sodio"]}', '{"lunch": true, "dinner": true, "breakfast": true, "evening_snack": false, "morning_snack": true, "afternoon_snack": true}', '{"bed_time": "22:00", "lunch_time": "15:00", "dinner_time": "20:00", "snack_times": ["11:00", "17:30"], "breakfast_time": "08:00"}', '{"meals_per_day": 5, "fiber_target_grams": 25, "water_intake_liters": 2.5, "calorie_distribution": "balanced"}', '{"allow_meal_swapping": true, "cheat_days_per_week": 1, "free_meals_per_week": 2, "allow_food_substitution": false, "allow_portion_adjustment": true}', NULL);
INSERT INTO public.diet_plans (id, name, generated_by_ia, ia_version, status, notes, start_date, end_date, daily_calories_target, daily_macros_target, is_weekly_plan, total_weeks, weekly_plans, created_at, updated_at, patient_user_id, nutritionist_user_id, description, pathological_restrictions, meal_frequency, meal_timing, nutritional_goals, flexibility_settings, meal_schedules) VALUES ('1a53d512-851a-4f32-9df7-3a53f3f59eba', 'Dieta para control de peso', false, NULL, 'draft', '', '2025-07-08', '2025-08-05', 2500.00, '{"fats": 100, "protein": 150, "carbohydrates": 250}', true, 4, '[{"meals": [{"id": "meal2-1754379394433", "day": "Martes", "foods": [], "recipes": [{"fats": 25, "carbs": 30, "protein": 45, "calories": 600, "servings": 1.5, "recipe_id": "test-modified-1754379394433", "is_modified": true, "recipe_data": {"title": "Pollo al Horno", "servings": 1, "description": "Pollo con más proteína", "ingredients": [], "totalMacros": {"fats": 20, "protein": 35, "carbohydrates": 25}, "totalCalories": 500}, "recipe_name": "Pollo al Horno (Modificada)", "original_recipe_id": "original-chicken-recipe", "modification_timestamp": "2025-08-05T07:36:34.433Z"}], "meal_time": "13:00", "meal_type": "lunch", "total_fats": 25, "total_carbs": 30, "total_protein": 45, "total_calories": 600}], "notes": "Semana 1 - Plan generado automáticamente", "end_date": "2025-07-15", "start_date": "2025-07-09", "week_number": 1, "daily_macros_target": {"fats": 100, "protein": 150, "carbohydrates": 250}, "daily_calories_target": 2500}, {"meals": [], "notes": "Semana 2 - Plan generado automáticamente", "end_date": "2025-07-22", "start_date": "2025-07-16", "week_number": 2, "daily_macros_target": {"fats": 100, "protein": 150, "carbohydrates": 250}, "daily_calories_target": 2500}, {"meals": [], "notes": "Semana 3 - Plan generado automáticamente", "end_date": "2025-07-29", "start_date": "2025-07-23", "week_number": 3, "daily_macros_target": {"fats": 100, "protein": 150, "carbohydrates": 250}, "daily_calories_target": 2500}, {"meals": [], "notes": "Semana 4 - Plan generado automáticamente", "end_date": "2025-08-05", "start_date": "2025-07-30", "week_number": 4, "daily_macros_target": {"fats": 100, "protein": 150, "carbohydrates": 250}, "daily_calories_target": 2500}]', '2025-07-09 07:49:54.145725-07', '2025-08-05 00:36:39.18647-07', 'c82a1e56-e7bd-44fb-87a5-5a81f4b4afd1', '741a971b-b0de-4ead-a030-0f5b906adac3', '', '{"allergies": [{"type": "food", "allergen": "lacteos", "severity": "medium", "symptoms": [], "cross_reactions": [], "emergency_medication": "", "avoidance_instructions": "Evitar completamente: lacteos"}], "medications": [{"name": "metformina", "dosage": "Ver expediente clínico", "frequency": "Según prescripción médica", "food_interactions": [], "timing_requirements": ""}], "intolerances": [], "emergency_contacts": [], "medical_conditions": [{"name": "Condiciones médicas registradas", "category": "medical", "severity": "medium", "description": "diabeters tipo 2, diabetes mellitus tipo 2", "restricted_foods": [], "recommended_foods": [], "dietary_implications": [], "emergency_instructions": "", "monitoring_requirements": []}], "special_considerations": ["🧂 Bajo en sodio"]}', '{"lunch": true, "dinner": true, "breakfast": true, "evening_snack": false, "morning_snack": true, "afternoon_snack": true}', '{"bed_time": "22:00", "lunch_time": "13:00", "dinner_time": "19:00", "snack_times": ["10:00", "16:00"], "breakfast_time": "07:00"}', '{"meals_per_day": 5, "fiber_target_grams": 25, "water_intake_liters": 2.5, "calorie_distribution": "balanced"}', '{"allow_meal_swapping": true, "cheat_days_per_week": 1, "free_meals_per_week": 2, "allow_food_substitution": false, "allow_portion_adjustment": true}', NULL);
INSERT INTO public.diet_plans (id, name, generated_by_ia, ia_version, status, notes, start_date, end_date, daily_calories_target, daily_macros_target, is_weekly_plan, total_weeks, weekly_plans, created_at, updated_at, patient_user_id, nutritionist_user_id, description, pathological_restrictions, meal_frequency, meal_timing, nutritional_goals, flexibility_settings, meal_schedules) VALUES ('6745a68b-247b-4386-a475-76e1dee2a315', 'control de peso', false, NULL, 'draft', 'trastorno alimenticio de tipo bulimico', '2025-08-05', '2025-09-02', 1500.00, '{"fats": 44, "protein": 90, "carbohydrates": 188}', true, 4, '[{"meals": [], "notes": "Semana 1 - Plan generado automáticamente", "end_date": "2025-08-12", "start_date": "2025-08-06", "week_number": 1, "daily_macros_target": {"fats": 44, "protein": 90, "carbohydrates": 188}, "daily_calories_target": 1500}, {"meals": [], "notes": "Semana 2 - Plan generado automáticamente", "end_date": "2025-08-19", "start_date": "2025-08-13", "week_number": 2, "daily_macros_target": {"fats": 44, "protein": 90, "carbohydrates": 188}, "daily_calories_target": 1500}, {"meals": [], "notes": "Semana 3 - Plan generado automáticamente", "end_date": "2025-08-26", "start_date": "2025-08-20", "week_number": 3, "daily_macros_target": {"fats": 44, "protein": 90, "carbohydrates": 188}, "daily_calories_target": 1500}, {"meals": [], "notes": "Semana 4 - Plan generado automáticamente", "end_date": "2025-09-02", "start_date": "2025-08-27", "week_number": 4, "daily_macros_target": {"fats": 44, "protein": 90, "carbohydrates": 188}, "daily_calories_target": 1500}]', '2025-08-05 09:42:35.867936-07', '2025-08-05 09:42:36.166244-07', 'c82a1e56-e7bd-44fb-87a5-5a81f4b4afd1', '741a971b-b0de-4ead-a030-0f5b906adac3', 'dieta hipocalorica baja en grasa', '{"allergies": [{"type": "food", "allergen": "lacteos", "severity": "medium", "symptoms": [], "cross_reactions": [], "emergency_medication": "", "avoidance_instructions": "Evitar completamente: lacteos"}], "medications": [{"name": "metformina", "dosage": "Ver expediente clínico", "frequency": "Según prescripción médica", "food_interactions": [], "timing_requirements": ""}], "intolerances": [], "emergency_contacts": [], "medical_conditions": [{"name": "Condiciones médicas registradas", "category": "medical", "severity": "medium", "description": "diabeters tipo 2, diabetes mellitus tipo 2", "restricted_foods": [], "recommended_foods": [], "dietary_implications": [], "emergency_instructions": "", "monitoring_requirements": []}], "special_considerations": ["🧂 Bajo en sodio"]}', '{"lunch": true, "dinner": true, "breakfast": true, "evening_snack": false, "morning_snack": true, "afternoon_snack": true}', '{"bed_time": "22:00", "lunch_time": "13:00", "dinner_time": "19:00", "snack_times": ["10:00", "16:00"], "breakfast_time": "07:00"}', '{"meals_per_day": 5, "fiber_target_grams": 25, "water_intake_liters": 2.5, "calorie_distribution": "balanced"}', '{"allow_meal_swapping": true, "cheat_days_per_week": 1, "free_meals_per_week": 2, "allow_food_substitution": false, "allow_portion_adjustment": true}', NULL);


--
-- Data for Name: educational_content; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: foods; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.foods (id, name, description, calories, protein, carbohydrates, fats, fiber, sugar, unit, serving_size, category, is_custom, created_at, updated_at, created_by_user_id) VALUES ('0139d45b-17a0-4d35-90f4-dd3b45e55cfc', 'Pollo pechuga sin piel', 'Pechuga de pollo cruda, sin piel', 165.00, 31.00, 0.00, 3.60, 0.00, 0.00, 'g', 100.00, 'Proteínas', false, '2025-08-04 23:32:33.313376-07', '2025-08-04 23:32:33.313376-07', '6f275f3f-63b4-41c8-b8eb-346af391c921');
INSERT INTO public.foods (id, name, description, calories, protein, carbohydrates, fats, fiber, sugar, unit, serving_size, category, is_custom, created_at, updated_at, created_by_user_id) VALUES ('704b8bc8-9319-4fbf-93bd-ec3f4f24c75b', 'Huevo entero', 'Huevo de gallina entero', 155.00, 13.00, 1.10, 11.00, 0.00, 1.10, 'g', 100.00, 'Proteínas', false, '2025-08-04 23:32:33.355513-07', '2025-08-04 23:32:33.355513-07', '6f275f3f-63b4-41c8-b8eb-346af391c921');
INSERT INTO public.foods (id, name, description, calories, protein, carbohydrates, fats, fiber, sugar, unit, serving_size, category, is_custom, created_at, updated_at, created_by_user_id) VALUES ('b2502aea-c112-4dee-8171-3a1bce4f8c18', 'Salmón', 'Salmón fresco, crudo', 208.00, 25.40, 0.00, 12.40, 0.00, 0.00, 'g', 100.00, 'Proteínas', false, '2025-08-04 23:32:33.368802-07', '2025-08-04 23:32:33.368802-07', '6f275f3f-63b4-41c8-b8eb-346af391c921');
INSERT INTO public.foods (id, name, description, calories, protein, carbohydrates, fats, fiber, sugar, unit, serving_size, category, is_custom, created_at, updated_at, created_by_user_id) VALUES ('0362a002-b571-4806-814f-b0148929a5ab', 'Frijoles negros', 'Frijoles negros cocidos', 132.00, 8.90, 23.00, 0.50, 8.70, 0.30, 'g', 100.00, 'Proteínas', false, '2025-08-04 23:32:33.379908-07', '2025-08-04 23:32:33.379908-07', '6f275f3f-63b4-41c8-b8eb-346af391c921');
INSERT INTO public.foods (id, name, description, calories, protein, carbohydrates, fats, fiber, sugar, unit, serving_size, category, is_custom, created_at, updated_at, created_by_user_id) VALUES ('4ea948e1-09c9-44bc-85ca-928903c999fb', 'Arroz integral', 'Arroz integral cocido', 111.00, 2.60, 23.00, 0.90, 1.80, 0.40, 'g', 100.00, 'Carbohidratos', false, '2025-08-04 23:32:33.391596-07', '2025-08-04 23:32:33.391596-07', '6f275f3f-63b4-41c8-b8eb-346af391c921');
INSERT INTO public.foods (id, name, description, calories, protein, carbohydrates, fats, fiber, sugar, unit, serving_size, category, is_custom, created_at, updated_at, created_by_user_id) VALUES ('c7fb825c-ec6e-4c33-8ed0-ca1998aeff7d', 'Avena', 'Avena en hojuelas cruda', 389.00, 16.90, 66.30, 6.90, 10.60, 1.00, 'g', 100.00, 'Carbohidratos', false, '2025-08-04 23:32:33.403907-07', '2025-08-04 23:32:33.403907-07', '6f275f3f-63b4-41c8-b8eb-346af391c921');
INSERT INTO public.foods (id, name, description, calories, protein, carbohydrates, fats, fiber, sugar, unit, serving_size, category, is_custom, created_at, updated_at, created_by_user_id) VALUES ('9ec8f1f6-7c21-474e-92b9-16130a117b08', 'Quinoa', 'Quinoa cocida', 120.00, 4.40, 22.00, 1.90, 2.80, 0.90, 'g', 100.00, 'Carbohidratos', false, '2025-08-04 23:32:33.414461-07', '2025-08-04 23:32:33.414461-07', '6f275f3f-63b4-41c8-b8eb-346af391c921');
INSERT INTO public.foods (id, name, description, calories, protein, carbohydrates, fats, fiber, sugar, unit, serving_size, category, is_custom, created_at, updated_at, created_by_user_id) VALUES ('e1cbeba5-5a70-42b9-9642-a2f68a09df65', 'Papa', 'Papa hervida con piel', 87.00, 1.90, 20.10, 0.10, 1.80, 0.90, 'g', 100.00, 'Carbohidratos', false, '2025-08-04 23:32:33.427494-07', '2025-08-04 23:32:33.427494-07', '6f275f3f-63b4-41c8-b8eb-346af391c921');
INSERT INTO public.foods (id, name, description, calories, protein, carbohydrates, fats, fiber, sugar, unit, serving_size, category, is_custom, created_at, updated_at, created_by_user_id) VALUES ('9baa6c1d-c69b-476a-a422-e0f18fd53fcf', 'Pan integral', 'Pan integral de trigo', 247.00, 13.00, 41.00, 4.20, 6.00, 6.00, 'g', 100.00, 'Carbohidratos', false, '2025-08-04 23:32:33.440591-07', '2025-08-04 23:32:33.440591-07', '6f275f3f-63b4-41c8-b8eb-346af391c921');
INSERT INTO public.foods (id, name, description, calories, protein, carbohydrates, fats, fiber, sugar, unit, serving_size, category, is_custom, created_at, updated_at, created_by_user_id) VALUES ('02a08e3f-7214-4f15-8459-55f6622666b3', 'Brócoli', 'Brócoli fresco crudo', 34.00, 2.80, 7.00, 0.40, 2.60, 1.50, 'g', 100.00, 'Vegetales', false, '2025-08-04 23:32:33.454056-07', '2025-08-04 23:32:33.454056-07', '6f275f3f-63b4-41c8-b8eb-346af391c921');
INSERT INTO public.foods (id, name, description, calories, protein, carbohydrates, fats, fiber, sugar, unit, serving_size, category, is_custom, created_at, updated_at, created_by_user_id) VALUES ('a366db64-e82a-4f35-9475-7d6aa6e05c50', 'Espinaca', 'Espinaca fresca cruda', 23.00, 2.90, 3.60, 0.40, 2.20, 0.40, 'g', 100.00, 'Vegetales', false, '2025-08-04 23:32:33.465689-07', '2025-08-04 23:32:33.465689-07', '6f275f3f-63b4-41c8-b8eb-346af391c921');
INSERT INTO public.foods (id, name, description, calories, protein, carbohydrates, fats, fiber, sugar, unit, serving_size, category, is_custom, created_at, updated_at, created_by_user_id) VALUES ('db32989a-59ba-43c1-81a4-fcd1550cd82f', 'Tomate', 'Tomate rojo maduro', 18.00, 0.90, 3.90, 0.20, 1.20, 2.60, 'g', 100.00, 'Vegetales', false, '2025-08-04 23:32:33.47596-07', '2025-08-04 23:32:33.47596-07', '6f275f3f-63b4-41c8-b8eb-346af391c921');
INSERT INTO public.foods (id, name, description, calories, protein, carbohydrates, fats, fiber, sugar, unit, serving_size, category, is_custom, created_at, updated_at, created_by_user_id) VALUES ('7597e9bf-c4d1-4af8-87f3-9c68aa4baf6a', 'Zanahoria', 'Zanahoria cruda', 41.00, 0.90, 9.60, 0.20, 2.80, 4.70, 'g', 100.00, 'Vegetales', false, '2025-08-04 23:32:33.486473-07', '2025-08-04 23:32:33.486473-07', '6f275f3f-63b4-41c8-b8eb-346af391c921');
INSERT INTO public.foods (id, name, description, calories, protein, carbohydrates, fats, fiber, sugar, unit, serving_size, category, is_custom, created_at, updated_at, created_by_user_id) VALUES ('59746746-ff5f-4f6b-882e-4c04548bcdab', 'Pepino', 'Pepino con piel', 16.00, 0.70, 4.00, 0.10, 0.50, 1.70, 'g', 100.00, 'Vegetales', false, '2025-08-04 23:32:33.496816-07', '2025-08-04 23:32:33.496816-07', '6f275f3f-63b4-41c8-b8eb-346af391c921');
INSERT INTO public.foods (id, name, description, calories, protein, carbohydrates, fats, fiber, sugar, unit, serving_size, category, is_custom, created_at, updated_at, created_by_user_id) VALUES ('0c39a414-c29e-4018-a4e6-8264f92052c8', 'Manzana', 'Manzana roja con piel', 52.00, 0.30, 14.00, 0.20, 2.40, 10.40, 'g', 100.00, 'Frutas', false, '2025-08-04 23:32:33.507857-07', '2025-08-04 23:32:33.507857-07', '6f275f3f-63b4-41c8-b8eb-346af391c921');
INSERT INTO public.foods (id, name, description, calories, protein, carbohydrates, fats, fiber, sugar, unit, serving_size, category, is_custom, created_at, updated_at, created_by_user_id) VALUES ('cb1c71c5-f0f8-477e-afdd-c30ddd95664e', 'Plátano', 'Plátano maduro', 89.00, 1.10, 23.00, 0.30, 2.60, 12.20, 'g', 100.00, 'Frutas', false, '2025-08-04 23:32:33.519235-07', '2025-08-04 23:32:33.519235-07', '6f275f3f-63b4-41c8-b8eb-346af391c921');
INSERT INTO public.foods (id, name, description, calories, protein, carbohydrates, fats, fiber, sugar, unit, serving_size, category, is_custom, created_at, updated_at, created_by_user_id) VALUES ('a00fbe84-f363-4933-81ea-436cba2f1542', 'Naranja', 'Naranja fresca', 47.00, 0.90, 12.00, 0.10, 2.40, 9.40, 'g', 100.00, 'Frutas', false, '2025-08-04 23:32:33.530967-07', '2025-08-04 23:32:33.530967-07', '6f275f3f-63b4-41c8-b8eb-346af391c921');
INSERT INTO public.foods (id, name, description, calories, protein, carbohydrates, fats, fiber, sugar, unit, serving_size, category, is_custom, created_at, updated_at, created_by_user_id) VALUES ('9fdb70a3-d9b5-4b7b-8a16-6fd3b298bff4', 'Aguacate', 'Aguacate maduro', 160.00, 2.00, 8.50, 14.70, 6.70, 0.70, 'g', 100.00, 'Frutas', false, '2025-08-04 23:32:33.542726-07', '2025-08-04 23:32:33.542726-07', '6f275f3f-63b4-41c8-b8eb-346af391c921');
INSERT INTO public.foods (id, name, description, calories, protein, carbohydrates, fats, fiber, sugar, unit, serving_size, category, is_custom, created_at, updated_at, created_by_user_id) VALUES ('c8aa22da-450f-4cdf-be5e-31939ff6408f', 'Leche descremada', 'Leche de vaca descremada', 34.00, 3.40, 5.00, 0.10, 0.00, 5.00, 'ml', 100.00, 'Lácteos', false, '2025-08-04 23:32:33.555214-07', '2025-08-04 23:32:33.555214-07', '6f275f3f-63b4-41c8-b8eb-346af391c921');
INSERT INTO public.foods (id, name, description, calories, protein, carbohydrates, fats, fiber, sugar, unit, serving_size, category, is_custom, created_at, updated_at, created_by_user_id) VALUES ('ff8e7d11-d1f3-492b-a53c-0088e98ebf48', 'Yogur griego natural', 'Yogur griego sin azúcar', 59.00, 10.00, 3.60, 0.40, 0.00, 3.60, 'g', 100.00, 'Lácteos', false, '2025-08-04 23:32:33.564437-07', '2025-08-04 23:32:33.564437-07', '6f275f3f-63b4-41c8-b8eb-346af391c921');
INSERT INTO public.foods (id, name, description, calories, protein, carbohydrates, fats, fiber, sugar, unit, serving_size, category, is_custom, created_at, updated_at, created_by_user_id) VALUES ('70f33aa9-18e1-4ed2-a8c4-f63a233efe5c', 'Queso cottage', 'Queso cottage bajo en grasa', 98.00, 11.00, 3.40, 4.30, 0.00, 2.70, 'g', 100.00, 'Lácteos', false, '2025-08-04 23:32:33.575207-07', '2025-08-04 23:32:33.575207-07', '6f275f3f-63b4-41c8-b8eb-346af391c921');
INSERT INTO public.foods (id, name, description, calories, protein, carbohydrates, fats, fiber, sugar, unit, serving_size, category, is_custom, created_at, updated_at, created_by_user_id) VALUES ('dd3d355a-c37a-4445-8bc4-2587ac723c79', 'Aceite de oliva', 'Aceite de oliva extra virgen', 884.00, 0.00, 0.00, 100.00, 0.00, 0.00, 'ml', 100.00, 'Aceites y grasas', false, '2025-08-04 23:32:33.586478-07', '2025-08-04 23:32:33.586478-07', '6f275f3f-63b4-41c8-b8eb-346af391c921');
INSERT INTO public.foods (id, name, description, calories, protein, carbohydrates, fats, fiber, sugar, unit, serving_size, category, is_custom, created_at, updated_at, created_by_user_id) VALUES ('bc391e8d-70ef-4d95-8235-05c39eb960d0', 'Almendras', 'Almendras crudas', 579.00, 21.20, 22.00, 49.90, 12.50, 4.40, 'g', 100.00, 'Frutos secos', false, '2025-08-04 23:32:33.597223-07', '2025-08-04 23:32:33.597223-07', '6f275f3f-63b4-41c8-b8eb-346af391c921');
INSERT INTO public.foods (id, name, description, calories, protein, carbohydrates, fats, fiber, sugar, unit, serving_size, category, is_custom, created_at, updated_at, created_by_user_id) VALUES ('80ed4fcd-7330-4b24-b98b-1829256cecf3', 'Nuez', 'Nueces de nogal', 654.00, 15.20, 14.00, 65.20, 6.70, 2.60, 'g', 100.00, 'Frutos secos', false, '2025-08-04 23:32:33.607029-07', '2025-08-04 23:32:33.607029-07', '6f275f3f-63b4-41c8-b8eb-346af391c921');


--
-- Data for Name: growth_references; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.growth_references (id, source, metric_type, gender, age_months, p3, p5, p10, p15, p25, p50, p75, p85, p90, p95, p97, l_lambda, m_mu, s_sigma, notes, version, created_at, updated_at) VALUES ('573affcb-539e-43a9-9db0-5ed939299d8d', 'WHO', 'weight_for_age', 'male', 0, 2.5000, 2.7000, 2.9000, 3.0000, 3.2000, 3.5000, 3.8000, 4.0000, 4.2000, 4.5000, 4.7000, 0.500000, 3.500000, 0.150000, NULL, 'WHO 2006', '2025-08-05 00:44:32.383536', '2025-08-05 00:44:32.383536');
INSERT INTO public.growth_references (id, source, metric_type, gender, age_months, p3, p5, p10, p15, p25, p50, p75, p85, p90, p95, p97, l_lambda, m_mu, s_sigma, notes, version, created_at, updated_at) VALUES ('e477b76f-2273-4f79-9bd5-9c48e0daeea5', 'WHO', 'weight_for_age', 'male', 1, 3.2000, 3.4000, 3.6000, 3.7000, 3.9000, 4.2000, 4.5000, 4.7000, 4.9000, 5.2000, 5.4000, 0.500000, 4.200000, 0.150000, NULL, 'WHO 2006', '2025-08-05 00:44:32.383536', '2025-08-05 00:44:32.383536');
INSERT INTO public.growth_references (id, source, metric_type, gender, age_months, p3, p5, p10, p15, p25, p50, p75, p85, p90, p95, p97, l_lambda, m_mu, s_sigma, notes, version, created_at, updated_at) VALUES ('687443e9-2582-4c07-894a-08f7efe55b0d', 'WHO', 'weight_for_age', 'male', 2, 3.9000, 4.1000, 4.3000, 4.4000, 4.6000, 4.9000, 5.2000, 5.4000, 5.6000, 5.9000, 6.1000, 0.500000, 4.900000, 0.150000, NULL, 'WHO 2006', '2025-08-05 00:44:32.383536', '2025-08-05 00:44:32.383536');
INSERT INTO public.growth_references (id, source, metric_type, gender, age_months, p3, p5, p10, p15, p25, p50, p75, p85, p90, p95, p97, l_lambda, m_mu, s_sigma, notes, version, created_at, updated_at) VALUES ('c66b6336-b2ff-4ad9-8ddc-5b5e61055c27', 'WHO', 'weight_for_age', 'male', 3, 4.5000, 4.7000, 4.9000, 5.0000, 5.2000, 5.5000, 5.8000, 6.0000, 6.2000, 6.5000, 6.7000, 0.500000, 5.500000, 0.150000, NULL, 'WHO 2006', '2025-08-05 00:51:17.101454', '2025-08-05 00:51:17.101454');
INSERT INTO public.growth_references (id, source, metric_type, gender, age_months, p3, p5, p10, p15, p25, p50, p75, p85, p90, p95, p97, l_lambda, m_mu, s_sigma, notes, version, created_at, updated_at) VALUES ('711c2171-4530-4820-a46d-74137e66383f', 'WHO', 'weight_for_age', 'male', 4, 5.1000, 5.3000, 5.5000, 5.6000, 5.8000, 6.1000, 6.4000, 6.6000, 6.8000, 7.1000, 7.3000, 0.500000, 6.100000, 0.150000, NULL, 'WHO 2006', '2025-08-05 00:51:17.101454', '2025-08-05 00:51:17.101454');
INSERT INTO public.growth_references (id, source, metric_type, gender, age_months, p3, p5, p10, p15, p25, p50, p75, p85, p90, p95, p97, l_lambda, m_mu, s_sigma, notes, version, created_at, updated_at) VALUES ('7a11aea0-7dbf-4057-b13d-ec88b89aa89b', 'WHO', 'weight_for_age', 'male', 5, 5.6000, 5.8000, 6.0000, 6.1000, 6.3000, 6.6000, 6.9000, 7.1000, 7.3000, 7.6000, 7.8000, 0.500000, 6.600000, 0.150000, NULL, 'WHO 2006', '2025-08-05 00:51:17.101454', '2025-08-05 00:51:17.101454');
INSERT INTO public.growth_references (id, source, metric_type, gender, age_months, p3, p5, p10, p15, p25, p50, p75, p85, p90, p95, p97, l_lambda, m_mu, s_sigma, notes, version, created_at, updated_at) VALUES ('fe077693-c8a9-407f-99d9-36167d0a701a', 'WHO', 'weight_for_age', 'male', 6, 6.1000, 6.3000, 6.5000, 6.6000, 6.8000, 7.1000, 7.4000, 7.6000, 7.8000, 8.1000, 8.3000, 0.500000, 7.100000, 0.150000, NULL, 'WHO 2006', '2025-08-05 00:51:17.101454', '2025-08-05 00:51:17.101454');


--
-- Data for Name: meal_items; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: meals; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: messages; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: migrations; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.migrations (id, "timestamp", name) VALUES (1, 1704073200000, 'AddPathologicalRestrictionsToDietPlans1704073200000');
INSERT INTO public.migrations (id, "timestamp", name) VALUES (2, 1704073300000, 'AddMealDataToDietPlans1704073300000');
INSERT INTO public.migrations (id, "timestamp", name) VALUES (3, 1704073400000, 'AddNutritionalGoalsToDietPlans1704073400000');
INSERT INTO public.migrations (id, "timestamp", name) VALUES (4, 1704073500000, 'AddGoogleOAuthFields1704073500000');
INSERT INTO public.migrations (id, "timestamp", name) VALUES (5, 1704073500000, 'AddPediatricFieldsToPatientProfiles1704073500000');
INSERT INTO public.migrations (id, "timestamp", name) VALUES (6, 1704073500000, 'AddMonetizationTiers1704073500000');
INSERT INTO public.migrations (id, "timestamp", name) VALUES (7, 1704073500000, 'AddMobileFieldsToNutritionistProfiles1704073500000');
INSERT INTO public.migrations (id, "timestamp", name) VALUES (8, 1704073500000, 'AddExpedienteEvolutivo1704073500000');
INSERT INTO public.migrations (id, "timestamp", name) VALUES (9, 1704073500000, 'AddEliminationReasonToPatientNutritionistRelation1704073500000');
INSERT INTO public.migrations (id, "timestamp", name) VALUES (10, 1704073600000, 'AddGoogleCalendarToAppointments1704073600000');
INSERT INTO public.migrations (id, "timestamp", name) VALUES (11, 1704073700000, 'AddGoogleCalendarToAppointments1704073700000');
INSERT INTO public.migrations (id, "timestamp", name) VALUES (12, 1735884600000, 'AddNutritionistReviewsAndSocialMedia1735884600000');
INSERT INTO public.migrations (id, "timestamp", name) VALUES (13, 1751944800000, 'CreateRecipeTables1751944800000');
INSERT INTO public.migrations (id, "timestamp", name) VALUES (14, 1751945000000, 'AddCustomNutritionFieldsToRecipeIngredients1751945000000');
INSERT INTO public.migrations (id, "timestamp", name) VALUES (15, 1751946000000, 'AddBaseRecipeFields1751946000000');
INSERT INTO public.migrations (id, "timestamp", name) VALUES (16, 1751967602000, 'AddFieldsToMeals1751967602000');
INSERT INTO public.migrations (id, "timestamp", name) VALUES (17, 1751978000000, 'OptimizeTemplateIndices1751978000000');
INSERT INTO public.migrations (id, "timestamp", name) VALUES (18, 1752000000000, 'AddNutritionistValidationFields1752000000000');
INSERT INTO public.migrations (id, "timestamp", name) VALUES (19, 1754000000000, 'AddMissingClinicalRecordColumns1754000000000');
INSERT INTO public.migrations (id, "timestamp", name) VALUES (20, 1754001000000, 'AddMissingNutritionistValidationFields1754001000000');
INSERT INTO public.migrations (id, "timestamp", name) VALUES (21, 1754002000000, 'AddMissingSocialMediaColumns1754002000000');
INSERT INTO public.migrations (id, "timestamp", name) VALUES (22, 1704073600000, 'AddGoogleOAuthFields1704073600000');


--
-- Data for Name: nutritionist_availabilities; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.nutritionist_availabilities (id, day_of_week, start_time_minutes, end_time_minutes, is_active, created_at, updated_at, nutritionist_user_id) VALUES ('51aa6d12-da04-44d7-8740-875715f40cd1', 'MONDAY', 540, 1020, true, '2025-07-09 07:30:49.436049-07', '2025-07-09 07:30:49.436049-07', '741a971b-b0de-4ead-a030-0f5b906adac3');
INSERT INTO public.nutritionist_availabilities (id, day_of_week, start_time_minutes, end_time_minutes, is_active, created_at, updated_at, nutritionist_user_id) VALUES ('c997970d-31fc-4f9c-aa92-9a2fd2467a60', 'TUESDAY', 540, 1020, true, '2025-07-09 07:30:49.436049-07', '2025-07-09 07:30:49.436049-07', '741a971b-b0de-4ead-a030-0f5b906adac3');
INSERT INTO public.nutritionist_availabilities (id, day_of_week, start_time_minutes, end_time_minutes, is_active, created_at, updated_at, nutritionist_user_id) VALUES ('c15aea03-0d0b-4619-9b66-974fcf8e04fb', 'WEDNESDAY', 540, 1020, true, '2025-07-09 07:30:49.436049-07', '2025-07-09 07:30:49.436049-07', '741a971b-b0de-4ead-a030-0f5b906adac3');
INSERT INTO public.nutritionist_availabilities (id, day_of_week, start_time_minutes, end_time_minutes, is_active, created_at, updated_at, nutritionist_user_id) VALUES ('4aa65817-d382-41fa-9392-c25d773ca12e', 'THURSDAY', 540, 1020, true, '2025-07-09 07:30:49.436049-07', '2025-07-09 07:30:49.436049-07', '741a971b-b0de-4ead-a030-0f5b906adac3');


--
-- Data for Name: nutritionist_profiles; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.nutritionist_profiles (id, license_number, license_issuing_authority, specialties, years_of_experience, education, certifications, areas_of_interest, treatment_approach, languages, consultation_fee, bio, office_hours, is_verified, created_at, updated_at, user_id, professional_summary, offers_in_person, offers_online, clinic_name, clinic_address, clinic_city, clinic_state, clinic_zip_code, clinic_country, latitude, longitude, clinic_notes, clinic_phone, is_available) VALUES ('5e20e147-ce16-462a-9556-1f696579f722', 'NUT-12345', NULL, '{"Nutrición Oncológica","Terapia Nutricional"}', 8, '{"Licenciatura en Nutrición"}', '{"Certificación en Nutrición Clínica"}', NULL, NULL, '{Español,Inglés}', 1600.00, 'Especialista en nutrición oncológica con 7 años de experiencia.', NULL, true, '2025-06-25 21:03:50.783468-07', '2025-06-25 21:03:50.783468-07', 'be25e00f-00e5-4f0a-818b-6ae18a69edb0', NULL, true, true, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, true);
INSERT INTO public.nutritionist_profiles (id, license_number, license_issuing_authority, specialties, years_of_experience, education, certifications, areas_of_interest, treatment_approach, languages, consultation_fee, bio, office_hours, is_verified, created_at, updated_at, user_id, professional_summary, offers_in_person, offers_online, clinic_name, clinic_address, clinic_city, clinic_state, clinic_zip_code, clinic_country, latitude, longitude, clinic_notes, clinic_phone, is_available) VALUES ('83d4de98-f69b-40a3-a837-20ca3a261479', 'NUT-12346', NULL, '{"Nutrición Geriátrica","Enfermedades Metabólicas"}', 8, '{"Licenciatura en Nutrición"}', '{"Certificación en Nutrición Clínica"}', NULL, NULL, '{Español,Inglés}', 1400.00, 'Especialista en nutrición geriátrica con 12 años de experiencia.', NULL, true, '2025-06-25 21:03:50.808254-07', '2025-06-25 21:03:50.808254-07', '8ba19dfc-cd0b-4b02-bb72-05ef76ef2415', NULL, true, true, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, true);
INSERT INTO public.nutritionist_profiles (id, license_number, license_issuing_authority, specialties, years_of_experience, education, certifications, areas_of_interest, treatment_approach, languages, consultation_fee, bio, office_hours, is_verified, created_at, updated_at, user_id, professional_summary, offers_in_person, offers_online, clinic_name, clinic_address, clinic_city, clinic_state, clinic_zip_code, clinic_country, latitude, longitude, clinic_notes, clinic_phone, is_available) VALUES ('55daf6df-83b1-4361-90e1-ed7f2606d5d0', 'NUT-12347', NULL, '{"Nutrición Infantil","Trastornos Alimentarios"}', 8, '{"Licenciatura en Nutrición"}', '{"Certificación en Nutrición Clínica"}', NULL, NULL, '{Español,Inglés}', 1300.00, 'Especialista en nutrición infantil con 5 años de experiencia.', NULL, true, '2025-06-25 21:03:50.825778-07', '2025-06-25 21:03:50.825778-07', '72623ff5-3bb7-47c8-bc32-83ed85d1f99d', NULL, true, true, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, true);
INSERT INTO public.nutritionist_profiles (id, license_number, license_issuing_authority, specialties, years_of_experience, education, certifications, areas_of_interest, treatment_approach, languages, consultation_fee, bio, office_hours, is_verified, created_at, updated_at, user_id, professional_summary, offers_in_person, offers_online, clinic_name, clinic_address, clinic_city, clinic_state, clinic_zip_code, clinic_country, latitude, longitude, clinic_notes, clinic_phone, is_available) VALUES ('2db9c702-8088-45aa-8422-534db546f6d1', NULL, NULL, '{"Nutrición Clínica"}', 5, '{"Doctora en Nutrición Clínica, Universidad Nacional"}', '{"Especialista en Diabetes","Certificación en Obesidad Mórbida"}', NULL, NULL, NULL, 1200.00, 'Especialista en Nutrición Clínica con amplia experiencia en Diabetes y Obesidad.', NULL, true, '2025-06-26 02:41:16.974-07', '2025-06-26 02:41:16.974-07', '79e3bb0e-eb72-4eb5-8ebf-ee4e390b4aec', NULL, true, true, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, true);
INSERT INTO public.nutritionist_profiles (id, license_number, license_issuing_authority, specialties, years_of_experience, education, certifications, areas_of_interest, treatment_approach, languages, consultation_fee, bio, office_hours, is_verified, created_at, updated_at, user_id, professional_summary, offers_in_person, offers_online, clinic_name, clinic_address, clinic_city, clinic_state, clinic_zip_code, clinic_country, latitude, longitude, clinic_notes, clinic_phone, is_available) VALUES ('462009e4-3784-4926-b18c-648532340fb2', NULL, NULL, '{"Nutrición Deportiva"}', 5, '{"Maestro en Nutrición Deportiva, Instituto de Ciencias del Deporte"}', '{"Especialista en Nutrición Deportiva","Certificación NSCA"}', NULL, NULL, NULL, 1500.00, 'Especialista en Nutrición Deportiva con amplia experiencia en Rendimiento Atlético y Recuperación.', NULL, true, '2025-06-26 02:41:17.03-07', '2025-06-26 02:41:17.03-07', '741a971b-b0de-4ead-a030-0f5b906adac3', NULL, true, true, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, true);
INSERT INTO public.nutritionist_profiles (id, license_number, license_issuing_authority, specialties, years_of_experience, education, certifications, areas_of_interest, treatment_approach, languages, consultation_fee, bio, office_hours, is_verified, created_at, updated_at, user_id, professional_summary, offers_in_person, offers_online, clinic_name, clinic_address, clinic_city, clinic_state, clinic_zip_code, clinic_country, latitude, longitude, clinic_notes, clinic_phone, is_available) VALUES ('e8dcf1d7-3e9b-4904-a397-a66885b48fb1', NULL, NULL, '{"Nutrición Pediátrica"}', 5, '{"Doctora en Pediatría con Especialidad en Nutrición"}', '{"Especialista en Nutrición Pediátrica","Certificación Internacional"}', NULL, NULL, NULL, 1300.00, 'Especialista en Nutrición Pediátrica con amplia experiencia en Nutrición en Niños y Adolescentes.', NULL, true, '2025-06-26 02:41:17.079-07', '2025-06-26 02:41:17.079-07', '16061724-6bbd-48eb-ae2a-c23b29dcdad8', NULL, true, true, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, true);
INSERT INTO public.nutritionist_profiles (id, license_number, license_issuing_authority, specialties, years_of_experience, education, certifications, areas_of_interest, treatment_approach, languages, consultation_fee, bio, office_hours, is_verified, created_at, updated_at, user_id, professional_summary, offers_in_person, offers_online, clinic_name, clinic_address, clinic_city, clinic_state, clinic_zip_code, clinic_country, latitude, longitude, clinic_notes, clinic_phone, is_available) VALUES ('ecc511f1-65e1-430f-a368-193916d1e068', 'SYS-00001', NULL, '{"Nutrición Clínica","Nutrición General","Control de Peso"}', 10, '{"Sistema de Nutrición - Administrador por Defecto"}', '{"Certificación Administrador Sistema"}', NULL, NULL, '{Español}', 0.00, 'Nutriólogo administrador por defecto del sistema. Puedes cambiar estos datos desde tu perfil.', NULL, true, '2025-07-02 23:25:25.201453-07', '2025-07-02 23:25:25.201453-07', '6f275f3f-63b4-41c8-b8eb-346af391c921', NULL, true, true, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, true);


--
-- Data for Name: nutritionist_tiers; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.nutritionist_tiers (id, name, description, tier_type, payment_model, commission_rate, subscription_price, annual_price, max_active_patients, includes_ai_meal_planning, includes_advanced_management, includes_priority_support, is_active, created_at, updated_at) VALUES ('7c9c5357-5e98-42ab-810c-0f39680e2ba4', 'Nutriólogo Básico', 'Acceso a un paciente activo con comisión del 20% por consulta', 'basic', 'commission', 20.00, NULL, NULL, 1, false, false, false, true, '2025-07-08 23:49:26.884242-07', '2025-07-08 23:49:26.884242-07');
INSERT INTO public.nutritionist_tiers (id, name, description, tier_type, payment_model, commission_rate, subscription_price, annual_price, max_active_patients, includes_ai_meal_planning, includes_advanced_management, includes_priority_support, is_active, created_at, updated_at) VALUES ('3c215896-1c57-416d-9ae5-7cb995e7d05a', 'Nutriólogo Premium', 'Acceso ilimitado a pacientes con herramientas avanzadas de IA', 'premium', 'subscription', NULL, 299.99, 2999.99, -1, true, true, true, true, '2025-07-08 23:49:26.936061-07', '2025-07-08 23:49:26.936061-07');


--
-- Data for Name: patient_nutritionist_relations; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.patient_nutritionist_relations (id, status, notes, requested_at, accepted_at, ended_at, updated_at, patient_user_id, nutritionist_user_id, elimination_reason) VALUES ('95a2fcfe-27fd-4a26-be3c-cfcffc6c6497', 'inactive', 'Paciente registrado directamente por el nutricionista con expediente completo
--- RELACIÓN TERMINADA ---
Terminada por el nutriólogo el 26/6/2025, 7:22:48 a.m.. Motivo: Removido por el nutriólogo', '2025-06-26 02:42:52.137-07', '2025-06-26 02:42:52.137-07', '2025-06-26 07:22:48.43-07', '2025-06-26 07:22:48.691868-07', 'dc77923e-3df2-4d1d-95dc-c33efa0884a8', '79e3bb0e-eb72-4eb5-8ebf-ee4e390b4aec', NULL);
INSERT INTO public.patient_nutritionist_relations (id, status, notes, requested_at, accepted_at, ended_at, updated_at, patient_user_id, nutritionist_user_id, elimination_reason) VALUES ('258267bb-89b8-4983-a45d-020e30aa09f7', 'inactive', 'Paciente registrado directamente por el nutricionista con expediente completo
--- RELACIÓN TERMINADA ---
Terminada por el nutriólogo el 26/6/2025, 7:43:24 a.m.. Motivo: Removido por el nutriólogo', '2025-06-26 07:24:43.827-07', '2025-06-26 07:24:43.827-07', '2025-06-26 07:43:24.102-07', '2025-06-26 07:43:24.12338-07', '2ce0f60e-2433-49db-a2d9-ad57eae18a67', '741a971b-b0de-4ead-a030-0f5b906adac3', NULL);
INSERT INTO public.patient_nutritionist_relations (id, status, notes, requested_at, accepted_at, ended_at, updated_at, patient_user_id, nutritionist_user_id, elimination_reason) VALUES ('97de2857-ac42-43dd-9186-ecddf270082c', 'active', 'Paciente registrado directamente por el nutricionista con expediente completo', '2025-06-26 18:52:04.889-07', '2025-06-26 18:52:04.889-07', NULL, '2025-06-26 18:52:04.898496-07', 'edee0e5f-8cc0-4870-bc19-b423df2e0829', '16061724-6bbd-48eb-ae2a-c23b29dcdad8', NULL);
INSERT INTO public.patient_nutritionist_relations (id, status, notes, requested_at, accepted_at, ended_at, updated_at, patient_user_id, nutritionist_user_id, elimination_reason) VALUES ('21792ed0-15f5-4435-b953-60822a38948d', 'active', 'Paciente registrado directamente por el nutricionista con expediente completo', '2025-06-27 09:43:31.729-07', '2025-06-27 09:43:31.729-07', NULL, '2025-06-27 09:43:31.739534-07', '3209877c-350e-4a2d-a620-dffd4675aaef', '741a971b-b0de-4ead-a030-0f5b906adac3', NULL);
INSERT INTO public.patient_nutritionist_relations (id, status, notes, requested_at, accepted_at, ended_at, updated_at, patient_user_id, nutritionist_user_id, elimination_reason) VALUES ('6d177b6a-dc31-4697-bf83-0ae4e6a1e6f2', 'active', 'Paciente registrado directamente por el nutricionista con expediente completo', '2025-07-09 07:34:59.737-07', '2025-07-09 07:34:59.737-07', NULL, '2025-07-09 07:34:59.809886-07', 'c82a1e56-e7bd-44fb-87a5-5a81f4b4afd1', '741a971b-b0de-4ead-a030-0f5b906adac3', NULL);
INSERT INTO public.patient_nutritionist_relations (id, status, notes, requested_at, accepted_at, ended_at, updated_at, patient_user_id, nutritionist_user_id, elimination_reason) VALUES ('023de7e2-2b0e-4d94-89c9-bdd8307310da', 'active', 'Paciente registrado directamente por el nutricionista con expediente completo', '2025-08-05 00:54:13.062-07', '2025-08-05 00:54:13.062-07', NULL, '2025-08-05 00:54:13.065634-07', 'b98afb1f-64ab-416e-8e73-7fb2459fd098', '741a971b-b0de-4ead-a030-0f5b906adac3', NULL);


--
-- Data for Name: patient_profiles; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.patient_profiles (id, current_weight, height, activity_level, consultation_reason, medical_conditions, allergies, medications, diagnosed_diseases, diagnosed_since, important_diseases_history, current_treatments, surgeries_history, current_symptoms, family_history, does_exercise, exercise_type, exercise_frequency, exercise_duration, exercise_since, alcohol_consumption, tobacco_consumption, coffee_consumption, general_appearance, knows_blood_pressure, usual_blood_pressure, biochemical_indicators, previous_nutritional_guidance, previous_guidance_when, guidance_adherence_level, guidance_adherence_reason, who_prepares_food, eats_home_or_out, diet_modified_last_6_months, diet_modification_reason, hungriest_time, preferred_foods, disliked_foods, food_intolerances, takes_supplements, supplements_details, daily_water_glasses, daily_schedule, food_frequency, goals, intolerances, clinical_notes, pregnancy_status, dietary_preferences, food_preferences, monthly_budget, meal_schedule, preferences, weight_history, measurements, photos, clinical_studies_docs, created_at, updated_at, user_id, is_pediatric_patient, caregiver_info, birth_history, feeding_history, developmental_milestones, pediatric_growth_history, school_social_info, vaccination_status, pediatric_habits, pediatric_measurements, pediatric_medical_history, pediatric_nutrition_assessment) VALUES ('e94e96b9-6b1d-4ed4-965d-398a8a4bb356', 70.00, 162.00, 'moderate', NULL, '{}', '{}', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '{}', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-06-25 21:03:50.843889-07', '2025-06-25 21:03:50.843889-07', 'f6cd79a1-ee32-4742-93c8-da29a8150503', false, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO public.patient_profiles (id, current_weight, height, activity_level, consultation_reason, medical_conditions, allergies, medications, diagnosed_diseases, diagnosed_since, important_diseases_history, current_treatments, surgeries_history, current_symptoms, family_history, does_exercise, exercise_type, exercise_frequency, exercise_duration, exercise_since, alcohol_consumption, tobacco_consumption, coffee_consumption, general_appearance, knows_blood_pressure, usual_blood_pressure, biochemical_indicators, previous_nutritional_guidance, previous_guidance_when, guidance_adherence_level, guidance_adherence_reason, who_prepares_food, eats_home_or_out, diet_modified_last_6_months, diet_modification_reason, hungriest_time, preferred_foods, disliked_foods, food_intolerances, takes_supplements, supplements_details, daily_water_glasses, daily_schedule, food_frequency, goals, intolerances, clinical_notes, pregnancy_status, dietary_preferences, food_preferences, monthly_budget, meal_schedule, preferences, weight_history, measurements, photos, clinical_studies_docs, created_at, updated_at, user_id, is_pediatric_patient, caregiver_info, birth_history, feeding_history, developmental_milestones, pediatric_growth_history, school_social_info, vaccination_status, pediatric_habits, pediatric_measurements, pediatric_medical_history, pediatric_nutrition_assessment) VALUES ('7d1f7ba0-4450-45a2-a2d8-de742f04531d', 88.00, 175.00, 'moderate', NULL, '{}', '{}', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '{}', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-06-25 21:03:50.865305-07', '2025-06-25 21:03:50.865305-07', '9b0380c5-a7ea-4d93-bc21-f25f651be3f2', false, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO public.patient_profiles (id, current_weight, height, activity_level, consultation_reason, medical_conditions, allergies, medications, diagnosed_diseases, diagnosed_since, important_diseases_history, current_treatments, surgeries_history, current_symptoms, family_history, does_exercise, exercise_type, exercise_frequency, exercise_duration, exercise_since, alcohol_consumption, tobacco_consumption, coffee_consumption, general_appearance, knows_blood_pressure, usual_blood_pressure, biochemical_indicators, previous_nutritional_guidance, previous_guidance_when, guidance_adherence_level, guidance_adherence_reason, who_prepares_food, eats_home_or_out, diet_modified_last_6_months, diet_modification_reason, hungriest_time, preferred_foods, disliked_foods, food_intolerances, takes_supplements, supplements_details, daily_water_glasses, daily_schedule, food_frequency, goals, intolerances, clinical_notes, pregnancy_status, dietary_preferences, food_preferences, monthly_budget, meal_schedule, preferences, weight_history, measurements, photos, clinical_studies_docs, created_at, updated_at, user_id, is_pediatric_patient, caregiver_info, birth_history, feeding_history, developmental_milestones, pediatric_growth_history, school_social_info, vaccination_status, pediatric_habits, pediatric_measurements, pediatric_medical_history, pediatric_nutrition_assessment) VALUES ('d04cc18e-7f44-40d0-8f47-4174d1e1dd0d', 52.00, 165.00, 'moderate', NULL, '{}', '{}', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '{}', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-06-25 21:03:50.887272-07', '2025-06-25 21:03:50.887272-07', 'd2325df6-af9e-4851-b63a-a9bb5817a5bf', false, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO public.patient_profiles (id, current_weight, height, activity_level, consultation_reason, medical_conditions, allergies, medications, diagnosed_diseases, diagnosed_since, important_diseases_history, current_treatments, surgeries_history, current_symptoms, family_history, does_exercise, exercise_type, exercise_frequency, exercise_duration, exercise_since, alcohol_consumption, tobacco_consumption, coffee_consumption, general_appearance, knows_blood_pressure, usual_blood_pressure, biochemical_indicators, previous_nutritional_guidance, previous_guidance_when, guidance_adherence_level, guidance_adherence_reason, who_prepares_food, eats_home_or_out, diet_modified_last_6_months, diet_modification_reason, hungriest_time, preferred_foods, disliked_foods, food_intolerances, takes_supplements, supplements_details, daily_water_glasses, daily_schedule, food_frequency, goals, intolerances, clinical_notes, pregnancy_status, dietary_preferences, food_preferences, monthly_budget, meal_schedule, preferences, weight_history, measurements, photos, clinical_studies_docs, created_at, updated_at, user_id, is_pediatric_patient, caregiver_info, birth_history, feeding_history, developmental_milestones, pediatric_growth_history, school_social_info, vaccination_status, pediatric_habits, pediatric_measurements, pediatric_medical_history, pediatric_nutrition_assessment) VALUES ('7c70d109-08c3-458b-a2d2-8bbf28b18e6e', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-06-26 02:42:52.122871-07', '2025-06-26 02:42:52.122871-07', 'dc77923e-3df2-4d1d-95dc-c33efa0884a8', false, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO public.patient_profiles (id, current_weight, height, activity_level, consultation_reason, medical_conditions, allergies, medications, diagnosed_diseases, diagnosed_since, important_diseases_history, current_treatments, surgeries_history, current_symptoms, family_history, does_exercise, exercise_type, exercise_frequency, exercise_duration, exercise_since, alcohol_consumption, tobacco_consumption, coffee_consumption, general_appearance, knows_blood_pressure, usual_blood_pressure, biochemical_indicators, previous_nutritional_guidance, previous_guidance_when, guidance_adherence_level, guidance_adherence_reason, who_prepares_food, eats_home_or_out, diet_modified_last_6_months, diet_modification_reason, hungriest_time, preferred_foods, disliked_foods, food_intolerances, takes_supplements, supplements_details, daily_water_glasses, daily_schedule, food_frequency, goals, intolerances, clinical_notes, pregnancy_status, dietary_preferences, food_preferences, monthly_budget, meal_schedule, preferences, weight_history, measurements, photos, clinical_studies_docs, created_at, updated_at, user_id, is_pediatric_patient, caregiver_info, birth_history, feeding_history, developmental_milestones, pediatric_growth_history, school_social_info, vaccination_status, pediatric_habits, pediatric_measurements, pediatric_medical_history, pediatric_nutrition_assessment) VALUES ('24b3257c-b20a-4dbe-a0a4-f9892a0fb5e5', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-06-26 07:24:43.808292-07', '2025-06-26 07:24:43.808292-07', '2ce0f60e-2433-49db-a2d9-ad57eae18a67', false, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO public.patient_profiles (id, current_weight, height, activity_level, consultation_reason, medical_conditions, allergies, medications, diagnosed_diseases, diagnosed_since, important_diseases_history, current_treatments, surgeries_history, current_symptoms, family_history, does_exercise, exercise_type, exercise_frequency, exercise_duration, exercise_since, alcohol_consumption, tobacco_consumption, coffee_consumption, general_appearance, knows_blood_pressure, usual_blood_pressure, biochemical_indicators, previous_nutritional_guidance, previous_guidance_when, guidance_adherence_level, guidance_adherence_reason, who_prepares_food, eats_home_or_out, diet_modified_last_6_months, diet_modification_reason, hungriest_time, preferred_foods, disliked_foods, food_intolerances, takes_supplements, supplements_details, daily_water_glasses, daily_schedule, food_frequency, goals, intolerances, clinical_notes, pregnancy_status, dietary_preferences, food_preferences, monthly_budget, meal_schedule, preferences, weight_history, measurements, photos, clinical_studies_docs, created_at, updated_at, user_id, is_pediatric_patient, caregiver_info, birth_history, feeding_history, developmental_milestones, pediatric_growth_history, school_social_info, vaccination_status, pediatric_habits, pediatric_measurements, pediatric_medical_history, pediatric_nutrition_assessment) VALUES ('f617b5a3-8d2b-4465-942d-552185c7e19e', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-06-26 18:52:04.841124-07', '2025-06-26 18:52:04.841124-07', 'edee0e5f-8cc0-4870-bc19-b423df2e0829', false, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO public.patient_profiles (id, current_weight, height, activity_level, consultation_reason, medical_conditions, allergies, medications, diagnosed_diseases, diagnosed_since, important_diseases_history, current_treatments, surgeries_history, current_symptoms, family_history, does_exercise, exercise_type, exercise_frequency, exercise_duration, exercise_since, alcohol_consumption, tobacco_consumption, coffee_consumption, general_appearance, knows_blood_pressure, usual_blood_pressure, biochemical_indicators, previous_nutritional_guidance, previous_guidance_when, guidance_adherence_level, guidance_adherence_reason, who_prepares_food, eats_home_or_out, diet_modified_last_6_months, diet_modification_reason, hungriest_time, preferred_foods, disliked_foods, food_intolerances, takes_supplements, supplements_details, daily_water_glasses, daily_schedule, food_frequency, goals, intolerances, clinical_notes, pregnancy_status, dietary_preferences, food_preferences, monthly_budget, meal_schedule, preferences, weight_history, measurements, photos, clinical_studies_docs, created_at, updated_at, user_id, is_pediatric_patient, caregiver_info, birth_history, feeding_history, developmental_milestones, pediatric_growth_history, school_social_info, vaccination_status, pediatric_habits, pediatric_measurements, pediatric_medical_history, pediatric_nutrition_assessment) VALUES ('4d221605-53e9-45a4-857e-1b2aacb0b7eb', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-06-27 09:43:31.692217-07', '2025-06-27 09:43:31.692217-07', '3209877c-350e-4a2d-a620-dffd4675aaef', false, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO public.patient_profiles (id, current_weight, height, activity_level, consultation_reason, medical_conditions, allergies, medications, diagnosed_diseases, diagnosed_since, important_diseases_history, current_treatments, surgeries_history, current_symptoms, family_history, does_exercise, exercise_type, exercise_frequency, exercise_duration, exercise_since, alcohol_consumption, tobacco_consumption, coffee_consumption, general_appearance, knows_blood_pressure, usual_blood_pressure, biochemical_indicators, previous_nutritional_guidance, previous_guidance_when, guidance_adherence_level, guidance_adherence_reason, who_prepares_food, eats_home_or_out, diet_modified_last_6_months, diet_modification_reason, hungriest_time, preferred_foods, disliked_foods, food_intolerances, takes_supplements, supplements_details, daily_water_glasses, daily_schedule, food_frequency, goals, intolerances, clinical_notes, pregnancy_status, dietary_preferences, food_preferences, monthly_budget, meal_schedule, preferences, weight_history, measurements, photos, clinical_studies_docs, created_at, updated_at, user_id, is_pediatric_patient, caregiver_info, birth_history, feeding_history, developmental_milestones, pediatric_growth_history, school_social_info, vaccination_status, pediatric_habits, pediatric_measurements, pediatric_medical_history, pediatric_nutrition_assessment) VALUES ('d96d80c9-b678-497a-b431-eb2c08773b3b', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-07-09 07:34:59.648503-07', '2025-07-09 07:34:59.648503-07', 'c82a1e56-e7bd-44fb-87a5-5a81f4b4afd1', false, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO public.patient_profiles (id, current_weight, height, activity_level, consultation_reason, medical_conditions, allergies, medications, diagnosed_diseases, diagnosed_since, important_diseases_history, current_treatments, surgeries_history, current_symptoms, family_history, does_exercise, exercise_type, exercise_frequency, exercise_duration, exercise_since, alcohol_consumption, tobacco_consumption, coffee_consumption, general_appearance, knows_blood_pressure, usual_blood_pressure, biochemical_indicators, previous_nutritional_guidance, previous_guidance_when, guidance_adherence_level, guidance_adherence_reason, who_prepares_food, eats_home_or_out, diet_modified_last_6_months, diet_modification_reason, hungriest_time, preferred_foods, disliked_foods, food_intolerances, takes_supplements, supplements_details, daily_water_glasses, daily_schedule, food_frequency, goals, intolerances, clinical_notes, pregnancy_status, dietary_preferences, food_preferences, monthly_budget, meal_schedule, preferences, weight_history, measurements, photos, clinical_studies_docs, created_at, updated_at, user_id, is_pediatric_patient, caregiver_info, birth_history, feeding_history, developmental_milestones, pediatric_growth_history, school_social_info, vaccination_status, pediatric_habits, pediatric_measurements, pediatric_medical_history, pediatric_nutrition_assessment) VALUES ('17bd9699-bb10-415a-a055-2fab0487cb6a', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-08-05 00:54:13.040577-07', '2025-08-05 00:54:13.040577-07', 'b98afb1f-64ab-416e-8e73-7fb2459fd098', true, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL);


--
-- Data for Name: patient_progress_logs; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.patient_progress_logs (id, date, weight, body_fat_percentage, muscle_mass_percentage, measurements, notes, photos, adherence_to_plan, feeling_level, created_at, updated_at, patient_user_id) VALUES ('00eb0742-fcc4-4cc9-94de-c4a221f5465f', '2025-07-01', 512.00, NULL, NULL, '{"bmi": 158.02469135802468, "waist": 200}', 'Se requiere mejorar adherencia al plan nutricional', NULL, 10.00, 3, '2025-08-05 00:42:44.012439-07', '2025-08-05 00:42:44.012439-07', '3209877c-350e-4a2d-a620-dffd4675aaef');


--
-- Data for Name: patient_tiers; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.patient_tiers (id, name, description, tier_type, payment_model, one_time_price, monthly_price, annual_price, shows_ads, includes_ai_food_scanning, includes_barcode_scanning, includes_smart_shopping_list, includes_advanced_tracking, includes_device_integration, is_active, created_at, updated_at) VALUES ('986bd44a-0ead-4d3e-a54d-9e49c937dafd', 'Paciente Gratuito', 'Acceso básico con anuncios publicitarios', 'free', 'free', NULL, NULL, NULL, true, false, false, false, false, false, true, '2025-07-08 23:49:26.955486-07', '2025-07-08 23:49:26.955486-07');
INSERT INTO public.patient_tiers (id, name, description, tier_type, payment_model, one_time_price, monthly_price, annual_price, shows_ads, includes_ai_food_scanning, includes_barcode_scanning, includes_smart_shopping_list, includes_advanced_tracking, includes_device_integration, is_active, created_at, updated_at) VALUES ('c029348b-50c6-4e2d-8852-6c26b5115e38', 'Paciente Pro', 'Sin anuncios por pago único de $40 MXN', 'pro', 'one_time', 40.00, NULL, NULL, false, false, false, false, false, false, true, '2025-07-08 23:49:26.978638-07', '2025-07-08 23:49:26.978638-07');
INSERT INTO public.patient_tiers (id, name, description, tier_type, payment_model, one_time_price, monthly_price, annual_price, shows_ads, includes_ai_food_scanning, includes_barcode_scanning, includes_smart_shopping_list, includes_advanced_tracking, includes_device_integration, is_active, created_at, updated_at) VALUES ('6ea6ad0d-c616-4917-878b-e9b47acc9c0f', 'Paciente Premium', 'Herramientas avanzadas de IA y seguimiento', 'premium', 'subscription', NULL, 99.99, 999.99, false, true, true, true, true, true, true, '2025-07-08 23:49:27.014968-07', '2025-07-08 23:49:27.014968-07');


--
-- Data for Name: payment_transactions; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: recipe_ingredients; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: recipes; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: roles; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.roles (id, name) VALUES (1, 'nutritionist');
INSERT INTO public.roles (id, name) VALUES (2, 'patient');
INSERT INTO public.roles (id, name) VALUES (3, 'admin');


--
-- Data for Name: subscription_plans; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: template_foods; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: template_meals; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: template_recipes; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: user_subscriptions; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.users (id, email, password_hash, first_name, last_name, phone, birth_date, age, gender, is_active, registration_type, has_temporary_password, temporary_password_expires_at, requires_initial_setup, created_by_nutritionist_id, created_at, updated_at, "passwordChangedAt", role_id, profile_image, google_id, google_email, google_access_token, google_refresh_token, google_token_expires_at, google_calendar_id, google_calendar_sync_enabled, google_calendar_last_sync, auth_provider, nutritionist_tier_id, patient_tier_id) VALUES ('be25e00f-00e5-4f0a-818b-6ae18a69edb0', 'dra.ana.martinez@nutri.com', '$2b$12$RInWLvx0PBSOfMjjPIIzb.XPIltDEnmpG5MMBZciya/6n75tp5Y0a', 'Dra. Ana', 'Martínez Sánchez', NULL, NULL, 35, 'female', true, 'online', false, NULL, false, NULL, '2025-06-25 21:03:50.758557-07', '2025-06-25 21:03:50.758557-07', NULL, 1, NULL, NULL, NULL, NULL, NULL, NULL, NULL, false, NULL, 'local', NULL, NULL);
INSERT INTO public.users (id, email, password_hash, first_name, last_name, phone, birth_date, age, gender, is_active, registration_type, has_temporary_password, temporary_password_expires_at, requires_initial_setup, created_by_nutritionist_id, created_at, updated_at, "passwordChangedAt", role_id, profile_image, google_id, google_email, google_access_token, google_refresh_token, google_token_expires_at, google_calendar_id, google_calendar_sync_enabled, google_calendar_last_sync, auth_provider, nutritionist_tier_id, patient_tier_id) VALUES ('8ba19dfc-cd0b-4b02-bb72-05ef76ef2415', 'dr.carlos.lopez@nutri.com', '$2b$12$RInWLvx0PBSOfMjjPIIzb.XPIltDEnmpG5MMBZciya/6n75tp5Y0a', 'Dr. Carlos', 'López Herrera', NULL, NULL, 35, 'female', true, 'online', false, NULL, false, NULL, '2025-06-25 21:03:50.802405-07', '2025-06-25 21:03:50.802405-07', NULL, 1, NULL, NULL, NULL, NULL, NULL, NULL, NULL, false, NULL, 'local', NULL, NULL);
INSERT INTO public.users (id, email, password_hash, first_name, last_name, phone, birth_date, age, gender, is_active, registration_type, has_temporary_password, temporary_password_expires_at, requires_initial_setup, created_by_nutritionist_id, created_at, updated_at, "passwordChangedAt", role_id, profile_image, google_id, google_email, google_access_token, google_refresh_token, google_token_expires_at, google_calendar_id, google_calendar_sync_enabled, google_calendar_last_sync, auth_provider, nutritionist_tier_id, patient_tier_id) VALUES ('72623ff5-3bb7-47c8-bc32-83ed85d1f99d', 'dra.patricia.torres@nutri.com', '$2b$12$RInWLvx0PBSOfMjjPIIzb.XPIltDEnmpG5MMBZciya/6n75tp5Y0a', 'Dra. Patricia', 'Torres Morales', NULL, NULL, 35, 'female', true, 'online', false, NULL, false, NULL, '2025-06-25 21:03:50.818778-07', '2025-06-25 21:03:50.818778-07', NULL, 1, NULL, NULL, NULL, NULL, NULL, NULL, NULL, false, NULL, 'local', NULL, NULL);
INSERT INTO public.users (id, email, password_hash, first_name, last_name, phone, birth_date, age, gender, is_active, registration_type, has_temporary_password, temporary_password_expires_at, requires_initial_setup, created_by_nutritionist_id, created_at, updated_at, "passwordChangedAt", role_id, profile_image, google_id, google_email, google_access_token, google_refresh_token, google_token_expires_at, google_calendar_id, google_calendar_sync_enabled, google_calendar_last_sync, auth_provider, nutritionist_tier_id, patient_tier_id) VALUES ('f6cd79a1-ee32-4742-93c8-da29a8150503', 'maria.gonzalez@test.com', '$2b$12$RInWLvx0PBSOfMjjPIIzb.XPIltDEnmpG5MMBZciya/6n75tp5Y0a', 'María', 'González López', NULL, NULL, 45, 'female', true, 'online', false, NULL, false, NULL, '2025-06-25 21:03:50.83542-07', '2025-06-25 21:03:50.83542-07', NULL, 2, NULL, NULL, NULL, NULL, NULL, NULL, NULL, false, NULL, 'local', NULL, NULL);
INSERT INTO public.users (id, email, password_hash, first_name, last_name, phone, birth_date, age, gender, is_active, registration_type, has_temporary_password, temporary_password_expires_at, requires_initial_setup, created_by_nutritionist_id, created_at, updated_at, "passwordChangedAt", role_id, profile_image, google_id, google_email, google_access_token, google_refresh_token, google_token_expires_at, google_calendar_id, google_calendar_sync_enabled, google_calendar_last_sync, auth_provider, nutritionist_tier_id, patient_tier_id) VALUES ('9b0380c5-a7ea-4d93-bc21-f25f651be3f2', 'pedro.ramirez@test.com', '$2b$12$RInWLvx0PBSOfMjjPIIzb.XPIltDEnmpG5MMBZciya/6n75tp5Y0a', 'Pedro', 'Ramírez Castro', NULL, NULL, 58, 'male', true, 'online', false, NULL, false, NULL, '2025-06-25 21:03:50.859484-07', '2025-06-25 21:03:50.859484-07', NULL, 2, NULL, NULL, NULL, NULL, NULL, NULL, NULL, false, NULL, 'local', NULL, NULL);
INSERT INTO public.users (id, email, password_hash, first_name, last_name, phone, birth_date, age, gender, is_active, registration_type, has_temporary_password, temporary_password_expires_at, requires_initial_setup, created_by_nutritionist_id, created_at, updated_at, "passwordChangedAt", role_id, profile_image, google_id, google_email, google_access_token, google_refresh_token, google_token_expires_at, google_calendar_id, google_calendar_sync_enabled, google_calendar_last_sync, auth_provider, nutritionist_tier_id, patient_tier_id) VALUES ('d2325df6-af9e-4851-b63a-a9bb5817a5bf', 'laura.jimenez@test.com', '$2b$12$RInWLvx0PBSOfMjjPIIzb.XPIltDEnmpG5MMBZciya/6n75tp5Y0a', 'Laura', 'Jiménez Ruiz', NULL, NULL, 25, 'female', true, 'online', false, NULL, false, NULL, '2025-06-25 21:03:50.876205-07', '2025-06-25 21:03:50.876205-07', NULL, 2, NULL, NULL, NULL, NULL, NULL, NULL, NULL, false, NULL, 'local', NULL, NULL);
INSERT INTO public.users (id, email, password_hash, first_name, last_name, phone, birth_date, age, gender, is_active, registration_type, has_temporary_password, temporary_password_expires_at, requires_initial_setup, created_by_nutritionist_id, created_at, updated_at, "passwordChangedAt", role_id, profile_image, google_id, google_email, google_access_token, google_refresh_token, google_token_expires_at, google_calendar_id, google_calendar_sync_enabled, google_calendar_last_sync, auth_provider, nutritionist_tier_id, patient_tier_id) VALUES ('79e3bb0e-eb72-4eb5-8ebf-ee4e390b4aec', 'dr.maria.gonzalez@demo.com', '$2b$12$y27zpqG1J3rq6CniHfWXiu4jPNptmpBdow0V.CorU4EBudwCOZusi', 'María', 'González Ruiz', NULL, NULL, NULL, NULL, true, 'online', false, NULL, false, NULL, '2025-06-26 02:41:16.912-07', '2025-06-26 02:41:16.912-07', NULL, 1, NULL, NULL, NULL, NULL, NULL, NULL, NULL, false, NULL, 'local', NULL, NULL);
INSERT INTO public.users (id, email, password_hash, first_name, last_name, phone, birth_date, age, gender, is_active, registration_type, has_temporary_password, temporary_password_expires_at, requires_initial_setup, created_by_nutritionist_id, created_at, updated_at, "passwordChangedAt", role_id, profile_image, google_id, google_email, google_access_token, google_refresh_token, google_token_expires_at, google_calendar_id, google_calendar_sync_enabled, google_calendar_last_sync, auth_provider, nutritionist_tier_id, patient_tier_id) VALUES ('741a971b-b0de-4ead-a030-0f5b906adac3', 'dr.juan.perez@demo.com', '$2b$12$y27zpqG1J3rq6CniHfWXiu4jPNptmpBdow0V.CorU4EBudwCOZusi', 'Juan', 'Pérez Morales', NULL, NULL, NULL, NULL, true, 'online', false, NULL, false, NULL, '2025-06-26 02:41:17.009-07', '2025-06-26 02:41:17.009-07', NULL, 1, NULL, NULL, NULL, NULL, NULL, NULL, NULL, false, NULL, 'local', NULL, NULL);
INSERT INTO public.users (id, email, password_hash, first_name, last_name, phone, birth_date, age, gender, is_active, registration_type, has_temporary_password, temporary_password_expires_at, requires_initial_setup, created_by_nutritionist_id, created_at, updated_at, "passwordChangedAt", role_id, profile_image, google_id, google_email, google_access_token, google_refresh_token, google_token_expires_at, google_calendar_id, google_calendar_sync_enabled, google_calendar_last_sync, auth_provider, nutritionist_tier_id, patient_tier_id) VALUES ('16061724-6bbd-48eb-ae2a-c23b29dcdad8', 'dra.carmen.rodriguez@demo.com', '$2b$12$y27zpqG1J3rq6CniHfWXiu4jPNptmpBdow0V.CorU4EBudwCOZusi', 'Carmen', 'Rodríguez López', NULL, NULL, NULL, NULL, true, 'online', false, NULL, false, NULL, '2025-06-26 02:41:17.062-07', '2025-06-26 02:41:17.062-07', NULL, 1, NULL, NULL, NULL, NULL, NULL, NULL, NULL, false, NULL, 'local', NULL, NULL);
INSERT INTO public.users (id, email, password_hash, first_name, last_name, phone, birth_date, age, gender, is_active, registration_type, has_temporary_password, temporary_password_expires_at, requires_initial_setup, created_by_nutritionist_id, created_at, updated_at, "passwordChangedAt", role_id, profile_image, google_id, google_email, google_access_token, google_refresh_token, google_token_expires_at, google_calendar_id, google_calendar_sync_enabled, google_calendar_last_sync, auth_provider, nutritionist_tier_id, patient_tier_id) VALUES ('229e5b5a-7ab0-4d14-9797-3907fc672414', 'ana.lopez@demo.com', '$2b$12$y27zpqG1J3rq6CniHfWXiu4jPNptmpBdow0V.CorU4EBudwCOZusi', 'Ana', 'López Martín', '+52 55 1234-5678', '1990-03-14', NULL, 'female', true, 'online', false, NULL, false, NULL, '2025-06-26 02:41:17.111-07', '2025-06-26 02:41:17.111-07', NULL, 2, NULL, NULL, NULL, NULL, NULL, NULL, NULL, false, NULL, 'local', NULL, NULL);
INSERT INTO public.users (id, email, password_hash, first_name, last_name, phone, birth_date, age, gender, is_active, registration_type, has_temporary_password, temporary_password_expires_at, requires_initial_setup, created_by_nutritionist_id, created_at, updated_at, "passwordChangedAt", role_id, profile_image, google_id, google_email, google_access_token, google_refresh_token, google_token_expires_at, google_calendar_id, google_calendar_sync_enabled, google_calendar_last_sync, auth_provider, nutritionist_tier_id, patient_tier_id) VALUES ('c8183afd-8ffa-4920-9ec3-819dc650066b', 'carlos.ruiz@demo.com', '$2b$12$y27zpqG1J3rq6CniHfWXiu4jPNptmpBdow0V.CorU4EBudwCOZusi', 'Carlos', 'Ruiz Hernández', '+52 55 2345-6789', '1985-07-21', NULL, 'male', true, 'online', false, NULL, false, NULL, '2025-06-26 02:41:17.135-07', '2025-06-26 02:41:17.135-07', NULL, 2, NULL, NULL, NULL, NULL, NULL, NULL, NULL, false, NULL, 'local', NULL, NULL);
INSERT INTO public.users (id, email, password_hash, first_name, last_name, phone, birth_date, age, gender, is_active, registration_type, has_temporary_password, temporary_password_expires_at, requires_initial_setup, created_by_nutritionist_id, created_at, updated_at, "passwordChangedAt", role_id, profile_image, google_id, google_email, google_access_token, google_refresh_token, google_token_expires_at, google_calendar_id, google_calendar_sync_enabled, google_calendar_last_sync, auth_provider, nutritionist_tier_id, patient_tier_id) VALUES ('bad8053e-3feb-4d4a-90c4-6b2fd9d5c533', 'sofia.martinez@demo.com', '$2b$12$y27zpqG1J3rq6CniHfWXiu4jPNptmpBdow0V.CorU4EBudwCOZusi', 'Sofía', 'Martínez García', '+52 55 3456-7890', '1992-11-07', NULL, 'female', true, 'online', false, NULL, false, NULL, '2025-06-26 02:41:17.161-07', '2025-06-26 02:41:17.161-07', NULL, 2, NULL, NULL, NULL, NULL, NULL, NULL, NULL, false, NULL, 'local', NULL, NULL);
INSERT INTO public.users (id, email, password_hash, first_name, last_name, phone, birth_date, age, gender, is_active, registration_type, has_temporary_password, temporary_password_expires_at, requires_initial_setup, created_by_nutritionist_id, created_at, updated_at, "passwordChangedAt", role_id, profile_image, google_id, google_email, google_access_token, google_refresh_token, google_token_expires_at, google_calendar_id, google_calendar_sync_enabled, google_calendar_last_sync, auth_provider, nutritionist_tier_id, patient_tier_id) VALUES ('1fdb61fc-f4d2-4ac3-b057-e13a38c53485', 'miguel.torres@demo.com', '$2b$12$y27zpqG1J3rq6CniHfWXiu4jPNptmpBdow0V.CorU4EBudwCOZusi', 'Miguel', 'Torres Sánchez', '+52 55 4567-8901', '1988-05-13', NULL, 'male', true, 'online', false, NULL, false, NULL, '2025-06-26 02:41:17.19-07', '2025-06-26 02:41:17.19-07', NULL, 2, NULL, NULL, NULL, NULL, NULL, NULL, NULL, false, NULL, 'local', NULL, NULL);
INSERT INTO public.users (id, email, password_hash, first_name, last_name, phone, birth_date, age, gender, is_active, registration_type, has_temporary_password, temporary_password_expires_at, requires_initial_setup, created_by_nutritionist_id, created_at, updated_at, "passwordChangedAt", role_id, profile_image, google_id, google_email, google_access_token, google_refresh_token, google_token_expires_at, google_calendar_id, google_calendar_sync_enabled, google_calendar_last_sync, auth_provider, nutritionist_tier_id, patient_tier_id) VALUES ('76dd5f8a-dd58-43f4-a0e7-1e58a0f5ee26', 'lucia.hernandez@demo.com', '$2b$12$y27zpqG1J3rq6CniHfWXiu4jPNptmpBdow0V.CorU4EBudwCOZusi', 'Lucía', 'Hernández Pérez', '+52 55 5678-9012', '1995-09-29', NULL, 'female', true, 'online', false, NULL, false, NULL, '2025-06-26 02:41:17.211-07', '2025-06-26 02:41:17.211-07', NULL, 2, NULL, NULL, NULL, NULL, NULL, NULL, NULL, false, NULL, 'local', NULL, NULL);
INSERT INTO public.users (id, email, password_hash, first_name, last_name, phone, birth_date, age, gender, is_active, registration_type, has_temporary_password, temporary_password_expires_at, requires_initial_setup, created_by_nutritionist_id, created_at, updated_at, "passwordChangedAt", role_id, profile_image, google_id, google_email, google_access_token, google_refresh_token, google_token_expires_at, google_calendar_id, google_calendar_sync_enabled, google_calendar_last_sync, auth_provider, nutritionist_tier_id, patient_tier_id) VALUES ('95c05e16-f5c6-411d-8758-44644f402340', 'jose.martin@demo.com', '$2b$12$y27zpqG1J3rq6CniHfWXiu4jPNptmpBdow0V.CorU4EBudwCOZusi', 'José', 'Martín Ramírez', '+52 55 6789-0123', '1987-12-02', NULL, 'male', true, 'online', false, NULL, false, NULL, '2025-06-26 02:41:17.237-07', '2025-06-26 02:41:17.237-07', NULL, 2, NULL, NULL, NULL, NULL, NULL, NULL, NULL, false, NULL, 'local', NULL, NULL);
INSERT INTO public.users (id, email, password_hash, first_name, last_name, phone, birth_date, age, gender, is_active, registration_type, has_temporary_password, temporary_password_expires_at, requires_initial_setup, created_by_nutritionist_id, created_at, updated_at, "passwordChangedAt", role_id, profile_image, google_id, google_email, google_access_token, google_refresh_token, google_token_expires_at, google_calendar_id, google_calendar_sync_enabled, google_calendar_last_sync, auth_provider, nutritionist_tier_id, patient_tier_id) VALUES ('ef25996f-6533-4e98-aa90-402e0f121b5c', 'elena.garcia@demo.com', '$2b$12$y27zpqG1J3rq6CniHfWXiu4jPNptmpBdow0V.CorU4EBudwCOZusi', 'Elena', 'García Jiménez', '+52 55 7890-1234', '1991-04-24', NULL, 'female', true, 'online', false, NULL, false, NULL, '2025-06-26 02:41:17.26-07', '2025-06-26 02:41:17.26-07', NULL, 2, NULL, NULL, NULL, NULL, NULL, NULL, NULL, false, NULL, 'local', NULL, NULL);
INSERT INTO public.users (id, email, password_hash, first_name, last_name, phone, birth_date, age, gender, is_active, registration_type, has_temporary_password, temporary_password_expires_at, requires_initial_setup, created_by_nutritionist_id, created_at, updated_at, "passwordChangedAt", role_id, profile_image, google_id, google_email, google_access_token, google_refresh_token, google_token_expires_at, google_calendar_id, google_calendar_sync_enabled, google_calendar_last_sync, auth_provider, nutritionist_tier_id, patient_tier_id) VALUES ('b44c7b3d-4c81-4e07-b119-c86999f41eeb', 'roberto.silva@demo.com', '$2b$12$y27zpqG1J3rq6CniHfWXiu4jPNptmpBdow0V.CorU4EBudwCOZusi', 'Roberto', 'Silva Moreno', '+52 55 8901-2345', '1983-08-16', NULL, 'male', true, 'online', false, NULL, false, NULL, '2025-06-26 02:41:17.281-07', '2025-06-26 02:41:17.281-07', NULL, 2, NULL, NULL, NULL, NULL, NULL, NULL, NULL, false, NULL, 'local', NULL, NULL);
INSERT INTO public.users (id, email, password_hash, first_name, last_name, phone, birth_date, age, gender, is_active, registration_type, has_temporary_password, temporary_password_expires_at, requires_initial_setup, created_by_nutritionist_id, created_at, updated_at, "passwordChangedAt", role_id, profile_image, google_id, google_email, google_access_token, google_refresh_token, google_token_expires_at, google_calendar_id, google_calendar_sync_enabled, google_calendar_last_sync, auth_provider, nutritionist_tier_id, patient_tier_id) VALUES ('dc77923e-3df2-4d1d-95dc-c33efa0884a8', 'saulpulido52@gmail.com', '$2b$10$Jf/DxOtDEIc2oWFN6n4JMuhBzvX084RKcl/.am3dyHMdK4/iuquIe', 'Saul Hirad', 'Pulido Gutiérrez', '6441672267', '1999-03-04', 26, 'male', true, 'in_person', true, '2025-06-27 02:42:52.05-07', false, '79e3bb0e-eb72-4eb5-8ebf-ee4e390b4aec', '2025-06-26 02:42:52.065513-07', '2025-06-26 02:42:52.065513-07', NULL, 2, NULL, NULL, NULL, NULL, NULL, NULL, NULL, false, NULL, 'local', NULL, NULL);
INSERT INTO public.users (id, email, password_hash, first_name, last_name, phone, birth_date, age, gender, is_active, registration_type, has_temporary_password, temporary_password_expires_at, requires_initial_setup, created_by_nutritionist_id, created_at, updated_at, "passwordChangedAt", role_id, profile_image, google_id, google_email, google_access_token, google_refresh_token, google_token_expires_at, google_calendar_id, google_calendar_sync_enabled, google_calendar_last_sync, auth_provider, nutritionist_tier_id, patient_tier_id) VALUES ('2ce0f60e-2433-49db-a2d9-ad57eae18a67', 'cesar@gmail.com', '$2b$10$HYqoZ40OWUaHe5VnnFRv7OBBqhrrFCFNdaYPundLim0u/PR4C9gNC', 'cesar', 'plata', '6441672267', '1991-05-19', 34, 'male', true, 'in_person', true, '2025-06-27 07:24:43.728-07', false, '741a971b-b0de-4ead-a030-0f5b906adac3', '2025-06-26 07:24:43.733649-07', '2025-06-26 07:24:43.733649-07', NULL, 2, NULL, NULL, NULL, NULL, NULL, NULL, NULL, false, NULL, 'local', NULL, NULL);
INSERT INTO public.users (id, email, password_hash, first_name, last_name, phone, birth_date, age, gender, is_active, registration_type, has_temporary_password, temporary_password_expires_at, requires_initial_setup, created_by_nutritionist_id, created_at, updated_at, "passwordChangedAt", role_id, profile_image, google_id, google_email, google_access_token, google_refresh_token, google_token_expires_at, google_calendar_id, google_calendar_sync_enabled, google_calendar_last_sync, auth_provider, nutritionist_tier_id, patient_tier_id) VALUES ('edee0e5f-8cc0-4870-bc19-b423df2e0829', 'marcy.soto@uabc.edu.mx', '$2b$10$k7ylYXdkKJgN0JanqXp74.dT1LDEK0Xov9gd/Pw9wa1ArW9J9VRSW', 'MONICA GUADALUPE', 'GUTIERREZ OLIVARES', '6441672267', '1997-03-04', 28, 'female', true, 'in_person', true, '2025-06-27 18:52:04.642-07', false, '16061724-6bbd-48eb-ae2a-c23b29dcdad8', '2025-06-26 18:52:04.687805-07', '2025-06-26 18:52:04.687805-07', NULL, 2, NULL, NULL, NULL, NULL, NULL, NULL, NULL, false, NULL, 'local', NULL, NULL);
INSERT INTO public.users (id, email, password_hash, first_name, last_name, phone, birth_date, age, gender, is_active, registration_type, has_temporary_password, temporary_password_expires_at, requires_initial_setup, created_by_nutritionist_id, created_at, updated_at, "passwordChangedAt", role_id, profile_image, google_id, google_email, google_access_token, google_refresh_token, google_token_expires_at, google_calendar_id, google_calendar_sync_enabled, google_calendar_last_sync, auth_provider, nutritionist_tier_id, patient_tier_id) VALUES ('3209877c-350e-4a2d-a620-dffd4675aaef', 'saul.hirad@hotmail.com', '$2b$10$vA6ZQzsN/aNNZ5BfrPfDFOFERKmHb.ohh8RkKEbIfmx73AHjdpPYC', 'Saul Hirad', 'Pulido Gutiérrez', '6441672267', '2025-06-02', 0, 'male', true, 'in_person', true, '2025-06-28 09:43:31.554-07', false, '741a971b-b0de-4ead-a030-0f5b906adac3', '2025-06-27 09:43:31.588653-07', '2025-06-27 09:43:31.588653-07', NULL, 2, NULL, NULL, NULL, NULL, NULL, NULL, NULL, false, NULL, 'local', NULL, NULL);
INSERT INTO public.users (id, email, password_hash, first_name, last_name, phone, birth_date, age, gender, is_active, registration_type, has_temporary_password, temporary_password_expires_at, requires_initial_setup, created_by_nutritionist_id, created_at, updated_at, "passwordChangedAt", role_id, profile_image, google_id, google_email, google_access_token, google_refresh_token, google_token_expires_at, google_calendar_id, google_calendar_sync_enabled, google_calendar_last_sync, auth_provider, nutritionist_tier_id, patient_tier_id) VALUES ('6f275f3f-63b4-41c8-b8eb-346af391c921', 'nutri.admin@sistema.com', '$2b$10$PhRc4pZ4iRuT5Glq7e7m7eHVL8KTm5pR3TVBhO6ou8Y7rjQ6WiYkm', 'Dr. Sistema', 'Nutricional', NULL, NULL, 35, 'other', true, 'online', false, NULL, false, NULL, '2025-07-02 23:25:25.17535-07', '2025-07-02 23:25:25.17535-07', NULL, 3, NULL, NULL, NULL, NULL, NULL, NULL, NULL, false, NULL, 'local', NULL, NULL);
INSERT INTO public.users (id, email, password_hash, first_name, last_name, phone, birth_date, age, gender, is_active, registration_type, has_temporary_password, temporary_password_expires_at, requires_initial_setup, created_by_nutritionist_id, created_at, updated_at, "passwordChangedAt", role_id, profile_image, google_id, google_email, google_access_token, google_refresh_token, google_token_expires_at, google_calendar_id, google_calendar_sync_enabled, google_calendar_last_sync, auth_provider, nutritionist_tier_id, patient_tier_id) VALUES ('6fd896ac-51f0-4d0b-81af-129cd6c3d551', 'admin@nutri.com', '$2b$10$5d.UgyyH6VnL0WQW6obSkOD/jvnqfmmQv8m9gtK28.y9nUSnm201y', 'Super', 'Administrador', '+1234567891', NULL, NULL, NULL, true, 'online', false, NULL, false, NULL, '2025-07-08 23:52:20.004128-07', '2025-07-08 23:52:20.004128-07', NULL, 3, NULL, NULL, NULL, NULL, NULL, NULL, NULL, false, NULL, 'local', NULL, NULL);
INSERT INTO public.users (id, email, password_hash, first_name, last_name, phone, birth_date, age, gender, is_active, registration_type, has_temporary_password, temporary_password_expires_at, requires_initial_setup, created_by_nutritionist_id, created_at, updated_at, "passwordChangedAt", role_id, profile_image, google_id, google_email, google_access_token, google_refresh_token, google_token_expires_at, google_calendar_id, google_calendar_sync_enabled, google_calendar_last_sync, auth_provider, nutritionist_tier_id, patient_tier_id) VALUES ('c82a1e56-e7bd-44fb-87a5-5a81f4b4afd1', 'amparo_camillero@hotmail.com', '$2b$10$8cSQvZMkBMeq6kXU7pvEAO6san/XcIPL52nSP49GGEju8MxIZ67NG', 'Amparo', 'Rodriguez', '6441154789', '1993-01-08', 32, 'male', true, 'in_person', true, '2025-07-10 07:34:59.448-07', false, '741a971b-b0de-4ead-a030-0f5b906adac3', '2025-07-09 07:34:59.489559-07', '2025-07-09 07:34:59.489559-07', NULL, 2, NULL, NULL, NULL, NULL, NULL, NULL, NULL, false, NULL, 'local', NULL, NULL);
INSERT INTO public.users (id, email, password_hash, first_name, last_name, phone, birth_date, age, gender, is_active, registration_type, has_temporary_password, temporary_password_expires_at, requires_initial_setup, created_by_nutritionist_id, created_at, updated_at, "passwordChangedAt", role_id, profile_image, google_id, google_email, google_access_token, google_refresh_token, google_token_expires_at, google_calendar_id, google_calendar_sync_enabled, google_calendar_last_sync, auth_provider, nutritionist_tier_id, patient_tier_id) VALUES ('b98afb1f-64ab-416e-8e73-7fb2459fd098', 'hiradgutierrez@hotmail.com', '$2b$10$auTvebTLToP937YWxBAqWuuYOTH5tCjgOdjcmXgTI1YaDJ4kiTXWe', 'hirad', 'Pulido Gutiérrez', '+526441672267', '2020-01-04', 5, 'male', true, 'in_person', true, '2025-08-06 00:54:13.019-07', false, '741a971b-b0de-4ead-a030-0f5b906adac3', '2025-08-05 00:54:13.024972-07', '2025-08-05 00:54:13.024972-07', NULL, 2, NULL, NULL, NULL, NULL, NULL, NULL, NULL, false, NULL, 'local', NULL, NULL);


--
-- Data for Name: weekly_plan_templates; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Name: migrations_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.migrations_id_seq', 22, true);


--
-- Name: roles_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.roles_id_seq', 3, true);


--
-- Name: foods PK_0cc83421325632f61fa27a52b59; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.foods
    ADD CONSTRAINT "PK_0cc83421325632f61fa27a52b59" PRIMARY KEY (id);


--
-- Name: messages PK_18325f38ae6de43878487eff986; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.messages
    ADD CONSTRAINT "PK_18325f38ae6de43878487eff986" PRIMARY KEY (id);


--
-- Name: meal_items PK_1e2d1209132a6ae53837e349a60; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.meal_items
    ADD CONSTRAINT "PK_1e2d1209132a6ae53837e349a60" PRIMARY KEY (id);


--
-- Name: nutritionist_tiers PK_27500486f14de1de2ebc8011e60; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.nutritionist_tiers
    ADD CONSTRAINT "PK_27500486f14de1de2ebc8011e60" PRIMARY KEY (id);


--
-- Name: educational_content PK_428b812a274f59b636fb9caed75; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.educational_content
    ADD CONSTRAINT "PK_428b812a274f59b636fb9caed75" PRIMARY KEY (id);


--
-- Name: appointments PK_4a437a9a27e948726b8bb3e36ad; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.appointments
    ADD CONSTRAINT "PK_4a437a9a27e948726b8bb3e36ad" PRIMARY KEY (id);


--
-- Name: patient_nutritionist_relations PK_4c98911110e1bd4471c6a4cc32b; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.patient_nutritionist_relations
    ADD CONSTRAINT "PK_4c98911110e1bd4471c6a4cc32b" PRIMARY KEY (id);


--
-- Name: diet_plans PK_5575ae2747f628340b7ac33beed; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.diet_plans
    ADD CONSTRAINT "PK_5575ae2747f628340b7ac33beed" PRIMARY KEY (id);


--
-- Name: patient_tiers PK_5e7038a447840c87f09229fc486; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.patient_tiers
    ADD CONSTRAINT "PK_5e7038a447840c87f09229fc486" PRIMARY KEY (id);


--
-- Name: patient_profiles PK_7297a6976f065cc75e798674aa8; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.patient_profiles
    ADD CONSTRAINT "PK_7297a6976f065cc75e798674aa8" PRIMARY KEY (id);


--
-- Name: clinical_records PK_88bb9264ee0dcf6cea9c92d07d9; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.clinical_records
    ADD CONSTRAINT "PK_88bb9264ee0dcf6cea9c92d07d9" PRIMARY KEY (id);


--
-- Name: migrations PK_8c82d7f526340ab734260ea46be; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.migrations
    ADD CONSTRAINT "PK_8c82d7f526340ab734260ea46be" PRIMARY KEY (id);


--
-- Name: recipes PK_8f09680a51bf3669c1598a21682; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.recipes
    ADD CONSTRAINT "PK_8f09680a51bf3669c1598a21682" PRIMARY KEY (id);


--
-- Name: recipe_ingredients PK_8f15a314e55970414fc92ffb532; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.recipe_ingredients
    ADD CONSTRAINT "PK_8f15a314e55970414fc92ffb532" PRIMARY KEY (id);


--
-- Name: patient_progress_logs PK_952dd6ba716cd233af4d40c8d3a; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.patient_progress_logs
    ADD CONSTRAINT "PK_952dd6ba716cd233af4d40c8d3a" PRIMARY KEY (id);


--
-- Name: subscription_plans PK_9ab8fe6918451ab3d0a4fb6bb0c; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.subscription_plans
    ADD CONSTRAINT "PK_9ab8fe6918451ab3d0a4fb6bb0c" PRIMARY KEY (id);


--
-- Name: nutritionist_profiles PK_9e1462784b64498818a4214f9c9; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.nutritionist_profiles
    ADD CONSTRAINT "PK_9e1462784b64498818a4214f9c9" PRIMARY KEY (id);


--
-- Name: user_subscriptions PK_9e928b0954e51705ab44988812c; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_subscriptions
    ADD CONSTRAINT "PK_9e928b0954e51705ab44988812c" PRIMARY KEY (id);


--
-- Name: users PK_a3ffb1c0c8416b9fc6f907b7433; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY (id);


--
-- Name: roles PK_c1433d71a4838793a49dcad46ab; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.roles
    ADD CONSTRAINT "PK_c1433d71a4838793a49dcad46ab" PRIMARY KEY (id);


--
-- Name: payment_transactions PK_d32b3c6b0d2c1d22604cbcc8c49; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payment_transactions
    ADD CONSTRAINT "PK_d32b3c6b0d2c1d22604cbcc8c49" PRIMARY KEY (id);


--
-- Name: nutritionist_availabilities PK_e4f7db4b91d9ba978241c36a3ee; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.nutritionist_availabilities
    ADD CONSTRAINT "PK_e4f7db4b91d9ba978241c36a3ee" PRIMARY KEY (id);


--
-- Name: meals PK_e6f830ac9b463433b58ad6f1a59; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.meals
    ADD CONSTRAINT "PK_e6f830ac9b463433b58ad6f1a59" PRIMARY KEY (id);


--
-- Name: conversations PK_ee34f4f7ced4ec8681f26bf04ef; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.conversations
    ADD CONSTRAINT "PK_ee34f4f7ced4ec8681f26bf04ef" PRIMARY KEY (id);


--
-- Name: nutritionist_profiles REL_b8752bab86e4aa8803feeb67b4; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.nutritionist_profiles
    ADD CONSTRAINT "REL_b8752bab86e4aa8803feeb67b4" UNIQUE (user_id);


--
-- Name: patient_profiles REL_e296010b9088277148d109ba75; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.patient_profiles
    ADD CONSTRAINT "REL_e296010b9088277148d109ba75" UNIQUE (user_id);


--
-- Name: users UQ_0bd5012aeb82628e07f6a1be53b; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT "UQ_0bd5012aeb82628e07f6a1be53b" UNIQUE (google_id);


--
-- Name: roles UQ_648e3f5447f725579d7d4ffdfb7; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.roles
    ADD CONSTRAINT "UQ_648e3f5447f725579d7d4ffdfb7" UNIQUE (name);


--
-- Name: patient_nutritionist_relations UQ_77bf3ffe53b4be71055286f69c4; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.patient_nutritionist_relations
    ADD CONSTRAINT "UQ_77bf3ffe53b4be71055286f69c4" UNIQUE (patient_user_id, nutritionist_user_id);


--
-- Name: conversations UQ_78576ed0499ae93fb10a8f14830; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.conversations
    ADD CONSTRAINT "UQ_78576ed0499ae93fb10a8f14830" UNIQUE (participant1_user_id, participant2_user_id);


--
-- Name: users UQ_97672ac88f789774dd47f7c8be3; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE (email);


--
-- Name: nutritionist_profiles UQ_c3cf0be61f4b3f275e5fc69c429; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.nutritionist_profiles
    ADD CONSTRAINT "UQ_c3cf0be61f4b3f275e5fc69c429" UNIQUE (license_number);


--
-- Name: nutritionist_availabilities UQ_d80681c293b0d16adfa4581894f; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.nutritionist_availabilities
    ADD CONSTRAINT "UQ_d80681c293b0d16adfa4581894f" UNIQUE (nutritionist_user_id, day_of_week, start_time_minutes, end_time_minutes);


--
-- Name: growth_references growth_references_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.growth_references
    ADD CONSTRAINT growth_references_pkey PRIMARY KEY (id);


--
-- Name: template_foods template_foods_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.template_foods
    ADD CONSTRAINT template_foods_pkey PRIMARY KEY (id);


--
-- Name: template_meals template_meals_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.template_meals
    ADD CONSTRAINT template_meals_pkey PRIMARY KEY (id);


--
-- Name: template_recipes template_recipes_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.template_recipes
    ADD CONSTRAINT template_recipes_pkey PRIMARY KEY (id);


--
-- Name: weekly_plan_templates weekly_plan_templates_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.weekly_plan_templates
    ADD CONSTRAINT weekly_plan_templates_pkey PRIMARY KEY (id);


--
-- Name: idx_clinical_records_date_tipo; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_clinical_records_date_tipo ON public.clinical_records USING btree (record_date, tipo_expediente);


--
-- Name: idx_clinical_records_expediente_base; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_clinical_records_expediente_base ON public.clinical_records USING btree (expediente_base_id);


--
-- Name: idx_clinical_records_patient_tipo; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_clinical_records_patient_tipo ON public.clinical_records USING btree (patient_user_id, tipo_expediente);


--
-- Name: idx_growth_references_source_metric_gender_age; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX idx_growth_references_source_metric_gender_age ON public.growth_references USING btree (source, metric_type, gender, age_months);


--
-- Name: idx_patient_profiles_is_pediatric; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_patient_profiles_is_pediatric ON public.patient_profiles USING btree (is_pediatric_patient);


--
-- Name: idx_weekly_plan_templates_nutritionist_category_public; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_weekly_plan_templates_nutritionist_category_public ON public.weekly_plan_templates USING btree (created_by_nutritionist_id, category, ispublic);


--
-- Name: users FK_05003db6371ffb6894d2cca4af9; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT "FK_05003db6371ffb6894d2cca4af9" FOREIGN KEY (patient_tier_id) REFERENCES public.patient_tiers(id);


--
-- Name: user_subscriptions FK_0641da02314913e28f6131310eb; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_subscriptions
    ADD CONSTRAINT "FK_0641da02314913e28f6131310eb" FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: meal_items FK_18e0df2ed0d1d1ade493a6b6819; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.meal_items
    ADD CONSTRAINT "FK_18e0df2ed0d1d1ade493a6b6819" FOREIGN KEY (meal_id) REFERENCES public.meals(id) ON DELETE CASCADE;


--
-- Name: patient_nutritionist_relations FK_1cab3a7599551476434e954a41e; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.patient_nutritionist_relations
    ADD CONSTRAINT "FK_1cab3a7599551476434e954a41e" FOREIGN KEY (patient_user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: users FK_302084de91dd471653292c44e26; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT "FK_302084de91dd471653292c44e26" FOREIGN KEY (nutritionist_tier_id) REFERENCES public.nutritionist_tiers(id);


--
-- Name: patient_progress_logs FK_305172e4d9fe0565f520610ed7a; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.patient_progress_logs
    ADD CONSTRAINT "FK_305172e4d9fe0565f520610ed7a" FOREIGN KEY (patient_user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: messages FK_3bc55a7c3f9ed54b520bb5cfe23; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.messages
    ADD CONSTRAINT "FK_3bc55a7c3f9ed54b520bb5cfe23" FOREIGN KEY (conversation_id) REFERENCES public.conversations(id) ON DELETE CASCADE;


--
-- Name: conversations FK_46dbfcab6238df06834b9edec4a; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.conversations
    ADD CONSTRAINT "FK_46dbfcab6238df06834b9edec4a" FOREIGN KEY (participant2_user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: appointments FK_4a58b3418955cdc6aa967e5f82f; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.appointments
    ADD CONSTRAINT "FK_4a58b3418955cdc6aa967e5f82f" FOREIGN KEY (nutritionist_user_id) REFERENCES public.users(id) ON DELETE RESTRICT;


--
-- Name: foods FK_5bcb2f8a482bf328beab432f8eb; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.foods
    ADD CONSTRAINT "FK_5bcb2f8a482bf328beab432f8eb" FOREIGN KEY (created_by_user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: clinical_records FK_5d3ed6dfec0c9d04e1f590bf193; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.clinical_records
    ADD CONSTRAINT "FK_5d3ed6dfec0c9d04e1f590bf193" FOREIGN KEY (patient_user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: conversations FK_72da74cc4ebad45c7359156402f; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.conversations
    ADD CONSTRAINT "FK_72da74cc4ebad45c7359156402f" FOREIGN KEY (participant1_user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: payment_transactions FK_77fab0556decc83a81a5bf8c25d; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payment_transactions
    ADD CONSTRAINT "FK_77fab0556decc83a81a5bf8c25d" FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE RESTRICT;


--
-- Name: patient_nutritionist_relations FK_8bab104d9d7b4c5dcdd318f4fdb; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.patient_nutritionist_relations
    ADD CONSTRAINT "FK_8bab104d9d7b4c5dcdd318f4fdb" FOREIGN KEY (nutritionist_user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: appointments FK_8cd86f8376020c81f7b3a65f48d; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.appointments
    ADD CONSTRAINT "FK_8cd86f8376020c81f7b3a65f48d" FOREIGN KEY (patient_user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: nutritionist_availabilities FK_8fcc49625e881f090e7b1b54737; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.nutritionist_availabilities
    ADD CONSTRAINT "FK_8fcc49625e881f090e7b1b54737" FOREIGN KEY (nutritionist_user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: educational_content FK_9572234f0e221870236aef8a2a1; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.educational_content
    ADD CONSTRAINT "FK_9572234f0e221870236aef8a2a1" FOREIGN KEY (created_by_user_id) REFERENCES public.users(id) ON DELETE RESTRICT;


--
-- Name: payment_transactions FK_95c9cc2e6f7487c9344aba10f3c; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payment_transactions
    ADD CONSTRAINT "FK_95c9cc2e6f7487c9344aba10f3c" FOREIGN KEY (subscription_plan_id) REFERENCES public.subscription_plans(id) ON DELETE RESTRICT;


--
-- Name: meals FK_99b7443f60922ce8744d88af2b0; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.meals
    ADD CONSTRAINT "FK_99b7443f60922ce8744d88af2b0" FOREIGN KEY (diet_plan_id) REFERENCES public.diet_plans(id) ON DELETE CASCADE;


--
-- Name: meal_items FK_9b47372fc798d7e31000902dc09; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.meal_items
    ADD CONSTRAINT "FK_9b47372fc798d7e31000902dc09" FOREIGN KEY (food_id) REFERENCES public.foods(id) ON DELETE CASCADE;


--
-- Name: diet_plans FK_9ca1e0d765a296f5c130b770776; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.diet_plans
    ADD CONSTRAINT "FK_9ca1e0d765a296f5c130b770776" FOREIGN KEY (nutritionist_user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: recipe_ingredients FK_9f441dc9f69622084db183ccd2e; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.recipe_ingredients
    ADD CONSTRAINT "FK_9f441dc9f69622084db183ccd2e" FOREIGN KEY (food_id) REFERENCES public.foods(id) ON DELETE RESTRICT;


--
-- Name: users FK_a2cecd1a3531c0b041e29ba46e1; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT "FK_a2cecd1a3531c0b041e29ba46e1" FOREIGN KEY (role_id) REFERENCES public.roles(id);


--
-- Name: messages FK_b183972e0b84c9022884433195e; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.messages
    ADD CONSTRAINT "FK_b183972e0b84c9022884433195e" FOREIGN KEY (sender_user_id) REFERENCES public.users(id) ON DELETE RESTRICT;


--
-- Name: user_subscriptions FK_b6e02561ba40a3798a7e1432f2e; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_subscriptions
    ADD CONSTRAINT "FK_b6e02561ba40a3798a7e1432f2e" FOREIGN KEY (subscription_plan_id) REFERENCES public.subscription_plans(id);


--
-- Name: nutritionist_profiles FK_b8752bab86e4aa8803feeb67b43; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.nutritionist_profiles
    ADD CONSTRAINT "FK_b8752bab86e4aa8803feeb67b43" FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: educational_content FK_bab50cc53915a5b438f8dfbef91; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.educational_content
    ADD CONSTRAINT "FK_bab50cc53915a5b438f8dfbef91" FOREIGN KEY (last_modified_by_user_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: patient_profiles FK_e296010b9088277148d109ba75a; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.patient_profiles
    ADD CONSTRAINT "FK_e296010b9088277148d109ba75a" FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: recipes FK_eca8a05e00f1567b91f52ad18a3; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.recipes
    ADD CONSTRAINT "FK_eca8a05e00f1567b91f52ad18a3" FOREIGN KEY (created_by_user_id) REFERENCES public.users(id) ON DELETE RESTRICT;


--
-- Name: clinical_records FK_ef306ff4312a0ea9b1dacfacb6c; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.clinical_records
    ADD CONSTRAINT "FK_ef306ff4312a0ea9b1dacfacb6c" FOREIGN KEY (nutritionist_user_id) REFERENCES public.users(id) ON DELETE RESTRICT;


--
-- Name: recipe_ingredients FK_f240137e0e13bed80bdf64fed53; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.recipe_ingredients
    ADD CONSTRAINT "FK_f240137e0e13bed80bdf64fed53" FOREIGN KEY (recipe_id) REFERENCES public.recipes(id) ON DELETE CASCADE;


--
-- Name: diet_plans FK_fa3657f7281f01d5bd578839efd; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.diet_plans
    ADD CONSTRAINT "FK_fa3657f7281f01d5bd578839efd" FOREIGN KEY (patient_user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: recipes FK_ffe73c4a762b6ea55540de6073a; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.recipes
    ADD CONSTRAINT "FK_ffe73c4a762b6ea55540de6073a" FOREIGN KEY (last_modified_by_user_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: template_foods template_foods_food_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.template_foods
    ADD CONSTRAINT template_foods_food_id_fkey FOREIGN KEY (food_id) REFERENCES public.foods(id);


--
-- Name: template_foods template_foods_meal_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.template_foods
    ADD CONSTRAINT template_foods_meal_id_fkey FOREIGN KEY (meal_id) REFERENCES public.template_meals(id) ON DELETE CASCADE;


--
-- Name: template_meals template_meals_template_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.template_meals
    ADD CONSTRAINT template_meals_template_id_fkey FOREIGN KEY (template_id) REFERENCES public.weekly_plan_templates(id) ON DELETE CASCADE;


--
-- Name: template_recipes template_recipes_meal_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.template_recipes
    ADD CONSTRAINT template_recipes_meal_id_fkey FOREIGN KEY (meal_id) REFERENCES public.template_meals(id) ON DELETE CASCADE;


--
-- Name: template_recipes template_recipes_recipe_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.template_recipes
    ADD CONSTRAINT template_recipes_recipe_id_fkey FOREIGN KEY (recipe_id) REFERENCES public.recipes(id);


--
-- Name: weekly_plan_templates weekly_plan_templates_created_by_nutritionist_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.weekly_plan_templates
    ADD CONSTRAINT weekly_plan_templates_created_by_nutritionist_id_fkey FOREIGN KEY (created_by_nutritionist_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

