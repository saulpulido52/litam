import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Button, Table, Modal, Container, Badge, Alert, Form } from 'react-bootstrap';
import { 
  Crown,
  Edit,
  Plus,
  Trash,
  Users,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';
import { getNutritionistTiers, getPatientTiers, getNutritionistTierStats, getPatientTierStats, assignNutritionistTier, assignPatientTier } from '../../services/monetizationService';
import { getAllNutritionists, getAllPatients } from '../../services/adminService';

interface NutritionistTier {
  id: string;
  name: string;
  description: string;
  tier_type: 'basic' | 'premium';
  payment_model: 'commission' | 'subscription';
  commission_rate?: number;
  subscription_price?: number;
  annual_price?: number;
  max_active_patients: number;
  includes_ai_meal_planning: boolean;
  includes_advanced_management: boolean;
  includes_priority_support: boolean;
  is_active: boolean;
}

interface PatientTier {
  id: string;
  name: string;
  description: string;
  tier_type: 'free' | 'pro' | 'premium';
  payment_model: 'free' | 'one_time' | 'subscription';
  one_time_price?: number;
  monthly_price?: number;
  annual_price?: number;
  shows_ads: boolean;
  includes_ai_food_scanning: boolean;
  includes_barcode_scanning: boolean;
  includes_smart_shopping_list: boolean;
  includes_advanced_tracking: boolean;
  includes_device_integration: boolean;
  is_active: boolean;
}

interface MonetizationStats {
  nutritionists: {
    total: number;
    basic: number;
    premium: number;
    total_commission_revenue: number;
    total_subscription_revenue: number;
  };
  patients: {
    total: number;
    free: number;
    pro: number;
    premium: number;
    total_revenue: number;
  };
}

const AdminMonetization: React.FC = () => {
  const [nutritionistTiers, setNutritionistTiers] = useState<NutritionistTier[]>([]);
  const [patientTiers, setPatientTiers] = useState<PatientTier[]>([]);
  const [stats, setStats] = useState<MonetizationStats | null>(null);
  const [loading, setLoading] = useState(true);
  // const [showNutritionistModal, setShowNutritionistModal] = useState(false);
  // const [showPatientModal, setShowPatientModal] = useState(false);
  // const [editingTier, setEditingTier] = useState<NutritionistTier | PatientTier | null>(null);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [assignType, setAssignType] = useState<'nutritionist' | 'patient' | null>(null);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [selectedTierId, setSelectedTierId] = useState<string | null>(null);
  const [assignLoading, setAssignLoading] = useState(false);
  const [assignSuccess, setAssignSuccess] = useState<string | null>(null);
  const [assignError, setAssignError] = useState<string | null>(null);
  const [nutritionists, setNutritionists] = useState<any[]>([]);
  const [patients, setPatients] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [ntiers, ptiers, nstats, pstats, nlist, plist] = await Promise.all([
          getNutritionistTiers(),
          getPatientTiers(),
          getNutritionistTierStats(),
          getPatientTierStats(),
          getAllNutritionists(),
          getAllPatients()
        ]);
        setNutritionistTiers(ntiers);
        setPatientTiers(ptiers);
        setStats({ nutritionists: nstats, patients: pstats });
        setNutritionists(nlist);
        setPatients(plist.users || []);
      } catch (e) {}
      setLoading(false);
    };
    fetchData();
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(amount);
  };

  const getTierTypeBadge = (type: string) => {
    const variants: { [key: string]: string } = {
      basic: 'secondary',
      premium: 'warning',
      free: 'success',
      pro: 'info'
    };
    return <Badge bg={variants[type] || 'secondary'}>{type.toUpperCase()}</Badge>;
  };

  const getPaymentModelText = (model: string) => {
    const models: { [key: string]: string } = {
      commission: 'Comisión',
      subscription: 'Suscripción',
      free: 'Gratuito',
      one_time: 'Pago Único'
    };
    return models[model] || model;
  };

  // Handler para abrir el modal de asignación
  const handleOpenAssignModal = (type: 'nutritionist' | 'patient', userId: string) => {
    setAssignType(type);
    setSelectedUserId(userId);
    setSelectedTierId(null);
    setShowAssignModal(true);
    setAssignSuccess(null);
    setAssignError(null);
  };

  // Handler para asignar el tier
  const handleAssignTier = async () => {
    if (!selectedUserId || !selectedTierId || !assignType) return;
    setAssignLoading(true);
    setAssignSuccess(null);
    setAssignError(null);
    try {
      if (assignType === 'nutritionist') {
        await assignNutritionistTier(selectedUserId, selectedTierId);
      } else {
        await assignPatientTier(selectedUserId, selectedTierId);
      }
      setAssignSuccess('Tier asignado correctamente.');
      setShowAssignModal(false);
      // Refrescar datos
      window.location.reload();
    } catch (e: any) {
      setAssignError('Error al asignar tier.');
    }
    setAssignLoading(false);
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
    <Container fluid>
      <Row className="mb-4">
        <Col>
          <h2>💰 Sistema de Monetización</h2>
          <p className="text-muted">Gestión de niveles y funcionalidades por suscripción</p>
        </Col>
      </Row>

      {/* Banner de desarrollo */}
      <Row className="mb-4">
        <Col>
          <Alert variant="warning" className="d-flex align-items-center">
            <div className="me-3">🔧</div>
            <div>
              <strong>Modo Desarrollo:</strong> El sistema de monetización está temporalmente desactivado para permitir el desarrollo completo de funcionalidades. 
              Todas las validaciones de acceso están habilitadas por defecto.
            </div>
          </Alert>
        </Col>
      </Row>

      {/* Estadísticas Generales */}
      {stats && (
        <Row className="mb-4">
          <Col md={6}>
            <Card className="h-100">
              <Card.Header>
                <h6 className="mb-0">
                  <Crown className="me-2" style={{ width: '16px', height: '16px' }} />
                  Nutriólogos
                </h6>
              </Card.Header>
              <Card.Body>
                <Row>
                  <Col md={6}>
                    <div className="text-center">
                      <h4 className="mb-1">{stats.nutritionists.total}</h4>
                      <small className="text-muted">Total</small>
                    </div>
                  </Col>
                  <Col md={6}>
                    <div className="text-center">
                      <h4 className="mb-1">{stats.nutritionists.premium}</h4>
                      <small className="text-muted">Premium</small>
                    </div>
                  </Col>
                </Row>
                <hr />
                <div className="d-flex justify-content-between">
                  <small className="text-muted">Comisiones: {formatCurrency(stats.nutritionists.total_commission_revenue)}</small>
                  <small className="text-muted">Suscripciones: {formatCurrency(stats.nutritionists.total_subscription_revenue)}</small>
                </div>
              </Card.Body>
            </Card>
          </Col>

          <Col md={6}>
            <Card className="h-100">
              <Card.Header>
                <h6 className="mb-0">
                  <Users className="me-2" style={{ width: '16px', height: '16px' }} />
                  Pacientes
                </h6>
              </Card.Header>
              <Card.Body>
                <Row>
                  <Col md={4}>
                    <div className="text-center">
                      <h4 className="mb-1">{stats.patients.free}</h4>
                      <small className="text-muted">Gratuitos</small>
                    </div>
                  </Col>
                  <Col md={4}>
                    <div className="text-center">
                      <h4 className="mb-1">{stats.patients.pro}</h4>
                      <small className="text-muted">Pro</small>
                    </div>
                  </Col>
                  <Col md={4}>
                    <div className="text-center">
                      <h4 className="mb-1">{stats.patients.premium}</h4>
                      <small className="text-muted">Premium</small>
                    </div>
                  </Col>
                </Row>
                <hr />
                <div className="text-center">
                  <small className="text-muted">Ingresos: {formatCurrency(stats.patients.total_revenue)}</small>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      )}

      {/* Listado simple de nutriólogos */}
      <Card className="mb-4">
        <Card.Header>
          <h5 className="mb-0">Nutriólogos</h5>
        </Card.Header>
        <Card.Body>
          <Table responsive>
            <thead>
              <tr><th>Nombre</th><th>Email</th><th>Acción</th></tr>
            </thead>
            <tbody>
              {nutritionists.map(n => (
                <tr key={n.id}>
                  <td>{n.first_name} {n.last_name}</td>
                  <td>{n.email}</td>
                  <td><Button size="sm" onClick={() => handleOpenAssignModal('nutritionist', n.id)}>Asignar Tier</Button></td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Card.Body>
      </Card>

      {/* Listado simple de pacientes */}
      <Card className="mb-4">
        <Card.Header>
          <h5 className="mb-0">Pacientes</h5>
        </Card.Header>
        <Card.Body>
          <Table responsive>
            <thead>
              <tr><th>Nombre</th><th>Email</th><th>Acción</th></tr>
            </thead>
            <tbody>
              {patients.map(p => (
                <tr key={p.id}>
                  <td>{p.first_name} {p.last_name}</td>
                  <td>{p.email}</td>
                  <td><Button size="sm" onClick={() => handleOpenAssignModal('patient', p.id)}>Asignar Tier</Button></td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Card.Body>
      </Card>

      {/* Tiers de Nutriólogos */}
      <Card className="mb-4">
        <Card.Header className="d-flex justify-content-between align-items-center">
          <h5 className="mb-0">
            <Crown className="me-2" style={{ width: '16px', height: '16px' }} />
            Niveles de Nutriólogos
          </h5>
          <Button size="sm" variant="outline-primary">
            <Plus className="me-1" style={{ width: '14px', height: '14px' }} />
            Nuevo Tier
          </Button>
        </Card.Header>
        <Card.Body>
          <div className="row">
            {nutritionistTiers.map((tier) => (
              <div key={tier.id} className="col-12 mb-3">
                <div className="d-flex justify-content-between align-items-center p-3 border rounded">
                  <div className="flex-1">
                    <div className="d-flex align-items-center mb-2">
                      <h6 className="mb-0 me-2">{tier.name}</h6>
                      {getTierTypeBadge(tier.tier_type)}
                    </div>
                    <p className="text-muted small mb-2">{tier.description}</p>
                    <div className="d-flex flex-wrap gap-2">
                      <small className="text-muted">
                        Modelo: {getPaymentModelText(tier.payment_model)}
                      </small>
                      {tier.commission_rate && (
                        <small className="text-muted">
                          Comisión: {tier.commission_rate}%
                        </small>
                      )}
                      {tier.subscription_price && (
                        <small className="text-muted">
                          Mensual: {formatCurrency(tier.subscription_price)}
                        </small>
                      )}
                      <small className="text-muted">
                        Pacientes: {tier.max_active_patients === -1 ? 'Ilimitados' : tier.max_active_patients}
                      </small>
                    </div>
                  </div>
                  <div className="text-end">
                    <div className="mb-2">
                      {tier.includes_ai_meal_planning && <Badge bg="success" className="me-1">IA</Badge>}
                      {tier.includes_advanced_management && <Badge bg="info" className="me-1">Gestión</Badge>}
                      {tier.includes_priority_support && <Badge bg="warning" className="me-1">Soporte</Badge>}
                    </div>
                    <div>
                      <Button size="sm" variant="outline-secondary" className="me-1">
                        <Edit style={{ width: '12px', height: '12px' }} />
                      </Button>
                      <Button size="sm" variant="outline-danger">
                        <Trash style={{ width: '12px', height: '12px' }} />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card.Body>
      </Card>

      {/* Tiers de Pacientes */}
      <Card className="mb-4">
        <Card.Header className="d-flex justify-content-between align-items-center">
          <h5 className="mb-0">
            <Users className="me-2" style={{ width: '16px', height: '16px' }} />
            Niveles de Pacientes
          </h5>
          <Button size="sm" variant="outline-primary">
            <Plus className="me-1" style={{ width: '14px', height: '14px' }} />
            Nuevo Tier
          </Button>
        </Card.Header>
        <Card.Body>
          <div className="row">
            {patientTiers.map((tier) => (
              <div key={tier.id} className="col-12 mb-3">
                <div className="d-flex justify-content-between align-items-center p-3 border rounded">
                  <div className="flex-1">
                    <div className="d-flex align-items-center mb-2">
                      <h6 className="mb-0 me-2">{tier.name}</h6>
                      {getTierTypeBadge(tier.tier_type)}
                    </div>
                    <p className="text-muted small mb-2">{tier.description}</p>
                    <div className="d-flex flex-wrap gap-2">
                      <small className="text-muted">
                        Modelo: {getPaymentModelText(tier.payment_model)}
                      </small>
                      {tier.one_time_price && (
                        <small className="text-muted">
                          Pago único: {formatCurrency(tier.one_time_price)}
                        </small>
                      )}
                      {tier.monthly_price && (
                        <small className="text-muted">
                          Mensual: {formatCurrency(tier.monthly_price)}
                        </small>
                      )}
                      <small className="text-muted">
                        Anuncios: {tier.shows_ads ? 'Sí' : 'No'}
                      </small>
                    </div>
                  </div>
                  <div className="text-end">
                    <div className="mb-2">
                      {tier.includes_ai_food_scanning && <Badge bg="success" className="me-1">IA</Badge>}
                      {tier.includes_barcode_scanning && <Badge bg="info" className="me-1">Códigos</Badge>}
                      {tier.includes_smart_shopping_list && <Badge bg="warning" className="me-1">Lista</Badge>}
                      {tier.includes_advanced_tracking && <Badge bg="primary" className="me-1">Seguimiento</Badge>}
                    </div>
                    <div>
                      <Button size="sm" variant="outline-secondary" className="me-1">
                        <Edit style={{ width: '12px', height: '12px' }} />
                      </Button>
                      <Button size="sm" variant="outline-danger">
                        <Trash style={{ width: '12px', height: '12px' }} />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card.Body>
      </Card>

      {/* Alertas y Recomendaciones */}
      <Card>
        <Card.Header>
          <h5 className="mb-0">
            <AlertTriangle className="me-2" style={{ width: '16px', height: '16px' }} />
            Alertas y Recomendaciones
          </h5>
        </Card.Header>
        <Card.Body>
          <Alert variant="info">
            <CheckCircle className="me-2" style={{ width: '16px', height: '16px' }} />
            <strong>Modelo de Monetización Implementado:</strong> El sistema ahora soporta diferentes niveles de servicio para nutriólogos y pacientes con funcionalidades específicas por tier.
          </Alert>

          <Alert variant="warning">
            <AlertTriangle className="me-2" style={{ width: '16px', height: '16px' }} />
            <strong>Próximos Pasos:</strong> Implementar la integración con pasarelas de pago y el sistema de comisiones automáticas para nutriólogos básicos.
          </Alert>

          <Alert variant="success">
            <CheckCircle className="me-2" style={{ width: '16px', height: '16px' }} />
            <strong>Funcionalidades Disponibles:</strong> Validación de acceso a funcionalidades según el tier del usuario, gestión de anuncios y herramientas de IA.
          </Alert>
        </Card.Body>
      </Card>

      {/* Modal de asignación */}
      <Modal show={showAssignModal} onHide={() => setShowAssignModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Asignar Tier</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group>
            <Form.Label>Selecciona el nuevo tier</Form.Label>
            <Form.Select value={selectedTierId || ''} onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setSelectedTierId(e.target.value)}>
              <option value="">Selecciona...</option>
              {(assignType === 'nutritionist' ? nutritionistTiers : patientTiers).map(tier => (
                <option key={tier.id} value={tier.id}>{tier.name}</option>
              ))}
            </Form.Select>
          </Form.Group>
          {assignError && <Alert variant="danger" className="mt-2">{assignError}</Alert>}
          {assignSuccess && <Alert variant="success" className="mt-2">{assignSuccess}</Alert>}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowAssignModal(false)}>Cancelar</Button>
          <Button variant="primary" onClick={handleAssignTier} disabled={assignLoading || !selectedTierId}>
            {assignLoading ? 'Asignando...' : 'Asignar'}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default AdminMonetization; 