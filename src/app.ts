// src/app.ts
import express, { Application, Request, Response, NextFunction } from 'express';
import dotenv from 'dotenv';
import authRoutes from './modules/auth/auth.routes'; // Importar rutas de auth
import { AppError } from './utils/app.error'; // Importar AppError

dotenv.config();

const app: Application = express();

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rutas de prueba
app.get('/api/health', (req: Request, res: Response) => {
    res.status(200).json({ status: 'UP', timestamp: new Date().toISOString() });
});

// Montar rutas de módulos
app.use('/api/auth', authRoutes); // Montar rutas de autenticación


// Middleware para manejar rutas no encontradas (404)
app.all('*', (req: Request, res: Response, next: NextFunction) => {
    next(new AppError(`No se puede encontrar ${req.originalUrl} en este servidor!`, 404));
});

// Middleware de manejo de errores global
// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
    let statusCode = 500;
    let message = 'Algo salió muy mal!';
    let status = 'error';

    if (err instanceof AppError) {
        statusCode = err.statusCode;
        message = err.message;
        status = err.status;
    } else {
        console.error('ERROR (No AppError):', err); // Log para errores no controlados
    }

    res.status(statusCode).json({
        status: status,
        message: message,
    });
});

export default app;