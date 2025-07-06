import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Form, Modal, Badge, Alert, Tab, Nav } from 'react-bootstrap';
import { 
  User, 
  Settings, 
  Save, 
  Edit, 
  Trash2, 
  Shield, 
  Bell, 
  BarChart3, 
  Heart, 
  Stethoscope, 
  Eye,
  EyeOff,
  Lock,
  Unlock,
  Award,
  TrendingUp,
  Users,
  Calendar,
  Star,
  Activity,
  Key,
  CheckCircle,
  AlertTriangle,
  MapPin
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useProfile } from '../hooks/useProfile';
import { useNavigate } from 'react-router-dom';

const ProfilePage: React.FC = () => {
  const { user, logout } = useAuth();
  const { 
    profile, 
    stats, 
    loading, 
    error, 
    updateProfile, 
    updatePassword, 
    updateNotificationSettings, 
    deleteAccount, 
    clearError,
    loadProfile,
    loadStats
  } = useProfile();
  
  const navigate = useNavigate();
  
  // Estados para diferentes secciones
  const [activeTab, setActiveTab] = useState<'personal' | 'professional' | 'clinic' | 'security' | 'notifications' | 'stats'>('personal');
  const [isEditing, setIsEditing] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  
  // Estados para formularios
  const [personalData, setPersonalData] = useState({
    first_name: '',
    last_name: '',
    phone: '',
    birth_date: '',
    age: '',
    gender: 'male' as 'male' | 'female' | 'other',
  });

  const [professionalData, setProfessionalData] = useState({
    license_number: '',
    specialties: [] as string[],
    experience_years: '',
    education: '',
    bio: '',
    professional_summary: '',
    offers_in_person: false,
    offers_online: false,
    is_available: false,
    clinic_name: '',
    clinic_phone: '',
    clinic_address: '',
    clinic_city: '',
    clinic_state: '',
    clinic_zip_code: '',
    clinic_country: '',
    latitude: '',
    longitude: '',
    clinic_notes: '',
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [notificationSettings, setNotificationSettings] = useState({
    email_notifications: true,
    push_notifications: true,
    appointment_reminders: true,
    new_patient_alerts: true,
    system_updates: true,
  });

  // Cargar datos del perfil
  useEffect(() => {
    if (user) {
      loadProfile();
      loadStats();
    }
  }, [user, loadProfile, loadStats]);

  // Actualizar datos del formulario cuando se carga el perfil
  useEffect(() => {
    if (profile) {
      setPersonalData({
        first_name: profile.first_name || '',
        last_name: profile.last_name || '',
        phone: profile.phone || '',
        birth_date: profile.birth_date || '',
        age: profile.age ? String(profile.age) : '',
        gender: profile.gender || 'male',
      });

      setProfessionalData({
        license_number: profile.license_number || '',
        specialties: profile.specialties || [],
        experience_years: profile.experience_years ? String(profile.experience_years) : '',
        education: profile.education || '',
        bio: profile.bio || '',
        professional_summary: profile.professional_summary || '',
        offers_in_person: profile.offers_in_person || false,
        offers_online: profile.offers_online || false,
        is_available: profile.is_available || false,
        clinic_name: profile.clinic_name || '',
        clinic_phone: profile.clinic_phone || '',
        clinic_address: profile.clinic_address || '',
        clinic_city: profile.clinic_city || '',
        clinic_state: profile.clinic_state || '',
        clinic_zip_code: profile.clinic_zip_code || '',
        clinic_country: profile.clinic_country || '',
        latitude: profile.latitude || '',
        longitude: profile.longitude || '',
        clinic_notes: profile.clinic_notes || '',
      });
    }
  }, [profile]);

  const handlePersonalChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setPersonalData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleProfessionalChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setProfessionalData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSpecialtyChange = (specialty: string, checked: boolean) => {
    setProfessionalData(prev => ({
      ...prev,
      specialties: checked 
        ? [...prev.specialties, specialty]
        : prev.specialties.filter(s => s !== specialty)
    }));
  };

  const handleSavePersonal = async () => {
    try {
      const dataToSend = {
        ...personalData,
        age: personalData.age ? Number(personalData.age) : undefined
      };
      await updateProfile(dataToSend);
      setIsEditing(false);
      setSuccessMessage('Información personal actualizada exitosamente');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (error) {
      console.error('Error al actualizar información personal:', error);
    }
  };

  const handleSaveProfessional = async () => {
    try {
      const dataToSend = {
        ...professionalData,
        experience_years: professionalData.experience_years ? Number(professionalData.experience_years) : undefined
      };
      await updateProfile(dataToSend);
      setIsEditing(false);
      setSuccessMessage('Información profesional actualizada exitosamente');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (error) {
      console.error('Error al actualizar información profesional:', error);
    }
  };

  const handlePasswordChange = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert('Las contraseñas no coinciden');
      return;
    }

    try {
      await updatePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });
      setShowPasswordModal(false);
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setSuccessMessage('Contraseña actualizada exitosamente');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (error) {
      console.error('Error al cambiar contraseña:', error);
    }
  };

  const handleNotificationChange = async (setting: string, value: boolean) => {
    try {
      const newSettings = { ...notificationSettings, [setting]: value };
      setNotificationSettings(newSettings);
      await updateNotificationSettings(newSettings);
      setSuccessMessage('Configuración de notificaciones actualizada');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (error) {
      console.error('Error al actualizar notificaciones:', error);
    }
  };

  const handleDeleteAccount = async () => {
    try {
      await deleteAccount(passwordData.currentPassword);
      logout();
      navigate('/login');
    } catch (error) {
      console.error('Error al eliminar cuenta:', error);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-MX', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getRoleDisplayName = (role: string) => {
    switch (role) {
      case 'nutritionist': return 'Nutriólogo';
      case 'patient': return 'Paciente';
      case 'admin': return 'Administrador';
      default: return role;
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'nutritionist': return <Stethoscope size={20} />;
      case 'patient': return <Heart size={20} />;
      case 'admin': return <Shield size={20} />;
      default: return <User size={20} />;
    }
  };

  const renderPersonalInfo = () => (
    <div className="profile-section">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h5><User className="me-2" /> Información Personal</h5>
        <Button 
          variant={isEditing ? "success" : "primary"} 
          size="sm"
          onClick={() => setIsEditing(!isEditing)}
        >
          {isEditing ? <Save size={16} className="me-1" /> : <Settings size={16} className="me-1" />}
          {isEditing ? 'Guardar' : 'Editar'}
        </Button>
      </div>

      <div className="row">
        <div className="col-md-6">
          <Form.Group className="mb-3">
            <Form.Label>Nombres</Form.Label>
            <Form.Control
              type="text"
              name="first_name"
              value={personalData.first_name}
              onChange={handlePersonalChange}
              disabled={!isEditing}
            />
          </Form.Group>
        </div>
        <div className="col-md-6">
          <Form.Group className="mb-3">
            <Form.Label>Apellidos</Form.Label>
            <Form.Control
              type="text"
              name="last_name"
              value={personalData.last_name}
              onChange={handlePersonalChange}
              disabled={!isEditing}
            />
          </Form.Group>
        </div>
      </div>

      <div className="row">
        <div className="col-md-6">
          <Form.Group className="mb-3">
            <Form.Label>Teléfono</Form.Label>
            <Form.Control
              type="tel"
              name="phone"
              value={personalData.phone}
              onChange={handlePersonalChange}
              disabled={!isEditing}
            />
          </Form.Group>
        </div>
        <div className="col-md-6">
          <Form.Group className="mb-3">
            <Form.Label>Género</Form.Label>
            <Form.Select
              name="gender"
              value={personalData.gender}
              onChange={handlePersonalChange}
              disabled={!isEditing}
            >
              <option value="male">Masculino</option>
              <option value="female">Femenino</option>
              <option value="other">Otro</option>
            </Form.Select>
          </Form.Group>
        </div>
      </div>

      <div className="row">
        <div className="col-md-6">
          <Form.Group className="mb-3">
            <Form.Label>Fecha de Nacimiento</Form.Label>
            <Form.Control
              type="date"
              name="birth_date"
              value={personalData.birth_date}
              onChange={handlePersonalChange}
              disabled={!isEditing}
            />
          </Form.Group>
        </div>
        <div className="col-md-6">
          <Form.Group className="mb-3">
            <Form.Label>Edad</Form.Label>
            <Form.Control
              type="number"
              name="age"
              value={personalData.age}
              onChange={handlePersonalChange}
              disabled={!isEditing}
            />
          </Form.Group>
        </div>
      </div>

      {isEditing && (
        <div className="d-flex justify-content-end gap-2">
          <Button variant="secondary" onClick={() => setIsEditing(false)}>
            Cancelar
          </Button>
          <Button variant="success" onClick={handleSavePersonal}>
            <Save size={16} className="me-1" />
            Guardar Cambios
          </Button>
        </div>
      )}
    </div>
  );

  const renderProfessionalInfo = () => {
    if (user?.role?.name !== 'nutritionist') return null;

    return (
      <div className="profile-section">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h5><Award className="me-2" /> Información Profesional</h5>
          <Button 
            variant={isEditing ? "success" : "primary"} 
            size="sm"
            onClick={() => setIsEditing(!isEditing)}
          >
            {isEditing ? <Save size={16} className="me-1" /> : <Settings size={16} className="me-1" />}
            {isEditing ? 'Guardar' : 'Editar'}
          </Button>
        </div>

        <div className="row">
          <div className="col-md-6">
            <Form.Group className="mb-3">
              <Form.Label>Número de Licencia</Form.Label>
              <Form.Control
                type="text"
                name="license_number"
                value={professionalData.license_number}
                onChange={handleProfessionalChange}
                disabled={!isEditing}
              />
            </Form.Group>
          </div>
          <div className="col-md-6">
            <Form.Group className="mb-3">
              <Form.Label>Años de Experiencia</Form.Label>
              <Form.Control
                type="number"
                name="experience_years"
                value={professionalData.experience_years}
                onChange={handleProfessionalChange}
                disabled={!isEditing}
              />
            </Form.Group>
          </div>
        </div>

        <Form.Group className="mb-3">
          <Form.Label>Especialidades</Form.Label>
          <div className="row">
            {['Nutrición Clínica', 'Nutrición Deportiva', 'Nutrición Pediátrica', 'Nutrición Geriátrica', 'Bariatría'].map(specialty => (
              <div key={specialty} className="col-md-4 mb-2">
                <Form.Check
                  type="checkbox"
                  id={`specialty-${specialty}`}
                  label={specialty}
                  checked={professionalData.specialties.includes(specialty)}
                  onChange={(e) => handleSpecialtyChange(specialty, e.target.checked)}
                  disabled={!isEditing}
                />
              </div>
            ))}
          </div>
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Educación</Form.Label>
          <Form.Control
            as="textarea"
            rows={3}
            name="education"
            value={professionalData.education}
            onChange={handleProfessionalChange}
            disabled={!isEditing}
            placeholder="Describe tu formación académica..."
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Biografía</Form.Label>
          <Form.Control
            as="textarea"
            rows={4}
            name="bio"
            value={professionalData.bio}
            onChange={handleProfessionalChange}
            disabled={!isEditing}
            placeholder="Cuéntanos sobre ti y tu experiencia..."
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Descripción Profesional Breve</Form.Label>
          <Form.Control
            as="textarea"
            rows={3}
            name="professional_summary"
            value={professionalData.professional_summary}
            onChange={handleProfessionalChange}
            disabled={!isEditing}
            placeholder="Descripción breve que verán los pacientes en la app móvil..."
            maxLength={300}
          />
          <Form.Text className="text-muted">
            Máximo 300 caracteres. Esta descripción aparecerá en la app móvil para que los pacientes te conozcan.
          </Form.Text>
        </Form.Group>

        {isEditing && (
          <div className="d-flex justify-content-end gap-2">
            <Button variant="secondary" onClick={() => setIsEditing(false)}>
              Cancelar
            </Button>
            <Button variant="success" onClick={handleSaveProfessional}>
              <Save size={16} className="me-1" />
              Guardar Cambios
            </Button>
          </div>
        )}
      </div>
    );
  };

  const renderClinicInfo = () => {
    if (user?.role?.name !== 'nutritionist') return null;

    return (
      <div className="profile-section">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h5><MapPin className="me-2" /> Información del Consultorio</h5>
          <Button 
            variant={isEditing ? "success" : "primary"} 
            size="sm"
            onClick={() => setIsEditing(!isEditing)}
          >
            {isEditing ? <Save size={16} className="me-1" /> : <Settings size={16} className="me-1" />}
            {isEditing ? 'Guardar' : 'Editar'}
          </Button>
        </div>

        <div className="row">
          <div className="col-md-6">
            <Form.Group className="mb-3">
              <Form.Label>Modalidad de Consulta</Form.Label>
              <div className="mt-2">
                <Form.Check
                  type="checkbox"
                  id="offers_in_person"
                  label="Consultas Presenciales"
                  checked={professionalData.offers_in_person}
                  onChange={(e) => handleProfessionalChange({
                    target: { name: 'offers_in_person', value: e.target.checked }
                  } as any)}
                  disabled={!isEditing}
                />
                <Form.Check
                  type="checkbox"
                  id="offers_online"
                  label="Consultas Online"
                  checked={professionalData.offers_online}
                  onChange={(e) => handleProfessionalChange({
                    target: { name: 'offers_online', value: e.target.checked }
                  } as any)}
                  disabled={!isEditing}
                />
              </div>
            </Form.Group>
          </div>
          <div className="col-md-6">
            <Form.Group className="mb-3">
              <Form.Label>Disponibilidad</Form.Label>
              <div className="mt-2">
                <Form.Check
                  type="checkbox"
                  id="is_available"
                  label="Disponible para nuevos pacientes"
                  checked={professionalData.is_available}
                  onChange={(e) => handleProfessionalChange({
                    target: { name: 'is_available', value: e.target.checked }
                  } as any)}
                  disabled={!isEditing}
                />
              </div>
            </Form.Group>
          </div>
        </div>

        <div className="row">
          <div className="col-md-6">
            <Form.Group className="mb-3">
              <Form.Label>Nombre del Consultorio</Form.Label>
              <Form.Control
                type="text"
                name="clinic_name"
                value={professionalData.clinic_name}
                onChange={handleProfessionalChange}
                disabled={!isEditing}
                placeholder="Nombre de tu consultorio o clínica..."
              />
            </Form.Group>
          </div>
          <div className="col-md-6">
            <Form.Group className="mb-3">
              <Form.Label>Teléfono del Consultorio</Form.Label>
              <Form.Control
                type="tel"
                name="clinic_phone"
                value={professionalData.clinic_phone}
                onChange={handleProfessionalChange}
                disabled={!isEditing}
                placeholder="Teléfono del consultorio..."
              />
            </Form.Group>
          </div>
        </div>

        <Form.Group className="mb-3">
          <Form.Label>Dirección Completa</Form.Label>
          <Form.Control
            as="textarea"
            rows={2}
            name="clinic_address"
            value={professionalData.clinic_address}
            onChange={handleProfessionalChange}
            disabled={!isEditing}
            placeholder="Dirección completa del consultorio..."
          />
        </Form.Group>

        <div className="row">
          <div className="col-md-4">
            <Form.Group className="mb-3">
              <Form.Label>Ciudad</Form.Label>
              <Form.Control
                type="text"
                name="clinic_city"
                value={professionalData.clinic_city}
                onChange={handleProfessionalChange}
                disabled={!isEditing}
                placeholder="Ciudad..."
              />
            </Form.Group>
          </div>
          <div className="col-md-4">
            <Form.Group className="mb-3">
              <Form.Label>Estado/Provincia</Form.Label>
              <Form.Control
                type="text"
                name="clinic_state"
                value={professionalData.clinic_state}
                onChange={handleProfessionalChange}
                disabled={!isEditing}
                placeholder="Estado o provincia..."
              />
            </Form.Group>
          </div>
          <div className="col-md-4">
            <Form.Group className="mb-3">
              <Form.Label>Código Postal</Form.Label>
              <Form.Control
                type="text"
                name="clinic_zip_code"
                value={professionalData.clinic_zip_code}
                onChange={handleProfessionalChange}
                disabled={!isEditing}
                placeholder="Código postal..."
              />
            </Form.Group>
          </div>
        </div>

        <div className="row">
          <div className="col-md-6">
            <Form.Group className="mb-3">
              <Form.Label>País</Form.Label>
              <Form.Control
                type="text"
                name="clinic_country"
                value={professionalData.clinic_country}
                onChange={handleProfessionalChange}
                disabled={!isEditing}
                placeholder="País..."
              />
            </Form.Group>
          </div>
          <div className="col-md-6">
            <Form.Group className="mb-3">
              <Form.Label>Coordenadas (Opcional)</Form.Label>
              <div className="row">
                <div className="col-6">
                  <Form.Control
                    type="number"
                    step="any"
                    name="latitude"
                    value={professionalData.latitude}
                    onChange={handleProfessionalChange}
                    disabled={!isEditing}
                    placeholder="Latitud..."
                  />
                </div>
                <div className="col-6">
                  <Form.Control
                    type="number"
                    step="any"
                    name="longitude"
                    value={professionalData.longitude}
                    onChange={handleProfessionalChange}
                    disabled={!isEditing}
                    placeholder="Longitud..."
                  />
                </div>
              </div>
              <Form.Text className="text-muted">
                Coordenadas para Google Maps. Puedes obtenerlas desde Google Maps.
              </Form.Text>
            </Form.Group>
          </div>
        </div>

        <Form.Group className="mb-3">
          <Form.Label>Notas del Consultorio</Form.Label>
          <Form.Control
            as="textarea"
            rows={3}
            name="clinic_notes"
            value={professionalData.clinic_notes}
            onChange={handleProfessionalChange}
            disabled={!isEditing}
            placeholder="Información adicional: estacionamiento, accesibilidad, instrucciones de llegada..."
          />
          <Form.Text className="text-muted">
            Información adicional que será útil para los pacientes (estacionamiento, accesibilidad, etc.)
          </Form.Text>
        </Form.Group>

        {isEditing && (
          <div className="d-flex justify-content-end gap-2">
            <Button variant="secondary" onClick={() => setIsEditing(false)}>
              Cancelar
            </Button>
            <Button variant="success" onClick={handleSaveProfessional}>
              <Save size={16} className="me-1" />
              Guardar Cambios
            </Button>
          </div>
        )}
      </div>
    );
  };

  const renderStats = () => (
    <div className="profile-section">
      <h5><TrendingUp className="me-2" /> Estadísticas</h5>
      
      {stats ? (
        <div className="row">
          <div className="col-md-4 mb-3">
            <div className="stat-card">
              <div className="stat-icon">
                <Users size={24} />
              </div>
              <div className="stat-content">
                <h3>{stats.total_patients}</h3>
                <p>Pacientes</p>
              </div>
            </div>
          </div>
          <div className="col-md-4 mb-3">
            <div className="stat-card">
              <div className="stat-icon">
                <Calendar size={24} />
              </div>
              <div className="stat-content">
                <h3>{stats.total_appointments}</h3>
                <p>Citas</p>
              </div>
            </div>
          </div>
          <div className="col-md-4 mb-3">
            <div className="stat-card">
              <div className="stat-icon">
                <Star size={24} />
              </div>
              <div className="stat-content">
                <h3>{stats.average_rating.toFixed(1)}</h3>
                <p>Calificación</p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <Alert variant="info">
          <Activity className="me-2" />
          Las estadísticas se cargarán pronto...
        </Alert>
      )}
    </div>
  );

  const renderSecurity = () => (
    <div className="profile-section">
      <h5><Shield className="me-2" /> Seguridad</h5>
      
      <div className="row">
        <div className="col-md-6">
          <div className="security-card">
            <h6>Cambiar Contraseña</h6>
            <p className="text-muted">Actualiza tu contraseña para mantener tu cuenta segura</p>
            <Button variant="primary" onClick={() => setShowPasswordModal(true)}>
              <Key size={16} className="me-1" />
              Cambiar Contraseña
            </Button>
          </div>
        </div>
        <div className="col-md-6">
          <div className="security-card danger">
            <h6>Eliminar Cuenta</h6>
            <p className="text-muted">Esta acción no se puede deshacer</p>
            <Button variant="danger" onClick={() => setShowDeleteModal(true)}>
              <Trash2 size={16} className="me-1" />
              Eliminar Cuenta
            </Button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderNotifications = () => (
    <div className="profile-section">
      <h5><Bell className="me-2" /> Configuración de Notificaciones</h5>
      
      <div className="notification-settings">
        {Object.entries(notificationSettings).map(([key, value]) => (
          <div key={key} className="notification-item">
            <div>
              <h6>{key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</h6>
              <small className="text-muted">
                {key === 'email_notifications' && 'Recibir notificaciones por email'}
                {key === 'push_notifications' && 'Recibir notificaciones push'}
                {key === 'appointment_reminders' && 'Recordatorios de citas'}
                {key === 'new_patient_alerts' && 'Alertas de nuevos pacientes'}
                {key === 'system_updates' && 'Actualizaciones del sistema'}
              </small>
            </div>
            <Form.Check
              type="switch"
              checked={value}
              onChange={(e) => handleNotificationChange(key, e.target.checked)}
            />
          </div>
        ))}
      </div>
    </div>
  );

  // Proteger acceso si no hay usuario autenticado
  if (!user) {
    return (
      <div className="container py-5 text-center">
        <div className="alert alert-danger" role="alert">
          <strong>Error:</strong> No hay usuario autenticado. Por favor, inicia sesión nuevamente.
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '400px' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Cargando...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid py-4">
      <div className="row">
        <div className="col-lg-3">
          {/* Perfil Card */}
          <div className="profile-card">
            <div className="profile-header">
              <div className="profile-avatar">
                <User size={48} />
              </div>
              <div className="profile-info">
                <h4>{profile?.first_name} {profile?.last_name}</h4>
                <p className="text-muted">{profile?.email}</p>
                <Badge bg="primary" className="d-flex align-items-center gap-1">
                  {getRoleIcon(user?.role?.name || 'user')}
                  {getRoleDisplayName(user?.role?.name || 'user')}
                </Badge>
              </div>
            </div>
            
            {profile?.created_at && (
              <div className="profile-meta">
                <small className="text-muted">
                  Miembro desde {formatDate(profile.created_at)}
                </small>
              </div>
            )}
          </div>

          {/* Navegación */}
          <div className="profile-nav">
            <Button
              variant={activeTab === 'personal' ? 'primary' : 'outline-secondary'}
              className="w-100 mb-2"
              onClick={() => setActiveTab('personal')}
            >
              <User size={16} className="me-2" />
              Personal
            </Button>
            {user?.role?.name === 'nutritionist' && (
              <>
                <Button
                  variant={activeTab === 'professional' ? 'primary' : 'outline-secondary'}
                  className="w-100 mb-2"
                  onClick={() => setActiveTab('professional')}
                >
                  <Award size={16} className="me-2" />
                  Profesional
                </Button>
                <Button
                  variant={activeTab === 'clinic' ? 'primary' : 'outline-secondary'}
                  className="w-100 mb-2"
                  onClick={() => setActiveTab('clinic')}
                >
                  <MapPin size={16} className="me-2" />
                  Consultorio
                </Button>
              </>
            )}
            <Button
              variant={activeTab === 'stats' ? 'primary' : 'outline-secondary'}
              className="w-100 mb-2"
              onClick={() => setActiveTab('stats')}
            >
              <TrendingUp size={16} className="me-2" />
              Estadísticas
            </Button>
            <Button
              variant={activeTab === 'notifications' ? 'primary' : 'outline-secondary'}
              className="w-100 mb-2"
              onClick={() => setActiveTab('notifications')}
            >
              <Bell size={16} className="me-2" />
              Notificaciones
            </Button>
            <Button
              variant={activeTab === 'security' ? 'primary' : 'outline-secondary'}
              className="w-100 mb-2"
              onClick={() => setActiveTab('security')}
            >
              <Shield size={16} className="me-2" />
              Seguridad
            </Button>
          </div>
        </div>

        <div className="col-lg-9">
          {/* Mensajes de éxito/error */}
          {successMessage && (
            <Alert variant="success" dismissible onClose={() => setSuccessMessage(null)}>
              <CheckCircle size={16} className="me-2" />
              {successMessage}
            </Alert>
          )}

          {error && (
            <Alert variant="danger" dismissible onClose={clearError}>
              <AlertTriangle size={16} className="me-2" />
              {error}
            </Alert>
          )}

          {/* Contenido de la pestaña activa */}
          <div className="profile-content">
            {activeTab === 'personal' && renderPersonalInfo()}
            {activeTab === 'professional' && renderProfessionalInfo()}
            {activeTab === 'clinic' && renderClinicInfo()}
            {activeTab === 'stats' && renderStats()}
            {activeTab === 'notifications' && renderNotifications()}
            {activeTab === 'security' && renderSecurity()}
          </div>
        </div>
      </div>

      {/* Modal de cambio de contraseña */}
      <Modal show={showPasswordModal} onHide={() => setShowPasswordModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>
            <Key className="me-2" />
            Cambiar Contraseña
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Contraseña Actual</Form.Label>
              <Form.Control
                type="password"
                value={passwordData.currentPassword}
                onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
                placeholder="Ingresa tu contraseña actual"
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Nueva Contraseña</Form.Label>
              <Form.Control
                type="password"
                value={passwordData.newPassword}
                onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                placeholder="Ingresa tu nueva contraseña"
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Confirmar Nueva Contraseña</Form.Label>
              <Form.Control
                type="password"
                value={passwordData.confirmPassword}
                onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                placeholder="Confirma tu nueva contraseña"
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowPasswordModal(false)}>
            Cancelar
          </Button>
          <Button variant="primary" onClick={handlePasswordChange}>
            <Save size={16} className="me-1" />
            Cambiar Contraseña
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Modal de eliminación de cuenta */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>
            <AlertTriangle className="me-2 text-danger" />
            Eliminar Cuenta
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Alert variant="danger">
            <strong>¡Advertencia!</strong> Esta acción no se puede deshacer. 
            Se eliminarán todos tus datos permanentemente.
          </Alert>
          <Form.Group className="mb-3">
            <Form.Label>Contraseña de Confirmación</Form.Label>
            <Form.Control
              type="password"
              value={passwordData.currentPassword}
              onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
              placeholder="Ingresa tu contraseña para confirmar"
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Cancelar
          </Button>
          <Button variant="danger" onClick={handleDeleteAccount}>
            <Trash2 size={16} className="me-1" />
            Eliminar Cuenta
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default ProfilePage; 