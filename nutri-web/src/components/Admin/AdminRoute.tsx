import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { Spinner, Button, Alert } from 'react-bootstrap';
import { MdAdminPanelSettings, MdSecurity, MdWarning} from 'react-icons/md';

interface AdminRouteProps {
  children: React.ReactNode;
}

const AdminRoute: React.FC<AdminRouteProps> = ({ children }) => {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  // Mostrar loading mientras se verifica la autenticación
  if (isLoading) {
    return (
      <div className="d-flex justify-content-center align-items-center min-vh-100">
        <div className="text-center">
          <Spinner animation="border" variant="primary" />
          <p className="mt-3">Verificando permisos de administrador...</p>
        </div>
      </div>
    );
  }

  // Si no hay usuario autenticado, redirigir al login de admin
  if (!user) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  // Si el usuario no es admin, mostrar error de acceso denegado
  if (user.role?.name !== 'admin') {
    return (
      <div className="d-flex justify-content-center align-items-center min-vh-100">
        <div className="text-center">
          <div className="mb-4">
            <MdSecurity size={64} className="text-danger mb-3" />
            <h3 className="text-danger">Acceso Denegado</h3>
            <p className="text-muted">
              Solo los administradores pueden acceder al panel de administración.
            </p>
          </div>
          
          <Alert variant="warning" className="mb-4">
            <MdWarning className="me-2" />
            <strong>Usuario actual:</strong> {user.first_name} {user.last_name} ({user.role?.name})
          </Alert>
          
          <div className="d-flex gap-2 justify-content-center">
            <Button 
              variant="primary" 
              onClick={() => window.location.href = '/admin/login'}
            >
              <MdAdminPanelSettings className="me-2" />
              Ir al Login de Admin
            </Button>
            <Button 
              variant="outline-secondary" 
              onClick={() => window.location.href = '/dashboard'}
            >
              Ir al Dashboard
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Si es admin, mostrar el contenido
  return <>{children}</>;
};

export default AdminRoute; 