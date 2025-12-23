import { Router } from 'express';
import authController from './auth.controller'; // Ruta corregida
<<<<<<< HEAD
import { validateMiddleware } from '../../middleware/validation.middleware'; // Ruta corregida
import { RegisterPatientDto, RegisterNutritionistDto, LoginDto } from './auth.dto'; // Ruta corregida

const router = Router();

=======
import googleAuthController from './google-auth.controller';
import { validateMiddleware } from '../../middleware/validation.middleware'; // Ruta corregida
import { RegisterPatientDto, RegisterNutritionistDto, LoginDto } from './auth.dto'; // Ruta corregida
import { protect } from '../../middleware/auth.middleware';

const router = Router();

// Rutas de autenticación local
>>>>>>> nutri/main
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

<<<<<<< HEAD
=======
// Rutas de Google OAuth
router.get('/google/init', googleAuthController.initiateAuth);

router.get('/google/callback', googleAuthController.handleCallback);

// Rutas protegidas para Google OAuth
router.get('/google/status', protect, googleAuthController.getGoogleConnectionStatus);

router.post('/google/refresh-token', protect, googleAuthController.refreshGoogleToken);

router.post('/google/disconnect', protect, googleAuthController.disconnectGoogle);

>>>>>>> nutri/main
export default router;