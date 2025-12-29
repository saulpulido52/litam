-- SQL para Supabase - Agregar columnas de recetas base
-- IMPORTANTE: PostgreSQL en Supabase no soporta "IF NOT EXISTS" en ALTER TABLE ADD CONSTRAINT
-- Por eso debemos verificar primero si existen

-- 1. Agregar columnas (IF NOT EXISTS funciona aquí)
ALTER TABLE recipes 
ADD COLUMN IF NOT EXISTS is_base_recipe BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS is_shared_by_admin BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS original_recipe_id UUID NULL,
ADD COLUMN IF NOT EXISTS shared_at TIMESTAMP WITH TIME ZONE NULL,
ADD COLUMN IF NOT EXISTS shared_by_admin_id UUID NULL;

-- 2. Agregar constraint para shared_by_admin (solo si no existe)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'FK_recipes_shared_by_admin'
    ) THEN
        ALTER TABLE recipes 
        ADD CONSTRAINT FK_recipes_shared_by_admin 
        FOREIGN KEY (shared_by_admin_id) REFERENCES users(id) ON DELETE SET NULL;
    END IF;
END $$;

-- 3. Agregar constraint para original_recipe (solo si no existe)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'FK_recipes_original_recipe'
    ) THEN
        ALTER TABLE recipes 
        ADD CONSTRAINT FK_recipes_original_recipe 
        FOREIGN KEY (original_recipe_id) REFERENCES recipes(id) ON DELETE SET NULL;
    END IF;
END $$;

-- 4. Crear índices (solo si no existen)
CREATE INDEX IF NOT EXISTS IDX_recipes_is_base_recipe ON recipes (is_base_recipe);
CREATE INDEX IF NOT EXISTS IDX_recipes_is_shared_by_admin ON recipes (is_shared_by_admin);
