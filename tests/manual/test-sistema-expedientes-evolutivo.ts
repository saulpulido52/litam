// tests/manual/test-sistema-expedientes-evolutivo.ts
import axios, { AxiosError } from 'axios';

const BASE_URL = 'http://localhost:4000/api';

interface LoginResponse {
    access_token: string;
    user: {
        id: string;
        email: string;
        role: {
            name: string;
        };
    };
}

class SistemaExpedientesEvolutivoTester {
    private token: string = '';
    private userId: string = '';

    async login(email: string, password: string): Promise<void> {
        try {
            console.log('🔐 Intentando login...');
            const response = await axios.post<LoginResponse>(`${BASE_URL}/auth/login`, { email, password });
            this.token = response.data.access_token;
            this.userId = response.data.user.id;
            console.log('✅ Login exitoso. Token obtenido.');
        } catch (error) {
            if (error instanceof AxiosError) {
                console.error('❌ Error en login:', error.response?.data || error.message);
            } else {
                console.error('❌ Error en login:', error);
            }
            throw error;
        }
    }

    async testDeteccionTipoExpediente(): Promise<void> {
        console.log('\n🤖 === PRUEBA: DETECCIÓN AUTOMÁTICA DE TIPO DE EXPEDIENTE ===');
        
        try {
            // Caso 1: Primer expediente
            console.log('\n📋 Caso 1: Primer expediente (sin historial)');
            const caso1 = await axios.post(
                `${BASE_URL}/clinical-records/detect-type`,
                {
                    patientId: '66f1ff30-6075-4fc0-8ceb-a3fd0bf2d90f', // ID de paciente existente
                    motivoConsulta: 'Consulta inicial para evaluación nutricional',
                    esProgramada: true
                },
                {
                    headers: { Authorization: `Bearer ${this.token}` }
                }
            );
            console.log('✅ Detección caso 1:', caso1.data.data);

            // Caso 2: Consulta de urgencia
            console.log('\n🚨 Caso 2: Consulta de urgencia');
            const caso2 = await axios.post(
                `${BASE_URL}/clinical-records/detect-type`,
                {
                    patientId: '66f1ff30-6075-4fc0-8ceb-a3fd0bf2d90f',
                    motivoConsulta: 'Dolor abdominal agudo y vómitos',
                    esProgramada: false
                },
                {
                    headers: { Authorization: `Bearer ${this.token}` }
                }
            );
            console.log('✅ Detección caso 2:', caso2.data.data);

            // Caso 3: Seguimiento programado
            console.log('\n📅 Caso 3: Seguimiento programado');
            const caso3 = await axios.post(
                `${BASE_URL}/clinical-records/detect-type`,
                {
                    patientId: '66f1ff30-6075-4fc0-8ceb-a3fd0bf2d90f',
                    motivoConsulta: 'Control de peso y adherencia al plan',
                    esProgramada: true,
                    tipoConsultaSolicitada: 'seguimiento'
                },
                {
                    headers: { Authorization: `Bearer ${this.token}` }
                }
            );
            console.log('✅ Detección caso 3:', caso3.data.data);

        } catch (error) {
            if (error instanceof AxiosError) {
                console.error('❌ Error en detección:', error.response?.data || error.message);
            } else {
                console.error('❌ Error en detección:', error);
            }
        }
    }

    async testObtenerDatosPrevios(): Promise<void> {
        console.log('\n📊 === PRUEBA: OBTENER DATOS PREVIOS DEL PACIENTE ===');
        
        try {
            const response = await axios.get(
                `${BASE_URL}/clinical-records/patient/66f1ff30-6075-4fc0-8ceb-a3fd0bf2d90f/previous-data`,
                {
                    headers: { Authorization: `Bearer ${this.token}` }
                }
            );
            
            console.log('✅ Datos previos obtenidos:');
            console.log('📄 Último expediente:', response.data.data.ultimoExpediente ? 'Existe' : 'No existe');
            console.log('🔗 Datos estáticos:', response.data.data.datosEstaticos ? 'Disponibles' : 'No disponibles');
            console.log('📏 Últimas mediciones:', response.data.data.ultimasMediciones ? 'Disponibles' : 'No disponibles');
            console.log('📈 Tendencias:', response.data.data.tendencias ? 'Calculadas' : 'No calculadas');
            
        } catch (error) {
            if (error instanceof AxiosError) {
                console.error('❌ Error obteniendo datos previos:', error.response?.data || error.message);
            } else {
                console.error('❌ Error obteniendo datos previos:', error);
            }
        }
    }

