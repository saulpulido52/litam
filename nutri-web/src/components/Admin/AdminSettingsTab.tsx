import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Button, Form, Alert, Spinner, Badge } from 'react-bootstrap';
import { useAdmin } from '../../hooks/useAdmin';
import type { AdminUpdateSettingsDto } from '../../services/adminService';

// React Icons
import { 
  MdSettings,
  MdSave,
  MdRefresh,
  MdCheckCircle,
  MdError,
  MdWarning,
  MdInfo,
  MdSecurity,
  MdNotifications,
  MdEmail,
  MdSms,
  MdPushPin,
  MdTune,
  MdBuild,
  MdStorage,
  MdMemory,
  MdSpeed,
  MdDataUsage,
  MdAnalytics,
  MdAccessTime,
  MdClose
} from 'react-icons/md';
import { 
  FaCogs,
  FaShieldAlt,
  FaBell,
  FaEnvelope,
  FaSms,
  FaDatabase,
  FaServer,
  FaMicrochip,
  FaMemory,
  FaHdd,
  FaNetworkWired,
  FaExclamationTriangle,
  FaExclamationCircle,
  FaInfoCircle,
  FaCheckCircle,
  FaClock,
  FaTachometerAlt,
  FaThermometerHalf
} from 'react-icons/fa';

