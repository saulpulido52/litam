import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Activity,
  Calendar,
  ChevronRight,
  CreditCard,
  Database,
  Heart,
  Leaf,
  ShieldCheck,
  Smartphone,
  Star,
  UserPlus
} from 'lucide-react';
import { MdCheckCircle, MdVerifiedUser, MdAssignmentInd, MdDashboard } from 'react-icons/md';
import { Container, Row, Col, Button, Navbar, Nav, Card, Badge } from 'react-bootstrap';

const HomePage: React.FC = () => {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const features = [
    {
      icon: <Database size={32} />,
      title: "Expedientes Inteligentes",
      description: "Historial clínico completo, antropometría y seguimiento automatizado."
    },
    {
      icon: <Smartphone size={32} />,
      title: "App para Pacientes",
      description: "Tus pacientes llevan su plan y progreso en su bolsillo. iOS y Android."
    },
    {
      icon: <CreditCard size={32} />,
      title: "Control Financiero",
      description: "Reportes de ingresos, proyección de ganancias y gestión de pagos."
    },
    {
      icon: <Calendar size={32} />,
      title: "Agenda Automatizada",
      description: "Recordatorios automáticos y gestión de citas sin fricción."
    }
  ];

  const tips = [
    "💡 El 80% de los pacientes mejoran su adherencia con seguimiento digital.",
    "🥗 Personalizar los planes reduce la tasa de abandono en un 45%.",
    "📱 Los pacientes revisan su app de nutrición en promedio 3 veces al día.",
    "💧 El registro de consumo de agua es el hábito más fácil de adoptar inicialmente."
  ];

  const [currentTip, setCurrentTip] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTip((prev) => (prev + 1) % tips.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="litam-soft-bg min-vh-100 d-flex flex-column">

      {/* Navigation */}
      <Navbar
        expand="lg"
        fixed="top"
        className={`transition-all duration-300 ${scrolled ? 'glass-nav py-2' : 'bg-transparent py-4'}`}
      >
        <Container>
          <Navbar.Brand href="/" className="fw-bold fs-3 text-success d-flex align-items-center">
            <Leaf className="me-2" fill="#10b981" />
            Litam
          </Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="mx-auto fw-medium">
              <Nav.Link href="#features" className="px-3 text-dark">Funcionalidades</Nav.Link>
              <Nav.Link href="#testimonials" className="px-3 text-dark">Testimonios</Nav.Link>
              <Nav.Link href="#pricing" className="px-3 text-dark">Precios</Nav.Link>
            </Nav>
            <div className="d-flex gap-2 mt-3 mt-lg-0">
              <Link to="/login">
                <Button variant="outline-success" className="px-4 rounded-pill fw-semibold">
                  Iniciar Sesión
                </Button>
              </Link>
              <Link to="/register">
                <Button variant="success" className="px-4 rounded-pill fw-semibold shadow-sm">
                  Registrarse
                </Button>
              </Link>
            </div>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      {/* Hero Section */}
      <section className="pt-5 pt-lg-0 flex-grow-1 d-flex align-items-center position-relative overflow-hidden mt-5">
        <div className="blob blob-1"></div>
        <div className="blob blob-2"></div>

        <Container className="position-relative z-1 py-5">
          <Row className="align-items-center">
            <Col lg={6} className="mb-5 mb-lg-0">
              <Badge bg="success" className="mb-3 px-3 py-2 rounded-pill bg-opacity-10 text-success border border-success">
                ✨ Nueva Versión 2.0 Disponible
              </Badge>
              <h1 className="display-3 fw-bold mb-4 ls-tight">
                Revoluciona tu <br />
                <span className="text-success">Consultorio Nutricional</span>
              </h1>
              <p className="lead text-secondary mb-5 pe-lg-5">
                La plataforma integral para nutriólogos modernos. Gestiona pacientes,
                crea dietas personalizadas y automatiza tu negocio en un solo lugar.
              </p>
              <div className="d-flex flex-column flex-sm-row gap-3">
                <Link to="/register">
                  <Button variant="success" size="lg" className="px-5 py-3 rounded-pill shadow-lg d-flex align-items-center justify-content-center">
                    Comenzar Gratis <ChevronRight size={20} className="ms-2" />
                  </Button>
                </Link>
                <Link to="/demo">
                  <Button variant="white" size="lg" className="px-5 py-3 rounded-pill shadow-sm bg-white text-dark border d-flex align-items-center justify-content-center">
                    Ver Demo
                  </Button>
                </Link>
              </div>

              <div className="mt-5 d-flex align-items-center gap-4 text-secondary small">
                <div className="d-flex align-items-center">
                  <ShieldCheck size={18} className="text-success me-2" />
                  Datos Seguros
                </div>
                <div className="d-flex align-items-center">
                  <Activity size={18} className="text-success me-2" />
                  99.9% Uptime
                </div>
                <div className="d-flex align-items-center">
                  <UserPlus size={18} className="text-success me-2" />
                  Soporte 24/7
                </div>
              </div>
            </Col>

            <Col lg={6}>
              <div className="position-relative px-4">
                {/* Mockup Composition using CSS */}
                <div className="hero-stats-card bg-white p-4" style={{ transform: 'rotate(-2deg)' }}>
                  <div className="d-flex justify-content-between align-items-center mb-4">
                    <div>
                      <h5 className="fw-bold mb-1">Tu Progreso</h5>
                      <span className="text-muted small">Últimos 30 días</span>
                    </div>
                    <Badge bg="success">+12%</Badge>
                  </div>
                  <div className="d-flex align-items-end gap-2" style={{ height: '150px' }}>
                    <div className="w-100 bg-light rounded-top" style={{ height: '40%' }}></div>
                    <div className="w-100 bg-success bg-opacity-25 rounded-top" style={{ height: '60%' }}></div>
                    <div className="w-100 bg-success bg-opacity-50 rounded-top" style={{ height: '80%' }}></div>
                    <div className="w-100 bg-success rounded-top" style={{ height: '70%' }}></div>
                    <div className="w-100 bg-success rounded-top" style={{ height: '90%' }}></div>
                  </div>
                </div>

                <div className="hero-stats-card bg-white p-3 position-absolute" style={{ top: '60%', right: '-20px', width: '220px', transform: 'rotate(5deg)', animationDelay: '1s' }}>
                  <div className="d-flex align-items-center gap-3">
                    <div className="rounded-circle bg-warning bg-opacity-10 p-2">
                      <Star size={20} className="text-warning" />
                    </div>
                    <div>
                      <h6 className="mb-0 fw-bold">4.9/5.0</h6>
                      <small className="text-muted">Satisfacción Cliente</small>
                    </div>
                  </div>
                </div>

                <div className="hero-stats-card bg-white p-3 position-absolute" style={{ top: '-30px', left: '-20px', width: '200px', transform: 'rotate(3deg)', animationDelay: '2s' }}>
                  <div className="d-flex align-items-center gap-3">
                    <div className="rounded-circle bg-primary bg-opacity-10 p-2">
                      <Heart size={20} className="text-primary" />
                    </div>
                    <div>
                      <h6 className="mb-0 fw-bold">85kg → 79kg</h6>
                      <small className="text-success fw-bold">Excelente!</small>
                    </div>
                  </div>
                </div>
              </div>
            </Col>
          </Row>
        </Container>
      </section>

      {/* Nutri-Tips Banner */}
      <div className="bg-dark text-white text-white-forced py-3 overflow-hidden">
        <Container>
          <div className="d-flex align-items-center justify-content-center text-center fade-in">
            <span className="badge bg-success me-3">Nutri-Tip Daily</span>
            <p className="mb-0 fw-light fst-italic text-white-forced">
              {tips[currentTip]}
            </p>
          </div>
        </Container>
      </div>

      {/* Features Section */}
      <section id="features" className="py-5 bg-white">
        <Container className="py-5">
          <div className="text-center mb-5">
            <h2 className="display-5 fw-bold mb-3">Todo lo que necesitas</h2>
            <p className="text-muted lead">Herramientas poderosas diseñadas para potenciar tu práctica clínica.</p>
          </div>

          <Row>
            {features.map((feature, idx) => (
              <Col md={6} lg={3} key={idx} className="mb-4">
                <Card className="h-100 border-0 shadow-sm feature-card p-3">
                  <Card.Body>
                    <div className="feature-icon-wrapper">
                      {feature.icon}
                    </div>
                    <h5 className="fw-bold mb-3">{feature.title}</h5>
                    <p className="text-muted mb-0">{feature.description}</p>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        </Container>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-5 bg-light position-relative">
        <Container className="py-5">
          <div className="text-center mb-5">
            <h2 className="display-5 fw-bold mb-3">Planes Flexibles</h2>
            <p className="text-muted lead">Elige el modelo que mejor se adapte a tu crecimiento.</p>
          </div>

          <Row className="justify-content-center align-items-stretch g-4">
            {/* Revenue Share Plan */}
            <Col lg={4} md={6}>
              <Card className="h-100 border-0 shadow-sm hover-shadow-lg transition-all">
                <Card.Body className="p-5 d-flex flex-column text-center">
                  <div className="mb-4">
                    <span className="badge bg-success bg-opacity-10 text-success p-2 rounded-pill fw-bold">Popular</span>
                  </div>
                  <h3 className="fw-bold mb-2">Revenue Share</h3>
                  <div className="display-4 fw-bold text-dark mb-4">
                    0<span className="fs-4 text-muted">/mes</span>
                  </div>
                  <p className="text-muted mb-4">
                    Paga solo una pequeña comisión por consulta realizada. Ideal para empezar.
                  </p>
                  <ul className="list-unstyled text-start mb-5 mx-auto" style={{ maxWidth: '250px' }}>
                    <li className="mb-3 d-flex align-items-center">
                      <MdCheckCircle className="text-success me-2" size={20} /> Sin costo fijo mensual
                    </li>
                    <li className="mb-3 d-flex align-items-center">
                      <MdCheckCircle className="text-success me-2" size={20} /> Pacientes Ilimitados
                    </li>
                    <li className="mb-3 d-flex align-items-center">
                      <MdCheckCircle className="text-success me-2" size={20} /> Todas las funciones
                    </li>
                    <li className="d-flex align-items-center">
                      <MdCheckCircle className="text-success me-2" size={20} /> Soporte estándar
                    </li>
                  </ul>
                  <Link to="/register" className="mt-auto">
                    <Button variant="outline-success" size="lg" className="w-100 rounded-pill">
                      Comenzar Gratis
                    </Button>
                  </Link>
                </Card.Body>
              </Card>
            </Col>

            {/* Enterprise Plan */}
            <Col lg={4} md={6}>
              <Card className="h-100 border-success border-2 shadow hover-shadow-lg transition-all bg-dark text-white">
                <Card.Body className="p-5 d-flex flex-column text-center">
                  <div className="mb-4">
                    <span className="badge bg-warning text-dark p-2 rounded-pill fw-bold">Empresarial</span>
                  </div>
                  <h3 className="fw-bold mb-2">Enterprise</h3>
                  <div className="display-6 fw-bold mb-4 py-2">
                    A Medida
                  </div>
                  <p className="text-gray-300 mb-4 opacity-75">
                    Soluciones personalizadas para clínicas, hospitales y grandes equipos.
                  </p>
                  <ul className="list-unstyled text-start mb-5 mx-auto text-gray-300" style={{ maxWidth: '250px' }}>
                    <li className="mb-3 d-flex align-items-center">
                      <Star className="text-warning me-2" size={20} /> Incluye Plan Pro
                    </li>
                    <li className="mb-3 d-flex align-items-center">
                      <MdVerifiedUser className="text-warning me-2" size={20} /> API Access & Integraciones
                    </li>
                    <li className="mb-3 d-flex align-items-center">
                      <MdAssignmentInd className="text-warning me-2" size={20} /> Soporte Dedicado 24/7
                    </li>
                    <li className="d-flex align-items-center">
                      <MdDashboard className="text-warning me-2" size={20} /> Dashboard Multi-Sede
                    </li>
                  </ul>
                  <Link to="/contact" className="mt-auto">
                    <Button variant="success" size="lg" className="w-100 rounded-pill fw-bold">
                      Contactar Ventas
                    </Button>
                  </Link>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          <div className="text-center mt-5 text-muted small">
            <p>* Próximamente más planes mensuales y anuales con descuentos exclusivos.</p>
          </div>
        </Container>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-5 litam-soft-bg">
        <Container className="py-5">
          <Row className="justify-content-center">
            <Col lg={8} className="text-center">
              <h2 className="mb-5 fw-bold">Lo que dicen los expertos</h2>
              <Card className="border-0 shadow-lg testimonial-card p-4">
                <Card.Body>
                  <div className="d-flex justify-content-center mb-4">
                    {[1, 2, 3, 4, 5].map(i => <Star key={i} size={20} className="text-warning fill-current" fill="#ffc107" />)}
                  </div>
                  <p className="lead fst-italic mb-4">
                    "Litam transformó completamente la manera en que gestiono mi consultorio.
                    Mis pacientes aman la app y yo ahorro 10 horas a la semana en administración."
                  </p>
                  <div>
                    <h6 className="fw-bold mb-0">Dra. Sofía Martínez</h6>
                    <small className="text-muted">Nutrióloga Deportiva</small>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Container>
      </section>

      {/* CTA Footer */}
      <section className="py-5 bg-success text-white text-center">
        <Container>
          <h2 className="fw-bold mb-4">¿Listo para modernizar tu consultorio?</h2>
          <Link to="/register">
            <Button variant="light" size="lg" className="px-5 py-3 rounded-pill text-success fw-bold">
              Crear Cuenta Gratis
            </Button>
          </Link>
          <p className="mt-3 opacity-75 small">No se requiere tarjeta de crédito • 14 días de prueba</p>
        </Container>
      </section>

      <footer className="bg-dark text-white py-4 mt-auto">
        <Container>
          <Row className="align-items-center">
            <Col md={6} className="text-center text-md-start mb-3 mb-md-0">
              <span className="fw-bold text-success">Litam</span> &copy; {new Date().getFullYear()}
            </Col>
            <Col md={6} className="text-center text-md-end">
              <a href="#" className="text-white text-decoration-none me-3 opacity-75 hover-opacity-100">Privacidad</a>
              <a href="#" className="text-white text-decoration-none opacity-75 hover-opacity-100">Términos</a>
            </Col>
          </Row>
        </Container>
      </footer>
    </div>
  );
};

export default HomePage;