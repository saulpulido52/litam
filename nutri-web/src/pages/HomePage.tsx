import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Badge, Alert, Spinner } from 'react-bootstrap';
import { Link } from 'react-router-dom';


interface ServerStatus {
  status: 'checking' | 'online' | 'offline';
  message: string;
  timestamp?: string;
}

const HomePage: React.FC = () => {
  const [serverStatus, setServerStatus] = useState<ServerStatus>({
    status: 'checking',
    message: 'Verificando conexión...'
  });

  const checkServerConnection = async () => {
    setServerStatus({
      status: 'checking',
      message: 'Verificando conexión con el servidor...'
    });

    try {
      // Intentar hacer una llamada simple al backend
      const response = await fetch(`${import.meta.env.VITE_API_URL}/health`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        setServerStatus({
          status: 'online',
          message: 'Servidor conectado correctamente',
          timestamp: new Date().toLocaleTimeString()
        });
      } else {
        throw new Error(`Error ${response.status}`);
      }
    } catch (error) {
      setServerStatus({
        status: 'offline',
        message: 'No se pudo conectar al servidor',
        timestamp: new Date().toLocaleTimeString()
      });
    }
  };

  useEffect(() => {
    checkServerConnection();
  }, []);

  const getStatusVariant = () => {
    switch (serverStatus.status) {
      case 'online': return 'success';
      case 'offline': return 'danger';
      default: return 'warning';
    }
  };

  const getStatusIcon = () => {
    switch (serverStatus.status) {
      case 'online': return '✅';
      case 'offline': return '❌';
      default: return '🔄';
    }
  };

  return (
    <div className="bg-light min-vh-100">
      {/* Header */}
      <div className="nutri-bg-primary text-white py-4 mb-5">
        <Container>
          <Row>
            <Col>
              <h1 className="mb-0">🥗 Nutri - Plataforma de Nutrición Inteligente</h1>
              <p className="mb-0 opacity-75">Tu aliado en el camino hacia una vida más saludable</p>
            </Col>
          </Row>
        </Container>
      </div>

      <Container>
        {/* Estado del Servidor */}
        <Row className="mb-4">
          <Col>
            <Alert variant={getStatusVariant()} className="d-flex align-items-center justify-content-between">
              <div className="d-flex align-items-center">
                <span className="me-2 fs-5">{getStatusIcon()}</span>
                <div>
                  <strong>Estado del Servidor:</strong> {serverStatus.message}
                  {serverStatus.timestamp && (
                    <small className="d-block text-muted">
                      Última verificación: {serverStatus.timestamp}
                    </small>
                  )}
                </div>
              </div>
              <Button
                variant="outline-secondary"
                size="sm"
                onClick={checkServerConnection}
                disabled={serverStatus.status === 'checking'}
              >
                {serverStatus.status === 'checking' ? (
                  <>
                    <Spinner size="sm" className="me-1" />
                    Verificando...
                  </>
                ) : (
                  'Verificar'
                )}
              </Button>
            </Alert>
          </Col>
        </Row>

        {/* Contenido Principal */}
        <Row className="justify-content-center">
          <Col lg={8}>
            <Card className="nutri-card shadow-lg mb-4">
              <Card.Body className="text-center p-5">
                <h2 className="nutri-primary mb-4">
                  Panel Profesional Nutri
                </h2>
                <p className="text-muted fs-5 mb-4">
                  Plataforma web profesional para nutriólogos y administradores.
                  Gestión avanzada de pacientes, citas, planes nutricionales y reportes del sistema.
                </p>

                <Row className="mb-4">
                  <Col md={6} className="mb-3">
                    <div className="border rounded p-3 h-100 border-primary">
                      <h5 className="nutri-primary">👨‍⚕️ Panel Nutriólogo</h5>
                      <p className="text-muted small mb-0">
                        Gestión profesional de pacientes, citas y planes nutricionales
                      </p>
                    </div>
                  </Col>
                  <Col md={6} className="mb-3">
                    <div className="border rounded p-3 h-100 border-warning">
                      <h5 className="text-warning">⚙️ Panel Administrador</h5>
                      <p className="text-muted small mb-0">
                        Administración del sistema, reportes y gestión de usuarios
                      </p>
                    </div>
                  </Col>
                </Row>

                <div className="alert alert-info border-info">
                  <h6 className="mb-2">📱 <strong>Aplicaciones Móviles Disponibles:</strong></h6>
                  <p className="mb-1">🩺 <strong>App Nutriólogos:</strong> iOS y Android para atención móvil</p>
                  <p className="mb-0">👥 <strong>App Pacientes:</strong> iOS y Android para seguimiento personal</p>
                </div>

                <div className="d-grid gap-2 d-md-flex justify-content-md-center">
                  <Link to="/login">
                    <Button
                      variant="primary"
                      size="lg"
                      className="nutri-btn me-md-2"
                    >
                      🔐 Iniciar Sesión
                    </Button>
                  </Link>
                  <Link to="/dashboard">
                    <Button
                      variant="outline-success"
                      size="lg"
                      className="nutri-btn me-md-2"
                    >
                      👨‍⚕️ Panel Nutriólogo
                    </Button>
                  </Link>
                  <Link to="/admin">
                    <Button
                      variant="outline-warning"
                      size="lg"
                      className="nutri-btn me-md-2"
                    >
                      ⚙️ Panel Admin
                    </Button>
                  </Link>
                  <Button
                    variant="outline-secondary"
                    size="lg"
                    className="nutri-btn"
                    onClick={() => window.open(`${import.meta.env.VITE_API_URL}`, '_blank')}
                  >
                    🔧 Ver API
                  </Button>
                </div>
              </Card.Body>
            </Card>

            {/* Información Técnica */}
            <Card className="border-info">
              <Card.Header className="bg-info text-white">
                <h6 className="mb-0">📊 Información del Sistema</h6>
              </Card.Header>
              <Card.Body>
                <Row>
                  <Col md={6}>
                    <p className="mb-1">
                      <Badge bg="success" className="me-2">Frontend</Badge>
                      http://localhost:5000
                    </p>
                    <p className="mb-1">
                      <Badge bg="info" className="me-2">Backend</Badge>
                      http://localhost:4000/api
                    </p>
                  </Col>
                  <Col md={6}>
                    <p className="mb-1">
                      <Badge bg="secondary" className="me-2">UI Framework</Badge>
                      React + Bootstrap 5
                    </p>
                    <p className="mb-1">
                      <Badge bg="warning" className="me-2">WebSocket</Badge>
                      ws://localhost:4000
                    </p>
                  </Col>
                </Row>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default HomePage; 