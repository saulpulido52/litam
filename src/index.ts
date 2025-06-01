// src/index.ts
import 'reflect-metadata'; // Asegura que los decoradores funcionen
import dotenv from 'dotenv';
dotenv.config();

import app from './app';
import { AppDataSource } from './database/data-source';
import { Role, RoleName } from './database/entities/entities/role.entity';

const PORT = process.env.PORT || 3001;

async function initializeDatabase() {
    try {
        if (!AppDataSource.isInitialized) {
            await AppDataSource.initialize();
            console.log('Data Source has been initialized!');
        }

        // Seed roles if they don't exist
        const roleRepository = AppDataSource.getRepository(Role);
        const rolesToSeed: RoleName[] = [
            RoleName.PATIENT,
            RoleName.NUTRITIONIST,
            RoleName.ADMIN,
        ];

        for (const roleName of rolesToSeed) {
            let role = await roleRepository.findOne({ where: { name: roleName } });
            if (!role) {
                role = roleRepository.create({ name: roleName });
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