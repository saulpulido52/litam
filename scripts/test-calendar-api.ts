import { AppDataSource } from '../src/database/data-source';
import { User } from '../src/database/entities/user.entity';
import { Appointment } from '../src/database/entities/appointment.entity';
import { RoleName } from '../src/database/entities/role.entity';

async function testCalendarAPI() {
    try {
        console.log('🔍 Conectando a la base de datos para verificar citas...');
        await AppDataSource.initialize();
        console.log('✅ Conectado a la base de datos');

        const userRepository = AppDataSource.getRepository(User);
        const appointmentRepository = AppDataSource.getRepository(Appointment);

        // Buscar el nutriólogo que usamos en las pruebas
        const nutritionist = await userRepository.findOne({
            where: { email: 'nutriologo@test.com' },
            relations: ['role']
        });

        if (!nutritionist) {
            console.log('❌ No se encontró el nutriólogo de prueba');
            return;
        }

        console.log(`🩺 Verificando citas para: ${nutritionist.first_name} ${nutritionist.last_name} (${nutritionist.email})`);

        // Obtener todas las citas del nutriólogo
        const appointments = await appointmentRepository.find({
            where: { nutritionist: { id: nutritionist.id } },
            relations: ['patient', 'nutritionist'],
            order: { start_time: 'ASC' }
        });

        console.log(`📊 Total de citas encontradas: ${appointments.length}`);

        if (appointments.length === 0) {
            console.log('❌ No se encontraron citas para este nutriólogo');
            return;
        }

        // Analizar citas por fecha
        const today = new Date();
        const todayString = today.toISOString().split('T')[0];
        
        const appointmentsByDate: { [key: string]: Appointment[] } = {};
        const todayAppointments: Appointment[] = [];

        appointments.forEach(apt => {
            const date = apt.start_time.toISOString().split('T')[0];
            if (!appointmentsByDate[date]) {
                appointmentsByDate[date] = [];
            }
            appointmentsByDate[date].push(apt);
            
            if (date === todayString) {
                todayAppointments.push(apt);
            }
        });

        console.log('\n📅 CITAS POR FECHA:');
        console.log('════════════════════════════════════════════════════════════════');
        Object.entries(appointmentsByDate).forEach(([date, dayAppointments]) => {
            const isToday = date === todayString;
            console.log(`📆 ${new Date(date).toLocaleDateString('es-ES', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
            })}${isToday ? ' (HOY)' : ''}: ${dayAppointments.length} cita${dayAppointments.length !== 1 ? 's' : ''}`);
            
            dayAppointments.forEach(apt => {
                console.log(`  • ${apt.start_time.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })} - ${apt.patient.first_name} ${apt.patient.last_name} (${apt.status})`);
            });
        });

        console.log('\n🔥 CITAS DE HOY ESPECÍFICAMENTE:');
        console.log('════════════════════════════════════════════════════════════════');
        if (todayAppointments.length === 0) {
            console.log('❌ No hay citas para hoy');
        } else {
            todayAppointments.forEach(apt => {
                console.log(`⏰ ${apt.start_time.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })} - ${apt.patient.first_name} ${apt.patient.last_name}`);
                console.log(`   📋 Estado: ${apt.status}`);
                console.log(`   💬 Notas: ${apt.notes || 'Sin notas'}`);
                console.log(`   🔗 Link: ${apt.meeting_link || 'Presencial'}`);
                console.log('   ─────────────────────────────────────────────────────');
            });
        }

        // Simular la transformación que hace el frontend
        console.log('\n🔄 SIMULANDO TRANSFORMACIÓN DEL FRONTEND:');
        console.log('════════════════════════════════════════════════════════════════');
        const frontendEvents = appointments.map(apt => {
            const startDate = new Date(apt.start_time);
            const endDate = new Date(apt.end_time);
            
            return {
                id: apt.id,
                title: apt.notes || 'Consulta',
                patient_name: apt.patient ? `${apt.patient.first_name} ${apt.patient.last_name}` : 'Paciente desconocido',
                patient_email: apt.patient?.email || '',
                date: startDate.toISOString().split('T')[0],
                start_time: startDate.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }),
                end_time: endDate.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }),
                type: 'consultation' as const,
                location: apt.meeting_link ? 'virtual' : 'presencial',
                status: apt.status,
                notes: apt.notes,
                original: apt
            };
        });

        console.log(`✅ Se transformaron ${frontendEvents.length} citas para el frontend`);
        
        // Mostrar eventos de hoy transformados
        const todayEvents = frontendEvents.filter(event => event.date === todayString);
        console.log(`📋 Eventos de hoy transformados: ${todayEvents.length}`);
        
        todayEvents.forEach(event => {
            console.log(`  • ${event.start_time} - ${event.patient_name} (${event.status})`);
        });

        // Verificar estructura de datos esperada por el calendario
        console.log('\n🧪 VERIFICACIÓN DE ESTRUCTURA PARA CALENDARIO:');
        console.log('════════════════════════════════════════════════════════════════');
        
        const sampleEvent = frontendEvents[0];
        if (sampleEvent) {
            console.log('📋 Estructura de evento de ejemplo:');
            console.log(JSON.stringify(sampleEvent, null, 2));
        }

        console.log('\n✅ RESUMEN DE LA VERIFICACIÓN:');
        console.log('════════════════════════════════════════════════════════════════');
        console.log(`📊 Total de citas en BD: ${appointments.length}`);
        console.log(`🔥 Citas para hoy: ${todayAppointments.length}`);
        console.log(`📅 Días con citas: ${Object.keys(appointmentsByDate).length}`);
        console.log(`🔄 Eventos transformados: ${frontendEvents.length}`);
        console.log(`🗓️ Eventos de hoy para el calendario: ${todayEvents.length}`);

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        if (AppDataSource.isInitialized) {
            await AppDataSource.destroy();
            console.log('\n📴 Desconectado de la base de datos');
        }
    }
}

if (require.main === module) {
    testCalendarAPI();
}

export { testCalendarAPI }; 