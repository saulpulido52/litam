// auth.dto.ts 
// src/modules/auth/auth.dto.ts
import {
    IsEmail,
    IsString,
    Length,
    IsNotEmpty,
    IsInt,
    Min,
    Max,
    IsOptional,
    Matches,
    IsEnum
} from 'class-validator';
import { RoleName } from '../../database/entities/entities/role.entity'; // Ajusta la ruta si es necesario

export class RegisterPatientDto {
    @IsEmail({}, { message: 'El email debe ser una dirección de correo válida.' })
    @IsNotEmpty({ message: 'El email es obligatorio.' })
    email!: string;

    @IsString({ message: 'La contraseña debe ser una cadena de texto.' })
    @Length(8, 50, { message: 'La contraseña debe tener entre 8 y 50 caracteres.' })
    @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/, {
        message: 'La contraseña debe contener al menos una mayúscula, una minúscula, un número y un carácter especial.'
    })
    password!: string;

    @IsString({ message: 'El nombre debe ser una cadena de texto.' })
    @Length(2, 100, { message: 'El nombre debe tener entre 2 y 100 caracteres.' })
    @IsNotEmpty({ message: 'El nombre es obligatorio.' })
    firstName!: string;

    @IsString({ message: 'El apellido debe ser una cadena de texto.' })
    @Length(2, 100, { message: 'El apellido debe tener entre 2 y 100 caracteres.' })
    @IsNotEmpty({ message: 'El apellido es obligatorio.' })
    lastName!: string;

    @IsInt({ message: 'La edad debe ser un número entero.' })
    @Min(18, { message: 'La edad mínima es 18 años.' })
    @Max(110, { message: 'La edad máxima es 110 años.' })
    @IsOptional() // Es opcional en la fase 1, pero puede ser requerido en fases futuras.
    age?: number;

    @IsString({ message: 'El género debe ser una cadena de texto.' })
    @IsOptional() // Es opcional en la fase 1
    gender?: string; // Podríamos usar un @IsEnum aquí si tuviéramos un enum de géneros
}

export class RegisterNutritionistDto {
    @IsEmail({}, { message: 'El email debe ser una dirección de correo válida.' })
    @IsNotEmpty({ message: 'El email es obligatorio.' })
    email!: string;

    @IsString({ message: 'La contraseña debe ser una cadena de texto.' })
    @Length(8, 50, { message: 'La contraseña debe tener entre 8 y 50 caracteres.' })
    @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/, {
        message: 'La contraseña debe contener al menos una mayúscula, una minúscula, un número y un carácter especial.'
    })
    password!: string;

    @IsString({ message: 'El nombre debe ser una cadena de texto.' })
    @Length(2, 100, { message: 'El nombre debe tener entre 2 y 100 caracteres.' })
    @IsNotEmpty({ message: 'El nombre es obligatorio.' })
    firstName!: string;

    @IsString({ message: 'El apellido debe ser una cadena de texto.' })
    @Length(2, 100, { message: 'El apellido debe tener entre 2 y 100 caracteres.' })
    @IsNotEmpty({ message: 'El apellido es obligatorio.' })
    lastName!: string;
}

export class LoginDto {
    @IsEmail({}, { message: 'El email debe ser una dirección de correo válida.' })
    @IsNotEmpty({ message: 'El email es obligatorio.' })
    email!: string;

    @IsString({ message: 'La contraseña debe ser una cadena de texto.' })
    @IsNotEmpty({ message: 'La contraseña es obligatoria.' })
    password!: string;
}

export class UpdateUserDto {
    @IsString({ message: 'El nombre debe ser una cadena de texto.' })
    @Length(2, 100, { message: 'El nombre debe tener entre 2 y 100 caracteres.' })
    @IsOptional()
    firstName?: string;

    @IsString({ message: 'El apellido debe ser una cadena de texto.' })
    @Length(2, 100, { message: 'El apellido debe tener entre 2 y 100 caracteres.' })
    @IsOptional()
    lastName?: string;

    @IsInt({ message: 'La edad debe ser un número entero.' })
    @Min(0, { message: 'La edad no puede ser negativa.' })
    @Max(120, { message: 'La edad máxima es 120 años.' })
    @IsOptional()
    age?: number;

    @IsString({ message: 'El género debe ser una cadena de texto.' })
    @IsOptional()
    gender?: string;
}