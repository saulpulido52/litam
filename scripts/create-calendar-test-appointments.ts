import { AppDataSource } from '../src/database/data-source';
import { User } from '../src/database/entities/user.entity';
import { Appointment, AppointmentStatus } from '../src/database/entities/appointment.entity';
import { RoleName } from '../src/database/entities/role.entity';

async function createCalendarTestAppointments() {
    try {
        console.log('🔍 Conectando a la base de datos...');
        await AppDataSource.initialize();
        console.log('✅ Conectado a la base de datos');

        const userRepository = AppDataSource.getRepository(User);
        const appointmentRepository = AppDataSource.getRepository(Appointment);

        // Buscar el primer nutriólogo disponible
        const nutritionist = await userRepository.findOne({
            where: { role: { name: RoleName.NUTRITIONIST } },
            relations: ['role']
        });

        if (!nutritionist) {
            console.log('❌ No se encontró ningún nutriólogo');
            return;
        }

        // Buscar pacientes disponibles
        const patients = await userRepository.find({
            where: { role: { name: RoleName.PATIENT } },
            relations: ['role'],
            take: 10 // Tomar máximo 10 pacientes para las pruebas
        });

        if (patients.length === 0) {
            console.log('❌ No se encontraron pacientes');
            return;
        }

        console.log(`🩺 Usando nutriólogo: ${nutritionist.first_name} ${nutritionist.last_name} (${nutritionist.email})`);
        console.log(`👥 Encontrados ${patients.length} pacientes para crear citas`);

        // Limpiar citas existentes de este nutriólogo para evitar duplicados
        await appointmentRepository.delete({
            nutritionist: { id: nutritionist.id }
        });
        console.log('🧹 Citas anteriores eliminadas');

        const testAppointments: Appointment[] = [];
        const today = new Date();
        
        // Crear citas para los próximos 14 días, incluyendo algunas para hoy
        const appointmentDates: Date[] = [];
        for (let i = 0; i < 14; i++) {
            const date = new Date(today);
            date.setDate(today.getDate() + i);
            appointmentDates.push(date);
        }

        console.log('\n📅 Creando citas de prueba...');

        for (let dateIndex = 0; dateIndex < appointmentDates.length; dateIndex++) {
            const appointmentDate = appointmentDates[dateIndex];
            
            // Saltar fines de semana para un calendario más realista
            if (appointmentDate.getDay() === 0 || appointmentDate.getDay() === 6) {
                continue;
            }

            // Crear entre 1-4 citas por día laborable
            const numAppointments = Math.floor(Math.random() * 4) + 1;
            const timeSlots = [
                { hour: 9, minute: 0 },   // 9:00 AM
                { hour: 10, minute: 30 }, // 10:30 AM
                { hour: 14, minute: 0 },  // 2:00 PM
                { hour: 15, minute: 30 }, // 3:30 PM
                { hour: 16, minute: 30 }, // 4:30 PM
            ];

            // Mezclar los horarios aleatoriamente
            const shuffledSlots = timeSlots.sort(() => Math.random() - 0.5);

            for (let j = 0; j < Math.min(numAppointments, shuffledSlots.length, patients.length); j++) {
                const timeSlot = shuffledSlots[j];
                const patient = patients[j % patients.length];
                
                const startTime = new Date(appointmentDate);
                startTime.setHours(timeSlot.hour, timeSlot.minute, 0, 0);
                
                // Solo crear citas futuras (excepto algunas de hoy para testing)
                if (startTime > new Date() || appointmentDate.toDateString() === today.toDateString()) {
                    const endTime = new Date(startTime);
                    endTime.setMinutes(endTime.getMinutes() + 30); // Citas de 30 minutos
                    
                    // Variar los estados para testing
                    const statuses: AppointmentStatus[] = [AppointmentStatus.SCHEDULED, AppointmentStatus.COMPLETED, AppointmentStatus.CANCELLED_BY_PATIENT];
                    const status = startTime < new Date() ? AppointmentStatus.COMPLETED : statuses[Math.floor(Math.random() * statuses.length)];
                    
                    // Generar notas variadas
                    const notes = [
                        'Consulta de seguimiento nutricional',
                        'Primera consulta - evaluación inicial',
                        'Control de peso y medidas',
                        'Revisión de plan alimentario',
                        'Consulta de seguimiento',
                        'Evaluación de progreso',
                        null // Algunas sin notas
                    ];
                    
                    const appointment = appointmentRepository.create({
                        nutritionist: nutritionist,
                        patient: patient,
                        start_time: startTime,
                        end_time: endTime,
                        status: status,
                        notes: notes[Math.floor(Math.random() * notes.length)],
                        meeting_link: Math.random() > 0.5 ? 'https://meet.google.com/test-link' : null,
                        created_at: new Date(),
                        updated_at: new Date()
                    });
                    
                    testAppointments.push(appointment);
                }
            }
        }

        // Crear algunas citas específicas para HOY para testing inmediato
        const todaySlots = [
            { hour: 11, minute: 0 },  // 11:00 AM
            { hour: 17, minute: 0 },  // 5:00 PM
        ];

        for (let i = 0; i < todaySlots.length && i < patients.length; i++) {
            const slot = todaySlots[i];
            const patient = patients[i];
            
            const startTime = new Date(today);
            startTime.setHours(slot.hour, slot.minute, 0, 0);
            
            const endTime = new Date(startTime);
            endTime.setMinutes(endTime.getMinutes() + 30);
            
            const appointment = appointmentRepository.create({
                nutritionist: nutritionist,
                patient: patient,
                start_time: startTime,
                end_time: endTime,
                status: AppointmentStatus.SCHEDULED,
                notes: `Cita de prueba para HOY - ${patient.first_name}`,
                meeting_link: 'https://meet.google.com/today-test',
                created_at: new Date(),
                updated_at: new Date()
            });
            
            testAppointments.push(appointment);
        }

        // Guardar todas las citas
        if (testAppointments.length > 0) {
            await appointmentRepository.save(testAppointments);
            console.log(`✅ Se crearon ${testAppointments.length} citas de prueba`);
            
            // Mostrar resumen por fecha
            const appointmentsByDate: { [key: string]: number } = {};
            testAppointments.forEach(apt => {
                const dateKey = apt.start_time.toISOString().split('T')[0];
                appointmentsByDate[dateKey] = (appointmentsByDate[dateKey] || 0) + 1;
            });
            
            console.log('\n📊 RESUMEN DE CITAS CREADAS:');
            console.log('════════════════════════════════════════════════════════════════');
            Object.entries(appointmentsByDate).forEach(([date, count]) => {
                const dateObj = new Date(date);
                const isToday = date === today.toISOString().split('T')[0];
                console.log(`📅 ${dateObj.toLocaleDateString('es-ES', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                })}${isToday ? ' (HOY)' : ''}: ${count} cita${count !== 1 ? 's' : ''}`);
            });
            
            // Mostrar algunas citas de ejemplo
            console.log('\n🔍 EJEMPLOS DE CITAS CREADAS:');
            console.log('════════════════════════════════════════════════════════════════');
            testAppointments.slice(0, 5).forEach((apt, index) => {
                console.log(`${index + 1}. ${apt.patient.first_name} ${apt.patient.last_name}`);
                console.log(`   📅 ${apt.start_time.toLocaleDateString('es-ES')} ${apt.start_time.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}`);
                console.log(`   📋 Estado: ${apt.status}`);
                console.log(`   💬 Notas: ${apt.notes || 'Sin notas'}`);
                console.log('   ─────────────────────────────────────────────────────');
            });
            
        } else {
            console.log('⚠️ No se crearon citas (posiblemente todas eran en el pasado)');
        }

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
    createCalendarTestAppointments();
}

export { createCalendarTestAppointments }; 