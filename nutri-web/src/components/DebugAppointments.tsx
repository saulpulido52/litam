import React from 'react';
import { useAppointments } from '../hooks/useAppointments';
import { Card, Badge} from 'react-bootstrap';
import { Bug, Calendar, Clock, AlertCircle, User } from 'lucide-react';

const DebugAppointments: React.FC = () => {
  const { appointments, loading, error } = useAppointments();

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleString('es-ES');
    } catch {
      return dateStr;
    }
  };

  return (
    <Card className="mt-4 border-warning">
      <Card.Header className="bg-warning text-dark">
        <h6 className="mb-0">
          <Bug size={16} className="me-2" />
          Debug: Estado de Citas
        </h6>
      </Card.Header>
      <Card.Body>
        <div className="row">
          {/* Estado General */}
          <div className="col-md-4">
            <h6>📊 Estado del Hook</h6>
            <div className="mb-2">
              <Badge bg={loading ? 'warning' : 'success'}>
                {loading ? 'Cargando...' : 'Cargado'}
              </Badge>
            </div>
            {error && (
              <div className="mb-2">
                <Badge bg="danger">
                  <AlertCircle size={12} className="me-1" />
                  Error: {error}
                </Badge>
              </div>
            )}
            <div>
              <strong>Total citas:</strong> {appointments?.length || 0}
            </div>
          </div>

          {/* Datos Crudos */}
          <div className="col-md-8">
            <h6>🔍 Datos del Backend</h6>
            {appointments && appointments.length > 0 ? (
              <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                {appointments.map((apt, index) => (
                  <div key={index} className="border rounded p-2 mb-2 small">
                    <div><strong>ID:</strong> {apt.id}</div>
                    <div><strong>Paciente:</strong> {apt.patient?.first_name} {apt.patient?.last_name}</div>
                    <div><strong>Inicio:</strong> {formatDate(apt.start_time)}</div>
                    <div><strong>Fin:</strong> {formatDate(apt.end_time)}</div>
                    <div><strong>Estado:</strong> {apt.status}</div>
                    <div><strong>Notas:</strong> {apt.notes || 'Sin notas'}</div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-muted">
                <Calendar size={24} className="d-block mx-auto mb-2" />
                <div className="text-center">No hay citas disponibles</div>
              </div>
            )}
          </div>
        </div>

        {/* Análisis por Fechas */}
        {appointments && appointments.length > 0 && (
          <div className="mt-3">
            <h6>📅 Análisis por Fechas</h6>
            <div className="row">
              {(() => {
                const eventsByDate: { [key: string]: number } = {};
                const today = new Date().toISOString().split('T')[0];
                
                appointments.forEach(apt => {
                  const date = new Date(apt.start_time).toISOString().split('T')[0];
                  eventsByDate[date] = (eventsByDate[date] || 0) + 1;
                });

                return Object.entries(eventsByDate).map(([date, count]) => (
                  <div key={date} className="col-md-6 mb-2">
                    <div className={`p-2 rounded ${date === today ? 'bg-primary text-white' : 'bg-light'}`}>
                      <div className="d-flex justify-content-between">
                        <span>
                          <Clock size={14} className="me-1" />
                          {new Date(date).toLocaleDateString('es-ES')}
                          {date === today && ' (HOY)'}
                        </span>
                        <Badge bg={date === today ? 'light' : 'primary'} text={date === today ? 'dark' : 'white'}>
                          {count} cita{count !== 1 ? 's' : ''}
                        </Badge>
                      </div>
                    </div>
                  </div>
                ));
              })()}
            </div>
          </div>
        )}

        {/* Citas de Hoy */}
        {appointments && appointments.length > 0 && (
          <div className="mt-3">
            <h6>🔥 Citas de Hoy</h6>
            {(() => {
              const today = new Date().toISOString().split('T')[0];
              const todayAppointments = appointments.filter(apt => {
                const aptDate = new Date(apt.start_time).toISOString().split('T')[0];
                return aptDate === today;
              });

              if (todayAppointments.length === 0) {
                return <div className="text-muted small">No hay citas programadas para hoy</div>;
              }

              return (
                <div className="row">
                  {todayAppointments.map((apt, index) => (
                    <div key={index} className="col-md-6 mb-2">
                      <div className="bg-success text-white p-2 rounded">
                        <div className="d-flex justify-content-between align-items-center">
                          <div>
                            <User size={14} className="me-1" />
                            {apt.patient?.first_name} {apt.patient?.last_name}
                          </div>
                          <div>
                            {new Date(apt.start_time).toLocaleTimeString('es-ES', { 
                              hour: '2-digit', 
                              minute: '2-digit' 
                            })}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              );
            })()}
          </div>
        )}
      </Card.Body>
    </Card>
  );
};

export default DebugAppointments;
