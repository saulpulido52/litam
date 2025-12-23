import { AppDataSource } from '../src/database/data-source';
import { Appointment } from '../src/database/entities/appointment.entity';
import { User } from '../src/database/entities/user.entity';

async function checkAppointments() {
    try {
        await AppDataSource.initialize();
        console.log('✅ Conectado a la base de datos');

        const appointmentRepository = AppDataSource.getRepository(Appointment);
        const userRepository = AppDataSource.getRepository(User);

        // Obtener todas las citas
        const appointments = await appointmentRepository.find({
            relations: ['patient', 'nutritionist'],
            order: { start_time: 'ASC' }
        });

        console.log(`\n📊 Total de citas en la base de datos: ${appointments.length}`);

        if (appointments.length === 0) {
            console.log('❌ No hay citas en la base de datos');
            
            // Verificar usuarios
            const users = await userRepository.find({ relations: ['role'] });
            console.log(`\n👥 Usuarios en el sistema: ${users.length}`);
            users.forEach(user => {
                console.log(`- ${user.email} (${user.role?.name}) - ${user.first_name} ${user.last_name}`);
            });
            
            return;
        }

        // Mostrar todas las citas
        console.log('\n📅 Lista de citas:');
        appointments.forEach((apt, index) => {
            const startDate = new Date(apt.start_time);
            const isToday = startDate.toDateString() === new Date().toDateString();
            const isFuture = startDate > new Date();
            
            const statusIcon = isToday ? '🔥' : isFuture ? '📅' : '✅';
            
            console.log(`${statusIcon} ${index + 1}. ${apt.patient?.first_name} ${apt.patient?.last_name} → ${apt.nutritionist?.first_name} ${apt.nutritionist?.last_name}`);
            console.log(`   📅 ${startDate.toLocaleDateString('es-ES')} ${startDate.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}`);
            console.log(`   📝 ${apt.notes || 'Sin notas'}`);
            console.log(`   📊 Estado: ${apt.status}`);
            console.log('');
        });

        // Estadísticas por nutriólogo
        const appointmentsByNutritionist: { [key: string]: any[] } = {};
        appointments.forEach(apt => {
            const nutritionistId = apt.nutritionist?.id || 'unknown';
            if (!appointmentsByNutritionist[nutritionistId]) {
                appointmentsByNutritionist[nutritionistId] = [];
            }
            appointmentsByNutritionist[nutritionistId].push(apt);
        });

        console.log('\n👨‍⚕️ Citas por nutriólogo:');
        Object.entries(appointmentsByNutritionist).forEach(([nutritionistId, nurAppointments]) => {
            const nutritionist = nurAppointments[0]?.nutritionist;
            console.log(`- ${nutritionist?.first_name} ${nutritionist?.last_name} (${nutritionist?.email}): ${nurAppointments.length} citas`);
        });

        // Citas de hoy
        const today = new Date().toDateString();
        const todayAppointments = appointments.filter(apt => 
            new Date(apt.start_time).toDateString() === today
        );

        console.log(`\n🔥 Citas de hoy: ${todayAppointments.length}`);
        todayAppointments.forEach(apt => {
            console.log(`- ${new Date(apt.start_time).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })} ${apt.patient?.first_name} ${apt.patient?.last_name}`);
        });

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await AppDataSource.destroy();
    }
}

checkAppointments(); 