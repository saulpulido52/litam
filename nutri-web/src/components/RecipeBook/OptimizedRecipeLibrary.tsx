// nutri-web/src/components/RecipeBook/OptimizedRecipeLibrary.tsx
import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { 
  Card, 
  Row, 
  Col, 
  Button, 
  Nav,
  InputGroup,
  Form,
  Alert,
  Spinner
} from 'react-bootstrap';
import { 
  Search, 
  Plus, 
  ChefHat,
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
import { useDebounce } from '../../utils/optimizationUtils';
// import { cacheService } from '../../services/cacheService';

interface RecipeLibraryProps {
  patientId?: string;
  showPatientTools?: boolean;
  onRecipeSelect?: (recipe: Recipe) => void;
}

// **OPTIMIZACIÓN**: Separar componente de filtros para evitar re-renders
const RecipeFilters = React.memo(({
  filters,
  onFilterChange,
  onSearch,
  searchTerm}: {
  filters: RecipeSearchParams;
  onFilterChange: (key: keyof RecipeSearchParams, value: any) => void;
  onSearch: (term: string) => void;
  searchTerm: string;
}) => {
  // **OPTIMIZACIÓN**: Debounce de búsqueda para evitar llamadas excesivas
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  useEffect(() => {
    if (debouncedSearchTerm !== searchTerm) return;
    onSearch(debouncedSearchTerm);
  }, [debouncedSearchTerm, onSearch]);

  return (
    <Card className="mb-4">
      <Card.Body>
        <Row className="g-3">
          <Col md={6}>
            <InputGroup>
              <InputGroup.Text>
                <Search size={16} />
              </InputGroup.Text>
              <Form.Control
                type="text"
                placeholder="Buscar recetas..."
                value={searchTerm}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => onSearch(e.target.value)}
              />
            </InputGroup>
          </Col>
          
          <Col md={2}>
            <Form.Select
              value={filters.mealType || ''}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => onFilterChange('mealType', e.target.value || undefined)}
            >
              <option value="">Tipo de comida</option>
              {Object.entries(MEAL_TYPE_LABELS).map(([key, label]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </Form.Select>
          </Col>
          
          <Col md={2}>
            <Form.Select
              value={filters.sortBy || 'created_desc'}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => onFilterChange('sortBy', e.target.value)}
            >
              {/* {SORT_OPTIONS.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))} */}
            </Form.Select>
          </Col>
          
          <Col md={2}>
            <Form.Control
              type="number"
              placeholder="Máx. tiempo (min)"
              value={filters.maxPrepTime || ''}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => onFilterChange('maxPrepTime', Number(e.target.value) || undefined)}
            />
          </Col>
        </Row>
      </Card.Body>
    </Card>
  );
});

// **OPTIMIZACIÓN**: Separar componente de tabs para mejor rendimiento
const RecipeTabs = React.memo(({
  activeTab,
  onTabChange}: {
  activeTab: string;
  onTabChange: (tab: 'all' | 'favorites' | 'quick' | 'healthy') => void;
}) => {
  const tabs = useMemo(() => [
    { key: 'all', label: 'Todas', icon: Book },
    { key: 'favorites', label: 'Favoritas', icon: Star },
    { key: 'quick', label: 'Rápidas', icon: Zap },
    { key: 'healthy', label: 'Saludables', icon: Target },
  ], []);

  return (
    <Nav variant="pills" className="mb-4">
      {tabs.map(({ key, label, icon: Icon }) => (
        <Nav.Item key={key}>
          <Nav.Link
            active={activeTab === key}
            onClick={() => onTabChange(key as any)}
            className="d-flex align-items-center"
          >
            <Icon size={16} className="me-2" />
            {label}
          </Nav.Link>
        </Nav.Item>
      ))}
    </Nav>
  );
});

