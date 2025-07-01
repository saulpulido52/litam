import axios from 'axios';

const BASE_URL = 'http://localhost:4000/api';

interface Nutritionist {
  email: string;
  name: string;
  passwords: string[];
}

const nutritionists: Nutritionist[] = [
  {
    email: 'nutri.demo@example.com',
    name: 'Nutri Demo',
    passwords: ['password123', 'demo123', 'nutri123', 'password', '123456']
  },
  {
    email: 'nutritionist@demo.com',
    name: 'Dr. Juan Pérez',
    passwords: ['password123', 'demo123', 'nutri123', 'password', '123456']
  },
  {
    email: 'dr.juan.perez@demo.com',
    name: 'Dr. Juan Pérez',
    passwords: ['password123', 'demo123', 'nutri123', 'password', '123456']
  },
  {
    email: 'test.nutri@example.com',
    name: 'Test Nutri',
    passwords: ['password123', 'demo123', 'nutri123', 'password', '123456']
  },
  {
    email: 'nutri.auth@example.com',
    name: 'Jane Smith',
    passwords: ['password123', 'demo123', 'nutri123', 'password', '123456']
  }
];

async function testNutritionistCredentials() {
  console.log('🔐 Probando credenciales de nutriólogos...\n');
  
  for (const nutri of nutritionists) {
    console.log(`👩‍⚕️ Probando ${nutri.name} (${nutri.email})`);
    
    for (const password of nutri.passwords) {
      try {
        console.log(`   🔑 Probando contraseña: ${password}`);
        
        const response = await axios.post(`${BASE_URL}/auth/login`, {
          email: nutri.email,
          password: password
        });
        
        if (response.data.success) {
          console.log(`   ✅ ¡ÉXITO! Credenciales válidas:`);
          console.log(`      📧 Email: ${nutri.email}`);
          console.log(`      🔑 Password: ${password}`);
          console.log(`      🎟️ Token: ${response.data.data.token.substring(0, 30)}...`);
          console.log(`      👤 Usuario: ${response.data.data.user.first_name} ${response.data.data.user.last_name}`);
          console.log(`      🏥 Rol: ${response.data.data.user.role.name}\n`);
          
          return {
            email: nutri.email,
            password: password,
            token: response.data.data.token,
            user: response.data.data.user
          };
        }
      } catch (error) {
        if (axios.isAxiosError(error)) {
          if (error.response?.status === 401) {
            console.log(`   ❌ Contraseña incorrecta: ${password}`);
          } else if (error.response?.status === 429) {
            console.log(`   ⏰ Rate limit activo, esperando...`);
            await new Promise(resolve => setTimeout(resolve, 2000));
          } else {
            console.log(`   ⚠️ Error: ${error.response?.status} - ${error.response?.data?.message || error.message}`);
          }
        } else {
          console.log(`   ❌ Error: ${error}`);
        }
      }
    }
    console.log(`   ❌ Ninguna contraseña funcionó para ${nutri.email}\n`);
  }
  
  console.log('❌ No se encontraron credenciales válidas');
  return null;
}

// Ejecutar el test
testNutritionistCredentials()
  .then(result => {
    if (result) {
      console.log('\n🎉 ¡Listo! Ahora puedes usar estas credenciales:');
      console.log(`📧 Email: ${result.email}`);
      console.log(`🔑 Password: ${result.password}`);
    } else {
      console.log('\n❌ No se pudieron encontrar credenciales válidas');
      console.log('💡 Tip: Verifica que el backend esté corriendo y que los usuarios existan');
    }
  })
  .catch(console.error); 