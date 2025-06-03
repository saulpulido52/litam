// src/modules/messaging/message.service.ts
import { Repository, Not, In } from 'typeorm';
import { AppDataSource } from '@/database/data-source';
import { User } from '@/database/entities/user.entity';
import { Conversation } from '@/database/entities/conversation.entity';
import { Message } from '@/database/entities/message.entity';
import { PatientNutritionistRelation, RelationshipStatus } from '@/database/entities/patient_nutritionist_relation.entity';
import {
    CreateConversationDto,
    SendMessageDto,
    MarkMessageAsReadDto,
} from '@/modules/messaging/message.dto';
import { AppError } from '@/utils/app.error';
import { RoleName } from '@/database/entities/role.entity';

class MessageService {
    private userRepository: Repository<User>;
    private conversationRepository: Repository<Conversation>;
    private messageRepository: Repository<Message>;
    private relationRepository: Repository<PatientNutritionistRelation>;

    constructor() {
        this.userRepository = AppDataSource.getRepository(User);
        this.conversationRepository = AppDataSource.getRepository(Conversation);
        this.messageRepository = AppDataSource.getRepository(Message);
        this.relationRepository = AppDataSource.getRepository(PatientNutritionistRelation);
    }

    // Helper para ordenar los participantes y asegurar unicidad de conversación
    private getSortedParticipants(user1Id: string, user2Id: string): { p1: string; p2: string } {
        return user1Id < user2Id ? { p1: user1Id, p2: user2Id } : { p1: user2Id, p2: user1Id };
    }

    // --- Gestión de Conversaciones ---

    public async createOrGetConversation(starterId: string, createDto: CreateConversationDto) {
        const otherParticipantId = createDto.participantId;

        if (starterId === otherParticipantId) {
            throw new AppError('No puedes iniciar una conversación contigo mismo.', 400);
        }

        const starterUser = await this.userRepository.findOne({ where: { id: starterId }, relations: ['role'] });
        const otherUser = await this.userRepository.findOne({ where: { id: otherParticipantId }, relations: ['role'] });

        if (!starterUser || !otherUser) {
            throw new AppError('Uno o ambos participantes no encontrados.', 404);
        }

        // Reglas de negocio para iniciar conversación:
        // - Paciente solo puede hablar con su nutriólogo activo.
        // - Nutriólogo solo puede hablar con sus pacientes activos.
        // - Administradores pueden iniciar con cualquiera (por ahora, no se implementa su rol aquí explícitamente).
        if (starterUser.role.name === RoleName.PATIENT && otherUser.role.name === RoleName.NUTRITIONIST) {
            const relation = await this.relationRepository.findOne({
                where: { patient: { id: starterId }, nutritionist: { id: otherParticipantId }, status: RelationshipStatus.ACTIVE },
            });
            if (!relation) {
                throw new AppError('El paciente solo puede iniciar conversación con su nutriólogo activo.', 403);
            }
        } else if (starterUser.role.name === RoleName.NUTRITIONIST && otherUser.role.name === RoleName.PATIENT) {
            const relation = await this.relationRepository.findOne({
                where: { patient: { id: otherParticipantId }, nutritionist: { id: starterId }, status: RelationshipStatus.ACTIVE },
            });
            if (!relation) {
                throw new AppError('El nutriólogo solo puede iniciar conversación con sus pacientes activos.', 403);
            }
        } else {
            throw new AppError('Conversaciones solo permitidas entre paciente y nutriólogo vinculado.', 403);
        }

        const { p1, p2 } = this.getSortedParticipants(starterId, otherParticipantId);

        let conversation = await this.conversationRepository.findOne({
            where: [
                { participant1: { id: p1 }, participant2: { id: p2 } },
            ],
        });

        if (!conversation) {
            conversation = this.conversationRepository.create({
                participant1: starterId < otherParticipantId ? starterUser : otherUser,
                participant2: starterId < otherParticipantId ? otherUser : starterUser,
                is_active: true,
                last_message_at: new Date(),
            });
            await this.conversationRepository.save(conversation);
        } else if (!conversation.is_active) {
            conversation.is_active = true; // Reactivar si estaba inactiva
            await this.conversationRepository.save(conversation);
        }

        return conversation;
    }

