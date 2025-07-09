import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Table, 
  Button, 
  Badge, 
  Form, 
  InputGroup, 
  Modal, 
  Alert, 
  Spinner, 
  Row, 
  Col,
  Dropdown,
  Pagination
} from 'react-bootstrap';
import { 
  MdAssignmentInd, 
  MdSearch, 
  MdAdd, 
  MdEdit, 
  MdDelete, 
  MdVisibility, 
  MdMoreVert,
  MdBlock,
  MdCheckCircle,
  MdRefresh,
  MdFilterList,
  MdPerson,
  MdAdminPanelSettings,
  MdWarning,
  MdInfo
} from 'react-icons/md';

interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: {
    name: string;
  };
  is_active: boolean;
  created_at: string;
  last_login?: string;
}

const AdminUsers: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Datos de ejemplo para demostración
  const mockUsers: User[] = [
    {
      id: '1',
      email: 'admin@nutri.com',
      first_name: 'Super',
      last_name: 'Administrador',
      role: { name: 'admin' },
      is_active: true,
      created_at: '2025-01-01T00:00:00Z',
      last_login: '2025-07-08T23:00:00Z'
    },
    {
      id: '2',
      email: 'nutri.admin@sistema.com',
      first_name: 'Carlos',
      last_name: 'Administrador',
      role: { name: 'admin' },
      is_active: true,
      created_at: '2025-01-15T00:00:00Z',
      last_login: '2025-07-08T22:30:00Z'
    },
    {
      id: '3',
      email: 'dr.garcia@nutri.com',
      first_name: 'María',
      last_name: 'García',
      role: { name: 'nutritionist' },
      is_active: true,
      created_at: '2025-02-01T00:00:00Z',
      last_login: '2025-07-08T21:00:00Z'
    },
    {
      id: '4',
      email: 'dr.lopez@nutri.com',
      first_name: 'Juan',
      last_name: 'López',
      role: { name: 'nutritionist' },
      is_active: true,
      created_at: '2025-02-15T00:00:00Z',
      last_login: '2025-07-08T20:00:00Z'
    },
    {
      id: '5',
      email: 'paciente1@email.com',
      first_name: 'Ana',
      last_name: 'Martínez',
      role: { name: 'patient' },
      is_active: true,
      created_at: '2025-03-01T00:00:00Z',
      last_login: '2025-07-08T19:00:00Z'
    },
    {
      id: '6',
      email: 'paciente2@email.com',
      first_name: 'Carlos',
      last_name: 'Rodríguez',
      role: { name: 'patient' },
      is_active: false,
      created_at: '2025-03-15T00:00:00Z',
      last_login: '2025-07-07T18:00:00Z'
    }
  ];

  useEffect(() => {
    // Simular carga de datos
    setTimeout(() => {
      setUsers(mockUsers);
      setLoading(false);
    }, 1000);
  }, []);

  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.last_name.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRole = roleFilter === 'all' || user.role.name === roleFilter;
    const matchesStatus = statusFilter === 'all' || 
      (statusFilter === 'active' && user.is_active) ||
      (statusFilter === 'inactive' && !user.is_active);
    
    return matchesSearch && matchesRole && matchesStatus;
  });

  const handleDeleteUser = (user: User) => {
    setSelectedUser(user);
    setShowDeleteModal(true);
  };

  const confirmDelete = () => {
    if (selectedUser) {
      setUsers(users.filter(u => u.id !== selectedUser.id));
      setShowDeleteModal(false);
      setSelectedUser(null);
    }
  };

  const toggleUserStatus = (userId: string) => {
    setUsers(users.map(user => 
      user.id === userId 
        ? { ...user, is_active: !user.is_active }
        : user
    ));
  };

  const resetPassword = (userId: string) => {
    // Aquí iría la lógica para resetear contraseña
    alert(`Contraseña reseteada para el usuario ${userId}`);
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'admin':
        return <Badge bg="danger">Admin</Badge>;
      case 'nutritionist':
        return <Badge bg="primary">Nutriólogo</Badge>;
      case 'patient':
        return <Badge bg="success">Paciente</Badge>;
      default:
        return <Badge bg="secondary">{role}</Badge>;
    }
  };

  const getStatusBadge = (isActive: boolean) => {
    return isActive 
      ? <Badge bg="success">Activo</Badge>
      : <Badge bg="secondary">Inactivo</Badge>;
  };

  if (loading) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" variant="primary" />
        <p className="mt-3">Cargando usuarios...</p>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h4><MdAssignmentInd className="me-2 text-secondary" />Gestión de Usuarios</h4>
          <p className="text-muted mb-0">Administra todos los usuarios del sistema</p>
        </div>
        <Button variant="primary">
          <MdAdd className="me-2" />
          Nuevo Usuario
        </Button>
      </div>

      {/* Estadísticas */}
      <Row className="mb-4">
        <Col md={3}>
          <Card className="text-center">
            <Card.Body>
              <h5 className="text-primary">{users.length}</h5>
              <small className="text-muted">Total Usuarios</small>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="text-center">
            <Card.Body>
              <h5 className="text-success">{users.filter(u => u.is_active).length}</h5>
              <small className="text-muted">Usuarios Activos</small>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="text-center">
            <Card.Body>
              <h5 className="text-primary">{users.filter(u => u.role.name === 'nutritionist').length}</h5>
              <small className="text-muted">Nutriólogos</small>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="text-center">
            <Card.Body>
              <h5 className="text-success">{users.filter(u => u.role.name === 'patient').length}</h5>
              <small className="text-muted">Pacientes</small>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Filtros */}
      <Card className="mb-4">
        <Card.Body>
          <Row>
            <Col md={4}>
              <InputGroup>
                <InputGroup.Text>
                  <MdSearch />
                </InputGroup.Text>
                <Form.Control
                  placeholder="Buscar usuarios..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </InputGroup>
            </Col>
            <Col md={3}>
              <Form.Select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
              >
                <option value="all">Todos los roles</option>
                <option value="admin">Administradores</option>
                <option value="nutritionist">Nutriólogos</option>
                <option value="patient">Pacientes</option>
              </Form.Select>
            </Col>
            <Col md={3}>
              <Form.Select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">Todos los estados</option>
                <option value="active">Activos</option>
                <option value="inactive">Inactivos</option>
              </Form.Select>
            </Col>
            <Col md={2}>
              <Button variant="outline-secondary" className="w-100">
                <MdFilterList className="me-1" />
                Filtros
              </Button>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Tabla de usuarios */}
      <Card>
        <Card.Body>
          <Table responsive hover>
            <thead>
              <tr>
                <th>Usuario</th>
                <th>Email</th>
                <th>Rol</th>
                <th>Estado</th>
                <th>Último Acceso</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map(user => (
                <tr key={user.id}>
                  <td>
                    <div className="d-flex align-items-center">
                      <div className="bg-primary rounded-circle d-flex align-items-center justify-content-center me-2" style={{ width: 32, height: 32 }}>
                        <MdPerson className="text-white" size={16} />
                      </div>
                      <div>
                        <div className="fw-bold">{user.first_name} {user.last_name}</div>
                        <small className="text-muted">ID: {user.id}</small>
                      </div>
                    </div>
                  </td>
                  <td>{user.email}</td>
                  <td>{getRoleBadge(user.role.name)}</td>
                  <td>{getStatusBadge(user.is_active)}</td>
                  <td>
                    {user.last_login 
                      ? new Date(user.last_login).toLocaleDateString()
                      : 'Nunca'
                    }
                  </td>
                  <td>
                    <Dropdown>
                      <Dropdown.Toggle variant="outline-secondary" size="sm">
                        <MdMoreVert />
                      </Dropdown.Toggle>
                      <Dropdown.Menu>
                        <Dropdown.Item>
                          <MdVisibility className="me-2" />
                          Ver Detalles
                        </Dropdown.Item>
                        <Dropdown.Item>
                          <MdEdit className="me-2" />
                          Editar
                        </Dropdown.Item>
                        <Dropdown.Item onClick={() => resetPassword(user.id)}>
                          <MdRefresh className="me-2" />
                          Resetear Contraseña
                        </Dropdown.Item>
                        <Dropdown.Divider />
                        <Dropdown.Item 
                          onClick={() => toggleUserStatus(user.id)}
                          className={user.is_active ? 'text-warning' : 'text-success'}
                        >
                          {user.is_active ? (
                            <>
                              <MdBlock className="me-2" />
                              Desactivar
                            </>
                          ) : (
                            <>
                              <MdCheckCircle className="me-2" />
                              Activar
                            </>
                          )}
                        </Dropdown.Item>
                        <Dropdown.Divider />
                        <Dropdown.Item 
                          onClick={() => handleDeleteUser(user)}
                          className="text-danger"
                        >
                          <MdDelete className="me-2" />
                          Eliminar
                        </Dropdown.Item>
                      </Dropdown.Menu>
                    </Dropdown>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Card.Body>
      </Card>

      {/* Modal de confirmación de eliminación */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>
            <MdWarning className="me-2 text-danger" />
            Confirmar Eliminación
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          ¿Estás seguro de que quieres eliminar al usuario{' '}
          <strong>{selectedUser?.first_name} {selectedUser?.last_name}</strong>?
          <br />
          <small className="text-muted">
            Esta acción no se puede deshacer.
          </small>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Cancelar
          </Button>
          <Button variant="danger" onClick={confirmDelete}>
            <MdDelete className="me-2" />
            Eliminar
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default AdminUsers; 