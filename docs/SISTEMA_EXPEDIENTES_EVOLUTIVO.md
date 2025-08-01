# 📋 Sistema de Expedientes Evolutivos

## 🎯 Descripción General

El Sistema de Expedientes Evolutivos es una funcionalidad avanzada que optimiza el proceso de documentación clínica mediante:

- **🤖 Detección automática** del tipo de expediente
- **⏱️ Formularios simplificados** para seguimientos (5 min vs 20 min)
- **📊 Comparativos automáticos** entre consultas
- **🔄 Herencia de datos estáticos** de expedientes previos
- **📈 Dashboard de métricas** de seguimiento

## 🏗️ Arquitectura del Sistema

### Backend
```
src/database/entities/clinical_record.entity.ts
├── TipoExpediente (enum)
├── Nuevos campos JSONB
└── Índices optimizados

src/modules/clinical_records/
├── clinical_record.dto.ts (DTOs evolutivos)
├── clinical_record.service.ts (Lógica inteligente)
├── clinical_record.controller.ts (5 nuevos endpoints)
└── clinical_record.routes.ts (Rutas API)
```

### Frontend
```
nutri-web/src/components/ClinicalRecords/
├── ExpedienteDetector.tsx (Detección automática)
├── FormularioSeguimiento.tsx (Formulario simplificado)
├── ComparativoAutomatico.tsx (Vista comparativa)
└── DashboardSeguimiento.tsx (Métricas y estadísticas)
```

## 🔗 Nuevos Endpoints API

| Endpoint | Método | Función |
|----------|---------|---------|
| `/clinical-records/detect-type` | POST | Detectar tipo automáticamente |
| `/clinical-records/patient/:id/previous-data` | GET | Obtener datos previos |
| `/clinical-records/compare/:actual/:base` | GET | Comparativo automático |
| `/clinical-records/evolutivo` | POST | Crear expediente evolutivo |
| `/clinical-records/stats/seguimiento` | GET | Estadísticas nutriólogo |

## 🤖 Detección Automática de Tipo

El sistema analiza múltiples factores para determinar el tipo de expediente:

### Factores de Análisis
- **Historial previo**: ¿Tiene expedientes anteriores?
- **Tiempo transcurrido**: Días desde último expediente
- **Motivo consulta**: Palabras clave de urgencia
- **Tipo programado**: Seguimiento, control, anual, etc.

### Lógica de Detección
```typescript
// Urgencia: Palabras clave + consulta no programada
['dolor', 'sangrado', 'fiebre', 'vómito', 'emergencia']

// Seguimiento: ≤30 días desde último expediente
// Control: 30-90 días desde último expediente  
// Inicial: >365 días o primer expediente
```

## 📊 Tipos de Expedientes Soportados

| Tipo | Descripción | Uso Típico |
|------|-------------|------------|
| `inicial` | Evaluación completa primera vez | Pacientes nuevos |
| `seguimiento` | Control rutinario ≤30 días | Monitoreo regular |
| `urgencia` | Consulta no programada | Síntomas agudos |
| `control` | Control 30-90 días | Condiciones crónicas |
| `anual` | Revisión preventiva | Chequeos anuales |
| `pre_operatorio` | Evaluación pre-quirúrgica | Antes cirugías |
| `post_operatorio` | Control post-quirúrgico | Después cirugías |
| `consulta_especialidad` | Consulta especialista | Referidos |
| `telehealth` | Consulta remota | Telemedicina |

## 📋 Formulario Simplificado de Seguimiento

### Campos Optimizados (5 minutos)
- ✅ **Motivo consulta** (obligatorio)
- ✅ **Adherencia al plan** (0-100%)
- ✅ **Nivel satisfacción** (1-5)
- ✅ **Peso actual** (obligatorio)
- ✅ **Presión arterial**
- ✅ **Dificultades y mejoras**
- ✅ **Próximos objetivos**

### Datos Heredados Automáticamente
- 🔄 **Altura** (raramente cambia)
- 🔄 **Antecedentes familiares**
- 🔄 **Alergias conocidas**
- 🔄 **Cirugías previas**
- 🔄 **Enfermedades crónicas**

## 📈 Comparativo Automático

El sistema genera automáticamente comparaciones entre:

### Mediciones Clave
- **Peso**: Tendencia, diferencia, porcentaje cambio
- **IMC**: Calculado automáticamente
- **Cintura**: Indicador de grasa abdominal
- **Presión arterial**: Sistólica y diastólica

### Indicadores Visuales
- 🟢 **Verde**: Mejora (peso ↓, presión ↓)
- 🟡 **Amarillo**: Cambio moderado
- 🔴 **Rojo**: Cambio preocupante
- ⚪ **Gris**: Sin cambio significativo

