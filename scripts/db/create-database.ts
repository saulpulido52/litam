import 'reflect-metadata';
import { DataSource } from 'typeorm';

// Conexión a la base de datos por defecto para crear otras bases
const DefaultDataSource = new DataSource({
    type: 'postgres',
    host: 'localhost',
    port: 5432,
    username: 'postgres',
    password: '', // Sin password por defecto
    database: 'postgres', // Base de datos por defecto de PostgreSQL
    synchronize: false,
    logging: ['error']
});

async function createDatabases() {
    try {
        console.log('🔧 Conectando a PostgreSQL...');
        
        if (!DefaultDataSource.isInitialized) {
            await DefaultDataSource.initialize();
            console.log('✅ Conexión establecida a postgres@localhost:5432');
        }

        // Verificar bases de datos existentes
        console.log('\n📋 Verificando bases de datos existentes...');
        const existingDbs = await DefaultDataSource.query(
            "SELECT datname FROM pg_database WHERE datistemplate = false;"
        );
        
        console.log('Bases de datos encontradas:', existingDbs.map((db: any) => db.datname).join(', '));

        // Crear base de datos de desarrollo si no existe
        const devDbExists = existingDbs.some((db: any) => db.datname === 'nutri_dev');
        if (!devDbExists) {
            console.log('\n🏗️ Creando base de datos nutri_dev...');
            await DefaultDataSource.query('CREATE DATABASE nutri_dev;');
            console.log('✅ Base de datos nutri_dev creada');
        } else {
            console.log('ℹ️ Base de datos nutri_dev ya existe');
        }

        // Crear base de datos de pruebas si no existe
        const testDbExists = existingDbs.some((db: any) => db.datname === 'nutri_test');
        if (!testDbExists) {
            console.log('\n🧪 Creando base de datos nutri_test...');
            await DefaultDataSource.query('CREATE DATABASE nutri_test;');
            console.log('✅ Base de datos nutri_test creada');
        } else {
            console.log('ℹ️ Base de datos nutri_test ya existe');
        }

        console.log('\n🎯 Bases de datos listas para usar:');
        console.log('📊 Desarrollo: nutri_dev');
        console.log('🧪 Pruebas: nutri_test');
        
    } catch (error: any) {
        console.error('❌ Error creando bases de datos:', error.message || error);
        
        if (error.message && error.message.includes('rol')) {
            console.log('\n💡 Problema de autenticación detectado:');
            console.log('El usuario "postgres" no existe o no tiene permisos.');
            console.log('\nSoluciones posibles:');
            console.log('1. Crear usuario postgres: createuser -s postgres');
            console.log('2. Usar usuario existente modificando el script');
            console.log('3. Configurar password para postgres si es necesario');
        }
        
        throw error;
    } finally {
        if (DefaultDataSource.isInitialized) {
            await DefaultDataSource.destroy();
        }
    }
}

createDatabases()
    .then(() => {
        console.log('\n✅ Configuración de base de datos completada');
        process.exit(0);
    })
    .catch((error) => {
        console.error('❌ Error en el script:', error.message || error);
        process.exit(1);
    }); 