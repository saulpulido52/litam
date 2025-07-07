import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, Button, Alert, Badge, Form, Modal, Spinner } from 'react-bootstrap';
import { usePatients } from '../hooks/usePatients';
import { useAuth } from '../hooks/useAuth';
import type { Patient, CreatePatientRequest, UpdatePatientRequest } from '../services/patientsService';
import patientsService from '../services/patientsService';

// React Icons
import { 
  MdEmail, 
  MdAdd,
  MdArrowBack,
  MdHome,
  MdSearch,
  MdEdit,
  MdDelete,
  MdSave,
  MdClose,
  MdWarning,
  MdCheckCircle,
  MdContentCopy,
  MdLock,
  MdPerson,
  MdPhone,
  MdCalendarToday,
  MdVisibility,
  MdDescription
} from 'react-icons/md';
import { FaUsers, FaUserCircle, FaChartLine, FaUserPlus, FaUserMd } from 'react-icons/fa';
import { BsGenderMale, BsGenderFemale, BsGenderAmbiguous } from 'react-icons/bs';
import { HiOutlineDocumentText } from 'react-icons/hi';

const PatientsPage: React.FC = () => {
  console.log('🔍 [PatientsPage] Componente renderizado');

  const navigate = useNavigate();
  const { user } = useAuth();
  const { 
    patients, 
    selectedPatient, 
    loading, 
    error, 
    stats,
    refreshPatients, 
    createPatient, 
    updatePatient, 
    deletePatient, 
    selectPatient,
    searchPatients,
    clearError 
  } = usePatients();
  
  const [viewMode, setViewMode] = useState<'list' | 'create' | 'edit'>('list');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showCredentialsModal, setShowCredentialsModal] = useState(false);
  const [temporaryCredentials, setTemporaryCredentials] = useState<any>(null);
  const [emailCheckLoading, setEmailCheckLoading] = useState(false);
  const [emailExists, setEmailExists] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Estados para formulario
  const [formData, setFormData] = useState({
    email: '',
    first_name: '',
    last_name: '',
    phone: '',
    age: '',
    birth_date: '',
    gender: 'male' as 'male' | 'female' | 'other',
  });

  const [formLoading, setFormLoading] = useState(false);

  // Definir problematicIds como array vacío (puedes reemplazarlo por la lógica real si aplica)
  const problematicIds: string[] = [];

  // Calcular edad automáticamente desde fecha de nacimiento
  const calculateAgeFromBirthDate = (birthDate: string): string => {
    if (!birthDate) return '';
    
    const today = new Date();
    const birth = new Date(birthDate);
    
    if (birth > today) return '';
    
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    
    return age >= 0 ? String(age) : '';
  };

  // Manejar cambio de fecha de nacimiento
  const handleBirthDateChange = (birthDate: string) => {
    const calculatedAge = calculateAgeFromBirthDate(birthDate);
    console.log(`📅 Fecha nacimiento: ${birthDate} → Edad calculada: ${calculatedAge}`);
    
    setFormData({
      ...formData,
      birth_date: birthDate,
      age: calculatedAge
    });
  };

  // Verificar email con debounce
  useEffect(() => {
    const checkEmail = async () => {
      if (formData.email && formData.email.length > 5 && viewMode === 'create') {
        console.log('🔍 Checking email:', formData.email);
        setEmailCheckLoading(true);
        try {
          const exists = await patientsService.checkEmailExists(formData.email);
          console.log('📧 Email check result:', { email: formData.email, exists, type: typeof exists });
          setEmailExists(exists);
          console.log('✅ emailExists state updated to:', exists);
        } catch (error) {
          console.error('❌ Error checking email:', error);
          setEmailExists(false);
        } finally {
          setEmailCheckLoading(false);
        }
      } else {
        console.log('⏭️ Skipping email check:', { 
          email: formData.email, 
          length: formData.email?.length, 
          viewMode 
        });
        setEmailExists(false);
      }
    };

    const timeoutId = setTimeout(checkEmail, 500);
    return () => clearTimeout(timeoutId);
  }, [formData.email, viewMode]);

  // Debug useEffect para UI states
  useEffect(() => {
    console.log('🎯 UI State Debug:', {
      email: formData.email,
      emailExists,
      emailCheckLoading,
      viewMode,
      shouldShowError: emailExists,
      shouldShowSuccess: formData.email && !emailExists && !emailCheckLoading && viewMode === 'create'
    });
  }, [formData.email, emailExists, emailCheckLoading, viewMode]);

  // Filtrado de pacientes
  const filteredPatients = useMemo(() => {
    // Log de depuración para ver el array original
    console.log('🔎 Pacientes originales recibidos:', patients);
    // Si no hay término de búsqueda ni exclusión, mostrar todos
    if (!searchTerm && (!problematicIds || problematicIds.length === 0)) {
      return patients;
    }
    // Filtro original (ajustar según lógica real)
    return patients.filter(p => {
      // Si hay problematicIds, excluirlos
      if (problematicIds && problematicIds.includes(p.id)) return false;
      // Si hay término de búsqueda, filtrar por nombre o email
      if (searchTerm) {
        const fullName = `${p.first_name} ${p.last_name}`.toLowerCase();
        return fullName.includes(searchTerm.toLowerCase()) || (p.email && p.email.toLowerCase().includes(searchTerm.toLowerCase()));
      }
      return true;
    });
  }, [patients, searchTerm, problematicIds]);

  const handleCreatePatient = () => {
    selectPatient(null);
    setFormData({
      email: '',
      first_name: '',
      last_name: '',
      phone: '',
      age: '',
      birth_date: '',
      gender: 'male',
    });
    setViewMode('create');
    clearError();
  };

  const handleEditPatient = (patient: Patient) => {
    selectPatient(patient);
    
    let patientAge = '';
    if (patient.age) {
      patientAge = String(patient.age);
    } else if (patient.birth_date) {
      patientAge = String(new Date().getFullYear() - new Date(patient.birth_date).getFullYear());
    }
    
    console.log('📝 Cargando paciente para editar:', {
      name: `${patient.first_name} ${patient.last_name}`,
      email: patient.email,
      age: patientAge,
      birth_date: patient.birth_date
    });
    
    setFormData({
      email: patient.email || '',
      first_name: patient.first_name || '',
      last_name: patient.last_name || '',
      phone: patient.phone || '',
      age: patientAge,
      birth_date: patient.birth_date || '',
      gender: patient.gender || 'male',
    });
    setViewMode('edit');
    clearError();
  };

  const handleDeletePatient = (patient: Patient) => {
    selectPatient(patient);
    setShowDeleteModal(true);
  };

  const handleViewClinicalRecords = async (patient: Patient) => {
    try {
      console.log('📋 Navegando a expedientes clínicos para paciente:', {
        id: patient.id,
        name: `${patient.first_name} ${patient.last_name}`
      });
      
      // Navegar a la página de expedientes clínicos
      navigate(`/patients/${patient.id}/clinical-records`);
    } catch (error) {
      console.error('❌ Error navegando a expedientes:', error);
    }
  };

  const confirmDelete = async () => {
    if (!selectedPatient) return;
    
    try {
      console.log('🗑️ Removiendo paciente de la lista:', {
        id: selectedPatient.id,
        name: `${selectedPatient.first_name} ${selectedPatient.last_name}`
      });
      
      await deletePatient(selectedPatient.id);
      setShowDeleteModal(false);
      selectPatient(null);
      
      console.log('✅ Paciente removido exitosamente');
    } catch (error) {
      console.error('❌ Error removiendo paciente:', error);
    }
  };

  const preparePatientData = (data: typeof formData) => {
    const patientData: any = {
      email: data.email,
      first_name: data.first_name,
      last_name: data.last_name,
      phone: data.phone || undefined,
      gender: data.gender,
    };

    // Solo incluir birth_date si está presente
    if (data.birth_date) {
      patientData.birth_date = data.birth_date;
    }

    // Solo incluir age si está presente y es válido
    if (data.age && !isNaN(Number(data.age))) {
      patientData.age = Number(data.age);
    }

    console.log('📋 Datos del paciente preparados:', patientData);
    return patientData;
  };

  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (emailExists && viewMode === 'create') {
      console.log('❌ No se puede crear paciente con email existente');
      return;
    }
    
    console.log('📝 Enviando formulario:', { viewMode, formData });
    setFormLoading(true);
    
    try {
      const patientData = preparePatientData(formData);
      
      if (viewMode === 'create') {
        console.log('➕ Creando nuevo paciente...');
        const result = await createPatient(patientData);
        console.log('✅ Paciente creado:', result);
        
        // Verificar si el resultado incluye credenciales temporales
        if ('temporaryCredentials' in result && result.temporaryCredentials) {
          setTemporaryCredentials(result.temporaryCredentials);
          setShowCredentialsModal(true);
        }
      } else {
        console.log('✏️ Actualizando paciente...');
        if (!selectedPatient) {
          throw new Error('No hay paciente seleccionado para editar');
        }
        await updatePatient(selectedPatient.id, patientData);
        console.log('✅ Paciente actualizado');
      }
      
      setViewMode('list');
      setFormLoading(false);
    } catch (error) {
      console.error('❌ Error en formulario:', error);
      setFormLoading(false);
    }
  };

  const handleCancelForm = () => {
    setViewMode('list');
    selectPatient(null);
    clearError();
  };

  // Función para formatear fecha
  const formatDate = (dateString: string) => {
    if (!dateString) return 'No especificada';
    return new Date(dateString).toLocaleDateString('es-MX', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Función para obtener el nombre completo
  const getFullName = (patient: Patient) => {
    const firstName = patient.first_name || '';
    const lastName = patient.last_name || '';
    return `${firstName} ${lastName}`.trim() || 'Sin nombre';
  };

  // Función para obtener la edad
  const getAge = (patient: Patient) => {
    if (patient.age) return patient.age;
    if (patient.birth_date) {
      const birth = new Date(patient.birth_date);
      const today = new Date();
      let age = today.getFullYear() - birth.getFullYear();
      const monthDiff = today.getMonth() - birth.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
        age--;
      }
      return age >= 0 ? age : null;
    }
    return null;
  };

  // Log de depuración para el estado de pacientes
  useEffect(() => {
    console.log('🔍 [PatientsPage] Estado de pacientes actualizado:', {
      patientsCount: patients.length,
      loading,
      error,
      stats,
      timestamp: new Date().toISOString()
    });
  }, [patients, loading, error, stats]);

  // Log de depuración para el usuario autenticado
  useEffect(() => {
    console.log('🔍 [PatientsPage] Usuario autenticado:', user ? {
      id: user.id,
      email: user.email,
      role: user.role?.name
    } : null);
  }, [user]);

  return (
    <Container fluid className="py-4">
      {/* Header */}
      <Row className="mb-4">
        <Col>
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h1 className="h3 mb-1">Gestión de Pacientes</h1>
              <p className="text-muted mb-0">
                {viewMode === 'list' 
                  ? `${filteredPatients.length} paciente${filteredPatients.length !== 1 ? 's' : ''} registrado${filteredPatients.length !== 1 ? 's' : ''}`
                  : viewMode === 'create' 
                    ? 'Registrar Nuevo Paciente'
                    : 'Editar Paciente'
                }
              </p>
            </div>
            <div className="d-flex gap-2">
              {viewMode === 'list' && (
                <Button variant="primary" onClick={handleCreatePatient} disabled={loading}>
                  <MdAdd className="me-2" />
                  Nuevo Paciente
                </Button>
              )}
              <Link to="/dashboard" className="btn btn-outline-secondary">
                <MdHome className="me-2" />
                Dashboard
              </Link>
            </div>
          </div>
        </Col>
      </Row>

      {/* Error Alert */}
      {error && (
        <Alert variant="danger" dismissible onClose={clearError} className="mb-4">
          <div className="d-flex align-items-center">
            <MdWarning className="me-2" />
            <strong>Error:</strong> {error}
          </div>
        </Alert>
      )}

      {/* Content */}
      {viewMode === 'list' ? (
        <>
          {/* Search Bar */}
          <Card className="mb-4">
            <Card.Body>
              <div className="row align-items-end">
                <div className="col-md-6">
                  <div className="mb-3 position-relative">
                    <label className="form-label visually-hidden" htmlFor="search-patients">Buscar pacientes</label>
                    <MdSearch className="position-absolute top-50 start-0 translate-middle-y ms-3 text-muted" style={{ pointerEvents: 'none', zIndex: 2 }} />
                    <Form.Control
                      id="search-patients"
                      name="search-patients"
                      type="text"
                      placeholder="Buscar pacientes..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="ps-5"
                      aria-label="Buscar pacientes"
                      autoComplete="off"
                    />
                  </div>
                </div>
                {/* Aquí puedes agregar más columnas para filtros u ordenamiento si lo deseas */}
              </div>
            </Card.Body>
          </Card>

          {/* Patients List */}
          <Card>
            <Card.Header>
              <div className="d-flex justify-content-between align-items-center">
                <h5 className="mb-0">Mis Pacientes</h5>
                <Badge bg="primary" className="fs-6">
                  {filteredPatients.length}
                </Badge>
              </div>
            </Card.Header>
            <Card.Body>
              {filteredPatients.length === 0 ? (
                <div className="text-center py-5">
                  <FaUsers className="text-muted mb-3" size={48} />
                  <h4 className="text-muted mb-3">
                    {searchTerm ? 'No se encontraron pacientes' : 'Aún no tienes pacientes'}
                  </h4>
                  <p className="text-muted mb-4">
                    {searchTerm 
                      ? 'Intenta con otros términos de búsqueda'
                      : 'Comienza registrando tu primer paciente'
                    }
                  </p>
                  {!searchTerm && (
                    <Button variant="primary" onClick={handleCreatePatient}>
                      <FaUserPlus className="me-2" />
                      Registrar Primer Paciente
                    </Button>
                  )}
                </div>
              ) : (
                <Row>
                  {filteredPatients.map((patient) => (
                    <Col key={patient.id} lg={4} md={6} className="mb-3">
                      <Card className="h-100 patient-card">
                        <Card.Body>
                          <div className="d-flex justify-content-between align-items-start mb-3">
                            <div className="d-flex align-items-center">
                              <div className={`patient-avatar me-3 ${patient.gender || 'other'}`}>
                                <FaUserCircle size={32} />
                              </div>
                              <div>
                                <h6 className="mb-0 fw-bold">{getFullName(patient)}</h6>
                                <small className="text-muted d-flex align-items-center">
                                  <MdEmail size={14} className="me-1" />
                                  {patient.email}
                                </small>
                              </div>
                            </div>
                            <Badge 
                              bg={patient.is_active ? 'success' : 'secondary'}
                              className="patient-status-badge"
                            >
                              {patient.is_active ? 'Activo' : 'Inactivo'}
                            </Badge>
                          </div>
                          
                          <div className="patient-info mb-3">
                            <div className="patient-info-item">
                              <div className="info-icon-wrapper">
                                {patient.gender === 'male' ? (
                                  <BsGenderMale className="info-icon male" />
                                ) : patient.gender === 'female' ? (
                                  <BsGenderFemale className="info-icon female" />
                                ) : (
                                  <BsGenderAmbiguous className="info-icon other" />
                                )}
                              </div>
                              <small className="info-text">
                                {patient.gender === 'male' ? 'Masculino' : 
                                 patient.gender === 'female' ? 'Femenino' : 
                                 patient.gender === 'other' ? 'Otro' : 'No especificado'}
                              </small>
                            </div>
                            
                            {getAge(patient) && (
                              <div className="patient-info-item">
                                <div className="info-icon-wrapper">
                                  <MdPerson className="info-icon age" />
                                </div>
                                <small className="info-text">{getAge(patient)} años</small>
                              </div>
                            )}
                            
                            {patient.phone && (
                              <div className="patient-info-item">
                                <div className="info-icon-wrapper">
                                  <MdPhone className="info-icon phone" />
                                </div>
                                <small className="info-text">{patient.phone}</small>
                              </div>
                            )}
                            
                            {patient.birth_date && (
                              <div className="patient-info-item">
                                <div className="info-icon-wrapper">
                                  <MdCalendarToday className="info-icon calendar" />
                                </div>
                                <small className="info-text">{formatDate(patient.birth_date)}</small>
                              </div>
                            )}
                          </div>
                          
                          <div className="patient-actions">
                            <div className="action-buttons">
                              <Button 
                                variant="primary" 
                                size="sm"
                                className="action-btn primary-btn"
                                onClick={() => handleViewClinicalRecords(patient)}
                              >
                                <HiOutlineDocumentText className="btn-icon" />
                                <span>Expedientes</span>
                              </Button>
                              
                              <div className="secondary-actions">
                                <Button 
                                  variant="outline-info" 
                                  size="sm"
                                  className="action-btn secondary-btn"
                                  onClick={() => navigate(`/progress?patient=${patient.id}`)}
                                >
                                  <FaChartLine className="btn-icon" />
                                  <span>Progreso</span>
                                </Button>
                                
                                <Button 
                                  variant="outline-primary" 
                                  size="sm"
                                  className="action-btn secondary-btn"
                                  onClick={() => handleEditPatient(patient)}
                                >
                                  <MdEdit className="btn-icon" />
                                  <span>Editar</span>
                                </Button>
                              </div>
                              
                              <Button 
                                variant="outline-danger" 
                                size="sm"
                                className="action-btn danger-btn"
                                onClick={() => handleDeletePatient(patient)}
                              >
                                <MdDelete className="btn-icon" />
                                <span>Remover</span>
                              </Button>
                            </div>
                          </div>
                        </Card.Body>
                      </Card>
                    </Col>
                  ))}
                </Row>
              )}
            </Card.Body>
          </Card>
        </>
      ) : (
        // Form
        <Row className="justify-content-center">
          <Col md={8} lg={6}>
            <Card>
              <Card.Header>
                <h5 className="mb-0 d-flex align-items-center">
                  {viewMode === 'create' ? (
                    <MdAdd className="text-primary me-2" />
                  ) : (
                    <MdEdit className="text-primary me-2" />
                  )}
                  {viewMode === 'create' ? 'Registrar Nuevo Paciente' : 'Editar Paciente'}
                </h5>
              </Card.Header>
              <Card.Body>
                <Form onSubmit={handleSubmitForm}>
                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label htmlFor="first_name">Nombres *</Form.Label>
                        <Form.Control
                          id="first_name"
                          name="first_name"
                          type="text"
                          value={formData.first_name}
                          onChange={(e) => setFormData({...formData, first_name: e.target.value})}
                          required
                          autoComplete="given-name"
                          aria-label="Nombres del paciente"
                        />
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label htmlFor="last_name">Apellidos *</Form.Label>
                        <Form.Control
                          id="last_name"
                          name="last_name"
                          type="text"
                          value={formData.last_name}
                          onChange={(e) => setFormData({...formData, last_name: e.target.value})}
                          required
                          autoComplete="family-name"
                          aria-label="Apellidos del paciente"
                        />
                      </Form.Group>
                    </Col>
                  </Row>

                  <Form.Group className="mb-3">
                    <Form.Label htmlFor="email">Email *</Form.Label>
                    <Form.Control
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      isInvalid={emailExists}
                      isValid={!!(formData.email && !emailExists && !emailCheckLoading && viewMode === 'create')}
                      required
                      autoComplete="email"
                      aria-label="Email del paciente"
                    />
                    {emailCheckLoading && (
                      <Form.Text className="text-muted">
                        Verificando email...
                      </Form.Text>
                    )}
                    {emailExists && (
                      <Form.Control.Feedback type="invalid">
                        Este email ya está registrado. Use un email diferente.
                      </Form.Control.Feedback>
                    )}
                    {formData.email && !emailExists && !emailCheckLoading && viewMode === 'create' && (
                      <Form.Control.Feedback type="valid">
                        Email disponible
                      </Form.Control.Feedback>
                    )}
                  </Form.Group>

                  {viewMode === 'create' && (
                    <Alert variant="info" className="mb-3">
                      <MdLock className="me-2" />
                      <strong>Nota:</strong> Se generará automáticamente una contraseña temporal para el paciente.
                    </Alert>
                  )}

                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label htmlFor="phone">Teléfono</Form.Label>
                        <Form.Control
                          id="phone"
                          name="phone"
                          type="tel"
                          value={formData.phone}
                          onChange={(e) => setFormData({...formData, phone: e.target.value})}
                          autoComplete="tel"
                          aria-label="Teléfono del paciente"
                        />
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label htmlFor="birth_date">Fecha de Nacimiento</Form.Label>
                        <Form.Control
                          id="birth_date"
                          name="birth_date"
                          type="date"
                          value={formData.birth_date}
                          onChange={(e) => handleBirthDateChange(e.target.value)}
                          max={new Date().toISOString().split('T')[0]}
                          autoComplete="bday"
                          aria-label="Fecha de nacimiento del paciente"
                        />
                        <Form.Text>La edad se calculará automáticamente</Form.Text>
                      </Form.Group>
                    </Col>
                  </Row>

                  {formData.age && (
                    <Form.Group className="mb-3">
                      <Form.Label htmlFor="age">Edad Calculada</Form.Label>
                      <Form.Control
                        id="age"
                        name="age"
                        type="text"
                        value={`${formData.age} años`}
                        readOnly
                        className="bg-light"
                        aria-label="Edad calculada automáticamente"
                      />
                      <Form.Text className="text-success">
                        ✓ Calculada automáticamente desde la fecha de nacimiento
                      </Form.Text>
                    </Form.Group>
                  )}

                  <Form.Group className="mb-4">
                    <Form.Label htmlFor="gender">Género</Form.Label>
                    <Form.Select
                      id="gender"
                      name="gender"
                      value={formData.gender}
                      onChange={(e) => setFormData({...formData, gender: e.target.value as 'male' | 'female' | 'other'})}
                      autoComplete="sex"
                      aria-label="Género del paciente"
                    >
                      <option value="male">Masculino</option>
                      <option value="female">Femenino</option>
                      <option value="other">Otro</option>
                    </Form.Select>
                  </Form.Group>

                  <div className="d-flex gap-2 justify-content-end">
                    <Button variant="secondary" onClick={handleCancelForm} disabled={formLoading}>
                      <MdClose className="me-1" />
                      Cancelar
                    </Button>
                    <Button 
                      variant="primary" 
                      type="submit"
                      disabled={formLoading || emailExists || emailCheckLoading}
                    >
                      {formLoading ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2"></span>
                          {viewMode === 'create' ? 'Registrando...' : 'Guardando...'}
                        </>
                      ) : (
                        <>
                          {viewMode === 'create' ? <MdAdd className="me-1" /> : <MdSave className="me-1" />}
                          {viewMode === 'create' ? 'Registrar Paciente' : 'Guardar Cambios'}
                        </>
                      )}
                    </Button>
                  </div>
                </Form>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      )}

      {/* Delete Modal */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>
            <MdWarning className="text-warning me-2" />
            Remover Paciente
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>¿Estás seguro de que deseas remover este paciente de tu lista?</p>
          {selectedPatient && (
            <Alert variant="warning">
              <strong>Paciente:</strong> {selectedPatient.first_name} {selectedPatient.last_name}<br/>
              <strong>Email:</strong> {selectedPatient.email}
            </Alert>
          )}
          <Alert variant="info">
            <strong>Nota:</strong> Esto terminará tu relación profesional con este paciente.
          </Alert>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            <MdClose className="me-1" />
            Cancelar
          </Button>
          <Button variant="danger" onClick={confirmDelete} disabled={loading}>
            {loading ? (
              <>
                <span className="spinner-border spinner-border-sm me-2"></span>
                Removiendo...
              </>
            ) : (
              <>
                <MdDelete className="me-1" />
                Remover de mi Lista
              </>
            )}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Credentials Modal */}
      <Modal show={showCredentialsModal} onHide={() => setShowCredentialsModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            <MdLock className="text-success me-2" />
            Paciente Registrado Exitosamente
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Alert variant="success">
            <MdCheckCircle className="me-2" />
            El paciente ha sido registrado exitosamente. Se han generado credenciales temporales.
          </Alert>
          
          {temporaryCredentials && (
            <Card>
              <Card.Header>
                <h6 className="mb-0">
                  <MdLock className="text-primary me-2" />
                  Credenciales Temporales
                </h6>
              </Card.Header>
              <Card.Body>
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Email:</Form.Label>
                      <div className="input-group">
                        <Form.Control value={temporaryCredentials.email} readOnly />
                        <Button 
                          variant="outline-secondary"
                          onClick={() => navigator.clipboard.writeText(temporaryCredentials.email)}
                        >
                          <MdContentCopy />
                        </Button>
                      </div>
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Contraseña Temporal:</Form.Label>
                      <div className="input-group">
                        <Form.Control value={temporaryCredentials.temporary_password} readOnly />
                        <Button 
                          variant="outline-secondary"
                          onClick={() => navigator.clipboard.writeText(temporaryCredentials.temporary_password)}
                        >
                          <MdContentCopy />
                        </Button>
                      </div>
                    </Form.Group>
                  </Col>
                </Row>
                
                <Alert variant="warning">
                  <MdWarning className="me-2" />
                  Esta contraseña expira el: {new Date(temporaryCredentials.expires_at).toLocaleString('es-MX')}
                </Alert>
              </Card.Body>
            </Card>
          )}
          
          <Alert variant="info" className="mt-3">
            <MdWarning className="me-2" />
            <strong>Importante:</strong> Comparte estas credenciales con el paciente de forma segura.
          </Alert>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="primary" onClick={() => setShowCredentialsModal(false)}>
            <MdCheckCircle className="me-1" />
            Entendido
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default PatientsPage; 