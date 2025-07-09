import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Table, 
  Button, 
  Badge, 
  Form, 
  InputGroup, 
  Modal, 
  Alert, 
  Spinner, 
  Row, 
  Col,
  Dropdown,
  ProgressBar
} from 'react-bootstrap';
import { 
  MdPerson, 
  MdSearch, 
  MdAdd, 
  MdEdit, 
  MdDelete, 
  MdVisibility, 
  MdMoreVert,
  MdBlock,
  MdCheckCircle,
  MdRefresh,
  MdFilterList,
  MdVerified,
  MdWarning,
  MdInfo,
  MdPeople,
  MdAssignment,
  MdTrendingUp,
  MdTrendingDown,
  MdStar,
  MdStarBorder,
  MdEmail,
  MdPhone,
  MdLocationOn,
  MdWork,
  MdSchool
} from 'react-icons/md';

interface Nutritionist {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  phone?: string;
  is_active: boolean;
  is_verified: boolean;
  created_at: string;
  last_login?: string;
  profile: {
    specialization?: string;
    experience_years?: number;
    education?: string;
    license_number?: string;
    bio?: string;
  };
  stats: {
    total_patients: number;
    active_patients: number;
    total_appointments: number;
    completed_appointments: number;
    rating: number;
  };
}

const AdminNutritionists: React.FC = () => {
  const [nutritionists, setNutritionists] = useState<Nutritionist[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [verificationFilter, setVerificationFilter] = useState('all');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedNutritionist, setSelectedNutritionist] = useState<Nutritionist | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  // Datos de ejemplo para demostración
  const mockNutritionists: Nutritionist[] = [
    {
      id: '1',
      email: 'dr.garcia@nutri.com',
      first_name: 'María',
      last_name: 'García',
      phone: '+52 55 1234 5678',
      is_active: true,
      is_verified: true,
      created_at: '2025-02-01T00:00:00Z',
      last_login: '2025-07-08T21:00:00Z',
      profile: {
        specialization: 'Nutrición Clínica',
        experience_years: 8,
        education: 'Licenciatura en Nutrición - UNAM',
        license_number: 'NUT-001-2025',
        bio: 'Especialista en nutrición clínica con experiencia en diabetes y obesidad.'
      },
      stats: {
        total_patients: 45,
        active_patients: 38,
        total_appointments: 156,
        completed_appointments: 142,
        rating: 4.8
      }
    },
    {
      id: '2',
      email: 'dr.lopez@nutri.com',
      first_name: 'Juan',
      last_name: 'López',
      phone: '+52 55 9876 5432',
      is_active: true,
      is_verified: true,
      created_at: '2025-02-15T00:00:00Z',
      last_login: '2025-07-08T20:00:00Z',
      profile: {
        specialization: 'Nutrición Deportiva',
        experience_years: 5,
        education: 'Maestría en Nutrición Deportiva - IPN',
        license_number: 'NUT-002-2025',
        bio: 'Especialista en nutrición deportiva y rendimiento atlético.'
      },
      stats: {
        total_patients: 32,
        active_patients: 28,
        total_appointments: 98,
        completed_appointments: 89,
        rating: 4.6
      }
    },
    {
      id: '3',
      email: 'dr.martinez@nutri.com',
      first_name: 'Ana',
      last_name: 'Martínez',
      phone: '+52 55 5555 1234',
      is_active: true,
      is_verified: false,
      created_at: '2025-03-01T00:00:00Z',
      last_login: '2025-07-08T19:00:00Z',
      profile: {
        specialization: 'Nutrición Pediátrica',
        experience_years: 3,
        education: 'Licenciatura en Nutrición - UAM',
        license_number: 'NUT-003-2025',
        bio: 'Especialista en nutrición infantil y desarrollo.'
      },
      stats: {
        total_patients: 18,
        active_patients: 15,
        total_appointments: 67,
        completed_appointments: 58,
        rating: 4.4
      }
    },
    {
      id: '4',
      email: 'dr.rodriguez@nutri.com',
      first_name: 'Carlos',
      last_name: 'Rodríguez',
      phone: '+52 55 4444 5678',
      is_active: false,
      is_verified: true,
      created_at: '2025-03-15T00:00:00Z',
      last_login: '2025-07-07T18:00:00Z',
      profile: {
        specialization: 'Nutrición Geriátrica',
        experience_years: 12,
        education: 'Doctorado en Nutrición - UNAM',
        license_number: 'NUT-004-2025',
        bio: 'Especialista en nutrición para adultos mayores.'
      },
      stats: {
        total_patients: 67,
        active_patients: 0,
        total_appointments: 234,
        completed_appointments: 220,
        rating: 4.9
      }
    }
  ];

  useEffect(() => {
    // Simular carga de datos
    setTimeout(() => {
      setNutritionists(mockNutritionists);
      setLoading(false);
    }, 1000);
  }, []);

  const filteredNutritionists = nutritionists.filter(nutritionist => {
    const matchesSearch = 
      nutritionist.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      nutritionist.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      nutritionist.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      nutritionist.profile.specialization?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || 
      (statusFilter === 'active' && nutritionist.is_active) ||
      (statusFilter === 'inactive' && !nutritionist.is_active);
    
    const matchesVerification = verificationFilter === 'all' || 
      (verificationFilter === 'verified' && nutritionist.is_verified) ||
      (verificationFilter === 'unverified' && !nutritionist.is_verified);
    
    return matchesSearch && matchesStatus && matchesVerification;
  });

  const handleDeleteNutritionist = (nutritionist: Nutritionist) => {
    setSelectedNutritionist(nutritionist);
    setShowDeleteModal(true);
  };

  const confirmDelete = () => {
    if (selectedNutritionist) {
      setNutritionists(nutritionists.filter(n => n.id !== selectedNutritionist.id));
      setShowDeleteModal(false);
      setSelectedNutritionist(null);
    }
  };

  const toggleNutritionistStatus = (nutritionistId: string) => {
    setNutritionists(nutritionists.map(nutritionist => 
      nutritionist.id === nutritionistId 
        ? { ...nutritionist, is_active: !nutritionist.is_active }
        : nutritionist
    ));
  };

  const verifyNutritionist = (nutritionistId: string) => {
    setNutritionists(nutritionists.map(nutritionist => 
      nutritionist.id === nutritionistId 
        ? { ...nutritionist, is_verified: true }
        : nutritionist
    ));
  };

  const getStatusBadge = (isActive: boolean) => {
    return isActive 
      ? <Badge bg="success">Activo</Badge>
      : <Badge bg="secondary">Inactivo</Badge>;
  };

  const getVerificationBadge = (isVerified: boolean) => {
    return isVerified 
      ? <Badge bg="success"><MdVerified className="me-1" />Verificado</Badge>
      : <Badge bg="warning"><MdWarning className="me-1" />Pendiente</Badge>;
  };

  const getRatingStars = (rating: number) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <span key={i} className={i <= rating ? 'text-warning' : 'text-muted'}>
          {i <= rating ? <MdStar /> : <MdStarBorder />}
        </span>
      );
    }
    return <div className="d-flex">{stars}</div>;
  };

  const getCompletionRate = (completed: number, total: number) => {
    return total > 0 ? Math.round((completed / total) * 100) : 0;
  };

  if (loading) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" variant="primary" />
        <p className="mt-3">Cargando nutriólogos...</p>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h4><MdPerson className="me-2 text-info" />Gestión de Nutriólogos</h4>
          <p className="text-muted mb-0">Administra y supervisa todos los nutriólogos registrados</p>
        </div>
        <Button variant="primary">
          <MdAdd className="me-2" />
          Nuevo Nutriólogo
        </Button>
      </div>

      {/* Estadísticas */}
      <Row className="mb-4">
        <Col md={3}>
          <Card className="text-center">
            <Card.Body>
              <h5 className="text-primary">{nutritionists.length}</h5>
              <small className="text-muted">Total Nutriólogos</small>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="text-center">
            <Card.Body>
              <h5 className="text-success">{nutritionists.filter(n => n.is_active).length}</h5>
              <small className="text-muted">Activos</small>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="text-center">
            <Card.Body>
              <h5 className="text-warning">{nutritionists.filter(n => n.is_verified).length}</h5>
              <small className="text-muted">Verificados</small>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="text-center">
            <Card.Body>
              <h5 className="text-info">
                {nutritionists.reduce((sum, n) => sum + n.stats.total_patients, 0)}
              </h5>
              <small className="text-muted">Total Pacientes</small>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Filtros */}
      <Card className="mb-4">
        <Card.Body>
          <Row>
            <Col md={4}>
              <InputGroup>
                <InputGroup.Text>
                  <MdSearch />
                </InputGroup.Text>
                <Form.Control
                  placeholder="Buscar nutriólogos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </InputGroup>
            </Col>
            <Col md={3}>
              <Form.Select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">Todos los estados</option>
                <option value="active">Activos</option>
                <option value="inactive">Inactivos</option>
              </Form.Select>
            </Col>
            <Col md={3}>
              <Form.Select
                value={verificationFilter}
                onChange={(e) => setVerificationFilter(e.target.value)}
              >
                <option value="all">Todos los verificados</option>
                <option value="verified">Verificados</option>
                <option value="unverified">Pendientes</option>
              </Form.Select>
            </Col>
            <Col md={2}>
              <Button variant="outline-secondary" className="w-100">
                <MdFilterList className="me-1" />
                Filtros
              </Button>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Tabla de nutriólogos */}
      <Card>
        <Card.Body>
          <Table responsive hover>
            <thead>
              <tr>
                <th>Nutriólogo</th>
                <th>Especialización</th>
                <th>Estado</th>
                <th>Verificación</th>
                <th>Pacientes</th>
                <th>Calificación</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredNutritionists.map(nutritionist => (
                <tr key={nutritionist.id}>
                  <td>
                    <div className="d-flex align-items-center">
                      <div className="bg-info rounded-circle d-flex align-items-center justify-content-center me-2" style={{ width: 32, height: 32 }}>
                        <MdPerson className="text-white" size={16} />
                      </div>
                      <div>
                        <div className="fw-bold">{nutritionist.first_name} {nutritionist.last_name}</div>
                        <small className="text-muted">{nutritionist.email}</small>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div>
                      <div className="fw-bold">{nutritionist.profile.specialization}</div>
                      <small className="text-muted">{nutritionist.profile.experience_years} años exp.</small>
                    </div>
                  </td>
                  <td>{getStatusBadge(nutritionist.is_active)}</td>
                  <td>{getVerificationBadge(nutritionist.is_verified)}</td>
                  <td>
                    <div>
                      <div className="fw-bold">{nutritionist.stats.active_patients}/{nutritionist.stats.total_patients}</div>
                      <small className="text-muted">pacientes</small>
                    </div>
                  </td>
                  <td>
                    <div>
                      {getRatingStars(nutritionist.stats.rating)}
                      <small className="text-muted">({nutritionist.stats.rating})</small>
                    </div>
                  </td>
                  <td>
                    <Dropdown>
                      <Dropdown.Toggle variant="outline-secondary" size="sm">
                        <MdMoreVert />
                      </Dropdown.Toggle>
                      <Dropdown.Menu>
                        <Dropdown.Item onClick={() => {
                          setSelectedNutritionist(nutritionist);
                          setShowDetailsModal(true);
                        }}>
                          <MdVisibility className="me-2" />
                          Ver Detalles
                        </Dropdown.Item>
                        <Dropdown.Item>
                          <MdEdit className="me-2" />
                          Editar
                        </Dropdown.Item>
                        {!nutritionist.is_verified && (
                          <Dropdown.Item onClick={() => verifyNutritionist(nutritionist.id)}>
                            <MdVerified className="me-2" />
                            Verificar
                          </Dropdown.Item>
                        )}
                        <Dropdown.Divider />
                        <Dropdown.Item 
                          onClick={() => toggleNutritionistStatus(nutritionist.id)}
                          className={nutritionist.is_active ? 'text-warning' : 'text-success'}
                        >
                          {nutritionist.is_active ? (
                            <>
                              <MdBlock className="me-2" />
                              Desactivar
                            </>
                          ) : (
                            <>
                              <MdCheckCircle className="me-2" />
                              Activar
                            </>
                          )}
                        </Dropdown.Item>
                        <Dropdown.Divider />
                        <Dropdown.Item 
                          onClick={() => handleDeleteNutritionist(nutritionist)}
                          className="text-danger"
                        >
                          <MdDelete className="me-2" />
                          Eliminar
                        </Dropdown.Item>
                      </Dropdown.Menu>
                    </Dropdown>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Card.Body>
      </Card>

      {/* Modal de detalles */}
      <Modal show={showDetailsModal} onHide={() => setShowDetailsModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            <MdPerson className="me-2 text-info" />
            Detalles del Nutriólogo
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedNutritionist && (
            <Row>
              <Col md={6}>
                <h6>Información Personal</h6>
                <p><strong>Nombre:</strong> {selectedNutritionist.first_name} {selectedNutritionist.last_name}</p>
                <p><strong>Email:</strong> {selectedNutritionist.email}</p>
                <p><strong>Teléfono:</strong> {selectedNutritionist.phone || 'No especificado'}</p>
                <p><strong>Estado:</strong> {getStatusBadge(selectedNutritionist.is_active)}</p>
                <p><strong>Verificación:</strong> {getVerificationBadge(selectedNutritionist.is_verified)}</p>
              </Col>
              <Col md={6}>
                <h6>Información Profesional</h6>
                <p><strong>Especialización:</strong> {selectedNutritionist.profile.specialization}</p>
                <p><strong>Experiencia:</strong> {selectedNutritionist.profile.experience_years} años</p>
                <p><strong>Educación:</strong> {selectedNutritionist.profile.education}</p>
                <p><strong>Licencia:</strong> {selectedNutritionist.profile.license_number}</p>
              </Col>
              <Col md={12} className="mt-3">
                <h6>Estadísticas</h6>
                <Row>
                  <Col md={3}>
                    <div className="text-center">
                      <h5 className="text-primary">{selectedNutritionist.stats.total_patients}</h5>
                      <small>Total Pacientes</small>
                    </div>
                  </Col>
                  <Col md={3}>
                    <div className="text-center">
                      <h5 className="text-success">{selectedNutritionist.stats.active_patients}</h5>
                      <small>Pacientes Activos</small>
                    </div>
                  </Col>
                  <Col md={3}>
                    <div className="text-center">
                      <h5 className="text-info">{selectedNutritionist.stats.completed_appointments}</h5>
                      <small>Citas Completadas</small>
                    </div>
                  </Col>
                  <Col md={3}>
                    <div className="text-center">
                      <h5 className="text-warning">{selectedNutritionist.stats.rating}</h5>
                      <small>Calificación</small>
                    </div>
                  </Col>
                </Row>
                <div className="mt-3">
                  <h6>Biografía</h6>
                  <p>{selectedNutritionist.profile.bio}</p>
                </div>
              </Col>
            </Row>
          )}
        </Modal.Body>
      </Modal>

      {/* Modal de confirmación de eliminación */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>
            <MdWarning className="me-2 text-danger" />
            Confirmar Eliminación
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          ¿Estás seguro de que quieres eliminar al nutriólogo{' '}
          <strong>{selectedNutritionist?.first_name} {selectedNutritionist?.last_name}</strong>?
          <br />
          <small className="text-muted">
            Esta acción no se puede deshacer y afectará a todos sus pacientes.
          </small>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Cancelar
          </Button>
          <Button variant="danger" onClick={confirmDelete}>
            <MdDelete className="me-2" />
            Eliminar
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default AdminNutritionists; 