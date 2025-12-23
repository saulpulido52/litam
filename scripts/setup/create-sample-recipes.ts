// scripts/setup/create-sample-recipes.ts
import { AppDataSource } from '../../src/database/data-source';
import { Recipe, RecipeIngredient } from '../../src/database/entities/recipe.entity';
import { Food } from '../../src/database/entities/food.entity';
import { User } from '../../src/database/entities/user.entity';
import { RoleName } from '../../src/database/entities/role.entity';

interface SampleRecipeData {
  title: string;
  description: string;
  instructions: string;
  prepTimeMinutes: number;
  cookTimeMinutes: number;
  servings: number;
  tags: string[];
  ingredients: {
    name: string;
    quantity: number;
    unit: string;
    caloriesPer100g: number;
    proteinPer100g: number;
    carbsPer100g: number;
    fatsPer100g: number;
  }[];
}

const sampleRecipes: SampleRecipeData[] = [
  {
    title: "Ensalada de Quinoa con Aguacate",
    description: "Ensalada nutritiva y balanceada, perfecta para almuerzo o cena ligera",
    instructions: `1. Cocinar la quinoa según las instrucciones del paquete
2. Cortar el aguacate en cubos
3. Picar el tomate cherry
4. Mezclar todos los ingredientes
5. Aderezar con aceite de oliva y limón
6. Sazonar con sal y pimienta al gusto`,
    prepTimeMinutes: 15,
    cookTimeMinutes: 20,
    servings: 2,
    tags: ['saludable', 'vegetariano', 'alto en proteínas', 'almuerzo'],
    ingredients: [
      { name: 'Quinoa', quantity: 100, unit: 'g', caloriesPer100g: 368, proteinPer100g: 14.1, carbsPer100g: 64.2, fatsPer100g: 6.1 },
      { name: 'Aguacate', quantity: 150, unit: 'g', caloriesPer100g: 160, proteinPer100g: 2.0, carbsPer100g: 8.5, fatsPer100g: 14.7 },
      { name: 'Tomate cherry', quantity: 100, unit: 'g', caloriesPer100g: 18, proteinPer100g: 0.9, carbsPer100g: 3.9, fatsPer100g: 0.2 },
      { name: 'Aceite de oliva', quantity: 15, unit: 'ml', caloriesPer100g: 884, proteinPer100g: 0, carbsPer100g: 0, fatsPer100g: 100 }
    ]
  },
  {
    title: "Salmón a la Plancha con Vegetales",
    description: "Platillo rico en omega-3 y proteínas de alta calidad",
    instructions: `1. Salpimentar el salmón
2. Calentar la sartén con un poco de aceite
3. Cocinar el salmón 4-5 minutos por lado
4. Saltear los vegetales hasta que estén tiernos
5. Servir el salmón sobre los vegetales
6. Decorar con limón`,
    prepTimeMinutes: 10,
    cookTimeMinutes: 15,
    servings: 1,
    tags: ['alto en proteínas', 'omega-3', 'bajo en carbohidratos', 'cena'],
    ingredients: [
      { name: 'Filete de salmón', quantity: 150, unit: 'g', caloriesPer100g: 208, proteinPer100g: 25.4, carbsPer100g: 0, fatsPer100g: 12.4 },
      { name: 'Brócoli', quantity: 100, unit: 'g', caloriesPer100g: 34, proteinPer100g: 2.8, carbsPer100g: 7.0, fatsPer100g: 0.4 },
      { name: 'Zanahoria', quantity: 80, unit: 'g', caloriesPer100g: 41, proteinPer100g: 0.9, carbsPer100g: 9.6, fatsPer100g: 0.2 },
      { name: 'Aceite de oliva', quantity: 10, unit: 'ml', caloriesPer100g: 884, proteinPer100g: 0, carbsPer100g: 0, fatsPer100g: 100 }
    ]
  },
  {
    title: "Smoothie Verde Energizante",
    description: "Batido nutritivo perfecto para el desayuno, rico en vitaminas y minerales",
    instructions: `1. Lavar las espinacas y el apio
2. Pelar el plátano y la manzana
3. Agregar todos los ingredientes a la licuadora
4. Licuar hasta obtener consistencia suave
5. Agregar agua si es necesario
6. Servir inmediatamente`,
    prepTimeMinutes: 5,
    cookTimeMinutes: 0,
    servings: 1,
    tags: ['vegetariano', 'vegano', 'rápido', 'desayuno', 'antioxidantes'],
    ingredients: [
      { name: 'Espinacas frescas', quantity: 50, unit: 'g', caloriesPer100g: 23, proteinPer100g: 2.9, carbsPer100g: 3.6, fatsPer100g: 0.4 },
      { name: 'Plátano', quantity: 120, unit: 'g', caloriesPer100g: 89, proteinPer100g: 1.1, carbsPer100g: 22.8, fatsPer100g: 0.3 },
      { name: 'Manzana verde', quantity: 100, unit: 'g', caloriesPer100g: 52, proteinPer100g: 0.3, carbsPer100g: 13.8, fatsPer100g: 0.2 },
      { name: 'Apio', quantity: 30, unit: 'g', caloriesPer100g: 16, proteinPer100g: 0.7, carbsPer100g: 3.0, fatsPer100g: 0.2 }
    ]
  },
  {
    title: "Pollo al Horno con Batata",
    description: "Comida completa y balanceada, ideal para la cena",
    instructions: `1. Precalentar el horno a 200°C
2. Sazonar el pollo con hierbas y especias
3. Cortar la batata en rodajas
4. Colocar pollo y batata en una bandeja
5. Hornear por 25-30 minutos
6. Verificar que el pollo esté bien cocido`,
    prepTimeMinutes: 15,
    cookTimeMinutes: 30,
    servings: 1,
    tags: ['alto en proteínas', 'sin gluten', 'cena', 'horno'],
    ingredients: [
      { name: 'Pechuga de pollo', quantity: 120, unit: 'g', caloriesPer100g: 165, proteinPer100g: 31.0, carbsPer100g: 0, fatsPer100g: 3.6 },
      { name: 'Batata', quantity: 150, unit: 'g', caloriesPer100g: 86, proteinPer100g: 1.6, carbsPer100g: 20.1, fatsPer100g: 0.1 },
      { name: 'Aceite de oliva', quantity: 8, unit: 'ml', caloriesPer100g: 884, proteinPer100g: 0, carbsPer100g: 0, fatsPer100g: 100 }
    ]
  },
  {
    title: "Avena con Frutas y Nueces",
    description: "Desayuno nutritivo y energizante, rico en fibra y proteína",
    instructions: `1. Cocinar la avena con agua o leche vegetal
2. Cortar las frutas en trozos pequeños
3. Agregar las frutas a la avena cocida
4. Espolvorear con nueces picadas
5. Endulzar con miel si se desea
6. Servir caliente`,
    prepTimeMinutes: 5,
    cookTimeMinutes: 10,
    servings: 1,
    tags: ['vegetariano', 'alto en fibra', 'desayuno', 'energizante'],
    ingredients: [
      { name: 'Avena en hojuelas', quantity: 50, unit: 'g', caloriesPer100g: 389, proteinPer100g: 16.9, carbsPer100g: 66.3, fatsPer100g: 6.9 },
      { name: 'Plátano', quantity: 80, unit: 'g', caloriesPer100g: 89, proteinPer100g: 1.1, carbsPer100g: 22.8, fatsPer100g: 0.3 },
      { name: 'Fresas', quantity: 60, unit: 'g', caloriesPer100g: 32, proteinPer100g: 0.7, carbsPer100g: 7.7, fatsPer100g: 0.3 },
      { name: 'Nueces', quantity: 15, unit: 'g', caloriesPer100g: 654, proteinPer100g: 15.2, carbsPer100g: 13.7, fatsPer100g: 65.2 }
    ]
  }
];

