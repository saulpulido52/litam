import { AppDataSource } from '../../src/database/data-source';
import { User } from '../../src/database/entities/user.entity';
import { PatientNutritionistRelation, RelationshipStatus } from '../../src/database/entities/patient_nutritionist_relation.entity';
import { DietPlan } from '../../src/database/entities/diet_plan.entity';
import { diagnosticarIntegridad, DiagnosticoReporte } from './diagnostico-integridad-completo';

interface AccionReparacion {
    tipo: 'reactivar' | 'crear' | 'limpiar';
    descripcion: string;
    ejecutada: boolean;
    error?: string;
}

async function repararIntegridadDatos(modo: 'dry-run' | 'ejecutar' = 'dry-run'): Promise<AccionReparacion[]> {
    console.log('🔧 ===============================================');
    console.log('🔧 REPARACIÓN DE INTEGRIDAD DE DATOS');
    console.log(`🔧 Modo: ${modo === 'dry-run' ? 'SIMULACIÓN (no se harán cambios)' : 'EJECUCIÓN REAL'}`);
    console.log('🔧 ===============================================\n');

    if (!AppDataSource.isInitialized) {
        console.log('📡 Inicializando conexión a base de datos...');
        await AppDataSource.initialize();
        console.log('✅ Base de datos conectada\n');
    }

    const relationRepository = AppDataSource.getRepository(PatientNutritionistRelation);
    const dietPlanRepository = AppDataSource.getRepository(DietPlan);
    const acciones: AccionReparacion[] = [];

    // 1. EJECUTAR DIAGNÓSTICO PRIMERO
    console.log('📊 Ejecutando diagnóstico previo...\n');
    const reporte = await diagnosticarIntegridad();

    if (!reporte.problema_detectado) {
        console.log('✅ No se detectaron problemas de integridad. No se requiere reparación.');
        return [];
    }

    console.log('\n🔧 INICIANDO REPARACIONES...\n');

    // 2. REACTIVAR RELACIONES EXISTENTES
    console.log('🔄 1. REACTIVANDO RELACIONES EXISTENTES:');
    console.log('=========================================');

    const relacionesInactivas = await relationRepository.find({
        where: [
            { status: RelationshipStatus.INACTIVE },
            { status: RelationshipStatus.PENDING },
            { status: RelationshipStatus.REJECTED }
        ],
        relations: ['patient', 'nutritionist']
    });

    if (relacionesInactivas.length > 0) {
        console.log(`📋 Encontradas ${relacionesInactivas.length} relaciones para reactivar:\n`);

        for (const relacion of relacionesInactivas) {
            const accion: AccionReparacion = {
                tipo: 'reactivar',
                descripcion: `Reactivar relación: ${relacion.nutritionist.first_name} ${relacion.nutritionist.last_name} ↔ ${relacion.patient.first_name} ${relacion.patient.last_name}`,
                ejecutada: false
            };

            console.log(`🔄 ${accion.descripcion}`);
            console.log(`   ID: ${relacion.id}`);
            console.log(`   Estado actual: ${relacion.status}`);

            if (modo === 'ejecutar') {
                try {
                    relacion.status = RelationshipStatus.ACTIVE;
                    relacion.accepted_at = new Date();
                    await relationRepository.save(relacion);
                    
                    accion.ejecutada = true;
                    console.log('   ✅ Reactivada exitosamente');
                } catch (error: any) {
                    accion.error = error.message;
                    console.log(`   ❌ Error: ${error.message}`);
                }
            } else {
                console.log('   🔍 [SIMULACIÓN] Se reactivaría esta relación');
            }

            acciones.push(accion);
            console.log('');
        }
    } else {
        console.log('ℹ️ No hay relaciones inactivas para reactivar\n');
    }

    // 3. CREAR RELACIONES PARA PLANES HUÉRFANOS
    console.log('📝 2. CREANDO RELACIONES PARA PLANES HUÉRFANOS:');
    console.log('================================================');

    const planesHuerfanos: DietPlan[] = [];
    const todosLosPlanes = await dietPlanRepository.find({
        relations: ['patient', 'nutritionist']
    });

    // Identificar planes huérfanos
    for (const plan of todosLosPlanes) {
        const relacionActiva = await relationRepository.findOne({
            where: {
                nutritionist: { id: plan.nutritionist.id },
                patient: { id: plan.patient.id },
                status: RelationshipStatus.ACTIVE
            }
        });

        if (!relacionActiva) {
            planesHuerfanos.push(plan);
        }
    }

    if (planesHuerfanos.length > 0) {
        console.log(`📋 Encontrados ${planesHuerfanos.length} planes huérfanos:\n`);

        // Agrupar por par nutriólogo-paciente para evitar duplicados
        const relacionesNecesarias = new Map();
        
        planesHuerfanos.forEach(plan => {
            const key = `${plan.nutritionist.id}-${plan.patient.id}`;
            if (!relacionesNecesarias.has(key)) {
                relacionesNecesarias.set(key, {
                    nutritionist: plan.nutritionist,
                    patient: plan.patient,
                    planes: []
                });
            }
            relacionesNecesarias.get(key).planes.push(plan);
        });

        for (const [key, data] of relacionesNecesarias) {
            const accion: AccionReparacion = {
                tipo: 'crear',
                descripcion: `Crear relación: ${data.nutritionist.first_name} ${data.nutritionist.last_name} ↔ ${data.patient.first_name} ${data.patient.last_name} (${data.planes.length} planes)`,
                ejecutada: false
            };

            console.log(`📝 ${accion.descripcion}`);
            console.log(`   Nutriólogo: ${data.nutritionist.email}`);
            console.log(`   Paciente: ${data.patient.email}`);
            console.log(`   Planes afectados: ${data.planes.map((p: any) => p.name).join(', ')}`);

            if (modo === 'ejecutar') {
                try {
                    // Verificar si ya existe alguna relación (incluso inactiva)
                    const relacionExistente = await relationRepository.findOne({
                        where: {
                            nutritionist: { id: data.nutritionist.id },
                            patient: { id: data.patient.id }
                        }
                    });

                    if (relacionExistente) {
                        // Si existe pero no está activa, reactivarla
                        relacionExistente.status = RelationshipStatus.ACTIVE;
                        relacionExistente.accepted_at = new Date();
                        await relationRepository.save(relacionExistente);
                        console.log('   ✅ Relación existente reactivada');
                    } else {
                        // Crear nueva relación
                        const nuevaRelacion = relationRepository.create({
                            nutritionist: data.nutritionist,
                            patient: data.patient,
                            status: RelationshipStatus.ACTIVE,
                            requested_at: new Date(),
                            accepted_at: new Date(),
                            notes: 'Relación creada automáticamente para reparar integridad de datos'
                        });

                        await relationRepository.save(nuevaRelacion);
                        console.log('   ✅ Nueva relación creada exitosamente');
                    }
                    
                    accion.ejecutada = true;
                } catch (error: any) {
                    accion.error = error.message;
                    console.log(`   ❌ Error: ${error.message}`);
                }
            } else {
                console.log('   🔍 [SIMULACIÓN] Se crearía/reactivaría esta relación');
            }

            acciones.push(accion);
            console.log('');
        }
    } else {
        console.log('ℹ️ No hay planes huérfanos que requieran nuevas relaciones\n');
    }

    // 4. RESUMEN DE ACCIONES
    console.log('📋 3. RESUMEN DE ACCIONES:');
    console.log('==========================');

    const accionesReactivar = acciones.filter(a => a.tipo === 'reactivar');
    const accionesCrear = acciones.filter(a => a.tipo === 'crear');
    const accionesExitosas = acciones.filter(a => a.ejecutada);
    const accionesConError = acciones.filter(a => a.error);

    console.log(`🔄 Relaciones a reactivar: ${accionesReactivar.length}`);
    console.log(`📝 Relaciones a crear: ${accionesCrear.length}`);
    
    if (modo === 'ejecutar') {
        console.log(`✅ Acciones exitosas: ${accionesExitosas.length}`);
        console.log(`❌ Acciones con error: ${accionesConError.length}`);

        if (accionesConError.length > 0) {
            console.log('\n❌ ERRORES ENCONTRADOS:');
            accionesConError.forEach(accion => {
                console.log(`   ${accion.descripcion}: ${accion.error}`);
            });
        }
    }

    // 5. VERIFICACIÓN POST-REPARACIÓN
    if (modo === 'ejecutar' && accionesExitosas.length > 0) {
        console.log('\n🔍 4. VERIFICACIÓN POST-REPARACIÓN:');
        console.log('====================================');
        
        console.log('Ejecutando diagnóstico final...\n');
        const reporteFinal = await diagnosticarIntegridad();
        
        if (!reporteFinal.problema_detectado) {
            console.log('🎉 ¡REPARACIÓN EXITOSA!');
            console.log('✅ Todos los problemas de integridad han sido resueltos');
        } else {
            console.log('⚠️ Algunos problemas persisten:');
            console.log(`   🚨 Planes huérfanos restantes: ${reporteFinal.planes.huerfanos}`);
            console.log(`   🔗 Relaciones activas: ${reporteFinal.relaciones.activas}`);
        }
    }

    return acciones;
}

async function main() {
    const args = process.argv.slice(2);
    const modo = args[0] === '--ejecutar' ? 'ejecutar' : 'dry-run';

    if (modo === 'dry-run') {
        console.log('ℹ️ MODO SIMULACIÓN ACTIVADO');
        console.log('   Para ejecutar realmente los cambios, usa: --ejecutar\n');
    }

    try {
        const acciones = await repararIntegridadDatos(modo);
        
        console.log('\n🎯 REPARACIÓN COMPLETADA');
        console.log(`📊 Total de acciones: ${acciones.length}`);
        
        if (modo === 'dry-run' && acciones.length > 0) {
            console.log('\n💡 Para aplicar las reparaciones ejecuta:');
            console.log('   npx ts-node scripts/utils/reparar-integridad-datos.ts --ejecutar');
        }
        
        process.exit(0);
    } catch (error) {
        console.error('\n❌ Error durante reparación:', error);
        process.exit(1);
    } finally {
        if (AppDataSource.isInitialized) {
            await AppDataSource.destroy();
        }
    }
}

// Solo ejecutar si es llamado directamente
if (require.main === module) {
    main();
}

export { repararIntegridadDatos, AccionReparacion }; 