import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Table, 
  Button, 
  InputGroup, 
  Modal, 
  Row, 
  Col,
  Dropdown,
  Badge,
  Form,
  Spinner} from 'react-bootstrap';
import { 
  MdPeople, 
  MdSearch, 
  MdAdd, 
  MdEdit,
  MdTrendingUp,
  MdTrendingDown,
  MdAssignment,
  MdWarning, 
  MdDelete, 
  MdVisibility, 
  MdMoreVert,
  MdBlock,
  MdCheckCircle,
  MdFilterList,
  MdPerson} from 'react-icons/md';

interface Patient {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  phone?: string;
  is_active: boolean;
  created_at: string;
  last_login?: string;
  assigned_nutritionist?: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
  };
  profile: {
    age?: number;
    gender?: string;
    height?: number;
    weight?: number;
    bmi?: number;
    activity_level?: string;
    medical_conditions?: string[];
    allergies?: string[];
    goals?: string[];
  };
  stats: {
    total_appointments: number;
    completed_appointments: number;
    total_diet_plans: number;
    active_diet_plans: number;
    progress_measurements: number;
    last_measurement_date?: string;
  };
  progress: {
    initial_weight: number;
    current_weight: number;
    target_weight: number;
    weight_change: number;
    progress_percentage: number;
  };
}

