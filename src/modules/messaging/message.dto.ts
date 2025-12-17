// src/modules/messaging/message.dto.ts
import {
    IsString,
    IsNotEmpty,
    Length,
    IsUUID,
    IsBoolean,
    IsOptional,
} from 'class-validator';

// DTO para iniciar una nueva conversación
export class CreateConversationDto {
    @IsUUID('4', { message: 'El ID del participante debe ser un UUID válido.' })
    participantId!: string; // El otro participante de la conversación
}

// DTO para enviar un mensaje (vía REST API para historial)
export class SendMessageDto {
    @IsString({ message: 'El contenido del mensaje debe ser una cadena de texto.' })
    @IsNotEmpty({ message: 'El contenido del mensaje no puede estar vacío.' })
    @Length(1, 1000, { message: 'El mensaje debe tener entre 1 y 1000 caracteres.' })
    content!: string;
}

// DTO para marcar un mensaje como leído (vía REST API)
export class MarkMessageAsReadDto {
    @IsUUID('4', { message: 'El ID del mensaje debe ser un UUID válido.' })
    messageId!: string;
    
    @IsBoolean({ message: 'El estado de lectura debe ser un booleano.' })
    isRead!: boolean;
}