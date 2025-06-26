import React from 'react';
import { Card, Row, Col, Badge } from 'react-bootstrap';

interface DashboardChartsProps {
  stats: any;
  incomeSummary?: any;
  patientAnalytics?: any;
}

const DashboardCharts: React.FC<DashboardChartsProps> = ({
  stats,
  incomeSummary,
  patientAnalytics
}) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(amount);
  };

  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  const getTrendIcon = (current: number, previous: number) => {
    if (current > previous) return '↗️';
    if (current < previous) return '↘️';
    return '→';
  };

  const getTrendColor = (current: number, previous: number) => {
    if (current > previous) return 'success';
    if (current < previous) return 'danger';
    return 'secondary';
  };

  return (
    <div className="dashboard-charts">
      {/* Income Summary Section */}
      {incomeSummary && (
        <Row className="mb-4">
          <Col lg={8} className="mb-4">
            <Card className="shadow-sm border-0 h-100">
              <Card.Header className="bg-light border-0">
                <h5 className="mb-0">
                  <i className="fas fa-chart-line me-2 text-primary"></i>
                  Resumen de Ingresos
                </h5>
              </Card.Header>
              <Card.Body className="p-4">
                <Row>
                  <Col md={4} className="text-center mb-3">
                    <div className="fs-2 text-primary fw-bold">
                      {formatCurrency(incomeSummary.total_income)}
                    </div>
                    <small className="text-muted">Ingresos Totales</small>
                  </Col>
                  <Col md={4} className="text-center mb-3">
                    <div className="fs-2 text-success fw-bold">
                      {incomeSummary.total_consultations}
                    </div>
                    <small className="text-muted">Consultas Realizadas</small>
                  </Col>
                  <Col md={4} className="text-center mb-3">
                    <div className="fs-2 text-info fw-bold">
                      {formatCurrency(incomeSummary.average_per_consultation)}
                    </div>
                    <small className="text-muted">Promedio por Consulta</small>
                  </Col>
                </Row>
                
                {incomeSummary.monthly_trend && incomeSummary.monthly_trend.length > 0 && (
                  <div className="mt-4">
                    <h6 className="mb-3">Tendencia Mensual</h6>
                    <div className="d-flex align-items-end" style={{ height: '120px' }}>
                      {incomeSummary.monthly_trend.slice(-6).map((month: any, index: number) => (
                        <div key={index} className="flex-fill text-center mx-1">
                          <div 
                            className="bg-primary bg-opacity-75 rounded-top"
                            style={{ 
                              height: `${(month.income / Math.max(...incomeSummary.monthly_trend.map((m: any) => m.income))) * 80}px`,
                              minHeight: '10px'
                            }}
                          ></div>
                          <small className="text-muted d-block mt-1">
                            {new Date(month.month).toLocaleDateString('es-MX', { month: 'short' })}
                          </small>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </Card.Body>
            </Card>
          </Col>

          <Col lg={4} className="mb-4">
            <Card className="shadow-sm border-0 h-100">
              <Card.Header className="bg-light border-0">
                <h5 className="mb-0">
                  <i className="fas fa-star me-2 text-warning"></i>
                  Servicios Principales
                </h5>
              </Card.Header>
              <Card.Body className="p-4">
                {incomeSummary.top_services && incomeSummary.top_services.length > 0 ? (
                  <div>
                    {incomeSummary.top_services.slice(0, 5).map((service: any, index: number) => (
                      <div key={index} className="d-flex justify-content-between align-items-center mb-3">
                        <div>
                          <div className="fw-semibold">{service.service}</div>
                          <small className="text-muted">{service.consultations} consultas</small>
                        </div>
                        <div className="text-end">
                          <div className="fw-bold text-primary">{formatCurrency(service.income)}</div>
                          <small className="text-muted">
                            {formatPercentage((service.income / incomeSummary.total_income) * 100)}
                          </small>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <i className="fas fa-chart-pie fa-2x text-muted mb-2"></i>
                    <p className="text-muted small">No hay datos de servicios disponibles</p>
                  </div>
                )}
              </Card.Body>
            </Card>
          </Col>
        </Row>
      )}

      {/* Patient Analytics Section */}
      {patientAnalytics && (
        <Row className="mb-4">
          <Col lg={6} className="mb-4">
            <Card className="shadow-sm border-0 h-100">
              <Card.Header className="bg-light border-0">
                <h5 className="mb-0">
                  <i className="fas fa-users me-2 text-primary"></i>
                  Análisis de Pacientes
                </h5>
              </Card.Header>
              <Card.Body className="p-4">
                <Row>
                  <Col sm={6} className="mb-3">
                    <div className="text-center">
                      <div className="fs-3 text-primary fw-bold">{patientAnalytics.total_patients}</div>
                      <small className="text-muted">Total Pacientes</small>
                    </div>
                  </Col>
                  <Col sm={6} className="mb-3">
                    <div className="text-center">
                      <div className="fs-3 text-success fw-bold">{patientAnalytics.new_patients_this_month}</div>
                      <small className="text-muted">Nuevos este Mes</small>
                    </div>
                  </Col>
                  <Col sm={6} className="mb-3">
                    <div className="text-center">
                      <div className="fs-3 text-info fw-bold">{patientAnalytics.active_patients}</div>
                      <small className="text-muted">Pacientes Activos</small>
                    </div>
                  </Col>
                  <Col sm={6} className="mb-3">
                    <div className="text-center">
                      <div className="fs-3 text-warning fw-bold">{patientAnalytics.average_age}</div>
                      <small className="text-muted">Edad Promedio</small>
                    </div>
                  </Col>
                </Row>

                {patientAnalytics.gender_distribution && (
                  <div className="mt-4">
                    <h6 className="mb-3">Distribución por Género</h6>
                    <div className="d-flex gap-2">
                      <div className="flex-fill text-center">
                        <div className="bg-primary bg-opacity-75 rounded p-2">
                          <div className="fw-bold text-white">{patientAnalytics.gender_distribution.male}</div>
                          <small className="text-white">Masculino</small>
                        </div>
                      </div>
                      <div className="flex-fill text-center">
                        <div className="bg-success bg-opacity-75 rounded p-2">
                          <div className="fw-bold text-white">{patientAnalytics.gender_distribution.female}</div>
                          <small className="text-white">Femenino</small>
                        </div>
                      </div>
                      <div className="flex-fill text-center">
                        <div className="bg-info bg-opacity-75 rounded p-2">
                          <div className="fw-bold text-white">{patientAnalytics.gender_distribution.other}</div>
                          <small className="text-white">Otro</small>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </Card.Body>
            </Card>
          </Col>

          <Col lg={6} className="mb-4">
            <Card className="shadow-sm border-0 h-100">
              <Card.Header className="bg-light border-0">
                <h5 className="mb-0">
                  <i className="fas fa-heartbeat me-2 text-danger"></i>
                  Condiciones Principales
                </h5>
              </Card.Header>
              <Card.Body className="p-4">
                {patientAnalytics.top_conditions && patientAnalytics.top_conditions.length > 0 ? (
                  <div>
                    {patientAnalytics.top_conditions.slice(0, 5).map((condition: any, index: number) => (
                      <div key={index} className="d-flex justify-content-between align-items-center mb-3">
                        <div className="flex-grow-1 me-3">
                          <div className="fw-semibold">{condition.condition}</div>
                          <div className="progress" style={{ height: '6px' }}>
                            <div 
                              className="progress-bar bg-primary" 
                              style={{ width: `${condition.percentage}%` }}
                            ></div>
                          </div>
                        </div>
                        <div className="text-end">
                          <div className="fw-bold">{condition.count}</div>
                          <small className="text-muted">{formatPercentage(condition.percentage)}</small>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <i className="fas fa-clipboard-list fa-2x text-muted mb-2"></i>
                    <p className="text-muted small">No hay datos de condiciones disponibles</p>
                  </div>
                )}
              </Card.Body>
            </Card>
          </Col>
        </Row>
      )}

      {/* Performance Metrics Section */}
      <Row className="mb-4">
        <Col lg={12}>
          <Card className="shadow-sm border-0">
            <Card.Header className="bg-light border-0">
              <h5 className="mb-0">
                <i className="fas fa-tachometer-alt me-2 text-primary"></i>
                Métricas de Rendimiento Detalladas
              </h5>
            </Card.Header>
            <Card.Body className="p-4">
              <Row>
                <Col md={3} className="mb-3">
                  <div className="text-center p-3 bg-light rounded">
                    <div className="fs-2 text-primary mb-2">
                      {stats?.performance_metrics?.completion_rate ? 
                        formatPercentage(stats.performance_metrics.completion_rate) : 'N/A'}
                    </div>
                    <div className="fw-semibold">Tasa de Completación</div>
                    <small className="text-muted">Citas completadas vs programadas</small>
                  </div>
                </Col>
                <Col md={3} className="mb-3">
                  <div className="text-center p-3 bg-light rounded">
                    <div className="fs-2 text-success mb-2">
                      {stats?.performance_metrics?.patient_retention_rate ? 
                        formatPercentage(stats.performance_metrics.patient_retention_rate) : 'N/A'}
                    </div>
                    <div className="fw-semibold">Retención de Pacientes</div>
                    <small className="text-muted">Pacientes que continúan tratamiento</small>
                  </div>
                </Col>
                <Col md={3} className="mb-3">
                  <div className="text-center p-3 bg-light rounded">
                    <div className="fs-2 text-warning mb-2">
                      {stats?.performance_metrics?.diet_plan_success_rate ? 
                        formatPercentage(stats.performance_metrics.diet_plan_success_rate) : 'N/A'}
                    </div>
                    <div className="fw-semibold">Éxito de Planes</div>
                    <small className="text-muted">Planes nutricionales exitosos</small>
                  </div>
                </Col>
                <Col md={3} className="mb-3">
                  <div className="text-center p-3 bg-light rounded">
                    <div className="fs-2 text-info mb-2">
                      {stats?.performance_metrics?.patient_satisfaction ? 
                        `${stats.performance_metrics.patient_satisfaction}/5` : 'N/A'}
                    </div>
                    <div className="fw-semibold">Satisfacción</div>
                    <small className="text-muted">Calificación promedio de pacientes</small>
                  </div>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <style>{`
        .dashboard-charts .card {
          transition: transform 0.2s ease-in-out;
        }
        
        .dashboard-charts .card:hover {
          transform: translateY(-2px);
        }
        
        .progress {
          background-color: rgba(0, 123, 255, 0.1);
        }
        
        .bg-light {
          background-color: #f8f9fa !important;
        }
        
        @media (max-width: 768px) {
          .dashboard-charts .fs-2 {
            font-size: 1.5rem !important;
          }
          
          .dashboard-charts .fs-3 {
            font-size: 1.25rem !important;
          }
        }
      `}</style>
    </div>
  );
};

export default DashboardCharts; 