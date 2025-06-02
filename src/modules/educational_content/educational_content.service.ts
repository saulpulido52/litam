// src/modules/educational_content/educational_content.service.ts
import { Repository } from 'typeorm';
import { AppDataSource } from '@/database/data-source';
import { User } from '@/database/entities/user.entity';
import { EducationalContent, ContentType } from '@/database/entities/educational_content.entity';
import { Recipe, RecipeIngredient } from '@/database/entities/recipe.entity';
import { Food } from '@/database/entities/food.entity';
import {
    CreateUpdateEducationalContentDto,
    CreateUpdateRecipeDto,
    RecipeIngredientDto,
} from '@/modules/educational_content/educational_content.dto';
import { AppError } from '@/utils/app.error';
import { RoleName } from '@/database/entities/role.entity';

class EducationalContentService {
    private userRepository: Repository<User>;
    private educationalContentRepository: Repository<EducationalContent>;
    private recipeRepository: Repository<Recipe>;
    private recipeIngredientRepository: Repository<RecipeIngredient>;
    private foodRepository: Repository<Food>;

    constructor() {
        this.userRepository = AppDataSource.getRepository(User);
        this.educationalContentRepository = AppDataSource.getRepository(EducationalContent);
        this.recipeRepository = AppDataSource.getRepository(Recipe);
        this.recipeIngredientRepository = AppDataSource.getRepository(RecipeIngredient);
        this.foodRepository = AppDataSource.getRepository(Food);
    }

    // --- Gestión de Contenido Educativo (Artículos, Guías, Videos) ---

    public async createEducationalContent(contentDto: CreateUpdateEducationalContentDto, createdById: string) {
        const creator = await this.userRepository.findOne({
            where: { id: createdById },
            relations: ['role'], // Necesario para verificar si es nutriólogo o admin
        });
        if (!creator || (creator.role.name !== RoleName.NUTRITIONIST && creator.role.name !== RoleName.ADMIN)) {
            throw new AppError('Acceso denegado. Solo nutriólogos o administradores pueden crear contenido educativo.', 403);
        }

        const newContent = this.educationalContentRepository.create({
            title: contentDto.title,
            summary: contentDto.summary,
            content_body: contentDto.contentBody,
            type: contentDto.type,
            tags: contentDto.tags,
            cover_image_url: contentDto.coverImageUrl,
            is_published: contentDto.isPublished !== undefined ? contentDto.isPublished : false,
            published_at: contentDto.isPublished ? new Date() : null, // Publicado si isPublished es true
            created_by: creator,
        });

        await this.educationalContentRepository.save(newContent);
        return newContent;
    }

    public async getAllEducationalContent(isPublished?: boolean, type?: ContentType, tags?: string[]) {
        const whereClause: any = {};
        if (isPublished !== undefined) whereClause.is_published = isPublished;
        if (type !== undefined) whereClause.type = type;
        if (tags && tags.length > 0) {
            // Consulta para arrays de texto. Podría ser un filtro más complejo si hay muchos tags
            whereClause.tags = tags; // Esto buscará una coincidencia exacta de array
            // Para buscar si el array contiene AL MENOS uno de los tags, se necesita query builder
            // .andWhere('content.tags && :tags', { tags })
        }

        const content = await this.educationalContentRepository.find({
            where: whereClause,
            relations: ['created_by'],
            order: { created_at: 'DESC' },
        });

        return content.map(item => {
            const { password_hash, ...creatorWithoutHash } = item.created_by;
            return { ...item, created_by: creatorWithoutHash };
        });
    }

    public async getEducationalContentById(contentId: string) {
        const content = await this.educationalContentRepository.findOne({
            where: { id: contentId },
            relations: ['created_by'],
        });
        if (!content) {
            throw new AppError('Contenido educativo no encontrado.', 404);
        }
        const { password_hash, ...creatorWithoutHash } = content.created_by;
        return { ...content, created_by: creatorWithoutHash };
    }

    public async updateEducationalContent(contentId: string, updateDto: CreateUpdateEducationalContentDto, updaterId: string) {
        const updater = await this.userRepository.findOne({
            where: { id: updaterId },
            relations: ['role'],
        });
        if (!updater || (updater.role.name !== RoleName.NUTRITIONIST && updater.role.name !== RoleName.ADMIN)) {
            throw new AppError('Acceso denegado. Solo nutriólogos o administradores pueden actualizar contenido educativo.', 403);
        }

        const content = await this.educationalContentRepository.findOneBy({ id: contentId });
        if (!content) {
            throw new AppError('Contenido educativo no encontrado.', 404);
        }

        Object.assign(content, updateDto);
        content.last_modified_by = updater;
        content.published_at = content.is_published && !content.published_at ? new Date() : content.published_at;

        await this.educationalContentRepository.save(content);
        return content;
    }

    public async deleteEducationalContent(contentId: string, deleterId: string) {
        const deleter = await this.userRepository.findOne({
            where: { id: deleterId },
            relations: ['role'],
        });
        if (!deleter || (deleter.role.name !== RoleName.NUTRITIONIST && deleter.role.name !== RoleName.ADMIN)) {
            throw new AppError('Acceso denegado. Solo nutriólogos o administradores pueden eliminar contenido educativo.', 403);
        }

        const content = await this.educationalContentRepository.findOneBy({ id: contentId });
        if (!content) {
            throw new AppError('Contenido educativo no encontrado.', 404);
        }

        await this.educationalContentRepository.remove(content);
        return { message: 'Contenido educativo eliminado con éxito.' };
    }

    // --- Gestión de Recetas ---

