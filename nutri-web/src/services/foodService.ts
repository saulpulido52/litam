// nutri-web/src/services/foodService.ts
import { apiService } from './api';

export interface Food {
  id: string;
  name: string;
  calories: number;
  protein: number;
  carbohydrates: number;
  fats: number;
  fiber: number;
  unit: string;
  serving_size: number;
  category?: string;
  is_custom?: boolean;
}

export interface FoodSearchParams {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
}

export interface FoodSearchResponse {
  foods: Food[];
  pagination?: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export const foodService = {
  // Obtener todos los alimentos
  async getAllFoods(params: FoodSearchParams = {}): Promise<Food[]> {
    try {
      console.log('🍎 Buscando alimentos con parámetros:', params);
      
      const queryParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          queryParams.append(key, value.toString());
        }
      });

      const response = await apiService.get(`/foods?${queryParams.toString()}`);
      
      // Acceso robusto a los datos
      const responseData = response.data as any;
      let foods: Food[] = [];
      
      if (responseData.data?.foods) {
        foods = responseData.data.foods;
      } else if (responseData.foods) {
        foods = responseData.foods;
      } else if (Array.isArray(responseData.data)) {
        foods = responseData.data;
      } else if (Array.isArray(responseData)) {
        foods = responseData;
      }
      
      console.log(`✅ Encontrados ${foods.length} alimentos`);
      return foods;
    } catch (error: any) {
      console.error('❌ Error al obtener alimentos:', error);
      throw new Error(error.response?.data?.message || 'Error al obtener alimentos');
    }
  },

  // Crear nuevo alimento
  async createFood(foodData: Omit<Food, 'id'>): Promise<Food> {
    try {
      console.log('🍎 Creando nuevo alimento:', foodData.name);
      const response = await apiService.post('/foods', foodData);
      console.log('✅ Alimento creado exitosamente:', (response.data as any).data.food.id);
      return (response.data as any).data.food;
    } catch (error: any) {
      console.error('❌ Error al crear alimento:', error);
      throw new Error(error.response?.data?.message || 'Error al crear el alimento');
    }
  },

  // Obtener alimento por ID
  async getFoodById(id: string): Promise<Food> {
    try {
      const response = await apiService.get(`/foods/${id}`);
      return (response.data as any).data.food;
    } catch (error: any) {
      console.error('❌ Error al obtener alimento:', error);
      throw new Error(error.response?.data?.message || 'Error al obtener el alimento');
    }
  },

  // Actualizar alimento
  async updateFood(id: string, foodData: Partial<Food>): Promise<Food> {
    try {
      const response = await apiService.put(`/foods/${id}`, foodData);
      return (response.data as any).data.food;
    } catch (error: any) {
      console.error('❌ Error al actualizar alimento:', error);
      throw new Error(error.response?.data?.message || 'Error al actualizar el alimento');
    }
  },

  // Eliminar alimento
  async deleteFood(id: string): Promise<void> {
    try {
      await apiService.delete(`/foods/${id}`);
      console.log('✅ Alimento eliminado exitosamente');
    } catch (error: any) {
      console.error('❌ Error al eliminar alimento:', error);
      throw new Error(error.response?.data?.message || 'Error al eliminar el alimento');
    }
  },

  // Buscar alimentos por categoría
  async getFoodsByCategory(category: string): Promise<Food[]> {
    try {
      return this.getAllFoods({ category });
    } catch (error: any) {
      console.error('❌ Error al obtener alimentos por categoría:', error);
      throw new Error(error.response?.data?.message || 'Error al obtener alimentos por categoría');
    }
  },

  // Buscar alimentos con texto
  async searchFoods(searchTerm: string): Promise<Food[]> {
    try {
      return this.getAllFoods({ search: searchTerm });
    } catch (error: any) {
      console.error('❌ Error al buscar alimentos:', error);
      throw new Error(error.response?.data?.message || 'Error al buscar alimentos');
    }
  }
}; 