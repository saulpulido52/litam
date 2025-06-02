// src/modules/educational_content/educational_content.routes.ts
import { Router } from 'express';
import educationalContentController from '@/modules/educational_content/educational_content.controller';
import { protect, authorize } from '@/middleware/auth.middleware';
import { validateMiddleware } from '@/middleware/validation.middleware';
import {
    CreateUpdateEducationalContentDto,
    CreateUpdateRecipeDto,
} from '@/modules/educational_content/educational_content.dto';
import { RoleName } from '@/database/entities/role.entity';

const router = Router();

// --- Rutas de Contenido Educativo (Artículos, Guías, Videos) ---
// Acceso de lectura para todos, escritura para nutriólogos/admins

// Acceso de lectura (público o autenticado)
router.get('/content', educationalContentController.getAllEducationalContent);
router.get('/content/:id', educationalContentController.getEducationalContentById);

// Acceso de escritura (solo nutriólogos y administradores)
router.use('/content', protect, authorize(RoleName.NUTRITIONIST, RoleName.ADMIN));
router.post('/content', validateMiddleware(CreateUpdateEducationalContentDto), educationalContentController.createEducationalContent);
router.patch('/content/:id', validateMiddleware(CreateUpdateEducationalContentDto), educationalContentController.updateEducationalContent);
router.delete('/content/:id', educationalContentController.deleteEducationalContent);


// --- Rutas de Recetas ---
// Acceso de lectura para todos, escritura para nutriólogos/admins

// Acceso de lectura (público o autenticado)
router.get('/recipes', educationalContentController.getAllRecipes);
router.get('/recipes/:id', educationalContentController.getRecipeById);

// Acceso de escritura (solo nutriólogos y administradores)
router.use('/recipes', protect, authorize(RoleName.NUTRITIONIST, RoleName.ADMIN));
router.post('/recipes', validateMiddleware(CreateUpdateRecipeDto), educationalContentController.createRecipe);
router.patch('/recipes/:id', validateMiddleware(CreateUpdateRecipeDto), educationalContentController.updateRecipe);
router.delete('/recipes/:id', educationalContentController.deleteRecipe);

export default router;