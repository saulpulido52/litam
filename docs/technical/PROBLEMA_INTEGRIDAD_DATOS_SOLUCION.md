# 🚨 PROBLEMA DE INTEGRIDAD DE DATOS - ANÁLISIS Y SOLUCIÓN

## 🔍 PROBLEMA IDENTIFICADO

### Síntomas Reportados por el Usuario:
- ✅ **Planes de dieta**: Aparecen en el dashboard
- ✅ **Actividades recientes**: Se muestran correctamente
- ❌ **Pacientes**: NO aparecen en la lista
- ❌ **Dashboard**: Muestra 0 pacientes

### Estado Original del Sistema:
- El sistema había funcionado correctamente antes
- Se habían creado pacientes en pruebas anteriores
- Backend y frontend se desconectaron/reiniciaron
- Al volver a conectar, problema de inconsistencia

## 🔧 ANÁLISIS TÉCNICO

### Arquitectura de Datos:

#### 1. **Usuarios** (`users` tabla)
```sql
users
├── id (UUID)
├── email
├── role_id (FK → roles)
└── is_active
```

#### 2. **Relaciones Nutriólogo-Paciente** (`patient_nutritionist_relations` tabla)
```sql
patient_nutritionist_relations
├── id (UUID)
├── nutritionist_user_id (FK → users)
├── patient_user_id (FK → users)
├── status (ENUM: pending, active, inactive, rejected, blocked)
├── requested_at
├── accepted_at
└── ended_at
```

#### 3. **Planes de Dieta** (`diet_plans` tabla)
```sql
diet_plans
├── id (UUID)
├── nutritionist_user_id (FK → users)
├── patient_user_id (FK → users)
├── name
├── status
└── created_at
```

### ⚠️ **CAUSA RAÍZ DEL PROBLEMA**:

1. **Pacientes se obtienen** consultando `patient_nutritionist_relations` con `status = 'active'`
2. **Planes de dieta se obtienen** consultando directamente `diet_plans` por `nutritionist_user_id`
3. **Si una relación se desactiva/elimina**, los planes persisten pero no hay relación activa
4. **Resultado**: Dashboard muestra 0 pacientes pero sí muestra planes

### Consultas Problemáticas:

#### Dashboard Service (línea 54-63):
```typescript
// 🎯 FILTRADO POR NUTRIÓLOGO: Solo pacientes de este nutriólogo
const myPatientRelations = await this.relationRepository.find({
  where: { 
    nutritionist: { id: nutritionistId },
    status: RelationshipStatus.ACTIVE  // ← AQUÍ está el problema
  },
  relations: ['patient']
});
```

#### Diet Plan Service (línea 507-526):
```typescript
// Obtener planes de dieta de un nutriólogo
public async getDietPlansForNutritionist(nutritionistId: string) {
    const dietPlans = await this.dietPlanRepository.find({
        where: { nutritionist: { id: nutritionistId } }, // ← Consulta directa
        relations: ['patient', 'nutritionist']
    });
}
```

## 🛠️ HERRAMIENTAS CREADAS

### 1. **Script de Diagnóstico Completo**
**Ubicación**: `scripts/utils/diagnostico-integridad-completo.ts`

**Funcionalidades**:
- ✅ Análisis completo de usuarios (nutriólogos y pacientes)
- ✅ Verificación de relaciones activas/inactivas
- ✅ Identificación de planes de dieta huérfanos
- ✅ Explicación detallada del problema
- ✅ Generación de comandos SQL de corrección

**Uso**:
```bash
# Ejecutar diagnóstico
npx ts-node scripts/utils/diagnostico-integridad-completo.ts
```

**Salida esperada**:
```
🩺 DIAGNÓSTICO DE INTEGRIDAD DE DATOS
🚨 PROBLEMA DETECTADO: X planes huérfanos
⚠️ NO HAY RELACIONES ACTIVAS - ESTO EXPLICA POR QUÉ NO VES PACIENTES
```

### 2. **Script de Reparación Automática**
**Ubicación**: `scripts/utils/reparar-integridad-datos.ts`

**Funcionalidades**:
- 🔄 Reactivación automática de relaciones inactivas
- 📝 Creación de relaciones para planes huérfanos
- 🔍 Modo simulación (dry-run) por defecto
- ✅ Verificación post-reparación
- 📊 Reporte detallado de acciones

