import { AppDataSource } from '../src/database/data-source';
import { User } from '../src/database/entities/user.entity';
import { Role, RoleName } from '../src/database/entities/role.entity';
import * as bcrypt from 'bcrypt';

async function resetAdminPassword() {
  try {
    console.log('🔧 Reseteando contraseña del administrador...');
    
    // Inicializar conexión
    await AppDataSource.initialize();
    console.log('✅ Conectado a la base de datos');

    const userRepository = AppDataSource.getRepository(User);
    const roleRepository = AppDataSource.getRepository(Role);

    // Buscar el rol de nutricionista
    const nutritionistRole = await roleRepository.findOne({ 
      where: { name: RoleName.NUTRITIONIST } 
    });

    if (!nutritionistRole) {
      console.error('❌ Rol de nutricionista no encontrado');
      return;
    }

    // Buscar el usuario administrador
    const adminEmail = 'nutri.admin@sistema.com';
    let adminUser = await userRepository.findOne({
      where: { email: adminEmail },
      relations: ['role']
    });

    console.log('\n📊 Estado actual del usuario:');
    if (adminUser) {
      console.log(`✅ Usuario encontrado: ${adminUser.email}`);
      console.log(`👤 Nombre: ${adminUser.first_name} ${adminUser.last_name}`);
      console.log(`🔑 Hash actual: ${adminUser.password_hash?.substring(0, 20)}...`);
      console.log(`👥 Rol: ${adminUser.role?.name}`);
      console.log(`✅ Activo: ${adminUser.is_active}`);
      
      // Verificar la contraseña actual
      let currentPasswordWorks = false;
      if (adminUser.password_hash) {
        currentPasswordWorks = await bcrypt.compare('nutri123', adminUser.password_hash);
        console.log(`🔐 Contraseña 'nutri123' funciona: ${currentPasswordWorks ? '✅ SÍ' : '❌ NO'}`);
      } else {
        console.log(`🔐 Password hash es NULL/undefined - necesita reset`);
      }
      
      if (!currentPasswordWorks || !adminUser.password_hash) {
        console.log('\n🔄 Generando nueva contraseña...');
        const newPassword = 'nutri123';
        const newHash = await bcrypt.hash(newPassword, 12);
        
        // Actualizar contraseña
        adminUser.password_hash = newHash;
        adminUser.role = nutritionistRole;
        adminUser.is_active = true;
        
        await userRepository.save(adminUser);
        
        console.log('✅ Contraseña actualizada exitosamente');
        console.log(`🔑 Nueva contraseña: ${newPassword}`);
        
        // Verificar que funciona
        const verification = await bcrypt.compare(newPassword, newHash);
        console.log(`✅ Verificación: ${verification ? 'CORRECTA' : 'ERROR'}`);
      } else {
        console.log('✅ La contraseña actual ya funciona correctamente');
      }
      
    } else {
      console.log('❌ Usuario no encontrado, creando uno nuevo...');
      
      // Crear usuario administrador
      const password = 'nutri123';
      const hashedPassword = await bcrypt.hash(password, 12);
      
      adminUser = userRepository.create({
        email: adminEmail,
        password_hash: hashedPassword,
        first_name: 'Dr. Sistema',
        last_name: 'Nutricional',
        age: 35,
        gender: 'other',
        role: nutritionistRole,
        is_active: true
      });
      
      await userRepository.save(adminUser);
      
      console.log('✅ Usuario administrador creado');
      console.log(`📧 Email: ${adminEmail}`);
      console.log(`🔑 Contraseña: ${password}`);
    }

    console.log('\n🎯 CREDENCIALES FINALES:');
    console.log('📧 Email: nutri.admin@sistema.com');
    console.log('🔑 Contraseña: nutri123');
    console.log('\n💡 Ahora puedes hacer login con estas credenciales');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
    }
  }
}

// Ejecutar el script
resetAdminPassword(); 