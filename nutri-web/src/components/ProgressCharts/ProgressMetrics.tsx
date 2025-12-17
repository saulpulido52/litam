import React from 'react';
import { TrendingUp, TrendingDown, Target, Scale, Activity, Award, Calendar, Users } from 'lucide-react';

interface ProgressMetricsProps {
  patientName: string;
  currentWeight: number;
  targetWeight: number;
  initialWeight: number;
  currentBodyFat: number;
  initialBodyFat: number;
  currentMuscleMass: number;
  initialMuscleMass: number;
  height: number;
  daysInProgram: number;
  totalMeasurements: number;
}

const ProgressMetrics: React.FC<ProgressMetricsProps> = ({
  patientName,
  currentWeight,
  targetWeight,
  initialWeight,
  currentBodyFat,
  initialBodyFat,
  currentMuscleMass,
  initialMuscleMass,
  height,
  daysInProgram,
  totalMeasurements
}) => {
  const calculateBMI = (weight: number) => {
    return (weight / ((height / 100) ** 2)).toFixed(1);
  };

  const calculateWeightChange = () => {
    return currentWeight - initialWeight;
  };

  const calculateWeightChangePercent = () => {
    return ((calculateWeightChange() / initialWeight) * 100).toFixed(1);
  };

  const calculateProgressToGoal = () => {
    const totalToLose = initialWeight - targetWeight;
    const currentLost = initialWeight - currentWeight;
    return Math.min(Math.max((currentLost / totalToLose) * 100, 0), 100);
  };

  const calculateBodyFatChange = () => {
    return currentBodyFat - initialBodyFat;
  };

  const calculateMuscleMassChange = () => {
    return currentMuscleMass - initialMuscleMass;
  };

  const getWeightTrendIcon = () => {
    const change = calculateWeightChange();
    if (change < 0) return <TrendingDown size={20} className="text-success" />;
    if (change > 0) return <TrendingUp size={20} className="text-warning" />;
    return <Target size={20} className="text-muted" />;
  };

  const getBodyFatTrendIcon = () => {
    const change = calculateBodyFatChange();
    if (change < 0) return <TrendingDown size={20} className="text-success" />;
    if (change > 0) return <TrendingUp size={20} className="text-warning" />;
    return <Target size={20} className="text-muted" />;
  };

  const getMuscleTrendIcon = () => {
    const change = calculateMuscleMassChange();
    if (change > 0) return <TrendingUp size={20} className="text-success" />;
    if (change < 0) return <TrendingDown size={20} className="text-warning" />;
    return <Target size={20} className="text-muted" />;
  };

  const getBMICategory = (bmi: number) => {
    if (bmi < 18.5) return { category: 'Bajo peso', color: 'text-warning' };
    if (bmi < 25) return { category: 'Normal', color: 'text-success' };
    if (bmi < 30) return { category: 'Sobrepeso', color: 'text-warning' };
    return { category: 'Obesidad', color: 'text-danger' };
  };

  const currentBMI = Number(calculateBMI(currentWeight));
  const bmiCategory = getBMICategory(currentBMI);

  const metrics = [
    {
      title: 'Peso Actual',
      value: `${currentWeight} kg`,
      change: `${calculateWeightChange() > 0 ? '+' : ''}${calculateWeightChange().toFixed(1)} kg`,
      changePercent: `${calculateWeightChangePercent()}%`,
      icon: <Scale size={24} className="text-primary" />,
      trendIcon: getWeightTrendIcon(),
      color: 'primary',
      subtitle: 'Desde el inicio'
    },
    {
      title: 'Progreso a Meta',
      value: `${calculateProgressToGoal().toFixed(0)}%`,
      change: `${(initialWeight - currentWeight).toFixed(1)} kg perdidos`,
      changePercent: `${targetWeight} kg meta`,
      icon: <Target size={24} className="text-success" />,
      trendIcon: <Award size={20} className="text-success" />,
      color: 'success',
      subtitle: 'Objetivo de peso'
    },
    {
      title: 'IMC Actual',
      value: calculateBMI(currentWeight),
      change: bmiCategory.category,
      changePercent: `${calculateBMI(initialWeight)} inicial`,
      icon: <Activity size={24} className="text-info" />,
      trendIcon: <Target size={20} className={bmiCategory.color} />,
      color: 'info',
      subtitle: 'Índice de masa corporal'
    },
    {
      title: 'Grasa Corporal',
      value: `${currentBodyFat}%`,
      change: `${calculateBodyFatChange() > 0 ? '+' : ''}${calculateBodyFatChange().toFixed(1)}%`,
      changePercent: `${initialBodyFat}% inicial`,
      icon: <Activity size={24} className="text-warning" />,
      trendIcon: getBodyFatTrendIcon(),
      color: 'warning',
      subtitle: 'Porcentaje de grasa'
    },
    {
      title: 'Masa Muscular',
      value: `${currentMuscleMass} kg`,
      change: `${calculateMuscleMassChange() > 0 ? '+' : ''}${calculateMuscleMassChange().toFixed(1)} kg`,
      changePercent: `${initialMuscleMass} kg inicial`,
      icon: <Activity size={24} className="text-success" />,
      trendIcon: getMuscleTrendIcon(),
      color: 'success',
      subtitle: 'Masa muscular'
    },
    {
      title: 'Días en Programa',
      value: daysInProgram.toString(),
      change: `${totalMeasurements} mediciones`,
      changePercent: `${Math.round(daysInProgram / 7)} semanas`,
      icon: <Calendar size={24} className="text-secondary" />,
      trendIcon: <Users size={20} className="text-secondary" />,
      color: 'secondary',
      subtitle: 'Compromiso del paciente'
    }
  ];

  return (
    <div className="card border-0 shadow-sm">
      <div className="card-header bg-white">
        <div className="d-flex justify-content-between align-items-center">
          <div>
            <h5 className="card-title mb-1">Métricas de Progreso</h5>
            <p className="text-muted mb-0">{patientName}</p>
          </div>
          <div className="text-end">
            <div className="badge bg-success fs-6">
              {calculateProgressToGoal() >= 100 ? '¡Meta Alcanzada!' : 'En Progreso'}
            </div>
          </div>
        </div>
      </div>
      <div className="card-body">
        <div className="row">
          {metrics.map((metric, index) => (
            <div key={index} className="col-md-6 col-lg-4 mb-4">
              <div className="card h-100 border-0 bg-light">
                <div className="card-body p-3">
                  <div className="d-flex justify-content-between align-items-start mb-3">
                    <div className="d-flex align-items-center">
                      {metric.icon}
                      <div className="ms-2">
                        <h6 className="card-title mb-0 small">{metric.title}</h6>
                        <small className="text-muted">{metric.subtitle}</small>
                      </div>
                    </div>
                    {metric.trendIcon}
                  </div>
                  
                  <div className="mb-2">
                    <h4 className={`text-${metric.color} mb-1`}>{metric.value}</h4>
                    <div className="d-flex justify-content-between align-items-center">
                      <small className={`text-${metric.color} fw-medium`}>
                        {metric.change}
                      </small>
                      <small className="text-muted">
                        {metric.changePercent}
                      </small>
                    </div>
                  </div>

                  {/* Progress bar for weight goal */}
                  {metric.title === 'Progreso a Meta' && (
                    <div className="mt-2">
                      <div className="progress" style={{ height: '6px' }}>
                        <div 
                          className="progress-bar bg-success" 
                          style={{ width: `${calculateProgressToGoal()}%` }}
                        ></div>
                      </div>
                      <small className="text-muted">
                        {calculateProgressToGoal().toFixed(0)}% completado
                      </small>
                    </div>
                  )}

                  {/* BMI category indicator */}
                  {metric.title === 'IMC Actual' && (
                    <div className="mt-2">
                      <span className={`badge ${bmiCategory.color.replace('text-', 'bg-')} bg-opacity-10 ${bmiCategory.color}`}>
                        {bmiCategory.category}
                      </span>
                    </div>
                  )}

                  {/* Health indicators */}
                  {metric.title === 'Grasa Corporal' && (
                    <div className="mt-2">
                      <span className={`badge ${currentBodyFat < 25 ? 'bg-success bg-opacity-10 text-success' : 'bg-warning bg-opacity-10 text-warning'}`}>
                        {currentBodyFat < 25 ? 'Saludable' : 'Elevada'}
                      </span>
                    </div>
                  )}

                  {metric.title === 'Masa Muscular' && (
                    <div className="mt-2">
                      <span className={`badge ${currentMuscleMass > 40 ? 'bg-success bg-opacity-10 text-success' : 'bg-warning bg-opacity-10 text-warning'}`}>
                        {currentMuscleMass > 40 ? 'Buena' : 'Baja'}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Summary section */}
        <div className="row mt-4">
          <div className="col-12">
            <div className="alert alert-info">
              <div className="row">
                <div className="col-md-3">
                  <strong>Resumen:</strong>
                </div>
                <div className="col-md-9">
                  <div className="d-flex flex-wrap gap-3">
                    <span className="badge bg-primary">
                      {calculateWeightChange() < 0 ? 'Pérdida de peso' : 'Ganancia de peso'}: {Math.abs(calculateWeightChange()).toFixed(1)} kg
                    </span>
                    <span className="badge bg-success">
                      {calculateBodyFatChange() < 0 ? 'Reducción de grasa' : 'Aumento de grasa'}: {Math.abs(calculateBodyFatChange()).toFixed(1)}%
                    </span>
                    <span className="badge bg-info">
                      {calculateMuscleMassChange() > 0 ? 'Ganancia muscular' : 'Pérdida muscular'}: {Math.abs(calculateMuscleMassChange()).toFixed(1)} kg
                    </span>
                    <span className="badge bg-secondary">
                      Compromiso: {Math.round((totalMeasurements / daysInProgram) * 100)}% mediciones
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProgressMetrics; 