// **OPTIMIZACIÓN**: Grid de recetas optimizado con virtualización básica
const RecipeGrid = React.memo(({
  recipes,
  loading,
    onRecipeSelect}: {
  recipes: Recipe[];
  loading: boolean;
  onRecipeSelect?: (recipe: Recipe) => void;
}) => {
  if (loading) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" />
        <p className="mt-2">Cargando recetas...</p>
      </div>
    );
  }

  if (recipes.length === 0) {
    return (
      <Alert variant="info" className="text-center py-5">
        <Book size={48} className="mb-3" />
        <h5>No se encontraron recetas</h5>
        <p>Intenta ajustar los filtros de búsqueda</p>
      </Alert>
    );
  }

  return (
    <Row className="g-4">
      {recipes.map((recipe) => (
        <Col key={recipe.id} md={6} lg={4}>
          <RecipeCard
            recipe={recipe}
            // onView={() => onRecipeView(recipe)}
            // onEdit={() => onRecipeEdit(recipe)}
            // onDelete={() => onRecipeDelete(recipe)}
            onSelect={onRecipeSelect ? () => onRecipeSelect(recipe) : undefined}
            onAction={(action, recipe) => {
              if (action === 'view') console.log('View recipe:', recipe);
              if (action === 'edit') console.log('Edit recipe:', recipe);
              if (action === 'delete') console.log('Delete recipe:', recipe);
            }}
          />
        </Col>
      ))}
    </Row>
  );
});

