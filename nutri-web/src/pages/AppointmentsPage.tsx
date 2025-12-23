import React, { useState, useEffect } from 'react';
<<<<<<< HEAD
import { Calendar, Clock, Plus, Search, MapPin, User, Phone, Edit, Trash2, CheckCircle, AlertCircle, Eye } from 'lucide-react';

interface Appointment {
  id: number;
=======
import { Calendar, Clock, Plus, Search, Phone, Edit, Trash2, Settings, CalendarDays, AlertCircle, CheckCircle, Eye } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { StatusModal } from '../components/StatusModal';
import { useAppointments } from '../hooks/useAppointments';
import type { CreateAppointmentForPatientDto, AppointmentType } from '../services/appointmentsService';
import patientsService from '../services/patientsService';
import AvailabilityManager from '../components/AvailabilityManager';

interface FormattedAppointment {
  id: string;
>>>>>>> nutri/main
  patient_name: string;
  patient_email: string;
  patient_phone: string;
  date: string;
  time: string;
  type: string;
<<<<<<< HEAD
  status: 'scheduled' | 'completed' | 'cancelled' | 'no-show';
  notes?: string;
  location: 'presencial' | 'virtual';
}

const AppointmentsPage: React.FC = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showModal, setShowModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  // Datos de ejemplo
  useEffect(() => {
    const mockAppointments: Appointment[] = [
      {
        id: 1,
        patient_name: 'María González',
        patient_email: 'maria@email.com',
        patient_phone: '+52 555 123 4567',
        date: '2024-12-16',
        time: '09:00',
        type: 'Consulta inicial',
        status: 'scheduled',
        notes: 'Primera consulta, evaluar objetivos',
        location: 'presencial'
      },
      {
        id: 2,
        patient_name: 'Carlos Ruiz',
        patient_email: 'carlos@email.com',
        patient_phone: '+52 555 987 6543',
        date: '2024-12-16',
        time: '11:00',
        type: 'Seguimiento',
        status: 'scheduled',
        notes: 'Revisión de plan nutricional',
        location: 'virtual'
      },
      {
        id: 3,
        patient_name: 'Ana López',
        patient_email: 'ana@email.com',
        patient_phone: '+52 555 456 7890',
        date: '2024-12-15',
        time: '10:30',
        type: 'Control de peso',
        status: 'completed',
        notes: 'Progreso excelente',
        location: 'presencial'
      },
      {
        id: 4,
        patient_name: 'José Martín',
        patient_email: 'jose@email.com',
        patient_phone: '+52 555 321 0987',
        date: '2024-12-17',
        time: '14:00',
        type: 'Consulta especializada',
        status: 'scheduled',
        notes: 'Consulta sobre alimentación deportiva',
        location: 'virtual'
      }
    ];
    setAppointments(mockAppointments);
  }, []);

  const filteredAppointments = appointments.filter(appointment => {
    const matchesSearch = appointment.patient_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         appointment.type.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || appointment.status === statusFilter;
    return matchesSearch && matchesStatus;
=======
  status: 'scheduled' | 'completed' | 'cancelled_by_patient' | 'cancelled_by_nutritionist' | 'rescheduled' | 'no_show';
  notes?: string;
  location: 'presencial' | 'virtual';
  original: AppointmentType;
}

const AppointmentsPage: React.FC = () => {
  const navigate = useNavigate();
  const { appointments: backendAppointments, loading, error, loadAppointments, createAppointmentForPatient, updateAppointmentStatus, updateAppointment, deleteAppointment, clearError } = useAppointments();
  const [patients, setPatients] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showModal, setShowModal] = useState(false);
  const [showAvailability, setShowAvailability] = useState(false);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedAppointment, setSelectedAppointment] = useState<FormattedAppointment | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  // Estados para el formulario de nueva cita
  const [formData, setFormData] = useState({
    patientId: '',
    date: '',
    time: '',
    duration: 30,
    type: '',
    location: 'presencial',
    notes: ''
  });

