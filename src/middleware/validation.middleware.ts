// src/middleware/validation.middleware.ts
import { Request, Response, NextFunction } from 'express';
import { validate, ValidationError } from 'class-validator';
import { plainToInstance } from 'class-transformer';

export function validateMiddleware<T extends object>(type: { new (): T }) {
    return async (req: Request, res: Response, next: NextFunction) => {
        const dto = plainToInstance(type, req.body);
        const errors: ValidationError[] = await validate(dto, {
            whitelist: true, // Remueve propiedades que no están definidas en el DTO
            forbidNonWhitelisted: true, // Retorna un error si hay propiedades no definidas
            validationError: {
                target: false, // No incluye el objeto validado en el error
                value: false // No incluye el valor de la propiedad en el error
            }
        });

        if (errors.length > 0) {
            const errorMessages = errors.map(error => {
                // Mapea los mensajes de error de class-validator
                if (error.constraints) {
                    return Object.values(error.constraints);
                }
                return [`Error en ${error.property}`];
            }).flat();

            return res.status(400).json({
                message: 'Error de validación',
                errors: errorMessages
            });
        }

        // Adjuntar la instancia del DTO validado al request
        req.body = dto;
        next();
    };
}