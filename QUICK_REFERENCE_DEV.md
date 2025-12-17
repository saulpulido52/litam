# QUICK REFERENCE - DESARROLLO NUTRIWEB

## 📊 **ESTADO ACTUAL: 90% COMPLETADO**

**Última Actualización:** 24 de Junio 2024  
**Próximo Milestone:** Integración de Mercado Pago  
**Tiempo para MVP:** 6-8 semanas

---

## 🆕 **ACTUALIZACIONES RECIENTES (JUNIO 2024)**

- Sincronización y transformación robusta de planes de dieta entre backend y frontend.
- Validaciones y defensas en frontend para evitar errores de renderizado y datos incompletos.
- Scripts de test y verificación de integridad de datos ejecutados y validados.
- Todos los planes de dieta, incluyendo los antiguos, se muestran correctamente.
- Comandos de referencia y credenciales de prueba actualizados para testing multiusuario.

---

## 🎯 **MECÁNICA DEL NEGOCIO**

### **MODELO DE PLATAFORMA:**
```
PACIENTE (App Móvil) → Registro → Búsqueda Nutriólogo → Elección → Relación
NUTRIÓLOGO (Web) → Gestión Pacientes → Expedientes → Planes (IA) → Citas
PLATAFORMA → Pagos (Mercado Pago) → Comisión 25% → Gestión
```

### **MONETIZACIÓN:**
- **Comisión:** 25% sobre consultas del nutriólogo
- **Pasarela:** Mercado Pago (split payments)
- **Flujo:** Paciente paga → Plataforma recibe 100% → Transfiere 75% al nutriólogo

---

## 🚀 **COMANDOS RÁPIDOS**

### **Iniciar Aplicación:**
```bash
# Iniciar todo el sistema
./start-app.ps1

# Solo backend
npm run dev

# Solo frontend
cd nutri-web && npm run dev
```

### **Base de Datos:**
```bash
# Verificar conexión
npx ts-node test-db-connection.ts

# Limpiar base de datos
npx ts-node clean-test-db.ts

# Crear datos de prueba
npx ts-node create-multiple-nutritionists.ts
```

### **Testing:**
```bash
# Ejecutar tests
npm test

# Verificar sistema
npx ts-node verify-system-status.ts
```

---

## 🔐 **CREDENCIALES DE PRUEBA**

### **Nutriólogos:**
- **Dr. María González:** `dr.maria.gonzalez@demo.com` / `demo123`
- **Dr. Juan Pérez:** `dr.juan.perez@demo.com` / `demo123`
- **Dra. Carmen Rodríguez:** `dra.carmen.rodriguez@demo.com` / `demo123`

### **Pacientes:**
- Ana López: `ana.lopez@demo.com` / `demo123`
- Carlos Ruiz: `carlos.ruiz@demo.com` / `demo123`
- Sofía Martínez: `sofia.martinez@demo.com` / `demo123`
- Miguel Torres: `miguel.torres@demo.com` / `demo123`
- Lucía Hernández: `lucia.hernandez@demo.com` / `demo123`
- José Martín: `jose.martin@demo.com` / `demo123`
- Elena García: `elena.garcia@demo.com` / `demo123`
- Roberto Silva: `roberto.silva@demo.com` / `demo123`

---

## 📁 **ESTRUCTURA DEL PROYECTO**

```
nutri/
├── src/                          # Backend (Node.js + Express)
│   ├── modules/                  # Módulos de la aplicación
│   │   ├── auth/                 # Autenticación JWT
│   │   ├── patients/             # Gestión de pacientes
│   │   ├── clinical_records/     # Expedientes clínicos
│   │   ├── appointments/         # Sistema de citas
│   │   └── nutritionists/        # Gestión de nutriólogos
│   ├── database/                 # Entidades y configuración DB
│   └── middleware/               # Middlewares de autenticación
├── nutri-web/                    # Frontend (React 19 + TypeScript)
│   ├── src/
│   │   ├── components/           # Componentes reutilizables
│   │   ├── pages/                # Páginas de la aplicación
│   │   ├── hooks/                # Hooks personalizados
│   │   └── services/             # Servicios de API
└── scripts/                      # Scripts de utilidad
```

