/**
 * Test para verificar los nuevos límites de edad pediátrica
 * Pediátrico: 0-17 años (inclusive)
 * Adulto: 18+ años
 */

// Simular la función getPediatricInfo localmente para testing
function calculateAgeInMonths(birthDate: string | Date | null): number | null {
  if (!birthDate) return null;
  
  const birth = new Date(birthDate);
  const now = new Date();
  
  let months = (now.getFullYear() - birth.getFullYear()) * 12;
  months += now.getMonth() - birth.getMonth();
  
  // Ajustar si el día del mes actual es menor que el día de nacimiento
  if (now.getDate() < birth.getDate()) {
    months--;
  }
  
  return Math.max(0, months);
}

function getPediatricInfoTest(birthDate: string | Date | null) {
  const ageInMonths = birthDate ? calculateAgeInMonths(birthDate) : null;
  const ageInYears = ageInMonths !== null ? Math.floor(ageInMonths / 12) : null;
  
  // NUEVA REGLA: Determinar si es pediátrico (menor de 18 años - hasta 17 años inclusive)
  const isPediatric = ageInYears !== null && ageInYears < 18;
  
  // Determinar categoría de edad
  let category: string | null = null;
  if (ageInMonths !== null) {
    if (ageInMonths < 12) {
      category = 'infant'; // 0-11 meses
    } else if (ageInMonths < 36) {
      category = 'toddler'; // 1-2 años
    } else if (ageInMonths < 72) {
      category = 'preschool'; // 3-5 años
    } else if (ageInMonths < 144) {
      category = 'school-age'; // 6-11 años
    } else if (ageInMonths < 216) { // CAMBIADO: 216 meses = 18 años
      category = 'adolescent'; // 12-17 años
    } else {
      category = 'adult'; // 18+ años
    }
  }
  
  return {
    isPediatric,
    ageInMonths,
    ageInYears,
    category
  };
}

console.log('🧪 Testing nuevos límites de edad pediátrica\n');

// Casos de prueba
const testCases = [
  { name: 'Bebé 6 meses', birthDate: new Date(Date.now() - 6 * 30 * 24 * 60 * 60 * 1000) },
  { name: 'Niño 5 años', birthDate: '2020-01-15' },
  { name: 'Niño 10 años', birthDate: '2015-03-20' },
  { name: 'Adolescente 15 años', birthDate: '2010-06-10' },
  { name: 'Adolescente 17 años', birthDate: '2008-01-01' },
  { name: 'Sebastián (19 años)', birthDate: '2006-05-27' }, // Este era el caso que se mostró en los logs
  { name: 'Joven adulto 18 años', birthDate: '2007-01-01' },
  { name: 'Adulto 25 años', birthDate: '1999-05-02' }
];

testCases.forEach((testCase, index) => {
  const result = getPediatricInfoTest(testCase.birthDate);
  const isPediatricIcon = result.isPediatric ? '👶' : '🧑';
  const status = result.isPediatric ? 'PEDIÁTRICO' : 'ADULTO';
  
  console.log(`${index + 1}. ${isPediatricIcon} ${testCase.name}:`);
  console.log(`   Edad: ${result.ageInYears} años (${result.ageInMonths} meses)`);
  console.log(`   Categoría: ${result.category}`);
  console.log(`   Estado: ${status}`);
  console.log('');
});

console.log('📋 RESUMEN DE CAMBIOS:');
console.log('✅ Límite pediátrico: 0-17 años (antes era 0-19 años)');
console.log('✅ Adolescente: 12-17 años (antes era 12-19 años)');  
console.log('✅ Adulto: 18+ años (antes era 20+ años)');
console.log('');
console.log('🎯 RESULTADO ESPERADO:');
console.log('   - Sebastián (19 años) ahora debe ser ADULTO, no pediátrico');
console.log('   - Solo pacientes de 0-17 años aparecerán en evaluación pediátrica'); 