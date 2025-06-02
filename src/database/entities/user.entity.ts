// src/database/entities/user.entity.ts
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
import { Food } from '@/database/entities/food.entity';
import { DietPlan } from '@/database/entities/diet_plan.entity';
import { Appointment } from '@/database/entities/appointment.entity'; // <--- NUEVO
import { NutritionistAvailability } from '@/database/entities/nutritionist_availability.entity'; // <--- NUEVO
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
    first_name!: string | null;

    @Column({ type: 'varchar', length: 100, nullable: true })
    last_name!: string | null;

    @Column({ type: 'integer', nullable: true })
    age!: number | null;

    @Column({ type: 'varchar', length: 50, nullable: true })
    gender!: string | null;

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

    @OneToMany(() => Food, (food) => food.created_by_user)
    created_foods!: Food[];

    @OneToMany(() => DietPlan, (dietPlan) => dietPlan.patient)
    patient_diet_plans!: DietPlan[];

    @OneToMany(() => DietPlan, (dietPlan) => dietPlan.nutritionist)
    nutritionist_diet_plans!: DietPlan[];

    // --- NUEVAS RELACIONES para Citas y Disponibilidad ---
    @OneToMany(() => Appointment, (appointment) => appointment.patient)
    patient_appointments!: Appointment[];

    @OneToMany(() => Appointment, (appointment) => appointment.nutritionist)
    nutritionist_appointments!: Appointment[];

    @OneToMany(() => NutritionistAvailability, (availability) => availability.nutritionist)
    nutritionist_availabilities!: NutritionistAvailability[];


    isPasswordChangedRecently(decodedIat: number): boolean {
        return !!this.passwordChangedAt && this.passwordChangedAt.getTime() / 1000 > decodedIat;
    }
}