// **OPTIMIZACIÓN**: Componente principal optimizado
const OptimizedRecipeLibrary: React.FC<RecipeLibraryProps> = ({
  // patientId,
  showPatientTools = false,
  onRecipeSelect
}) => {
  // **OPTIMIZACIÓN**: Estados separados y optimizados
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  // const [loading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // **OPTIMIZACIÓN**: Estados de filtros memoizados
  const [filters, setFilters] = useState<RecipeSearchParams>(() => ({
    page: 1,
    limit: 12,
    sortBy: 'created_desc'
  }));
  
  // **OPTIMIZACIÓN**: Estados de modales optimizados
  const [modals, setModals] = useState({
    create: false,
    view: false,
    calc: false});
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [activeTab, setActiveTab] = useState<'all' | 'favorites' | 'quick' | 'healthy'>('all');
  
  // **OPTIMIZACIÓN**: Estados de paginación memoizados
  const [pagination, setPagination] = useState(() => ({
    total: 0,
    page: 1,
    limit: 12,
    totalPages: 0
  }));

  // **OPTIMIZACIÓN**: Función de carga de recetas con caché
  const loadRecipes = useCallback(async (searchParams: RecipeSearchParams = {}) => {
    try {
      // setLoading(true);
      setError(null);
      
      const params = { ...filters, ...searchParams };
      const result = await recipeService.getAllRecipes(params);
      
      setRecipes(result.recipes as unknown as Recipe[]);
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
      // setLoading(false);
    }
  }, [filters]);

  // **OPTIMIZACIÓN**: Handlers memoizados
  const handleSearch = useCallback((term: string) => {
    setSearchTerm(term);
    const newFilters = { ...filters, search: term, page: 1 };
    setFilters(newFilters);
    loadRecipes(newFilters);
  }, [filters, loadRecipes]);

  const handleFilterChange = useCallback((key: keyof RecipeSearchParams, value: any) => {
    const newFilters = { ...filters, [key]: value, page: 1 };
    setFilters(newFilters);
    loadRecipes(newFilters);
  }, [filters, loadRecipes]);

  const handleTabChange = useCallback((tab: 'all' | 'favorites' | 'quick' | 'healthy') => {
    setActiveTab(tab);
    
    let tabFilters: Partial<RecipeSearchParams> = { page: 1 };
    
    switch (tab) {
      case 'quick':
        tabFilters = { ...tabFilters, maxPrepTime: 30, sortBy: 'time_asc' };
        break;
      case 'healthy':
        tabFilters = { ...tabFilters, maxCaloriesPerServing: 400, sortBy: 'calories_asc' };
        break;
      case 'favorites':
        // En una implementación real, aquí cargaríamos favoritos del usuario
        break;
      default:
        tabFilters = { ...tabFilters, sortBy: 'created_desc' };
    }
    
    const newFilters = { ...filters, ...tabFilters };
    setFilters(newFilters);
    loadRecipes(newFilters);
  }, [filters, loadRecipes]);

  // **OPTIMIZACIÓN**: Handlers de modales memoizados
  const handleModalToggle = useCallback((modal: keyof typeof modals, open: boolean, recipe?: Recipe) => {
    setModals(prev => ({ ...prev, [modal]: open }));
    if (recipe) setSelectedRecipe(recipe);
    if (!open) setSelectedRecipe(null);
  }, []);

  // const handleRecipeView = useCallback((recipe: Recipe) => {
  //   handleModalToggle('view', true, recipe);
  // }, [handleModalToggle]);

  // const handleRecipeEdit = useCallback((recipe: Recipe) => {
  //   handleModalToggle('create', true, recipe);
  // }, [handleModalToggle]);

  // const handleRecipeDelete = useCallback(async (recipe: Recipe) => {
  //   if (!confirm(`¿Estás seguro de que quieres eliminar la receta "${recipe.title}"?`)) {
  //     return;
  //   }

  //   try {
  //     // setLoading('delete', true);
  //     await recipeService.deleteRecipe(recipe.id);
      
  //     // **OPTIMIZACIÓN**: Actualizar estado local sin recargar todo
  //     setRecipes(prev => prev.filter(r => r.id !== recipe.id));
      
  //     // Invalidar caché relacionado
  //     cacheService.invalidatePattern('recipes:');
  //   } catch (err: any) {
  //     setError(err.message || 'Error al eliminar la receta');
  //   } finally {
  //     // setLoading('delete', false);
  //   }
  // }, []);

  // **OPTIMIZACIÓN**: Efecto inicial optimizado
  useEffect(() => {
    loadRecipes();
  }, []); // Solo ejecutar una vez al montar

  // **OPTIMIZACIÓN**: Precarga de recetas populares
  useEffect(() => {
    // if (!isLoading('recipes')) {
      recipeService.preloadPopularRecipes();
    // }
  }, []);

  return (
    <div className="recipe-library">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="mb-0">
            <ChefHat className="me-2" />
            Biblioteca de Recetas
          </h2>
          <p className="text-muted mb-0">
            {pagination.total} recetas disponibles
          </p>
        </div>
        
        <div className="d-flex gap-2">
          {showPatientTools && (
            <Button
              variant="outline-primary"
              onClick={() => handleModalToggle('calc', true)}
              className="d-flex align-items-center"
            >
              <Calculator size={16} className="me-2" />
              Calculadora
            </Button>
          )}
          
          <Button
            variant="primary"
            onClick={() => handleModalToggle('create', true)}
            className="d-flex align-items-center"
          >
            <Plus size={16} className="me-2" />
            Nueva Receta
          </Button>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert variant="danger" dismissible onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Tabs */}
      <RecipeTabs activeTab={activeTab} onTabChange={handleTabChange} />

      {/* Filtros */}
      <RecipeFilters
        filters={filters}
        onFilterChange={handleFilterChange}
        onSearch={handleSearch}
        searchTerm={searchTerm}
      />

      {/* Grid de Recetas */}
      <RecipeGrid
        recipes={recipes}
        loading={false}
        onRecipeSelect={onRecipeSelect}
      />

      {/* Paginación */}
      {pagination.totalPages > 1 && (
        <div className="d-flex justify-content-center mt-4">
          <nav>
            <ul className="pagination">
              <li className={`page-item ${pagination.page === 1 ? 'disabled' : ''}`}>
                <button
                  className="page-link"
                  onClick={() => handleFilterChange('page', pagination.page - 1)}
                  disabled={pagination.page === 1}
                >
                  Anterior
                </button>
              </li>
              
              {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map(page => (
                <li key={page} className={`page-item ${pagination.page === page ? 'active' : ''}`}>
                  <button
                    className="page-link"
                    onClick={() => handleFilterChange('page', page)}
                  >
                    {page}
                  </button>
                </li>
              ))}
              
              <li className={`page-item ${pagination.page === pagination.totalPages ? 'disabled' : ''}`}>
                <button
                  className="page-link"
                  onClick={() => handleFilterChange('page', pagination.page + 1)}
                  disabled={pagination.page === pagination.totalPages}
                >
                  Siguiente
                </button>
              </li>
            </ul>
          </nav>
        </div>
      )}

      {/* Modales */}
      {modals.create && (
        <RecipeCreator
          isOpen={modals.create}
          onClose={() => handleModalToggle('create', false)}
          // recipe={selectedRecipe}
          // onRecipeCreated={() => {
          //   handleModalToggle('create', false);
          //   loadRecipes();
          // }}
        />
      )}

      {modals.view && selectedRecipe && (
        <RecipeViewer
          isOpen={modals.view}
          onClose={() => handleModalToggle('view', false)}
          recipe={selectedRecipe}
          onEdit={() => {
            handleModalToggle('view', false);
            handleModalToggle('create', true, selectedRecipe);
          }}
        />
      )}

      {modals.calc && (
        <CalorieCalculator
          isOpen={modals.calc}
          onClose={() => handleModalToggle('calc', false)}
          // patientId={patientId}
        />
      )}
    </div>
  );
};

export default OptimizedRecipeLibrary; 