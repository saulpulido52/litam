import { Repository } from 'typeorm';
import { AppDataSource } from '../../database/data-source';
import { Food } from '../../database/entities/food.entity';
import { User } from '../../database/entities/user.entity';
import { CreateFoodDto, UpdateFoodDto } from '../../modules/foods/food.dto';
import { AppError } from '../../utils/app.error';
import { RoleName } from '../../database/entities/role.entity';

class FoodService {
    private foodRepository: Repository<Food>;
    private userRepository: Repository<User>;

    constructor() {
        this.foodRepository = AppDataSource.getRepository(Food);
        this.userRepository = AppDataSource.getRepository(User);
    }

    public async createFood(foodDto: CreateFoodDto, createdById: string) {
        const creator = await this.userRepository.findOne({ where: { id: createdById } });
        if (!creator) {
            throw new AppError('Usuario creador no encontrado.', 404);
        }
        if (creator.role.name !== RoleName.NUTRITIONIST && creator.role.name !== RoleName.ADMIN) {
            throw new AppError('Solo nutriólogos o administradores pueden crear alimentos.', 403);
        }

        const newFood = this.foodRepository.create({
            name: foodDto.name,
            description: foodDto.description,
            calories: foodDto.calories,
            protein: foodDto.protein,
            carbohydrates: foodDto.carbohydrates,
            fats: foodDto.fats,
            fiber: foodDto.fiber,
            sugar: foodDto.sugar,
            unit: foodDto.unit,
            serving_size: foodDto.servingSize, // Mapeo explícito
            category: foodDto.category,
            is_custom: true,
            created_by_user: creator,
        });

        await this.foodRepository.save(newFood);
        return newFood;
    }

    public async getAllFoods() {
        const foods = await this.foodRepository.find({ relations: ['created_by_user'] });
        return foods.map(food => {
            if (food.created_by_user) {
                const { password_hash, ...creatorWithoutHash } = food.created_by_user;
                return { ...food, created_by_user: creatorWithoutHash };
            }
            return food;
        });
    }

    public async getFoodById(id: string) {
        const food = await this.foodRepository.findOne({ where: { id }, relations: ['created_by_user'] });
        if (!food) {
            throw new AppError('Alimento no encontrado.', 404);
        }
        if (food.created_by_user) {
            const { password_hash, ...creatorWithoutHash } = food.created_by_user;
            return { ...food, created_by_user: creatorWithoutHash };
        }
        return food;
    }

    public async updateFood(id: string, updateDto: UpdateFoodDto, updaterId: string) {
        const food = await this.foodRepository.findOne({ where: { id }, relations: ['created_by_user'] });
        if (!food) {
            throw new AppError('Alimento no encontrado.', 404);
        }

        const updater = await this.userRepository.findOne({ where: { id: updaterId } });
        if (!updater) {
            throw new AppError('Usuario no encontrado.', 404);
        }

        if (food.is_custom && food.created_by_user && food.created_by_user.id !== updaterId && updater.role.name !== RoleName.ADMIN) {
            throw new AppError('No tienes permiso para actualizar este alimento.', 403);
        }
        if (!food.is_custom && updater.role.name !== RoleName.ADMIN) {
             throw new AppError('No tienes permiso para actualizar este alimento global.', 403);
        }

        // Mapeo explícito de los campos del DTO al alimento
        if (updateDto.name !== undefined) food.name = updateDto.name;
        if (updateDto.description !== undefined) food.description = updateDto.description;
        if (updateDto.calories !== undefined) food.calories = updateDto.calories;
        if (updateDto.protein !== undefined) food.protein = updateDto.protein;
        if (updateDto.carbohydrates !== undefined) food.carbohydrates = updateDto.carbohydrates;
        if (updateDto.fats !== undefined) food.fats = updateDto.fats;
        if (updateDto.fiber !== undefined) food.fiber = updateDto.fiber;
        if (updateDto.sugar !== undefined) food.sugar = updateDto.sugar;
        if (updateDto.unit !== undefined) food.unit = updateDto.unit;
        if (updateDto.servingSize !== undefined) food.serving_size = updateDto.servingSize; // Mapeo explícito
        if (updateDto.category !== undefined) food.category = updateDto.category;

        await this.foodRepository.save(food);
        return food;
    }

    public async deleteFood(id: string, deleterId: string) {
        const food = await this.foodRepository.findOne({ where: { id }, relations: ['created_by_user'] });
        if (!food) {
            throw new AppError('Alimento no encontrado.', 404);
        }

        const deleter = await this.userRepository.findOne({ where: { id: deleterId } });
        if (!deleter) {
            throw new AppError('Usuario no encontrado.', 404);
        }

        if (food.is_custom && food.created_by_user && food.created_by_user.id !== deleterId && deleter.role.name !== RoleName.ADMIN) {
            throw new AppError('No tienes permiso para eliminar este alimento.', 403);
        }
        if (!food.is_custom && deleter.role.name !== RoleName.ADMIN) {
            throw new AppError('No tienes permiso para eliminar este alimento global.', 403);
        }

        await this.foodRepository.remove(food);
        return { message: 'Alimento eliminado con éxito.' };
    }
}

export default new FoodService();