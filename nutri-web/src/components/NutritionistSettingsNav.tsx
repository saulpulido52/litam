import React from 'react';
import { Button, Badge } from 'react-bootstrap';
import { Settings, User, Building, Calendar, Bell, Shield, CreditCard } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

interface NutritionistSettingsNavProps {
  onNavigate: (path: string) => void;
  activeTab?: string;
}

const NutritionistSettingsNav: React.FC<NutritionistSettingsNavProps> = ({ 
  onNavigate, 
  activeTab = 'professional' 
}) => {
  const { user } = useAuth();

  // Solo mostrar para nutricionistas
  if (user?.role?.name !== 'nutritionist') {
    return null;
  }

  const navItems = [
    {
      key: 'professional',
      label: 'Perfil Profesional',
      icon: User,
      description: 'Credenciales y experiencia'
    },
    {
      key: 'clinic',
      label: 'Consultorio',
      icon: Building,
      description: 'Información del consultorio'
    },
    {
      key: 'availability',
      label: 'Disponibilidad',
      icon: Calendar,
      description: 'Horarios y modalidades'
    },
    {
      key: 'notifications',
      label: 'Notificaciones',
      icon: Bell,
      description: 'Configuración de alertas'
    },
    {
      key: 'privacy',
      label: 'Privacidad',
      icon: Shield,
      description: 'Control de visibilidad'
    },
    {
      key: 'payments',
      label: 'Pagos',
      icon: CreditCard,
      description: 'Métodos de pago'
    }
  ];

  return (
    <div className="nutritionist-settings-nav">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div>
          <h6 className="mb-1">Configuración del Nutricionista</h6>
          <small className="text-muted">
            Gestiona tu perfil profesional y preferencias
          </small>
        </div>
        <Badge bg="primary" className="ms-2">
          Nutricionista
        </Badge>
      </div>

      <div className="nav-buttons">
        {navItems.map((item) => {
          const IconComponent = item.icon;
          return (
            <Button
              key={item.key}
              variant={activeTab === item.key ? 'primary' : 'outline-secondary'}
              size="sm"
              className="mb-2 me-2"
              onClick={() => onNavigate(`/nutritionist-settings?tab=${item.key}`)}
            >
              <IconComponent size={16} className="me-2" />
              {item.label}
            </Button>
          );
        })}
      </div>

      <div className="mt-3">
        <Button
          variant="outline-primary"
          size="sm"
          onClick={() => onNavigate('/nutritionist-settings')}
          className="w-100"
        >
          <Settings size={16} className="me-2" />
          Ir a Configuración Completa
        </Button>
      </div>
    </div>
  );
};

export default NutritionistSettingsNav; 