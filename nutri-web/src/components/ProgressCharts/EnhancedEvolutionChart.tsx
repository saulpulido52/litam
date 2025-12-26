import React, { useState, useMemo } from 'react';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine
} from 'recharts';
import { Calendar, TrendingUp, TrendingDown } from 'lucide-react';

interface EvolutionDataPoint {
  date: string;
  [key: string]: any;
}

interface EnhancedEvolutionChartProps {
  data: EvolutionDataPoint[];
  patientName?: string;
}

const EnhancedEvolutionChart: React.FC<EnhancedEvolutionChartProps> = ({ data, patientName }) => {
  const [timePeriod, setTimePeriod] = useState<'7d' | '14d' | '30d' | '90d' | '365d' | 'all'>('30d');
  const [selectedMetric, setSelectedMetric] = useState<string>('weight');
  const [chartType, setChartType] = useState<'line' | 'area'>('area');

  // Helper para obtener el número de la semana
  const getWeekNumber = (d: Date) => {
    d = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
    d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    const weekNo = Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
    return `W${weekNo}, ${d.getUTCFullYear()}`;
  };

  const filteredData = useMemo(() => {
    if (timePeriod === 'all') return data;
    const now = new Date();
    const daysToSubtract = { '7d': 7, '14d': 14, '30d': 30, '90d': 90, '365d': 365 }[timePeriod] || 30;
    const cutoffDate = new Date(now.setDate(now.getDate() - daysToSubtract));
    return data.filter(d => new Date(d.date) >= cutoffDate);
  }, [data, timePeriod]);

  const chartData = useMemo(() => {
    return filteredData.map(item => ({
      date: new Date(item.date).toLocaleDateString('es-ES', {
        day: '2-digit',
        month: 'short'
      }),
      value: typeof item[selectedMetric] === 'number' ? item[selectedMetric] : 0,
      fullDate: item.date
    }));
  }, [filteredData, selectedMetric]);

  const metricOptions = useMemo(() => {
    if (data.length === 0) return [];
    return Object.keys(data[0]).filter(key => key !== 'date' && typeof data[0][key] === 'number');
  }, [data]);

  const metricLabels: Record<string, string> = {
    weight: 'Peso (kg)',
    body_fat: 'Grasa Corporal (%)',
    muscle_mass: 'Masa Muscular (kg)',
    waist: 'Cintura (cm)',
    bmi: 'IMC'
  };

  const metricColors: Record<string, string> = {
    weight: '#8b5cf6',
    body_fat: '#ef4444',
    muscle_mass: '#3b82f6',
    waist: '#f59e0b',
    bmi: '#10b981'
  };

  const getMetricGoal = () => {
    // Aquí podrías obtener la meta del paciente desde props o contexto
    // Por ahora retornamos null
    return null;
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 rounded-3 shadow-lg border">
          <p className="small fw-bold mb-1">{data.fullDate}</p>
          <p className="small mb-0" style={{ color: metricColors[selectedMetric] }}>
            {metricLabels[selectedMetric] || selectedMetric}: <strong>{data.value.toFixed(2)}</strong>
          </p>
        </div>
      );
    }
    return null;
  };

  const stats = useMemo(() => {
    if (chartData.length === 0) return null;

    const values = chartData.map(d => d.value);
    const first = values[0];
    const last = values[values.length - 1];
    const change = last - first;
    const changePercent = first !== 0 ? (change / first) * 100 : 0;
    const max = Math.max(...values);
    const min = Math.min(...values);
    const avg = values.reduce((a, b) => a + b, 0) / values.length;

    return { first, last, change, changePercent, max, min, avg };
  }, [chartData]);

  return (
    <div className="bg-white rounded-3 shadow-lg border">
      {/* Header */}
      <div className="p-4 border-bottom">
        <div className="d-flex align-items-center justify-content-between mb-3">
          <div className="d-flex align-items-center gap-2">
            <Calendar className="text-primary" size={24} />
            <h5 className="mb-0 fw-bold">Evolución de {patientName || 'Paciente'}</h5>
          </div>

          {/* Chart Type Toggle */}
          <div className="btn-group btn-group-sm">
            <button
              className={`btn ${chartType === 'area' ? 'btn-primary' : 'btn-outline-primary'}`}
              onClick={() => setChartType('area')}
            >
              Área
            </button>
            <button
              className={`btn ${chartType === 'line' ? 'btn-primary' : 'btn-outline-primary'}`}
              onClick={() => setChartType('line')}
            >
              Línea
            </button>
          </div>
        </div>

        {/* Metric Selector */}
        <div className="mb-3">
          <label className="form-label small fw-medium mb-2">Métrica:</label>
          <div className="d-flex flex-wrap gap-2">
            {metricOptions.map(metric => (
              <button
                key={metric}
                className={`btn btn-sm ${selectedMetric === metric ? 'btn-primary' : 'btn-outline-secondary'}`}
                onClick={() => setSelectedMetric(metric)}
              >
                {metricLabels[metric] || metric}
              </button>
            ))}
          </div>
        </div>

        {/* Time Range Selector */}
        <div>
          <label className="form-label small fw-medium mb-2">Rango de Tiempo:</label>
          <div className="d-flex flex-wrap gap-2">
            <button
              className={`btn btn-sm ${timePeriod === '7d' ? 'btn-primary' : 'btn-outline-secondary'}`}
              onClick={() => setTimePeriod('7d')}
            >
              7 Días
            </button>
            <button
              className={`btn btn-sm ${timePeriod === '14d' ? 'btn-primary' : 'btn-outline-secondary'}`}
              onClick={() => setTimePeriod('14d')}
            >
              14 Días
            </button>
            <button
              className={`btn btn-sm ${timePeriod === '30d' ? 'btn-primary' : 'btn-outline-secondary'}`}
              onClick={() => setTimePeriod('30d')}
            >
              1 Mes
            </button>
            <button
              className={`btn btn-sm ${timePeriod === '90d' ? 'btn-primary' : 'btn-outline-secondary'}`}
              onClick={() => setTimePeriod('90d')}
            >
              3 Meses
            </button>
            <button
              className={`btn btn-sm ${timePeriod === '365d' ? 'btn-primary' : 'btn-outline-secondary'}`}
              onClick={() => setTimePeriod('365d')}
            >
              1 Año
            </button>
            <button
              className={`btn btn-sm ${timePeriod === 'all' ? 'btn-primary' : 'btn-outline-secondary'}`}
              onClick={() => setTimePeriod('all')}
            >
              Todo
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="p-4 bg-light border-bottom">
          <div className="row g-3">
            <div className="col-6 col-md-3">
              <div className="text-center">
                <div className="small text-muted mb-1">Inicial</div>
                <div className="h5 fw-bold mb-0">{stats.first.toFixed(2)}</div>
              </div>
            </div>
            <div className="col-6 col-md-3">
              <div className="text-center">
                <div className="small text-muted mb-1">Actual</div>
                <div className="h5 fw-bold mb-0">{stats.last.toFixed(2)}</div>
              </div>
            </div>
            <div className="col-6 col-md-3">
              <div className="text-center">
                <div className="small text-muted mb-1">Cambio</div>
                <div className={`h5 fw-bold mb-0 d-flex align-items-center justify-content-center gap-1 ${stats.change > 0 ? 'text-danger' : stats.change < 0 ? 'text-success' : 'text-secondary'}`}>
                  {stats.change > 0 ? <TrendingUp size={18} /> : stats.change < 0 ? <TrendingDown size={18} /> : null}
                  {stats.change > 0 ? '+' : ''}{stats.change.toFixed(2)}
                </div>
              </div>
            </div>
            <div className="col-6 col-md-3">
              <div className="text-center">
                <div className="small text-muted mb-1">Promedio</div>
                <div className="h5 fw-bold mb-0">{stats.avg.toFixed(2)}</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Chart */}
      <div className="p-4">
        <ResponsiveContainer width="100%" height={350}>
          {chartType === 'area' ? (
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id={`gradient-${selectedMetric}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={metricColors[selectedMetric]} stopOpacity={0.8} />
                  <stop offset="95%" stopColor={metricColors[selectedMetric]} stopOpacity={0.1} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 12 }}
                stroke="#6b7280"
              />
              <YAxis
                tick={{ fontSize: 12 }}
                stroke="#6b7280"
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="value"
                stroke={metricColors[selectedMetric]}
                strokeWidth={3}
                fill={`url(#gradient-${selectedMetric})`}
                animationDuration={1000}
              />
              {getMetricGoal() && (
                <ReferenceLine
                  y={getMetricGoal()}
                  stroke="#10b981"
                  strokeDasharray="5 5"
                  label="Meta"
                />
              )}
            </AreaChart>
          ) : (
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 12 }}
                stroke="#6b7280"
              />
              <YAxis
                tick={{ fontSize: 12 }}
                stroke="#6b7280"
              />
              <Tooltip content={<CustomTooltip />} />
              <Line
                type="monotone"
                dataKey="value"
                stroke={metricColors[selectedMetric]}
                strokeWidth={3}
                dot={{ fill: metricColors[selectedMetric], r: 4 }}
                activeDot={{ r: 6 }}
                animationDuration={1000}
              />
              {getMetricGoal() && (
                <ReferenceLine
                  y={getMetricGoal()}
                  stroke="#10b981"
                  strokeDasharray="5 5"
                  label="Meta"
                />
              )}
            </LineChart>
          )}
        </ResponsiveContainer>
      </div>

      {/* Data Summary */}
      {chartData.length > 0 && (
        <div className="p-4 border-top bg-light">
          <div className="small text-muted">
            Mostrando {chartData.length} mediciones •
            Rango: {chartData[0].fullDate} - {chartData[chartData.length - 1].fullDate}
          </div>
        </div>
      )}
    </div>
  );
};

export default EnhancedEvolutionChart;
