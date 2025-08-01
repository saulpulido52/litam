// scripts/seed-admin-demo-data.js
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🌱 Iniciando poblado de datos de demostración para el panel de administración...');

// Datos de ejemplo para el sistema
const demoData = {
  foods: [
    {
      name: 'Manzana',
      description: 'Fruta rica en fibra y vitaminas',
      category: 'Frutas',
      caloriesPer100g: 52,
      proteinPer100g: 0.3,
      carbsPer100g: 14,
      fatPer100g: 0.2,
      fiberPer100g: 2.4
    },
    {
      name: 'Pollo a la plancha',
      description: 'Pechuga de pollo sin piel, cocida a la plancha',
      category: 'Proteínas',
      caloriesPer100g: 165,
      proteinPer100g: 31,
      carbsPer100g: 0,
      fatPer100g: 3.6,
      fiberPer100g: 0
    },
    {
      name: 'Arroz integral',
      description: 'Arroz integral cocido',
      category: 'Cereales',
      caloriesPer100g: 111,
      proteinPer100g: 2.6,
      carbsPer100g: 23,
      fatPer100g: 0.9,
      fiberPer100g: 1.8
    },
    {
      name: 'Brócoli',
      description: 'Verdura crucífera rica en vitamina C',
      category: 'Verduras',
      caloriesPer100g: 34,
      proteinPer100g: 2.8,
      carbsPer100g: 7,
      fatPer100g: 0.4,
      fiberPer100g: 2.6
    },
    {
      name: 'Aguacate',
      description: 'Fruta rica en grasas saludables',
      category: 'Frutas',
      caloriesPer100g: 160,
      proteinPer100g: 2,
      carbsPer100g: 9,
      fatPer100g: 15,
      fiberPer100g: 7
    },
    {
      name: 'Salmón',
      description: 'Pescado graso rico en omega-3',
      category: 'Proteínas',
      caloriesPer100g: 208,
      proteinPer100g: 20,
      carbsPer100g: 0,
      fatPer100g: 13,
      fiberPer100g: 0
    },
    {
      name: 'Quinoa',
      description: 'Pseudocereal rico en proteína completa',
      category: 'Cereales',
      caloriesPer100g: 120,
      proteinPer100g: 4.4,
      carbsPer100g: 22,
      fatPer100g: 1.9,
      fiberPer100g: 2.8
    },
    {
      name: 'Espinacas',
      description: 'Hojas verdes ricas en hierro',
      category: 'Verduras',
      caloriesPer100g: 23,
      proteinPer100g: 2.9,
      carbsPer100g: 3.6,
      fatPer100g: 0.4,
      fiberPer100g: 2.2
    },
    {
      name: 'Yogur griego',
      description: 'Yogur natural bajo en grasa',
      category: 'Lácteos',
      caloriesPer100g: 59,
      proteinPer100g: 10,
      carbsPer100g: 3.6,
      fatPer100g: 0.4,
      fiberPer100g: 0
    },
    {
      name: 'Almendras',
      description: 'Frutos secos ricos en vitamina E',
      category: 'Frutos secos',
      caloriesPer100g: 579,
      proteinPer100g: 21,
      carbsPer100g: 22,
      fatPer100g: 50,
      fiberPer100g: 12
    }
  ],
  
  users: [
    {
      firstName: 'María',
      lastName: 'González Rodríguez',
      email: 'maria.gonzalez@nutricionista.com',
      password: 'nutricionista123',
      roleName: 'NUTRITIONIST',
      phone: '+52 55 1234 5678',
      isActive: true
    },
    {
      firstName: 'Carlos',
      lastName: 'Hernández López',
      email: 'carlos.hernandez@nutricionista.com',
      password: 'nutricionista123',
      roleName: 'NUTRITIONIST',
      phone: '+52 55 2345 6789',
      isActive: true
    },
    {
      firstName: 'Ana',
      lastName: 'Martínez Pérez',
      email: 'ana.martinez@paciente.com',
      password: 'paciente123',
      roleName: 'PATIENT',
      phone: '+52 55 3456 7890',
      birthDate: '1990-05-15',
      isActive: true
    },
    {
      firstName: 'Luis',
      lastName: 'García Sánchez',
      email: 'luis.garcia@paciente.com',
      password: 'paciente123',
      roleName: 'PATIENT',
      phone: '+52 55 4567 8901',
      birthDate: '1985-08-22',
      isActive: true
    },
    {
      firstName: 'Elena',
      lastName: 'Ruiz Morales',
      email: 'elena.ruiz@paciente.com',
      password: 'paciente123',
      roleName: 'PATIENT',
      phone: '+52 55 5678 9012',
      birthDate: '1992-12-03',
      isActive: true
    },
    {
      firstName: 'Roberto',
      lastName: 'Torres Vega',
      email: 'roberto.torres@nutricionista.com',
      password: 'nutricionista123',
      roleName: 'NUTRITIONIST',
      phone: '+52 55 6789 0123',
      isActive: false
    },
    {
      firstName: 'Carmen',
      lastName: 'Jiménez Castro',
      email: 'carmen.jimenez@paciente.com',
      password: 'paciente123',
      roleName: 'PATIENT',
      phone: '+52 55 7890 1234',
      birthDate: '1988-03-17',
      isActive: true
    },
    {
      firstName: 'Fernando',
      lastName: 'Delgado Romero',
      email: 'fernando.delgado@nutricionista.com',
      password: 'nutricionista123',
      roleName: 'NUTRITIONIST',
      phone: '+52 55 8901 2345',
      isActive: true
    }
  ],

  educationalContent: [
    {
      title: 'Guía completa de alimentación saludable',
      content: 'Una alimentación saludable es fundamental para mantener un buen estado de salud. Incluye principios básicos como consumir una variedad de alimentos, controlar las porciones, y mantener un equilibrio entre macronutrientes...',
      type: 'article',
      targetAudience: 'general',
      tags: ['alimentación', 'salud', 'nutrición'],
      isPublished: true
    },
    {
      title: 'Beneficios de los omega-3',
      content: 'Los ácidos grasos omega-3 son esenciales para el funcionamiento óptimo del organismo. Se encuentran principalmente en pescados grasos, nueces y semillas...',
      type: 'article',
      targetAudience: 'patients',
      tags: ['omega-3', 'salud cardiovascular', 'nutrientes'],
      isPublished: true
    },
    {
      title: 'Planificación de comidas para diabéticos',
      content: 'La planificación de comidas es crucial para las personas con diabetes. Es importante controlar los carbohidratos, elegir alimentos con bajo índice glucémico...',
      type: 'guide',
      targetAudience: 'patients',
      tags: ['diabetes', 'planificación', 'carbohidratos'],
      isPublished: true
    },
    {
      title: 'Suplementación en deportistas',
      content: 'Los atletas tienen necesidades nutricionales específicas. La suplementación puede ser necesaria en ciertos casos, pero siempre debe ser personalizada...',
      type: 'article',
      targetAudience: 'nutritionists',
      tags: ['deportistas', 'suplementos', 'rendimiento'],
      isPublished: false
    }
  ],

  recipes: [
    {
      name: 'Ensalada de quinoa con vegetables',
      description: 'Ensalada nutritiva y colorida perfecta para el almuerzo',
      instructions: '1. Cocinar la quinoa en agua con sal durante 15 minutos\n2. Cortar los vegetales en cubos pequeños\n3. Mezclar todos los ingredientes\n4. Aliñar con aceite de oliva y limón',
      prepTimeMinutes: 25,
      servings: 4,
      difficultyLevel: 'easy',
      category: 'ensaladas'
    },
    {
      name: 'Salmón al horno con hierbas',
      description: 'Pescado saludable y fácil de preparar',
      instructions: '1. Precalentar el horno a 180°C\n2. Marinar el salmón con hierbas y aceite\n3. Hornear por 20 minutos\n4. Servir con vegetales',
      prepTimeMinutes: 30,
      servings: 2,
      difficultyLevel: 'medium',
      category: 'proteínas'
    },
    {
      name: 'Smoothie verde energizante',
      description: 'Bebida rica en nutrientes para empezar el día',
      instructions: '1. Lavar bien las espinacas y frutas\n2. Agregar todos los ingredientes a la licuadora\n3. Licuar hasta obtener consistencia suave\n4. Servir inmediatamente',
      prepTimeMinutes: 10,
      servings: 1,
      difficultyLevel: 'easy',
      category: 'bebidas'
    }
  ]
};

