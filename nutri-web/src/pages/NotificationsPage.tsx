import React, { useState, useEffect, useMemo } from 'react';
import { Container, Row, Col, Card, Button, Badge, Alert, Form, Modal } from 'react-bootstrap';
import { 
  Bell, 
  CheckCircle, 
  AlertCircle, 
  Info, 
  Trash2, 
  Filter,
  Search,
  Archive,
  RefreshCw,
  Settings,
  Eye,
  EyeOff,
  Star,
  StarOff,
  Calendar,
  User,
  FileText,
  TrendingUp
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// Tipos para las notificaciones
interface Notification {
  id: string;
  type: 'appointment' | 'patient' | 'reminder' | 'system' | 'success' | 'warning' | 'info';
  title: string;
  message: string;
  time: string;
  read: boolean;
  priority: 'low' | 'medium' | 'high';
  category: string;
  actionUrl?: string;
  metadata?: {
    patientId?: string;
    patientName?: string;
    appointmentId?: string;
    recordId?: string;
  };
}

const NotificationsPage: React.FC = () => {
  const navigate = useNavigate();
  
  // Estados
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [filterType, setFilterType] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showRead, setShowRead] = useState(true);
  const [sortBy, setSortBy] = useState<'time' | 'priority' | 'type'>('time');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [selectedNotifications, setSelectedNotifications] = useState<string[]>([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [loading, setLoading] = useState(false);

  // Generar notificaciones de ejemplo
  useEffect(() => {
    const generateSampleNotifications = (): Notification[] => {
      const sampleNotifications: Notification[] = [
        {
          id: '1',
          type: 'appointment',
          title: 'Nueva Cita Programada',
          message: 'Tienes una nueva cita con María González para mañana a las 10:00 AM',
          time: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 min ago
          read: false,
          priority: 'high',
          category: 'Citas',
          actionUrl: '/appointments',
          metadata: {
            patientId: '123',
            patientName: 'María González',
            appointmentId: 'app-001'
          }
        },
        {
          id: '2',
          type: 'patient',
          title: 'Nuevo Paciente Registrado',
          message: 'Carlos Rodríguez se ha registrado como tu paciente',
          time: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
          read: false,
          priority: 'medium',
          category: 'Pacientes',
          actionUrl: '/patients',
          metadata: {
            patientId: '456',
            patientName: 'Carlos Rodríguez'
          }
        },
        {
          id: '3',
          type: 'reminder',
          title: 'Recordatorio de Seguimiento',
          message: 'Es momento de revisar el progreso de Ana Martínez',
          time: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
          read: true,
          priority: 'medium',
          category: 'Seguimiento',
          actionUrl: '/progress',
          metadata: {
            patientId: '789',
            patientName: 'Ana Martínez'
          }
        },
        {
          id: '4',
          type: 'system',
          title: 'Actualización del Sistema',
          message: 'Se han aplicado mejoras en el sistema de expedientes clínicos',
          time: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(), // 2 days ago
          read: true,
          priority: 'low',
          category: 'Sistema',
          actionUrl: '/dashboard'
        },
        {
          id: '5',
          type: 'success',
          title: 'Expediente Completado',
          message: 'El expediente clínico de Juan Pérez ha sido completado exitosamente',
          time: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(), // 3 days ago
          read: true,
          priority: 'medium',
          category: 'Expedientes',
          actionUrl: '/clinical-records',
          metadata: {
            patientId: '101',
            patientName: 'Juan Pérez',
            recordId: 'rec-001'
          }
        },
        {
          id: '6',
          type: 'warning',
          title: 'Plan Nutricional Vencido',
          message: 'El plan nutricional de Laura Sánchez expira en 3 días',
          time: new Date(Date.now() - 1000 * 60 * 60 * 24 * 4).toISOString(), // 4 days ago
          read: false,
          priority: 'high',
          category: 'Planes Nutricionales',
          actionUrl: '/diet-plans',
          metadata: {
            patientId: '202',
            patientName: 'Laura Sánchez'
          }
        },
        {
          id: '7',
          type: 'info',
          title: 'Nuevo Reporte Disponible',
          message: 'El reporte mensual de pacientes está listo para revisión',
          time: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(), // 5 days ago
          read: true,
          priority: 'low',
          category: 'Reportes',
          actionUrl: '/reports'
        }
      ];
      
      return sampleNotifications;
    };

    setNotifications(generateSampleNotifications());
  }, []);

  // Filtrar y ordenar notificaciones
  const filteredNotifications = useMemo(() => {
    let filtered = notifications;

    // Filtrar por tipo
    if (filterType !== 'all') {
      filtered = filtered.filter(notification => notification.type === filterType);
    }

    // Filtrar por término de búsqueda
    if (searchTerm) {
      filtered = filtered.filter(notification =>
        notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        notification.message.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filtrar por estado de lectura
    if (!showRead) {
      filtered = filtered.filter(notification => !notification.read);
    }

    // Ordenar
    filtered.sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'time':
          comparison = new Date(a.time).getTime() - new Date(b.time).getTime();
          break;
        case 'priority':
          const priorityOrder = { high: 3, medium: 2, low: 1 };
          comparison = priorityOrder[a.priority] - priorityOrder[b.priority];
          break;
        case 'type':
          comparison = a.type.localeCompare(b.type);
          break;
      }
      
      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return filtered;
  }, [notifications, filterType, searchTerm, showRead, sortBy, sortOrder]);

  // Estadísticas
  const stats = useMemo(() => {
    const total = notifications.length;
    const unread = notifications.filter(n => !n.read).length;
    const highPriority = notifications.filter(n => n.priority === 'high').length;
    const today = notifications.filter(n => {
      const notificationDate = new Date(n.time);
      const today = new Date();
      return notificationDate.toDateString() === today.toDateString();
    }).length;

    return { total, unread, highPriority, today };
  }, [notifications]);

  // Funciones de utilidad
  const formatTime = (timeString: string) => {
    const now = new Date();
    const notificationTime = new Date(timeString);
    const diffInMinutes = Math.floor((now.getTime() - notificationTime.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Ahora mismo';
    if (diffInMinutes < 60) return `Hace ${diffInMinutes} min`;
    if (diffInMinutes < 1440) return `Hace ${Math.floor(diffInMinutes / 60)}h`;
    return `Hace ${Math.floor(diffInMinutes / 1440)}d`;
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'appointment': return <Calendar size={16} />;
      case 'patient': return <User size={16} />;
      case 'reminder': return <Bell size={16} />;
      case 'system': return <Settings size={16} />;
      case 'success': return <CheckCircle size={16} />;
      case 'warning': return <AlertCircle size={16} />;
      case 'info': return <Info size={16} />;
      default: return <Bell size={16} />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'appointment': return 'primary';
      case 'patient': return 'success';
      case 'reminder': return 'warning';
      case 'system': return 'secondary';
      case 'success': return 'success';
      case 'warning': return 'warning';
      case 'info': return 'info';
      default: return 'secondary';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'danger';
      case 'medium': return 'warning';
      case 'low': return 'success';
      default: return 'secondary';
    }
  };

  // Funciones de acción
  const markAsRead = (notificationId: string) => {
    setNotifications(prev =>
      prev.map(notification =>
        notification.id === notificationId
          ? { ...notification, read: true }
          : notification
      )
    );
  };

  const markAsUnread = (notificationId: string) => {
    setNotifications(prev =>
      prev.map(notification =>
        notification.id === notificationId
          ? { ...notification, read: false }
          : notification
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev =>
      prev.map(notification => ({ ...notification, read: true }))
    );
  };

  const deleteNotification = (notificationId: string) => {
    setNotifications(prev => prev.filter(n => n.id !== notificationId));
  };

  const deleteSelected = () => {
    setNotifications(prev => prev.filter(n => !selectedNotifications.includes(n.id)));
    setSelectedNotifications([]);
    setShowDeleteModal(false);
  };

  const handleNotificationClick = (notification: Notification) => {
    markAsRead(notification.id);
    if (notification.actionUrl) {
      navigate(notification.actionUrl);
    }
  };

  const toggleSelection = (notificationId: string) => {
    setSelectedNotifications(prev =>
      prev.includes(notificationId)
        ? prev.filter(id => id !== notificationId)
        : [...prev, notificationId]
    );
  };

  const selectAll = () => {
    setSelectedNotifications(filteredNotifications.map(n => n.id));
  };

  const deselectAll = () => {
    setSelectedNotifications([]);
  };

  return (
    <Container fluid className="py-4">
      {/* Header */}
      <Row className="mb-4">
        <Col>
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h1 className="h3 mb-1">Centro de Notificaciones</h1>
              <p className="text-muted mb-0">
                Gestiona todas tus notificaciones y mantente al día
              </p>
            </div>
            <div className="d-flex gap-2">
              <Button variant="outline-primary" onClick={markAllAsRead}>
                <CheckCircle size={16} className="me-2" />
                Marcar Todo como Leído
              </Button>
              <Button variant="outline-secondary" onClick={() => window.location.reload()}>
                <RefreshCw size={16} className="me-2" />
                Actualizar
              </Button>
            </div>
          </div>
        </Col>
      </Row>

      {/* Estadísticas */}
      <Row className="mb-4">
        <Col md={3}>
          <Card className="text-center">
            <Card.Body>
              <h4 className="text-primary mb-0">{stats.total}</h4>
              <small className="text-muted">Total</small>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="text-center">
            <Card.Body>
              <h4 className="text-warning mb-0">{stats.unread}</h4>
              <small className="text-muted">No Leídas</small>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="text-center">
            <Card.Body>
              <h4 className="text-danger mb-0">{stats.highPriority}</h4>
              <small className="text-muted">Alta Prioridad</small>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="text-center">
            <Card.Body>
              <h4 className="text-success mb-0">{stats.today}</h4>
              <small className="text-muted">Hoy</small>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Filtros y Controles */}
      <Row className="mb-4">
        <Col>
          <Card>
            <Card.Body>
              <Row className="align-items-end">
                <Col md={3}>
                  <Form.Group>
                    <Form.Label>Filtrar por Tipo</Form.Label>
                    <Form.Select
                      value={filterType}
                      onChange={(e) => setFilterType(e.target.value)}
                    >
                      <option value="all">Todos los tipos</option>
                      <option value="appointment">Citas</option>
                      <option value="patient">Pacientes</option>
                      <option value="reminder">Recordatorios</option>
                      <option value="system">Sistema</option>
                      <option value="success">Éxito</option>
                      <option value="warning">Advertencias</option>
                      <option value="info">Información</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col md={3}>
                  <Form.Group>
                    <Form.Label>Ordenar por</Form.Label>
                    <Form.Select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value as any)}
                    >
                      <option value="time">Fecha</option>
                      <option value="priority">Prioridad</option>
                      <option value="type">Tipo</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col md={2}>
                  <Form.Group>
                    <Form.Label>Orden</Form.Label>
                    <Form.Select
                      value={sortOrder}
                      onChange={(e) => setSortOrder(e.target.value as any)}
                    >
                      <option value="desc">Descendente</option>
                      <option value="asc">Ascendente</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col md={3}>
                  <Form.Group>
                    <Form.Label>Buscar</Form.Label>
                    <div className="position-relative">
                      <Search size={16} className="position-absolute top-50 start-0 translate-middle-y ms-2 text-muted" />
                      <Form.Control
                        type="text"
                        placeholder="Buscar notificaciones..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="ps-4"
                      />
                    </div>
                  </Form.Group>
                </Col>
                <Col md={1}>
                  <Form.Group>
                    <Form.Check
                      type="checkbox"
                      id="show-read"
                      label="Mostrar leídas"
                      checked={showRead}
                      onChange={(e) => setShowRead(e.target.checked)}
                    />
                  </Form.Group>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Acciones en lote */}
      {selectedNotifications.length > 0 && (
        <Row className="mb-3">
          <Col>
            <Card className="border-warning">
              <Card.Body className="py-2">
                <div className="d-flex justify-content-between align-items-center">
                  <span>
                    <Badge bg="warning" className="me-2">
                      {selectedNotifications.length}
                    </Badge>
                    notificación{selectedNotifications.length !== 1 ? 'es' : ''} seleccionada{selectedNotifications.length !== 1 ? 's' : ''}
                  </span>
                  <div className="d-flex gap-2">
                    <Button variant="outline-success" size="sm" onClick={markAllAsRead}>
                      <CheckCircle size={14} className="me-1" />
                      Marcar como leídas
                    </Button>
                    <Button variant="outline-danger" size="sm" onClick={() => setShowDeleteModal(true)}>
                      <Trash2 size={14} className="me-1" />
                      Eliminar
                    </Button>
                    <Button variant="outline-secondary" size="sm" onClick={deselectAll}>
                      <X size={14} className="me-1" />
                      Deseleccionar
                    </Button>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      )}

      {/* Lista de Notificaciones */}
      <Row>
        <Col>
          {filteredNotifications.length === 0 ? (
            <Card>
              <Card.Body className="text-center py-5">
                <Bell size={48} className="text-muted mb-3" />
                <h5 className="text-muted">No hay notificaciones</h5>
                <p className="text-muted">
                  {searchTerm || filterType !== 'all' 
                    ? 'No se encontraron notificaciones con los filtros aplicados'
                    : 'No tienes notificaciones pendientes'
                  }
                </p>
              </Card.Body>
            </Card>
          ) : (
            <div className="notifications-list">
              {filteredNotifications.map((notification) => (
                <Card 
                  key={notification.id} 
                  className={`mb-3 notification-card ${!notification.read ? 'border-primary' : ''}`}
                >
                  <Card.Body className="py-3">
                    <div className="d-flex align-items-start">
                      <div className="me-3">
                        <Form.Check
                          type="checkbox"
                          checked={selectedNotifications.includes(notification.id)}
                          onChange={() => toggleSelection(notification.id)}
                          className="mt-1"
                        />
                      </div>
                      
                      <div className="flex-grow-1">
                        <div className="d-flex justify-content-between align-items-start mb-2">
                          <div className="d-flex align-items-center">
                            <div className={`me-2 text-${getTypeColor(notification.type)}`}>
                              {getTypeIcon(notification.type)}
                            </div>
                            <h6 className="mb-0 fw-bold">
                              {notification.title}
                              {!notification.read && (
                                <Badge bg="primary" className="ms-2">Nueva</Badge>
                              )}
                            </h6>
                          </div>
                          <div className="d-flex align-items-center gap-2">
                            <Badge bg={getPriorityColor(notification.priority)}>
                              {notification.priority.toUpperCase()}
                            </Badge>
                            <small className="text-muted">
                              {formatTime(notification.time)}
                            </small>
                          </div>
                        </div>
                        
                        <p className="text-muted mb-2">{notification.message}</p>
                        
                        <div className="d-flex justify-content-between align-items-center">
                          <div className="d-flex gap-2">
                            <Badge bg="light" text="dark">
                              {notification.category}
                            </Badge>
                            {notification.metadata?.patientName && (
                              <Badge bg="info">
                                {notification.metadata.patientName}
                              </Badge>
                            )}
                          </div>
                          
                          <div className="d-flex gap-1">
                            {notification.read ? (
                              <Button 
                                variant="outline-secondary" 
                                size="sm"
                                onClick={() => markAsUnread(notification.id)}
                                title="Marcar como no leída"
                              >
                                <EyeOff size={14} />
                              </Button>
                            ) : (
                              <Button 
                                variant="outline-primary" 
                                size="sm"
                                onClick={() => markAsRead(notification.id)}
                                title="Marcar como leída"
                              >
                                <Eye size={14} />
                              </Button>
                            )}
                            
                            {notification.actionUrl && (
                              <Button 
                                variant="outline-success" 
                                size="sm"
                                onClick={() => handleNotificationClick(notification)}
                                title="Ver detalles"
                              >
                                Ver
                              </Button>
                            )}
                            
                            <Button 
                              variant="outline-danger" 
                              size="sm"
                              onClick={() => deleteNotification(notification.id)}
                              title="Eliminar notificación"
                            >
                              <Trash2 size={14} />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card.Body>
                </Card>
              ))}
            </div>
          )}
        </Col>
      </Row>

      {/* Modal de confirmación de eliminación */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>
            <Trash2 className="text-danger me-2" />
            Confirmar Eliminación
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>
            ¿Estás seguro de que quieres eliminar {selectedNotifications.length} notificación{selectedNotifications.length !== 1 ? 'es' : ''}?
          </p>
          <Alert variant="warning">
            <AlertCircle className="me-2" />
            Esta acción no se puede deshacer.
          </Alert>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Cancelar
          </Button>
          <Button variant="danger" onClick={deleteSelected}>
            <Trash2 size={16} className="me-2" />
            Eliminar
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default NotificationsPage; 