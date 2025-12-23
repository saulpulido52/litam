// nutri-web/src/components/RecipeBook/RecipeLibrary.tsx
import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Row, 
  Col, 
  Button, 
  Nav,
  InputGroup,
  Badge,
  Form,
  Alert,
  Spinner
} from 'react-bootstrap';
import { 
  Search, 
  Plus, 
  ChefHat,
  Utensils,
  Zap,
  Target,
  Book,
  Calculator,
  Star
} from 'lucide-react';
import { recipeService } from '../../services/recipeService';
import type { 
  Recipe, 
  RecipeSearchParams
} from '../../types/recipe';
import { 
  MEAL_TYPE_LABELS
} from '../../types/recipe';
import RecipeCard from './RecipeCard';
import RecipeCreator from './RecipeCreator';
import RecipeViewer from './RecipeViewer';
import CalorieCalculator from './CalorieCalculator';

interface RecipeLibraryProps {
  patientId?: string;
  showPatientTools?: boolean;
  onRecipeSelect?: (recipe: Recipe) => void;
}

const RecipeLibrary: React.FC<RecipeLibraryProps> = ({
  // patientId,
  showPatientTools = false,
  onRecipeSelect
}) => {
  // Estados principales
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Estados de filtros
  const [filters, setFilters] = useState<RecipeSearchParams>({
    page: 1,
    limit: 12,
    sortBy: 'created_desc'
  });
  
  // Estados de modales
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showCalcModal, setShowCalcModal] = useState(false);
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  
  // Estados de tabs
  const [activeTab, setActiveTab] = useState<'all' | 'favorites' | 'quick' | 'healthy'>('all');
  
  // Estados de paginación
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 12,
    totalPages: 0
  });

  // Cargar recetas
  const loadRecipes = async (searchParams: RecipeSearchParams = {}) => {
    try {
      setLoading(true);
      setError(null);
      
      const params = { ...filters, ...searchParams };
      const result = await recipeService.getAllRecipes(params);
      
      setRecipes(result.recipes as unknown as Recipe[]);
      
      // Asegurar que pagination tenga valores válidos
      setPagination(result.pagination || {
        total: 0,
        page: 1,
        limit: 12,
        totalPages: 0
      });
    } catch (err: any) {
      setError(err.message || 'Error al cargar las recetas');
      console.error('Error al cargar recetas:', err);
    } finally {
      setLoading(false);
    }
  };

  // Efecto inicial
  useEffect(() => {
    loadRecipes();
  }, []);

  // Manejar búsqueda
  const handleSearch = (term: string) => {
    setSearchTerm(term);
    const newFilters = { ...filters, search: term, page: 1 };
    setFilters(newFilters);
    loadRecipes(newFilters);
  };

  // Manejar filtros
  const handleFilterChange = (key: keyof RecipeSearchParams, value: any) => {
    const newFilters = { ...filters, [key]: value, page: 1 };
    setFilters(newFilters);
    loadRecipes(newFilters);
  };

  // Manejar tabs especiales
  const handleTabChange = (tab: 'all' | 'favorites' | 'quick' | 'healthy') => {
    setActiveTab(tab);
    
    let tabFilters: Partial<RecipeSearchParams> = { page: 1 };
    
    switch (tab) {
      case 'quick':
        tabFilters = { ...tabFilters, maxPrepTime: 30, sortBy: 'time_asc' };
        break;
      case 'healthy':
        tabFilters = { ...tabFilters, tags: ['saludable'], maxCaloriesPerServing: 400 };
        break;
      case 'favorites':
        tabFilters = { ...tabFilters, sortBy: 'created_desc' };
        break;
      default:
        tabFilters = { ...tabFilters, sortBy: 'created_desc' };
    }
    
    const newFilters = { ...filters, ...tabFilters };
    setFilters(newFilters);
    loadRecipes(newFilters);
  };

  // Manejar acciones de receta
  const handleRecipeAction = (action: 'view' | 'edit' | 'delete' | 'clone', recipe: Recipe) => {
    setSelectedRecipe(recipe);
    
    switch (action) {
      case 'view':
        setShowViewModal(true);
        break;
      case 'edit':
        setShowCreateModal(true);
        break;
      case 'delete':
        handleDeleteRecipe(recipe.id);
        break;
      case 'clone':
        handleCloneRecipe(recipe);
        break;
    }
  };

  // Eliminar receta
  const handleDeleteRecipe = async (id: string) => {
    if (!window.confirm('¿Estás seguro de que quieres eliminar esta receta?')) return;
    
    try {
      await recipeService.deleteRecipe(id);
      loadRecipes(); // Recargar lista
    } catch (err: any) {
      setError(err.message || 'Error al eliminar la receta');
    }
  };

  // Clonar receta
  const handleCloneRecipe = async (recipe: Recipe) => {
    const newTitle = prompt(`Título para la copia de "${recipe.title}":`, `${recipe.title} (Copia)`);
    if (!newTitle) return; // El usuario canceló

    try {
      setLoading(true);
      // await recipeService.cloneRecipe(recipe.id, newTitle);
      loadRecipes(); // Recargar lista para mostrar la nueva receta
      alert('✅ Receta clonada exitosamente');
    } catch (err: any) {
      setError(err.message || 'Error al clonar la receta');
    } finally {
      setLoading(false);
    }
  };

  // Crear nueva receta
  // const handleCreateRecipe = async (_recipeData: any) => {
  //   try {
  //     await recipeService.createRecipe(_recipeData);
  //     setShowCreateModal(false);
  //     setSelectedRecipe(null);
  //     loadRecipes(); // Recargar lista
  //   } catch (err: any) {
  //     setError(err.message || 'Error al crear la receta');
  //   }
  // };

  return (
    <div className="recipe-library">
      {/* Header con título y acciones */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="mb-1">
            <Book className="me-2" size={24} />
            Recetario Inteligente
            {showPatientTools && (
              <Badge bg="info" className="ms-2">
                <Target size={14} className="me-1" />
                Personalizado
              </Badge>
            )}
          </h2>
          <p className="text-muted mb-0">
            {showPatientTools 
              ? 'Recetas calculadas automáticamente según objetivos nutricionales'
              : 'Biblioteca completa de recetas con cálculo automático de kilocalorías'
            }
          </p>
        </div>
        
        <div className="d-flex gap-2">
          <Button
            variant="outline-primary"
            onClick={() => setShowCalcModal(true)}
          >
            <Calculator size={16} className="me-1" />
            Calculadora Nutricional
          </Button>
          <Button
            variant="primary"
            onClick={() => {
              setSelectedRecipe(null);
              setShowCreateModal(true);
            }}
          >
            <Plus size={16} className="me-1" />
            Nueva Receta
          </Button>
        </div>
      </div>

      {/* Filtros y búsqueda */}
      <Card className="mb-4">
        <Card.Body>
          <Row className="align-items-end">
            <Col md={4}>
              <Form.Group>
                <Form.Label>🔍 Buscar recetas</Form.Label>
                <InputGroup>
                  <Form.Control
                    type="text"
                    placeholder="Nombre, ingrediente, etiqueta..."
                    value={searchTerm}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleSearch(e.target.value)}
                  />
                  <Button variant="outline-secondary">
                    <Search size={16} />
                  </Button>
                </InputGroup>
              </Form.Group>
            </Col>
            
            <Col md={2}>
              <Form.Group>
                <Form.Label>🍽️ Tipo de comida</Form.Label>
                <Form.Select
                  value={filters.mealType || ''}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) => handleFilterChange('mealType', e.target.value || undefined)}
                >
                  <option value="">Todos</option>
                  {Object.entries(MEAL_TYPE_LABELS).map(([key, label]) => (
                    <option key={key} value={key}>{label}</option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
            
            <Col md={2}>
              <Form.Group>
                <Form.Label>⚡ Dificultad</Form.Label>
                <Form.Select
                  value={filters.difficulty || ''}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) => handleFilterChange('difficulty', e.target.value || undefined)}
                >
                  <option value="">Todas</option>
                  {/* {Object.entries(DIFFICULTY_LABELS).map(([key, label]) => (
                    <option key={key} value={key}>{label}</option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
            
            <Col md={2}>
              <Form.Group>
                <Form.Label>🔥 Max. Calorías</Form.Label>
                <Form.Control
                  type="number"
                  placeholder="500"
                  value={filters.maxCaloriesPerServing || ''}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleFilterChange('maxCaloriesPerServing', 
                    e.target.value ? parseInt(e.target.value) : undefined)}
                />
              </Form.Group>
            </Col>
            
            <Col md={2}>
              <Form.Group>
                <Form.Label>📊 Ordenar por</Form.Label>
                <Form.Select
                  value={filters.sortBy || 'created_desc'}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) => handleFilterChange('sortBy', e.target.value)}
                >
                  {/* {SORT_OPTIONS.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))} */}
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>
          
          {/* Tabs de filtros rápidos */}
          <div className="mt-3">
            <Nav variant="pills">
              <Nav.Item>
                <Nav.Link 
                  active={activeTab === 'all'}
                  onClick={() => handleTabChange('all')}
                >
                  <Utensils size={16} className="me-1" />
                  Todas
                </Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link 
                  active={activeTab === 'quick'}
                  onClick={() => handleTabChange('quick')}
                >
                  <Zap size={16} className="me-1" />
                  Rápidas
                </Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link 
                  active={activeTab === 'healthy'}
                  onClick={() => handleTabChange('healthy')}
                >
                  <Target size={16} className="me-1" />
                  Saludables
                </Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link 
                  active={activeTab === 'favorites'}
                  onClick={() => handleTabChange('favorites')}
                >
                  <Star size={16} className="me-1" />
                  Destacadas
                </Nav.Link>
              </Nav.Item>
            </Nav>
          </div>
        </Card.Body>
      </Card>

      {/* Mensajes de estado */}
      {error && (
        <Alert variant="danger" dismissible onClose={() => setError(null)}>
          <strong>Error:</strong> {error}
        </Alert>
      )}

      {/* Lista de recetas */}
      {loading ? (
        <div className="text-center py-5">
          <Spinner animation="border" variant="primary" />
          <p className="mt-2">Cargando recetas...</p>
        </div>
      ) : recipes.length === 0 ? (
        <Card className="text-center py-5">
          <Card.Body>
            <ChefHat size={48} className="text-muted mb-3" />
            <h5>No se encontraron recetas</h5>
            <p className="text-muted">
              {searchTerm || Object.keys(filters).some(key => filters[key as keyof RecipeSearchParams])
                ? 'Intenta cambiar los filtros de búsqueda'
                : 'Comienza creando tu primera receta'
              }
            </p>
            <Button 
              variant="primary"
              onClick={() => setShowCreateModal(true)}
            >
              <Plus size={16} className="me-1" />
              Crear Primera Receta
            </Button>
          </Card.Body>
        </Card>
      ) : (
        <>
          {/* Grid de recetas */}
          <Row>
            {recipes.map((recipe) => (
              <Col key={recipe.id} lg={4} md={6} className="mb-4">
                <RecipeCard
                  recipe={recipe}
                  onAction={handleRecipeAction}
                  onSelect={onRecipeSelect}
                  showPatientTools={showPatientTools}
                />
              </Col>
            ))}
          </Row>

          {/* Paginación */}
          {pagination.totalPages > 1 && (
            <div className="d-flex justify-content-center mt-4">
              <Button
                variant="outline-primary"
                disabled={pagination.page <= 1}
                onClick={() => {
                  const newFilters = { ...filters, page: pagination.page - 1 };
                  setFilters(newFilters);
                  loadRecipes(newFilters);
                }}
              >
                Anterior
              </Button>
              <span className="mx-3 align-self-center">
                Página {pagination.page} de {pagination.totalPages}
              </span>
              <Button
                variant="outline-primary"
                disabled={pagination.page >= pagination.totalPages}
                onClick={() => {
                  const newFilters = { ...filters, page: pagination.page + 1 };
                  setFilters(newFilters);
                  loadRecipes(newFilters);
                }}
              >
                Siguiente
              </Button>
            </div>
          )}
        </>
      )}

      {/* Modales */}
      {showCreateModal && (
        <RecipeCreator
          isOpen={showCreateModal}
          onClose={() => {
            setShowCreateModal(false);
            setSelectedRecipe(null);
          }}
          // onSave={handleCreateRecipe}
          editRecipe={selectedRecipe}
          // patientId={patientId}
        />
      )}

      {showViewModal && selectedRecipe && (
        <RecipeViewer
          recipe={selectedRecipe}
          isOpen={showViewModal}
          onClose={() => {
            setShowViewModal(false);
            setSelectedRecipe(null);
          }}
          onEdit={() => {
            setShowViewModal(false);
            setShowCreateModal(true);
          }}
        />
      )}

      {showCalcModal && (
        <CalorieCalculator
          isOpen={showCalcModal}
          onClose={() => setShowCalcModal(false)}
        />
      )}
    </div>
  );
};

export default RecipeLibrary; 