  // Formatear appointments del backend para la UI con useMemo para optimización
  const appointments: FormattedAppointment[] = React.useMemo(() => {
    if (!backendAppointments || !Array.isArray(backendAppointments)) {
      console.warn('Backend appointments is not an array:', backendAppointments);
      return [];
    }

    return backendAppointments.map(apt => {
      try {
        return {
          id: apt.id,
          patient_name: apt.patient ? `${apt.patient.first_name} ${apt.patient.last_name}` : 'Paciente desconocido',
          patient_email: apt.patient?.email || '',
          patient_phone: apt.patient?.phone || '',
          date: new Date(apt.start_time).toISOString().split('T')[0],
          time: new Date(apt.start_time).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }),
          type: 'Consulta',
          status: apt.status,
          notes: apt.notes,
          location: (apt.meeting_link ? 'virtual' : 'presencial') as 'presencial' | 'virtual',
          original: apt
        } as FormattedAppointment;
      } catch (transformError) {
        console.error('Error transforming appointment:', transformError, apt);
        return null;
      }
    }).filter((apt): apt is FormattedAppointment => apt !== null);
  }, [backendAppointments]);

  // Debug logging para entender qué está pasando
  React.useEffect(() => {
    console.log('🔍 [AppointmentsPage] State updated:', {
      backendAppointments: backendAppointments?.length || 0,
      formattedAppointments: appointments?.length || 0,
      loading,
      error
    });
  }, [backendAppointments, appointments, loading, error]);

  // Cargar solo pacientes al inicializar (las citas se cargan automáticamente en useAppointments)
  useEffect(() => {
    loadPatients();
  }, []);

  const loadPatients = React.useCallback(async () => {
    try {
      const patientsData = await patientsService.getMyPatients();
      setPatients(patientsData);
    } catch (error: any) {
      console.error('Error loading patients:', error);
    }
  }, []);

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
        notes: `Estado cambiado a ${newStatus} por el nutriólogo`
      });
    } catch (error: any) {
      console.error('Error updating appointment status:', error);
      // Error ya se maneja en el hook
    }
  };

  const filteredAppointments = appointments.filter(appointment => {
    const matchesSearch = appointment.patient_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         appointment.type.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Manejar el filtro de estado
    let matchesStatus = true;
    if (statusFilter !== 'all') {
      if (statusFilter === 'cancelled') {
        // Mostrar todas las citas canceladas (por paciente o nutriólogo)
        matchesStatus = appointment.status === 'cancelled_by_patient' || appointment.status === 'cancelled_by_nutritionist';
      } else {
        matchesStatus = appointment.status === statusFilter;
      }
    }
    
    const matchesDate = !selectedDate || appointment.date === selectedDate;
    return matchesSearch && matchesStatus && matchesDate;
>>>>>>> nutri/main
  });

  const getStatusBadge = (status: string) => {
    const statusConfig = {
<<<<<<< HEAD
      scheduled: { class: 'bg-primary text-white', text: 'Programada' },
      completed: { class: 'bg-success text-white', text: 'Completada' },
      cancelled: { class: 'bg-danger text-white', text: 'Cancelada' },
      'no-show': { class: 'bg-warning text-dark', text: 'No asistió' }
    };
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.scheduled;
    return <span className={`badge ${config.class}`}>{config.text}</span>;
=======
      scheduled: { class: 'bg-primary text-white', text: 'Programada', icon: '📅' },
      completed: { class: 'bg-success text-white', text: 'Completada', icon: '✅' },
      cancelled_by_patient: { class: 'bg-danger text-white', text: 'Cancelada por el paciente', icon: '❌' },
      cancelled_by_nutritionist: { class: 'bg-danger text-white', text: 'Cancelada por el nutricionista', icon: '❌' },
      rescheduled: { class: 'bg-warning text-dark', text: 'Reagendada', icon: '⚠️' },
      'no_show': { class: 'bg-warning text-dark', text: 'No asistió', icon: '⚠️' }
    };
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.scheduled;
    return (
      <span className={`badge ${config.class}`} title={`Estado: ${config.text}`}>
        <span className="me-1">{config.icon}</span>
        {config.text}
      </span>
    );
>>>>>>> nutri/main
  };

  const todayAppointments = appointments.filter(apt => apt.date === new Date().toISOString().split('T')[0]);
  const upcomingAppointments = appointments.filter(apt => new Date(apt.date) > new Date() && apt.status === 'scheduled');

