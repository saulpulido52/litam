// src/modules/nutritionists/nutritionist.dto.ts
import {
    IsString,
    Length,
    IsOptional,
    IsArray,
    ArrayMinSize,
    IsNumber,
    Min,
} from 'class-validator';

export class CreateUpdateNutritionistProfileDto {
    // --- Credenciales profesionales ---
    @IsOptional()
    @IsString({ message: 'El número de licencia debe ser una cadena de texto.' })
    @Length(5, 100, { message: 'El número de licencia debe tener entre 5 y 100 caracteres.' })
    licenseNumber?: string;

    @IsOptional()
    @IsString({ message: 'La entidad emisora de la licencia debe ser una cadena de texto.' })
    @Length(2, 255, { message: 'La entidad emisora debe tener entre 2 y 255 caracteres.' })
    licenseIssuingAuthority?: string;

    @IsOptional()
    @IsArray({ message: 'Las especialidades deben ser un array de cadenas de texto.' })
    @IsString({ each: true, message: 'Cada especialidad debe ser una cadena de texto.' })
    @ArrayMinSize(0, { message: 'Las especialidades no pueden ser un array vacío.' })
    specialties?: string[];

    @IsOptional()
    @IsNumber({}, { message: 'Los años de experiencia deben ser un número.' })
    @Min(0, { message: 'Los años de experiencia no pueden ser negativos.' })
    yearsOfExperience?: number;

    // --- Formación ---
    @IsOptional()
    @IsArray({ message: 'La educación debe ser un array de cadenas de texto.' })
    @IsString({ each: true, message: 'Cada entrada de educación debe ser una cadena de texto.' })
    education?: string[];

    @IsOptional()
    @IsArray({ message: 'Las certificaciones deben ser un array de cadenas de texto.' })
    @IsString({ each: true, message: 'Cada certificación debe ser una cadena de texto.' })
    certifications?: string[];

    @IsOptional()
    @IsArray({ message: 'Las áreas de interés deben ser un array de cadenas de texto.' })
    @IsString({ each: true, message: 'Cada área de interés debe ser una cadena de texto.' })
    areasOfInterest?: string[];

    // --- Práctica profesional ---
    @IsOptional()
    @IsString({ message: 'El enfoque de tratamiento debe ser una cadena de texto.' })
    @Length(0, 500, { message: 'El enfoque de tratamiento no puede exceder los 500 caracteres.' })
    treatmentApproach?: string;

    @IsOptional()
    @IsArray({ message: 'Los idiomas deben ser un array de cadenas de texto.' })
    @IsString({ each: true, message: 'Cada idioma debe ser una cadena de texto.' })
    languages?: string[];

    @IsOptional()
    @IsNumber({}, { message: 'La tarifa por consulta debe ser un número.' })
    @Min(0, { message: 'La tarifa por consulta no puede ser negativa.' })
    consultationFee?: number;

    // --- Campos existentes ---
    @IsOptional()
    @IsString({ message: 'La biografía debe ser una cadena de texto.' })
    @Length(0, 1000, { message: 'La biografía no puede exceder los 1000 caracteres.' })
    bio?: string;

    @IsOptional()
    officeHours?: any; // Mantener como 'any' para JSONB genérico
}