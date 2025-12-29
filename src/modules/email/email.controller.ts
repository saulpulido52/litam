// src/modules/email/email.controller.ts
import { Request, Response, NextFunction } from 'express';
import { emailService } from './email.service';
import { AppError } from '../../utils/app.error';

class EmailController {
    /**
     * Verifica la conexión SMTP
     */
    public async verifyConnection(req: Request, res: Response, next: NextFunction) {
        try {
            const isConnected = await emailService.verifyConnection();

            res.status(200).json({
                success: true,
                message: isConnected ? 'Conexión SMTP exitosa' : 'Error en conexión SMTP',
                data: {
                    connected: isConnected,
                    timestamp: new Date().toISOString()
                }
            });
        } catch (error) {
            console.error('Error verificando conexión SMTP:', error);
            next(new AppError('Error al verificar la conexión SMTP', 500));
        }
    }

    /**
     * Envía un email de prueba
     */
    public async sendTestEmail(req: Request, res: Response, next: NextFunction) {
        try {
            const { email } = req.body;

            if (!email) {
                return next(new AppError('Email es requerido', 400));
            }

            // Validar formato de email básico
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                return next(new AppError('Formato de email inválido', 400));
            }

            await emailService.sendTestEmail(email);

            res.status(200).json({
                success: true,
                message: `Email de prueba enviado exitosamente a ${email}`,
                data: {
                    email,
                    timestamp: new Date().toISOString()
                }
            });
        } catch (error) {
            console.error('Error enviando email de prueba:', error);
            next(new AppError('Error al enviar email de prueba', 500));
        }
    }

    /**
     * Envía credenciales de prueba (solo para testing)
     */
    public async sendTestCredentials(req: Request, res: Response, next: NextFunction) {
        try {
            const { email, patient_name, nutritionist_name } = req.body;

            if (!email || !patient_name || !nutritionist_name) {
                return next(new AppError('Email, patient_name y nutritionist_name son requeridos', 400));
            }

            // Validar formato de email
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                return next(new AppError('Formato de email inválido', 400));
            }

            // Crear credenciales de prueba
            const testCredentials = {
                email,
                temporary_password: 'TempPass123!',
                expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 horas
                patient_name,
                nutritionist_name
            };

            await emailService.sendPatientCredentials(testCredentials);

            res.status(200).json({
                success: true,
                message: `Credenciales de prueba enviadas exitosamente a ${email}`,
                data: {
                    ...testCredentials,
                    timestamp: new Date().toISOString()
                }
            });
        } catch (error) {
            console.error('Error enviando credenciales de prueba:', error);
            next(new AppError('Error al enviar credenciales de prueba', 500));
        }
    }
}

export const emailController = new EmailController();