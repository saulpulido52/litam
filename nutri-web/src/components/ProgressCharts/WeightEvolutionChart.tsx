import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface WeightDataPoint {
  date: string;
  weight: number;
  targetWeight?: number;
  change?: number;
}

interface WeightEvolutionChartProps {
  data: WeightDataPoint[];
  patientName: string;
  targetWeight?: number;
  height?: number;
}

const WeightEvolutionChart: React.FC<WeightEvolutionChartProps> = ({ 
  data, 
  patientName, 
  targetWeight,
  height 
}) => {
  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('es-ES', { 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const calculateBMI = (weight: number) => {
    if (!height) return null;
    return (weight / ((height / 100) ** 2)).toFixed(1);
  };

  const getTrendIcon = (data: WeightDataPoint[]) => {
    if (data.length < 2) return <Minus size={16} className="text-muted" />;
    
    const first = data[0].weight;
    const last = data[data.length - 1].weight;
    const change = last - first;
    
    if (change < 0) return <TrendingDown size={16} className="text-success" />;
    if (change > 0) return <TrendingUp size={16} className="text-warning" />;
    return <Minus size={16} className="text-muted" />;
  };

  const getTrendText = (data: WeightDataPoint[]) => {
    if (data.length < 2) return 'Sin datos suficientes';
    
    const first = data[0].weight;
    const last = data[data.length - 1].weight;
    const change = last - first;
    const changePercent = ((change / first) * 100).toFixed(1);
    
    if (change < 0) return `Bajó ${Math.abs(change).toFixed(1)} kg (${changePercent}%)`;
    if (change > 0) return `Subió ${change.toFixed(1)} kg (+${changePercent}%)`;
    return 'Sin cambios';
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const weight = payload[0].value;
      const bmi = calculateBMI(weight);
      
      return (
        <div className="custom-tooltip bg-white border rounded p-3 shadow">
          <p className="mb-1"><strong>{formatDate(label)}</strong></p>
          <p className="mb-1 text-primary">
            Peso: <strong>{weight} kg</strong>
          </p>
          {bmi && (
            <p className="mb-1 text-info">
              IMC: <strong>{bmi}</strong>
            </p>
          )}
          {targetWeight && (
            <p className="mb-0 text-success">
              Meta: <strong>{targetWeight} kg</strong>
            </p>
          )}
        </div>
      );
    }
    return null;
  };

  if (!data || data.length === 0) {
    return (
      <div className="text-center py-5">
        <div className="text-muted mb-3">
          <TrendingUp size={48} />
        </div>
        <h5 className="text-muted">No hay datos de peso disponibles</h5>
        <p className="text-muted">Registra el primer peso para ver la evolución</p>
      </div>
    );
  }

  const sortedData = [...data].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  const latestWeight = sortedData[sortedData.length - 1].weight;
  const initialWeight = sortedData[0].weight;
  const weightChange = latestWeight - initialWeight;

  return (
    <div className="card border-0 shadow-sm">
      <div className="card-header bg-white">
        <div className="d-flex justify-content-between align-items-center">
          <div>
            <h5 className="card-title mb-1">Evolución de Peso</h5>
            <p className="text-muted mb-0">{patientName}</p>
          </div>
          <div className="text-end">
            <div className="d-flex align-items-center gap-2">
              {getTrendIcon(sortedData)}
              <span className="small">{getTrendText(sortedData)}</span>
            </div>
            <div className="small text-muted">
              {sortedData.length} mediciones
            </div>
          </div>
        </div>
      </div>
      <div className="card-body">
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={sortedData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
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
              domain={['dataMin - 2', 'dataMax + 2']}
              tickFormatter={(value) => `${value} kg`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            
            {/* Línea de peso actual */}
            <Line 
              type="monotone" 
              dataKey="weight" 
              stroke="#007bff" 
              strokeWidth={3}
              dot={{ fill: '#007bff', strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, stroke: '#007bff', strokeWidth: 2 }}
              name="Peso Actual"
            />
            
            {/* Línea de peso objetivo */}
            {targetWeight && (
              <ReferenceLine 
                y={targetWeight} 
                stroke="#28a745" 
                strokeDasharray="5 5"
                label={{ 
                  value: `Meta: ${targetWeight} kg`, 
                  position: 'top',
                  fill: '#28a745',
                  fontSize: 12
                }}
              />
            )}
          </LineChart>
        </ResponsiveContainer>
        
        {/* Resumen de métricas */}
        <div className="row mt-4">
          <div className="col-md-3">
            <div className="text-center">
              <h6 className="text-primary mb-1">{latestWeight} kg</h6>
              <small className="text-muted">Peso Actual</small>
            </div>
          </div>
          <div className="col-md-3">
            <div className="text-center">
              <h6 className="text-info mb-1">{initialWeight} kg</h6>
              <small className="text-muted">Peso Inicial</small>
            </div>
          </div>
          <div className="col-md-3">
            <div className="text-center">
              <h6 className={`mb-1 ${weightChange < 0 ? 'text-success' : weightChange > 0 ? 'text-warning' : 'text-muted'}`}>
                {weightChange > 0 ? '+' : ''}{weightChange.toFixed(1)} kg
              </h6>
              <small className="text-muted">Cambio Total</small>
            </div>
          </div>
          <div className="col-md-3">
            <div className="text-center">
              <h6 className="text-success mb-1">
                {targetWeight ? ((latestWeight - targetWeight) * -1).toFixed(1) : '-'} kg
              </h6>
              <small className="text-muted">Restante a Meta</small>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WeightEvolutionChart; 