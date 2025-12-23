import { apiService } from './api';
import type { 
    WeeklyPlanTemplate, 
    CreateTemplateDto, 
    ApplyTemplateDto, 
    CreateFromWeekDto,
    TemplateFilters,
    TemplatesResponse,
    TemplateResponse,
    TemplateCategory
} from '../types/template';

class TemplateService {
    private baseUrl = '/templates';

    // Obtener todas las plantillas (propias + públicas)
    async getTemplates(filters?: TemplateFilters): Promise<TemplatesResponse> {
        try {
            const params = new URLSearchParams();
            
            if (filters?.category) params.append('category', filters.category);
            if (filters?.search) params.append('search', filters.search);
            if (filters?.tags?.length) params.append('tags', filters.tags.join(','));
            if (filters?.isPublic !== undefined) params.append('isPublic', filters.isPublic.toString());
            if (filters?.page) params.append('page', filters.page.toString());
            if (filters?.limit) params.append('limit', filters.limit.toString());

            const queryString = params.toString();
            const url = queryString ? `${this.baseUrl}?${queryString}` : this.baseUrl;
            
            const response = await apiService.get(url);
            return { ...(response as any), success: true };
        } catch (error) {
            console.error('Error al obtener plantillas:', error);
            throw error;
        }
    }

    // Obtener plantilla por ID
    async getTemplateById(templateId: string): Promise<TemplateResponse> {
        try {
            const response = await apiService.get(`${this.baseUrl}/${templateId}`);
            return { ...(response as any), success: true };
        } catch (error) {
            console.error('Error al obtener plantilla:', error);
            throw error;
        }
    }

    // Crear nueva plantilla
    async createTemplate(templateData: CreateTemplateDto): Promise<TemplateResponse> {
        try {
            const response = await apiService.post(this.baseUrl, templateData);
            return { ...(response as any), success: true };
        } catch (error) {
            console.error('Error al crear plantilla:', error);
            throw error;
        }
    }

    // Actualizar plantilla
    async updateTemplate(templateId: string, templateData: Partial<CreateTemplateDto>): Promise<TemplateResponse> {
        try {
            const response = await apiService.put(`${this.baseUrl}/${templateId}`, templateData);
            return { ...(response as any), success: true };
        } catch (error) {
            console.error('Error al actualizar plantilla:', error);
            throw error;
        }
    }

    // Eliminar plantilla
    async deleteTemplate(templateId: string): Promise<{ success: boolean; message: string }> {
        try {
            const response = await apiService.delete(`${this.baseUrl}/${templateId}`);
            return { ...(response as any), success: true };
        } catch (error) {
            console.error('Error al eliminar plantilla:', error);
            throw error;
        }
    }

    // Aplicar plantilla a un plan de dieta
    async applyTemplate(applyData: ApplyTemplateDto): Promise<{
        success: boolean;
        message: string;
        data: {
            mealsCreated: number;
            meals: any[];
        };
    }> {
        try {
            const response = await apiService.post(`${this.baseUrl}/apply`, applyData);
            return { ...(response as any), success: true };
        } catch (error) {
            console.error('Error al aplicar plantilla:', error);
            throw error;
        }
    }

    // Crear plantilla desde un plan existente
    async createFromWeek(createData: CreateFromWeekDto): Promise<TemplateResponse> {
        try {
            const response = await apiService.post(`${this.baseUrl}/from-week`, createData);
            return { ...(response as any), success: true };
        } catch (error) {
            console.error('Error al crear plantilla desde plan:', error);
            throw error;
        }
    }

    // Calificar plantilla
    async rateTemplate(templateId: string, rating: number): Promise<{
        success: boolean;
        message: string;
        data: {
            templateId: string;
            newRating: number;
            ratingCount: number;
        };
    }> {
        try {
            const response = await apiService.post(`${this.baseUrl}/${templateId}/rate`, { rating });
            return { ...(response as any), success: true };
        } catch (error) {
            console.error('Error al calificar plantilla:', error);
            throw error;
        }
    }

    // Obtener categorías disponibles
    async getCategories(): Promise<{
        success: boolean;
        message: string;
        data: Array<{ value: TemplateCategory; label: string }>;
    }> {
        try {
            const response = await apiService.get(`${this.baseUrl}/categories`);
            return { ...(response as any), success: true };
        } catch (error) {
            console.error('Error al obtener categorías:', error);
            throw error;
        }
    }

    // Obtener plantillas populares (más utilizadas)
    async getPopularTemplates(limit: number = 10): Promise<TemplatesResponse> {
        try {
            return await this.getTemplates({
                limit,
                page: 1
            });
        } catch (error) {
            console.error('Error al obtener plantillas populares:', error);
            throw error;
        }
    }

    // Obtener mis plantillas (solo las creadas por el usuario)
    async getMyTemplates(filters?: Omit<TemplateFilters, 'isPublic'>): Promise<TemplatesResponse> {
        try {
            return await this.getTemplates({
                ...filters,
                isPublic: false
            });
        } catch (error) {
            console.error('Error al obtener mis plantillas:', error);
            throw error;
        }
    }

    // Obtener plantillas públicas
    async getPublicTemplates(filters?: Omit<TemplateFilters, 'isPublic'>): Promise<TemplatesResponse> {
        try {
            return await this.getTemplates({
                ...filters,
                isPublic: true
            });
        } catch (error) {
            console.error('Error al obtener plantillas públicas:', error);
            throw error;
        }
    }

