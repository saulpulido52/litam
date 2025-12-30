-- 1. Crear la tabla de reglas OMS (Esta sí es nueva)
CREATE TABLE IF NOT EXISTS public.who_standards (
    id SERIAL PRIMARY KEY,
    nutrient_key VARCHAR(50) NOT NULL UNIQUE, -- Ej: 'SUGAR', 'SODIUM'
    daily_limit_value NUMERIC NOT NULL,       
    unit VARCHAR(10) DEFAULT 'g',
    description TEXT,
    severity_level VARCHAR(20) DEFAULT 'HIGH' 
);

-- Datos semilla para la OMS
INSERT INTO public.who_standards (nutrient_key, daily_limit_value, unit, description)
VALUES 
    ('SUGAR', 25, 'g', 'Límite de azúcares libres OMS'),
    ('SODIUM', 2000, 'mg', 'Límite diario de sodio OMS'),
    ('SAT_FAT', 20, 'g', 'Grasas saturadas referencia')
ON CONFLICT (nutrient_key) DO NOTHING;

-- 2. ADAPTAR la tabla 'foods' existente (En lugar de crear 'cached_ingredients')
ALTER TABLE public.foods 
ADD COLUMN IF NOT EXISTS external_api_id VARCHAR(100), 
ADD COLUMN IF NOT EXISTS api_source VARCHAR(50) DEFAULT 'MANUAL',
ADD COLUMN IF NOT EXISTS sodium NUMERIC DEFAULT 0, -- Campo nuevo vital
ADD COLUMN IF NOT EXISTS raw_nutrition_data JSONB, -- El caché del JSON completo
ADD COLUMN IF NOT EXISTS who_compliance_flag VARCHAR(20) DEFAULT 'UNKNOWN';

-- Índice para optimizar búsquedas por ID externo
CREATE INDEX IF NOT EXISTS idx_foods_external_id ON public.foods(external_api_id);
