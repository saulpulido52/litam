import { AppDataSource } from '../src/database/data-source';
import { User } from '../src/database/entities/user.entity';
import { Appointment, AppointmentStatus } from '../src/database/entities/appointment.entity';
import { Role, RoleName } from '../src/database/entities/role.entity';

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

        // Buscar o crear un paciente de prueba
        let patient = await userRepository.findOne({
            where: { 
                email: 'paciente.prueba@test.com',
                role: { name: RoleName.PATIENT }
            },
            relations: ['role']
        });

        if (!patient) {
            // Crear paciente de prueba
            const patientRole = await AppDataSource.getRepository(Role).findOne({
                where: { name: RoleName.PATIENT }
            });

            patient = userRepository.create({
                email: 'paciente.prueba@test.com',
                first_name: 'Paciente',
                last_name: 'Prueba',
                phone: '+52 55 1234 5678',
                age: 30,
                gender: 'male',
                role: patientRole,
                is_active: true,
                registration_type: 'manual'
            });

            await userRepository.save(patient);
            console.log(`✅ Paciente creado: ${patient.first_name} ${patient.last_name} (${patient.id})`);
        } else {
            console.log(`✅ Paciente encontrado: ${patient.first_name} ${patient.last_name} (${patient.id})`);
        }

        // Eliminar citas existentes del nutriólogo para empezar limpio
        await appointmentRepository.delete({
            nutritionist: { id: nutritionist.id }
        });
        console.log('🧹 Citas existentes eliminadas');

        // Crear citas de prueba para los próximos días
        const testAppointments = [];
        const today = new Date();
        
        for (let i = 0; i < 7; i++) {
            const appointmentDate = new Date(today);
            appointmentDate.setDate(today.getDate() + i);
            
            // Saltear fines de semana para hacer más realista
            if (appointmentDate.getDay() === 0 || appointmentDate.getDay() === 6) {
                continue;
            }

            // Crear 2-3 citas por día
            const appointmentsPerDay = Math.floor(Math.random() * 3) + 1;
            
            for (let j = 0; j < appointmentsPerDay; j++) {
                const startHour = 9 + (j * 2); // 9:00, 11:00, 13:00, etc.
                const startMinutes = Math.random() > 0.5 ? 0 : 30; // :00 o :30
                
                const startTime = new Date(appointmentDate);
                startTime.setHours(startHour, startMinutes, 0, 0);
                
                const endTime = new Date(startTime);
                endTime.setMinutes(endTime.getMinutes() + 30); // 30 minutos de duración

                // Solo crear citas futuras
                if (startTime > new Date()) {
                    const appointment = appointmentRepository.create({
                        patient: patient,
                        nutritionist: nutritionist,
                        start_time: startTime,
                        end_time: endTime,
                        status: AppointmentStatus.SCHEDULED,
                        notes: `Cita de prueba ${j + 1} - ${appointmentDate.toLocaleDateString('es-ES')}`,
                        meeting_link: Math.random() > 0.5 ? 'https://meet.google.com/test-link' : null
                    });

                    testAppointments.push(appointment);
                }
            }
        }

        // Guardar todas las citas
        await appointmentRepository.save(testAppointments);
        
        console.log(`✅ ${testAppointments.length} citas de prueba creadas`);
        
        // Mostrar resumen
        console.log('\n📅 Citas creadas:');
        testAppointments.forEach((apt, index) => {
            console.log(`${index + 1}. ${apt.start_time.toLocaleDateString('es-ES')} ${apt.start_time.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })} - ${apt.notes}`);
        });

        console.log('\n✅ Script completado exitosamente');

    } catch (error) {
        console.error('❌ Error creando citas de prueba:', error);
    } finally {
        await AppDataSource.destroy();
    }
}

createTestAppointments(); 