<<<<<<< HEAD
import React, { useState } from 'react';
import { User, Settings, Save, Camera, Phone, Mail, MapPin, Calendar, Award, Shield, Bell, Key } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

const ProfilePage: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'personal' | 'professional' | 'security' | 'notifications'>('personal');
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    first_name: user?.first_name || '',
    last_name: user?.last_name || '',
    email: user?.email || '',
    phone: '+52 555 123 4567',
    address: 'Av. Insurgentes Sur 1234, CDMX',
    specialty: 'Nutrición Clínica',
    license_number: 'NUT-2024-001',
    experience_years: '5',
    education: 'Licenciatura en Nutrición - UNAM',
    certifications: ['Nutrición Deportiva', 'Nutrición Clínica', 'Diabetes'],
    bio: 'Nutrióloga especializada en nutrición clínica y deportiva con más de 5 años de experiencia ayudando a pacientes a alcanzar sus objetivos de salud.'
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = () => {
    // Aquí iría la lógica para guardar en el backend
    console.log('Saving profile data:', formData);
    setIsEditing(false);
  };

  return (
    <div className="container-fluid py-4">
      {/* Header */}
      <div className="row mb-4">
        <div className="col-12">
          <h1 className="h2 mb-1">Mi Perfil</h1>
          <p className="text-muted">Gestiona tu información personal y profesional</p>
        </div>
      </div>

      <div className="row">
        {/* Profile Card */}
        <div className="col-md-4 mb-4">
          <div className="card border-0 shadow-sm">
            <div className="card-body text-center">
              <div className="position-relative d-inline-block mb-3">
                <div className="bg-primary bg-opacity-10 rounded-circle p-4 d-inline-flex">
                  <User size={48} className="text-primary" />
                </div>
                <button className="btn btn-sm btn-primary position-absolute bottom-0 end-0 rounded-circle">
                  <Camera size={16} />
                </button>
              </div>
              <h4 className="mb-1">{user?.first_name} {user?.last_name}</h4>
              <p className="text-muted mb-2">Nutrióloga Profesional</p>
              <p className="text-muted small mb-3">{user?.email}</p>
              <div className="d-flex justify-content-center gap-2">
                <span className="badge bg-success">Activo</span>
                <span className="badge bg-primary">Verificado</span>
              </div>
              
              <hr className="my-3" />
              
              <div className="row text-center">
                <div className="col-4">
                  <div className="h5 mb-0">45</div>
                  <small className="text-muted">Pacientes</small>
                </div>
                <div className="col-4">
                  <div className="h5 mb-0">128</div>
                  <small className="text-muted">Consultas</small>
                </div>
                <div className="col-4">
                  <div className="h5 mb-0">5</div>
                  <small className="text-muted">Años Exp.</small>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="card border-0 shadow-sm">
            <div className="card-header bg-white">
              <h6 className="mb-0">Acciones Rápidas</h6>
            </div>
            <div className="card-body">
              <div className="d-grid gap-2">
                <button className="btn btn-outline-primary btn-sm">
                  <Calendar size={16} className="me-2" />
                  Ver Agenda
                </button>
                <button className="btn btn-outline-success btn-sm">
                  <User size={16} className="me-2" />
                  Mis Pacientes
                </button>
                <button className="btn btn-outline-info btn-sm">
                  <Award size={16} className="me-2" />
                  Certificaciones
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="col-md-8">
          {/* Tabs */}
          <ul className="nav nav-pills mb-4">
            <li className="nav-item">
              <button 
                className={`nav-link ${activeTab === 'personal' ? 'active' : ''}`}
                onClick={() => setActiveTab('personal')}
              >
                <User size={18} className="me-2" />
                Información Personal
              </button>
            </li>
            <li className="nav-item">
              <button 
                className={`nav-link ${activeTab === 'professional' ? 'active' : ''}`}
                onClick={() => setActiveTab('professional')}
              >
                <Award size={18} className="me-2" />
                Información Profesional
              </button>
            </li>
            <li className="nav-item">
              <button 
                className={`nav-link ${activeTab === 'security' ? 'active' : ''}`}
                onClick={() => setActiveTab('security')}
              >
                <Shield size={18} className="me-2" />
                Seguridad
              </button>
            </li>
            <li className="nav-item">
              <button 
                className={`nav-link ${activeTab === 'notifications' ? 'active' : ''}`}
                onClick={() => setActiveTab('notifications')}
              >
                <Bell size={18} className="me-2" />
                Notificaciones
              </button>
            </li>
          </ul>

          {/* Tab Content */}
          <div className="card border-0 shadow-sm">
            <div className="card-header bg-white d-flex justify-content-between align-items-center">
              <h5 className="mb-0">
                {activeTab === 'personal' && 'Información Personal'}
                {activeTab === 'professional' && 'Información Profesional'}
                {activeTab === 'security' && 'Seguridad'}
                {activeTab === 'notifications' && 'Notificaciones'}
              </h5>
              {(activeTab === 'personal' || activeTab === 'professional') && (
                <button 
                  className="btn btn-outline-primary btn-sm"
                  onClick={() => setIsEditing(!isEditing)}
                >
                  <Settings size={16} className="me-1" />
                  {isEditing ? 'Cancelar' : 'Editar'}
                </button>
              )}
            </div>
            <div className="card-body">
              {/* Personal Information Tab */}
              {activeTab === 'personal' && (
                <form>
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Nombre</label>
                      <input
                        type="text"
                        name="first_name"
                        className="form-control"
                        value={formData.first_name}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                      />
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Apellidos</label>
                      <input
                        type="text"
                        name="last_name"
                        className="form-control"
                        value={formData.last_name}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                      />
                    </div>
                  </div>

                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label">
                        <Mail size={16} className="me-2" />
                        Correo Electrónico
                      </label>
                      <input
                        type="email"
                        name="email"
                        className="form-control"
                        value={formData.email}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                      />
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label">
                        <Phone size={16} className="me-2" />
                        Teléfono
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        className="form-control"
                        value={formData.phone}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                      />
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label">
                      <MapPin size={16} className="me-2" />
                      Dirección
                    </label>
                    <input
                      type="text"
                      name="address"
                      className="form-control"
                      value={formData.address}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                    />
                  </div>

                  {isEditing && (
                    <div className="d-flex justify-content-end gap-2">
                      <button 
                        type="button" 
                        className="btn btn-secondary"
                        onClick={() => setIsEditing(false)}
                      >
                        Cancelar
                      </button>
                      <button 
                        type="button" 
                        className="btn btn-primary"
                        onClick={handleSave}
                      >
                        <Save size={16} className="me-2" />
                        Guardar Cambios
                      </button>
                    </div>
                  )}
                </form>
              )}

              {/* Professional Information Tab */}
              {activeTab === 'professional' && (
                <form>
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Especialidad</label>
                      <input
                        type="text"
                        name="specialty"
                        className="form-control"
                        value={formData.specialty}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                      />
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Número de Cédula</label>
                      <input
                        type="text"
                        name="license_number"
                        className="form-control"
                        value={formData.license_number}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                      />
                    </div>
                  </div>

                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Años de Experiencia</label>
                      <input
                        type="number"
                        name="experience_years"
                        className="form-control"
                        value={formData.experience_years}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                      />
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Formación Académica</label>
                      <input
                        type="text"
                        name="education"
                        className="form-control"
                        value={formData.education}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                      />
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Certificaciones</label>
                    <div className="mb-2">
                      {formData.certifications.map((cert, index) => (
                        <span key={index} className="badge bg-primary me-2 mb-1">
                          {cert}
                        </span>
                      ))}
                    </div>
                    {isEditing && (
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Agregar nueva certificación"
                      />
                    )}
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Biografía Profesional</label>
                    <textarea
                      name="bio"
                      className="form-control"
                      rows={4}
                      value={formData.bio}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                    />
                  </div>

                  {isEditing && (
                    <div className="d-flex justify-content-end gap-2">
                      <button 
                        type="button" 
                        className="btn btn-secondary"
                        onClick={() => setIsEditing(false)}
                      >
                        Cancelar
                      </button>
                      <button 
                        type="button" 
                        className="btn btn-primary"
                        onClick={handleSave}
                      >
                        <Save size={16} className="me-2" />
                        Guardar Cambios
                      </button>
                    </div>
                  )}
                </form>
              )}

              {/* Security Tab */}
              {activeTab === 'security' && (
                <div>
                  <div className="row">
                    <div className="col-md-6 mb-4">
                      <div className="card">
                        <div className="card-body">
                          <h6 className="card-title">
                            <Key size={18} className="me-2" />
                            Cambiar Contraseña
                          </h6>
                          <form>
                            <div className="mb-3">
                              <label className="form-label">Contraseña Actual</label>
                              <input type="password" className="form-control" />
                            </div>
                            <div className="mb-3">
                              <label className="form-label">Nueva Contraseña</label>
                              <input type="password" className="form-control" />
                            </div>
                            <div className="mb-3">
                              <label className="form-label">Confirmar Nueva Contraseña</label>
                              <input type="password" className="form-control" />
                            </div>
                            <button type="submit" className="btn btn-primary">
                              Actualizar Contraseña
                            </button>
                          </form>
                        </div>
                      </div>
                    </div>
                    <div className="col-md-6 mb-4">
                      <div className="card">
                        <div className="card-body">
                          <h6 className="card-title">
                            <Shield size={18} className="me-2" />
                            Seguridad de la Cuenta
                          </h6>
                          <div className="mb-3">
                            <div className="form-check">
                              <input className="form-check-input" type="checkbox" id="twoFA" />
                              <label className="form-check-label" htmlFor="twoFA">
                                Autenticación de dos factores
                              </label>
                            </div>
                          </div>
                          <div className="mb-3">
                            <div className="form-check">
                              <input className="form-check-input" type="checkbox" id="loginAlerts" defaultChecked />
                              <label className="form-check-label" htmlFor="loginAlerts">
                                Alertas de inicio de sesión
                              </label>
                            </div>
                          </div>
                          <button className="btn btn-outline-primary">
                            Configurar Seguridad
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Notifications Tab */}
              {activeTab === 'notifications' && (
                <div>
                  <h6 className="mb-3">Preferencias de Notificaciones</h6>
                  <div className="row">
                    <div className="col-md-6">
                      <div className="card">
                        <div className="card-body">
                          <h6 className="card-title">Notificaciones de Citas</h6>
                          <div className="form-check">
                            <input className="form-check-input" type="checkbox" id="appointmentReminders" defaultChecked />
                            <label className="form-check-label" htmlFor="appointmentReminders">
                              Recordatorios de citas
                            </label>
                          </div>
                          <div className="form-check">
                            <input className="form-check-input" type="checkbox" id="appointmentChanges" defaultChecked />
                            <label className="form-check-label" htmlFor="appointmentChanges">
                              Cambios de citas
                            </label>
                          </div>
                          <div className="form-check">
                            <input className="form-check-input" type="checkbox" id="newAppointments" defaultChecked />
                            <label className="form-check-label" htmlFor="newAppointments">
                              Nuevas citas programadas
                            </label>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="card">
                        <div className="card-body">
                          <h6 className="card-title">Notificaciones del Sistema</h6>
                          <div className="form-check">
                            <input className="form-check-input" type="checkbox" id="systemUpdates" />
                            <label className="form-check-label" htmlFor="systemUpdates">
                              Actualizaciones del sistema
                            </label>
                          </div>
                          <div className="form-check">
                            <input className="form-check-input" type="checkbox" id="marketingEmails" />
                            <label className="form-check-label" htmlFor="marketingEmails">
                              Correos promocionales
                            </label>
                          </div>
                          <div className="form-check">
                            <input className="form-check-input" type="checkbox" id="weeklyReports" defaultChecked />
                            <label className="form-check-label" htmlFor="weeklyReports">
                              Reportes semanales
                            </label>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="d-flex justify-content-end mt-3">
                    <button className="btn btn-primary">
                      <Save size={16} className="me-2" />
                      Guardar Preferencias
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage; 
=======
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
                <div className="d-grid gap-2">
                  <OptimizedButton
                    onClick={toggleEditing}
                    variant="primary"
                  >
                    <Edit size={16} className="me-2" />
                    Editar Perfil
                  </OptimizedButton>
                  {profile?.role?.name === 'nutritionist' && (
                    <OptimizedButton
                      onClick={() => window.location.href = '/nutritionist-settings'}
                      variant="outline-primary"
                    >
                      <Settings size={16} className="me-2" />
                      Configuración Avanzada
                    </OptimizedButton>
                  )}
                </div>
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
>>>>>>> nutri/main
