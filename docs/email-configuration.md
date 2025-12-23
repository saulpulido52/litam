# 📧 Configuración de Email para Litam

## Variables de Entorno Requeridas

Para que funcione el envío de credenciales por email, debes agregar las siguientes variables a tu archivo `.env`:

```env
# ========================================
# CONFIGURACIÓN DE EMAIL - HOSTINGER
# ========================================
SMTP_HOST=smtp.hostinger.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=litam@wexdoc.com
SMTP_PASSWORD=S0p0rt3obr.
EMAIL_FROM=litam@wexdoc.com
EMAIL_FROM_NAME=Litam Sistema

# URL del frontend para enlaces en emails
FRONTEND_URL=http://localhost:3000
```

## Configuración de Hostinger SMTP

### Datos de conexión:
- **Host:** `smtp.hostinger.com`
- **Puerto:** `587` (recomendado) o `465` (con SSL)
- **Seguridad:** STARTTLS para puerto 587
- **Usuario:** Tu email completo (litam@wexdoc.com)
- **Contraseña:** Contraseña de tu cuenta de email

### Notas importantes:
1. ✅ El email `litam@wexdoc.com` debe estar configurado en tu panel de Hostinger
2. ✅ La contraseña debe ser la de tu cuenta de email, no la del panel de hosting
3. ✅ Verifica que el dominio `wexdoc.com` tenga configurados los registros MX
4. ✅ Hostinger puede requerir que habilites el acceso SMTP en la configuración del email

## Funcionalidades Implementadas

### ✅ Envío automático de credenciales
- Se envía un email automáticamente cuando un nutriólogo registra un nuevo paciente
- El email incluye las credenciales temporales y un enlace directo al sistema

### ✅ Template de email personalizado
- Diseño responsive y profesional con la marca "Litam"
- Incluye información del nutriólogo que registró al paciente
- Instrucciones claras para el primer acceso
- Fecha de expiración de credenciales

### ✅ Manejo de errores
- Si falla el envío del email, el registro del paciente NO se cancela
- Se registra el error en los logs para seguimiento
- El nutriólogo recibe las credenciales en la respuesta de la API como respaldo

## Verificación de Configuración

Para probar la configuración de email, puedes usar el endpoint de verificación:

```bash
# Verificar conexión SMTP
curl -X GET http://localhost:3001/api/email/verify \
  -H "Authorization: Bearer tu_token_de_nutriologo"

# Enviar email de prueba
curl -X POST http://localhost:3001/api/email/test \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer tu_token_de_nutriologo" \
  -d '{"email": "tu-email@ejemplo.com"}'

# Probar template de credenciales
curl -X POST http://localhost:3001/api/email/test-credentials \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer tu_token_de_nutriologo" \
  -d '{
    "email": "paciente@ejemplo.com",
    "patient_name": "Juan Pérez",
    "nutritionist_name": "Dr. Ana García"
  }'
```

## Troubleshooting

### Error: "Authentication failed"
- Verifica que el email y contraseña sean correctos
- Asegúrate de que el email esté activo en Hostinger
- Revisa que no esté habilitada la autenticación de dos factores

### Error: "Connection timeout"
- Verifica la configuración del firewall
- Confirma que el puerto 587 esté abierto
- Prueba con el puerto 465 y `SMTP_SECURE=true`

### Email no llega al destinatario
- Revisa la carpeta de spam/junk
- Verifica que el dominio remitente tenga registros SPF/DKIM configurados
- Confirma que el email destinatario sea válido

## Template de Email Incluye

El email que reciben los pacientes contiene:

- 🎨 **Diseño profesional** con la marca Litam
- 🔑 **Credenciales destacadas** (email y contraseña temporal)
- ⚠️ **Advertencia de expiración** (24 horas)
- 📋 **Pasos claros** para acceder por primera vez
- 🚀 **Botón de acceso directo** al sistema
- 📱 **Compatible con móviles**
- 📞 **Información de contacto** del nutriólogo

## Próximos pasos

1. ✅ Agregar las variables de entorno
2. ✅ Reiniciar el servidor backend
3. ✅ Probar creando un nuevo paciente
4. ✅ Verificar que el email llegue correctamente

## Flujo de Validación de Pacientes

1. **Nutriólogo registra paciente** → `/api/patients/register-by-nutritionist`
2. **Sistema genera credenciales temporales** (válidas 24h)
3. **Se envía email automáticamente** al paciente
4. **Paciente recibe email con:**
   - Su email de acceso
   - Contraseña temporal
   - Enlace al sistema Litam
   - Instrucciones paso a paso
5. **Paciente accede y cambia contraseña** en primer login