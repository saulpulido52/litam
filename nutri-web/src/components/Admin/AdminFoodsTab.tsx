import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Button, Table, Modal, InputGroup, Form, Alert, Spinner } from 'react-bootstrap';
import adminService from '../../services/adminService';
import type { AdminFood, AdminCreateFoodDto } from '../../services/adminService';

// React Icons
import { 
  MdAdd,
  MdEdit,
  MdDelete,
  MdSearch,
  MdClose,
  MdSave,
  MdRestaurant,
  MdRefresh
} from 'react-icons/md';

const AdminFoodsTab: React.FC = () => {
  const [foods, setFoods] = useState<AdminFood[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Modales
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedFood, setSelectedFood] = useState<AdminFood | null>(null);

  // Formularios
  const [createForm, setCreateForm] = useState<AdminCreateFoodDto>({
    name: '',
    description: '',
    category: '',
    caloriesPer100g: 0,
    proteinPer100g: 0,
    carbsPer100g: 0,
    fatPer100g: 0,
    fiberPer100g: 0
  });

  // Filtros y paginación
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  // Cargar datos
  useEffect(() => {
    loadFoods();
  }, [currentPage]);

  const loadFoods = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await adminService.getAllFoods({ page: currentPage, limit: 20 });
      setFoods((response as any).foods || []);
      setTotalPages((response as any).totalPages || 1);
    } catch (err: any) {
      setError('Error al cargar los alimentos: ' + (err.message || 'Error desconocido'));
    } finally {
      setLoading(false);
    }
  };

  const handleCreateFood = async () => {
    if (!createForm.name.trim()) {
      setError('El nombre del alimento es requerido');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await adminService.createFood(createForm);
      setSuccess('Alimento creado exitosamente');
      setShowCreateModal(false);
      resetCreateForm();
      loadFoods();
    } catch (err: any) {
      setError('Error al crear el alimento: ' + (err.message || 'Error desconocido'));
    } finally {
      setLoading(false);
    }
  };

  const handleEditFood = async () => {
    if (!selectedFood) return;

    setLoading(true);
    setError(null);
    try {
      await adminService.updateFood(selectedFood.id, createForm);
      setSuccess('Alimento actualizado exitosamente');
      setShowEditModal(false);
      setSelectedFood(null);
      resetCreateForm();
      loadFoods();
    } catch (err: any) {
      setError('Error al actualizar el alimento: ' + (err.message || 'Error desconocido'));
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteFood = async () => {
    if (!selectedFood) return;

    setLoading(true);
    setError(null);
    try {
      await adminService.deleteFood(selectedFood.id);
      setSuccess('Alimento eliminado exitosamente');
      setShowDeleteModal(false);
      setSelectedFood(null);
      loadFoods();
    } catch (err: any) {
      setError('Error al eliminar el alimento: ' + (err.message || 'Error desconocido'));
    } finally {
      setLoading(false);
    }
  };

  const resetCreateForm = () => {
    setCreateForm({
      name: '',
      description: '',
      category: '',
      caloriesPer100g: 0,
      proteinPer100g: 0,
      carbsPer100g: 0,
      fatPer100g: 0,
      fiberPer100g: 0
    });
  };

  const openEditModal = (food: AdminFood) => {
    setSelectedFood(food);
    setCreateForm({
      name: food.name,
      description: food.description || '',
      category: food.category || '',
      caloriesPer100g: food.calories_per_100g || 0,
      proteinPer100g: food.protein_per_100g || 0,
      carbsPer100g: food.carbs_per_100g || 0,
      fatPer100g: food.fat_per_100g || 0,
      fiberPer100g: food.fiber_per_100g || 0
    });
    setShowEditModal(true);
  };

  // Filtrar alimentos
  const filteredFoods = foods.filter(food => {
    const matchesSearch = food.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (food.description && food.description.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = !categoryFilter || (food.category && food.category === categoryFilter);
    return matchesSearch && matchesCategory;
  });

  // Obtener categorías únicas
  const categories = Array.from(new Set(foods.map(food => food.category).filter(Boolean)));

  return (
    <div>
      {/* Alertas */}
      {error && (
        <Alert variant="danger" dismissible onClose={() => setError(null)}>
          {error}
        </Alert>
      )}
      {success && (
        <Alert variant="success" dismissible onClose={() => setSuccess(null)}>
          {success}
        </Alert>
      )}

      {/* Controles */}
      <Row className="mb-3">
        <Col md={4}>
          <InputGroup>
            <InputGroup.Text><MdSearch /></InputGroup.Text>
            <Form.Control
              type="text"
              placeholder="Buscar alimentos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </InputGroup>
        </Col>
        <Col md={3}>
          <Form.Select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
          >
            <option value="">Todas las categorías</option>
            {categories.map((category) => (
              <option key={category} value={category}>{category}</option>
            ))}
          </Form.Select>
        </Col>
        <Col md={5} className="text-end">
          <Button
            variant="outline-primary"
            onClick={loadFoods}
            disabled={loading}
            className="me-2"
          >
            <MdRefresh /> Actualizar
          </Button>
          <Button
            variant="primary"
            onClick={() => setShowCreateModal(true)}
          >
            <MdAdd /> Nuevo Alimento
          </Button>
        </Col>
      </Row>

      {/* Tabla de alimentos */}
      <Card>
        <Card.Header>
          <h5><MdRestaurant /> Gestión de Alimentos</h5>
        </Card.Header>
        <Card.Body>
          {loading ? (
            <div className="text-center">
              <Spinner animation="border" />
              <p>Cargando alimentos...</p>
            </div>
          ) : (
            <Table striped bordered hover responsive>
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Categoría</th>
                  <th>Cal/100g</th>
                  <th>Prot/100g</th>
                  <th>Carb/100g</th>
                  <th>Grasa/100g</th>
                  <th>Fibra/100g</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredFoods.map((food) => (
                  <tr key={food.id}>
                    <td>
                      <div>
                        <strong>{food.name}</strong>
                        {food.description && (
                          <div>
                            <small className="text-muted">{food.description}</small>
                          </div>
                        )}
                      </div>
                    </td>
                    <td>{food.category || '-'}</td>
                    <td>{food.calories_per_100g || 0}</td>
                    <td>{food.protein_per_100g || 0}g</td>
                    <td>{food.carbs_per_100g || 0}g</td>
                    <td>{food.fat_per_100g || 0}g</td>
                    <td>{food.fiber_per_100g || 0}g</td>
                    <td>
                      <Button
                        variant="outline-primary"
                        size="sm"
                        onClick={() => openEditModal(food)}
                        className="me-1"
                      >
                        <MdEdit />
                      </Button>
                      <Button
                        variant="outline-danger"
                        size="sm"
                        onClick={() => {
                          setSelectedFood(food);
                          setShowDeleteModal(true);
                        }}
                      >
                        <MdDelete />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}

          {/* Paginación */}
          {totalPages > 1 && (
            <div className="d-flex justify-content-center mt-3">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <Button
                  key={page}
                  variant={page === currentPage ? 'primary' : 'outline-primary'}
                  size="sm"
                  onClick={() => setCurrentPage(page)}
                  className="mx-1"
                >
                  {page}
                </Button>
              ))}
            </div>
          )}
        </Card.Body>
      </Card>

      {/* Modal Crear Alimento */}
      <Modal show={showCreateModal} onHide={() => setShowCreateModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title><MdAdd /> Nuevo Alimento</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Nombre *</Form.Label>
                  <Form.Control
                    type="text"
                    value={createForm.name}
                    onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
                    placeholder="Ej: Manzana"
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Categoría</Form.Label>
                  <Form.Control
                    type="text"
                    value={createForm.category}
                    onChange={(e) => setCreateForm({ ...createForm, category: e.target.value })}
                    placeholder="Ej: Frutas"
                  />
                </Form.Group>
              </Col>
            </Row>
            <Form.Group className="mb-3">
              <Form.Label>Descripción</Form.Label>
              <Form.Control
                as="textarea"
                rows={2}
                value={createForm.description}
                onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })}
                placeholder="Descripción del alimento..."
              />
            </Form.Group>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Calorías por 100g</Form.Label>
                  <Form.Control
                    type="number"
                    step="0.1"
                    value={createForm.caloriesPer100g}
                    onChange={(e) => setCreateForm({ ...createForm, caloriesPer100g: parseFloat(e.target.value) || 0 })}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Proteína por 100g (g)</Form.Label>
                  <Form.Control
                    type="number"
                    step="0.1"
                    value={createForm.proteinPer100g}
                    onChange={(e) => setCreateForm({ ...createForm, proteinPer100g: parseFloat(e.target.value) || 0 })}
                  />
                </Form.Group>
              </Col>
            </Row>
            <Row>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Carbohidratos por 100g (g)</Form.Label>
                  <Form.Control
                    type="number"
                    step="0.1"
                    value={createForm.carbsPer100g}
                    onChange={(e) => setCreateForm({ ...createForm, carbsPer100g: parseFloat(e.target.value) || 0 })}
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Grasa por 100g (g)</Form.Label>
                  <Form.Control
                    type="number"
                    step="0.1"
                    value={createForm.fatPer100g}
                    onChange={(e) => setCreateForm({ ...createForm, fatPer100g: parseFloat(e.target.value) || 0 })}
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Fibra por 100g (g)</Form.Label>
                  <Form.Control
                    type="number"
                    step="0.1"
                    value={createForm.fiberPer100g}
                    onChange={(e) => setCreateForm({ ...createForm, fiberPer100g: parseFloat(e.target.value) || 0 })}
                  />
                </Form.Group>
              </Col>
            </Row>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowCreateModal(false)}>
            <MdClose /> Cancelar
          </Button>
          <Button variant="primary" onClick={handleCreateFood} disabled={loading}>
            <MdSave /> {loading ? 'Creando...' : 'Crear Alimento'}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Modal Editar Alimento */}
      <Modal show={showEditModal} onHide={() => setShowEditModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title><MdEdit /> Editar Alimento</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Nombre *</Form.Label>
                  <Form.Control
                    type="text"
                    value={createForm.name}
                    onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Categoría</Form.Label>
                  <Form.Control
                    type="text"
                    value={createForm.category}
                    onChange={(e) => setCreateForm({ ...createForm, category: e.target.value })}
                  />
                </Form.Group>
              </Col>
            </Row>
            <Form.Group className="mb-3">
              <Form.Label>Descripción</Form.Label>
              <Form.Control
                as="textarea"
                rows={2}
                value={createForm.description}
                onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })}
              />
            </Form.Group>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Calorías por 100g</Form.Label>
                  <Form.Control
                    type="number"
                    step="0.1"
                    value={createForm.caloriesPer100g}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCreateForm({ ...createForm, caloriesPer100g: parseFloat(e.target.value) || 0 })}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Proteína por 100g (g)</Form.Label>
                  <Form.Control
                    type="number"
                    step="0.1"
                    value={createForm.proteinPer100g}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCreateForm({ ...createForm, proteinPer100g: parseFloat(e.target.value) || 0 })}
                  />
                </Form.Group>
              </Col>
            </Row>
            <Row>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Carbohidratos por 100g (g)</Form.Label>
                  <Form.Control
                    type="number"
                    step="0.1"
                    value={createForm.carbsPer100g}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCreateForm({ ...createForm, carbsPer100g: parseFloat(e.target.value) || 0 })}
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Grasa por 100g (g)</Form.Label>
                  <Form.Control
                    type="number"
                    step="0.1"
                    value={createForm.fatPer100g}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCreateForm({ ...createForm, fatPer100g: parseFloat(e.target.value) || 0 })}
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Fibra por 100g (g)</Form.Label>
                  <Form.Control
                    type="number"
                    step="0.1"
                    value={createForm.fiberPer100g}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCreateForm({ ...createForm, fiberPer100g: parseFloat(e.target.value) || 0 })}
                  />
                </Form.Group>
              </Col>
            </Row>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowEditModal(false)}>
            <MdClose /> Cancelar
          </Button>
          <Button variant="primary" onClick={handleEditFood} disabled={loading}>
            <MdSave /> {loading ? 'Guardando...' : 'Guardar Cambios'}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Modal Eliminar Alimento */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title><MdDelete /> Confirmar Eliminación</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedFood && (
            <p>
              ¿Está seguro de que desea eliminar el alimento{' '}
              <strong>{selectedFood.name}</strong>?{' '}
              Esta acción no se puede deshacer.
            </p>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Cancelar
          </Button>
          <Button variant="danger" onClick={handleDeleteFood} disabled={loading}>
            {loading ? 'Eliminando...' : 'Eliminar'}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default AdminFoodsTab;