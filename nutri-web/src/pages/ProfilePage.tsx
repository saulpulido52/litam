import React, { useState, useRef, useEffect } from 'react';
import { useProfile } from '../hooks/useProfile';
import { Spinner, Alert } from 'react-bootstrap';
import {
  Camera, Edit, MapPin, Phone, Mail, Globe,
  Award, CheckCircle, Calendar, Star, Users,
  Clock, Share2, Shield
} from 'lucide-react';
import '../styles/profile-scoped.css';
import EditProfileModal from '../components/EditProfileModal';
import type { ProfileData } from '../services/profileService';

const ProfilePage: React.FC = () => {
  const {
    profile,
    stats,
    loading,
    error,
    updateProfile,
    uploadProfileImage,
    loadProfile,
    loadStats
  } = useProfile();

  useEffect(() => {
    loadProfile();
    loadStats();
  }, [loadProfile, loadStats]);

  const [isEditing, setIsEditing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      try {
        await uploadProfileImage(e.target.files[0]);
      } catch (err) {
        console.error('Error uploading image', err);
      }
    }
  };

  const handleSaveProfile = async (data: Partial<ProfileData>) => {
    await updateProfile(data);
  };

  if (loading && !profile) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '60vh' }}>
        <Spinner animation="border" style={{ color: '#2c7a7b' }} />
      </div>
    );
  }

  // Safe access to profile data
  const fullName = profile ? `${profile.first_name} ${profile.last_name}` : 'Usuario';
  const role = profile?.role === 'nutritionist' ? 'Nutriólogo Clínico & Deportivo' : 'Profesional de la Salud';
  const email = profile?.email || 'Sin email registrado';
  const phone = profile?.phone || 'Sin teléfono registrado';

  // Safe stats
  const patientCount = stats?.total_patients || 0;
  const experienceYears = profile?.years_of_experience || 0;
  const rating = 4.9; // Mock datum
  const todayAppointments = 5; // Mock datum

  return (
    <div className="profile-page-container">
      {/* Offline Banner if needed */}
      {(!profile?.id) && (
        <Alert variant="warning" className="m-3 text-center border-0 shadow-sm">
          <Globe size={16} className="me-2" />
          Modo Offline: Visualizando datos de ejemplo.
        </Alert>
      )}

      {/* Edit Modal */}
      <EditProfileModal
        show={isEditing}
        onHide={() => setIsEditing(false)}
        profile={profile}
        onSave={handleSaveProfile}
      />

      <div className="bento-grid">
        {/* --- Header Section --- */}
        <div className="profile-header glass-card">
          <div className="header-content">
            <div className="position-relative">
              <img
                src={profile?.profile_image || '/default-avatar.png'}
                alt="Profile"
                className="profile-avatar-lg"
              />
              <button
                className="profile-avatar-badge border-0"
                onClick={handleImageClick}
                style={{
                  position: 'absolute',
                  bottom: '10px',
                  right: '10px',
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  background: '#2c7a7b',
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                }}
              >
                <Camera size={18} />
              </button>
            </div>

            <div className="profile-info flex-grow-1">
              <h1>{fullName} <CheckCircle size={28} className="text-primary ms-2" fill="#e6fffa" /></h1>
              <div className="profile-title">
                <Award size={20} />
                {role}
                <span className="verified-badge ms-3">
                  <Shield size={14} /> Cédula Verificada
                </span>
              </div>
              <p className="text-secondary mb-0">
                <MapPin size={16} className="me-1" /> Ciudad de México, MX •
                <span className="text-success ms-2">● Disponible Hoy</span>
              </p>
            </div>

            <div className="header-actions d-flex gap-2">
              <button className="btn-edit" onClick={() => setIsEditing(!isEditing)}>
                <Edit size={18} /> Editar Perfil
              </button>
              <button className="btn-secondary-action">
                <Share2 size={18} />
              </button>
            </div>
          </div>
        </div>

        {/* --- Stats Row --- */}
        <div className="stats-row">
          <div className="stat-card">
            <div className="stat-icon"><Users /></div>
            <div>
              <div className="stat-value">{patientCount}+</div>
              <div className="stat-label">Pacientes Activos</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon"><Calendar /></div>
            <div>
              <div className="stat-value">{experienceYears}</div>
              <div className="stat-label">Años Experiencia</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon"><Star /></div>
            <div>
              <div className="stat-value">{rating}</div>
              <div className="stat-label">Valoración (500+)</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon"><Clock /></div>
            <div>
              <div className="stat-value">{todayAppointments}</div>
              <div className="stat-label">Citas Hoy</div>
            </div>
          </div>
        </div>

        {/* --- Sidebar Column --- */}
        <div className="col-sidebar">
          {/* Contact Info */}
          <div className="section-card">
            <h3 className="section-title">Información de Contacto</h3>
            <div className="contact-item">
              <Phone size={20} className="contact-icon" />
              <div>
                <small className="d-block text-muted">Teléfono</small>
                <strong>{phone}</strong>
              </div>
            </div>
            <div className="contact-item">
              <Mail size={20} className="contact-icon" />
              <div>
                <small className="d-block text-muted">Email</small>
                <strong>{email}</strong>
              </div>
            </div>
            {/* Website currently not in backend schema
            <div className="contact-item">
              <Globe size={20} className="contact-icon" />
              <div>
                <small className="d-block text-muted">Sitio Web</small>
                <strong>No registrado</strong>
              </div>
            </div>
            */}
          </div>

          {/* Specialties */}
          <div className="section-card">
            <h3 className="section-title">Especialidades</h3>
            <div className="tag-cloud">
              {profile?.specialties && profile.specialties.length > 0 ? (
                profile.specialties.map((spec: string, index: number) => (
                  <span key={index} className="tag">{spec}</span>
                ))
              ) : (
                <span className="text-muted small">Sin especialidades registradas</span>
              )}
            </div>
          </div>

          {/* Certifications */}
          <div className="section-card">
            <h3 className="section-title">Certificaciones</h3>
            <div className="d-flex flex-column gap-3">
              {profile?.certifications && profile.certifications.length > 0 ? (
                profile.certifications.map((cert: string, index: number) => (
                  <div key={index} className="d-flex align-items-center gap-3">
                    <div style={{ background: '#ebf8ff', padding: '10px', borderRadius: '10px' }}>
                      <Award size={24} color="#2b6cb0" />
                    </div>
                    <div>
                      <div className="fw-bold">{cert}</div>
                      <div className="text-muted small">Verificado</div>
                    </div>
                  </div>
                ))
              ) : (
                <span className="text-muted small">Sin certificaciones registradas</span>
              )}
            </div>
          </div>
        </div>

        {/* --- Main Content Column --- */}
        <div className="col-main">
          {/* Bio */}
          <div className="section-card">
            <h3 className="section-title">Sobre Mí</h3>
            <p className="text-secondary" style={{ lineHeight: '1.8', whiteSpace: 'pre-line' }}>
              {profile?.bio || 'Agrega una biografía profesional para que tus pacientes te conozcan mejor.'}
            </p>
          </div>

          <div className="row">
            {/* Consultorio */}
            <div className="col-lg-6">
              <div className="section-card h-100">
                <h3 className="section-title">Consultorio</h3>
                <p className="mb-1"><strong>{profile?.clinic_name || 'Nombre del Consultorio'}</strong></p>
                <p className="text-muted mb-3">
                  {profile?.clinic_address || 'Dirección no registrada'}
                  {profile?.clinic_city ? `, ${profile.clinic_city}` : ''}
                </p>

                {/* Visual Map Placeholder */}
                <div style={{
                  height: '120px',
                  background: '#e2e8f0',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#718096',
                  marginBottom: '1rem'
                }}>
                  <MapPin size={32} className="mb-2" />
                  <span className="ms-2">Ver en Mapa</span>
                </div>

                {/* Price Display */}
                <div className="mt-3 p-3 bg-light rounded d-flex align-items-center justify-content-between">
                  <div className="d-flex align-items-center gap-2">
                    <div className="bg-white p-2 rounded-circle shadow-sm">
                      <span className="fw-bold text-success">$</span>
                    </div>
                    <span className="text-muted">Costo Consulta</span>
                  </div>
                  <span className="fw-bold fs-5 text-dark">
                    {profile?.consultation_fee ? `$${profile.consultation_fee}` : 'No definido'}
                  </span>
                </div>
              </div>
            </div>

            {/* Schedule */}
            <div className="col-lg-6">
              <div className="section-card h-100">
                <h3 className="section-title">Horarios de Atención</h3>

                {profile?.nutritionist_availabilities && profile.nutritionist_availabilities.length > 0 ? (
                  <div className="schedule-list">
                    {/* Helper to group and sort schedule */}
                    {(() => {
                      const daysOrder = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'];
                      const dayNames: { [key: string]: string } = {
                        'MONDAY': 'Lun', 'TUESDAY': 'Mar', 'WEDNESDAY': 'Mié',
                        'THURSDAY': 'Jue', 'FRIDAY': 'Vie', 'SATURDAY': 'Sáb', 'SUNDAY': 'Dom'
                      };

                      const formatTime = (mins: number) => {
                        const h = Math.floor(mins / 60);
                        const m = mins % 60;
                        return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
                      };

                      // Group by day
                      const grouped: { [key: string]: string[] } = {};
                      profile.nutritionist_availabilities.forEach(slot => {
                        if (!slot.is_active) return;
                        if (!grouped[slot.day_of_week]) grouped[slot.day_of_week] = [];
                        grouped[slot.day_of_week].push(`${formatTime(slot.start_time_minutes)} - ${formatTime(slot.end_time_minutes)}`);
                      });

                      return daysOrder.map(day => {
                        if (!grouped[day]) return null;
                        return (
                          <div key={day} className="d-flex justify-content-between border-bottom py-2">
                            <span className="fw-bold text-muted" style={{ width: '50px' }}>{dayNames[day]}</span>
                            <div className="d-flex flex-column align-items-end text-dark">
                              {grouped[day].map((time, idx) => <span key={idx} className="small">{time}</span>)}
                            </div>
                          </div>
                        );
                      });
                    })()}
                    <div className="mt-3 text-center">
                      <a href="/calendar" className="btn btn-sm btn-outline-primary rounded-pill px-4">
                        Gestionar Disponibilidad
                      </a>
                    </div>
                  </div>
                ) : (
                  <div className="text-center p-4">
                    <Calendar size={48} className="text-muted mb-3" />
                    <p className="text-muted">
                      No tienes horarios configurados. Ve al calendario para abrir tu disponibilidad.
                    </p>
                    <a href="/calendar" className="btn btn-outline-primary btn-sm">
                      Ir al Calendario
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Hidden File Input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        style={{ display: 'none' }}
        accept="image/*"
      />
    </div>
  );
};

export default React.memo(ProfilePage);