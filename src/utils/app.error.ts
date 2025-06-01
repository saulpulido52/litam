// src/utils/app.error.ts
export class AppError extends Error {
    statusCode: number;
    status: string;
    isOperational: boolean;

    constructor(message: string, statusCode: number) {
        super(message);
        this.statusCode = statusCode;
        this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
        this.isOperational = true; // Errores esperados (ej. validación, email duplicado)

        Error.captureStackTrace(this, this.constructor);
    }
}