// src/modules/nutritionists/nutritionist-registration.dto.ts
import {
    IsString,
    IsEmail,
    IsOptional,
    Length,
    IsDateString,
    IsArray,
    IsNumber,
    Min,
    IsBoolean,
    Matches,
    IsEnum,
    ArrayNotEmpty,
    ValidateNested,
    IsPhoneNumber
} from 'class-validator';
import { Type } from 'class-transformer';

// Validación de cédula profesional mexicana (formato: 12345678)
const PROFESSIONAL_ID_REGEX = /^[0-9]{7,10}$/;

// Validación de RFC mexicano
const RFC_REGEX = /^[A-Z&Ñ]{3,4}[0-9]{6}[A-Z0-9]{3}$/;

// Validación de CURP mexicano
const CURP_REGEX = /^[A-Z]{4}[0-9]{6}[HM][A-Z]{5}[0-9A-Z][0-9]$/;

export class NutritionistRegistrationDto {
    // ========== INFORMACIÓN PERSONAL ==========
    @IsString({ message: 'El nombre es requerido' })
    @Length(2, 50, { message: 'El nombre debe tener entre 2 y 50 caracteres' })
    first_name!: string;

    @IsString({ message: 'El apellido es requerido' })
    @Length(2, 50, { message: 'El apellido debe tener entre 2 y 50 caracteres' })
    last_name!: string;

    @IsEmail({}, { message: 'Debe proporcionar un email válido' })
    email!: string;

    @IsPhoneNumber('MX', { message: 'Debe proporcionar un número de teléfono mexicano válido' })
    phone!: string;

    @IsDateString({}, { message: 'Debe proporcionar una fecha de nacimiento válida' })
    birth_date!: string;

    @IsEnum(['male', 'female', 'other'], { message: 'El género debe ser male, female u other' })
    gender!: 'male' | 'female' | 'other';

    // ========== VALIDACIÓN PROFESIONAL ==========
    @IsString({ message: 'La cédula profesional es requerida' })
    @Matches(PROFESSIONAL_ID_REGEX, { 
        message: 'La cédula profesional debe tener entre 7 y 10 dígitos' 
    })
    professional_id!: string;

    @IsString({ message: 'La entidad emisora de la cédula es requerida' })
    @Length(2, 255, { message: 'La entidad emisora debe tener entre 2 y 255 caracteres' })
    professional_id_issuer!: string;

    @IsString({ message: 'La universidad es requerida' })
    @Length(2, 100, { message: 'El nombre de la universidad debe tener entre 2 y 100 caracteres' })
    university!: string;

    @IsString({ message: 'El título profesional es requerido' })
    @Length(2, 100, { message: 'El título debe tener entre 2 y 100 caracteres' })
    degree_title!: string;

    @IsDateString({}, { message: 'Debe proporcionar una fecha de graduación válida' })
    graduation_date!: string;

    @IsString({ message: 'El RFC es requerido' })
    @Matches(RFC_REGEX, { 
        message: 'El RFC debe tener el formato válido mexicano (ej: XAXX010101000)' 
    })
    rfc!: string;

    @IsString({ message: 'El CURP es requerido' })
    @Matches(CURP_REGEX, { 
        message: 'El CURP debe tener el formato válido mexicano' 
    })
    curp!: string;

    // ========== INFORMACIÓN PROFESIONAL ==========
    @IsOptional()
    @IsString({ message: 'El número de licencia debe ser una cadena de texto' })
    @Length(5, 100, { message: 'El número de licencia debe tener entre 5 y 100 caracteres' })
    license_number?: string;

    @IsOptional()
    @IsString({ message: 'La entidad emisora de la licencia debe ser una cadena de texto' })
    license_issuing_authority?: string;

    @IsArray({ message: 'Las especialidades deben ser un array' })
    @ArrayNotEmpty({ message: 'Debe especificar al menos una especialidad' })
    @IsString({ each: true, message: 'Cada especialidad debe ser una cadena de texto' })
    specialties!: string[];

    @IsNumber({}, { message: 'Los años de experiencia deben ser un número' })
    @Min(0, { message: 'Los años de experiencia no pueden ser negativos' })
    years_of_experience!: number;

    @IsArray({ message: 'La educación debe ser un array' })
    @IsString({ each: true, message: 'Cada entrada de educación debe ser una cadena de texto' })
    education!: string[];

