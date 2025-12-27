import React, { useState } from 'react';
import { Container, Row, Col, Card, Button, Form, Alert, Spinner } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { apiService } from '../services/api';
import { Grape } from 'lucide-react';


interface LoginState {
  email: string;
  password: string;
  error: string | null;
  success: string | null;
}

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login, isLoading } = useAuth();
  const [loginState, setLoginState] = useState<LoginState>({
    email: '',
    password: '',
    error: null,
    success: null
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

  const testBackendConnection = async () => {
    setLoginState(prev => ({ ...prev, error: null, success: null }));

    try {
      // Verificar que el backend esté funcionando usando apiService
      await apiService.get('/health');

      setLoginState(prev => ({
        ...prev,
        success: '✅ Conexión con el backend establecida correctamente. Puedes proceder al login.'
      }));
    } catch (error) {
      setLoginState(prev => ({
        ...prev,
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

    console.log('🔐 LoginPage: Starting login process...');
    setLoginState(prev => ({ ...prev, error: null, success: null }));

    try {
      // Usar el servicio de autenticación correcto
      const result = await login({
        email: loginState.email,
        password: loginState.password
      });

      console.log('🔐 LoginPage: Login result:', result);

      if (result.success) {
        setLoginState(prev => ({
          ...prev,
          success: `✅ Login exitoso! Redirigiendo...`
        }));

        // Redirigir al dashboard después del login exitoso
        setTimeout(() => {
          console.log('🔐 LoginPage: Redirecting to dashboard...');
          navigate('/dashboard', { replace: true });
        }, 1000);
      } else {
        setLoginState(prev => ({
          ...prev,
          error: result.message || 'Error al iniciar sesión'
        }));
      }
    } catch (error: any) {
      console.error('🔐 LoginPage: Login error:', error);
      setLoginState(prev => ({
        ...prev,
        error: 'Error de conexión. Verifica que el backend esté funcionando.'
      }));
    }
  };

  const fillDemoCredentials = () => {
    setLoginState(prev => ({
      ...prev,
      email: 'nutritionist@demo.com',
      password: 'demo123',
      error: null,
      success: null
    }));
  };

  // Botones para autocompletar credenciales de prueba
  const fillDefaultAdmin = () => setLoginState(prev => ({ ...prev, email: 'nutri.admin@sistema.com', password: 'nutri123', error: null, success: null }));
  const fillNutri1 = () => setLoginState(prev => ({ ...prev, email: 'dr.maria.gonzalez@demo.com', password: 'demo123', error: null, success: null }));
  const fillNutri2 = () => setLoginState(prev => ({ ...prev, email: 'dr.juan.perez@demo.com', password: 'demo123', error: null, success: null }));
  const fillNutri3 = () => setLoginState(prev => ({ ...prev, email: 'dra.carmen.rodriguez@demo.com', password: 'demo123', error: null, success: null }));

  return (
    <div className="bg-light min-vh-100 d-flex align-items-center">
      <Container>
        <Row className="justify-content-center">
          <Col md={6} lg={5}>
            {/* Header */}
            <div className="text-center mb-4">
              <Link to="/" className="text-decoration-none d-flex justify-content-center align-items-center gap-2">
                <Grape size={32} color="#2c7a7b" />
                <h2 className="nutri-primary mb-0">Litam</h2>
              </Link>
              <p className="text-muted mt-2">Inicia sesión en tu cuenta</p>
            </div>

            <Card className="nutri-card shadow-lg">
              <Card.Body className="p-4">
                <Form onSubmit={handleSubmit}>
                  {/* Botones de autocompletar credenciales */}
                  <div className="mb-3">
                    <p className="text-muted small mb-2 text-center">⚡ Acceso rápido:</p>
                    <div className="d-grid gap-2 mb-2">
                      <Button variant="success" size="sm" onClick={fillDefaultAdmin}>
                        <Grape size={16} className="me-1" /> Admin Sistema (Por Defecto)
                      </Button>
                    </div>
                    <div className="d-flex justify-content-between">
                      <Button variant="outline-secondary" size="sm" onClick={fillNutri1}>Nutri 1</Button>
                      <Button variant="outline-secondary" size="sm" onClick={fillNutri2}>Nutri 2</Button>
                      <Button variant="outline-secondary" size="sm" onClick={fillNutri3}>Nutri 3</Button>
                    </div>
                  </div>

                  <Form.Group className="mb-3">
                    <Form.Label>Email</Form.Label>
                    <Form.Control
                      type="email"
                      name="email"
                      value={loginState.email}
                      onChange={handleInputChange}
                      placeholder="Ingresa tu email"
                      required
                    />
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Contraseña</Form.Label>
                    <Form.Control
                      type="password"
                      name="password"
                      value={loginState.password}
                      onChange={handleInputChange}
                      placeholder="Ingresa tu contraseña"
                      required
                    />
                  </Form.Group>

                  {loginState.error && (
                    <Alert variant="danger" className="mb-3">
                      {loginState.error}
                    </Alert>
                  )}

                  {loginState.success && (
                    <Alert variant="success" className="mb-3">
                      {loginState.success}
                    </Alert>
                  )}

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
                          <Spinner size="sm" className="me-2" />
                          Iniciando sesión...
                        </>
                      ) : (
                        'Iniciar Sesión'
                      )}
                    </Button>
                  </div>
                </Form>

                <hr />

                {/* Botones de prueba */}
                <div className="text-center">
                  <p className="text-muted small mb-2">🔧 Herramientas de desarrollo:</p>
                  <div className="d-grid gap-2 d-md-flex justify-content-md-center">
                    <Button
                      variant="outline-info"
                      size="sm"
                      onClick={fillDemoCredentials}
                      className="me-2"
                    >
                      Llenar credenciales demo
                    </Button>
                    <Button
                      variant="outline-secondary"
                      size="sm"
                      onClick={testBackendConnection}
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <Spinner size="sm" />
                      ) : (
                        'Probar conexión'
                      )}
                    </Button>
                  </div>
                </div>

                <hr />

                <div className="text-center">
                  <Link to="/" className="text-decoration-none">
                    ← Volver al inicio
                  </Link>
                </div>
              </Card.Body>
            </Card>

            {/* Credenciales del Nutricionista Por Defecto */}
            <Card className="mt-3 border-success">
              <Card.Header className="bg-success text-white text-center">
                🥗 Nutricionista Por Defecto (Recomendado)
              </Card.Header>
              <Card.Body className="text-center">
                <p className="mb-1">
                  <strong>Email:</strong> nutri.admin@sistema.com
                </p>
                <p className="mb-1">
                  <strong>Password:</strong> nutri123
                </p>
                <small className="text-muted">
                  ⚠️ Cambia la contraseña después del primer login
                </small>
              </Card.Body>
            </Card>

            {/* Otras credenciales de prueba */}
            <Card className="mt-2 border-secondary">
              <Card.Header className="bg-secondary text-white text-center">
                🔑 Otras Credenciales de Prueba
              </Card.Header>
              <Card.Body className="text-center">
                <p className="mb-1">
                  <strong>Demo:</strong> nutritionist@demo.com / demo123
                </p>
                <p className="mb-1">
                  <strong>María:</strong> dr.maria.gonzalez@demo.com / demo123
                </p>
                <p className="mb-0">
                  <strong>Juan:</strong> dr.juan.perez@demo.com / demo123
                </p>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default LoginPage; 