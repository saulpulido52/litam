import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Badge, Button, Alert, Form } from 'react-bootstrap';
import { 
  Settings, 
  Shield, 
  Mail, 
  Bell, 
  Database,
  Save,
  RefreshCw,
  CheckCircle
} from 'lucide-react';

interface SystemSettings {
  general: {
    siteName: string;
    siteDescription: string;
    timezone: string;
    language: string;
    maintenanceMode: boolean;
  };
  security: {
    sessionTimeout: number;
    maxLoginAttempts: number;
    requireTwoFactor: boolean;
    passwordMinLength: number;
    enableAuditLog: boolean;
  };
  email: {
    smtpHost: string;
    smtpPort: number;
    smtpUser: string;
    smtpPassword: string;
    fromEmail: string;
    fromName: string;
  };
  notifications: {
    emailNotifications: boolean;
    smsNotifications: boolean;
    pushNotifications: boolean;
    adminAlerts: boolean;
  };
  database: {
    backupFrequency: string;
    backupRetention: number;
    autoOptimization: boolean;
    connectionPool: number;
  };
}

const AdminSettings: React.FC = () => {
  const [settings, setSettings] = useState<SystemSettings>({
    general: {
      siteName: 'NutriWeb',
      siteDescription: 'Sistema de gestión nutricional profesional',
      timezone: 'America/Mexico_City',
      language: 'es',
      maintenanceMode: false
    },
    security: {
      sessionTimeout: 30,
      maxLoginAttempts: 5,
      requireTwoFactor: false,
      passwordMinLength: 8,
      enableAuditLog: true
    },
    email: {
      smtpHost: 'smtp.gmail.com',
      smtpPort: 587,
      smtpUser: 'admin@nutriweb.com',
      smtpPassword: '********',
      fromEmail: 'noreply@nutriweb.com',
      fromName: 'NutriWeb Sistema'
    },
    notifications: {
      emailNotifications: true,
      smsNotifications: false,
      pushNotifications: true,
      adminAlerts: true
    },
    database: {
      backupFrequency: 'daily',
      backupRetention: 30,
      autoOptimization: true,
      connectionPool: 10
    }
  });

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleSave = async () => {
    setSaving(true);
    setSaveStatus('idle');
    
    // Simular guardado
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setSaving(false);
    setSaveStatus('success');
    
    setTimeout(() => setSaveStatus('idle'), 3000);
  };

  const handleTestEmail = async () => {
    setLoading(true);
    
    // Simular prueba de email
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    setLoading(false);
    alert('Email de prueba enviado exitosamente');
  };

  const handleTestDatabase = async () => {
    setLoading(true);
    
    // Simular prueba de base de datos
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setLoading(false);
    alert('Conexión a la base de datos exitosa');
  };

  return (
    <div>
      <div className="mb-4">
        <h3 className="mb-1">Configuración del Sistema</h3>
        <p className="text-muted mb-0">
          Administración de configuraciones generales del sistema
        </p>
      </div>

      {/* Configuración General */}
      <Card className="mb-4">
        <Card.Header>
          <h5 className="mb-0">
            <Settings className="me-2" style={{ width: '20px', height: '20px' }} />
            Configuración General
          </h5>
        </Card.Header>
        <Card.Body>
          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Nombre del Sitio</Form.Label>
                <Form.Control 
                  type="text" 
                  value={settings.general.siteName}
                  onChange={(e) => setSettings({
                    ...settings,
                    general: { ...settings.general, siteName: e.target.value }
                  })}
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Descripción</Form.Label>
                <Form.Control 
                  type="text" 
                  value={settings.general.siteDescription}
                  onChange={(e) => setSettings({
                    ...settings,
                    general: { ...settings.general, siteDescription: e.target.value }
                  })}
                />
              </Form.Group>
            </Col>
          </Row>
          <Row>
            <Col md={4}>
              <Form.Group className="mb-3">
                <Form.Label>Zona Horaria</Form.Label>
                <Form.Select 
                  value={settings.general.timezone}
                  onChange={(e) => setSettings({
                    ...settings,
                    general: { ...settings.general, timezone: e.target.value }
                  })}
                >
                  <option value="America/Mexico_City">México (GMT-6)</option>
                  <option value="America/New_York">Nueva York (GMT-5)</option>
                  <option value="Europe/Madrid">Madrid (GMT+1)</option>
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group className="mb-3">
                <Form.Label>Idioma</Form.Label>
                <Form.Select 
                  value={settings.general.language}
                  onChange={(e) => setSettings({
                    ...settings,
                    general: { ...settings.general, language: e.target.value }
                  })}
                >
                  <option value="es">Español</option>
                  <option value="en">English</option>
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group className="mb-3">
                <Form.Label>Modo Mantenimiento</Form.Label>
                <Form.Check 
                  type="switch" 
                  id="maintenance-mode" 
                  checked={settings.general.maintenanceMode}
                  onChange={(e) => setSettings({
                    ...settings,
                    general: { ...settings.general, maintenanceMode: e.target.checked }
                  })}
                />
              </Form.Group>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Configuración de Seguridad */}
      <Card className="mb-4">
        <Card.Header>
          <h5 className="mb-0">
            <Shield className="me-2" style={{ width: '20px', height: '20px' }} />
            Configuración de Seguridad
          </h5>
        </Card.Header>
        <Card.Body>
          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Tiempo de Sesión (minutos)</Form.Label>
                <Form.Control 
                  type="number" 
                  value={settings.security.sessionTimeout}
                  onChange={(e) => setSettings({
                    ...settings,
                    security: { ...settings.security, sessionTimeout: parseInt(e.target.value) }
                  })}
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Máximo Intentos de Login</Form.Label>
                <Form.Control 
                  type="number" 
                  value={settings.security.maxLoginAttempts}
                  onChange={(e) => setSettings({
                    ...settings,
                    security: { ...settings.security, maxLoginAttempts: parseInt(e.target.value) }
                  })}
                />
              </Form.Group>
            </Col>
          </Row>
          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Longitud Mínima de Contraseña</Form.Label>
                <Form.Control 
                  type="number" 
                  value={settings.security.passwordMinLength}
                  onChange={(e) => setSettings({
                    ...settings,
                    security: { ...settings.security, passwordMinLength: parseInt(e.target.value) }
                  })}
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Autenticación de Dos Factores</Form.Label>
                <Form.Check 
                  type="switch" 
                  id="two-factor" 
                  checked={settings.security.requireTwoFactor}
                  onChange={(e) => setSettings({
                    ...settings,
                    security: { ...settings.security, requireTwoFactor: e.target.checked }
                  })}
                />
              </Form.Group>
            </Col>
          </Row>
          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Registro de Auditoría</Form.Label>
                <Form.Check 
                  type="switch" 
                  id="audit-log" 
                  checked={settings.security.enableAuditLog}
                  onChange={(e) => setSettings({
                    ...settings,
                    security: { ...settings.security, enableAuditLog: e.target.checked }
                  })}
                />
              </Form.Group>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Configuración de Email */}
      <Card className="mb-4">
        <Card.Header>
          <h5 className="mb-0">
            <Mail className="me-2" style={{ width: '20px', height: '20px' }} />
            Configuración de Email
          </h5>
        </Card.Header>
        <Card.Body>
          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Servidor SMTP</Form.Label>
                <Form.Control 
                  type="text" 
                  value={settings.email.smtpHost}
                  onChange={(e) => setSettings({
                    ...settings,
                    email: { ...settings.email, smtpHost: e.target.value }
                  })}
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Puerto SMTP</Form.Label>
                <Form.Control 
                  type="number" 
                  value={settings.email.smtpPort}
                  onChange={(e) => setSettings({
                    ...settings,
                    email: { ...settings.email, smtpPort: parseInt(e.target.value) }
                  })}
                />
              </Form.Group>
            </Col>
          </Row>
          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Usuario SMTP</Form.Label>
                <Form.Control 
                  type="text" 
                  value={settings.email.smtpUser}
                  onChange={(e) => setSettings({
                    ...settings,
                    email: { ...settings.email, smtpUser: e.target.value }
                  })}
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Contraseña SMTP</Form.Label>
                <Form.Control 
                  type="password" 
                  value={settings.email.smtpPassword}
                  onChange={(e) => setSettings({
                    ...settings,
                    email: { ...settings.email, smtpPassword: e.target.value }
                  })}
                />
              </Form.Group>
            </Col>
          </Row>
          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Email Remitente</Form.Label>
                <Form.Control 
                  type="email" 
                  value={settings.email.fromEmail}
                  onChange={(e) => setSettings({
                    ...settings,
                    email: { ...settings.email, fromEmail: e.target.value }
                  })}
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Nombre Remitente</Form.Label>
                <Form.Control 
                  type="text" 
                  value={settings.email.fromName}
                  onChange={(e) => setSettings({
                    ...settings,
                    email: { ...settings.email, fromName: e.target.value }
                  })}
                />
              </Form.Group>
            </Col>
          </Row>
          <Button 
            variant="outline-primary" 
            onClick={handleTestEmail}
            disabled={loading}
          >
            <Mail className="me-1" style={{ width: '14px', height: '14px' }} />
            {loading ? 'Probando...' : 'Probar Conexión Email'}
          </Button>
        </Card.Body>
      </Card>

      {/* Configuración de Notificaciones */}
      <Card className="mb-4">
        <Card.Header>
          <h5 className="mb-0">
            <Bell className="me-2" style={{ width: '20px', height: '20px' }} />
            Configuración de Notificaciones
          </h5>
        </Card.Header>
        <Card.Body>
          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Notificaciones por Email</Form.Label>
                <Form.Check 
                  type="switch" 
                  id="email-notifications" 
                  checked={settings.notifications.emailNotifications}
                  onChange={(e) => setSettings({
                    ...settings,
                    notifications: { ...settings.notifications, emailNotifications: e.target.checked }
                  })}
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Notificaciones SMS</Form.Label>
                <Form.Check 
                  type="switch" 
                  id="sms-notifications" 
                  checked={settings.notifications.smsNotifications}
                  onChange={(e) => setSettings({
                    ...settings,
                    notifications: { ...settings.notifications, smsNotifications: e.target.checked }
                  })}
                />
              </Form.Group>
            </Col>
          </Row>
          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Notificaciones Push</Form.Label>
                <Form.Check 
                  type="switch" 
                  id="push-notifications" 
                  checked={settings.notifications.pushNotifications}
                  onChange={(e) => setSettings({
                    ...settings,
                    notifications: { ...settings.notifications, pushNotifications: e.target.checked }
                  })}
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Alertas de Administrador</Form.Label>
                <Form.Check 
                  type="switch" 
                  id="admin-alerts" 
                  checked={settings.notifications.adminAlerts}
                  onChange={(e) => setSettings({
                    ...settings,
                    notifications: { ...settings.notifications, adminAlerts: e.target.checked }
                  })}
                />
              </Form.Group>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Configuración de Base de Datos */}
      <Card className="mb-4">
        <Card.Header>
          <h5 className="mb-0">
            <Database className="me-2" style={{ width: '20px', height: '20px' }} />
            Configuración de Base de Datos
          </h5>
        </Card.Header>
        <Card.Body>
          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Frecuencia de Backup</Form.Label>
                <Form.Select 
                  value={settings.database.backupFrequency}
                  onChange={(e) => setSettings({
                    ...settings,
                    database: { ...settings.database, backupFrequency: e.target.value }
                  })}
                >
                  <option value="hourly">Cada hora</option>
                  <option value="daily">Diario</option>
                  <option value="weekly">Semanal</option>
                  <option value="monthly">Mensual</option>
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Retención de Backups (días)</Form.Label>
                <Form.Control 
                  type="number" 
                  value={settings.database.backupRetention}
                  onChange={(e) => setSettings({
                    ...settings,
                    database: { ...settings.database, backupRetention: parseInt(e.target.value) }
                  })}
                />
              </Form.Group>
            </Col>
          </Row>
          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Optimización Automática</Form.Label>
                <Form.Check 
                  type="switch" 
                  id="auto-optimization" 
                  checked={settings.database.autoOptimization}
                  onChange={(e) => setSettings({
                    ...settings,
                    database: { ...settings.database, autoOptimization: e.target.checked }
                  })}
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Pool de Conexiones</Form.Label>
                <Form.Control 
                  type="number" 
                  value={settings.database.connectionPool}
                  onChange={(e) => setSettings({
                    ...settings,
                    database: { ...settings.database, connectionPool: parseInt(e.target.value) }
                  })}
                />
              </Form.Group>
            </Col>
          </Row>
          <Button 
            variant="outline-primary" 
            onClick={handleTestDatabase}
            disabled={loading}
          >
            <Database className="me-1" style={{ width: '14px', height: '14px' }} />
            {loading ? 'Probando...' : 'Probar Conexión BD'}
          </Button>
        </Card.Body>
      </Card>

      {/* Acciones */}
      <Card>
        <Card.Header>
          <h5 className="mb-0">Acciones</h5>
        </Card.Header>
        <Card.Body>
          <Row>
            <Col md={6}>
              <Button 
                variant="primary" 
                onClick={handleSave}
                disabled={saving}
                className="w-100"
              >
                <Save className="me-2" style={{ width: '16px', height: '16px' }} />
                {saving ? 'Guardando...' : 'Guardar Configuración'}
              </Button>
            </Col>
            <Col md={6}>
              <Button 
                variant="outline-secondary" 
                className="w-100"
              >
                <RefreshCw className="me-2" style={{ width: '16px', height: '16px' }} />
                Restaurar Valores por Defecto
              </Button>
            </Col>
          </Row>
          
          {saveStatus === 'success' && (
            <Alert variant="success" className="mt-3">
              <CheckCircle className="me-2" style={{ width: '16px', height: '16px' }} />
              Configuración guardada exitosamente
            </Alert>
          )}
        </Card.Body>
      </Card>
    </div>
  );
};

export default AdminSettings; 