// src/modules/admin/admin.routes.ts
import { Router } from 'express';
import adminController from '../../modules/admin/admin.controller';
import { protect, authorize } from '../../middleware/auth.middleware';
import { validateMiddleware } from '../../middleware/validation.middleware';
import {
    AdminUpdateUserDto,
    AdminVerifyNutritionistDto,
    AdminUpdateUserSubscriptionDto,
    AdminUpdateSettingsDto,
} from '../../modules/admin/admin.dto';
import { RoleName } from '../../database/entities/role.entity';

const router = Router();

// Todas las rutas del panel de administración deben estar protegidas y ser solo para el rol ADMIN
router.use(protect, authorize(RoleName.ADMIN));

// --- Gestión de Usuarios ---
router.route('/users')
    .get(adminController.getAllUsers); // Filtrado por query params
router.route('/users/:id')
    .get(adminController.getUserById)
    .patch(validateMiddleware(AdminUpdateUserDto), adminController.adminUpdateUser)
    .delete(adminController.adminDeleteUser);

// Verificar nutriólogo (acción específica)
router.patch(
    '/users/:id/verify-nutritionist',
    validateMiddleware(AdminVerifyNutritionistDto),
    adminController.adminVerifyNutritionist
);

// --- Gestión de Suscripciones de Usuario (por Admin) ---
router.route('/subscriptions')
    .get(adminController.getAllUserSubscriptions); // Filtrado por query params
router.route('/subscriptions/:id')
    .patch(validateMiddleware(AdminUpdateUserSubscriptionDto), adminController.adminUpdateUserSubscription)
    .delete(adminController.adminDeleteUserSubscription);

// --- Gestión de Configuraciones (Placeholder) ---
router.patch('/settings', validateMiddleware(AdminUpdateSettingsDto), adminController.updateGeneralSettings);


export default router;