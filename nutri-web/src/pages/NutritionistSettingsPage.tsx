import React, { useState, useEffect, useCallback } from 'react';
import { Container, Row, Col, Card, Button, Alert, Spinner, Tab, Nav, Form } from 'react-bootstrap';
import {
  User,
  Shield,
  Bell,
  Calendar,
  CreditCard,
  Save,
  Edit,
  CheckCircle,
  AlertCircle,
  Building
} from 'lucide-react';
import { useProfile } from '../hooks/useProfile';
import '../styles/nutritionist-settings.css';

interface SettingsState {
  // Configuración de perfil profesional
  professional: {
    license_number: string;
    license_issuing_authority: string;
    experience_years: number;
    consultation_fee: number;
    specialties: string[];
    languages: string[];
    treatment_approach: string;
    education: string[];
    certifications: string[];
    areas_of_interest: string[];
    professional_summary: string;
    bio: string;
  };

  // Configuración de consultorio
  clinic: {
    clinic_name: string;
    clinic_address: string;
    clinic_city: string;
    clinic_state: string;
    clinic_zip_code: string;
    clinic_country: string;
    clinic_phone: string;
    clinic_notes: string;
    latitude: number;
    longitude: number;
  };

  // Configuración de disponibilidad
  availability: {
    is_available: boolean;
    offers_in_person: boolean;
    offers_online: boolean;
    office_hours: {
      monday: { active: boolean; start: string; end: string; type: string };
      tuesday: { active: boolean; start: string; end: string; type: string };
      wednesday: { active: boolean; start: string; end: string; type: string };
      thursday: { active: boolean; start: string; end: string; type: string };
      friday: { active: boolean; start: string; end: string; type: string };
      saturday: { active: boolean; start: string; end: string; type: string };
      sunday: { active: boolean; start: string; end: string; type: string };
    };
  };

  // Configuración de notificaciones
  notifications: {
    email_notifications: boolean;
    push_notifications: boolean;
    appointment_reminders: boolean;
    new_patient_alerts: boolean;
    system_updates: boolean;
    marketing_emails: boolean;
  };

  // Configuración de privacidad
  privacy: {
    profile_visible: boolean;
    show_contact_info: boolean;
    show_consultation_fee: boolean;
    allow_messages: boolean;
    allow_reviews: boolean;
  };

  // Configuración de pagos
  payments: {
    accept_cash: boolean;
    accept_card: boolean;
    accept_transfer: boolean;
    accept_online_payment: boolean;
    payment_notes: string;
  };
}

