import { AppDataSource } from './src/database/data-source';
import { User } from './src/database/entities/user.entity';
import bcrypt from 'bcrypt';

async function checkPasswordHashes() {
  try {
    console.log('🔍 Conectando a la base de datos...');
    await AppDataSource.initialize();
    console.log('✅ Conexión establecida\n');

    const userRepository = AppDataSource.getRepository(User);
    
    // Obtener todos los nutriólogos incluyendo el campo password_hash (que está marcado como select: false)
    const nutritionists = await userRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.role', 'role')
      .addSelect('user.password_hash')
      .where('role.name = :roleName', { roleName: 'nutritionist' })
      .getMany();

    console.log(`📊 Nutriólogos encontrados: ${nutritionists.length}\n`);

    // Contraseñas comunes para probar
    const commonPasswords = ['demo123', 'password123', 'nutri123', 'Password123!', 'password', '123456'];

    for (const nutritionist of nutritionists) {
      console.log(`👩‍⚕️ Nutriólogo: ${nutritionist.first_name} ${nutritionist.last_name}`);
      console.log(`   📧 Email: ${nutritionist.email}`);
      
      if (!nutritionist.password_hash) {
        console.log(`   ⚠️ No hay hash de contraseña disponible`);
        continue;
      }
      
      console.log(`   🔐 Hash: ${nutritionist.password_hash.substring(0, 20)}...`);
      
      // Probar contraseñas comunes
      for (const password of commonPasswords) {
        try {
          const isMatch = await bcrypt.compare(password, nutritionist.password_hash);
          if (isMatch) {
            console.log(`   ✅ ¡CONTRASEÑA ENCONTRADA! "${password}"`);
            console.log(`   🎯 Credenciales válidas: ${nutritionist.email} / ${password}\n`);
            break;
          }
        } catch (error) {
          console.log(`   ⚠️ Error comparando "${password}": ${error}`);
        }
      }
      console.log(''); // Línea en blanco
    }

    await AppDataSource.destroy();
    console.log('🔐 Conexión cerrada');

  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

// Ejecutar la verificación
checkPasswordHashes(); 