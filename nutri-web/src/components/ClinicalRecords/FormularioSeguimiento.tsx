// nutri-web/src/components/ClinicalRecords/FormularioSeguimiento.tsx
import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Button, Form, Alert, Spinner, Badge} from 'react-bootstrap';
import { FaStethoscope, FaWeight, FaChartLine, FaSave, FaEye } from 'react-icons/fa';
import ExpedienteDetector from './ExpedienteDetector';
import ComparativoAutomatico from './ComparativoAutomatico';

interface DatosPrevios {
    ultimoExpediente?: any;
    ultimasMediciones?: {
        peso?: number;
        altura?: number;
        imc?: number;
        presion_sistolica?: number;
        presion_diastolica?: number;
        fecha?: string;
    };
    datosEstaticos?: any;
}

interface FormularioSeguimientoProps {
    patientId: string;
    onSubmit: (data: any) => void;
    onCancel: () => void;
    tipoExpediente?: string;
    expedienteBaseId?: string;
    onVerExpedienteBase?: (expedienteId: string) => void;
}

const FormularioSeguimiento: React.FC<FormularioSeguimientoProps> = ({
    patientId,
    onSubmit,
    onCancel,
    tipoExpediente: propTipoExpediente,
    expedienteBaseId: propExpedienteBaseId,
    onVerExpedienteBase
}) => {
    const [formData, setFormData] = useState({
        // Datos básicos
        recordDate: new Date().toISOString().split('T')[0],
        consultationReason: '',
        tipoExpediente: propTipoExpediente || 'seguimiento',
        expedienteBaseId: propExpedienteBaseId,

        // Seguimiento específico
        seguimientoMetadata: {
            adherencia_plan: 50,
            dificultades: '',
            satisfaccion: 3,
            cambios_medicamentos: false,
            nuevos_sintomas: '',
            mejoras_notadas: '',
            proximos_objetivos: ''
        },

        // Mediciones antropométricas (las más importantes)
        anthropometricMeasurements: {
            currentWeightKg: '',
            waistCircCm: ''
        },

        // Presión arterial
        bloodPressure: {
            knowsBp: true,
            systolic: '',
            diastolic: ''
        },

        // Capacidad del paciente
        capacidadPaciente: {
            comprende_medicamentos: true,
            conoce_sintomas_alarma: true,
            sabe_contacto_emergencia: true,
            puede_auto_monitoreo: true,
            requiere_apoyo_familiar: false,
            nivel_independencia: 'alto',
            observaciones: ''
        },

        // Notas de evolución (simplificadas)
        evolutionAndFollowUpNotes: ''
    });

    const [datosPrevios, setDatosPrevios] = useState<DatosPrevios | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [expedienteCreado, setExpedienteCreado] = useState<string | null>(null);
    const [mostrarComparativo, setMostrarComparativo] = useState(false);

    // Cargar datos previos del paciente
    useEffect(() => {
        const cargarDatosPrevios = async () => {
            try {
                const token = localStorage.getItem('access_token');
                if (!token) return;

                const response = await fetch(`/api/clinical-records/patient/${patientId}/previous-data`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (response.status === 401) {
                    localStorage.removeItem('access_token');
                    console.warn('Sesión expirada al cargar datos previos');
                    return;
                }

                if (response.ok) {
                    const data = await response.json();
                    setDatosPrevios(data.data);
                    
                    // Pre-llenar altura si está disponible (no suele cambiar)
                    if (data.data.ultimasMediciones?.altura) {
                        setFormData(prev => ({
                            ...prev,
                            anthropometricMeasurements: {
                                ...prev.anthropometricMeasurements,
                                heightM: data.data.ultimasMediciones.altura
                            }
                        }));
                    }
                }
            } catch (error) {
                console.error('Error cargando datos previos:', error);
            }
        };

        if (patientId) {
            cargarDatosPrevios();
        }
    }, [patientId]);

    const handleDeteccionCompleta = (deteccion: any) => {
        setFormData(prev => ({
            ...prev,
            tipoExpediente: deteccion.tipoSugerido,
            expedienteBaseId: deteccion.expedienteBaseId
        }));
    };

    const handleInputChange = (section: string, field: string, value: any) => {
        setFormData(prev => ({
            ...prev,
            [section]: {
                ...(prev[section as keyof typeof prev] as object || {}),
                [field]: value
            }
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const token = localStorage.getItem('access_token');
            if (!token) {
                throw new Error('No hay sesión activa. Por favor inicia sesión nuevamente.');
            }

            const dataToSubmit = {
                ...formData,
                patientId
            };

            const response = await fetch('/api/clinical-records/evolutivo', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(dataToSubmit)
            });

            if (response.status === 401) {
                localStorage.removeItem('access_token');
                throw new Error('Sesión expirada. Por favor inicia sesión nuevamente.');
            }

            if (response.status === 403) {
                throw new Error('No tienes permisos para crear expedientes de seguimiento.');
            }

            if (!response.ok) {
                const errorData = await response.json().catch(() => null);
                const errorMessage = errorData?.message || `Error del servidor: ${response.status}`;
                throw new Error(errorMessage);
            }

            const result = await response.json();
            setExpedienteCreado(result.data.record.id);
            setMostrarComparativo(true);
            onSubmit(result.data.record);

        } catch (err) {
            console.error('Error creando expediente de seguimiento:', err);
            setError(err instanceof Error ? err.message : 'Error desconocido');
        } finally {
            setLoading(false);
        }
    };

    if (expedienteCreado && mostrarComparativo) {
        return (
            <div>
                <Alert variant="success" className="mb-3">
                    <FaStethoscope className="me-2" />
                    ¡Expediente de seguimiento creado exitosamente!
                </Alert>
                
                {formData.expedienteBaseId && (
                    <ComparativoAutomatico 
                        expedienteActualId={expedienteCreado}
                        expedienteBaseId={formData.expedienteBaseId}
                        onError={(error) => console.error('Error en comparativo:', error)}
                    />
                )}

                <div className="d-flex gap-2">
                    <Button variant="primary" onClick={() => window.location.reload()}>
                        Crear Otro Seguimiento
                    </Button>
                    <Button variant="outline-secondary" onClick={onCancel}>
                        Volver a Lista
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div>
            <Card className="mb-3">
                <Card.Header className="bg-success text-white">
                    <FaStethoscope className="me-2" />
                    Formulario de Seguimiento Simplificado (⏱️ 5 minutos)
                    <Badge bg="light" text="dark" className="ms-2">
                        Optimizado para rapidez
                    </Badge>
                </Card.Header>
            </Card>

            {/* Detector automático de tipo */}
            <ExpedienteDetector
                patientId={patientId}
                motivoConsulta={formData.consultationReason}
                esProgramada={true}
                tipoConsultaSolicitada="seguimiento"
                onDeteccionCompleta={handleDeteccionCompleta}
                onError={(error) => setError(error)}
                onVerExpedienteBase={onVerExpedienteBase}
            />

            {/* Datos previos de referencia */}
            {datosPrevios && datosPrevios.ultimasMediciones && (
                <Card className="mb-3 border-info">
                    <Card.Header className="bg-info text-white">
                        <FaEye className="me-2" />
                        Últimas Mediciones de Referencia
                    </Card.Header>
                    <Card.Body>
                        <Row>
                            <Col md={3}>
                                <strong>Peso:</strong> {datosPrevios.ultimasMediciones.peso || 'N/A'} kg
                            </Col>
                            <Col md={3}>
                                <strong>IMC:</strong> {
                                    datosPrevios.ultimasMediciones.imc 
                                        ? `${Number(datosPrevios.ultimasMediciones.imc).toFixed(1)} kg/m²`
                                        : 'N/A'
                                }
                            </Col>
                            <Col md={3}>
                                <strong>Presión:</strong> {datosPrevios.ultimasMediciones.presion_sistolica || 'N/A'}/{datosPrevios.ultimasMediciones.presion_diastolica || 'N/A'}
                            </Col>
                            <Col md={3}>
                                <small className="text-muted">
                                    Fecha: {datosPrevios.ultimasMediciones.fecha ? 
                                        new Date(datosPrevios.ultimasMediciones.fecha).toLocaleDateString() : 'N/A'}
                                </small>
                            </Col>
                        </Row>
                    </Card.Body>
                </Card>
            )}

            <Form onSubmit={handleSubmit}>
                {/* Información básica */}
                <Card className="mb-3">
                    <Card.Header>
                        <FaStethoscope className="me-2" />
                        Información Básica del Seguimiento
                    </Card.Header>
                    <Card.Body>
                        <Row>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Motivo de la consulta *</Form.Label>
                                    <Form.Control
                                        as="textarea"
                                        rows={2}
                                        value={formData.consultationReason}
                                        onChange={(e) => setFormData(prev => ({...prev, consultationReason: e.target.value}))}
                                        placeholder="Ej: Control de peso, seguimiento de plan nutricional..."
                                        required
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Fecha de registro</Form.Label>
                                    <Form.Control
                                        type="date"
                                        value={formData.recordDate}
                                        onChange={(e) => setFormData(prev => ({...prev, recordDate: e.target.value}))}
                                    />
                                </Form.Group>
                            </Col>
                        </Row>
                    </Card.Body>
                </Card>

                {/* Adherencia y satisfacción */}
                <Card className="mb-3">
                    <Card.Header>
                        <FaChartLine className="me-2" />
                        Adherencia y Progreso
                    </Card.Header>
                    <Card.Body>
                        <Row>
                            <Col md={4}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Adherencia al plan (%) *</Form.Label>
                                    <Form.Range
                                        min={0}
                                        max={100}
                                        value={formData.seguimientoMetadata.adherencia_plan}
                                        onChange={(e) => handleInputChange('seguimientoMetadata', 'adherencia_plan', parseInt(e.target.value))}
                                    />
                                    <div className="text-center">
                                        <Badge bg={formData.seguimientoMetadata.adherencia_plan >= 80 ? 'success' : 
                                                   formData.seguimientoMetadata.adherencia_plan >= 60 ? 'warning' : 'danger'}>
                                            {formData.seguimientoMetadata.adherencia_plan}%
                                        </Badge>
                                    </div>
                                </Form.Group>
                            </Col>
                            <Col md={4}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Nivel de satisfacción *</Form.Label>
                                    <Form.Select
                                        value={formData.seguimientoMetadata.satisfaccion}
                                        onChange={(e) => handleInputChange('seguimientoMetadata', 'satisfaccion', parseInt(e.target.value))}
                                        required
                                    >
                                        <option value={1}>1 - Muy insatisfecho</option>
                                        <option value={2}>2 - Insatisfecho</option>
                                        <option value={3}>3 - Neutral</option>
                                        <option value={4}>4 - Satisfecho</option>
                                        <option value={5}>5 - Muy satisfecho</option>
                                    </Form.Select>
                                </Form.Group>
                            </Col>
                            <Col md={4}>
                                <Form.Group className="mb-3">
                                    <Form.Label>¿Cambios en medicamentos?</Form.Label>
                                    <Form.Check
                                        type="switch"
                                        label="Sí, hubo cambios"
                                        checked={formData.seguimientoMetadata.cambios_medicamentos}
                                        onChange={(e) => handleInputChange('seguimientoMetadata', 'cambios_medicamentos', e.target.checked)}
                                    />
                                </Form.Group>
                            </Col>
                        </Row>

                        <Row>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Dificultades encontradas</Form.Label>
                                    <Form.Control
                                        as="textarea"
                                        rows={2}
                                        value={formData.seguimientoMetadata.dificultades}
                                        onChange={(e) => handleInputChange('seguimientoMetadata', 'dificultades', e.target.value)}
                                        placeholder="Describe las principales dificultades..."
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Mejoras notadas</Form.Label>
                                    <Form.Control
                                        as="textarea"
                                        rows={2}
                                        value={formData.seguimientoMetadata.mejoras_notadas}
                                        onChange={(e) => handleInputChange('seguimientoMetadata', 'mejoras_notadas', e.target.value)}
                                        placeholder="Describe las mejoras observadas..."
                                    />
                                </Form.Group>
                            </Col>
                        </Row>
                    </Card.Body>
                </Card>

                {/* Mediciones clave */}
                <Card className="mb-3">
                    <Card.Header>
                        <FaWeight className="me-2" />
                        Mediciones Clave
                    </Card.Header>
                    <Card.Body>
                        <Row>
                            <Col md={3}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Peso actual (kg) *</Form.Label>
                                    <Form.Control
                                        type="number"
                                        step="0.1"
                                        value={formData.anthropometricMeasurements.currentWeightKg}
                                        onChange={(e) => handleInputChange('anthropometricMeasurements', 'currentWeightKg', parseFloat(e.target.value))}
                                        placeholder="Ej: 75.5"
                                        required
                                    />
                                    {datosPrevios?.ultimasMediciones?.peso && (
                                        <Form.Text className="text-muted">
                                            Anterior: {datosPrevios.ultimasMediciones.peso} kg
                                        </Form.Text>
                                    )}
                                </Form.Group>
                            </Col>
                            <Col md={3}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Cintura (cm)</Form.Label>
                                    <Form.Control
                                        type="number"
                                        step="0.1"
                                        value={formData.anthropometricMeasurements.waistCircCm}
                                        onChange={(e) => handleInputChange('anthropometricMeasurements', 'waistCircCm', parseFloat(e.target.value))}
                                        placeholder="Ej: 85.0"
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={3}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Presión sistólica</Form.Label>
                                    <Form.Control
                                        type="number"
                                        value={formData.bloodPressure.systolic}
                                        onChange={(e) => handleInputChange('bloodPressure', 'systolic', parseInt(e.target.value))}
                                        placeholder="Ej: 120"
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={3}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Presión diastólica</Form.Label>
                                    <Form.Control
                                        type="number"
                                        value={formData.bloodPressure.diastolic}
                                        onChange={(e) => handleInputChange('bloodPressure', 'diastolic', parseInt(e.target.value))}
                                        placeholder="Ej: 80"
                                    />
                                </Form.Group>
                            </Col>
                        </Row>
                    </Card.Body>
                </Card>

                {/* Notas de evolución */}
                <Card className="mb-3">
                    <Card.Header>Notas de Evolución</Card.Header>
                    <Card.Body>
                        <Form.Group className="mb-3">
                            <Form.Label>Observaciones y recomendaciones</Form.Label>
                            <Form.Control
                                as="textarea"
                                rows={3}
                                value={formData.evolutionAndFollowUpNotes}
                                onChange={(e) => setFormData(prev => ({...prev, evolutionAndFollowUpNotes: e.target.value}))}
                                placeholder="Observaciones generales, cambios en el plan, próximos objetivos..."
                            />
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>Próximos objetivos</Form.Label>
                            <Form.Control
                                value={formData.seguimientoMetadata.proximos_objetivos}
                                onChange={(e) => handleInputChange('seguimientoMetadata', 'proximos_objetivos', e.target.value)}
                                placeholder="Objetivos para la próxima consulta..."
                            />
                        </Form.Group>
                    </Card.Body>
                </Card>

                {error && (
                    <Alert variant="danger" className="mb-3">
                        {error}
                    </Alert>
                )}

                {/* Botones de acción */}
                <div className="d-flex justify-content-end gap-2">
                    <Button variant="outline-secondary" onClick={onCancel} disabled={loading}>
                        Cancelar
                    </Button>
                    <Button type="submit" variant="success" disabled={loading}>
                        {loading ? (
                            <>
                                <Spinner size="sm" className="me-2" />
                                Guardando...
                            </>
                        ) : (
                            <>
                                <FaSave className="me-2" />
                                Guardar Seguimiento
                            </>
                        )}
                    </Button>
                </div>
            </Form>
        </div>
    );
};

export default FormularioSeguimiento; 