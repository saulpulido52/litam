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
        return next(new AppError('No estás logueado. Por favor, inicia sesión para obtener acceso.', 401));
    }

    // 🔍 EXTENSIVE TOKEN DEBUGGING + SIGNATURE VERIFICATION
    console.log('🔍 BACKEND TOKEN DEBUG:');
    console.log('  Full Authorization header:', req.headers.authorization);
    console.log('  Extracted token:', token);
    console.log('  Token length:', token?.length);
    console.log('  Token type:', typeof token);
    console.log('  Token starts with:', token?.substring(0, 30));
    console.log('  Token ends with:', token?.substring(token.length - 30));
    console.log('  Token contains quotes:', token?.includes('"'));
    console.log('  Token contains newlines:', token?.includes('\n'));
    console.log('  Token dot count:', (token?.match(/\./g) || []).length);
    
    // 🔍 JWT SECRET DEBUGGING
    console.log('🔑 JWT SECRET DEBUG:');
    console.log('  JWT_SECRET exists:', !!JWT_SECRET_FOR_VERIFICATION);
    console.log('  JWT_SECRET length:', JWT_SECRET_FOR_VERIFICATION?.length);
    console.log('  JWT_SECRET type:', typeof JWT_SECRET_FOR_VERIFICATION);
    console.log('  JWT_SECRET starts with:', JWT_SECRET_FOR_VERIFICATION?.substring(0, 10));
    
    // 🔍 DECODE WITHOUT VERIFICATION FIRST
    try {
        const decodedWithoutVerification = jwt.decode(token, { complete: true });
        console.log('🔓 Token decoded without verification:');
        console.log('  Header:', JSON.stringify(decodedWithoutVerification?.header));
        console.log('  Payload:', JSON.stringify(decodedWithoutVerification?.payload));
    } catch (decodeError: any) {
        console.log('❌ Failed to decode token without verification:', decodeError.message);
    }

    try {
        // Usar la constante definida para la verificación
        console.log('🔐 Attempting JWT verification...');
        const decoded = jwt.verify(token, JWT_SECRET_FOR_VERIFICATION) as JwtPayload;

        const userRepository = AppDataSource.getRepository(User);
        const currentUser = await userRepository
            .createQueryBuilder('user')
            .leftJoinAndSelect('user.role', 'role')
            .where('user.id = :id', { id: decoded.userId })
            .getOne();

        if (!currentUser) {
            return next(new AppError('El usuario al que pertenece este token ya no existe.', 401));
        }

        // if (currentUser.isPasswordChangedRecently(decoded.iat)) {
        //     return next(new AppError('La contraseña ha sido cambiada recientemente. Por favor, inicia sesión de nuevo.', 401));
        // }

        req.user = currentUser;
        next();
    } catch (error: any) {
        console.error('Error en AuthMiddleware.protect:', error); // LOG DE DEBUG
        if (error instanceof jwt.JsonWebTokenError) {
            return next(new AppError('Token inválido. Por favor, inicia sesión de nuevo.', 401));
        }
        if (error instanceof jwt.TokenExpiredError) {
            return next(new AppError('Tu token ha expirado. Por favor, inicia sesión de nuevo.', 401));
        }
        next(new AppError('Hubo un error inesperado al verificar el token.', 500));
    }
};

export const authorize = (...roles: RoleName[]) => {
    return (req: Request, res: Response, next: NextFunction) => {
        if (!req.user || !roles.includes(req.user.role.name)) {
            return next(
                new AppError(
                    'No tienes permiso para realizar esta acción.',
                    403
                )
            );
        }
        next();
    };
};