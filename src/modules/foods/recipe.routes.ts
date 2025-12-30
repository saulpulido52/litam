// src/modules/foods/recipe.routes.ts
import { Router } from 'express';
import recipeController from './recipe.controller';
import { protect, authorize } from '../../middleware/auth.middleware';
import { validateMiddleware } from '../../middleware/validation.middleware';
import {
    CreateRecipeDto,
    UpdateRecipeDto,
    GenerateRecipeDto
} from './recipe.dto';
import { RoleName } from '../../database/entities/role.entity';

const router = Router();

// Rutas públicas (solo requieren autenticación básica)
router.use(protect);

// IMPORTANTE: Las rutas específicas DEBEN ir ANTES de las rutas dinámicas /:id

// Buscar recetas por ingredientes
// GET /api/recipes/search/ingredients?ingredients=pollo,arroz,tomate
router.get('/search/ingredients', recipeController.searchByIngredients);

// Obtener recetas populares/recomendadas
// GET /api/recipes/popular
router.get('/popular', recipeController.getPopularRecipes);

// Obtener todas las recetas con filtros y búsqueda
// GET /api/recipes?search=pollo&mealType=lunch&maxCaloriesPerServing=500&page=1&limit=20
router.get('/', recipeController.getAllRecipes);

// Obtener receta específica por ID (DEBE IR DESPUÉS de las rutas específicas)
// GET /api/recipes/:id
router.get('/:id', recipeController.getRecipeById);

// Rutas que requieren permisos de nutriólogo o admin
router.use(authorize(RoleName.NUTRITIONIST, RoleName.ADMIN));

// Analizar receta con Edamam y OMS
// POST /api/recipes/analyze
router.post('/analyze', recipeController.analyzeRecipe);

// Calcular información nutricional sin guardar receta
// POST /api/recipes/calculate-nutrition
router.post('/calculate-nutrition', recipeController.calculateNutrition);

// Generar recetas automáticamente para un paciente
// POST /api/recipes/generate
router.post(
    '/generate',
    validateMiddleware(GenerateRecipeDto),
    recipeController.generateRecipeForPatient
);

// Obtener estadísticas de recetas
// GET /api/recipes/stats
router.get('/stats', recipeController.getRecipeStats);

// Crear nueva receta
// POST /api/recipes
router.post(
    '/',
    validateMiddleware(CreateRecipeDto),
    recipeController.createRecipe
);

// Clonar receta existente
// POST /api/recipes/:id/clone
router.post(
    '/:id/clone',
    recipeController.cloneRecipe
);

// Actualizar receta existente
// PUT /api/recipes/:id
router.put(
    '/:id',
    validateMiddleware(UpdateRecipeDto),
    recipeController.updateRecipe
);

// Eliminar receta
// DELETE /api/recipes/:id
router.delete('/:id', recipeController.deleteRecipe);

// --- RUTAS ESPECÍFICAS PARA ADMINISTRADORES ---

// Marcar receta como base (solo admin)
// PUT /api/recipes/:id/mark-as-base
router.put(
    '/:id/mark-as-base',
    authorize(RoleName.ADMIN),
    recipeController.markAsBaseRecipe
);

// Compartir receta a todos los nutriólogos (solo admin)
// POST /api/recipes/:id/share-to-all
router.post(
    '/:id/share-to-all',
    authorize(RoleName.ADMIN),
    recipeController.shareRecipeToAllNutritionists
);

// Obtener recetas base (solo admin)
// GET /api/recipes/base-recipes
router.get(
    '/base-recipes',
    authorize(RoleName.ADMIN),
    recipeController.getBaseRecipes
);

// Obtener recetas compartidas por admin
// GET /api/recipes/shared-recipes
router.get(
    '/shared-recipes',
    recipeController.getSharedRecipes
);

export default router; 