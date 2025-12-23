// users.controller.ts 
import { Request, Response, NextFunction } from 'express';
import userService from '../../modules/users/users.service'; // Ruta corregida
import { AppError } from '../../utils/app.error';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Configuración de multer para subida de archivos
const storage = multer.diskStorage({
    destination: (req: any, file: any, cb: any) => {
        const uploadDir = path.join(__dirname, '../../../uploads/profile-images');
        // Crear directorio si no existe
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: (req: any, file: any, cb: any) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, `profile-${req.user?.id}-${uniqueSuffix}${path.extname(file.originalname)}`);
    }
});

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB máximo
    },
    fileFilter: (req: any, file: any, cb: any) => {
        // Verificar tipo de archivo
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new AppError('Solo se permiten archivos de imagen.', 400));
        }
    }
});

class UserController {
    public async getMyProfile(req: Request, res: Response, next: NextFunction) {
        try {
            if (!req.user) {
                return next(new AppError('Usuario no autenticado en la solicitud.', 401));
            }
            const user = await userService.getUserProfile(req.user.id);
            res.status(200).json({
                status: 'success',
                data: { user },
            });
        } catch (error: any) {
            if (error instanceof AppError) {
                return next(error);
            }
            next(new AppError('Error al obtener el perfil.', 500));
        }
    }

    public async updateMyProfile(req: Request, res: Response, next: NextFunction) {
        try {
            if (!req.user) {
                return next(new AppError('Usuario no autenticado en la solicitud.', 401));
            }
            const updatedUser = await userService.updateProfile(req.user.id, req.body);
            res.status(200).json({
                status: 'success',
                data: { user: updatedUser },
            });
        } catch (error: any) {
            if (error instanceof AppError) {
                return next(error);
            }
            next(new AppError('Error al actualizar el perfil.', 500));
        }
    }

    public async uploadProfileImage(req: Request, res: Response, next: NextFunction) {
        try {
            if (!req.user) {
                return next(new AppError('Usuario no autenticado en la solicitud.', 401));
            }

            // Usar multer como middleware
            upload.single('profile_image')(req, res, async (err: any) => {
                if (err) {
                    if (err instanceof multer.MulterError) {
                        if (err.code === 'LIMIT_FILE_SIZE') {
                            return next(new AppError('El archivo es demasiado grande. Máximo 5MB.', 400));
                        }
                    }
                    return next(new AppError(err.message, 400));
                }

                if (!(req as any).file) {
                    return next(new AppError('No se proporcionó ningún archivo.', 400));
                }

                try {
                    // Actualizar el perfil del usuario con la nueva imagen
                    const imageUrl = `/uploads/profile-images/${(req as any).file.filename}`;
                    const updatedUser = await userService.updateProfileImage(req.user!.id, imageUrl);

                    res.status(200).json({
                        status: 'success',
                        data: {
                            profile_image: imageUrl,
                            user: updatedUser
                        },
                    });
                } catch (error: any) {
                    // Si hay error, eliminar el archivo subido
                    if ((req as any).file && fs.existsSync((req as any).file.path)) {
                        fs.unlinkSync((req as any).file.path);
                    }
                    throw error;
                }
            });
        } catch (error: any) {
            if (error instanceof AppError) {
                return next(error);
            }
            next(new AppError('Error al subir la imagen de perfil.', 500));
        }
    }

    public async updatePassword(req: Request, res: Response, next: NextFunction) {
        try {
            if (!req.user) {
                return next(new AppError('Usuario no autenticado en la solicitud.', 401));
            }

            const { currentPassword, newPassword } = req.body;

            if (!currentPassword || !newPassword) {
                return next(new AppError('Contraseña actual y nueva contraseña son requeridas.', 400));
            }

            const result = await userService.updatePassword(req.user.id, currentPassword, newPassword);
            res.status(200).json({
                status: 'success',
                data: result,
            });
        } catch (error: any) {
            if (error instanceof AppError) {
                return next(error);
            }
            next(new AppError('Error al actualizar la contraseña.', 500));
        }
    }

    public async getProfileStats(req: Request, res: Response, next: NextFunction) {
        try {
            if (!req.user) {
                return next(new AppError('Usuario no autenticado en la solicitud.', 401));
            }

            const stats = await userService.getProfileStats(req.user.id);
            res.status(200).json({
                status: 'success',
                data: stats,
            });
        } catch (error: any) {
            if (error instanceof AppError) {
                return next(error);
            }
            next(new AppError('Error al obtener estadísticas del perfil.', 500));
        }
    }

    public async updateNotificationSettings(req: Request, res: Response, next: NextFunction) {
        try {
            if (!req.user) {
                return next(new AppError('Usuario no autenticado en la solicitud.', 401));
            }

            const result = await userService.updateNotificationSettings(req.user.id, req.body);
            res.status(200).json({
                status: 'success',
                data: result,
            });
        } catch (error: any) {
            if (error instanceof AppError) {
                return next(error);
            }
            next(new AppError('Error al actualizar configuraciones de notificación.', 500));
        }
    }

    public async deleteAccount(req: Request, res: Response, next: NextFunction) {
        try {
            if (!req.user) {
                return next(new AppError('Usuario no autenticado en la solicitud.', 401));
            }

            const { confirmPassword } = req.body;

            if (!confirmPassword) {
                return next(new AppError('Contraseña de confirmación es requerida.', 400));
            }

            const result = await userService.deleteAccount(req.user.id, confirmPassword);
            res.status(200).json({
                status: 'success',
                data: result,
            });
        } catch (error: any) {
            if (error instanceof AppError) {
                return next(error);
            }
            next(new AppError('Error al eliminar la cuenta.', 500));
        }
    }
}

export default new UserController();