    public async createRecipe(recipeDto: CreateUpdateRecipeDto, createdById: string) {
        const creator = await this.userRepository.findOne({
            where: { id: createdById },
            relations: ['role'],
        });
        if (!creator || (creator.role.name !== RoleName.NUTRITIONIST && creator.role.name !== RoleName.ADMIN)) {
            throw new AppError('Acceso denegado. Solo nutriólogos o administradores pueden crear recetas.', 403);
        }

        const newRecipe = this.recipeRepository.create({
            title: recipeDto.title,
            description: recipeDto.description,
            instructions: recipeDto.instructions,
            tags: recipeDto.tags,
            image_url: recipeDto.imageUrl,
            prep_time_minutes: recipeDto.prepTimeMinutes,
            cook_time_minutes: recipeDto.cookTimeMinutes,
            servings: recipeDto.servings,
            total_calories: recipeDto.totalCalories,
            total_macros: recipeDto.totalMacros,
            is_published: recipeDto.isPublished !== undefined ? recipeDto.isPublished : false,
            created_by: creator,
        });

        if (recipeDto.ingredients && recipeDto.ingredients.length > 0) {
            newRecipe.ingredients = await Promise.all(recipeDto.ingredients.map(async ingredientDto => {
                let food: Food | null = null;
                if (ingredientDto.foodId) {
                    food = await this.foodRepository.findOneBy({ id: ingredientDto.foodId });
                    if (!food) {
                        throw new AppError(`Alimento (foodId) con ID ${ingredientDto.foodId} no encontrado para el ingrediente.`, 404);
                    }
                }
                return this.recipeIngredientRepository.create({
                    food: food,
                    ingredient_name: ingredientDto.ingredientName,
                    quantity: ingredientDto.quantity,
                    unit: ingredientDto.unit,
                    recipe: newRecipe,
                });
            }));
        }

        await this.recipeRepository.save(newRecipe);
        return newRecipe;
    }

    public async getAllRecipes(isPublished?: boolean, tags?: string[], keyword?: string) {
        const whereClause: any = {};
        if (isPublished !== undefined) whereClause.is_published = isPublished;
        if (tags && tags.length > 0) whereClause.tags = tags;

        const queryBuilder = this.recipeRepository.createQueryBuilder('recipe')
            .leftJoinAndSelect('recipe.created_by', 'createdBy')
            .leftJoinAndSelect('recipe.ingredients', 'ingredients')
            .leftJoinAndSelect('ingredients.food', 'food') // Cargar detalles de Food para ingredientes
            .orderBy('recipe.created_at', 'DESC');

        if (keyword) {
            queryBuilder.andWhere(
                '(LOWER(recipe.title) LIKE LOWER(:keyword) OR LOWER(recipe.description) LIKE LOWER(:keyword) OR LOWER(recipe.instructions) LIKE LOWER(:keyword))',
                { keyword: `%${keyword}%` }
            );
        }

        const recipes = await queryBuilder.getMany();

        return recipes.map(recipe => {
            const { password_hash, ...creatorWithoutHash } = recipe.created_by;
            return { ...recipe, created_by: creatorWithoutHash };
        });
    }

    public async getRecipeById(recipeId: string) {
        const recipe = await this.recipeRepository.findOne({
            where: { id: recipeId },
            relations: ['created_by', 'ingredients', 'ingredients.food'],
        });
        if (!recipe) {
            throw new AppError('Receta no encontrada.', 404);
        }
        const { password_hash, ...creatorWithoutHash } = recipe.created_by;
        return { ...recipe, created_by: creatorWithoutHash };
    }

    public async updateRecipe(recipeId: string, updateDto: CreateUpdateRecipeDto, updaterId: string) {
        const updater = await this.userRepository.findOne({
            where: { id: updaterId },
            relations: ['role'],
        });
        if (!updater || (updater.role.name !== RoleName.NUTRITIONIST && updater.role.name !== RoleName.ADMIN)) {
            throw new AppError('Acceso denegado. Solo nutriólogos o administradores pueden actualizar recetas.', 403);
        }

        const recipe = await this.recipeRepository.findOneBy({ id: recipeId });
        if (!recipe) {
            throw new AppError('Receta no encontrada.', 404);
        }

        // Mapeo manual de campos permitidos en la actualización
        if (updateDto.title !== undefined) recipe.title = updateDto.title;
        if (updateDto.description !== undefined) recipe.description = updateDto.description;
        // if (updateDto.instructions !== undefined) recipe.instructions = updateDto.instructions; // Si se actualizan instrucciones completas
        // if (updateDto.ingredients !== undefined) { /* Lógica compleja de actualización de ingredientes */ }
        if (updateDto.tags !== undefined) recipe.tags = updateDto.tags;
        if (updateDto.imageUrl !== undefined) recipe.image_url = updateDto.imageUrl;
        if (updateDto.isPublished !== undefined) recipe.is_published = updateDto.isPublished;

        recipe.last_modified_by = updater;
        await this.recipeRepository.save(recipe);
        return recipe;
    }

    public async deleteRecipe(recipeId: string, deleterId: string) {
        const deleter = await this.userRepository.findOne({
            where: { id: deleterId },
            relations: ['role'],
        });
        if (!deleter || (deleter.role.name !== RoleName.NUTRITIONIST && deleter.role.name !== RoleName.ADMIN)) {
            throw new AppError('Acceso denegado. Solo nutriólogos o administradores pueden eliminar recetas.', 403);
        }

        const recipe = await this.recipeRepository.findOneBy({ id: recipeId });
        if (!recipe) {
            throw new AppError('Receta no encontrada.', 404);
        }

        await this.recipeRepository.remove(recipe);
        return { message: 'Receta eliminada con éxito.' };
    }
}

export default new EducationalContentService();