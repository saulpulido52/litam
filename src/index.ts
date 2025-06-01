import app from '@/app'; // Ruta corregida
import { AppDataSource } from '@/database/data-source'; // Ruta corregida
import { Role, RoleName } from '@/database/entities/role.entity'; // Ruta corregida

const PORT = process.env.PORT || 3001;

async function initializeDatabase() {
    try {
        if (!AppDataSource.isInitialized) {
            await AppDataSource.initialize();
            console.log('Data Source has been initialized!');
        }

        const roleRepository = AppDataSource.getRepository(Role);
        const rolesToSeed: RoleName[] = [RoleName.PATIENT, RoleName.NUTRITIONIST, RoleName.ADMIN];

        for (const roleName of rolesToSeed) {
            let role = await roleRepository.findOneBy({ name: roleName });
            if (!role) {
                role = new Role();
                role.name = roleName;
                await roleRepository.save(role);
                console.log(`Role ${roleName} seeded.`);
            }
        }
    } catch (err) {
        console.error('Error during Data Source initialization or seeding:', err);
        process.exit(1);
    }
}

async function startServer() {
    await initializeDatabase();

    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
        console.log(`API available at http://localhost:${PORT}/api`);
    });
}

startServer();