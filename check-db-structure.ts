// check-db-structure.ts
import 'dotenv/config';
import { AppDataSource } from './src/database/data-source';
import { Role, RoleName } from '@/database/entities/role.entity';
import { User } from '@/database/entities/user.entity';

async function checkDatabaseStructure() {
    try {
        console.log('🔍 Verificando estructura de la base de datos...');
        
        if (!AppDataSource.isInitialized) {
            await AppDataSource.initialize();
        }

        // Verificar roles
        const roleRepository = AppDataSource.getRepository(Role);
        const roles = await roleRepository.find();
        console.log('📋 Roles encontrados:', roles.map(r => ({ id: r.id, name: r.name })));

        // Verificar usuarios
        const userRepository = AppDataSource.getRepository(User);
        const users = await userRepository.find({ relations: ['role'] });
        console.log('👥 Usuarios encontrados:', users.length);
        users.forEach(user => {
            console.log(`  - ${user.email} (ID: ${user.id}, Rol: ${user.role?.name})`);
        });

        // Verificar constraint específico
        const constraintQuery = `
            SELECT 
                tc.constraint_name, 
                tc.table_name, 
                kcu.column_name, 
                ccu.table_name AS foreign_table_name,
                ccu.column_name AS foreign_column_name 
            FROM 
                information_schema.table_constraints AS tc 
                JOIN information_schema.key_column_usage AS kcu
                    ON tc.constraint_name = kcu.constraint_name
                    AND tc.table_schema = kcu.table_schema
                JOIN information_schema.constraint_column_usage AS ccu
                    ON ccu.constraint_name = tc.constraint_name
                    AND ccu.table_schema = tc.table_schema
            WHERE tc.constraint_type = 'FOREIGN KEY' 
                AND tc.table_name = 'users'
                AND tc.constraint_name = 'FK_a2cecd1a3531c0b041e29ba46e1';
        `;
        
        const constraints = await AppDataSource.query(constraintQuery);
        console.log('🔗 Foreign key constraints en tabla users:', constraints);

        console.log('✅ Verificación completada');
        
    } catch (error) {
        console.error('❌ Error verificando estructura:', error);
        throw error;
    } finally {
        if (AppDataSource.isInitialized) {
            await AppDataSource.destroy();
        }
    }
}

checkDatabaseStructure(); 