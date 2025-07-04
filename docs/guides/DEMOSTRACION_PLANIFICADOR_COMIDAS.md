# Demostración Práctica: Planificador de Comidas Manual

## 🎯 Objetivo de la Demostración

Mostrar cómo el nutriólogo puede crear un plan nutricional completo de 4 semanas con comidas manuales, utilizando el sistema de planificación implementado.

## 📋 Pasos para la Demostración

### Paso 1: Acceder al Planificador

1. **Ir a la página de Planes Nutricionales**
   - Navegar a "Planes Nutricionales" en el menú principal
   - Buscar un plan existente o crear uno nuevo

2. **Abrir el Planificador de Comidas**
   - Hacer clic en el botón "Planificar Comidas" en cualquier plan
   - Se abrirá el modal del planificador

### Paso 2: Configuración Inicial

**El planificador muestra**:
- **Título**: "Planificador de Comidas - Semana 1"
- **Badge**: "5 comidas/día" (configurable)
- **Selector de semana**: Dropdown para cambiar entre semanas
- **Botones de acción**: "Cargar Ejemplo" y "Nueva Semana"

### Paso 3: Cargar Comidas de Ejemplo

1. **Hacer clic en "📋 Cargar Ejemplo"**
   - Se cargarán automáticamente 4 comidas de ejemplo:
     - **Lunes - Desayuno**: Avena con frutas y nueces (450 kcal)
     - **Lunes - Almuerzo**: Pollo con arroz integral (650 kcal)
     - **Martes - Desayuno**: Huevos con pan integral (520 kcal)
     - **Miércoles - Cena**: Salmón con quinoa (580 kcal)

2. **Observar los cambios en la tabla**:
   - Las celdas vacías se llenan con información de las comidas
   - Se muestran descripciones, calorías y botones de edición
   - Los totales diarios se calculan automáticamente

### Paso 4: Agregar Comidas Manualmente

1. **Seleccionar una celda vacía** (ej: Martes - Almuerzo)
2. **Hacer clic en "Agregar"**
3. **Completar el formulario**:

   **Información básica**:
   - **Día**: Martes (seleccionado automáticamente)
   - **Tipo de Comida**: Almuerzo
   - **Horario**: 13:00

   **Descripción de la comida**:
   ```
   Ensalada César con pechuga de pollo a la plancha, 
   crutones integrales y aderezo ligero
   ```

   **Notas adicionales**:
   ```
   Incluir 100g de pollo, 2 tazas de lechuga romana, 
   1/4 taza de crutones, 2 cucharadas de aderezo
   ```

   **Totales nutricionales**:
   - **Calorías**: 420 kcal
   - **Proteínas**: 35g
   - **Carbohidratos**: 25g
   - **Grasas**: 18g

4. **Hacer clic en "Guardar Comida"**

### Paso 5: Editar Comidas Existentes

1. **Hacer clic en el botón de edición (lápiz)** en cualquier comida
2. **Modificar los valores** según sea necesario
3. **Guardar los cambios**

### Paso 6: Ver Totales Calculados

**Totales diarios** (ejemplo para Lunes):
- **Calorías**: 1100 kcal (450 + 650)
- **Proteínas**: 60g (15 + 45)
- **Carbohidratos**: 120g (65 + 55)
- **Grasas**: 30g (12 + 18)

**Totales semanales**:
- Se calculan automáticamente en la parte inferior
- Se muestran en una tarjeta con colores distintivos

### Paso 7: Crear Nuevas Semanas

1. **Hacer clic en "Nueva Semana"**
2. **Se creará automáticamente la Semana 2**
3. **Repetir el proceso** para llenar las 4 semanas

### Paso 8: Guardar el Plan Completo

1. **Revisar todos los datos** en las diferentes semanas
2. **Hacer clic en "Guardar Plan"**
3. **El plan se guardará** en el backend
4. **Cerrar el planificador**

## 🎨 Características Demostradas

### 1. Interfaz Intuitiva
- **Tabla organizada**: Filas por tipo de comida, columnas por día
- **Iconos descriptivos**: 🌅 Desayuno, ☕ Merienda, 🍽️ Almuerzo, etc.
- **Botones claros**: Agregar, Editar, Eliminar

### 2. Funcionalidad Completa
- **Formulario detallado**: Todos los campos necesarios
- **Validación**: Campos requeridos marcados
- **Cálculos automáticos**: Totales diarios y semanales

### 3. Flexibilidad
- **Adaptación dinámica**: Se ajusta al número de comidas configuradas
- **Horarios personalizables**: Cada comida puede tener su hora
- **Notas detalladas**: Espacio para instrucciones específicas

### 4. Experiencia de Usuario
- **Feedback visual**: Cambios inmediatos en la tabla
- **Navegación fácil**: Entre semanas y comidas
- **Acciones rápidas**: Agregar, editar, eliminar con un clic

## 📊 Ejemplo de Plan Completo

### Semana 1 - Plan de Pérdida de Peso

**Lunes**:
- **08:00 - Desayuno**: Avena con frutas (450 kcal)
- **10:30 - Merienda**: Yogur griego (280 kcal)
- **13:00 - Almuerzo**: Pollo con arroz (650 kcal)
- **16:00 - Merienda**: Manzana con almendras (200 kcal)
- **19:00 - Cena**: Salmón con quinoa (580 kcal)
- **Total**: 2160 kcal

**Martes**:
- **08:00 - Desayuno**: Huevos con pan (520 kcal)
- **10:30 - Merienda**: Batido de proteínas (300 kcal)
- **13:00 - Almuerzo**: Ensalada César (420 kcal)
- **16:00 - Merienda**: Naranja con nueces (180 kcal)
- **19:00 - Cena**: Atún con verduras (500 kcal)
- **Total**: 1920 kcal

## ✅ Beneficios Demostrados

### 1. Control Total
- El nutriólogo tiene control completo sobre cada comida
- No depende de una base de datos predefinida
- Puede personalizar según las necesidades específicas del paciente

### 2. Eficiencia
- Interfaz rápida para agregar comidas
- Cálculos automáticos de totales
- Navegación fluida entre semanas

### 3. Precisión
- Entrada directa de valores nutricionales
- Validación de datos en tiempo real
- Seguimiento detallado de macronutrientes

### 4. Personalización
- Descripciones específicas para cada paciente
- Horarios adaptados al estilo de vida
- Notas detalladas para preparación

## 🚀 Resultado Final

Al completar la demostración, el nutriólogo tendrá:
- **Plan nutricional completo** de 4 semanas
- **Comidas detalladas** con descripciones y valores nutricionales
- **Totales calculados** automáticamente
- **Plan guardado** y listo para usar
- **Vista de detalles** funcional que muestra todas las comidas

El sistema está completamente funcional y listo para uso en producción, proporcionando una herramienta poderosa y flexible para la planificación nutricional manual. 