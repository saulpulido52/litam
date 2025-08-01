import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    JoinColumn,
    CreateDateColumn,
    UpdateDateColumn,
    Index,
} from 'typeorm';
import { User } from './user.entity';

// Tipos de alertas de crecimiento
export enum GrowthAlertType {
    // Alertas de percentiles extremos
    SEVERE_UNDERWEIGHT = 'severe_underweight',           // < P3 peso para edad
    SEVERE_STUNTING = 'severe_stunting',                 // < P3 talla para edad
    SEVERE_WASTING = 'severe_wasting',                   // < P3 peso para talla
    SEVERE_OBESITY = 'severe_obesity',                   // > P97 IMC para edad
    
    // Alertas de cruzamiento de percentiles
    PERCENTILE_DROP = 'percentile_drop',                 // Caída > 2 líneas percentiles
    PERCENTILE_RISE = 'percentile_rise',                 // Aumento > 2 líneas percentiles
    
    // Alertas de velocidad de crecimiento
    GROWTH_VELOCITY_LOW = 'growth_velocity_low',         // Velocidad de crecimiento baja
    WEIGHT_LOSS = 'weight_loss',                         // Pérdida de peso
    
    // Alertas específicas pediátricas
    HEAD_CIRCUMFERENCE_ABNORMAL = 'head_circumference_abnormal', // Perímetro cefálico anormal
    FAILURE_TO_THRIVE = 'failure_to_thrive',             // Falla de medro
    
    // Alertas de edad específica
    NEWBORN_WEIGHT_LOSS = 'newborn_weight_loss',         // Pérdida de peso neonatal > 10%
    ADOLESCENT_GROWTH_SPURT = 'adolescent_growth_spurt', // Evaluación de pico de crecimiento
}

// Severidad de la alerta
export enum AlertSeverity {
    LOW = 'low',        // Requiere seguimiento
    MEDIUM = 'medium',  // Requiere evaluación
    HIGH = 'high',      // Requiere intervención inmediata
    CRITICAL = 'critical' // Emergencia nutricional
}

// Estado de la alerta
export enum AlertStatus {
    ACTIVE = 'active',       // Alerta activa
    ACKNOWLEDGED = 'acknowledged', // Reconocida por nutriólogo
    RESOLVED = 'resolved',   // Resuelta
    DISMISSED = 'dismissed'  // Descartada
}

@Entity('growth_alerts')
@Index(['patient_id', 'alert_type', 'status'])
@Index(['created_at', 'severity'])
export class GrowthAlert {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    // Paciente que genera la alerta
    @ManyToOne(() => User, { nullable: false, onDelete: 'CASCADE' })
    @JoinColumn({ name: 'patient_id' })
    patient!: User;

    @Column({ type: 'uuid', nullable: false })
    patient_id!: string;

    // Nutriólogo responsable (si está asignado)
    @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
    @JoinColumn({ name: 'nutritionist_id' })
    nutritionist?: User | null;

    @Column({ type: 'uuid', nullable: true })
    nutritionist_id?: string | null;

    // Tipo y severidad de la alerta
    @Column({
        type: 'enum',
        enum: GrowthAlertType,
        nullable: false,
    })
    alert_type!: GrowthAlertType;

    @Column({
        type: 'enum',
        enum: AlertSeverity,
        nullable: false,
    })
    severity!: AlertSeverity;

    @Column({
        type: 'enum',
        enum: AlertStatus,
        default: AlertStatus.ACTIVE,
        nullable: false,
    })
    status!: AlertStatus;

    // Información específica de la alerta
    @Column({ type: 'varchar', length: 255, nullable: false })
    title!: string; // Título de la alerta

    @Column({ type: 'text', nullable: false })
    description!: string; // Descripción detallada

    @Column({ type: 'text', nullable: true })
    clinical_interpretation?: string | null; // Interpretación clínica

    // Datos específicos que generaron la alerta
    @Column({ type: 'jsonb', nullable: false })
    alert_data!: {
        // Datos de medición que generaron la alerta
        current_measurement?: {
            date: Date;
            age_months: number;
            weight?: number;
            height?: number;
            bmi?: number;
            head_circumference?: number;
        };
        
        // Percentiles calculados
        percentiles?: {
            weight_for_age?: number;
            height_for_age?: number;
            bmi_for_age?: number;
            weight_for_height?: number;
            head_circumference_for_age?: number;
        };
        
        // Z-scores
        z_scores?: {
            weight_for_age?: number;
            height_for_age?: number;
            bmi_for_age?: number;
            weight_for_height?: number;
            head_circumference_for_age?: number;
        };
        
        // Datos de tendencia (para alertas de velocidad)
        trend_data?: {
            previous_measurement?: {
                date: Date;
                age_months: number;
                value: number;
            };
            change_rate?: number; // Cambio por unidad de tiempo
            time_period_months?: number;
            percentile_change?: number;
        };
        
        // Datos específicos por tipo de alerta
        specific_data?: any; // Datos específicos según el tipo de alerta
    };

