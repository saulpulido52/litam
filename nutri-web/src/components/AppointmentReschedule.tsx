import React, { useState, useMemo, useEffect } from 'react';
import { Calendar, Clock, Check, X, ChevronLeft, ChevronRight, Loader, RefreshCw, AlertTriangle } from 'lucide-react';
import { useAppointments } from '../hooks/useAppointments';
import { useAvailability } from '../hooks/useAvailability';
import type { AvailabilitySlot, AppointmentType } from '../services/appointmentsService';

interface AppointmentRescheduleProps {
  appointment: AppointmentType;
  onRescheduleComplete?: (appointment: AppointmentType) => void;
  onCancel?: () => void;
}

interface TimeSlot {
  time: string;
  minutes: number;
  isAvailable: boolean;
  isBooked: boolean;
  isCurrentSlot: boolean;
}

interface DaySchedule {
  date: Date;
  dayOfWeek: string;
  slots: TimeSlot[];
  hasAvailability: boolean;
}

const AppointmentReschedule: React.FC<AppointmentRescheduleProps> = ({
  appointment,
  onRescheduleComplete,
  onCancel
}) => {
  const { updateAppointmentStatus, loading: appointmentLoading } = useAppointments();
  const { searchNutritionistAvailability } = useAvailability();
  
  const [currentWeek, setCurrentWeek] = useState(() => {
    // Iniciar en la semana de la cita actual
    const appointmentDate = new Date(appointment.start_time);
    return appointmentDate;
  });
  
  const [availability, setAvailability] = useState<AvailabilitySlot[]>([]);
  const [existingAppointments, setExistingAppointments] = useState<AppointmentType[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<{ date: Date; time: string; minutes: number } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showConfirmation, setShowConfirmation] = useState(false);

  const daysOfWeek = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

  // Información de la cita actual
  const currentAppointmentDate = new Date(appointment.start_time);
  const currentAppointmentTime = currentAppointmentDate.toLocaleTimeString('es-ES', { 
    hour: '2-digit', 
    minute: '2-digit' 
  });

  // Obtener las fechas de la semana actual
  const weekDates = useMemo(() => {
    const startOfWeek = new Date(currentWeek);
    const day = startOfWeek.getDay();
    startOfWeek.setDate(currentWeek.getDate() - day);
    
    const dates = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);
      dates.push(date);
    }
    return dates;
  }, [currentWeek]);

  // Cargar disponibilidad y citas existentes
  useEffect(() => {
    loadAvailabilityData();
  }, [appointment.nutritionist_id, currentWeek]);

  const loadAvailabilityData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Cargar disponibilidad general del nutriólogo
      const availabilityData = await searchNutritionistAvailability(appointment.nutritionist_id || '');
      setAvailability(availabilityData);

      // TODO: Cargar citas existentes del nutriólogo para esta semana
      // Por ahora simulamos con la cita actual
      setExistingAppointments([appointment]);

    } catch (err: any) {
      console.error('Error loading availability data:', err);
      setError(err.message || 'Error al cargar la disponibilidad');
    } finally {
      setLoading(false);
    }
  };

  // Convertir minutos a formato HH:MM
  const minutesToTime = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
  };

  // Convertir fecha a día de la semana en formato backend
  const getBackendDayOfWeek = (date: Date): string => {
    const days = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];
    return days[date.getDay()];
  };

  // Verificar si un slot es la cita actual
  const isCurrentAppointmentSlot = (date: Date, minutes: number): boolean => {
    const slotDate = date.toISOString().split('T')[0];
    const currentDate = currentAppointmentDate.toISOString().split('T')[0];
    const currentMinutes = currentAppointmentDate.getHours() * 60 + currentAppointmentDate.getMinutes();
    
    return slotDate === currentDate && minutes === currentMinutes;
  };

  // Generar horarios disponibles para un día específico
  const generateDaySchedule = (date: Date): DaySchedule => {
    const dayOfWeek = getBackendDayOfWeek(date);
    const dateStr = date.toISOString().split('T')[0];
    
    // Encontrar disponibilidad para este día
    const dayAvailability = availability.filter(slot => 
      slot.day_of_week === dayOfWeek && slot.is_active
    );

    const slots: TimeSlot[] = [];
    
    dayAvailability.forEach(availSlot => {
      // Generar slots de 30 minutos dentro del rango disponible
      for (let minutes = availSlot.start_time_minutes; minutes < availSlot.end_time_minutes; minutes += 30) {
        const time = minutesToTime(minutes);
        
        // Verificar si este slot está ocupado por una cita existente (excepto la actual)
        const slotStart = new Date(`${dateStr}T${time}:00`);
        const slotEnd = new Date(slotStart.getTime() + 30 * 60000); // 30 minutos después
        
        const isCurrentSlot = isCurrentAppointmentSlot(date, minutes);
        
        const isBooked = existingAppointments.some(apt => {
          if (apt.id === appointment.id) return false; // Excluir la cita actual
          
          const aptStart = new Date(apt.start_time);
          const aptEnd = new Date(apt.end_time);
          return (
            apt.status === 'scheduled' &&
            slotStart < aptEnd && slotEnd > aptStart
          );
        });

        // Solo mostrar slots futuros o la cita actual
        const isInFuture = slotStart > new Date() || isCurrentSlot;
        
        if (isInFuture) {
          slots.push({
            time,
            minutes,
            isAvailable: !isBooked,
            isBooked,
            isCurrentSlot
          });
        }
      }
    });

    // Ordenar slots por hora
    slots.sort((a, b) => a.minutes - b.minutes);

    return {
      date,
      dayOfWeek: daysOfWeek[date.getDay()],
      slots,
      hasAvailability: slots.some(slot => slot.isAvailable)
    };
  };

  // Generar schedule para toda la semana
  const weekSchedule = useMemo(() => {
    return weekDates.map(date => generateDaySchedule(date));
  }, [weekDates, availability, existingAppointments, appointment]);

  // Navegar semanas
  const navigateWeek = (direction: 'prev' | 'next') => {
    const newWeek = new Date(currentWeek);
    newWeek.setDate(currentWeek.getDate() + (direction === 'next' ? 7 : -7));
    setCurrentWeek(newWeek);
  };

  // Confirmar reagendación
  const handleConfirmReschedule = async () => {
    if (!selectedSlot) return;

    try {
      setLoading(true);
      setError(null);

      // Por ahora solo actualizamos el estado a "rescheduled"
      // En una implementación completa, habría un endpoint específico para reagendar
      await updateAppointmentStatus(appointment.id, {
        status: 'rescheduled',
        notes: `Reagendada para ${selectedSlot.date.toLocaleDateString('es-ES')} a las ${selectedSlot.time}`
      });

      if (onRescheduleComplete) {
        // Crear objeto actualizado
        const updatedAppointment: AppointmentType = {
          ...appointment,
          status: 'rescheduled',
          notes: `Reagendada para ${selectedSlot.date.toLocaleDateString('es-ES')} a las ${selectedSlot.time}`
        };
        onRescheduleComplete(updatedAppointment);
      }

    } catch (err: any) {
      console.error('Error rescheduling appointment:', err);
      setError(err.message || 'Error al reagendar la cita');
    } finally {
      setLoading(false);
      setShowConfirmation(false);
    }
  };

  return (
    <div className="appointment-reschedule">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h5 className="mb-1">
            <RefreshCw size={20} className="me-2" />
            Reagendar Cita
          </h5>
          <p className="text-muted small mb-0">
            Selecciona un nuevo horario para tu cita con {appointment.nutritionist?.first_name} {appointment.nutritionist?.last_name}
          </p>
        </div>
        {onCancel && (
          <button className="btn btn-sm btn-outline-secondary" onClick={onCancel}>
            <X size={16} className="me-1" />
            Cancelar
          </button>
        )}
      </div>

      {/* Current Appointment Info */}
      <div className="alert alert-info mb-4">
        <div className="d-flex align-items-center mb-2">
          <Clock size={16} className="me-2" />
          <strong>Cita Actual:</strong>
        </div>
        <div className="ms-4">
          <div>{currentAppointmentDate.toLocaleDateString('es-ES', { 
            weekday: 'long', 
            day: 'numeric', 
            month: 'long', 
            year: 'numeric' 
          })}</div>
          <div>Hora: {currentAppointmentTime}</div>
          {appointment.notes && <div>Notas: {appointment.notes}</div>}
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="alert alert-danger alert-dismissible fade show" role="alert">
          <AlertTriangle size={16} className="me-2" />
          {error}
          <button 
            type="button" 
            className="btn-close" 
            onClick={() => setError(null)}
            aria-label="Close"
          ></button>
        </div>
      )}

      {/* Week Navigation */}
      <div className="row mb-3">
        <div className="col-12">
          <div className="d-flex justify-content-between align-items-center">
            <button 
              className="btn btn-outline-secondary btn-sm"
              onClick={() => navigateWeek('prev')}
              disabled={loading}
            >
              <ChevronLeft size={16} />
            </button>
            
            <h6 className="mb-0">
              Semana del {weekDates[0].toLocaleDateString('es-ES')} al {weekDates[6].toLocaleDateString('es-ES')}
            </h6>
            
            <button 
              className="btn btn-outline-secondary btn-sm"
              onClick={() => navigateWeek('next')}
              disabled={loading}
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="text-center py-4">
          <Loader size={32} className="text-primary animate-spin mb-2" />
          <p className="text-muted">Cargando disponibilidad...</p>
        </div>
      )}

      {/* Weekly Schedule */}
      {!loading && (
        <div className="row">
          {weekSchedule.map((daySchedule, index) => (
            <div key={index} className="col-md-6 col-lg-4 mb-4">
              <div className="card border-0 shadow-sm">
                <div className="card-header bg-light">
                  <div className="text-center">
                    <h6 className="mb-0">{daySchedule.dayOfWeek}</h6>
                    <small className="text-muted">
                      {daySchedule.date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}
                    </small>
                  </div>
                </div>
                <div className="card-body p-2">
                  {daySchedule.slots.length === 0 ? (
                    <div className="text-center py-3">
                      <Calendar size={24} className="text-muted mb-2" />
                      <p className="text-muted small mb-0">Sin horarios disponibles</p>
                    </div>
                  ) : (
                    <div className="d-grid gap-1">
                      {daySchedule.slots.map((slot, slotIndex) => (
                        <button
                          key={slotIndex}
                          className={`btn btn-sm ${
                            selectedSlot?.date.getTime() === daySchedule.date.getTime() && 
                            selectedSlot?.time === slot.time
                              ? 'btn-primary'
                              : slot.isCurrentSlot
                                ? 'btn-warning'
                                : slot.isAvailable
                                  ? 'btn-outline-success'
                                  : 'btn-outline-secondary'
                          }`}
                          disabled={!slot.isAvailable || appointmentLoading}
                          onClick={() => {
                            if (!slot.isCurrentSlot) {
                              setSelectedSlot({
                                date: daySchedule.date,
                                time: slot.time,
                                minutes: slot.minutes
                              });
                            }
                          }}
                        >
                          <Clock size={12} className="me-1" />
                          {slot.time}
                          {slot.isCurrentSlot && (
                            <span className="ms-1">📍</span>
                          )}
                          {slot.isBooked && !slot.isCurrentSlot && (
                            <span className="ms-1 text-danger">●</span>
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Selection Summary */}
      {selectedSlot && (
        <div className="alert alert-success">
          <h6 className="mb-2">
            <Check size={16} className="me-2" />
            Nuevo Horario Seleccionado
          </h6>
          <div>
            <strong>Nueva fecha:</strong> {selectedSlot.date.toLocaleDateString('es-ES', {
              weekday: 'long',
              day: 'numeric',
              month: 'long'
            })} a las {selectedSlot.time}
          </div>
          <div className="mt-3">
            <button
              className="btn btn-success me-2"
              onClick={() => setShowConfirmation(true)}
              disabled={appointmentLoading}
            >
              <Check size={16} className="me-1" />
              Confirmar Reagendación
            </button>
            <button
              className="btn btn-outline-secondary"
              onClick={() => setSelectedSlot(null)}
              disabled={appointmentLoading}
            >
              Cancelar Selección
            </button>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {showConfirmation && selectedSlot && (
        <div className="modal fade show d-block" tabIndex={-1} style={{backgroundColor: 'rgba(0,0,0,0.5)'}}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Confirmar Reagendación</h5>
                <button 
                  type="button" 
                  className="btn-close" 
                  onClick={() => setShowConfirmation(false)}
                ></button>
              </div>
              <div className="modal-body">
                <div className="mb-3">
                  <strong>¿Estás seguro de que deseas reagendar tu cita?</strong>
                </div>
                
                <div className="row">
                  <div className="col-6">
                    <div className="card bg-light">
                      <div className="card-body">
                        <h6 className="card-title text-muted">Horario Actual</h6>
                        <div>{currentAppointmentDate.toLocaleDateString('es-ES', {
                          weekday: 'short',
                          day: 'numeric',
                          month: 'short'
                        })}</div>
                        <div>{currentAppointmentTime}</div>
                      </div>
                    </div>
                  </div>
                  <div className="col-6">
                    <div className="card bg-success text-white">
                      <div className="card-body">
                        <h6 className="card-title">Nuevo Horario</h6>
                        <div>{selectedSlot.date.toLocaleDateString('es-ES', {
                          weekday: 'short',
                          day: 'numeric',
                          month: 'short'
                        })}</div>
                        <div>{selectedSlot.time}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  onClick={() => setShowConfirmation(false)}
                  disabled={appointmentLoading}
                >
                  Cancelar
                </button>
                <button 
                  type="button" 
                  className="btn btn-success"
                  onClick={handleConfirmReschedule}
                  disabled={appointmentLoading}
                >
                  {appointmentLoading ? (
                    <>
                      <Loader size={16} className="me-2 animate-spin" />
                      Reagendando...
                    </>
                  ) : (
                    <>
                      <Check size={16} className="me-2" />
                      Confirmar Reagendación
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Legend */}
      <div className="row mt-4">
        <div className="col-12">
          <div className="card bg-light border-0">
            <div className="card-body py-2">
              <small className="text-muted">
                <strong>Leyenda:</strong>
                <span className="ms-3">
                  <span className="badge bg-outline-success me-2">●</span>
                  Disponible
                </span>
                <span className="ms-2">
                  <span className="badge bg-outline-secondary me-2">●</span>
                  Ocupado
                </span>
                <span className="ms-2">
                  <span className="badge bg-warning me-2">📍</span>
                  Cita Actual
                </span>
                <span className="ms-2">
                  <span className="badge bg-primary me-2">●</span>
                  Seleccionado
                </span>
              </small>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AppointmentReschedule; 