const AdminPatients: React.FC = () => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  // Variable/función removida - no utilizada
const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [nutritionistFilter, setNutritionistFilter] = useState('all');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);

  // Datos de ejemplo para demostración
  const mockPatients: Patient[] = [
    {
      id: '1',
      email: 'ana.martinez@email.com',
      first_name: 'Ana',
      last_name: 'Martínez',
      phone: '+52 55 1111 2222',
      is_active: true,
      created_at: '2025-03-01T00:00:00Z',
      last_login: '2025-07-08T19:00:00Z',
      assigned_nutritionist: {
        id: '1',
        first_name: 'María',
        last_name: 'García',
        email: 'dr.garcia@nutri.com'
      },
      profile: {
        age: 28,
        gender: 'Femenino',
        height: 165,
        weight: 70,
        bmi: 25.7,
        activity_level: 'Moderado',
        medical_conditions: ['Ninguna'],
        allergies: ['Lactosa'],
        goals: ['Pérdida de peso', 'Mejorar hábitos alimenticios']
      },
      stats: {
        total_appointments: 12,
        completed_appointments: 10,
        total_diet_plans: 3,
        active_diet_plans: 1,
        progress_measurements: 8,
        last_measurement_date: '2025-07-05T00:00:00Z'
      },
      progress: {
        initial_weight: 75,
        current_weight: 70,
        target_weight: 65,
        weight_change: -5,
        progress_percentage: 50
      }
    },
    {
      id: '2',
      email: 'carlos.rodriguez@email.com',
      first_name: 'Carlos',
      last_name: 'Rodríguez',
      phone: '+52 55 3333 4444',
      is_active: false,
      created_at: '2025-03-15T00:00:00Z',
      last_login: '2025-07-07T18:00:00Z',
      assigned_nutritionist: {
        id: '2',
        first_name: 'Juan',
        last_name: 'López',
        email: 'dr.lopez@nutri.com'
      },
      profile: {
        age: 35,
        gender: 'Masculino',
        height: 180,
        weight: 85,
        bmi: 26.2,
        activity_level: 'Bajo',
        medical_conditions: ['Hipertensión'],
        allergies: ['Ninguna'],
        goals: ['Control de peso', 'Reducir presión arterial']
      },
      stats: {
        total_appointments: 8,
        completed_appointments: 6,
        total_diet_plans: 2,
        active_diet_plans: 0,
        progress_measurements: 5,
        last_measurement_date: '2025-06-28T00:00:00Z'
      },
      progress: {
        initial_weight: 90,
        current_weight: 85,
        target_weight: 80,
        weight_change: -5,
        progress_percentage: 50
      }
    },
    {
      id: '3',
      email: 'maria.gonzalez@email.com',
      first_name: 'María',
      last_name: 'González',
      phone: '+52 55 5555 6666',
      is_active: true,
      created_at: '2025-04-01T00:00:00Z',
      last_login: '2025-07-08T20:00:00Z',
      assigned_nutritionist: {
        id: '3',
        first_name: 'Ana',
        last_name: 'Martínez',
        email: 'dr.martinez@nutri.com'
      },
      profile: {
        age: 42,
        gender: 'Femenino',
        height: 160,
        weight: 68,
        bmi: 26.6,
        activity_level: 'Alto',
        medical_conditions: ['Diabetes tipo 2'],
        allergies: ['Gluten'],
        goals: ['Control de diabetes', 'Mejorar rendimiento deportivo']
      },
      stats: {
        total_appointments: 15,
        completed_appointments: 14,
        total_diet_plans: 4,
        active_diet_plans: 1,
        progress_measurements: 12,
        last_measurement_date: '2025-07-08T00:00:00Z'
      },
      progress: {
        initial_weight: 72,
        current_weight: 68,
        target_weight: 65,
        weight_change: -4,
        progress_percentage: 57
      }
    },
    {
      id: '4',
      email: 'luis.perez@email.com',
      first_name: 'Luis',
      last_name: 'Pérez',
      phone: '+52 55 7777 8888',
      is_active: true,
      created_at: '2025-04-15T00:00:00Z',
      last_login: '2025-07-08T21:00:00Z',
      assigned_nutritionist: undefined,
      profile: {
        age: 29,
        gender: 'Masculino',
        height: 175,
        weight: 78,
        bmi: 25.5,
        activity_level: 'Moderado',
        medical_conditions: ['Ninguna'],
        allergies: ['Ninguna'],
        goals: ['Ganancia de masa muscular', 'Mejorar composición corporal']
      },
      stats: {
        total_appointments: 0,
        completed_appointments: 0,
        total_diet_plans: 0,
        active_diet_plans: 0,
        progress_measurements: 0
      },
      progress: {
        initial_weight: 78,
        current_weight: 78,
        target_weight: 82,
        weight_change: 0,
        progress_percentage: 0
      }
    }
  ];

  useEffect(() => {
    // Simular carga de datos
    setTimeout(() => {
      setPatients(mockPatients);
      setLoading(false);
    }, 1000);
  }, []);

  const filteredPatients = patients.filter(patient => {
    const matchesSearch = 
      patient.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.last_name.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || 
      (statusFilter === 'active' && patient.is_active) ||
      (statusFilter === 'inactive' && !patient.is_active);
    
    const matchesNutritionist = nutritionistFilter === 'all' || 
      (nutritionistFilter === 'assigned' && patient.assigned_nutritionist) ||
      (nutritionistFilter === 'unassigned' && !patient.assigned_nutritionist);
    
    return matchesSearch && matchesStatus && matchesNutritionist;
  });

  const handleDeletePatient = (patient: Patient) => {
    setSelectedPatient(patient);
    setShowDeleteModal(true);
  };

  const confirmDelete = () => {
    if (selectedPatient) {
      setPatients(patients.filter(p => p.id !== selectedPatient.id));
      setShowDeleteModal(false);
      setSelectedPatient(null);
    }
  };

  const togglePatientStatus = (patientId: string) => {
    setPatients(patients.map(patient => 
      patient.id === patientId 
        ? { ...patient, is_active: !patient.is_active }
        : patient
    ));
  };

  const assignNutritionist = (patientId: string, nutritionistId: string) => {
    // Aquí iría la lógica para asignar nutriólogo
    alert(`Paciente ${patientId} asignado al nutriólogo ${nutritionistId}`);
    setShowAssignModal(false);
  };

  const getStatusBadge = (isActive: boolean) => {
    return isActive 
      ? <Badge bg="success">Activo</Badge>
      : <Badge bg="secondary">Inactivo</Badge>;
  };

  const getBMICategory = (bmi: number) => {
    if (bmi < 18.5) return { category: 'Bajo peso', color: 'warning' };
    if (bmi < 25) return { category: 'Normal', color: 'success' };
    if (bmi < 30) return { category: 'Sobrepeso', color: 'warning' };
    return { category: 'Obesidad', color: 'danger' };
  };

  // Variable/función removida - no utilizada
