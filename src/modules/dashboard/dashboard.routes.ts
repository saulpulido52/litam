import { Router } from 'express';
import { DashboardController } from './dashboard.controller';
import { protect } from '../../middleware/auth.middleware';

const router = Router();
const dashboardController = new DashboardController();

// Todas las rutas requieren autenticación
router.use(protect);

// GET /api/dashboard/stats - Obtener estadísticas del dashboard
router.get('/stats', dashboardController.getDashboardStats);

<<<<<<< HEAD
// GET /api/dashboard/recent-activities - Obtener actividades recientes
router.get('/recent-activities', dashboardController.getRecentActivities);

// GET /api/dashboard/income-summary - Obtener resumen de ingresos
router.get('/income-summary', dashboardController.getIncomeSummary);

=======
>>>>>>> nutri/main
export default router; 