import React from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Nav, Button } from 'react-bootstrap';
import { MdAdminPanelSettings, MdPeople, MdHealthAndSafety, MdBuild, MdSettings, MdSubscriptions, MdListAlt, MdDashboard, MdLogout, MdAssignmentInd, MdPerson, MdStorage, MdBugReport, MdMonetizationOn, MdDeleteForever } from 'react-icons/md';

const AdminLayout: React.FC = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    // Limpiar token de localStorage
    localStorage.removeItem('adminToken');
    localStorage.removeItem('token');
    // Redirigir al login de admin
    navigate('/admin/login');
  };

  return (
    <div className="admin-layout d-flex min-vh-100">
      {/* Sidebar */}
      <aside className="bg-light border-end p-3 d-flex flex-column" style={{ minWidth: 240 }}>
        <div className="mb-4 text-center">
          <MdAdminPanelSettings size={48} className="text-primary mb-2" />
          <h5 className="mb-0">Admin NutriWeb</h5>
        </div>
        
        <Nav className="flex-column gap-2 flex-grow-1">
          <NavLink to="/admin" end className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
            <MdDashboard className="me-2" /> Dashboard
          </NavLink>
          <NavLink to="/admin/users" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
            <MdAssignmentInd className="me-2" /> Usuarios
          </NavLink>
          <NavLink to="/admin/nutritionists" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
            <MdPerson className="me-2" /> Nutriólogos
          </NavLink>
          <NavLink to="/admin/patients" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
            <MdPeople className="me-2" /> Pacientes
          </NavLink>
          <NavLink to="/admin/subscriptions" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
            <MdSubscriptions className="me-2" /> Suscripciones
          </NavLink>
          <NavLink to="/admin/monetization" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
            <MdMonetizationOn className="me-2" /> Monetización
          </NavLink>
          <NavLink to="/admin/reports" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
            <MdListAlt className="me-2" /> Reportes
          </NavLink>
          <NavLink to="/admin/system-health" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
            <MdHealthAndSafety className="me-2" /> Salud del Sistema
          </NavLink>
          <NavLink to="/admin/data-integrity" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
            <MdBuild className="me-2" /> Integridad de Datos
          </NavLink>
          <NavLink to="/admin/logs" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
            <MdBugReport className="me-2" /> Logs y Auditoría
          </NavLink>
          <NavLink to="/admin/auditoria-eliminaciones" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
            <MdDeleteForever className="me-2" /> Auditoría Eliminaciones
          </NavLink>
          <NavLink to="/admin/settings" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
            <MdSettings className="me-2" /> Configuración
          </NavLink>
        </Nav>
        
        {/* Botón de cerrar sesión */}
        <div className="mt-auto pt-3 border-top">
          <Button 
            variant="outline-danger" 
            size="sm" 
            className="w-100" 
            onClick={handleLogout}
          >
            <MdLogout className="me-2" />
            Cerrar Sesión
          </Button>
        </div>
      </aside>
      {/* Main content */}
      <main className="flex-grow-1 bg-white">
        <Container fluid className="py-4">
          <Outlet />
        </Container>
      </main>
    </div>
  );
};

export default AdminLayout; 