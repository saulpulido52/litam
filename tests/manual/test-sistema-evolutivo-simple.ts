// tests/manual/test-sistema-evolutivo-simple.ts
import 'dotenv/config';
import { AppDataSource } from '../../src/database/data-source';
import clinicalRecordService from '../../src/modules/clinical_records/clinical_record.service';
import { User } from '../../src/database/entities/user.entity';
import { ClinicalRecord, TipoExpediente } from '../../src/database/entities/clinical_record.entity';

async function testSistemaEvolutivo() {
    try {
        console.log('🚀 === INICIANDO PRUEBAS DEL SISTEMA EVOLUTIVO (DIRECTO BD) ===\n');
        
        // Inicializar conexión
        await AppDataSource.initialize();
        console.log('✅ Conexión con base de datos establecida\n');

        // El servicio ya está importado como instancia

        // Buscar un nutriólogo y paciente para las pruebas
        const userRepo = AppDataSource.getRepository(User);
        const nutritionist = await userRepo.findOne({
            where: { email: 'nutri.admin@sistema.com' },
            relations: ['role']
        });

        const patient = await userRepo.findOne({
            where: { email: 'sebastian@gmail.com' }, // ID: 66f1ff30-6075-4fc0-8ceb-a3fd0bf2d90f
            relations: ['role']
        });

        if (!nutritionist || !patient) {
            console.error('❌ No se encontraron usuarios necesarios para las pruebas');
            return;
        }

        console.log(`📋 Nutriólogo: ${nutritionist.first_name} ${nutritionist.last_name} (${nutritionist.email})`);
        console.log(`👤 Paciente: ${patient.first_name} ${patient.last_name} (${patient.email})\n`);

        // 1. PRUEBA: Detección automática de tipo
        console.log('=== 1. PRUEBA: DETECCIÓN AUTOMÁTICA DE TIPO ===');
        try {
            const deteccion = await clinicalRecordService.detectarTipoExpediente({
                patientId: patient.id,
                motivoConsulta: 'Control de peso mensual',
                esProgramada: true,
                tipoConsultaSolicitada: 'seguimiento'
            });

            console.log('✅ Tipo detectado:', deteccion.tipoSugerido);
            console.log('📝 Razón:', deteccion.razon);
            if (deteccion.expedienteBaseId) {
                console.log('🔗 Expediente base:', deteccion.expedienteBaseId);
            }
            if (deteccion.alertas && deteccion.alertas.length > 0) {
                console.log('⚠️ Alertas:', deteccion.alertas);
            }
        } catch (error) {
            console.error('❌ Error en detección:', error);
        }

        // 2. PRUEBA: Obtener datos previos
        console.log('\n=== 2. PRUEBA: OBTENER DATOS PREVIOS DEL PACIENTE ===');
        try {
            const datosPrevios = await clinicalRecordService.obtenerDatosPreviosPaciente(
                patient.id,
                nutritionist.id,
                nutritionist.role?.name as any
            );

            console.log('✅ Datos previos obtenidos:');
            if (datosPrevios.ultimasMediciones) {
                console.log('📊 Últimas mediciones:');
                console.log(`   - Peso: ${datosPrevios.ultimasMediciones.peso || 'N/A'} kg`);
                console.log(`   - IMC: ${datosPrevios.ultimasMediciones.imc || 'N/A'}`);
                console.log(`   - Presión: ${datosPrevios.ultimasMediciones.presion_sistolica || 'N/A'}/${datosPrevios.ultimasMediciones.presion_diastolica || 'N/A'}`);
            }
            if (datosPrevios.tendencias) {
                console.log('📈 Tendencias:');
                console.log(`   - Peso: ${datosPrevios.tendencias.peso || 'N/A'}`);
                console.log(`   - Presión: ${datosPrevios.tendencias.presion || 'N/A'}`);
            }
        } catch (error) {
            console.error('❌ Error obteniendo datos previos:', error);
        }

        // 3. PRUEBA: Crear expediente evolutivo
        console.log('\n=== 3. PRUEBA: CREAR EXPEDIENTE EVOLUTIVO ===');
        try {
            const nuevoExpediente = await clinicalRecordService.createClinicalRecordEvolutivo(
                {
                    patientId: patient.id,
                    recordDate: new Date().toISOString().split('T')[0],
                    consultationReason: 'Seguimiento mensual del plan nutricional',
                    
                    // Campos específicos de seguimiento
                    tipoExpediente: TipoExpediente.SEGUIMIENTO,
                    seguimientoMetadata: {
                        adherencia_plan: 85,
                        dificultades: 'Dificultad para seguir horarios de comida en el trabajo',
                        satisfaccion: 4,
                        cambios_medicamentos: false,
                        mejoras_notadas: 'Mayor energía, mejor digestión',
                        proximos_objetivos: 'Reducir 2kg adicionales, mejorar adherencia'
                    },
                    
                    // Mediciones actuales
                    anthropometricMeasurements: {
                        currentWeightKg: 102.5,
                        heightM: 1.75,
                        waistCircCm: 91.5
                    },
                    
                    // Presión arterial
                    bloodPressure: {
                        knowsBp: true,
                        systolic: 125,
                        diastolic: 78
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
                    
                    // Notas de evolución
                    evolutionAndFollowUpNotes: 'Paciente muestra excelente progreso. Reducción de peso constante. Recomiendo continuar con plan actual con ajustes menores en horarios.'
                },
                nutritionist.id
            );

            console.log('✅ Expediente evolutivo creado exitosamente');
            console.log(`🆔 ID: ${nuevoExpediente.id}`);
            console.log(`📊 Tipo: ${nuevoExpediente.tipo_expediente}`);
            console.log(`🔗 Expediente base: ${nuevoExpediente.expediente_base_id || 'No asignado'}`);
            
            // Si hay expediente base, generar comparativo
            if (nuevoExpediente.expediente_base_id) {
                console.log('\n=== 4. PRUEBA: GENERAR COMPARATIVO AUTOMÁTICO ===');
                try {
                    const comparativo = await clinicalRecordService.generarComparativo(
                        nuevoExpediente.id,
                        nuevoExpediente.expediente_base_id
                    );
                    
                    console.log('✅ Comparativo generado:');
                    console.log('📊 Mediciones comparadas:');
                    
                    if (comparativo.cambios?.peso) {
                        console.log(`   Peso: ${comparativo.cambios.peso.anterior} kg → ${comparativo.cambios.peso.actual} kg (${comparativo.cambios.peso.diferencia > 0 ? '+' : ''}${comparativo.cambios.peso.diferencia} kg, ${comparativo.cambios.peso.porcentaje_cambio}%)`);
                    }
                    if (comparativo.cambios?.imc) {
                        console.log(`   IMC: ${comparativo.cambios.imc.anterior} → ${comparativo.cambios.imc.actual} (${comparativo.cambios.imc.diferencia > 0 ? '+' : ''}${comparativo.cambios.imc.diferencia})`);
                    }
                    if (comparativo.cambios?.cintura) {
                        console.log(`   Cintura: ${comparativo.cambios.cintura.anterior} cm → ${comparativo.cambios.cintura.actual} cm (${comparativo.cambios.cintura.diferencia > 0 ? '+' : ''}${comparativo.cambios.cintura.diferencia} cm)`);
                    }
                } catch (error) {
                    console.error('❌ Error generando comparativo:', error);
                }
            }
            
        } catch (error) {
            console.error('❌ Error creando expediente evolutivo:', error);
        }

        // 5. PRUEBA: Estadísticas de seguimiento
        console.log('\n=== 5. PRUEBA: ESTADÍSTICAS DE SEGUIMIENTO ===');
        try {
            const estadisticas = await clinicalRecordService.getEstadisticasSeguimiento(nutritionist.id);
            
            console.log('✅ Estadísticas obtenidas:');
            console.log(`📊 Expedientes últimos 30 días: ${estadisticas.ultimos_30_dias}`);
            console.log('📈 Distribución por tipo:');
            
            estadisticas.por_tipo.forEach(stat => {
                console.log(`   - ${stat.tipo}: ${stat.total} expedientes`);
            });
            
            const total = estadisticas.por_tipo.reduce((acc, curr) => acc + curr.total, 0);
            const seguimientos = estadisticas.por_tipo.find(s => s.tipo === 'seguimiento')?.total || 0;
            const porcentajeSeguimiento = total > 0 ? Math.round((seguimientos / total) * 100) : 0;
            
            console.log(`\n📊 Métricas de calidad:`);
            console.log(`   - Total expedientes: ${total}`);
            console.log(`   - % Seguimientos: ${porcentajeSeguimiento}%`);
            console.log(`   - Continuidad: ${porcentajeSeguimiento >= 60 ? '✅ Excelente' : porcentajeSeguimiento >= 40 ? '⚠️ Mejorable' : '❌ Baja'}`);
            
        } catch (error) {
            console.error('❌ Error obteniendo estadísticas:', error);
        }

    } catch (error) {
        console.error('💥 Error general:', error);
    } finally {
        if (AppDataSource.isInitialized) {
            await AppDataSource.destroy();
            console.log('\n🔚 Conexión cerrada');
        }
    }
}

// Ejecutar las pruebas
testSistemaEvolutivo(); 