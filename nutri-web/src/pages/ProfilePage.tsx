import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
// **IMPORTACIONES OPTIMIZADAS**
import { Container, Row, Col, Card, Button, Alert, Badge, Spinner, Tab, Nav, Image } from 'react-bootstrap';

// **LAZY LOADING DE ICONOS - Solo importar los necesarios**
import { 
  Users, 
  User, 
  Save, 
  Edit, 
  Shield, 
  Bell, 
  BarChart3, 
  Stethoscope,
  Lock,
  Award,
  Calendar,
  Camera,
  Settings,
  RefreshCw,
  CheckCircle,
  Star,
  FileText,
  AlertCircle,
  AlertTriangle,
  Eye,
  EyeOff
} from 'lucide-react';

import { useProfile } from '../hooks/useProfile';
import profileService from '../services/profileService';
import GoogleAuth from '../components/GoogleAuth';
import GoogleCalendarConfig from '../components/GoogleCalendarConfig';
import '../styles/profile.css';

// Componentes optimizados
const OptimizedFormField = React.memo(({
  label,
  type = 'text',
  value,
  onChange,
  error, 
  required = false,
  placeholder,
  id,
  name,
  autocomplete,
  disabled = false,
  className = '',
  ...props
}: {
  label: string;
  type?: string;
  value: string | number;
  onChange: (value: string | number) => void;
  error?: string;
  required?: boolean;
  placeholder?: string;
  id: string;
  name: string;
  autocomplete?: string;
  disabled?: boolean;
  className?: string;
  [key: string]: any;
}) => {
  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = type === 'number' ? Number(e.target.value) : e.target.value;
    onChange(newValue);
  }, [onChange, type]);

  const fieldId = useMemo(() => id || name, [id, name]);

  return (
    <div className={`form-group ${className}`}>
      <label className="form-label" htmlFor={fieldId}>
        {label} {required && <span className="text-danger">*</span>}
      </label>
      <input
        type={type}
        className={`form-control ${error ? 'is-invalid' : ''}`}
        id={fieldId}
        name={name}
        autoComplete={autocomplete || name}
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        disabled={disabled}
        required={required}
        {...props}
      />
      {error && <div className="invalid-feedback">{error}</div>}
    </div>
  );
});

const OptimizedButton = React.memo(({
  children,
  onClick,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  className = '',
  type = 'button',
  ...props
}: {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info' | 'outline-primary' | 'outline-secondary' | 'outline-success' | 'outline-danger' | 'outline-warning' | 'outline-info';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  className?: string;
  type?: 'button' | 'submit' | 'reset';
}) => {
  const handleClick = useCallback(() => {
    if (!disabled && !loading && onClick) {
      onClick();
    }
  }, [onClick, disabled, loading]);

  const buttonClasses = useMemo(() => {
    const baseClass = `btn btn-${variant} btn-${size}`;
    const loadingClass = loading ? 'disabled' : '';
    return `${baseClass} ${loadingClass} ${className}`.trim();
  }, [variant, size, loading, className]);

  return (
    <button
      type={type}
      className={buttonClasses}
      onClick={handleClick}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true" />
      )}
      {children}
    </button>
  );
});

// 1. Definir el tipo para practice
interface PracticeState {
  clinic_address: string;
  consultation_hours: string;
  bio: string;
  professional_summary: string;
  [key: string]: any;
}

// 2. Definir el tipo para formState
interface FormState {
  personal: {
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
    birth_date: string;
    gender: string;
  };
  professional: {
    license_number: string;
    license_issuing_authority: string;
    experience_years: number;
    consultation_fee: number;
    specialties: string[];
    languages: string[];
    treatment_approach: string;
    education: string;
    certifications: string[];
    areas_of_interest: string[];
  };
  practice: PracticeState;
}

