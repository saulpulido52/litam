import React from 'react';
import { Alert, Button, Card, Row, Col } from 'react-bootstrap';
import { FaExclamationTriangle, FaKey, FaSignInAlt, FaRedo } from 'react-icons/fa';

interface ErrorAutenticacionProps {
  error: string;
  onRetry?: () => void;
}

const ErrorAutenticacion: React.FC<ErrorAutenticacionProps> = ({ error, onRetry }) => {
  const handleLogin = () => {
    // Limpiar token inválido
    localStorage.removeItem('access_token');
    // Redirigir al login
    window.location.href = '/login';
  };

  const handleRefresh = () => {
    window.location.reload();
  };

  const isAuthError = error.toLowerCase().includes('sesión') || 
                     error.toLowerCase().includes('autent') || 
                     error.toLowerCase().includes('permisos') ||
                     error.toLowerCase().includes('401');

  if (!isAuthError) {
    return (
      <Alert variant="danger" className="mb-3">
        <FaExclamationTriangle className="me-2" />
        <strong>Error:</strong> {error}
        {onRetry && (
          <div className="mt-2">
            <Button variant="outline-danger" size="sm" onClick={onRetry}>
              <FaRedo className="me-1" />
              Reintentar
            </Button>
          </div>
        )}
      </Alert>
    );
  }

  return (
    <Card className="border-warning mb-3">
      <Card.Header className="bg-warning text-dark">
        <FaKey className="me-2" />
        <strong>Problema de Autenticación</strong>
      </Card.Header>
      <Card.Body>
        <Alert variant="warning" className="mb-3">
          <strong>Error detectado:</strong> {error}
        </Alert>

        <h6 className="mb-3">💡 Soluciones recomendadas:</h6>
        
        <Row>
          <Col md={6}>
            <Card className="border-info h-100">
              <Card.Body className="text-center">
                <FaSignInAlt className="text-info mb-3" size={32} />
                <h6>Iniciar Sesión Nuevamente</h6>
                <p className="small text-muted mb-3">
                  Tu sesión ha expirado o el token es inválido.
                </p>
                <Button variant="info" onClick={handleLogin} className="w-100">
                  Ir al Login
                </Button>
              </Card.Body>
            </Card>
          </Col>
          <Col md={6}>
            <Card className="border-secondary h-100">
              <Card.Body className="text-center">
                <FaRedo className="text-secondary mb-3" size={32} />
                <h6>Recargar Página</h6>
                <p className="small text-muted mb-3">
                  A veces un simple reload soluciona el problema.
                </p>
                <Button variant="secondary" onClick={handleRefresh} className="w-100">
                  Recargar
                </Button>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        <Alert variant="info" className="mt-3 mb-0">
          <h6 className="alert-heading">ℹ️ ¿Por qué sucede esto?</h6>
          <ul className="mb-0 small">
            <li><strong>Sesión expirada:</strong> Los tokens tienen tiempo de vida limitado</li>
            <li><strong>Permisos insuficientes:</strong> Tu rol no tiene acceso a esta función</li>
            <li><strong>Conexión interrumpida:</strong> Problemas temporales de red</li>
          </ul>
        </Alert>
      </Card.Body>
    </Card>
  );
};

export default ErrorAutenticacion; 