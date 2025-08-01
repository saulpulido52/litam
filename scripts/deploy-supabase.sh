#!/bin/bash

# Script para desplegar la base de datos en Supabase
echo "🚀 Iniciando despliegue en Supabase..."

# Verificar que estamos en el directorio correcto
if [ ! -f "package.json" ]; then
    echo "❌ Error: No se encontró package.json"
    echo "Asegúrate de ejecutar este script desde la raíz del proyecto"
    exit 1
fi

# Instalar Supabase CLI si no está instalado
if ! command -v supabase &> /dev/null; then
    echo "📥 Instalando Supabase CLI..."
    npm install -g supabase
fi

# Inicializar Supabase si no está inicializado
if [ ! -f "supabase/config.toml" ]; then
    echo "🔧 Inicializando Supabase..."
    supabase init
fi

# Iniciar Supabase localmente para desarrollo
echo "🏃 Iniciando Supabase localmente..."
supabase start

# Aplicar migraciones
echo "📊 Aplicando migraciones..."
supabase db reset

# Generar tipos de TypeScript
echo "📝 Generando tipos de TypeScript..."
supabase gen types typescript --local > src/types/supabase.ts

# Verificar la salud de la base de datos
echo "🏥 Verificando salud de la base de datos..."
supabase status

echo "✅ Despliegue en Supabase completado!"
echo "🌐 Supabase Studio disponible en: http://localhost:54323"
echo "🔌 API disponible en: http://localhost:54321" 