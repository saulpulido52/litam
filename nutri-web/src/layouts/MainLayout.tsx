import React, { useState, useEffect, useRef } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  Calendar, 
  FileText, 
  User, 
  Menu, 
  X,
  LogOut,
  Bell,
  Settings,
  TrendingUp,
  MessageCircle,
  BarChart3
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import '../styles/author-sidebar.css';
import '../styles/dashboard-modern.css';
import '../styles/profile.css';
import ReactDOM from 'react-dom';
import { MdEvent, MdNotifications, MdSystemUpdate, MdCheckCircle, MdWarning, MdDone, MdDelete, MdChevronLeft, MdChevronRight, MdDoneAll, MdVolumeUp, MdVolumeOff, MdNotificationsOff } from 'react-icons/md';
import { FaUserPlus } from 'react-icons/fa';
import { Badge, Button, Container, Navbar, Nav, Dropdown, Modal, Form } from 'react-bootstrap';
import { 
  Search,
  Filter,
  MoreVertical,
  Plus,
  MessageSquare,
  Shield,
  HelpCircle,
  Sun,
  Moon
} from 'lucide-react';

// Tipos para las notificaciones
interface Notification {
  id: string;
  type: 'appointment' | 'patient' | 'reminder' | 'system' | 'success' | 'warning' | 'info';
  title: string;
  message: string;
  time: string;
  read: boolean;
  icon: React.ComponentType<any>;
  iconColor: string;
  bgColor: string;
  actionUrl?: string;
  priority?: 'low' | 'medium' | 'high';
}

