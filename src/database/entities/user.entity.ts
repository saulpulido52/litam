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
import { Role } from '../../database/entities/role.entity';
import { PatientProfile } from '../../database/entities/patient_profile.entity';
import { NutritionistProfile } from '../../database/entities/nutritionist_profile.entity';
import { PatientNutritionistRelation } from '../../database/entities/patient_nutritionist_relation.entity';
import { Food } from '../../database/entities/food.entity';
import { DietPlan } from '../../database/entities/diet_plan.entity';
import { Appointment } from '../../database/entities/appointment.entity';
import { NutritionistAvailability } from '../../database/entities/nutritionist_availability.entity';
import { PatientProgressLog } from '../../database/entities/patient_progress_log.entity';
import { UserSubscription } from '../../database/entities/user_subscription.entity';
import { PaymentTransaction } from '../../database/entities/payment_transaction.entity';
import { EducationalContent } from '../../database/entities/educational_content.entity';
import { Recipe } from '../../database/entities/recipe.entity';
import { Conversation } from '../../database/entities/conversation.entity';
import { Message } from '../../database/entities/message.entity';
import { ClinicalRecord } from '../../database/entities/clinical_record.entity'; // <--- NUEVO
import bcrypt from 'bcrypt';

export enum UserRegistrationType {
    ONLINE = 'online',      // Paciente se registra solo
    IN_PERSON = 'in_person', // Nutriólogo registra al paciente
}

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

    @Column({ type: 'varchar', length: 20, nullable: true })
    phone!: string | null;

    @Column({ type: 'date', nullable: true })
    birth_date!: Date | null;

    @Column({ type: 'integer', nullable: true })
    age!: number | null;

    @Column({ type: 'varchar', length: 50, nullable: true })
    gender!: string | null;

    @ManyToOne(() => Role, (role) => role.users, { eager: true, nullable: false })
    @JoinColumn({ name: 'role_id' })
    role!: Role;

    @Column({ type: 'boolean', default: true, nullable: false })
    is_active!: boolean;

    @Column({
        type: 'enum',
        enum: UserRegistrationType,
        default: UserRegistrationType.ONLINE,
        nullable: false,
    })
    registration_type!: UserRegistrationType;

    @Column({ type: 'boolean', default: false })
    has_temporary_password!: boolean;

    @Column({ type: 'timestamptz', nullable: true })
    temporary_password_expires_at!: Date | null;

    @Column({ type: 'boolean', default: false })
    requires_initial_setup!: boolean; // Si necesita completar su perfil

    @Column({ type: 'uuid', nullable: true })
    created_by_nutritionist_id!: string | null; // ID del nutriólogo que lo creó (escenario 1)

    @CreateDateColumn({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
    created_at!: Date;

    @UpdateDateColumn({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
    updated_at!: Date;

    @Column({ type: 'timestamptz', nullable: true })
    passwordChangedAt!: Date | null;

    @OneToOne(() => PatientProfile, (profile) => profile.user, { cascade: true })
    patient_profile?: PatientProfile;

    @OneToOne(() => NutritionistProfile, (profile) => profile.user)
    nutritionist_profile?: NutritionistProfile;

    @OneToMany(() => PatientNutritionistRelation, (relation) => relation.patient)
    patient_relations?: PatientNutritionistRelation[];

    @OneToMany(() => PatientNutritionistRelation, (relation) => relation.nutritionist)
    nutritionist_relations?: PatientNutritionistRelation[];

    @OneToMany(() => Food, (food) => food.created_by_user)
    created_foods!: Food[];

    @OneToMany(() => DietPlan, (dietPlan) => dietPlan.patient)
    patient_diet_plans!: DietPlan[];

    @OneToMany(() => DietPlan, (dietPlan) => dietPlan.nutritionist)
    nutritionist_diet_plans!: DietPlan[];

    @OneToMany(() => Appointment, (appointment) => appointment.patient)
    patient_appointments!: Appointment[];

    @OneToMany(() => Appointment, (appointment) => appointment.nutritionist)
    nutritionist_appointments!: Appointment[];

    @OneToMany(() => NutritionistAvailability, (availability) => availability.nutritionist)
    nutritionist_availabilities!: NutritionistAvailability[];

    @OneToMany(() => PatientProgressLog, (log) => log.patient)
    patient_progress_logs!: PatientProgressLog[];

    @OneToMany(() => UserSubscription, (subscription) => subscription.user)
    subscriptions?: UserSubscription[];

    @OneToMany(() => PaymentTransaction, (transaction) => transaction.user)
    payment_transactions!: PaymentTransaction[];

    @OneToMany(() => EducationalContent, (content) => content.created_by)
    created_educational_content!: EducationalContent[];

    @OneToMany(() => EducationalContent, (content) => content.last_modified_by)
    modified_educational_content!: EducationalContent[];

    @OneToMany(() => Recipe, (recipe) => recipe.created_by)
    created_recipes!: Recipe[];

    @OneToMany(() => Recipe, (recipe) => recipe.last_modified_by)
    modified_recipes!: Recipe[];

    @OneToMany(() => Conversation, (conversation) => conversation.participant1)
    conversations_as_participant1!: Conversation[];

    @OneToMany(() => Conversation, (conversation) => conversation.participant2)
    conversations_as_participant2!: Conversation[];

    @OneToMany(() => Message, (message) => message.sender)
    sent_messages!: Message[];

    // --- NUEVAS RELACIONES para Historia Clínica ---
    @OneToMany(() => ClinicalRecord, (record) => record.patient)
    patient_clinical_records!: ClinicalRecord[];

    @OneToMany(() => ClinicalRecord, (record) => record.nutritionist)
    nutritionist_created_clinical_records!: ClinicalRecord[];

    isPasswordChangedRecently(decodedIat: number): boolean {
        return !!this.passwordChangedAt && this.passwordChangedAt.getTime() / 1000 > decodedIat;
    }
}