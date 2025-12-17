// src/modules/subscriptions/subscription.dto.ts
import {
    IsString,
    IsNotEmpty,
    Length,
    IsUUID,
    IsNumber,
    Min,
    Max,
    IsOptional,
    IsArray,
    IsBoolean,
    IsEnum,
    IsDateString,
} from 'class-validator';
import { Type } from 'class-transformer';
import { SubscriptionDurationType } from '../../database/entities/subscription_plan.entity';
import { SubscriptionStatus } from '../../database/entities/user_subscription.entity';
import { PaymentStatus } from '../../database/entities/payment_transaction.entity';

// DTO para crear un plan de suscripción (Solo Admin)
export class CreateSubscriptionPlanDto {
    @IsString({ message: 'El nombre del plan debe ser una cadena de texto.' })
    @IsNotEmpty({ message: 'El nombre del plan es obligatorio.' })
    @Length(2, 100, { message: 'El nombre del plan debe tener entre 2 y 100 caracteres.' })
    name!: string;

    @IsOptional()
    @IsString({ message: 'La descripción debe ser una cadena de texto.' })
    @Length(0, 1000, { message: 'La descripción no puede exceder 1000 caracteres.' })
    description?: string;

    @IsNumber({}, { message: 'El precio debe ser un número.' })
    @Min(0, { message: 'El precio no puede ser negativo.' })
    @Max(10000, { message: 'El precio no puede exceder 10000.' })
    price!: number;

    @IsEnum(SubscriptionDurationType, { message: 'El tipo de duración no es válido.' })
    durationType!: SubscriptionDurationType;

    @IsOptional()
    @IsArray({ message: 'Las características deben ser un array de cadenas de texto.' })
    @IsString({ each: true, message: 'Cada característica debe ser una cadena de texto.' })
    features?: string[];

    @IsOptional()
    @IsBoolean({ message: 'is_active debe ser un booleano.' })
    isActive?: boolean;
}

// DTO para actualizar un plan de suscripción (Solo Admin)
export class UpdateSubscriptionPlanDto {
    @IsOptional()
    @IsString({ message: 'El nombre del plan debe ser una cadena de texto.' })
    @Length(2, 100, { message: 'El nombre del plan debe tener entre 2 y 100 caracteres.' })
    name?: string;

    @IsOptional()
    @IsString({ message: 'La descripción debe ser una cadena de texto.' })
    @Length(0, 1000, { message: 'La descripción no puede exceder 1000 caracteres.' })
    description?: string;

    @IsOptional()
    @IsNumber({}, { message: 'El precio debe ser un número.' })
    @Min(0, { message: 'El precio no puede ser negativo.' })
    @Max(10000, { message: 'El precio no puede exceder 10000.' })
    price?: number;

    @IsOptional()
    @IsEnum(SubscriptionDurationType, { message: 'El tipo de duración no es válido.' })
    durationType?: SubscriptionDurationType;

    @IsOptional()
    @IsArray({ message: 'Las características deben ser un array de cadenas de texto.' })
    @IsString({ each: true, message: 'Cada característica debe ser una cadena de texto.' })
    features?: string[];

    @IsOptional()
    @IsBoolean({ message: 'is_active debe ser un booleano.' })
    isActive?: boolean;
}

// DTO para que un Paciente se suscriba a un plan
export class SubscribeToPlanDto {
    @IsUUID('4', { message: 'El ID del plan de suscripción debe ser un UUID válido.' })
    planId!: string;

    @IsString({ message: 'El token de pago es obligatorio.' })
    @IsNotEmpty({ message: 'El token de pago no puede estar vacío.' })
    paymentToken!: string; // Un token de Stripe, por ejemplo (simulado por ahora)
}

// DTO para actualizar el estado de una suscripción de usuario (Admin o webhook)
export class UpdateUserSubscriptionStatusDto {
    @IsEnum(SubscriptionStatus, { message: 'El estado de la suscripción no es válido.' })
    status!: SubscriptionStatus;

    @IsOptional()
    @IsString({ message: 'La razón de cancelación debe ser una cadena de texto.' })
    @Length(0, 500, { message: 'La razón de cancelación no puede exceder 500 caracteres.' })
    cancelReason?: string;
}

// DTO para registrar una transacción de pago (Usado internamente o por webhooks)
export class CreatePaymentTransactionDto {
    @IsUUID('4', { message: 'El ID del usuario debe ser un UUID válido.' })
    userId!: string;

    @IsOptional()
    @IsUUID('4', { message: 'El ID del plan de suscripción debe ser un UUID válido.' })
    planId?: string; // Opcional, si el pago no es por un plan directo

    @IsNumber({}, { message: 'El monto debe ser un número.' })
    @Min(0.01, { message: 'El monto debe ser mayor que 0.' })
    amount!: number;

    @IsString({ message: 'La moneda es obligatoria.' })
    @IsNotEmpty({ message: 'La moneda no puede estar vacía.' })
    @Length(3, 3, { message: 'La moneda debe ser un código de 3 letras (ej: USD).' })
    currency!: string;

    @IsEnum(PaymentStatus, { message: 'El estado del pago no es válido.' })
    status!: PaymentStatus;

    @IsOptional()
    @IsString({ message: 'El ID de la transacción del gateway es obligatorio.' })
    gatewayTransactionId?: string;

    @IsOptional()
    @IsString({ message: 'El tipo de método de pago es obligatorio.' })
    paymentMethodType?: string;

    // Asegurarse de que el nombre de la propiedad aquí es camelCase para el DTO
    @IsOptional()
    @IsString({ message: 'El código de respuesta del gateway debe ser una cadena de texto.' })
    gatewayResponseCode?: string;
}