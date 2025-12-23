<<<<<<< HEAD
import React, { useState, useEffect } from 'react';
import { Calendar, ChevronLeft, ChevronRight, Plus, Clock, MapPin, Video, Edit } from 'lucide-react';

interface CalendarEvent {
  id: number;
  title: string;
  patient_name: string;
=======
import React, { useState, useMemo } from 'react';
import { Calendar, ChevronLeft, ChevronRight, Plus, Clock, MapPin, Video, Edit, List, RefreshCw, Phone, Trash2, Settings, AlertCircle, Eye } from 'lucide-react';
import { StatusModal } from '../components/StatusModal';
import { useNavigate } from 'react-router-dom';
import { useAppointments } from '../hooks/useAppointments';
import DebugAppointments from '../components/DebugAppointments';
import type { AppointmentType } from '../services/appointmentsService';
import '../styles/calendar.css';

// Interfaz para eventos del calendario
interface CalendarEvent {
  id: string;
  title: string;
  patient_name: string;
  patient_email: string;
>>>>>>> nutri/main
  date: string;
  start_time: string;
  end_time: string;
  type: 'consultation' | 'follow-up' | 'initial' | 'weight-check';
  location: 'presencial' | 'virtual';
<<<<<<< HEAD
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
=======
  status: 'scheduled' | 'completed' | 'cancelled_by_patient' | 'cancelled_by_nutritionist' | 'rescheduled' | 'no_show';
  notes?: string;
  original: AppointmentType;
}

const CalendarPage: React.FC = () => {
  const navigate = useNavigate();
  const { appointments, loading, error, loadAppointments, updateAppointmentStatus, deleteAppointment, clearError } = useAppointments();
  
  // Debug: Log whenever appointments change
  React.useEffect(() => {
    console.log('🔄 [CalendarPage] Appointments changed:', { 
      appointmentsCount: appointments?.length || 0, 
      loading, 
      error,
      appointmentsData: appointments 
    });
  }, [appointments, loading, error]);
  
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<'month' | 'week' | 'day'>('week');
  const [showEventModal, setShowEventModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [showStatusModal, setShowStatusModal] = useState(false);

  // Manejar cambio de estado de citas
  const handleStatusChange = async (appointmentId: string, newStatus: 'scheduled' | 'completed' | 'cancelled_by_patient' | 'cancelled_by_nutritionist' | 'rescheduled' | 'no_show') => {
    const statusMessages = {
      'completed': '¿Marcar esta cita como completada?',
      'cancelled_by_nutritionist': '¿Cancelar esta cita?',
      'no_show': '¿Marcar que el paciente no asistió?',
      'scheduled': '¿Marcar como programada?',
      'cancelled_by_patient': '¿Marcar como cancelada por el paciente?',
      'rescheduled': '¿Marcar como reagendada?'
    };

    const message = statusMessages[newStatus] || '¿Cambiar el estado de esta cita?';
    if (!window.confirm(message)) return;

    try {
      await updateAppointmentStatus(appointmentId, {
        status: newStatus,
        notes: `Estado cambiado a ${newStatus} por el nutriólogo desde calendario`
      });
      setShowEventModal(false);
      setSelectedEvent(null);
    } catch (error: any) {
      console.error('Error updating appointment status:', error);
    }
  };

  // Convertir appointments del backend a eventos del calendario
  const events: CalendarEvent[] = useMemo(() => {
    console.log('🔍 [CalendarPage] Raw appointments from backend:', appointments);
    console.log('🔢 [CalendarPage] Appointments count:', appointments?.length || 0);
    
    if (!appointments || !Array.isArray(appointments)) {
      console.log('❌ [CalendarPage] No appointments or not array:', appointments);
      return [];
    }

    if (appointments.length === 0) {
      console.log('⚠️ [CalendarPage] Appointments array is empty');
      return [];
    }

    const convertedEvents = appointments.map((apt, index) => {
      try {
        console.log(`🔄 [CalendarPage] Converting appointment ${index + 1}:`, apt);
        
        // Verificar que apt.start_time y apt.end_time existen
        if (!apt.start_time || !apt.end_time) {
          console.error('❌ [CalendarPage] Missing start_time or end_time:', apt);
          return null;
        }
        
        const startDate = new Date(apt.start_time);
        const endDate = new Date(apt.end_time);
        
        // Verificar fechas válidas
        if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
          console.error('❌ [CalendarPage] Invalid dates:', { start_time: apt.start_time, end_time: apt.end_time });
          return null;
        }
        
        console.log('📅 [CalendarPage] Dates:', { 
          start_time: apt.start_time, 
          end_time: apt.end_time,
          startDate: startDate.toISOString(), 
          endDate: endDate.toISOString() 
        });
        
        const event = {
          id: apt.id,
          title: apt.notes || 'Consulta',
          patient_name: apt.patient ? `${apt.patient.first_name} ${apt.patient.last_name}` : 'Paciente desconocido',
          patient_email: apt.patient?.email || '',
          date: startDate.toISOString().split('T')[0], // YYYY-MM-DD
          start_time: startDate.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', hour12: false }),
          end_time: endDate.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', hour12: false }),
          type: 'consultation' as const,
          location: apt.meeting_link ? 'virtual' : 'presencial',
          status: apt.status,
          notes: apt.notes,
          original: apt
        } as CalendarEvent;
        
        console.log('✅ [CalendarPage] Converted event:', event);
        return event;
      } catch (transformError) {
        console.error('❌ [CalendarPage] Error transforming appointment to calendar event:', transformError, apt);
        return null;
      }
    }).filter((event): event is CalendarEvent => event !== null);

    console.log('📋 [CalendarPage] Final converted events:', convertedEvents);
    console.log('🎯 [CalendarPage] Events by date:', convertedEvents.map(e => ({ date: e.date, time: e.start_time, patient: e.patient_name })));
    
    return convertedEvents;
  }, [appointments]);
>>>>>>> nutri/main

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
<<<<<<< HEAD
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
=======
    const dayEvents = events.filter(event => {
      const matches = event.date === dateStr;
      console.log(`🔍 [CalendarPage] Event ${event.id} (${event.date}) matches ${dateStr}? ${matches}`);
      return matches;
    });
    
    console.log(`📅 [CalendarPage] Getting events for ${dateStr}:`, dayEvents.length, 'events found');
    if (dayEvents.length > 0) {
      console.log(`✅ [CalendarPage] Events for ${dateStr}:`, dayEvents);
    }
    
    return dayEvents;
  };