    public async getUserConversations(userId: string) {
        const conversations = await this.conversationRepository.find({
            where: [
                { participant1: { id: userId }, is_active: true },
                { participant2: { id: userId }, is_active: true },
            ],
            relations: ['participant1', 'participant2'],
            order: { last_message_at: 'DESC' }, // Ordenar por actividad reciente
        });

        // Ocultar hashes de contraseña
        return conversations.map(conv => {
            const { password_hash: p1Hash, ...p1Clean } = conv.participant1;
            const { password_hash: p2Hash, ...p2Clean } = conv.participant2;
            return {
                ...conv,
                participant1: p1Clean,
                participant2: p2Clean,
            };
        });
    }

    // --- Gestión de Mensajes ---

    public async getConversationMessages(conversationId: string, userId: string, page: number = 1, limit: number = 50) {
        const conversation = await this.conversationRepository.findOne({
            where: { id: conversationId, is_active: true },
            relations: ['participant1', 'participant2'],
        });

        if (!conversation) {
            throw new AppError('Conversación no encontrada o inactiva.', 404);
        }

        // Verificar que el usuario que solicita los mensajes es parte de la conversación
        if (conversation.participant1.id !== userId && conversation.participant2.id !== userId) {
            throw new AppError('No tienes permiso para ver esta conversación.', 403);
        }

        const skip = (page - 1) * limit;
        const [messages, total] = await this.messageRepository.findAndCount({
            where: { conversation: { id: conversationId } },
            relations: ['sender'],
            order: { timestamp: 'ASC' }, // Ordenar cronológicamente
            skip: skip,
            take: limit,
        });

        // Marcar mensajes como leídos si el receptor es el que los lee
        // (Esto se haría en una lógica de "abrir chat", no necesariamente en cada GET)
        // const unreadMessagesForUser = messages.filter(msg => !msg.is_read && msg.sender.id !== userId);
        // if (unreadMessagesForUser.length > 0) {
        //     unreadMessagesForUser.forEach(msg => msg.is_read = true);
        //     await this.messageRepository.save(unreadMessagesForUser);
        // }

        // Ocultar hashes de contraseña de los remitentes
        const cleanMessages = messages.map(msg => {
            const { password_hash, ...senderClean } = msg.sender;
            return { ...msg, sender: senderClean };
        });

        return {
            messages: cleanMessages,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        };
    }

    public async saveMessage(conversationId: string, senderId: string, content: string) {
        const conversation = await this.conversationRepository.findOne({
            where: { id: conversationId, is_active: true },
            relations: ['participant1', 'participant2'],
        });
        const sender = await this.userRepository.findOne({ where: { id: senderId } });

        if (!conversation || !sender) {
            throw new AppError('Conversación o remitente no encontrados.', 404);
        }
        // Verificar que el remitente es un participante válido de la conversación
        if (conversation.participant1.id !== senderId && conversation.participant2.id !== senderId) {
            throw new AppError('No eres participante de esta conversación.', 403);
        }

        const newMessage = this.messageRepository.create({
            conversation: conversation,
            sender: sender,
            content: content,
            timestamp: new Date(),
            is_read: false, // Por defecto no leído por el receptor
        });

        await this.messageRepository.save(newMessage);

        // Actualizar last_message_at en la conversación
        conversation.last_message_at = newMessage.timestamp;
        await this.conversationRepository.save(conversation);

        const { password_hash, ...senderClean } = newMessage.sender; // Ocultar hash
        return { ...newMessage, sender: senderClean };
    }

    public async markMessageAsRead(messageId: string, readerId: string) {
        const message = await this.messageRepository.findOne({
            where: { id: messageId },
            relations: ['conversation', 'conversation.participant1', 'conversation.participant2'],
        });

        if (!message) {
            throw new AppError('Mensaje no encontrado.', 404);
        }

        // Verificar que el que marca como leído es el RECEPTOR del mensaje
        // (es decir, es un participante de la conversación y no el remitente)
        const isParticipant = message.conversation.participant1.id === readerId || message.conversation.participant2.id === readerId;
        const isSender = message.sender.id === readerId;

        if (!isParticipant || isSender) { // Si no es participante o si es el remitente
            throw new AppError('No tienes permiso para marcar este mensaje como leído.', 403);
        }
        
        message.is_read = true;
        await this.messageRepository.save(message);
        return message;
    }
}

export default new MessageService();