import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
} from 'typeorm';

@Entity('who_standards')
export class WhoStandard {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ type: 'varchar', length: 50, unique: true, nullable: false })
    nutrient_key!: string;

    @Column({ type: 'decimal', precision: 10, scale: 2, nullable: false })
    daily_limit_value!: number;

    @Column({ type: 'varchar', length: 10, nullable: true, default: 'g' })
    unit: string | null;

    @Column({ type: 'text', nullable: true })
    description: string | null;

    @Column({ type: 'varchar', length: 20, nullable: true, default: 'HIGH' })
    severity_level: string | null;
}
