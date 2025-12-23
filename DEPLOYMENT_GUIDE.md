# 🚀 Guía de Despliegue - Litam Nutrition Platform

## 📋 Resumen

Esta guía te ayudará a desplegar la aplicación Litam en:
- **Frontend**: Vercel
- **Backend**: Supabase
- **Base de Datos**: PostgreSQL (Supabase)

## 🛠️ Prerrequisitos

### 1. Cuentas Necesarias
- [Vercel](https://vercel.com) - Para el frontend
- [Supabase](https://supabase.com) - Para backend y base de datos
- [GitHub](https://github.com) - Para el código fuente

### 2. Herramientas Locales
```bash
# Instalar Node.js (v18+)
# Instalar npm o yarn
# Instalar Git

# Instalar Vercel CLI
npm install -g vercel

# Instalar Supabase CLI
npm install -g supabase
```

## 🚀 Paso 1: Configurar Supabase

### 1.1 Crear Proyecto en Supabase
1. Ve a [supabase.com](https://supabase.com)
2. Crea una nueva cuenta o inicia sesión
3. Crea un nuevo proyecto
4. Anota las credenciales:
   - **URL del proyecto**: `https://tu-proyecto.supabase.co`
   - **Anon Key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
   - **Service Role Key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

### 1.2 Configurar Variables de Entorno
Crea un archivo `.env` en la raíz del proyecto:

```env
# Supabase Configuration
SUPABASE_URL=https://tu-proyecto.supabase.co
SUPABASE_ANON_KEY=tu-anon-key
SUPABASE_SERVICE_ROLE_KEY=tu-service-role-key
DATABASE_URL=postgresql://postgres:[password]@db.[project-ref].supabase.co:5432/postgres

# JWT Configuration
JWT_SECRET=tu-jwt-secret-super-seguro

# Email Configuration (opcional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=tu-email@gmail.com
SMTP_PASS=tu-password

# Environment
NODE_ENV=production
PORT=4000
```

### 1.3 Aplicar Migraciones
```bash
# Ejecutar migraciones en Supabase
npm run migration:run

# O usar el script de despliegue
chmod +x scripts/deploy-supabase.sh
./scripts/deploy-supabase.sh
```

## 🚀 Paso 2: Configurar Vercel

### 2.1 Preparar el Frontend
1. Navega al directorio del frontend:
```bash
cd nutri-web
```

2. Instalar dependencias:
```bash
npm install
```

3. Configurar variables de entorno para Vercel:
```bash
# Crear archivo .env.local
REACT_APP_API_URL=https://tu-proyecto.supabase.co
REACT_APP_SUPABASE_URL=https://tu-proyecto.supabase.co
REACT_APP_SUPABASE_ANON_KEY=tu-anon-key
```

### 2.2 Desplegar en Vercel

#### Opción A: Usando Vercel CLI
```bash
# Desde el directorio nutri-web
vercel --prod
```

#### Opción B: Usando el Script
```bash
# Desde la raíz del proyecto
chmod +x scripts/deploy-vercel.sh
./scripts/deploy-vercel.sh
```

#### Opción C: Desde GitHub
1. Conecta tu repositorio de GitHub a Vercel
2. Configura las variables de entorno en Vercel Dashboard
3. Vercel desplegará automáticamente en cada push

### 2.3 Configurar Variables de Entorno en Vercel
En el dashboard de Vercel, agrega estas variables:

```
REACT_APP_API_URL=https://tu-proyecto.supabase.co
REACT_APP_SUPABASE_URL=https://tu-proyecto.supabase.co
REACT_APP_SUPABASE_ANON_KEY=tu-anon-key
```

## 🔧 Paso 3: Configuración Avanzada

### 3.1 Configurar Dominio Personalizado
1. En Vercel Dashboard, ve a Settings > Domains
2. Agrega tu dominio personalizado
3. Configura los registros DNS según las instrucciones

### 3.2 Configurar SSL
- Vercel maneja SSL automáticamente
- Supabase también maneja SSL automáticamente

### 3.3 Configurar Analytics
```bash
# En Vercel, agrega estas variables de entorno:
REACT_APP_GOOGLE_ANALYTICS_ID=tu-ga-id
REACT_APP_SENTRY_DSN=tu-sentry-dsn
```

## 🧪 Paso 4: Verificación

### 4.1 Verificar Frontend
1. Visita tu URL de Vercel
2. Verifica que la aplicación carga correctamente
3. Prueba el login y registro

### 4.2 Verificar Backend
```bash
# Verificar la salud de Supabase
curl https://tu-proyecto.supabase.co/rest/v1/health_check

# Verificar las migraciones
npm run migration:show
```

### 4.3 Verificar Base de Datos
1. Ve a Supabase Dashboard
2. Verifica que las tablas se crearon correctamente
3. Prueba algunas consultas básicas

## 🔒 Paso 5: Seguridad

### 5.1 Configurar CORS
En Supabase Dashboard:
1. Ve a Settings > API
2. Configura los orígenes permitidos:
   - `https://tu-app.vercel.app`
   - `http://localhost:3000` (para desarrollo)

### 5.2 Configurar RLS (Row Level Security)
```sql
-- Ejemplo de política RLS
CREATE POLICY "Users can view own profile" ON users
    FOR SELECT USING (auth.uid() = id);
```

### 5.3 Configurar Rate Limiting
En Vercel, configura rate limiting:
```json
{
  "functions": {
    "api/*.js": {
      "maxDuration": 10
    }
  }
}
```

## 📊 Paso 6: Monitoreo

### 6.1 Configurar Logs
```bash
# En Vercel
vercel logs

# En Supabase
supabase logs
```

### 6.2 Configurar Alertas
1. Configura alertas en Vercel para errores
2. Configura alertas en Supabase para uso de recursos
3. Configura alertas de uptime

## 🚨 Solución de Problemas

### Problema: Error de CORS
```bash
# Verificar configuración CORS en Supabase
# Asegúrate de que el origen esté en la lista blanca
```

### Problema: Error de Migraciones
```bash
# Revertir migraciones
npm run migration:revert

# Aplicar migraciones nuevamente
npm run migration:run
```

### Problema: Error de Build en Vercel
```bash
# Verificar logs
vercel logs

# Verificar variables de entorno
vercel env ls
```

## 📈 Paso 7: Optimización

### 7.1 Optimizar Performance
```bash
# En Vercel, configura:
- Edge Functions para APIs críticas
- CDN para assets estáticos
- Caching agresivo para contenido estático
```

### 7.2 Optimizar Costos
```bash
# En Supabase:
- Usar el plan gratuito para desarrollo
- Escalar según necesidad
- Monitorear uso de recursos
```

## 🎉 ¡Listo!

Tu aplicación Litam está ahora desplegada en:
- **Frontend**: https://tu-app.vercel.app
- **Backend**: https://tu-proyecto.supabase.co
- **Dashboard**: https://app.supabase.com/project/tu-proyecto

### URLs Importantes
- **Vercel Dashboard**: https://vercel.com/dashboard
- **Supabase Dashboard**: https://app.supabase.com
- **Documentación**: https://supabase.com/docs

### Comandos Útiles
```bash
# Ver logs de Vercel
vercel logs

# Ver logs de Supabase
supabase logs

# Actualizar variables de entorno
vercel env add REACT_APP_API_URL

# Desplegar cambios
git push origin main
``` 