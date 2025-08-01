import React, { useState } from 'react';
import { Card, Button, Modal, Alert } from 'react-bootstrap';
import { Calendar, TestTube, ArrowLeft, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import AppointmentBooking from '../components/AppointmentBooking';
import AppointmentReschedule from '../components/AppointmentReschedule';
import type { AppointmentType } from '../services/appointmentsService';

const AppointmentBookingTestPage: React.FC = () => {
  const navigate = useNavigate();
  const [showBooking, setShowBooking] = useState(false);
  const [showReschedule, setShowReschedule] = useState(false);
  const [lastBookedAppointment, setLastBookedAppointment] = useState<AppointmentType | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  // Datos de prueba para nutriólogo
  const testNutritionist = {
    id: 'ffde8e9e-b6c5-46da-a2e6-67fa408ea051', // ID del nutriólogo por defecto del sistema
    name: 'Dr. Nutriólogo Sistema'
  };

  // Cita de prueba para reagendar
  const testAppointment: AppointmentType = {
    id: 'test-appointment-id',
    patient_id: 'current-user-id',
    nutritionist_id: testNutritionist.id,
    start_time: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Mañana
    end_time: new Date(Date.now() + 24 * 60 * 60 * 1000 + 30 * 60 * 1000).toISOString(),
    status: 'scheduled',
    notes: 'Cita de prueba para reagendar',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    nutritionist: {
      id: testNutritionist.id,
      first_name: 'Dr. Nutriólogo',
      last_name: 'Sistema',
      email: 'nutri.admin@sistema.com'
    }
  };

  const handleBookingComplete = (appointment: AppointmentType) => {
    setLastBookedAppointment(appointment);
    setMessage('¡Cita reservada exitosamente!');
    setShowBooking(false);
  };

  const handleRescheduleComplete = (appointment: AppointmentType) => {
    setMessage(`Cita reagendada exitosamente para ${new Date(appointment.start_time).toLocaleDateString('es-ES')}`);
    setShowReschedule(false);
  };

  return (
    <div className="container-fluid py-4">
      {/* Header */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="d-flex align-items-center mb-3">
            <Button 
              variant="outline-secondary" 
              size="sm" 
              onClick={() => navigate('/dashboard')}
              className="me-3"
            >
              <ArrowLeft size={16} className="me-1" />
              Volver
            </Button>
            <div>
              <h1 className="h2 mb-1">
                <TestTube size={28} className="me-2" />
                Sistema de Reservas - Página de Prueba
              </h1>
              <p className="text-muted mb-0">
                Prueba las nuevas funcionalidades de reserva y reagendación de citas
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Message Display */}
      {message && (
        <Alert variant="success" dismissible onClose={() => setMessage(null)}>
          {message}
        </Alert>
      )}

      {/* Features Overview */}
      <div className="row mb-4">
        <div className="col-md-6">
          <Card className="h-100 border-0 shadow-sm">
            <Card.Header className="bg-primary text-white">
              <h5 className="mb-0">
                <Calendar size={20} className="me-2" />
                Reserva de Citas
              </h5>
            </Card.Header>
            <Card.Body>
              <h6>Funcionalidades Implementadas:</h6>
              <ul className="mb-3">
                <li>✅ Vista semanal de disponibilidad</li>
                <li>✅ Slots de 30 minutos</li>
                <li>✅ Validación de disponibilidad real</li>
                <li>✅ Prevención de empalmes</li>
                <li>✅ Modalidad presencial/virtual</li>
                <li>✅ Notas personalizadas</li>
                <li>✅ Navegación entre semanas</li>
              </ul>
              <Button 
                variant="primary" 
                onClick={() => setShowBooking(true)}
                className="w-100"
              >
                Probar Reserva de Cita
              </Button>
            </Card.Body>
          </Card>
        </div>

        <div className="col-md-6">
          <Card className="h-100 border-0 shadow-sm">
            <Card.Header className="bg-warning text-dark">
              <h5 className="mb-0">
                <User size={20} className="me-2" />
                Reagendación de Citas
              </h5>
            </Card.Header>
            <Card.Body>
              <h6>Funcionalidades Implementadas:</h6>
              <ul className="mb-3">
                <li>✅ Vista de cita actual</li>
                <li>✅ Selección de nuevo horario</li>
                <li>✅ Validación de conflictos</li>
                <li>✅ Confirmación visual</li>
                <li>✅ Comparación de horarios</li>
                <li>✅ Estados de carga</li>
                <li>✅ Manejo de errores</li>
              </ul>
              <Button 
                variant="warning" 
                onClick={() => setShowReschedule(true)}
                className="w-100"
              >
                Probar Reagendación
              </Button>
            </Card.Body>
          </Card>
        </div>
      </div>

      {/* Technical Details */}
      <div className="row mb-4">
        <div className="col-12">
          <Card className="border-0 shadow-sm">
            <Card.Header className="bg-info text-white">
              <h5 className="mb-0">Detalles Técnicos Implementados</h5>
            </Card.Header>
            <Card.Body>
              <div className="row">
                <div className="col-md-4">
                  <h6>🔧 Backend (APIs Nuevas)</h6>
                  <ul className="small">
                    <li><code>GET /appointments/nutritionist/:id/appointments</code></li>
                    <li><code>GET /appointments/nutritionist/:id/available-slots</code></li>
                    <li>Cálculo de slots disponibles en tiempo real</li>
                    <li>Validación de empalmes automática</li>
                  </ul>
                </div>
                <div className="col-md-4">
                  <h6>⚛️ Frontend (Componentes)</h6>
                  <ul className="small">
                    <li><code>AppointmentBooking.tsx</code></li>
                    <li><code>AppointmentReschedule.tsx</code></li>
                    <li>Hooks actualizados para nuevas APIs</li>
                    <li>Estados de carga y error mejorados</li>
                  </ul>
                </div>
                <div className="col-md-4">
                  <h6>✨ Funcionalidades Clave</h6>
                  <ul className="small">
                    <li>Disponibilidad = Horarios - Citas ocupadas</li>
                    <li>Slots de 30 minutos automáticos</li>
                    <li>Solo horarios futuros disponibles</li>
                    <li>Validación de conflictos en tiempo real</li>
                  </ul>
                </div>
              </div>
            </Card.Body>
          </Card>
        </div>
      </div>

      {/* Last Booked Appointment */}
      {lastBookedAppointment && (
        <div className="row">
          <div className="col-12">
            <Alert variant="success">
              <h6>Última Cita Reservada:</h6>
              <div><strong>Fecha:</strong> {new Date(lastBookedAppointment.start_time).toLocaleDateString('es-ES')}</div>
              <div><strong>Hora:</strong> {new Date(lastBookedAppointment.start_time).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}</div>
              <div><strong>Nutriólogo:</strong> {testNutritionist.name}</div>
              {lastBookedAppointment.notes && <div><strong>Notas:</strong> {lastBookedAppointment.notes}</div>}
            </Alert>
          </div>
        </div>
      )}

      {/* Booking Modal */}
      <Modal 
        show={showBooking} 
        onHide={() => setShowBooking(false)} 
        size="xl" 
        centered
      >
        <Modal.Body className="p-0">
          <AppointmentBooking
            nutritionistId={testNutritionist.id}
            nutritionistName={testNutritionist.name}
            onBookingComplete={handleBookingComplete}
            onClose={() => setShowBooking(false)}
          />
        </Modal.Body>
      </Modal>

      {/* Reschedule Modal */}
      <Modal 
        show={showReschedule} 
        onHide={() => setShowReschedule(false)} 
        size="xl" 
        centered
      >
        <Modal.Body className="p-0">
          <AppointmentReschedule
            appointment={testAppointment}
            onRescheduleComplete={handleRescheduleComplete}
            onCancel={() => setShowReschedule(false)}
          />
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default AppointmentBookingTestPage; 