## 💾 Campos JSONB Avanzados

### Seguimiento Metadata
```json
{
  "adherencia_plan": 85,
  "dificultades": "Horarios de comida irregulares",
  "satisfaccion": 4,
  "cambios_medicamentos": false,
  "mejoras_notadas": "Mayor energía",
  "proximos_objetivos": "Reducir 2kg próximo mes"
}
```

### Análisis Riesgo-Beneficio
```json
{
  "decision": "Continuar plan con modificaciones",
  "riesgos": ["Plateau pérdida peso"],
  "beneficios": ["Mantenimiento energía", "Mejora composición"],
  "alternativas": ["Plan restrictivo", "Más ejercicio"],
  "razonamiento": "Buena adherencia y resultados positivos"
}
```

### Capacidad del Paciente
```json
{
  "comprende_medicamentos": true,
  "conoce_sintomas_alarma": true,
  "sabe_contacto_emergencia": true,
  "puede_auto_monitoreo": true,
  "nivel_independencia": "alto",
  "observaciones": "Muy comprometido con tratamiento"
}
```

## 📊 Dashboard de Métricas

### KPIs Principales
- **Total expedientes**: Volumen general
- **% Seguimientos**: Continuidad atención
- **Actividad 30 días**: Productividad reciente
- **Ratio seguimiento/inicial**: Eficiencia

### Indicadores de Calidad
- 🎯 **Continuidad ≥60%**: Excelente
- 🎯 **Actividad ≥10/mes**: Óptima
- 🎯 **Volumen ≥50**: Alto rendimiento

## 🛠️ Instalación y Configuración

### 1. Backend Setup
```bash
# 1. Aplicar migración (automática en startup)
npm run dev

# 2. Los nuevos campos se agregan automáticamente:
# - tipo_expediente
# - expediente_base_id  
# - seguimiento_metadata
# - analisis_riesgo_beneficio
# - juicio_clinico
# - capacidad_paciente
```

### 2. Frontend Integration
```typescript
// Importar componentes
import ExpedienteDetector from './components/ClinicalRecords/ExpedienteDetector';
import FormularioSeguimiento from './components/ClinicalRecords/FormularioSeguimiento';
import ComparativoAutomatico from './components/ClinicalRecords/ComparativoAutomatico';
import DashboardSeguimiento from './components/ClinicalRecords/DashboardSeguimiento';
```

## 🧪 Testing

### Pruebas Manuales
```bash
# Ejecutar script de pruebas completo
npx ts-node tests/manual/test-sistema-expedientes-evolutivo.ts
```

### Casos de Prueba
1. **Detección automática** - Primer paciente vs seguimiento
2. **Datos previos** - Herencia información estática
3. **Comparativo** - Diferencias entre expedientes
4. **Formulario simplificado** - Creación rápida
5. **Dashboard** - Métricas y estadísticas

## ⚡ Beneficios del Sistema

### Para Nutriólogos
- ⏱️ **75% menos tiempo** en seguimientos
- 📊 **Contexto automático** de evolución
- 🎯 **Enfoque dirigido** a cambios importantes
- 📈 **Métricas de productividad**

### Para Pacientes  
- ⚡ **Consultas más rápidas**
- 🎯 **Preparación dirigida**
- 📱 **Progreso visible**
- 🤝 **Mejor continuidad**

### Para la Clínica
- 📊 **Datos estructurados** para análisis
- 🎯 **Mejor seguimiento** de pacientes
- 💰 **Mayor eficiencia** operativa
- 📈 **Métricas de calidad**

## 🔮 Roadmap Futuro

### Próximas Mejoras
- 🤖 **IA predictiva** para detección
- 📱 **App móvil** para pacientes
- 📊 **Analytics avanzados**
- 🔗 **Integración wearables**
- 📧 **Recordatorios automáticos**

## 🆘 Soporte y Troubleshooting

### Problemas Comunes

**Error: "Cannot access SeguimientoMetadataDto"**
- ✅ Verificar orden de DTOs en clinical_record.dto.ts

**Backend no inicia**
- ✅ Verificar migración aplicada correctamente
- ✅ Comprobar tipos de PostgreSQL

**Frontend: Componentes no cargan**
- ✅ Verificar importaciones React Icons
- ✅ Comprobar token autenticación

### Logs Útiles
```bash
# Backend logs
npm run dev

# Frontend logs  
cd nutri-web && npm run dev
```

---

📝 **Documentación generada**: Sistema Evolutivo de Expedientes v1.0  
🗓️ **Fecha**: Enero 2025  
👨‍💻 **Desarrollado con**: Mejores prácticas médicas 2024-2025 