// Función para hacer peticiones HTTP
async function makeRequest(url, method, data) {
  const https = require('https');
  const http = require('http');
  
  return new Promise((resolve, reject) => {
    const isHttps = url.startsWith('https://');
    const lib = isHttps ? https : http;
    
    const options = {
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + process.env.ADMIN_TOKEN || ''
      }
    };

    if (data) {
      const postData = JSON.stringify(data);
      options.headers['Content-Length'] = Buffer.byteLength(postData);
    }

    const req = lib.request(url, options, (res) => {
      let responseData = '';
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      res.on('end', () => {
        try {
          const parsed = JSON.parse(responseData);
          resolve(parsed);
        } catch (e) {
          resolve(responseData);
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    if (data) {
      req.write(JSON.stringify(data));
    }
    req.end();
  });
}

async function seedData() {
  const baseUrl = process.env.API_URL || 'http://localhost:3000';
  
  try {
    console.log('📦 Creando alimentos de demostración...');
    for (const food of demoData.foods) {
      try {
        await makeRequest(\`\${baseUrl}/admin/foods\`, 'POST', food);
        console.log(\`✅ Alimento creado: \${food.name}\`);
      } catch (error) {
        console.log(\`⚠️  Error creando alimento \${food.name}: \${error.message}\`);
      }
    }

    console.log('👥 Creando usuarios de demostración...');
    for (const user of demoData.users) {
      try {
        await makeRequest(\`\${baseUrl}/admin/users\`, 'POST', user);
        console.log(\`✅ Usuario creado: \${user.firstName} \${user.lastName} (\${user.roleName})\`);
      } catch (error) {
        console.log(\`⚠️  Error creando usuario \${user.firstName}: \${error.message}\`);
      }
    }

    console.log('📚 Creando contenido educativo...');
    for (const content of demoData.educationalContent) {
      try {
        await makeRequest(\`\${baseUrl}/admin/educational-content\`, 'POST', content);
        console.log(\`✅ Contenido creado: \${content.title}\`);
      } catch (error) {
        console.log(\`⚠️  Error creando contenido \${content.title}: \${error.message}\`);
      }
    }

    console.log('🍳 Creando recetas...');
    for (const recipe of demoData.recipes) {
      try {
        await makeRequest(\`\${baseUrl}/admin/recipes\`, 'POST', recipe);
        console.log(\`✅ Receta creada: \${recipe.name}\`);
      } catch (error) {
        console.log(\`⚠️  Error creando receta \${recipe.name}: \${error.message}\`);
      }
    }

    console.log('🎉 ¡Datos de demostración creados exitosamente!');
    console.log('');
    console.log('📊 Resumen:');
    console.log(\`   - \${demoData.foods.length} alimentos\`);
    console.log(\`   - \${demoData.users.length} usuarios\`);
    console.log(\`   - \${demoData.educationalContent.length} contenidos educativos\`);
    console.log(\`   - \${demoData.recipes.length} recetas\`);
    console.log('');
    console.log('🔐 Credenciales de acceso:');
    console.log('   Admin: admin@litam.com / admin123');
    console.log('   Nutricionistas: [nombre]@nutricionista.com / nutricionista123');
    console.log('   Pacientes: [nombre]@paciente.com / paciente123');

  } catch (error) {
    console.error('❌ Error durante el poblado de datos:', error);
    process.exit(1);
  }
}

// Ejecutar el script
if (require.main === module) {
  seedData();
}

module.exports = { seedData, demoData };