<<<<<<< HEAD
  const handleStatusChange = (appointmentId: number, newStatus: 'scheduled' | 'completed' | 'cancelled' | 'no-show') => {
    setAppointments(prev => prev.map(apt => 
      apt.id === appointmentId ? { ...apt, status: newStatus } : apt
    ));
  };

  const handleViewDetails = (appointment: Appointment) => {
=======
  const handleViewDetails = (appointment: FormattedAppointment) => {
>>>>>>> nutri/main
    setSelectedAppointment(appointment);
    setShowDetailModal(true);
  };

<<<<<<< HEAD
  return (
    <div className="container-fluid py-4">
=======
  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCreateAppointment = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.patientId || !formData.date || !formData.time) {
      return; // Error handling is done in the hook
    }

    try {
      // Crear el objeto de fecha y hora
      const appointmentDateTime = new Date(`${formData.date}T${formData.time}`);
      const endDateTime = new Date(appointmentDateTime.getTime() + (formData.duration * 60000));

      const appointmentData: CreateAppointmentForPatientDto = {
        patientId: formData.patientId,
        startTime: appointmentDateTime.toISOString(),
        endTime: endDateTime.toISOString(),
        notes: formData.notes || undefined,
        meetingLink: formData.location === 'virtual' ? 'https://meet.google.com/generated-link' : undefined
      };

      await createAppointmentForPatient(appointmentData);
      
      // Cerrar modal y limpiar formulario
      setShowModal(false);
      setFormData({
        patientId: '',
        date: '',
        time: '',
        duration: 30,
        type: '',
        location: 'presencial',
        notes: ''
      });

    } catch (error: any) {
      console.error('Error creating appointment:', error);
      // Error ya se maneja en el hook
    }
  };

  // Eliminar cita completamente
  const handleDeleteAppointment = async (appointmentId: string) => {
    if (!window.confirm('¿Estás seguro de que deseas eliminar esta cita permanentemente? Esta acción no se puede deshacer.')) return;
    try {
      await deleteAppointment(appointmentId);
      // La recarga de datos se maneja automáticamente en el hook
    } catch (error: any) {
      console.error('Error deleting appointment:', error);
      // El error se maneja automáticamente en el hook
    }
  };

  // Estados para reagendación
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [selectedStatusAppointment, setSelectedStatusAppointment] = useState<FormattedAppointment | null>(null);
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [rescheduleAppointment, setRescheduleAppointment] = useState<FormattedAppointment | null>(null);
  const [rescheduleData, setRescheduleData] = useState({
    date: '',
    time: '',
    notes: ''
  });

  // Abrir modal de estado
  const handleOpenStatusModal = (appointment: FormattedAppointment) => {
    setSelectedStatusAppointment(appointment);
    setShowStatusModal(true);
  };

  // Cerrar modal de estado
  const handleCloseStatusModal = () => {
    setShowStatusModal(false);
    setSelectedStatusAppointment(null);
  };

  // Manejar reagendación desde modal
  const handleRescheduleFromModal = (appointmentId: string) => {
    const appointment = filteredAppointments.find(apt => apt.id === appointmentId);
    if (appointment) {
      setRescheduleAppointment(appointment);
      setRescheduleData({
        date: appointment.date,
        time: appointment.time,
        notes: appointment.notes || ''
      });
      setShowRescheduleModal(true);
    }
  };

  // Manejar reagendación
  // const handleReschedule = (appointment: FormattedAppointment) => {
  //   // Función comentada temporalmente
  // };

  // Confirmar reagendación
  const handleConfirmReschedule = async () => {
    if (!rescheduleAppointment) return;
    
    try {
      const newDateTime = new Date(`${rescheduleData.date}T${rescheduleData.time}`);
      const endDateTime = new Date(newDateTime.getTime() + (30 * 60000)); // 30 min default

      // Actualizar la cita con nueva fecha, hora y estado
      await updateAppointment(rescheduleAppointment.id, {
        start_time: newDateTime.toISOString(),
        end_time: endDateTime.toISOString(),
        status: 'rescheduled',
        notes: `Reagendada desde ${rescheduleAppointment.date} ${rescheduleAppointment.time} para ${rescheduleData.date} a las ${rescheduleData.time}. ${rescheduleData.notes}`
      });

      setShowRescheduleModal(false);
      setRescheduleAppointment(null);
      setRescheduleData({ date: '', time: '', notes: '' });
    } catch (error: any) {
      console.error('Error rescheduling appointment:', error);
    }
  };

  // Editar cita (abrir modal con datos de la cita)
  const [isEditMode, setIsEditMode] = useState(false);
  const handleEditAppointment = (appointment: FormattedAppointment) => {
    setFormData({
      patientId: appointment.original.patient_id,
      date: appointment.date,
      time: appointment.time,
      duration: 30, // Puedes mejorar esto si tienes duración real
      type: appointment.type,
      location: appointment.location,
      notes: appointment.notes || ''
    });
    setIsEditMode(true);
    setShowModal(true);
    setSelectedAppointment(appointment);
  };

  // Guardar cambios de edición
  const handleUpdateAppointment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAppointment) return;
    try {
      // Crear el objeto de fecha y hora
      // const appointmentDateTime = new Date(`${formData.date}T${formData.time}`);
      // const endDateTime = new Date(appointmentDateTime.getTime() + (formData.duration * 60000));
      // Aquí deberías tener un servicio para actualizar la cita, por ahora solo cambiamos notas y horario
      await updateAppointmentStatus(selectedAppointment.id, {
        status: selectedAppointment.status,
        notes: formData.notes || selectedAppointment.notes
      });
      setShowModal(false);
      setIsEditMode(false);
      setSelectedAppointment(null);
    } catch (error: any) {
      console.error('Error updating appointment:', error);
    }
  };

  return (
    <div className="container-fluid py-4">

      {/* Bloque de depuración visual de filtros (oculto, solo para debug) */}
      <div className="alert alert-secondary mb-3 d-none">
        <strong>Depuración de Filtros:</strong>
        <span className="ms-3">Búsqueda: <code>{searchTerm || '---'}</code></span>
        <span className="ms-3">Estado: <code>{statusFilter}</code></span>
        <span className="ms-3">Fecha: <code>{selectedDate || '---'}</code></span>
        <span className="ms-3">Citas filtradas: <b>{filteredAppointments.length}</b> / {appointments.length}</span>
        <button className="btn btn-sm btn-outline-primary ms-3" onClick={() => { setSearchTerm(''); setStatusFilter('all'); setSelectedDate(''); }}>Limpiar filtros</button>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="alert alert-warning alert-dismissible fade show" role="alert">
          <AlertCircle size={18} className="me-2" />
          {error}
          <button 
            type="button" 
            className="btn-close" 
            onClick={clearError}
            aria-label="Cerrar"
          ></button>
        </div>
      )}

      {/* Loading Indicator */}
      {loading && (
        <div className="d-flex justify-content-center mb-3">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Cargando...</span>
          </div>
        </div>
      )}

>>>>>>> nutri/main
      {/* Header */}
      <div className="row mb-4">
        <div className="col-md-8">
          <h1 className="h2 mb-1">Gestión de Citas</h1>
          <p className="text-muted">Organiza y gestiona todas tus citas con pacientes</p>
        </div>
        <div className="col-md-4 text-end">
          <button 
<<<<<<< HEAD
            className="btn btn-primary"
            onClick={() => setShowModal(true)}
=======
            className="btn btn-outline-primary me-2"
            onClick={() => navigate('/calendar')}
            title="Ver calendario visual"
          >
            <CalendarDays size={18} className="me-2" />
            Vista Calendario
          </button>
          <button 
            className="btn btn-outline-info me-2"
            onClick={() => setShowAvailability(true)}
            disabled={loading}
            title="Gestionar disponibilidad"
          >
            <Settings size={18} className="me-2" />
            Disponibilidad
          </button>
          <button 
            className="btn btn-outline-secondary me-2"
            onClick={loadAppointments}
            disabled={loading}
            title="Recargar citas manualmente"
          >
            🔄 Recargar
          </button>
          <button 
            className="btn btn-primary"
            onClick={() => setShowModal(true)}
            disabled={loading}
