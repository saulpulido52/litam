// users.routes.ts 
import { Router } from 'express';
import userController from '../../modules/users/users.controller'; // Ruta corregida
import { protect, authorize } from '../../middleware/auth.middleware'; // Ruta corregida
import { validateMiddleware } from '../../middleware/validation.middleware'; // Ruta corregida
import { UpdateUserDto } from '../../modules/auth/auth.dto'; // Ruta corregida
import { RoleName } from '../../database/entities/role.entity'; // Importar RoleName para authorize

const router = Router();

// Todas las rutas debajo de este punto requerirán autenticación
router.use(protect);

router.get('/me', userController.getMyProfile);
router.patch(
    '/me',
    validateMiddleware(UpdateUserDto),
    userController.updateMyProfile
);

// Ejemplo de ruta solo para nutriólogos (descomentar si quieres probarlo)
// router.get('/nutritionists/dashboard', authorize(RoleName.NUTRITIONIST), (req, res) => {
//     res.status(200).json({ message: 'Bienvenido al dashboard de nutriólogos!', user: req.user });
// });

export default router;