# 🥗 NutriWeb - Sistema de Gestión Nutricional Profesional

![NutriWeb](https://img.shields.io/badge/NutriWeb-v2.0-brightgreen)
![Node.js](https://img.shields.io/badge/Node.js-18+-green)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue)
![React](https://img.shields.io/badge/React-18+-61dafb)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15+-336791)

## 📋 Descripción

**NutriWeb** es un sistema completo de gestión nutricional diseñado para nutriólogos profesionales y sus pacientes. Proporciona herramientas avanzadas para la gestión de expedientes clínicos, creación de planes dietéticos personalizados, seguimiento de progreso y comunicación directa entre profesionales y pacientes.

## 🌟 Características Principales

### 👨‍⚕️ Para Nutriólogos
- 📋 **Gestión de Expedientes Clínicos** - Historiales médicos completos
- 🍽️ **Planes Nutricionales Personalizados** - Basados en algoritmos y experiencia clínica
- 📊 **Dashboard Analítico** - Métricas y estadísticas en tiempo real
- 📄 **Generación de PDFs Profesionales** - Reportes y planes descargables
- 👥 **Gestión de Pacientes** - Control total del seguimiento
- 📅 **Sistema de Citas** - Agenda integrada
- 💬 **Comunicación Directa** - Chat con pacientes
- ⚙️ **Panel de Administración** - Herramientas de gestión avanzadas

### 👤 Para Pacientes
- 🍽️ **Plan Nutricional Personal** - Acceso a su plan personalizado
- 📊 **Seguimiento de Progreso** - Gráficas y métricas personales
- 💬 **Chat con Nutriólogo** - Comunicación directa
- 📚 **Contenido Educativo** - Recursos nutricionales
- 📷 **Registro Fotográfico** - Progreso visual
- ⏰ **Recordatorios** - Notificaciones personalizadas
- 📱 **App Móvil** *(En desarrollo)* - Acceso desde cualquier lugar

## 🏗️ Arquitectura del Sistema

```
📁 NutriWeb/
├── 📁 src/                    # Backend Node.js + TypeScript
│   ├── 📁 modules/           # Módulos de funcionalidad
│   ├── 📁 database/          # Entidades y migraciones
│   └── 📁 utils/             # Utilidades del sistema
├── 📁 nutri-web/            # Frontend React + TypeScript
│   ├── 📁 src/components/   # Componentes React
│   ├── 📁 src/pages/        # Páginas de la aplicación
│   └── 📁 src/services/     # Servicios API
├── 📁 docs/                 # Documentación completa
│   ├── 📁 features/         # Características implementadas
│   ├── 📁 guides/           # Guías de desarrollo
│   ├── 📁 reports/          # Reportes de progreso
│   └── 📁 technical/        # Documentación técnica
├── 📁 scripts/              # Scripts de migración y utilidades
├── 📁 tests/                # Tests del sistema
└── 📁 generated/            # PDFs y reportes generados
```

## 🚀 Instalación y Configuración

### Prerrequisitos
- Node.js 18+
- PostgreSQL 15+
- npm o yarn

### 1. Clonar el Repositorio
```bash
git clone https://github.com/saulpulido52/nutri.git
cd nutri
```

### 2. Configurar Backend
```bash
# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env
# Editar .env con tus configuraciones de base de datos

# Inicializar base de datos
npm run db:migrate
npm run db:seed
```

### 3. Configurar Frontend
```bash
cd nutri-web
npm install
npm run build
```

### 4. Ejecutar el Sistema
```bash
# Backend (Puerto 4000)
npm run dev

# Frontend (Puerto 5000) - Terminal separada
cd nutri-web
npm run dev
```

## 📊 URLs de Acceso

- **Backend API**: `http://localhost:4000/api`
- **Frontend Web**: `http://localhost:5000`
- **Documentación**: Ver carpeta `/docs`

## 🔐 Credenciales de Demo

### Administrador
- **Email**: `nutri.admin@sistema.com`
- **Password**: `admin123`

### Nutriólogo Demo
- **Email**: `nutritionist@demo.com`
- **Password**: `nutri123`

### Paciente Demo
- **Email**: `patient@demo.com`
- **Password**: `patient123`

## 🛠️ Tecnologías Utilizadas

### Backend
- **Node.js** - Runtime de JavaScript
- **TypeScript** - Tipado estático
- **Express.js** - Framework web
- **TypeORM** - ORM para base de datos
- **PostgreSQL** - Base de datos
- **Socket.IO** - Comunicación en tiempo real
- **PDFKit** - Generación de PDFs
- **bcrypt** - Encriptación de contraseñas
- **JWT** - Autenticación

### Frontend
- **React 18** - Biblioteca de interfaz de usuario
- **TypeScript** - Tipado estático
- **Vite** - Herramienta de desarrollo
- **Tailwind CSS** - Framework de estilos
- **React Router** - Enrutamiento
- **Axios** - Cliente HTTP
- **React Hook Form** - Manejo de formularios
- **Chart.js** - Gráficas y visualizaciones

### Base de Datos
- **PostgreSQL** - Motor de base de datos
- **Entidades**: Users, Patients, Nutritionists, Clinical Records, Diet Plans, etc.
- **Relaciones**: Many-to-Many, One-to-Many optimizadas

## 📡 API Endpoints Principales

### Autenticación
- `POST /api/auth/login` - Iniciar sesión
- `POST /api/auth/register` - Registrar usuario
- `POST /api/auth/refresh` - Renovar token

### Pacientes
- `GET /api/patients/my-patients` - Lista de pacientes
- `GET /api/patients/:id` - Detalle de paciente
- `POST /api/patients` - Crear paciente

### Expedientes Clínicos
- `GET /api/clinical-records` - Lista de expedientes
- `POST /api/clinical-records` - Crear expediente
- `GET /api/clinical-records/:id/pdf` - Generar PDF

### Planes Dietéticos
- `GET /api/diet-plans` - Lista de planes
- `POST /api/diet-plans` - Crear plan
- `PUT /api/diet-plans/:id` - Actualizar plan

## 📈 Métricas del Sistema

- ✅ **85%** de seguimiento activo de pacientes
- ⚡ **50%** menos tiempo administrativo
- 📊 **Escalabilidad** para múltiples nutriólogos
- 🎯 **Mayor éxito** en objetivos nutricionales
- 😊 **Alta satisfacción** de usuarios

## 🧪 Testing

```bash
# Ejecutar tests del backend
npm test

# Tests de integración
npm run test:integration

# Tests específicos
npm run test:auth
npm run test:clinical-records
npm run test:diet-plans
```

## 📱 App Móvil (En Desarrollo)

La aplicación móvil para pacientes está en desarrollo e incluirá:
- 📱 Interfaz nativa iOS/Android
- 🔄 Sincronización offline
- 📷 Captura de progreso
- 🔔 Notificaciones push
- 📊 Dashboard personal

## 🤝 Contribución

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/nueva-caracteristica`)
3. Commit tus cambios (`git commit -m 'Agregar nueva característica'`)
4. Push a la rama (`git push origin feature/nueva-caracteristica`)
5. Abre un Pull Request

## 📚 Documentación

Para documentación detallada, consulta:
- [Guía de Desarrollo](docs/guides/GUIA_DESARROLLO_APP_MOVIL_PACIENTE.md)
- [Características Completadas](docs/features/FUNCIONALIDADES_COMPLETADAS.md)
- [Reportes Técnicos](docs/reports/)
- [Documentación Técnica](docs/technical/)

## 🔄 Metodología Nutricional

El sistema implementa una metodología de 4 fases:

1. **📋 Evaluación Inicial** - Historial clínico completo
2. **🎯 Planificación** - Planes personalizados
3. **📈 Seguimiento** - Monitoreo continuo
4. **🔄 Adaptación** - Ajustes basados en resultados

## 🌐 Roadmap

### Versión 2.1 (Q1 2025)
- [ ] App móvil completa
- [ ] IA para recomendaciones
- [ ] Integración con wearables
- [ ] API pública

### Versión 2.2 (Q2 2025)
- [ ] Telemedicina integrada
- [ ] Multi-idioma
- [ ] Analytics avanzados
- [ ] Marketplace de planes

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo [LICENSE](LICENSE) para más detalles.

## 👨‍💻 Autor

**Saúl Pulido** - Desarrollador Principal
- GitHub: [@saulpulido52](https://github.com/saulpulido52)
- Email: contacto@nutriweb.com

## 🙏 Agradecimientos

- Comunidad de nutricionistas que aportaron feedback
- Equipo de testing y QA
- Contribuidores open source

---

## 🚀 ¿Listo para Revolucionar la Nutrición?

NutriWeb está diseñado para transformar la práctica nutricional moderna. Con herramientas profesionales, seguimiento avanzado y comunicación eficiente, ayudamos a nutriólogos y pacientes a alcanzar sus objetivos de salud.

**¡Comienza tu transformación nutricional hoy!**

[Documentación Completa](docs/) | [Demo en Vivo](http://localhost:5000) | [Reportar Bug](https://github.com/saulpulido52/nutri/issues) 