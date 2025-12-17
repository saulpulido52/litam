// src/modules/relations/relation.dto.ts
import { IsUUID, IsOptional, IsString, Length } from 'class-validator';
import { RelationshipStatus } from '../../database/entities/patient_nutritionist_relation.entity';

// DTO para que un Paciente solicite vincularse con un Nutriólogo
export class RequestRelationDto {
    @IsUUID('4', { message: 'El ID del nutriólogo debe ser un UUID válido.' })
    nutritionistId!: string;
}

// DTO para que un Nutriólogo acepte/rechace una solicitud
export class UpdateRelationStatusDto {
    @IsString({ message: 'El estado debe ser una cadena de texto.' })
    @Length(1, 50, { message: 'El estado debe tener entre 1 y 50 caracteres.' })
    status!: RelationshipStatus; // Podríamos ser más específicos con un enum si fuera necesario
}

// DTO para añadir notas a una relación (nutriólogo)
export class AddRelationNotesDto {
    @IsOptional()
    @IsString({ message: 'Las notas deben ser una cadena de texto.' })
    @Length(0, 1000, { message: 'Las notas no pueden exceder los 1000 caracteres.' })
    notes?: string;
}