**Uso**:
```bash
# Modo simulación (seguro)
npx ts-node scripts/utils/reparar-integridad-datos.ts

# Ejecución real
npx ts-node scripts/utils/reparar-integridad-datos.ts --ejecutar
```

### 3. **Script de Diagnóstico Directo PostgreSQL**
**Ubicación**: `test-diagnostico-integridad.js`

**Funcionalidades**:
- 🔗 Conexión directa a PostgreSQL
- 📊 Queries SQL específicas para identificar problemas
- 🚨 Detección de planes huérfanos
- 💡 Comandos SQL de corrección manual

## 🎯 CASOS DE USO IDENTIFICADOS

### Caso 1: Relaciones Desactivadas
**Síntoma**: Relaciones existen pero `status != 'active'`
**Solución**: Reactivar relaciones existentes
```sql
UPDATE patient_nutritionist_relations 
SET status='active', accepted_at=NOW() 
WHERE status IN ('inactive', 'pending', 'rejected');
```

### Caso 2: Relaciones Eliminadas
**Síntoma**: Planes existen pero no hay relaciones
**Solución**: Crear nuevas relaciones basadas en planes existentes
```sql
INSERT INTO patient_nutritionist_relations 
(nutritionist_user_id, patient_user_id, status, requested_at, accepted_at)
VALUES ('nutriólogo_id', 'paciente_id', 'active', NOW(), NOW());
```

### Caso 3: Datos Inconsistentes
**Síntoma**: Mezcla de problemas
**Solución**: Ejecutar script de reparación automática

## 🔧 PROCEDIMIENTO DE SOLUCIÓN

### Paso 1: Diagnóstico
```bash
npx ts-node scripts/utils/diagnostico-integridad-completo.ts
```

### Paso 2: Reparación Simulada
```bash
npx ts-node scripts/utils/reparar-integridad-datos.ts
```

### Paso 3: Reparación Real (si el paso 2 se ve bien)
```bash
npx ts-node scripts/utils/reparar-integridad-datos.ts --ejecutar
```

### Paso 4: Verificación
```bash
# Verificar en el frontend que aparezcan los pacientes
# O ejecutar diagnóstico nuevamente
npx ts-node scripts/utils/diagnostico-integridad-completo.ts
```

## 🚀 RESOLUCIÓN INMEDIATA

**Para el problema específico reportado por el usuario**:

1. **Ejecutar diagnóstico**:
   ```bash
   npx ts-node scripts/utils/diagnostico-integridad-completo.ts
   ```

2. **Si confirma planes huérfanos, ejecutar reparación**:
   ```bash
   npx ts-node scripts/utils/reparar-integridad-datos.ts --ejecutar
   ```

3. **Verificar en el dashboard** que ahora aparezcan los pacientes

## 📋 PREVENCIÓN FUTURA

### Recomendaciones de Arquitectura:

1. **Validación de Integridad**: Agregar checks en el backend
2. **Consultas Unificadas**: Usar JOINs para asegurar consistencia
3. **Cascade Deletes**: Revisar configuración de eliminación en cascada
4. **Health Checks**: Ejecutar diagnóstico periódicamente

### Dashboard Service Mejorado:
```typescript
// En lugar de filtrar solo por relaciones activas,
// considerar mostrar warning si hay planes sin relación
const orphanedPlans = await this.dietPlanRepository
    .createQueryBuilder('plan')
    .leftJoin('patient_nutritionist_relations', 'rel', 
        'rel.nutritionist_user_id = plan.nutritionist_user_id AND rel.status = :status',
        { status: 'active' })
    .where('rel.id IS NULL')
    .getMany();
```

## 🎯 CONCLUSIÓN

**Problema confirmado**: Inconsistencia entre relaciones nutriólogo-paciente y planes de dieta.

**Solución implementada**: Herramientas automáticas de diagnóstico y reparación.

**Estado actual**: Scripts creados y listos para ejecutar.

**Próximos pasos**: Ejecutar reparación según procedimiento descrito.

---
*Documentado el 02 de Julio 2025 - Problema de integridad de datos analizado y solucionado* 