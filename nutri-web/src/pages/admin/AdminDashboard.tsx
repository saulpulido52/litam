import React from 'react';
import { Card, Row, Col } from 'react-bootstrap';
import { MdAdminPanelSettings, MdPeople, MdPerson, MdAssignmentInd, MdHealthAndSafety } from 'react-icons/md';

const AdminDashboard: React.FC = () => {
  return (
    <div>
      <h2 className="mb-4"><MdAdminPanelSettings className="me-2 text-primary" />Panel de Administración</h2>
      <Row className="mb-4">
        <Col md={6} lg={4} className="mb-3">
          <Card className="shadow-sm">
            <Card.Body>
              <h5><MdAssignmentInd className="me-2 text-secondary" />Usuarios</h5>
              <p className="mb-0">Gestión completa de todos los usuarios del sistema.</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={6} lg={4} className="mb-3">
          <Card className="shadow-sm">
            <Card.Body>
              <h5><MdPerson className="me-2 text-info" />Nutriólogos</h5>
              <p className="mb-0">Control y supervisión de todos los nutriólogos registrados.</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={6} lg={4} className="mb-3">
          <Card className="shadow-sm">
            <Card.Body>
              <h5><MdPeople className="me-2 text-success" />Pacientes</h5>
              <p className="mb-0">Acceso y gestión de todos los pacientes del sistema.</p>
            </Card.Body>
          </Card>
        </Col>
      </Row>
      <Card className="shadow-sm">
        <Card.Body>
          <h5><MdHealthAndSafety className="me-2 text-primary" />Bienvenido al panel de administración</h5>
          <p className="mb-0">Desde aquí puedes gestionar usuarios, nutriólogos, pacientes, monitorear la salud del sistema, revisar logs, y mucho más.</p>
        </Card.Body>
      </Card>
    </div>
  );
};

export default AdminDashboard; 