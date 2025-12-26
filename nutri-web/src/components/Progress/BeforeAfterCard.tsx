import React from 'react';
import { TrendingUp, TrendingDown, Calendar } from 'lucide-react';

interface Measurement {
    weight: number;
    body_fat: number;
    muscle_mass: number;
    date: string;
}

interface BeforeAfterCardProps {
    firstMeasurement: Measurement;
    latestMeasurement: Measurement;
}

export const BeforeAfterCard: React.FC<BeforeAfterCardProps> = ({
    firstMeasurement,
    latestMeasurement
}) => {
    const daysBetween = Math.floor(
        (new Date(latestMeasurement.date).getTime() - new Date(firstMeasurement.date).getTime()) / (1000 * 60 * 60 * 24)
    );

    const weightChange = latestMeasurement.weight - firstMeasurement.weight;
    const fatChange = latestMeasurement.body_fat - firstMeasurement.body_fat;
    const muscleChange = latestMeasurement.muscle_mass - firstMeasurement.muscle_mass;

    const MetricRow = ({ label, before, after, change, unit, isPositiveGood = false }: any) => {
        const isGood = isPositiveGood ? change > 0 : change < 0;
        const changeColor = change === 0 ? 'text-secondary' : isGood ? 'text-success' : 'text-danger';
        const ChangeIcon = change > 0 ? TrendingUp : change < 0 ? TrendingDown : null;

        return (
            <div className="d-flex align-items-center justify-content-between py-3 border-bottom">
                <span className="small fw-medium text-secondary">{label}</span>
                <div className="d-flex align-items-center gap-3">
                    <div className="text-end">
                        <div className="text-muted" style={{ fontSize: '0.75rem' }}>Antes</div>
                        <div className="small fw-semibold">{before.toFixed(1)} {unit}</div>
                    </div>
                    <div className="text-muted">→</div>
                    <div className="text-end">
                        <div className="text-muted" style={{ fontSize: '0.75rem' }}>Ahora</div>
                        <div className="small fw-semibold">{after.toFixed(1)} {unit}</div>
                    </div>
                    <div className={`d-flex align-items-center gap-1 ${changeColor}`} style={{ minWidth: '80px', justifyContent: 'flex-end' }}>
                        {ChangeIcon && <ChangeIcon size={14} />}
                        <span className="small fw-bold">
                            {change > 0 ? '+' : ''}{change.toFixed(1)} {unit}
                        </span>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="bg-white rounded-3 shadow-lg p-4 border">
            <div className="d-flex align-items-center justify-content-between mb-4">
                <h3 className="h5 fw-bold text-dark mb-0">Comparación de Progreso</h3>
                <div className="d-flex align-items-center gap-2 small text-secondary">
                    <Calendar size={16} />
                    <span>{daysBetween} días</span>
                </div>
            </div>

            <div>
                <MetricRow
                    label="💪 Peso"
                    before={firstMeasurement.weight}
                    after={latestMeasurement.weight}
                    change={weightChange}
                    unit="kg"
                    isPositiveGood={false}
                />
                <MetricRow
                    label="🔥 Grasa Corporal"
                    before={firstMeasurement.body_fat}
                    after={latestMeasurement.body_fat}
                    change={fatChange}
                    unit="%"
                    isPositiveGood={false}
                />
                <MetricRow
                    label="💪 Masa Muscular"
                    before={firstMeasurement.muscle_mass}
                    after={latestMeasurement.muscle_mass}
                    change={muscleChange}
                    unit="kg"
                    isPositiveGood={true}
                />
            </div>

            {(weightChange < 0 && fatChange < 0 && muscleChange > 0) && (
                <div className="mt-3 p-3 bg-success-subtle border border-success rounded-3">
                    <p className="small text-success-emphasis fw-medium mb-0">
                        🎉 ¡Excelente progreso! Estás perdiendo grasa y ganando músculo.
                    </p>
                </div>
            )}
        </div>
    );
};
