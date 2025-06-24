// src/database/entities/message.entity.ts
import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    JoinColumn,
    CreateDateColumn,
    UpdateDateColumn,
} from 'typeorm';
import { Conversation } from '../../database/entities/conversation.entity'; // Para la conversación a la que pertenece
import { User } from '../../database/entities/user.entity'; // Para el remitente

@Entity('messages')
export class Message {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @ManyToOne(() => Conversation, (conversation) => conversation.messages, { nullable: false, onDelete: 'CASCADE' })
    @JoinColumn({ name: 'conversation_id' })
    conversation!: Conversation;

    @ManyToOne(() => User, (user) => user.sent_messages, { nullable: false, onDelete: 'RESTRICT' }) // RESTRICT para no borrar usuario si ha enviado mensajes
    @JoinColumn({ name: 'sender_user_id' })
    sender!: User;

    @Column({ type: 'text', nullable: false })
    content!: string; // El cuerpo del mensaje

    @Column({ type: 'boolean', default: false })
    is_read!: boolean; // Si el receptor ha leído el mensaje

    @CreateDateColumn({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
    timestamp!: Date; // Momento en que se envió el mensaje (alias de created_at)

    @UpdateDateColumn({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
    updated_at!: Date;
}