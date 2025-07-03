import { AppDataSource } from './src/database/data-source';
import { User } from './src/database/entities/user.entity';
import { RoleName } from './src/database/entities/role.entity';

async function checkUsers() {
  try {
    console.log('🔧 Inicializando conexión a base de datos...');
    await AppDataSource.initialize();
    
    const userRepository = AppDataSource.getRepository(User);
    
    console.log('👥 Listando todos los usuarios...');
    const users = await userRepository.find({
      relations: ['role'],
      take: 10
    });
    
    console.log(`\n📊 Encontrados ${users.length} usuarios:`);
    
    users.forEach((user, index) => {
      console.log(`${index + 1}. ${user.email} - ${user.first_name} ${user.last_name} (${user.role?.name || 'Sin rol'})`);
    });
    
    console.log('\n🔍 Buscando nutricionistas específicamente...');
    const nutritionists = await userRepository.find({
      where: { role: { name: RoleName.NUTRITIONIST } },
      relations: ['role']
    });
    
    console.log(`📋 Nutricionistas encontrados: ${nutritionists.length}`);
    nutritionists.forEach((nutri, index) => {
      console.log(`${index + 1}. ${nutri.email} - ${nutri.first_name} ${nutri.last_name}`);
    });
    
    console.log('\n🔍 Buscando pacientes específicamente...');
    const patients = await userRepository.find({
      where: { role: { name: RoleName.PATIENT } },
      relations: ['role']
    });
    
    console.log(`👤 Pacientes encontrados: ${patients.length}`);
    patients.forEach((patient, index) => {
      console.log(`${index + 1}. ${patient.email} - ${patient.first_name} ${patient.last_name}`);
    });
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
    }
  }
}

checkUsers(); 