const NutritionistSettingsPage: React.FC = () => {
  const { profile, loading, updateProfile } = useProfile();

  const [settings, setSettings] = useState<SettingsState>({
    professional: {
      license_number: '',
      license_issuing_authority: '',
      experience_years: 0,
      consultation_fee: 0,
      specialties: [],
      languages: [],
      treatment_approach: '',
      education: [],
      certifications: [],
      areas_of_interest: [],
      professional_summary: '',
      bio: ''
    },
    clinic: {
      clinic_name: '',
      clinic_address: '',
      clinic_city: '',
      clinic_state: '',
      clinic_zip_code: '',
      clinic_country: '',
      clinic_phone: '',
      clinic_notes: '',
      latitude: 0,
      longitude: 0
    },
    availability: {
      is_available: true,
      offers_in_person: true,
      offers_online: true,
      office_hours: {
        monday: { active: false, start: '09:00', end: '18:00', type: 'presencial' },
        tuesday: { active: false, start: '09:00', end: '18:00', type: 'presencial' },
        wednesday: { active: false, start: '09:00', end: '18:00', type: 'presencial' },
        thursday: { active: false, start: '09:00', end: '18:00', type: 'presencial' },
        friday: { active: false, start: '09:00', end: '18:00', type: 'presencial' },
        saturday: { active: false, start: '09:00', end: '18:00', type: 'presencial' },
        sunday: { active: false, start: '09:00', end: '18:00', type: 'presencial' }
      }
    },
    notifications: {
      email_notifications: true,
      push_notifications: true,
      appointment_reminders: true,
      new_patient_alerts: true,
      system_updates: true,
      marketing_emails: false
    },
    privacy: {
      profile_visible: true,
      show_contact_info: true,
      show_consultation_fee: true,
      allow_messages: true,
      allow_reviews: true
    },
    payments: {
      accept_cash: true,
      accept_card: true,
      accept_transfer: true,
      accept_online_payment: true,
      payment_notes: ''
    }
  });

  const [uiState, setUiState] = useState({
    activeTab: 'professional',
    isEditing: false,
    isSaving: false,
    showSuccessAlert: false,
    showErrorAlert: false,
    errorMessage: ''
  });

  // Cargar datos del perfil
  useEffect(() => {
    if (profile?.nutritionist_profile) {
      const np = profile.nutritionist_profile;
      setSettings(prev => ({
        ...prev,
        professional: {
          license_number: np.license_number || '',
          license_issuing_authority: np.license_issuing_authority || '',
          experience_years: np.years_of_experience || 0,
          consultation_fee: np.consultation_fee || 0,
          specialties: np.specialties || [],
          languages: np.languages || [],
          treatment_approach: np.treatment_approach || '',
          education: np.education || [],
          certifications: np.certifications || [],
          areas_of_interest: np.areas_of_interest || [],
          professional_summary: np.professional_summary || '',
          bio: np.bio || ''
        },
        clinic: {
          clinic_name: np.clinic_name || '',
          clinic_address: np.clinic_address || '',
          clinic_city: np.clinic_city || '',
          clinic_state: np.clinic_state || '',
          clinic_zip_code: np.clinic_zip_code || '',
          clinic_country: np.clinic_country || '',
          clinic_phone: np.clinic_phone || '',
          clinic_notes: np.clinic_notes || '',
          latitude: np.latitude || 0,
          longitude: np.longitude || 0
        },
        availability: {
          is_available: np.is_available !== false,
          offers_in_person: np.offers_in_person !== false,
          offers_online: np.offers_online !== false,
          office_hours: np.office_hours || prev.availability.office_hours
        }
      }));
    }
  }, [profile]);

  const handleInputChange = useCallback((section: keyof SettingsState, field: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  }, []);

  const handleArrayChange = useCallback((section: keyof SettingsState, field: string, value: string) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value.split(',').map(item => item.trim()).filter(item => item)
      }
    }));
  }, []);

  const handleSave = useCallback(async () => {
    setUiState(prev => ({ ...prev, isSaving: true }));

    try {
      const updateData = {
        ...settings.professional,
        ...settings.clinic,
        ...settings.availability,
        office_hours: settings.availability.office_hours,
        education: settings.professional.education.join('\n')
      };

      await updateProfile(updateData as any);

      setUiState(prev => ({
        ...prev,
        isSaving: false,
        isEditing: false,
        showSuccessAlert: true
      }));

      setTimeout(() => {
        setUiState(prev => ({ ...prev, showSuccessAlert: false }));
      }, 3000);
    } catch (error) {
      setUiState(prev => ({
        ...prev,
        isSaving: false,
        showErrorAlert: true,
        errorMessage: error instanceof Error ? error.message : 'Error al guardar'
      }));
    }
  }, [settings, updateProfile]);

  const toggleEditing = useCallback(() => {
    setUiState(prev => ({ ...prev, isEditing: !prev.isEditing }));
  }, []);

  if (loading) {
    return (
      <Container fluid className="py-4">
        <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
          <Spinner animation="border" variant="primary" />
        </div>
      </Container>
    );
  }

  return (
    <Container fluid className="py-4">
      {/* Header */}
      <Row className="mb-4">
        <Col>
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h1 className="h3 mb-1">Configuración del Nutricionista</h1>
              <p className="text-muted mb-0">
                Gestiona tu perfil profesional, consultorio y preferencias
              </p>
            </div>
            <div className="d-flex gap-2">
              {uiState.isEditing ? (
                <>
                  <Button variant="outline-secondary" onClick={toggleEditing} disabled={uiState.isSaving}>
                    Cancelar
                  </Button>
                  <Button variant="primary" onClick={handleSave} disabled={uiState.isSaving}>
                    {uiState.isSaving ? (
                      <>
                        <Spinner animation="border" size="sm" className="me-2" />
                        Guardando...
                      </>
                    ) : (
                      <>
                        <Save size={16} className="me-2" />
                        Guardar Cambios
                      </>
                    )}
                  </Button>
                </>
              ) : (
                <Button variant="outline-primary" onClick={toggleEditing}>
                  <Edit size={16} className="me-2" />
                  Editar Configuración
                </Button>
              )}
            </div>
          </div>
        </Col>
      </Row>

      {/* Alertas */}
      {uiState.showSuccessAlert && (
        <Alert variant="success" dismissible onClose={() => setUiState(prev => ({ ...prev, showSuccessAlert: false }))}>
          <CheckCircle size={16} className="me-2" />
          Configuración guardada exitosamente
        </Alert>
      )}

      {uiState.showErrorAlert && (
        <Alert variant="danger" dismissible onClose={() => setUiState(prev => ({ ...prev, showErrorAlert: false }))}>
          <AlertCircle size={16} className="me-2" />
          Error: {uiState.errorMessage}
        </Alert>
      )}

      {/* Navegación por pestañas */}
      <Row className="mb-4">
        <Col>
          <Nav variant="tabs" activeKey={uiState.activeTab} onSelect={(key) => setUiState(prev => ({ ...prev, activeTab: key || 'professional' }))}>
            <Nav.Item>
              <Nav.Link eventKey="professional">
                <User size={16} className="me-2" />
                Perfil Profesional
              </Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link eventKey="clinic">
                <Building size={16} className="me-2" />
                Consultorio
              </Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link eventKey="availability">
                <Calendar size={16} className="me-2" />
                Disponibilidad
              </Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link eventKey="notifications">
                <Bell size={16} className="me-2" />
                Notificaciones
              </Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link eventKey="privacy">
                <Shield size={16} className="me-2" />
                Privacidad
              </Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link eventKey="payments">
                <CreditCard size={16} className="me-2" />
                Pagos
              </Nav.Link>
            </Nav.Item>
          </Nav>
        </Col>
      </Row>

      {/* Contenido de las pestañas */}
      <Tab.Container activeKey={uiState.activeTab}>
        <Tab.Content>

          {/* Perfil Profesional */}
          <Tab.Pane eventKey="professional" active={uiState.activeTab === 'professional'}>
            <Card>
              <Card.Body>
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Número de Cédula Profesional</Form.Label>
                      <Form.Control
                        type="text"
                        value={settings.professional.license_number}
                        onChange={(e) => handleInputChange('professional', 'license_number', e.target.value)}
                        disabled={!uiState.isEditing}
                        placeholder="Ej: 12345678"
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Entidad Emisora</Form.Label>
                      <Form.Control
                        type="text"
                        value={settings.professional.license_issuing_authority}
                        onChange={(e) => handleInputChange('professional', 'license_issuing_authority', e.target.value)}
                        disabled={!uiState.isEditing}
                        placeholder="Ej: SEP, Universidad XYZ"
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Años de Experiencia</Form.Label>
                      <Form.Control
                        type="number"
                        value={settings.professional.experience_years}
                        onChange={(e) => handleInputChange('professional', 'experience_years', Number(e.target.value))}
                        disabled={!uiState.isEditing}
                        min="0"
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Tarifa por Consulta (MXN)</Form.Label>
                      <Form.Control
                        type="number"
                        value={settings.professional.consultation_fee}
                        onChange={(e) => handleInputChange('professional', 'consultation_fee', Number(e.target.value))}
                        disabled={!uiState.isEditing}
                        min="0"
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <Row>
                  <Col md={12}>
                    <Form.Group className="mb-3">
                      <Form.Label>Especialidades (separadas por comas)</Form.Label>
                      <Form.Control
                        type="text"
                        value={settings.professional.specialties.join(', ')}
                        onChange={(e) => handleArrayChange('professional', 'specialties', e.target.value)}
                        disabled={!uiState.isEditing}
                        placeholder="Ej: Nutrición deportiva, Control de peso, Nutrición pediátrica"
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <Row>
                  <Col md={12}>
                    <Form.Group className="mb-3">
                      <Form.Label>Idiomas (separados por comas)</Form.Label>
                      <Form.Control
                        type="text"
                        value={settings.professional.languages.join(', ')}
                        onChange={(e) => handleArrayChange('professional', 'languages', e.target.value)}
                        disabled={!uiState.isEditing}
                        placeholder="Ej: Español, Inglés, Francés"
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <Row>
                  <Col md={12}>
                    <Form.Group className="mb-3">
                      <Form.Label>Enfoque de Tratamiento</Form.Label>
                      <Form.Control
                        as="textarea"
                        rows={3}
                        value={settings.professional.treatment_approach}
                        onChange={(e) => handleInputChange('professional', 'treatment_approach', e.target.value)}
                        disabled={!uiState.isEditing}
                        placeholder="Describe tu enfoque de tratamiento..."
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <Row>
                  <Col md={12}>
                    <Form.Group className="mb-3">
                      <Form.Label>Educación (una por línea)</Form.Label>
                      <Form.Control
                        as="textarea"
                        rows={3}
                        value={settings.professional.education.join('\n')}
                        onChange={(e) => handleArrayChange('professional', 'education', e.target.value)}
                        disabled={!uiState.isEditing}
                        placeholder="Licenciatura en Nutrición - Universidad XYZ (2010)&#10;Maestría en Nutrición Clínica - Universidad ABC (2015)"
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <Row>
                  <Col md={12}>
                    <Form.Group className="mb-3">
                      <Form.Label>Certificaciones (separadas por comas)</Form.Label>
                      <Form.Control
                        type="text"
                        value={settings.professional.certifications.join(', ')}
                        onChange={(e) => handleArrayChange('professional', 'certifications', e.target.value)}
                        disabled={!uiState.isEditing}
                        placeholder="Ej: Certificación en Nutrición Deportiva, Especialista en Diabetes"
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <Row>
                  <Col md={12}>
                    <Form.Group className="mb-3">
                      <Form.Label>Áreas de Interés (separadas por comas)</Form.Label>
                      <Form.Control
                        type="text"
                        value={settings.professional.areas_of_interest.join(', ')}
                        onChange={(e) => handleArrayChange('professional', 'areas_of_interest', e.target.value)}
                        disabled={!uiState.isEditing}
                        placeholder="Ej: Nutrición deportiva, Control de peso, Nutrición pediátrica"
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <Row>
                  <Col md={12}>
                    <Form.Group className="mb-3">
                      <Form.Label>Resumen Profesional</Form.Label>
                      <Form.Control
                        as="textarea"
                        rows={3}
                        value={settings.professional.professional_summary}
                        onChange={(e) => handleInputChange('professional', 'professional_summary', e.target.value)}
                        disabled={!uiState.isEditing}
                        placeholder="Breve descripción profesional para pacientes..."
                        maxLength={300}
                      />
                      <Form.Text className="text-muted">
                        {settings.professional.professional_summary.length}/300 caracteres
                      </Form.Text>
                    </Form.Group>
                  </Col>
                </Row>

                <Row>
                  <Col md={12}>
                    <Form.Group className="mb-3">
                      <Form.Label>Biografía Completa</Form.Label>
                      <Form.Control
                        as="textarea"
                        rows={5}
                        value={settings.professional.bio}
                        onChange={(e) => handleInputChange('professional', 'bio', e.target.value)}
                        disabled={!uiState.isEditing}
                        placeholder="Biografía completa y detallada..."
                      />
                    </Form.Group>
                  </Col>
                </Row>
              </Card.Body>
            </Card>
          </Tab.Pane>

          {/* Consultorio */}
          <Tab.Pane eventKey="clinic" active={uiState.activeTab === 'clinic'}>
            <Card>
              <Card.Body>
                <Row>
                  <Col md={12}>
                    <Form.Group className="mb-3">
                      <Form.Label>Nombre del Consultorio</Form.Label>
                      <Form.Control
                        type="text"
                        value={settings.clinic.clinic_name}
                        onChange={(e) => handleInputChange('clinic', 'clinic_name', e.target.value)}
                        disabled={!uiState.isEditing}
                        placeholder="Ej: Consultorio de Nutrición Dr. García"
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <Row>
                  <Col md={12}>
                    <Form.Group className="mb-3">
                      <Form.Label>Dirección Completa</Form.Label>
                      <Form.Control
                        type="text"
                        value={settings.clinic.clinic_address}
                        onChange={(e) => handleInputChange('clinic', 'clinic_address', e.target.value)}
                        disabled={!uiState.isEditing}
                        placeholder="Ej: Av. Reforma 123, Col. Centro"
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <Row>
                  <Col md={4}>
                    <Form.Group className="mb-3">
                      <Form.Label>Ciudad</Form.Label>
                      <Form.Control
                        type="text"
                        value={settings.clinic.clinic_city}
                        onChange={(e) => handleInputChange('clinic', 'clinic_city', e.target.value)}
                        disabled={!uiState.isEditing}
                        placeholder="Ej: Ciudad de México"
                      />
                    </Form.Group>
                  </Col>
                  <Col md={4}>
                    <Form.Group className="mb-3">
                      <Form.Label>Estado</Form.Label>
                      <Form.Control
                        type="text"
                        value={settings.clinic.clinic_state}
                        onChange={(e) => handleInputChange('clinic', 'clinic_state', e.target.value)}
                        disabled={!uiState.isEditing}
                        placeholder="Ej: CDMX"
                      />
                    </Form.Group>
                  </Col>
                  <Col md={4}>
                    <Form.Group className="mb-3">
                      <Form.Label>Código Postal</Form.Label>
                      <Form.Control
                        type="text"
                        value={settings.clinic.clinic_zip_code}
                        onChange={(e) => handleInputChange('clinic', 'clinic_zip_code', e.target.value)}
                        disabled={!uiState.isEditing}
                        placeholder="Ej: 06000"
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>País</Form.Label>
                      <Form.Control
                        type="text"
                        value={settings.clinic.clinic_country}
                        onChange={(e) => handleInputChange('clinic', 'clinic_country', e.target.value)}
                        disabled={!uiState.isEditing}
                        placeholder="Ej: México"
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Teléfono del Consultorio</Form.Label>
                      <Form.Control
                        type="tel"
                        value={settings.clinic.clinic_phone}
                        onChange={(e) => handleInputChange('clinic', 'clinic_phone', e.target.value)}
                        disabled={!uiState.isEditing}
                        placeholder="Ej: +52 55 1234 5678"
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <Row>
                  <Col md={12}>
                    <Form.Group className="mb-3">
                      <Form.Label>Notas del Consultorio</Form.Label>
                      <Form.Control
                        as="textarea"
                        rows={3}
                        value={settings.clinic.clinic_notes}
                        onChange={(e) => handleInputChange('clinic', 'clinic_notes', e.target.value)}
                        disabled={!uiState.isEditing}
                        placeholder="Información adicional sobre el consultorio..."
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Latitud</Form.Label>
                      <Form.Control
                        type="number"
                        step="any"
                        value={settings.clinic.latitude}
                        onChange={(e) => handleInputChange('clinic', 'latitude', Number(e.target.value))}
                        disabled={!uiState.isEditing}
                        placeholder="Ej: 19.4326"
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Longitud</Form.Label>
                      <Form.Control
                        type="number"
                        step="any"
                        value={settings.clinic.longitude}
                        onChange={(e) => handleInputChange('clinic', 'longitude', Number(e.target.value))}
                        disabled={!uiState.isEditing}
                        placeholder="Ej: -99.1332"
                      />
                    </Form.Group>
                  </Col>
                </Row>
              </Card.Body>
            </Card>
          </Tab.Pane>

          {/* Disponibilidad */}
          <Tab.Pane eventKey="availability" active={uiState.activeTab === 'availability'}>
            <Card>
              <Card.Body>
                <Row>
                  <Col md={12}>
                    <Form.Group className="mb-3">
                      <Form.Check
                        type="checkbox"
                        label="Disponible para consultas"
                        checked={settings.availability.is_available}
                        onChange={(e) => handleInputChange('availability', 'is_available', e.target.checked)}
                        disabled={!uiState.isEditing}
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Check
                        type="checkbox"
                        label="Ofrece consultas presenciales"
                        checked={settings.availability.offers_in_person}
                        onChange={(e) => handleInputChange('availability', 'offers_in_person', e.target.checked)}
                        disabled={!uiState.isEditing}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Check
                        type="checkbox"
                        label="Ofrece consultas online"
                        checked={settings.availability.offers_online}
                        onChange={(e) => handleInputChange('availability', 'offers_online', e.target.checked)}
                        disabled={!uiState.isEditing}
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <hr />

                <h6>Horarios de Consulta</h6>
                <Row>
                  {[
                    { key: 'monday', label: 'Lunes', icon: '1️⃣' },
                    { key: 'tuesday', label: 'Martes', icon: '2️⃣' },
                    { key: 'wednesday', label: 'Miércoles', icon: '3️⃣' },
                    { key: 'thursday', label: 'Jueves', icon: '4️⃣' },
                    { key: 'friday', label: 'Viernes', icon: '5️⃣' },
                    { key: 'saturday', label: 'Sábado', icon: '6️⃣' },
                    { key: 'sunday', label: 'Domingo', icon: '7️⃣' }
                  ].map((day) => (
                    <Col key={day.key} md={6} lg={4} className="mb-3">
                      <Card className="h-100">
                        <Card.Body>
                          <div className="d-flex align-items-center mb-2">
                            <span className="me-2">{day.icon}</span>
                            <h6 className="mb-0">{day.label}</h6>
                          </div>

                          <Form.Check
                            type="checkbox"
                            label="Disponible"
                            checked={settings.availability.office_hours[day.key as keyof typeof settings.availability.office_hours].active}
                            onChange={(e) => {
                              const newHours = { ...settings.availability.office_hours };
                              newHours[day.key as keyof typeof newHours].active = e.target.checked;
                              handleInputChange('availability', 'office_hours', newHours);
                            }}
                            disabled={!uiState.isEditing}
                          />

                          {settings.availability.office_hours[day.key as keyof typeof settings.availability.office_hours].active && (
                            <>
                              <Row className="mt-2">
                                <Col>
                                  <Form.Label className="small">Inicio</Form.Label>
                                  <Form.Control
                                    type="time"
                                    size="sm"
                                    value={settings.availability.office_hours[day.key as keyof typeof settings.availability.office_hours].start}
                                    onChange={(e) => {
                                      const newHours = { ...settings.availability.office_hours };
                                      newHours[day.key as keyof typeof newHours].start = e.target.value;
                                      handleInputChange('availability', 'office_hours', newHours);
                                    }}
                                    disabled={!uiState.isEditing}
                                  />
                                </Col>
                                <Col>
                                  <Form.Label className="small">Fin</Form.Label>
                                  <Form.Control
                                    type="time"
                                    size="sm"
                                    value={settings.availability.office_hours[day.key as keyof typeof settings.availability.office_hours].end}
                                    onChange={(e) => {
                                      const newHours = { ...settings.availability.office_hours };
                                      newHours[day.key as keyof typeof newHours].end = e.target.value;
                                      handleInputChange('availability', 'office_hours', newHours);
                                    }}
                                    disabled={!uiState.isEditing}
                                  />
                                </Col>
                              </Row>

                              <Form.Select
                                size="sm"
                                className="mt-2"
                                value={settings.availability.office_hours[day.key as keyof typeof settings.availability.office_hours].type}
                                onChange={(e) => {
                                  const newHours = { ...settings.availability.office_hours };
                                  newHours[day.key as keyof typeof newHours].type = e.target.value;
                                  handleInputChange('availability', 'office_hours', newHours);
                                }}
                                disabled={!uiState.isEditing}
                              >
                                <option value="presencial">Presencial</option>
                                <option value="virtual">Virtual</option>
                                <option value="ambos">Ambos</option>
                              </Form.Select>
                            </>
                          )}
                        </Card.Body>
                      </Card>
                    </Col>
                  ))}
                </Row>
              </Card.Body>
            </Card>
          </Tab.Pane>

          {/* Notificaciones */}
          <Tab.Pane eventKey="notifications" active={uiState.activeTab === 'notifications'}>
            <Card>
              <Card.Body>
                <h6>Configuración de Notificaciones</h6>
                <Row>
                  <Col md={6}>
                    <Form.Check
                      type="checkbox"
                      label="Notificaciones por email"
                      checked={settings.notifications.email_notifications}
                      onChange={(e) => handleInputChange('notifications', 'email_notifications', e.target.checked)}
                      disabled={!uiState.isEditing}
                    />
                  </Col>
                  <Col md={6}>
                    <Form.Check
                      type="checkbox"
                      label="Notificaciones push"
                      checked={settings.notifications.push_notifications}
                      onChange={(e) => handleInputChange('notifications', 'push_notifications', e.target.checked)}
                      disabled={!uiState.isEditing}
                    />
                  </Col>
                </Row>

                <Row>
                  <Col md={6}>
                    <Form.Check
                      type="checkbox"
                      label="Recordatorios de citas"
                      checked={settings.notifications.appointment_reminders}
                      onChange={(e) => handleInputChange('notifications', 'appointment_reminders', e.target.checked)}
                      disabled={!uiState.isEditing}
                    />
                  </Col>
                  <Col md={6}>
                    <Form.Check
                      type="checkbox"
                      label="Alertas de nuevos pacientes"
                      checked={settings.notifications.new_patient_alerts}
                      onChange={(e) => handleInputChange('notifications', 'new_patient_alerts', e.target.checked)}
                      disabled={!uiState.isEditing}
                    />
                  </Col>
                </Row>

                <Row>
                  <Col md={6}>
                    <Form.Check
                      type="checkbox"
                      label="Actualizaciones del sistema"
                      checked={settings.notifications.system_updates}
                      onChange={(e) => handleInputChange('notifications', 'system_updates', e.target.checked)}
                      disabled={!uiState.isEditing}
                    />
                  </Col>
                  <Col md={6}>
                    <Form.Check
                      type="checkbox"
                      label="Emails de marketing"
                      checked={settings.notifications.marketing_emails}
                      onChange={(e) => handleInputChange('notifications', 'marketing_emails', e.target.checked)}
                      disabled={!uiState.isEditing}
                    />
                  </Col>
                </Row>
              </Card.Body>
            </Card>
          </Tab.Pane>

          {/* Privacidad */}
          <Tab.Pane eventKey="privacy" active={uiState.activeTab === 'privacy'}>
            <Card>
              <Card.Body>
                <h6>Configuración de Privacidad</h6>
                <Row>
                  <Col md={6}>
                    <Form.Check
                      type="checkbox"
                      label="Perfil visible para pacientes"
                      checked={settings.privacy.profile_visible}
                      onChange={(e) => handleInputChange('privacy', 'profile_visible', e.target.checked)}
                      disabled={!uiState.isEditing}
                    />
                  </Col>
                  <Col md={6}>
                    <Form.Check
                      type="checkbox"
                      label="Mostrar información de contacto"
                      checked={settings.privacy.show_contact_info}
                      onChange={(e) => handleInputChange('privacy', 'show_contact_info', e.target.checked)}
                      disabled={!uiState.isEditing}
                    />
                  </Col>
                </Row>

                <Row>
                  <Col md={6}>
                    <Form.Check
                      type="checkbox"
                      label="Mostrar tarifa de consulta"
                      checked={settings.privacy.show_consultation_fee}
                      onChange={(e) => handleInputChange('privacy', 'show_consultation_fee', e.target.checked)}
                      disabled={!uiState.isEditing}
                    />
                  </Col>
                  <Col md={6}>
                    <Form.Check
                      type="checkbox"
                      label="Permitir mensajes de pacientes"
                      checked={settings.privacy.allow_messages}
                      onChange={(e) => handleInputChange('privacy', 'allow_messages', e.target.checked)}
                      disabled={!uiState.isEditing}
                    />
                  </Col>
                </Row>

                <Row>
                  <Col md={6}>
                    <Form.Check
                      type="checkbox"
                      label="Permitir reseñas de pacientes"
                      checked={settings.privacy.allow_reviews}
                      onChange={(e) => handleInputChange('privacy', 'allow_reviews', e.target.checked)}
                      disabled={!uiState.isEditing}
                    />
                  </Col>
                </Row>
              </Card.Body>
            </Card>
          </Tab.Pane>

          {/* Pagos */}
          <Tab.Pane eventKey="payments" active={uiState.activeTab === 'payments'}>
            <Card>
              <Card.Body>
                <h6>Métodos de Pago Aceptados</h6>
                <Row>
                  <Col md={6}>
                    <Form.Check
                      type="checkbox"
                      label="Efectivo"
                      checked={settings.payments.accept_cash}
                      onChange={(e) => handleInputChange('payments', 'accept_cash', e.target.checked)}
                      disabled={!uiState.isEditing}
                    />
                  </Col>
                  <Col md={6}>
                    <Form.Check
                      type="checkbox"
                      label="Tarjeta de crédito/débito"
                      checked={settings.payments.accept_card}
                      onChange={(e) => handleInputChange('payments', 'accept_card', e.target.checked)}
                      disabled={!uiState.isEditing}
                    />
                  </Col>
                </Row>

                <Row>
                  <Col md={6}>
                    <Form.Check
                      type="checkbox"
                      label="Transferencia bancaria"
                      checked={settings.payments.accept_transfer}
                      onChange={(e) => handleInputChange('payments', 'accept_transfer', e.target.checked)}
                      disabled={!uiState.isEditing}
                    />
                  </Col>
                  <Col md={6}>
                    <Form.Check
                      type="checkbox"
                      label="Pago online"
                      checked={settings.payments.accept_online_payment}
                      onChange={(e) => handleInputChange('payments', 'accept_online_payment', e.target.checked)}
                      disabled={!uiState.isEditing}
                    />
                  </Col>
                </Row>

                <Row>
                  <Col md={12}>
                    <Form.Group className="mb-3">
                      <Form.Label>Notas sobre pagos</Form.Label>
                      <Form.Control
                        as="textarea"
                        rows={3}
                        value={settings.payments.payment_notes}
                        onChange={(e) => handleInputChange('payments', 'payment_notes', e.target.value)}
                        disabled={!uiState.isEditing}
                        placeholder="Información adicional sobre métodos de pago..."
                      />
                    </Form.Group>
                  </Col>
                </Row>
              </Card.Body>
            </Card>
          </Tab.Pane>

        </Tab.Content>
      </Tab.Container>
    </Container>
  );
};

export default NutritionistSettingsPage; 