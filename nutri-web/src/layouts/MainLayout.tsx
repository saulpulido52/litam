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
          className="position-fixed top-0 start-0 w-100 h-100 bg-dark bg-opacity-50"
          style={{ zIndex: 1040 }}
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div 
        className={`h-100 bg-white shadow-lg ${isMobile ? 'position-fixed' : 'position-relative'}`}
        style={{ 
          width: '280px', 
          zIndex: 1050,
          transform: isMobile 
            ? (sidebarOpen ? 'translateX(0)' : 'translateX(-100%)') 
            : 'translateX(0)',
          transition: 'transform 0.3s ease-in-out'
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
            <div>
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
              className="btn btn-outline-secondary btn-sm d-flex align-items-center justify-content-center"
            >
              <Settings size={16} className="me-2" />
              Configuración
            </Link>
            <button
              onClick={handleLogout}
              className="btn btn-outline-danger btn-sm d-flex align-items-center justify-content-center"
            >
              <LogOut size={16} className="me-2" />
              Cerrar Sesión
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-grow-1 d-flex flex-column">
        {/* Top Header */}
        <header className="bg-white shadow-sm border-bottom py-3 px-4">
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
                <h1 className="h4 mb-0 text-dark">
                  {navigation.find(item => item.href === location.pathname)?.name || 
                   (location.pathname === '/settings' ? 'Configuración' :
                    location.pathname === '/admin' ? 'Panel Administrativo' :
                    location.pathname === '/reports' ? 'Reportes' :
                    location.pathname === '/messages' ? 'Mensajería' :
                    location.pathname === '/progress' ? 'Seguimiento de Progreso' : 'Dashboard')}
                </h1>
                <small className="text-muted">Plataforma Nutricional Profesional</small>
              </div>
            </div>

            <div className="d-flex align-items-center gap-3">
              {/* Notifications */}
              <div className="position-relative dropdown">
                <button 
                  className="btn btn-outline-secondary position-relative"
                  data-bs-toggle="dropdown"
                  aria-expanded="false"
                >
                  <Bell size={18} />
                  <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger" style={{ fontSize: '0.6rem' }}>
                    3
                    <span className="visually-hidden">notificaciones no leídas</span>
                  </span>
                </button>
                <ul className="dropdown-menu dropdown-menu-end" style={{ minWidth: '300px' }}>
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
                  className="btn btn-outline-primary dropdown-toggle d-flex align-items-center"
                  type="button"
                  data-bs-toggle="dropdown"
                  aria-expanded="false"
                >
                  <div className="bg-primary bg-opacity-10 rounded-circle p-1 me-2">
                    <User size={16} className="text-primary" />
                  </div>
                  <span className="me-1">{user?.first_name}</span>
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
        <main className="flex-grow-1 overflow-auto bg-light">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default MainLayout; 