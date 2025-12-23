import { Request, Response, NextFunction } from 'express';
import googleAuthService from './google-auth.service';
import { AppError } from '../../utils/app.error';

class GoogleAuthController {
    /**
     * Inicia el flujo de autenticación con Google
     */
    public async initiateAuth(req: Request, res: Response, next: NextFunction) {
        try {
            const authUrl = googleAuthService.getAuthUrl();
            res.json({
                status: 'success',
                data: { authUrl }
            });
        } catch (error: any) {
            console.error('Error initiating Google auth:', error);
            if (error instanceof AppError) {
                return next(error);
            }
            next(new AppError('Error al iniciar autenticación con Google', 500));
        }
    }

    /**
     * Maneja el callback de Google OAuth
     */
    public async handleCallback(req: Request, res: Response, next: NextFunction) {
        try {
            const { code } = req.query;

            if (!code || typeof code !== 'string') {
                throw new AppError('Código de autorización requerido', 400);
            }

            const { user, token } = await googleAuthService.handleCallback(code);

            // Redirigir al frontend con el token
            const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5000';
            const redirectUrl = `${frontendUrl}/auth/google/callback?token=${token}&user=${encodeURIComponent(JSON.stringify(user))}`;
            
            res.redirect(redirectUrl);
        } catch (error: any) {
            console.error('Error in Google OAuth callback:', error);
            
            const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5000';
            const errorRedirectUrl = `${frontendUrl}/auth/google/error?error=${encodeURIComponent(error.message)}`;
            
            res.redirect(errorRedirectUrl);
        }
    }

    /**
     * Desconecta la cuenta de Google
     */
    public async disconnectGoogle(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = req.user?.id;
            if (!userId) {
                throw new AppError('Usuario no autenticado', 401);
            }

            await googleAuthService.disconnectGoogle(userId);

            res.json({
                status: 'success',
                message: 'Cuenta de Google desconectada exitosamente'
            });
        } catch (error: any) {
            console.error('Error disconnecting Google account:', error);
            if (error instanceof AppError) {
                return next(error);
            }
            next(new AppError('Error al desconectar cuenta de Google', 500));
        }
    }

    /**
     * Obtiene el estado de conexión con Google
     */
    public async getGoogleConnectionStatus(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = req.user?.id;
            if (!userId) {
                throw new AppError('Usuario no autenticado', 401);
            }

            const user = await googleAuthService['userRepository']
                .createQueryBuilder('user')
                .select([
                    'user.google_id',
                    'user.google_email',
                    'user.google_calendar_sync_enabled',
                    'user.google_calendar_last_sync',
                    'user.auth_provider'
                ])
                .where('user.id = :userId', { userId })
                .getOne();

            if (!user) {
                throw new AppError('Usuario no encontrado', 404);
            }

            const isConnected = !!user.google_id;
            const isTokenExpired = isConnected ? googleAuthService.isGoogleTokenExpired(user) : false;

            res.json({
                status: 'success',
                data: {
                    isConnected,
                    isTokenExpired,
                    googleEmail: user.google_email,
                    calendarSyncEnabled: user.google_calendar_sync_enabled,
                    lastSync: user.google_calendar_last_sync,
                    authProvider: user.auth_provider
                }
            });
        } catch (error: any) {
            console.error('Error getting Google connection status:', error);
            if (error instanceof AppError) {
                return next(error);
            }
            next(new AppError('Error al obtener estado de conexión con Google', 500));
        }
    }

    /**
     * Refresca el token de Google
     */
    public async refreshGoogleToken(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = req.user?.id;
            if (!userId) {
                throw new AppError('Usuario no autenticado', 401);
            }

            const success = await googleAuthService.refreshGoogleToken(userId);

            if (success) {
                res.json({
                    status: 'success',
                    message: 'Token de Google actualizado exitosamente'
                });
            } else {
                throw new AppError('No se pudo actualizar el token de Google', 400);
            }
        } catch (error: any) {
            console.error('Error refreshing Google token:', error);
            if (error instanceof AppError) {
                return next(error);
            }
            next(new AppError('Error al actualizar token de Google', 500));
        }
    }
}

export default new GoogleAuthController(); 