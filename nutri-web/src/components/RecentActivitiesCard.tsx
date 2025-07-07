import React from 'react';

// --- Iconos SVG (Componentes sin dependencias externas) ---
const ClockIcon = (props: any) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <circle cx="12" cy="12" r="10"></circle>
    <polyline points="12 6 12 12 16 14"></polyline>
  </svg>
);

const FileTextIcon = (props: any) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"></path>
    <path d="M14 2v4a2 2 0 0 0 2 2h4"></path>
    <path d="M10 9H8"></path>
    <path d="M16 13H8"></path>
    <path d="M16 17H8"></path>
  </svg>
);

const UsersIcon = (props: any) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
    <circle cx="9" cy="7" r="4"></circle>
    <path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
    <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
  </svg>
);

const CalendarIcon = (props: any) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <rect width="18" height="18" x="3" y="4" rx="2" ry="2"></rect>
    <line x1="16" x2="16" y1="2" y2="6"></line>
    <line x1="8" x2="8" y1="2" y2="6"></line>
    <line x1="3" x2="21" y1="10" y2="10"></line>
  </svg>
);

const TrendingUpIcon = (props: any) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <polyline points="22,7 13.5,15.5 8.5,10.5 2,17"></polyline>
    <polyline points="16,7 22,7 22,13"></polyline>
  </svg>
);

const MessageCircleIcon = (props: any) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
  </svg>
);

interface Activity {
  type: string;
  description: string;
  time: string;
  patient_name?: string;
  consultation_reason?: string;
}

interface RecentActivitiesCardProps {
  activities: Activity[];
  title?: string;
  onViewAll?: () => void;
}

const RecentActivitiesCard: React.FC<RecentActivitiesCardProps> = ({ 
  activities, 
  title = "Actividades Recientes",
  onViewAll 
}) => {
  // Mapa de configuración para los tipos de actividad
  const activityConfig: { [key: string]: { icon: React.ReactElement; className: string; ariaLabel: string } } = {
    clinical_record: { 
      icon: <FileTextIcon className="icon" aria-hidden="true" />, 
      className: 'icon-info',
      ariaLabel: 'Expediente clínico'
    },
    patient: { 
      icon: <UsersIcon className="icon" aria-hidden="true" />, 
      className: 'icon-success',
      ariaLabel: 'Paciente'
    },
    appointment: { 
      icon: <CalendarIcon className="icon" aria-hidden="true" />, 
      className: 'icon-warning',
      ariaLabel: 'Cita'
    },
    progress: { 
      icon: <TrendingUpIcon className="icon" aria-hidden="true" />, 
      className: 'icon-primary',
      ariaLabel: 'Progreso'
    },
    message: { 
      icon: <MessageCircleIcon className="icon" aria-hidden="true" />, 
      className: 'icon-secondary',
      ariaLabel: 'Mensaje'
    },
    default: { 
      icon: <FileTextIcon className="icon" aria-hidden="true" />, 
      className: 'icon-default',
      ariaLabel: 'Actividad'
    },
  };

  return (
    <div className="activity-card" role="region" aria-label={title}>
      {/* Encabezado de la tarjeta */}
      <div className="activity-card-header">
        <ClockIcon className="header-icon" aria-hidden="true" />
        <h5 className="header-title">{title}</h5>
      </div>
      
      {/* Cuerpo con la lista de actividades */}
      <div className="activity-card-body">
        {(!activities || activities.length === 0) ? (
          <div className="empty-state" role="status" aria-live="polite">
            <p>No hay actividades recientes para mostrar.</p>
          </div>
        ) : (
          <ul className="activity-list" role="list" aria-label="Lista de actividades recientes">
            {activities.slice(0, 5).map((activity, index) => {
              const config = activityConfig[activity.type] || activityConfig.default;
              return (
                <li key={index} className="activity-item" role="listitem">
                  <div className="timeline-connector">
                    <div className={`activity-icon-wrapper ${config.className}`} aria-label={config.ariaLabel}>
                      {config.icon}
                    </div>
                  </div>
                  <div className="activity-content">
                    <p className="activity-description">{activity.description}</p>
                    <time className="activity-time" dateTime={activity.time}>{activity.time}</time>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
      
      {activities && activities.length > 0 && (
        <div className="activity-card-footer">
          <button 
            className="footer-link" 
            onClick={onViewAll}
            type="button"
            aria-label="Ver todas las actividades"
            title="Ver todas las actividades"
          >
            Ver todas las actividades
          </button>
        </div>
      )}
    </div>
  );
};

export default RecentActivitiesCard; 