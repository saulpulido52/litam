import { AppDataSource } from './src/database/data-source';
import { ClinicalRecord } from './src/database/entities/clinical_record.entity';
import { User } from './src/database/entities/user.entity';
import { PatientNutritionistRelation, RelationshipStatus } from './src/database/entities/patient_nutritionist_relation.entity';

async function testExpedienteCompleto() {
  try {
    await AppDataSource.initialize();
    console.log('🔍 Probando creación de expediente clínico completo...\n');

    const nutritionistId = 'dd58261c-a7aa-461f-a45d-4028dca0145a';
    const patientId = '5ce326e6-1b80-423e-86cc-404928acffd2'; // MONICA GUADALUPE GUTIERREZ OLIVARES

    // 1. Verificar que el paciente existe y tiene relación activa
    console.log('1️⃣ Verificando paciente y relación...');
    const userRepository = AppDataSource.getRepository(User);
    const relationRepository = AppDataSource.getRepository(PatientNutritionistRelation);

    const patient = await userRepository.findOne({
      where: { id: patientId },
      relations: ['role']
    });

    if (!patient) {
      console.error('❌ Paciente no encontrado');
      return;
    }

    console.log('✅ Paciente encontrado:', {
      id: patient.id,
      nombre: `${patient.first_name} ${patient.last_name}`,
      email: patient.email,
      role: patient.role?.name
    });

    // Verificar relación activa
    const activeRelation = await relationRepository.findOne({
      where: {
        patient: { id: patientId },
        nutritionist: { id: nutritionistId },
        status: RelationshipStatus.ACTIVE
      }
    });

    if (!activeRelation) {
      console.error('❌ No hay relación activa entre paciente y nutricionista');
      return;
    }

    console.log('✅ Relación activa confirmada:', {
      relationId: activeRelation.id,
      status: activeRelation.status
    });

    // 2. Crear expediente clínico completo
    console.log('\n2️⃣ Creando expediente clínico completo...');
    
    const expedienteCompleto = {
      record_date: new Date(),
      expedient_number: '4',
      consultation_reason: 'Control de peso y seguimiento nutricional',
      current_problems: {
        diarrhea: false,
        constipation: true,
        gastritis: false,
        ulcer: false,
        nausea: false,
        pyrosis: false,
        vomiting: false,
        colitis: false,
        mouth_mechanics: 'Normal',
        other_problems: 'Ninguno',
        observations: 'Sin observaciones'
      },
      diagnosed_diseases: {
        has_disease: true,
        disease_name: 'Hipertensión arterial',
        since_when: '2020',
        takes_medication: true,
        medications_list: ['Losartán'],
        has_important_disease: true,
        important_disease_name: 'Diabetes tipo 2',
        takes_special_treatment: false,
        special_treatment_details: '',
        has_surgery: false,
        surgery_details: ''
      },
      family_medical_history: {
        obesity: true,
        diabetes: true,
        hta: true,
        cancer: false,
        hypo_hyperthyroidism: false,
        dyslipidemia: false,
        other_history: 'Ninguno'
      },
      gynecological_aspects: 'No aplica',
      daily_activities: {
        wake_up: '07:00 Despertar',
        breakfast: '08:00 Avena',
        lunch: '14:00 Ensalada',
        dinner: '20:00 Sopa',
        sleep: '23:00 Dormir',
        other_hours: [{ hour: '16:00', activity: 'Ejercicio' }]
      },
      activity_level_description: 'Moderada',
      physical_exercise: {
        performs_exercise: true,
        type: 'Caminata',
        frequency: '3 veces por semana',
        duration: '45 minutos',
        since_when: '2023-01'
      },
      consumption_habits: {
        alcohol: 'Ocasional',
        tobacco: 'No',
        coffee: 'Sí',
        other_substances: 'Ninguna'
      },
      general_appearance: 'Buen estado general, piel y mucosas íntegras',
      blood_pressure: {
        knows_bp: true,
        habitual_bp: '120/80',
        systolic: 130,
        diastolic: 85
      },
      biochemical_indicators: {
        glucose: 110,
        cholesterol: 180,
        triglycerides: 140
      },
      dietary_history: {
        received_nutritional_guidance: true,
        when_received: '2024-06-15',
        adherence_level: 'Buena',
        adherence_reason: 'Mejora en salud',
        food_preparer: 'Paciente',
        eats_at_home_or_out: 'Casa',
        modified_alimentation_last_6_months: true,
        modification_reason: 'Recomendación médica',
        most_hungry_time: 'Tarde',
        preferred_foods: ['Frutas', 'Verduras'],
        disliked_foods: ['Lácteos'],
        malestar_alergia_foods: ['Lácteos'],
        takes_supplements: false,
        supplement_details: ''
      },
      food_group_consumption_frequency: {
        vegetables: 7,
        fruits: 7,
        cereals: 7,
        legumes: 3,
        animal_products: 7,
        milk_products: 0,
        fats: 3,
        sugars: 1,
        alcohol: 1,
        other_frequency: []
      },
      water_consumption_liters: 2.5,
      daily_diet_record: {
        time_intervals: [
          { time: '08:00', foods: 'Avena', quantity: '1 taza' },
          { time: '14:00', foods: 'Ensalada', quantity: '1 plato' }
        ],
        estimated_kcal: 1800
      },
      anthropometric_measurements: {
        current_weight_kg: 68,
        habitual_weight_kg: 75,
        height_m: 1.65,
        arm_circ_cm: 28,
        waist_circ_cm: 85,
        abdominal_circ_cm: 90,
        hip_circ_cm: 95,
        calf_circ_cm: 35,
        triceps_skinfold_mm: 12,
        bicipital_skinfold_mm: 10,
        subscapular_skinfold_mm: 14,
        suprailiac_skinfold_mm: 13
      },
      anthropometric_evaluations: {
        complexion: 'Media',
        ideal_weight_kg: 60,
        imc_kg_t2: 25,
        weight_variation_percent: 10,
        habitual_weight_variation_percent: 5,
        adjusted_ideal_weight_kg: 62,
        waist_hip_ratio_cm: 0.89,
        arm_muscle_area_cm2: 30,
        total_muscle_mass_kg: 45,
        body_fat_percentage: 28,
        total_body_fat_kg: 19,
        fat_free_mass_kg: 49,
        fat_excess_deficiency_percent: 5,
        fat_excess_deficiency_kg: 3,
        triceps_skinfold_percentile: 50,
        subscapular_skinfold_percentile: 55,
        total_body_water_liters: 35
      },
      nutritional_diagnosis: 'Sobrepeso grado I',
      energy_nutrient_needs: {
        get: 1500,
        geb: 1400,
        eta: 100,
        fa: 1.3,
        total_calories: 1800
      },
      nutritional_plan_and_management: 'Dieta hipocalórica balanceada, sin lácteos',
      macronutrient_distribution: {
        carbohydrates_g: 225,
        carbohydrates_kcal: 900,
        carbohydrates_percent: 50,
        proteins_g: 90,
        proteins_kcal: 360,
        proteins_percent: 20,
        lipids_g: 60,
        lipids_kcal: 540,
        lipids_percent: 30
      },
      dietary_calculation_scheme: 'Harris-Benedict modificado',
      menu_details: {
        monday: {
          breakfast: 'Avena',
          lunch: 'Ensalada',
          dinner: 'Sopa'
        }
      },
      evolution_and_follow_up_notes: 'Paciente motivada, buen cumplimiento del plan',
      graph_url: null,
      patient: { id: patientId },
      nutritionist: { id: nutritionistId }
    };

    // 3. Insertar el expediente en la base de datos
    console.log('\n3️⃣ Insertando expediente en la base de datos...');
    const clinicalRecordRepository = AppDataSource.getRepository(ClinicalRecord);
    
    const newExpediente = clinicalRecordRepository.create(expedienteCompleto);
    const savedExpediente = await clinicalRecordRepository.save(newExpediente);

    console.log('✅ Expediente creado exitosamente!');
    console.log('📋 ID del expediente:', savedExpediente.id);
    console.log('📅 Fecha de creación:', savedExpediente.created_at);

    // 4. Verificar que se guardó correctamente
    console.log('\n4️⃣ Verificando expediente guardado...');
    const expedienteVerificado = await clinicalRecordRepository.findOne({
      where: { id: savedExpediente.id },
      relations: ['patient', 'nutritionist']
    });

    if (expedienteVerificado) {
      console.log('✅ Expediente verificado correctamente:');
      console.log('📊 Datos principales:');
      console.log('  - Fecha:', expedienteVerificado.record_date);
      console.log('  - Número:', expedienteVerificado.expedient_number);
      console.log('  - Motivo:', expedienteVerificado.consultation_reason);
      console.log('  - Paciente:', expedienteVerificado.patient?.first_name, expedienteVerificado.patient?.last_name);
      console.log('  - Nutricionista:', expedienteVerificado.nutritionist?.first_name, expedienteVerificado.nutritionist?.last_name);
      
      console.log('\n📋 Información detallada guardada:');
      console.log('  - Problemas actuales:', expedienteVerificado.current_problems ? '✅' : '❌');
      console.log('  - Enfermedades diagnosticadas:', expedienteVerificado.diagnosed_diseases ? '✅' : '❌');
      console.log('  - Historia familiar:', expedienteVerificado.family_medical_history ? '✅' : '❌');
      console.log('  - Aspectos ginecológicos:', expedienteVerificado.gynecological_aspects ? '✅' : '❌');
      console.log('  - Actividades diarias:', expedienteVerificado.daily_activities ? '✅' : '❌');
      console.log('  - Ejercicio físico:', expedienteVerificado.physical_exercise ? '✅' : '❌');
      console.log('  - Hábitos de consumo:', expedienteVerificado.consumption_habits ? '✅' : '❌');
      console.log('  - Presión arterial:', expedienteVerificado.blood_pressure ? '✅' : '❌');
      console.log('  - Indicadores bioquímicos:', expedienteVerificado.biochemical_indicators ? '✅' : '❌');
      console.log('  - Historia dietética:', expedienteVerificado.dietary_history ? '✅' : '❌');
      console.log('  - Frecuencia de grupos alimentarios:', expedienteVerificado.food_group_consumption_frequency ? '✅' : '❌');
      console.log('  - Registro dietético diario:', expedienteVerificado.daily_diet_record ? '✅' : '❌');
      console.log('  - Medidas antropométricas:', expedienteVerificado.anthropometric_measurements ? '✅' : '❌');
      console.log('  - Evaluaciones antropométricas:', expedienteVerificado.anthropometric_evaluations ? '✅' : '❌');
      console.log('  - Diagnóstico nutricional:', expedienteVerificado.nutritional_diagnosis ? '✅' : '❌');
      console.log('  - Necesidades energéticas:', expedienteVerificado.energy_nutrient_needs ? '✅' : '❌');
      console.log('  - Plan nutricional:', expedienteVerificado.nutritional_plan_and_management ? '✅' : '❌');
      console.log('  - Distribución de macronutrientes:', expedienteVerificado.macronutrient_distribution ? '✅' : '❌');
      console.log('  - Esquema de cálculo dietético:', expedienteVerificado.dietary_calculation_scheme ? '✅' : '❌');
      console.log('  - Detalles del menú:', expedienteVerificado.menu_details ? '✅' : '❌');
      console.log('  - Notas de evolución:', expedienteVerificado.evolution_and_follow_up_notes ? '✅' : '❌');
    }

    // 5. Contar expedientes totales del paciente
    console.log('\n5️⃣ Estadísticas del paciente...');
    const totalExpedientes = await clinicalRecordRepository.count({
      where: { patient: { id: patientId } }
    });

    console.log(`📊 Total de expedientes del paciente: ${totalExpedientes}`);

    console.log('\n🎉 ¡Prueba completada exitosamente!');
    console.log('✅ El expediente clínico se envía con TODA la información');

  } catch (error) {
    console.error('❌ Error en la prueba:', error);
  } finally {
    await AppDataSource.destroy();
  }
}

// Ejecutar la prueba
testExpedienteCompleto(); 