# 🛡️ Herramientas de Integridad de Datos - Panel de Administración

## 📋 Descripción

Herramientas integradas en el panel de administración para monitorear y reparar la integridad de datos del sistema, específicamente para resolver problemas de relaciones nutriólogo-paciente huérfanas.

## 🔗 Endpoints Disponibles

### 1. **Salud del Sistema**
```http
GET /api/admin/system/health
```

**Descripción:** Obtiene métricas generales de salud del sistema y estado de integridad.

**Respuesta:**
```json
{
  "status": "success",
  "data": {
    "timestamp": "2025-07-02T23:00:00.000Z",
    "metrics": {
      "users": {
        "total": 30,
        "active": 28,
        "activePercentage": 93
      },
      "relations": {
        "total": 8,
        "active": 8,
        "activePercentage": 100
      },
      "dietPlans": {
        "total": 16
      }
    },
    "integrity": {
      "status": "EXCELENTE",
      "hasProblems": false,
      "problemsCount": 0
    },
    "status": "HEALTHY"
  }
}
```

### 2. **Diagnóstico de Integridad**
```http
GET /api/admin/system/integrity/diagnosis
```

**Descripción:** Ejecuta un diagnóstico completo de integridad de datos.

**Respuesta:**
```json
{
  "status": "success",
  "message": "Diagnóstico de integridad de datos completado.",
  "data": {
    "timestamp": "2025-07-02T23:00:00.000Z",
    "users": {
      "total": 30,
      "nutritionists": 8,
      "patients": 21,
      "active": 30,
      "inactive": 0
    },
    "relations": {
      "total": 8,
      "active": 8,
      "inactive": 0,
      "pending": 0,
      "rejected": 0
    },
    "dietPlans": {
      "total": 16,
      "orphan": 0,
      "valid": 16
    },
    "integrity": {
      "status": "EXCELENTE",
      "hasProblems": false,
      "problemsCount": 0
    },
    "orphanPlans": [],
    "recommendations": [
      "No se detectaron problemas de integridad",
      "Sistema funcionando correctamente"
    ]
  }
}
```

### 3. **Reparación de Integridad**
```http
POST /api/admin/system/integrity/repair?dryRun=true
```

**Parámetros:**
- `dryRun` (query): `true` para simulación, `false` para ejecución real

**Descripción:** Repara automáticamente problemas de integridad detectados.

**Respuesta (Simulación):**
```json
{
  "status": "success",
  "message": "Simulación completada: 0 relaciones serían creadas",
  "data": {
    "timestamp": "2025-07-02T23:00:00.000Z",
    "mode": "SIMULACIÓN",
    "summary": {
      "relationsToCreate": 0,
      "successfulCreations": 0,
      "errors": 0,
      "totalActions": 0
    },
    "actions": []
  }
}
```

**Respuesta (Ejecución Real):**
```json
{
  "status": "success",
  "message": "Reparación completada: 8 relaciones creadas, 0 errores",
  "data": {
    "timestamp": "2025-07-02T23:00:00.000Z",
    "mode": "EJECUCIÓN REAL",
    "summary": {
      "relationsToCreate": 8,
      "successfulCreations": 8,
      "errors": 0,
      "totalActions": 8
    },
    "actions": [
      {
        "action": "CREATED",
        "nutritionistEmail": "dr.juan.perez@demo.com",
        "patientEmail": "lucia.hernandez@demo.com",
        "plansCount": 4,
        "planNames": ["plan detallado", "plan de prueba2", "123"]
      }
    ]
  }
}
```

## 🔐 Autenticación

**Requerido:** Token JWT de administrador

```bash
Authorization: Bearer <admin_jwt_token>
```

## 📦 Ejemplos de Uso

### Con cURL

```bash
# 1. Verificar salud del sistema
curl -X GET "http://localhost:4000/api/admin/system/health" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"

# 2. Ejecutar diagnóstico
curl -X GET "http://localhost:4000/api/admin/system/integrity/diagnosis" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"

# 3. Simulación de reparación
curl -X POST "http://localhost:4000/api/admin/system/integrity/repair?dryRun=true" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"

# 4. Reparación real (¡CUIDADO!)
curl -X POST "http://localhost:4000/api/admin/system/integrity/repair?dryRun=false" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

### Con JavaScript (Frontend)

```javascript
// Configuración base
const API_BASE = 'http://localhost:4000/api/admin';
const headers = {
  'Authorization': `Bearer ${adminToken}`,
  'Content-Type': 'application/json'
};

