import { AppDataSource } from './src/database/data-source';
import { User } from './src/database/entities/user.entity';
import { Role, RoleName } from './src/database/entities/role.entity';
import { ClinicalRecord } from './src/database/entities/clinical_record.entity';
import { PatientNutritionistRelation, RelationshipStatus } from './src/database/entities/patient_nutritionist_relation.entity';
import bcrypt from 'bcryptjs';

async function testCheckboxesClinicalRecords() {
  await AppDataSource.initialize();

  try {
    console.log('🧪 Iniciando prueba de checkboxes en expedientes clínicos...');

    // 1. Buscar roles
    const roleRepo = AppDataSource.getRepository(Role);
    const nutriRole = await roleRepo.findOneByOrFail({ name: RoleName.NUTRITIONIST });
    const patientRole = await roleRepo.findOneByOrFail({ name: RoleName.PATIENT });

    // 2. Crear o buscar nutriólogo de prueba
    const userRepo = AppDataSource.getRepository(User);
    const nutriEmail = 'nutri.checkboxes@example.com';
    let nutri = await userRepo.findOneBy({ email: nutriEmail });
    if (!nutri) {
      nutri = userRepo.create({
        email: nutriEmail,
        password_hash: await bcrypt.hash('Password123!', 10),
        first_name: 'Nutri',
        last_name: 'Checkboxes',
        is_active: true,
        role: nutriRole,
      });
      await userRepo.save(nutri);
      console.log('✅ Nutriólogo de prueba creado:', nutriEmail);
    } else {
      console.log('ℹ️ Nutriólogo de prueba ya existe:', nutriEmail);
    }

    // 3. Crear o buscar paciente de prueba
    const patientEmail = 'paciente.checkboxes@example.com';
    let patient = await userRepo.findOneBy({ email: patientEmail });
    if (!patient) {
      patient = userRepo.create({
        email: patientEmail,
        password_hash: await bcrypt.hash('Password123!', 10),
        first_name: 'Paciente',
        last_name: 'Checkboxes',
        is_active: true,
        role: patientRole,
      });
      await userRepo.save(patient);
      console.log('✅ Paciente de prueba creado:', patientEmail);
    } else {
      console.log('ℹ️ Paciente de prueba ya existe:', patientEmail);
    }

    // 4. Crear relación activa
    const relRepo = AppDataSource.getRepository(PatientNutritionistRelation);
    let relation = await relRepo.findOne({
      where: {
        patient: { id: patient.id },
        nutritionist: { id: nutri.id },
        status: RelationshipStatus.ACTIVE,
      },
    });
    if (!relation) {
      relation = relRepo.create({
        patient,
        nutritionist: nutri,
        status: RelationshipStatus.ACTIVE,
        requested_at: new Date(),
        accepted_at: new Date(),
      });
      await relRepo.save(relation);
      console.log('✅ Relación paciente-nutriólogo creada');
    } else {
      console.log('ℹ️ Relación paciente-nutriólogo ya existe');
    }

    // 5. Crear expediente clínico con checkboxes
    const clinicalRecordRepo = AppDataSource.getRepository(ClinicalRecord);
    
    // Limpiar expedientes existentes de prueba
    await clinicalRecordRepo.delete({
      patient: { id: patient.id },
      nutritionist: { id: nutri.id },
    });

    const testRecord = clinicalRecordRepo.create({
      patient,
      nutritionist: nutri,
      record_date: new Date(),
      expedient_number: 'TEST-001',
      consultation_reason: 'Prueba de checkboxes',
      
      // Problemas actuales con checkboxes
      current_problems: {
        diarrhea: true,
        constipation: false,
        gastritis: true,
        ulcer: false,
        nausea: true,
        pyrosis: false,
        vomiting: true,
        colitis: false,
        mouth_mechanics: 'Dificultad para masticar',
        other_problems: 'Problemas de digestión',
        observations: 'Paciente presenta múltiples síntomas gastrointestinales',
      },

      // Presión arterial
      blood_pressure: {
        knows_bp: true,
        systolic: 120,
        diastolic: 80,
        habitual_bp: '120/80',
      },

      // Historia dietética
      dietary_history: {
        received_nutritional_guidance: true,
        when_received: 'Hace 3 meses',
        adherence_level: 'Buena adherencia',
        preferred_foods: ['Frutas', 'Verduras', 'Pescado'],
        disliked_foods: ['Brócoli', 'Pescado'],
        malestar_alergia_foods: ['Lácteos', 'Gluten'],
        takes_supplements: true,
        supplement_details: 'Vitamina D, Omega 3',
      },

      // Diagnóstico
      nutritional_diagnosis: 'Síndrome de intestino irritable con múltiples intolerancias alimentarias',
      nutritional_plan_and_management: 'Plan de eliminación progresiva y reintroducción de alimentos',
      evolution_and_follow_up_notes: 'Paciente responde bien a la eliminación de lácteos y gluten',
    });

    await clinicalRecordRepo.save(testRecord);
    console.log('✅ Expediente clínico de prueba creado con checkboxes');

    // 6. Verificar que los datos se guardaron correctamente
    const savedRecord = await clinicalRecordRepo.findOne({
      where: { id: testRecord.id },
      relations: ['patient', 'nutritionist'],
    });

    if (savedRecord) {
      console.log('\n📋 Verificación de datos guardados:');
      console.log('✅ Problemas actuales:');
      console.log('  - Diarrea:', savedRecord.current_problems?.diarrhea);
      console.log('  - Estreñimiento:', savedRecord.current_problems?.constipation);
      console.log('  - Gastritis:', savedRecord.current_problems?.gastritis);
      console.log('  - Úlcera:', savedRecord.current_problems?.ulcer);
      console.log('  - Náuseas:', savedRecord.current_problems?.nausea);
      console.log('  - Pirosis:', savedRecord.current_problems?.pyrosis);
      console.log('  - Vómito:', savedRecord.current_problems?.vomiting);
      console.log('  - Colitis:', savedRecord.current_problems?.colitis);

      console.log('\n✅ Presión arterial:');
      console.log('  - Conoce BP:', savedRecord.blood_pressure?.knows_bp);
      console.log('  - Sistólica:', savedRecord.blood_pressure?.systolic);
      console.log('  - Diastólica:', savedRecord.blood_pressure?.diastolic);

      console.log('\n✅ Historia dietética:');
      console.log('  - Recibió orientación:', savedRecord.dietary_history?.received_nutritional_guidance);
      console.log('  - Toma suplementos:', savedRecord.dietary_history?.takes_supplements);
      console.log('  - Alimentos preferidos:', savedRecord.dietary_history?.preferred_foods);
      console.log('  - Alimentos que no le gustan:', savedRecord.dietary_history?.disliked_foods);
      console.log('  - Alimentos que causan malestar:', savedRecord.dietary_history?.malestar_alergia_foods);

      console.log('\n✅ Diagnóstico:');
      console.log('  - Diagnóstico nutricional:', savedRecord.nutritional_diagnosis);
      console.log('  - Plan y manejo:', savedRecord.nutritional_plan_and_management);
    }

    console.log('\n🎉 Prueba completada exitosamente!');
    console.log('\n--- Credenciales de prueba ---');
    console.log('Nutriólogo:');
    console.log('  Email: nutri.checkboxes@example.com');
    console.log('  Password: Password123!');
    console.log('Paciente:');
    console.log('  Email: paciente.checkboxes@example.com');
    console.log('  Password: Password123!');
    console.log('--------------------------------');

  } catch (error) {
    console.error('❌ Error en la prueba:', error);
  } finally {
    await AppDataSource.destroy();
  }
}

testCheckboxesClinicalRecords().catch((err) => {
  console.error('❌ Error fatal:', err);
  process.exit(1);
}); 