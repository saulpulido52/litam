# Configuración de Google OAuth2 para NutriWeb

## 🚀 Resumen de la Implementación

Se ha implementado la autenticación con Google OAuth2 y sincronización de Google Calendar para la aplicación NutriWeb. Esta funcionalidad permite a los nutriólogos:

- **Autenticarse con Google** en lugar de usar contraseña
- **Sincronizar citas** automáticamente con Google Calendar
- **Recibir recordatorios** automáticos de citas
- **Gestionar horarios** desde Google Calendar

## 📋 Campos Agregados a la Base de Datos

### Tabla `users`:
- `google_id` - ID único del usuario en Google
- `google_email` - Email de Google del usuario
- `google_access_token` - Token de acceso de Google (encriptado)
- `google_refresh_token` - Token de renovación de Google (encriptado)
- `google_token_expires_at` - Fecha de expiración del token
- `google_calendar_id` - ID del calendario principal seleccionado
- `google_calendar_sync_enabled` - Si la sincronización está habilitada
- `google_calendar_last_sync` - Timestamp de la última sincronización

### Tabla `appointments`:
- `google_calendar_event_id` - ID del evento en Google Calendar
- `synced_to_google_calendar` - Si la cita está sincronizada
- `last_sync_to_google` - Timestamp de la última sincronización

## 🔧 Configuración de Google OAuth2

### 1. Crear Proyecto en Google Cloud Console

1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Crea un nuevo proyecto o selecciona uno existente
3. Habilita la API de Google Calendar:
   - Ve a "APIs & Services" > "Library"
   - Busca "Google Calendar API"
   - Haz clic en "Enable"

### 2. Configurar OAuth2

1. Ve a "APIs & Services" > "Credentials"
2. Haz clic en "Create Credentials" > "OAuth 2.0 Client IDs"
3. Selecciona "Web application"
4. Configura las URLs autorizadas:
   - **Authorized JavaScript origins:**
     - `http://localhost:5000`
     - `http://localhost:4000`
   - **Authorized redirect URIs:**
     - `http://localhost:4000/api/auth/google/callback`

### 3. Variables de Entorno

Crea un archivo `.env` en la raíz del proyecto con:

```env
# Google OAuth2 Configuration
GOOGLE_CLIENT_ID=tu_google_client_id
GOOGLE_CLIENT_SECRET=tu_google_client_secret
GOOGLE_REDIRECT_URI=http://localhost:4000/api/auth/google/callback

# Otras configuraciones...
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=tu_password
DB_DATABASE=nutri_db
PORT=4000
JWT_SECRET=tu_jwt_secret_super_seguro_aqui
```

## 🗄️ Migraciones de Base de Datos

### Ejecutar las migraciones:

```bash
# En el directorio del backend
npm run migration:run
```

Esto ejecutará las siguientes migraciones:
- `1704073600000-AddGoogleOAuthFields.ts` - Agrega campos de Google OAuth a usuarios
- `1704073700000-AddGoogleCalendarToAppointments.ts` - Agrega campos de Google Calendar a citas

## 🔄 Flujo de Autenticación

### 1. Inicio de Sesión con Google:
```
Usuario → Clic "Continuar con Google" → Google OAuth → Callback → JWT Token → Dashboard
```

### 2. Sincronización de Calendario:
```
Cita creada → Google Calendar API → Evento creado → Recordatorios automáticos
```

## 📱 Componentes Frontend

### `GoogleAuth.tsx`
- Maneja la autenticación con Google
- Soporta login y desconexión
- Maneja errores y estados de carga

### `GoogleCalendarConfig.tsx`
- Configuración de sincronización de calendario
- Selección de calendario principal
- Sincronización manual y automática

## 🔌 Endpoints de la API

### Autenticación:
- `GET /api/auth/google/init` - Inicia flujo de autenticación
- `GET /api/auth/google/callback` - Callback de Google OAuth
- `GET /api/auth/google/status` - Estado de conexión con Google
- `POST /api/auth/google/disconnect` - Desconectar cuenta de Google

### Calendario:
- `GET /api/calendar/google/calendars` - Lista de calendarios
- `POST /api/calendar/google/primary-calendar` - Configurar calendario principal
- `POST /api/calendar/google/toggle-sync` - Habilitar/deshabilitar sincronización
- `POST /api/calendar/google/sync-to-calendar` - Sincronizar citas a Google
- `POST /api/calendar/google/sync-from-calendar` - Sincronizar desde Google

## 🛡️ Seguridad

### Tokens:
- Los tokens de Google se almacenan encriptados en la base de datos
- Se renuevan automáticamente cuando expiran
- Se eliminan al desconectar la cuenta

### Permisos:
- Solo el usuario puede acceder a sus tokens
- Los tokens no se comparten entre usuarios
- Se validan los permisos antes de cada operación

## 🎯 Funcionalidades Implementadas

### ✅ Completado:
- [x] Autenticación con Google OAuth2
- [x] Sincronización bidireccional con Google Calendar
- [x] Configuración de calendario principal
- [x] Recordatorios automáticos (email + popup)
- [x] Interfaz de usuario para configuración
- [x] Manejo de errores y estados de carga
- [x] Migraciones de base de datos
- [x] Documentación completa

### 🔄 Próximos Pasos:
- [ ] Pruebas unitarias y de integración
- [ ] Optimización de rendimiento
- [ ] Configuración de producción
- [ ] Monitoreo y logs

## 🚀 Uso

### Para Nutriólogos:
1. Ve a tu perfil → Pestaña "Google Calendar"
2. Haz clic en "Conectar con Google"
3. Autoriza la aplicación
4. Selecciona tu calendario principal
5. Habilita la sincronización automática

### Para Desarrolladores:
1. Configura las variables de entorno
2. Ejecuta las migraciones
3. Inicia el servidor
4. Prueba la autenticación y sincronización

## 📞 Soporte

Si tienes problemas con la configuración:
1. Verifica que las variables de entorno estén correctas
2. Asegúrate de que las URLs de redirección coincidan
3. Revisa los logs del servidor para errores
4. Contacta al equipo de desarrollo

---

**Nota:** Esta implementación está diseñada específicamente para nutriólogos y mantiene toda la funcionalidad dentro de tu plataforma NutriWeb, sin redirigir a servicios externos para la gestión de citas. 