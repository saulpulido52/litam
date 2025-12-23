import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Button, Table, Modal, InputGroup, Badge, Alert, Spinner, Form } from 'react-bootstrap';
import adminService from '../../services/adminService';
import type { AdminAppointment, AdminCreateAppointmentDto, AdminUser } from '../../services/adminService';

// React Icons
import { 
  MdAdd,
  MdEdit,
  MdDelete,
  MdEvent,
  // MdPerson,
  MdClose,
  MdSave,
  MdRefresh
} from 'react-icons/md';

const AdminAppointmentsTab: React.FC = () => {
  const [appointments, setAppointments] = useState<AdminAppointment[]>([]);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Modales
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<AdminAppointment | null>(null);

  // Formularios
  const [createForm, setCreateForm] = useState<AdminCreateAppointmentDto>({
    patientId: '',
    nutritionistId: '',
    appointmentDate: '',
    status: 'scheduled',
    notes: ''
  });

  // Filtros y paginación
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  // Cargar datos
  useEffect(() => {
    loadAppointments();
    loadUsers();
  }, [currentPage]);

  const loadAppointments = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await adminService.getAllAppointments({ page: currentPage, limit: 10 });
      setAppointments((response as any).appointments || []);
      setTotalPages((response as any).totalPages || 1);
    } catch (err: any) {
      setError('Error al cargar las citas: ' + (err.message || 'Error desconocido'));
    } finally {
      setLoading(false);
    }
  };

  const loadUsers = async () => {
    try {
      const response = await adminService.getAllUsers({ limit: 1000 });
      setUsers((response as any).users || []);
    } catch (err: any) {
      console.error('Error al cargar usuarios:', err);
    }
  };

  const handleCreateAppointment = async () => {
    if (!createForm.patientId || !createForm.nutritionistId || !createForm.appointmentDate) {
      setError('Por favor complete todos los campos requeridos');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await adminService.createAppointment(createForm);
      setSuccess('Cita creada exitosamente');
      setShowCreateModal(false);
      resetCreateForm();
      loadAppointments();
    } catch (err: any) {
      setError('Error al crear la cita: ' + (err.message || 'Error desconocido'));
    } finally {
      setLoading(false);
    }
  };

  const handleEditAppointment = async () => {
    if (!selectedAppointment) return;

    setLoading(true);
    setError(null);
    try {
      await adminService.updateAppointment(selectedAppointment.id, {
        appointmentDate: createForm.appointmentDate,
        status: createForm.status,
        notes: createForm.notes
      });
      setSuccess('Cita actualizada exitosamente');
      setShowEditModal(false);
      setSelectedAppointment(null);
      resetCreateForm();
      loadAppointments();
    } catch (err: any) {
      setError('Error al actualizar la cita: ' + (err.message || 'Error desconocido'));
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAppointment = async () => {
    if (!selectedAppointment) return;

    setLoading(true);
    setError(null);
    try {
      await adminService.deleteAppointment(selectedAppointment.id);
      setSuccess('Cita eliminada exitosamente');
      setShowDeleteModal(false);
      setSelectedAppointment(null);
      loadAppointments();
    } catch (err: any) {
      setError('Error al eliminar la cita: ' + (err.message || 'Error desconocido'));
    } finally {
      setLoading(false);
    }
  };

  const resetCreateForm = () => {
    setCreateForm({
      patientId: '',
      nutritionistId: '',
      appointmentDate: '',
      status: 'scheduled',
      notes: ''
    });
  };

  const openEditModal = (appointment: AdminAppointment) => {
    setSelectedAppointment(appointment);
    setCreateForm({
      patientId: appointment.patient.id,
      nutritionistId: appointment.nutritionist.id,
      appointmentDate: appointment.appointment_date.slice(0, 16), // Para datetime-local
      status: appointment.status,
      notes: appointment.notes || ''
    });
    setShowEditModal(true);
  };

  // Filtrar citas
  const filteredAppointments = appointments.filter(appointment => {
    const matchesSearch = 
      appointment.patient.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      appointment.patient.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      appointment.nutritionist.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      appointment.nutritionist.last_name.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = !statusFilter || appointment.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    const variants: { [key: string]: string } = {
      scheduled: 'primary',
      completed: 'success',
      canceled: 'danger',
      pending: 'warning'
    };
    return <Badge bg={variants[status] || 'secondary'}>{status}</Badge>;
  };

  const patients = users.filter(user => user.role.name === 'PATIENT');
  const nutritionists = users.filter(user => user.role.name === 'NUTRITIONIST');

  return (
    <div>
      {/* Alertas */}
      {error && (
        <Alert variant="danger" dismissible onClose={() => setError(null)}>
          {error}
        </Alert>
      )}
      {success && (
        <Alert variant="success" dismissible onClose={() => setSuccess(null)}>
          {success}
        </Alert>
      )}

      {/* Controles */}
      <Row className="mb-3">
        <Col md={3}>
          <InputGroup>
            <InputGroup.Text><MdRefresh /></InputGroup.Text>
            <Form.Control
              type="text"
              placeholder="Buscar citas..."
              value={searchTerm}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
            />
          </InputGroup>
        </Col>
        <Col md={3}>
          <Form.Select
            value={statusFilter}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setStatusFilter(e.target.value)}
          >
            <option value="">Todos los estados</option>
            <option value="scheduled">Programadas</option>
            <option value="completed">Completadas</option>
            <option value="canceled">Canceladas</option>
            <option value="pending">Pendientes</option>
          </Form.Select>
        </Col>
        <Col md={6} className="text-end">
          <Button
            variant="outline-primary"
            onClick={loadAppointments}
            disabled={loading}
            className="me-2"
          >
            <MdRefresh /> Actualizar
          </Button>
          <Button
            variant="primary"
            onClick={() => setShowCreateModal(true)}
          >
            <MdAdd /> Nueva Cita
          </Button>
        </Col>
      </Row>

      {/* Tabla de citas */}
      <Card>
        <Card.Header>
          <h5><MdEvent /> Gestión de Citas</h5>
        </Card.Header>
        <Card.Body>
          {loading ? (
            <div className="text-center">
              <Spinner animation="border" />
              <p>Cargando citas...</p>
            </div>
          ) : (
            <Table striped bordered hover responsive>
              <thead>
                <tr>
                  <th>Fecha y Hora</th>
                  <th>Paciente</th>
                  <th>Nutriólogo</th>
                  <th>Estado</th>
                  <th>Notas</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredAppointments.map((appointment) => (
                  <tr key={appointment.id}>
                    <td>{new Date(appointment.appointment_date).toLocaleString('es-ES')}</td>
                    <td>
                      <div>
                        <strong>{appointment.patient.first_name} {appointment.patient.last_name}</strong>
                        <br />
                        <small className="text-muted">{appointment.patient.email}</small>
                      </div>
                    </td>
                    <td>
                      <div>
                        <strong>{appointment.nutritionist.first_name} {appointment.nutritionist.last_name}</strong>
                        <br />
                        <small className="text-muted">{appointment.nutritionist.email}</small>
                      </div>
                    </td>
                    <td>{getStatusBadge(appointment.status)}</td>
                    <td>{appointment.notes || '-'}</td>
                    <td>
                      <Button
                        variant="outline-primary"
                        size="sm"
                        onClick={() => openEditModal(appointment)}
                        className="me-1"
                      >
                        <MdEdit />
                      </Button>
                      <Button
                        variant="outline-danger"
                        size="sm"
                        onClick={() => {
                          setSelectedAppointment(appointment);
                          setShowDeleteModal(true);
                        }}
                      >
                        <MdDelete />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}

          {/* Paginación */}
          {totalPages > 1 && (
            <div className="d-flex justify-content-center mt-3">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <Button
                  key={page}
                  variant={page === currentPage ? 'primary' : 'outline-primary'}
                  size="sm"
                  onClick={() => setCurrentPage(page)}
                  className="mx-1"
                >
                  {page}
                </Button>
              ))}
            </div>
          )}
        </Card.Body>
      </Card>

      {/* Modal Crear Cita */}
      <Modal show={showCreateModal} onHide={() => setShowCreateModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title><MdAdd /> Nueva Cita</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Paciente *</Form.Label>
                  <Form.Select
                    value={createForm.patientId}
                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setCreateForm({ ...createForm, patientId: e.target.value })}
                    required
                  >
                    <option value="">Seleccionar paciente</option>
                    {patients.map((patient) => (
                      <option key={patient.id} value={patient.id}>
                        {patient.first_name} {patient.last_name} - {patient.email}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Nutriólogo *</Form.Label>
                  <Form.Select
                    value={createForm.nutritionistId}
                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setCreateForm({ ...createForm, nutritionistId: e.target.value })}
                    required
                  >
                    <option value="">Seleccionar nutriólogo</option>
                    {nutritionists.map((nutritionist) => (
                      <option key={nutritionist.id} value={nutritionist.id}>
                        {nutritionist.first_name} {nutritionist.last_name} - {nutritionist.email}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Fecha y Hora *</Form.Label>
                  <Form.Control
                    type="datetime-local"
                    value={createForm.appointmentDate}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCreateForm({ ...createForm, appointmentDate: e.target.value })}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Estado</Form.Label>
                  <Form.Select
                    value={createForm.status}
                    onChange={(e) => setCreateForm({ ...createForm, status: e.target.value })}
                  >
                    <option value="scheduled">Programada</option>
                    <option value="pending">Pendiente</option>
                    <option value="completed">Completada</option>
                    <option value="canceled">Cancelada</option>
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>
            <Form.Group className="mb-3">
              <Form.Label>Notas</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={createForm.notes}
                onChange={(e) => setCreateForm({ ...createForm, notes: e.target.value })}
                placeholder="Notas adicionales sobre la cita..."
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowCreateModal(false)}>
            <MdClose /> Cancelar
          </Button>
          <Button variant="primary" onClick={handleCreateAppointment} disabled={loading}>
            <MdSave /> {loading ? 'Creando...' : 'Crear Cita'}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Modal Editar Cita */}
      <Modal show={showEditModal} onHide={() => setShowEditModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title><MdEdit /> Editar Cita</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Fecha y Hora</Form.Label>
                  <Form.Control
                    type="datetime-local"
                    value={createForm.appointmentDate}
                    onChange={(e) => setCreateForm({ ...createForm, appointmentDate: e.target.value })}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Estado</Form.Label>
                  <Form.Select
                    value={createForm.status}
                    onChange={(e) => setCreateForm({ ...createForm, status: e.target.value })}
                  >
                    <option value="scheduled">Programada</option>
                    <option value="pending">Pendiente</option>
                    <option value="completed">Completada</option>
                    <option value="canceled">Cancelada</option>
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>
            <Form.Group className="mb-3">
              <Form.Label>Notas</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={createForm.notes}
                onChange={(e) => setCreateForm({ ...createForm, notes: e.target.value })}
                placeholder="Notas adicionales sobre la cita..."
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowEditModal(false)}>
            <MdClose /> Cancelar
          </Button>
          <Button variant="primary" onClick={handleEditAppointment} disabled={loading}>
            <MdSave /> {loading ? 'Guardando...' : 'Guardar Cambios'}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Modal Eliminar Cita */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title><MdDelete /> Confirmar Eliminación</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedAppointment && (
            <p>
              ¿Está seguro de que desea eliminar la cita del{' '}
              <strong>{new Date(selectedAppointment.appointment_date).toLocaleString('es-ES')}</strong>{' '}
              entre <strong>{selectedAppointment.patient.first_name} {selectedAppointment.patient.last_name}</strong>{' '}
              y <strong>{selectedAppointment.nutritionist.first_name} {selectedAppointment.nutritionist.last_name}</strong>?
            </p>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Cancelar
          </Button>
          <Button variant="danger" onClick={handleDeleteAppointment} disabled={loading}>
            {loading ? 'Eliminando...' : 'Eliminar'}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default AdminAppointmentsTab;