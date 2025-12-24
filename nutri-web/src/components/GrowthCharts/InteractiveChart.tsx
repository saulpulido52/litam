import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceDot } from 'recharts';
import { Card } from 'react-bootstrap';
import { generatePercentileCurves } from '../../utils/growthCalculations';

interface InteractiveChartProps {
    gender: 'male' | 'female';
    patientData?: {
        age: number; // meses
        weight: number;
        percentile: number;
    };
}

const InteractiveChart: React.FC<InteractiveChartProps> = ({ gender, patientData }) => {
    const curves = generatePercentileCurves(gender, 60);

    const CustomTooltip = ({ active, payload }: any) => {
        if (active && payload && payload.length) {
            const data = payload[0].payload;
            return (
                <div className="bg-white p-3 border rounded shadow-sm">
                    <p className="mb-1"><strong>Edad:</strong> {data.age} meses ({Math.floor(data.age / 12)}a {data.age % 12}m)</p>
                    {payload.map((entry: any, index: number) => (
                        <p key={index} className="mb-0" style={{ color: entry.color }}>
                            <strong>{entry.name}:</strong> {entry.value.toFixed(2)} kg
                        </p>
                    ))}
                </div>
            );
        }
        return null;
    };

    return (
        <Card className="shadow-sm">
            <Card.Header className="bg-primary text-white">
                <h5 className="mb-0">
                    <i className="bi bi-graph-up-arrow me-2"></i>
                    Curvas de Crecimiento WHO - Peso para Edad
                </h5>
                <small className="text-white-50">
                    Estándar: WHO (0-5 años) • Género: {gender === 'male' ? 'Masculino' : 'Femenino'}
                </small>
            </Card.Header>
            <Card.Body>
                <ResponsiveContainer width="100%" height={500}>
                    <LineChart data={curves} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                        <XAxis
                            dataKey="age"
                            label={{ value: 'Edad (meses)', position: 'insideBottom', offset: -10 }}
                            tick={{ fontSize: 12 }}
                        />
                        <YAxis
                            label={{ value: 'Peso (kg)', angle: -90, position: 'insideLeft' }}
                            tick={{ fontSize: 12 }}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend
                            wrapperStyle={{ paddingTop: '20px' }}
                            iconType="line"
                        />

                        {/* Curvas de percentiles */}
                        <Line type="monotone" dataKey="p3" stroke="#dc3545" strokeWidth={2} dot={false} name="P3 (Crítico)" />
                        <Line type="monotone" dataKey="p10" stroke="#ffc107" strokeWidth={2} dot={false} name="P10" />
                        <Line type="monotone" dataKey="p25" stroke="#17a2b8" strokeWidth={2} dot={false} name="P25" />
                        <Line type="monotone" dataKey="p50" stroke="#28a745" strokeWidth={3} dot={false} name="P50 (Mediana)" />
                        <Line type="monotone" dataKey="p75" stroke="#17a2b8" strokeWidth={2} dot={false} name="P75" />
                        <Line type="monotone" dataKey="p90" stroke="#ffc107" strokeWidth={2} dot={false} name="P90" />
                        <Line type="monotone" dataKey="p97" stroke="#dc3545" strokeWidth={2} dot={false} name="P97 (Crítico)" />

                        {/* Punto del paciente */}
                        {patientData && (
                            <ReferenceDot
                                x={patientData.age}
                                y={patientData.weight}
                                r={8}
                                fill="#007bff"
                                stroke="#fff"
                                strokeWidth={2}
                                label={{
                                    value: `Paciente (P${patientData.percentile.toFixed(1)})`,
                                    position: 'top',
                                    fill: '#007bff',
                                    fontWeight: 'bold'
                                }}
                            />
                        )}
                    </LineChart>
                </ResponsiveContainer>

                <div className="mt-3 p-3 bg-light rounded">
                    <h6 className="mb-2">Interpretación de Percentiles:</h6>
                    <div className="row">
                        <div className="col-md-6">
                            <small>
                                <span className="badge bg-danger me-2">P &lt; 3</span> Bajo peso severo<br />
                                <span className="badge bg-warning text-dark me-2">P 3-10</span> Bajo peso<br />
                                <span className="badge bg-info me-2">P 10-25</span> Peso bajo-normal<br />
                            </small>
                        </div>
                        <div className="col-md-6">
                            <small>
                                <span className="badge bg-success me-2">P 25-75</span> Peso normal<br />
                                <span className="badge bg-info me-2">P 75-90</span> Peso alto-normal<br />
                                <span className="badge bg-warning text-dark me-2">P 90-97</span> Sobrepeso<br />
                                <span className="badge bg-danger me-2">P &gt; 97</span> Obesidad
                            </small>
                        </div>
                    </div>
                </div>
            </Card.Body>
        </Card>
    );
};

export default InteractiveChart;
