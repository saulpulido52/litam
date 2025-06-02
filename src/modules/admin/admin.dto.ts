// src/modules/admin/admin.dto.ts
import {
    IsString,
    IsNotEmpty,
    IsUUID,
    IsOptional,
    IsBoolean,
    IsEnum,
    Length,
    IsEmail,
    IsDateString, // <--- AÑADIDO
} from 'class-validator';
import { RoleName } from '@/database/entities/role.entity';
import { UserSubscriptionStatus } from '@/database/entities/user_subscription.entity';
import { SubscriptionDurationType } from '@/database/entities/subscription_plan.entity'; // <-- AÑADIDO

// DTO para actualizar un usuario por el administrador
export class AdminUpdateUserDto {
    @IsOptional()
    @IsString({ message: 'El nombre debe ser una cadena de texto.' })
    @Length(2, 100, { message: 'El nombre debe tener entre 2 y 100 caracteres.' })
    firstName?: string;

    @IsOptional()
    @IsString({ message: 'El apellido debe ser una cadena de texto.' })
    @Length(2, 100, { message: 'El apellido debe tener entre 2 y 100 caracteres.' })
    lastName?: string;

    @IsOptional()
    @IsEmail({}, { message: 'El email debe ser una dirección de correo válida.' })
    email?: string;

    @IsOptional()
    @IsEnum(RoleName, { message: 'El rol de usuario no es válido.' })
    roleName?: RoleName; // Para cambiar el rol (solo Admin)

    @IsOptional()
    @IsBoolean({ message: 'is_active debe ser un booleano.' })
    isActive?: boolean;

    @IsOptional()
    @IsString({ message: 'La nueva contraseña debe ser una cadena de texto.' })
    @Length(8, 50, { message: 'La contraseña debe tener entre 8 y 50 caracteres.' })
    newPassword?: string;
}

// DTO para que el Admin verifique a un nutriólogo
export class AdminVerifyNutritionistDto {
    @IsBoolean({ message: 'El estado de verificación debe ser un booleano.' })
    isVerified!: boolean;
}

// DTO para que el Admin actualice una suscripción de usuario
export class AdminUpdateUserSubscriptionDto {
    @IsOptional()
    @IsUUID('4', { message: 'El ID del plan de suscripción debe ser un UUID válido.' })
    planId?: string; // Para cambiar el plan al que está suscrito

    @IsOptional()
    @IsDateString({}, { message: 'La fecha de inicio debe ser una fecha y hora válidas (ISO 8601).' }) // <-- CORREGIDO
    startDate?: string;

    @IsOptional()
    @IsDateString({}, { message: 'La fecha de fin debe ser una fecha y hora válidas (ISO 8601).' }) // <-- CORREGIDO
    endDate?: string;

    @IsOptional()
    @IsEnum(UserSubscriptionStatus, { message: 'El estado de la suscripción no es válido.' })
    status?: UserSubscriptionStatus;

    @IsOptional()
    @IsString({ message: 'La razón de cancelación debe ser una cadena de texto.' })
    @Length(0, 500, { message: 'La razón de cancelación no puede exceder 500 caracteres.' })
    cancelReason?: string;

    @IsOptional()
    @IsBoolean({ message: 'El campo forzar renovación debe ser un booleano.' })
    forceRenewal?: boolean; // Campo de control para forzar renovación/facturación
}

// DTO para gestionar configuraciones generales (placeholder)
export class AdminUpdateSettingsDto {
    @IsOptional()
    @IsString({ message: 'El valor de la configuración debe ser una cadena de texto.' })
    @Length(1, 255, { message: 'El valor no puede exceder 255 caracteres.' })
    settingValue?: string;
}