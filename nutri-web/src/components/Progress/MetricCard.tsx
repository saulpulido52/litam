import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface MetricCardProps {
    title: string;
    value: number | string;
    unit: string;
    change?: number;
    icon: React.ReactNode;
    gradient: 'weight' | 'fat' | 'muscle' | 'bmi';
    isPositiveGood?: boolean;
}

export const MetricCard: React.FC<MetricCardProps> = ({
    title,
    value,
    unit,
    change,
    icon,
    gradient,
    isPositiveGood = false
}) => {
    const getChangeColor = () => {
        if (!change || change === 0) return 'text-white-50';

        const isIncrease = change > 0;
        const isGoodChange = isPositiveGood ? isIncrease : !isIncrease;

        return isGoodChange ? 'text-success' : 'text-danger';
    };

    const getChangeIcon = () => {
        if (!change || change === 0) return <Minus size={16} />;
        return change > 0 ? <TrendingUp size={16} /> : <TrendingDown size={16} />;
    };

    const gradientStyles: Record<string, React.CSSProperties> = {
        weight: {
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        },
        fat: {
            background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
        },
        muscle: {
            background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
        },
        bmi: {
            background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
        }
    };

    return (
        <div
            className="rounded-3 p-4 text-white shadow-lg position-relative overflow-hidden"
            style={{
                ...gradientStyles[gradient],
                transition: 'all 0.3s ease',
                cursor: 'pointer'
            }}
            onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = '0 8px 16px rgba(0,0,0,0.2)';
            }}
            onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '';
            }}
        >
            <div className="d-flex align-items-start justify-content-between mb-3">
                <div style={{ fontSize: '2.5rem', opacity: 0.9, animation: 'pulse 3s infinite' }}>
                    {icon}
                </div>
                {change !== undefined && (
                    <div className={`d-flex align-items-center gap-1 small fw-medium ${getChangeColor()}`}>
                        {getChangeIcon()}
                        <span>{Math.abs(change).toFixed(1)} {unit}</span>
                    </div>
                )}
            </div>

            <div>
                <h6 className="small fw-medium mb-1" style={{ opacity: 0.9 }}>{title}</h6>
                <p className="h2 fw-bold mb-0" style={{ letterSpacing: '-0.5px' }}>
                    {typeof value === 'number' ? value.toFixed(1) : value} <span className="h5" style={{ opacity: 0.9 }}>{unit}</span>
                </p>
            </div>
        </div>
    );
};
