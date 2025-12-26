import React from 'react';
import { TrendingUp, TrendingDown, Award, Calendar, Target, Zap } from 'lucide-react';

interface ProgressEntry {
    date: string;
    weight: number;
    body_fat: number;
    muscle_mass: number;
}

interface InsightsPanelProps {
    entries: ProgressEntry[];
    patientName?: string;
}

interface Insight {
    type: 'success' | 'info' | 'warning' | 'achievement';
    icon: React.ReactNode;
    title: string;
    description: string;
}

export const InsightsPanel: React.FC<InsightsPanelProps> = ({ entries }) => {
    const generateInsights = (): Insight[] => {
        if (entries.length < 2) {
            return [{
                type: 'info',
                icon: <Calendar size={20} />,
                title: 'Comienza tu seguimiento',
                description: 'Registra mediciones regularmente para obtener insights personalizados'
            }];
        }

        const insights: Insight[] = [];
        const sortedEntries = [...entries].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        const first = sortedEntries[0];
        const latest = sortedEntries[sortedEntries.length - 1];

        const daysBetween = Math.floor(
            (new Date(latest.date).getTime() - new Date(first.date).getTime()) / (1000 * 60 * 60 * 24)
        );

        // Weight trend
        const weightLoss = first.weight - latest.weight;
        if (weightLoss > 0) {
            insights.push({
                type: 'success',
                icon: <TrendingDown size={20} />,
                title: '¡Excelente progreso de peso!',
                description: `Has perdido ${weightLoss.toFixed(1)} kg en ${daysBetween} días. Ritmo: ${(weightLoss / (daysBetween / 7)).toFixed(2)} kg/semana`
            });
        } else if (weightLoss < -2) {
            insights.push({
                type: 'warning',
                icon: <TrendingUp size={20} />,
                title: 'Aumento de peso detectado',
                description: `Has ganado ${Math.abs(weightLoss).toFixed(1)} kg. Revisa tu plan nutricional`
            });
        }

        // Body composition
        const fatLoss = first.body_fat - latest.body_fat;
        const muscleGain = latest.muscle_mass - first.muscle_mass;

        if (fatLoss > 0 && muscleGain > 0) {
            insights.push({
                type: 'achievement',
                icon: <Award size={20} />,
                title: '¡Composición corporal perfecta!',
                description: `Perdiste ${fatLoss.toFixed(1)}% de grasa y ganaste ${muscleGain.toFixed(1)} kg de músculo`
            });
        } else if (fatLoss > 2) {
            insights.push({
                type: 'success',
                icon: <Zap size={20} />,
                title: 'Reducción de grasa corporal',
                description: `Has reducido ${fatLoss.toFixed(1)}% de grasa corporal - ¡Sigue así!`
            });
        }

        // Consistency
        const thisMonth = entries.filter(e => {
            const entryDate = new Date(e.date);
            const now = new Date();
            return entryDate.getMonth() === now.getMonth() && entryDate.getFullYear() === now.getFullYear();
        });

        if (thisMonth.length >= 4) {
            insights.push({
                type: 'achievement',
                icon: <Calendar size={20} />,
                title: 'Muy consistente',
                description: `${thisMonth.length} mediciones este mes. La consistencia es clave para el éxito`
            });
        } else if (thisMonth.length <= 1 && daysBetween > 30) {
            insights.push({
                type: 'info',
                icon: <Calendar size={20} />,
                title: 'Aumenta la frecuencia',
                description: 'Intenta medir tu progreso al menos 1 vez por semana para mejores resultados'
            });
        }

        // Rate of progress
        const weeksElapsed = daysBetween / 7;
        const weeklyRate = weightLoss / weeksElapsed;

        if (weeklyRate > 0.3 && weeklyRate < 1) {
            insights.push({
                type: 'success',
                icon: <Target size={20} />,
                title: 'Ritmo ideal de pérdida',
                description: `Tu ritmo de ${weeklyRate.toFixed(2)} kg/semana es saludable y sostenible`
            });
        } else if (weeklyRate > 1) {
            insights.push({
                type: 'warning',
                icon: <TrendingDown size={20} />,
                title: 'Pérdida muy rápida',
                description: `${weeklyRate.toFixed(2)} kg/semana puede ser muy agresivo. Consulta con tu nutriólogo`
            });
        }

        // If no insights, add a motivational one
        if (insights.length === 0) {
            insights.push({
                type: 'info',
                icon: <Zap size={20} />,
                title: 'Mantén el enfoque',
                description: 'Continúa con tu plan y los resultados llegarán. ¡Tú puedes!'
            });
        }

        return insights.slice(0, 5); // Max 5 insights
    };

    const insights = generateInsights();

    const getInsightStyle = (type: string) => {
        switch (type) {
            case 'success':
                return { bg: 'bg-success-subtle', border: 'border-success', text: 'text-success-emphasis' };
            case 'achievement':
                return { bg: 'bg-primary-subtle', border: 'border-primary', text: 'text-primary-emphasis' };
            case 'warning':
                return { bg: 'bg-warning-subtle', border: 'border-warning', text: 'text-warning-emphasis' };
            default:
                return { bg: 'bg-info-subtle', border: 'border-info', text: 'text-info-emphasis' };
        }
    };

    const getIconColor = (type: string) => {
        switch (type) {
            case 'success':
                return 'text-success';
            case 'achievement':
                return 'text-primary';
            case 'warning':
                return 'text-warning';
            default:
                return 'text-info';
        }
    };

    return (
        <div className="bg-white rounded-3 shadow-lg p-4 border">
            <div className="d-flex align-items-center gap-2 mb-4">
                <Zap className="text-warning" size={24} />
                <h3 className="h5 fw-bold text-dark mb-0">Insights Automáticos</h3>
            </div>

            <div className="d-flex flex-column gap-3">
                {insights.map((insight, index) => {
                    const styles = getInsightStyle(insight.type);
                    return (
                        <div
                            key={index}
                            className={`p-3 rounded-3 border-2 ${styles.bg} ${styles.border} ${styles.text}`}
                            style={{ transition: 'all 0.3s ease' }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.1)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.boxShadow = '';
                            }}
                        >
                            <div className="d-flex align-items-start gap-3">
                                <div className={`flex-shrink-0 ${getIconColor(insight.type)}`}>
                                    {insight.icon}
                                </div>
                                <div className="flex-fill">
                                    <h4 className="fw-semibold small mb-1">{insight.title}</h4>
                                    <p className="small mb-0" style={{ opacity: 0.9 }}>{insight.description}</p>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {entries.length >= 5 && (
                <div
                    className="mt-4 p-3 rounded-3 border"
                    style={{
                        background: 'linear-gradient(135deg, #e0e7ff 0%, #ede9fe 100%)',
                        borderColor: '#c7d2fe'
                    }}
                >
                    <p className="small text-center mb-0 fw-medium" style={{ color: '#4f46e5' }}>
                        🎉 ¡{entries.length} mediciones registradas! Sigue así para obtener insights más precisos
                    </p>
                </div>
            )}
        </div>
    );
};
