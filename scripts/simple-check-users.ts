import { AppDataSource } from '../src/database/data-source';
import { User } from '../src/database/entities/user.entity';
import { Role } from '../src/database/entities/role.entity';

async function checkUsers() {
    try {
        console.log('🔍 Conectando a la base de datos...');
        await AppDataSource.initialize();
        console.log('✅ Conectado a la base de datos');

        const userRepository = AppDataSource.getRepository(User);
        
        // Obtener todos los usuarios con sus roles
        const users = await userRepository.find({
            relations: ['role'],
            select: {
                id: true,
                email: true,
                first_name: true,
                last_name: true,
                is_active: true,
                role: {
                    id: true,
                    name: true
                }
            }
        });

        console.log('\n📋 USUARIOS ENCONTRADOS:');
        console.log('════════════════════════════════════════════════════════════════');
        
        if (users.length === 0) {
            console.log('❌ No se encontraron usuarios en la base de datos');
        } else {
            users.forEach((user, index) => {
                console.log(`${index + 1}. ${user.email}`);
                console.log(`   Nombre: ${user.first_name} ${user.last_name}`);
                console.log(`   Rol: ${user.role?.name || 'Sin rol'}`);
                console.log(`   ID: ${user.id}`);
                console.log(`   Activo: ${user.is_active ? '✅' : '❌'}`);
                console.log('   ─────────────────────────────────────────────────────');
            });
        }

        // Filtrar por tipo de rol
        const nutritionists = users.filter(user => user.role?.name === 'nutritionist');
        const patients = users.filter(user => user.role?.name === 'patient');
        const admins = users.filter(user => user.role?.name === 'admin');

        console.log('\n📊 RESUMEN POR ROLES:');
        console.log('════════════════════════════════════════════════════════════════');
        console.log(`👨‍⚕️ Nutriólogos: ${nutritionists.length}`);
        console.log(`👤 Pacientes: ${patients.length}`);
        console.log(`🛡️ Administradores: ${admins.length}`);

        if (nutritionists.length > 0) {
            console.log('\n🩺 NUTRIÓLOGOS DISPONIBLES:');
            nutritionists.forEach(nutri => {
                console.log(`  • ${nutri.email} (${nutri.first_name} ${nutri.last_name}) - ID: ${nutri.id}`);
            });
        }

        if (patients.length > 0) {
            console.log('\n👥 PACIENTES DISPONIBLES:');
            patients.forEach(patient => {
                console.log(`  • ${patient.email} (${patient.first_name} ${patient.last_name}) - ID: ${patient.id}`);
            });
        }

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        if (AppDataSource.isInitialized) {
            await AppDataSource.destroy();
            console.log('\n📴 Desconectado de la base de datos');
        }
    }
}

if (require.main === module) {
    checkUsers();
}

export { checkUsers }; 