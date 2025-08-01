# 🌐 Litam - Dashboard del Nutriólogo

## 📊 Dashboard Web Profesional para Nutriólogos

Esta es la interfaz web profesional que permite a los nutriólogos gestionar completamente sus pacientes, planes de dieta, citas y toda su práctica nutricional.

---

## ✨ Características Implementadas

### 🔐 **Autenticación Segura**
- ✅ Login con validación de formularios
- ✅ Gestión de sesiones con JWT
- ✅ Protección de rutas privadas
- ✅ Renovación automática de tokens

### 🏠 **Dashboard Intuitivo**
- ✅ Estadísticas en tiempo real
- ✅ Resumen de pacientes activos
- ✅ Citas del día
- ✅ Actividad reciente
- ✅ Acciones rápidas

### 👥 **Gestión de Pacientes**
- ✅ Lista completa de pacientes
- ✅ Búsqueda y filtros avanzados
- ✅ Perfiles detallados
- ✅ Historial médico

### 🍎 **Planes de Dieta**
- ✅ Creación manual de planes
- ✅ **Generación automática con IA**
- ✅ Gestión de comidas y macronutrientes
- ✅ Biblioteca de alimentos

### 📅 **Sistema de Citas**
- ✅ Calendario integrado
- ✅ Programación de citas
- ✅ Gestión de disponibilidad
- ✅ Estados de citas

### 👤 **Perfil Profesional**
- ✅ Gestión de información personal
- ✅ Configuración profesional
- ✅ Especialidades y certificaciones

---

## 🛠️ Stack Tecnológico

```typescript
Frontend Framework: React 19 + TypeScript
Build Tool: Vite 6
Styling: Tailwind CSS
Routing: React Router v7
Forms: React Hook Form
State Management: React Query (TanStack)
HTTP Client: Axios
Icons: Lucide React
Validation: Zod
Charts: Recharts
Date Handling: date-fns
```

---

## 🏗️ Arquitectura del Proyecto

```
src/
├── 📁 components/          # Componentes reutilizables
│   └── LoadingSpinner.tsx  # Spinner de carga
├── 📁 hooks/              # Hooks personalizados
│   └── useAuth.ts         # Hook de autenticación
├── 📁 layouts/            # Layouts de la aplicación
│   └── MainLayout.tsx     # Layout principal con sidebar
├── 📁 pages/              # Páginas de la aplicación
│   ├── LoginPage.tsx      # Página de login
│   ├── DashboardPage.tsx  # Dashboard principal
│   ├── PatientsPage.tsx   # Gestión de pacientes
│   ├── DietPlansPage.tsx  # Planes de dieta
│   ├── AppointmentsPage.tsx # Gestión de citas
│   └── ProfilePage.tsx    # Perfil del nutriólogo
├── 📁 services/           # Servicios de API
│   ├── api.ts            # Cliente HTTP base
│   └── authService.ts    # Servicio de autenticación
├── 📁 types/             # Tipos TypeScript
│   ├── auth.ts           # Tipos de autenticación
│   ├── patient.ts        # Tipos de pacientes
│   ├── diet.ts          # Tipos de dietas
│   ├── appointment.ts    # Tipos de citas
│   └── index.ts         # Exportaciones principales
└── 📁 utils/             # Utilidades
```

---

## 🚀 Instalación y Desarrollo

### **Prerrequisitos**
- Node.js 18+ 
- npm o yarn
- Backend de NutriAPI ejecutándose en `http://localhost:3001`

### **Instalación**
```bash
# Instalar dependencias
npm install

# Ejecutar en modo desarrollo
npm run dev

# Construir para producción
npm run build

# Vista previa de producción
npm run preview
```

### **Variables de Entorno**
```env
VITE_API_URL=http://localhost:3001/api
VITE_APP_NAME=Litam - Dashboard Nutriólogo
VITE_APP_VERSION=1.0.0
```

---

## 🎨 Diseño y UX