const AdminSettingsTab: React.FC = () => {
  const {
    loading,
    error,
    updateSettings,
    clearError
  } = useAdmin();

  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState<AdminUpdateSettingsDto>({
    aiSettings: {
      model: 'gpt-4',
      temperature: 0.7,
      maxTokens: 2000
    },
    systemSettings: {
      maxFileSize: 10,
      allowedFileTypes: ['jpg', 'jpeg', 'png', 'pdf', 'doc', 'docx'],
      sessionTimeout: 3600
    },
    notificationSettings: {
      emailNotifications: true,
      pushNotifications: true,
      smsNotifications: false
    }
  });

  const [activeSection, setActiveSection] = useState<'ai' | 'system' | 'notifications'>('ai');

  const handleSaveSettings = async () => {
    setSaving(true);
    try {
      await updateSettings(settings);
      // Mostrar mensaje de éxito
    } catch (error) {
      console.error('Error al guardar configuraciones:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleSettingChange = (section: keyof AdminUpdateSettingsDto, field: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  if (loading) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" variant="primary" />
        <p className="mt-3">Cargando configuraciones...</p>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <Row className="mb-4">
        <Col>
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h5 className="mb-0">
                <MdSettings className="me-2 text-primary" />
                Configuraciones del Sistema
              </h5>
              <p className="text-muted mb-0">
                Administra las configuraciones globales del sistema
              </p>
            </div>
            <Button 
              variant="primary" 
              size="sm"
              onClick={handleSaveSettings}
              disabled={saving}
            >
              <MdSave className="me-1" />
              {saving ? 'Guardando...' : 'Guardar Cambios'}
            </Button>
          </div>
        </Col>
      </Row>

      {/* Alertas de Error */}
      {error && (
        <Row className="mb-4">
          <Col>
            <Alert variant="danger" dismissible onClose={clearError}>
              <MdError className="me-2" />
              <strong>Error:</strong> {error}
            </Alert>
          </Col>
        </Row>
      )}

      {/* Navegación de Secciones */}
      <Row className="mb-4">
        <Col>
          <Card className="border-0 shadow-sm">
            <Card.Body className="p-0">
              <div className="d-flex">
                <Button
                  variant={activeSection === 'ai' ? 'primary' : 'outline-primary'}
                  className="flex-fill rounded-0 border-0"
                  onClick={() => setActiveSection('ai')}
                >
                  <MdTune className="me-2" />
                  IA y Generación
                </Button>
                <Button
                  variant={activeSection === 'system' ? 'primary' : 'outline-primary'}
                  className="flex-fill rounded-0 border-0"
                  onClick={() => setActiveSection('system')}
                >
                  <MdBuild className="me-2" />
                  Sistema
                </Button>
                <Button
                  variant={activeSection === 'notifications' ? 'primary' : 'outline-primary'}
                  className="flex-fill rounded-0 border-0"
                  onClick={() => setActiveSection('notifications')}
                >
                  <MdNotifications className="me-2" />
                  Notificaciones
                </Button>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Configuraciones de IA */}
      {activeSection === 'ai' && (
        <Row>
          <Col>
            <Card className="border-0 shadow-sm">
              <Card.Header>
                <h6 className="mb-0">
                  <MdTune className="me-2 text-primary" />
                  Configuraciones de Inteligencia Artificial
                </h6>
              </Card.Header>
              <Card.Body>
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>
                        <MdSpeed className="me-2" />
                        Modelo de IA
                      </Form.Label>
                      <Form.Select
                        value={settings.aiSettings?.model || 'gpt-4'}
                        onChange={(e) => handleSettingChange('aiSettings', 'model', e.target.value)}
                      >
                        <option value="gpt-4">GPT-4 (Más avanzado)</option>
                        <option value="gpt-3.5-turbo">GPT-3.5 Turbo (Más rápido)</option>
                        <option value="claude-3">Claude-3 (Análisis detallado)</option>
                      </Form.Select>
                      <Form.Text className="text-muted">
                        Modelo de IA utilizado para generar planes nutricionales
                      </Form.Text>
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>
                        <MdThermometerHalf className="me-2" />
                        Temperatura (Creatividad)
                      </Form.Label>
                      <Form.Range
                        min="0"
                        max="1"
                        step="0.1"
                        value={settings.aiSettings?.temperature || 0.7}
                        onChange={(e) => handleSettingChange('aiSettings', 'temperature', parseFloat(e.target.value))}
                      />
                      <div className="d-flex justify-content-between">
                        <small className="text-muted">Más preciso</small>
                        <small className="text-muted">Más creativo</small>
                      </div>
                      <Form.Text className="text-muted">
                        Controla la creatividad de las respuestas de la IA
                      </Form.Text>
                    </Form.Group>
                  </Col>
                </Row>
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>
                        <MdDataUsage className="me-2" />
                        Tokens Máximos
                      </Form.Label>
                      <Form.Control
                        type="number"
                        min="500"
                        max="4000"
                        value={settings.aiSettings?.maxTokens || 2000}
                        onChange={(e) => handleSettingChange('aiSettings', 'maxTokens', parseInt(e.target.value))}
                      />
                      <Form.Text className="text-muted">
                        Número máximo de tokens por respuesta
                      </Form.Text>
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <div className="p-3 bg-light rounded">
                      <h6 className="mb-2">
                        <MdAnalytics className="me-2 text-info" />
                        Información del Modelo
                      </h6>
                      <div className="mb-2">
                        <strong>Modelo actual:</strong> {settings.aiSettings?.model}
                      </div>
                      <div className="mb-2">
                        <strong>Temperatura:</strong> {settings.aiSettings?.temperature}
                      </div>
                      <div className="mb-0">
                        <strong>Tokens máx:</strong> {settings.aiSettings?.maxTokens}
                      </div>
                    </div>
                  </Col>
                </Row>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      )}

      {/* Configuraciones del Sistema */}
      {activeSection === 'system' && (
        <Row>
          <Col>
            <Card className="border-0 shadow-sm">
              <Card.Header>
                <h6 className="mb-0">
                  <MdBuild className="me-2 text-warning" />
                  Configuraciones del Sistema
                </h6>
              </Card.Header>
              <Card.Body>
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>
                        <MdStorage className="me-2" />
                        Tamaño Máximo de Archivo (MB)
                      </Form.Label>
                      <Form.Control
                        type="number"
                        min="1"
                        max="100"
                        value={settings.systemSettings?.maxFileSize || 10}
                        onChange={(e) => handleSettingChange('systemSettings', 'maxFileSize', parseInt(e.target.value))}
                      />
                      <Form.Text className="text-muted">
                        Tamaño máximo permitido para subida de archivos
                      </Form.Text>
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>
                        <MdAccessTime className="me-2" />
                        Timeout de Sesión (segundos)
                      </Form.Label>
                      <Form.Control
                        type="number"
                        min="300"
                        max="7200"
                        value={settings.systemSettings?.sessionTimeout || 3600}
                        onChange={(e) => handleSettingChange('systemSettings', 'sessionTimeout', parseInt(e.target.value))}
                      />
                      <Form.Text className="text-muted">
                        Tiempo de inactividad antes de cerrar sesión
                      </Form.Text>
                    </Form.Group>
                  </Col>
                </Row>
                <Row>
                  <Col>
                    <Form.Group className="mb-3">
                      <Form.Label>
                        <MdSecurity className="me-2" />
                        Tipos de Archivo Permitidos
                      </Form.Label>
                      <div className="d-flex flex-wrap gap-2">
                        {['jpg', 'jpeg', 'png', 'pdf', 'doc', 'docx', 'txt'].map((type) => (
                          <Form.Check
                            key={type}
                            type="checkbox"
                            id={`file-type-${type}`}
                            label={type.toUpperCase()}
                            checked={settings.systemSettings?.allowedFileTypes?.includes(type) || false}
                            onChange={(e) => {
                              const currentTypes = settings.systemSettings?.allowedFileTypes || [];
                              const newTypes = e.target.checked
                                ? [...currentTypes, type]
                                : currentTypes.filter(t => t !== type);
                              handleSettingChange('systemSettings', 'allowedFileTypes', newTypes);
                            }}
                          />
                        ))}
                      </div>
                      <Form.Text className="text-muted">
                        Tipos de archivo permitidos para subida
                      </Form.Text>
                    </Form.Group>
                  </Col>
                </Row>
                <Row>
                  <Col>
                    <div className="p-3 bg-light rounded">
                      <h6 className="mb-2">
                        <MdInfo className="me-2 text-info" />
                        Información del Sistema
                      </h6>
                      <div className="mb-2">
                        <strong>Tamaño máx. archivo:</strong> {settings.systemSettings?.maxFileSize} MB
                      </div>
                      <div className="mb-2">
                        <strong>Timeout sesión:</strong> {settings.systemSettings?.sessionTimeout} segundos
                      </div>
                      <div className="mb-0">
                        <strong>Tipos permitidos:</strong> {settings.systemSettings?.allowedFileTypes?.join(', ')}
                      </div>
                    </div>
                  </Col>
                </Row>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      )}

      {/* Configuraciones de Notificaciones */}
      {activeSection === 'notifications' && (
        <Row>
          <Col>
            <Card className="border-0 shadow-sm">
              <Card.Header>
                <h6 className="mb-0">
                  <MdNotifications className="me-2 text-success" />
                  Configuraciones de Notificaciones
                </h6>
              </Card.Header>
              <Card.Body>
                <Row>
                  <Col md={4}>
                    <Card className="border-0 bg-light">
                      <Card.Body className="text-center">
                        <MdEmail size={32} className="text-primary mb-2" />
                        <h6>Notificaciones por Email</h6>
                        <Form.Check
                          type="switch"
                          id="email-notifications"
                          checked={settings.notificationSettings?.emailNotifications || false}
                          onChange={(e) => handleSettingChange('notificationSettings', 'emailNotifications', e.target.checked)}
                        />
                        <small className="text-muted">
                          Recibir notificaciones por correo electrónico
                        </small>
                      </Card.Body>
                    </Card>
                  </Col>
                  <Col md={4}>
                    <Card className="border-0 bg-light">
                      <Card.Body className="text-center">
                        <MdPushPin size={32} className="text-warning mb-2" />
                        <h6>Notificaciones Push</h6>
                        <Form.Check
                          type="switch"
                          id="push-notifications"
                          checked={settings.notificationSettings?.pushNotifications || false}
                          onChange={(e) => handleSettingChange('notificationSettings', 'pushNotifications', e.target.checked)}
                        />
                        <small className="text-muted">
                          Notificaciones push en tiempo real
                        </small>
                      </Card.Body>
                    </Card>
                  </Col>
                  <Col md={4}>
                    <Card className="border-0 bg-light">
                      <Card.Body className="text-center">
                        <MdSms size={32} className="text-info mb-2" />
                        <h6>Notificaciones SMS</h6>
                        <Form.Check
                          type="switch"
                          id="sms-notifications"
                          checked={settings.notificationSettings?.smsNotifications || false}
                          onChange={(e) => handleSettingChange('notificationSettings', 'smsNotifications', e.target.checked)}
                        />
                        <small className="text-muted">
                          Enviar notificaciones por SMS
                        </small>
                      </Card.Body>
                    </Card>
                  </Col>
                </Row>
                <Row className="mt-3">
                  <Col>
                    <div className="p-3 bg-light rounded">
                      <h6 className="mb-2">
                        <FaBell className="me-2 text-info" />
                        Estado de Notificaciones
                      </h6>
                      <div className="d-flex gap-3">
                        <div>
                          <strong>Email:</strong>
                          <Badge bg={settings.notificationSettings?.emailNotifications ? 'success' : 'secondary'} className="ms-2">
                            {settings.notificationSettings?.emailNotifications ? 'Activo' : 'Inactivo'}
                          </Badge>
                        </div>
                        <div>
                          <strong>Push:</strong>
                          <Badge bg={settings.notificationSettings?.pushNotifications ? 'success' : 'secondary'} className="ms-2">
                            {settings.notificationSettings?.pushNotifications ? 'Activo' : 'Inactivo'}
                          </Badge>
                        </div>
                        <div>
                          <strong>SMS:</strong>
                          <Badge bg={settings.notificationSettings?.smsNotifications ? 'success' : 'secondary'} className="ms-2">
                            {settings.notificationSettings?.smsNotifications ? 'Activo' : 'Inactivo'}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </Col>
                </Row>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      )}

      {/* Información Adicional */}
      <Row className="mt-4">
        <Col>
          <Alert variant="info">
            <MdInfo className="me-2" />
            <strong>Nota:</strong> Los cambios en las configuraciones se aplicarán inmediatamente después de guardar.
            Algunas configuraciones pueden requerir reiniciar el servidor para tomar efecto completamente.
          </Alert>
        </Col>
      </Row>
    </div>
  );
};

export default AdminSettingsTab; 