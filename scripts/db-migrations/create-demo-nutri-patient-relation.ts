import { AppDataSource } from './src/database/data-source';
import { User } from './src/database/entities/user.entity';
import { Role, RoleName } from './src/database/entities/role.entity';
import { PatientNutritionistRelation, RelationshipStatus } from './src/database/entities/patient_nutritionist_relation.entity';
import bcrypt from 'bcryptjs';

async function main() {
  await AppDataSource.initialize();

  // 1. Buscar roles
  const roleRepo = AppDataSource.getRepository(Role);
  const nutriRole = await roleRepo.findOneByOrFail({ name: RoleName.NUTRITIONIST });
  const patientRole = await roleRepo.findOneByOrFail({ name: RoleName.PATIENT });

  // 2. Crear nutriólogo demo
  const nutriRepo = AppDataSource.getRepository(User);
  const nutriEmail = 'nutri.demo@example.com';
  let nutri = await nutriRepo.findOneBy({ email: nutriEmail });
  if (!nutri) {
    nutri = nutriRepo.create({
      email: nutriEmail,
      password_hash: await bcrypt.hash('Password123!', 10),
      first_name: 'Nutri',
      last_name: 'Demo',
      is_active: true,
      role: nutriRole,
    });
    await nutriRepo.save(nutri);
    console.log('✅ Nutriólogo demo creado:', nutriEmail);
  } else {
    console.log('ℹ️ Nutriólogo demo ya existe:', nutriEmail);
  }

  // 3. Crear paciente demo
  const patientRepo = AppDataSource.getRepository(User);
  const patientEmail = 'paciente.demo@example.com';
  let patient = await patientRepo.findOneBy({ email: patientEmail });
  if (!patient) {
    patient = patientRepo.create({
      email: patientEmail,
      password_hash: await bcrypt.hash('Password123!', 10),
      first_name: 'Paciente',
      last_name: 'Demo',
      is_active: true,
      role: patientRole,
    });
    await patientRepo.save(patient);
    console.log('✅ Paciente demo creado:', patientEmail);
  } else {
    console.log('ℹ️ Paciente demo ya existe:', patientEmail);
  }

  // 4. Crear relación activa
  const relRepo = AppDataSource.getRepository(PatientNutritionistRelation);
  let relation = await relRepo.findOne({
    where: {
      patient: { id: patient.id },
      nutritionist: { id: nutri.id },
      status: RelationshipStatus.ACTIVE,
    },
    relations: ['patient', 'nutritionist'],
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
    console.log('✅ Relación paciente-nutriólogo creada y activa.');
  } else {
    console.log('ℹ️ Relación paciente-nutriólogo ya existe y está activa.');
  }

  console.log('\n--- Credenciales de prueba ---');
  console.log('Nutriólogo:');
  console.log('  Email: nutri.demo@example.com');
  console.log('  Password: Password123!');
  console.log('Paciente:');
  console.log('  Email: paciente.demo@example.com');
  console.log('  Password: Password123!');
  console.log('--------------------------------');

  await AppDataSource.destroy();
}

main().catch((err) => {
  console.error('❌ Error en el script:', err);
  process.exit(1);
}); 