// 1. Obtener salud del sistema
async function getSystemHealth() {
  const response = await fetch(`${API_BASE}/system/health`, { headers });
  return await response.json();
}

// 2. Ejecutar diagnóstico
async function runDiagnosis() {
  const response = await fetch(`${API_BASE}/system/integrity/diagnosis`, { headers });
  return await response.json();
}

// 3. Reparar integridad (simulación)
async function simulateRepair() {
  const response = await fetch(`${API_BASE}/system/integrity/repair?dryRun=true`, {
    method: 'POST',
    headers
  });
  return await response.json();
}

// 4. Reparar integridad (real)
async function executeRepair() {
  const response = await fetch(`${API_BASE}/system/integrity/repair?dryRun=false`, {
    method: 'POST',
    headers
  });
  return await response.json();
}
```

## 🚨 Estados de Integridad

### `HEALTHY` / `EXCELENTE`
- ✅ No se detectaron problemas
- ✅ Todas las relaciones están activas
- ✅ No hay planes huérfanos

### `WARNING` / `PROBLEMAS_DETECTADOS`
- ⚠️ Se encontraron planes huérfanos
- ⚠️ Relaciones inactivas con planes asociados
- 🔧 Reparación automática disponible

## 🛠️ Flujo de Trabajo Recomendado

### 1. **Monitoreo Regular**
```bash
# Ejecutar semanalmente
GET /api/admin/system/health
```

### 2. **Detección de Problemas**
```bash
# Si status = "WARNING"
GET /api/admin/system/integrity/diagnosis
```

### 3. **Planificación de Reparación**
```bash
# Primero simular
POST /api/admin/system/integrity/repair?dryRun=true
```

### 4. **Ejecución de Reparación**
```bash
# Solo si la simulación es satisfactoria
POST /api/admin/system/integrity/repair?dryRun=false
```

### 5. **Verificación Post-Reparación**
```bash
# Confirmar que se solucionó
GET /api/admin/system/health
```

## 🔒 Seguridad

### Protecciones Implementadas

1. **Solo Administradores:** Endpoints protegidos con rol `ADMIN`
2. **Simulación por Defecto:** `dryRun=true` por defecto
3. **Validación de Roles:** Verifica roles antes de crear relaciones
4. **Logs Detallados:** Todas las acciones se registran en logs
5. **Rollback Seguro:** No elimina datos existentes

### Precauciones

- ⚠️ **SIEMPRE** ejecutar simulación primero
- ⚠️ Verificar logs antes de ejecución real
- ⚠️ Hacer backup antes de reparaciones masivas
- ⚠️ Ejecutar en horarios de bajo tráfico

## 📊 Métricas y Monitoreo

### Indicadores Clave

- **Total de usuarios activos**
- **Porcentaje de relaciones activas**
- **Número de planes huérfanos**
- **Tiempo de última verificación**

### Alertas Recomendadas

- 🚨 `plans.orphan > 0` → Ejecutar reparación
- ⚠️ `relations.activePercentage < 90%` → Investigar
- 📊 `users.activePercentage < 80%` → Revisión general

## 🔗 Integración con Frontend

### Componente de Monitoreo

```typescript
interface SystemHealth {
  metrics: {
    users: { total: number; active: number; activePercentage: number };
    relations: { total: number; active: number; activePercentage: number };
    dietPlans: { total: number };
  };
  integrity: {
    status: 'EXCELENTE' | 'PROBLEMAS_DETECTADOS';
    hasProblems: boolean;
    problemsCount: number;
  };
  status: 'HEALTHY' | 'WARNING';
}
```

### Dashboard de Admin

```typescript
function IntegrityDashboard() {
  const [health, setHealth] = useState<SystemHealth | null>(null);
  
  useEffect(() => {
    getSystemHealth().then(setHealth);
  }, []);
  
  return (
    <div className="integrity-dashboard">
      <HealthIndicator status={health?.status} />
      <MetricsGrid metrics={health?.metrics} />
      <RepairActions />
    </div>
  );
}
```

---

## ✅ Resumen

Estas herramientas proporcionan:

1. **🔍 Monitoreo continuo** de la integridad del sistema
2. **🚨 Detección automática** de problemas de datos
3. **🔧 Reparación segura** con simulación previa
4. **📊 Métricas detalladas** para toma de decisiones
5. **🛡️ Prevención** de problemas futuros

**¡Tu sistema ahora tiene herramientas de autodiagnóstico y autoreparación integradas directamente en el panel de administración!** 