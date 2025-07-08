import { AppDataSource } from '../src/database/data-source';
import { User } from '../src/database/entities/user.entity';
import { Appointment, AppointmentStatus } from '../src/database/entities/appointment.entity';
import { PatientNutritionistRelation, RelationshipStatus } from '../src/database/entities/patient_nutritionist_relation.entity';
import { RoleName } from '../src/database/entities/role.entity';

async function createTestAppointments() {
  console.log('🔧 Creando citas de prueba...');
  
  try {
    // Conectar a la base de datos
    await AppDataSource.initialize();
    console.log('✅ Base de datos conectada');
    
    // Obtener repositorios
    const userRepository = AppDataSource.getRepository(User);
    const appointmentRepository = AppDataSource.getRepository(Appointment);
    const relationRepository = AppDataSource.getRepository(PatientNutritionistRelation);
    
    // Buscar un nutriólogo
    const nutritionist = await userRepository.findOne({
      where: { 
        email: 'nutri.admin@sistema.com',
        role: { name: RoleName.NUTRITIONIST }
      },
      relations: ['role']
    });
    
    if (!nutritionist) {
      console.log('❌ No se encontró el nutriólogo admin');
      return;
    }
    
    console.log('✅ Nutriólogo encontrado:', nutritionist.email);
    
    // Buscar pacientes
    const patients = await userRepository.find({
      where: { 
        role: { name: RoleName.PATIENT }
      },
      relations: ['role'],
      take: 3
    });
    
    if (patients.length === 0) {
      console.log('❌ No se encontraron pacientes');
      return;
    }
    
    console.log(`✅ Encontrados ${patients.length} pacientes`);
    
    // Crear relaciones si no existen
    for (const patient of patients) {
      const existingRelation = await relationRepository.findOne({
        where: {
          patient: { id: patient.id },
          nutritionist: { id: nutritionist.id }
        }
      });
      
      if (!existingRelation) {
        const relation = relationRepository.create({
          patient: patient,
          nutritionist: nutritionist,
          status: RelationshipStatus.ACTIVE,
          accepted_at: new Date()
        });
        
        await relationRepository.save(relation);
        console.log(`✅ Relación creada para ${patient.first_name} ${patient.last_name}`);
      }
    }
    
    // Crear citas de prueba
    const testAppointments = [
      {
        patient: patients[0],
        nutritionist: nutritionist,
        start_time: new Date(Date.now() + 24 * 60 * 60 * 1000), // Mañana
        end_time: new Date(Date.now() + 24 * 60 * 60 * 1000 + 60 * 60 * 1000), // Mañana + 1 hora
        status: AppointmentStatus.SCHEDULED,
        notes: 'Consulta inicial de prueba'
      },
      {
        patient: patients[1],
        nutritionist: nutritionist,
        start_time: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // En 2 días
        end_time: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000 + 60 * 60 * 1000), // En 2 días + 1 hora
        status: AppointmentStatus.SCHEDULED,
        notes: 'Seguimiento nutricional'
      },
      {
        patient: patients[0],
        nutritionist: nutritionist,
        start_time: new Date(Date.now() - 24 * 60 * 60 * 1000), // Ayer (completada)
        end_time: new Date(Date.now() - 24 * 60 * 60 * 1000 + 60 * 60 * 1000), // Ayer + 1 hora
        status: AppointmentStatus.COMPLETED,
        notes: 'Consulta completada'
      }
    ];
    
    // Guardar citas
    for (const appointmentData of testAppointments) {
      const appointment = appointmentRepository.create(appointmentData);
      await appointmentRepository.save(appointment);
      console.log(`✅ Cita creada: ${appointmentData.patient.first_name} ${appointmentData.patient.last_name} - ${appointmentData.start_time.toLocaleDateString()}`);
    }
    
    console.log('✅ Citas de prueba creadas exitosamente');
    
  } catch (error) {
    console.error('❌ Error creando citas de prueba:', error);
  } finally {
    await AppDataSource.destroy();
  }
}

// Ejecutar el script
createTestAppointments(); 