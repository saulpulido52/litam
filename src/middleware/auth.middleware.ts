// src/middleware/auth.middleware.ts
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { AppError } from '../utils/app.error'; // CORREGIDO
import { AppDataSource } from '../database/data-source';
import { User } from '../database/entities/entities/user.entity'; // CORREGIDO
import { RoleName } from '../database/entities/entities/role.entity'; // CORREGIDO

dotenv.config();

// Extiende la interfaz Request de Express para añadir la propiedad 'user'
declare module 'express-serve-static-core' {
    interface Request {
        user?: User;
    }
}

// Define la interfaz para el payload del token JWT
interface JwtPayload {
    userId: string; // <-- Cambiado de 'id' a 'userId' para que coincida con generateToken
    role: RoleName;
    iat: number;
    exp: number;
}

export const protect = async (req: Request, res: Response, next: NextFunction) => {
    let token: string | undefined;

    // 1) Obtener el token y verificar si existe
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
        return next(new AppError('No estás logueado. Por favor, inicia sesión para obtener acceso.', 401));
    }

    try {
        // 2) Verificar el token
        const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as JwtPayload;

        // 3) Verificar si el usuario aún existe
        const userRepository = AppDataSource.getRepository(User);
        const currentUser = await userRepository
            .createQueryBuilder('user')
            .leftJoinAndSelect('user.role', 'role')
            .where('user.id = :id', { id: decoded.userId }) // <-- Usar decoded.userId aquí
            .getOne();

        if (!currentUser) {
            return next(new AppError('El usuario al que pertenece este token ya no existe.', 401));
        }

        // 4) Verificar si el usuario ha cambiado su contraseña después de que se emitió el token (Opcional, para mayor seguridad)
        // El método isPasswordChangedRecently debería estar en la instancia de User, no en el middleware directamente.
        // Pero si decides mantenerlo aquí, asegúrate de que currentUser no sea null/undefined.
        if (currentUser.passwordChangedAt && currentUser.passwordChangedAt.getTime() > decoded.iat * 1000) {
             return next(new AppError('La contraseña ha sido cambiada recientemente. Por favor, inicia sesión de nuevo.', 401));
        }


        // 5) Conceder acceso
        req.user = currentUser;
        next();
    } catch (error: any) {
        if (error instanceof jwt.JsonWebTokenError) {
            return next(new AppError('Token inválido. Por favor, inicia sesión de nuevo.', 401));
        }
        if (error instanceof jwt.TokenExpiredError) {
            return next(new AppError('Tu token ha expirado. Por favor, inicia sesión de nuevo.', 401));
        }
        next(new AppError('Hubo un error inesperado al verificar el token.', 500));
    }
};

// Middleware para restringir acceso por rol (ej. solo nutriólogos o admins)
export const authorize = (...roles: RoleName[]) => {
    return (req: Request, res: Response, next: NextFunction) => {
        // req.user puede ser undefined si el middleware 'protect' no se ejecutó o falló.
        // Asegúrate de que 'protect' siempre se ejecuta antes de 'authorize'.
        if (!req.user || !roles.includes(req.user.role.name)) {
            return next(
                new AppError(
                    'No tienes permiso para realizar esta acción.',
                    403 // 403 Forbidden
                )
            );
        }
        next();
    };
};