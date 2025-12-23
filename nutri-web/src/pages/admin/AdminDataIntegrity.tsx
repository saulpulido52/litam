import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Button, Badge, Alert, ProgressBar} from 'react-bootstrap';
import { 
  Shield, 
  Database, 
  RefreshCw,
  AlertTriangle,
  FileText,
  CheckCircle
} from 'lucide-react';

interface DataCheck {
  id: string;
  name: string;
  status: 'passed' | 'failed' | 'warning';
  description: string;
  lastRun: string;
  issues: number;
  severity: 'low' | 'medium' | 'high';
}

interface DataReport {
  id: string;
  type: 'integrity' | 'consistency' | 'completeness';
  status: 'completed' | 'running' | 'failed';
  issuesFound: number;
  recordsChecked: number;
  completionDate: string;
}

const AdminDataIntegrity: React.FC = () => {
  const [dataChecks, setDataChecks] = useState<DataCheck[]>([]);
  const [reports, setReports] = useState<DataReport[]>([]);
  const [runningCheck, setRunningCheck] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Simulación de datos de integridad
  const fetchDataIntegrityData = async () => {
    setLoading(true);
    
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const mockDataChecks: DataCheck[] = [
      {
        id: '1',
        name: 'Verificación de Relaciones',
        status: 'passed',
        description: 'Verifica que todas las relaciones nutriólogo-paciente sean válidas',
        lastRun: '2024-01-15T10:30:00Z',
        issues: 0,
        severity: 'high'
      },
      {
        id: '2',
        name: 'Consistencia de Datos',
        status: 'warning',
        description: 'Verifica la consistencia entre diferentes tablas de datos',
        lastRun: '2024-01-15T09:15:00Z',
        issues: 3,
        severity: 'medium'
      },
      {
        id: '3',
        name: 'Validación de Emails',
        status: 'failed',
        description: 'Verifica que todos los emails sean válidos y únicos',
        lastRun: '2024-01-15T08:45:00Z',
        issues: 12,
        severity: 'high'
      },
      {
        id: '4',
        name: 'Verificación de Citas',
        status: 'passed',
        description: 'Verifica que las citas tengan datos completos y válidos',
        lastRun: '2024-01-15T07:30:00Z',
        issues: 0,
        severity: 'medium'
      },
      {
        id: '5',
        name: 'Integridad de Archivos',
        status: 'passed',
        description: 'Verifica que todos los archivos adjuntos existan y sean accesibles',
        lastRun: '2024-01-15T06:15:00Z',
        issues: 0,
        severity: 'low'
      }
    ];

    const mockReports: DataReport[] = [
      {
        id: '1',
        type: 'integrity',
        status: 'completed',
        issuesFound: 15,
        recordsChecked: 15420,
        completionDate: '2024-01-15T10:30:00Z'
      },
      {
        id: '2',
        type: 'consistency',
        status: 'completed',
        issuesFound: 3,
        recordsChecked: 8920,
        completionDate: '2024-01-14T15:45:00Z'
      },
      {
        id: '3',
        type: 'completeness',
        status: 'running',
        issuesFound: 0,
        recordsChecked: 4560,
        completionDate: '2024-01-15T11:00:00Z'
      }
    ];

    setDataChecks(mockDataChecks);
    setReports(mockReports);
    setLoading(false);
  };

  useEffect(() => {
    fetchDataIntegrityData();
  }, []);

  const runDataCheck = async (checkId: string) => {
    setRunningCheck(checkId);
    
    // Simular ejecución de verificación
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Actualizar estado
    setDataChecks(prev => prev.map(check => 
      check.id === checkId 
        ? { ...check, lastRun: new Date().toISOString(), issues: Math.floor(Math.random() * 5) }
        : check
    ));
    
    setRunningCheck(null);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'passed':
        return 'success';
      case 'warning':
        return 'warning';
      case 'failed':
        return 'danger';
      default:
        return 'secondary';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high':
        return 'danger';
      case 'medium':
        return 'warning';
      case 'low':
        return 'info';
      default:
        return 'secondary';
    }
  };

  const getReportStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'success';
      case 'running':
        return 'warning';
      case 'failed':
        return 'danger';
      default:
        return 'secondary';
    }
  };

  const getReportTypeText = (type: string) => {
    switch (type) {
      case 'integrity':
        return 'Integridad';
      case 'consistency':
        return 'Consistencia';
      case 'completeness':
        return 'Completitud';
      default:
        return 'Desconocido';
    }
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

  const totalIssues = dataChecks.reduce((sum, check) => sum + check.issues, 0);
  const passedChecks = dataChecks.filter(check => check.status === 'passed').length;
  const failedChecks = dataChecks.filter(check => check.status === 'failed').length;

  return (
    <div>
      <div className="mb-4">
        <h3 className="mb-1">Integridad de Datos</h3>
        <p className="text-muted mb-0">
          Verificación y corrección de la integridad de datos del sistema
        </p>
      </div>

      {/* Resumen de Estado */}
      <Row className="mb-4">
        <Col md={3}>
          <Card className="h-100">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="card-title mb-1">Verificaciones</h6>
                  <h4 className="mb-0">{dataChecks.length}</h4>
                </div>
                <Shield className="text-muted" style={{ width: '24px', height: '24px' }} />
              </div>
              <small className="text-muted">
                {passedChecks} exitosas, {failedChecks} fallidas
              </small>
            </Card.Body>
          </Card>
        </Col>

        <Col md={3}>
          <Card className="h-100">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="card-title mb-1">Problemas</h6>
                  <h4 className="mb-0">{totalIssues}</h4>
                </div>
                <AlertTriangle className="text-muted" style={{ width: '24px', height: '24px' }} />
              </div>
              <small className="text-muted">
                Requieren atención
              </small>
            </Card.Body>
          </Card>
        </Col>

        <Col md={3}>
          <Card className="h-100">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="card-title mb-1">Reportes</h6>
                  <h4 className="mb-0">{reports.length}</h4>
                </div>
                <FileText className="text-muted" style={{ width: '24px', height: '24px' }} />
              </div>
              <small className="text-muted">
                Generados este mes
              </small>
            </Card.Body>
          </Card>
        </Col>

        <Col md={3}>
          <Card className="h-100">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="card-title mb-1">Última Verificación</h6>
                  <h4 className="mb-0">Hace 2h</h4>
                </div>
                <CheckCircle className="text-muted" style={{ width: '24px', height: '24px' }} />
              </div>
              <small className="text-muted">
                Sistema actualizado
              </small>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Verificaciones de Datos */}
      <Card className="mb-4">
        <Card.Header>
          <h5 className="mb-0">Verificaciones de Integridad</h5>
        </Card.Header>
        <Card.Body>
          <div className="row">
            {dataChecks.map((check) => (
              <div key={check.id} className="col-12 mb-3">
                <div className="d-flex justify-content-between align-items-center p-3 border rounded">
                  <div className="flex-1">
                    <div className="d-flex align-items-center">
                      <div 
                        className={`rounded-circle me-3`} 
                        style={{ 
                          width: '12px', 
                          height: '12px',
                          backgroundColor: check.status === 'passed' ? '#28a745' : 
                                         check.status === 'warning' ? '#ffc107' : '#dc3545'
                        }}
                      />
                      <div>
                        <div className="fw-bold">{check.name}</div>
                        <small className="text-muted">{check.description}</small>
                      </div>
                    </div>
                  </div>
                  <div className="text-end">
                    <div className="d-flex align-items-center">
                      <Badge bg={getStatusColor(check.status)} className="me-2">
                        {check.status === 'passed' ? 'Exitoso' : 
                         check.status === 'warning' ? 'Advertencia' : 'Fallido'}
                      </Badge>
                      <Badge bg={getSeverityColor(check.severity)}>
                        {check.severity === 'high' ? 'Alto' : 
                         check.severity === 'medium' ? 'Medio' : 'Bajo'}
                      </Badge>
                    </div>
                    <div className="text-muted small mt-1">
                      {check.issues} problemas encontrados
                    </div>
                    <div className="text-muted small">
                      Última ejecución: {new Date(check.lastRun).toLocaleString()}
                    </div>
                    <Button 
                      size="sm" 
                      variant="outline-primary" 
                      className="mt-2"
                      disabled={runningCheck === check.id}
                      onClick={() => runDataCheck(check.id)}
                    >
                      {runningCheck === check.id ? (
                        <>
                          <RefreshCw className="me-1" style={{ width: '12px', height: '12px' }} />
                          Ejecutando...
                        </>
                      ) : (
                        <>
                          <RefreshCw className="me-1" style={{ width: '12px', height: '12px' }} />
                          Ejecutar
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card.Body>
      </Card>

      {/* Reportes de Integridad */}
      <Card className="mb-4">
        <Card.Header>
          <h5 className="mb-0">Reportes de Integridad</h5>
        </Card.Header>
        <Card.Body>
          <div className="row">
            {reports.map((report) => (
              <div key={report.id} className="col-12 mb-3">
                <div className="d-flex justify-content-between align-items-center p-3 border rounded">
                  <div className="flex-1">
                    <div className="d-flex align-items-center">
                      <div 
                        className={`rounded-circle me-3`} 
                        style={{ 
                          width: '12px', 
                          height: '12px',
                          backgroundColor: report.status === 'completed' ? '#28a745' : 
                                         report.status === 'running' ? '#ffc107' : '#dc3545'
                        }}
                      />
                      <div>
                        <div className="fw-bold">
                          Reporte de {getReportTypeText(report.type)}
                        </div>
                        <small className="text-muted">
                          {report.recordsChecked.toLocaleString()} registros verificados
                        </small>
                      </div>
                    </div>
                  </div>
                  <div className="text-end">
                    <Badge bg={getReportStatusColor(report.status)} className="me-2">
                      {report.status === 'completed' ? 'Completado' : 
                       report.status === 'running' ? 'Ejecutando' : 'Fallido'}
                    </Badge>
                    <div className="text-muted small mt-1">
                      {report.issuesFound} problemas encontrados
                    </div>
                    {report.status === 'completed' && (
                      <div className="text-muted small">
                        {new Date(report.completionDate).toLocaleString()}
                      </div>
                    )}
                    {report.status === 'running' && (
                      <div className="mt-2">
                        <ProgressBar 
                          now={75} 
                          className="mb-1"
                          style={{ height: '6px' }}
                        />
                        <small className="text-muted">75% completado</small>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card.Body>
      </Card>

      {/* Alertas de Integridad */}
      <Card className="mb-4">
        <Card.Header>
          <h5 className="mb-0">Alertas de Integridad</h5>
        </Card.Header>
        <Card.Body>
          <div>
            {dataChecks.some(check => check.status === 'failed') && (
              <Alert variant="danger">
                <AlertTriangle className="me-2" style={{ width: '16px', height: '16px' }} />
                Hay verificaciones fallidas que requieren atención inmediata.
              </Alert>
            )}

            {dataChecks.some(check => check.status === 'warning') && (
              <Alert variant="warning">
                <AlertTriangle className="me-2" style={{ width: '16px', height: '16px' }} />
                Hay verificaciones con advertencias que deberían revisarse.
              </Alert>
            )}

            {dataChecks.every(check => check.status === 'passed') && (
              <Alert variant="success">
                <CheckCircle className="me-2" style={{ width: '16px', height: '16px' }} />
                Todas las verificaciones de integridad han pasado exitosamente.
              </Alert>
            )}

            {totalIssues > 0 && (
              <Alert variant="info">
                <Database className="me-2" style={{ width: '16px', height: '16px' }} />
                Se encontraron {totalIssues} problemas de integridad que requieren corrección.
              </Alert>
            )}
          </div>
        </Card.Body>
      </Card>

      {/* Acciones de Corrección */}
      <Card>
        <Card.Header>
          <h5 className="mb-0">Acciones de Corrección</h5>
        </Card.Header>
        <Card.Body>
          <Row>
            <Col md={4}>
              <Button variant="outline-primary" className="w-100">
                <Database className="me-2" style={{ width: '16px', height: '16px' }} />
                Ejecutar Todas las Verificaciones
              </Button>
            </Col>
            <Col md={4}>
              <Button variant="outline-warning" className="w-100">
                <AlertTriangle className="me-2" style={{ width: '16px', height: '16px' }} />
                Corregir Problemas Automáticamente
              </Button>
            </Col>
            <Col md={4}>
              <Button variant="outline-info" className="w-100">
                <FileText className="me-2" style={{ width: '16px', height: '16px' }} />
                Generar Reporte Completo
              </Button>
            </Col>
          </Row>
        </Card.Body>
      </Card>
    </div>
  );
};

export default AdminDataIntegrity; 