>>>>>>> nutri/main
          >
            <Plus size={18} className="me-2" />
            Nueva Cita
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="row mb-4">
        <div className="col-md-3">
          <div className="card border-0 shadow-sm">
            <div className="card-body">
              <div className="d-flex align-items-center">
                <div className="bg-primary bg-opacity-10 rounded-3 p-3 me-3">
                  <Calendar className="text-primary" size={24} />
                </div>
                <div>
                  <h5 className="mb-0">{todayAppointments.length}</h5>
                  <small className="text-muted">Citas hoy</small>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card border-0 shadow-sm">
            <div className="card-body">
              <div className="d-flex align-items-center">
                <div className="bg-success bg-opacity-10 rounded-3 p-3 me-3">
                  <Clock className="text-success" size={24} />
                </div>
                <div>
                  <h5 className="mb-0">{upcomingAppointments.length}</h5>
                  <small className="text-muted">Próximas citas</small>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card border-0 shadow-sm">
            <div className="card-body">
              <div className="d-flex align-items-center">
                <div className="bg-info bg-opacity-10 rounded-3 p-3 me-3">
                  <CheckCircle className="text-info" size={24} />
                </div>
                <div>
                  <h5 className="mb-0">{appointments.filter(a => a.status === 'completed').length}</h5>
                  <small className="text-muted">Completadas</small>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card border-0 shadow-sm">
            <div className="card-body">
              <div className="d-flex align-items-center">
                <div className="bg-warning bg-opacity-10 rounded-3 p-3 me-3">
                  <AlertCircle className="text-warning" size={24} />
                </div>
                <div>
<<<<<<< HEAD
                  <h5 className="mb-0">{appointments.filter(a => a.status === 'cancelled').length}</h5>
=======
                  <h5 className="mb-0">{appointments.filter(a => a.status === 'cancelled_by_patient' || a.status === 'cancelled_by_nutritionist').length}</h5>
>>>>>>> nutri/main
                  <small className="text-muted">Canceladas</small>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="row mb-4">
        <div className="col-md-6">
          <div className="input-group">
            <span className="input-group-text">
              <Search size={18} />
            </span>
            <input
              type="text"
              className="form-control"
              placeholder="Buscar por paciente o tipo de cita..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        <div className="col-md-3">
          <select 
            className="form-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">Todos los estados</option>
            <option value="scheduled">Programadas</option>
            <option value="completed">Completadas</option>
            <option value="cancelled">Canceladas</option>
<<<<<<< HEAD
            <option value="no-show">No asistió</option>
          </select>
        </div>
        <div className="col-md-3">
          <input
            type="date"
            className="form-control"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
          />
=======
            <option value="rescheduled">Reagendadas</option>
            <option value="no_show">No asistió</option>
          </select>
        </div>
        <div className="col-md-3">
          <div className="input-group">
            <input
              type="date"
              className="form-control"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
            />
            <button 
              className="btn btn-outline-secondary"
              type="button"
              onClick={() => setSelectedDate('')}
              title="Mostrar todas las fechas"
            >
              Todas
            </button>
          </div>
>>>>>>> nutri/main
        </div>
      </div>

      {/* Appointments Table */}
      <div className="card border-0 shadow-sm">
        <div className="card-header bg-white">
<<<<<<< HEAD
          <h5 className="card-title mb-0">Lista de Citas</h5>
=======
          <div className="d-flex justify-content-between align-items-center">
            <h5 className="mb-0">
              <Calendar size={18} className="me-2" />
              Lista de Citas
            </h5>
            <div className="d-flex gap-2">
              <button 
                className="btn btn-sm btn-outline-secondary"
                onClick={loadAppointments}
                disabled={loading}
                title="Recargar citas"
              >
                🔄 <span className="d-none d-sm-inline">Recargar</span>
              </button>
            </div>
          </div>
