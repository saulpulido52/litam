import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { AppError } from '../utils/app.error';
import { AppDataSource } from '../database/data-source';
import { User } from '../database/entities/user.entity';
import { RoleName } from '../database/entities/role.entity';

dotenv.config(); // Asegura que las variables de entorno se carguen

// Definimos la constante JWT_SECRET consistentemente aquí
const JWT_SECRET_FOR_VERIFICATION = process.env.JWT_SECRET || 'supersecretjwtkey';

declare module 'express-serve-static-core' {
    interface Request {
        user?: User;
    }
}

interface JwtPayload {
    userId: string;
    role: RoleName;
    iat: number;
    exp: number;
}

export const protect = async (req: Request, res: Response, next: NextFunction) => {
    let token: string | undefined;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
        return next(new AppError('No estás logueado. Por favor, inicia sesión para obtener acceso.', 401, 'UNAUTHORIZED'));
    }

    // Validación básica del token sin exponer información sensible
    if (token.length < 10) {
        return next(new AppError('Token inválido. Por favor, inicia sesión de nuevo.', 401, 'INVALID_TOKEN'));
    }

    try {
        // Usar la constante definida para la verificación
        const decoded = jwt.verify(token, JWT_SECRET_FOR_VERIFICATION) as JwtPayload;

        // Validaciones adicionales del payload
        if (!decoded.userId || !decoded.role) {
            return next(new AppError('Token malformado. Por favor, inicia sesión de nuevo.', 401, 'MALFORMED_TOKEN'));
        }

        const userRepository = AppDataSource.getRepository(User);
        const currentUser = await userRepository
            .createQueryBuilder('user')
            .leftJoinAndSelect('user.role', 'role')
            .where('user.id = :id', { id: decoded.userId })
            .getOne();

        if (!currentUser) {
            return next(new AppError('El usuario al que pertenece este token ya no existe.', 401, 'USER_NOT_FOUND'));
        }

        if (!currentUser.is_active) {
            return next(new AppError('Tu cuenta ha sido desactivada. Contacta soporte para más información.', 401, 'ACCOUNT_DISABLED'));
        }

        // Verificar que el rol del token coincida con el rol en la base de datos
        if (decoded.role !== currentUser.role.name) {
            return next(new AppError('Token de autorización inválido. Por favor, inicia sesión de nuevo.', 401, 'ROLE_MISMATCH'));
        }

        // if (currentUser.isPasswordChangedRecently(decoded.iat)) {
        //     return next(new AppError('La contraseña ha sido cambiada recientemente. Por favor, inicia sesión de nuevo.', 401, 'PASSWORD_CHANGED'));
        // }

        req.user = currentUser;
        
        // Agregar información de accesibilidad al request
        req.headers['x-user-id'] = currentUser.id;
        req.headers['x-user-role'] = currentUser.role.name;
        req.headers['x-user-email'] = currentUser.email;
        
        next();
    } catch (error: any) {
        // Log del error sin exponer información sensible
        const timestamp = new Date().toISOString();
        const ip = req.ip || req.connection.remoteAddress || 'Unknown';
        console.error(`[${timestamp}] AUTH ERROR - IP: ${ip} - ${error.name}: ${error.message}`);
        
        if (error instanceof jwt.JsonWebTokenError) {
            return next(new AppError('Token inválido. Por favor, inicia sesión de nuevo.', 401, 'INVALID_TOKEN'));
        }
        if (error instanceof jwt.TokenExpiredError) {
            return next(new AppError('Tu token ha expirado. Por favor, inicia sesión de nuevo.', 401, 'TOKEN_EXPIRED'));
        }
        if (error instanceof jwt.NotBeforeError) {
            return next(new AppError('Token no válido aún. Por favor, inicia sesión de nuevo.', 401, 'TOKEN_NOT_ACTIVE'));
        }
        
        next(new AppError('Hubo un error inesperado al verificar el token.', 500, 'AUTH_ERROR'));
    }
};

export const authorize = (...roles: RoleName[]) => {
    return (req: Request, res: Response, next: NextFunction) => {
        if (!req.user) {
            return next(new AppError('Usuario no autenticado.', 401, 'UNAUTHORIZED'));
        }
        
        if (!roles.includes(req.user.role.name)) {
            return next(
                new AppError(
                    'No tienes permiso para realizar esta acción.',
                    403,
                    'FORBIDDEN'
                )
            );
        }
        
        // Agregar información de autorización al request
        req.headers['x-authorized-roles'] = roles.join(',');
        req.headers['x-user-has-permission'] = 'true';
        
        next();
    };
};