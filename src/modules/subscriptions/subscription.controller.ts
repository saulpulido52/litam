// src/modules/subscriptions/subscription.controller.ts
import { Request, Response, NextFunction } from 'express';
import subscriptionService from '@/modules/subscriptions/subscription.service';
import { AppError } from '@/utils/app.error';
import {
    CreateSubscriptionPlanDto,
    UpdateSubscriptionPlanDto,
    SubscribeToPlanDto,
    UpdateUserSubscriptionStatusDto,
} from '@/modules/subscriptions/subscription.dto';
import { RoleName } from '@/database/entities/role.entity';
import { SubscriptionStatus } from '@/database/entities/user_subscription.entity';

class SubscriptionController {
    // --- Rutas de Gestión de Planes de Suscripción (Solo Administradores) ---
    public async createSubscriptionPlan(req: Request, res: Response, next: NextFunction) {
        try {
            if (!req.user || req.user.role.name !== RoleName.ADMIN) {
                return next(new AppError('Acceso denegado. Solo administradores pueden crear planes de suscripción.', 403));
            }
            const plan = await subscriptionService.createSubscriptionPlan(req.body as CreateSubscriptionPlanDto, req.user.id);
            res.status(201).json({
                status: 'success',
                data: { plan },
            });
        } catch (error: any) {
            console.error('Error en SubscriptionController.createSubscriptionPlan:', error);
            if (error instanceof AppError) {
                return next(error);
            }
            next(new AppError('Error al crear el plan de suscripción.', 500));
        }
    }

    public async getAllSubscriptionPlans(req: Request, res: Response, next: NextFunction) {
        try {
            const isActive = req.query.isActive === 'true' ? true : req.query.isActive === 'false' ? false : undefined;
            const plans = await subscriptionService.getAllSubscriptionPlans(isActive);
            res.status(200).json({
                status: 'success',
                results: plans.length,
                data: { plans },
            });
        } catch (error: any) {
            console.error('Error en SubscriptionController.getAllSubscriptionPlans:', error);
            if (error instanceof AppError) {
                return next(error);
            }
            next(new AppError('Error al obtener los planes de suscripción.', 500));
        }
    }

    public async getSubscriptionPlanById(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;
            const plan = await subscriptionService.getSubscriptionPlanById(id);
            res.status(200).json({
                status: 'success',
                data: { plan },
            });
        } catch (error: any) {
            console.error('Error en SubscriptionController.getSubscriptionPlanById:', error);
            if (error instanceof AppError) {
                return next(error);
            }
            next(new AppError('Error al obtener el plan de suscripción.', 500));
        }
    }

    public async updateSubscriptionPlan(req: Request, res: Response, next: NextFunction) {
        try {
            if (!req.user || req.user.role.name !== RoleName.ADMIN) {
                return next(new AppError('Acceso denegado. Solo administradores pueden actualizar planes de suscripción.', 403));
            }
            const { id } = req.params;
            const updatedPlan = await subscriptionService.updateSubscriptionPlan(id, req.body as UpdateSubscriptionPlanDto, req.user.id);
            res.status(200).json({
                status: 'success',
                message: 'Plan de suscripción actualizado exitosamente.',
                data: { plan: updatedPlan },
            });
        } catch (error: any) {
            console.error('Error en SubscriptionController.updateSubscriptionPlan:', error);
            if (error instanceof AppError) {
                return next(error);
            }
            next(new AppError('Error al actualizar el plan de suscripción.', 500));
        }
    }

    public async deleteSubscriptionPlan(req: Request, res: Response, next: NextFunction) {
        try {
            if (!req.user || req.user.role.name !== RoleName.ADMIN) {
                return next(new AppError('Acceso denegado. Solo administradores pueden eliminar planes de suscripción.', 403));
            }
            const { id } = req.params;
            await subscriptionService.deleteSubscriptionPlan(id, req.user.id);
            res.status(204).json({
                status: 'success',
                data: null,
            });
        } catch (error: any) {
            console.error('Error en SubscriptionController.deleteSubscriptionPlan:', error);
            if (error instanceof AppError) {
                return next(error);
            }
            next(new AppError('Error al eliminar el plan de suscripción.', 500));
        }
    }

    // --- Rutas de Gestión de Suscripciones de Usuario (Pacientes) ---

    public async subscribeToPlan(req: Request, res: Response, next: NextFunction) {
        try {
            if (!req.user || req.user.role.name !== RoleName.PATIENT) {
                return next(new AppError('Acceso denegado. Solo los pacientes pueden suscribirse a planes.', 403));
            }
            const userSubscription = await subscriptionService.subscribeToPlan(req.user.id, req.body as SubscribeToPlanDto);
            res.status(201).json({
                status: 'success',
                message: 'Suscripción realizada exitosamente.',
                data: { userSubscription },
            });
        } catch (error: any) {
            console.error('Error en SubscriptionController.subscribeToPlan:', error);
            if (error instanceof AppError) {
                return next(error);
            }
            next(new AppError('Error al procesar la suscripción.', 500));
        }
    }

    public async getMySubscription(req: Request, res: Response, next: NextFunction) {
        try {
            if (!req.user || req.user.role.name !== RoleName.PATIENT) {
                return next(new AppError('Acceso denegado. Solo los pacientes pueden ver su suscripción.', 403));
            }
            const subscription = await subscriptionService.getMySubscription(req.user.id);
            if (!subscription) {
                return res.status(200).json({ status: 'success', message: 'No tienes una suscripción activa.', data: null });
            }
            res.status(200).json({
                status: 'success',
                data: { subscription },
            });
        } catch (error: any) {
            console.error('Error en SubscriptionController.getMySubscription:', error);
            if (error instanceof AppError) {
                return next(error);
            }
            next(new AppError('Error al obtener mi suscripción.', 500));
        }
    }

    public async updateMySubscriptionStatus(req: Request, res: Response, next: NextFunction) {
        try {
            if (!req.user) { // No requiere rol específico aquí, el servicio lo verificará si es admin o paciente
                return next(new AppError('Usuario no autenticado.', 401));
            }
            const { id } = req.params; // ID de la UserSubscription
            const { status, cancelReason } = req.body as UpdateUserSubscriptionStatusDto;
            
            const updatedSubscription = await subscriptionService.updateUserSubscriptionStatus(id, { status, cancelReason }, req.user.id, req.user.role.name);
            res.status(200).json({
                status: 'success',
                message: `Suscripción actualizada a ${status}.`,
                data: { subscription: updatedSubscription },
            });
        } catch (error: any) {
            console.error('Error en SubscriptionController.updateMySubscriptionStatus:', error);
            if (error instanceof AppError) {
                return next(error);
            }
            next(new AppError('Error al actualizar el estado de la suscripción.', 500));
        }
    }

    // --- Webhook de Pagos (Público, gestionado por la pasarela de pagos) ---
    public async handlePaymentWebhook(req: Request, res: Response, next: NextFunction) {
        try {
            const eventType = req.body.type;
            const eventData = req.body.data.object;

            const result = await subscriptionService.handleWebhookEvent(eventType, eventData);
            res.status(200).json(result);
        } catch (error: any) {
            console.error('Error en SubscriptionController.handlePaymentWebhook:', error);
            return res.status(200).json({ received: true, error: error.message || 'Error desconocido' });
        }
    }
}

export default new SubscriptionController();