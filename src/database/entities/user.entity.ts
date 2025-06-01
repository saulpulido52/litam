import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    ManyToOne,
    JoinColumn,
    OneToOne,
    OneToMany,
} from 'typeorm';
import { Role } from '@/database/entities/role.entity';
import { PatientProfile } from '@/database/entities/patient_profile.entity';
import { NutritionistProfile } from '@/database/entities/nutritionist_profile.entity';
import { PatientNutritionistRelation } from '@/database/entities/patient_nutritionist_relation.entity';
import bcrypt from 'bcrypt';

@Entity('users')
export class User {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column({ type: 'varchar', length: 255, unique: true, nullable: false })
    email!: string;

    @Column({ type: 'varchar', length: 255, nullable: false, select: false })
    password_hash!: string;

    @Column({ type: 'varchar', length: 100, nullable: true })
    first_name!: string | null; // Fixed: Added definite assignment assertion

    @Column({ type: 'varchar', length: 100, nullable: true })
    last_name!: string | null; // Fixed: Added definite assignment assertion

    @Column({ type: 'integer', nullable: true })
    age!: number | null; // Fixed: Added definite assignment assertion

    @Column({ type: 'varchar', length: 50, nullable: true })
    gender!: string | null; // Fixed: Added definite assignment assertion

    @ManyToOne(() => Role, (role) => role.users, { eager: true, nullable: false })
    @JoinColumn({ name: 'role_id' })
    role!: Role;

    @Column({ type: 'boolean', default: true })
    is_active!: boolean;

    @CreateDateColumn({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
    created_at!: Date;

    @UpdateDateColumn({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
    updated_at!: Date;

    @Column({ type: 'timestamptz', nullable: true })
    passwordChangedAt?: Date;

    @OneToOne(() => PatientProfile, (profile) => profile.user)
    patient_profile?: PatientProfile;

    @OneToOne(() => NutritionistProfile, (profile) => profile.user)
    nutritionist_profile?: NutritionistProfile;

    @OneToMany(() => PatientNutritionistRelation, (relation) => relation.patient)
    patient_relations_as_patient!: PatientNutritionistRelation[];

    @OneToMany(() => PatientNutritionistRelation, (relation) => relation.nutritionist)
    patient_relations_as_nutritionist!: PatientNutritionistRelation[];

    isPasswordChangedRecently(decodedIat: number): boolean {
        return !!this.passwordChangedAt && this.passwordChangedAt.getTime() / 1000 > decodedIat;
    }
}