import express, { Application, Request, Response, NextFunction } from 'express';
import dotenv from 'dotenv';
import authRoutes from '@/modules/auth/auth.routes'; // Ruta corregida
import userRoutes from '@/modules/users/users.routes'; // Ruta corregida
import { AppError } from '@/utils/app.error';

dotenv.config();

const app: Application = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/api/health', (req: Request, res: Response) => {
    res.status(200).json({ status: 'UP', timestamp: new Date().toISOString() });
});

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);

app.all('*', (req: Request, res: Response, next: NextFunction) => {
    next(new AppError(`No se puede encontrar ${req.originalUrl} en este servidor!`, 404));
});

app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
    let statusCode = 500;
    let message = 'Algo salió muy mal!';
    let status = 'error';

    if (err instanceof AppError) {
        statusCode = err.statusCode;
        message = err.message;
        status = err.status;
    } else {
        console.error('ERROR (No AppError):', err);
    }

    res.status(statusCode).json({
        status: status,
        message: message,
    });
});

export default app;