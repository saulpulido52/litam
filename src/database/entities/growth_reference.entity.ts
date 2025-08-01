// src/database/entities/growth_reference.entity.ts
import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    Index,
    CreateDateColumn,
    UpdateDateColumn,
} from 'typeorm';

export enum GrowthReferenceSource {
    WHO = 'WHO', // Organización Mundial de la Salud
    CDC = 'CDC'  // Centers for Disease Control and Prevention
}

export enum GrowthMetricType {
    WEIGHT_FOR_AGE = 'weight_for_age',           // Peso para edad
    HEIGHT_FOR_AGE = 'height_for_age',           // Talla para edad  
    WEIGHT_FOR_HEIGHT = 'weight_for_height',     // Peso para talla
    BMI_FOR_AGE = 'bmi_for_age',                 // IMC para edad
    HEAD_CIRCUMFERENCE = 'head_circumference'    // Perímetro cefálico
}

export enum Gender {
    MALE = 'male',
    FEMALE = 'female'
}

@Entity('growth_references')
@Index(['source', 'metric_type', 'gender', 'age_months'], { unique: true })
export class GrowthReference {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column({
        type: 'enum',
        enum: GrowthReferenceSource,
        nullable: false,
    })
    source!: GrowthReferenceSource; // OMS o CDC

    @Column({
        type: 'enum',
        enum: GrowthMetricType,
        nullable: false,
    })
    metric_type!: GrowthMetricType; // Tipo de métrica (peso/edad, talla/edad, etc.)

    @Column({
        type: 'enum',
        enum: Gender,
        nullable: false,
    })
    gender!: Gender; // Masculino o Femenino

    @Column({ type: 'integer', nullable: false })
    age_months!: number; // Edad en meses (0-240 para OMS, 0-240 para CDC)

    // Percentiles estándar (P3, P5, P10, P15, P25, P50, P75, P85, P90, P95, P97)
    @Column({ type: 'decimal', precision: 8, scale: 4, nullable: true })
    p3!: number; // Percentil 3

    @Column({ type: 'decimal', precision: 8, scale: 4, nullable: true })
    p5!: number; // Percentil 5

    @Column({ type: 'decimal', precision: 8, scale: 4, nullable: true })
    p10!: number; // Percentil 10

    @Column({ type: 'decimal', precision: 8, scale: 4, nullable: true })
    p15!: number; // Percentil 15

    @Column({ type: 'decimal', precision: 8, scale: 4, nullable: true })
    p25!: number; // Percentil 25

    @Column({ type: 'decimal', precision: 8, scale: 4, nullable: true })
    p50!: number; // Percentil 50 (mediana)

    @Column({ type: 'decimal', precision: 8, scale: 4, nullable: true })
    p75!: number; // Percentil 75

    @Column({ type: 'decimal', precision: 8, scale: 4, nullable: true })
    p85!: number; // Percentil 85

    @Column({ type: 'decimal', precision: 8, scale: 4, nullable: true })
    p90!: number; // Percentil 90

    @Column({ type: 'decimal', precision: 8, scale: 4, nullable: true })
    p95!: number; // Percentil 95

    @Column({ type: 'decimal', precision: 8, scale: 4, nullable: true })
    p97!: number; // Percentil 97

    // Parámetros LMS para cálculo preciso de percentiles
    @Column({ type: 'decimal', precision: 10, scale: 6, nullable: true })
    l_lambda!: number; // Parámetro de transformación Box-Cox

    @Column({ type: 'decimal', precision: 10, scale: 6, nullable: true })
    m_mu!: number; // Mediana

    @Column({ type: 'decimal', precision: 10, scale: 6, nullable: true })
    s_sigma!: number; // Coeficiente de variación

    // Metadatos adicionales
    @Column({ type: 'text', nullable: true })
    notes?: string; // Notas específicas para esta referencia

    @Column({ type: 'varchar', length: 50, nullable: true })
    version?: string; // Versión de la referencia (ej: "WHO 2006", "CDC 2000")

    @CreateDateColumn()
    created_at!: Date;

    @UpdateDateColumn()
    updated_at!: Date;

    // Métodos auxiliares para interpretación
    getPercentileValue(percentile: number): number | null {
        switch (percentile) {
            case 3: return this.p3;
            case 5: return this.p5;
            case 10: return this.p10;
            case 15: return this.p15;
            case 25: return this.p25;
            case 50: return this.p50;
            case 75: return this.p75;
            case 85: return this.p85;
            case 90: return this.p90;
            case 95: return this.p95;
            case 97: return this.p97;
            default: return null;
        }
    }

    // Calcular Z-score usando método LMS
    calculateZScore(value: number): number | null {
        if (!this.l_lambda || !this.m_mu || !this.s_sigma) {
            return null;
        }

        const L = this.l_lambda;
        const M = this.m_mu;
        const S = this.s_sigma;

        if (L !== 0) {
            return (Math.pow(value / M, L) - 1) / (L * S);
        } else {
            return Math.log(value / M) / S;
        }
    }

    // Interpretación del percentil
    interpretPercentile(percentile: number): string {
        if (percentile < 3) return 'Muy bajo (< P3)';
        if (percentile < 10) return 'Bajo (P3-P10)';
        if (percentile < 25) return 'Bajo normal (P10-P25)';
        if (percentile <= 75) return 'Normal (P25-P75)';
        if (percentile <= 90) return 'Alto normal (P75-P90)';
        if (percentile <= 97) return 'Alto (P90-P97)';
        return 'Muy alto (> P97)';
    }
} 