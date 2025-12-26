import React, { useState, useEffect } from 'react';
import { Target, Calendar, TrendingDown } from 'lucide-react';
import { ProgressRing } from './ProgressRing';

interface SimpleGoalProps {
    currentWeight: number;
    initialWeight?: number;
    patientId: string;
}

interface Goal {
    targetWeight: number;
    deadline: string;
    weeklyGoal: number;
}

export const SimpleGoal: React.FC<SimpleGoalProps> = ({
    currentWeight,
    initialWeight,
    patientId
}) => {
    const [goal, setGoal] = useState<Goal | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        targetWeight: '',
        deadline: '',
        weeklyGoal: '0.5'
    });

    // Convert to numbers for calculations
    const currentWeightNum = Number(currentWeight);
    const initialWeightNum = initialWeight ? Number(initialWeight) : currentWeightNum;

    // Load goal from localStorage
    useEffect(() => {
        const savedGoal = localStorage.getItem(`goal_${patientId}`);
        if (savedGoal) {
            setGoal(JSON.parse(savedGoal));
        }
    }, [patientId]);

    const handleSaveGoal = () => {
        const newGoal: Goal = {
            targetWeight: parseFloat(formData.targetWeight),
            deadline: formData.deadline,
            weeklyGoal: parseFloat(formData.weeklyGoal)
        };
        setGoal(newGoal);
        localStorage.setItem(`goal_${patientId}`, JSON.stringify(newGoal));
        setIsEditing(false);
    };

    const calculateProgress = () => {
        if (!goal || !initialWeightNum) return 0;
        const totalToLose = initialWeightNum - goal.targetWeight;
        const lostSoFar = initialWeightNum - currentWeightNum;
        return Math.min(100, Math.max(0, (lostSoFar / totalToLose) * 100));
    };

    const calculateEstimatedDate = () => {
        if (!goal) return null;
        const remaining = currentWeightNum - goal.targetWeight;
        const weeksNeeded = Math.abs(remaining / goal.weeklyGoal);
        const estimatedDate = new Date();
        estimatedDate.setDate(estimatedDate.getDate() + weeksNeeded * 7);
        return estimatedDate;
    };

    const getRemainingDays = () => {
        if (!goal) return 0;
        const deadline = new Date(goal.deadline);
        const today = new Date();
        const diffTime = deadline.getTime() - today.getTime();
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    };

    if (!goal && !isEditing) {
        return (
            <div
                className="rounded-3 shadow-lg p-4 border"
                style={{
                    background: 'linear-gradient(135deg, #e0e7ff 0%, #ede9fe 100%)',
                    borderColor: '#c7d2fe'
                }}
            >
                <div className="text-center">
                    <Target className="mx-auto mb-3 text-primary" size={48} />
                    <h3 className="h5 fw-bold text-dark mb-2">Establece tu Meta</h3>
                    <p className="small text-secondary mb-4">
                        Define tu peso objetivo y fecha límite para un mejor seguimiento
                    </p>
                    <button
                        onClick={() => setIsEditing(true)}
                        className="btn btn-primary px-4 py-2"
                    >
                        Establecer Meta
                    </button>
                </div>
            </div>
        );
    }

    if (isEditing) {
        return (
            <div className="bg-white rounded-3 shadow-lg p-4 border">
                <h3 className="h5 fw-bold text-dark mb-4">Configurar Meta de Peso</h3>
                <div className="row g-3">
                    <div className="col-md-4">
                        <label className="form-label small fw-medium">Peso Objetivo (kg)</label>
                        <input
                            type="number"
                            step="0.1"
                            value={formData.targetWeight}
                            onChange={(e) => setFormData({ ...formData, targetWeight: e.target.value })}
                            className="form-control"
                            placeholder="70.0"
                        />
                    </div>
                    <div className="col-md-4">
                        <label className="form-label small fw-medium">Fecha Límite</label>
                        <input
                            type="date"
                            value={formData.deadline}
                            onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                            className="form-control"
                        />
                    </div>
                    <div className="col-md-4">
                        <label className="form-label small fw-medium">Meta Semanal (kg/semana)</label>
                        <select
                            value={formData.weeklyGoal}
                            onChange={(e) => setFormData({ ...formData, weeklyGoal: e.target.value })}
                            className="form-select"
                        >
                            <option value="0.25">0.25 kg (conservador)</option>
                            <option value="0.5">0.5 kg (moderado)</option>
                            <option value="0.75">0.75 kg (agresivo)</option>
                            <option value="1">1 kg (muy agresivo)</option>
                        </select>
                    </div>
                    <div className="col-12">
                        <div className="d-flex gap-2">
                            <button
                                onClick={handleSaveGoal}
                                className="btn btn-primary flex-fill"
                            >
                                Guardar Meta
                            </button>
                            <button
                                onClick={() => setIsEditing(false)}
                                className="btn btn-secondary"
                            >
                                Cancelar
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    const progress = calculateProgress();
    const estimatedDate = calculateEstimatedDate();
    const remainingDays = getRemainingDays();
    const remaining = goal ? currentWeightNum - goal.targetWeight : 0;

    return (
        <div
            className="rounded-3 shadow-lg p-4 text-white"
            style={{
                background: 'linear-gradient(135deg, #6366f1 0%, #9333ea 100%)'
            }}
        >
            <div className="d-flex align-items-center justify-content-between mb-4">
                <h3 className="h5 fw-bold mb-0">🎯 Meta de Peso</h3>
                <button
                    onClick={() => setIsEditing(true)}
                    className="btn btn-sm btn-link text-white text-decoration-none"
                    style={{ opacity: 0.8 }}
                >
                    Editar
                </button>
            </div>

            <div className="row g-4">
                {/* Progress Ring */}
                <div className="col-md-4 d-flex justify-content-center align-items-center">
                    <ProgressRing progress={progress} size={120} strokeWidth={10} />
                </div>

                {/* Stats */}
                <div className="col-md-8">
                    <div className="d-flex flex-column gap-3">
                        <div className="d-flex align-items-center justify-content-between">
                            <span className="small" style={{ opacity: 0.9 }}>Peso Actual</span>
                            <span className="h4 fw-bold mb-0">{Number(currentWeight).toFixed(1)} kg</span>
                        </div>
                        <div className="d-flex align-items-center justify-content-between">
                            <span className="small" style={{ opacity: 0.9 }}>Peso Objetivo</span>
                            <span className="h4 fw-bold mb-0">{goal?.targetWeight ? Number(goal.targetWeight).toFixed(1) : 0} kg</span>
                        </div>
                        <hr className="my-0" style={{ opacity: 0.2 }} />
                        <div className="d-flex align-items-center justify-content-between">
                            <span className="small d-flex align-items-center gap-2" style={{ opacity: 0.9 }}>
                                <TrendingDown size={16} />
                                Faltan
                            </span>
                            <span className="h5 fw-bold mb-0">{Math.abs(remaining).toFixed(1)} kg</span>
                        </div>
                        <div className="d-flex align-items-center justify-content-between">
                            <span className="small d-flex align-items-center gap-2" style={{ opacity: 0.9 }}>
                                <Calendar size={16} />
                                Fecha Estimada
                            </span>
                            <span className="small fw-medium">
                                {estimatedDate?.toLocaleDateString('es-ES', {
                                    day: 'numeric',
                                    month: 'short',
                                    year: 'numeric'
                                })}
                            </span>
                        </div>
                        <div className="d-flex align-items-center justify-content-between">
                            <span className="small" style={{ opacity: 0.9 }}>Días Restantes</span>
                            <span className={`small fw-medium ${remainingDays < 0 ? 'text-danger' : ''}`}>
                                {remainingDays} días
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Progress Bar */}
            <div className="mt-4">
                <div
                    className="rounded-pill overflow-hidden"
                    style={{ height: '8px', backgroundColor: 'rgba(255,255,255,0.2)' }}
                >
                    <div
                        className="h-100 bg-white rounded-pill"
                        style={{
                            width: `${progress}%`,
                            transition: 'width 1s ease-out'
                        }}
                    ></div>
                </div>
            </div>

            {remaining < 0 && (
                <div className="mt-3 p-3 rounded" style={{ backgroundColor: 'rgba(255,255,255,0.1)' }}>
                    <p className="small mb-0">
                        ⚠️ Estás por encima de tu meta. Ajusta tu plan nutricional.
                    </p>
                </div>
            )}
        </div>
    );
};
