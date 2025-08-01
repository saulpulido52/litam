import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Table, Badge, Alert, ProgressBar} from 'react-bootstrap';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { getRevenueReport, getUsageReport, getConversionReport } from '../../services/monetizationService';

interface RevenueReport {
  total_revenue: number;
  nutritionist_revenue: number;
  patient_revenue: number;
  commission_revenue: number;
  subscription_revenue: number;
  one_time_revenue: number;
  monthly_breakdown: Array<{
    month: string;
    revenue: number;
    nutritionist_count: number;
    patient_count: number;
  }>;
}

interface UsageReport {
  total_users: number;
  active_users: number;
  nutritionist_usage: {
    basic: { count: number; features_used: string[] };
    premium: { count: number; features_used: string[] };
  };
  patient_usage: {
    free: { count: number; features_used: string[] };
    pro: { count: number; features_used: string[] };
    premium: { count: number; features_used: string[] };
  };
  feature_usage: {
    ai_meal_planning: number;
    unlimited_patients: number;
    ai_food_scanning: number;
    barcode_scanning: number;
    smart_shopping_list: number;
    advanced_tracking: number;
  };
}

interface ConversionReport {
  nutritionist_conversions: {
    basic_to_premium: number;
    conversion_rate: number;
    avg_time_to_upgrade: number;
  };
  patient_conversions: {
    free_to_pro: number;
    free_to_premium: number;
    pro_to_premium: number;
    conversion_rate: number;
  };
  revenue_impact: {
    monthly_recurring_revenue: number;
    annual_recurring_revenue: number;
    projected_growth: number;
  };
}

