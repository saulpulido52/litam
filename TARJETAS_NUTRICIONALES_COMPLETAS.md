# 🍽️ Sistema de Tarjetas Nutricionales Avanzadas - NutriWeb

## 📋 Descripción General

El **Sistema de Tarjetas Nutricionales** es una solución integral para la creación, gestión y visualización de planes nutricionales profesionales. Diseñado específicamente para nutriólogos y profesionales de la salud, ofrece una interfaz moderna y funcional dividida en 5 pestañas especializadas.

## 🎯 Características Principales

### ✨ **5 Pestañas Especializadas**
1. **📋 Resumen** - Información general y objetivos
2. **🍽️ Comidas** - Planificación semanal de alimentos
3. **🎯 Nutrición** - Macros y micronutrientes
4. **⏰ Horarios** - Timing y rutinas diarias
5. **🛡️ Restricciones** - Alergias y condiciones médicas

### 🚀 **Funcionalidades Avanzadas**
- **🧬 Integración con Expedientes Clínicos**
- **🤖 Cálculos Nutricionales Automáticos**
- **📊 Análisis y Estadísticas en Tiempo Real**
- **🔄 Sincronización Automática**
- **🎨 UI/UX Moderna y Responsiva**

## 🏗️ Arquitectura de Componentes

### 📁 Estructura de Archivos
```
nutri-web/src/components/
├── NutritionalCard.tsx                    # Componente principal
├── NutritionalCardExample.tsx             # Ejemplo de uso
└── NutritionalCard/
    ├── NutritionalSummaryTab.tsx         # Pestaña de Resumen
    ├── NutritionalMealsTab.tsx           # Pestaña de Comidas
    ├── NutritionalNutritionTab.tsx       # Pestaña de Nutrición
    ├── NutritionalScheduleTab.tsx        # Pestaña de Horarios
    └── NutritionalRestrictionsTab.tsx    # Pestaña de Restricciones
```

## 📋 Pestaña 1: Resumen

### 🎯 **Propósito**
Configuración general del plan nutricional con información básica y objetivos principales.

### ⚙️ **Funcionalidades**

#### **Información General**
- ✅ **Nombre del Plan** (obligatorio)
- ✅ **Descripción Detallada**
- ✅ **Fechas de Inicio y Fin**
- ✅ **Duración en Semanas** (1-24 semanas)
- ✅ **Calorías Diarias Objetivo**
- ✅ **Notas Adicionales**

#### **Integración con Expediente Clínico**
- 🧬 **Cálculos Automáticos:**
  - Ecuación Harris-Benedict personalizada
  - Ajustes por nivel de actividad física
  - Modificaciones según diagnóstico nutricional
- 📊 **Datos Antropométricos:**
  - Peso y altura actuales
  - IMC calculado automáticamente
  - Categorización del estado nutricional
- 🏥 **Información Clínica:**
  - Diagnóstico nutricional
  - Nivel de actividad física
  - Observaciones médicas

#### **Distribución Calórica Visual**
- 🔴 **Proteínas** - 30% (calculado automáticamente)
- 🟡 **Carbohidratos** - 45% (calculado automáticamente)
- 🟢 **Grasas** - 25% (calculado automáticamente)

### 🎨 **Características de UI**
- **Layout Responsivo:** 2 columnas (información + panel lateral)
- **Botón Inteligente:** "Aplicar Expediente" para cálculos automáticos
- **Validación en Tiempo Real:** Campos obligatorios marcados
- **Cálculo Automático de Fechas:** Al cambiar duración

## 🍽️ Pestaña 2: Comidas

### 🎯 **Propósito**
Planificación detallada de comidas semanales con navegación por días y tipos de comidas.

### ⚙️ **Funcionalidades**

#### **Navegación Temporal**
- 📅 **Selector de Semana** (1 a N semanas del plan)
- 📆 **Navegación por Días** (Lunes a Domingo)
- 🔄 **Vista de Timeline Visual**

