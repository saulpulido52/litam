import React, { useState, useEffect } from 'react';
import { Calendar, ChevronLeft, ChevronRight, Plus, Clock, MapPin, Video, Edit } from 'lucide-react';

interface CalendarEvent {
  id: number;
  title: string;
  patient_name: string;
  date: string;
  start_time: string;
  end_time: string;
  type: 'consultation' | 'follow-up' | 'initial' | 'weight-check';
  location: 'presencial' | 'virtual';
  status: 'scheduled' | 'completed' | 'cancelled';
  notes?: string;
}

const CalendarPage: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<'month' | 'week' | 'day'>('week');
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [showEventModal, setShowEventModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);

  useEffect(() => {
    // Datos de ejemplo para el calendario
    const mockEvents: CalendarEvent[] = [
      {
        id: 1,
        title: 'Consulta Inicial',
        patient_name: 'María González',
        date: '2024-12-16',
        start_time: '09:00',
        end_time: '10:00',
        type: 'initial',
        location: 'presencial',
        status: 'scheduled',
        notes: 'Primera consulta, evaluar objetivos nutricionales'
      },
      {
        id: 2,
        title: 'Seguimiento',
        patient_name: 'Carlos Ruiz',
        date: '2024-12-16',
        start_time: '11:00',
        end_time: '11:30',
        type: 'follow-up',
        location: 'virtual',
        status: 'scheduled',
        notes: 'Revisión del plan de alimentación deportiva'
      },
      {
        id: 3,
        title: 'Control de Peso',
        patient_name: 'Ana López',
        date: '2024-12-16',
        start_time: '14:00',
        end_time: '14:30',
        type: 'weight-check',
        location: 'presencial',
        status: 'scheduled'
      },
      {
        id: 4,
        title: 'Consulta Especializada',
        patient_name: 'José Martín',
        date: '2024-12-17',
        start_time: '10:30',
        end_time: '11:30',
        type: 'consultation',
        location: 'virtual',
        status: 'scheduled',
        notes: 'Consulta sobre manejo de diabetes tipo 2'
      },
      {
        id: 5,
        title: 'Seguimiento',
        patient_name: 'Laura Pérez',
        date: '2024-12-17',
        start_time: '15:00',
        end_time: '15:30',
        type: 'follow-up',
        location: 'presencial',
        status: 'scheduled'
      }
    ];

    setEvents(mockEvents);
  }, []);

  const daysOfWeek = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
  const months = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  const getWeekDates = (date: Date) => {
    const startOfWeek = new Date(date);
    const day = startOfWeek.getDay();
    startOfWeek.setDate(date.getDate() - day);
    
    const weekDates = [];
    for (let i = 0; i < 7; i++) {
      const currentDate = new Date(startOfWeek);
      currentDate.setDate(startOfWeek.getDate() + i);
      weekDates.push(currentDate);
    }
    return weekDates;
  };

  const formatDateForComparison = (date: Date) => {
    return date.toISOString().split('T')[0];
  };

  const getEventsForDate = (date: Date) => {
    const dateStr = formatDateForComparison(date);
    return events.filter(event => event.date === dateStr);
  };

  const getEventTypeColor = (type: string) => {
    const colors = {
      'initial': 'bg-primary',
      'follow-up': 'bg-success',
      'consultation': 'bg-info',
      'weight-check': 'bg-warning'
    };
    return colors[type as keyof typeof colors] || 'bg-secondary';
  };

  const getEventTypeText = (type: string) => {
    const types = {
      'initial': 'Consulta Inicial',
      'follow-up': 'Seguimiento',
      'consultation': 'Consulta',
      'weight-check': 'Control de Peso'
    };
    return types[type as keyof typeof types] || type;
  };

  const navigateWeek = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    newDate.setDate(currentDate.getDate() + (direction === 'next' ? 7 : -7));
    setCurrentDate(newDate);
  };

  const weekDates = getWeekDates(currentDate);
  const timeSlots = Array.from({ length: 12 }, (_, i) => {
    const hour = i + 8; // Empezar desde las 8:00 AM
    return `${hour.toString().padStart(2, '0')}:00`;
  });

  const todayEvents = getEventsForDate(new Date());

  return (
    <div className="container-fluid py-4">
      {/* Header */}
      <div className="row mb-4">
        <div className="col-md-8">
          <h1 className="h2 mb-1">Mi Agenda</h1>
          <p className="text-muted">Gestiona tu calendario de citas y consultas</p>
        </div>
        <div className="col-md-4 text-end">
          <div className="btn-group me-2">
            <button 
              className={`btn btn-outline-primary ${view === 'day' ? 'active' : ''}`}
              onClick={() => setView('day')}
            >
              Día
            </button>
            <button 
              className={`btn btn-outline-primary ${view === 'week' ? 'active' : ''}`}
              onClick={() => setView('week')}
            >
              Semana
            </button>
            <button 
              className={`btn btn-outline-primary ${view === 'month' ? 'active' : ''}`}
              onClick={() => setView('month')}
            >
              Mes
            </button>
          </div>
          <button 
            className="btn btn-primary"
            onClick={() => setShowEventModal(true)}
          >
            <Plus size={18} className="me-2" />
            Nueva Cita
          </button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="row mb-4">
        <div className="col-md-3">
          <div className="card border-0 shadow-sm">
            <div className="card-body text-center">
              <h4 className="text-primary">{todayEvents.length}</h4>
              <small className="text-muted">Citas hoy</small>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card border-0 shadow-sm">
            <div className="card-body text-center">
              <h4 className="text-success">{events.filter(e => e.status === 'scheduled').length}</h4>
              <small className="text-muted">Programadas</small>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card border-0 shadow-sm">
            <div className="card-body text-center">
              <h4 className="text-info">{events.filter(e => e.location === 'virtual').length}</h4>
              <small className="text-muted">Virtuales</small>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card border-0 shadow-sm">
            <div className="card-body text-center">
              <h4 className="text-warning">{events.filter(e => e.location === 'presencial').length}</h4>
              <small className="text-muted">Presenciales</small>
            </div>
          </div>
        </div>
      </div>

      {/* Calendar Navigation */}
      <div className="row mb-3">
        <div className="col-12">
          <div className="d-flex justify-content-between align-items-center">
            <div className="d-flex align-items-center">
              <button 
                className="btn btn-outline-secondary me-2"
                onClick={() => navigateWeek('prev')}
              >
                <ChevronLeft size={18} />
              </button>
              <h4 className="mb-0 me-2">
                {view === 'week' && `${months[weekDates[0].getMonth()]} ${weekDates[0].getFullYear()}`}
              </h4>
              <button 
                className="btn btn-outline-secondary"
                onClick={() => navigateWeek('next')}
              >
                <ChevronRight size={18} />
              </button>
            </div>
            <button 
              className="btn btn-outline-primary"
              onClick={() => setCurrentDate(new Date())}
            >
              Hoy
            </button>
          </div>
        </div>
      </div>

      {/* Week View */}
      {view === 'week' && (
        <div className="card border-0 shadow-sm">
          <div className="card-body p-0">
            <div className="table-responsive">
              <table className="table table-bordered mb-0">
                <thead className="table-light">
                  <tr>
                    <th style={{ width: '100px' }}>Hora</th>
                    {weekDates.map((date, index) => (
                      <th key={index} className="text-center">
                        <div>
                          <div className="fw-medium">{daysOfWeek[date.getDay()]}</div>
                          <div className={`small ${formatDateForComparison(date) === formatDateForComparison(new Date()) ? 'text-primary fw-bold' : 'text-muted'}`}>
                            {date.getDate()}
                          </div>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {timeSlots.map((time) => (
                    <tr key={time} style={{ height: '60px' }}>
                      <td className="text-center bg-light text-muted">
                        <small>{time}</small>
                      </td>
                      {weekDates.map((date, dateIndex) => {
                        const dayEvents = getEventsForDate(date).filter(event => 
                          event.start_time === time
                        );
                        return (
                          <td key={dateIndex} className="p-1">
                            {dayEvents.map((event) => (
                              <div
                                key={event.id}
                                className={`${getEventTypeColor(event.type)} text-white rounded p-1 mb-1 cursor-pointer`}
                                style={{ fontSize: '12px', cursor: 'pointer' }}
                                onClick={() => {
                                  setSelectedEvent(event);
                                  setShowEventModal(true);
                                }}
                              >
                                <div className="fw-medium text-truncate">{event.patient_name}</div>
                                <div className="d-flex align-items-center">
                                  <Clock size={10} className="me-1" />
                                  <span>{event.start_time}-{event.end_time}</span>
                                </div>
                                <div className="d-flex align-items-center">
                                  {event.location === 'virtual' ? 
                                    <Video size={10} className="me-1" /> : 
                                    <MapPin size={10} className="me-1" />
                                  }
                                  <span className="text-truncate">{getEventTypeText(event.type)}</span>
                                </div>
                              </div>
                            ))}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Today's Schedule Sidebar */}
      <div className="row mt-4">
        <div className="col-md-4">
          <div className="card border-0 shadow-sm">
            <div className="card-header bg-white">
              <h6 className="mb-0">Agenda de Hoy</h6>
            </div>
            <div className="card-body p-0">
              {todayEvents.length === 0 ? (
                <div className="text-center py-4">
                  <Calendar size={48} className="text-muted mb-2" />
                  <p className="text-muted">No tienes citas programadas para hoy</p>
                </div>
              ) : (
                <div className="list-group list-group-flush">
                  {todayEvents.map((event) => (
                    <div key={event.id} className="list-group-item">
                      <div className="d-flex justify-content-between align-items-start">
                        <div className="flex-grow-1">
                          <div className="d-flex align-items-center mb-1">
                            <span className={`badge ${getEventTypeColor(event.type)} me-2`}>
                              {getEventTypeText(event.type)}
                            </span>
                            {event.location === 'virtual' ? 
                              <Video size={14} className="text-info" /> : 
                              <MapPin size={14} className="text-success" />
                            }
                          </div>
                          <h6 className="mb-1">{event.patient_name}</h6>
                          <div className="d-flex align-items-center text-muted small">
                            <Clock size={12} className="me-1" />
                            <span>{event.start_time} - {event.end_time}</span>
                          </div>
                          {event.notes && (
                            <p className="small text-muted mt-1 mb-0">{event.notes}</p>
                          )}
                        </div>
                        <div className="btn-group btn-group-sm">
                          <button className="btn btn-outline-primary">
                            <Edit size={12} />
                          </button>
                          {event.location === 'virtual' && (
                            <button className="btn btn-outline-info">
                              <Video size={12} />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="col-md-8">
          <div className="card border-0 shadow-sm">
            <div className="card-header bg-white">
              <h6 className="mb-0">Próximas Citas</h6>
            </div>
            <div className="card-body">
              <div className="row">
                {events.filter(e => e.status === 'scheduled').slice(0, 6).map((event) => (
                  <div key={event.id} className="col-md-6 mb-3">
                    <div className="border rounded p-3">
                      <div className="d-flex justify-content-between align-items-start">
                        <div>
                          <h6 className="mb-1">{event.patient_name}</h6>
                          <div className="text-muted small">
                            {new Date(event.date).toLocaleDateString('es-ES', { 
                              weekday: 'long', 
                              day: 'numeric', 
                              month: 'short' 
                            })}
                          </div>
                          <div className="text-muted small">
                            {event.start_time} - {event.end_time}
                          </div>
                        </div>
                        <span className={`badge ${getEventTypeColor(event.type)}`}>
                          {getEventTypeText(event.type)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Event Modal */}
      {showEventModal && (
        <div className="modal fade show d-block" tabIndex={-1} style={{backgroundColor: 'rgba(0,0,0,0.5)'}}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  {selectedEvent ? 'Detalles de la Cita' : 'Nueva Cita'}
                </h5>
                <button 
                  type="button" 
                  className="btn-close" 
                  onClick={() => {
                    setShowEventModal(false);
                    setSelectedEvent(null);
                  }}
                ></button>
              </div>
              <div className="modal-body">
                {selectedEvent ? (
                  <div>
                    <div className="mb-3">
                      <strong>Paciente:</strong> {selectedEvent.patient_name}
                    </div>
                    <div className="mb-3">
                      <strong>Fecha:</strong> {new Date(selectedEvent.date).toLocaleDateString('es-ES')}
                    </div>
                    <div className="mb-3">
                      <strong>Hora:</strong> {selectedEvent.start_time} - {selectedEvent.end_time}
                    </div>
                    <div className="mb-3">
                      <strong>Tipo:</strong> {getEventTypeText(selectedEvent.type)}
                    </div>
                    <div className="mb-3">
                      <strong>Modalidad:</strong> {selectedEvent.location === 'virtual' ? 'Virtual' : 'Presencial'}
                    </div>
                    {selectedEvent.notes && (
                      <div className="mb-3">
                        <strong>Notas:</strong> {selectedEvent.notes}
                      </div>
                    )}
                  </div>
                ) : (
                  <form>
                    <div className="mb-3">
                      <label className="form-label">Paciente</label>
                      <select className="form-select">
                        <option>Seleccionar paciente...</option>
                        <option>María González</option>
                        <option>Carlos Ruiz</option>
                        <option>Ana López</option>
                      </select>
                    </div>
                    <div className="row">
                      <div className="col-6 mb-3">
                        <label className="form-label">Fecha</label>
                        <input type="date" className="form-control" />
                      </div>
                      <div className="col-6 mb-3">
                        <label className="form-label">Hora</label>
                        <input type="time" className="form-control" />
                      </div>
                    </div>
                    <div className="mb-3">
                      <label className="form-label">Tipo de cita</label>
                      <select className="form-select">
                        <option>Consulta inicial</option>
                        <option>Seguimiento</option>
                        <option>Control de peso</option>
                        <option>Consulta especializada</option>
                      </select>
                    </div>
                    <div className="mb-3">
                      <label className="form-label">Modalidad</label>
                      <div className="d-flex gap-3">
                        <div className="form-check">
                          <input className="form-check-input" type="radio" name="location" id="presencial" />
                          <label className="form-check-label" htmlFor="presencial">
                            Presencial
                          </label>
                        </div>
                        <div className="form-check">
                          <input className="form-check-input" type="radio" name="location" id="virtual" />
                          <label className="form-check-label" htmlFor="virtual">
                            Virtual
                          </label>
                        </div>
                      </div>
                    </div>
                  </form>
                )}
              </div>
              <div className="modal-footer">
                <button 
                  type="button" 
                  className="btn btn-secondary"
                  onClick={() => {
                    setShowEventModal(false);
                    setSelectedEvent(null);
                  }}
                >
                  Cerrar
                </button>
                {!selectedEvent && (
                  <button type="button" className="btn btn-primary">
                    Programar Cita
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CalendarPage; 