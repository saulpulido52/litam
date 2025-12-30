// nutri-web/src/services/recipeService.ts
import apiService from './api';
import { cacheService, CACHE_KEYS, CACHE_TTL } from './cacheService';

export interface Recipe {
  id: string;
  title: string;
  description: string;
  instructions: string;
  prep_time_minutes: number;
  cook_time_minutes: number;
  servings: number;
  total_calories: number;
  total_protein: number;
  total_carbs: number;
  total_fats: number;
  tags: string[];
  ingredients: RecipeIngredient[];
  is_published: boolean;
  created_by: {
    id: string;
    first_name: string;
    last_name: string;
  };
  created_at: string;
  updated_at: string;
}

export interface RecipeIngredient {
  id: string;
  recipe_id: string;
  food_id?: string;
  ingredient_name: string;
  quantity: number;
  unit: string;
  calories_contribution: number;
  protein_contribution: number;
  carbs_contribution: number;
  fats_contribution: number;
  food?: {
    id: string;
    name: string;
    calories_per_100g: number;
    protein_per_100g: number;
    carbs_per_100g: number;
    fats_per_100g: number;
  };
}

export interface RecipeSearchParams {
  search?: string;
  tags?: string[];
  mealType?: string;
  maxCaloriesPerServing?: number;
  minCaloriesPerServing?: number;
  maxPrepTime?: number;
  sortBy?: 'created_desc' | 'created_asc' | 'calories_asc' | 'calories_desc' | 'time_asc' | 'time_desc' | 'name_asc' | 'name_desc';
  page?: number;
  limit?: number;
  detailedResults?: boolean; // Nueva opción para controlar si cargar ingredientes completos
}

export interface CreateRecipeDto {
  title: string;
  description: string;
  instructions: string;
  prep_time_minutes: number;
  cook_time_minutes: number;
  servings: number;
  tags: string[];
  ingredients: {
    food_id?: string;
    ingredient_name: string;
    quantity: number;
    unit: string;
  }[];
}

export interface UpdateRecipeDto extends Partial<CreateRecipeDto> {
  is_published?: boolean;
}