  const getEventStatusColor = (status: string) => {
    const colors = {
      'scheduled': 'bg-primary',
      'completed': 'bg-success',
      'cancelled_by_patient': 'bg-danger',
      'cancelled_by_nutritionist': 'bg-danger',
      'rescheduled': 'bg-warning',
      'no_show': 'bg-secondary'
    };
    return colors[status as keyof typeof colors] || 'bg-secondary';
>>>>>>> nutri/main
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

<<<<<<< HEAD
=======
  const goToToday = () => {
    setCurrentDate(new Date());
  };

>>>>>>> nutri/main
  const weekDates = getWeekDates(currentDate);
  const timeSlots = Array.from({ length: 12 }, (_, i) => {
    const hour = i + 8; // Empezar desde las 8:00 AM
    return `${hour.toString().padStart(2, '0')}:00`;
  });

  const todayEvents = getEventsForDate(new Date());
<<<<<<< HEAD
=======
  const upcomingEvents = events
    .filter(event => new Date(event.date) >= new Date() && event.status === 'scheduled')
    .sort((a, b) => new Date(a.date + ' ' + a.start_time).getTime() - new Date(b.date + ' ' + b.start_time).getTime())
    .slice(0, 6);
>>>>>>> nutri/main

  return (
    <div className="container-fluid py-4">
      {/* Header */}
      <div className="row mb-4">
        <div className="col-md-8">
<<<<<<< HEAD
          <h1 className="h2 mb-1">Mi Agenda</h1>
          <p className="text-muted">Gestiona tu calendario de citas y consultas</p>
=======
          <h1 className="h2 mb-1">
            <Calendar size={28} className="me-2" />
            Mi Calendario
          </h1>
          <p className="text-muted">Vista visual de tu agenda de citas y consultas</p>
>>>>>>> nutri/main
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
<<<<<<< HEAD
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
=======
          <div className="btn-group">
            <button 
              className="btn btn-outline-secondary"
              onClick={() => navigate('/appointments')}
              title="Ver lista de citas"
            >
              <List size={18} className="me-2" />
              Vista Lista
            </button>
            <button 
              className="btn btn-primary"
              onClick={() => navigate('/appointments')}
            >
              <Plus size={18} className="me-2" />
              Nueva Cita
>>>>>>> nutri/main
            </button>
          </div>
        </div>
      </div>

<<<<<<< HEAD
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
=======
      {/* Error Display */}
      {error && (
        <div className="alert alert-danger alert-dismissible fade show" role="alert">
          <AlertCircle size={16} className="me-2" />
          {error}
          <button 
            type="button" 
            className="btn-close" 
            onClick={clearError}
            aria-label="Close"
          ></button>
        </div>
      )}

      {/* Quick Stats */}
      <div className="row mb-4 g-3">
        <div className="col-6 col-lg-3">
          <div className="stat-card stat-card-today position-relative overflow-hidden">
            <div className="card-body text-white position-relative p-3">
              <div className="d-flex justify-content-between align-items-center h-100">
                <div className="flex-grow-1">
                  <h6 className="stat-label mb-2">Hoy</h6>
                  <h3 className="stat-value mb-1">{todayEvents.length}</h3>
                  <small className="stat-description">citas programadas</small>
                </div>
                <div className="stat-icon">
                  <Clock size={40} className="icon-float" />
                </div>
              </div>
              <div className="stat-background">
                <Clock size={120} className="background-icon" />
              </div>
            </div>
          </div>
        </div>
        <div className="col-6 col-lg-3">
          <div className="stat-card stat-card-upcoming position-relative overflow-hidden">
            <div className="card-body text-white position-relative p-3">
              <div className="d-flex justify-content-between align-items-center h-100">
                <div className="flex-grow-1">
                  <h6 className="stat-label mb-2">Próximas</h6>
                  <h3 className="stat-value mb-1">{upcomingEvents.length}</h3>
                  <small className="stat-description">pendientes</small>
                </div>
                <div className="stat-icon">
                  <Calendar size={40} className="icon-float" />
                </div>
              </div>
              <div className="stat-background">
                <Calendar size={120} className="background-icon" />
              </div>
            </div>
          </div>
        </div>
        <div className="col-6 col-lg-3">
          <div className="stat-card stat-card-week position-relative overflow-hidden">
            <div className="card-body text-white position-relative p-3">
              <div className="d-flex justify-content-between align-items-center h-100">
                <div className="flex-grow-1">
                  <h6 className="stat-label mb-2">Esta Semana</h6>
                  <h3 className="stat-value mb-1">{events.filter(e => {
                    const eventDate = new Date(e.date);
                    const startOfWeek = new Date(currentDate);
                    startOfWeek.setDate(currentDate.getDate() - currentDate.getDay());
                    const endOfWeek = new Date(startOfWeek);
                    endOfWeek.setDate(startOfWeek.getDate() + 6);
                    return eventDate >= startOfWeek && eventDate <= endOfWeek && e.status === 'scheduled';
                  }).length}</h3>
                  <small className="stat-description">programadas</small>
                </div>
                <div className="stat-icon">
                  <RefreshCw size={40} className="icon-pulse" />
                </div>
              </div>
              <div className="stat-background">
                <RefreshCw size={120} className="background-icon" />
              </div>
            </div>
          </div>
        </div>
        <div className="col-6 col-lg-3">
          <div className="stat-card stat-card-month position-relative overflow-hidden">
            <div className="card-body text-white position-relative p-3">
              <div className="d-flex justify-content-between align-items-center h-100">
                <div className="flex-grow-1">
                  <h6 className="stat-label mb-2">Total Mes</h6>
                  <h3 className="stat-value mb-1">{events.filter(e => {
                    const eventDate = new Date(e.date);
                    return eventDate.getMonth() === currentDate.getMonth() && 
                           eventDate.getFullYear() === currentDate.getFullYear();
                  }).length}</h3>
                  <small className="stat-description">este mes</small>
                </div>
                <div className="stat-icon">
                  <Calendar size={40} className="icon-bounce" />
                </div>
              </div>
              <div className="stat-background">
                <Calendar size={120} className="background-icon" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="row g-4">
        {/* Calendar View */}
        <div className="col-lg-8">
          <div className="card border-0 shadow-sm">
            <div className="card-header bg-white">
              <div className="d-flex justify-content-between align-items-center">
                <h5 className="mb-0">
                  {view === 'week' && `Semana del ${weekDates[0].getDate()} al ${weekDates[6].getDate()} de ${months[currentDate.getMonth()]} ${currentDate.getFullYear()}`}
                  {view === 'month' && `${months[currentDate.getMonth()]} ${currentDate.getFullYear()}`}
                  {view === 'day' && `${currentDate.getDate()} de ${months[currentDate.getMonth()]} ${currentDate.getFullYear()}`}
                </h5>
                <div className="btn-group">
                  <button 
                    className="btn btn-outline-secondary btn-sm"
                    onClick={() => navigateWeek('prev')}
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <button 
                    className="btn btn-outline-primary btn-sm"
                    onClick={goToToday}
                  >
                    Hoy
                  </button>
                  <button 
                    className="btn btn-outline-secondary btn-sm"
                    onClick={() => navigateWeek('next')}
                  >
                    <ChevronRight size={16} />
                  </button>
                  <button 
                    className="btn btn-outline-secondary btn-sm ms-2"
                    onClick={loadAppointments}
                    disabled={loading}
                    title="Actualizar calendario"
                  >
                    <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
                  </button>
                </div>
              </div>
            </div>

            {/* Weekly Calendar Grid */}
            {view === 'week' && (
              <div className="card-body p-0">
                {loading ? (
                  <div className="text-center py-5">
                    <RefreshCw size={32} className="text-primary animate-spin mb-2" />
                    <p className="text-muted">Cargando calendario...</p>
                  </div>
                ) : (
                  <div className="table-responsive">
                    <table className="table table-bordered mb-0">
                      <thead className="table-light">
                        <tr>
                          <th style={{ width: '80px' }}>Hora</th>
                          {weekDates.map((date, index) => (
                            <th key={index} className="text-center">
                              <div>{daysOfWeek[date.getDay()]}</div>
                              <div className={`fw-bold ${formatDateForComparison(date) === formatDateForComparison(new Date()) ? 'text-primary' : ''}`}>
                                {date.getDate()}
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
                              const dayEvents = getEventsForDate(date).filter(event => {
                                // Extraer la hora del evento (ej: "10:30" -> "10")
                                const eventHour = event.start_time.split(':')[0];
                                // Extraer la hora del slot (ej: "10:00" -> "10")  
                                const slotHour = time.split(':')[0];
                                return eventHour === slotHour;
                              });
                              return (
                                <td key={dateIndex} className="p-1">
                                  {dayEvents.map((event) => (
                                    <div
                                      key={event.id}
                                      className={`${getEventStatusColor(event.status)} text-white rounded p-1 mb-1 cursor-pointer`}
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
                                        {event.location === 'virtual' && (
                                          <Video size={10} className="ms-1" />
                                        )}
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
                )}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="col-lg-4">
          {/* Today's Agenda */}
          <div className="card border-0 shadow-sm mb-4">
            <div className="card-header bg-white">
>>>>>>> nutri/main
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
<<<<<<< HEAD
                            <span className={`badge ${getEventTypeColor(event.type)} me-2`}>
=======
                            <span className={`badge ${getEventStatusColor(event.status)} me-2`}>
>>>>>>> nutri/main
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
<<<<<<< HEAD
                        <div className="btn-group btn-group-sm">
                          <button className="btn btn-outline-primary">
                            <Edit size={12} />
                          </button>
                          {event.location === 'virtual' && (
                            <button className="btn btn-outline-info">
                              <Video size={12} />
                            </button>
                          )}
=======
                        <button 
                          className="btn btn-sm btn-outline-primary"
                          onClick={() => {
                            setSelectedEvent(event);
                            setShowEventModal(true);
                          }}
                        >
                          <Eye size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Upcoming Appointments */}
          <div className="card border-0 shadow-sm">
            <div className="card-header bg-white">
              <h6 className="mb-0">Próximas Citas</h6>
            </div>
            <div className="card-body">
              {upcomingEvents.length === 0 ? (
                <div className="text-center py-3">
                  <Clock size={32} className="text-muted mb-2" />
                  <p className="text-muted small">No hay citas próximas programadas</p>
                </div>
              ) : (
                <div className="row">
                  {upcomingEvents.map((event) => (
                    <div key={event.id} className="col-12 mb-3">
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
                          <span className={`badge ${getEventStatusColor(event.status)}`}>
                            {getEventTypeText(event.type)}
                          </span>
>>>>>>> nutri/main
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
<<<<<<< HEAD
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
=======
      </div>

      {/* Debug Component - Remove in production */}
      <DebugAppointments />

      {/* Event Modal */}
      {showEventModal && selectedEvent && (
>>>>>>> nutri/main
        <div className="modal fade show d-block" tabIndex={-1} style={{backgroundColor: 'rgba(0,0,0,0.5)'}}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
<<<<<<< HEAD
                <h5 className="modal-title">
                  {selectedEvent ? 'Detalles de la Cita' : 'Nueva Cita'}
                </h5>
=======
                <h5 className="modal-title">Detalles de la Cita</h5>
>>>>>>> nutri/main
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
<<<<<<< HEAD
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
=======
                <div className="mb-3">
                  <strong>Paciente:</strong> {selectedEvent.patient_name}
                </div>
                <div className="mb-3">
                  <strong>Email:</strong> {selectedEvent.patient_email}
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
                <div className="mb-3">
                  <strong>Estado:</strong> 
                  <span className={`badge ${getEventStatusColor(selectedEvent.status)} ms-2`}>
                    {selectedEvent.status === 'scheduled' ? 'Programada' :
                     selectedEvent.status === 'completed' ? 'Completada' :
                     selectedEvent.status === 'cancelled_by_patient' ? 'Cancelada por paciente' :
                     selectedEvent.status === 'cancelled_by_nutritionist' ? 'Cancelada por nutriólogo' :
                     selectedEvent.status === 'rescheduled' ? 'Reagendada' :
                     selectedEvent.status === 'no_show' ? 'No asistió' : selectedEvent.status}
                  </span>
                </div>
                {selectedEvent.notes && (
                  <div className="mb-3">
                    <strong>Notas:</strong> {selectedEvent.notes}
                  </div>
>>>>>>> nutri/main
                )}
              </div>
              <div className="modal-footer">
                <button 
                  type="button" 
<<<<<<< HEAD
                  className="btn btn-secondary"
=======
                  className="btn btn-secondary" 
>>>>>>> nutri/main
                  onClick={() => {
                    setShowEventModal(false);
                    setSelectedEvent(null);
                  }}
                >
                  Cerrar
                </button>
<<<<<<< HEAD
                {!selectedEvent && (
                  <button type="button" className="btn btn-primary">
                    Programar Cita
                  </button>
                )}
=======
                {selectedEvent?.original.patient?.phone && (
                  <a 
                    href={`tel:${selectedEvent.original.patient.phone}`}
                    className="btn btn-success me-2"
                    title="Llamar al paciente"
                  >
                    <Phone size={16} className="me-2" />
                    Llamar
                  </a>
                )}
                
                {/* Botón de cambio de estado */}
                <button
                  className="btn btn-outline-secondary me-2"
                  onClick={() => setShowStatusModal(true)}
                  title="Cambiar estado"
                >
                  <Settings size={16} className="me-1" />
                  Estado
                </button>
                
                <button 
                  type="button" 
                  className="btn btn-outline-danger me-2"
                  onClick={async () => {
                    if (selectedEvent && window.confirm('¿Estás seguro de que deseas eliminar esta cita permanentemente?')) {
                      try {
                        await deleteAppointment(selectedEvent.id);
                        setShowEventModal(false);
                        setSelectedEvent(null);
                      } catch (error) {
                        console.error('Error deleting appointment:', error);
                      }
                    }
                  }}
                >
                  <Trash2 size={16} className="me-2" />
                  Eliminar
                </button>
                <button 
                  type="button" 
                  className="btn btn-primary"
                  onClick={() => navigate(`/appointments`)}
                >
                  <Edit size={16} className="me-2" />
                  Editar en Lista
                </button>
>>>>>>> nutri/main
              </div>
            </div>
          </div>
        </div>
      )}
<<<<<<< HEAD
=======

      {/* Modal de Estado */}
      {selectedEvent && (
        <StatusModal
          isOpen={showStatusModal}
          onClose={() => setShowStatusModal(false)}
          appointmentId={selectedEvent.id}
          patientName={selectedEvent.patient_name}
          onStatusChange={handleStatusChange}
        />
      )}
>>>>>>> nutri/main
    </div>
  );
};

export default CalendarPage; 