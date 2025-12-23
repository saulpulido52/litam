import React from 'react';
import { CheckCircle, CalendarDays, AlertCircle } from 'lucide-react';

interface StatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  appointmentId: string;
  patientName: string;
  onStatusChange: (appointmentId: string, status: 'scheduled' | 'completed' | 'cancelled_by_patient' | 'cancelled_by_nutritionist' | 'rescheduled' | 'no_show') => Promise<void>;
  onReschedule?: (appointmentId: string) => void;
}

export const StatusModal: React.FC<StatusModalProps> = ({
  isOpen,
  onClose,
  appointmentId,
  patientName,
  onStatusChange,
  onReschedule
}) => {
  if (!isOpen) return null;

  const handleStatusClick = async (status: 'scheduled' | 'completed' | 'cancelled_by_patient' | 'cancelled_by_nutritionist' | 'rescheduled' | 'no_show') => {
    try {
      await onStatusChange(appointmentId, status);
      onClose();
    } catch (error) {
      console.error('Error changing status:', error);
    }
  };

  const handleRescheduleClick = () => {
    if (onReschedule) {
      onReschedule(appointmentId);
    }
    onClose();
  };

  return (
    <div 
      className="modal fade show d-block" 
      style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
      onClick={onClose}
    >
      <div 
        className="modal-dialog modal-sm" 
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-content">
          <div className="modal-header border-0 pb-0">
            <h6 className="modal-title">Cambiar Estado</h6>
            <button 
              type="button" 
              className="btn-close"
              onClick={onClose}
            ></button>
          </div>
          <div className="modal-body">
            <div className="mb-3">
              <small className="text-muted">Paciente:</small>
              <div className="fw-medium">{patientName}</div>
            </div>
            
            <div className="d-grid gap-2">
              <button
                className="btn btn-outline-success d-flex align-items-center justify-content-start"
                onClick={() => handleStatusClick('completed')}
              >
                <CheckCircle size={16} className="me-2" />
                Marcar como Completada
              </button>
              
              <button
                className="btn btn-outline-danger d-flex align-items-center justify-content-start"
                onClick={() => handleStatusClick('cancelled_by_nutritionist')}
              >
                <AlertCircle size={16} className="me-2" />
                Cancelar Cita
              </button>
              
              <button
                className="btn btn-outline-warning d-flex align-items-center justify-content-start"
                onClick={() => handleStatusClick('no_show')}
              >
                <AlertCircle size={16} className="me-2" />
                Marcar "No Asistió"
              </button>
              
              {onReschedule && (
                <button
                  className="btn btn-outline-primary d-flex align-items-center justify-content-start"
                  onClick={handleRescheduleClick}
                >
                  <CalendarDays size={16} className="me-2" />
                  Reagendar Cita
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatusModal; 