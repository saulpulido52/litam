import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import { Ruler } from 'lucide-react';

interface MeasurementDataPoint {
  date: string;
  waist: number;
  hip: number;
  chest: number;
  arm: number;
  thigh: number;
}

interface MeasurementsChartProps {
  data: MeasurementDataPoint[];
  patientName: string;
}

const MeasurementsChart: React.FC<MeasurementsChartProps> = ({ 
  data, 
  patientName 
}) => {
  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('es-ES', { 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const COLORS = {
    waist: '#dc3545',
    hip: '#fd7e14',
    chest: '#20c997',
    arm: '#6f42c1',
    thigh: '#17a2b8'
  };

  const getLatestMeasurements = (data: MeasurementDataPoint[]) => {
    if (!data || data.length === 0) return null;
    return data.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];
  };

  const getPreviousMeasurements = (data: MeasurementDataPoint[]) => {
    if (!data || data.length < 2) return null;
    return data.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[1];
  };

  const calculateChanges = (latest: MeasurementDataPoint, previous: MeasurementDataPoint) => {
    return {
      waist: latest.waist - previous.waist,
      hip: latest.hip - previous.hip,
      chest: latest.chest - previous.chest,
      arm: latest.arm - previous.arm,
      thigh: latest.thigh - previous.thigh
    };
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="custom-tooltip bg-white border rounded p-3 shadow">
          <p className="mb-2"><strong>{formatDate(label)}</strong></p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="mb-1" style={{ color: entry.color }}>
              {entry.name}: <strong>{entry.value} cm</strong>
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  if (!data || data.length === 0) {
    return (
      <div className="text-center py-5">
        <div className="text-muted mb-3">
          <Ruler size={48} />
        </div>
        <h5 className="text-muted">No hay mediciones corporales</h5>
        <p className="text-muted">Registra circunferencias para ver la evolución</p>
      </div>
    );
  }

  const latest = getLatestMeasurements(data);
  const previous = getPreviousMeasurements(data);
  const changes = previous ? calculateChanges(latest!, previous) : null;

  // Preparar datos para el gráfico
  const chartData = [
    {
      name: 'Cintura',
      latest: latest?.waist || 0,
      previous: previous?.waist || 0,
      change: changes?.waist || 0,
      color: COLORS.waist
    },
    {
      name: 'Cadera',
      latest: latest?.hip || 0,
      previous: previous?.hip || 0,
      change: changes?.hip || 0,
      color: COLORS.hip
    },
    {
      name: 'Pecho',
      latest: latest?.chest || 0,
      previous: previous?.chest || 0,
      change: changes?.chest || 0,
      color: COLORS.chest
    },
    {
      name: 'Brazo',
      latest: latest?.arm || 0,
      previous: previous?.arm || 0,
      change: changes?.arm || 0,
      color: COLORS.arm
    },
    {
      name: 'Muslo',
      latest: latest?.thigh || 0,
      previous: previous?.thigh || 0,
      change: changes?.thigh || 0,
      color: COLORS.thigh
    }
  ];

  const getChangeIcon = (change: number) => {
    if (change < 0) return <span className="text-success">↓</span>;
    if (change > 0) return <span className="text-warning">↑</span>;
    return <span className="text-muted">→</span>;
  };

  const getChangeText = (change: number) => {
    if (change === 0) return 'Sin cambios';
    return `${change > 0 ? '+' : ''}${change.toFixed(1)} cm`;
  };

  return (
    <div className="card border-0 shadow-sm">
      <div className="card-header bg-white">
        <div className="d-flex justify-content-between align-items-center">
          <div>
            <h5 className="card-title mb-1">Mediciones Corporales</h5>
            <p className="text-muted mb-0">{patientName}</p>
          </div>
          <div className="text-end">
            <small className="text-muted">
              Última medición: {latest ? formatDate(latest.date) : 'N/A'}
            </small>
          </div>
        </div>
      </div>
      <div className="card-body">
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis 
              dataKey="name" 
              stroke="#666"
              fontSize={12}
            />
            <YAxis 
              stroke="#666"
              fontSize={12}
              tickFormatter={(value) => `${value} cm`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            
            {/* Barras de mediciones actuales */}
            <Bar dataKey="latest" name="Medición Actual" radius={[4, 4, 0, 0]}>
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Bar>
            
            {/* Barras de mediciones anteriores (si hay datos) */}
            {previous && (
              <Bar dataKey="previous" name="Medición Anterior" fill="#e9ecef" radius={[4, 4, 0, 0]} />
            )}
          </BarChart>
        </ResponsiveContainer>
        
        {/* Resumen de cambios */}
        {changes && (
          <div className="row mt-4">
            <div className="col-12">
              <h6 className="mb-3">Cambios desde la medición anterior:</h6>
              <div className="row">
                {chartData.map((item, index) => (
                  <div key={index} className="col-md-2 mb-2">
                    <div className="text-center p-2 border rounded">
                      <div className="small text-muted mb-1">{item.name}</div>
                      <div className="d-flex align-items-center justify-content-center gap-1">
                        {getChangeIcon(item.change)}
                        <span className={`small ${item.change < 0 ? 'text-success' : item.change > 0 ? 'text-warning' : 'text-muted'}`}>
                          {getChangeText(item.change)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
        
        {/* Métricas actuales */}
        <div className="row mt-4">
          <div className="col-md-2">
            <div className="text-center">
              <h6 className="text-danger mb-1">{latest?.waist || '-'} cm</h6>
              <small className="text-muted">Cintura</small>
            </div>
          </div>
          <div className="col-md-2">
            <div className="text-center">
              <h6 className="text-warning mb-1">{latest?.hip || '-'} cm</h6>
              <small className="text-muted">Cadera</small>
            </div>
          </div>
          <div className="col-md-2">
            <div className="text-center">
              <h6 className="text-success mb-1">{latest?.chest || '-'} cm</h6>
              <small className="text-muted">Pecho</small>
            </div>
          </div>
          <div className="col-md-2">
            <div className="text-center">
              <h6 className="text-purple mb-1">{latest?.arm || '-'} cm</h6>
              <small className="text-muted">Brazo</small>
            </div>
          </div>
          <div className="col-md-2">
            <div className="text-center">
              <h6 className="text-info mb-1">{latest?.thigh || '-'} cm</h6>
              <small className="text-muted">Muslo</small>
            </div>
          </div>
          <div className="col-md-2">
            <div className="text-center">
              <h6 className="text-primary mb-1">
                {latest?.waist && latest?.hip ? (latest.waist / latest.hip).toFixed(2) : '-'}
              </h6>
              <small className="text-muted">Ratio C/H</small>
            </div>
          </div>
        </div>
        
        {/* Indicadores de salud */}
        {latest && (
          <div className="row mt-3">
            <div className="col-12">
              <div className="alert alert-info py-2">
                <div className="d-flex justify-content-between align-items-center">
                  <small>
                    <strong>Indicadores de Salud:</strong>
                    {latest.waist < 88 ? ' ✅ Circunferencia de cintura saludable' : ' ⚠️ Circunferencia de cintura elevada'}
                    {(latest.waist / latest.hip) < 0.85 ? ' ✅ Ratio cintura-cadera saludable' : ' ⚠️ Ratio cintura-cadera elevado'}
                  </small>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MeasurementsChart; 