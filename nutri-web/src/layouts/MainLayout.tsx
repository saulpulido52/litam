import React, { useState, useEffect, useRef } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  Menu,
  X,
  Bell,
  Settings,
  LogOut,
  ChevronDown,
  Sun,
  Moon,
  BarChart3,
  Clock,
  Calendar as CalendarIcon,
  Brain,
  Home,
  Users as UsersIcon,
  FileText as FileTextIcon,
  TrendingUp as TrendingUpIcon,
  MessageSquare,
  User
} from 'lucide-react';
import { Image, Button } from 'react-bootstrap';
import { useAuth } from '../hooks/useAuth';
import '../styles/author-sidebar.css';
import '../styles/dashboard-modern.css';
import { MdEvent, MdNotifications, MdSystemUpdate, MdCheckCircle, MdWarning } from 'react-icons/md';
import { FaUserPlus } from 'react-icons/fa';
import {
  Dropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem
} from 'react-bootstrap';

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

// Componente de avatar que muestra imagen de perfil o ícono por defecto
const UserAvatar: React.FC<{
  profileImage?: string | null;
  size?: number;
  className?: string;
  showIcon?: boolean;
}> = ({ profileImage, size = 24, className = '', showIcon = true }) => {
  if (profileImage) {
    return (
      <Image
        src={profileImage}
        roundedCircle
        width={size + 8}
        height={size + 8}
        className={className}
        style={{ objectFit: 'cover' }}
        alt="Avatar del usuario"
      />
    );
  }

  return showIcon ? <User size={size} /> : null;
};

const MainLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const notificationsRef = useRef<HTMLDivElement>(null);
  const [notificationsPerPage] = useState(4);
  const [currentPage, setCurrentPage] = useState(1);
  const notificationBtnRef = useRef<HTMLButtonElement>(null);
  const notificationMenuPos = useRef<{ top: number, left: number }>({ top: 0, left: 0 });

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

  // Calcular notificaciones no leídas
  const unreadCount = notifications.filter(n => !n.read).length;

  // Obtener notificaciones para la página actual
  const getCurrentNotifications = () => {
    const startIndex = (currentPage - 1) * notificationsPerPage;
    return notifications.slice(startIndex, startIndex + notificationsPerPage);
  };

  const totalPages = Math.ceil(notifications.length / notificationsPerPage);

  // Solicitar permisos de notificación al cargar
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  // Función para reproducir sonido de notificación
  // const playNotificationSound = () => {
  //   try {
  //     const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIG2m98OScTgwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWT');
  //     audio.volume = 0.3;
  //     audio.play().catch(() => {
  //       // Ignorar errores de reproducción
  //     });
  //   } catch (error) {
  //     // Ignorar errores de audio
  //   }
  // };

  // Detectar cambios de tamaño de pantalla
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 992;
      setIsMobile(mobile);

      if (!mobile && sidebarOpen) {
        setSidebarOpen(false);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [sidebarOpen]);

  // Cerrar sidebar al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (sidebarRef.current && !sidebarRef.current.contains(event.target as Node)) {
        setSidebarOpen(false);
      }
    };

    if (sidebarOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [sidebarOpen]);

  // Cerrar notificaciones al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationsRef.current && !notificationsRef.current.contains(event.target as Node)) {
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

  // Cerrar notificaciones con ESC
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setNotificationsOpen(false);
        setSidebarOpen(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Actualizar posición del menú de notificaciones
  useEffect(() => {
    if (notificationsOpen && notificationBtnRef.current) {
      const rect = notificationBtnRef.current.getBoundingClientRect();
      notificationMenuPos.current = {
        top: rect.bottom + 8,
        left: rect.right - 320
      };
    }
  }, [notificationsOpen]);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
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

  // Variable/función removida - no utilizada
  const handleNotificationClick = (notification: Notification) => {
    markNotificationAsRead(notification.id);
    setNotificationsOpen(false);

    if (notification.actionUrl) {
      navigate(notification.actionUrl);
    }
  };

  const handleNotificationsToggle = () => {
    setNotificationsOpen(!notificationsOpen);
  };

  // Variable/función removida - no utilizada
  // Navigation array
  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: Home },
    { name: 'Pacientes', href: '/patients', icon: UsersIcon },
    { name: 'Expedientes Inteligentes', href: '/expedientes-inteligentes', icon: Brain },
    { name: 'Planes de Dieta', href: '/diet-plans', icon: FileTextIcon },
    { name: 'Citas', href: '/appointments', icon: Clock },
    { name: 'Calendario', href: '/calendar', icon: CalendarIcon },
    { name: 'Mensajes', href: '/messages', icon: MessageSquare },
    { name: 'Progreso', href: '/progress', icon: TrendingUpIcon },
    { name: 'Evaluación Pediátrica', href: '/growth-charts', icon: TrendingUpIcon },
    { name: 'Reportes', href: '/reports', icon: BarChart3 },
    { name: 'Notificaciones', href: '/notifications', icon: Bell },
    { name: 'Perfil', href: '/profile', icon: User },
    { name: 'Configuración', href: '/settings', icon: Settings },
  ];

  return (
    <div className="author-layout">
      {/* Sidebar */}
      <div className={`author-sidebar ${isMobile ? 'author-sidebar-mobile' : 'author-sidebar-desktop'} ${sidebarOpen ? 'open' : ''}`} ref={sidebarRef}>
        <div className="author-sidebar-header">
          <div className="author-logo">
            <span className="author-logo-nutri">🥗</span>
            <span className="author-logo-web">Nutri</span>
          </div>
          {isMobile && (
            <button
              className="author-close-btn"
              onClick={() => setSidebarOpen(false)}
            >
              <X size={20} />
            </button>
          )}
        </div>

        <div className="author-user-section">
          <UserAvatar profileImage={user?.profile_image} size={32} />
          <div className="author-user-info">
            <div className="author-user-name">
              {user?.first_name} {user?.last_name}
            </div>
            <div className="author-user-role">
              {user?.role?.name === 'nutritionist' ? 'Nutriólogo' : 'Administrador'}
            </div>
          </div>
        </div>

        <nav className="author-navigation">
          {navigation.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.name}
                to={item.href}
                className={`author-nav-item ${isActive ? 'active' : ''}`}
                onClick={() => setSidebarOpen(false)}
              >
                <item.icon className="author-nav-icon" size={20} />
                <span className="author-nav-text">{item.name}</span>
              </Link>
            );
          })}
        </nav>

        <div className="author-sidebar-footer">
          <button className="author-footer-btn" onClick={handleLogout}>
            <LogOut size={20} />
            <span>Cerrar Sesión</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="author-main-content">
        {/* Header */}
        <header className="author-header">
          <div className="author-header-content">
            <div className="author-header-left">
              {isMobile && (
                <button
                  className="author-header-menu-btn"
                  onClick={() => setSidebarOpen(true)}
                >
                  <Menu size={24} />
                </button>
              )}
              <div className="author-header-title">
                <h1>Panel Nutri</h1>
                <p className="author-header-subtitle">
                  Gestión profesional de nutrición
                </p>
              </div>
            </div>

            <div className="author-header-right">
              <button
                className="author-header-btn"
                onClick={() => setDarkMode(!darkMode)}
                title="Cambiar tema"
              >
                {darkMode ? <Sun size={20} /> : <Moon size={20} />}
              </button>

              <div className="dropdown">
                <button
                  ref={notificationBtnRef}
                  className="author-header-btn"
                  onClick={handleNotificationsToggle}
                  title="Notificaciones"
                >
                  <Bell size={20} />
                  {unreadCount > 0 && (
                    <span className="author-notification-count">
                      {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                  )}
                </button>

                {notificationsOpen && (
                  <div
                    className="notifications-menu-fixed"
                    ref={notificationsRef}
                    style={{
                      position: 'fixed',
                      top: '70px',
                      right: '24px',
                      zIndex: 2000,
                      width: '360px',
                      maxHeight: '400px',
                      overflowY: 'auto',
                      background: '#fff',
                      border: '1px solid #e5e7eb',
                      borderRadius: '14px',
                      boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
                      padding: 0
                    }}
                  >
                    <div className="notifications-header">
                      <h6>Notificaciones</h6>
                      <div className="notifications-actions">
                        <button className="btn" onClick={markAllAsRead}>
                          Marcar todas como leídas
                        </button>
                      </div>
                    </div>

                    <div className="notifications-list">
                      {getCurrentNotifications().map((notification) => (
                        <div
                          key={notification.id}
                          className={`notification-item ${!notification.read ? 'unread' : ''}`}
                          onClick={() => handleNotificationClick(notification)}
                        >
                          <div className="notification-icon-wrapper">
                            <notification.icon className="notification-icon" />
                          </div>
                          <div className="notification-content">
                            <div className="notification-header">
                              <div className="notification-title">{notification.title}</div>
                              <span className={`notification-priority-dot notification-priority-${notification.priority}`}></span>
                            </div>
                            <div className="notification-message">{notification.message}</div>
                            <div className="notification-footer">
                              <small>{notification.time}</small>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {totalPages > 1 && (
                      <div className="notifications-pagination">
                        <Button
                          size="sm"
                          variant="outline-secondary"
                          disabled={currentPage === 1}
                          onClick={() => setCurrentPage(currentPage - 1)}
                        >
                          &#8592;
                        </Button>
                        <span className="pagination-info">
                          {currentPage} / {totalPages}
                        </span>
                        <Button
                          size="sm"
                          variant="outline-secondary"
                          disabled={currentPage === totalPages}
                          onClick={() => setCurrentPage(currentPage + 1)}
                        >
                          &#8594;
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <Dropdown>
                <DropdownToggle as={Button} variant="link" className="author-user-dropdown">
                  <UserAvatar profileImage={user?.profile_image} size={20} />
                  <span className="author-user-name-small">
                    {user?.first_name}
                  </span>
                  <ChevronDown size={16} />
                </DropdownToggle>
                <DropdownMenu>
                  <DropdownItem as={Link} to="/profile">
                    <UserAvatar profileImage={user?.profile_image} size={16} />
                    Perfil
                  </DropdownItem>
                  <DropdownItem as={Link} to="/settings">
                    <Settings size={16} className="me-2" />
                    Configuración
                  </DropdownItem>
                  <div className="dropdown-divider"></div>
                  <DropdownItem onClick={handleLogout} className="text-danger">
                    <LogOut size={16} className="me-2" />
                    Cerrar Sesión
                  </DropdownItem>
                </DropdownMenu>
              </Dropdown>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="author-page-content">
          <Outlet />
        </main>
      </div>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="author-sidebar-overlay"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export default MainLayout; 