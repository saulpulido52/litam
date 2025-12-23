import React from 'react';
import { Card, Row, Col, Table, Alert, Badge, Spinner, ProgressBar } from 'react-bootstrap';
import { FaChartLine, FaWeight, FaCalendarAlt, FaArrowUp, FaArrowDown, FaEquals } from 'react-icons/fa';
import { MdTimeline, MdAssessment, MdTrendingUp } from 'react-icons/md';
import type { ClinicalRecord } from '../../types/clinical-record';

interface AnalisisPacienteProps {
    patientId: string;
    patientName: string;
    records: ClinicalRecord[];
}

const AnalisisPaciente: React.FC<AnalisisPacienteProps> = ({ patientName, records }) => {
    const loading = false;
// Análisis de evolución de peso
    const getWeightEvolution = () => {
        const recordsWithWeight = records
            .filter(record => record.anthropometric_measurements?.current_weight_kg)
            .sort((a, b) => new Date(a.record_date).getTime() - new Date(b.record_date).getTime());

        if (recordsWithWeight.length < 2) return null;

        const firstWeight = recordsWithWeight[0].anthropometric_measurements?.current_weight_kg || 0;
        const lastWeight = recordsWithWeight[recordsWithWeight.length - 1].anthropometric_measurements?.current_weight_kg || 0;
        const weightChange = lastWeight - firstWeight;
        const weightChangePercent = firstWeight > 0 ? ((weightChange / firstWeight) * 100) : 0;

        return {
            firstWeight,
            lastWeight,
            weightChange,
            weightChangePercent,
            trend: weightChange > 0 ? 'increase' : weightChange < 0 ? 'decrease' : 'stable',
            measurements: recordsWithWeight.length
        };
    };

    // Análisis de expedientes por mes
    const getRecordsAnalysis = () => {
        const monthCount = records.reduce((acc, record) => {
            const month = new Date(record.record_date).toLocaleDateString('es', { 
                year: 'numeric', 
                month: 'long' 
            });
            acc[month] = (acc[month] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);

        return Object.entries(monthCount).map(([month, count]) => ({
            period: month,
            count,
            percentage: (count / records.length) * 100
        }));
    };

    // Análisis temporal
    const getTemporalAnalysis = () => {
        if (records.length === 0) return null;

        const sortedRecords = [...records].sort((a, b) => 
            new Date(a.record_date).getTime() - new Date(b.record_date).getTime()
        );

        const firstRecord = sortedRecords[0];
        const lastRecord = sortedRecords[sortedRecords.length - 1];
        
        const daysBetween = Math.floor(
            (new Date(lastRecord.record_date).getTime() - new Date(firstRecord.record_date).getTime()) 
            / (1000 * 60 * 60 * 24)
        );

        const avgDaysBetweenVisits = records.length > 1 ? daysBetween / (records.length - 1) : 0;

        return {
            totalDays: daysBetween,
            avgDaysBetweenVisits: Math.round(avgDaysBetweenVisits),
            frequency: avgDaysBetweenVisits < 30 ? 'Alta' : avgDaysBetweenVisits < 60 ? 'Media' : 'Baja'
        };
    };

    const weightEvolution = getWeightEvolution();
    const recordsAnalysis = getRecordsAnalysis();
    const temporalAnalysis = getTemporalAnalysis();

    const getTrendIcon = (trend: string) => {
        switch (trend) {
            case 'increase': return <FaArrowUp className="text-warning" />;
            case 'decrease': return <FaArrowDown className="text-success" />;
            default: return <FaEquals className="text-info" />;
        }
    };



    if (loading) {
        return (
            <Card>
                <Card.Body className="text-center py-5">
                    <Spinner animation="border" className="me-2" />
                    Generando análisis del paciente...
                </Card.Body>
            </Card>
        );
    }

    if (records.length === 0) {
        return (
            <Alert variant="info">
                <MdAssessment className="me-2" />
                <strong>Sin datos para análisis</strong>
                <p className="mb-0 mt-2">
                    Este paciente aún no tiene expedientes clínicos. 
                    Crea el primer expediente para comenzar a generar análisis evolutivos.
                </p>
            </Alert>
        );
    }

    return (
        <div>
            <Row className="mb-4">
                <Col>
                    <h4 className="d-flex align-items-center">
                        <MdTimeline className="me-2 text-primary" />
                        Análisis Evolutivo - {patientName}
                    </h4>
                    <p className="text-muted mb-0">
                        Análisis basado en {records.length} expediente{records.length !== 1 ? 's' : ''} clínico{records.length !== 1 ? 's' : ''}
                    </p>
                </Col>
            </Row>

            <Row className="mb-4">
                {/* Evolución de Peso */}
                {weightEvolution && (
                    <Col md={6} className="mb-3">
                        <Card className="h-100">
                            <Card.Header className="bg-primary text-white">
                                <FaWeight className="me-2" />
                                Evolución de Peso
                            </Card.Header>
                            <Card.Body>
                                <Row className="text-center">
                                    <Col>
                                        <h6 className="text-muted">Peso Inicial</h6>
                                        <h4>{weightEvolution.firstWeight} kg</h4>
                                    </Col>
                                    <Col>
                                        <h6 className="text-muted">Peso Actual</h6>
                                        <h4>{weightEvolution.lastWeight} kg</h4>
                                    </Col>
                                </Row>
                                <hr />
                                <div className="text-center">
                                    <h5 className="d-flex align-items-center justify-content-center">
                                        {getTrendIcon(weightEvolution.trend)}
                                        <span className="ms-2">
                                            {weightEvolution.weightChange > 0 ? '+' : ''}{weightEvolution.weightChange.toFixed(1)} kg
                                        </span>
                                    </h5>
                                    <small className="text-muted">
                                        {weightEvolution.weightChangePercent.toFixed(1)}% de cambio
                                    </small>
                                </div>
                            </Card.Body>
                        </Card>
                    </Col>
                )}

                {/* Análisis Temporal */}
                {temporalAnalysis && (
                    <Col md={6} className="mb-3">
                        <Card className="h-100">
                            <Card.Header className="bg-info text-white">
                                <FaCalendarAlt className="me-2" />
                                Análisis Temporal
                            </Card.Header>
                            <Card.Body>
                                <Row className="text-center">
                                    <Col>
                                        <h6 className="text-muted">Días de Seguimiento</h6>
                                        <h4>{temporalAnalysis.totalDays}</h4>
                                    </Col>
                                    <Col>
                                        <h6 className="text-muted">Frecuencia</h6>
                                        <h4>
                                            <Badge bg={
                                                temporalAnalysis.frequency === 'Alta' ? 'success' :
                                                temporalAnalysis.frequency === 'Media' ? 'warning' : 'danger'
                                            }>
                                                {temporalAnalysis.frequency}
                                            </Badge>
                                        </h4>
                                    </Col>
                                </Row>
                                <hr />
                                <div className="text-center">
                                    <small className="text-muted">
                                        Promedio: cada {temporalAnalysis.avgDaysBetweenVisits} días
                                    </small>
                                </div>
                            </Card.Body>
                        </Card>
                    </Col>
                )}
            </Row>

            <Row className="mb-4">
                {/* Distribución Temporal de Expedientes */}
                <Col md={8}>
                    <Card>
                        <Card.Header>
                            <FaChartLine className="me-2" />
                            Distribución Temporal de Expedientes
                        </Card.Header>
                        <Card.Body>
                            <Table responsive striped>
                                <thead>
                                    <tr>
                                        <th>Período</th>
                                        <th>Cantidad</th>
                                        <th>Distribución</th>
                                        <th>%</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {recordsAnalysis.map((periodData, index) => (
                                        <tr key={index}>
                                            <td>
                                                <Badge bg="primary" className="me-2">
                                                    {periodData.period}
                                                </Badge>
                                            </td>
                                            <td>
                                                <strong>{periodData.count}</strong>
                                            </td>
                                            <td>
                                                <ProgressBar 
                                                    now={periodData.percentage} 
                                                    variant="primary"
                                                    style={{ height: '20px' }}
                                                />
                                            </td>
                                            <td>
                                                <strong>{periodData.percentage.toFixed(1)}%</strong>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </Table>
                        </Card.Body>
                    </Card>
                </Col>

                {/* Resumen Rápido */}
                <Col md={4}>
                    <Card className="h-100">
                        <Card.Header className="bg-success text-white">
                            <MdTrendingUp className="me-2" />
                            Resumen Rápido
                        </Card.Header>
                        <Card.Body>
                            <div className="mb-3">
                                <small className="text-muted">Total Expedientes</small>
                                <h3 className="mb-0">{records.length}</h3>
                            </div>
                            
                            {weightEvolution && (
                                <div className="mb-3">
                                    <small className="text-muted">Mediciones de Peso</small>
                                    <h5 className="mb-0">{weightEvolution.measurements}</h5>
                                </div>
                            )}
                            
                            <div className="mb-3">
                                <small className="text-muted">Período Más Activo</small>
                                <h6 className="mb-0">
                                    <Badge bg="primary">
                                        {recordsAnalysis[0]?.period || 'N/A'}
                                    </Badge>
                                </h6>
                            </div>

                            {temporalAnalysis && (
                                <div>
                                    <small className="text-muted">Adherencia</small>
                                    <h6 className="mb-0">
                                        <Badge bg={
                                            temporalAnalysis.frequency === 'Alta' ? 'success' :
                                            temporalAnalysis.frequency === 'Media' ? 'warning' : 'danger'
                                        }>
                                            {temporalAnalysis.frequency}
                                        </Badge>
                                    </h6>
                                </div>
                            )}
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            <Alert variant="info">
                <MdAssessment className="me-2" />
                <strong>💡 Sobre este Análisis</strong>
                <p className="mb-0 mt-2">
                    Los análisis se generan automáticamente basándose en los expedientes clínicos del paciente. 
                    Incluyen evolución antropométrica, patrones temporales y distribución de tipos de consulta 
                    para ayudar en la toma de decisiones clínicas.
                </p>
            </Alert>
        </div>
    );
};

export default AnalisisPaciente; 