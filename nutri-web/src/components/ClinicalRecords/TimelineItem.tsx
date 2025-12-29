import React from 'react';
import { Card, Badge, Button } from 'react-bootstrap';
import { FaWeight, FaRulerVertical, FaHeartbeat, FaEdit, FaEye } from 'react-icons/fa';
import { MdTrendingDown, MdTrendingUp, MdTrendingFlat } from 'react-icons/md';
import type { ClinicalRecord } from '../../types';

interface TimelineItemProps {
    record: ClinicalRecord;
    isInitial?: boolean;
    onView: (record: ClinicalRecord) => void;
    onEdit: (record: ClinicalRecord) => void;
    previousRecord?: ClinicalRecord | null;
}

const TimelineItem: React.FC<TimelineItemProps> = ({
    record,
    isInitial = false,
    onView,
    onEdit,
    previousRecord
}) => {
    const date = new Date(record.record_date);

    // Helper to calculate difference
    const getDiff = (current: number | undefined, prev: number | undefined) => {
        if (!current || !prev) return null;
        const diff = current - prev;
        return {
            value: Math.abs(diff).toFixed(1),
            direction: diff > 0 ? 'up' : diff < 0 ? 'down' : 'flat',
            color: diff > 0 ? 'danger' : diff < 0 ? 'success' : 'secondary' // Assuming weight loss is good for now
        };
    };

    const weightDiff = !isInitial && previousRecord
        ? getDiff(record.anthropometric_measurements?.current_weight_kg, previousRecord.anthropometric_measurements?.current_weight_kg)
        : null;

    return (
        <div className="timeline-item position-relative mb-4">
            {/* Connector Line */}
            <div
                className="position-absolute bg-secondary opacity-25"
                style={{
                    width: '4px',
                    top: '20px',
                    bottom: '-25px',
                    left: '28px',
                    zIndex: 0,
                    display: isInitial ? 'block' : 'block' // Always show line, we handle last item in parent
                }}
            />

            <div className="d-flex align-items-start position-relative" style={{ zIndex: 1 }}>
                {/* Date Badge / Dot */}
                <div className="me-4 text-center" style={{ minWidth: '60px' }}>
                    <div
                        className={`rounded-circle d-flex align-items-center justify-content-center mb-2 shadow-sm ${isInitial ? 'bg-primary text-white' : 'bg-white border border-2 border-success text-success'}`}
                        style={{ width: '60px', height: '60px', fontSize: '1.2rem' }}
                    >
                        {date.getDate()}
                    </div>
                    <small className="text-muted d-block text-uppercase fw-bold" style={{ fontSize: '0.7rem' }}>
                        {date.toLocaleString('default', { month: 'short' })}
                    </small>
                    <small className="text-muted d-block">{date.getFullYear()}</small>
                </div>

                {/* Content Card */}
                <Card className={`flex-grow-1 shadow-sm border-0 ${isInitial ? 'border-start border-4 border-primary' : ''}`}>
                    <Card.Body className="p-3">
                        <div className="d-flex justify-content-between align-items-start mb-3">
                            <div>
                                <Badge bg={isInitial ? 'primary' : 'success'} className="mb-2">
                                    {isInitial ? 'Expediente Inicial' : 'Seguimiento'}
                                </Badge>
                                <h5 className="card-title mb-0 text-dark">
                                    {isInitial ? 'Inicio del Tratamiento' : `Consulta de ${date.toLocaleDateString()}`}
                                </h5>
                                {record.consultation_reason && (
                                    <p className="text-muted small mb-0 mt-1 text-truncate" style={{ maxWidth: '400px' }}>
                                        {record.consultation_reason}
                                    </p>
                                )}
                            </div>
                            <div className="d-flex gap-2">
                                <Button variant="outline-primary" size="sm" onClick={() => onView(record)}>
                                    <FaEye />
                                </Button>
                                <Button variant="outline-secondary" size="sm" onClick={() => onEdit(record)}>
                                    <FaEdit />
                                </Button>
                            </div>
                        </div>

                        {/* Metrics Grid */}
                        <div className="d-flex flex-wrap gap-4 pt-2 border-top">
                            {/* Peso */}
                            {record.anthropometric_measurements?.current_weight_kg && (
                                <div className="d-flex align-items-center">
                                    <div className="bg-light rounded-circle p-2 me-2 text-primary">
                                        <FaWeight />
                                    </div>
                                    <div>
                                        <div className="small text-muted">Peso</div>
                                        <div className="fw-bold fs-6">
                                            {record.anthropometric_measurements.current_weight_kg} kg
                                            {weightDiff && (
                                                <span className={`ms-2 badge bg-${weightDiff.color}-subtle text-${weightDiff.color} border border-${weightDiff.color}-subtle rounded-pill small`}>
                                                    {weightDiff.direction === 'down' ? <MdTrendingDown /> : weightDiff.direction === 'up' ? <MdTrendingUp /> : <MdTrendingFlat />}
                                                    {' '}{weightDiff.value}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* IMC */}
                            {record.anthropometric_evaluations?.imc_kg_t2 && (
                                <div className="d-flex align-items-center">
                                    <div className="bg-light rounded-circle p-2 me-2 text-info">
                                        <FaRulerVertical />
                                    </div>
                                    <div>
                                        <div className="small text-muted">IMC</div>
                                        <div className="fw-bold fs-6">
                                            {Number(record.anthropometric_evaluations.imc_kg_t2).toFixed(1)}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Presión Arterial (si existe) */}
                            {record.blood_pressure?.systolic && record.blood_pressure?.diastolic && (
                                <div className="d-flex align-items-center">
                                    <div className="bg-light rounded-circle p-2 me-2 text-danger">
                                        <FaHeartbeat />
                                    </div>
                                    <div>
                                        <div className="small text-muted">Presión</div>
                                        <div className="fw-bold fs-6">
                                            {record.blood_pressure.systolic}/{record.blood_pressure.diastolic}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </Card.Body>
                </Card>
            </div>
        </div>
    );
};

export default TimelineItem;