async function calculateRecipeNutrition(ingredients: any[], servings: number) {
  let totalCalories = 0;
  let totalProtein = 0;
  let totalCarbs = 0;
  let totalFats = 0;

  ingredients.forEach(ingredient => {
    const factor = ingredient.quantity / 100; // Convertir a factor de 100g
    totalCalories += ingredient.caloriesPer100g * factor;
    totalProtein += ingredient.proteinPer100g * factor;
    totalCarbs += ingredient.carbsPer100g * factor;
    totalFats += ingredient.fatsPer100g * factor;
  });

  return {
    totalCalories: Math.round(totalCalories),
    totalMacros: {
      protein: Math.round(totalProtein * 100) / 100,
      carbohydrates: Math.round(totalCarbs * 100) / 100,
      fats: Math.round(totalFats * 100) / 100
    }
  };
}

async function createSampleRecipes() {
  try {
    await AppDataSource.initialize();
    console.log('🔗 Conexión a base de datos establecida');

    const userRepository = AppDataSource.getRepository(User);
    const recipeRepository = AppDataSource.getRepository(Recipe);
    const recipeIngredientRepository = AppDataSource.getRepository(RecipeIngredient);

    // Buscar un nutriólogo para asignar como creador
    const nutritionist = await userRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.role', 'role')
      .where('role.name = :roleName', { roleName: RoleName.NUTRITIONIST })
      .getOne();

    if (!nutritionist) {
      console.log('❌ No se encontró ningún nutriólogo en el sistema');
      return;
    }

    console.log(`👨‍⚕️ Creando recetas para: ${nutritionist.first_name} ${nutritionist.last_name}`);

    // Verificar si ya existen recetas
    const existingRecipes = await recipeRepository.count();
    if (existingRecipes > 0) {
      console.log(`ℹ️ Ya existen ${existingRecipes} recetas en el sistema`);
      return;
    }

    // Crear cada receta
    for (const recipeData of sampleRecipes) {
      console.log(`🍳 Creando receta: ${recipeData.title}`);
      
      // Calcular valores nutricionales
      const nutrition = await calculateRecipeNutrition(recipeData.ingredients, recipeData.servings);
      
      // Crear la receta
      const recipe = recipeRepository.create({
        title: recipeData.title,
        description: recipeData.description,
        instructions: recipeData.instructions,
        tags: recipeData.tags,
        prep_time_minutes: recipeData.prepTimeMinutes,
        cook_time_minutes: recipeData.cookTimeMinutes,
        servings: recipeData.servings,
        total_calories: nutrition.totalCalories,
        total_macros: nutrition.totalMacros,
        is_published: true,
        created_by: nutritionist
      });

      const savedRecipe = await recipeRepository.save(recipe);
      
      // Crear ingredientes
      for (const ingredientData of recipeData.ingredients) {
        const ingredient = recipeIngredientRepository.create({
          recipe: savedRecipe,
          ingredient_name: ingredientData.name,
          quantity: ingredientData.quantity,
          unit: ingredientData.unit,
          food: null // No vinculamos con alimentos existentes por ahora
        });
        
        await recipeIngredientRepository.save(ingredient);
      }
      
      console.log(`  ✅ ${recipeData.title}: ${nutrition.totalCalories} kcal total, ${Math.round(nutrition.totalCalories / recipeData.servings)} kcal/porción`);
    }

    console.log('🎉 ¡Recetas de ejemplo creadas exitosamente!');
    
  } catch (error) {
    console.error('❌ Error creando recetas de ejemplo:', error);
  } finally {
    await AppDataSource.destroy();
  }
}

if (require.main === module) {
  createSampleRecipes();
}

export { createSampleRecipes }; 