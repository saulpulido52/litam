import { AppDataSource } from '../../src/database/data-source';
import { User } from '../../src/database/entities/user.entity';
import { Role, RoleName } from '../../src/database/entities/role.entity';
import { PatientNutritionistRelation, RelationshipStatus } from '../../src/database/entities/patient_nutritionist_relation.entity';
import { DietPlan } from '../../src/database/entities/diet_plan.entity';

interface PlanHuerfano {
    plan: DietPlan;
    razon: string;
}

interface DiagnosticoReporte {
    usuarios: {
        total: number;
        nutritionists: number;
        patients: number;
        activos: number;
        inactivos: number;
    };
    relaciones: {
        total: number;
        activas: number;
        inactivas: number;
        pendientes: number;
        rechazadas: number;
    };
    planes: {
        total: number;
        huerfanos: number;
        activos: number;
        borradores: number;
    };
    problema_detectado: boolean;
    solucion_recomendada: string[];
}

async function diagnosticarIntegridad(): Promise<DiagnosticoReporte> {
    console.log('🩺 ===============================================');
    console.log('🩺 DIAGNÓSTICO DE INTEGRIDAD DE DATOS');
    console.log('🩺 Problema: Pacientes desaparecidos, planes persisten');
    console.log('🩺 ===============================================\n');

    if (!AppDataSource.isInitialized) {
        console.log('📡 Inicializando conexión a base de datos...');
        await AppDataSource.initialize();
        console.log('✅ Base de datos conectada\n');
    }

    const userRepository = AppDataSource.getRepository(User);
    const roleRepository = AppDataSource.getRepository(Role);
    const relationRepository = AppDataSource.getRepository(PatientNutritionistRelation);
    const dietPlanRepository = AppDataSource.getRepository(DietPlan);

    // 1. ANÁLISIS DE USUARIOS
    console.log('👥 1. ANÁLISIS DE USUARIOS:');
    console.log('===========================');

    const allUsers = await userRepository.find({
        relations: ['role'],
        order: { created_at: 'DESC' }
    });

    const nutritionists = allUsers.filter(u => u.role.name === RoleName.NUTRITIONIST);
    const patients = allUsers.filter(u => u.role.name === RoleName.PATIENT);
    const activeUsers = allUsers.filter(u => u.is_active);
    const inactiveUsers = allUsers.filter(u => !u.is_active);

    console.log(`📊 Total usuarios: ${allUsers.length}`);
    console.log(`👨‍⚕️ Nutriólogos: ${nutritionists.length}`);
    console.log(`🤱 Pacientes: ${patients.length}`);
    console.log(`✅ Activos: ${activeUsers.length}`);
    console.log(`❌ Inactivos: ${inactiveUsers.length}\n`);

    // Mostrar detalles de nutriólogos
    console.log('👨‍⚕️ NUTRIÓLOGOS EN SISTEMA:');
    nutritionists.forEach((n, index) => {
        console.log(`${index + 1}. ${n.first_name} ${n.last_name} (${n.email}) - ${n.is_active ? '✅ Activo' : '❌ Inactivo'}`);
    });

    // Mostrar detalles de pacientes
    console.log('\n🤱 PACIENTES EN SISTEMA:');
    patients.forEach((p, index) => {
        console.log(`${index + 1}. ${p.first_name} ${p.last_name} (${p.email}) - ${p.is_active ? '✅ Activo' : '❌ Inactivo'}`);
    });

    // 2. ANÁLISIS DE RELACIONES
    console.log('\n🔗 2. ANÁLISIS DE RELACIONES:');
    console.log('=============================');

    const allRelations = await relationRepository.find({
        relations: ['patient', 'nutritionist'],
        order: { requested_at: 'DESC' }
    });

    const activeRelations = allRelations.filter(r => r.status === RelationshipStatus.ACTIVE);
    const inactiveRelations = allRelations.filter(r => r.status === RelationshipStatus.INACTIVE);
    const pendingRelations = allRelations.filter(r => r.status === RelationshipStatus.PENDING);
    const rejectedRelations = allRelations.filter(r => r.status === RelationshipStatus.REJECTED);

    console.log(`📊 Total relaciones: ${allRelations.length}`);
    console.log(`✅ Activas: ${activeRelations.length}`);
    console.log(`❌ Inactivas: ${inactiveRelations.length}`);
    console.log(`⏳ Pendientes: ${pendingRelations.length}`);
    console.log(`🚫 Rechazadas: ${rejectedRelations.length}\n`);

    // Mostrar relaciones activas
    console.log('✅ RELACIONES ACTIVAS:');
    if (activeRelations.length === 0) {
        console.log('   ⚠️ NO HAY RELACIONES ACTIVAS - ESTO EXPLICA POR QUÉ NO VES PACIENTES');
    } else {
        activeRelations.forEach((rel, index) => {
            console.log(`${index + 1}. ${rel.nutritionist.first_name} ${rel.nutritionist.last_name} ↔ ${rel.patient.first_name} ${rel.patient.last_name}`);
            console.log(`   📅 Aceptada: ${rel.accepted_at?.toISOString().split('T')[0] || 'N/A'}\n`);
        });
    }

    // Mostrar relaciones no activas
    console.log('❌ RELACIONES NO ACTIVAS:');
    const nonActiveRelations = [...inactiveRelations, ...pendingRelations, ...rejectedRelations];
    if (nonActiveRelations.length === 0) {
        console.log('   ✅ No hay relaciones no activas');
    } else {
        nonActiveRelations.forEach((rel, index) => {
            console.log(`${index + 1}. [${rel.status.toUpperCase()}] ${rel.nutritionist.first_name} ${rel.nutritionist.last_name} → ${rel.patient.first_name} ${rel.patient.last_name}`);
            console.log(`   📅 Solicitada: ${rel.requested_at?.toISOString().split('T')[0]}`);
            if (rel.ended_at) console.log(`   📅 Terminada: ${rel.ended_at.toISOString().split('T')[0]}`);
            console.log('');
        });
    }

    // 3. ANÁLISIS DE PLANES DE DIETA
    console.log('🍽️ 3. ANÁLISIS DE PLANES DE DIETA:');
    console.log('==================================');

    const allPlans = await dietPlanRepository.find({
        relations: ['patient', 'nutritionist'],
        order: { created_at: 'DESC' }
    });

    console.log(`📊 Total planes de dieta: ${allPlans.length}\n`);

    if (allPlans.length > 0) {
        console.log('🍽️ PLANES DE DIETA EXISTENTES:');
        allPlans.forEach((plan, index) => {
            console.log(`${index + 1}. ${plan.name} (${plan.status})`);
            console.log(`   👨‍⚕️ Nutriólogo: ${plan.nutritionist.first_name} ${plan.nutritionist.last_name} (${plan.nutritionist.email})`);
            console.log(`   🤱 Paciente: ${plan.patient.first_name} ${plan.patient.last_name} (${plan.patient.email})`);
            console.log(`   📅 Creado: ${plan.created_at.toISOString().split('T')[0]}\n`);
        });
    }

    // 4. DIAGNÓSTICO CRÍTICO: PLANES HUÉRFANOS
    console.log('🚨 4. DIAGNÓSTICO DE PLANES HUÉRFANOS:');
    console.log('======================================');

    const planesHuerfanos: PlanHuerfano[] = [];

    for (const plan of allPlans) {
        // Buscar si existe una relación activa entre el nutriólogo y paciente del plan
        const relacionActiva = await relationRepository.findOne({
            where: {
                nutritionist: { id: plan.nutritionist.id },
                patient: { id: plan.patient.id },
                status: RelationshipStatus.ACTIVE
            }
        });

        if (!relacionActiva) {
            planesHuerfanos.push({
                plan,
                razon: 'Sin relación activa'
            });
        }
    }

    if (planesHuerfanos.length > 0) {
        console.log(`🚨 PROBLEMA DETECTADO: ${planesHuerfanos.length} planes huérfanos\n`);
        console.log('⚠️ PLANES SIN RELACIÓN ACTIVA:');

        planesHuerfanos.forEach((item, index) => {
            const { plan } = item;
            console.log(`${index + 1}. 🚨 ${plan.name}`);
            console.log(`   👨‍⚕️ Nutriólogo: ${plan.nutritionist.first_name} ${plan.nutritionist.last_name} (${plan.nutritionist.email})`);
            console.log(`   🤱 Paciente: ${plan.patient.first_name} ${plan.patient.last_name} (${plan.patient.email})`);
            console.log(`   📊 Estado del Plan: ${plan.status}`);
            console.log(`   ❌ Razón: ${item.razon}\n`);
        });

        console.log('💡 EXPLICACIÓN DETALLADA:');
        console.log('   ➤ Los planes de dieta están vinculados directamente a usuarios (patient_user_id, nutritionist_user_id)');
        console.log('   ➤ Los pacientes se obtienen consultando la tabla patient_nutritionist_relations con status="active"');
        console.log('   ➤ Si una relación se cambia a "inactive" o se elimina, los planes persisten pero no hay relación activa');
        console.log('   ➤ Dashboard muestra 0 pacientes (sin relaciones activas) pero las actividades muestran planes (existen directamente)');
        console.log('   ➤ ESTE ES EXACTAMENTE EL PROBLEMA QUE REPORTASTE\n');
    } else {
        console.log('✅ No se detectaron planes huérfanos - Integridad correcta\n');
    }

    // 5. GENERAR REPORTE Y SOLUCIONES
    console.log('📋 5. REPORTE FINAL Y SOLUCIONES:');
    console.log('=================================');

    const reporte: DiagnosticoReporte = {
        usuarios: {
            total: allUsers.length,
            nutritionists: nutritionists.length,
            patients: patients.length,
            activos: activeUsers.length,
            inactivos: inactiveUsers.length
        },
        relaciones: {
            total: allRelations.length,
            activas: activeRelations.length,
            inactivas: inactiveRelations.length,
            pendientes: pendingRelations.length,
            rechazadas: rejectedRelations.length
        },
        planes: {
            total: allPlans.length,
            huerfanos: planesHuerfanos.length,
            activos: allPlans.filter(p => p.status === 'active').length,
            borradores: allPlans.filter(p => p.status === 'draft').length
        },
        problema_detectado: planesHuerfanos.length > 0 || activeRelations.length === 0,
        solucion_recomendada: []
    };

    console.log('📊 ESTADÍSTICAS FINALES:');
    console.log(`   👥 Usuarios: ${reporte.usuarios.total} (${reporte.usuarios.activos} activos)`);
    console.log(`   🔗 Relaciones: ${reporte.relaciones.total} (${reporte.relaciones.activas} activas)`);
    console.log(`   🍽️ Planes: ${reporte.planes.total} (${reporte.planes.huerfanos} huérfanos)`);

    if (reporte.problema_detectado) {
        console.log('\n🔧 SOLUCIONES RECOMENDADAS:');
        
        if (activeRelations.length === 0 && nonActiveRelations.length > 0) {
            console.log('1. 🔄 REACTIVAR RELACIONES EXISTENTES:');
            nonActiveRelations.forEach(rel => {
                console.log(`   UPDATE patient_nutritionist_relations SET status='active', accepted_at=NOW()`);
                console.log(`   WHERE nutritionist_user_id='${rel.nutritionist.id}' AND patient_user_id='${rel.patient.id}';`);
            });
            reporte.solucion_recomendada.push('Reactivar relaciones existentes');
        }

        if (planesHuerfanos.length > 0) {
            console.log('\n2. 📝 CREAR NUEVAS RELACIONES PARA PLANES HUÉRFANOS:');
            const relacionesNecesarias = new Set<{
                nutritionist: any;
                patient: any;
                key: string;
            }>();
            planesHuerfanos.forEach(item => {
                const key = `${item.plan.nutritionist.id}-${item.plan.patient.id}`;
                relacionesNecesarias.add({
                    nutritionist: item.plan.nutritionist,
                    patient: item.plan.patient,
                    key
                });
            });

            Array.from(relacionesNecesarias).forEach((rel) => {
                console.log(`   INSERT INTO patient_nutritionist_relations`);
                console.log(`   (nutritionist_user_id, patient_user_id, status, requested_at, accepted_at)`);
                console.log(`   VALUES ('${rel.nutritionist.id}', '${rel.patient.id}', 'active', NOW(), NOW());`);
            });
            reporte.solucion_recomendada.push('Crear relaciones para planes huérfanos');
        }

        console.log('\n3. 🧹 ALTERNATIVA - LIMPIAR PLANES HUÉRFANOS:');
        console.log('   Si ya no necesitas estos planes, elimínalos:');
        planesHuerfanos.forEach(item => {
            console.log(`   DELETE FROM diet_plans WHERE id='${item.plan.id}'; -- ${item.plan.name}`);
        });
        reporte.solucion_recomendada.push('Opción de limpiar planes no necesarios');

    } else {
        console.log('\n✅ ESTADO DE INTEGRIDAD: EXCELENTE');
        console.log('   No se requieren acciones correctivas');
    }

    console.log('\n🎯 CONCLUSIÓN:');
    if (reporte.problema_detectado) {
        console.log('❌ Se confirmó el problema de integridad reportado');
        console.log('💡 Soluciones específicas fueron generadas arriba');
    } else {
        console.log('✅ No se detectaron problemas de integridad');
    }

    return reporte;
}

async function main() {
    try {
        const reporte = await diagnosticarIntegridad();
        console.log('\n🎯 Diagnóstico completado exitosamente');
        
        if (reporte.problema_detectado) {
            process.exit(1); // Exit con código de error para indicar problema
        } else {
            process.exit(0); // Exit exitoso
        }
    } catch (error) {
        console.error('\n❌ Error durante diagnóstico:', error);
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

export { diagnosticarIntegridad, DiagnosticoReporte }; 