import { AppDataSource } from '../../src/database/data-source';
import { Food } from '../../src/database/entities/food.entity';
import { User } from '../../src/database/entities/user.entity';
import { RoleName } from '../../src/database/entities/role.entity';

interface SampleFoodData {
  name: string;
  description: string;
  calories: number;
  protein: number;
  carbohydrates: number;
  fats: number;
  fiber: number;
  sugar: number;
  unit: string;
  serving_size: number;
  category: string;
}

const sampleFoods: SampleFoodData[] = [
  // Proteínas
  {
    name: 'Pollo pechuga sin piel',
    description: 'Pechuga de pollo cruda, sin piel',
    calories: 165,
    protein: 31.0,
    carbohydrates: 0.0,
    fats: 3.6,
    fiber: 0.0,
    sugar: 0.0,
    unit: 'g',
    serving_size: 100,
    category: 'Proteínas'
  },
  {
    name: 'Huevo entero',
    description: 'Huevo de gallina entero',
    calories: 155,
    protein: 13.0,
    carbohydrates: 1.1,
    fats: 11.0,
    fiber: 0.0,
    sugar: 1.1,
    unit: 'g',
    serving_size: 100,
    category: 'Proteínas'
  },
  {
    name: 'Salmón',
    description: 'Salmón fresco, crudo',
    calories: 208,
    protein: 25.4,
    carbohydrates: 0.0,
    fats: 12.4,
    fiber: 0.0,
    sugar: 0.0,
    unit: 'g',
    serving_size: 100,
    category: 'Proteínas'
  },
  {
    name: 'Frijoles negros',
    description: 'Frijoles negros cocidos',
    calories: 132,
    protein: 8.9,
    carbohydrates: 23.0,
    fats: 0.5,
    fiber: 8.7,
    sugar: 0.3,
    unit: 'g',
    serving_size: 100,
    category: 'Proteínas'
  },

  // Carbohidratos
  {
    name: 'Arroz integral',
    description: 'Arroz integral cocido',
    calories: 111,
    protein: 2.6,
    carbohydrates: 23.0,
    fats: 0.9,
    fiber: 1.8,
    sugar: 0.4,
    unit: 'g',
    serving_size: 100,
    category: 'Carbohidratos'
  },
  {
    name: 'Avena',
    description: 'Avena en hojuelas cruda',
    calories: 389,
    protein: 16.9,
    carbohydrates: 66.3,
    fats: 6.9,
    fiber: 10.6,
    sugar: 1.0,
    unit: 'g',
    serving_size: 100,
    category: 'Carbohidratos'
  },
  {
    name: 'Quinoa',
    description: 'Quinoa cocida',
    calories: 120,
    protein: 4.4,
    carbohydrates: 22.0,
    fats: 1.9,
    fiber: 2.8,
    sugar: 0.9,
    unit: 'g',
    serving_size: 100,
    category: 'Carbohidratos'
  },
  {
    name: 'Papa',
    description: 'Papa hervida con piel',
    calories: 87,
    protein: 1.9,
    carbohydrates: 20.1,
    fats: 0.1,
    fiber: 1.8,
    sugar: 0.9,
    unit: 'g',
    serving_size: 100,
    category: 'Carbohidratos'
  },
  {
    name: 'Pan integral',
    description: 'Pan integral de trigo',
    calories: 247,
    protein: 13.0,
    carbohydrates: 41.0,
    fats: 4.2,
    fiber: 6.0,
    sugar: 6.0,
    unit: 'g',
    serving_size: 100,
    category: 'Carbohidratos'
  },

  // Vegetales
  {
    name: 'Brócoli',
    description: 'Brócoli fresco crudo',
    calories: 34,
    protein: 2.8,
    carbohydrates: 7.0,
    fats: 0.4,
    fiber: 2.6,
    sugar: 1.5,
    unit: 'g',
    serving_size: 100,
    category: 'Vegetales'
  },
  {
    name: 'Espinaca',
    description: 'Espinaca fresca cruda',
    calories: 23,
    protein: 2.9,
    carbohydrates: 3.6,
    fats: 0.4,
    fiber: 2.2,
    sugar: 0.4,
    unit: 'g',
    serving_size: 100,
    category: 'Vegetales'
  },
  {
    name: 'Tomate',
    description: 'Tomate rojo maduro',
    calories: 18,
    protein: 0.9,
    carbohydrates: 3.9,
    fats: 0.2,
    fiber: 1.2,
    sugar: 2.6,
    unit: 'g',
    serving_size: 100,
    category: 'Vegetales'
  },
  {
    name: 'Zanahoria',
    description: 'Zanahoria cruda',
    calories: 41,
    protein: 0.9,
    carbohydrates: 9.6,
    fats: 0.2,
    fiber: 2.8,
    sugar: 4.7,
    unit: 'g',
    serving_size: 100,
    category: 'Vegetales'
  },
  {
    name: 'Pepino',
    description: 'Pepino con piel',
    calories: 16,
    protein: 0.7,
    carbohydrates: 4.0,
    fats: 0.1,
    fiber: 0.5,
    sugar: 1.7,
    unit: 'g',
    serving_size: 100,
    category: 'Vegetales'
  },

  // Frutas
  {
    name: 'Manzana',
    description: 'Manzana roja con piel',
    calories: 52,
    protein: 0.3,
    carbohydrates: 14.0,
    fats: 0.2,
    fiber: 2.4,
    sugar: 10.4,
    unit: 'g',
    serving_size: 100,
    category: 'Frutas'
  },
  {
    name: 'Plátano',
    description: 'Plátano maduro',
    calories: 89,
    protein: 1.1,
    carbohydrates: 23.0,
    fats: 0.3,
    fiber: 2.6,
    sugar: 12.2,
    unit: 'g',
    serving_size: 100,
    category: 'Frutas'
  },
  {
    name: 'Naranja',
    description: 'Naranja fresca',
    calories: 47,
    protein: 0.9,
    carbohydrates: 12.0,
    fats: 0.1,
    fiber: 2.4,
    sugar: 9.4,
    unit: 'g',
    serving_size: 100,
    category: 'Frutas'
  },
  {
    name: 'Aguacate',
    description: 'Aguacate maduro',
    calories: 160,
    protein: 2.0,
    carbohydrates: 8.5,
    fats: 14.7,
    fiber: 6.7,
    sugar: 0.7,
    unit: 'g',
    serving_size: 100,
    category: 'Frutas'
  },

  // Lácteos
  {
    name: 'Leche descremada',
    description: 'Leche de vaca descremada',
    calories: 34,
    protein: 3.4,
    carbohydrates: 5.0,
    fats: 0.1,
    fiber: 0.0,
    sugar: 5.0,
    unit: 'ml',
    serving_size: 100,
    category: 'Lácteos'
  },
  {
    name: 'Yogur griego natural',
    description: 'Yogur griego sin azúcar',
    calories: 59,
    protein: 10.0,
    carbohydrates: 3.6,
    fats: 0.4,
    fiber: 0.0,
    sugar: 3.6,
    unit: 'g',
    serving_size: 100,
    category: 'Lácteos'
  },
  {
    name: 'Queso cottage',
    description: 'Queso cottage bajo en grasa',
    calories: 98,
    protein: 11.0,
    carbohydrates: 3.4,
    fats: 4.3,
    fiber: 0.0,
    sugar: 2.7,
    unit: 'g',
    serving_size: 100,
    category: 'Lácteos'
  },

  // Grasas saludables
  {
    name: 'Aceite de oliva',
    description: 'Aceite de oliva extra virgen',
    calories: 884,
    protein: 0.0,
    carbohydrates: 0.0,
    fats: 100.0,
    fiber: 0.0,
    sugar: 0.0,
    unit: 'ml',
    serving_size: 100,
    category: 'Aceites y grasas'
  },
  {
    name: 'Almendras',
    description: 'Almendras crudas',
    calories: 579,
    protein: 21.2,
    carbohydrates: 22.0,
    fats: 49.9,
    fiber: 12.5,
    sugar: 4.4,
    unit: 'g',
    serving_size: 100,
    category: 'Frutos secos'
  },
  {
    name: 'Nuez',
    description: 'Nueces de nogal',
    calories: 654,
    protein: 15.2,
    carbohydrates: 14.0,
    fats: 65.2,
    fiber: 6.7,
    sugar: 2.6,
    unit: 'g',
    serving_size: 100,
    category: 'Frutos secos'
  }
];

