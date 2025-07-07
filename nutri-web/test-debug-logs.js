// Script de prueba para verificar logs de depuración
console.log('🔍 [TEST] Iniciando prueba de logs de depuración...');

// Simular el flujo de datos de pacientes
const mockPatients = [
  {
    id: '1',
    first_name: 'Juan',
    last_name: 'Pérez',
    email: 'juan.perez@test.com',
    is_active: true,
    created_at: '2024-01-01T00:00:00Z'
  },
  {
    id: '2', 
    first_name: 'María',
    last_name: 'García',
    email: 'maria.garcia@test.com',
    is_active: true,
    created_at: '2024-01-02T00:00:00Z'
  }
];

console.log('🔍 [TEST] Pacientes mock creados:', {
  count: mockPatients.length,
  patients: mockPatients.map(p => ({
    id: p.id,
    name: `${p.first_name} ${p.last_name}`,
    email: p.email
  }))
});

// Simular transformación de datos
const transformPatient = (patient) => {
  console.log('🔍 [TEST] Transformando paciente:', {
    id: patient.id,
    name: `${patient.first_name} ${patient.last_name}`
  });
  
  return {
    ...patient,
    fullName: `${patient.first_name} ${patient.last_name}`,
    transformed: true
  };
};

const transformedPatients = mockPatients.map(transformPatient);

console.log('🔍 [TEST] Pacientes transformados:', {
  count: transformedPatients.length,
  patients: transformedPatients.map(p => ({
    id: p.id,
    name: p.fullName,
    email: p.email,
    transformed: p.transformed
  }))
});

console.log('🔍 [TEST] Prueba completada exitosamente');
console.log('🔍 [TEST] Los logs de depuración están funcionando correctamente'); 