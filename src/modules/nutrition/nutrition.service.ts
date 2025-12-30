import { Repository } from 'typeorm';
import axios from 'axios';
import { AppDataSource } from '../../database/data-source';
import { Food } from '../../database/entities/food.entity';
import { AppError } from '../../utils/app.error';

// Interfaces para Edamam
interface EdamamResponse {
    hints: EdamamHint[];
    parsed: EdamamParsed[];
}

interface EdamamHint {
    food: {
        foodId: string;
        label: string;
        nutrients: {
            ENERC_KCAL?: number;
            PROCNT?: number;
            FAT?: number;
            CHOCDF?: number;
            FIBTG?: number;
            SUGAR?: number;
            NA?: number; // Sodio en mg
        };
        category?: string;
        image?: string;
    };
    measures: any[];
}

interface EdamamParsed {
    food: any; // Similar structure
}

export class NutritionService {
    private foodRepository: Repository<Food>;
    private readonly appId: string;
    private readonly appKey: string;
    private readonly baseUrl: string;

    constructor() {
        this.foodRepository = AppDataSource.getRepository(Food);
        // Usar variables de entorno o valores por defecto para desarrollo
        this.appId = process.env.EDAMAM_APP_ID || '';
        this.appKey = process.env.EDAMAM_APP_KEY || '';
        this.baseUrl = 'https://api.edamam.com/api/food-database/v2/parser';
    }

    /**
     * Busca los detalles de un alimento/ingrediente.
     * 1. Busca en la DB local (cache).
     * 2. Si no existe, consulta a Edamam API.
     * 3. Guarda en DB y devuelve.
     */
    async fetchRecipeDetails(query: string, userId: string = 'SYSTEM'): Promise<Food> {
        // 1. Buscar en DB local por nombre (simple cache search)
        // Nota: En producción, idealmente buscaríamos por external_api_id si lo tuviéramos,
        // pero aquí estamos resolviendo por nombre de ingrediente.
        const existingFood = await this.foodRepository.findOne({
            where: { name: query, api_source: 'EDAMAM' }
        });

        if (existingFood) {
            return existingFood;
        }

        // 2. Consultar API Externa
        if (!this.appId || !this.appKey) {
            console.warn('Edamam Credentials missing. Skipping API call.');
            // Retornar un placeholder o error según se prefiera.
            // Por ahora lanzamos error para evidenciar falta de config
            throw new Error('Servicio de nutrición no configurado (Faltan credenciales Edamam).');
        }

        try {
            const response = await axios.get<EdamamResponse>(this.baseUrl, {
                params: {
                    app_id: this.appId,
                    app_key: this.appKey,
                    ingr: query,
                    nutrition_type: 'logging'
                }
            });

            if (!response.data || (response.data.parsed.length === 0 && response.data.hints.length === 0)) {
                // No encontrado en API
                throw new AppError(`No se encontró información nutricional para: ${query}`, 404);
            }

            // Tomar el mejor match (parsed > first hint)
            const bestMatch = response.data.parsed.length > 0
                ? response.data.parsed[0]
                : response.data.hints[0];

            // 3. Mapear y Guardar
            const foodModel = this.mapApiToFoodModel(bestMatch, userId);

            // Verificar si ya existe por external_id para evitar duplicados en race-condition
            if (foodModel.external_api_id) {
                const duplicateCheck = await this.foodRepository.findOne({
                    where: { external_api_id: foodModel.external_api_id }
                });
                if (duplicateCheck) return duplicateCheck;
            }

            const savedFood = await this.foodRepository.save(foodModel);
            return savedFood;

        } catch (error: any) {
            console.error('Error fetching from Edamam:', error);
            if (error instanceof AppError) throw error;
            throw new AppError('Error al conectar con servicio de nutrición externo.', 502);
        }
    }

    /**
     * Convierte la respuesta de la API de Edamam al modelo de nuestra base de datos.
     */
    private mapApiToFoodModel(apiResult: any, userId: string): Partial<Food> {
        const foodData = apiResult.food;
        const nutrients = foodData.nutrients || {};

        return {
            name: foodData.label || 'Alimento desconocido',
            description: `Importado de Edamam (${foodData.category || 'General'})`,

            // Macros
            calories: nutrients.ENERC_KCAL || 0,
            protein: nutrients.PROCNT || 0,
            fats: nutrients.FAT || 0,
            carbohydrates: nutrients.CHOCDF || 0,
            fiber: nutrients.FIBTG || 0,
            sugar: nutrients.SUGAR || 0,

            // Nuevos Campos
            sodium: nutrients.NA || 0, // mg
            external_api_id: foodData.foodId,
            api_source: 'EDAMAM',
            who_compliance_flag: 'UNKNOWN', // Se calculará después

            // Metadatos
            unit: 'g',
            serving_size: 100, // Edamam reporta por 100g usualmente en Food DB
            is_custom: false,
            // created_by_user: { id: userId } as any, // Necesitamos asignar la relación correctamente
            // Asumiendo que podemos pasar el ID en la creación o el objeto User.
            // Para simplificar, TypeORM a veces requiere el objeto completo. 
            // Si userId es string, TypeORM puede quejarse si la propiedad es User type.
            // Dejaremos esto para que el repositorio lo maneje o adaptar según entity.

            raw_nutrition_data: apiResult // Cache completo
        };
    }
}

export default new NutritionService();
