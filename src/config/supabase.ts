import { createClient } from '@supabase/supabase-js';
import { AppDataSource } from '../database/data-source';

// Configuración para Supabase
export const supabaseConfig = {
  url: process.env.SUPABASE_URL || 'https://your-project.supabase.co',
  anonKey: process.env.SUPABASE_ANON_KEY || 'your-anon-key',
  serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY || 'your-service-role-key'
};

// Cliente de Supabase para autenticación y storage
export const supabase = createClient(
  supabaseConfig.url,
  supabaseConfig.anonKey,
  {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true
    },
    realtime: {
      params: {
        eventsPerSecond: 10
      }
    }
  }
);

// Cliente de Supabase con service role para operaciones administrativas
export const supabaseAdmin = createClient(
  supabaseConfig.url,
  supabaseConfig.serviceRoleKey,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

// Configuración de TypeORM para Supabase
export const getSupabaseDataSource = () => {
  return new AppDataSource({
    type: 'postgres',
    url: process.env.DATABASE_URL || process.env.SUPABASE_DB_URL,
    ssl: {
      rejectUnauthorized: false,
      require: true
    },
    extra: {
      max: 25,
      min: 5,
      acquireTimeoutMillis: 15000,
      idleTimeoutMillis: 5000,
      connectionTimeoutMillis: 3000,
      statement_timeout: 15000,
      idle_in_transaction_session_timeout: 20000,
      application_name: 'litam-backend-prod',
      connect_timeout: 5,
      keepalive: true,
      keepalive_idle: 10,
      tcp_keepalives_interval: 150,
      tcp_keepalives_count: 3,
      lock_timeout: 10000,
      log_statement: 'none',
      log_duration: false,
      search_path: 'public',
      timezone: 'UTC',
      shared_preload_libraries: 'pg_stat_statements',
      work_mem: '4MB',
      maintenance_work_mem: '64MB'
    },
    synchronize: false,
    dropSchema: false,
    logging: process.env.NODE_ENV === 'development',
    entities: ['src/database/entities/**/*.ts'],
    migrations: ['src/database/migrations/**/*.ts'],
    subscribers: ['src/database/subscribers/**/*.ts']
  });
};

// Función para inicializar la conexión a Supabase
export const initializeSupabase = async () => {
  try {
    console.log('🔌 Inicializando conexión a Supabase...');
    
    const dataSource = getSupabaseDataSource();
    await dataSource.initialize();
    
    console.log('✅ Conexión a Supabase establecida correctamente');
    return dataSource;
  } catch (error) {
    console.error('❌ Error al conectar con Supabase:', error);
    throw error;
  }
};

// Función para verificar la salud de Supabase
export const checkSupabaseHealth = async () => {
  try {
    const { data, error } = await supabase.from('health_check').select('*').limit(1);
    
    if (error) {
      console.error('❌ Error en health check de Supabase:', error);
      return false;
    }
    
    console.log('✅ Health check de Supabase exitoso');
    return true;
  } catch (error) {
    console.error('❌ Error en health check de Supabase:', error);
    return false;
  }
}; 