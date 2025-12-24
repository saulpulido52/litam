import React, { useState } from 'react';
import { Container, Row, Col, Card, Button, Form, Alert, Spinner, Badge } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { apiService } from '../services/api';

// React Icons
import {
  MdAdminPanelSettings,
  MdSecurity,
  MdLock,
  MdVisibility,
  MdVisibilityOff,
  MdCheckCircle,
  MdError,
  MdSpeed,
  MdHealthAndSafety,
  MdRefresh,
  MdInfo,
  MdShield,
  MdVerified,
  MdDashboard
} from 'react-icons/md';
import {
  FaUsers,
  FaShieldAlt,
  FaDatabase,
  FaServer,
  FaNetworkWired
} from 'react-icons/fa';

interface AdminLoginState {
  email: string;
  password: string;
  error: string | null;
  success: string | null;
  showPassword: boolean;
  systemStatus: {
    backend: boolean;
    database: boolean | null;
    api: boolean;
  } | null;
}

const AdminLoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login, isLoading } = useAuth();
  const [loginState, setLoginState] = useState<AdminLoginState>({
    email: '',
    password: '',
    error: null,
    success: null,
    showPassword: false,
    systemStatus: null
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setLoginState(prev => ({
      ...prev,
      [name]: value,
      error: null,
      success: null
    }));
  };

  const togglePasswordVisibility = () => {
    setLoginState(prev => ({
      ...prev,
      showPassword: !prev.showPassword
    }));
  };

  // Modificar la función checkSystemStatus para que solo consulte /api/health antes de login
  const checkSystemStatus = async () => {
    setLoginState(prev => ({ ...prev, error: null, success: null }));

    try {
      // Verificar backend (público) usando apiService
      await apiService.get('/health');

      const systemStatus = {
        backend: true,
        database: null, // No se consulta antes de login
        api: true // Solo backend
      };

      setLoginState(prev => ({
        ...prev,
        systemStatus,
        success: '✅ Backend funcionando correctamente'
      }));

    } catch (error) {
      setLoginState(prev => ({
        ...prev,
        systemStatus: { backend: false, database: null, api: false },
        error: '❌ No se pudo conectar al backend. Verifica que esté funcionando.'
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!loginState.email || !loginState.password) {
      setLoginState(prev => ({
        ...prev,
        error: 'Por favor completa todos los campos'
      }));
      return;
    }

    console.log('🔐 AdminLoginPage: Starting admin login process...');
    setLoginState(prev => ({ ...prev, error: null, success: null }));

    try {
      const result = await login({
        email: loginState.email,
        password: loginState.password
      });

      console.log('🔐 AdminLoginPage: Login result:', result);

      if (result.success) {
        // Obtener el usuario actualizado del hook useAuth
        const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
        console.log('🔐 AdminLoginPage: Current user after login:', currentUser);

        if (currentUser?.role?.name === 'admin') {
          setLoginState(prev => ({
            ...prev,
            success: `✅ Login exitoso! Accediendo al panel de administración...`
          }));

          // Redirección inmediata para admin
          setTimeout(() => {
            console.log('🔐 AdminLoginPage: Redirecting admin to /admin');
            navigate('/admin', { replace: true });
          }, 500);
        } else {
          setLoginState(prev => ({
            ...prev,
            success: `✅ Login exitoso! Redirigiendo al dashboard...`
          }));

          // Redirección para no-admin
          setTimeout(() => {
            console.log('🔐 AdminLoginPage: Redirecting non-admin to /dashboard');
            navigate('/dashboard', { replace: true });
          }, 500);
        }
      } else {
        setLoginState(prev => ({
          ...prev,
          error: result.message || 'Error al iniciar sesión'
        }));
      }
    } catch (error: any) {
      console.error('🔐 AdminLoginPage: Login error:', error);
      setLoginState(prev => ({
        ...prev,
        error: 'Error de conexión. Verifica que el backend esté funcionando.'
      }));
    }
  };

  // Credenciales de admin predefinidas
  const fillAdminCredentials = () => {
    setLoginState(prev => ({
      ...prev,
      email: 'nutri.admin@sistema.com',
      password: 'nutri123',
      error: null,
      success: null
    }));
  };

  const fillSuperAdminCredentials = () => {
    setLoginState(prev => ({
      ...prev,
      email: 'admin@nutri.com',
      password: 'admin123',
      error: null,
      success: null
    }));
  };

  return (
    <div className="bg-gradient-primary min-vh-100 d-flex align-items-center">
      <Container>
        <Row className="justify-content-center">
          <Col md={8} lg={6}>
            {/* Header */}
            <div className="text-center mb-4">
              <div className="mb-3">
                <MdAdminPanelSettings size={64} className="text-white mb-3" />
                <h2 className="text-white mb-2">Panel de Administración</h2>
                <p className="text-white-50">Acceso exclusivo para administradores del sistema</p>
              </div>
            </div>

            <Card className="border-0 shadow-lg">
              <Card.Header className="bg-primary text-white text-center py-3">
                <h5 className="mb-0">
                  <MdSecurity className="me-2" />
                  Autenticación de Administrador
                </h5>
              </Card.Header>
              <Card.Body className="p-4">
                <Form onSubmit={handleSubmit}>
                  {/* Estado del Sistema */}
                  <div className="mb-4">
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <h6 className="mb-0">
                        <MdHealthAndSafety className="me-2 text-info" />
                        Estado del Sistema
                      </h6>
                      <Button
                        variant="outline-info"
                        size="sm"
                        onClick={checkSystemStatus}
                        disabled={isLoading}
                      >
                        <MdRefresh className="me-1" />
                        Verificar
                      </Button>
                    </div>

                    {loginState.systemStatus && (
                      <div className="d-flex gap-2 mb-3">
                        <Badge bg={loginState.systemStatus.backend ? 'success' : 'danger'}>
                          <FaServer className="me-1" />
                          Backend
                        </Badge>
                        <Badge bg={loginState.systemStatus.database ? 'success' : 'danger'}>
                          <FaDatabase className="me-1" />
                          Base de Datos
                        </Badge>
                        <Badge bg={loginState.systemStatus.api ? 'success' : 'danger'}>
                          <FaNetworkWired className="me-1" />
                          API
                        </Badge>
                      </div>
                    )}

                    {!loginState.systemStatus && (
                      <div className="text-center py-3">
                        <Button
                          variant="outline-primary"
                          size="sm"
                          onClick={checkSystemStatus}
                        >
                          <MdRefresh className="me-1" />
                          Verificar Estado del Sistema
                        </Button>
                      </div>
                    )}
                  </div>

                  {/* Credenciales de Acceso Rápido */}
                  <div className="mb-4">
                    <h6 className="mb-3">
                      <MdSpeed className="me-2 text-warning" />
                      Acceso Rápido
                    </h6>
                    <div className="d-grid gap-2">
                      <Button
                        variant="success"
                        size="sm"
                        onClick={fillAdminCredentials}
                      >
                        <MdVerified className="me-2" />
                        Admin Sistema (Principal)
                      </Button>
                      <Button
                        variant="outline-secondary"
                        size="sm"
                        onClick={fillSuperAdminCredentials}
                      >
                        <MdShield className="me-2" />
                        Super Admin (Alternativo)
                      </Button>
                    </div>
                  </div>

                  {/* Formulario de Login */}
                  <Form.Group className="mb-3">
                    <Form.Label>
                      <MdAdminPanelSettings className="me-2" />
                      Email de Administrador
                    </Form.Label>
                    <Form.Control
                      type="email"
                      name="email"
                      value={loginState.email}
                      onChange={handleInputChange}
                      placeholder="admin@sistema.com"
                      required
                    />
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>
                      <MdLock className="me-2" />
                      Contraseña
                    </Form.Label>
                    <div className="position-relative">
                      <Form.Control
                        type={loginState.showPassword ? 'text' : 'password'}
                        name="password"
                        value={loginState.password}
                        onChange={handleInputChange}
                        placeholder="Ingresa tu contraseña"
                        required
                      />
                      <Button
                        type="button"
                        variant="outline-secondary"
                        size="sm"
                        className="position-absolute end-0 top-0 h-100 border-0"
                        onClick={togglePasswordVisibility}
                      >
                        {loginState.showPassword ? <MdVisibilityOff /> : <MdVisibility />}
                      </Button>
                    </div>
                  </Form.Group>

                  {/* Alertas */}
                  {loginState.error && (
                    <Alert variant="danger" className="mb-3">
                      <MdError className="me-2" />
                      {loginState.error}
                    </Alert>
                  )}

                  {loginState.success && (
                    <Alert variant="success" className="mb-3">
                      <MdCheckCircle className="me-2" />
                      {loginState.success}
                    </Alert>
                  )}

                  {/* Botón de Login */}
                  <div className="d-grid gap-2 mb-3">
                    <Button
                      type="submit"
                      variant="primary"
                      size="lg"
                      className="nutri-btn"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <>
                          <Spinner animation="border" size="sm" className="me-2" />
                          Verificando...
                        </>
                      ) : (
                        <>
                          <MdAdminPanelSettings className="me-2" />
                          Acceder al Panel de Administración
                        </>
                      )}
                    </Button>
                  </div>

                  {/* Información de Seguridad */}
                  <Alert variant="info" className="mb-3">
                    <MdInfo className="me-2" />
                    <strong>Seguridad:</strong> Este panel es de acceso exclusivo para administradores del sistema.
                    Todas las acciones quedan registradas en el log del sistema.
                  </Alert>

                  {/* Enlaces */}
                  <div className="text-center">
                    <Link to="/login" className="text-decoration-none">
                      <Button variant="outline-secondary" size="sm">
                        <MdDashboard className="me-1" />
                        Ir al Login Normal
                      </Button>
                    </Link>
                  </div>
                </Form>
              </Card.Body>
            </Card>

            {/* Información Adicional */}
            <div className="text-center mt-4">
              <div className="d-flex justify-content-center gap-4 text-white-50">
                <div className="d-flex align-items-center">
                  <FaUsers className="me-2" />
                  <small>Gestión de Usuarios</small>
                </div>
                <div className="d-flex align-items-center">
                  <FaDatabase className="me-2" />
                  <small>Monitoreo del Sistema</small>
                </div>
                <div className="d-flex align-items-center">
                  <FaShieldAlt className="me-2" />
                  <small>Seguridad Avanzada</small>
                </div>
              </div>
            </div>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default AdminLoginPage; 