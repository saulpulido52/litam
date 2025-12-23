import { DataSource } from 'typeorm';
import { User } from './src/database/entities/user.entity';
import { Role } from './src/database/entities/role.entity';
import { AppDataSource } from './src/database/data-source';

async function checkUsers() {
  console.log('🔍 Verificando usuarios en la base de datos...');

  try {
    await AppDataSource.initialize();
    console.log('✅ Conexión a la base de datos establecida');

    // Obtener todos los usuarios con sus roles
    const users = await AppDataSource
      .createQueryBuilder(User, 'user')
      .leftJoinAndSelect('user.role', 'role')
      .getMany();

    console.log(`\n📊 Total de usuarios encontrados: ${users.length}`);

    users.forEach((user, index) => {
      console.log(`\n👤 Usuario ${index + 1}:`);
      console.log(`   - ID: ${user.id}`);
      console.log(`   - Email: ${user.email}`);
      console.log(`   - Nombre: ${user.first_name} ${user.last_name}`);
      console.log(`   - Rol: ${user.role?.name}`);
      console.log(`   - Activo: ${user.is_active}`);
      console.log(`   - Fecha creación: ${user.created_at}`);
    });

    // Buscar específicamente nutriólogos
    const nutritionists = users.filter(user => user.role?.name === 'nutritionist');
    console.log(`\n🥗 Nutriólogos encontrados: ${nutritionists.length}`);
    
    nutritionists.forEach((nutritionist, index) => {
      console.log(`\n🥗 Nutriólogo ${index + 1}:`);
      console.log(`   - Email: ${nutritionist.email}`);
      console.log(`   - Nombre: ${nutritionist.first_name} ${nutritionist.last_name}`);
      console.log(`   - ID: ${nutritionist.id}`);
    });

    // Buscar pacientes
    const patients = users.filter(user => user.role?.name === 'patient');
    console.log(`\n👥 Pacientes encontrados: ${patients.length}`);
    
    patients.forEach((patient, index) => {
      console.log(`\n👥 Paciente ${index + 1}:`);
      console.log(`   - Email: ${patient.email}`);
      console.log(`   - Nombre: ${patient.first_name} ${patient.last_name}`);
      console.log(`   - ID: ${patient.id}`);
    });

    await AppDataSource.destroy();
    console.log('\n✅ Conexión cerrada');

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

checkUsers(); 