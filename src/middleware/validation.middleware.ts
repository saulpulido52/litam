import { Request, Response, NextFunction } from 'express';
import { validate, ValidationError } from 'class-validator';
import { plainToInstance } from 'class-transformer';

export function validateMiddleware<T extends object>(type: { new (): T }) {
    return async (req: Request, res: Response, next: NextFunction) => {
        const dto = plainToInstance(type, req.body);
        const errors: ValidationError[] = await validate(dto, {
            whitelist: true,
            forbidNonWhitelisted: true,
            validationError: {
                target: false,
                value: false
            }
        });

        if (errors.length > 0) {
            const errorMessages = errors.map(error => {
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

        req.body = dto;
        next();
    };
}