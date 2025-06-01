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
import { Role } from '@/database/entities/role.entity'; // Ruta corregida
import { PatientProfile } from '@/database/entities/patient_profile.entity'; // Nueva entidad, ruta corregida
import { NutritionistProfile } from '@/database/entities/nutritionist_profile.entity'; // Nueva entidad, ruta corregida
import { PatientNutritionistRelation } from '@/database/entities/patient_nutritionist_relation.entity'; // Nueva entidad, ruta corregida
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
    first_name: string | null;

    @Column({ type: 'varchar', length: 100, nullable: true })
    last_name: string | null;

    @Column({ type: 'integer', nullable: true })
    age: number | null;

    @Column({ type: 'varchar', length: 50, nullable: true })
    gender: string | null;

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

    // Nuevas relaciones OneToOne con los perfiles específicos
    @OneToOne(() => PatientProfile, (profile) => profile.user)
    patient_profile?: PatientProfile;

    @OneToOne(() => NutritionistProfile, (profile) => profile.user)
    nutritionist_profile?: NutritionistProfile;

    // Relaciones para paciente-nutriólogo (si este usuario es un paciente o un nutriólogo)
    @OneToMany(() => PatientNutritionistRelation, (relation) => relation.patient)
    patient_relations_as_patient!: PatientNutritionistRelation[];

    @OneToMany(() => PatientNutritionistRelation, (relation) => relation.nutritionist)
    patient_relations_as_nutritionist!: PatientNutritionistRelation[];

    // Método para verificar si la contraseña ha sido cambiada recientemente
    isPasswordChangedRecently(decodedIat: number): boolean {
        // Compara el timestamp de cambio de contraseña (en segundos) con el de emisión del token (iat, en segundos)
        return !!this.passwordChangedAt && this.passwordChangedAt.getTime() / 1000 > decodedIat;
    }
}