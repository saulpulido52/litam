import { AppDataSource } from '../src/database/data-source';
import { User } from '../src/database/entities/user.entity';
import { Appointment, AppointmentStatus } from '../src/database/entities/appointment.entity';
import { RoleName } from '../src/database/entities/role.entity';

async function createTodayAppointments() {
    try {
        await AppDataSource.initialize();
        console.log('📚 Conectado a la base de datos');

        const userRepository = AppDataSource.getRepository(User);
        const appointmentRepository = AppDataSource.getRepository(Appointment);

        // Buscar nutriólogos existentes
        const nutritionists = await userRepository.find({
            where: { 
                role: { name: RoleName.NUTRITIONIST }
            },
            relations: ['role']
        });

        // También buscar admins que funcionan como nutriólogos
        const admins = await userRepository.find({
            where: { 
                role: { name: RoleName.ADMIN }
            },
            relations: ['role']
        });

        console.log(`✅ Nutriólogos encontrados: ${nutritionists.length}`);
        console.log(`✅ Admins encontrados: ${admins.length}`);

        // Usar el primer nutriólogo disponible o admin
        const availableNutritionists = [...nutritionists, ...admins];
        if (availableNutritionists.length === 0) {
            console.error('❌ No se encontraron nutriólogos en el sistema');
            return;
        }

        const selectedNutritionist = availableNutritionists[0]; // Usar el primero disponible
        console.log(`✅ Usando nutriólogo: ${selectedNutritionist.first_name} ${selectedNutritionist.last_name} (${selectedNutritionist.email})`);

        // Buscar pacientes
        const patients = await userRepository.find({
            where: { 
                role: { name: RoleName.PATIENT }
            },
            relations: ['role'],
            take: 3
        });

        if (patients.length === 0) {
            console.error('❌ No se encontraron pacientes en el sistema');
            return;
        }

        console.log(`✅ Pacientes encontrados: ${patients.length}`);

        // Limpiar citas existentes del nutriólogo seleccionado para hoy y mañana
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(today.getDate() + 1);

        await appointmentRepository
            .createQueryBuilder()
            .delete()
            .from(Appointment)
            .where('nutritionist_user_id = :nutritionistId', { nutritionistId: selectedNutritionist.id })
            .andWhere('DATE(start_time) IN (:...dates)', { 
                dates: [
                    today.toISOString().split('T')[0],
                    tomorrow.toISOString().split('T')[0]
                ]
            })
            .execute();

        console.log('🧹 Citas existentes de hoy y mañana eliminadas');

        // Crear citas para HOY
        const todayAppointments: Appointment[] = [];
        
        // Horarios para hoy
        const todaySlots = [
            { hour: 9, minute: 0 },   // 09:00
            { hour: 11, minute: 30 }, // 11:30  
            { hour: 14, minute: 0 },  // 14:00
            { hour: 16, minute: 30 }, // 16:30
        ];

        for (let i = 0; i < todaySlots.length && i < patients.length; i++) {
            const slot = todaySlots[i];
            const patient = patients[i];
            
            const startTime = new Date(today);
            startTime.setHours(slot.hour, slot.minute, 0, 0);
            
            // Solo crear si es en el futuro
            if (startTime > new Date()) {
                const endTime = new Date(startTime.getTime() + 30 * 60000);

                const appointment = appointmentRepository.create({
                    patient: patient,
                    nutritionist: selectedNutritionist,
                    start_time: startTime,
                    end_time: endTime,
                    status: AppointmentStatus.SCHEDULED,
                    notes: `Cita hoy ${startTime.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })} - ${patient.first_name}`,
                    meeting_link: i % 2 === 0 ? 'https://meet.google.com/today-meeting' : null
                });

                todayAppointments.push(appointment);
            }
        }

        // Crear citas para MAÑANA
        const tomorrowAppointments: Appointment[] = [];
        
        const tomorrowSlots = [
            { hour: 8, minute: 0 },   // 08:00
            { hour: 10, minute: 0 },  // 10:00
            { hour: 12, minute: 30 }, // 12:30
            { hour: 15, minute: 0 },  // 15:00
            { hour: 17, minute: 30 }, // 17:30
        ];

        for (let i = 0; i < tomorrowSlots.length && i < patients.length; i++) {
            const slot = tomorrowSlots[i];
            const patient = patients[i % patients.length]; // Rotar pacientes si hay menos
            
            const startTime = new Date(tomorrow);
            startTime.setHours(slot.hour, slot.minute, 0, 0);
            
            const endTime = new Date(startTime.getTime() + 30 * 60000);

            const appointment = appointmentRepository.create({
                patient: patient,
                nutritionist: selectedNutritionist,
                start_time: startTime,
                end_time: endTime,
                status: AppointmentStatus.SCHEDULED,
                notes: `Cita mañana ${startTime.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })} - ${patient.first_name}`,
                meeting_link: i % 2 === 1 ? 'https://meet.google.com/tomorrow-meeting' : null
            });

            tomorrowAppointments.push(appointment);
        }

        // Guardar todas las citas
        const allAppointments = [...todayAppointments, ...tomorrowAppointments];
        await appointmentRepository.save(allAppointments);
        
        console.log(`\n✅ ${allAppointments.length} citas creadas exitosamente`);
        console.log(`📅 Citas para hoy: ${todayAppointments.length}`);
        console.log(`📅 Citas para mañana: ${tomorrowAppointments.length}`);
        
        // Mostrar resumen
        console.log('\n📋 Citas creadas:');
        allAppointments
            .sort((a, b) => a.start_time.getTime() - b.start_time.getTime())
            .forEach((apt, index) => {
                const date = new Date(apt.start_time);
                const isToday = date.toDateString() === today.toDateString();
                const dayLabel = isToday ? '🔥 HOY' : '📅 MAÑANA';
                console.log(`${index + 1}. ${dayLabel} ${date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })} - ${apt.patient?.first_name} ${apt.patient?.last_name}`);
            });

        console.log(`\n🎯 Nutriólogo: ${selectedNutritionist.first_name} ${selectedNutritionist.last_name}`);
        console.log(`📧 Email: ${selectedNutritionist.email}`);
        console.log(`🆔 ID: ${selectedNutritionist.id}`);
        console.log('\n📌 Inicia sesión con este nutriólogo para ver las citas en el calendario');

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await AppDataSource.destroy();
    }
}

createTodayAppointments(); 