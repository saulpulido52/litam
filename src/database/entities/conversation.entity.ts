// src/database/entities/conversation.entity.ts
import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    JoinColumn,
    CreateDateColumn,
    UpdateDateColumn,
    OneToMany,
    Unique,
} from 'typeorm';
import { User } from '../../database/entities/user.entity'; // Para los participantes
import { Message } from './message.entity'; // Para los mensajes en la conversación

@Entity('conversations')
@Unique(['participant1', 'participant2']) // Una conversación única entre dos participantes
export class Conversation {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    // Participante 1 (generalmente el que inicia o el ID menor para unicidad)
    @ManyToOne(() => User, (user) => user.conversations_as_participant1, { nullable: false, onDelete: 'CASCADE' })
    @JoinColumn({ name: 'participant1_user_id' })
    participant1!: User;

    // Participante 2
    @ManyToOne(() => User, (user) => user.conversations_as_participant2, { nullable: false, onDelete: 'CASCADE' })
    @JoinColumn({ name: 'participant2_user_id' })
    participant2!: User;

    @Column({ type: 'timestamptz', nullable: false, default: () => 'CURRENT_TIMESTAMP' })
    last_message_at!: Date; // Para ordenar las conversaciones por actividad reciente

    @Column({ type: 'boolean', default: true })
    is_active!: boolean; // Si la conversación está activa (no archivada/eliminada)

    @OneToMany(() => Message, (message) => message.conversation)
    messages!: Message[]; // Mensajes dentro de esta conversación

    @CreateDateColumn({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
    created_at!: Date;

    @UpdateDateColumn({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
    updated_at!: Date;
}