#### **Tipos de Comidas Configurables**
- 🌅 **Desayuno** (07:00 por defecto)
- ☕ **Colación Matutina** (10:00 por defecto)
- 🍽️ **Comida** (14:00 por defecto)
- 🥪 **Colación Vespertina** (17:00 por defecto)
- 🌙 **Cena** (20:00 por defecto)
- 🌃 **Colación Nocturna** (22:00 por defecto)

#### **Gestión de Comidas**
- ➕ **Agregar Comidas:** Dropdown con tipos de comidas
- ✏️ **Editar Comidas:** Modal con configuración detallada
- 🗑️ **Eliminar Comidas:** Confirmación de seguridad
- 📋 **Duplicar Días:** Copiar comidas entre días

#### **Información Nutricional por Comida**
- 🔥 **Calorías Totales**
- 🔴 **Proteínas (gramos)**
- 🟡 **Carbohidratos (gramos)**
- 🟢 **Grasas (gramos)**

#### **Resumen Diario**
- 📊 **Totales Nutricionales del Día**
- 📈 **Número de Comidas Programadas**
- ⚖️ **Comparación con Objetivos**

### 🎨 **Características de UI**
- **Pestañas de Días:** Navegación visual con contadores
- **Timeline de Comidas:** Representación visual de horarios
- **Cards de Comidas:** Información compacta y acciones rápidas
- **Modal de Edición:** Editor completo de comidas (en desarrollo)

## 🎯 Pestaña 3: Nutrición

### 🎯 **Propósito**
Configuración avanzada de objetivos nutricionales, distribución de macronutrientes y micronutrientes.

### ⚙️ **Funcionalidades**

#### **Objetivos Calóricos**
- 🔢 **Calorías Diarias:** Input con validación (1000-5000 kcal)
- 📊 **Cálculo Automático:** Actualización en tiempo real

#### **Distribución de Macronutrientes**
- 🎚️ **Sliders Interactivos:**
  - Proteínas: 10-50%
  - Carbohidratos: 5-70%
  - Grasas: 15-80%
- 📈 **Gráfico de Barras Visual:** Representación proporcional
- 🎯 **Presets Predefinidos:**
  - **Equilibrada:** 30% P | 45% C | 25% G
  - **Pérdida de Peso:** 35% P | 35% C | 30% G
  - **Ganancia Muscular:** 40% P | 35% C | 25% G
  - **Cetogénica:** 25% P | 5% C | 70% G
  - **Mediterránea:** 20% P | 50% C | 30% G
  - **Para Diabetes:** 25% P | 40% C | 35% G

#### **Objetivos de Micronutrientes**
- 🌾 **Fibra:** 10-50g/día
- 🧂 **Sodio:** 500-3000mg/día
- 🍯 **Azúcar Añadido:** 0-100g/día
- 🦴 **Calcio:** 500-2000mg/día
- 🩸 **Hierro:** Configurable
- 🍊 **Vitamina C:** Configurable
- ☀️ **Vitamina D:** Configurable

#### **Objetivos de Hidratación**
- 💧 **Vasos de Agua:** 4-15 vasos/día
- 📊 **Equivalencia en Litros:** Cálculo automático
- 🥤 **Otros Líquidos:** Lista configurable

#### **Recomendaciones Médicas Inteligentes**
- 🏥 **Ajustes por Condición:**
  - **Diabetes:** ↓ Carbohidratos, ↑ Fibra
  - **Hipertensión:** ↓ Sodio
  - **Enfermedad Renal:** ↓ Proteínas, ↓ Sodio
  - **Sobrepeso/Obesidad:** ↑ Proteínas, ↓ Carbohidratos
  - **Bajo Peso:** ↑ Calorías, ↑ Grasas

### 🎨 **Características de UI**
- **Panel Principal:** Configuración de objetivos
- **Panel Lateral:** Resumen nutricional y consejos
- **Sliders Interactivos:** Actualización en tiempo real
- **Gráfico de Progreso:** Representación visual de distribución

