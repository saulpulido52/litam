import React, { useState, useEffect } from 'react';
import { 
    Table, 
    Card, 
    Button, 
    Row, 
    Col, 
    Modal,
    Badge,
    Spinner,
    Form,
    Alert,
    Pagination
} from 'react-bootstrap';
import { useEliminaciones } from '../../hooks/useAdmin';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

const AdminAuditoriaEliminaciones: React.FC = () => {
    const {
        eliminaciones,
        loading,
        error,
        stats,
        pagination,
        fetchEliminaciones,
        exportarEliminaciones
    } = useEliminaciones();

    const [filters, setFilters] = useState({
        fechaDesde: '',
        fechaHasta: '',
        nutriologoId: '',
        pacienteId: ''
    });

    const [showFilters, setShowFilters] = useState(false);
    const [exporting, setExporting] = useState(false);
    const [selectedEliminacion, setSelectedEliminacion] = useState<any>(null);
    const [showDetailModal, setShowDetailModal] = useState(false);

    useEffect(() => {
        fetchEliminaciones();
    }, [fetchEliminaciones]);

    const handleFilterChange = (field: string, value: string) => {
        setFilters(prev => ({ ...prev, [field]: value }));
    };

    const handleApplyFilters = () => {
        fetchEliminaciones({
            ...filters,
            page: 1
        });
    };

    const handleClearFilters = () => {
        setFilters({
            fechaDesde: '',
            fechaHasta: '',
            nutriologoId: '',
            pacienteId: ''
        });
        fetchEliminaciones({ page: 1 });
    };

    const handleExport = async (format: 'csv' | 'pdf') => {
        setExporting(true);
        try {
            await exportarEliminaciones(format, filters);
        } catch (error) {
            console.error('Error exportando:', error);
        } finally {
            setExporting(false);
        }
    };

    const handlePageChange = (page: number) => {
        fetchEliminaciones({
            ...filters,
            page
        });
    };

    const handleShowDetail = (eliminacion: any) => {
        setSelectedEliminacion(eliminacion);
        setShowDetailModal(true);
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'inactive':
                return <Badge bg="danger">Inactiva</Badge>;
            case 'active':
                return <Badge bg="success">Activa</Badge>;
            default:
                return <Badge bg="secondary">{status}</Badge>;
        }
    };

    const formatDate = (dateString: string) => {
        try {
            return format(new Date(dateString), 'dd/MM/yyyy HH:mm', { locale: es });
        } catch {
            return dateString;
        }
    };

    return (
        <div className="admin-auditoria-eliminaciones">
            <Card>
                <Card.Header className="d-flex justify-content-between align-items-center">
                    <h5 className="mb-0">
                        <i className="fas fa-trash-alt me-2"></i>
                        Auditoría de Eliminaciones
                    </h5>
                    <div>
                        <Button
                            variant="outline-secondary"
                            size="sm"
                            onClick={() => setShowFilters(!showFilters)}
                            className="me-2"
                        >
                            <i className="fas fa-filter me-1"></i>
                            Filtros
                        </Button>
                        <Button
                            variant="outline-success"
                            size="sm"
                            onClick={() => handleExport('csv')}
                            disabled={exporting}
                            className="me-2"
                        >
                            {exporting ? (
                                <Spinner animation="border" size="sm" />
                            ) : (
                                <i className="fas fa-download me-1"></i>
                            )}
                            CSV
                        </Button>
                        <Button
                            variant="outline-primary"
                            size="sm"
                            onClick={() => handleExport('pdf')}
                            disabled={exporting}
                        >
                            {exporting ? (
                                <Spinner animation="border" size="sm" />
                            ) : (
                                <i className="fas fa-file-pdf me-1"></i>
                            )}
                            PDF
                        </Button>
                    </div>
                </Card.Header>

                <Card.Body>
                    {/* Filtros */}
                    {showFilters && (
                        <Card className="mb-3">
                            <Card.Body>
                                <Row>
                                    <Col md={3}>
                                        <Form.Group>
                                            <Form.Label>Fecha Desde</Form.Label>
                                            <Form.Control
                                                type="date"
                                                value={filters.fechaDesde}
                                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleFilterChange('fechaDesde', e.target.value)}
                                            />
                                        </Form.Group>
                                    </Col>
                                    <Col md={3}>
                                        <Form.Group>
                                            <Form.Label>Fecha Hasta</Form.Label>
                                            <Form.Control
                                                type="date"
                                                value={filters.fechaHasta}
                                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleFilterChange('fechaHasta', e.target.value)}
                                            />
                                        </Form.Group>
                                    </Col>
                                    <Col md={3}>
                                        <Form.Group>
                                            <Form.Label>ID Nutriólogo</Form.Label>
                                            <Form.Control
                                                type="text"
                                                placeholder="ID del nutriólogo"
                                                value={filters.nutriologoId}
                                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleFilterChange('nutriologoId', e.target.value)}
                                            />
                                        </Form.Group>
                                    </Col>
                                    <Col md={3}>
                                        <Form.Group>
                                            <Form.Label>ID Paciente</Form.Label>
                                            <Form.Control
                                                type="text"
                                                placeholder="ID del paciente"
                                                value={filters.pacienteId}
                                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleFilterChange('pacienteId', e.target.value)}
                                            />
                                        </Form.Group>
                                    </Col>
                                </Row>
                                <div className="mt-3">
                                    <Button
                                        variant="primary"
                                        size="sm"
                                        onClick={handleApplyFilters}
                                        className="me-2"
                                    >
                                        Aplicar Filtros
                                    </Button>
                                    <Button
                                        variant="outline-secondary"
                                        size="sm"
                                        onClick={handleClearFilters}
                                    >
                                        Limpiar Filtros
                                    </Button>
                                </div>
                            </Card.Body>
                        </Card>
                    )}

                    {/* Estadísticas */}
                    {stats && (
                        <Row className="mb-3">
                            <Col md={2}>
                                <Card className="text-center">
                                    <Card.Body>
                                        <h6>Total</h6>
                                        <h4>{stats.total}</h4>
                                    </Card.Body>
                                </Card>
                            </Col>
                            <Col md={2}>
                                <Card className="text-center">
                                    <Card.Body>
                                        <h6>Pacientes Únicos</h6>
                                        <h4>{stats.pacientesUnicos}</h4>
                                    </Card.Body>
                                </Card>
                            </Col>
                            <Col md={2}>
                                <Card className="text-center">
                                    <Card.Body>
                                        <h6>Nutriólogos</h6>
                                        <h4>{stats.nutriologosInvolucrados}</h4>
                                    </Card.Body>
                                </Card>
                            </Col>
                            <Col md={2}>
                                <Card className="text-center">
                                    <Card.Body>
                                        <h6>Con Motivo</h6>
                                        <h4>{stats.conMotivo}</h4>
                                    </Card.Body>
                                </Card>
                            </Col>
                            <Col md={2}>
                                <Card className="text-center">
                                    <Card.Body>
                                        <h6>Sin Motivo</h6>
                                        <h4>{stats.sinMotivo}</h4>
                                    </Card.Body>
                                </Card>
                            </Col>
                        </Row>
                    )}

                    {/* Error */}
                    {error && (
                        <Alert variant="danger">
                            <i className="fas fa-exclamation-triangle me-2"></i>
                            {error}
                        </Alert>
                    )}

                    {/* Tabla */}
                    {loading ? (
                        <div className="text-center py-4">
                            <Spinner animation="border" />
                            <p className="mt-2">Cargando eliminaciones...</p>
                        </div>
                    ) : (
                        <>
                            <Table responsive striped hover>
                                <thead>
                                    <tr>
                                        <th>Paciente</th>
                                        <th>Nutriólogo</th>
                                        <th>Estado</th>
                                        <th>Fecha Eliminación</th>
                                        <th>Motivo</th>
                                        <th>Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {eliminaciones.map((eliminacion) => (
                                        <tr key={eliminacion.id}>
                                            <td>
                                                <div>
                                                    <strong>{eliminacion.patient.name}</strong>
                                                    <br />
                                                    <small className="text-muted">
                                                        {eliminacion.patient.email}
                                                    </small>
                                                </div>
                                            </td>
                                            <td>
                                                <div>
                                                    <strong>{eliminacion.nutritionist.name}</strong>
                                                    <br />
                                                    <small className="text-muted">
                                                        {eliminacion.nutritionist.email}
                                                    </small>
                                                </div>
                                            </td>
                                            <td>
                                                {getStatusBadge(eliminacion.status)}
                                            </td>
                                            <td>
                                                {formatDate(eliminacion.updated_at)}
                                            </td>
                                            <td>
                                                {eliminacion.elimination_reason ? (
                                                    <span className="text-truncate d-inline-block" style={{ maxWidth: '200px' }}>
                                                        {eliminacion.elimination_reason}
                                                    </span>
                                                ) : (
                                                    <span className="text-muted">Sin motivo</span>
                                                )}
                                            </td>
                                            <td>
                                                <Button
                                                    variant="outline-info"
                                                    size="sm"
                                                    onClick={() => handleShowDetail(eliminacion)}
                                                >
                                                    <i className="fas fa-eye"></i>
                                                </Button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </Table>

                            {/* Paginación */}
                            {pagination && pagination.totalPages > 1 && (
                                <div className="d-flex justify-content-center">
                                    <Pagination>
                                        <Pagination.First
                                            onClick={() => handlePageChange(1)}
                                            disabled={pagination.page === 1}
                                        />
                                        <Pagination.Prev
                                            onClick={() => handlePageChange(pagination.page - 1)}
                                            disabled={pagination.page === 1}
                                        />
                                        
                                        {Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
                                            .filter(page => 
                                                page === 1 || 
                                                page === pagination.totalPages || 
                                                Math.abs(page - pagination.page) <= 2
                                            )
                                            .map((page, index, array) => (
                                                <React.Fragment key={page}>
                                                    {index > 0 && array[index - 1] !== page - 1 && (
                                                        <Pagination.Ellipsis />
                                                    )}
                                                    <Pagination.Item
                                                        active={page === pagination.page}
                                                        onClick={() => handlePageChange(page)}
                                                    >
                                                        {page}
                                                    </Pagination.Item>
                                                </React.Fragment>
                                            ))
                                        }
                                        
                                        <Pagination.Next
                                            onClick={() => handlePageChange(pagination.page + 1)}
                                            disabled={pagination.page === pagination.totalPages}
                                        />
                                        <Pagination.Last
                                            onClick={() => handlePageChange(pagination.totalPages)}
                                            disabled={pagination.page === pagination.totalPages}
                                        />
                                    </Pagination>
                                </div>
                            )}
                        </>
                    )}
                </Card.Body>
            </Card>

            {/* Modal de Detalle */}
            <Modal
                show={showDetailModal}
                onHide={() => setShowDetailModal(false)}
                size="lg"
            >
                <Modal.Header closeButton>
                    <Modal.Title>
                        <i className="fas fa-info-circle me-2"></i>
                        Detalle de Eliminación
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {selectedEliminacion && (
                        <div>
                            <Row>
                                <Col md={6}>
                                    <h6>Paciente</h6>
                                    <p>
                                        <strong>Nombre:</strong> {selectedEliminacion.patient.name}<br />
                                        <strong>Email:</strong> {selectedEliminacion.patient.email}<br />
                                        <strong>ID:</strong> {selectedEliminacion.patient.id}
                                    </p>
                                </Col>
                                <Col md={6}>
                                    <h6>Nutriólogo</h6>
                                    <p>
                                        <strong>Nombre:</strong> {selectedEliminacion.nutritionist.name}<br />
                                        <strong>Email:</strong> {selectedEliminacion.nutritionist.email}<br />
                                        <strong>ID:</strong> {selectedEliminacion.nutritionist.id}
                                    </p>
                                </Col>
                            </Row>
                            <hr />
                            <Row>
                                <Col md={6}>
                                    <h6>Información de la Relación</h6>
                                    <p>
                                        <strong>Estado:</strong> {getStatusBadge(selectedEliminacion.status)}<br />
                                        <strong>ID Relación:</strong> {selectedEliminacion.id}<br />
                                        <strong>Creada:</strong> {formatDate(selectedEliminacion.created_at)}<br />
                                        <strong>Actualizada:</strong> {formatDate(selectedEliminacion.updated_at)}
                                    </p>
                                </Col>
                                <Col md={6}>
                                    <h6>Motivo de Eliminación</h6>
                                    {selectedEliminacion.elimination_reason ? (
                                        <p className="text-break">{selectedEliminacion.elimination_reason}</p>
                                    ) : (
                                        <p className="text-muted">No se proporcionó motivo</p>
                                    )}
                                </Col>
                            </Row>
                            {selectedEliminacion.notes && (
                                <>
                                    <hr />
                                    <Row>
                                        <Col>
                                            <h6>Notas Adicionales</h6>
                                            <p className="text-break">{selectedEliminacion.notes}</p>
                                        </Col>
                                    </Row>
                                </>
                            )}
                        </div>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowDetailModal(false)}>
                        Cerrar
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
};

export default AdminAuditoriaEliminaciones; 