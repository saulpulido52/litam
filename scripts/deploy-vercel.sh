#!/bin/bash

# Script para desplegar la aplicación en Vercel
echo "🚀 Iniciando despliegue en Vercel..."

# Verificar que estamos en el directorio correcto
if [ ! -f "nutri-web/package.json" ]; then
    echo "❌ Error: No se encontró nutri-web/package.json"
    echo "Asegúrate de ejecutar este script desde la raíz del proyecto"
    exit 1
fi

# Navegar al directorio del frontend
cd nutri-web

# Instalar dependencias
echo "📦 Instalando dependencias..."
npm install

# Construir la aplicación
echo "🔨 Construyendo la aplicación..."
npm run build

# Verificar que el build fue exitoso
if [ ! -d "build" ]; then
    echo "❌ Error: El build no se generó correctamente"
    exit 1
fi

# Instalar Vercel CLI si no está instalado
if ! command -v vercel &> /dev/null; then
    echo "📥 Instalando Vercel CLI..."
    npm install -g vercel
fi

# Desplegar en Vercel
echo "🚀 Desplegando en Vercel..."
vercel --prod

echo "✅ Despliegue en Vercel completado!"
echo "🌐 Tu aplicación está disponible en: https://tu-proyecto.vercel.app" 