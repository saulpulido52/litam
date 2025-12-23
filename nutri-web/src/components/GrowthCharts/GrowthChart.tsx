// nutri-web/src/components/GrowthCharts/GrowthChart.tsx
import React, { useState, useEffect } from 'react';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    ReferenceDot,

} from 'recharts';
import { AlertCircle, Info, Baby } from 'lucide-react';
import api from '../../services/api';

interface GrowthChartProps {
    metricType: 'weight_for_age' | 'height_for_age' | 'bmi_for_age' | 'weight_for_height' | 'head_circumference';
    gender: 'male' | 'female';
    source?: 'WHO' | 'CDC';
    patientData?: {
        ageMonths: number;
        value: number;
        percentile?: number;
        zScore?: number;
        date?: string;
    }[];
    ageRange?: [number, number]; // [min, max] en meses
    title?: string;
    className?: string;
}

interface ChartDataPoint {
    ageMonths: number;
    p3: number;
    p10: number;
    p25: number;
    p50: number;
    p75: number;
    p90: number;
    p97: number;
}

const GrowthChart: React.FC<GrowthChartProps> = ({
    metricType,
    gender,
    source = 'WHO',
    patientData = [],
    ageRange = [0, 60], // Por defecto de 0 a 5 años
    title,
    className = ''
}) => {
    const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [patientAnalysis, setPatientAnalysis] = useState<any>(null);

    // Configuración de colores para percentiles
    const percentileColors = {
        p3: '#dc3545',   // Rojo - Muy bajo
        p10: '#fd7e14',  // Naranja - Bajo
        p25: '#ffc107',  // Amarillo - Bajo normal
        p50: '#28a745',  // Verde - Mediana
        p75: '#ffc107',  // Amarillo - Alto normal
        p90: '#fd7e14',  // Naranja - Alto
        p97: '#dc3545'   // Rojo - Muy alto
    };

    // Obtener título legible para la métrica
    const getMetricTitle = (): string => {
        const titles = {
            weight_for_age: 'Peso para Edad',
            height_for_age: 'Talla para Edad',
            bmi_for_age: 'IMC para Edad',
            weight_for_height: 'Peso para Talla',
            head_circumference: 'Perímetro Cefálico'
        };
        return titles[metricType] || metricType;
    };

    // Obtener unidad de medida
    const getUnit = (): string => {
        const units = {
            weight_for_age: 'kg',
            height_for_age: 'cm',
            bmi_for_age: 'kg/m²',
            weight_for_height: 'kg',
            head_circumference: 'cm'
        };
        return units[metricType] || '';
    };

    // Cargar datos de referencia del backend
    useEffect(() => {
        const fetchChartData = async () => {
            try {
                setLoading(true);
                setError(null);

                const params = new URLSearchParams({
                    metricType,
                    gender,
                    source,
                    startAge: ageRange[0].toString(),
                    endAge: ageRange[1].toString()
                });

                const result = await api.get(`/growth-charts/chart-data?${params}`);
                if (result.status === 'success') {
                    setChartData((result as any).data.chartData);
                } else {
                    throw new Error(result.message || 'Error al cargar datos de curva');
                }
            } catch (err: any) {
                console.error('Error cargando datos de curva:', err);
                setError(err.message || 'Error al cargar datos de referencia');
            } finally {
                setLoading(false);
            }
        };

        fetchChartData();
    }, [metricType, gender, source, ageRange]);

    // Analizar datos del paciente cuando hay datos
    useEffect(() => {
        const analyzePatientData = async () => {
            if (patientData.length === 0) {
                setPatientAnalysis(null);
                return;
            }

            try {
                // Obtener el dato más reciente
                const latestData = patientData[patientData.length - 1];
                
                const result = await api.post('/growth-charts/calculate-percentile', {
                    ageMonths: latestData.ageMonths,
                    value: latestData.value,
                    gender,
                    metricType,
                    source
                });

                if (result.status === 'success') {
                    setPatientAnalysis((result as any).data);
                }
            } catch (err) {
                console.error('Error analizando datos del paciente:', err);
            }
        };

        analyzePatientData();
    }, [patientData, metricType, gender, source]);

    // Función personalizada para tooltip
    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            const ageInYears = (label / 12).toFixed(1);
            return (
                <div className="bg-white p-3 border rounded shadow-lg">
                    <p className="font-semibold">{`Edad: ${label} meses (${ageInYears} años)`}</p>
                    {payload.map((entry: any, index: number) => (
                        <p key={index} style={{ color: entry.color }}>
                            {`${entry.dataKey.toUpperCase()}: ${
                                typeof entry.value === 'number' 
                                    ? entry.value.toFixed(1) 
                                    : entry.value
                            } ${getUnit()}`}
                        </p>
                    ))}
                </div>
            );
        }
        return null;
    };

    // Función para formatear la edad en el eje X
    const formatAge = (ageMonths: number) => {
        if (ageMonths < 12) {
            return `${ageMonths}m`;
        } else {
            const years = Math.floor(ageMonths / 12);
            const months = ageMonths % 12;
            return months === 0 ? `${years}a` : `${years}a${months}m`;
        }
    };

    if (loading) {
        return (
            <div className="d-flex justify-content-center align-items-center" style={{ height: '400px' }}>
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Cargando curva de crecimiento...</span>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="alert alert-danger d-flex align-items-center">
                <AlertCircle size={20} className="me-2" />
                <div>
                    <strong>Error al cargar curva de crecimiento:</strong> {error}
                </div>
            </div>
        );
    }

    return (
        <div className={`growth-chart-container ${className}`}>
            {/* Header con información */}
            <div className="card">
                <div className="card-header bg-primary text-white">
                    <div className="d-flex justify-content-between align-items-center">
                        <div className="d-flex align-items-center">
                            <Baby size={24} className="me-2" />
                            <h5 className="mb-0">
                                {title || `${getMetricTitle()} - ${gender === 'male' ? 'Niños' : 'Niñas'}`}
                            </h5>
                        </div>
                        <div className="d-flex align-items-center">
                            <span className="badge bg-light text-dark">
                                {source === 'WHO' ? 'OMS' : 'CDC'}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="card-body">
                    {/* Análisis del paciente */}
                    {patientAnalysis && (
                        <div className="alert alert-info mb-3">
                            <div className="d-flex align-items-start">
                                <Info size={20} className="me-2 mt-1" />
                                <div>
                                    <h6 className="alert-heading mb-2">Análisis del Paciente</h6>
                                    <div className="row">
                                        <div className="col-md-6">
                                            <p className="mb-1">
                                                <strong>Percentil:</strong> P{patientAnalysis.percentile.toFixed(1)}
                                            </p>
                                            <p className="mb-1">
                                                <strong>Z-Score:</strong> {patientAnalysis.zScore.toFixed(2)}
                                            </p>
                                        </div>
                                        <div className="col-md-6">
                                            <p className="mb-1">
                                                <strong>Interpretación:</strong> {patientAnalysis.interpretation}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Leyenda de percentiles */}
                    <div className="row mb-3">
                        <div className="col-12">
                            <small className="text-muted">
                                <strong>Leyenda de Percentiles:</strong>
                            </small>
                            <div className="d-flex flex-wrap gap-3 mt-1">
                                {Object.entries(percentileColors).map(([percentile, color]) => (
                                    <div key={percentile} className="d-flex align-items-center">
                                        <div 
                                            className="me-1" 
                                            style={{ 
                                                width: '12px', 
                                                height: '3px', 
                                                backgroundColor: color 
                                            }}
                                        ></div>
                                        <small>{percentile.toUpperCase()}</small>
                                    </div>
                                ))}
                                {patientData.length > 0 && (
                                    <div className="d-flex align-items-center">
                                        <div 
                                            className="me-1" 
                                            style={{ 
                                                width: '8px', 
                                                height: '8px', 
                                                backgroundColor: '#007bff',
                                                borderRadius: '50%'
                                            }}
                                        ></div>
                                        <small>Paciente</small>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Gráfico */}
                    <div style={{ width: '100%', height: '500px' }}>
                        <ResponsiveContainer>
                            <LineChart data={chartData}>
                                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                                <XAxis
                                    dataKey="ageMonths"
                                    tickFormatter={formatAge}
                                    domain={ageRange}
                                    type="number"
                                    scale="linear"
                                />
                                <YAxis
                                    label={{ 
                                        value: `${getMetricTitle()} (${getUnit()})`, 
                                        angle: -90, 
                                        position: 'insideLeft' 
                                    }}
                                />
                                <Tooltip content={<CustomTooltip />} />
                                <Legend />
                                
                                {/* Líneas de percentiles */}
                                <Line
                                    type="monotone"
                                    dataKey="p3"
                                    stroke={percentileColors.p3}
                                    strokeWidth={2}
                                    dot={false}
                                    name="P3"
                                />
                                <Line
                                    type="monotone"
                                    dataKey="p10"
                                    stroke={percentileColors.p10}
                                    strokeWidth={2}
                                    dot={false}
                                    name="P10"
                                />
                                <Line
                                    type="monotone"
                                    dataKey="p25"
                                    stroke={percentileColors.p25}
                                    strokeWidth={2}
                                    dot={false}
                                    name="P25"
                                />
                                <Line
                                    type="monotone"
                                    dataKey="p50"
                                    stroke={percentileColors.p50}
                                    strokeWidth={3}
                                    dot={false}
                                    name="P50 (Mediana)"
                                />
                                <Line
                                    type="monotone"
                                    dataKey="p75"
                                    stroke={percentileColors.p75}
                                    strokeWidth={2}
                                    dot={false}
                                    name="P75"
                                />
                                <Line
                                    type="monotone"
                                    dataKey="p90"
                                    stroke={percentileColors.p90}
                                    strokeWidth={2}
                                    dot={false}
                                    name="P90"
                                />
                                <Line
                                    type="monotone"
                                    dataKey="p97"
                                    stroke={percentileColors.p97}
                                    strokeWidth={2}
                                    dot={false}
                                    name="P97"
                                />
                                
                                {/* Datos del paciente */}
                                {patientData.map((point, index) => (
                                    <ReferenceDot
                                        key={index}
                                        x={point.ageMonths}
                                        y={point.value}
                                        r={5}
                                        fill="#007bff"
                                        stroke="#0056b3"
                                        strokeWidth={2}
                                    />
                                ))}
                            </LineChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Información adicional */}
                    <div className="row mt-3">
                        <div className="col-md-6">
                            <small className="text-muted">
                                <strong>Rango de edad:</strong> {formatAge(ageRange[0])} - {formatAge(ageRange[1])}
                            </small>
                        </div>
                        <div className="col-md-6 text-end">
                            <small className="text-muted">
                                <strong>Referencia:</strong> {source === 'WHO' ? 'Organización Mundial de la Salud' : 'Centers for Disease Control'}
                            </small>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default GrowthChart; 