import axios from 'axios';

interface LoginResponse {
  access_token: string;
  user: {
    id: string;
    email: string;
    role: { name: string };
  };
}

interface ProgressData {
  date: string;
  weight: number;
  bodyFatPercentage?: number;
  muscleMassPercentage?: number;
  measurements?: {
    waist?: number;
    hip?: number;
    arm?: number;
  };
  notes?: string;
  adherenceToPlan?: number;
  feelingLevel?: number;
}

const BASE_URL = 'http://localhost:4000/api';

class ProgressTrackingTester {
  private token: string = '';
  private userId: string = '';
  private patientId: string = '';

  async testBackendHealth(): Promise<void> {
    try {
      console.log('🏥 Verificando salud del backend...');
      const response = await axios.get(`${BASE_URL}/auth/login`, {
        validateStatus: () => true // Aceptar cualquier código de estado
      });

      console.log('✅ Backend está respondiendo');
      console.log('📊 Status:', response.status);
    } catch (error: any) {
      console.log('⚠️ Backend no responde a /auth/login, pero continuando...');
      // No lanzar error, solo continuar
    }
  }

  async login(email: string, password: string): Promise<void> {
    try {
      console.log('🔐 Intentando login con:', email);
      const response = await axios.post<LoginResponse>(`${BASE_URL}/auth/login`, {
        email,
        password
      });

      this.token = response.data.access_token;
      this.userId = response.data.user.id;
      
      console.log('✅ Login exitoso');
      console.log('📋 Usuario ID:', this.userId);
      console.log('🎭 Rol:', response.data.user.role.name);
    } catch (error: any) {
      console.error('❌ Error en login:', error.response?.data || error.message);
      throw error;
    }
  }

  async createProgressLog(progressData: ProgressData): Promise<void> {
    try {
      console.log('📝 Creando registro de progreso...');
      const response = await axios.post(
        `${BASE_URL}/progress-tracking/create`,
        progressData,
        {
          headers: { Authorization: `Bearer ${this.token}` }
        }
      );

      console.log('✅ Registro de progreso creado exitosamente');
      console.log('📊 Datos:', response.data.data);
    } catch (error: any) {
      console.error('❌ Error creando progreso:', error.response?.data || error.message);
      throw error;
    }
  }

  async getMyProgress(): Promise<void> {
    try {
      console.log('📖 Obteniendo mi progreso...');
      const response = await axios.get(
        `${BASE_URL}/progress-tracking/me`,
        {
          headers: { Authorization: `Bearer ${this.token}` }
        }
      );

      console.log('✅ Progreso obtenido exitosamente');
      console.log('📊 Número de registros:', response.data.data?.logs?.length || 0);
      
      if (response.data.data?.logs?.length > 0) {
        console.log('📋 Último registro:', response.data.data.logs[0]);
      }
    } catch (error: any) {
      console.error('❌ Error obteniendo progreso:', error.response?.data || error.message);
      throw error;
    }
  }

  async testPatientProgress(patientId: string): Promise<void> {
    try {
      console.log('🔍 Probando progreso de paciente:', patientId);
      const response = await axios.get(
        `${BASE_URL}/progress-tracking/patient/${patientId}`,
        {
          headers: { Authorization: `Bearer ${this.token}` }
        }
      );

      console.log('✅ Progreso de paciente obtenido');
      console.log('📊 Registros encontrados:', response.data.data?.logs?.length || 0);
    } catch (error: any) {
      console.error('❌ Error obteniendo progreso de paciente:', error.response?.data || error.message);
    }
  }

  async testAutomaticAnalysis(patientId: string): Promise<void> {
    try {
      console.log('🤖 Probando análisis automático para paciente:', patientId);
      const response = await axios.post(
        `${BASE_URL}/progress-tracking/patient/${patientId}/generate-automatic`,
        {},
        {
          headers: { Authorization: `Bearer ${this.token}` }
        }
      );

      console.log('✅ Análisis automático generado');
      console.log('📈 Análisis:', response.data.data);
    } catch (error: any) {
      console.error('❌ Error en análisis automático:', error.response?.data || error.message);
    }
  }

  async runCompleteTest(): Promise<void> {
    try {
      console.log('🚀 Iniciando prueba completa del sistema de progreso...\n');

      // Verificar backend (sin fallar si no responde)
      await this.testBackendHealth();

      // Lista de credenciales para probar
      const credentialsList = [
        { email: 'nutritionist@demo.com', password: 'demo123' },
        { email: 'admin@demo.com', password: 'demo123' },
        { email: 'maria.gonzalez@demo.com', password: 'demo123' },
        { email: 'carlos.ruiz@demo.com', password: 'demo123' },
        { email: 'ana.lopez@demo.com', password: 'demo123' }
      ];

      let loginSuccessful = false;

      for (const credentials of credentialsList) {
        try {
          await this.login(credentials.email, credentials.password);
          loginSuccessful = true;
          console.log('✅ Login exitoso\n');
          break;
        } catch (error) {
          console.log(`⚠️ Credenciales ${credentials.email} no funcionaron\n`);
        }
      }

      if (!loginSuccessful) {
        console.log('❌ No se pudo hacer login con ninguna credencial');
        return;
      }

      // Crear registro de progreso si es paciente
      const progressData: ProgressData = {
        date: new Date().toISOString().split('T')[0],
        weight: 70.5,
        bodyFatPercentage: 25.3,
        muscleMassPercentage: 35.2,
        measurements: {
          waist: 85,
          hip: 95,
          arm: 30
        },
        notes: 'Sintiéndome con más energía esta semana',
        adherenceToPlan: 85,
        feelingLevel: 4
      };

      await this.createProgressLog(progressData);
      await this.getMyProgress();

      // Probar funciones de nutriólogo usando el propio ID como paciente de prueba
      await this.testPatientProgress(this.userId);
      await this.testAutomaticAnalysis(this.userId);

      console.log('🎉 Prueba completa finalizada');

    } catch (error: any) {
      console.error('💥 Error en la prueba completa:', error.message);
    }
  }
}

// Ejecutar la prueba
const tester = new ProgressTrackingTester();
tester.runCompleteTest().then(() => {
  console.log('✨ Script de prueba terminado');
  process.exit(0);
}).catch((error) => {
  console.error('💥 Error fatal:', error);
  process.exit(1);
}); 