const ProfilePage: React.FC = () => {
  const { profile, stats, loading, error, loadProfile, loadStats, updateProfile } = useProfile();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Estados consolidados
  const [uiState, setUiState] = useState({
    isEditing: false,
    activeTab: 'personal',
    showPasswordModal: false,
    showDeleteModal: false,
    showSuccessAlert: false,
    showErrorAlert: false,
    uploadingImage: false
  });

  // 3. Usar el tipo en useState
  const [formState, setFormState] = useState<FormState>({
    personal: {
      first_name: '',
      last_name: '',
      email: '',
      phone: '',
      birth_date: '',
      gender: ''
    },
    professional: {
      license_number: '',
      license_issuing_authority: '',
      experience_years: 0,
      consultation_fee: 0,
      specialties: [],
      languages: [],
      treatment_approach: '',
      education: '',
      certifications: [],
      areas_of_interest: []
    },
    practice: {
      clinic_address: '',
      consultation_hours: '',
      bio: '',
      professional_summary: ''
    }
  });

  const [passwordState, setPasswordState] = useState({
    current: '',
    new: '',
    confirm: '',
    showCurrent: false,
    showNew: false,
    showConfirm: false
  });

  const [notificationSettings, setNotificationSettings] = useState({
    email_notifications: true,
    push_notifications: true,
    appointment_reminders: true,
    new_patient_alerts: true,
    system_updates: true
  });

  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);

  // Memoizar datos del perfil
  const profileData = useMemo(() => {
    if (!profile) return null;
    
    return {
      personal: {
        first_name: profile.first_name || '',
        last_name: profile.last_name || '',
        email: profile.email || '',
        phone: profile.phone || '',
        birth_date: profile.birth_date || '',
        gender: profile.gender || ''
      },
      professional: {
        license_number: profile.license_number || '',
        license_issuing_authority: profile.license_issuing_authority || '',
        experience_years: profile.experience_years || 0,
        consultation_fee: profile.consultation_fee || 0,
        specialties: profile.specialties || [],
        languages: profile.languages || [],
        treatment_approach: profile.treatment_approach || '',
        education: profile.education || '',
        certifications: profile.certifications || [],
        areas_of_interest: profile.areas_of_interest || []
      },
      practice: {
        clinic_address: profile.clinic_address || '',
        consultation_hours: profile.consultation_hours || '',
        bio: profile.bio || '',
        professional_summary: profile.professional_summary || ''
      }
    };
  }, [profile]);

  // Cargar datos del perfil al montar el componente
  useEffect(() => {
    console.log('ProfilePage - Cargando datos iniciales del perfil...');
    loadProfile();
    loadStats();
  }, [loadProfile, loadStats]);

  // Actualizar formulario cuando cambien los datos del perfil
  useEffect(() => {
    if (profileData) {
      setFormState(profileData);
    }
  }, [profileData]);

  // Actualizar imagen de perfil cuando se cargue el perfil
  useEffect(() => {
    if (profile?.profile_image) {
      setProfileImage(profile.profile_image);
    }
  }, [profile]);

  useEffect(() => {
    if (profile && profile.nutritionist_profile) {
      setFormState({
        personal: {
          first_name: profile.first_name || '',
          last_name: profile.last_name || '',
          email: profile.email || '',
          phone: profile.phone || '',
          birth_date: profile.birth_date || '',
          gender: profile.gender || ''},
        professional: {
          license_number: profile.nutritionist_profile.license_number || '',
          license_issuing_authority: profile.nutritionist_profile.license_issuing_authority || '',
          experience_years: profile.nutritionist_profile.years_of_experience || 0,
          consultation_fee: profile.nutritionist_profile.consultation_fee || 0,
          specialties: profile.nutritionist_profile.specialties || [],
          languages: profile.nutritionist_profile.languages || [],
          treatment_approach: profile.nutritionist_profile.treatment_approach || '',
          education: profile.nutritionist_profile.education || [],
          certifications: profile.nutritionist_profile.certifications || [],
          areas_of_interest: profile.nutritionist_profile.areas_of_interest || []},
        practice: {
          clinic_address: profile.nutritionist_profile?.clinic_address || '',
          consultation_hours: profile.nutritionist_profile?.consultation_hours || '',
          bio: profile.nutritionist_profile?.bio || '',
          professional_summary: profile.nutritionist_profile?.professional_summary || ''
        }
      });
    }
  }, [profile]);

  // Handlers optimizados
  const handleInputChange = useCallback((section: string, field: string, value: any) => {
    setFormState(prev => ({
      ...prev,
      [section]: {
        ...prev[section as keyof typeof prev],
        [field]: value
      }
    }));
  }, []);

  const toggleEditing = useCallback(() => {
    setUiState(prev => ({ ...prev, isEditing: !prev.isEditing }));
  }, []);

  const handleSave = useCallback(async () => {
    try {
      // Preparar datos para enviar, filtrando arrays vacíos
      const updateData = {
        ...formState.personal,
        ...formState.professional,
        ...formState.practice
      };

      // Filtrar arrays vacíos para evitar errores en PostgreSQL
      const cleanedData: any = {};
      
      // Solo incluir propiedades con valores válidos
      Object.entries(updateData).forEach(([key, value]) => {
        if (Array.isArray(value)) {
          // Solo incluir arrays que no estén vacíos
          if (value.length > 0) {
            cleanedData[key] = value;
          }
        } else if (typeof value === 'string') {
          // Solo incluir strings que no estén vacíos
          if (value.trim() !== '') {
            cleanedData[key] = value;
          }
        } else if (typeof value === 'number') {
          // Incluir números (incluyendo 0)
          cleanedData[key] = value;
        } else if (value !== null && value !== undefined) {
          // Incluir otros valores válidos
          cleanedData[key] = value;
        }
      });

      console.log('ProfilePage - Sending cleaned data:', cleanedData);
      
      await updateProfile(cleanedData);
      
      // Recargar el perfil para obtener los datos actualizados
      await loadProfile();
      
      setUiState(prev => ({ 
      ...prev,
        isEditing: false,
        showSuccessAlert: true 
      }));
      
      // Ocultar alerta después de 3 segundos
      setTimeout(() => {
        setUiState(prev => ({ ...prev, showSuccessAlert: false }));
      }, 3000);
    } catch (error) {
      setUiState(prev => ({ 
        ...prev, 
        showErrorAlert: true 
      }));
    }
  }, [formState, updateProfile, loadProfile]);

  const handlePasswordChange = useCallback((field: string, value: string) => {
    setPasswordState(prev => ({ ...prev, [field]: value }));
  }, []);

  const togglePasswordVisibility = useCallback((field: string) => {
    setPasswordState(prev => ({ 
      ...prev, 
      [`show${field.charAt(0).toUpperCase() + field.slice(1)}`]: !prev[`show${field.charAt(0).toUpperCase() + field.slice(1)}` as keyof typeof prev]
    }));
  }, []);

  const handleNotificationChange = useCallback((setting: string, value: boolean) => {
    setNotificationSettings(prev => ({ ...prev, [setting]: value }));
  }, []);

  // Memoizar estadísticas
  const statsDisplay = useMemo(() => {
    if (!stats) return null;
    
    return [
      { label: 'Pacientes Totales', value: stats.total_patients || 0, icon: Users, color: 'primary' },
      { label: 'Citas Totales', value: stats.total_appointments || 0, icon: Calendar, color: 'success' },
      { label: 'Años de Experiencia', value: stats.experience_years || 0, icon: Award, color: 'warning' },
      { label: 'Tasa de Completitud', value: `${stats.completion_rate || 0}%`, icon: CheckCircle, color: 'info' },
      { label: 'Calificación Promedio', value: (stats.average_rating || 0).toFixed(1), icon: Star, color: 'secondary' },
      { label: 'Reseñas Totales', value: stats.total_reviews || 0, icon: FileText, color: 'dark' }
    ];
  }, [stats]);

  // Memoizar tabs
  const tabs = useMemo(() => [
    { key: 'personal', label: 'Información Personal', icon: User },
    { key: 'professional', label: 'Credenciales', icon: Shield },
    { key: 'practice', label: 'Práctica', icon: Stethoscope },
    { key: 'notifications', label: 'Notificaciones', icon: Bell },
    { key: 'security', label: 'Seguridad', icon: Lock },
    { key: 'google', label: 'Google Calendar', icon: Calendar },
    { key: 'stats', label: 'Estadísticas', icon: BarChart3 }
  ], []);

  // Función para manejar la selección de imagen
  const handleImageSelect = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validar tipo de archivo
      if (!file.type.startsWith('image/')) {
        alert('Por favor selecciona solo archivos de imagen.');
        return;
      }

      // Validar tamaño (máximo 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('La imagen debe ser menor a 5MB.');
      return;
    }

      setSelectedImageFile(file);
      
      // Crear URL temporal para previsualización
      const imageUrl = URL.createObjectURL(file);
      setProfileImage(imageUrl);
    }
  }, []);

  // Función para subir imagen al servidor
  const uploadProfileImage = useCallback(async (file: File) => {
    try {
      setUiState(prev => ({ ...prev, uploadingImage: true }));
      
      const result = await profileService.uploadProfileImage(file);
      
      // Actualizar la imagen de perfil con la URL del servidor
      if (result.profile_image) {
        setProfileImage(result.profile_image);
      }
      
      setUiState(prev => ({ 
        ...prev, 
        uploadingImage: false,
        showSuccessAlert: true 
      }));
      
      // Ocultar alerta después de 3 segundos
      setTimeout(() => {
        setUiState(prev => ({ ...prev, showSuccessAlert: false }));
      }, 3000);
      
    } catch (error) {
      console.error('Error uploading image:', error);
      setUiState(prev => ({ 
        ...prev, 
        uploadingImage: false,
        showErrorAlert: true 
      }));
      
      // Restaurar imagen original en caso de error
      if (profile?.profile_image) {
        setProfileImage(profile.profile_image);
      } else {
        setProfileImage('/default-avatar.png');
      }
    }
  }, [profile]);

  // Función para manejar el clic en el botón de subir imagen
  const handleUploadImageClick = useCallback(() => {
    if (selectedImageFile) {
      uploadProfileImage(selectedImageFile);
    }
  }, [selectedImageFile, uploadProfileImage]);

  if (loading) {
    return (
      <Container className="py-4">
        <div className="text-center">
          <Spinner animation="border" role="status">
            <span className="visually-hidden">Cargando...</span>
          </Spinner>
          <p className="mt-2">Cargando perfil...</p>
        </div>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="py-4">
        <Alert variant="danger">
          <AlertCircle className="me-2" />
          Error al cargar el perfil: {error}
        </Alert>
      </Container>
    );
  }

  return (
    <Container className="py-4">
      {/* Alertas */}
      {uiState.showSuccessAlert && (
        <Alert variant="success" dismissible onClose={() => setUiState(prev => ({ ...prev, showSuccessAlert: false }))}>
          <CheckCircle className="me-2" />
          Perfil actualizado exitosamente
        </Alert>
      )}

      {uiState.showErrorAlert && (
        <Alert variant="danger" dismissible onClose={() => setUiState(prev => ({ ...prev, showErrorAlert: false }))}>
          <AlertTriangle className="me-2" />
          Error al actualizar el perfil
        </Alert>
      )}

      <Row>
        <Col lg={3}>
          {/* Perfil del usuario */}
          <Card className="mb-4">
            <Card.Body className="text-center">
              <div className="position-relative mb-3">
                <Image
                  src={profileImage || '/default-avatar.png'}
                  roundedCircle
                  width={120}
                  height={120}
                  className="border"
                  style={{ objectFit: 'cover' }}
                />
                {uiState.isEditing && (
                  <div className="position-absolute bottom-0 end-0">
        <Button 
          size="sm"
                      variant="primary"
                      className="rounded-circle"
                      style={{ width: '32px', height: '32px', padding: 0 }}
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uiState.uploadingImage}
                      title="Cambiar imagen de perfil"
                    >
                      {uiState.uploadingImage ? (
                        <Spinner animation="border" size="sm" />
                      ) : (
                        <Camera size={16} />
                      )}
        </Button>
      </div>
                )}
                
                {/* Indicador de carga */}
                {uiState.uploadingImage && (
                  <div className="position-absolute top-50 start-50 translate-middle">
                    <div className="bg-white bg-opacity-75 rounded p-2">
                      <Spinner animation="border" size="sm" />
                      <small className="d-block mt-1">Subiendo...</small>
        </div>
        </div>
                )}
      </div>

              <h5 className="mb-1">
                {profile?.first_name} {profile?.last_name}
              </h5>
              <p className="text-muted mb-2">{profile?.email}</p>
              
              <Badge bg="success" className="mb-3">
                Nutriólogo
              </Badge>

              {uiState.isEditing && selectedImageFile && (
                <div className="mb-3">
                  <small className="text-muted d-block mb-2">
                    Imagen seleccionada: {selectedImageFile.name}
                  </small>
                  <div className="d-flex gap-2 justify-content-center">
                    <OptimizedButton
                      onClick={handleUploadImageClick}
                      variant="success"
                      size="sm"
                      loading={uiState.uploadingImage}
                      disabled={uiState.uploadingImage}
                    >
                      <Camera size={14} className="me-1" />
                      Subir Imagen
                    </OptimizedButton>
                    <OptimizedButton
                      onClick={() => {
                        setSelectedImageFile(null);
                        if (profile?.profile_image) {
                          setProfileImage(profile.profile_image);
                        } else {
                          setProfileImage('/default-avatar.png');
                        }
                      }}
                      variant="outline-secondary"
                      size="sm"
                      disabled={uiState.uploadingImage}
                    >
            Cancelar
                    </OptimizedButton>
        </div>
    </div>
              )}

              {uiState.isEditing ? (
                <div className="d-grid gap-2">
                  <OptimizedButton
                    onClick={handleSave}
                    variant="success"
                    loading={loading}
                  >
                    <Save size={16} className="me-2" />
                    Guardar Cambios
                  </OptimizedButton>
                  <OptimizedButton
                    onClick={toggleEditing}
                    variant="outline-secondary"
                  >
                    Cancelar
                  </OptimizedButton>
        </div>
              ) : (
                <OptimizedButton
                  onClick={toggleEditing}
                  variant="primary"
                >
                  <Edit size={16} className="me-2" />
                  Editar Perfil
                </OptimizedButton>
              )}
            </Card.Body>
          </Card>

          {/* Estadísticas rápidas */}
          {statsDisplay && (
            <Card>
              <Card.Header>
                <h6 className="mb-0">
                  <BarChart3 size={16} className="me-2" />
                  Estadísticas
                </h6>
              </Card.Header>
              <Card.Body>
                <div className="row g-2">
                  {statsDisplay.map((stat, index) => (
                    <div key={index} className="col-6">
                      <div className="text-center">
                        <div className={`text-${stat.color} mb-1`}>
                          <stat.icon size={20} />
          </div>
                        <div className="small fw-bold">{stat.value}</div>
                        <div className="small text-muted">{stat.label}</div>
          </div>
              </div>
            ))}
          </div>
              </Card.Body>
            </Card>
          )}
        </Col>

        <Col lg={9}>
          <Card>
            <Card.Header>
              <Nav variant="tabs" activeKey={uiState.activeTab} onSelect={(k) => setUiState(prev => ({ ...prev, activeTab: k || 'personal' }))}>
                {tabs.map(tab => (
                  <Nav.Item key={tab.key}>
                    <Nav.Link eventKey={tab.key}>
                      <tab.icon size={16} className="me-2" />
                      {tab.label}
                    </Nav.Link>
                  </Nav.Item>
                ))}
              </Nav>
            </Card.Header>
            
            <Card.Body>
              <Tab.Content>
                {/* Información Personal */}
                <Tab.Pane eventKey="personal" active={uiState.activeTab === 'personal'}>
                  <Row>
                    <Col md={6}>
                      <OptimizedFormField
                        label="Nombre"
                        value={formState.personal.first_name}
                        onChange={(value) => handleInputChange('personal', 'first_name', value)}
                        id="first-name"
                        name="first_name"
                        autocomplete="given-name"
                        disabled={!uiState.isEditing}
                        required
                      />
                    </Col>
                    <Col md={6}>
                      <OptimizedFormField
                        label="Apellidos"
                        value={formState.personal.last_name}
                        onChange={(value) => handleInputChange('personal', 'last_name', value)}
                        id="last-name"
                        name="last_name"
                        autocomplete="family-name"
                        disabled={!uiState.isEditing}
                        required
                      />
                    </Col>
                  </Row>

                  <Row>
                    <Col md={6}>
                      <OptimizedFormField
                        label="Email"
                        type="email"
                        value={formState.personal.email}
                        onChange={(value) => handleInputChange('personal', 'email', value)}
                        id="email"
                        name="email"
                        autocomplete="email"
                        disabled={!uiState.isEditing}
                        required
                      />
                    </Col>
                    <Col md={6}>
                      <OptimizedFormField
                        label="Teléfono"
                        type="tel"
                        value={formState.personal.phone}
                        onChange={(value) => handleInputChange('personal', 'phone', value)}
                        id="phone"
                        name="phone"
                        autocomplete="tel"
                        disabled={!uiState.isEditing}
                      />
                    </Col>
                  </Row>

                  <Row>
                    <Col md={6}>
                      <OptimizedFormField
                        label="Fecha de Nacimiento"
                        type="date"
                        value={formState.personal.birth_date}
                        onChange={(value) => handleInputChange('personal', 'birth_date', value)}
                        id="birth-date"
                        name="birth_date"
                        autocomplete="bday"
                        disabled={!uiState.isEditing}
                      />
                    </Col>
                    <Col md={6}>
                      <div className="form-group">
                        <label className="form-label" htmlFor="gender">
                          Género
                        </label>
                        <select
                          className="form-control"
                          id="gender"
                          name="gender"
                          autoComplete="sex"
                          value={formState.personal.gender}
                          onChange={(e) => handleInputChange('personal', 'gender', e.target.value)}
                          disabled={!uiState.isEditing}
                        >
                          <option value="">Seleccionar género...</option>
                          <option value="Masculino">Masculino</option>
                          <option value="Femenino">Femenino</option>
                        </select>
                      </div>
                    </Col>
                  </Row>
                </Tab.Pane>

                {/* Credenciales */}
                <Tab.Pane eventKey="professional" active={uiState.activeTab === 'professional'}>
                  <Row>
                    <Col md={6}>
                      <OptimizedFormField
                        label="Número de Cédula Profesional"
                        value={formState.professional.license_number}
                        onChange={(value) => handleInputChange('professional', 'license_number', value)}
                        id="license-number"
                        name="license-number"
                        disabled={!uiState.isEditing}
                        required
                      />
                    </Col>
                    <Col md={6}>
                      <OptimizedFormField
                        label="Entidad Emisora"
                        value={formState.professional.license_issuing_authority}
                        onChange={(value) => handleInputChange('professional', 'license_issuing_authority', value)}
                        id="license-issuing-authority"
                        name="license-issuing-authority"
                        disabled={!uiState.isEditing}
                      />
                    </Col>
                  </Row>

                  <Row>
                    <Col md={6}>
                      <OptimizedFormField
                        label="Años de Experiencia"
                        type="number"
                        value={formState.professional.experience_years}
                        onChange={(value) => handleInputChange('professional', 'experience_years', value)}
                        id="experience-years"
                        name="experience-years"
                        disabled={!uiState.isEditing}
                        min="0"
                      />
                    </Col>
                    <Col md={6}>
                      <OptimizedFormField
                        label="Tarifa por Consulta"
                        type="number"
                        value={formState.professional.consultation_fee}
                        onChange={(value) => handleInputChange('professional', 'consultation_fee', value)}
                        id="consultation-fee"
                        name="consultation-fee"
                        disabled={!uiState.isEditing}
                        min="0"
                      />
                    </Col>
                  </Row>

                  <Row>
                    <Col md={12}>
                      <label className="form-label">Educación</label>
                      <textarea
                        className="form-control"
                        rows={3}
                        value={formState.professional.education}
                        onChange={(e) => handleInputChange('professional', 'education', e.target.value)}
                        disabled={!uiState.isEditing}
                        placeholder="Licenciatura en Nutrición - Universidad XYZ (2010)&#10;Maestría en Nutrición Clínica - Universidad ABC (2015)"
                      />
                      <small className="text-muted">Una institución/título por línea</small>
                    </Col>
                  </Row>
                </Tab.Pane>

                {/* Práctica */}
                <Tab.Pane eventKey="practice" active={uiState.activeTab === 'practice'}>
                  <Row>
                    <Col md={12}>
                      <OptimizedFormField
                        label="Dirección de la Clínica"
                        value={formState.practice.clinic_address}
                        onChange={(value) => handleInputChange('practice', 'clinic_address', value)}
                        id="clinic-address"
                        name="clinic-address"
                        disabled={!uiState.isEditing}
                      />
                    </Col>
                  </Row>

                  <Row>
                    <Col md={12}>
                      <div className="card border-0 bg-light">
                        <div className="card-header bg-transparent border-0">
                          <h6 className="mb-0">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="me-2">
                              <circle cx="12" cy="12" r="10"></circle>
                              <polyline points="12 6 12 12 16 14"></polyline>
                            </svg>
                            Horarios de Consulta
                          </h6>
                        </div>
                        <div className="card-body">
                          <div className="row">
                            {[
                              { key: 'monday', label: 'Lunes', icon: '1️⃣' },
                              { key: 'tuesday', label: 'Martes', icon: '2️⃣' },
                              { key: 'wednesday', label: 'Miércoles', icon: '3️⃣' },
                              { key: 'thursday', label: 'Jueves', icon: '4️⃣' },
                              { key: 'friday', label: 'Viernes', icon: '5️⃣' },
                              { key: 'saturday', label: 'Sábado', icon: '6️⃣' },
                              { key: 'sunday', label: 'Domingo', icon: '7️⃣' }
                            ].map((day) => (
                              <div key={day.key} className="col-md-6 col-lg-4 mb-3">
                                <div className="border rounded p-3 h-100">
                                  <div className="d-flex align-items-center mb-2">
                                    <span className="me-2">{day.icon}</span>
                                    <h6 className="mb-0">{day.label}</h6>
                                  </div>
                                  
                                  <div className="form-check mb-2">
                                    <input
                                      className="form-check-input"
                                      type="checkbox"
                                      id={`${day.key}-active`}
                                      checked={formState.practice[`${day.key}_active`] || false}
                                      onChange={(e) => handleInputChange('practice', `${day.key}_active`, e.target.checked)}
                                      disabled={!uiState.isEditing}
                                    />
                                    <label className="form-check-label small" htmlFor={`${day.key}-active`}>
                                      Disponible
                                    </label>
                                  </div>

                                  {formState.practice[`${day.key}_active`] && (
                                    <>
                                      <div className="row g-2">
                                        <div className="col-6">
                                          <label className="form-label small">Inicio</label>
                                          <input
                                            type="time"
                                            className="form-control form-control-sm"
                                            value={formState.practice[`${day.key}_start`] || '09:00'}
                                            onChange={(e) => handleInputChange('practice', `${day.key}_start`, e.target.value)}
                                            disabled={!uiState.isEditing}
                                          />
                                        </div>
                                        <div className="col-6">
                                          <label className="form-label small">Fin</label>
                                          <input
                                            type="time"
                                            className="form-control form-control-sm"
                                            value={formState.practice[`${day.key}_end`] || '18:00'}
                                            onChange={(e) => handleInputChange('practice', `${day.key}_end`, e.target.value)}
                                            disabled={!uiState.isEditing}
                                          />
                                        </div>
                                      </div>
                                      
                                      <div className="mt-2">
                                        <label className="form-label small">Tipo de Consulta</label>
                                        <select
                                          className="form-select form-select-sm"
                                          value={formState.practice[`${day.key}_type`] || 'presencial'}
                                          onChange={(e) => handleInputChange('practice', `${day.key}_type`, e.target.value)}
                                          disabled={!uiState.isEditing}
                                        >
                                          <option value="presencial">Presencial</option>
                                          <option value="virtual">Virtual</option>
                                          <option value="ambos">Ambos</option>
                                        </select>
                                      </div>
                                    </>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                          
                          <div className="mt-3">
                            <div className="alert alert-info">
                              <div className="d-flex align-items-center">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="me-2">
                                  <circle cx="12" cy="12" r="10"></circle>
                                  <path d="m9 12 2 2 4-4"></path>
                                </svg>
                                <small>
                                  <strong>Resumen de Horarios:</strong> {(() => {
                                    const activeDays = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].filter(day => 
                                      formState.practice[`${day}_active`]
                                    );
                                    if (activeDays.length === 0) return 'No hay horarios configurados';
                                    
                                    const dayLabels = {
                                      monday: 'Lun', tuesday: 'Mar', wednesday: 'Mié', 
                                      thursday: 'Jue', friday: 'Vie', saturday: 'Sáb', sunday: 'Dom'
                                    } as Record<string, string>;
                                    return activeDays.map(day => dayLabels[day]).join(', ');
                                  })()}
                                </small>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </Col>
                  </Row>

                  <Row>
                    <Col md={12}>
                      <label className="form-label">Biografía</label>
                      <textarea
                        className="form-control"
                        rows={4}
                        value={formState.practice.bio}
                        onChange={(e) => handleInputChange('practice', 'bio', e.target.value)}
                        disabled={!uiState.isEditing}
                        placeholder="Cuéntanos sobre tu experiencia y enfoque..."
                      />
                    </Col>
                  </Row>
                </Tab.Pane>

                {/* Notificaciones */}
                <Tab.Pane eventKey="notifications" active={uiState.activeTab === 'notifications'}>
                  <h6 className="mb-3">Configuración de Notificaciones</h6>
        {Object.entries(notificationSettings).map(([key, value]) => (
                    <div key={key} className="form-check mb-2">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id={key}
              checked={value}
              onChange={(e) => handleNotificationChange(key, e.target.checked)}
                        disabled={!uiState.isEditing}
                      />
                      <label className="form-check-label" htmlFor={key}>
                        {key === 'email_notifications' && 'Notificaciones por Email'}
                        {key === 'push_notifications' && 'Notificaciones Push'}
                        {key === 'appointment_reminders' && 'Recordatorios de Citas'}
                        {key === 'new_patient_alerts' && 'Alertas de Nuevos Pacientes'}
                        {key === 'system_updates' && 'Actualizaciones del Sistema'}
                      </label>
          </div>
        ))}
                </Tab.Pane>

                {/* Seguridad */}
                <Tab.Pane eventKey="security" active={uiState.activeTab === 'security'}>
                  <h6 className="mb-3">Cambiar Contraseña</h6>
                  <Row>
                    <Col md={6}>
                      <div className="form-group">
                        <label className="form-label">Contraseña Actual</label>
                        <div className="input-group">
                          <input
                            type={passwordState.showCurrent ? 'text' : 'password'}
                            className="form-control"
                            value={passwordState.current}
                            onChange={(e) => handlePasswordChange('current', e.target.value)}
                            placeholder="Ingresa tu contraseña actual"
                          />
                          <button
                            type="button"
                            className="btn btn-outline-secondary"
                            onClick={() => togglePasswordVisibility('current')}
                          >
                            {passwordState.showCurrent ? <EyeOff size={16} /> : <Eye size={16} />}
                          </button>
      </div>
    </div>
                    </Col>
                  </Row>

                  <Row>
                    <Col md={6}>
                      <div className="form-group">
                        <label className="form-label">Nueva Contraseña</label>
                        <div className="input-group">
                          <input
                            type={passwordState.showNew ? 'text' : 'password'}
                            className="form-control"
                            value={passwordState.new}
                            onChange={(e) => handlePasswordChange('new', e.target.value)}
                            placeholder="Ingresa tu nueva contraseña"
                          />
                          <button
                            type="button"
                            className="btn btn-outline-secondary"
                            onClick={() => togglePasswordVisibility('new')}
                          >
                            {passwordState.showNew ? <EyeOff size={16} /> : <Eye size={16} />}
                          </button>
        </div>
      </div>
                    </Col>
                    <Col md={6}>
                      <div className="form-group">
                        <label className="form-label">Confirmar Nueva Contraseña</label>
                        <div className="input-group">
                          <input
                            type={passwordState.showConfirm ? 'text' : 'password'}
                            className="form-control"
                            value={passwordState.confirm}
                            onChange={(e) => handlePasswordChange('confirm', e.target.value)}
                            placeholder="Confirma tu nueva contraseña"
                          />
                          <button
                            type="button"
                            className="btn btn-outline-secondary"
                            onClick={() => togglePasswordVisibility('confirm')}
                          >
                            {passwordState.showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                          </button>
        </div>
      </div>
                    </Col>
                  </Row>

                  <OptimizedButton
                    variant="primary"
                    onClick={() => {/* Implementar cambio de contraseña */}}
                    disabled={!passwordState.current || !passwordState.new || passwordState.new !== passwordState.confirm}
                  >
                    <Lock size={16} className="me-2" />
                    Cambiar Contraseña
                  </OptimizedButton>
                </Tab.Pane>

                {/* Google Calendar */}
                <Tab.Pane eventKey="google" active={uiState.activeTab === 'google'}>
                  <div className="mb-4">
                    <h6 className="mb-3">
                      <Calendar size={20} className="me-2" />
                      Configuración de Google Calendar
                    </h6>
                    <p className="text-muted">
                      Conecta tu cuenta de Google para sincronizar automáticamente tus citas con Google Calendar.
                    </p>
                  </div>

                  <Row>
                    <Col md={6}>
                      <Card className="mb-3">
                        <Card.Header>
                          <h6 className="mb-0">
                            <Settings size={16} className="me-2" />
                            Conexión con Google
                          </h6>
                        </Card.Header>
                        <Card.Body>
                          <GoogleAuth 
                            variant="connect"
                            onSuccess={(user) => {
                              console.log('Google connected:', user);
                              // Recargar el perfil para obtener la información actualizada
                              loadProfile();
                            }}
                            onError={(error) => {
                              console.error('Google auth error:', error);
                            }}
                          />
                        </Card.Body>
                      </Card>
                    </Col>

                    <Col md={6}>
                      <Card className="mb-3">
                        <Card.Header>
                          <h6 className="mb-0">
                            <RefreshCw size={16} className="me-2" />
                            Sincronización
                          </h6>
                        </Card.Header>
                        <Card.Body>
                          <GoogleCalendarConfig 
                            onConfigChange={(config) => {
                              console.log('Calendar config changed:', config);
                            }}
                          />
                        </Card.Body>
                      </Card>
                    </Col>
                  </Row>

                  <Row>
                    <Col md={12}>
                      <Card>
                        <Card.Header>
                          <h6 className="mb-0">
                            <AlertCircle size={16} className="me-2" />
                            Información Importante
                          </h6>
                        </Card.Header>
                        <Card.Body>
                          <div className="alert alert-info">
                            <h6>¿Cómo funciona la sincronización?</h6>
                            <ul className="mb-0">
                              <li>Las citas creadas en Litam se sincronizan automáticamente con tu Google Calendar</li>
                              <li>Los recordatorios se configuran automáticamente (24h antes por email, 30min antes por popup)</li>
                              <li>Puedes sincronizar manualmente en cualquier momento</li>
                              <li>Los cambios en Google Calendar también se reflejan en Litam</li>
                            </ul>
                          </div>
                        </Card.Body>
                      </Card>
                    </Col>
                  </Row>
                </Tab.Pane>

                {/* Estadísticas */}
                <Tab.Pane eventKey="stats" active={uiState.activeTab === 'stats'}>
                  {statsDisplay && (
      <div className="row">
                      {statsDisplay.map((stat, index) => (
                        <div key={index} className="col-md-6 mb-3">
                          <Card>
                            <Card.Body>
                              <div className="d-flex align-items-center">
                                <div className={`text-${stat.color} me-3`}>
                                  <stat.icon size={24} />
              </div>
                                <div>
                                  <h6 className="mb-1">{stat.label}</h6>
                                  <h4 className="mb-0">{stat.value}</h4>
              </div>
            </div>
                            </Card.Body>
                          </Card>
              </div>
                      ))}
          </div>
                  )}
                </Tab.Pane>
              </Tab.Content>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Input oculto para subir imagen */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        style={{ display: 'none' }}
        onChange={handleImageSelect}
      />
    </Container>
  );
};

export default React.memo(ProfilePage); 