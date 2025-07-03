import { AppDataSource } from './src/database/data-source';
import { User } from './src/database/entities/user.entity';
import { DietPlan, DietPlanStatus } from './src/database/entities/diet_plan.entity';
import { PatientNutritionistRelation, RelationshipStatus } from './src/database/entities/patient_nutritionist_relation.entity';

async function createCompleteDietPlan() {
  try {
    console.log('🔧 Inicializando conexión a base de datos...');
    await AppDataSource.initialize();
    
    const userRepository = AppDataSource.getRepository(User);
    const dietPlanRepository = AppDataSource.getRepository(DietPlan);
    const relationRepository = AppDataSource.getRepository(PatientNutritionistRelation);
    
    console.log('👨‍⚕️ Buscando nutricionista del sistema...');
    const nutritionist = await userRepository.findOne({
      where: { email: 'nutri.admin@sistema.com' },
      relations: ['role']
    });
    
    if (!nutritionist) {
      throw new Error('Nutricionista por defecto no encontrado');
    }
    
    console.log('👤 Buscando paciente hiradprueba...');
    const patient = await userRepository.findOne({
      where: { email: 'hiradprueba@gmail.com' },
      relations: ['role']
    });
    
    if (!patient) {
      throw new Error('Paciente hiradprueba no encontrado');
    }
    
    console.log('🔗 Verificando relación nutricionista-paciente...');
    let relation = await relationRepository.findOne({
      where: {
        patient: { id: patient.id },
        nutritionist: { id: nutritionist.id }
      }
    });
    
    if (!relation) {
      console.log('🔗 Creando relación nutricionista-paciente...');
      relation = new PatientNutritionistRelation();
      relation.patient = patient;
      relation.nutritionist = nutritionist;
      relation.status = RelationshipStatus.ACTIVE;
      await relationRepository.save(relation);
      console.log('✅ Relación creada exitosamente');
    } else {
      console.log('✅ Relación existente encontrada');
    }
    
    console.log('📋 Creando plan nutricional con restricciones patológicas completas...');
    
    // Construir pathological_restrictions completo
    const pathologicalRestrictions = {
      // Condiciones médicas
      medical_conditions: [
        {
          name: 'Diabetes Tipo 2',
          category: 'metabolic',
          severity: 'moderate',
          description: 'Diabetes mellitus tipo 2 diagnosticada, requiere control glucémico',
          dietary_implications: ['Control de carbohidratos', 'Índice glucémico bajo'],
          restricted_foods: ['Azúcar refinada', 'Dulces', 'Bebidas azucaradas'],
          recommended_foods: ['Vegetales de hoja verde', 'Proteína magra', 'Granos integrales'],
          monitoring_requirements: ['Glucosa en sangre diaria', 'HbA1c trimestral'],
          emergency_instructions: 'En caso de hipoglucemia, consumir 15g de carbohidratos rápidos'
        },
        {
          name: 'Hipertensión',
          category: 'cardiovascular',
          severity: 'mild',
          description: 'Hipertensión arterial controlada con medicación',
          dietary_implications: ['Reducción de sodio', 'Aumento de potasio'],
          restricted_foods: ['Sal excesiva', 'Alimentos procesados', 'Embutidos'],
          recommended_foods: ['Frutas ricas en potasio', 'Vegetales frescos', 'Pescado'],
          monitoring_requirements: ['Presión arterial semanal'],
          emergency_instructions: 'Contactar médico si presión >180/110'
        }
      ],
      
      // Alergias
      allergies: [
        {
          allergen: 'Lactosa',
          type: 'food',
          severity: 'moderate',
          symptoms: ['Distensión abdominal', 'Gases', 'Diarrea'],
          cross_reactions: ['Productos lácteos', 'Suero de leche'],
          emergency_medication: 'Lactasa 9000 FCC',
          avoidance_instructions: 'Evitar completamente productos lácteos sin lactasa'
        },
        {
          allergen: 'Nueces',
          type: 'food',
          severity: 'severe',
          symptoms: ['Urticaria', 'Dificultad respiratoria', 'Hinchazón'],
          cross_reactions: ['Almendras', 'Avellanas', 'Pistachos'],
          emergency_medication: 'EpiPen disponible',
          avoidance_instructions: 'Evitar completamente nueces y productos que puedan contener trazas'
        }
      ],
      
      // Intolerancias
      intolerances: [
        {
          substance: 'Gluten',
          type: 'food',
          severity: 'mild',
          symptoms: ['Molestia abdominal', 'Fatiga'],
          threshold_amount: 'Trazas ocasionales tolerables',
          alternatives: ['Arroz', 'Quinoa', 'Avena sin gluten'],
          preparation_notes: 'Usar utensilios separados para evitar contaminación cruzada'
        }
      ],
      
      // Medicamentos
      medications: [
        {
          name: 'Metformina',
          dosage: '500mg',
          frequency: 'Dos veces al día con comidas',
          food_interactions: ['Tomar con alimentos para reducir efectos gastrointestinales'],
          timing_requirements: 'Desayuno y cena'
        },
        {
          name: 'Lisinopril',
          dosage: '10mg',
          frequency: 'Una vez al día',
          food_interactions: ['Evitar sustitutos de sal con potasio'],
          timing_requirements: 'Por la mañana, misma hora diaria'
        }
      ],
      
      // Consideraciones especiales
      special_considerations: [
        '🌱 Dieta vegetariana preferida',
        '🥛 Sin lactosa por intolerancia',
        '🚫 Sin gluten por sensibilidad',
        '🧂 Bajo en sodio por hipertensión',
        '💧 Ingesta de agua: 2.5L diarios para función renal',
        '🌾 Objetivo de fibra: 35g diarios para control glucémico',
        '🍽️ Número de comidas: 6 por día (3 principales + 3 colaciones)',
        '📊 Distribución calórica: 25% desayuno, 30% almuerzo, 25% cena, 20% colaciones',
        '⏰ Horarios de comidas: Desayuno 7:00, Media mañana 10:00, Almuerzo 13:00, Merienda 16:00, Cena 19:00, Colación nocturna 21:00',
        '🌙 Hora de dormir: 22:30 para optimizar metabolismo'
      ],
      
      emergency_contacts: [
        {
          name: 'Dr. María García',
          relationship: 'Endocrinólogo',
          phone: '+52-555-123-4567',
          is_primary: true
        },
        {
          name: 'Farmacia San Ángel',
          relationship: 'Farmacia de confianza',
          phone: '+52-555-987-6543',
          is_primary: false
        }
      ]
    };
    
    // Crear el plan nutricional
    const newDietPlan = new DietPlan();
    newDietPlan.name = 'Plan Nutricional Integral con Restricciones Completas';
    newDietPlan.description = 'Plan personalizado para diabetes tipo 2, hipertensión, con alergias e intolerancias múltiples';
    newDietPlan.patient = patient;
    newDietPlan.nutritionist = nutritionist;
    newDietPlan.notes = 'Plan creado específicamente para demostrar funcionalidad completa de restricciones patológicas';
    newDietPlan.start_date = new Date();
    newDietPlan.end_date = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 días
    newDietPlan.daily_calories_target = 1800;
    newDietPlan.daily_macros_target = {
      protein: 135, // 30%
      carbohydrates: 180, // 40%
      fats: 60 // 30%
    };
    newDietPlan.generated_by_ia = false;
    newDietPlan.ia_version = null;
    newDietPlan.status = DietPlanStatus.DRAFT;
    newDietPlan.is_weekly_plan = true;
    newDietPlan.total_weeks = 4;
    newDietPlan.weekly_plans = [];
    newDietPlan.pathological_restrictions = pathologicalRestrictions; // ¡CAMPO CLAVE!
    
    const savedPlan = await dietPlanRepository.save(newDietPlan);
    
    console.log('✅ Plan nutricional creado exitosamente!');
    console.log(`📋 ID del plan: ${savedPlan.id}`);
    console.log(`👤 Paciente: ${patient.email}`);
    console.log(`👨‍⚕️ Nutricionista: ${nutritionist.email}`);
    
    console.log('\n🔍 Verificando datos guardados...');
    const verifyPlan = await dietPlanRepository.findOne({
      where: { id: savedPlan.id },
      relations: ['patient', 'nutritionist']
    });
    
    if (verifyPlan?.pathological_restrictions) {
      const restrictions = verifyPlan.pathological_restrictions as any;
      console.log(`\n📊 Restricciones patológicas guardadas:`);
      console.log(`   ❤️ Condiciones médicas: ${restrictions.medical_conditions?.length || 0}`);
      console.log(`   ⚠️ Alergias: ${restrictions.allergies?.length || 0}`);
      console.log(`   🤧 Intolerancias: ${restrictions.intolerances?.length || 0}`);
      console.log(`   💊 Medicamentos: ${restrictions.medications?.length || 0}`);
      console.log(`   ✨ Consideraciones especiales: ${restrictions.special_considerations?.length || 0}`);
      console.log(`   🚨 Contactos de emergencia: ${restrictions.emergency_contacts?.length || 0}`);
      
      console.log('\n📋 Detalles de condiciones médicas:');
      restrictions.medical_conditions?.forEach((condition: any, i: number) => {
        console.log(`   ${i + 1}. ${condition.name} (${condition.severity}): ${condition.description}`);
      });
      
      console.log('\n🚨 Detalles de alergias:');
      restrictions.allergies?.forEach((allergy: any, i: number) => {
        console.log(`   ${i + 1}. ${allergy.allergen} (${allergy.severity}): ${allergy.avoidance_instructions}`);
      });
      
      console.log('\n✨ Consideraciones especiales:');
      restrictions.special_considerations?.forEach((consideration: string, i: number) => {
        console.log(`   ${i + 1}. ${consideration}`);
      });
    } else {
      console.log('❌ No se encontraron restricciones patológicas en el plan guardado');
    }
    
    console.log('\n🎯 INSTRUCCIONES PARA PROBAR:');
    console.log('1. Ve al frontend (http://localhost:5173)');
    console.log('2. Inicia sesión como nutricionista@nutri.com');
    console.log('3. Ve a "Planes Nutricionales"');
    console.log(`4. Busca el plan "${savedPlan.name}"`);
    console.log('5. Haz clic en "Ver Detalles"');
    console.log('6. Navega al tab "Restricciones" 🛡️');
    console.log('7. ¡Deberías ver TODA la información estructurada!');
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
    }
  }
}

createCompleteDietPlan(); 