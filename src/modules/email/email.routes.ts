// src/modules/email/email.routes.ts
import { Router } from 'express';
import { emailController } from './email.controller';
import { protect, authorize } from '../../middleware/auth.middleware';
import { RoleName } from '../../database/entities/role.entity';

const router = Router();

// Verificar conexión SMTP (solo nutriólogos)
router.get('/verify', protect, authorize(RoleName.NUTRITIONIST), emailController.verifyConnection);

// Enviar email de prueba (solo nutriólogos)
router.post('/test', protect, authorize(RoleName.NUTRITIONIST), emailController.sendTestEmail);

// Enviar credenciales de prueba (solo nutriólogos)
router.post('/test-credentials', protect, authorize(RoleName.NUTRITIONIST), emailController.sendTestCredentials);

export default router;