    async testCrearExpedienteEvolutivo(): Promise<string | null> {
        console.log('\n📋 === PRUEBA: CREAR EXPEDIENTE EVOLUTIVO ===');
        
        try {
            const expedienteData = {
                patientId: '66f1ff30-6075-4fc0-8ceb-a3fd0bf2d90f',
                recordDate: new Date().toISOString().split('T')[0],
                consultationReason: 'Seguimiento de plan nutricional',
                
                // Datos de seguimiento específicos
                seguimientoMetadata: {
                    adherencia_plan: 85,
                    dificultades: 'Dificultad para seguir horarios de comida',
                    satisfaccion: 4,
                    cambios_medicamentos: false,
                    mejoras_notadas: 'Mayor energía durante el día',
                    proximos_objetivos: 'Reducir 2kg en próximo mes'
                },

                // Análisis de riesgo-beneficio
                analisisRiesgoBeneficio: {
                    decision: 'Continuar con plan actual con modificaciones menores',
                    riesgos: ['Posible plateau en pérdida de peso'],
                    beneficios: ['Mantenimiento de energía', 'Mejora en composición corporal'],
                    alternativas: ['Plan más restrictivo', 'Incluir ejercicio cardiovascular'],
                    razonamiento: 'El paciente muestra buena adherencia y resultados positivos'
                },

                // Capacidad del paciente
                capacidadPaciente: {
                    comprende_medicamentos: true,
                    conoce_sintomas_alarma: true,
                    sabe_contacto_emergencia: true,
                    puede_auto_monitoreo: true,
                    requiere_apoyo_familiar: false,
                    nivel_independencia: 'alto',
                    observaciones: 'Paciente muy comprometido con el tratamiento'
                },

                // Mediciones antropométricas nuevas
                anthropometricMeasurements: {
                    currentWeightKg: 103,
                    heightM: 1.75,
                    waistCircCm: 92
                },

                // Presión arterial
                bloodPressure: {
                    knowsBp: true,
                    systolic: 125,
                    diastolic: 80
                }
            };

            const response = await axios.post(
                `${BASE_URL}/clinical-records/evolutivo`,
                expedienteData,
                {
                    headers: { Authorization: `Bearer ${this.token}` }
                }
            );

            console.log('✅ Expediente evolutivo creado:');
            console.log('🆔 ID:', response.data.data.record.id);
            console.log('📊 Tipo:', response.data.data.record.tipo_expediente);
            console.log('🔗 Expediente base:', response.data.data.record.expediente_base_id || 'No asignado');
            
            return response.data.data.record.id;

        } catch (error) {
            if (error instanceof AxiosError) {
                console.error('❌ Error creando expediente evolutivo:', error.response?.data || error.message);
            } else {
                console.error('❌ Error creando expediente evolutivo:', error);
            }
            return null;
        }
    }

    async testGenerarComparativo(expedienteActualId: string): Promise<void> {
        console.log('\n📈 === PRUEBA: GENERAR COMPARATIVO ===');
        
        try {
            // Primero necesitamos obtener el ID del expediente base
            const datosResponse = await axios.get(
                `${BASE_URL}/clinical-records/patient/66f1ff30-6075-4fc0-8ceb-a3fd0bf2d90f/previous-data`,
                {
                    headers: { Authorization: `Bearer ${this.token}` }
                }
            );

            const expedienteBaseId = datosResponse.data.data.ultimoExpediente?.id;
            
            if (!expedienteBaseId) {
                console.log('⚠️ No hay expediente base para comparar');
                return;
            }

            const response = await axios.get(
                `${BASE_URL}/clinical-records/compare/${expedienteActualId}/${expedienteBaseId}`,
                {
                    headers: { Authorization: `Bearer ${this.token}` }
                }
            );

            console.log('✅ Comparativo generado:');
            console.log('📅 Fechas:', {
                anterior: response.data.data.fecha_anterior,
                actual: response.data.data.fecha_actual
            });
            console.log('📊 Cambios detectados:');
            Object.entries(response.data.data.cambios).forEach(([campo, cambio]: [string, any]) => {
                if (cambio) {
                    console.log(`  ${campo}: ${cambio.anterior} → ${cambio.actual} (${cambio.tendencia})`);
                }
            });

        } catch (error) {
            if (error instanceof AxiosError) {
                console.error('❌ Error generando comparativo:', error.response?.data || error.message);
            } else {
                console.error('❌ Error generando comparativo:', error);
            }
        }
    }

    async testEstadisticasSeguimiento(): Promise<void> {
        console.log('\n📊 === PRUEBA: ESTADÍSTICAS DE SEGUIMIENTO ===');
        
        try {
            const response = await axios.get(
                `${BASE_URL}/clinical-records/stats/seguimiento`,
                {
                    headers: { Authorization: `Bearer ${this.token}` }
                }
            );

            console.log('✅ Estadísticas obtenidas:');
            console.log('📈 Expedientes por tipo:', response.data.data.por_tipo);
            console.log('📅 Últimos 30 días:', response.data.data.ultimos_30_dias);
            
        } catch (error) {
            if (error instanceof AxiosError) {
                console.error('❌ Error obteniendo estadísticas:', error.response?.data || error.message);
            } else {
                console.error('❌ Error obteniendo estadísticas:', error);
            }
        }
    }

    async runAllTests(): Promise<void> {
        console.log('🚀 === INICIANDO PRUEBAS DEL SISTEMA EVOLUTIVO DE EXPEDIENTES ===\n');
        
        try {
            // Login
            await this.login('nutri.admin@sistema.com', 'Nutri123!');
            
            // Ejecutar todas las pruebas
            await this.testDeteccionTipoExpediente();
            await this.testObtenerDatosPrevios();
            
            const expedienteId = await this.testCrearExpedienteEvolutivo();
            if (expedienteId) {
                await this.testGenerarComparativo(expedienteId);
            }
            
            await this.testEstadisticasSeguimiento();
            
            console.log('\n🎉 === TODAS LAS PRUEBAS COMPLETADAS ===');
            
        } catch (error) {
            console.error('\n💥 === FALLÓ DURANTE LA EJECUCIÓN ===');
            console.error(error);
        }
    }
}

// Ejecutar las pruebas
const tester = new SistemaExpedientesEvolutivoTester();
tester.runAllTests(); 