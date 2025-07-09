import { AppDataSource } from '../src/database/data-source';
import { User } from '../src/database/entities/user.entity';
import { Role, RoleName } from '../src/database/entities/role.entity';
import * as bcrypt from 'bcryptjs';

async function resetTestUsers() {
  const ds = await AppDataSource.initialize();

  // Datos de los usuarios de prueba
  const users = [
    {
      email: 'nutriologo@test.com',
      password: 'password123',
      first_name: 'Nutri',
      last_name: 'Prueba',
      role: RoleName.NUTRITIONIST,
    },
    {
      email: 'nutri.admin@sistema.com',
      password: 'admin123',
      first_name: 'Admin',
      last_name: 'Sistema',
      role: RoleName.ADMIN,
    },
  ];

  for (const userData of users) {
    const role = await ds.getRepository(Role).findOneBy({ name: userData.role });
    if (!role) {
      console.error(`❌ Rol no encontrado: ${userData.role}`);
      continue;
    }
    let user = await ds.getRepository(User).findOneBy({ email: userData.email });
    const password_hash = await bcrypt.hash(userData.password, 10);
    if (user) {
      // Actualizar datos y contraseña
      user.first_name = userData.first_name;
      user.last_name = userData.last_name;
      user.password_hash = password_hash;
      user.role = role;
      await ds.getRepository(User).save(user);
      console.log(`🔄 Usuario actualizado: ${userData.email}`);
    } else {
      // Crear usuario
      user = ds.getRepository(User).create({
        email: userData.email,
        first_name: userData.first_name,
        last_name: userData.last_name,
        password_hash,
        role,
        is_active: true,
      });
      await ds.getRepository(User).save(user);
      console.log(`✅ Usuario creado: ${userData.email}`);
    }
  }

  await ds.destroy();
  console.log('✔️ Usuarios de prueba restablecidos.');
}

resetTestUsers().catch(e => {
  console.error('❌ Error al restablecer usuarios de prueba:', e);
  process.exit(1);
}); 