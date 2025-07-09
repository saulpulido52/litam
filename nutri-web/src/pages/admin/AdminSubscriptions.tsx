import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Badge, Button, Alert, Table } from 'react-bootstrap';
import { 
  CreditCard, 
  Users, 
  TrendingUp, 
  Calendar,
  CheckCircle,
  AlertTriangle,
  DollarSign,
  Package
} from 'lucide-react';

interface Subscription {
  id: string;
  userId: string;
  userName: string;
  planName: string;
  status: 'active' | 'expired' | 'cancelled' | 'pending';
  startDate: string;
  endDate: string;
  amount: number;
  currency: string;
  paymentMethod: string;
  autoRenew: boolean;
}

interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  currency: string;
  duration: number; // días
  features: string[];
  activeSubscriptions: number;
  totalRevenue: number;
}

interface SubscriptionStats {
  totalSubscriptions: number;
  activeSubscriptions: number;
  monthlyRevenue: number;
  averageRevenue: number;
  renewalRate: number;
  churnRate: number;
}

const AdminSubscriptions: React.FC = () => {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [stats, setStats] = useState<SubscriptionStats | null>(null);
  const [loading, setLoading] = useState(true);

  // Simulación de datos de suscripciones
  const fetchSubscriptionData = async () => {
    setLoading(true);
    
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const mockSubscriptions: Subscription[] = [
      {
        id: '1',
        userId: 'user1',
        userName: 'María González',
        planName: 'Plan Premium',
        status: 'active',
        startDate: '2024-01-15',
        endDate: '2024-02-15',
        amount: 99.99,
        currency: 'USD',
        paymentMethod: 'Tarjeta de Crédito',
        autoRenew: true
      },
      {
        id: '2',
        userId: 'user2',
        userName: 'Carlos Rodríguez',
        planName: 'Plan Básico',
        status: 'active',
        startDate: '2024-01-10',
        endDate: '2024-02-10',
        amount: 49.99,
        currency: 'USD',
        paymentMethod: 'PayPal',
        autoRenew: true
      },
      {
        id: '3',
        userId: 'user3',
        userName: 'Ana Martínez',
        planName: 'Plan Premium',
        status: 'expired',
        startDate: '2023-12-01',
        endDate: '2024-01-01',
        amount: 99.99,
        currency: 'USD',
        paymentMethod: 'Tarjeta de Crédito',
        autoRenew: false
      },
      {
        id: '4',
        userId: 'user4',
        userName: 'Luis Pérez',
        planName: 'Plan Básico',
        status: 'cancelled',
        startDate: '2023-11-15',
        endDate: '2023-12-15',
        amount: 49.99,
        currency: 'USD',
        paymentMethod: 'Tarjeta de Crédito',
        autoRenew: false
      }
    ];

    const mockPlans: SubscriptionPlan[] = [
      {
        id: '1',
        name: 'Plan Básico',
        price: 49.99,
        currency: 'USD',
        duration: 30,
        features: ['Acceso básico', 'Soporte por email', '5 consultas/mes'],
        activeSubscriptions: 45,
        totalRevenue: 2249.55
      },
      {
        id: '2',
        name: 'Plan Premium',
        price: 99.99,
        currency: 'USD',
        duration: 30,
        features: ['Acceso completo', 'Soporte prioritario', 'Consultas ilimitadas', 'Análisis avanzado'],
        activeSubscriptions: 28,
        totalRevenue: 2799.72
      },
      {
        id: '3',
        name: 'Plan Anual',
        price: 899.99,
        currency: 'USD',
        duration: 365,
        features: ['Todo del Premium', '2 meses gratis', 'Soporte 24/7'],
        activeSubscriptions: 12,
        totalRevenue: 10799.88
      }
    ];

    const mockStats: SubscriptionStats = {
      totalSubscriptions: 85,
      activeSubscriptions: 73,
      monthlyRevenue: 5049.15,
      averageRevenue: 59.40,
      renewalRate: 85.9,
      churnRate: 14.1
    };

    setSubscriptions(mockSubscriptions);
    setPlans(mockPlans);
    setStats(mockStats);
    setLoading(false);
  };

  useEffect(() => {
    fetchSubscriptionData();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'success';
      case 'expired':
        return 'warning';
      case 'cancelled':
        return 'danger';
      case 'pending':
        return 'info';
      default:
        return 'secondary';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active':
        return 'Activa';
      case 'expired':
        return 'Expirada';
      case 'cancelled':
        return 'Cancelada';
      case 'pending':
        return 'Pendiente';
      default:
        return 'Desconocido';
    }
  };

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: currency
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '400px' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Cargando...</span>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-4">
        <h3 className="mb-1">Gestión de Suscripciones</h3>
        <p className="text-muted mb-0">
          Administración de planes, pagos y estadísticas de suscripciones
        </p>
      </div>

      {/* Estadísticas Generales */}
      {stats && (
        <Row className="mb-4">
          <Col md={3}>
            <Card className="h-100">
              <Card.Body>
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <h6 className="card-title mb-1">Total Suscripciones</h6>
                    <h4 className="mb-0">{stats.totalSubscriptions}</h4>
                  </div>
                  <Users className="text-muted" style={{ width: '24px', height: '24px' }} />
                </div>
                <small className="text-muted">
                  {stats.activeSubscriptions} activas
                </small>
              </Card.Body>
            </Card>
          </Col>

          <Col md={3}>
            <Card className="h-100">
              <Card.Body>
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <h6 className="card-title mb-1">Ingresos Mensuales</h6>
                    <h4 className="mb-0">{formatCurrency(stats.monthlyRevenue, 'USD')}</h4>
                  </div>
                  <DollarSign className="text-muted" style={{ width: '24px', height: '24px' }} />
                </div>
                <small className="text-muted">
                  Promedio: {formatCurrency(stats.averageRevenue, 'USD')}
                </small>
              </Card.Body>
            </Card>
          </Col>

          <Col md={3}>
            <Card className="h-100">
              <Card.Body>
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <h6 className="card-title mb-1">Tasa de Renovación</h6>
                    <h4 className="mb-0">{stats.renewalRate}%</h4>
                  </div>
                  <TrendingUp className="text-muted" style={{ width: '24px', height: '24px' }} />
                </div>
                <small className="text-muted">
                  Tasa de cancelación: {stats.churnRate}%
                </small>
              </Card.Body>
            </Card>
          </Col>

          <Col md={3}>
            <Card className="h-100">
              <Card.Body>
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <h6 className="card-title mb-1">Planes Activos</h6>
                    <h4 className="mb-0">{plans.length}</h4>
                  </div>
                  <Package className="text-muted" style={{ width: '24px', height: '24px' }} />
                </div>
                <small className="text-muted">
                  {plans.reduce((acc, plan) => acc + plan.activeSubscriptions, 0)} suscriptores
                </small>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      )}

      {/* Planes de Suscripción */}
      <Card className="mb-4">
        <Card.Header>
          <h5 className="mb-0">Planes de Suscripción</h5>
        </Card.Header>
        <Card.Body>
          <div className="row">
            {plans.map((plan) => (
              <div key={plan.id} className="col-12 mb-3">
                <div className="d-flex justify-content-between align-items-center p-3 border rounded">
                  <div className="flex-1">
                    <div className="d-flex align-items-center">
                      <div>
                        <div className="fw-bold">{plan.name}</div>
                        <div className="text-muted small">
                          {formatCurrency(plan.price, plan.currency)} / {plan.duration} días
                        </div>
                      </div>
                    </div>
                    <div className="mt-2">
                      <small className="text-muted">
                        Características: {plan.features.join(', ')}
                      </small>
                    </div>
                  </div>
                  <div className="text-end">
                    <div className="fw-bold">{plan.activeSubscriptions} suscriptores</div>
                    <div className="text-muted small">
                      {formatCurrency(plan.totalRevenue, plan.currency)}
                    </div>
                    <Button size="sm" variant="outline-primary" className="mt-2">
                      Editar Plan
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card.Body>
      </Card>

      {/* Suscripciones Activas */}
      <Card className="mb-4">
        <Card.Header>
          <h5 className="mb-0">Suscripciones Recientes</h5>
        </Card.Header>
        <Card.Body>
          <Table responsive>
            <thead>
              <tr>
                <th>Usuario</th>
                <th>Plan</th>
                <th>Estado</th>
                <th>Monto</th>
                <th>Fecha Fin</th>
              </tr>
            </thead>
            <tbody>
              {subscriptions.map((subscription) => (
                <tr key={subscription.id}>
                  <td>
                    <div>
                      <div className="fw-bold">{subscription.userName}</div>
                      <small className="text-muted">
                        {subscription.paymentMethod}
                      </small>
                    </div>
                  </td>
                  <td>{subscription.planName}</td>
                  <td>
                    <Badge bg={getStatusColor(subscription.status)}>
                      {getStatusText(subscription.status)}
                    </Badge>
                  </td>
                  <td>
                    <div className="fw-bold text-success">
                      {formatCurrency(subscription.amount, subscription.currency)}
                    </div>
                  </td>
                  <td>
                    <small className="text-muted">
                      {new Date(subscription.endDate).toLocaleDateString()}
                    </small>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Card.Body>
      </Card>

      {/* Alertas de Suscripciones */}
      <Card className="mb-4">
        <Card.Header>
          <h5 className="mb-0">Alertas de Suscripciones</h5>
        </Card.Header>
        <Card.Body>
          <div>
            {subscriptions.some(s => s.status === 'expired') && (
              <Alert variant="warning">
                <AlertTriangle className="me-2" style={{ width: '16px', height: '16px' }} />
                Hay suscripciones expiradas que requieren renovación.
              </Alert>
            )}

            {subscriptions.filter(s => s.status === 'active').length > 0 && (
              <Alert variant="success">
                <CheckCircle className="me-2" style={{ width: '16px', height: '16px' }} />
                {subscriptions.filter(s => s.status === 'active').length} suscripciones activas funcionando correctamente.
              </Alert>
            )}

            {stats && stats.churnRate > 10 && (
              <Alert variant="danger">
                <AlertTriangle className="me-2" style={{ width: '16px', height: '16px' }} />
                Tasa de cancelación elevada ({stats.churnRate}%). Se recomienda revisar la estrategia de retención.
              </Alert>
            )}
          </div>
        </Card.Body>
      </Card>

      {/* Acciones Rápidas */}
      <Card>
        <Card.Header>
          <h5 className="mb-0">Acciones Rápidas</h5>
        </Card.Header>
        <Card.Body>
          <Row>
            <Col md={4}>
              <Button variant="outline-primary" className="w-100">
                <Calendar className="me-2" style={{ width: '16px', height: '16px' }} />
                Crear Nuevo Plan
              </Button>
            </Col>
            <Col md={4}>
              <Button variant="outline-primary" className="w-100">
                <CreditCard className="me-2" style={{ width: '16px', height: '16px' }} />
                Gestionar Pagos
              </Button>
            </Col>
            <Col md={4}>
              <Button variant="outline-primary" className="w-100">
                <TrendingUp className="me-2" style={{ width: '16px', height: '16px' }} />
                Ver Reportes
              </Button>
            </Col>
          </Row>
        </Card.Body>
      </Card>
    </div>
  );
};

export default AdminSubscriptions; 