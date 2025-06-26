import React, { useState, useEffect } from 'react';
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

// Tipos para las notificaciones
interface Notification {
  id: string;
  type: 'appointment' | 'patient' | 'reminder' | 'system';
  title: string;
  message: string;
  time: string;
  read: boolean;
  icon: React.ComponentType<any>;
  iconColor: string;
  bgColor: string;
}

const MainLayout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 992);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated, isLoading, logout } = useAuth();

  // Estado para las notificaciones
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: '1',
      type: 'appointment',
      title: 'Nueva cita programada',
      message: 'María González - Mañana 9:00 AM',
      time: 'Hace 5 minutos',
      read: false,
      icon: Calendar,
      iconColor: 'text-primary',
      bgColor: 'bg-primary bg-opacity-10'
    },
    {
      id: '2',
      type: 'patient',
      title: 'Nuevo paciente registrado',
      message: 'Carlos Mendoza se registró',
      time: 'Hace 1 hora',
      read: false,
      icon: Users,
      iconColor: 'text-success',
      bgColor: 'bg-success bg-opacity-10'
    },
    {
      id: '3',
      type: 'reminder',
      title: 'Recordatorio',
      message: 'Actualizar plan de Ana López',
      time: 'Hace 2 horas',
      read: false,
      icon: Bell,
      iconColor: 'text-warning',
      bgColor: 'bg-warning bg-opacity-10'
    }
  ]);

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

  // Funciones para manejar notificaciones
  const unreadCount = notifications.filter(n => !n.read).length;

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

  const handleNotificationClick = (notification: Notification) => {
    markNotificationAsRead(notification.id);
    
    // Navegar según el tipo de notificación
    switch (notification.type) {
      case 'appointment':
        navigate('/appointments');
        break;
      case 'patient':
        navigate('/patients');
        break;
      case 'reminder':
        navigate('/diet-plans');
        break;
      default:
        navigate('/notifications');
    }
    
    setNotificationsOpen(false);
  };

  const handleNotificationsToggle = () => {
    setNotificationsOpen(!notificationsOpen);
  };

  const handleNotificationsClose = () => {
    setNotificationsOpen(false);
  };

  // Cerrar notificaciones al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest('.notifications-dropdown')) {
        setNotificationsOpen(false);
      }
    };

    if (notificationsOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [notificationsOpen]);

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
    <div className="d-flex" style={{ height: '100vh' }}>
      {/* Sidebar Overlay for mobile */}
      {sidebarOpen && isMobile && (
        <div
          className="sidebar-overlay"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div 
        className={`h-100 bg-white shadow-lg ${
          isMobile 
            ? `sidebar-mobile ${sidebarOpen ? 'open' : ''}` 
            : 'position-relative'
        }`}
        style={{ 
          width: isMobile ? '280px' : '280px', 
          maxWidth: isMobile ? '80vw' : '280px',
          zIndex: 1050,
          ...(isMobile ? {} : { zIndex: 'auto' })
        }}
      >
        {/* Sidebar Header */}
        <div className="d-flex align-items-center justify-content-between p-3 border-bottom">
          <h1 className="h4 mb-0 text-primary fw-bold">
            <span className="text-primary">Nutri</span>
            <span className="text-success">Web</span>
          </h1>
          {isMobile && (
            <button
              className="btn btn-sm btn-outline-secondary"
              onClick={() => setSidebarOpen(false)}
            >
              <X size={18} />
            </button>
          )}
        </div>

        {/* User Info Section */}
        <div className="p-3 border-bottom bg-light">
          <div className="d-flex align-items-center">
            <div className="bg-primary bg-opacity-10 rounded-circle p-2 me-3">
              <User size={24} className="text-primary" />
            </div>
            <div className={isMobile ? 'text-truncate-mobile' : ''}>
              <div className="fw-semibold small">{user?.first_name} {user?.last_name}</div>
              <div className="text-muted small">Nutriólogo Profesional</div>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-grow-1 p-3">
          <div className="nav nav-pills flex-column">
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.href;
              
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`nav-link d-flex align-items-center px-3 py-2 mb-1 text-decoration-none rounded ${
                    isActive
                      ? 'active bg-primary text-white'
                      : 'text-dark hover-bg-light'
                  }`}
                  onClick={() => setSidebarOpen(false)}
                  style={{ 
                    transition: 'all 0.2s ease',
                    ...(isActive ? {} : { 
                      ':hover': { backgroundColor: '#f8f9fa' }
                    })
                  }}
                >
                  <Icon size={18} className="me-3" />
                  <span className="fw-medium">{item.name}</span>
                </Link>
              );
            })}
          </div>
        </nav>

        {/* Sidebar Footer */}
        <div className="p-3 border-top">
          <div className="d-grid gap-2">
            <Link 
              to="/settings" 
              className={`btn btn-outline-secondary btn-sm d-flex align-items-center justify-content-center ${isMobile ? 'btn-mobile' : ''}`}
            >
              <Settings size={16} className="me-2" />
              Configuración
            </Link>
            <button
              onClick={handleLogout}
              className={`btn btn-outline-danger btn-sm d-flex align-items-center justify-content-center ${isMobile ? 'btn-mobile' : ''}`}
            >
              <LogOut size={16} className="me-2" />
              Cerrar Sesión
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className={`flex-grow-1 d-flex flex-column ${isMobile ? 'main-content-mobile' : ''}`}>
        {/* Top Header */}
        <header className={`bg-white shadow-sm border-bottom py-3 px-4 ${isMobile ? 'header-mobile mobile-header' : ''}`}>
          <div className="d-flex align-items-center justify-content-between">
            <div className="d-flex align-items-center">
              {isMobile && (
                <button
                  onClick={() => setSidebarOpen(true)}
                  className="btn btn-outline-secondary me-3"
                >
                  <Menu size={20} />
                </button>
              )}
              <div>
                <h1 className={`h4 mb-0 text-dark ${isMobile ? 'd-none d-sm-block' : ''}`}>
                  {navigation.find(item => item.href === location.pathname)?.name || 
                   (location.pathname === '/settings' ? 'Configuración' :
                    location.pathname === '/admin' ? 'Panel Administrativo' :
                    location.pathname === '/reports' ? 'Reportes' :
                    location.pathname === '/messages' ? 'Mensajería' :
                    location.pathname === '/progress' ? 'Seguimiento de Progreso' : 'Dashboard')}
                </h1>
                <small className={`text-muted ${isMobile ? 'd-none' : ''}`}>Plataforma Nutricional Profesional</small>
              </div>
            </div>

            <div className="d-flex align-items-center gap-3">
              {/* Notifications */}
              <div className="position-relative dropdown notifications-dropdown">
                <button 
                  className={`btn btn-outline-secondary position-relative ${isMobile ? 'btn-mobile' : ''}`}
                  onClick={handleNotificationsToggle}
                  aria-expanded={notificationsOpen}
                >
                  <Bell size={18} />
                  {unreadCount > 0 && (
                    <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger" style={{ fontSize: '0.6rem' }}>
                      {unreadCount}
                      <span className="visually-hidden">notificaciones no leídas</span>
                    </span>
                  )}
                </button>
                
                {notificationsOpen && (
                  <ul className="dropdown-menu dropdown-menu-end show" style={{ 
                    minWidth: isMobile ? '280px' : '300px',
                    position: 'absolute',
                    inset: '0px 0px auto auto',
                    margin: '0px',
                    transform: 'translate3d(0px, 39px, 0px)',
                    zIndex: 1000
                  }}>
                    <li className="dropdown-header">
                      <div className="d-flex justify-content-between align-items-center">
                        <span>Notificaciones</span>
                        {unreadCount > 0 && (
                          <div className="d-flex align-items-center gap-2">
                            <span className="badge bg-primary">{unreadCount} nuevas</span>
                            <button 
                              className="btn btn-link btn-sm p-0 text-decoration-none"
                              onClick={markAllAsRead}
                              title="Marcar todas como leídas"
                            >
                              <small>Marcar todas</small>
                            </button>
                          </div>
                        )}
                      </div>
                    </li>
                    <li><hr className="dropdown-divider" /></li>
                    
                    {notifications.length === 0 ? (
                      <li>
                        <div className="dropdown-item text-center text-muted py-3">
                          <Bell size={24} className="mb-2" />
                          <div>No hay notificaciones</div>
                        </div>
                      </li>
                    ) : (
                      notifications.map((notification) => {
                        const Icon = notification.icon;
                        return (
                          <li key={notification.id}>
                            <div 
                              className={`dropdown-item ${!notification.read ? 'bg-light' : ''}`}
                              onClick={() => handleNotificationClick(notification)}
                              style={{ cursor: 'pointer' }}
                            >
                              <div className="d-flex">
                                <div className={`${notification.bgColor} rounded-circle p-2 me-3`}>
                                  <Icon size={16} className={notification.iconColor} />
                                </div>
                                <div className="flex-grow-1">
                                  <div className={`fw-medium ${!notification.read ? 'fw-bold' : ''}`}>
                                    {notification.title}
                                  </div>
                                  <div className="text-muted small">{notification.message}</div>
                                  <div className="text-muted small">{notification.time}</div>
                                </div>
                                {!notification.read && (
                                  <div className="ms-2">
                                    <div className="bg-primary rounded-circle" style={{ width: '8px', height: '8px' }}></div>
                                  </div>
                                )}
                              </div>
                            </div>
                          </li>
                        );
                      })
                    )}
                    
                    <li><hr className="dropdown-divider" /></li>
                    <li>
                      <Link 
                        className="dropdown-item text-center" 
                        to="/notifications"
                        onClick={handleNotificationsClose}
                      >
                        Ver todas las notificaciones
                      </Link>
                    </li>
                  </ul>
                )}
              </div>

              {/* User Profile Dropdown */}
              <div className="dropdown">
                <button
                  className={`btn btn-outline-primary dropdown-toggle d-flex align-items-center ${isMobile ? 'btn-mobile' : ''}`}
                  type="button"
                  data-bs-toggle="dropdown"
                  aria-expanded="false"
                >
                  <div className="bg-primary bg-opacity-10 rounded-circle p-1 me-2">
                    <User size={16} className="text-primary" />
                  </div>
                  <span className={`me-1 ${isMobile ? 'd-none d-sm-inline' : ''}`}>{user?.first_name}</span>
                </button>
                <ul className="dropdown-menu dropdown-menu-end">
                  <li>
                    <Link className="dropdown-item" to="/profile">
                      <User size={16} className="me-2" />
                      Mi Perfil
                    </Link>
                  </li>
                  <li>
                    <Link className="dropdown-item" to="/settings">
                      <Settings size={16} className="me-2" />
                      Configuración
                    </Link>
                  </li>
                  <li><hr className="dropdown-divider" /></li>
                  <li>
                    <button className="dropdown-item text-danger" onClick={handleLogout}>
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
        <main className={`flex-grow-1 overflow-auto bg-light ${isMobile ? 'content-with-mobile-header' : ''}`}>
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default MainLayout; 