    // Recomendaciones automáticas
    @Column({ type: 'jsonb', nullable: true })
    recommendations?: {
        immediate_actions?: string[]; // Acciones inmediatas recomendadas
        follow_up_schedule?: string; // Cronograma de seguimiento sugerido
        referrals?: string[]; // Derivaciones recomendadas
        monitoring_parameters?: string[]; // Parámetros a monitorear
        nutritional_interventions?: string[]; // Intervenciones nutricionales
    } | null;

    // Metadatos de la alerta
    @Column({ type: 'varchar', length: 100, nullable: true })
    trigger_source?: string | null; // Fuente que generó la alerta (manual, automática, etc.)

    @Column({ type: 'boolean', default: false })
    is_automated!: boolean; // Si fue generada automáticamente

    @Column({ type: 'boolean', default: false })
    requires_immediate_attention!: boolean; // Si requiere atención inmediata

    @Column({ type: 'date', nullable: true })
    expected_resolution_date?: Date | null; // Fecha esperada de resolución

    // Seguimiento de la alerta
    @Column({ type: 'timestamptz', nullable: true })
    acknowledged_at?: Date | null; // Cuándo fue reconocida

    @Column({ type: 'uuid', nullable: true })
    acknowledged_by_id?: string | null; // Quién la reconoció

    @Column({ type: 'timestamptz', nullable: true })
    resolved_at?: Date | null; // Cuándo fue resuelta

    @Column({ type: 'uuid', nullable: true })
    resolved_by_id?: string | null; // Quién la resolvió

    @Column({ type: 'text', nullable: true })
    resolution_notes?: string | null; // Notas de resolución

    // Notificaciones relacionadas
    @Column({ type: 'jsonb', nullable: true })
    notifications_sent?: {
        email_sent?: boolean;
        sms_sent?: boolean;
        push_sent?: boolean;
        in_app_sent?: boolean;
        sent_at?: Date;
        recipients?: string[];
    } | null;

    // Datos de seguimiento y auditoría
    @CreateDateColumn({ type: 'timestamptz' })
    created_at!: Date;

    @UpdateDateColumn({ type: 'timestamptz' })
    updated_at!: Date;

    // Métodos auxiliares para interpretación
    
    /**
     * Obtiene el color asociado a la severidad de la alerta
     */
    getSeverityColor(): string {
        switch (this.severity) {
            case AlertSeverity.LOW: return '#FFA500';      // Naranja
            case AlertSeverity.MEDIUM: return '#FF6B35';   // Rojo claro
            case AlertSeverity.HIGH: return '#DC143C';     // Rojo
            case AlertSeverity.CRITICAL: return '#8B0000'; // Rojo oscuro
            default: return '#808080';
        }
    }

    /**
     * Obtiene el icono asociado al tipo de alerta
     */
    getAlertIcon(): string {
        switch (this.alert_type) {
            case GrowthAlertType.SEVERE_UNDERWEIGHT: return '⚖️';
            case GrowthAlertType.SEVERE_STUNTING: return '📏';
            case GrowthAlertType.SEVERE_WASTING: return '⚠️';
            case GrowthAlertType.SEVERE_OBESITY: return '🔴';
            case GrowthAlertType.PERCENTILE_DROP: return '📉';
            case GrowthAlertType.PERCENTILE_RISE: return '📈';
            case GrowthAlertType.GROWTH_VELOCITY_LOW: return '🐌';
            case GrowthAlertType.WEIGHT_LOSS: return '📉';
            case GrowthAlertType.HEAD_CIRCUMFERENCE_ABNORMAL: return '🧠';
            case GrowthAlertType.FAILURE_TO_THRIVE: return '🚨';
            case GrowthAlertType.NEWBORN_WEIGHT_LOSS: return '👶';
            case GrowthAlertType.ADOLESCENT_GROWTH_SPURT: return '🚀';
            default: return '⚡';
        }
    }

    /**
     * Verifica si la alerta requiere acción inmediata
     */
    requiresImmediateAction(): boolean {
        return this.severity === AlertSeverity.CRITICAL || 
               this.requires_immediate_attention ||
               [
                   GrowthAlertType.SEVERE_UNDERWEIGHT,
                   GrowthAlertType.SEVERE_WASTING,
                   GrowthAlertType.FAILURE_TO_THRIVE,
                   GrowthAlertType.NEWBORN_WEIGHT_LOSS
               ].includes(this.alert_type);
    }

    /**
     * Genera un resumen ejecutivo de la alerta
     */
    getExecutiveSummary(): string {
        const icon = this.getAlertIcon();
        const severity = this.severity.toUpperCase();
        return `${icon} [${severity}] ${this.title}`;
    }
} 