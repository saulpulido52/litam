import React, { useState, useEffect, useMemo } from 'react';
import { Container, Row, Col, Button, Badge, Form } from 'react-bootstrap';
import {
  Bell,
  Calendar,
  User,
  Settings,
  CheckCircle,
  AlertCircle,
  Info,
  Search,
  Eye,
  EyeOff,
  Trash2,
  Pin,
  PinOff,
  X,
  Filter,
  TrendingUp,
  Clock,
  AlertTriangle
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '../styles/notifications.css';
import notificationService from '../services/notificationService';
import type { Notification } from '../services/notificationService';

const NotificationsPage: React.FC = () => {
  const navigate = useNavigate();

  // Estados
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState<string>('all');
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [filterTime, setFilterTime] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showRead, setShowRead] = useState(true);
  const [selectedNotifications, setSelectedNotifications] = useState<string[]>([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Cargar notificaciones del usuario actual
  useEffect(() => {
    const loadNotifications = async () => {
      try {
        setLoading(true);
        const data = await notificationService.getNotifications();
        setNotifications(data);
      } catch (error) {
        console.error('Error loading notifications:', error);
        toast.error('Error al cargar notificaciones');
      } finally {
        setLoading(false);
      }
    };

    loadNotifications();
  }, []);

  // Filtrar notificaciones
  const filteredNotifications = useMemo(() => {
    let filtered = notifications;

    // Filtrar por tipo
    if (filterType !== 'all') {
      filtered = filtered.filter(n => n.type === filterType);
    }

    // Filtrar por prioridad
    if (filterPriority !== 'all') {
      filtered = filtered.filter(n => n.priority === filterPriority);
    }

    // Filtrar por tiempo
    if (filterTime !== 'all') {
      const now = new Date();
      filtered = filtered.filter(n => {
        const notifTime = new Date(n.time);
        const diffDays = Math.floor((now.getTime() - notifTime.getTime()) / (1000 * 60 * 60 * 24));

        switch (filterTime) {
          case 'today':
            return diffDays === 0;
          case 'week':
            return diffDays <= 7;
          case 'month':
            return diffDays <= 30;
          default:
            return true;
        }
      });
    }

    // Filtrar por búsqueda
    if (searchTerm) {
      filtered = filtered.filter(n =>
        n.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        n.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
        n.metadata?.patientName?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filtrar por estado de lectura
    if (!showRead) {
      filtered = filtered.filter(n => !n.read);
    }

    // Ordenar: ancladas primero, luego por tiempo
    return filtered.sort((a, b) => {
      if (a.pinned && !b.pinned) return -1;
      if (!a.pinned && b.pinned) return 1;
      return new Date(b.time).getTime() - new Date(a.time).getTime();
    });
  }, [notifications, filterType, filterPriority, filterTime, searchTerm, showRead]);

  // Estadísticas
  const stats = useMemo(() => {
    const total = notifications.length;
    const unread = notifications.filter(n => !n.read).length;
    const urgent = notifications.filter(n => n.priority === 'high').length;
    const today = notifications.filter(n => {
      const notificationDate = new Date(n.time);
      const todayDate = new Date();
      return notificationDate.toDateString() === todayDate.toDateString();
    }).length;

    return { total, unread, urgent, today };
  }, [notifications]);

  // Contadores por tipo y prioridad
  const typeCounts = useMemo(() => {
    const counts: Record<string, number> = {
      all: notifications.length,
      appointment: 0,
      patient: 0,
      reminder: 0,
      system: 0,
      success: 0,
      warning: 0,
      info: 0
    };

    notifications.forEach(n => {
      counts[n.type]++;
    });

    return counts;
  }, [notifications]);

  const priorityCounts = useMemo(() => {
    return {
      high: notifications.filter(n => n.priority === 'high').length,
      medium: notifications.filter(n => n.priority === 'medium').length,
      low: notifications.filter(n => n.priority === 'low').length
    };
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
      case 'appointment': return <Calendar size={20} />;
      case 'patient': return <User size={20} />;
      case 'reminder': return <Bell size={20} />;
      case 'system': return <Settings size={20} />;
      case 'success': return <CheckCircle size={20} />;
      case 'warning': return <AlertCircle size={20} />;
      case 'info': return <Info size={20} />;
      default: return <Bell size={20} />;
    }
  };

  // Funciones de acción
  const markAsRead = async (notificationId: string) => {
    setNotifications(prev =>
      prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
    );
    toast.success('Marcada como leída', { autoClose: 2000 });
    await notificationService.markAsRead(notificationId);
  };

  const markAsUnread = (notificationId: string) => {
    setNotifications(prev =>
      prev.map(n => n.id === notificationId ? { ...n, read: false } : n)
    );
    toast.info('Marcada como no leída', { autoClose: 2000 });
  };

  const togglePin = async (notificationId: string) => {
    setNotifications(prev =>
      prev.map(n => {
        if (n.id === notificationId) {
          const newPinned = !n.pinned;
          toast.success(newPinned ? '📌 Notificación anclada' : 'Notificación desanclada', { autoClose: 2000 });
          return { ...n, pinned: newPinned };
        }
        return n;
      })
    );
    await notificationService.togglePin(notificationId);
  };

  const deleteNotification = async (notificationId: string) => {
    setNotifications(prev => prev.filter(n => n.id !== notificationId));
    toast.success('Notificación eliminada', { autoClose: 2000 });
    await notificationService.deleteNotification(notificationId);
  };

  const markAllAsRead = async () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    toast.success('🎉 Todas las notificaciones marcadas como leídas', { autoClose: 2000 });
    await notificationService.markAllAsRead();
  };

  const deleteSelected = () => {
    setNotifications(prev => prev.filter(n => !selectedNotifications.includes(n.id)));
    setSelectedNotifications([]);
    toast.success(`${selectedNotifications.length} notificaciones eliminadas`, { autoClose: 2000 });
  };

  const markSelectedAsRead = () => {
    setNotifications(prev =>
      prev.map(n => selectedNotifications.includes(n.id) ? { ...n, read: true } : n)
    );
    setSelectedNotifications([]);
    toast.success(`${selectedNotifications.length} notificaciones marcadas como leídas`, { autoClose: 2000 });
  };

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.read) {
      markAsRead(notification.id);
    }
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

  const deselectAll = () => {
    setSelectedNotifications([]);
  };

  return (
    <>
      <ToastContainer position="top-right" />
      <div className="notifications-page">
        {/* Header */}
        <div className="notifications-header">
          <Container fluid>
            <Row className="align-items-center">
              <Col>
                <h1 className="notifications-title">
                  <Bell size={28} />
                  Notificaciones
                </h1>
                <p className="notifications-subtitle">
                  Mantente al día con todas tus actualizaciones
                </p>
              </Col>
              <Col xs="auto">
                <div className="d-flex gap-2">
                  <Button
                    variant="outline-primary"
                    size="sm"
                    onClick={markAllAsRead}
                    disabled={stats.unread === 0}
                  >
                    <CheckCircle size={16} className="me-2" />
                    Marcar Todo Leído
                  </Button>
                  <Button
                    variant="outline-secondary"
                    size="sm"
                    className="d-md-none"
                    onClick={() => setSidebarOpen(!sidebarOpen)}
                  >
                    <Filter size={16} />
                  </Button>
                </div>
              </Col>
            </Row>
          </Container>
        </div>

        <Container fluid className="py-4">
          {/* Stats Cards */}
          <Row className="mb-4">
            <Col md={3} sm={6} className="mb-3 mb-md-0">
              <div className="stats-card total">
                <div className="stats-icon">
                  <Bell size={24} />
                </div>
                <div className="stats-number">{stats.total}</div>
                <div className="stats-label">Total</div>
              </div>
            </Col>
            <Col md={3} sm={6} className="mb-3 mb-md-0">
              <div className="stats-card unread">
                <div className="stats-icon">
                  <AlertTriangle size={24} />
                </div>
                <div className="stats-number">{stats.unread}</div>
                <div className="stats-label">No Leídas</div>
              </div>
            </Col>
            <Col md={3} sm={6} className="mb-3 mb-md-0">
              <div className="stats-card urgent">
                <div className="stats-icon">
                  <AlertCircle size={24} />
                </div>
                <div className="stats-number">{stats.urgent}</div>
                <div className="stats-label">Urgentes</div>
              </div>
            </Col>
            <Col md={3} sm={6}>
              <div className="stats-card today">
                <div className="stats-icon">
                  <Clock size={24} />
                </div>
                <div className="stats-number">{stats.today}</div>
                <div className="stats-label">Hoy</div>
              </div>
            </Col>
          </Row>

          <Row>
            {/* Sidebar */}
            <Col lg={3} className="mb-4 mb-lg-0">
              <div className={`notifications-sidebar ${sidebarOpen ? 'open' : ''}`}>
                {/* Close button for mobile */}
                <div className="d-lg-none d-flex justify-content-between align-items-center mb-3">
                  <h6 className="mb-0">Filtros</h6>
                  <Button variant="link" size="sm" onClick={() => setSidebarOpen(false)}>
                    <X size={20} />
                  </Button>
                </div>

                {/* Filter by Type */}
                <div className="sidebar-section">
                  <div className="sidebar-title">Por Tipo</div>
                  <div
                    className={`filter-item ${filterType === 'all' ? 'active' : ''}`}
                    onClick={() => setFilterType('all')}
                  >
                    <div className="filter-item-left">
                      <div className="filter-icon"><TrendingUp size={16} /></div>
                      <span>Todas</span>
                    </div>
                    <span className="filter-count">{typeCounts.all}</span>
                  </div>
                  <div
                    className={`filter-item ${filterType === 'appointment' ? 'active' : ''}`}
                    onClick={() => setFilterType('appointment')}
                  >
                    <div className="filter-item-left">
                      <div className="filter-icon"><Calendar size={16} /></div>
                      <span>Citas</span>
                    </div>
                    <span className="filter-count">{typeCounts.appointment}</span>
                  </div>
                  <div
                    className={`filter-item ${filterType === 'patient' ? 'active' : ''}`}
                    onClick={() => setFilterType('patient')}
                  >
                    <div className="filter-item-left">
                      <div className="filter-icon"><User size={16} /></div>
                      <span>Pacientes</span>
                    </div>
                    <span className="filter-count">{typeCounts.patient}</span>
                  </div>
                  <div
                    className={`filter-item ${filterType === 'reminder' ? 'active' : ''}`}
                    onClick={() => setFilterType('reminder')}
                  >
                    <div className="filter-item-left">
                      <div className="filter-icon"><Bell size={16} /></div>
                      <span>Recordatorios</span>
                    </div>
                    <span className="filter-count">{typeCounts.reminder}</span>
                  </div>
                  <div
                    className={`filter-item ${filterType === 'system' ? 'active' : ''}`}
                    onClick={() => setFilterType('system')}
                  >
                    <div className="filter-item-left">
                      <div className="filter-icon"><Settings size={16} /></div>
                      <span>Sistema</span>
                    </div>
                    <span className="filter-count">{typeCounts.system}</span>
                  </div>
                </div>

                {/* Filter by Priority */}
                <div className="sidebar-section">
                  <div className="sidebar-title">Por Prioridad</div>
                  <div
                    className={`filter-item ${filterPriority === 'high' ? 'active' : ''}`}
                    onClick={() => setFilterPriority(filterPriority === 'high' ? 'all' : 'high')}
                  >
                    <div className="filter-item-left">
                      <div className="priority-dot high"></div>
                      <span>Alta</span>
                    </div>
                    <span className="filter-count">{priorityCounts.high}</span>
                  </div>
                  <div
                    className={`filter-item ${filterPriority === 'medium' ? 'active' : ''}`}
                    onClick={() => setFilterPriority(filterPriority === 'medium' ? 'all' : 'medium')}
                  >
                    <div className="filter-item-left">
                      <div className="priority-dot medium"></div>
                      <span>Media</span>
                    </div>
                    <span className="filter-count">{priorityCounts.medium}</span>
                  </div>
                  <div
                    className={`filter-item ${filterPriority === 'low' ? 'active' : ''}`}
                    onClick={() => setFilterPriority(filterPriority === 'low' ? 'all' : 'low')}
                  >
                    <div className="filter-item-left">
                      <div className="priority-dot low"></div>
                      <span>Baja</span>
                    </div>
                    <span className="filter-count">{priorityCounts.low}</span>
                  </div>
                </div>

                {/* Filter by Time */}
                <div className="sidebar-section">
                  <div className="sidebar-title">Por Tiempo</div>
                  <div
                    className={`filter-item ${filterTime === 'today' ? 'active' : ''}`}
                    onClick={() => setFilterTime(filterTime === 'today' ? 'all' : 'today')}
                  >
                    <span>Hoy</span>
                  </div>
                  <div
                    className={`filter-item ${filterTime === 'week' ? 'active' : ''}`}
                    onClick={() => setFilterTime(filterTime === 'week' ? 'all' : 'week')}
                  >
                    <span>Esta Semana</span>
                  </div>
                  <div
                    className={`filter-item ${filterTime === 'month' ? 'active' : ''}`}
                    onClick={() => setFilterTime(filterTime === 'month' ? 'all' : 'month')}
                  >
                    <span>Este Mes</span>
                  </div>
                </div>

                {/* Show Read Toggle */}
                <div className="sidebar-section">
                  <Form.Check
                    type="switch"
                    id="show-read-switch"
                    label="Mostrar leídas"
                    checked={showRead}
                    onChange={(e) => setShowRead(e.target.checked)}
                  />
                </div>
              </div>
            </Col>

            {/* Main Content */}
            <Col lg={9}>
              <div className="notifications-main">
                {/* Toolbar */}
                <div className="notifications-toolbar">
                  {/* Search Bar */}
                  <div className="search-bar">
                    <Search size={16} className="search-icon" />
                    <Form.Control
                      type="text"
                      placeholder="Buscar notificaciones..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>

                  {/* Filter Chips */}
                  <div className="filter-chips">
                    <div
                      className={`filter-chip ${filterTime === 'today' ? 'active' : ''}`}
                      onClick={() => setFilterTime(filterTime === 'today' ? 'all' : 'today')}
                    >
                      Hoy
                    </div>
                    <div
                      className={`filter-chip ${filterTime === 'week' ? 'active' : ''}`}
                      onClick={() => setFilterTime(filterTime === 'week' ? 'all' : 'week')}
                    >
                      Esta Semana
                    </div>
                    <div
                      className={`filter-chip ${filterTime === 'month' ? 'active' : ''}`}
                      onClick={() => setFilterTime(filterTime === 'month' ? 'all' : 'month')}
                    >
                      Este Mes
                    </div>
                  </div>
                </div>

                {/* Bulk Actions Bar */}
                {selectedNotifications.length > 0 && (
                  <div className="bulk-actions-bar">
                    <div className="bulk-actions-info">
                      <Badge bg="warning">{selectedNotifications.length}</Badge>
                      <span>seleccionada{selectedNotifications.length !== 1 ? 's' : ''}</span>
                    </div>
                    <div className="bulk-actions-buttons">
                      <Button variant="outline-success" size="sm" onClick={markSelectedAsRead}>
                        <CheckCircle size={14} className="me-1" />
                        Marcar Leídas
                      </Button>
                      <Button variant="outline-danger" size="sm" onClick={deleteSelected}>
                        <Trash2 size={14} className="me-1" />
                        Eliminar
                      </Button>
                      <Button variant="outline-secondary" size="sm" onClick={deselectAll}>
                        <X size={14} className="me-1" />
                        Deseleccionar
                      </Button>
                    </div>
                  </div>
                )}

                {/* Notifications List */}
                <div className="notifications-list">
                  {loading ? (
                    // Loading skeleton
                    <>
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="skeleton skeleton-card"></div>
                      ))}
                    </>
                  ) : filteredNotifications.length === 0 ? (
                    <div className="empty-state">
                      <div className="empty-state-icon">
                        <Bell size={80} />
                      </div>
                      <h3 className="empty-state-title">
                        {searchTerm || filterType !== 'all' || filterPriority !== 'all' || filterTime !== 'all'
                          ? 'No se encontraron notificaciones'
                          : '¡Todo al día!'}
                      </h3>
                      <p className="empty-state-message">
                        {searchTerm || filterType !== 'all' || filterPriority !== 'all' || filterTime !== 'all'
                          ? 'Intenta ajustar los filtros de búsqueda'
                          : 'No tienes notificaciones pendientes 🎉'}
                      </p>
                    </div>
                  ) : (
                    filteredNotifications.map((notification) => (
                      <div
                        key={notification.id}
                        className={`notification-card ${notification.type} ${!notification.read ? 'unread' : ''} ${notification.pinned ? 'pinned' : ''}`}
                      >
                        <div className="d-flex align-items-start">
                          {/* Checkbox */}
                          <Form.Check
                            type="checkbox"
                            checked={selectedNotifications.includes(notification.id)}
                            onChange={() => toggleSelection(notification.id)}
                            className="me-3 mt-1"
                          />

                          {/* Icon */}
                          <div className="notification-icon-wrapper">
                            {getTypeIcon(notification.type)}
                          </div>

                          {/* Content */}
                          <div className="notification-content">
                            <div className="notification-header">
                              <h6 className="notification-title">
                                {notification.title}
                                {!notification.read && <Badge className="badge-new ms-2">Nueva</Badge>}
                                {notification.pinned && <Badge className="badge-pinned ms-2">Anclada</Badge>}
                              </h6>
                            </div>

                            <p className="notification-message">{notification.message}</p>

                            <div className="notification-footer">
                              <div className="notification-meta">
                                <span className="notification-time">{formatTime(notification.time)}</span>
                                <Badge className={`badge-priority ${notification.priority}`}>
                                  {notification.priority === 'high' ? 'ALTA' : notification.priority === 'medium' ? 'MEDIA' : 'BAJA'}
                                </Badge>
                                <Badge className="badge-category">{notification.category}</Badge>
                                {notification.metadata?.patientName && (
                                  <Badge bg="info">{notification.metadata.patientName}</Badge>
                                )}
                              </div>

                              <div className="notification-actions">
                                <button
                                  className="notification-action-btn primary"
                                  onClick={() => notification.read ? markAsUnread(notification.id) : markAsRead(notification.id)}
                                  title={notification.read ? 'Marcar como no leída' : 'Marcar como leída'}
                                >
                                  {notification.read ? <EyeOff size={14} /> : <Eye size={14} />}
                                </button>
                                <button
                                  className="notification-action-btn"
                                  onClick={() => togglePin(notification.id)}
                                  title={notification.pinned ? 'Desanclar' : 'Anclar'}
                                >
                                  {notification.pinned ? <PinOff size={14} /> : <Pin size={14} />}
                                </button>
                                {notification.actionUrl && (
                                  <Button
                                    variant="outline-success"
                                    size="sm"
                                    onClick={() => handleNotificationClick(notification)}
                                  >
                                    Ver
                                  </Button>
                                )}
                                <button
                                  className="notification-action-btn danger"
                                  onClick={() => deleteNotification(notification.id)}
                                  title="Eliminar"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </Col>
          </Row>
        </Container>
      </div>
    </>
  );
};

export default NotificationsPage;