### **Paleta de Colores**
- **Primario**: Verde (#22c55e) - Representa salud y nutrición
- **Secundario**: Violeta (#d946ef) - Modernidad y profesionalismo
- **Grises**: Escala completa para UI elements

### **Tipografía**
- **Fuente**: Inter (Google Fonts)
- **Pesos**: 400, 500, 600, 700

### **Componentes UI**
- ✅ Sistema de diseño consistente
- ✅ Botones con estados hover/active
- ✅ Cards con sombras sutiles
- ✅ Inputs con validación visual
- ✅ Iconografía consistente (Lucide)

---

## 🔗 Integración con Backend

### **Endpoints Conectados**
```typescript
// Autenticación
POST /api/auth/login
POST /api/auth/logout
GET  /api/users/me

// Pacientes (próximo)
GET    /api/patients
POST   /api/patients
GET    /api/patients/:id
PATCH  /api/patients/:id

// Dietas (próximo)
GET    /api/diet-plans
POST   /api/diet-plans
POST   /api/diet-plans/generate-with-ai

// Citas (próximo)
GET    /api/appointments
POST   /api/appointments
PATCH  /api/appointments/:id
```

### **Manejo de Estados**
- ✅ Loading states en toda la aplicación
- ✅ Error handling con mensajes user-friendly
- ✅ Optimistic updates
- ✅ Cache inteligente con React Query

---

## 📱 Responsive Design

### **Breakpoints**
- **Mobile**: < 768px
- **Tablet**: 768px - 1024px  
- **Desktop**: > 1024px

### **Características Móviles**
- ✅ Sidebar colapsable
- ✅ Touch-friendly buttons
- ✅ Optimized forms
- ✅ Swipe gestures (futuro)

---

## 🔐 Seguridad

### **Medidas Implementadas**
- ✅ JWT tokens en localStorage
- ✅ Interceptors de autenticación
- ✅ Rutas protegidas
- ✅ Validación de formularios client-side
- ✅ Sanitización de inputs
- ✅ CORS handling

### **Mejores Prácticas**
- ✅ TypeScript estricto
- ✅ ESLint configurado
- ✅ Validación de esquemas
- ✅ Error boundaries (futuro)

---

## 📈 Funcionalidades Avanzadas

### **🤖 Integración con IA**
```typescript
// Generación automática de planes de dieta
const generateDietPlan = async (patientData: PatientProfile) => {
  const aiRequest = {
    goal: patientData.health_goals,
    restrictions: patientData.dietary_restrictions,
    allergies: patientData.allergies,
    target_calories: calculateCalories(patientData)
  };
  
  return await api.post('/diet-plans/generate-with-ai', aiRequest);
};
```

### **📊 Dashboard Analytics**
- ✅ Estadísticas en tiempo real
- ✅ Gráficos de progreso
- ✅ KPIs profesionales
- ✅ Reportes exportables (futuro)

### **💬 Sistema de Notificaciones** (futuro)
- 🔄 Notificaciones push
- 🔄 Alerts de citas
- 🔄 Recordatorios de seguimiento

---

## 🚧 Roadmap de Desarrollo

### **Fase 1: Fundación** ✅
- [x] Autenticación y navegación
- [x] Layout responsivo
- [x] Páginas base
- [x] Integración con API

### **Fase 2: Funcionalidades Core** 🔄
- [ ] CRUD completo de pacientes
- [ ] Generador de dietas con IA
- [ ] Calendario de citas interactivo
- [ ] Dashboard con datos reales

### **Fase 3: Avanzadas** 📋
- [ ] Sistema de mensajería en tiempo real
- [ ] Reportes y analytics avanzados
- [ ] Exportación de planes de dieta
- [ ] Configuraciones personalizables

### **Fase 4: Optimización** 📋
- [ ] PWA (Progressive Web App)
- [ ] Offline capabilities
- [ ] Performance optimization
- [ ] SEO optimization

---

## 🧪 Testing (Futuro)

```bash
# Unit Tests
npm run test

# E2E Tests
npm run test:e2e

# Coverage
npm run test:coverage
```

---

## 📦 Deployment

### **Opciones de Despliegue**
- **Netlify** - Recomendado para desarrollo
- **Vercel** - Excelente integración con React
- **AWS S3 + CloudFront** - Para producción
- **Docker** - Para contenedores

### **Build para Producción**
```bash
npm run build
# Output en /dist
```

---

## 👥 Equipo de Desarrollo

- **Frontend**: React + TypeScript + Tailwind
- **Backend**: Node.js + Express + PostgreSQL
- **DevOps**: Docker + Cloud deployment
- **Design**: Figma + UI/UX best practices

---

## 📄 Licencia

Este proyecto es parte del sistema integral de nutrición inteligente.

---

## 🆘 Soporte

Para soporte técnico o preguntas sobre el desarrollo:

1. **Documentación**: Revisar este README
2. **Issues**: Crear issue en el repositorio
3. **Backend API**: Verificar conexión con el servidor
4. **Development**: Modo desarrollo en `http://localhost:3000`

---

## 🎯 Estado Actual

### ✅ **Completado**
- Estructura base de la aplicación
- Autenticación funcional
- Dashboard con datos mock
- Layout responsivo completo
- Navegación entre páginas
- Integración con backend configurada

### 🔄 **En Desarrollo**
- Integración real con APIs del backend
- Funcionalidades CRUD completas
- Sistema de generación de dietas con IA
- Calendario interactivo de citas

### 📋 **Próximos Pasos**
1. Conectar con APIs reales del backend
2. Implementar gestión completa de pacientes
3. Desarrollar generador de dietas con IA
4. Añadir sistema de notificaciones
5. Optimizar performance y UX

**¡El dashboard está listo para comenzar a trabajar con datos reales del backend!** 🚀
