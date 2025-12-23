import React from 'react';
import { 
  Calendar, 
  Clock,
  Edit,
  Copy,
  Download,
  PlayCircle,
  Trash2,
  CheckCircle2,
  Archive,
  Users,
  Eye
} from 'lucide-react';
import type { DietPlan } from '../types/diet';

interface DietPlanCardProps {
  plan: DietPlan;
  onView: (plan: DietPlan) => void;
  onEdit: (plan: DietPlan) => void;
  onDelete: (planId: string) => void;
  onDuplicate: (plan: DietPlan) => void;
  onDownload: (plan: DietPlan) => void;
  onStatusChange?: (planId: string, status: string) => void;
  loading?: boolean;
}

const DietPlanCard: React.FC<DietPlanCardProps> = ({
  plan,
  onView,
  onEdit,
  onDelete,
  onDuplicate,
  onDownload,
  onStatusChange,
  loading = false
}) => {
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('es-ES', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      });
    } catch {
      return 'N/A';
    }
  };

  const getStatusConfig = (status: string) => {
    const configs = {
      draft: {
        badge: 'bg-secondary',
        icon: <Edit size={14} />,
        text: 'Borrador',
        bgColor: 'bg-light',
        borderColor: 'border-secondary'
      },
      active: {
        badge: 'bg-success',
        icon: <PlayCircle size={14} />,
        text: 'Activo',
        bgColor: 'bg-success-subtle',
        borderColor: 'border-success'
      },
      completed: {
        badge: 'bg-primary',
        icon: <CheckCircle2 size={14} />,
        text: 'Completado',
        bgColor: 'bg-primary-subtle',
        borderColor: 'border-primary'
      },
      cancelled: {
        badge: 'bg-danger',
        icon: <Archive size={14} />,
        text: 'Cancelado',
        bgColor: 'bg-danger-subtle',
        borderColor: 'border-danger'
      }};
    return configs[status as keyof typeof configs] || configs.draft;
  };

  const getPatientName = () => {
    if (plan.patient?.user) {
      return `${plan.patient.user.first_name} ${plan.patient.user.last_name || ''}`.trim();
    }
    return 'Paciente no especificado';
  };

  const calculateDaysRemaining = () => {
    if (!plan.end_date) return null;
    const today = new Date();
    const endDate = new Date(plan.end_date);
    const diffTime = endDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getDurationText = () => {
    if (plan.start_date && plan.end_date) {
      const start = new Date(plan.start_date);
      const end = new Date(plan.end_date);
      const diffTime = end.getTime() - start.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      const weeks = Math.ceil(diffDays / 7);
      
      if (weeks === 1) return '1 semana';
      if (weeks < 4) return `${weeks} semanas`;
      const months = Math.ceil(weeks / 4);
      return `${months} mes${months > 1 ? 'es' : ''}`;
    }
    return 'Duración no especificada';
  };

  const statusConfig = getStatusConfig(plan.status);
  const daysRemaining = calculateDaysRemaining();

  return (
    <div className={`card h-100 shadow-sm border-2 ${statusConfig.borderColor} ${statusConfig.bgColor}`}>
      {/* Header con estado y paciente */}
      <div className="card-header d-flex justify-content-between align-items-center py-2">
        <div className="d-flex align-items-center">
          <span className={`badge ${statusConfig.badge} d-flex align-items-center gap-1`}>
            {statusConfig.icon}
            {statusConfig.text}
          </span>
          {daysRemaining !== null && plan.status === 'active' && (
            <span className={`badge ms-2 ${daysRemaining <= 3 ? 'bg-warning' : 'bg-info'}`}>
              {daysRemaining > 0 ? `${daysRemaining} días restantes` : 'Vencido'}
            </span>
          )}
        </div>
        <div className="d-flex align-items-center text-muted">
          <Users size={14} className="me-1" />
          <small>{getPatientName()}</small>
        </div>
      </div>

      <div className="card-body">
        {/* Título del plan */}
        <h6 className="card-title mb-2 fw-bold text-truncate" title={plan.name}>
          {plan.name}
        </h6>

        {/* Descripción si existe */}
        {plan.description && (
          <p className="card-text text-muted small mb-3" style={{ fontSize: '0.875rem' }}>
            {plan.description.length > 80 
              ? `${plan.description.substring(0, 80)}...` 
              : plan.description
            }
          </p>
        )}

        {/* Información nutricional */}
        <div className="row g-2 mb-3">
          <div className="col-4">
            <div className="text-center p-2 bg-white rounded border">
              <div className="fw-bold text-primary" style={{ fontSize: '1.1rem' }}>
                {plan.target_calories || 0}
              </div>
              <small className="text-muted">kcal</small>
            </div>
          </div>
          <div className="col-4">
            <div className="text-center p-2 bg-white rounded border">
              <div className="fw-bold text-success" style={{ fontSize: '1.1rem' }}>
                {plan.target_protein || 0}g
              </div>
              <small className="text-muted">Proteína</small>
            </div>
          </div>
          <div className="col-4">
            <div className="text-center p-2 bg-white rounded border">
              <div className="fw-bold text-info" style={{ fontSize: '1.1rem' }}>
                {plan.total_weeks || 1}
              </div>
              <small className="text-muted">{plan.total_weeks === 1 ? 'semana' : 'semanas'}</small>
            </div>
          </div>
        </div>

        {/* Fechas */}
        <div className="d-flex justify-content-between text-muted small mb-3">
          <div className="d-flex align-items-center">
            <Calendar size={12} className="me-1" />
            <span>Inicio: {formatDate(plan.start_date)}</span>
          </div>
          <div className="d-flex align-items-center">
            <Clock size={12} className="me-1" />
            <span>{getDurationText()}</span>
          </div>
        </div>

        {/* Macronutrientes si están disponibles */}
        {(plan.target_carbs || plan.target_fats) && (
          <div className="row g-1 mb-3">
            <div className="col-6">
              <small className="text-muted">Carbos: <strong>{plan.target_carbs || 0}g</strong></small>
            </div>
            <div className="col-6">
              <small className="text-muted">Grasas: <strong>{plan.target_fats || 0}g</strong></small>
            </div>
          </div>
        )}
      </div>

      {/* Botones de acción */}
      <div className="card-footer bg-transparent border-0 pt-0">
        <div className="row g-1">
          {/* Botones principales */}
          <div className="col-6">
            <button
              className="btn btn-outline-primary btn-sm w-100"
              onClick={() => onView(plan)}
              title="Ver detalles"
            >
              <Eye size={14} className="me-1" />
              Ver
            </button>
          </div>
          <div className="col-6">
            <button
              className="btn btn-outline-secondary btn-sm w-100"
              onClick={() => onEdit(plan)}
              title="Editar plan"
            >
              <Edit size={14} className="me-1" />
              Editar
            </button>
          </div>
          
          {/* Botones secundarios */}
          <div className="col-4">
            <button
              className="btn btn-outline-success btn-sm w-100"
              onClick={() => onDuplicate(plan)}
              title="Duplicar plan"
            >
              <Copy size={14} />
            </button>
          </div>
          <div className="col-4">
            <button
              className="btn btn-outline-info btn-sm w-100"
              onClick={() => onDownload(plan)}
              title="Descargar PDF"
            >
              <Download size={14} />
            </button>
          </div>
          <div className="col-4">
            <button
              className="btn btn-outline-danger btn-sm w-100"
              onClick={() => onDelete(plan.id)}
              title="Eliminar plan"
              disabled={loading}
            >
              <Trash2 size={14} />
            </button>
          </div>
        </div>

        {/* Botones de cambio de estado si está disponible */}
        {onStatusChange && plan.status !== 'completed' && (
          <div className="mt-2">
            <div className="btn-group w-100" role="group">
              {plan.status === 'draft' && (
                <button
                  className="btn btn-success btn-sm"
                  onClick={() => onStatusChange(plan.id, 'active')}
                  disabled={loading}
                >
                  <PlayCircle size={12} className="me-1" />
                  Activar
                </button>
              )}
                             {plan.status === 'active' && (
                 <button
                   className="btn btn-primary btn-sm"
                   onClick={() => onStatusChange(plan.id, 'completed')}
                   disabled={loading}
                 >
                   <CheckCircle2 size={12} className="me-1" />
                   Completar
                 </button>
               )}
            </div>
          </div>
        )}
      </div>

      {/* Indicador de carga */}
      {loading && (
        <div className="position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center bg-white bg-opacity-75 rounded">
          <div className="spinner-border spinner-border-sm text-primary" />
        </div>
      )}
    </div>
  );
};

export default DietPlanCard; 