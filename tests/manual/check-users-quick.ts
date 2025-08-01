// tests/manual/check-users-quick.ts
import 'dotenv/config';
import { AppDataSource } from '../../src/database/data-source';
import { User } from '../../src/database/entities/user.entity';

async function checkUsers() {
    try {
        console.log('🔄 Inicializando conexión...');
        await AppDataSource.initialize();
        console.log('✅ Conexión establecida');

        const userRepo = AppDataSource.getRepository(User);
        
        console.log('\n👥 === USUARIOS EN LA BASE DE DATOS ===');
        const users = await userRepo.find({
            relations: ['role'],
            select: ['id', 'email', 'first_name', 'last_name', 'is_active']
        });

        if (users.length === 0) {
            console.log('❌ No hay usuarios en la base de datos');
        } else {
            users.forEach((user, index) => {
                console.log(`\n${index + 1}. Usuario:`);
                console.log(`   Email: ${user.email}`);
                console.log(`   Nombre: ${user.first_name} ${user.last_name}`);
                console.log(`   Rol: ${user.role?.name || 'Sin rol'}`);
                console.log(`   Activo: ${user.is_active ? 'Sí' : 'No'}`);
                console.log(`   ID: ${user.id}`);
            });
        }

        console.log(`\n📊 Total: ${users.length} usuarios encontrados`);
        
    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        if (AppDataSource.isInitialized) {
            await AppDataSource.destroy();
            console.log('\n🔚 Conexión cerrada');
        }
    }
}

checkUsers(); 