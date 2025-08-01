// nutri-web/src/pages/admin/NutritionistManagement.tsx
import React, { useState, useEffect } from 'react';
import { 
    Container, 
    Row, 
    Col, 
    Card, 
    Button, 
    Table, 
    Modal,
    InputGroup,
    Tabs,
    Tab,
    Badge,
    Form,
    Alert,
    Spinner
} from 'react-bootstrap';
import { 
    MdSearch, 
    MdVisibility, 
    MdCheck, 
    MdClose, 
    MdPending,
    MdVerifiedUser,
    MdDescription,
    MdEmail,
    MdLocationOn,
    MdSchool,
    MdCalendarToday} from 'react-icons/md';
import axios from 'axios';

interface NutritionistProfile {
    id: string;
    user: {
        id: string;
        email: string;
        first_name: string;
        last_name: string;
        phone?: string;
        birth_date?: string;
        gender?: string;
        is_active: boolean;
        created_at: string;
    };
    profile: {
        id: string;
        professional_id: string;
        professional_id_issuer?: string;
        university?: string;
        degree_title?: string;
        graduation_date?: string;
        rfc?: string;
        curp?: string;
        verification_status: 'pending' | 'approved' | 'rejected' | 'under_review';
        verification_notes?: string;
        verified_at?: string;
        uploaded_documents?: {
            professional_id_front?: string;
            professional_id_back?: string;
            diploma?: string;
            additional_certifications?: string[];
        };
        specialties?: string[];
        years_of_experience?: number;
        education?: string[];
        bio?: string;
        consultation_fee?: number;
        clinic_name?: string;
        clinic_address?: string;
        clinic_city?: string;
        clinic_state?: string;
        offers_in_person?: boolean;
        offers_online?: boolean;
        created_at: string;
    };
}

interface SearchFilters {
    search: string;
    verification_status: string;
    university: string;
    page: number;
    limit: number;
}

interface Stats {
    total_registrations: number;
    by_status: {
        pending: number;
        approved: number;
        rejected: number;
        under_review: number;
    };
    recent_activity: {
        last_week: number;
        last_month: number;
    };
}

