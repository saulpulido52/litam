import { Router } from 'express';
import { WeeklyPlanTemplateController } from './weekly-plan-template.controller';
import { protect } from '../../middleware/auth.middleware';
import { authorize } from '../../middleware/auth.middleware';
import { RoleName } from '../../database/entities/role.entity';

const router = Router();
const templateController = new WeeklyPlanTemplateController();

// Todas las rutas requieren autenticación
router.use(protect);

// Todas las rutas son solo para nutriólogos
router.use(authorize(RoleName.NUTRITIONIST));

// GET /api/templates - Obtener plantillas (propias + públicas)
router.get(
    '/',
    templateController.getTemplates.bind(templateController)
);

// GET /api/templates/categories - Obtener categorías disponibles
router.get(
    '/categories',
    templateController.getCategories.bind(templateController)
);

// POST /api/templates - Crear nueva plantilla
router.post(
    '/',
    templateController.createTemplate.bind(templateController)
);

// POST /api/templates/from-week - Crear plantilla desde plan existente
router.post(
    '/from-week',
    templateController.createFromWeek.bind(templateController)
);

// POST /api/templates/apply - Aplicar plantilla a un plan
router.post(
    '/apply',
    templateController.applyTemplate.bind(templateController)
);

// GET /api/templates/:id - Obtener plantilla específica
router.get(
    '/:id',
    templateController.getTemplateById.bind(templateController)
);

// PUT /api/templates/:id - Actualizar plantilla
router.put(
    '/:id',
    templateController.updateTemplate.bind(templateController)
);

// DELETE /api/templates/:id - Eliminar plantilla
router.delete(
    '/:id',
    templateController.deleteTemplate.bind(templateController)
);

// POST /api/templates/:id/rate - Calificar plantilla
router.post(
    '/:id/rate',
    templateController.rateTemplate.bind(templateController)
);

export default router; 