const getProgressIcon = (percentage: number) => {
    if (percentage >= 75) return <MdTrendingUp className="text-success" />;
    if (percentage >= 50) return <MdTrendingDown className="text-warning" />;
    return <MdTrendingDown className="text-danger" />;
  };

  if (loading) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" variant="primary" />
        <p className="mt-3">Cargando pacientes...</p>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h4><MdPeople className="me-2 text-success" />Gestión de Pacientes</h4>
          <p className="text-muted mb-0">Administra todos los pacientes del sistema</p>
        </div>
        <Button variant="primary">
          <MdAdd className="me-2" />
          Nuevo Paciente
        </Button>
      </div>

      {/* Estadísticas */}
      <Row className="mb-4">
        <Col md={3}>
          <Card className="text-center">
            <Card.Body>
              <h5 className="text-primary">{patients.length}</h5>
              <small className="text-muted">Total Pacientes</small>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="text-center">
            <Card.Body>
              <h5 className="text-success">{patients.filter(p => p.is_active).length}</h5>
              <small className="text-muted">Pacientes Activos</small>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="text-center">
            <Card.Body>
              <h5 className="text-info">{patients.filter(p => p.assigned_nutritionist).length}</h5>
              <small className="text-muted">Con Nutriólogo</small>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="text-center">
            <Card.Body>
              <h5 className="text-warning">
                {patients.reduce((sum, p) => sum + p.stats.total_appointments, 0)}
              </h5>
              <small className="text-muted">Total Citas</small>
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
                  placeholder="Buscar pacientes..."
                  value={searchTerm}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
                />
              </InputGroup>
            </Col>
            <Col md={3}>
              <Form.Select
                value={statusFilter}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setStatusFilter(e.target.value)}
              >
                <option value="all">Todos los estados</option>
                <option value="active">Activos</option>
                <option value="inactive">Inactivos</option>
              </Form.Select>
            </Col>
            <Col md={3}>
              <Form.Select
                value={nutritionistFilter}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setNutritionistFilter(e.target.value)}
              >
                <option value="all">Todos los nutriólogos</option>
                <option value="assigned">Con nutriólogo</option>
                <option value="unassigned">Sin nutriólogo</option>
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

      {/* Tabla de pacientes */}
      <Card>
        <Card.Body>
          <Table responsive hover>
            <thead>
              <tr>
                <th>Paciente</th>
                <th>Nutriólogo</th>
                <th>Estado</th>
                <th>IMC</th>
                <th>Progreso</th>
                <th>Última Actividad</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredPatients.map(patient => {
                const bmiCategory = getBMICategory(patient.profile.bmi || 0);
                return (
                  <tr key={patient.id}>
                    <td>
                      <div className="d-flex align-items-center">
                        <div className="bg-success rounded-circle d-flex align-items-center justify-content-center me-2" style={{ width: 32, height: 32 }}>
                          <MdPerson className="text-white" size={16} />
                        </div>
                        <div>
                          <div className="fw-bold">{patient.first_name} {patient.last_name}</div>
                          <small className="text-muted">{patient.email}</small>
                        </div>
                      </div>
                    </td>
                    <td>
                      {patient.assigned_nutritionist ? (
                        <div>
                          <div className="fw-bold">
                            {patient.assigned_nutritionist.first_name} {patient.assigned_nutritionist.last_name}
                          </div>
                          <small className="text-muted">{patient.assigned_nutritionist.email}</small>
                        </div>
                      ) : (
                        <Badge bg="warning">Sin asignar</Badge>
                      )}
                    </td>
                    <td>{getStatusBadge(patient.is_active)}</td>
                    <td>
                      <div>
                        <div className="fw-bold">{patient.profile.bmi?.toFixed(1)}</div>
                        <Badge bg={bmiCategory.color}>{bmiCategory.category}</Badge>
                      </div>
                    </td>
                    <td>
                      <div className="d-flex align-items-center">
                        {getProgressIcon(patient.progress.progress_percentage)}
                        <div className="ms-2">
                          <div className="fw-bold">{patient.progress.progress_percentage}%</div>
                          <small className="text-muted">
                            {patient.progress.weight_change > 0 ? '+' : ''}{patient.progress.weight_change} kg
                          </small>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div>
                        <div className="fw-bold">
                          {patient.stats.last_measurement_date 
                            ? new Date(patient.stats.last_measurement_date).toLocaleDateString()
                            : 'Nunca'
                          }
                        </div>
                        <small className="text-muted">
                          {patient.stats.completed_appointments} citas completadas
                        </small>
                      </div>
                    </td>
                    <td>
                      <Dropdown>
                        <Dropdown.Toggle variant="outline-secondary" size="sm">
                          <MdMoreVert />
                        </Dropdown.Toggle>
                        <Dropdown.Menu>
                          <Dropdown.Item onClick={() => {
                            setSelectedPatient(patient);
                            setShowDetailsModal(true);
                          }}>
                            <MdVisibility className="me-2" />
                            Ver Detalles
                          </Dropdown.Item>
                          <Dropdown.Item>
                            <MdEdit className="me-2" />
                            Editar
                          </Dropdown.Item>
                          {!patient.assigned_nutritionist && (
                            <Dropdown.Item onClick={() => {
                              setSelectedPatient(patient);
                              setShowAssignModal(true);
                            }}>
                              <MdAssignment className="me-2" />
                              Asignar Nutriólogo
                            </Dropdown.Item>
                          )}
                          <Dropdown.Divider />
                          <Dropdown.Item 
                            onClick={() => togglePatientStatus(patient.id)}
                            className={patient.is_active ? 'text-warning' : 'text-success'}
                          >
                            {patient.is_active ? (
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
                            onClick={() => handleDeletePatient(patient)}
                            className="text-danger"
                          >
                            <MdDelete className="me-2" />
                            Eliminar
                          </Dropdown.Item>
                        </Dropdown.Menu>
                      </Dropdown>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </Table>
        </Card.Body>
      </Card>

      {/* Modal de detalles */}
      <Modal show={showDetailsModal} onHide={() => setShowDetailsModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            <MdPeople className="me-2 text-success" />
            Detalles del Paciente
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedPatient && (
            <Row>
              <Col md={6}>
                <h6>Información Personal</h6>
                <p><strong>Nombre:</strong> {selectedPatient.first_name} {selectedPatient.last_name}</p>
                <p><strong>Email:</strong> {selectedPatient.email}</p>
                <p><strong>Teléfono:</strong> {selectedPatient.phone || 'No especificado'}</p>
                <p><strong>Edad:</strong> {selectedPatient.profile.age} años</p>
                <p><strong>Género:</strong> {selectedPatient.profile.gender}</p>
                <p><strong>Estado:</strong> {getStatusBadge(selectedPatient.is_active)}</p>
              </Col>
              <Col md={6}>
                <h6>Información de Salud</h6>
                <p><strong>Altura:</strong> {selectedPatient.profile.height} cm</p>
                <p><strong>Peso actual:</strong> {selectedPatient.profile.weight} kg</p>
                <p><strong>IMC:</strong> {selectedPatient.profile.bmi?.toFixed(1)}</p>
                <p><strong>Nivel de actividad:</strong> {selectedPatient.profile.activity_level}</p>
                <p><strong>Condiciones médicas:</strong> {selectedPatient.profile.medical_conditions?.join(', ')}</p>
                <p><strong>Alergias:</strong> {selectedPatient.profile.allergies?.join(', ')}</p>
              </Col>
              <Col md={12} className="mt-3">
                <h6>Progreso</h6>
                <Row>
                  <Col md={3}>
                    <div className="text-center">
                      <h5 className="text-primary">{selectedPatient.progress.initial_weight} kg</h5>
                      <small>Peso Inicial</small>
                    </div>
                  </Col>
                  <Col md={3}>
                    <div className="text-center">
                      <h5 className="text-info">{selectedPatient.progress.current_weight} kg</h5>
                      <small>Peso Actual</small>
                    </div>
                  </Col>
                  <Col md={3}>
                    <div className="text-center">
                      <h5 className="text-success">{selectedPatient.progress.target_weight} kg</h5>
                      <small>Peso Objetivo</small>
                    </div>
                  </Col>
                  <Col md={3}>
                    <div className="text-center">
                      <h5 className="text-warning">{selectedPatient.progress.progress_percentage}%</h5>
                      <small>Progreso</small>
                    </div>
                  </Col>
                </Row>
                <div className="mt-3">
                  <h6>Objetivos</h6>
                  <p>{selectedPatient.profile.goals?.join(', ')}</p>
                </div>
              </Col>
            </Row>
          )}
        </Modal.Body>
      </Modal>

      {/* Modal de asignación de nutriólogo */}
      <Modal show={showAssignModal} onHide={() => setShowAssignModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>
            <MdAssignment className="me-2 text-primary" />
            Asignar Nutriólogo
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedPatient && (
            <div>
              <p>Asignar nutriólogo para: <strong>{selectedPatient.first_name} {selectedPatient.last_name}</strong></p>
              <Form.Select>
                <option>Seleccionar nutriólogo...</option>
                <option value="1">María García - Nutrición Clínica</option>
                <option value="2">Juan López - Nutrición Deportiva</option>
                <option value="3">Ana Martínez - Nutrición Pediátrica</option>
              </Form.Select>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowAssignModal(false)}>
            Cancelar
          </Button>
          <Button variant="primary" onClick={() => assignNutritionist(selectedPatient?.id || '', '1')}>
            <MdAssignment className="me-2" />
            Asignar
          </Button>
        </Modal.Footer>
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
          ¿Estás seguro de que quieres eliminar al paciente{' '}
          <strong>{selectedPatient?.first_name} {selectedPatient?.last_name}</strong>?
          <br />
          <small className="text-muted">
            Esta acción no se puede deshacer y se perderán todos sus datos.
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

export default AdminPatients; 