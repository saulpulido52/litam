import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    JoinColumn,
    CreateDateColumn,
    UpdateDateColumn,
    Unique,
} from 'typeorm';
import { User } from '../../database/entities/user.entity';
import { RoleName } from '../../database/entities/role.entity';

export enum RelationshipStatus {
    PENDING = 'pending',
    ACTIVE = 'active',
    INACTIVE = 'inactive',
    REJECTED = 'rejected',
    BLOCKED = 'blocked',
}

@Entity('patient_nutritionist_relations')
@Unique(['patient', 'nutritionist'])
export class PatientNutritionistRelation {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @ManyToOne(() => User, { nullable: false,  onDelete: 'CASCADE'  })
    @JoinColumn({ name: 'patient_user_id' })
    patient!: User;

    @ManyToOne(() => User, { nullable: false, onDelete: 'CASCADE' })
    @JoinColumn({ name: 'nutritionist_user_id' })
    nutritionist!: User;

    @Column({
        type: 'enum',
        enum: RelationshipStatus,
        default: RelationshipStatus.PENDING,
        nullable: false,
    })
    status!: RelationshipStatus;

    @Column({ type: 'text', nullable: true })
    notes!: string | null; // Fixed: Added definite assignment assertion

    @CreateDateColumn({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
    requested_at!: Date;

    @Column({ type: 'timestamptz', nullable: true })
    accepted_at!: Date | null; // Fixed: Added definite assignment assertion

    @Column({ type: 'timestamptz', nullable: true })
    ended_at!: Date | null; // Fixed: Added definite assignment assertion

    @UpdateDateColumn({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
    updated_at!: Date;
}
