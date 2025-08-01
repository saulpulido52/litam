import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Button, Table, Modal, InputGroup, Badge, Form, Alert, Spinner } from 'react-bootstrap';
import { useAdmin } from '../../hooks/useAdmin';
import type { AdminUserSubscription, AdminUpdateUserSubscriptionDto } from '../../services/adminService';

// React Icons
import { 
  MdSubscriptions,
  MdEdit,
  MdDelete,
  MdCheckCircle,
  MdCancel,
  MdPerson,
  MdAttachMoney,
  MdSave,
  MdClose,
  MdWarning,
  MdTrendingUp,
  MdRefresh,
  MdEmail,
  MdCalendarToday,
  MdTrendingDown} from 'react-icons/md';

const AdminSubscriptionsTab: React.FC = () => {
  const {
    subscriptions,
    loading,
    loadSubscriptions,
    updateSubscription,
    deleteSubscription
  } = useAdmin();

  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedSubscription, setSelectedSubscription] = useState<AdminUserSubscription | null>(null);
  const [editingSubscription, setEditingSubscription] = useState<AdminUpdateUserSubscriptionDto>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  // Cargar suscripciones al montar el componente
  useEffect(() => {
    loadSubscriptions();
  }, [loadSubscriptions]);

  // Filtrar suscripciones
  const filteredSubscriptions = subscriptions.filter(subscription => {
    const matchesSearch = 
      subscription.user.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      subscription.user.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      subscription.user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      subscription.subscription_plan.name.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = !statusFilter || subscription.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Paginación
  const totalPages = Math.ceil(filteredSubscriptions.length / itemsPerPage);
  const paginatedSubscriptions = filteredSubscriptions.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Manejar edición de suscripción
  const handleEditSubscription = (subscription: AdminUserSubscription) => {
    setSelectedSubscription(subscription);
    setEditingSubscription({
      startDate: subscription.start_date,
      endDate: subscription.end_date,
      status: subscription.status
    });
    setShowEditModal(true);
  };

  // Manejar eliminación de suscripción
  const handleDeleteSubscription = (subscription: AdminUserSubscription) => {
    setSelectedSubscription(subscription);
    setShowDeleteModal(true);
  };

  // Guardar cambios de suscripción
  const handleSaveSubscription = async () => {
    if (!selectedSubscription) return;

    try {
      await updateSubscription(selectedSubscription.id, editingSubscription);
      setShowEditModal(false);
      setSelectedSubscription(null);
      setEditingSubscription({});
    } catch (error) {
      console.error('Error al actualizar suscripción:', error);
    }
  };

  // Confirmar eliminación
  const handleConfirmDelete = async () => {
    if (!selectedSubscription) return;

    try {
      await deleteSubscription(selectedSubscription.id);
      setShowDeleteModal(false);
      setSelectedSubscription(null);
    } catch (error) {
      console.error('Error al eliminar suscripción:', error);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge bg="success"><MdCheckCircle className="me-1" />Activa</Badge>;
      case 'expired':
        return <Badge bg="danger"><MdCancel className="me-1" />Expirada</Badge>;
      case 'cancelled':
        return <Badge bg="secondary"><MdCancel className="me-1" />Cancelada</Badge>;
      case 'pending':
        return <Badge bg="warning"><MdWarning className="me-1" />Pendiente</Badge>;
      default:
        return <Badge bg="info">{status}</Badge>;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-MX', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const isExpired = (endDate: string) => {
    return new Date(endDate) < new Date();
  };

  const getDaysRemaining = (endDate: string) => {
    const end = new Date(endDate);
    const now = new Date();
    const diffTime = end.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  return (
    <div>
      {/* Header */}
      <Row className="mb-4">
        <Col>
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h5 className="mb-0">
                <MdSubscriptions className="me-2 text-primary" />
                Gestión de Suscripciones
              </h5>
              <p className="text-muted mb-0">
                Administra todas las suscripciones de usuarios
              </p>
            </div>
            <Button 
              variant="outline-primary" 
              size="sm"
              onClick={() => loadSubscriptions()}
              disabled={loading}
            >
              <MdRefresh className="me-1" />
              {loading ? 'Actualizando...' : 'Actualizar'}
            </Button>
          </div>
        </Col>
      </Row>

      {/* Filtros */}
      <Row className="mb-4">
        <Col md={6}>
          <InputGroup>
            <InputGroup.Text>
              <MdRefresh />
            </InputGroup.Text>
            <Form.Control
              type="text"
              placeholder="Buscar suscripciones..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </InputGroup>
        </Col>
        <Col md={4}>
          <Form.Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">Todos los estados</option>
            <option value="active">Activas</option>
            <option value="expired">Expiradas</option>
            <option value="cancelled">Canceladas</option>
            <option value="pending">Pendientes</option>
          </Form.Select>
        </Col>
        <Col md={2}>
          <Button 
            variant="outline-secondary" 
            size="sm"
            onClick={() => {
              setSearchTerm('');
              setStatusFilter('');
            }}
          >
            <MdRefresh className="me-1" />
            Limpiar
          </Button>
        </Col>
      </Row>

      {/* Tabla de Suscripciones */}
      <Card className="border-0 shadow-sm">
        <Card.Body className="p-0">
          {loading ? (
            <div className="text-center py-5">
              <Spinner animation="border" variant="primary" />
              <p className="mt-3">Cargando suscripciones...</p>
            </div>
          ) : (
            <Table responsive className="mb-0">
              <thead className="bg-light">
                <tr>
                  <th>Usuario</th>
                  <th>Plan</th>
                  <th>Precio</th>
                  <th>Estado</th>
                  <th>Fecha de Inicio</th>
                  <th>Fecha de Fin</th>
                  <th>Días Restantes</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {paginatedSubscriptions.map((subscription) => {
                  const daysRemaining = getDaysRemaining(subscription.end_date);
                  const expired = isExpired(subscription.end_date);
                  
                  return (
                    <tr key={subscription.id}>
                      <td>
                        <div className="d-flex align-items-center">
                          <div className="bg-primary bg-opacity-10 rounded-circle p-2 me-2">
                            <MdPerson className="text-primary" size={20} />
                          </div>
                          <div>
                            <div className="fw-bold">
                              {subscription.user.first_name} {subscription.user.last_name}
                            </div>
                            <small className="text-muted">
                              <MdEmail className="me-1" />
                              {subscription.user.email}
                            </small>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div>
                          <div className="fw-bold">{subscription.subscription_plan.name}</div>
                          <small className="text-muted">
                            {subscription.subscription_plan.duration} {subscription.subscription_plan.duration_type}
                          </small>
                        </div>
                      </td>
                      <td>
                        <div className="fw-bold text-success">
                          <MdAttachMoney className="me-1" />
                          {formatCurrency(subscription.subscription_plan.price)}
                        </div>
                      </td>
                      <td>{getStatusBadge(subscription.status)}</td>
                      <td>
                        <div className="d-flex align-items-center">
                          <MdCalendarToday className="me-1 text-muted" />
                          {formatDate(subscription.start_date)}
                        </div>
                      </td>
                      <td>
                        <div className="d-flex align-items-center">
                          <MdCalendarToday className="me-1 text-muted" />
                          {formatDate(subscription.end_date)}
                        </div>
                      </td>
                      <td>
                        {expired ? (
                          <Badge bg="danger">
                            <MdTrendingDown className="me-1" />
                            Expirada
                          </Badge>
                        ) : daysRemaining <= 7 ? (
                          <Badge bg="warning">
                            <MdWarning className="me-1" />
                            {daysRemaining} días
                          </Badge>
                        ) : (
                          <Badge bg="success">
                            <MdTrendingUp className="me-1" />
                            {daysRemaining} días
                          </Badge>
                        )}
                      </td>
                      <td>
                        <div className="d-flex gap-1">
                          <Button
                            variant="outline-primary"
                            size="sm"
                            onClick={() => handleEditSubscription(subscription)}
                            title="Editar suscripción"
                          >
                            <MdEdit size={16} />
                          </Button>
                          <Button
                            variant="outline-danger"
                            size="sm"
                            onClick={() => handleDeleteSubscription(subscription)}
                            title="Eliminar suscripción"
                          >
                            <MdDelete size={16} />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </Table>
          )}
        </Card.Body>
      </Card>

      {/* Paginación */}
      {totalPages > 1 && (
        <Row className="mt-3">
          <Col>
            <div className="d-flex justify-content-between align-items-center">
              <small className="text-muted">
                Mostrando {((currentPage - 1) * itemsPerPage) + 1} - {Math.min(currentPage * itemsPerPage, filteredSubscriptions.length)} de {filteredSubscriptions.length} suscripciones
              </small>
              <div className="d-flex gap-1">
                <Button
                  size="sm"
                  variant="outline-secondary"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(currentPage - 1)}
                >
                  Anterior
                </Button>
                <span className="px-3 py-1 bg-light rounded">
                  {currentPage} / {totalPages}
                </span>
                <Button
                  size="sm"
                  variant="outline-secondary"
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(currentPage + 1)}
                >
                  Siguiente
                </Button>
              </div>
            </div>
          </Col>
        </Row>
      )}

      {/* Modal de Edición de Suscripción */}
      <Modal show={showEditModal} onHide={() => setShowEditModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            <MdEdit className="me-2" />
            Editar Suscripción
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedSubscription && (
            <div className="mb-3">
              <h6>Usuario: {selectedSubscription.user.first_name} {selectedSubscription.user.last_name}</h6>
              <p className="text-muted mb-0">Plan: {selectedSubscription.subscription_plan.name}</p>
            </div>
          )}
          <Form>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Fecha de Inicio</Form.Label>
                  <Form.Control
                    type="date"
                    value={editingSubscription.startDate?.split('T')[0] || ''}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEditingSubscription({...editingSubscription, startDate: e.target.value})}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Fecha de Fin</Form.Label>
                  <Form.Control
                    type="date"
                    value={editingSubscription.endDate?.split('T')[0] || ''}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEditingSubscription({...editingSubscription, endDate: e.target.value})}
                  />
                </Form.Group>
              </Col>
            </Row>
            <Form.Group className="mb-3">
              <Form.Label>Estado</Form.Label>
              <Form.Select
                value={editingSubscription.status || ''}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setEditingSubscription({...editingSubscription, status: e.target.value})}
              >
                <option value="active">Activa</option>
                <option value="expired">Expirada</option>
                <option value="cancelled">Cancelada</option>
                <option value="pending">Pendiente</option>
              </Form.Select>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowEditModal(false)}>
            <MdClose className="me-1" />
            Cancelar
          </Button>
          <Button variant="primary" onClick={handleSaveSubscription}>
            <MdSave className="me-1" />
            Guardar Cambios
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Modal de Confirmación de Eliminación */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>
            <MdWarning className="me-2 text-danger" />
            Confirmar Eliminación
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedSubscription && (
            <div>
              <p>
                ¿Estás seguro de que quieres eliminar la suscripción de{' '}
                <strong>{selectedSubscription.user.first_name} {selectedSubscription.user.last_name}</strong>?
              </p>
              <div className="mb-3">
                <strong>Plan:</strong> {selectedSubscription.subscription_plan.name}<br />
                <strong>Estado:</strong> {getStatusBadge(selectedSubscription.status)}
              </div>
            </div>
          )}
          <Alert variant="warning">
            <MdWarning className="me-2" />
            <strong>Advertencia:</strong> Esta acción no se puede deshacer.
          </Alert>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Cancelar
          </Button>
          <Button variant="danger" onClick={handleConfirmDelete}>
            <MdDelete className="me-1" />
            Eliminar Suscripción
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default AdminSubscriptionsTab; 