# 🚀 Despliegue Rápido - Litam

## ⚡ Despliegue en 5 minutos

### 1. Desplegar Frontend en Vercel

```powershell
# Desde el directorio nutri-web
.\deploy-automated.ps1
```

O manualmente:
```bash
cd nutri-web
npm install
npm run build
vercel --prod
```

### 2. Configurar Supabase

#### Opción A: Local (Desarrollo)
```powershell
# Desde el directorio nutri-web
.\setup-supabase.ps1
```

#### Opción B: Producción
1. Ve a [supabase.com](https://supabase.com)
2. Crea una cuenta
3. Crea un nuevo proyecto: "litam-nutrition-platform"
4. Obtén las credenciales:
   - URL: `https://[project-id].supabase.co`
   - Anon Key: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
   - Service Role Key: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

### 3. Configurar Variables de Entorno

#### En Vercel Dashboard:
```
REACT_APP_API_URL=https://tu-proyecto.supabase.co
REACT_APP_SUPABASE_URL=https://tu-proyecto.supabase.co
REACT_APP_SUPABASE_ANON_KEY=tu-anon-key
```

#### En Supabase Dashboard:
1. Ve a Settings > API
2. Configura CORS:
   - `https://tu-app.vercel.app`
   - `http://localhost:3000`

### 4. Aplicar Migraciones

```bash
# Desde la raíz del proyecto
npm run migration:run
```

### 5. ¡Listo! 🎉

Tu aplicación estará disponible en:
- **Frontend**: https://tu-app.vercel.app
- **Backend**: https://tu-proyecto.supabase.co

## 🔧 Comandos Útiles

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

## 🚨 Solución de Problemas

### Error de CORS
- Verifica la configuración CORS en Supabase Dashboard
- Asegúrate de que el origen esté en la lista blanca

### Error de Build
- Verifica que todas las dependencias estén instaladas
- Revisa los logs: `vercel logs`

### Error de Base de Datos
- Verifica las credenciales de Supabase
- Asegúrate de que las migraciones se aplicaron correctamente

## 📞 Soporte

Si tienes problemas:
1. Revisa los logs de Vercel y Supabase
2. Verifica la configuración de variables de entorno
3. Asegúrate de que las migraciones se aplicaron
4. Contacta al equipo de desarrollo 