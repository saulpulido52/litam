import axios from 'axios';

const BASE_URL = 'http://localhost:4000/api';

// Credenciales que he visto funcionando en otros scripts
const knownCredentials = [
  { email: 'nutritionist@demo.com', password: 'demo123' },
  { email: 'dr.juan.perez@demo.com', password: 'password123' },
  { email: 'nutri.demo@example.com', password: 'nutri123' },
  { email: 'nutri.auth@example.com', password: 'password123' },
  { email: 'test.nutri@example.com', password: 'password123' },
  { email: 'dra.carmen.rodriguez@demo.com', password: 'demo123' },
  { email: 'dr.maria.gonzalez@demo.com', password: 'demo123' },
];

async function testKnownCredentials() {
  console.log('🔐 Probando credenciales conocidas de los scripts...\n');
  
  for (const credential of knownCredentials) {
    try {
      console.log(`👩‍⚕️ Probando: ${credential.email} / ${credential.password}`);
      
      const response = await axios.post(`${BASE_URL}/auth/login`, {
        email: credential.email,
        password: credential.password
      });
      
      if (response.data.success) {
        console.log(`✅ ¡ÉXITO! Credenciales válidas encontradas:`);
        console.log(`   📧 Email: ${credential.email}`);
        console.log(`   🔑 Password: ${credential.password}`);
        console.log(`   👤 Usuario: ${response.data.data.user.first_name} ${response.data.data.user.last_name}`);
        console.log(`   🏥 Rol: ${response.data.data.user.role.name}`);
        console.log(`   🎟️ Token: ${response.data.data.token.substring(0, 30)}...\n`);
        
        return {
          email: credential.email,
          password: credential.password,
          token: response.data.data.token,
          user: response.data.data.user
        };
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 401) {
          console.log(`   ❌ Credenciales incorrectas`);
        } else if (error.response?.status === 429) {
          console.log(`   ⏰ Rate limit detectado - esperando...`);
          await new Promise(resolve => setTimeout(resolve, 3000));
        } else {
          console.log(`   ⚠️ Error: ${error.response?.status} - ${error.response?.data?.message || 'Error desconocido'}`);
        }
      } else {
        console.log(`   ❌ Error de conexión: ${error}`);
      }
    }
    
    // Pequeña pausa entre intentos
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  console.log('\n❌ No se encontraron credenciales válidas');
  return null;
}

// Ejecutar el test
testKnownCredentials()
  .then(result => {
    if (result) {
      console.log('\n🎉 ¡PERFECTO! Puedes usar estas credenciales en el frontend:');
      console.log(`📧 Email: ${result.email}`);
      console.log(`🔑 Password: ${result.password}`);
      console.log(`\n💡 Ahora ve al frontend y usa estas credenciales para hacer login.`);
    } else {
      console.log('\n❌ No se pudieron validar las credenciales conocidas');
      console.log('💡 Puede que el rate limit esté muy activo. Intenta esperar unos minutos.');
    }
  })
  .catch(console.error); 