import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Plus, Search, MapPin, User, Phone, Edit, Trash2, CheckCircle, AlertCircle, Eye } from 'lucide-react';

interface Appointment {
  id: number;
  patient_name: string;
  patient_email: string;
  patient_phone: string;
  date: string;
  time: string;
  type: string;
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
  });

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      scheduled: { class: 'bg-primary text-white', text: 'Programada' },
      completed: { class: 'bg-success text-white', text: 'Completada' },
      cancelled: { class: 'bg-danger text-white', text: 'Cancelada' },
      'no-show': { class: 'bg-warning text-dark', text: 'No asistió' }
    };
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.scheduled;
    return <span className={`badge ${config.class}`}>{config.text}</span>;
  };

  const todayAppointments = appointments.filter(apt => apt.date === new Date().toISOString().split('T')[0]);
  const upcomingAppointments = appointments.filter(apt => new Date(apt.date) > new Date() && apt.status === 'scheduled');

  const handleStatusChange = (appointmentId: number, newStatus: 'scheduled' | 'completed' | 'cancelled' | 'no-show') => {
    setAppointments(prev => prev.map(apt => 
      apt.id === appointmentId ? { ...apt, status: newStatus } : apt
    ));
  };

  const handleViewDetails = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setShowDetailModal(true);
  };

  return (
    <div className="container-fluid py-4">
      {/* Header */}
      <div className="row mb-4">
        <div className="col-md-8">
          <h1 className="h2 mb-1">Gestión de Citas</h1>
          <p className="text-muted">Organiza y gestiona todas tus citas con pacientes</p>
        </div>
        <div className="col-md-4 text-end">
          <button 
            className="btn btn-primary"
            onClick={() => setShowModal(true)}
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
                  <h5 className="mb-0">{appointments.filter(a => a.status === 'cancelled').length}</h5>
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
        </div>
      </div>

      {/* Appointments Table */}
      <div className="card border-0 shadow-sm">
        <div className="card-header bg-white">
          <h5 className="card-title mb-0">Lista de Citas</h5>
        </div>
        <div className="card-body p-0">
          {filteredAppointments.length === 0 ? (
            <div className="text-center py-5">
              <Calendar size={48} className="text-muted mb-3" />
              <h5 className="text-muted">No se encontraron citas</h5>
              <p className="text-muted">Intenta ajustar los filtros o programa una nueva cita</p>
            </div>
          ) : (
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
                <form>
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label" htmlFor="appointment-patient">Paciente</label>
                      <select 
                        className="form-select" 
                        id="appointment-patient" 
                        name="appointment-patient"
                        aria-label="Seleccionar paciente para la cita"
                      >
                        <option value="">Seleccionar paciente...</option>
                        <option value="1">María González</option>
                        <option value="2">Carlos Ruiz</option>
                        <option value="3">Ana López</option>
                      </select>
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label" htmlFor="appointment-type">Tipo de cita</label>
                      <select 
                        className="form-select" 
                        id="appointment-type" 
                        name="appointment-type"
                        aria-label="Seleccionar tipo de cita"
                      >
                        <option value="">Seleccionar tipo...</option>
                        <option value="consultation">Consulta inicial</option>
                        <option value="follow-up">Seguimiento</option>
                        <option value="weight-check">Control de peso</option>
                        <option value="specialized">Consulta especializada</option>
                      </select>
                    </div>
                  </div>
                  <div className="row">
                    <div className="col-md-6">
                      <div className="mb-3">
                        <label className="form-label" htmlFor="appointment-date">Fecha</label>
                        <input 
                          type="date" 
                          className="form-control" 
                          id="appointment-date"
                          name="appointment-date"
                          autoComplete="off"
                          aria-label="Fecha de la cita"
                        />
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="mb-3">
                        <label className="form-label" htmlFor="appointment-time">Hora</label>
                        <input 
                          type="time" 
                          className="form-control" 
                          id="appointment-time"
                          name="appointment-time"
                          autoComplete="off"
                          aria-label="Hora de la cita"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="mb-3">
                    <label className="form-label" htmlFor="appointment-location">Modalidad</label>
                    <div>
                      <div className="form-check form-check-inline">
                        <input 
                          className="form-check-input" 
                          type="radio" 
                          name="location" 
                          id="presencial" 
                          value="presencial"
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
                          aria-label="Cita virtual"
                        />
                        <label className="form-check-label" htmlFor="virtual">
                          Virtual
                        </label>
                      </div>
                    </div>
                  </div>
                  <div className="mb-3">
                    <label className="form-label" htmlFor="appointment-notes">Notas adicionales</label>
                    <textarea 
                      className="form-control" 
                      id="appointment-notes"
                      name="appointment-notes"
                      rows={3} 
                      placeholder="Observaciones sobre la cita..."
                      autoComplete="off"
                      aria-label="Notas adicionales de la cita"
                    />
                  </div>
                </form>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
                  Cancelar
                </button>
                <button type="button" className="btn btn-primary">
                  Programar Cita
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
                      <strong>Teléfono:</strong> {selectedAppointment.patient_phone}
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
                              handleStatusChange(selectedAppointment.id, 'no-show');
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
                          handleStatusChange(selectedAppointment.id, 'cancelled');
                          setShowDetailModal(false);
                        }}
                      >
                        <Trash2 size={16} className="me-1" />
                        Cancelar Cita
                      </button>
                      <button className="btn btn-primary btn-sm">
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
    </div>
  );
};

export default AppointmentsPage; 