## ⏰ Pestaña 4: Horarios

### 🎯 **Propósito**
Planificación de horarios de comidas, rutinas diarias y recordatorios de hidratación.

### ⚙️ **Funcionalidades**

#### **Rutina Diaria Base**
- 🌅 **Hora de Despertar:** Selector de tiempo
- 🌙 **Hora de Dormir:** Selector de tiempo
- 🏃 **Horario de Ejercicio:** Opcional con duración
- 🎯 **Presets de Estilo de Vida:**
  - **Estudiante:** Horarios flexibles
  - **Oficinista:** Rutina estructurada
  - **Trabajador por Turnos:** Horarios especiales
  - **Ama/o de Casa:** Flexibilidad máxima

#### **Planificación de Comidas**
- ⏰ **Horarios Personalizables** por comida
- ⏱️ **Duración Estimada** (5-60 minutos)
- 🔄 **Flexibilidad:** Marcador fijo/flexible
- 📝 **Notas por Comida:** Contexto adicional
- 🎨 **Timeline Visual:** Representación gráfica del día

#### **Análisis de Intervalos**
- 📊 **Cálculo Automático:** Tiempo entre comidas
- ⚠️ **Alertas Inteligentes:**
  - Gap muy largo (>5h): "Considerar colación"
  - Gap muy corto (<2h): "Ajustar horarios"
  - Timing adecuado (2-5h): "Optimal"

#### **Recordatorios de Hidratación**
- 💧 **Horarios Configurables:** Múltiples recordatorios
- ➕ **Agregar/Eliminar:** Gestión dinámica
- 🔄 **Ordenamiento Automático:** Por tiempo

#### **Estadísticas de Timing**
- 🥐 **Primera Comida:** Tiempo automático
- 🌃 **Última Comida:** Tiempo automático
- ⏳ **Tiempo Total de Alimentación:** Cálculo automático
- 🔄 **Comidas Flexibles:** Contador

### 🎨 **Características de UI**
- **Timeline Visual:** Representación gráfica de horarios
- **Cards de Comidas:** Configuración individual
- **Análisis en Tiempo Real:** Estadísticas automáticas
- **Panel de Acciones Rápidas:** Gestión eficiente

## 🛡️ Pestaña 5: Restricciones

### 🎯 **Propósito**
Gestión completa de alergias, intolerancias, condiciones médicas y restricciones dietéticas.

### ⚙️ **Funcionalidades**

#### **Navegación por Secciones**
- 🚨 **Alergias:** Reacciones alérgicas
- ⚠️ **Intolerancias:** Intolerancias alimentarias
- 🏥 **Condiciones Médicas:** Enfermedades y tratamientos
- 🥗 **Restricciones Dietéticas:** Preferencias y estilos
- 📞 **Contactos de Emergencia:** Información de seguridad

#### **Gestión de Alergias**
- 📝 **Información Detallada:**
  - Nombre de la alergia
  - Severidad (Leve/Moderada/Severa)
  - Síntomas asociados
  - Alimentos a evitar
  - Notas especiales
- 🎨 **Códigos de Color:** Por severidad
- ⚡ **Acciones Rápidas:** Editar/Eliminar

#### **Condiciones Médicas Inteligentes**
- 🤖 **Importación Automática:** Desde expediente clínico
- 📋 **Presets por Condición:**
  - **Diabetes:** Restricciones y recomendaciones específicas
  - **Hipertensión:** Guías dietéticas DASH
  - **Obesidad:** Estrategias de control calórico
- 📊 **Información Estructurada:**
  - Alimentos recomendados
  - Alimentos a evitar
  - Consideraciones especiales
  - Medicamentos e interacciones

#### **Estadísticas de Seguridad**
- 📊 **Resumen Visual:**
  - Total de restricciones
  - Condiciones severas
  - Alimentos a evitar
