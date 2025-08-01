import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Button, Table, Modal, InputGroup, Badge, Form, Spinner, Alert } from 'react-bootstrap';
import { useAdmin } from '../../hooks/useAdmin';
import type { AdminUser, AdminUpdateUserDto } from '../../services/adminService';

// React Icons
import { 
  // MdAdd,
  MdEdit,
  MdDelete,
  MdCheckCircle,
  MdCancel,
  MdPerson,
  // MdSecurity,
  MdVerified,
  // MdLock,
  // MdLockOpen,
  MdSave,
  MdClose,
  MdRefresh,
  MdWarning,
  MdEmail,
  MdCalendarToday
} from 'react-icons/md';

const AdminUsersTab: React.FC = () => {
  const {
    users,
    loading,
    loadUsers,
    updateUser,
    deleteUser,
    verifyNutritionist
  } = useAdmin();

  const [showUserModal, setShowUserModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [editingUser, setEditingUser] = useState<AdminUpdateUserDto>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  // Cargar usuarios al montar el componente
  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  // Filtrar usuarios
  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRole = !roleFilter || user.role.name === roleFilter;
    const matchesStatus = !statusFilter || 
      (statusFilter === 'active' && user.is_active) ||
      (statusFilter === 'inactive' && !user.is_active);

    return matchesSearch && matchesRole && matchesStatus;
  });

  // Paginación
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Manejar edición de usuario
  const handleEditUser = (user: AdminUser) => {
    setSelectedUser(user);
    setEditingUser({
      firstName: user.first_name,
      lastName: user.last_name,
      email: user.email,
      isActive: user.is_active,
      roleName: user.role.name
    });
    setShowUserModal(true);
  };

  // Manejar eliminación de usuario
  const handleDeleteUser = (user: AdminUser) => {
    setSelectedUser(user);
    setShowDeleteModal(true);
  };

  // Manejar verificación de nutriólogo
  const handleVerifyNutritionist = (user: AdminUser) => {
    setSelectedUser(user);
    setShowVerifyModal(true);
  };

  // Guardar cambios de usuario
  const handleSaveUser = async () => {
    if (!selectedUser) return;

    try {
      await updateUser(selectedUser.id, editingUser);
      setShowUserModal(false);
      setSelectedUser(null);
      setEditingUser({});
    } catch (error) {
      console.error('Error al actualizar usuario:', error);
    }
  };

  // Confirmar eliminación
  const handleConfirmDelete = async () => {
    if (!selectedUser) return;

    try {
      await deleteUser(selectedUser.id);
      setShowDeleteModal(false);
      setSelectedUser(null);
    } catch (error) {
      console.error('Error al eliminar usuario:', error);
    }
  };

  // Confirmar verificación
  const handleConfirmVerify = async (isVerified: boolean) => {
    if (!selectedUser) return;

    try {
      await verifyNutritionist(selectedUser.id, { isVerified });
      setShowVerifyModal(false);
      setSelectedUser(null);
    } catch (error) {
      console.error('Error al verificar nutriólogo:', error);
    }
  };

  const getRoleBadge = (roleName: string) => {
    switch (roleName) {
      case 'ADMIN':
        return <Badge bg="danger">Administrador</Badge>;
      case 'NUTRITIONIST':
        return <Badge bg="primary">Nutriólogo</Badge>;
      case 'PATIENT':
        return <Badge bg="info">Paciente</Badge>;
      default:
        return <Badge bg="secondary">{roleName}</Badge>;
    }
  };

  const getStatusBadge = (isActive: boolean) => {
    return isActive ? 
      <Badge bg="success"><MdCheckCircle className="me-1" />Activo</Badge> :
      <Badge bg="danger"><MdCancel className="me-1" />Inactivo</Badge>;
  };

  return (
    <div>
      {/* Header */}
      <Row className="mb-4">
        <Col>
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h5 className="mb-0">
                <MdPerson className="me-2 text-primary" />
                Gestión de Usuarios
              </h5>
              <p className="text-muted mb-0">
                Administra todos los usuarios del sistema
              </p>
            </div>
            <Button 
              variant="outline-primary" 
              size="sm"
              onClick={() => loadUsers()}
              disabled={loading}
            >
              <MdRefresh className="me-1" />
              {loading ? 'Actualizando...' : 'Actualizar'}
            </Button>
          </div>
        </Col>
      </Row>

      {/* Filtros */}
      <Row className="mb-4">
        <Col md={4}>
          <InputGroup>
            <InputGroup.Text>
              <MdRefresh />
            </InputGroup.Text>
            <Form.Control
              type="text"
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
            <option value="">Todos los roles</option>
            <option value="ADMIN">Administradores</option>
            <option value="NUTRITIONIST">Nutriólogos</option>
            <option value="PATIENT">Pacientes</option>
          </Form.Select>
        </Col>
        <Col md={3}>
          <Form.Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">Todos los estados</option>
            <option value="active">Activos</option>
            <option value="inactive">Inactivos</option>
          </Form.Select>
        </Col>
        <Col md={2}>
          <Button 
            variant="outline-secondary" 
            size="sm"
            onClick={() => {
              setSearchTerm('');
              setRoleFilter('');
              setStatusFilter('');
            }}
          >
            <MdRefresh className="me-1" />
            Limpiar
          </Button>
        </Col>
      </Row>

      {/* Tabla de Usuarios */}
      <Card className="border-0 shadow-sm">
        <Card.Body className="p-0">
          {loading ? (
            <div className="text-center py-5">
              <Spinner animation="border" variant="primary" />
              <p className="mt-3">Cargando usuarios...</p>
            </div>
          ) : (
            <Table responsive className="mb-0">
              <thead className="bg-light">
                <tr>
                  <th>Usuario</th>
                  <th>Email</th>
                  <th>Rol</th>
                  <th>Estado</th>
                  <th>Fecha de Registro</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {paginatedUsers.map((user) => (
                  <tr key={user.id}>
                    <td>
                      <div className="d-flex align-items-center">
                        <div className="bg-primary bg-opacity-10 rounded-circle p-2 me-2">
                          <MdPerson className="text-primary" size={20} />
                        </div>
                        <div>
                          <div className="fw-bold">
                            {user.first_name} {user.last_name}
                          </div>
                          <small className="text-muted">ID: {user.id}</small>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="d-flex align-items-center">
                        <MdEmail className="me-1 text-muted" />
                        {user.email}
                      </div>
                    </td>
                    <td>{getRoleBadge(user.role.name)}</td>
                    <td>{getStatusBadge(user.is_active)}</td>
                    <td>
                      <div className="d-flex align-items-center">
                        <MdCalendarToday className="me-1 text-muted" />
                        {new Date(user.created_at).toLocaleDateString()}
                      </div>
                    </td>
                    <td>
                      <div className="d-flex gap-1">
                        <Button
                          variant="outline-primary"
                          size="sm"
                          onClick={() => handleEditUser(user)}
                          title="Editar usuario"
                        >
                          <MdEdit size={16} />
                        </Button>
                        {user.role.name === 'NUTRITIONIST' && (
                          <Button
                            variant="outline-warning"
                            size="sm"
                            onClick={() => handleVerifyNutritionist(user)}
                            title="Verificar nutriólogo"
                          >
                            {user.nutritionist_profile?.is_verified ? 
                              <MdVerified size={16} /> : 
                              <MdVerified size={16} />
                            }
                          </Button>
                        )}
                        <Button
                          variant="outline-danger"
                          size="sm"
                          onClick={() => handleDeleteUser(user)}
                          title="Eliminar usuario"
                          disabled={user.role.name === 'ADMIN'}
                        >
                          <MdDelete size={16} />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </Card.Body>
      </Card>

      {/* Paginación */}
      {totalPages > 1 && (
        <Row className="mt-3">
          <Col>
            <div className="d-flex justify-content-between align-items-center">
              <small className="text-muted">
                Mostrando {((currentPage - 1) * itemsPerPage) + 1} - {Math.min(currentPage * itemsPerPage, filteredUsers.length)} de {filteredUsers.length} usuarios
              </small>
              <div className="d-flex gap-1">
                <Button
                  size="sm"
                  variant="outline-secondary"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(currentPage - 1)}
                >
                  Anterior
                </Button>
                <span className="px-3 py-1 bg-light rounded">
                  {currentPage} / {totalPages}
                </span>
                <Button
                  size="sm"
                  variant="outline-secondary"
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(currentPage + 1)}
                >
                  Siguiente
                </Button>
              </div>
            </div>
          </Col>
        </Row>
      )}

      {/* Modal de Edición de Usuario */}
      <Modal show={showUserModal} onHide={() => setShowUserModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            <MdEdit className="me-2" />
            Editar Usuario
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Nombre</Form.Label>
                  <Form.Control
                    type="text"
                    value={editingUser.firstName || ''}
                    onChange={(e) => setEditingUser({...editingUser, firstName: e.target.value})}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Apellido</Form.Label>
                  <Form.Control
                    type="text"
                    value={editingUser.lastName || ''}
                    onChange={(e) => setEditingUser({...editingUser, lastName: e.target.value})}
                  />
                </Form.Group>
              </Col>
            </Row>
            <Form.Group className="mb-3">
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="email"
                value={editingUser.email || ''}
                onChange={(e) => setEditingUser({...editingUser, email: e.target.value})}
              />
            </Form.Group>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Rol</Form.Label>
                  <Form.Select
                    value={editingUser.roleName || ''}
                    onChange={(e) => setEditingUser({...editingUser, roleName: e.target.value})}
                  >
                    <option value="ADMIN">Administrador</option>
                    <option value="NUTRITIONIST">Nutriólogo</option>
                    <option value="PATIENT">Paciente</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Estado</Form.Label>
                  <Form.Select
                    value={editingUser.isActive?.toString() || ''}
                    onChange={(e) => setEditingUser({...editingUser, isActive: e.target.value === 'true'})}
                  >
                    <option value="true">Activo</option>
                    <option value="false">Inactivo</option>
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>
            <Form.Group className="mb-3">
              <Form.Label>Nueva Contraseña (opcional)</Form.Label>
              <Form.Control
                type="password"
                placeholder="Dejar vacío para mantener la actual"
                onChange={(e) => setEditingUser({...editingUser, newPassword: e.target.value})}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowUserModal(false)}>
            <MdClose className="me-1" />
            Cancelar
          </Button>
          <Button variant="primary" onClick={handleSaveUser}>
            <MdSave className="me-1" />
            Guardar Cambios
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Modal de Confirmación de Eliminación */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>
            <MdWarning className="me-2 text-danger" />
            Confirmar Eliminación
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>
            ¿Estás seguro de que quieres eliminar al usuario{' '}
            <strong>{selectedUser?.first_name} {selectedUser?.last_name}</strong>?
          </p>
          <Alert variant="warning">
            <MdWarning className="me-2" />
            <strong>Advertencia:</strong> Esta acción no se puede deshacer.
          </Alert>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Cancelar
          </Button>
          <Button variant="danger" onClick={handleConfirmDelete}>
            <MdDelete className="me-1" />
            Eliminar Usuario
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Modal de Verificación de Nutriólogo */}
      <Modal show={showVerifyModal} onHide={() => setShowVerifyModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>
            <MdVerified className="me-2 text-warning" />
            Verificar Nutriólogo
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>
            ¿Quieres cambiar el estado de verificación de{' '}
            <strong>{selectedUser?.first_name} {selectedUser?.last_name}</strong>?
          </p>
          <div className="d-flex gap-2">
            <Button 
              variant="success" 
              onClick={() => handleConfirmVerify(true)}
            >
              <MdVerified className="me-1" />
              Verificar
            </Button>
            <Button 
              variant="warning" 
              onClick={() => handleConfirmVerify(false)}
            >
              <MdVerified className="me-1" />
              Desverificar
            </Button>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowVerifyModal(false)}>
            Cancelar
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default AdminUsersTab; 