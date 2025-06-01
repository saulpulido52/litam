import { Router } from 'express';
import authController from '@/modules/auth/auth.controller'; // Ruta corregida
import { validateMiddleware } from '@/middleware/validation.middleware'; // Ruta corregida
import { RegisterPatientDto, RegisterNutritionistDto, LoginDto } from '@/modules/auth/auth.dto'; // Ruta corregida

const router = Router();

router.post(
    '/register/patient',
    validateMiddleware(RegisterPatientDto),
    authController.registerPatient
);

router.post(
    '/register/nutritionist',
    validateMiddleware(RegisterNutritionistDto),
    authController.registerNutritionist
);

router.post('/login', validateMiddleware(LoginDto), authController.login);

router.post('/logout', authController.logout);

export default router;