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