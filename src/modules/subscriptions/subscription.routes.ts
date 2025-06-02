// src/modules/subscriptions/subscription.routes.ts
import { Router } from 'express';
import subscriptionController from '@/modules/subscriptions/subscription.controller';
import { protect, authorize } from '@/middleware/auth.middleware';
import { validateMiddleware } from '@/middleware/validation.middleware';
import {
    CreateSubscriptionPlanDto,
    UpdateSubscriptionPlanDto,
    SubscribeToPlanDto,
    UpdateUserSubscriptionStatusDto,
} from '@/modules/subscriptions/subscription.dto';
import { RoleName } from '@/database/entities/role.entity';

const router = Router();

// --- Rutas de Planes de Suscripción (públicas o para Admin) ---

// Ver todos los planes de suscripción (accesible sin autenticación o para todos los autenticados)
router.get('/plans', subscriptionController.getAllSubscriptionPlans);
// Ver un plan específico por ID (accesible sin autenticación o para todos los autenticados)
router.get('/plans/:id', subscriptionController.getSubscriptionPlanById);

// Rutas solo para Administradores
router.use('/plans', protect, authorize(RoleName.ADMIN)); // Todas las siguientes rutas /plans... son solo para ADMINS
router.post('/', validateMiddleware(CreateSubscriptionPlanDto), subscriptionController.createSubscriptionPlan);
router.patch('/:id', validateMiddleware(UpdateSubscriptionPlanDto), subscriptionController.updateSubscriptionPlan);
router.delete('/:id', subscriptionController.deleteSubscriptionPlan);


// --- Rutas de Suscripciones de Usuario (Protegidas) ---
router.use(protect); // Todas las siguientes rutas son para usuarios autenticados

// Suscribirse a un plan (Solo Pacientes)
router.post(
    '/subscribe',
    authorize(RoleName.PATIENT),
    validateMiddleware(SubscribeToPlanDto),
    subscriptionController.subscribeToPlan
);

// Ver mi suscripción actual (Solo Pacientes)
router.get('/me', authorize(RoleName.PATIENT), subscriptionController.getMySubscription);

// Actualizar el estado de mi suscripción (Solo Pacientes pueden cancelar, Admin pueden cambiar cualquier estado)
router.patch(
    '/:id/status', // ID de la UserSubscription
    authorize(RoleName.PATIENT, RoleName.ADMIN), // Paciente o Admin
    validateMiddleware(UpdateUserSubscriptionStatusDto),
    subscriptionController.updateMySubscriptionStatus
);

// --- Rutas de Webhook de Pagos (Públicas, sin autenticación) ---
// Normalmente, los webhooks tienen una ruta específica y no son parte del /api/subscriptions
// Por seguridad, se deben verificar las firmas del webhook.
router.post('/webhook', subscriptionController.handlePaymentWebhook);


export default router;