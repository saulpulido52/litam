import { AppDataSource } from '../../src/database/data-source';
import { User } from '../../src/database/entities/user.entity';

async function testDatabaseConnection() {
    try {
        console.log('🔍 Inicializando conexión a la base de datos...');
        
        await AppDataSource.initialize();
        console.log('✅ Conexión a la base de datos exitosa');
        
        // Probar consulta simple
        const userRepository = AppDataSource.getRepository(User);
        const userCount = await userRepository.count();
        console.log(`📊 Total de usuarios en la base de datos: ${userCount}`);
        
        // Probar consulta con relaciones
        const userWithRelations = await userRepository
            .createQueryBuilder('user')
            .leftJoinAndSelect('user.role', 'role')
            .leftJoinAndSelect('user.nutritionist_profile', 'nutritionist_profile')
            .where('user.id = :id', { id: '0169af6d-f37b-4eb0-a48d-22a8cb32bf7b' })
            .getOne();
        
        if (userWithRelations) {
            console.log('✅ Usuario encontrado con relaciones:', {
                id: userWithRelations.id,
                email: userWithRelations.email,
                role: userWithRelations.role?.name,
                hasNutritionistProfile: !!userWithRelations.nutritionist_profile
            });
        } else {
            console.log('⚠️ Usuario no encontrado');
        }
        
        await AppDataSource.destroy();
        console.log('🔌 Conexión cerrada');
        
    } catch (error: any) {
        console.error('❌ Error en la conexión a la base de datos:', {
            message: error.message,
            stack: error.stack
        });
        
        if (AppDataSource.isInitialized) {
            await AppDataSource.destroy();
        }
    }
}

testDatabaseConnection().catch(console.error); 