const NutritionistManagement: React.FC = () => {
    const [nutritionists, setNutritionists] = useState<NutritionistProfile[]>([]);
    const [stats, setStats] = useState<Stats | null>(null);
    // Variable/función removida - no utilizada
const [selectedNutritionist, setSelectedNutritionist] = useState<NutritionistProfile | null>(null);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [showVerificationModal, setShowVerificationModal] = useState(false);
    const [verificationAction, setVerificationAction] = useState<'approved' | 'rejected' | 'under_review'>('approved');
    const [verificationNotes, setVerificationNotes] = useState('');
    const [processingVerification, setProcessingVerification] = useState(false);
    
    const [filters, setFilters] = useState<SearchFilters>({
        search: '',
        verification_status: '',
        university: '',
        page: 1,
        limit: 10
    });

    // Variable/función removida - no utilizada
    const [totalResults, setTotalResults] = useState(0);
    const [loading, setLoading] = useState(false);
    const [totalPages, setTotalPages] = useState(0);

    useEffect(() => {
        loadStats();
        searchNutritionists();
    }, [filters]);

    const loadStats = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get('/api/nutritionists/admin/stats', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setStats(response.data.data);
        } catch (error) {
            console.error('Error loading stats:', error);
        }
    };

    const searchNutritionists = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const params = new URLSearchParams();
            
            Object.entries(filters).forEach(([key, value]) => {
                if (value && value !== '') {
                    params.append(key, value.toString());
                }
            });

            const response = await axios.get(`/api/nutritionists/admin/search?${params}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            setNutritionists(response.data.data.nutritionists);
            setTotalPages(response.data.data.totalPages);
            setTotalResults(response.data.data.total);
        } catch (error) {
            console.error('Error searching nutritionists:', error);
        } finally {
            setLoading(false);
        }
    };

    const loadNutritionistDetails = async (profileId: string) => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`/api/nutritionists/admin/${profileId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setSelectedNutritionist(response.data.data);
            setShowDetailModal(true);
        } catch (error) {
            console.error('Error loading nutritionist details:', error);
        }
    };

    const handleVerification = async () => {
        if (!selectedNutritionist) return;
        
        setProcessingVerification(true);
        try {
            const token = localStorage.getItem('token');
            await axios.put(
                `/api/nutritionists/admin/${selectedNutritionist.profile.id}/verify`,
                {
                    verification_status: verificationAction,
                    verification_notes: verificationNotes
                },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            
            setShowVerificationModal(false);
            setShowDetailModal(false);
            setVerificationNotes('');
            searchNutritionists();
            loadStats();
            
            alert(`Nutriólogo ${verificationAction === 'approved' ? 'aprobado' : verificationAction === 'rejected' ? 'rechazado' : 'marcado para revisión'} exitosamente`);
        } catch (error) {
            console.error('Error verifying nutritionist:', error);
            alert('Error al procesar la verificación');
        } finally {
            setProcessingVerification(false);
        }
    };

    const getStatusBadge = (status: string) => {
        const variants = {
            pending: 'warning',
            approved: 'success',
            rejected: 'danger',
            under_review: 'info'
        };
        const texts = {
            pending: 'Pendiente',
            approved: 'Aprobado',
            rejected: 'Rechazado',
            under_review: 'En Revisión'
        };
        return (
            <Badge bg={variants[status as keyof typeof variants]}>
                {texts[status as keyof typeof texts]}
            </Badge>
        );
    };

    return (
        <Container fluid className="py-4">
            <Row className="mb-4">
                <Col>
                    <h2>
                        <MdVerifiedUser className="me-2" />
                        Gestión de Nutriólogos
                    </h2>
                    <p className="text-muted">
                        Validar y aprobar registros de profesionales en nutrición
                    </p>
                </Col>
            </Row>

            {/* Estadísticas */}
            {stats && (
                <Row className="mb-4">
                    <Col md={3}>
                        <Card className="border-0 shadow-sm">
                            <Card.Body className="text-center">
                                <h4 className="text-primary">{stats.total_registrations}</h4>
                                <small className="text-muted">Total Registros</small>
                            </Card.Body>
                        </Card>
                    </Col>
                    <Col md={3}>
                        <Card className="border-0 shadow-sm">
                            <Card.Body className="text-center">
                                <h4 className="text-warning">{stats.by_status.pending}</h4>
                                <small className="text-muted">Pendientes</small>
                            </Card.Body>
                        </Card>
                    </Col>
                    <Col md={3}>
                        <Card className="border-0 shadow-sm">
                            <Card.Body className="text-center">
                                <h4 className="text-success">{stats.by_status.approved}</h4>
                                <small className="text-muted">Aprobados</small>
                            </Card.Body>
                        </Card>
                    </Col>
                    <Col md={3}>
                        <Card className="border-0 shadow-sm">
                            <Card.Body className="text-center">
                                <h4 className="text-info">{stats.recent_activity.last_week}</h4>
                                <small className="text-muted">Última Semana</small>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            )}

            {/* Filtros de búsqueda */}
            <Card className="mb-4">
                <Card.Body>
                    <Row>
                        <Col md={4}>
                            <InputGroup>
                                <InputGroup.Text>
                                    <MdSearch />
                                </InputGroup.Text>
                                <Form.Control
                                    type="text"
                                    placeholder="Buscar por nombre, email, cédula..."
                                    value={filters.search}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFilters({...filters, search: e.target.value, page: 1})}
                                />
                            </InputGroup>
                        </Col>
                        <Col md={3}>
                            <Form.Select
                                value={filters.verification_status}
                                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setFilters({...filters, verification_status: e.target.value, page: 1})}
                            >
                                <option value="">Todos los estados</option>
                                <option value="pending">Pendientes</option>
                                <option value="approved">Aprobados</option>
                                <option value="rejected">Rechazados</option>
                                <option value="under_review">En Revisión</option>
                            </Form.Select>
                        </Col>
                        <Col md={3}>
                            <Form.Control
                                type="text"
                                placeholder="Universidad"
                                value={filters.university}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFilters({...filters, university: e.target.value, page: 1})}
                            />
                        </Col>
                        <Col md={2}>
                            <Button variant="primary" onClick={searchNutritionists} disabled={loading}>
                                {loading ? <Spinner size="sm" /> : 'Buscar'}
                            </Button>
                        </Col>
                    </Row>
                </Card.Body>
            </Card>

            {/* Tabla de resultados */}
            <Card>
                <Card.Header>
                    <Row className="align-items-center">
                        <Col>
                            <h5 className="mb-0">
                                Nutriólogos Registrados ({totalResults} resultados)
                            </h5>
                        </Col>
                    </Row>
                </Card.Header>
                <Card.Body className="p-0">
                    {loading ? (
                        <div className="text-center py-4">
                            <Spinner animation="border" />
                            <p className="mt-2">Cargando nutriólogos...</p>
                        </div>
                    ) : nutritionists.length === 0 ? (
                        <div className="text-center py-4">
                            <p className="text-muted">No se encontraron nutriólogos con los filtros aplicados</p>
                        </div>
                    ) : (
                        <Table responsive hover>
                            <thead className="bg-light">
                                <tr>
                                    <th>Nutriólogo</th>
                                    <th>Cédula Profesional</th>
                                    <th>Universidad</th>
                                    <th>Estado</th>
                                    <th>Fecha Registro</th>
                                    <th>Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {nutritionists.map((nutritionist) => (
                                    <tr key={nutritionist.profile.id}>
                                        <td>
                                            <div>
                                                <strong>
                                                    {nutritionist.user.first_name} {nutritionist.user.last_name}
                                                </strong>
                                                <br />
                                                <small className="text-muted">{nutritionist.user.email}</small>
                                            </div>
                                        </td>
                                        <td>
                                            <code>{nutritionist.profile.professional_id}</code>
                                        </td>
                                        <td>{nutritionist.profile.university || '-'}</td>
                                        <td>{getStatusBadge(nutritionist.profile.verification_status)}</td>
                                        <td>
                                            {new Date(nutritionist.profile.created_at).toLocaleDateString('es-ES')}
                                        </td>
                                        <td>
                                            <Button
                                                size="sm"
                                                variant="outline-primary"
                                                onClick={() => loadNutritionistDetails(nutritionist.profile.id)}
                                            >
                                                <MdVisibility className="me-1" />
                                                Ver Detalles
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </Table>
                    )}
                </Card.Body>
            </Card>

            {/* Paginación */}
            {totalPages > 1 && (
                <div className="d-flex justify-content-center mt-4">
                    <Button
                        variant="outline-secondary"
                        disabled={filters.page === 1}
                        onClick={() => setFilters({...filters, page: filters.page - 1})}
                        className="me-2"
                    >
                        Anterior
                    </Button>
                    <span className="align-self-center mx-3">
                        Página {filters.page} de {totalPages}
                    </span>
                    <Button
                        variant="outline-secondary"
                        disabled={filters.page === totalPages}
                        onClick={() => setFilters({...filters, page: filters.page + 1})}
                    >
                        Siguiente
                    </Button>
                </div>
            )}

            {/* Modal de detalles */}
            <Modal show={showDetailModal} onHide={() => setShowDetailModal(false)} size="xl">
                <Modal.Header closeButton>
                    <Modal.Title>
                        Detalles del Nutriólogo
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {selectedNutritionist && (
                        <Tabs defaultActiveKey="personal" className="mb-3">
                            <Tab eventKey="personal" title="Información Personal">
                                <Row>
                                    <Col md={6}>
                                        <h6><MdEmail className="me-2" />Información de Contacto</h6>
                                        <p><strong>Email:</strong> {selectedNutritionist.user.email}</p>
                                        <p><strong>Teléfono:</strong> {selectedNutritionist.user.phone || 'No proporcionado'}</p>
                                        <p><strong>Género:</strong> {selectedNutritionist.user.gender || 'No especificado'}</p>
                                        <p><strong>Fecha de Nacimiento:</strong> {selectedNutritionist.user.birth_date ? new Date(selectedNutritionist.user.birth_date).toLocaleDateString('es-ES') : 'No proporcionada'}</p>
                                    </Col>
                                    <Col md={6}>
                                        <h6><MdLocationOn className="me-2" />Consultorio</h6>
                                        <p><strong>Nombre:</strong> {selectedNutritionist.profile.clinic_name || 'No especificado'}</p>
                                        <p><strong>Dirección:</strong> {selectedNutritionist.profile.clinic_address || 'No especificada'}</p>
                                        <p><strong>Ciudad:</strong> {selectedNutritionist.profile.clinic_city || 'No especificada'}</p>
                                        <p><strong>Estado:</strong> {selectedNutritionist.profile.clinic_state || 'No especificado'}</p>
                                        <p><strong>Modalidades:</strong> 
                                            {selectedNutritionist.profile.offers_in_person && ' Presencial'}
                                            {selectedNutritionist.profile.offers_online && ' Online'}
                                        </p>
                                    </Col>
                                </Row>
                            </Tab>
                            
                            <Tab eventKey="professional" title="Validación Profesional">
                                <Row>
                                    <Col md={6}>
                                        <h6><MdSchool className="me-2" />Credenciales</h6>
                                        <p><strong>Cédula Profesional:</strong> <code>{selectedNutritionist.profile.professional_id}</code></p>
                                        <p><strong>Entidad Emisora:</strong> {selectedNutritionist.profile.professional_id_issuer || 'No especificada'}</p>
                                        <p><strong>RFC:</strong> <code>{selectedNutritionist.profile.rfc || 'No proporcionado'}</code></p>
                                        <p><strong>CURP:</strong> <code>{selectedNutritionist.profile.curp || 'No proporcionado'}</code></p>
                                    </Col>
                                    <Col md={6}>
                                        <h6><MdCalendarToday className="me-2" />Formación</h6>
                                        <p><strong>Universidad:</strong> {selectedNutritionist.profile.university}</p>
                                        <p><strong>Título:</strong> {selectedNutritionist.profile.degree_title}</p>
                                        <p><strong>Fecha de Graduación:</strong> {selectedNutritionist.profile.graduation_date ? new Date(selectedNutritionist.profile.graduation_date).toLocaleDateString('es-ES') : 'No especificada'}</p>
                                        <p><strong>Años de Experiencia:</strong> {selectedNutritionist.profile.years_of_experience || 0}</p>
                                    </Col>
                                </Row>

                                {selectedNutritionist.profile.uploaded_documents && (
                                    <div className="mt-4">
                                        <h6><MdDescription className="me-2" />Documentos Cargados</h6>
                                        <Row>
                                            {selectedNutritionist.profile.uploaded_documents.professional_id_front && (
                                                <Col md={4}>
                                                    <Card className="mb-2">
                                                        <Card.Body className="text-center">
                                                            <small>Cédula (Frontal)</small><br />
                                                            <Button size="sm" variant="outline-primary" href={selectedNutritionist.profile.uploaded_documents.professional_id_front} target="_blank">
                                                                Ver Documento
                                                            </Button>
                                                        </Card.Body>
                                                    </Card>
                                                </Col>
                                            )}
                                            {selectedNutritionist.profile.uploaded_documents.professional_id_back && (
                                                <Col md={4}>
                                                    <Card className="mb-2">
                                                        <Card.Body className="text-center">
                                                            <small>Cédula (Reverso)</small><br />
                                                            <Button size="sm" variant="outline-primary" href={selectedNutritionist.profile.uploaded_documents.professional_id_back} target="_blank">
                                                                Ver Documento
                                                            </Button>
                                                        </Card.Body>
                                                    </Card>
                                                </Col>
                                            )}
                                            {selectedNutritionist.profile.uploaded_documents.diploma && (
                                                <Col md={4}>
                                                    <Card className="mb-2">
                                                        <Card.Body className="text-center">
                                                            <small>Título Profesional</small><br />
                                                            <Button size="sm" variant="outline-primary" href={selectedNutritionist.profile.uploaded_documents.diploma} target="_blank">
                                                                Ver Documento
                                                            </Button>
                                                        </Card.Body>
                                                    </Card>
                                                </Col>
                                            )}
                                        </Row>
                                    </div>
                                )}
                            </Tab>

                            <Tab eventKey="experience" title="Experiencia">
                                <div>
                                    <h6>Especialidades</h6>
                                    <div className="mb-3">
                                        {selectedNutritionist.profile.specialties?.map((specialty, index) => (
                                            <Badge key={index} bg="secondary" className="me-2 mb-1">
                                                {specialty}
                                            </Badge>
                                        )) || <span className="text-muted">No especificadas</span>}
                                    </div>

                                    <h6>Educación</h6>
                                    <ul>
                                        {selectedNutritionist.profile.education?.map((edu, index) => (
                                            <li key={index}>{edu}</li>
                                        )) || <li className="text-muted">No especificada</li>}
                                    </ul>

                                    <h6>Biografía Profesional</h6>
                                    <p>{selectedNutritionist.profile.bio || 'No proporcionada'}</p>

                                    <h6>Tarifa de Consulta</h6>
                                    <p>${selectedNutritionist.profile.consultation_fee || 0} MXN</p>
                                </div>
                            </Tab>
                        </Tabs>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <div className="d-flex w-100 justify-content-between">
                        <div>
                            <strong>Estado Actual: </strong>
                            {selectedNutritionist && getStatusBadge(selectedNutritionist.profile.verification_status)}
                            {selectedNutritionist?.profile.verification_notes && (
                                <div className="mt-2">
                                    <small className="text-muted">
                                        <strong>Notas:</strong> {selectedNutritionist.profile.verification_notes}
                                    </small>
                                </div>
                            )}
                        </div>
                        <div>
                            {selectedNutritionist?.profile.verification_status === 'pending' || 
                             selectedNutritionist?.profile.verification_status === 'under_review' ? (
                                <>
                                    <Button 
                                        variant="success" 
                                        className="me-2"
                                        onClick={() => {
                                            setVerificationAction('approved');
                                            setShowVerificationModal(true);
                                        }}
                                    >
                                        <MdCheck className="me-1" />
                                        Aprobar
                                    </Button>
                                    <Button 
                                        variant="warning" 
                                        className="me-2"
                                        onClick={() => {
                                            setVerificationAction('under_review');
                                            setShowVerificationModal(true);
                                        }}
                                    >
                                        <MdPending className="me-1" />
                                        Marcar para Revisión
                                    </Button>
                                    <Button 
                                        variant="danger"
                                        onClick={() => {
                                            setVerificationAction('rejected');
                                            setShowVerificationModal(true);
                                        }}
                                    >
                                        <MdClose className="me-1" />
                                        Rechazar
                                    </Button>
                                </>
                            ) : (
                                <Badge bg={selectedNutritionist?.profile.verification_status === 'approved' ? 'success' : 'danger'}>
                                    {selectedNutritionist?.profile.verification_status === 'approved' ? 'Aprobado' : 'Rechazado'}
                                </Badge>
                            )}
                        </div>
                    </div>
                </Modal.Footer>
            </Modal>

            {/* Modal de verificación */}
            <Modal show={showVerificationModal} onHide={() => setShowVerificationModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>
                        {verificationAction === 'approved' && 'Aprobar Nutriólogo'}
                        {verificationAction === 'rejected' && 'Rechazar Nutriólogo'}
                        {verificationAction === 'under_review' && 'Marcar para Revisión'}
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Alert variant={verificationAction === 'approved' ? 'success' : verificationAction === 'rejected' ? 'danger' : 'warning'}>
                        {verificationAction === 'approved' && '¿Está seguro de que desea aprobar este nutriólogo? Se le enviará un email de confirmación y podrá acceder al sistema.'}
                        {verificationAction === 'rejected' && '¿Está seguro de que desea rechazar este nutriólogo? Se le enviará un email de notificación.'}
                        {verificationAction === 'under_review' && 'El nutriólogo será marcado para revisión adicional.'}
                    </Alert>
                    
                    <Form.Group>
                        <Form.Label>Notas de Verificación {verificationAction === 'rejected' && '(Requeridas)'}</Form.Label>
                        <Form.Control
                            as="textarea"
                            rows={3}
                            placeholder="Ingrese notas sobre la verificación..."
                            value={verificationNotes}
                            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setVerificationNotes(e.target.value)}
                            required={verificationAction === 'rejected'}
                        />
                    </Form.Group>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowVerificationModal(false)}>
                        Cancelar
                    </Button>
                    <Button 
                        variant={verificationAction === 'approved' ? 'success' : verificationAction === 'rejected' ? 'danger' : 'warning'}
                        onClick={handleVerification}
                        disabled={processingVerification || (verificationAction === 'rejected' && !verificationNotes.trim())}
                    >
                        {processingVerification ? <Spinner size="sm" className="me-1" /> : null}
                        {verificationAction === 'approved' && 'Aprobar'}
                        {verificationAction === 'rejected' && 'Rechazar'}
                        {verificationAction === 'under_review' && 'Marcar para Revisión'}
                    </Button>
                </Modal.Footer>
            </Modal>
        </Container>
    );
};

export default NutritionistManagement;