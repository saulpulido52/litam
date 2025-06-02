// src/modules/progress_tracking/progress_tracking.dto.ts
import {
    IsString,
    IsOptional,
    IsNumber,
    Min,
    Max,
    IsDateString,
    IsArray,
    ValidateNested,
    IsUrl,
    Length,
    IsNotEmpty,
    IsUUID,
} from 'class-validator';
import { Type } from 'class-transformer';

// DTO para una entrada de foto de progreso
export class ProgressPhotoDto {
    @IsOptional()
    @IsDateString({}, { message: 'La fecha de la foto debe ser una fecha válida.' })
    date?: string;

    @IsUrl({}, { message: 'La URL de la foto debe ser una URL válida.' })
    @IsNotEmpty({ message: 'La URL de la foto es obligatoria.' })
    url!: string;

    @IsOptional()
    @IsString({ message: 'La descripción de la foto debe ser una cadena de texto.' })
    @Length(0, 255, { message: 'La descripción de la foto no puede exceder 255 caracteres.' })
    description?: string;
}

// DTO para registrar una nueva entrada de progreso o actualizarla
export class CreateUpdateProgressLogDto {
    @IsDateString({}, { message: 'La fecha del registro debe ser una fecha válida (YYYY-MM-DD).' })
    date!: string; // Fecha del registro del progreso (ej: '2025-06-01')

    @IsOptional()
    @IsNumber({}, { message: 'El peso debe ser un número.' })
    @Min(1, { message: 'El peso debe ser mayor que 0.' })
    @Max(500, { message: 'El peso no puede exceder 500 kg.' })
    weight?: number;

    @IsOptional()
    @IsNumber({}, { message: 'El porcentaje de grasa corporal debe ser un número.' })
    @Min(0, { message: 'El porcentaje de grasa corporal no puede ser negativo.' })
    @Max(100, { message: 'El porcentaje de grasa corporal no puede exceder 100.' })
    bodyFatPercentage?: number;

    @IsOptional()
    @IsNumber({}, { message: 'El porcentaje de masa muscular debe ser un número.' })
    @Min(0, { message: 'El porcentaje de masa muscular no puede ser negativo.' })
    @Max(100, { message: 'El porcentaje de masa muscular no puede exceder 100.' })
    muscleMassPercentage?: number;

    @IsOptional()
    // Si measurements tiene una estructura fija, se puede crear un DTO anidado para validación.
    // Por ahora, se mantiene como 'any' para permitir JSONs flexibles.
    measurements?: any; // Ej: { waist: 80, hip: 95, arm: 30 }

    @IsOptional()
    @IsString({ message: 'Las notas deben ser una cadena de texto.' })
    @Length(0, 1000, { message: 'Las notas no pueden exceder 1000 caracteres.' })
    notes?: string;

    @IsOptional()
    @IsArray({ message: 'Las fotos deben ser un array de objetos de foto.' })
    @ValidateNested({ each: true })
    @Type(() => ProgressPhotoDto)
    photos?: ProgressPhotoDto[];

    @IsOptional()
    @IsNumber({}, { message: 'La adherencia al plan debe ser un número.' })
    @Min(0, { message: 'La adherencia al plan no puede ser negativa.' })
    @Max(100, { message: 'La adherencia al plan no puede exceder 100.' })
    adherenceToPlan?: number;

    @IsOptional()
    @IsNumber({}, { message: 'El nivel de cómo se siente debe ser un número entero.' })
    @Min(1, { message: 'El nivel de cómo se siente debe ser al menos 1.' })
    @Max(5, { message: 'El nivel de cómo se siente no puede exceder 5.' })
    feelingLevel?: number;
}

// DTO para buscar logs de progreso (por rango de fechas)
export class SearchProgressLogsDto {
    @IsOptional()
    @IsDateString({}, { message: 'La fecha de inicio debe ser una fecha válida (YYYY-MM-DD).' })
    startDate?: string;

    @IsOptional()
    @IsDateString({}, { message: 'La fecha de fin debe ser una fecha válida (YYYY-MM-DD).' })
    endDate?: string;

    // Podríamos añadir paginación, filtros por tipo de métrica, etc.
}