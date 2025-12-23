# Ejemplo de Uso: Planificador de Comidas Manual

## Descripción General

El sistema de planificación de comidas permite al nutriólogo crear planes nutricionales completos con comidas manuales, sin necesidad de una base de datos de alimentos. El nutriólogo puede ingresar descripciones de comidas y sus valores nutricionales manualmente.

## Funcionalidades Implementadas

### 1. Vista de Detalles del Plan Nutricional

**Ubicación**: Pestaña "Comidas" en el visor de detalles del plan

**Características**:
- Muestra las semanas del plan con sus objetivos nutricionales
- Lista todas las comidas planificadas en formato tabla
- Incluye horarios, descripciones, calorías y macronutrientes
- Soporta tanto comidas con alimentos específicos como descripciones manuales

### 2. Planificador de Comidas Adaptativo

**Ubicación**: Botón "Planificar Comidas" en la página de planes nutricionales

**Características**:
- Se adapta dinámicamente al número de comidas configuradas en el plan
- Permite ingresar descripciones manuales de comidas
- Calcula totales nutricionales automáticamente
- Soporta horarios personalizados

## Ejemplo Práctico: Plan de 4 Semanas

### Paso 1: Crear el Plan Nutricional

1. Ir a "Planes Nutricionales" → "Nuevo Plan"
2. Configurar:
   - **Paciente**: Juan Pérez
   - **Nombre**: Plan de Pérdida de Peso
   - **Duración**: 4 semanas
   - **Comidas por día**: 5
   - **Calorías objetivo**: 1800 kcal/día

### Paso 2: Configurar Horarios

En la pestaña "Horarios":
- **Desayuno**: 08:00
- **Merienda Mañana**: 10:30
- **Almuerzo**: 13:00
- **Merienda Tarde**: 16:00
- **Cena**: 19:00

### Paso 3: Planificar Comidas Manualmente

#### Semana 1 - Día 1 (Lunes)

**Desayuno (08:00)**:
- **Descripción**: Avena con frutas y nueces, jugo de naranja natural
- **Calorías**: 450 kcal
- **Proteínas**: 15g
- **Carbohidratos**: 65g
- **Grasas**: 12g
- **Notas**: Incluir 1 taza de avena, 1/2 taza de frutas mixtas, 2 cucharadas de nueces

**Merienda Mañana (10:30)**:
- **Descripción**: Yogur griego con granola y miel
- **Calorías**: 280 kcal
- **Proteínas**: 18g
- **Carbohidratos**: 35g
- **Grasas**: 8g
- **Notas**: 1 taza de yogur griego natural, 2 cucharadas de granola casera

**Almuerzo (13:00)**:
- **Descripción**: Pechuga de pollo a la plancha con arroz integral y ensalada
- **Calorías**: 650 kcal
- **Proteínas**: 45g
- **Carbohidratos**: 55g
- **Grasas**: 18g
- **Notas**: 150g de pollo, 1/2 taza de arroz integral, ensalada verde con tomate

**Merienda Tarde (16:00)**:
- **Descripción**: Manzana con almendras
- **Calorías**: 200 kcal
- **Proteínas**: 6g
- **Carbohidratos**: 25g
- **Grasas**: 10g
- **Notas**: 1 manzana mediana, 10 almendras

**Cena (19:00)**:
- **Descripción**: Salmón al horno con quinoa y brócoli
- **Calorías**: 520 kcal
- **Proteínas**: 38g
- **Carbohidratos**: 35g
- **Grasas**: 22g
- **Notas**: 120g de salmón, 1/3 taza de quinoa, 1 taza de brócoli

### Paso 4: Totales Diarios Calculados Automáticamente

**Lunes - Totales**:
- **Calorías**: 2100 kcal
- **Proteínas**: 122g
- **Carbohidratos**: 215g
- **Grasas**: 70g

### Paso 5: Repetir para Toda la Semana

El nutriólogo puede:
1. Copiar comidas de un día a otro
2. Modificar comidas específicas
3. Agregar variaciones para evitar monotonía
4. Ajustar porciones según necesidades

### Paso 6: Ver Resultados en el Visor

En la vista de detalles del plan:
- **Pestaña "Comidas"**: Muestra todas las comidas en formato tabla
- **Información mostrada**:
  - Día de la semana
  - Tipo de comida (Desayuno, Almuerzo, etc.)
  - Hora programada
  - Descripción de la comida
  - Calorías totales
  - Macronutrientes (Proteínas, Carbohidratos, Grasas)
  - Notas adicionales

## Ventajas del Sistema Manual

### 1. Flexibilidad Total
- El nutriólogo tiene control completo sobre las comidas
- Puede adaptar las descripciones al paciente específico
- No está limitado por una base de datos predefinida

### 2. Personalización
- Descripciones detalladas y específicas
- Notas personalizadas para cada comida
- Horarios adaptados al estilo de vida del paciente

### 3. Simplicidad
- No requiere búsqueda en base de datos
- Entrada directa de información nutricional
- Interfaz intuitiva y fácil de usar

### 4. Adaptabilidad
- Se ajusta automáticamente al número de comidas configuradas
- Soporta diferentes tipos de planes (3, 4, 5, 6 comidas por día)
- Compatible con diferentes objetivos nutricionales

## Flujo de Trabajo Recomendado

1. **Crear el plan base** con objetivos nutricionales
2. **Configurar horarios** según el estilo de vida del paciente
3. **Planificar comidas** día por día, semana por semana
4. **Revisar totales** para asegurar cumplimiento de objetivos
5. **Ajustar según sea necesario** basado en feedback del paciente
6. **Exportar o compartir** el plan completo

## Notas Técnicas

- Las comidas se guardan en formato JSON en el backend
- El sistema es compatible con planes existentes
- Se pueden exportar los datos en formato JSON
- La interfaz es responsive y funciona en dispositivos móviles
- Los cálculos nutricionales son automáticos y precisos

Este sistema proporciona al nutriólogo una herramienta completa y flexible para crear planes nutricionales personalizados sin las limitaciones de una base de datos predefinida. 