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
    AdminCreateUserDto,
    AdminCreateAppointmentDto,
    AdminCreateFoodDto,
    AdminCreateRecipeDto,
    AdminCreateEducationalContentDto,
} from '../../modules/admin/admin.dto';
import { RoleName } from '../../database/entities/role.entity';

const router = Router();

// Todas las rutas del panel de administración deben estar protegidas y ser solo para el rol ADMIN
router.use(protect, authorize(RoleName.ADMIN));

// --- Gestión de Usuarios ---
router.route('/users')
    .get(adminController.getAllUsers) // Filtrado por query params
    .post(validateMiddleware(AdminCreateUserDto), adminController.adminCreateUser); // Crear usuario
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

// --- HERRAMIENTAS DE INTEGRIDAD DE DATOS ---
router.get('/system/health', adminController.getSystemHealth);
router.get('/system/integrity/diagnosis', adminController.diagnosisDataIntegrity);
router.post('/system/integrity/repair', adminController.repairDataIntegrity);

// --- AUDITORÍA DE ELIMINACIONES ---
router.get('/eliminaciones', adminController.getEliminaciones);
router.get('/eliminaciones/export', adminController.exportEliminaciones);

// --- GESTIÓN COMPLETA DE CITAS ---
router.route('/appointments')
    .get(adminController.getAllAppointments)
    .post(validateMiddleware(AdminCreateAppointmentDto), adminController.adminCreateAppointment);
router.route('/appointments/:id')
    .patch(adminController.adminUpdateAppointment)
    .delete(adminController.adminDeleteAppointment);

// --- GESTIÓN DE EXPEDIENTES CLÍNICOS ---
router.route('/clinical-records')
    .get(adminController.getAllClinicalRecords);
router.route('/clinical-records/:id')
    .delete(adminController.adminDeleteClinicalRecord);

// --- GESTIÓN DE ALIMENTOS ---
router.route('/foods')
    .get(adminController.getAllFoods)
    .post(validateMiddleware(AdminCreateFoodDto), adminController.adminCreateFood);
router.route('/foods/:id')
    .patch(adminController.adminUpdateFood)
    .delete(adminController.adminDeleteFood);

// --- GESTIÓN DE RECETAS ---
router.route('/recipes')
    .get(adminController.getAllRecipes)
    .post(validateMiddleware(AdminCreateRecipeDto), adminController.adminCreateRecipe);
router.route('/recipes/:id')
    .delete(adminController.adminDeleteRecipe);

// --- GESTIÓN DE CONTENIDO EDUCATIVO ---
router.route('/educational-content')
    .get(adminController.getAllEducationalContent)
    .post(validateMiddleware(AdminCreateEducationalContentDto), adminController.adminCreateEducationalContent);
router.route('/educational-content/:id')
    .delete(adminController.adminDeleteEducationalContent);

// --- GESTIÓN DE TRANSACCIONES ---
router.route('/transactions')
    .get(adminController.getAllPaymentTransactions);

// --- GESTIÓN DE RESEÑAS ---
router.route('/reviews')
    .get(adminController.getAllReviews);
router.route('/reviews/:id')
    .delete(adminController.adminDeleteReview);

// --- GESTIÓN DE PLANTILLAS ---
router.route('/templates')
    .get(adminController.getAllTemplates);
router.route('/templates/:id')
    .delete(adminController.adminDeleteTemplate);

// --- GESTIÓN DE CONVERSACIONES Y MENSAJES ---
router.route('/conversations')
    .get(adminController.getAllConversations);
router.route('/messages')
    .get(adminController.getAllMessages);

// --- MÉTRICAS AVANZADAS DEL SISTEMA ---
router.get('/metrics/advanced', adminController.getAdvancedSystemMetrics);

export default router;