    @IsOptional()
    @IsArray({ message: 'Las certificaciones deben ser un array' })
    @IsString({ each: true, message: 'Cada certificación debe ser una cadena de texto' })
    certifications?: string[];

    @IsOptional()
    @IsArray({ message: 'Las áreas de interés deben ser un array' })
    @IsString({ each: true, message: 'Cada área de interés debe ser una cadena de texto' })
    areas_of_interest?: string[];

    // ========== PRÁCTICA PROFESIONAL ==========
    @IsString({ message: 'La biografía profesional es requerida' })
    @Length(50, 1000, { message: 'La biografía debe tener entre 50 y 1000 caracteres' })
    bio!: string;

    @IsOptional()
    @IsString({ message: 'El resumen profesional debe ser una cadena de texto' })
    @Length(0, 300, { message: 'El resumen profesional no puede exceder los 300 caracteres' })
    professional_summary?: string;

    @IsOptional()
    @IsString({ message: 'El enfoque de tratamiento debe ser una cadena de texto' })
    treatment_approach?: string;

    @IsArray({ message: 'Los idiomas deben ser un array' })
    @ArrayNotEmpty({ message: 'Debe especificar al menos un idioma' })
    @IsString({ each: true, message: 'Cada idioma debe ser una cadena de texto' })
    languages!: string[];

    @IsNumber({}, { message: 'La tarifa por consulta debe ser un número' })
    @Min(0, { message: 'La tarifa por consulta no puede ser negativa' })
    consultation_fee!: number;

    // ========== MODALIDADES DE CONSULTA ==========
    @IsBoolean({ message: 'Debe especificar si ofrece consultas presenciales' })
    offers_in_person!: boolean;

    @IsBoolean({ message: 'Debe especificar si ofrece consultas online' })
    offers_online!: boolean;

    // ========== INFORMACIÓN DEL CONSULTORIO ==========
    @IsOptional()
    @IsString({ message: 'El nombre del consultorio debe ser una cadena de texto' })
    clinic_name?: string;

    @IsOptional()
    @IsString({ message: 'La dirección del consultorio debe ser una cadena de texto' })
    clinic_address?: string;

    @IsOptional()
    @IsString({ message: 'La ciudad debe ser una cadena de texto' })
    clinic_city?: string;

    @IsOptional()
    @IsString({ message: 'El estado debe ser una cadena de texto' })
    clinic_state?: string;

    @IsOptional()
    @IsString({ message: 'El código postal debe ser una cadena de texto' })
    clinic_zip_code?: string;

    @IsOptional()
    @IsString({ message: 'El país debe ser una cadena de texto' })
    clinic_country?: string;

    @IsOptional()
    @IsPhoneNumber('MX', { message: 'El teléfono del consultorio debe ser un número mexicano válido' })
    clinic_phone?: string;

    // ========== DOCUMENTOS ==========
    // Estos se manejarán por separado en el endpoint de upload
    uploaded_documents?: {
        professional_id_front?: string;
        professional_id_back?: string;
        diploma?: string;
        additional_certifications?: string[];
    };
}

export class NutritionistVerificationDto {
    @IsEnum(['approved', 'rejected', 'under_review'], { 
        message: 'El estado de verificación debe ser approved, rejected o under_review' 
    })
    verification_status!: 'approved' | 'rejected' | 'under_review';

    @IsOptional()
    @IsString({ message: 'Las notas de verificación deben ser una cadena de texto' })
    @Length(0, 1000, { message: 'Las notas no pueden exceder los 1000 caracteres' })
    verification_notes?: string;
}

export class DocumentUploadDto {
    @IsEnum(['professional_id_front', 'professional_id_back', 'diploma', 'additional_certification'], {
        message: 'El tipo de documento debe ser válido'
    })
    document_type!: 'professional_id_front' | 'professional_id_back' | 'diploma' | 'additional_certification';

    @IsString({ message: 'La URL del documento es requerida' })
    document_url!: string;
}

// DTO para búsqueda y filtrado de nutriólogos por administradores
export class NutritionistSearchDto {
    @IsOptional()
    @IsString()
    search?: string; // Buscar por nombre, email, cédula

    @IsOptional()
    @IsEnum(['pending', 'approved', 'rejected', 'under_review'])
    verification_status?: 'pending' | 'approved' | 'rejected' | 'under_review';

    @IsOptional()
    @IsString()
    university?: string;

    @IsOptional()
    @IsNumber()
    @Min(1)
    page?: number;

    @IsOptional()
    @IsNumber()
    @Min(1)
    limit?: number;
}