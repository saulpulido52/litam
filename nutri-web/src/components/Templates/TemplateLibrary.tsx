import React, { useState, useMemo, useEffect } from 'react';
import { Container, Row, Col, Card, Button, InputGroup, Modal, Form, Badge, Alert, Spinner } from 'react-bootstrap';
import { Search, Plus, Clock, DollarSign, Copy, Edit, Trash2, Download, Users, Star, Eye, Filter } from 'lucide-react';
import { templateService } from '../../services/templateService';
import type { 
    WeeklyPlanTemplate, 
    TemplateCategory, 
    TemplateFilters
} from '../../types/template';
import { 
    TEMPLATE_CATEGORIES, 
    DIFFICULTY_LEVELS
} from '../../types/template';

interface TemplateLibraryProps {
    onSelectTemplate?: (template: WeeklyPlanTemplate) => void;
    onCreateTemplate?: () => void;
    onEditTemplate?: (template: WeeklyPlanTemplate) => void;
    showActions?: boolean;
    selectMode?: boolean;
}

export const TemplateLibrary: React.FC<TemplateLibraryProps> = ({
    onSelectTemplate,
    onCreateTemplate,
    onEditTemplate,
    showActions = true,
    selectMode = false
}) => {
    // Estados principales
    const [templates, setTemplates] = useState<WeeklyPlanTemplate[]>([]);
    // Variable/función removida - no utilizada
// Variable/función removida - no utilizada
// Estados de filtros
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<TemplateCategory | ''>('');
    const [selectedDifficulty, setSelectedDifficulty] = useState<'easy' | 'medium' | 'hard' | ''>('');
    const [showPublicOnly, setShowPublicOnly] = useState(false);
    const [showMyTemplatesOnly, setShowMyTemplatesOnly] = useState(false);

    // Estados de paginación
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalTemplates, setTotalTemplates] = useState(0);
    const templatesPerPage = 12;

    // Estados de modales
    // const [showTemplateDetail, setShowTemplateDetail] = useState(false);
    // const [selectedTemplate, setSelectedTemplate] = useState<WeeklyPlanTemplate | null>(null);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [templateToDelete, setTemplateToDelete] = useState<WeeklyPlanTemplate | null>(null);

    // Cargar plantillas
    const loadTemplates = async () => {
        setLoading(true);
        setError(null);
        
        try {
            const filters: TemplateFilters = {
                search: searchTerm || undefined,
                category: selectedCategory || undefined,
                isPublic: showPublicOnly ? true : showMyTemplatesOnly ? false : undefined,
                page: currentPage,
                limit: templatesPerPage
            };

            const response = await templateService.getTemplates(filters);
            
            if (response.success) {
                setTemplates(response.data);
                setTotalPages(response.pagination?.totalPages || 1);
                setTotalTemplates(response.pagination?.total || 0);
            } else {
                setError('Error al cargar las plantillas');
            }
        } catch (err: any) {
            setError(err.message || 'Error al cargar las plantillas');
        } finally {
            setLoading(false);
        }
    };

    // Efectos
    useEffect(() => {
        loadTemplates();
    }, [currentPage, selectedCategory, showPublicOnly, showMyTemplatesOnly]);

    useEffect(() => {
        const delayedSearch = setTimeout(() => {
            if (currentPage === 1) {
                loadTemplates();
            } else {
                setCurrentPage(1);
            }
        }, 500);

        return () => clearTimeout(delayedSearch);
    }, [searchTerm]);

    // Filtrar plantillas por dificultad (local)
    const filteredTemplates = useMemo(() => {
        if (!selectedDifficulty) return templates;
        return templates.filter(template => template.difficultyLevel === selectedDifficulty);
    }, [templates, selectedDifficulty]);

    // Manejar acciones
    const handleTemplateSelect = (template: WeeklyPlanTemplate) => {
        if (selectMode && onSelectTemplate) {
            onSelectTemplate(template);
        } else {
            // setSelectedTemplate(template);
            // setShowTemplateDetail(true);
        }
    };

    const handleDeleteTemplate = async (template: WeeklyPlanTemplate) => {
        setTemplateToDelete(template);
        setShowDeleteConfirm(true);
    };

    const confirmDeleteTemplate = async () => {
        if (!templateToDelete) return;

        try {
            await templateService.deleteTemplate(templateToDelete.id);
            setTemplates(templates.filter(t => t.id !== templateToDelete.id));
            setShowDeleteConfirm(false);
            setTemplateToDelete(null);
        } catch (err: any) {
            setError(err.message || 'Error al eliminar la plantilla');
        }
    };

    const handleDuplicateTemplate = async (template: WeeklyPlanTemplate) => {
        try {
            const newName = `${template.name} (Copia)`;
            await templateService.duplicateTemplate(template.id, newName);
            loadTemplates(); // Recargar para mostrar la nueva plantilla
        } catch (err: any) {
            setError(err.message || 'Error al duplicar la plantilla');
        }
    };

    // const handleRateTemplate = async (template: WeeklyPlanTemplate, rating: number) => {
    //     try {
    //         await templateService.rateTemplate(template.id, rating);
    //         loadTemplates(); // Recargar para mostrar la nueva calificación
    //     } catch (err: any) {
    //         setError(err.message || 'Error al calificar la plantilla');
    //     }
    // };

    // Limpiar filtros
    const clearFilters = () => {
        setSearchTerm('');
        setSelectedCategory('');
        setSelectedDifficulty('');
        setShowPublicOnly(false);
        setShowMyTemplatesOnly(false);
        setCurrentPage(1);
    };

    // Renderizar tarjeta de plantilla
    const renderTemplateCard = (template: WeeklyPlanTemplate) => {
        const nutrition = templateService.calculateTemplateNutrition(template);
        const category = TEMPLATE_CATEGORIES.find(c => c.value === template.category);
        const difficulty = DIFFICULTY_LEVELS.find(d => d.value === template.difficultyLevel);

        return (
            <Col key={template.id} lg={4} md={6} className="mb-4">
                <Card className={`h-100 shadow-sm ${selectMode ? 'cursor-pointer' : ''}`}>
                    <Card.Header className="d-flex justify-content-between align-items-center">
                        <div className="d-flex align-items-center">
                            <span className="me-2">{category?.icon}</span>
                            <Badge bg="secondary" className="me-2">
                                {category?.label}
                            </Badge>
                            {template.isPublic && (
                                <Badge bg="info" className="me-2">
                                    <Users size={12} className="me-1" />
                                    Pública
                                </Badge>
                            )}
                        </div>
                        <div className="d-flex align-items-center">
                            {template.rating && template.rating > 0 && (
                                <div className="d-flex align-items-center me-2">
                                    <Star size={14} className="text-warning me-1" />
                                    <small>{template.rating.toFixed(1)}</small>
                                </div>
                            )}
                            <Badge bg={difficulty?.color as any}>
                                {difficulty?.icon} {difficulty?.label}
                            </Badge>
                        </div>
                    </Card.Header>

                    <Card.Body className="d-flex flex-column">
                        <Card.Title className="h6">{template.name}</Card.Title>
                        <Card.Text className="text-muted small flex-grow-1">
                            {template.description || 'Sin descripción'}
                        </Card.Text>

                        {/* Información nutricional resumida */}
                        <div className="mb-3">
                            <Row className="text-center">
                                <Col xs={6}>
                                    <div className="small">
                                        <strong>{nutrition.dailyAverages.calories}</strong>
                                        <div className="text-muted">kcal/día</div>
                                    </div>
                                </Col>
                                <Col xs={6}>
                                    <div className="small">
                                        <strong>{template.meals.length}</strong>
                                        <div className="text-muted">comidas</div>
                                    </div>
                                </Col>
                            </Row>
                        </div>

                        {/* Información adicional */}
                        <div className="d-flex justify-content-between align-items-center mb-3">
                            {template.avgPrepTimeMinutes && (
                                <div className="d-flex align-items-center text-muted">
                                    <Clock size={14} className="me-1" />
                                    <small>{template.avgPrepTimeMinutes}min/día</small>
                                </div>
                            )}
                            {template.estimatedWeeklyCost && (
                                <div className="d-flex align-items-center text-muted">
                                    <DollarSign size={14} className="me-1" />
                                    <small>${template.estimatedWeeklyCost}/sem</small>
                                </div>
                            )}
                            <div className="d-flex align-items-center text-muted">
                                <Users size={14} className="me-1" />
                                <small>{template.usageCount} usos</small>
                            </div>
                        </div>

                        {/* Tags */}
                        {template.tags && template.tags.length > 0 && (
                            <div className="mb-3">
                                {template.tags.slice(0, 3).map((tag, index) => (
                                    <Badge key={index} bg="light" text="dark" className="me-1 mb-1">
                                        #{tag}
                                    </Badge>
                                ))}
                                {template.tags.length > 3 && (
                                    <Badge bg="light" text="muted">
                                        +{template.tags.length - 3} más
                                    </Badge>
                                )}
                            </div>
                        )}
                    </Card.Body>

                    <Card.Footer className="bg-transparent">
                        <div className="d-flex gap-2 flex-wrap">
                            <Button
                                variant={selectMode ? 'primary' : 'outline-primary'}
                                size="sm"
                                onClick={() => handleTemplateSelect(template)}
                                className="flex-grow-1"
                            >
                                {selectMode ? (
                                    <>
                                        <Download size={14} className="me-1" />
                                        Usar Plantilla
                                    </>
                                ) : (
                                    <>
                                        <Eye size={14} className="me-1" />
                                        Ver Detalles
                                    </>
                                )}
                            </Button>

                            {showActions && !selectMode && (
                                <>
                                    <Button
                                        variant="outline-secondary"
                                        size="sm"
                                        onClick={() => handleDuplicateTemplate(template)}
                                        title="Duplicar plantilla"
                                    >
                                        <Copy size={14} />
                                    </Button>
                                    
                                    {onEditTemplate && (
                                        <Button
                                            variant="outline-warning"
                                            size="sm"
                                            onClick={() => onEditTemplate(template)}
                                            title="Editar plantilla"
                                        >
                                            <Edit size={14} />
                                        </Button>
                                    )}

                                    <Button
                                        variant="outline-danger"
                                        size="sm"
                                        onClick={() => handleDeleteTemplate(template)}
                                        title="Eliminar plantilla"
                                    >
                                        <Trash2 size={14} />
                                    </Button>
                                </>
                            )}
                        </div>
                    </Card.Footer>
                </Card>
            </Col>
        );
    };

    return (
        <Container fluid>
            {/* Header */}
            <Row className="mb-4">
                <Col>
                    <div className="d-flex justify-content-between align-items-center">
                        <div>
                            <h4 className="mb-1">
                                📚 {selectMode ? 'Seleccionar Plantilla' : 'Biblioteca de Plantillas'}
                            </h4>
                            <p className="text-muted mb-0">
                                {selectMode 
                                    ? 'Elige una plantilla para aplicar a tu plan de comidas'
                                    : 'Gestiona y organiza tus plantillas de planes nutricionales'
                                }
                            </p>
                        </div>
                        {showActions && onCreateTemplate && !selectMode && (
                            <Button variant="primary" onClick={onCreateTemplate}>
                                <Plus size={16} className="me-1" />
                                Nueva Plantilla
                            </Button>
                        )}
                    </div>
                </Col>
            </Row>

            {/* Filtros */}
            <Row className="mb-4">
                <Col>
                    <Card>
                        <Card.Body>
                            <Row className="align-items-center">
                                <Col md={4}>
                                    <InputGroup>
                                        <InputGroup.Text>
                                            <Search size={16} />
                                        </InputGroup.Text>
                                        <Form.Control
                                            type="text"
                                            placeholder="Buscar plantillas..."
                                            value={searchTerm}
                                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
                                        />
                                    </InputGroup>
                                </Col>
                                <Col md={2}>
                                    <Form.Select
                                        value={selectedCategory}
                                        onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setSelectedCategory(e.target.value as TemplateCategory)}
                                    >
                                        <option value="">Todas las categorías</option>
                                        {TEMPLATE_CATEGORIES.map(category => (
                                            <option key={category.value} value={category.value}>
                                                {category.icon} {category.label}
                                            </option>
                                        ))}
                                    </Form.Select>
                                </Col>
                                <Col md={2}>
                                    <Form.Select
                                        value={selectedDifficulty}
                                        onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setSelectedDifficulty(e.target.value as any)}
                                    >
                                        <option value="">Todas las dificultades</option>
                                        {DIFFICULTY_LEVELS.map(level => (
                                            <option key={level.value} value={level.value}>
                                                {level.icon} {level.label}
                                            </option>
                                        ))}
                                    </Form.Select>
                                </Col>
                                <Col md={2}>
                                    <div className="d-flex flex-column">
                                        <Form.Check
                                            type="checkbox"
                                            label="Solo públicas"
                                            checked={showPublicOnly}
                                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                                setShowPublicOnly(e.target.checked);
                                                if (e.target.checked) setShowMyTemplatesOnly(false);
                                            }}
                                        />
                                        <Form.Check
                                            type="checkbox"
                                            label="Solo mis plantillas"
                                            checked={showMyTemplatesOnly}
                                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                                setShowMyTemplatesOnly(e.target.checked);
                                                if (e.target.checked) setShowPublicOnly(false);
                                            }}
                                        />
                                    </div>
                                </Col>
                                <Col md={2}>
                                    <Button variant="outline-secondary" size="sm" onClick={clearFilters}>
                                        <Filter size={14} className="me-1" />
                                        Limpiar
                                    </Button>
                                </Col>
                            </Row>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            {/* Estadísticas */}
            <Row className="mb-3">
                <Col>
                    <div className="d-flex justify-content-between align-items-center">
                        <span className="text-muted">
                            Mostrando {filteredTemplates.length} de {totalTemplates} plantillas
                        </span>
                        <span className="text-muted">
                            Página {currentPage} de {totalPages}
                        </span>
                    </div>
                </Col>
            </Row>

            {/* Error */}
            {error && (
                <Row className="mb-3">
                    <Col>
                        <Alert variant="danger" dismissible onClose={() => setError(null)}>
                            {error}
                        </Alert>
                    </Col>
                </Row>
            )}

            {/* Loading */}
            {loading && (
                <Row className="mb-3">
                    <Col className="text-center">
                        <Spinner animation="border" role="status">
                            <span className="visually-hidden">Cargando...</span>
                        </Spinner>
                    </Col>
                </Row>
            )}

            {/* Plantillas */}
            <Row>
                {!loading && filteredTemplates.length === 0 ? (
                    <Col>
                        <Card className="text-center py-5">
                            <Card.Body>
                                <h5>No se encontraron plantillas</h5>
                                <p className="text-muted">
                                    {searchTerm || selectedCategory || selectedDifficulty 
                                        ? 'Prueba ajustando los filtros de búsqueda'
                                        : 'Aún no hay plantillas disponibles. ¡Crea tu primera plantilla!'
                                    }
                                </p>
                                {showActions && onCreateTemplate && !selectMode && (
                                    <Button variant="primary" onClick={onCreateTemplate}>
                                        <Plus size={16} className="me-1" />
                                        Crear Primera Plantilla
                                    </Button>
                                )}
                            </Card.Body>
                        </Card>
                    </Col>
                ) : (
                    filteredTemplates.map(renderTemplateCard)
                )}
            </Row>

            {/* Paginación */}
            {totalPages > 1 && (
                <Row className="mt-4">
                    <Col className="d-flex justify-content-center">
                        <nav>
                            <ul className="pagination">
                                <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                                    <button 
                                        className="page-link"
                                        onClick={() => setCurrentPage(currentPage - 1)}
                                        disabled={currentPage === 1}
                                    >
                                        Anterior
                                    </button>
                                </li>
                                
                                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                    const page = i + 1;
                                    return (
                                        <li key={page} className={`page-item ${currentPage === page ? 'active' : ''}`}>
                                            <button 
                                                className="page-link"
                                                onClick={() => setCurrentPage(page)}
                                            >
                                                {page}
                                            </button>
                                        </li>
                                    );
                                })}
                                
                                <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                                    <button 
                                        className="page-link"
                                        onClick={() => setCurrentPage(currentPage + 1)}
                                        disabled={currentPage === totalPages}
                                    >
                                        Siguiente
                                    </button>
                                </li>
                            </ul>
                        </nav>
                    </Col>
                </Row>
            )}

            {/* Modal de confirmación de eliminación */}
            <Modal show={showDeleteConfirm} onHide={() => setShowDeleteConfirm(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Confirmar Eliminación</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <p>¿Estás seguro de que deseas eliminar la plantilla <strong>"{templateToDelete?.name}"</strong>?</p>
                    <p className="text-danger">Esta acción no se puede deshacer.</p>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowDeleteConfirm(false)}>
                        Cancelar
                    </Button>
                    <Button variant="danger" onClick={confirmDeleteTemplate}>
                        <Trash2 size={16} className="me-1" />
                        Eliminar
                    </Button>
                </Modal.Footer>
            </Modal>
        </Container>
    );
};

export default TemplateLibrary; 