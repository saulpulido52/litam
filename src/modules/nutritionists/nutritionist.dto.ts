// src/modules/nutritionists/nutritionist.dto.ts
import {
    IsString,
    Length,
    IsOptional,
    IsArray,
    ArrayMinSize,
    IsNumber,
    Min,
    IsBoolean,
    IsLatitude,
    IsLongitude,
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

    // --- NUEVOS CAMPOS PARA APP MÓVIL ---

    // Descripción profesional breve
    @IsOptional()
    @IsString({ message: 'El resumen profesional debe ser una cadena de texto.' })
    @Length(0, 300, { message: 'El resumen profesional no puede exceder los 300 caracteres.' })
    professionalSummary?: string;

    // Modalidad de consulta
    @IsOptional()
    @IsBoolean({ message: 'El campo de consultas presenciales debe ser un valor booleano.' })
    offersInPerson?: boolean;

    @IsOptional()
    @IsBoolean({ message: 'El campo de consultas online debe ser un valor booleano.' })
    offersOnline?: boolean;

    // Ubicación del consultorio
    @IsOptional()
    @IsString({ message: 'El nombre del consultorio debe ser una cadena de texto.' })
    @Length(0, 255, { message: 'El nombre del consultorio no puede exceder los 255 caracteres.' })
    clinicName?: string;

    @IsOptional()
    @IsString({ message: 'La dirección del consultorio debe ser una cadena de texto.' })
    @Length(0, 500, { message: 'La dirección del consultorio no puede exceder los 500 caracteres.' })
    clinicAddress?: string;

    @IsOptional()
    @IsString({ message: 'La ciudad debe ser una cadena de texto.' })
    @Length(0, 100, { message: 'La ciudad no puede exceder los 100 caracteres.' })
    clinicCity?: string;

    @IsOptional()
    @IsString({ message: 'El estado debe ser una cadena de texto.' })
    @Length(0, 100, { message: 'El estado no puede exceder los 100 caracteres.' })
    clinicState?: string;

    @IsOptional()
    @IsString({ message: 'El código postal debe ser una cadena de texto.' })
    @Length(0, 10, { message: 'El código postal no puede exceder los 10 caracteres.' })
    clinicZipCode?: string;

    @IsOptional()
    @IsString({ message: 'El país debe ser una cadena de texto.' })
    @Length(0, 100, { message: 'El país no puede exceder los 100 caracteres.' })
    clinicCountry?: string;

    // Coordenadas para Google Maps
    @IsOptional()
    @IsLatitude({ message: 'La latitud debe ser un valor válido.' })
    latitude?: number;

    @IsOptional()
    @IsLongitude({ message: 'La longitud debe ser un valor válido.' })
    longitude?: number;

    // Información adicional del consultorio
    @IsOptional()
    @IsString({ message: 'Las notas del consultorio deben ser una cadena de texto.' })
    @Length(0, 500, { message: 'Las notas del consultorio no pueden exceder los 500 caracteres.' })
    clinicNotes?: string;

    @IsOptional()
    @IsString({ message: 'El teléfono del consultorio debe ser una cadena de texto.' })
    @Length(0, 20, { message: 'El teléfono del consultorio no puede exceder los 20 caracteres.' })
    clinicPhone?: string;

    // Estado de disponibilidad
    @IsOptional()
    @IsBoolean({ message: 'El campo de disponibilidad debe ser un valor booleano.' })
    isAvailable?: boolean;
}