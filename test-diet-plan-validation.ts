import { AppDataSource } from './src/database/data-source';

async function testDietPlanValidation() {
  try {
    console.log('🧪 === TEST DE VALIDACIÓN DE PLANES NUTRICIONALES ===');
    
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
      console.log('✅ Base de datos conectada');
    }

    // Simular el payload exacto que está enviando el frontend
    const frontendPayload = {
      "name": "Test Plan Validation",
      "patientId": "63fea0f1-7dc8-470f-8d14-7f65fecf34ce",
      "startDate": "2025-07-01",
      "endDate": "2025-07-29",
      "dailyCaloriesTarget": 3129,
      "dailyMacrosTarget": {
        "protein": 196,
        "carbohydrates": 352,
        "fats": 104
      },
      "isWeeklyPlan": true,
      "totalWeeks": 4,
      "weeklyPlans": [
        {
          "week_number": 1,
          "start_date": "2025-07-01",
          "end_date": "2025-07-07",
          "daily_calories_target": 3129,
          "daily_macros_target": {
            "protein": 196,
            "carbohydrates": 352,
            "fats": 104
          },
          "meals": [],
          "notes": "Semana 1 - Plan generado automáticamente"
        }
      ],
      "planType": "weekly",
      "pathologicalRestrictions": {
        "medical_conditions": [
          {
            "name": "Test Condition",
            "category": "medical",
            "severity": "medium",
            "description": "Test description"
          }
        ],
        "allergies": [],
        "intolerances": [],
        "medications": [],
        "special_considerations": [],
        "emergency_contacts": []
      },
      "mealFrequency": {
        "breakfast": true,
        "morning_snack": true,
        "lunch": true,
        "afternoon_snack": true,
        "dinner": true,
        "evening_snack": false
      },
      "mealTiming": {
        "breakfast_time": "07:00",
        "lunch_time": "13:00",
        "dinner_time": "19:00",
        "snack_times": ["10:00", "16:00"],
        "bed_time": "22:00"
      },
      "nutritionalGoals": {
        "water_intake_liters": 2.5,
        "fiber_target_grams": 25,
        "calorie_distribution": "balanced",
        "meals_per_day": 5
      },
      "flexibilitySettings": {
        "allow_meal_swapping": true,
        "allow_portion_adjustment": true,
        "allow_food_substitution": false,
        "cheat_days_per_week": 1,
        "free_meals_per_week": 2
      }
    };

    console.log('📨 Payload de test:', JSON.stringify(frontendPayload, null, 2));

    // Hacer request directo al endpoint
    const response = await fetch('http://localhost:4000/api/diet-plans', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + process.env.TEST_TOKEN // Necesitamos un token válido
      },
      body: JSON.stringify(frontendPayload)
    });

    const responseData = await response.json();

    console.log('📬 Respuesta del servidor:');
    console.log('Status:', response.status);
    console.log('Response:', JSON.stringify(responseData, null, 2));

    if (response.status === 400) {
      console.log('');
      console.log('🚨 === ANÁLISIS DEL ERROR DE VALIDACIÓN ===');
      
      if (responseData.details) {
        console.log('🔍 Detalles de validación:', responseData.details);
      }
      
      if (responseData.validationErrors) {
        console.log('❌ Errores de validación específicos:');
        responseData.validationErrors.forEach((error: any) => {
          console.log(`  - Campo: ${error.property}`);
          console.log(`    Errores: ${Object.values(error.constraints || {}).join(', ')}`);
        });
      }

      // Verificar campos requeridos uno por uno
      console.log('');
      console.log('🔍 === VERIFICACIÓN DE CAMPOS REQUERIDOS ===');
      
      const requiredFields = [
        'name',
        'patientId', 
        'startDate',
        'endDate'
      ];

      requiredFields.forEach(field => {
        const value = frontendPayload[field as keyof typeof frontendPayload];
        console.log(`${field}: ${value ? '✅' : '❌'} (${typeof value}) = ${value}`);
      });

      // Verificar formato de fechas
      console.log('');
      console.log('📅 === VERIFICACIÓN DE FORMATOS DE FECHA ===');
      console.log(`startDate: ${frontendPayload.startDate} (válida: ${!isNaN(Date.parse(frontendPayload.startDate))})`);
      console.log(`endDate: ${frontendPayload.endDate} (válida: ${!isNaN(Date.parse(frontendPayload.endDate))})`);

      // Verificar UUID del paciente
      console.log('');
      console.log('🆔 === VERIFICACIÓN DE UUID DEL PACIENTE ===');
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
      console.log(`patientId: ${frontendPayload.patientId} (válido: ${uuidRegex.test(frontendPayload.patientId)})`);

      // Verificar si el paciente existe
      const patientExists = await AppDataSource.query(
        'SELECT id FROM users WHERE id = $1',
        [frontendPayload.patientId]
      );
      console.log(`Paciente existe en BD: ${patientExists.length > 0 ? '✅' : '❌'}`);
    }

  } catch (error) {
    console.error('❌ Error en test:', error);
  } finally {
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
    }
  }
}

// Ejecutar test directo sin autenticación por ahora
async function testWithoutAuth() {
  try {
    console.log('🧪 === TEST SIN AUTENTICACIÓN (diagnóstico) ===');
    
    const payload = {
      "name": "Test Simple",
      "patientId": "63fea0f1-7dc8-470f-8d14-7f65fecf34ce",
      "startDate": "2025-07-01",
      "endDate": "2025-07-08"
    };

    const response = await fetch('http://localhost:4000/api/diet-plans', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    const data = await response.json();
    console.log('Status:', response.status);
    console.log('Response:', JSON.stringify(data, null, 2));

  } catch (error) {
    console.error('Error:', error);
  }
}

console.log('Ejecutando test de validación...');
testWithoutAuth().then(() => {
  console.log('Test completado');
  process.exit(0);
}); 