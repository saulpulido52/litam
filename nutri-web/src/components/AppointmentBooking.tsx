import React, { useState, useMemo, useEffect } from 'react';
import { Calendar, Clock, Video, MapPin, ChevronLeft, ChevronRight, Loader, AlertCircle, Check, User } from 'lucide-react';
import { useAppointments } from '../hooks/useAppointments';
import { useAvailability } from '../hooks/useAvailability';
// import appointmentsService from '../services/appointmentsService';
import type { AvailabilitySlot, AppointmentType } from '../services/appointmentsService';

interface AppointmentBookingProps {
  nutritionistId: string;
  nutritionistName: string;
  onBookingComplete?: (appointment: AppointmentType) => void;
  onClose?: () => void;
}

interface TimeSlot {
  time: string;
  minutes: number;
  isAvailable: boolean;
  isBooked: boolean;
  appointmentId?: string;
}

interface DaySchedule {
  date: Date;
  dayOfWeek: string;
  slots: TimeSlot[];
  hasAvailability: boolean;
}

const AppointmentBooking: React.FC<AppointmentBookingProps> = ({
  nutritionistId,
  nutritionistName,
  onBookingComplete,
  onClose
}) => {
  const { createAppointment, loading: appointmentLoading } = useAppointments();
  const { searchNutritionistAvailability } = useAvailability();
  
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [availability, setAvailability] = useState<AvailabilitySlot[]>([]);
  const [existingAppointments, setExistingAppointments] = useState<AppointmentType[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<{ date: Date; time: string; minutes: number } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [bookingNotes, setBookingNotes] = useState('');
  const [meetingType, setMeetingType] = useState<'presencial' | 'virtual'>('presencial');

  const daysOfWeek = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
  // const dayOfWeekMap: { [key: string]: number } = {
  //   'SUNDAY': 0, 'MONDAY': 1, 'TUESDAY': 2, 'WEDNESDAY': 3,
  //   'THURSDAY': 4, 'FRIDAY': 5, 'SATURDAY': 6
  // };

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
  }, [nutritionistId, currentWeek]);

  const loadAvailabilityData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Cargar disponibilidad general del nutriólogo
      const availabilityData = await searchNutritionistAvailability(nutritionistId);
      setAvailability(availabilityData);

      // Cargar citas existentes para la semana
      // TODO: Implementar endpoint para obtener citas de un nutriólogo por rango de fechas
      // Por ahora simulamos con array vacío
      setExistingAppointments([]);

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
        
        // Verificar si este slot está ocupado por una cita existente
        const slotStart = new Date(`${dateStr}T${time}:00`);
        const slotEnd = new Date(slotStart.getTime() + 30 * 60000); // 30 minutos después
        
        const isBooked = existingAppointments.some(apt => {
          const aptStart = new Date(apt.start_time);
          const aptEnd = new Date(apt.end_time);
          return (
            apt.status === 'scheduled' &&
            slotStart < aptEnd && slotEnd > aptStart
          );
        });

        // Solo mostrar slots futuros
        const isInFuture = slotStart > new Date();
        
        if (isInFuture) {
          slots.push({
            time,
            minutes,
            isAvailable: !isBooked,
            isBooked,
            appointmentId: isBooked ? existingAppointments.find(apt => {
              const aptStart = new Date(apt.start_time);
              const aptEnd = new Date(apt.end_time);
              return slotStart < aptEnd && slotEnd > aptStart;
            })?.id : undefined
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
  }, [weekDates, availability, existingAppointments]);

  // Navegar semanas
  const navigateWeek = (direction: 'prev' | 'next') => {
    const newWeek = new Date(currentWeek);
    newWeek.setDate(currentWeek.getDate() + (direction === 'next' ? 7 : -7));
    setCurrentWeek(newWeek);
  };

  // Reservar cita
  const handleBookAppointment = async () => {
    if (!selectedSlot) return;

    try {
      setLoading(true);
      setError(null);

      const startTime = new Date(selectedSlot.date);
      startTime.setHours(Math.floor(selectedSlot.minutes / 60), selectedSlot.minutes % 60, 0, 0);
      
      const endTime = new Date(startTime.getTime() + 30 * 60000); // 30 minutos después

      const appointmentData = {
        nutritionistId,
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
        notes: bookingNotes,
        meetingLink: meetingType === 'virtual' ? 'https://meet.google.com/generated-link' : undefined
      };

      await createAppointment(appointmentData);
      
      if (onBookingComplete) {
        // Crear un objeto simulado para el callback ya que createAppointment no retorna la cita
        const mockAppointment: AppointmentType = {
          id: 'temp-id',
          patient_id: 'current-user-id',
          nutritionist_id: nutritionistId,
          start_time: appointmentData.startTime,
          end_time: appointmentData.endTime,
          status: 'scheduled',
          notes: appointmentData.notes,
          meeting_link: appointmentData.meetingLink,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        onBookingComplete(mockAppointment);
      }
      
      // Recargar disponibilidad
      await loadAvailabilityData();
      
      // Limpiar selección
      setSelectedSlot(null);
      setBookingNotes('');
      
    } catch (err: any) {
      console.error('Error booking appointment:', err);
      setError(err.message || 'Error al reservar la cita');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="appointment-booking">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h5 className="mb-1">
            <Calendar size={20} className="me-2" />
            Reservar Cita con {nutritionistName}
          </h5>
          <p className="text-muted small mb-0">Selecciona un horario disponible</p>
        </div>
        {onClose && (
          <button className="btn btn-sm btn-outline-secondary" onClick={onClose}>
            ✕
          </button>
        )}
      </div>

      {/* Error Display */}
      {error && (
        <div className="alert alert-danger alert-dismissible fade show" role="alert">
          <AlertCircle size={16} className="me-2" />
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
                              : slot.isAvailable
                                ? 'btn-outline-success'
                                : 'btn-outline-secondary'
                          }`}
                          disabled={!slot.isAvailable || appointmentLoading}
                          onClick={() => setSelectedSlot({
                            date: daySchedule.date,
                            time: slot.time,
                            minutes: slot.minutes
                          })}
                        >
                          <Clock size={12} className="me-1" />
                          {slot.time}
                          {slot.isBooked && (
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

      {/* Booking Form */}
      {selectedSlot && (
        <div className="card border-primary shadow-sm mt-4">
          <div className="card-header bg-primary text-white">
            <h6 className="mb-0">
              <Check size={16} className="me-2" />
              Confirmar Reserva
            </h6>
          </div>
          <div className="card-body">
            <div className="row">
              <div className="col-md-8">
                <div className="mb-3">
                  <strong>Fecha y Hora:</strong>
                  <p className="mb-0">
                    {selectedSlot.date.toLocaleDateString('es-ES', { 
                      weekday: 'long', 
                      day: 'numeric', 
                      month: 'long' 
                    })} a las {selectedSlot.time}
                  </p>
                </div>

                <div className="mb-3">
                  <label className="form-label">Modalidad de Consulta</label>
                  <div className="d-flex gap-2">
                    <button
                      type="button"
                      className={`btn ${meetingType === 'presencial' ? 'btn-success' : 'btn-outline-success'}`}
                      onClick={() => setMeetingType('presencial')}
                    >
                      <MapPin size={16} className="me-1" />
                      Presencial
                    </button>
                    <button
                      type="button"
                      className={`btn ${meetingType === 'virtual' ? 'btn-info' : 'btn-outline-info'}`}
                      onClick={() => setMeetingType('virtual')}
                    >
                      <Video size={16} className="me-1" />
                      Virtual
                    </button>
                  </div>
                </div>

                <div className="mb-3">
                  <label htmlFor="booking-notes" className="form-label">
                    Notas (Opcional)
                  </label>
                  <textarea
                    id="booking-notes"
                    className="form-control"
                    rows={3}
                    value={bookingNotes}
                    onChange={(e) => setBookingNotes(e.target.value)}
                    placeholder="Describe brevemente el motivo de la consulta o cualquier información relevante..."
                    maxLength={500}
                  />
                  <div className="form-text">
                    {bookingNotes.length}/500 caracteres
                  </div>
                </div>
              </div>
              
              <div className="col-md-4">
                <div className="bg-light rounded p-3">
                  <h6 className="mb-2">
                    <User size={16} className="me-1" />
                    Resumen
                  </h6>
                  <div className="small">
                    <div className="mb-2">
                      <strong>Nutriólogo:</strong><br />
                      {nutritionistName}
                    </div>
                    <div className="mb-2">
                      <strong>Duración:</strong><br />
                      30 minutos
                    </div>
                    <div className="mb-2">
                      <strong>Tipo:</strong><br />
                      {meetingType === 'virtual' ? 'Consulta Virtual' : 'Consulta Presencial'}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="d-flex justify-content-end gap-2 mt-3">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setSelectedSlot(null)}
                disabled={appointmentLoading}
              >
                Cancelar
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={handleBookAppointment}
                disabled={appointmentLoading}
              >
                {appointmentLoading ? (
                  <>
                    <Loader size={16} className="me-2 animate-spin" />
                    Reservando...
                  </>
                ) : (
                  <>
                    <Check size={16} className="me-2" />
                    Confirmar Reserva
                  </>
                )}
              </button>
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

export default AppointmentBooking; 