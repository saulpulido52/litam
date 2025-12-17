import React from 'react';
import { Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Line, ComposedChart } from 'recharts';
import { Activity, Target } from 'lucide-react';

interface BodyCompositionDataPoint {
  date: string;
  bodyFat: number;
  muscleMass: number;
  weight: number;
}

interface BodyCompositionChartProps {
  data: BodyCompositionDataPoint[];
  patientName: string;
}

const BodyCompositionChart: React.FC<BodyCompositionChartProps> = ({ 
  data, 
  patientName 
}) => {
  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('es-ES', { 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const calculateFatMass = (weight: number, bodyFatPercent: number) => {
    return (weight * bodyFatPercent) / 100;
  };

  const calculateLeanMass = (weight: number, bodyFatPercent: number) => {
    return weight - calculateFatMass(weight, bodyFatPercent);
  };

  const getCompositionTrend = (data: BodyCompositionDataPoint[]) => {
    if (data.length < 2) return { fat: 'stable', muscle: 'stable' };
    
    const first = data[0];
    const last = data[data.length - 1];
    
    const fatChange = last.bodyFat - first.bodyFat;
    const muscleChange = last.muscleMass - first.muscleMass;
    
    return {
      fat: fatChange < 0 ? 'decreasing' : fatChange > 0 ? 'increasing' : 'stable',
      muscle: muscleChange > 0 ? 'increasing' : muscleChange < 0 ? 'decreasing' : 'stable'
    };
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const weight = payload[0].payload.weight;
      const bodyFat = payload[0].payload.bodyFat;
      const muscleMass = payload[0].payload.muscleMass;
      const fatMass = calculateFatMass(weight, bodyFat);
      const leanMass = calculateLeanMass(weight, bodyFat);
      
      return (
        <div className="custom-tooltip bg-white border rounded p-3 shadow">
          <p className="mb-1"><strong>{formatDate(label)}</strong></p>
          <p className="mb-1 text-primary">
            Peso: <strong>{weight} kg</strong>
          </p>
          <p className="mb-1 text-warning">
            Grasa: <strong>{bodyFat}%</strong> ({fatMass.toFixed(1)} kg)
          </p>
          <p className="mb-1 text-success">
            Músculo: <strong>{muscleMass} kg</strong>
          </p>
          <p className="mb-0 text-info">
            Masa Magra: <strong>{leanMass.toFixed(1)} kg</strong>
          </p>
        </div>
      );
    }
    return null;
  };

  if (!data || data.length === 0) {
    return (
      <div className="text-center py-5">
        <div className="text-muted mb-3">
          <Activity size={48} />
        </div>
        <h5 className="text-muted">No hay datos de composición corporal</h5>
        <p className="text-muted">Registra mediciones de grasa y músculo para ver la evolución</p>
      </div>
    );
  }

  const sortedData = [...data].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  const latest = sortedData[sortedData.length - 1];
  const initial = sortedData[0];
  const trends = getCompositionTrend(sortedData);

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'increasing': return <Target size={16} className="text-success" />;
      case 'decreasing': return <Target size={16} className="text-warning" />;
      default: return <Target size={16} className="text-muted" />;
    }
  };

  const getTrendText = (trend: string, current: number, initial: number) => {
    const change = current - initial;
    const changePercent = ((change / initial) * 100).toFixed(1);
    
    switch (trend) {
      case 'increasing': return `+${change.toFixed(1)} (+${changePercent}%)`;
      case 'decreasing': return `${change.toFixed(1)} (${changePercent}%)`;
      default: return 'Sin cambios';
    }
  };

  return (
    <div className="card border-0 shadow-sm">
      <div className="card-header bg-white">
        <div className="d-flex justify-content-between align-items-center">
          <div>
            <h5 className="card-title mb-1">Composición Corporal</h5>
            <p className="text-muted mb-0">{patientName}</p>
          </div>
          <div className="text-end">
            <div className="d-flex align-items-center gap-3">
              <div className="d-flex align-items-center gap-1">
                {getTrendIcon(trends.fat)}
                <span className="small">Grasa: {getTrendText(trends.fat, latest.bodyFat, initial.bodyFat)}</span>
              </div>
              <div className="d-flex align-items-center gap-1">
                {getTrendIcon(trends.muscle)}
                <span className="small">Músculo: {getTrendText(trends.muscle, latest.muscleMass, initial.muscleMass)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="card-body">
        <ResponsiveContainer width="100%" height={300}>
          <ComposedChart data={sortedData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis 
              dataKey="date" 
              tickFormatter={formatDate}
              stroke="#666"
              fontSize={12}
            />
            <YAxis 
              stroke="#666"
              fontSize={12}
              tickFormatter={(value) => `${value}%`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            
            {/* Área de grasa corporal */}
            <Area 
              type="monotone" 
              dataKey="bodyFat" 
              stackId="1"
              stroke="#ffc107" 
              fill="#ffc107" 
              fillOpacity={0.6}
              name="Grasa Corporal (%)"
            />
            
            {/* Línea de masa muscular */}
            <Line 
              type="monotone" 
              dataKey="muscleMass" 
              stroke="#28a745" 
              strokeWidth={3}
              dot={{ fill: '#28a745', strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, stroke: '#28a745', strokeWidth: 2 }}
              name="Masa Muscular (kg)"
            />
          </ComposedChart>
        </ResponsiveContainer>
        
        {/* Resumen de métricas */}
        <div className="row mt-4">
          <div className="col-md-3">
            <div className="text-center">
              <h6 className="text-warning mb-1">{latest.bodyFat}%</h6>
              <small className="text-muted">Grasa Actual</small>
            </div>
          </div>
          <div className="col-md-3">
            <div className="text-center">
              <h6 className="text-success mb-1">{latest.muscleMass} kg</h6>
              <small className="text-muted">Músculo Actual</small>
            </div>
          </div>
          <div className="col-md-3">
            <div className="text-center">
              <h6 className="text-info mb-1">
                {calculateFatMass(latest.weight, latest.bodyFat).toFixed(1)} kg
              </h6>
              <small className="text-muted">Masa Grasa</small>
            </div>
          </div>
          <div className="col-md-3">
            <div className="text-center">
              <h6 className="text-primary mb-1">
                {calculateLeanMass(latest.weight, latest.bodyFat).toFixed(1)} kg
              </h6>
              <small className="text-muted">Masa Magra</small>
            </div>
          </div>
        </div>
        
        {/* Indicadores de salud */}
        <div className="row mt-3">
          <div className="col-12">
            <div className="alert alert-info py-2">
              <div className="d-flex justify-content-between align-items-center">
                <small>
                  <strong>Indicadores de Salud:</strong>
                  {latest.bodyFat < 25 ? ' ✅ Grasa corporal saludable' : ' ⚠️ Grasa corporal elevada'}
                  {latest.muscleMass > 40 ? ' ✅ Buena masa muscular' : ' ⚠️ Masa muscular baja'}
                </small>
                <small className="text-muted">
                  Última medición: {formatDate(latest.date)}
                </small>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BodyCompositionChart; 