const AdminReports: React.FC = () => {
  const [revenueReport, setRevenueReport] = useState<RevenueReport | null>(null);
  const [usageReport, setUsageReport] = useState<UsageReport | null>(null);
  const [conversionReport, setConversionReport] = useState<ConversionReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'revenue' | 'usage' | 'conversion'>('revenue');

  useEffect(() => {
    loadReports();
  }, []);

  const loadReports = async () => {
    try {
      setLoading(true);
      setError(null);

      const [revenue, usage, conversion] = await Promise.all([
        getRevenueReport(),
        getUsageReport(),
        getConversionReport()
      ]);

      setRevenueReport(revenue);
      setUsageReport(usage);
      setConversionReport(conversion);
    } catch (err) {
      setError('Error al cargar los reportes');
      console.error('Error loading reports:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(amount);
  };

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

  if (loading) {
    return (
      <Container fluid>
        <div className="text-center py-5">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Cargando...</span>
          </div>
        </div>
      </Container>
    );
  }

  if (error) {
    return (
      <Container fluid>
        <Alert variant="danger" className="mt-3">
          {error}
        </Alert>
      </Container>
    );
  }

  return (
    <Container fluid>
      <Row className="mb-4">
        <Col>
          <h2>📊 Reportes de Monetización</h2>
          <p className="text-muted">Análisis completo de ingresos, uso y conversiones</p>
        </Col>
      </Row>

      {/* Navegación de pestañas */}
      <Row className="mb-4">
        <Col>
          <div className="btn-group" role="group">
            <button
              type="button"
              className={`btn ${activeTab === 'revenue' ? 'btn-primary' : 'btn-outline-primary'}`}
              onClick={() => setActiveTab('revenue')}
            >
              💰 Ingresos
            </button>
            <button
              type="button"
              className={`btn ${activeTab === 'usage' ? 'btn-primary' : 'btn-outline-primary'}`}
              onClick={() => setActiveTab('usage')}
            >
              📈 Uso
            </button>
            <button
              type="button"
              className={`btn ${activeTab === 'conversion' ? 'btn-primary' : 'btn-outline-primary'}`}
              onClick={() => setActiveTab('conversion')}
            >
              🔄 Conversiones
            </button>
          </div>
        </Col>
      </Row>

      {/* Reporte de Ingresos */}
      {activeTab === 'revenue' && revenueReport && (
        <div>
          <Row className="mb-4">
            <Col md={3}>
              <Card className="text-center">
                <Card.Body>
                  <h5 className="text-success">Ingresos Totales</h5>
                  <h3>{formatCurrency(revenueReport.total_revenue)}</h3>
                </Card.Body>
              </Card>
            </Col>
            <Col md={3}>
              <Card className="text-center">
                <Card.Body>
                  <h5 className="text-info">Nutriólogos</h5>
                  <h3>{formatCurrency(revenueReport.nutritionist_revenue)}</h3>
                </Card.Body>
              </Card>
            </Col>
            <Col md={3}>
              <Card className="text-center">
                <Card.Body>
                  <h5 className="text-warning">Pacientes</h5>
                  <h3>{formatCurrency(revenueReport.patient_revenue)}</h3>
                </Card.Body>
              </Card>
            </Col>
            <Col md={3}>
              <Card className="text-center">
                <Card.Body>
                  <h5 className="text-primary">Suscripciones</h5>
                  <h3>{formatCurrency(revenueReport.subscription_revenue)}</h3>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          <Row className="mb-4">
            <Col md={8}>
              <Card>
                <Card.Header>
                  <h5>Ingresos Mensuales</h5>
                </Card.Header>
                <Card.Body>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={revenueReport.monthly_breakdown}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                      <Legend />
                      <Line type="monotone" dataKey="revenue" stroke="#8884d8" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </Card.Body>
              </Card>
            </Col>
            <Col md={4}>
              <Card>
                <Card.Header>
                  <h5>Distribución de Ingresos</h5>
                </Card.Header>
                <Card.Body>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={[
                          { name: 'Suscripciones', value: revenueReport.subscription_revenue },
                          { name: 'Comisiones', value: revenueReport.commission_revenue },
                          { name: 'Pago Único', value: revenueReport.one_time_revenue }
                        ]}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {COLORS.map((color, index) => (
                          <Cell key={`cell-${index}`} fill={color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                    </PieChart>
                  </ResponsiveContainer>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </div>
      )}

      {/* Reporte de Uso */}
      {activeTab === 'usage' && usageReport && (
        <div>
          <Row className="mb-4">
            <Col md={3}>
              <Card className="text-center">
                <Card.Body>
                  <h5>Usuarios Totales</h5>
                  <h3>{usageReport.total_users}</h3>
                </Card.Body>
              </Card>
            </Col>
            <Col md={3}>
              <Card className="text-center">
                <Card.Body>
                  <h5>Usuarios Activos</h5>
                  <h3>{usageReport.active_users}</h3>
                </Card.Body>
              </Card>
            </Col>
            <Col md={3}>
              <Card className="text-center">
                <Card.Body>
                  <h5>Nutriólogos</h5>
                  <h3>{usageReport.nutritionist_usage.basic.count + usageReport.nutritionist_usage.premium.count}</h3>
                </Card.Body>
              </Card>
            </Col>
            <Col md={3}>
              <Card className="text-center">
                <Card.Body>
                  <h5>Pacientes</h5>
                  <h3>{usageReport.patient_usage.free.count + usageReport.patient_usage.pro.count + usageReport.patient_usage.premium.count}</h3>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          <Row className="mb-4">
            <Col md={6}>
              <Card>
                <Card.Header>
                  <h5>Uso por Tier - Nutriólogos</h5>
                </Card.Header>
                <Card.Body>
                  <Table striped bordered>
                    <thead>
                      <tr>
                        <th>Tier</th>
                        <th>Usuarios</th>
                        <th>Funcionalidades</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td><Badge bg="secondary">Básico</Badge></td>
                        <td>{usageReport.nutritionist_usage.basic.count}</td>
                        <td>{usageReport.nutritionist_usage.basic.features_used.join(', ')}</td>
                      </tr>
                      <tr>
                        <td><Badge bg="warning">Premium</Badge></td>
                        <td>{usageReport.nutritionist_usage.premium.count}</td>
                        <td>{usageReport.nutritionist_usage.premium.features_used.join(', ')}</td>
                      </tr>
                    </tbody>
                  </Table>
                </Card.Body>
              </Card>
            </Col>
            <Col md={6}>
              <Card>
                <Card.Header>
                  <h5>Uso por Tier - Pacientes</h5>
                </Card.Header>
                <Card.Body>
                  <Table striped bordered>
                    <thead>
                      <tr>
                        <th>Tier</th>
                        <th>Usuarios</th>
                        <th>Funcionalidades</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td><Badge bg="light" text="dark">Gratuito</Badge></td>
                        <td>{usageReport.patient_usage.free.count}</td>
                        <td>{usageReport.patient_usage.free.features_used.join(', ')}</td>
                      </tr>
                      <tr>
                        <td><Badge bg="info">Pro</Badge></td>
                        <td>{usageReport.patient_usage.pro.count}</td>
                        <td>{usageReport.patient_usage.pro.features_used.join(', ')}</td>
                      </tr>
                      <tr>
                        <td><Badge bg="warning">Premium</Badge></td>
                        <td>{usageReport.patient_usage.premium.count}</td>
                        <td>{usageReport.patient_usage.premium.features_used.join(', ')}</td>
                      </tr>
                    </tbody>
                  </Table>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          <Row>
            <Col>
              <Card>
                <Card.Header>
                  <h5>Uso de Funcionalidades</h5>
                </Card.Header>
                <Card.Body>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={[
                      { name: 'IA Planificación', value: usageReport.feature_usage.ai_meal_planning },
                      { name: 'Pacientes Ilimitados', value: usageReport.feature_usage.unlimited_patients },
                      { name: 'Escaneo IA', value: usageReport.feature_usage.ai_food_scanning },
                      { name: 'Códigos Barras', value: usageReport.feature_usage.barcode_scanning },
                      { name: 'Lista Inteligente', value: usageReport.feature_usage.smart_shopping_list },
                      { name: 'Seguimiento Avanzado', value: usageReport.feature_usage.advanced_tracking }
                    ]}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="value" fill="#8884d8" />
                    </BarChart>
                  </ResponsiveContainer>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </div>
      )}

      {/* Reporte de Conversiones */}
      {activeTab === 'conversion' && conversionReport && (
        <div>
          <Row className="mb-4">
            <Col md={4}>
              <Card className="text-center">
                <Card.Body>
                  <h5>Conversiones Nutriólogos</h5>
                  <h3>{conversionReport.nutritionist_conversions.basic_to_premium}</h3>
                  <p className="text-muted">
                    {conversionReport.nutritionist_conversions.conversion_rate}% tasa de conversión
                  </p>
                </Card.Body>
              </Card>
            </Col>
            <Col md={4}>
              <Card className="text-center">
                <Card.Body>
                  <h5>Conversiones Pacientes</h5>
                  <h3>{conversionReport.patient_conversions.free_to_pro + conversionReport.patient_conversions.free_to_premium}</h3>
                  <p className="text-muted">
                    {conversionReport.patient_conversions.conversion_rate}% tasa de conversión
                  </p>
                </Card.Body>
              </Card>
            </Col>
            <Col md={4}>
              <Card className="text-center">
                <Card.Body>
                  <h5>MRR</h5>
                  <h3>{formatCurrency(conversionReport.revenue_impact.monthly_recurring_revenue)}</h3>
                  <p className="text-muted">Ingresos Recurrentes Mensuales</p>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          <Row className="mb-4">
            <Col md={6}>
              <Card>
                <Card.Header>
                  <h5>Conversiones de Nutriólogos</h5>
                </Card.Header>
                <Card.Body>
                  <div className="mb-3">
                    <div className="d-flex justify-content-between">
                      <span>Básico → Premium</span>
                      <span>{conversionReport.nutritionist_conversions.basic_to_premium}</span>
                    </div>
                    <ProgressBar 
                      now={(conversionReport.nutritionist_conversions.basic_to_premium / 100) * 100} 
                      className="mt-1"
                    />
                  </div>
                  <div className="mb-3">
                    <div className="d-flex justify-content-between">
                      <span>Tasa de Conversión</span>
                      <span>{conversionReport.nutritionist_conversions.conversion_rate}%</span>
                    </div>
                    <ProgressBar 
                      now={conversionReport.nutritionist_conversions.conversion_rate} 
                      className="mt-1"
                      variant="success"
                    />
                  </div>
                  <div>
                    <div className="d-flex justify-content-between">
                      <span>Tiempo Promedio para Upgrade</span>
                      <span>{conversionReport.nutritionist_conversions.avg_time_to_upgrade} días</span>
                    </div>
                  </div>
                </Card.Body>
              </Card>
            </Col>
            <Col md={6}>
              <Card>
                <Card.Header>
                  <h5>Conversiones de Pacientes</h5>
                </Card.Header>
                <Card.Body>
                  <div className="mb-3">
                    <div className="d-flex justify-content-between">
                      <span>Gratuito → Pro</span>
                      <span>{conversionReport.patient_conversions.free_to_pro}</span>
                    </div>
                    <ProgressBar 
                      now={(conversionReport.patient_conversions.free_to_pro / 100) * 100} 
                      className="mt-1"
                    />
                  </div>
                  <div className="mb-3">
                    <div className="d-flex justify-content-between">
                      <span>Gratuito → Premium</span>
                      <span>{conversionReport.patient_conversions.free_to_premium}</span>
                    </div>
                    <ProgressBar 
                      now={(conversionReport.patient_conversions.free_to_premium / 100) * 100} 
                      className="mt-1"
                      variant="warning"
                    />
                  </div>
                  <div className="mb-3">
                    <div className="d-flex justify-content-between">
                      <span>Pro → Premium</span>
                      <span>{conversionReport.patient_conversions.pro_to_premium}</span>
                    </div>
                    <ProgressBar 
                      now={(conversionReport.patient_conversions.pro_to_premium / 100) * 100} 
                      className="mt-1"
                      variant="info"
                    />
                  </div>
                  <div>
                    <div className="d-flex justify-content-between">
                      <span>Tasa de Conversión</span>
                      <span>{conversionReport.patient_conversions.conversion_rate}%</span>
                    </div>
                    <ProgressBar 
                      now={conversionReport.patient_conversions.conversion_rate} 
                      className="mt-1"
                      variant="success"
                    />
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          <Row>
            <Col>
              <Card>
                <Card.Header>
                  <h5>Impacto en Ingresos</h5>
                </Card.Header>
                <Card.Body>
                  <Row>
                    <Col md={4}>
                      <div className="text-center">
                        <h4 className="text-primary">
                          {formatCurrency(conversionReport.revenue_impact.monthly_recurring_revenue)}
                        </h4>
                        <p className="text-muted">MRR Mensual</p>
                      </div>
                    </Col>
                    <Col md={4}>
                      <div className="text-center">
                        <h4 className="text-success">
                          {formatCurrency(conversionReport.revenue_impact.annual_recurring_revenue)}
                        </h4>
                        <p className="text-muted">ARR Anual</p>
                      </div>
                    </Col>
                    <Col md={4}>
                      <div className="text-center">
                        <h4 className="text-warning">
                          {conversionReport.revenue_impact.projected_growth}%
                        </h4>
                        <p className="text-muted">Crecimiento Proyectado</p>
                      </div>
                    </Col>
                  </Row>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </div>
      )}
    </Container>
  );
};

export default AdminReports; 