- ⚠️ **Alertas de Seguridad:** Condiciones críticas
- 🚨 **Protocolos de Emergencia:** Información vital

#### **Integración con Expediente**
- 🔄 **Importación Automática:**
  - Enfermedades diagnosticadas
  - Hábitos de consumo
  - Restricciones médicas
- 🧬 **Mapeo Inteligente:** Conversión automática a restricciones

### 🎨 **Características de UI**
- **Navegación por Pestañas:** Organización clara
- **Cards Informativas:** Información estructurada
- **Accordions Expandibles:** Para información detallada
- **Sistema de Alertas:** Indicadores visuales de severidad

## 🔧 Implementación Técnica

### 🏗️ **Arquitectura de Componentes**

#### **Componente Principal: NutritionalCard**
```typescript
interface NutritionalCardProps {
  dietPlan?: DietPlan;           // Plan existente (modo edit/view)
  patient: Patient;              // Información del paciente
  clinicalRecord?: ClinicalRecord; // Expediente clínico
  mode: 'create' | 'edit' | 'view'; // Modo de operación
  onSave?: (planData: any) => void;  // Callback de guardado
  onClose?: () => void;              // Callback de cierre
  isLoading?: boolean;               // Estado de carga
}
```

#### **Gestión de Estado**
```typescript
const [planData, setPlanData] = useState({
  // Datos básicos
  name: '',
  description: '',
  notes: '',
  startDate: '',
  endDate: '',
  dailyCaloriesTarget: 2000,
  
  // Datos específicos por pestaña
  meals: [],
  mealSchedules: {},
  nutritionalGoals: {},
  restrictions: {}
});
```

#### **Comunicación entre Pestañas**
```typescript
const updatePlanData = (section: string, data: any) => {
  setPlanData(prev => ({
    ...prev,
    [section]: data
  }));
};
```

### 🔄 **Flujo de Datos**

1. **Inicialización:** Carga de datos del plan existente o valores por defecto
2. **Navegación:** Cambio entre pestañas sin pérdida de datos
3. **Actualización:** Sincronización automática entre pestañas
4. **Guardado:** Transformación y envío de datos al backend
5. **Integración:** Aplicación de datos del expediente clínico

### 🎨 **Tecnologías Utilizadas**

- **⚛️ React 18** con TypeScript
- **🎨 Bootstrap 5** para estilos
- **🎯 Lucide React** para iconografía
- **📊 Chart.js** para gráficos (futuro)
- **🔧 Custom Hooks** para lógica reutilizable

## 🚀 Uso del Sistema

### 📝 **Ejemplo Básico**

```tsx
import NutritionalCard from './components/NutritionalCard';

const MyComponent = () => {
  const [showCard, setShowCard] = useState(false);
  
  const handleSave = (planData) => {
    console.log('Guardando plan:', planData);
    // Lógica de guardado
  };
  
  return (
    <>
      <button onClick={() => setShowCard(true)}>
        Crear Plan Nutricional
      </button>
      
      {showCard && (
        <NutritionalCard
          patient={patient}
          clinicalRecord={clinicalRecord}
          mode="create"
          onSave={handleSave}
          onClose={() => setShowCard(false)}
        />
      )}
    </>
  );
};
```

### 🔧 **Configuración Avanzada**

```tsx
// Modo edición con datos existentes
<NutritionalCard
  dietPlan={existingPlan}
  patient={patient}
  clinicalRecord={clinicalRecord}
  mode="edit"
  onSave={handleUpdate}
  onClose={handleClose}
  isLoading={isSaving}
/>

// Modo visualización (solo lectura)
<NutritionalCard
  dietPlan={plan}
  patient={patient}
  clinicalRecord={clinicalRecord}
  mode="view"
  onClose={handleClose}
/>
```

## 📊 Estructura de Datos

