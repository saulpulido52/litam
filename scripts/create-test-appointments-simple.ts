import { AppDataSource } from '../src/database/data-source';
import { User } from '../src/database/entities/user.entity';
import { Appointment, AppointmentStatus } from '../src/database/entities/appointment.entity';
import { RoleName } from '../src/database/entities/role.entity';

async function createTestAppointments() {
    try {
        await AppDataSource.initialize();
        console.log('📚 Conectado a la base de datos');

        const userRepository = AppDataSource.getRepository(User);
        const appointmentRepository = AppDataSource.getRepository(Appointment);

        // Encontrar el nutriólogo por defecto
        const nutritionist = await userRepository.findOne({
            where: { 
                email: 'nutri.admin@sistema.com',
                role: { name: RoleName.NUTRITIONIST }
            },
            relations: ['role']
        });

        if (!nutritionist) {
            console.error('❌ No se encontró el nutriólogo por defecto');
            return;
        }

        console.log(`✅ Nutriólogo encontrado: ${nutritionist.first_name} ${nutritionist.last_name} (${nutritionist.id})`);

        // Buscar cualquier paciente existente
        const patient = await userRepository.findOne({
            where: { 
                role: { name: RoleName.PATIENT }
            },
            relations: ['role']
        });

        if (!patient) {
            console.error('❌ No se encontró ningún paciente en el sistema');
            console.log('Tip: Primero crea un paciente desde la interfaz web');
            return;
        }

        console.log(`✅ Paciente encontrado: ${patient.first_name} ${patient.last_name} (${patient.id})`);

        // Eliminar citas existentes del nutriólogo para empezar limpio
        await appointmentRepository.delete({
            nutritionist: { id: nutritionist.id }
        });
        console.log('🧹 Citas existentes eliminadas');

        // Crear citas de prueba para los próximos días
        const testAppointments: Appointment[] = [];
        const today = new Date();
        
        // Crear citas para hoy, mañana y próximos días
        for (let i = 0; i < 10; i++) {
            const appointmentDate = new Date(today);
            appointmentDate.setDate(today.getDate() + i);
            
            // Solo días laborables
            if (appointmentDate.getDay() === 0 || appointmentDate.getDay() === 6) {
                continue;
            }

            // Crear diferentes horarios
            const timeSlots = [
                { hour: 9, minute: 0 },   // 09:00
                { hour: 10, minute: 30 }, // 10:30
                { hour: 14, minute: 0 },  // 14:00
                { hour: 15, minute: 30 }, // 15:30
                { hour: 16, minute: 0 },  // 16:00
            ];

            // Crear 1-3 citas por día aleatoriamente
            const numAppointments = Math.floor(Math.random() * 3) + 1;
            
            for (let j = 0; j < numAppointments && j < timeSlots.length; j++) {
                const timeSlot = timeSlots[j];
                
                const startTime = new Date(appointmentDate);
                startTime.setHours(timeSlot.hour, timeSlot.minute, 0, 0);
                
                const endTime = new Date(startTime);
                endTime.setMinutes(endTime.getMinutes() + 30);

                const appointment = appointmentRepository.create({
                    patient: patient,
                    nutritionist: nutritionist,
                    start_time: startTime,
                    end_time: endTime,
                    status: AppointmentStatus.SCHEDULED,
                    notes: `Cita de prueba ${j + 1} - ${appointmentDate.toLocaleDateString('es-ES', { weekday: 'long' })}`,
                    meeting_link: Math.random() > 0.5 ? 'https://meet.google.com/test-appointment' : null
                });

                testAppointments.push(appointment);
            }
        }

        // Agregar algunas citas para hoy específicamente
        const todaySlots = [
            { hour: 11, minute: 0 },   // 11:00
            { hour: 12, minute: 30 },  // 12:30
        ];

        for (const slot of todaySlots) {
            const startTime = new Date(today);
            startTime.setHours(slot.hour, slot.minute, 0, 0);
            
            // Solo si es futuro
            if (startTime > new Date()) {
                const endTime = new Date(startTime);
                endTime.setMinutes(endTime.getMinutes() + 30);

                const appointment = appointmentRepository.create({
                    patient: patient,
                    nutritionist: nutritionist,
                    start_time: startTime,
                    end_time: endTime,
                    status: AppointmentStatus.SCHEDULED,
                    notes: `Cita hoy a las ${startTime.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}`,
                    meeting_link: 'https://meet.google.com/today-appointment'
                });

                testAppointments.push(appointment);
            }
        }

        // Guardar todas las citas
        await appointmentRepository.save(testAppointments);
        
        console.log(`✅ ${testAppointments.length} citas de prueba creadas`);
        
        // Mostrar resumen
        console.log('\n📅 Citas creadas:');
        testAppointments
            .sort((a, b) => a.start_time.getTime() - b.start_time.getTime())
            .forEach((apt, index) => {
                const isToday = apt.start_time.toDateString() === today.toDateString();
                const dayLabel = isToday ? '🔥 HOY' : apt.start_time.toLocaleDateString('es-ES');
                console.log(`${index + 1}. ${dayLabel} ${apt.start_time.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })} - ${apt.notes}`);
            });

        console.log('\n✅ Script completado exitosamente');
        console.log('\n📌 Ahora deberías ver las citas en el calendario web');

    } catch (error) {
        console.error('❌ Error creando citas de prueba:', error);
    } finally {
        await AppDataSource.destroy();
    }
}

// Ejecutar si es llamado directamente
if (require.main === module) {
    createTestAppointments();
}

export { createTestAppointments }; 