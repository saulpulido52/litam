import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Button, Spinner, Alert, Badge, ListGroup} from 'react-bootstrap';
import { useAdmin } from '../../hooks/useAdmin';

// React Icons
import { 
  MdBuild,
  MdError,
  MdAutoFixHigh,
  MdReport,
  MdBugReport,
  MdVisibility,
  MdWarning,
  MdInfo,
  MdRefresh
} from 'react-icons/md';
import { 
  FaDatabase,
  FaExclamationTriangle,
  FaInfoCircle,
  FaCheckCircle
} from 'react-icons/fa';

const AdminDataIntegrityTab: React.FC = () => {
  const {
    dataIntegrity,
    loading,
    error,
    loadDataIntegrity,
    repairDataIntegrity,
    clearError
  } = useAdmin();

  const [repairLoading, setRepairLoading] = useState(false);
  const [repairMode, setRepairMode] = useState<'dry-run' | 'repair'>('dry-run');
  const [lastRepairResult, setLastRepairResult] = useState<any>(null);

  // Cargar integridad de datos al montar el componente
  useEffect(() => {
    loadDataIntegrity();
  }, [loadDataIntegrity]);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'danger';
      case 'high':
        return 'warning';
      case 'medium':
        return 'info';
      case 'low':
        return 'secondary';
      default:
        return 'info';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical':
        return <FaExclamationTriangle className="text-danger" />;
      case 'high':
        return <FaExclamationTriangle className="text-warning" />;
      case 'medium':
        return <FaInfoCircle className="text-info" />;
      case 'low':
        return <FaInfoCircle className="text-secondary" />;
      default:
        return <FaInfoCircle className="text-info" />;
    }
  };

  const handleRepair = async () => {
    setRepairLoading(true);
    try {
      const result = await repairDataIntegrity(repairMode === 'dry-run');
      setLastRepairResult(result);
    } catch (error) {
      console.error('Error al reparar integridad:', error);
    } finally {
      setRepairLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" variant="primary" />
        <p className="mt-3">Analizando integridad de datos...</p>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="danger" dismissible onClose={clearError}>
        <MdError className="me-2" />
        <strong>Error:</strong> {error}
      </Alert>
    );
  }

  if (!dataIntegrity) {
    return (
      <Alert variant="warning">
        <MdWarning className="me-2" />
        No se pudo obtener información de integridad de datos.
      </Alert>
    );
  }

  const hasIssues = dataIntegrity.summary.total_issues > 0;
  const hasCriticalIssues = dataIntegrity.summary.critical_issues > 0;
  const hasHighIssues = dataIntegrity.summary.high_issues > 0;

  return (
    <div>
      {/* Header */}
      <Row className="mb-4">
        <Col>
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h5 className="mb-0">
                <MdBuild className="me-2 text-primary" />
                Integridad de Datos
              </h5>
              <p className="text-muted mb-0">
                Diagnóstico y reparación de problemas de integridad
              </p>
            </div>
            <div className="d-flex gap-2">
              <Button 
                variant="outline-primary" 
                size="sm"
                onClick={loadDataIntegrity}
                disabled={loading}
              >
                <MdRefresh className="me-1" />
                {loading ? 'Analizando...' : 'Analizar'}
              </Button>
              <Button 
                variant="outline-warning" 
                size="sm"
                onClick={handleRepair}
                disabled={repairLoading || !hasIssues}
              >
                <MdAutoFixHigh className="me-1" />
                {repairLoading ? 'Reparando...' : 'Reparar'}
              </Button>
            </div>
          </div>
        </Col>
      </Row>

      {/* Resumen de Problemas */}
      <Row className="mb-4">
        <Col>
          <Card className="border-0 shadow-sm">
            <Card.Header className={hasCriticalIssues ? 'bg-danger text-white' : hasHighIssues ? 'bg-warning text-dark' : 'bg-success text-white'}>
              <h6 className="mb-0">
                <MdReport className="me-2" />
                Resumen de Problemas de Integridad
              </h6>
            </Card.Header>
            <Card.Body>
              <Row>
                <Col md={3} className="mb-3">
                  <div className="text-center">
                    <div className="h3 mb-0 text-danger">{dataIntegrity.summary.total_issues}</div>
                    <small className="text-muted">Total de Problemas</small>
                  </div>
                </Col>
                <Col md={3} className="mb-3">
                  <div className="text-center">
                    <div className="h3 mb-0 text-danger">{dataIntegrity.summary.critical_issues}</div>
                    <small className="text-muted">Críticos</small>
                  </div>
                </Col>
                <Col md={3} className="mb-3">
                  <div className="text-center">
                    <div className="h3 mb-0 text-warning">{dataIntegrity.summary.high_issues}</div>
                    <small className="text-muted">Altos</small>
                  </div>
                </Col>
                <Col md={3} className="mb-3">
                  <div className="text-center">
                    <div className="h3 mb-0 text-info">{dataIntegrity.summary.medium_issues + dataIntegrity.summary.low_issues}</div>
                    <small className="text-muted">Medios/Bajos</small>
                  </div>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Configuración de Reparación */}
      <Row className="mb-4">
        <Col>
          <Card className="border-0 shadow-sm">
            <Card.Header>
              <h6 className="mb-0">
                <FaDatabase className="me-2 text-warning" />
                Configuración de Reparación
              </h6>
            </Card.Header>
            <Card.Body>
              <Row>
                <Col md={6}>
                  <div className="mb-3">
                    <label className="form-label">Modo de Reparación</label>
                    <div className="d-flex gap-2">
                      <Button
                        variant={repairMode === 'dry-run' ? 'primary' : 'outline-primary'}
                        size="sm"
                        onClick={() => setRepairMode('dry-run')}
                      >
                        <MdVisibility className="me-1" />
                        Simulación
                      </Button>
                      <Button
                        variant={repairMode === 'repair' ? 'danger' : 'outline-danger'}
                        size="sm"
                        onClick={() => setRepairMode('repair')}
                      >
                        <MdAutoFixHigh className="me-1" />
                        Reparación Real
                      </Button>
                    </div>
                    <small className="text-muted">
                      {repairMode === 'dry-run' 
                        ? 'Simula las reparaciones sin aplicar cambios' 
                        : 'Aplica las reparaciones reales al sistema'
                      }
                    </small>
                  </div>
                </Col>
                <Col md={6}>
                  <div className="mb-3">
                    <label className="form-label">Estado</label>
                    <div className="d-flex align-items-center">
                      {hasIssues ? (
                        <Badge bg={hasCriticalIssues ? 'danger' : 'warning'}>
                          {hasCriticalIssues ? 'Crítico' : 'Atención Requerida'}
                        </Badge>
                      ) : (
                        <Badge bg="success">
                          <FaCheckCircle className="me-1" />
                          Sin Problemas
                        </Badge>
                      )}
                    </div>
                  </div>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Lista de Problemas */}
      <Row className="mb-4">
        <Col>
          <Card className="border-0 shadow-sm">
            <Card.Header>
              <h6 className="mb-0">
                <MdBugReport className="me-2 text-info" />
                Problemas Detectados
              </h6>
            </Card.Header>
            <Card.Body className="p-0">
              {dataIntegrity.issues.length === 0 ? (
                <div className="text-center py-5">
                  <FaCheckCircle size={48} className="text-success mb-3" />
                  <h6 className="text-success">¡Excelente!</h6>
                  <p className="text-muted mb-0">No se detectaron problemas de integridad</p>
                </div>
              ) : (
                <ListGroup variant="flush">
                  {dataIntegrity.issues.map((issue, index) => (
                    <ListGroup.Item key={index} className="border-0">
                      <div className="d-flex justify-content-between align-items-start">
                        <div className="flex-grow-1">
                          <div className="d-flex align-items-center mb-2">
                            {getSeverityIcon(issue.severity)}
                            <Badge bg={getSeverityColor(issue.severity)} className="ms-2">
                              {issue.severity.toUpperCase()}
                            </Badge>
                            <span className="ms-2 fw-bold">{issue.type}</span>
                          </div>
                          <p className="mb-2">{issue.description}</p>
                          <div className="d-flex align-items-center mb-2">
                            <small className="text-muted me-3">
                              <FaDatabase className="me-1" />
                              {issue.affected_records} registros afectados
                            </small>
                          </div>
                          <div className="bg-light p-2 rounded">
                            <small className="text-muted">
                              <strong>Sugerencia:</strong> {issue.suggested_fix}
                            </small>
                          </div>
                        </div>
                      </div>
                    </ListGroup.Item>
                  ))}
                </ListGroup>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Resultado de Reparación */}
      {lastRepairResult && (
        <Row className="mb-4">
          <Col>
            <Card className="border-0 shadow-sm">
              <Card.Header className="bg-info text-white">
                <h6 className="mb-0">
                  <MdAutoFixHigh className="me-2" />
                  Resultado de Reparación
                </h6>
              </Card.Header>
              <Card.Body>
                <div className="mb-3">
                  <strong>Modo:</strong> {repairMode === 'dry-run' ? 'Simulación' : 'Reparación Real'}
                </div>
                <div className="mb-3">
                  <strong>Problemas procesados:</strong> {lastRepairResult.processedIssues || 0}
                </div>
                <div className="mb-3">
                  <strong>Reparaciones aplicadas:</strong> {lastRepairResult.appliedFixes || 0}
                </div>
                {lastRepairResult.message && (
                  <Alert variant="info">
                    <MdInfo className="me-2" />
                    {lastRepairResult.message}
                  </Alert>
                )}
              </Card.Body>
            </Card>
          </Col>
        </Row>
      )}

      {/* Alertas */}
      {hasCriticalIssues && (
        <Row className="mb-4">
          <Col>
            <Alert variant="danger">
              <FaExclamationTriangle className="me-2" />
              <strong>¡Atención!</strong> Se detectaron problemas críticos de integridad que requieren atención inmediata.
            </Alert>
          </Col>
        </Row>
      )}

      {hasHighIssues && !hasCriticalIssues && (
        <Row className="mb-4">
          <Col>
            <Alert variant="warning">
              <FaExclamationTriangle className="me-2" />
              <strong>Atención:</strong> Se detectaron problemas de alta prioridad que deberían ser revisados.
            </Alert>
          </Col>
        </Row>
      )}

      {!hasIssues && (
        <Row className="mb-4">
          <Col>
            <Alert variant="success">
              <FaCheckCircle className="me-2" />
              <strong>¡Excelente!</strong> No se detectaron problemas de integridad en el sistema.
            </Alert>
          </Col>
        </Row>
      )}
    </div>
  );
};

export default AdminDataIntegrityTab; 