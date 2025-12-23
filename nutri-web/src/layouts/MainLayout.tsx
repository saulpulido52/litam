<<<<<<< HEAD
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

const MainLayout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 992);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated, isLoading, logout } = useAuth();
=======
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
import '../styles/profile.css';
import { MdEvent, MdNotifications, MdSystemUpdate, MdCheckCircle, MdWarning} from 'react-icons/md';
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
  const notificationMenuPos = useRef<{top: number, left: number}>({top: 0, left: 0});

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
>>>>>>> nutri/main

  // Detectar cambios de tamaño de pantalla
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 992;
      setIsMobile(mobile);
<<<<<<< HEAD
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
    { name: 'Perfil', href: '/profile', icon: User },
  ];

  const handleLogout = async () => {
    await logout();
  };

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
=======
      
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
        left: rect.right - 320};
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
>>>>>>> nutri/main
            </button>
          )}
        </div>

<<<<<<< HEAD
        {/* User Info Section */}
        <div className="p-3 border-bottom bg-light">
          <div className="d-flex align-items-center">
            <div className="bg-primary bg-opacity-10 rounded-circle p-2 me-3">
              <User size={24} className="text-primary" />
            </div>
            <div className={isMobile ? 'text-truncate-mobile' : ''}>
              <div className="fw-semibold small">{user?.first_name} {user?.last_name}</div>
              <div className="text-muted small">Nutriólogo Profesional</div>
=======
        <div className="author-user-section">
          <UserAvatar profileImage={user?.profile_image} size={32} />
          <div className="author-user-info">
            <div className="author-user-name">
              {user?.first_name} {user?.last_name}
            </div>
            <div className="author-user-role">
              {user?.role?.name === 'nutritionist' ? 'Nutriólogo' : 'Administrador'}
>>>>>>> nutri/main
            </div>
          </div>
        </div>

<<<<<<< HEAD
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
              <div className="position-relative dropdown">
                <button 
                  className={`btn btn-outline-secondary position-relative ${isMobile ? 'btn-mobile' : ''}`}
                  data-bs-toggle="dropdown"
                  aria-expanded="false"
                >
                  <Bell size={18} />
                  <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger" style={{ fontSize: '0.6rem' }}>
                    3
                    <span className="visually-hidden">notificaciones no leídas</span>
                  </span>
                </button>
                <ul className="dropdown-menu dropdown-menu-end" style={{ minWidth: isMobile ? '280px' : '300px' }}>
                  <li className="dropdown-header">
                    <div className="d-flex justify-content-between align-items-center">
                      <span>Notificaciones</span>
                      <span className="badge bg-primary">3 nuevas</span>
                    </div>
                  </li>
                  <li><hr className="dropdown-divider" /></li>
                  <li>
                    <div className="dropdown-item">
                      <div className="d-flex">
                        <div className="bg-primary bg-opacity-10 rounded-circle p-2 me-3">
                          <Calendar size={16} className="text-primary" />
                        </div>
                        <div className="flex-grow-1">
                          <div className="fw-medium">Nueva cita programada</div>
                          <div className="text-muted small">María González - Mañana 9:00 AM</div>
                          <div className="text-muted small">Hace 5 minutos</div>
                        </div>
                      </div>
                    </div>
                  </li>
                  <li>
                    <div className="dropdown-item">
                      <div className="d-flex">
                        <div className="bg-success bg-opacity-10 rounded-circle p-2 me-3">
                          <Users size={16} className="text-success" />
                        </div>
                        <div className="flex-grow-1">
                          <div className="fw-medium">Nuevo paciente registrado</div>
                          <div className="text-muted small">Carlos Mendoza se registró</div>
                          <div className="text-muted small">Hace 1 hora</div>
                        </div>
                      </div>
                    </div>
                  </li>
                  <li>
                    <div className="dropdown-item">
                      <div className="d-flex">
                        <div className="bg-warning bg-opacity-10 rounded-circle p-2 me-3">
                          <Bell size={16} className="text-warning" />
                        </div>
                        <div className="flex-grow-1">
                          <div className="fw-medium">Recordatorio</div>
                          <div className="text-muted small">Actualizar plan de Ana López</div>
                          <div className="text-muted small">Hace 2 horas</div>
                        </div>
                      </div>
                    </div>
                  </li>
                  <li><hr className="dropdown-divider" /></li>
                  <li>
                    <Link className="dropdown-item text-center" to="/notifications">
                      Ver todas las notificaciones
                    </Link>
                  </li>
                </ul>
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
=======
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
>>>>>>> nutri/main
            </div>
          </div>
        </header>

        {/* Page Content */}
<<<<<<< HEAD
        <main className={`flex-grow-1 overflow-auto bg-light ${isMobile ? 'content-with-mobile-header' : ''}`}>
          <Outlet />
        </main>
      </div>
=======
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
>>>>>>> nutri/main
    </div>
  );
};

export default MainLayout; 