>>>>>>> nutri/main
        </div>
        <div className="card-body p-0">
          {filteredAppointments.length === 0 ? (
            <div className="text-center py-5">
              <Calendar size={48} className="text-muted mb-3" />
              <h5 className="text-muted">No se encontraron citas</h5>
              <p className="text-muted">Intenta ajustar los filtros o programa una nueva cita</p>
            </div>
          ) : (
<<<<<<< HEAD
            <div className="table-responsive">
              <table className="table table-hover mb-0">
                <thead className="table-light">
                  <tr>
                    <th>Paciente</th>
                    <th>Fecha y Hora</th>
                    <th>Tipo</th>
                    <th>Modalidad</th>
                    <th>Estado</th>
                    <th>Contacto</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAppointments.map((appointment) => (
                    <tr key={appointment.id}>
                      <td>
                        <div className="d-flex align-items-center">
                          <div className="bg-primary bg-opacity-10 rounded-circle p-2 me-3">
                            <User size={16} className="text-primary" />
                          </div>
                          <div>
                            <div className="fw-medium">{appointment.patient_name}</div>
                            <small className="text-muted">{appointment.patient_email}</small>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div>
                          <div className="fw-medium">{new Date(appointment.date).toLocaleDateString('es-ES')}</div>
                          <small className="text-muted">{appointment.time}</small>
                        </div>
                      </td>
                      <td>
                        <span className="badge bg-light text-dark">{appointment.type}</span>
                      </td>
                      <td>
                        <div className="d-flex align-items-center">
                          <MapPin size={14} className="me-1" />
                          <span className={appointment.location === 'presencial' ? 'text-success' : 'text-info'}>
                            {appointment.location === 'presencial' ? 'Presencial' : 'Virtual'}
                          </span>
                        </div>
                      </td>
                      <td>{getStatusBadge(appointment.status)}</td>
                      <td>
                        <div className="d-flex align-items-center">
                          <Phone size={14} className="me-1 text-muted" />
                          <small>{appointment.patient_phone}</small>
                        </div>
                      </td>
                      <td>
                        <div className="btn-group btn-group-sm">
                          <button 
                            className="btn btn-outline-info"
                            onClick={() => handleViewDetails(appointment)}
                            title="Ver detalles"
                          >
                            <Eye size={14} />
                          </button>
                          <button 
                            className="btn btn-outline-primary"
                            title="Editar cita"
                          >
                            <Edit size={14} />
                          </button>
                          {appointment.status === 'scheduled' && (
                            <button 
                              className="btn btn-outline-success"
                              onClick={() => handleStatusChange(appointment.id, 'completed')}
                              title="Completar cita"
                            >
                              <CheckCircle size={14} />
                            </button>
                          )}
                          <button 
                            className="btn btn-outline-danger"
                            onClick={() => handleStatusChange(appointment.id, 'cancelled')}
                            title="Cancelar cita"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
=======
            <>
              {/* Desktop Table */}
                          <div className="d-none d-md-block">
              <div className="table-responsive" style={{ overflow: 'visible' }}>
                <table className="table table-hover mb-0">
                  <thead className="table-light">
                    <tr>
                      <th style={{ minWidth: '200px' }}>Paciente</th>
                      <th style={{ minWidth: '120px' }}>Fecha y Hora</th>
                      <th className="d-lg-table-cell d-none">Tipo</th>
                      <th style={{ minWidth: '100px' }}>Estado</th>
                      <th className="d-xl-table-cell d-none">Modalidad</th>
                      <th className="d-xl-table-cell d-none" style={{ minWidth: '80px' }}>Contacto</th>
                      <th style={{ minWidth: '180px' }}>Acciones</th>
                    </tr>
                  </thead>
                    <tbody>
                      {filteredAppointments.map((appointment) => (
                        <tr key={appointment.id}>
                          <td style={{ minWidth: '200px' }}>
                            <div>
                              <strong className="d-block text-truncate" style={{ maxWidth: '180px' }}>{appointment.patient_name}</strong>
                              {appointment.patient_email && (
                                <div className="text-muted small text-truncate d-none d-lg-block" style={{ maxWidth: '180px' }}>{appointment.patient_email}</div>
                              )}
                            </div>
                          </td>
                          <td style={{ minWidth: '120px' }}>
                            <div>
                              <div className="fw-medium small">{new Date(appointment.date).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit' })}</div>
                              <small className="text-muted">{appointment.time}</small>
                            </div>
                          </td>
                          <td className="d-lg-table-cell d-none">
                            <span className="badge bg-primary small">{appointment.type}</span>
                          </td>
                          <td style={{ minWidth: '100px' }}>{getStatusBadge(appointment.status)}</td>
                          <td className="d-xl-table-cell d-none">
                            <span className={`badge small ${appointment.location === 'presencial' ? 'bg-success' : 'bg-info'}`}>
                              {appointment.location === 'presencial' ? '🏢' : '💻'}
                              <span className="d-none d-xxl-inline ms-1">
                                {appointment.location === 'presencial' ? 'Presencial' : 'Virtual'}
                              </span>
                            </span>
                          </td>
                          <td className="d-xl-table-cell d-none" style={{ minWidth: '80px' }}>
                            <div className="d-flex align-items-center">
                              <Phone size={12} className="me-1 text-muted" />
                              {appointment.patient_phone ? (
                                <a 
                                  href={`tel:${appointment.patient_phone}`}
                                  className="text-decoration-none text-primary small"
                                  title="Llamar al paciente"
                                >
                                  <span className="d-none d-xxl-inline">{appointment.patient_phone}</span>
                                  <span className="d-xxl-none">📞</span>
                                </a>
                              ) : (
                                <small className="text-muted">N/A</small>
                              )}
                            </div>
                          </td>
                          <td style={{ minWidth: '180px' }}>
                            <div className="d-flex gap-1 flex-nowrap">
                              <button 
                                className="btn btn-outline-primary btn-sm"
                                onClick={() => handleViewDetails(appointment)}
                                title="Ver detalles"
                                style={{ minWidth: '32px' }}
                              >
                                <Eye size={12} />
                              </button>
                              <button 
                                className="btn btn-outline-secondary btn-sm d-none d-lg-inline-block"
                                title="Editar cita"
                                style={{ minWidth: '32px' }}
                              >
                                <Edit size={12} />
                              </button>
                              {appointment.status === 'scheduled' && (
                                <button 
                                  className="btn btn-outline-success btn-sm d-none d-xl-inline-block"
                                  onClick={() => handleStatusChange(appointment.id, 'completed')}
                                  title="Completar cita"
                                  style={{ minWidth: '32px' }}
                                >
                                  <CheckCircle size={12} />
                                </button>
                              )}
                              {/* Botón para abrir modal de estado */}
                              <button
                                className="btn btn-outline-secondary btn-sm"
                                onClick={() => handleOpenStatusModal(appointment)}
                                title="Cambiar estado"
                                style={{ minWidth: '32px' }}
                              >
                                <Settings size={12} />
                                <span className="d-none d-lg-inline ms-1 small">Estado</span>
                              </button>
                              <button 
                                className="btn btn-outline-danger btn-sm"
                                onClick={() => handleDeleteAppointment(appointment.id)}
                                title="Eliminar cita"
                                style={{ minWidth: '32px' }}
                              >
                                <Trash2 size={12} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Mobile Cards */}
              <div className="d-md-none">
                {filteredAppointments.map((appointment) => (
                  <div key={appointment.id} className="card border-0 border-bottom rounded-0">
                    <div className="card-body">
                      <div className="d-flex justify-content-between align-items-start mb-2">
                        <div className="flex-grow-1">
                          <h6 className="mb-1 fw-bold">{appointment.patient_name}</h6>
                          {appointment.patient_email && (
                            <p className="text-muted small mb-2">{appointment.patient_email}</p>
                          )}
                          <div className="d-flex flex-wrap gap-1 mb-2">
                            {getStatusBadge(appointment.status)}
                            <span className="badge bg-primary">{appointment.type}</span>
                            <span className={`badge ${appointment.location === 'presencial' ? 'bg-success' : 'bg-info'}`}>
                              {appointment.location === 'presencial' ? '🏢 Presencial' : '💻 Virtual'}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="row g-2 mb-3">
                        <div className="col-6">
                          <small className="text-muted d-block">Fecha</small>
                          <span className="fw-medium">{new Date(appointment.date).toLocaleDateString('es-ES')}</span>
                        </div>
                        <div className="col-6">
                          <small className="text-muted d-block">Hora</small>
                          <span className="fw-medium">{appointment.time}</span>
                        </div>
                        <div className="col-6">
                          <small className="text-muted d-block">Contacto</small>
                                                        {appointment.patient_phone ? (
                                <a 
                                  href={`tel:${appointment.patient_phone}`}
                                  className="text-decoration-none text-primary fw-medium"
                                  title="Llamar al paciente"
                                >
                                  {appointment.patient_phone}
                                </a>
                              ) : (
                                <span className="fw-medium text-muted">N/A</span>
                              )}
                        </div>
                        <div className="col-6">
                          <small className="text-muted d-block">Notas</small>
                          <span className="fw-medium">{appointment.notes || 'Sin notas'}</span>
                        </div>
                      </div>
                      <div className="d-flex gap-1 flex-wrap">
                        <button 
                          className="btn btn-sm btn-outline-primary flex-fill"
                          onClick={() => handleViewDetails(appointment)}
                        >
                          <Eye size={14} className="me-1" />
                          Ver
                        </button>
                        <button 
                          className="btn btn-sm btn-outline-secondary flex-fill"
                          title="Editar cita"
                        >
                          <Edit size={14} className="me-1" />
                          Editar
                        </button>
                        {/* Botón de estado en móvil */}
                        <button
                          className="btn btn-sm btn-outline-secondary"
                          onClick={() => handleOpenStatusModal(appointment)}
                          title="Cambiar estado"
                          style={{ minWidth: '32px' }}
                        >
                          <Settings size={14} />
                        </button>
                        {appointment.status === 'scheduled' && (
                          <button 
                            className="btn btn-sm btn-outline-success flex-fill"
                            onClick={() => handleStatusChange(appointment.id, 'completed')}
                            title="Completar cita"
                          >
                            <CheckCircle size={14} className="me-1" />
                            Completar
                          </button>
                        )}
                        <button 
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => handleDeleteAppointment(appointment.id)}
                          title="Eliminar cita"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
>>>>>>> nutri/main
          )}
        </div>
      </div>

      {/* Modal for New Appointment */}
      {showModal && (
        <div className="modal fade show d-block" tabIndex={-1} style={{backgroundColor: 'rgba(0,0,0,0.5)'}}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Nueva Cita</h5>
                <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
              </div>
              <div className="modal-body">
<<<<<<< HEAD
                <form>
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Paciente</label>
                      <select className="form-select">
                        <option>Seleccionar paciente...</option>
                        <option>María González</option>
                        <option>Carlos Ruiz</option>
                        <option>Ana López</option>
                      </select>
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Tipo de cita</label>
                      <select className="form-select">
                        <option>Consulta inicial</option>
                        <option>Seguimiento</option>
                        <option>Control de peso</option>
                        <option>Consulta especializada</option>
=======
                <form onSubmit={isEditMode ? handleUpdateAppointment : handleCreateAppointment}>
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label" htmlFor="appointment-patient">Paciente *</label>
                      <select 
                        className="form-select" 
                        id="appointment-patient" 
                        name="patientId"
                        value={formData.patientId}
                        onChange={handleFormChange}
                        required
                        aria-label="Seleccionar paciente para la cita"
                      >
                        <option value="">Seleccionar paciente...</option>
                        {patients.map(patient => (
                          <option key={patient.id} value={patient.id}>
                            {patient.first_name} {patient.last_name}
                          </option>
                        ))}
                        {patients.length === 0 && (
                          <option disabled>No hay pacientes disponibles</option>
                        )}
                      </select>
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label" htmlFor="appointment-type">Tipo de cita</label>
                      <select 
                        className="form-select" 
                        id="appointment-type" 
                        name="type"
                        value={formData.type}
                        onChange={handleFormChange}
                        aria-label="Seleccionar tipo de cita"
                      >
                        <option value="">Seleccionar tipo...</option>
                        <option value="consultation">Consulta inicial</option>
                        <option value="follow-up">Seguimiento</option>
                        <option value="weight-check">Control de peso</option>
                        <option value="specialized">Consulta especializada</option>
>>>>>>> nutri/main
                      </select>
                    </div>
                  </div>
                  <div className="row">
<<<<<<< HEAD
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Fecha</label>
                      <input type="date" className="form-control" />
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Hora</label>
                      <input type="time" className="form-control" />
                    </div>
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
=======
                    <div className="col-md-6">
                      <div className="mb-3">
                        <label className="form-label" htmlFor="appointment-date">Fecha *</label>
                        <input 
                          type="date" 
                          className="form-control" 
                          id="appointment-date"
                          name="date"
                          value={formData.date}
                          onChange={handleFormChange}
                          min={new Date().toISOString().split('T')[0]}
                          required
                          autoComplete="off"
                          aria-label="Fecha de la cita"
                        />
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="mb-3">
                        <label className="form-label" htmlFor="appointment-time">Hora *</label>
                        <input 
                          type="time" 
                          className="form-control" 
                          id="appointment-time"
                          name="time"
                          value={formData.time}
                          onChange={handleFormChange}
                          required
                          autoComplete="off"
                          aria-label="Hora de la cita"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label" htmlFor="appointment-duration">Duración (minutos)</label>
                      <select 
                        className="form-select" 
                        id="appointment-duration" 
                        name="duration"
                        value={formData.duration}
                        onChange={handleFormChange}
                        aria-label="Duración de la cita"
                      >
                        <option value={30}>30 minutos</option>
                        <option value={45}>45 minutos</option>
                        <option value={60}>60 minutos</option>
                        <option value={90}>90 minutos</option>
                      </select>
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label" htmlFor="appointment-location">Modalidad</label>
                      <div>
                        <div className="form-check form-check-inline">
                          <input 
                            className="form-check-input" 
                            type="radio" 
                            name="location" 
                            id="presencial" 
                            value="presencial"
                            checked={formData.location === 'presencial'}
                            onChange={handleFormChange}
                            aria-label="Cita presencial"
                          />
                          <label className="form-check-label" htmlFor="presencial">
                            Presencial
                          </label>
                        </div>
                        <div className="form-check form-check-inline">
                          <input 
                            className="form-check-input" 
                            type="radio" 
                            name="location" 
                            id="virtual" 
                            value="virtual"
                            checked={formData.location === 'virtual'}
                            onChange={handleFormChange}
                            aria-label="Cita virtual"
                          />
                          <label className="form-check-label" htmlFor="virtual">
                            Virtual
                          </label>
                        </div>
>>>>>>> nutri/main
                      </div>
                    </div>
                  </div>
                  <div className="mb-3">
<<<<<<< HEAD
                    <label className="form-label">Notas adicionales</label>
                    <textarea className="form-control" rows={3} placeholder="Información adicional sobre la cita..."></textarea>
=======
                    <label className="form-label" htmlFor="appointment-notes">Notas adicionales</label>
                    <textarea 
                      className="form-control" 
                      id="appointment-notes"
                      name="notes"
                      value={formData.notes}
                      onChange={handleFormChange}
                      rows={3} 
                      placeholder="Observaciones sobre la cita..."
                      autoComplete="off"
                      aria-label="Notas adicionales de la cita"
                    />
>>>>>>> nutri/main
                  </div>
                </form>
              </div>
              <div className="modal-footer">
<<<<<<< HEAD
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
                  Cancelar
                </button>
                <button type="button" className="btn btn-primary">
                  Programar Cita
=======
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  onClick={() => setShowModal(false)}
                  disabled={loading}
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  className="btn btn-primary"
                  onClick={isEditMode ? handleUpdateAppointment : handleCreateAppointment}
                  disabled={loading || !formData.patientId || !formData.date || !formData.time}
                >
                  {loading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                      {isEditMode ? 'Actualizando...' : 'Creando...'}
                    </>
                  ) : (
                    isEditMode ? 'Actualizar Cita' : 'Programar Cita'
                  )}
>>>>>>> nutri/main
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal for Appointment Details */}
      {showDetailModal && selectedAppointment && (
        <div className="modal fade show d-block" tabIndex={-1} style={{backgroundColor: 'rgba(0,0,0,0.5)'}}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Detalles de la Cita</h5>
                <button type="button" className="btn-close" onClick={() => setShowDetailModal(false)}></button>
              </div>
              <div className="modal-body">
                <div className="row">
                  <div className="col-md-6">
                    <h6 className="text-primary">Información del Paciente</h6>
                    <div className="mb-3">
                      <strong>Nombre:</strong> {selectedAppointment.patient_name}<br />
                      <strong>Email:</strong> {selectedAppointment.patient_email}<br />
<<<<<<< HEAD
                      <strong>Teléfono:</strong> {selectedAppointment.patient_phone}
=======
                      <strong>Teléfono:</strong> {selectedAppointment.patient_phone ? (
                  <a 
                    href={`tel:${selectedAppointment.patient_phone}`}
                    className="text-decoration-none text-primary ms-1"
                    title="Llamar al paciente"
                  >
                    {selectedAppointment.patient_phone}
                  </a>
                ) : (
                  <span className="text-muted ms-1">N/A</span>
                )}
>>>>>>> nutri/main
                    </div>
                  </div>
                  <div className="col-md-6">
                    <h6 className="text-primary">Información de la Cita</h6>
                    <div className="mb-3">
                      <strong>Fecha:</strong> {new Date(selectedAppointment.date).toLocaleDateString('es-ES')}<br />
                      <strong>Hora:</strong> {selectedAppointment.time}<br />
                      <strong>Tipo:</strong> {selectedAppointment.type}<br />
                      <strong>Modalidad:</strong> {selectedAppointment.location === 'presencial' ? 'Presencial' : 'Virtual'}<br />
                      <strong>Estado:</strong> {getStatusBadge(selectedAppointment.status)}
                    </div>
                  </div>
                </div>
                {selectedAppointment.notes && (
                  <div className="mb-3">
                    <h6 className="text-primary">Notas</h6>
                    <p className="text-muted">{selectedAppointment.notes}</p>
                  </div>
                )}
                <div className="row">
                  <div className="col-12">
                    <h6 className="text-primary">Acciones Rápidas</h6>
                    <div className="d-flex gap-2 flex-wrap">
                      {selectedAppointment.status === 'scheduled' && (
                        <>
                          <button 
                            className="btn btn-success btn-sm"
                            onClick={() => {
                              handleStatusChange(selectedAppointment.id, 'completed');
                              setShowDetailModal(false);
                            }}
                          >
                            <CheckCircle size={16} className="me-1" />
                            Marcar Completada
                          </button>
                          <button 
                            className="btn btn-warning btn-sm"
                            onClick={() => {
<<<<<<< HEAD
                              handleStatusChange(selectedAppointment.id, 'no-show');
=======
                              handleStatusChange(selectedAppointment.id, 'no_show');
>>>>>>> nutri/main
                              setShowDetailModal(false);
                            }}
                          >
                            <AlertCircle size={16} className="me-1" />
                            No Asistió
                          </button>
                        </>
                      )}
                      <button 
                        className="btn btn-danger btn-sm"
                        onClick={() => {
<<<<<<< HEAD
                          handleStatusChange(selectedAppointment.id, 'cancelled');
=======
                          handleDeleteAppointment(selectedAppointment.id);
>>>>>>> nutri/main
                          setShowDetailModal(false);
                        }}
                      >
                        <Trash2 size={16} className="me-1" />
<<<<<<< HEAD
                        Cancelar Cita
                      </button>
                      <button className="btn btn-primary btn-sm">
=======
                        Eliminar Cita
                      </button>
                      <button 
                        className="btn btn-primary btn-sm"
                        onClick={() => {
                          handleEditAppointment(selectedAppointment);
                          setShowDetailModal(false);
                        }}
                      >
>>>>>>> nutri/main
                        <Edit size={16} className="me-1" />
                        Editar Cita
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowDetailModal(false)}>
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
<<<<<<< HEAD
=======

      {/* AvailabilityManager Modal */}
      {showAvailability && (
        <div className="modal fade show d-block" tabIndex={-1} style={{backgroundColor: 'rgba(0,0,0,0.5)'}}>
          <div className="modal-dialog modal-xl">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Gestionar Disponibilidad</h5>
                <button type="button" className="btn-close" onClick={() => setShowAvailability(false)}></button>
              </div>
              <div className="modal-body">
                <AvailabilityManager />
              </div>
              <div className="modal-footer">
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  onClick={() => setShowAvailability(false)}
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Estado */}
      <StatusModal
        isOpen={showStatusModal}
        onClose={handleCloseStatusModal}
        appointmentId={selectedStatusAppointment?.id || ''}
        patientName={selectedStatusAppointment?.patient_name || ''}
        onStatusChange={handleStatusChange}
        onReschedule={handleRescheduleFromModal}
      />

      {/* Modal de Reagendación */}
      {showRescheduleModal && rescheduleAppointment && (
        <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  <CalendarDays size={20} className="me-2" />
                  Reagendar Cita
                </h5>
                <button 
                  type="button" 
                  className="btn-close"
                  onClick={() => {
                    setShowRescheduleModal(false);
                    setRescheduleAppointment(null);
                  }}
                ></button>
              </div>
              <div className="modal-body">
                <div className="mb-3">
                  <strong>Paciente:</strong> {rescheduleAppointment.patient_name}<br />
                  <strong>Cita actual:</strong> {rescheduleAppointment.date} a las {rescheduleAppointment.time}
                </div>
                
                <form>
                  <div className="row">
                    <div className="col-md-6">
                      <label htmlFor="reschedule-date" className="form-label">Nueva Fecha</label>
                      <input
                        type="date"
                        id="reschedule-date"
                        className="form-control"
                        value={rescheduleData.date}
                        onChange={(e) => setRescheduleData(prev => ({ ...prev, date: e.target.value }))}
                      />
                    </div>
                    <div className="col-md-6">
                      <label htmlFor="reschedule-time" className="form-label">Nueva Hora</label>
                      <input
                        type="time"
                        id="reschedule-time"
                        className="form-control"
                        value={rescheduleData.time}
                        onChange={(e) => setRescheduleData(prev => ({ ...prev, time: e.target.value }))}
                      />
                    </div>
                  </div>
                  <div className="mt-3">
                    <label htmlFor="reschedule-notes" className="form-label">Notas adicionales</label>
                    <textarea
                      id="reschedule-notes"
                      className="form-control"
                      rows={3}
                      value={rescheduleData.notes}
                      onChange={(e) => setRescheduleData(prev => ({ ...prev, notes: e.target.value }))}
                      placeholder="Razón de la reagendación..."
                    />
                  </div>
                </form>
              </div>
              <div className="modal-footer">
                <button 
                  type="button" 
                  className="btn btn-secondary"
                  onClick={() => {
                    setShowRescheduleModal(false);
                    setRescheduleAppointment(null);
                  }}
                >
                  Cancelar
                </button>
                <button 
                  type="button" 
                  className="btn btn-primary"
                  onClick={handleConfirmReschedule}
                  disabled={!rescheduleData.date || !rescheduleData.time}
                >
                  <CalendarDays size={16} className="me-2" />
                  Confirmar Reagendación
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
>>>>>>> nutri/main
    </div>
  );
};

export default AppointmentsPage; 