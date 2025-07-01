import { Request, Response, NextFunction } from 'express';
import { validate, ValidationError } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { AppError } from '../utils/app.error';

export function validateMiddleware<T extends object>(type: { new (): T }) {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
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
                console.log('🚨 === ERRORES DE VALIDACIÓN DETALLADOS ===');
                console.log('📋 Campos enviados:', Object.keys(req.body));
                console.log('❌ Errores encontrados:');
                errors.forEach((error, index) => {
                    console.log(`  ${index + 1}. Campo: ${error.property}`);
                    console.log(`     Valor: ${JSON.stringify(error.value)}`);
                    console.log(`     Restricciones:`, error.constraints);
                    console.log(`     Hijos:`, error.children?.length || 0);
                });
                console.log('🚨 === FIN ERRORES DE VALIDACIÓN ===');

                const errorMessages = errors.map(error => {
                    if (error.constraints) {
                        return Object.values(error.constraints);
                    }
                    return [`Error en ${error.property}`];
                }).flat();

                // Crear respuesta de error mejorada para accesibilidad
                const validationError = new AppError('Error de validación', 400, 'VALIDATION_ERROR');
                
                return res.status(400).json({
                    status: 'error',
                    message: 'Error de validación',
                    errorCode: 'VALIDATION_ERROR',
                    timestamp: new Date().toISOString(),
                    path: req.originalUrl,
                    method: req.method,
                    errors: errorMessages,
                    // Información adicional para accesibilidad
                    suggestions: [
                        'Verifica que todos los campos requeridos estén completos',
                        'Asegúrate de que los datos tengan el formato correcto',
                        'Revisa los mensajes de error específicos para cada campo'
                    ],
                    fieldErrors: errors.map(error => ({
                        field: error.property,
                        constraints: error.constraints || {},
                        value: error.value
                    })),
                    // DEBUGGING: Datos adicionales
                    debug: {
                        receivedFields: Object.keys(req.body),
                        totalErrors: errors.length,
                        detailedErrors: errors.map(error => ({
                            property: error.property,
                            value: error.value,
                            constraints: error.constraints,
                            children: error.children?.length || 0
                        }))
                    }
                });
            }

            req.body = dto;
            next();
        } catch (error) {
            console.error('Error en validation middleware:', error);
            next(new AppError('Error interno de validación', 500, 'VALIDATION_INTERNAL_ERROR'));
        }
    };
}