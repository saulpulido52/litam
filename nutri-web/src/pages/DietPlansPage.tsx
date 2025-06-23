import React, { useState, useEffect } from 'react';
import { FileText, Plus, Search, Sparkles, User, Calendar, Clock, Target, Edit, Trash2, Eye, Download, Copy } from 'lucide-react';

interface DietPlan {
  id: number;
  name: string;
  patient_name: string;
  patient_id: number;
  description: string;
  duration_weeks: number;
  calories_per_day: number;
  protein_grams: number;
  carbs_grams: number;
  fat_grams: number;
  created_date: string;
  status: 'active' | 'completed' | 'draft' | 'paused';
  meals_per_day: number;
  objectives: string[];
  restrictions: string[];
  notes: string;
}

interface Recipe {
  id: number;
  name: string;
  category: string;
  prep_time: number;
  cook_time: number;
  servings: number;
  calories_per_serving: number;
  ingredients: string[];
  instructions: string[];
  tags: string[];
}

const DietPlansPage: React.FC = () => {
  const [dietPlans, setDietPlans] = useState<DietPlan[]>([]);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [activeTab, setActiveTab] = useState<'plans' | 'recipes' | 'templates'>('plans');
  const [showPlanModal, setShowPlanModal] = useState(false);
  const [showRecipeModal, setShowRecipeModal] = useState(false);
  // TODO: Implementar modal de recetas
  console.log(showRecipeModal); // Para evitar el warning de variable no usada
  const [selectedPlan, setSelectedPlan] = useState<DietPlan | null>(null);
  const [showPlanDetail, setShowPlanDetail] = useState(false);

  // Datos de ejemplo para planes de dieta
  useEffect(() => {
    const mockPlans: DietPlan[] = [
      {
        id: 1,
        name: 'Plan de Pérdida de Peso - María',
        patient_name: 'María González',
        patient_id: 1,
        description: 'Plan hipocalórico para pérdida gradual de peso',
        duration_weeks: 12,
        calories_per_day: 1400,
        protein_grams: 105,
        carbs_grams: 140,
        fat_grams: 47,
        created_date: '2024-12-01',
        status: 'active',
        meals_per_day: 5,
        objectives: ['Pérdida de peso', 'Mejorar energía'],
        restrictions: ['Frutos secos'],
        notes: 'Paciente con hipotiroidismo, ajustar macros según evolución'
      },
      {
        id: 2,
        name: 'Plan Deportivo - Carlos',
        patient_name: 'Carlos Ruiz',
        patient_id: 2,
        description: 'Plan alto en proteínas para ganar masa muscular',
        duration_weeks: 16,
        calories_per_day: 2200,
        protein_grams: 165,
        carbs_grams: 220,
        fat_grams: 73,
        created_date: '2024-11-15',
        status: 'active',
        meals_per_day: 6,
        objectives: ['Ganar masa muscular', 'Mejorar rendimiento'],
        restrictions: [],
        notes: 'Entrenamientos de alta intensidad 5 días por semana'
      },
      {
        id: 3,
        name: 'Plan Mantenimiento - Ana',
        patient_name: 'Ana López',
        patient_id: 3,
        description: 'Plan equilibrado para mantenimiento de peso',
        duration_weeks: 8,
        calories_per_day: 1800,
        protein_grams: 110,
        carbs_grams: 180,
        fat_grams: 60,
        created_date: '2024-12-10',
        status: 'draft',
        meals_per_day: 4,
        objectives: ['Mantener peso', 'Alimentación saludable'],
        restrictions: ['Lactosa', 'Gluten'],
        notes: 'Dieta sin gluten y sin lactosa'
      }
    ];

    const mockRecipes: Recipe[] = [
      {
        id: 1,
        name: 'Ensalada de Quinoa y Vegetales',
        category: 'Almuerzo',
        prep_time: 15,
        cook_time: 20,
        servings: 2,
        calories_per_serving: 320,
        ingredients: ['1 taza quinoa', '1 pepino', '2 tomates', '1/2 cebolla morada', 'Aceite de oliva', 'Limón'],
        instructions: ['Cocinar quinoa según instrucciones', 'Picar todos los vegetales', 'Mezclar con aceite y limón'],
        tags: ['Vegetariano', 'Sin gluten', 'Rico en proteínas']
      },
      {
        id: 2,
        name: 'Salmón a la Plancha con Brócoli',
        category: 'Cena',
        prep_time: 10,
        cook_time: 15,
        servings: 1,
        calories_per_serving: 380,
        ingredients: ['150g salmón', '200g brócoli', 'Aceite de oliva', 'Limón', 'Sal y pimienta'],
        instructions: ['Cocinar salmón a la plancha', 'Hervir brócoli al vapor', 'Servir con limón'],
        tags: ['Rico en omega-3', 'Bajo en carbohidratos', 'Alto en proteínas']
      }
    ];

    setDietPlans(mockPlans);
    setRecipes(mockRecipes);
  }, []);

  const filteredPlans = dietPlans.filter(plan => {
    const matchesSearch = plan.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         plan.patient_name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || plan.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const filteredRecipes = recipes.filter(recipe => 
    recipe.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    recipe.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      active: { class: 'bg-success text-white', text: 'Activo' },
      completed: { class: 'bg-primary text-white', text: 'Completado' },
      draft: { class: 'bg-secondary text-white', text: 'Borrador' },
      paused: { class: 'bg-warning text-dark', text: 'Pausado' }
    };
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.active;
    return <span className={`badge ${config.class}`}>{config.text}</span>;
  };

  const activePlans = dietPlans.filter(p => p.status === 'active').length;
  const completedPlans = dietPlans.filter(p => p.status === 'completed').length;

  return (
    <div className="container-fluid py-4">
      {/* Header */}
      <div className="row mb-4">
        <div className="col-md-8">
          <h1 className="h2 mb-1">Planes Nutricionales</h1>
          <p className="text-muted">Crea y gestiona planes de alimentación personalizados</p>
        </div>
        <div className="col-md-4 text-end">
          <div className="btn-group me-2">
            <button 
              className="btn btn-outline-primary"
              onClick={() => setShowRecipeModal(true)}
            >
              <Plus size={18} className="me-2" />
              Nueva Receta
            </button>
            <button 
              className="btn btn-success"
              onClick={() => setShowPlanModal(true)}
            >
              <Sparkles size={18} className="me-2" />
              Generar Plan IA
            </button>
          </div>
          <button 
            className="btn btn-primary"
            onClick={() => setShowPlanModal(true)}
          >
            <Plus size={18} className="me-2" />
            Nuevo Plan
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="row mb-4">
        <div className="col-md-3">
          <div className="card border-0 shadow-sm">
            <div className="card-body">
              <div className="d-flex align-items-center">
                <div className="bg-primary bg-opacity-10 rounded-3 p-3 me-3">
                  <FileText className="text-primary" size={24} />
                </div>
                <div>
                  <h5 className="mb-0">{dietPlans.length}</h5>
                  <small className="text-muted">Total planes</small>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card border-0 shadow-sm">
            <div className="card-body">
              <div className="d-flex align-items-center">
                <div className="bg-success bg-opacity-10 rounded-3 p-3 me-3">
                  <Target className="text-success" size={24} />
                </div>
                <div>
                  <h5 className="mb-0">{activePlans}</h5>
                  <small className="text-muted">Planes activos</small>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card border-0 shadow-sm">
            <div className="card-body">
              <div className="d-flex align-items-center">
                <div className="bg-info bg-opacity-10 rounded-3 p-3 me-3">
                  <Calendar className="text-info" size={24} />
                </div>
                <div>
                  <h5 className="mb-0">{completedPlans}</h5>
                  <small className="text-muted">Completados</small>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card border-0 shadow-sm">
            <div className="card-body">
              <div className="d-flex align-items-center">
                <div className="bg-warning bg-opacity-10 rounded-3 p-3 me-3">
                  <Clock className="text-warning" size={24} />
                </div>
                <div>
                  <h5 className="mb-0">{recipes.length}</h5>
                  <small className="text-muted">Recetas disponibles</small>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <ul className="nav nav-tabs mb-4">
        <li className="nav-item">
          <button 
            className={`nav-link ${activeTab === 'plans' ? 'active' : ''}`}
            onClick={() => setActiveTab('plans')}
          >
            <FileText size={18} className="me-2" />
            Planes de Dieta
          </button>
        </li>
        <li className="nav-item">
          <button 
            className={`nav-link ${activeTab === 'recipes' ? 'active' : ''}`}
            onClick={() => setActiveTab('recipes')}
          >
            <Target size={18} className="me-2" />
            Recetas
          </button>
        </li>
        <li className="nav-item">
          <button 
            className={`nav-link ${activeTab === 'templates' ? 'active' : ''}`}
            onClick={() => setActiveTab('templates')}
          >
            <Copy size={18} className="me-2" />
            Plantillas
          </button>
        </li>
      </ul>

      {/* Search and Filters */}
      <div className="row mb-4">
        <div className="col-md-8">
          <div className="input-group">
            <span className="input-group-text">
              <Search size={18} />
            </span>
            <input
              type="text"
              className="form-control"
              placeholder={activeTab === 'plans' ? "Buscar planes por nombre o paciente..." : "Buscar recetas..."}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        {activeTab === 'plans' && (
          <div className="col-md-4">
            <select 
              className="form-select"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">Todos los estados</option>
              <option value="active">Activos</option>
              <option value="completed">Completados</option>
              <option value="draft">Borradores</option>
              <option value="paused">Pausados</option>
            </select>
          </div>
        )}
      </div>

      {/* Content based on active tab */}
      {activeTab === 'plans' && (
        <div className="card border-0 shadow-sm">
          <div className="card-header bg-white">
            <h5 className="card-title mb-0">Planes de Dieta</h5>
          </div>
          <div className="card-body p-0">
            {filteredPlans.length === 0 ? (
              <div className="text-center py-5">
                <FileText size={48} className="text-muted mb-3" />
                <h5 className="text-muted">No se encontraron planes</h5>
                <p className="text-muted">Crea tu primer plan nutricional</p>
              </div>
            ) : (
              <div className="table-responsive">
                <table className="table table-hover mb-0">
                  <thead className="table-light">
                    <tr>
                      <th>Plan</th>
                      <th>Paciente</th>
                      <th>Duración</th>
                      <th>Calorías/día</th>
                      <th>Macros (P/C/G)</th>
                      <th>Estado</th>
                      <th>Creado</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredPlans.map((plan) => (
                      <tr key={plan.id}>
                        <td>
                          <div>
                            <div className="fw-medium">{plan.name}</div>
                            <small className="text-muted">{plan.description}</small>
                          </div>
                        </td>
                        <td>
                          <div className="d-flex align-items-center">
                            <div className="bg-primary bg-opacity-10 rounded-circle p-2 me-2">
                              <User size={14} className="text-primary" />
                            </div>
                            <span>{plan.patient_name}</span>
                          </div>
                        </td>
                        <td>
                          <span className="fw-medium">{plan.duration_weeks}</span>
                          <small className="text-muted d-block">semanas</small>
                        </td>
                        <td>
                          <span className="fw-medium text-success">{plan.calories_per_day}</span>
                          <small className="text-muted d-block">kcal/día</small>
                        </td>
                        <td>
                          <div className="small">
                            <span className="badge bg-primary me-1">{plan.protein_grams}g P</span>
                            <span className="badge bg-warning me-1">{plan.carbs_grams}g C</span>
                            <span className="badge bg-info">{plan.fat_grams}g G</span>
                          </div>
                        </td>
                        <td>{getStatusBadge(plan.status)}</td>
                        <td>
                          <div className="fw-medium">{new Date(plan.created_date).toLocaleDateString('es-ES')}</div>
                        </td>
                        <td>
                          <div className="btn-group btn-group-sm">
                            <button 
                              className="btn btn-outline-info"
                              onClick={() => {
                                setSelectedPlan(plan);
                                setShowPlanDetail(true);
                              }}
                            >
                              <Eye size={14} />
                            </button>
                            <button className="btn btn-outline-primary">
                              <Edit size={14} />
                            </button>
                            <button className="btn btn-outline-success">
                              <Download size={14} />
                            </button>
                            <button className="btn btn-outline-danger">
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'recipes' && (
        <div className="row">
          {filteredRecipes.map((recipe) => (
            <div key={recipe.id} className="col-md-4 mb-4">
              <div className="card border-0 shadow-sm">
                <div className="card-body">
                  <h5 className="card-title">{recipe.name}</h5>
                  <p className="card-text text-muted">{recipe.category}</p>
                  <div className="row text-center mb-3">
                    <div className="col-4">
                      <small className="text-muted">Prep</small>
                      <div className="fw-medium">{recipe.prep_time}min</div>
                    </div>
                    <div className="col-4">
                      <small className="text-muted">Cocción</small>
                      <div className="fw-medium">{recipe.cook_time}min</div>
                    </div>
                    <div className="col-4">
                      <small className="text-muted">Calorías</small>
                      <div className="fw-medium">{recipe.calories_per_serving}</div>
                    </div>
                  </div>
                  <div className="mb-3">
                    {recipe.tags.map((tag, index) => (
                      <span key={index} className="badge bg-light text-dark me-1">
                        {tag}
                      </span>
                    ))}
                  </div>
                  <div className="btn-group w-100">
                    <button className="btn btn-outline-primary btn-sm">
                      <Eye size={14} className="me-1" />
                      Ver
                    </button>
                    <button className="btn btn-outline-success btn-sm">
                      <Copy size={14} className="me-1" />
                      Usar
                    </button>
                    <button className="btn btn-outline-secondary btn-sm">
                      <Edit size={14} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'templates' && (
        <div className="text-center py-5">
          <Copy size={48} className="text-muted mb-3" />
          <h5 className="text-muted">Plantillas de Planes</h5>
          <p className="text-muted">Próximamente: plantillas predefinidas para diferentes objetivos</p>
        </div>
      )}

      {/* Modal for New Plan */}
      {showPlanModal && (
        <div className="modal fade show d-block" tabIndex={-1} style={{backgroundColor: 'rgba(0,0,0,0.5)'}}>
          <div className="modal-dialog modal-xl">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Nuevo Plan Nutricional</h5>
                <button type="button" className="btn-close" onClick={() => setShowPlanModal(false)}></button>
              </div>
              <div className="modal-body">
                <form>
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Paciente</label>
                      <select className="form-select">
                        <option>Seleccionar paciente...</option>
                        <option>María González</option>
                        <option>Carlos Ruiz</option>
                        <option>Ana López</option>
                      </select>
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Nombre del plan</label>
                      <input type="text" className="form-control" placeholder="Ej: Plan de pérdida de peso" />
                    </div>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Descripción</label>
                    <textarea className="form-control" rows={2} placeholder="Describe el objetivo del plan..."></textarea>
                  </div>
                  <div className="row">
                    <div className="col-md-3 mb-3">
                      <label className="form-label">Duración (semanas)</label>
                      <input type="number" className="form-control" placeholder="12" />
                    </div>
                    <div className="col-md-3 mb-3">
                      <label className="form-label">Calorías por día</label>
                      <input type="number" className="form-control" placeholder="1500" />
                    </div>
                    <div className="col-md-3 mb-3">
                      <label className="form-label">Comidas por día</label>
                      <select className="form-select">
                        <option>3 comidas</option>
                        <option>4 comidas</option>
                        <option>5 comidas</option>
                        <option>6 comidas</option>
                      </select>
                    </div>
                    <div className="col-md-3 mb-3">
                      <label className="form-label">Estado</label>
                      <select className="form-select">
                        <option>Borrador</option>
                        <option>Activo</option>
                      </select>
                    </div>
                  </div>
                  <div className="row">
                    <div className="col-md-4 mb-3">
                      <label className="form-label">Proteínas (g)</label>
                      <input type="number" className="form-control" placeholder="120" />
                    </div>
                    <div className="col-md-4 mb-3">
                      <label className="form-label">Carbohidratos (g)</label>
                      <input type="number" className="form-control" placeholder="150" />
                    </div>
                    <div className="col-md-4 mb-3">
                      <label className="form-label">Grasas (g)</label>
                      <input type="number" className="form-control" placeholder="50" />
                    </div>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Restricciones alimentarias</label>
                    <textarea className="form-control" rows={2} placeholder="Alergias, intolerancias, preferencias..."></textarea>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Notas adicionales</label>
                    <textarea className="form-control" rows={3} placeholder="Información adicional sobre el plan..."></textarea>
                  </div>
                </form>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowPlanModal(false)}>
                  Cancelar
                </button>
                <button type="button" className="btn btn-outline-success me-2">
                  <Sparkles size={16} className="me-1" />
                  Generar con IA
                </button>
                <button type="button" className="btn btn-primary">
                  Crear Plan
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal for Plan Detail */}
      {showPlanDetail && selectedPlan && (
        <div className="modal fade show d-block" tabIndex={-1} style={{backgroundColor: 'rgba(0,0,0,0.5)'}}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Detalle del Plan</h5>
                <button type="button" className="btn-close" onClick={() => setShowPlanDetail(false)}></button>
              </div>
              <div className="modal-body">
                <div className="row">
                  <div className="col-md-8">
                    <h4>{selectedPlan.name}</h4>
                    <p className="text-muted">{selectedPlan.description}</p>
                    <div className="mb-3">
                      <strong>Paciente:</strong> {selectedPlan.patient_name}
                    </div>
                    <div className="mb-3">
                      <strong>Objetivos:</strong>
                      <br />
                      {selectedPlan.objectives.map((obj, index) => (
                        <span key={index} className="badge bg-primary me-1">{obj}</span>
                      ))}
                    </div>
                    {selectedPlan.restrictions.length > 0 && (
                      <div className="mb-3">
                        <strong>Restricciones:</strong>
                        <br />
                        {selectedPlan.restrictions.map((restriction, index) => (
                          <span key={index} className="badge bg-danger me-1">{restriction}</span>
                        ))}
                      </div>
                    )}
                    <div className="mb-3">
                      <strong>Notas:</strong>
                      <p className="text-muted">{selectedPlan.notes}</p>
                    </div>
                  </div>
                  <div className="col-md-4">
                    <div className="card">
                      <div className="card-body">
                        <h6 className="card-title">Información Nutricional</h6>
                        <div className="mb-2">
                          <strong>Calorías diarias:</strong>
                          <span className="float-end">{selectedPlan.calories_per_day} kcal</span>
                        </div>
                        <div className="mb-2">
                          <strong>Proteínas:</strong>
                          <span className="float-end">{selectedPlan.protein_grams}g</span>
                        </div>
                        <div className="mb-2">
                          <strong>Carbohidratos:</strong>
                          <span className="float-end">{selectedPlan.carbs_grams}g</span>
                        </div>
                        <div className="mb-2">
                          <strong>Grasas:</strong>
                          <span className="float-end">{selectedPlan.fat_grams}g</span>
                        </div>
                        <hr />
                        <div className="mb-2">
                          <strong>Duración:</strong>
                          <span className="float-end">{selectedPlan.duration_weeks} semanas</span>
                        </div>
                        <div className="mb-2">
                          <strong>Comidas/día:</strong>
                          <span className="float-end">{selectedPlan.meals_per_day}</span>
                        </div>
                        <div className="mb-2">
                          <strong>Estado:</strong>
                          <span className="float-end">{getStatusBadge(selectedPlan.status)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowPlanDetail(false)}>
                  Cerrar
                </button>
                <button type="button" className="btn btn-outline-success">
                  <Download size={16} className="me-1" />
                  Descargar PDF
                </button>
                <button type="button" className="btn btn-primary">
                  <Edit size={16} className="me-1" />
                  Editar Plan
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal for Plan Details */}
      {showPlanDetail && selectedPlan && (
        <div className="modal fade show d-block" tabIndex={-1} style={{backgroundColor: 'rgba(0,0,0,0.5)'}}>
          <div className="modal-dialog modal-xl">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Detalles del Plan - {selectedPlan.name}</h5>
                <button type="button" className="btn-close" onClick={() => setShowPlanDetail(false)}></button>
              </div>
              <div className="modal-body">
                <div className="row">
                  <div className="col-md-8">
                    <div className="card mb-4">
                      <div className="card-header">
                        <h6 className="mb-0">Información General</h6>
                      </div>
                      <div className="card-body">
                        <div className="row">
                          <div className="col-6 mb-3">
                            <strong>Paciente:</strong>
                            <br />
                            <span className="text-muted">{selectedPlan.patient_name}</span>
                          </div>
                          <div className="col-6 mb-3">
                            <strong>Duración:</strong>
                            <br />
                            <span className="text-muted">{selectedPlan.duration_weeks} semanas</span>
                          </div>
                          <div className="col-6 mb-3">
                            <strong>Comidas/día:</strong>
                            <br />
                            <span className="text-muted">{selectedPlan.meals_per_day}</span>
                          </div>
                          <div className="col-6 mb-3">
                            <strong>Estado:</strong>
                            <br />
                            {getStatusBadge(selectedPlan.status)}
                          </div>
                        </div>
                        <div className="mb-3">
                          <strong>Descripción:</strong>
                          <p className="text-muted mt-1">{selectedPlan.description}</p>
                        </div>
                        <div className="mb-3">
                          <strong>Objetivos:</strong>
                          <br />
                          {selectedPlan.objectives.map((objective, index) => (
                            <span key={index} className="badge bg-primary me-1">
                              {objective}
                            </span>
                          ))}
                        </div>
                        {selectedPlan.restrictions.length > 0 && (
                          <div className="mb-3">
                            <strong>Restricciones:</strong>
                            <br />
                            {selectedPlan.restrictions.map((restriction, index) => (
                              <span key={index} className="badge bg-warning text-dark me-1">
                                {restriction}
                              </span>
                            ))}
                          </div>
                        )}
                        {selectedPlan.notes && (
                          <div className="mb-3">
                            <strong>Notas:</strong>
                            <p className="text-muted mt-1">{selectedPlan.notes}</p>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="card">
                      <div className="card-header">
                        <h6 className="mb-0">Plan Semanal de Comidas</h6>
                      </div>
                      <div className="card-body">
                        <div className="table-responsive">
                          <table className="table table-sm">
                            <thead>
                              <tr>
                                <th>Día</th>
                                <th>Desayuno</th>
                                <th>Media Mañana</th>
                                <th>Almuerzo</th>
                                <th>Merienda</th>
                                <th>Cena</th>
                              </tr>
                            </thead>
                            <tbody>
                              <tr>
                                <td><strong>Lunes</strong></td>
                                <td>Avena con frutas</td>
                                <td>Yogur griego</td>
                                <td>Ensalada de quinoa</td>
                                <td>Frutos secos</td>
                                <td>Salmón con brócoli</td>
                              </tr>
                              <tr>
                                <td><strong>Martes</strong></td>
                                <td>Tostadas integrales</td>
                                <td>Batido de proteínas</td>
                                <td>Pollo a la plancha</td>
                                <td>Manzana</td>
                                <td>Pescado al vapor</td>
                              </tr>
                              <tr>
                                <td><strong>Miércoles</strong></td>
                                <td>Huevos revueltos</td>
                                <td>Yogur con nueces</td>
                                <td>Lentejas estofadas</td>
                                <td>Plátano</td>
                                <td>Pechuga de pollo</td>
                              </tr>
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="col-md-4">
                    <div className="card mb-4">
                      <div className="card-header">
                        <h6 className="mb-0">Información Nutricional</h6>
                      </div>
                      <div className="card-body">
                        <div className="text-center mb-3">
                          <h4 className="text-success">{selectedPlan.calories_per_day}</h4>
                          <small className="text-muted">Calorías por día</small>
                        </div>
                        
                        <div className="mb-3">
                          <div className="d-flex justify-content-between">
                            <span>Proteínas</span>
                            <strong className="text-primary">{selectedPlan.protein_grams}g</strong>
                          </div>
                          <div className="progress mt-1">
                            <div className="progress-bar bg-primary" style={{width: '30%'}}></div>
                          </div>
                          <small className="text-muted">{Math.round((selectedPlan.protein_grams * 4 / selectedPlan.calories_per_day) * 100)}% del total</small>
                        </div>

                        <div className="mb-3">
                          <div className="d-flex justify-content-between">
                            <span>Carbohidratos</span>
                            <strong className="text-warning">{selectedPlan.carbs_grams}g</strong>
                          </div>
                          <div className="progress mt-1">
                            <div className="progress-bar bg-warning" style={{width: '45%'}}></div>
                          </div>
                          <small className="text-muted">{Math.round((selectedPlan.carbs_grams * 4 / selectedPlan.calories_per_day) * 100)}% del total</small>
                        </div>

                        <div className="mb-3">
                          <div className="d-flex justify-content-between">
                            <span>Grasas</span>
                            <strong className="text-info">{selectedPlan.fat_grams}g</strong>
                          </div>
                          <div className="progress mt-1">
                            <div className="progress-bar bg-info" style={{width: '25%'}}></div>
                          </div>
                          <small className="text-muted">{Math.round((selectedPlan.fat_grams * 9 / selectedPlan.calories_per_day) * 100)}% del total</small>
                        </div>
                      </div>
                    </div>

                    <div className="card">
                      <div className="card-header">
                        <h6 className="mb-0">Acciones Rápidas</h6>
                      </div>
                      <div className="card-body">
                        <div className="d-grid gap-2">
                          <button className="btn btn-primary btn-sm">
                            <Edit size={16} className="me-2" />
                            Editar Plan
                          </button>
                          <button className="btn btn-success btn-sm">
                            <Download size={16} className="me-2" />
                            Descargar PDF
                          </button>
                          <button className="btn btn-info btn-sm">
                            <Copy size={16} className="me-2" />
                            Duplicar Plan
                          </button>
                          <button className="btn btn-warning btn-sm">
                            <Target size={16} className="me-2" />
                            Enviar a Paciente
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowPlanDetail(false)}>
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DietPlansPage; 