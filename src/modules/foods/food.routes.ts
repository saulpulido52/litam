// src/modules/foods/food.routes.ts
import { Router } from 'express';
import foodController from '@/modules/foods/food.controller';
import { protect, authorize } from '@/middleware/auth.middleware';
import { validateMiddleware } from '@/middleware/validation.middleware';
import { CreateFoodDto, UpdateFoodDto } from '@/modules/foods/food.dto';
import { RoleName } from '@/database/entities/role.entity';

const router = Router();

// Rutas accesibles por todos (o al menos logueados) para ver alimentos
router.get('/', foodController.getAllFoods);
router.get('/:id', foodController.getFoodById);

// Rutas protegidas que requieren roles específicos
router.use(protect); // Todas las rutas debajo de aquí requieren autenticación

// Solo nutriólogos y administradores pueden crear, actualizar o eliminar alimentos
router.post(
    '/',
    authorize(RoleName.NUTRITIONIST, RoleName.ADMIN),
    validateMiddleware(CreateFoodDto),
    foodController.createFood
);

router.patch(
    '/:id',
    authorize(RoleName.NUTRITIONIST, RoleName.ADMIN),
    validateMiddleware(UpdateFoodDto),
    foodController.updateFood
);

router.delete(
    '/:id',
    authorize(RoleName.NUTRITIONIST, RoleName.ADMIN),
    foodController.deleteFood
);

export default router;