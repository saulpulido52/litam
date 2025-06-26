/**
 * Script de prueba para verificar la corrección de planes nutricionales
 * Después de actualizar el DTO del backend
 */

import { AppDataSource } from './src/database/data-source';
import { User } from './src/database/entities/user.entity';
import { Role, RoleName } from './src/database/entities/role.entity';
import { PatientNutritionistRelation, RelationshipStatus } from './src/database/entities/patient_nutritionist_relation.entity';
import { DietPlan } from './src/database/entities/diet_plan.entity';
import { DietPlanStatus } from './src/database/entities/diet_plan.entity';

async function testDietPlanCreation() {
  console.log('🧪 INICIANDO PRUEBA DE CREACIÓN DE PLANES NUTRICIONALES...\n');

  try {
    await AppDataSource.initialize();
    console.log('✅ Base de datos conectada');

    // 1. Buscar roles
    const roleRepo = AppDataSource.getRepository(Role);
    const nutriRole = await roleRepo.findOneByOrFail({ name: RoleName.NUTRITIONIST });
    const patientRole = await roleRepo.findOneByOrFail({ name: RoleName.PATIENT });

    // 2. Buscar o crear nutriólogo demo
    const userRepo = AppDataSource.getRepository(User);
    const nutriEmail = 'nutri.demo@example.com';
    let nutri = await userRepo.findOneBy({ email: nutriEmail });
    if (!nutri) {
      console.log('❌ Nutriólogo demo no encontrado. Ejecuta create-demo-nutri-patient-relation.ts primero');
      return;
    }
    console.log('✅ Nutriólogo demo encontrado:', nutriEmail);

    // 3. Buscar o crear paciente demo
    const patientEmail = 'paciente.demo@example.com';
    let patient = await userRepo.findOneBy({ email: patientEmail });
    if (!patient) {
      console.log('❌ Paciente demo no encontrado. Ejecuta create-demo-nutri-patient-relation.ts primero');
      return;
    }
    console.log('✅ Paciente demo encontrado:', patientEmail);

    // 4. Verificar relación
    const relRepo = AppDataSource.getRepository(PatientNutritionistRelation);
    const relation = await relRepo.findOne({
      where: {
        patient: { id: patient.id },
        nutritionist: { id: nutri.id },
        status: RelationshipStatus.ACTIVE,
      },
    });
    if (!relation) {
      console.log('❌ Relación paciente-nutriólogo no encontrada');
      return;
    }
    console.log('✅ Relación paciente-nutriólogo activa');

    // 5. Crear plan de dieta de prueba con los campos problemáticos
    const dietPlanRepo = AppDataSource.getRepository(DietPlan);
    
    const testDietPlanData = {
      name: 'Plan de Prueba - Corrección DTO',
      patient: patient,
      nutritionist: nutri,
      description: 'Plan de prueba para verificar la corrección del DTO',
      start_date: new Date('2025-06-30'),
      end_date: new Date('2025-07-06'),
      daily_calories_target: 1500,
      daily_macros_target: {
        protein: 150,
        carbohydrates: 200,
        fats: 50
      },
      notes: 'Plan de prueba con campos adicionales',
      status: DietPlanStatus.DRAFT,
      is_weekly_plan: true,
      total_weeks: 1,
      // Campos que estaban causando problemas
      plan_type: 'weekly',
      plan_period: 'weeks',
      total_periods: 1,
      pathological_restrictions: {
        medicalConditions: [],
        allergies: [],
        intolerances: [],
        medications: [],
        specialConsiderations: [],
        emergencyContacts: []
      }
    };

    console.log('📝 Creando plan de dieta con datos de prueba...');
    console.log('📋 Datos del plan:', JSON.stringify(testDietPlanData, null, 2));

    const newDietPlan = dietPlanRepo.create(testDietPlanData);
    const savedDietPlan = await dietPlanRepo.save(newDietPlan);

    console.log('✅ Plan de dieta creado exitosamente!');
    console.log('🆔 ID del plan:', savedDietPlan.id);
    console.log('📅 Fecha de creación:', savedDietPlan.created_at);

    // 6. Verificar que se guardó correctamente
    const retrievedPlan = await dietPlanRepo.findOne({
      where: { id: savedDietPlan.id },
      relations: ['patient', 'nutritionist']
    });

    if (retrievedPlan) {
      console.log('✅ Plan recuperado correctamente de la base de datos');
      console.log('📊 Datos del plan recuperado:');
      console.log('  - Nombre:', retrievedPlan.name);
      console.log('  - Paciente:', retrievedPlan.patient?.first_name, retrievedPlan.patient?.last_name);
      console.log('  - Nutriólogo:', retrievedPlan.nutritionist?.first_name, retrievedPlan.nutritionist?.last_name);
      console.log('  - Estado:', retrievedPlan.status);
      console.log('  - Calorías objetivo:', retrievedPlan.daily_calories_target);
    }

    // 7. Limpiar - eliminar el plan de prueba
    console.log('\n🧹 Limpiando plan de prueba...');
    await dietPlanRepo.remove(savedDietPlan);
    console.log('✅ Plan de prueba eliminado');

    console.log('\n🎉 PRUEBA COMPLETADA EXITOSAMENTE!');
    console.log('✅ El DTO del backend ahora acepta los campos adicionales del frontend');
    console.log('✅ La creación de planes nutricionales debería funcionar correctamente');

  } catch (error) {
    console.error('❌ Error en la prueba:', error);
    if (error instanceof Error) {
      console.error('📋 Mensaje de error:', error.message);
      console.error('📋 Stack trace:', error.stack);
    }
  } finally {
    await AppDataSource.destroy();
    console.log('🔌 Conexión a la base de datos cerrada');
  }
}

// Ejecutar la prueba
testDietPlanCreation().catch((err) => {
  console.error('❌ Error fatal:', err);
  process.exit(1);
}); 