    // Búsqueda de plantillas por texto
    async searchTemplates(searchTerm: string, filters?: Omit<TemplateFilters, 'search'>): Promise<TemplatesResponse> {
        try {
            return await this.getTemplates({
                ...filters,
                search: searchTerm
            });
        } catch (error) {
            console.error('Error al buscar plantillas:', error);
            throw error;
        }
    }

    // Filtrar plantillas por categoría
    async getTemplatesByCategory(category: TemplateCategory, filters?: Omit<TemplateFilters, 'category'>): Promise<TemplatesResponse> {
        try {
            return await this.getTemplates({
                ...filters,
                category
            });
        } catch (error) {
            console.error('Error al obtener plantillas por categoría:', error);
            throw error;
        }
    }

    // Filtrar plantillas por tags
    async getTemplatesByTags(tags: string[], filters?: Omit<TemplateFilters, 'tags'>): Promise<TemplatesResponse> {
        try {
            return await this.getTemplates({
                ...filters,
                tags
            });
        } catch (error) {
            console.error('Error al obtener plantillas por tags:', error);
            throw error;
        }
    }

    // Duplicar plantilla (crear copia)
    async duplicateTemplate(templateId: string, newName: string): Promise<TemplateResponse> {
        try {
            const originalTemplate = await this.getTemplateById(templateId);
            
            const duplicateData: CreateTemplateDto = {
                name: newName,
                description: `Copia de: ${originalTemplate.data.description || originalTemplate.data.name}`,
                category: originalTemplate.data.category,
                tags: [...(originalTemplate.data.tags || []), 'copia'],
                isPublic: false, // Las copias son privadas por defecto
                targetCalories: originalTemplate.data.targetCalories,
                targetMacros: originalTemplate.data.targetMacros,
                notes: originalTemplate.data.notes,
                mealTiming: originalTemplate.data.mealTiming,
                dietaryRestrictions: originalTemplate.data.dietaryRestrictions,
                difficultyLevel: originalTemplate.data.difficultyLevel,
                avgPrepTimeMinutes: originalTemplate.data.avgPrepTimeMinutes,
                estimatedWeeklyCost: originalTemplate.data.estimatedWeeklyCost
            };

            return await this.createTemplate(duplicateData);
        } catch (error) {
            console.error('Error al duplicar plantilla:', error);
            throw error;
        }
    }

    // Validar datos de plantilla antes de enviar
    validateTemplateData(templateData: CreateTemplateDto): { isValid: boolean; errors: string[] } {
        const errors: string[] = [];

        if (!templateData.name?.trim()) {
            errors.push('El nombre de la plantilla es obligatorio');
        }

        if (templateData.name && templateData.name.length > 255) {
            errors.push('El nombre no puede exceder 255 caracteres');
        }

        if (!templateData.category) {
            errors.push('La categoría es obligatoria');
        }

        if (templateData.targetCalories && (templateData.targetCalories < 800 || templateData.targetCalories > 5000)) {
            errors.push('Las calorías objetivo deben estar entre 800 y 5000');
        }

        if (templateData.avgPrepTimeMinutes && templateData.avgPrepTimeMinutes < 0) {
            errors.push('El tiempo de preparación no puede ser negativo');
        }

        if (templateData.estimatedWeeklyCost && templateData.estimatedWeeklyCost < 0) {
            errors.push('El costo estimado no puede ser negativo');
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    }

    // Calcular estadísticas nutricionales de una plantilla
    calculateTemplateNutrition(template: WeeklyPlanTemplate): {
        weeklyTotals: {
            calories: number;
            protein: number;
            carbohydrates: number;
            fats: number;
            fiber: number;
        };
        dailyAverages: {
            calories: number;
            protein: number;
            carbohydrates: number;
            fats: number;
            fiber: number;
        };
        mealBreakdown: {
            [mealType: string]: {
                calories: number;
                protein: number;
                carbohydrates: number;
                fats: number;
            };
        };
    } {
        const weeklyTotals = template.meals.reduce((totals, meal) => {
            totals.calories += meal.totalCalories || 0;
            totals.protein += meal.totalProtein || 0;
            totals.carbohydrates += meal.totalCarbohydrates || 0;
            totals.fats += meal.totalFats || 0;
            totals.fiber += meal.totalFiber || 0;
            return totals;
        }, { calories: 0, protein: 0, carbohydrates: 0, fats: 0, fiber: 0 });

        const dailyAverages = {
            calories: Math.round(weeklyTotals.calories / 7),
            protein: Math.round(weeklyTotals.protein / 7),
            carbohydrates: Math.round(weeklyTotals.carbohydrates / 7),
            fats: Math.round(weeklyTotals.fats / 7),
            fiber: Math.round(weeklyTotals.fiber / 7)
        };

        const mealBreakdown = template.meals.reduce((breakdown, meal) => {
            const mealType = meal.mealType;
            if (!breakdown[mealType]) {
                breakdown[mealType] = { calories: 0, protein: 0, carbohydrates: 0, fats: 0 };
            }
            breakdown[mealType].calories += meal.totalCalories || 0;
            breakdown[mealType].protein += meal.totalProtein || 0;
            breakdown[mealType].carbohydrates += meal.totalCarbohydrates || 0;
            breakdown[mealType].fats += meal.totalFats || 0;
            return breakdown;
        }, {} as any);

        return {
            weeklyTotals,
            dailyAverages,
            mealBreakdown
        };
    }
}

export const templateService = new TemplateService();
export default templateService; 