async function createSampleFoods() {
  try {
    await AppDataSource.initialize();
    console.log('🔗 Conexión a base de datos establecida');

    const foodRepository = AppDataSource.getRepository(Food);
    const userRepository = AppDataSource.getRepository(User);

    // Buscar un administrador para asignar como creador
    const admin = await userRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.role', 'role')
      .where('role.name = :roleName', { roleName: RoleName.ADMIN })
      .getOne();

    // Si no hay admin, buscar un nutriólogo
    let creator = admin;
    if (!creator) {
      creator = await userRepository
        .createQueryBuilder('user')
        .leftJoinAndSelect('user.role', 'role')
        .where('role.name = :roleName', { roleName: RoleName.NUTRITIONIST })
        .getOne();
    }

    if (!creator) {
      console.log('❌ No se encontró ningún usuario administrador o nutriólogo en el sistema');
      return;
    }

    console.log(`👨‍⚕️ Creando alimentos para: ${creator.first_name} ${creator.last_name}`);

    // Verificar si ya existen alimentos
    const existingFoods = await foodRepository.count();
    if (existingFoods > 0) {
      console.log(`ℹ️ Ya existen ${existingFoods} alimentos en el sistema`);
      return;
    }

    // Crear cada alimento
    let createdCount = 0;
    for (const foodData of sampleFoods) {
      console.log(`🥗 Creando alimento: ${foodData.name}`);
      
      const food = foodRepository.create({
        name: foodData.name,
        description: foodData.description,
        calories: foodData.calories,
        protein: foodData.protein,
        carbohydrates: foodData.carbohydrates,
        fats: foodData.fats,
        fiber: foodData.fiber,
        sugar: foodData.sugar,
        unit: foodData.unit,
        serving_size: foodData.serving_size,
        category: foodData.category,
        is_custom: false,
        created_by_user: creator
      });

      await foodRepository.save(food);
      createdCount++;
      
      console.log(`  ✅ ${foodData.name}: ${foodData.calories} kcal/${foodData.serving_size}${foodData.unit}`);
    }

    console.log(`🎉 ¡${createdCount} alimentos de ejemplo creados exitosamente!`);
    
  } catch (error) {
    console.error('❌ Error creando alimentos de ejemplo:', error);
  } finally {
    await AppDataSource.destroy();
  }
}

if (require.main === module) {
  createSampleFoods();
}

export default createSampleFoods; 