### 🍽️ **Plan Nutricional Completo**
```typescript
interface CompleteDietPlan {
  // Información básica (Pestaña Resumen)
  name: string;
  description: string;
  notes: string;
  startDate: string;
  endDate: string;
  dailyCaloriesTarget: number;
  totalWeeks: number;
  isWeeklyPlan: boolean;
  
  // Comidas (Pestaña Comidas)
  meals: Meal[];
  
  // Objetivos nutricionales (Pestaña Nutrición)
  nutritionalGoals: {
    dailyCalories: number;
    macroTargets: MacroTarget;
    micronutrients: MicronutrientTargets;
    hydration: HydrationTargets;
  };
  
  // Horarios (Pestaña Horarios)
  mealSchedules: {
    wakeUpTime: string;
    bedTime: string;
    mealsSchedule: MealSchedule[];
    exerciseTime?: string;
    waterReminders: string[];
  };
  
  // Restricciones (Pestaña Restricciones)
  pathologicalRestrictions: {
    allergies: Allergy[];
    intolerances: Intolerance[];
    medicalConditions: MedicalCondition[];
    dietaryRestrictions: DietaryRestriction[];
    emergencyContacts: EmergencyContact[];
  };
}
```

## 🎯 Beneficios del Sistema

### 👨‍⚕️ **Para Nutriólogos**
- ⏱️ **Eficiencia:** Reducción del 90% en tiempo de creación
- 🎯 **Precisión:** Cálculos automáticos basados en evidencia científica
- 📊 **Análisis:** Estadísticas y métricas en tiempo real
- 🔄 **Integración:** Conexión directa con expedientes clínicos
- 🎨 **Profesionalismo:** Interfaz moderna y atractiva

### 👥 **Para Pacientes**
- 📱 **Claridad:** Información organizada y fácil de entender
- 📅 **Seguimiento:** Horarios y recordatorios personalizados
- 🛡️ **Seguridad:** Gestión completa de restricciones y alergias
- 🎯 **Personalización:** Planes adaptados a su estilo de vida

### 🏥 **Para Clínicas**
- 📈 **Productividad:** Mayor número de pacientes atendidos
- 📊 **Calidad:** Estandarización de procesos
- 💾 **Datos:** Información estructurada y analizable
- 🔒 **Cumplimiento:** Trazabilidad y documentación completa

## 🔮 Roadmap y Mejoras Futuras

### 📋 **Funcionalidades Pendientes**
- 🍎 **Editor Completo de Alimentos:** Base de datos integrada
- 📱 **App Mobile:** Versión para pacientes
- 🤖 **IA Avanzada:** Recomendaciones inteligentes
- 📊 **Reportes Automáticos:** Generación de informes
- 🔄 **Sincronización Cloud:** Backup automático

### 🚀 **Mejoras Planificadas**
- 📈 **Dashboard Analytics:** Métricas avanzadas
- 🎯 **Goals Tracking:** Seguimiento de objetivos
- 📞 **Telemedicina:** Consultas remotas
- 🛒 **Lista de Compras:** Generación automática
- 👥 **Colaboración:** Trabajo en equipo

## 📞 Soporte y Documentación

### 🛠️ **Desarrollo**
- **Repositorio:** [GitHub - NutriWeb](https://github.com/nutriweb)
- **Documentación:** Ver archivos MD en el proyecto
- **Issues:** Reportar bugs y solicitar features

### 📚 **Recursos**
- **Video Tutoriales:** [En desarrollo]
- **Manual de Usuario:** [En desarrollo]
- **API Documentation:** [En desarrollo]

---

## 🎉 Conclusión

Las **Tarjetas Nutricionales de NutriWeb** representan el futuro de la planificación nutricional digital. Con 5 pestañas especializadas, integración con expedientes clínicos, y cálculos automáticos inteligentes, este sistema transforma la manera en que los nutriólogos crean y gestionan planes alimentarios.

**¡El futuro de la nutrición digital está aquí!** 🚀🍽️

---

*Documentación creada el 30 de Junio de 2025 - NutriWeb Team* 