class RecipeService {
  // **OPTIMIZACIÓN**: Obtener todas las recetas con caché y parámetros optimizados
  async getAllRecipes(params: RecipeSearchParams = {}): Promise<{
    recipes: Recipe[];
    pagination: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  }> {
    // Crear clave de caché basada en parámetros
    const cacheKey = this.generateCacheKey('recipes:search', params);

    return await cacheService.memoize(
      cacheKey,
      async () => {
        const queryParams = new URLSearchParams();

        if (params.search) queryParams.append('search', params.search);
        if (params.tags && params.tags.length > 0) {
          params.tags.forEach(tag => queryParams.append('tags[]', tag));
        }
        if (params.mealType) queryParams.append('mealType', params.mealType);
        if (params.maxCaloriesPerServing) queryParams.append('maxCaloriesPerServing', params.maxCaloriesPerServing.toString());
        if (params.minCaloriesPerServing) queryParams.append('minCaloriesPerServing', params.minCaloriesPerServing.toString());
        if (params.maxPrepTime) queryParams.append('maxPrepTime', params.maxPrepTime.toString());
        if (params.sortBy) queryParams.append('sortBy', params.sortBy);
        if (params.page) queryParams.append('page', params.page.toString());
        if (params.limit) queryParams.append('limit', params.limit.toString());
        if (params.detailedResults !== undefined) queryParams.append('detailedResults', params.detailedResults.toString());

        const url = `/recipes${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;

        const response = await apiService.get<{
          recipes: Recipe[];
          pagination: any;
        }>(url);

        if (response.status !== 'success' || !response.data) {
          throw new Error(response.message || 'Error fetching recipes');
        }

        return response.data;
      },
      CACHE_TTL.MEDIUM // 15 minutos para búsquedas
    );
  }

  // **OPTIMIZACIÓN**: Obtener receta por ID con caché
  async getRecipeById(id: string): Promise<Recipe> {
    const cacheKey = CACHE_KEYS.RECIPE_BY_ID(id);

    return await cacheService.memoize(
      cacheKey,
      async () => {
        const response = await apiService.get<{ recipe: Recipe }>(`/recipes/${id}`);

        if (response.status !== 'success' || !response.data) {
          throw new Error(response.message || 'Error fetching recipe');
        }

        return response.data.recipe;
      },
      CACHE_TTL.LONG // 1 hora para recetas específicas
    );
  }

  // **OPTIMIZACIÓN**: Búsqueda rápida de recetas sin ingredientes detallados (para autocomplete)
  async searchRecipesQuick(searchTerm: string, limit = 10): Promise<Recipe[]> {
    const cacheKey = `recipes:quick_search:${searchTerm}:${limit}`;

    return await cacheService.memoize(
      cacheKey,
      async () => {
        const result = await this.getAllRecipes({
          search: searchTerm,
          limit,
          detailedResults: false, // Sin ingredientes detallados para mayor velocidad
          sortBy: 'created_desc'
        });

        return result.recipes;
      },
      CACHE_TTL.SHORT // 5 minutos para búsquedas rápidas
    );
  }

  // Crear nueva receta
  async createRecipe(recipeData: CreateRecipeDto): Promise<Recipe> {
    const response = await apiService.post<{ recipe: Recipe }>('/recipes', recipeData);

    if (response.status !== 'success' || !response.data) {
      throw new Error(response.message || 'Error creating recipe');
    }

    // **OPTIMIZACIÓN**: Invalidar caché relacionado
    cacheService.invalidatePattern('recipes:');

    return response.data.recipe;
  }

  // Actualizar receta
  async updateRecipe(id: string, recipeData: UpdateRecipeDto): Promise<Recipe> {
    const response = await apiService.put<{ recipe: Recipe }>(`/recipes/${id}`, recipeData);

    if (response.status !== 'success' || !response.data) {
      throw new Error(response.message || 'Error updating recipe');
    }

    // **OPTIMIZACIÓN**: Invalidar caché específico y relacionado
    cacheService.delete(CACHE_KEYS.RECIPE_BY_ID(id));
    cacheService.invalidatePattern('recipes:');

    return response.data.recipe;
  }

  // Eliminar receta
  async deleteRecipe(id: string): Promise<void> {
    const response = await apiService.delete(`/recipes/${id}`);

    if (response.status !== 'success') {
      throw new Error(response.message || 'Error deleting recipe');
    }

    // **OPTIMIZACIÓN**: Invalidar caché
    cacheService.delete(CACHE_KEYS.RECIPE_BY_ID(id));
    cacheService.invalidatePattern('recipes:');
  }

  // **OPTIMIZACIÓN**: Obtener recetas por etiquetas (comidas específicas)
  async getRecipesByMealType(mealType: string): Promise<Recipe[]> {
    const cacheKey = CACHE_KEYS.RECIPES_BY_TAG(mealType);

    return await cacheService.memoize(
      cacheKey,
      async () => {
        const result = await this.getAllRecipes({
          mealType,
          limit: 50,
          detailedResults: false,
          sortBy: 'created_desc'
        });

        return result.recipes;
      },
      CACHE_TTL.LONG // 1 hora para recetas por tipo de comida
    );
  }

  // **OPTIMIZACIÓN**: Helper para generar claves de caché consistentes
  private generateCacheKey(prefix: string, params: Record<string, any>): string {
    const sortedParams = Object.keys(params)
      .sort()
      .reduce((result, key) => {
        if (params[key] !== undefined && params[key] !== null) {
          result[key] = params[key];
        }
        return result;
      }, {} as Record<string, any>);

    const paramString = JSON.stringify(sortedParams);
    return `${prefix}:${btoa(paramString)}`;
  }

  // **OPTIMIZACIÓN**: Precargar recetas populares
  async preloadPopularRecipes(): Promise<void> {
    try {
      await Promise.all([
        this.getRecipesByMealType('breakfast'),
        this.getRecipesByMealType('lunch'),
        this.getRecipesByMealType('dinner'),
        this.getAllRecipes({ limit: 20, sortBy: 'created_desc', detailedResults: false })
      ]);
      console.log('⚡ Recetas populares precargadas en caché');
    } catch (error) {
      console.warn('⚠️ Error precargando recetas:', error);
    }
  }
  // **NUEVO**: Analizar receta (Edamam + OMS)
  async analyzeRecipe(ingredients: { name: string; quantity_g: number }[]): Promise<any> {
    const response = await apiService.post<{
      status: string;
      data: {
        totals: any;
        who_compliance: any;
        ingredients_analysis: any[];
      };
    }>('/recipes/analyze', { ingredients });

    if (response.status !== 'success' || !response.data) {
      throw new Error(response.message || 'Error analyzing recipe');
    }

    return response.data;
  }
}

export const recipeService = new RecipeService(); 