const MainLayout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 992);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [showNotificationSound, setShowNotificationSound] = useState(true);
  const [notificationMenuPos, setNotificationMenuPos] = useState<{top: number, left: number}>({top: 0, left: 0});
  const notificationBtnRef = useRef<HTMLButtonElement>(null);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated, isLoading, logout } = useAuth();

  // Estado para notificaciones
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: '1',
      type: 'appointment',
      title: 'Nueva Cita Programada',
      message: 'María González tiene una cita mañana a las 10:00 AM',
      time: '2 min',
      read: false,
      icon: MdEvent,
      iconColor: '#007bff',
      bgColor: '#e3f2fd',
      actionUrl: '/appointments',
      priority: 'high'
    },
    {
      id: '2',
      type: 'patient',
      title: 'Nuevo Paciente Registrado',
      message: 'Juan Pérez se ha registrado como paciente',
      time: '15 min',
      read: false,
      icon: FaUserPlus,
      iconColor: '#28a745',
      bgColor: '#e8f5e8',
      actionUrl: '/patients',
      priority: 'medium'
    },
    {
      id: '3',
      type: 'reminder',
      title: 'Recordatorio de Seguimiento',
      message: 'Carlos Rodríguez necesita seguimiento de su plan nutricional',
      time: '1 hora',
      read: false,
      icon: MdNotifications,
      iconColor: '#ffc107',
      bgColor: '#fff8e1',
      actionUrl: '/patients',
      priority: 'medium'
    },
    {
      id: '4',
      type: 'system',
      title: 'Actualización del Sistema',
      message: 'Nuevas funcionalidades disponibles en la plataforma',
      time: '2 horas',
      read: false,
      icon: MdSystemUpdate,
      iconColor: '#6c757d',
      bgColor: '#f8f9fa',
      actionUrl: '/dashboard',
      priority: 'low'
    },
    {
      id: '5',
      type: 'success',
      title: 'Plan Nutricional Completado',
      message: 'Ana López ha completado exitosamente su plan de 4 semanas',
      time: '3 horas',
      read: false,
      icon: MdCheckCircle,
      iconColor: '#28a745',
      bgColor: '#e8f5e8',
      actionUrl: '/diet-plans',
      priority: 'high'
    },
    {
      id: '6',
      type: 'warning',
      title: 'Paciente Inactivo',
      message: 'Roberto Silva no ha reportado progreso en 2 semanas',
      time: '1 día',
      read: false,
      icon: MdWarning,
      iconColor: '#fd7e14',
      bgColor: '#fff3e0',
      actionUrl: '/patients',
      priority: 'medium'
    }
  ]);

  const [showNotifications, setShowNotifications] = useState(false);
  const [notificationSound, setNotificationSound] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const notificationsPerPage = 4;
  const notificationsRef = useRef<HTMLButtonElement>(null);

  // Calcular notificaciones no leídas
  const unreadCount = notifications.filter(n => !n.read).length;

  // Obtener notificaciones para la página actual
  const getCurrentNotifications = () => {
    const startIndex = (currentPage - 1) * notificationsPerPage;
    return notifications.slice(startIndex, startIndex + notificationsPerPage);
  };

  const totalPages = Math.ceil(notifications.length / notificationsPerPage);

  // Simular nuevas notificaciones en tiempo real - DESHABILITADO
  // useEffect(() => {
  //   const notificationInterval = setInterval(() => {
  //     const shouldAddNotification = Math.random() < 0.1; // 10% de probabilidad cada 30 segundos
  //     
  //     if (shouldAddNotification) {
  //       const newNotification: Notification = {
  //         id: Date.now().toString(),
  //         type: 'system',
  //         title: 'Actualización del sistema',
  //         message: 'Nuevas funcionalidades disponibles en la plataforma',
  //         time: 'Ahora',
  //         read: false,
  //         icon: Info,
  //         iconColor: 'text-info',
  //         bgColor: 'bg-info bg-opacity-10',
  //         actionUrl: '/dashboard',
  //         priority: 'low'
  //       };
  //       
  //       setNotifications(prev => [newNotification, ...prev]);
  //       
  //       // Reproducir sonido de notificación si está habilitado
  //       if (showNotificationSound) {
  //         playNotificationSound();
  //       }
  //       
  //       // Mostrar notificación del navegador
  //       if ('Notification' in window && Notification.permission === 'granted') {
  //         new Notification(newNotification.title, {
  //           body: newNotification.message,
  //           icon: '/vite.svg'
  //         });
  //       }
  //     }
  //   }, 30000); // Cada 30 segundos

  //   return () => clearInterval(notificationInterval);
  // }, [showNotificationSound]);

  // Solicitar permisos de notificación al cargar
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  // Función para reproducir sonido de notificación
  const playNotificationSound = () => {
    try {
      const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIG2m98OScTgwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWT');
      audio.volume = 0.3;
      audio.play().catch(() => {
        // Ignorar errores de reproducción
      });
    } catch (error) {
      // Ignorar errores de audio
    }
  };

  // Detectar cambios de tamaño de pantalla
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 992;
      setIsMobile(mobile);
      if (!mobile) {
        setSidebarOpen(false); // Cerrar sidebar en desktop
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Verificar autenticación
  useEffect(() => {
    console.log('🏠 MainLayout: Auth check', { isAuthenticated, isLoading, user: user ? 'Found' : 'Not found' });
    
    if (!isLoading && !isAuthenticated) {
      console.log('🏠 MainLayout: User not authenticated, redirecting to login...');
      navigate('/login', { replace: true });
    }
  }, [isAuthenticated, isLoading, navigate, user]);

  // Calcular posición del menú al abrir
  useEffect(() => {
    if (notificationsOpen && notificationBtnRef.current) {
      const rect = notificationBtnRef.current.getBoundingClientRect();
      setNotificationMenuPos({
        top: rect.bottom + 8, // 8px de separación
        left: rect.right - 320, // ancho del menú (ajustar si cambia)
      });
    }
  }, [notificationsOpen]);

  // Navigation array
  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Pacientes', href: '/patients', icon: Users },
    { name: 'Planes de Dieta', href: '/diet-plans', icon: FileText },
    { name: 'Citas', href: '/appointments', icon: Calendar },
    { name: 'Mensajes', href: '/messages', icon: MessageCircle },
    { name: 'Progreso', href: '/progress', icon: TrendingUp },
    { name: 'Reportes', href: '/reports', icon: BarChart3 },
    { name: 'Notificaciones', href: '/notifications', icon: Bell },
    { name: 'Perfil', href: '/profile', icon: User },
  ];

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login', { replace: true });
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  const markNotificationAsRead = (notificationId: string) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === notificationId 
          ? { ...notification, read: true }
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

  const handleNotificationClick = (notification: Notification) => {
    // Marcar como leída
    markNotificationAsRead(notification.id);
    
    // Navegar si hay URL de acción
    if (notification.actionUrl) {
      navigate(notification.actionUrl);
    }
    
    // Cerrar el menú
    setShowNotifications(false);
  };

  const handleNotificationsToggle = () => {
    setShowNotifications(!showNotifications);
  };

  const handleNotificationsClose = () => {
    setShowNotifications(false);
  };

  // Cerrar notificaciones automáticamente después de 30 segundos de inactividad
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    
    if (showNotifications) {
      timeoutId = setTimeout(() => {
        setShowNotifications(false);
      }, 30000); // 30 segundos
    }

    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [showNotifications]);

  const toggleNotificationSound = () => {
    setNotificationSound(!notificationSound);
  };

  // Cerrar notificaciones al hacer clic fuera o presionar Escape
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      
      // Verificar si el clic fue fuera del botón de notificaciones y del menú
      const isClickInsideButton = notificationsRef.current?.contains(target);
      const isClickInsideMenu = target.closest('.notifications-menu-fixed');
      
      if (!isClickInsideButton && !isClickInsideMenu) {
        setShowNotifications(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && showNotifications) {
        setShowNotifications(false);
      }
    };

    if (showNotifications) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [showNotifications]);

  // Proteger acceso si no hay usuario autenticado
  if (!user && !isLoading) {
    return (
      <div className="container py-5 text-center">
        <div className="alert alert-danger" role="alert">
          <strong>Error:</strong> No hay usuario autenticado. Por favor, inicia sesión nuevamente.
        </div>
      </div>
    );
  }

  // Mostrar loading mientras se verifica la autenticación
  if (isLoading) {
    console.log('🏠 MainLayout: Loading...');
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
        <div className="text-center">
          <div className="spinner-border text-primary mb-3" role="status">
            <span className="visually-hidden">Cargando...</span>
          </div>
          <div>Verificando autenticación...</div>
        </div>
      </div>
    );
  }

  // Si no está autenticado, no renderizar nada (el useEffect ya redirige)
  if (!isAuthenticated || !user) {
    console.log('🏠 MainLayout: Not authenticated, should redirect...');
    return null;
  }

  return (
    <div className="author-layout">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && isMobile && (
        <div 
          className="author-sidebar-overlay"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`author-sidebar ${isMobile ? 'author-sidebar-mobile' : 'author-sidebar-desktop'} ${sidebarOpen ? 'open' : ''}`}>
        <div className="author-sidebar-header">
          <div className="author-logo">
            <span className="author-logo-nutri">Nutri</span>
            <span className="author-logo-web">Web</span>
          </div>
          {isMobile && (
            <button
              onClick={() => setSidebarOpen(false)}
              className="author-close-btn"
              aria-label="Cerrar menú"
            >
              <X size={20} />
            </button>
          )}
        </div>

        <div className="author-user-section">
          <div className="author-user-avatar">
            <User size={24} />
          </div>
          <div className="author-user-info">
            <div className="author-user-name">
              {user?.first_name} {user?.last_name}
            </div>
            <div className="author-user-role">
              {user?.role?.name === 'nutritionist' ? 'Nutriólogo' : 'Usuario'}
            </div>
          </div>
        </div>

        <nav className="author-navigation">
          {navigation.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                to={item.href}
                className={`author-nav-item ${location.pathname === item.href ? 'active' : ''}`}
                onClick={() => isMobile && setSidebarOpen(false)}
              >
                <Icon className="author-nav-icon" size={20} />
                <span className="author-nav-text">{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* Sidebar Footer - Estilo Apple */}
        <div className="author-sidebar-footer">
          <Link 
            to="/settings" 
            className="author-footer-btn author-footer-btn-secondary"
          >
            <Settings size={18} />
            <span>Configuración</span>
          </Link>
          <button
            onClick={handleLogout}
            className="author-footer-btn author-footer-btn-danger"
          >
            <LogOut size={18} />
            <span>Cerrar Sesión</span>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className={`author-main-content ${isMobile ? 'main-content-mobile' : ''}`}>
        {/* Top Header - Apple Style */}
        <header className={`author-header ${isMobile ? 'header-mobile' : ''}`}>
          <div className="author-header-content">
            <div className="author-header-left">
              {isMobile && (
                <button
                  onClick={() => setSidebarOpen(true)}
                  className="author-header-menu-btn"
                  aria-label="Abrir menú"
                >
                  <Menu size={20} />
                </button>
              )}
              <div className="author-header-title">
                <h1 className={isMobile ? 'd-none d-sm-block' : ''}>
                  {navigation.find(item => item.href === location.pathname)?.name || 
                   (location.pathname === '/settings' ? 'Configuración' :
                    location.pathname === '/admin' ? 'Panel Administrativo' :
                    location.pathname === '/reports' ? 'Reportes' :
                    location.pathname === '/messages' ? 'Mensajería' :
                    location.pathname === '/progress' ? 'Seguimiento de Progreso' : 'Dashboard')}
                </h1>
                <p className={`author-header-subtitle ${isMobile ? 'd-none' : ''}`}>
                  Plataforma Nutricional Profesional
                </p>
              </div>
            </div>

            <div className="author-header-right">
              {/* Notifications */}
              <div className="notifications-dropdown-fixed position-relative">
                <Button
                  variant="outline-light"
                  className="author-header-btn position-relative"
                  onClick={handleNotificationsToggle}
                  ref={notificationsRef}
                >
                  <MdNotifications className="me-1" />
                  <span className="d-none d-sm-inline">Notificaciones</span>
                  {unreadCount > 0 && (
                    <span className="author-notification-count position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                      {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                  )}
                </Button>

                {showNotifications && ReactDOM.createPortal(
                  <div className="notifications-menu-fixed">
                    <div className="notifications-header">
                      <h6 className="mb-0">
                        <MdNotifications className="me-2" />
                        Notificaciones
                        {unreadCount > 0 && (
                          <Badge bg="danger" className="ms-2">
                            {unreadCount}
                          </Badge>
                        )}
                      </h6>
                      <div className="notifications-actions">
                        <Button
                          variant="link"
                          size="sm"
                          onClick={markAllAsRead}
                          className="text-decoration-none p-0"
                          title="Marcar todas como leídas"
                        >
                          <MdDoneAll />
                        </Button>
                        <Button
                          variant="link"
                          size="sm"
                          onClick={toggleNotificationSound}
                          className="text-decoration-none p-0 ms-2"
                          title={notificationSound ? "Silenciar" : "Activar sonido"}
                        >
                          {notificationSound ? <MdVolumeUp /> : <MdVolumeOff />}
                        </Button>
                      </div>
                    </div>

                    <div className="notifications-list">
                      {getCurrentNotifications().length === 0 ? (
                        <div className="text-center py-3">
                          <MdNotificationsOff className="text-muted mb-2" size={24} />
                          <p className="text-muted mb-0 small">No hay notificaciones</p>
                        </div>
                      ) : (
                        <>
                          {getCurrentNotifications().map((notification) => (
                            <div
                              key={notification.id}
                              className={`notification-item ${!notification.read ? 'unread' : ''}`}
                              onClick={() => handleNotificationClick(notification)}
                            >
                              <div className="notification-icon-wrapper">
                                <notification.icon 
                                  className="notification-icon"
                                  style={{ color: notification.iconColor }}
                                />
                              </div>
                              <div className="notification-content">
                                <div className="notification-header">
                                  <h6 className="notification-title mb-1">
                                    {notification.title}
                                  </h6>
                                  <div className="notification-actions">
                                    <Button
                                      variant="link"
                                      size="sm"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        markNotificationAsRead(notification.id);
                                      }}
                                      className="text-decoration-none p-0"
                                      title="Marcar como leída"
                                    >
                                      <MdDone />
                                    </Button>
                                    <Button
                                      variant="link"
                                      size="sm"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        deleteNotification(notification.id);
                                      }}
                                      className="text-decoration-none p-0 ms-1 text-danger"
                                      title="Eliminar"
                                    >
                                      <MdDelete />
                                    </Button>
                                  </div>
                                </div>
                                <p className="notification-message mb-1">
                                  {notification.message}
                                </p>
                                <div className="notification-footer">
                                  <small className="text-muted">
                                    {notification.time}
                                  </small>
                                  {notification.priority === 'high' && (
                                    <Badge bg="danger" className="ms-2 small">
                                      Alta
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                        </>
                      )}
                    </div>

                    {totalPages > 1 && (
                      <div className="notifications-pagination">
                        <Button
                          variant="outline-secondary"
                          size="sm"
                          onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                          disabled={currentPage === 1}
                          className="me-2"
                        >
                          <MdChevronLeft />
                        </Button>
                        <span className="pagination-info">
                          {currentPage} de {totalPages}
                        </span>
                        <Button
                          variant="outline-secondary"
                          size="sm"
                          onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                          disabled={currentPage === totalPages}
                          className="ms-2"
                        >
                          <MdChevronRight />
                        </Button>
                      </div>
                    )}

                    {notifications.length > 0 && (
                      <div className="notifications-footer">
                        <Button
                          variant="link"
                          size="sm"
                          onClick={() => navigate('/notifications')}
                          className="text-decoration-none"
                        >
                          Ver todas las notificaciones
                        </Button>
                      </div>
                    )}
                  </div>,
                  document.body
                )}
              </div>

              {/* User Profile Dropdown */}
              <div className="dropdown">
                <button
                  className="author-user-dropdown"
                  type="button"
                  data-bs-toggle="dropdown"
                  aria-expanded="false"
                >
                  <div className="author-user-avatar-small">
                    <User size={16} />
                  </div>
                  <span className={`author-user-name-small ${isMobile ? 'd-none d-sm-inline' : ''}`}>
                    {user?.first_name}
                  </span>
                </button>
                <ul className="dropdown-menu dropdown-menu-end author-dropdown-menu">
                  <li>
                    <Link className="author-dropdown-item" to="/profile">
                      <User size={16} className="me-2" />
                      Mi Perfil
                    </Link>
                  </li>
                  <li>
                    <Link className="author-dropdown-item" to="/settings">
                      <Settings size={16} className="me-2" />
                      Configuración
                    </Link>
                  </li>
                  <li><hr className="author-dropdown-divider" /></li>
                  <li>
                    <button className="author-dropdown-item danger" onClick={handleLogout}>
                      <LogOut size={16} className="me-2" />
                      Cerrar Sesión
                    </button>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className={`author-page-content ${isMobile ? 'content-with-mobile-header' : ''}`}>
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default MainLayout; 