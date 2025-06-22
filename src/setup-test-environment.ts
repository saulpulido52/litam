import 'dotenv/config';
import { AppDataSource } from '@/database/data-source';
import { Role, RoleName } from '@/database/entities/role.entity';

interface TestEnvironment {
    isInitialized: boolean;
    roles: Role[];
}

class TestEnvironmentManager {
    private static instance: TestEnvironmentManager;
    private environment: TestEnvironment = {
        isInitialized: false,
        roles: []
    };

    private constructor() {}

    static getInstance(): TestEnvironmentManager {
        if (!TestEnvironmentManager.instance) {
            TestEnvironmentManager.instance = new TestEnvironmentManager();
        }
        return TestEnvironmentManager.instance;
    }

    async initialize(): Promise<void> {
        if (this.environment.isInitialized) {
            console.log('✅ Entorno de pruebas ya inicializado');
            return;
        }

        console.log('🚀 Inicializando entorno de pruebas...');
        
        try {
            // 1. Configurar variables de entorno para pruebas
            this.setupEnvironmentVariables();
            
            // 2. Inicializar conexión a la base de datos
            await this.initializeDatabase();
            
            // 3. Limpiar base de datos de manera segura
            await this.cleanDatabase();
            
            // 4. Sembrar roles básicos
            await this.seedRoles();
            
            this.environment.isInitialized = true;
            console.log('✅ Entorno de pruebas inicializado exitosamente');
            
        } catch (error: any) {
            console.error('❌ Error inicializando entorno de pruebas:', error.message);
            throw error;
        }
    }

    private setupEnvironmentVariables(): void {
        // Configurar variables de entorno para pruebas si no están definidas
        if (!process.env.DB_HOST) process.env.DB_HOST = 'localhost';
        if (!process.env.DB_PORT) process.env.DB_PORT = '5432';
        if (!process.env.DB_USERNAME) process.env.DB_USERNAME = 'postgres';
        if (!process.env.DB_PASSWORD) process.env.DB_PASSWORD = '';
        if (!process.env.DB_DATABASE) process.env.DB_DATABASE = 'nutri_test';
        if (!process.env.NODE_ENV) process.env.NODE_ENV = 'test';
        if (!process.env.JWT_SECRET) process.env.JWT_SECRET = 'supersecretjwtkey';

        console.log('🔧 Variables de entorno configuradas:', {
            DB_HOST: process.env.DB_HOST,
            DB_DATABASE: process.env.DB_DATABASE,
            NODE_ENV: process.env.NODE_ENV
        });
    }

    private async initializeDatabase(): Promise<void> {
        if (!AppDataSource.isInitialized) {
            await AppDataSource.initialize();
            console.log('✅ Conexión a base de datos establecida');
        } else {
            console.log('✅ Conexión a base de datos ya existente');
        }
    }

    private async cleanDatabase(): Promise<void> {
        console.log('🧹 Limpiando base de datos...');
        
        try {
            // Desactivar restricciones de clave foránea temporalmente
            await AppDataSource.query('SET session_replication_role = replica;');
            
            // Lista de tablas en orden de dependencias (de más dependiente a menos)
            const tablesToClean = [
                'meal_items',
                'meals',
                'diet_plans',
                'patient_nutritionist_relations',
                'patient_profiles',
                'nutritionist_profiles',
                'foods',
                'appointments',
                'nutritionist_availabilities',
                'patient_progress_logs',
                'user_subscriptions',
                'payment_transactions',
                'educational_content',
                'recipes',
                'conversations',
                'messages',
                'clinical_records',
                'users'
                // NO incluir 'roles' - se preservan
            ];

            for (const table of tablesToClean) {
                try {
                    await AppDataSource.query(`TRUNCATE TABLE "${table}" RESTART IDENTITY CASCADE;`);
                    console.log(`  ✅ Tabla ${table} limpiada`);
                } catch (error: any) {
                    console.log(`  ⚠️ Error limpiando tabla ${table}: ${error.message}`);
                }
            }

            // Reactivar restricciones de clave foránea
            await AppDataSource.query('SET session_replication_role = DEFAULT;');
            
            console.log('✅ Base de datos limpiada exitosamente');
            
        } catch (error: any) {
            console.error('❌ Error limpiando base de datos:', error.message);
            throw error;
        }
    }

    private async seedRoles(): Promise<void> {
        console.log('🌱 Sembrando roles básicos...');
        
        try {
            const roleRepository = AppDataSource.getRepository(Role);
            const rolesToSeed = [
                { name: RoleName.PATIENT, description: 'Rol de paciente' },
                { name: RoleName.NUTRITIONIST, description: 'Rol de nutricionista' },
                { name: RoleName.ADMIN, description: 'Rol de administrador' }
            ];

            for (const roleData of rolesToSeed) {
                let role = await roleRepository.findOne({ where: { name: roleData.name } });
                
                if (!role) {
                    role = roleRepository.create(roleData);
                    await roleRepository.save(role);
                    console.log(`  ✅ Rol ${roleData.name} creado`);
                } else {
                    console.log(`  ✅ Rol ${roleData.name} ya existía`);
                }
            }

            // Guardar roles en el estado del entorno
            this.environment.roles = await roleRepository.find();
            console.log(`✅ ${this.environment.roles.length} roles disponibles`);
            
        } catch (error: any) {
            console.error('❌ Error sembrando roles:', error.message);
            throw error;
        }
    }

    async getRoles(): Promise<Role[]> {
        if (!this.environment.isInitialized) {
            throw new Error('Entorno de pruebas no inicializado. Llama a initialize() primero.');
        }
        return this.environment.roles;
    }

    async cleanup(): Promise<void> {
        if (AppDataSource.isInitialized) {
            await AppDataSource.destroy();
            console.log('🔌 Conexión a base de datos cerrada');
        }
        this.environment.isInitialized = false;
    }

    isReady(): boolean {
        return this.environment.isInitialized;
    }
}

// Exportar la instancia singleton
export const testEnv = TestEnvironmentManager.getInstance();

// Función de conveniencia para inicializar
export async function setupTestEnvironment(): Promise<void> {
    await testEnv.initialize();
}

// Función de conveniencia para limpiar
export async function cleanupTestEnvironment(): Promise<void> {
    await testEnv.cleanup();
}

// Ejecutar si se llama directamente
if (require.main === module) {
    setupTestEnvironment()
        .then(() => {
            console.log('✅ Configuración de entorno de pruebas completada');
            process.exit(0);
        })
        .catch((error) => {
            console.error('❌ Error en configuración:', error);
            process.exit(1);
        });
} 