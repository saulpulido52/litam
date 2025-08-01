import React, { useState, useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface EvolutionDataPoint {
    date: string;
  [key: string]: any;
}

// interface EvolutionTableRow extends EvolutionDataPoint {
//   change: number;
// }

interface EnhancedEvolutionChartProps {
    data: EvolutionDataPoint[];
    patientName?: string;
}

const EnhancedEvolutionChart: React.FC<EnhancedEvolutionChartProps> = ({ data, patientName }) => {
  const [timePeriod, setTimePeriod] = useState<'all' | '30d' | '90d' | '365d'>('all');
  const [selectedMetric, setSelectedMetric] = useState<string>('weight');
  const [comparisonPeriod, setComparisonPeriod] = useState<'day' | 'week' | 'month' | 'year'>('day');

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
    const daysToSubtract = { '7d': 7, '30d': 30, '90d': 90, '365d': 365 }[timePeriod];
    const cutoffDate = new Date(now.setDate(now.getDate() - daysToSubtract));
    return data.filter(d => new Date(d.date) >= cutoffDate);
  }, [data, timePeriod]);

  const comparisonData = useMemo(() => {
    if (comparisonPeriod === 'day') {
      return filteredData.map((current, i) => {
        const previous = filteredData[i - 1];
        const change = previous && typeof current[selectedMetric] === 'number' && typeof previous[selectedMetric] === 'number'
          ? current[selectedMetric] - previous[selectedMetric]
          : 0;
        return { period: current.date, value: current[selectedMetric], change };
      });
    }

    const groups = filteredData.reduce((acc, curr) => {
      const date = new Date(curr.date);
      let key = '';
      if (comparisonPeriod === 'week') key = getWeekNumber(date);
      else if (comparisonPeriod === 'month') key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      else if (comparisonPeriod === 'year') key = `${date.getFullYear()}`;
      
      if (!acc[key]) acc[key] = [];
      // Solo agregar valores numéricos válidos
      if (typeof curr[selectedMetric] === 'number' && !isNaN(curr[selectedMetric])) {
        acc[key].push(curr[selectedMetric]);
      }
      return acc;
    }, {} as Record<string, number[]>);

    const aggregated = Object.entries(groups)
      .filter(([_, values]) => values.length > 0) // Solo períodos con datos válidos
      .map(([period, values]) => ({
        period,
        value: values.reduce((a, b) => a + b, 0) / values.length}))
      .sort((a, b) => a.period.localeCompare(b.period)); // Ordenar por período

    return aggregated.map((current, i) => {
      const previous = aggregated[i - 1];
      const change = previous ? current.value - previous.value : 0;
      return { ...current, change };
    });
  }, [filteredData, selectedMetric, comparisonPeriod]);

  const metricOptions = useMemo(() => {
    if (data.length === 0) return [];
    return Object.keys(data[0]).filter(key => key !== 'date' && typeof data[0][key] === 'number');
  }, [data]);

                                    return (
    <div className="card">
      <div className="card-header d-flex justify-content-between align-items-center">
                    <h5 className="mb-0">Evolución de {patientName}</h5>
        <div className="d-flex gap-2">
          <select className="form-select form-select-sm" value={selectedMetric} onChange={e => setSelectedMetric(e.target.value)}>
            {metricOptions.map(metric => <option key={metric} value={metric}>{metric}</option>)}
          </select>
          <select className="form-select form-select-sm" value={comparisonPeriod} onChange={e => setComparisonPeriod(e.target.value as any)}>
            <option value="day">Por Día</option>
            <option value="week">Por Semana</option>
            <option value="month">Por Mes</option>
            <option value="year">Por Año</option>
          </select>
          <select className="form-select form-select-sm" value={timePeriod} onChange={e => setTimePeriod(e.target.value as any)}>
            <option value="all">Todo</option>
            <option value="30d">30 Días</option>
            <option value="90d">90 Días</option>
            <option value="365d">1 Año</option>
          </select>
                </div>
            </div>
                        <div className="card-body">
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={comparisonData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="period" />
            <YAxis />
            <Tooltip />
                                            <Legend />
            <Line type="monotone" dataKey="value" stroke="#8884d8" activeDot={{ r: 8 }} />
                                        </LineChart>
        </ResponsiveContainer>

        <h6 className="mt-4">Tabla de Evolución Comparativa - {comparisonPeriod === 'day' ? 'Diaria' : comparisonPeriod === 'week' ? 'Semanal' : comparisonPeriod === 'month' ? 'Mensual' : 'Anual'}</h6>
        <div className="table-responsive">
          <table className="table table-sm">
            <thead>
              <tr>
                <th>{comparisonPeriod === 'day' ? 'Fecha' : comparisonPeriod === 'week' ? 'Semana' : comparisonPeriod === 'month' ? 'Mes' : 'Año'}</th>
                <th>{selectedMetric} (Promedio)</th>
                <th>Cambio</th>
                <th>Tendencia</th>
              </tr>
            </thead>
            <tbody>
              {comparisonData.map((row, i) => (
                <tr key={i}>
                  <td>{row.period}</td>
                  <td>{typeof row.value === 'number' ? row.value.toFixed(2) : row.value}</td>
                  <td className={row.change > 0 ? 'text-danger' : row.change < 0 ? 'text-success' : 'text-muted'}>
                    {row.change !== 0 ? (row.change > 0 ? '+' : '') + row.change.toFixed(2) : '-'}
                  </td>
                  <td>
                    {row.change > 0 ? (
                      <span className="badge bg-danger">↗ Aumento</span>
                    ) : row.change < 0 ? (
                      <span className="badge bg-success">↘ Reducción</span>
                    ) : (
                      <span className="badge bg-secondary">→ Sin cambio</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
                </div>
            </div>
        </div>
    );
};

export default EnhancedEvolutionChart; 