---

## 🔧 **ENDPOINTS PRINCIPALES**

### **Autenticación:**
- `POST /api/auth/login` - Login
- `POST /api/auth/register` - Registro
- `GET /api/auth/me` - Perfil actual

### **Pacientes:**
- `GET /api/patients/my-patients` - Pacientes del nutriólogo
- `POST /api/patients` - Crear paciente
- `PUT /api/patients/:id` - Actualizar paciente
- `GET /api/patients/:id` - Obtener paciente

### **Expedientes:**
- `POST /api/clinical-records` - Crear expediente
- `GET /api/clinical-records/:patientId` - Obtener expediente
- `PUT /api/clinical-records/:id` - Actualizar expediente

### **Citas:**
- `POST /api/appointments` - Crear cita
- `GET /api/appointments` - Listar citas
- `PUT /api/appointments/:id` - Actualizar cita

---

## 📊 **ESTADO DE FUNCIONALIDADES**

### ✅ **COMPLETADAS (100%):**
- 🔐 Autenticación JWT
- 👥 Gestión de pacientes
- 📋 Expedientes clínicos
- 📅 Sistema de citas
- 🏠 Dashboard principal

### 🚧 **EN DESARROLLO:**
- 💳 Integración de pagos (0%)
- 🤖 Generación de planes con IA (0%)
- 📱 Aplicación móvil (0%)

---

## 🎯 **PRÓXIMOS PASOS**

### **Semana 1-2: Integración de Pagos**
- [ ] Configurar Mercado Pago
- [ ] Implementar split payments
- [ ] Crear webhooks
- [ ] Sistema de comisiones

### **Semana 3-4: IA y Planes**
- [ ] Integrar Google Cloud Healthcare API
- [ ] Configurar Vertex AI/Gemini
- [ ] Desarrollar prompts nutricionales
- [ ] Sistema de aprobación

### **Semana 5-6: App Móvil MVP**
- [ ] Elegir tecnología (React Native/Flutter)
- [ ] Registro de pacientes
- [ ] Búsqueda de nutriólogos
- [ ] Gestión básica

---

## 🔍 **SOLUCIÓN DE PROBLEMAS**

### **Error 404 "Perfil de paciente no encontrado":**
```bash
# Ejecutar script de reparación
npx ts-node create-multiple-nutritionists.ts
```

### **Problemas de conexión a BD:**
```bash
# Verificar conexión
npx ts-node test-db-connection.ts

# Reiniciar servicios
./stop-app.ps1
./start-app.ps1
```

### **Problemas de autenticación:**
- Verificar que el token JWT sea válido
- Limpiar localStorage del navegador
- Verificar que el usuario tenga el rol correcto

---

## 📝 **NOTAS IMPORTANTES**

1. **Cumplimiento Normativo:** Los expedientes clínicos nunca se eliminan
2. **Escalabilidad:** Sistema maneja múltiples nutriólogos simultáneos
3. **Seguridad:** Autenticación JWT con refresh tokens
4. **Monetización:** 25% de comisión sobre consultas
5. **IA:** Integración con Google Cloud para planes nutricionales

---

## 🎯 **URLS DE ACCESO**

- **Frontend:** http://localhost:5000
- **Backend:** http://localhost:4000
- **API Docs:** http://localhost:4000/api-docs

---

## 📞 **CONTACTO Y SOPORTE**

Para problemas técnicos o consultas sobre el desarrollo, revisar:
- `REGISTRO_ACTIVIDADES_DIARIAS.md` - Actividad reciente
- `SEGUIMIENTO_AVANCES_PROYECTO.md` - Progreso detallado
- `FUNCIONALIDADES_COMPLETADAS.md` - Estado de funcionalidades 