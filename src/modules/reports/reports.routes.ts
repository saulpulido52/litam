import { Router } from 'express';
import { ReportsController } from './reports.controller';
import { protect, authorize } from '../../middleware/auth.middleware';
import { RoleName } from '../../database/entities/role.entity';

const router = Router();
const reportsController = new ReportsController();

router.use(protect);
router.use(authorize(RoleName.NUTRITIONIST));

router.get('/financial', reportsController.getFinancialReports);
router.get('/patient-progress', reportsController.getPatientProgressReports);
router.get('/services', reportsController.getServiceDistributionReports);

export default router;
