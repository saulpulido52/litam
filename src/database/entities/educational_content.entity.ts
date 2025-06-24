// src/database/entities/educational_content.entity.ts
import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    JoinColumn,
    CreateDateColumn,
    UpdateDateColumn,
    OneToMany, // Para enlaces a recetas si fuera necesario
} from 'typeorm';
import { User } from '../../database/entities/user.entity'; // Para el creador/editor

// Tipos de contenido
export enum ContentType {
    ARTICLE = 'article', // Artículo informativo
    RECIPE = 'recipe', // Receta (también puede tener su propia entidad más compleja)
    GUIDE = 'guide', // Guía completa
    VIDEO = 'video', // Enlace a video
}

@Entity('educational_content')
export class EducationalContent {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column({ type: 'varchar', length: 255, nullable: false })
    title!: string;

    @Column({ type: 'text', nullable: true })
    summary: string | null; // Resumen corto del contenido

    @Column({ type: 'text', nullable: false })
    content_body!: string; // Cuerpo principal del artículo (HTML, Markdown o texto plano)

    @Column({
        type: 'enum',
        enum: ContentType,
        nullable: false,
        default: ContentType.ARTICLE,
    })
    type!: ContentType;

    @Column('text', { array: true, nullable: true })
    tags: string[] | null; // Ej: ['nutricion', 'salud', 'recetas', 'pérdida de peso']

    @Column({ type: 'varchar', length: 255, nullable: true })
    cover_image_url: string | null; // URL de una imagen de portada

    @Column({ type: 'boolean', default: true })
    is_published!: boolean; // Si el contenido está visible para los usuarios

    @Column({ type: 'timestamptz', nullable: true })
    published_at: Date | null;

    @ManyToOne(() => User, { nullable: false, onDelete: 'RESTRICT' }) // Restrict para no borrar usuario si ha creado contenido
    @JoinColumn({ name: 'created_by_user_id' })
    created_by!: User;

    @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' }) // Quién lo modificó por última vez
    @JoinColumn({ name: 'last_modified_by_user_id' })
    last_modified_by: User | null;

    @CreateDateColumn({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
    created_at!: Date;

    @UpdateDateColumn({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
    updated_at!: Date;
}