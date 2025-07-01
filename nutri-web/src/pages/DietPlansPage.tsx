import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  Clock, 
  Target, 
  Users, 
  FileText, 
  Download, 
  Edit, 
  Trash2, 
  Plus, 
  Search, 
  Filter,
  Eye,
  Settings,
  Shield,
  AlertTriangle,
  Database,
  CheckCircle,
  Sparkles,
  X,
  Copy,
  RefreshCw
} from 'lucide-react';
import type { DietPlan, CreateDietPlanDto, GenerateAIDietDto, PlanType, PlanPeriod } from '../types/diet';
import { useDietPlans } from '../hooks/useDietPlans';
import { usePatients } from '../hooks/usePatients';
import { useClinicalRecords } from '../hooks/useClinicalRecords';
import { Button, Modal, Alert } from 'react-bootstrap';
import DietPlanViewer from '../components/DietPlanViewer';
import DietPlanQuickCreate from '../components/DietPlanQuickCreate';
import NutritionalCardSimple from '../components/NutritionalCardSimple';

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

// Tarjetas Nutricionales implementadas y funcionales
// Uso temporal de DietPlanQuickCreate como interfaz mientras se integran completamente

const DietPlansPage: React.FC = () => {
  const {
    dietPlans,
    loading,
    error,
    stats,
    fetchAllDietPlans,
    createDietPlan,
    generateDietPlanWithAI,
    updateDietPlan,
    deleteDietPlan,
    clearError,
    setError
  } = useDietPlans();
  
  const { patients } = usePatients();
  const { records: clinicalRecords, loadPatientRecords } = useClinicalRecords();
  
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [planTypeFilter, setPlanTypeFilter] = useState<string>('all');
  const [activeTab, setActiveTab] = useState<'plans' | 'recipes' | 'templates'>('plans');
  const [showPlanModal, setShowPlanModal] = useState(false);
  const [showAIModal, setShowAIModal] = useState(false);
  const [showPlanDetail, setShowPlanDetail] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<DietPlan | null>(null);
  const [editingPlan, setEditingPlan] = useState<DietPlan | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  // Load all diet plans and clinical records for the nutritionist on mount
  useEffect(() => {
    fetchAllDietPlans();
    loadAllClinicalRecords();
  }, [fetchAllDietPlans]);

  // Load clinical records for all patients
  const loadAllClinicalRecords = async () => {
    try {
      // Cargar expedientes para todos los pacientes
      for (const patient of patients) {
        await loadPatientRecords(patient.id);
      }
    } catch (error) {
      console.error('Error loading clinical records:', error);
    }
  };

  // Mock recipes data
  useEffect(() => {
    setRecipes([
      {
        id: 1,
        name: 'Ensalada de Quinoa y Aguacate',
        category: 'Ensalada',
        prep_time: 15,
        cook_time: 20,
        servings: 4,
        calories_per_serving: 320,
        ingredients: ['Quinoa', 'Aguacate', 'Tomate', 'Pepino', 'Limón', 'Aceite de oliva'],
        instructions: ['Cocinar quinoa', 'Cortar vegetales', 'Mezclar ingredientes'],
        tags: ['vegetariano', 'sin gluten', 'alto en proteína']
      },
      {
        id: 2,
        name: 'Salmón al Horno con Verduras',
        category: 'Plato Principal',
        prep_time: 10,
        cook_time: 25,
        servings: 2,
        calories_per_serving: 450,
        ingredients: ['Salmón', 'Brócoli', 'Zanahoria', 'Limón', 'Hierbas'],
        instructions: ['Precalentar horno', 'Preparar salmón', 'Cocinar verduras'],
        tags: ['pescado', 'omega-3', 'bajo en carbohidratos']
      }
    ]);
  }, []);

  const safeDietPlans = Array.isArray(dietPlans) ? dietPlans : [];

  const filteredPlans = safeDietPlans.filter(plan => {
    const searchTermLower = searchTerm.toLowerCase();
    
    // Defensas robustas para evitar errores de toLowerCase() sobre undefined
    const planName = (plan.name ?? '').toLowerCase();
    const patientFirstName = (plan.patient?.first_name ?? '').toLowerCase();
    const patientLastName = (plan.patient?.last_name ?? '').toLowerCase();
    const planDescription = (plan.description ?? '').toLowerCase();
    
    const matchesSearch = planName.includes(searchTermLower) ||
                         patientFirstName.includes(searchTermLower) ||
                         patientLastName.includes(searchTermLower) ||
                         planDescription.includes(searchTermLower);
    
    const matchesStatus = statusFilter === 'all' || plan.status === statusFilter;
    const matchesType = planTypeFilter === 'all' || plan.plan_type === planTypeFilter;
    return matchesSearch && matchesStatus && matchesType;
  });

  const filteredRecipes = recipes.filter(recipe => {
    const searchTermLower = searchTerm.toLowerCase();
    const recipeName = (recipe.name ?? '').toLowerCase();
    const recipeCategory = (recipe.category ?? '').toLowerCase();
    
    return recipeName.includes(searchTermLower) ||
           recipeCategory.includes(searchTermLower);
  });

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      draft: { class: 'bg-secondary text-white', text: 'Borrador', icon: '📝' },
      pending_review: { class: 'bg-warning text-dark', text: 'En Revisión', icon: '⏳' },
      active: { class: 'bg-success text-white', text: 'Activo', icon: '✅' },
      archived: { class: 'bg-dark text-white', text: 'Archivado', icon: '📁' },
      // Estados legacy para compatibilidad
      completed: { class: 'bg-primary text-white', text: 'Completado', icon: '🏁' },
      cancelled: { class: 'bg-danger text-white', text: 'Cancelado', icon: '❌' }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.draft;
    return (
      <span className={`badge ${config.class}`} title={`Estado: ${config.text}`}>
        <span className="me-1">{config.icon}</span>
        {config.text}
      </span>
    );
  };

  const getPlanTypeBadge = (planType?: PlanType) => {
    const typeConfig = {
      daily: { class: 'bg-primary', text: 'Diario' },
      weekly: { class: 'bg-success', text: 'Semanal' },
      monthly: { class: 'bg-info', text: 'Mensual' },
      custom: { class: 'bg-warning', text: 'Personalizado' },
      flexible: { class: 'bg-purple', text: 'Flexible' }
    };
    
    const config = typeConfig[planType || 'weekly'] || typeConfig.weekly;
    return <span className={`badge ${config.class}`}>{config.text}</span>;
  };

  const calculatePlanDuration = (startDate?: string, endDate?: string) => {
    if (!startDate || !endDate) return 'N/A';
    try {
      const start = new Date(startDate);
      const end = new Date(endDate);
      const diffTime = Math.abs(end.getTime() - start.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      const weeks = Math.ceil(diffDays / 7);
      return `${weeks} semana${weeks !== 1 ? 's' : ''}`;
    } catch (error) {
      return 'N/A';
    }
  };

  const formatCalories = (calories?: number) => {
    if (!calories || calories === 0) return 'N/A';
    return `${calories} kcal`;
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('es-ES');
    } catch (error) {
      return 'N/A';
    }
  };

  const getPatientName = (plan: DietPlan) => {
    if (plan.patient?.first_name && plan.patient?.last_name) {
      return `${plan.patient.first_name} ${plan.patient.last_name}`;
    }
    return plan.patient?.first_name || 'Paciente';
  };

  const transformDietPlanToFormData = (plan: DietPlan): CreateDietPlanDto => {
    return {
      patientId: plan.patient_id,
      name: plan.name,
      description: plan.description || '',
      startDate: plan.start_date || '',
      endDate: plan.end_date || '',
      dailyCaloriesTarget: plan.target_calories || 0,
      dailyMacrosTarget: {
        protein: plan.target_protein || 0,
        carbohydrates: plan.target_carbs || 0,
        fats: plan.target_fats || 0
      },
      notes: plan.notes || '',
      planType: plan.plan_type || 'weekly',
      planPeriod: plan.plan_period || 'weeks',
      totalPeriods: plan.total_periods || plan.total_weeks || 1,
      isWeeklyPlan: plan.is_weekly_plan || true,
      totalWeeks: plan.total_weeks || 1,
      weeklyPlans: plan.weekly_plans?.map(wp => ({
        weekNumber: wp.week_number,
        startDate: wp.start_date,
        endDate: wp.end_date,
        dailyCaloriesTarget: wp.daily_calories_target,
        dailyMacrosTarget: wp.daily_macros_target,
        meals: wp.meals.map(m => ({
          day: m.day,
          mealType: m.meal_type,
          foods: m.foods.map(f => ({
            foodId: f.food_id,
            foodName: f.food_name,
            quantityGrams: f.quantity_grams,
            calories: f.calories,
            protein: f.protein,
            carbs: f.carbs,
            fats: f.fats
          })),
          notes: m.notes
        })),
        notes: wp.notes
      })) || [],
      periodPlans: plan.period_plans?.map(pp => ({
        periodNumber: pp.period_number,
        startDate: pp.start_date,
        endDate: pp.end_date,
        dailyCaloriesTarget: pp.daily_calories_target,
        dailyMacrosTarget: pp.daily_macros_target,
        meals: pp.meals.map(m => ({
          day: m.day,
          dayNumber: m.day_number,
          mealType: m.meal_type,
          foods: m.foods.map(f => ({
            foodId: f.food_id,
            foodName: f.food_name,
            quantityGrams: f.quantity_grams,
            calories: f.calories,
            protein: f.protein,
            carbs: f.carbs,
            fats: f.fats,
            preparationNotes: f.preparation_notes,
            alternatives: f.alternatives
          })),
          notes: m.notes,
          targetTime: m.target_time,
          mealName: m.meal_name
        })),
        notes: pp.notes,
        periodName: pp.period_name
      })) || [],
      pathologicalRestrictions: plan.pathological_restrictions ? {
        medicalConditions: plan.pathological_restrictions.medical_conditions?.map(mc => ({
          name: mc.name,
          category: mc.category,
          severity: mc.severity,
          description: mc.description,
          dietaryImplications: mc.dietary_implications || [],
          restrictedFoods: mc.restricted_foods || [],
          recommendedFoods: mc.recommended_foods || [],
          monitoringRequirements: mc.monitoring_requirements || [],
          emergencyInstructions: mc.emergency_instructions || ''
        })) || [],
        allergies: plan.pathological_restrictions.allergies?.map(a => ({
          allergen: a.allergen,
          type: a.type,
          severity: a.severity,
          symptoms: a.symptoms || [],
          crossReactions: a.cross_reactions || [],
          emergencyMedication: a.emergency_medication || '',
          avoidanceInstructions: a.avoidance_instructions
        })) || [],
        intolerances: plan.pathological_restrictions.intolerances?.map(i => ({
          substance: i.substance,
          type: i.type,
          severity: i.severity,
          symptoms: i.symptoms || [],
          thresholdAmount: i.threshold_amount || '',
          alternatives: i.alternatives || [],
          preparationNotes: i.preparation_notes || ''
        })) || [],
        medications: plan.pathological_restrictions.medications?.map(m => ({
          name: m.name,
          dosage: m.dosage,
          frequency: m.frequency,
          foodInteractions: m.food_interactions || [],
          timingRequirements: m.timing_requirements || ''
        })) || [],
        specialConsiderations: plan.pathological_restrictions.special_considerations || [],
        emergencyContacts: plan.pathological_restrictions.emergency_contacts?.map(ec => ({
          name: ec.name,
          relationship: ec.relationship,
          phone: ec.phone,
          isPrimary: ec.is_primary
        })) || []
      } : {
        medicalConditions: [],
        allergies: [],
        intolerances: [],
        medications: [],
        specialConsiderations: [],
        emergencyContacts: []
      }
    };
  };

  const validateDietPlanData = (data: any): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];

    if (!data.patientId) errors.push('Debe seleccionar un paciente');
    if (!data.name) errors.push('Debe ingresar un nombre para el plan');
    if (!data.startDate) errors.push('Debe seleccionar una fecha de inicio');

    return { isValid: errors.length === 0, errors };
  };

  const handleCreateDietPlan = async (formData: CreateDietPlanDto) => {
    try {
      const validation = validateDietPlanData(formData);
      if (!validation.isValid) {
        setError(validation.errors.join(', '));
        return;
      }

      await createDietPlan(formData);
      setShowPlanModal(false);
    } catch (error: any) {
      setError(error.message || 'Error al crear el plan');
    }
  };

  const handleUpdateDietPlan = async (formData: CreateDietPlanDto) => {
    if (!editingPlan) return;
    
    try {
      const validation = validateDietPlanData(formData);
      if (!validation.isValid) {
        setError('Errores de validación:\n' + validation.errors.join('\n'));
        return;
      }

      await updateDietPlan(editingPlan.id, formData);
      setEditingPlan(null);
      setShowPlanModal(false);
      clearError();
    } catch (error: any) {
      setError(error.message || 'Error al actualizar el plan de dieta');
    }
  };

  const handleDeletePlan = async (planId: string) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este plan?')) {
      try {
        await deleteDietPlan(planId);
        clearError();
      } catch (error: any) {
        setError(error.message || 'Error al eliminar el plan');
      }
    }
  };

  const handleGenerateAIPlan = async (aiData: GenerateAIDietDto) => {
    try {
      await generateDietPlanWithAI(aiData);
      setShowAIModal(false);
      clearError();
    } catch (error: any) {
      setError(error.message || 'Error al generar plan con IA');
    }
  };

  const handleDownloadPDF = async (plan: DietPlan) => {
    // Implementar descarga de PDF
    console.log('Descargando PDF para plan:', plan.id);
    alert('Función de descarga de PDF en desarrollo');
  };

  const handleEditPlan = (plan: DietPlan) => {
    setEditingPlan(plan);
    setShowPlanModal(true);
  };

  const handleViewPlan = (plan: DietPlan) => {
    setSelectedPlan(plan);
    setShowPlanDetail(true);
  };

  return (
    <div className="container-fluid py-4">
      {/* Header */}
      <div className="row mb-4">
        <div className="col-12 col-md-8">
          <h1 className="h2 mb-1">Planes Nutricionales</h1>
          <p className="text-muted mb-0">Crea y gestiona planes de alimentación personalizados</p>
        </div>
        <div className="col-12 col-md-4 mt-3 mt-md-0">
          <div className="d-flex flex-column flex-sm-row gap-2">
            <button
              className="btn btn-primary"
              onClick={() => setShowPlanModal(true)}
            >
              <Plus className="me-2" size={16} />
              <span className="d-none d-sm-inline">Nuevo Plan</span>
              <span className="d-sm-none">Nuevo</span>
            </button>
            
            <Button
              variant="outline-secondary"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="me-2" size={16} />
              <span className="d-none d-sm-inline">Filtros</span>
              <span className="d-sm-none">Filtros</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Info Alert */}
      <div className="row mb-4">
        <div className="col-12">
          <Alert variant="info" className="mb-3">
            <div className="d-flex align-items-start">
              <i className="fas fa-info-circle me-2 mt-1"></i>
              <div>
                <strong>Información:</strong> Puedes crear, editar, eliminar y descargar planes de dieta. 
                <span className="d-none d-md-inline"> La generación automática con IA estará disponible próximamente.</span>
                <span className="d-md-none"> IA próximamente.</span>
                <span className="d-none d-lg-inline"> Gestión de recetas y plantillas: en desarrollo.</span>
              </div>
            </div>
          </Alert>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="alert alert-danger alert-dismissible fade show" role="alert">
          <div className="d-flex align-items-start">
            <i className="fas fa-exclamation-triangle me-2 mt-1"></i>
            <div className="flex-grow-1">
          <strong>Error:</strong> {error}
            </div>
          <button type="button" className="btn-close" onClick={clearError}></button>
          </div>
        </div>
      )}

      {/* Stats Cards */}
      <div className="row mb-4">
        <div className="col-6 col-md-3 mb-3">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body">
              <div className="d-flex align-items-center">
                <div className="bg-primary bg-opacity-10 rounded-3 p-2 p-md-3 me-3">
                  <FileText className="text-primary" size={20} />
                </div>
                <div>
                  <h5 className="mb-0">{stats.total}</h5>
                  <small className="text-muted">Total planes</small>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="col-6 col-md-3 mb-3">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body">
              <div className="d-flex align-items-center">
                <div className="bg-success bg-opacity-10 rounded-3 p-2 p-md-3 me-3">
                  <Target className="text-success" size={20} />
                </div>
                <div>
                  <h5 className="mb-0">{stats.active}</h5>
                  <small className="text-muted">Activos</small>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="col-6 col-md-3 mb-3">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body">
              <div className="d-flex align-items-center">
                <div className="bg-info bg-opacity-10 rounded-3 p-2 p-md-3 me-3">
                  <Calendar className="text-info" size={20} />
                </div>
                <div>
                  <h5 className="mb-0">{stats.completed}</h5>
                  <small className="text-muted">Completados</small>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="col-6 col-md-3 mb-3">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body">
              <div className="d-flex align-items-center">
                <div className="bg-warning bg-opacity-10 rounded-3 p-2 p-md-3 me-3">
                  <Clock className="text-warning" size={20} />
                </div>
                <div>
                  <h5 className="mb-0">{recipes.length}</h5>
                  <small className="text-muted">Recetas</small>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <ul className="nav nav-tabs mb-4 flex-nowrap overflow-auto">
        <li className="nav-item flex-shrink-0">
          <button 
            className={`nav-link ${activeTab === 'plans' ? 'active' : ''}`}
            onClick={() => setActiveTab('plans')}
          >
            <FileText size={16} className="me-1" />
            <span className="d-none d-sm-inline">Planes</span>
            <span className="d-sm-none">Planes</span>
          </button>
        </li>
        <li className="nav-item flex-shrink-0">
          <button 
            className={`nav-link ${activeTab === 'recipes' ? 'active' : ''}`}
            onClick={() => setActiveTab('recipes')}
          >
            <Target size={16} className="me-1" />
            <span className="d-none d-sm-inline">Recetas</span>
            <span className="d-sm-none">Recetas</span>
          </button>
        </li>
        <li className="nav-item flex-shrink-0">
          <button 
            className={`nav-link ${activeTab === 'templates' ? 'active' : ''}`}
            onClick={() => setActiveTab('templates')}
          >
            <Copy size={16} className="me-1" />
            <span className="d-none d-sm-inline">Plantillas</span>
            <span className="d-sm-none">Plantillas</span>
          </button>
        </li>
      </ul>

      {/* Search and Filters */}
      <div className="row mb-4">
        <div className="col-12 col-md-6 mb-3">
          <div className="input-group">
            <span className="input-group-text">
              <Search size={16} />
            </span>
            <input
              type="text"
              className="form-control"
              placeholder={activeTab === 'plans' ? "Buscar planes..." : "Buscar recetas..."}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        {activeTab === 'plans' && (
          <>
            <div className="col-6 col-md-3 mb-3">
            <select 
              className="form-select"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">Todos los estados</option>
              <option value="active">Activos</option>
              <option value="completed">Completados</option>
              <option value="draft">Borradores</option>
              <option value="cancelled">Cancelados</option>
            </select>
          </div>
            <div className="col-6 col-md-3 mb-3">
              <select 
                className="form-select"
                value={planTypeFilter}
                onChange={(e) => setPlanTypeFilter(e.target.value)}
              >
                <option value="all">Todos los tipos</option>
                <option value="daily">Diarios</option>
                <option value="weekly">Semanales</option>
                <option value="monthly">Mensuales</option>
                <option value="custom">Personalizados</option>
                <option value="flexible">Flexibles</option>
              </select>
            </div>
          </>
        )}
      </div>

      {/* Content based on active tab */}
      {activeTab === 'plans' && (
        <div className="card border-0 shadow-sm">
          <div className="card-header bg-white">
            <div className="d-flex justify-content-between align-items-center">
              <h5 className="mb-0">
                <FileText size={18} className="me-2" />
                Planes Nutricionales
              </h5>
              <div className="d-flex gap-2">
                <button className="btn btn-sm btn-outline-secondary">
                  <Download size={16} className="me-1" />
                  <span className="d-none d-sm-inline">Exportar</span>
                </button>
                <button className="btn btn-sm btn-outline-primary">
                  <RefreshCw size={16} className="me-1" />
                  <span className="d-none d-sm-inline">Actualizar</span>
                </button>
              </div>
            </div>
          </div>
          <div className="card-body p-0">
            {loading ? (
              <div className="text-center py-5">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Cargando...</span>
                </div>
                <p className="mt-3 text-muted">Cargando planes...</p>
              </div>
            ) : filteredPlans.length === 0 ? (
              <div className="text-center py-5">
                <FileText size={48} className="text-muted mb-3" />
                <h5 className="text-muted">No se encontraron planes</h5>
                <p className="text-muted">Crea tu primer plan nutricional para comenzar</p>
                <button 
                  className="btn btn-primary"
                  onClick={() => setShowPlanModal(true)}
                >
                  <Plus size={16} className="me-2" />
                  Crear Plan
                </button>
              </div>
            ) : (
              <>
                {/* Desktop Table */}
                <div className="d-none d-lg-block">
              <div className="table-responsive">
                <table className="table table-hover mb-0">
                  <thead className="table-light">
                    <tr>
                      <th>Plan</th>
                      <th>Paciente</th>
                          <th>Tipo</th>
                      <th>Estado</th>
                          <th>Duración</th>
                          <th>Calorías</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                        {filteredPlans.map((plan) => (
                          <tr key={plan.id}>
                        <td>
                          <div>
                                <strong>{plan.name}</strong>
                                {plan.description && (
                                  <div className="text-muted small">{plan.description}</div>
                            )}
                          </div>
                        </td>
                            <td>{getPatientName(plan)}</td>
                            <td>{getPlanTypeBadge(plan.plan_type)}</td>
                        <td>{getStatusBadge(plan.status)}</td>
                            <td>{calculatePlanDuration(plan.start_date, plan.end_date)}</td>
                            <td>{formatCalories(plan.target_calories)}</td>
                        <td>
                          <div className="btn-group btn-group-sm">
                            <button 
                                  className="btn btn-outline-primary"
                                  onClick={() => handleViewPlan(plan)}
                                  title="Ver plan"
                            >
                              <Eye size={14} />
                            </button>
                            <button 
                                  className="btn btn-outline-secondary"
                              onClick={() => handleEditPlan(plan)}
                              title="Editar plan"
                            >
                              <Edit size={14} />
                            </button>
                            <button 
                              className="btn btn-outline-success"
                              onClick={() => handleDownloadPDF(plan)}
                              title="Descargar PDF"
                            >
                              <Download size={14} />
                            </button>
                            <button 
                              className="btn btn-outline-danger"
                              onClick={() => handleDeletePlan(plan.id)}
                              title="Eliminar plan"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
                </div>

                {/* Mobile Cards */}
                <div className="d-lg-none">
                  {filteredPlans.map((plan) => (
                    <div key={plan.id} className="card border-0 border-bottom rounded-0">
                      <div className="card-body">
                        <div className="d-flex justify-content-between align-items-start mb-2">
                          <div className="flex-grow-1">
                            <h6 className="mb-1 fw-bold">{plan.name}</h6>
                            {plan.description && (
                              <p className="text-muted small mb-2">{plan.description}</p>
                            )}
                            <div className="d-flex flex-wrap gap-1 mb-2">
                              {getStatusBadge(plan.status)}
                              {getPlanTypeBadge(plan.plan_type)}
                            </div>
                          </div>
                        </div>
                        
                        <div className="row g-2 mb-3">
                          <div className="col-6">
                            <small className="text-muted d-block">Paciente</small>
                            <span className="fw-medium">{getPatientName(plan)}</span>
                          </div>
                          <div className="col-6">
                            <small className="text-muted d-block">Duración</small>
                            <span className="fw-medium">{calculatePlanDuration(plan.start_date, plan.end_date)}</span>
                          </div>
                          <div className="col-6">
                            <small className="text-muted d-block">Calorías</small>
                            <span className="fw-medium">{formatCalories(plan.target_calories)}</span>
                          </div>
                          <div className="col-6">
                            <small className="text-muted d-block">Creado</small>
                            <span className="fw-medium">{formatDate(plan.created_at)}</span>
                          </div>
                        </div>
                        
                        <div className="d-flex gap-1">
                          <button
                            className="btn btn-sm btn-outline-primary flex-fill"
                            onClick={() => handleViewPlan(plan)}
                          >
                            <Eye size={14} className="me-1" />
                            Ver
                          </button>
                          <button
                            className="btn btn-sm btn-outline-secondary flex-fill"
                            onClick={() => handleEditPlan(plan)}
                          >
                            <Edit size={14} className="me-1" />
                            Editar
                          </button>
                          <button
                            className="btn btn-sm btn-outline-success flex-fill"
                            onClick={() => handleDownloadPDF(plan)}
                          >
                            <Download size={14} className="me-1" />
                            PDF
                          </button>
                          <button
                            className="btn btn-sm btn-outline-danger"
                            onClick={() => handleDeletePlan(plan.id)}
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
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
                      <span key={`${recipe.id}-tag-${index}`} className="badge bg-light text-dark me-1">
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
          <h5 className="text-muted">Plantillas de Planes Semanales</h5>
          <p className="text-muted">Próximamente: plantillas predefinidas para diferentes objetivos</p>
        </div>
      )}

      {/* Modal para crear/editar plan */}
      <Modal
        show={showPlanModal}
        onHide={() => {
          setShowPlanModal(false);
          setEditingPlan(null);
        }}
        size="xl"
        centered
        className="diet-plan-modal"
      >
        <Modal.Header closeButton className="border-0 pb-0">
          <Modal.Title className="d-flex align-items-center">
            <Calendar size={20} className="me-2 text-primary" />
            {editingPlan ? 'Editar Plan Nutricional' : 'Crear Nuevo Plan Nutricional'}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="pt-0">
          {/* Alerta sobre las nuevas tarjetas nutricionales */}
          <div className="alert alert-info border-0 rounded-0 mb-0">
            <div className="d-flex align-items-center">
              <i className="fas fa-star me-2"></i>
              <div>
                <strong>¡Nuevo!</strong> Sistema de Tarjetas Nutricionales con 5 pestañas especializadas implementado.
                <span className="d-none d-md-inline"> Incluye: Resumen, Comidas, Nutrición, Horarios y Restricciones.</span>
                <br />
                <small className="text-muted">
                  📋 Resumen inteligente | 🍽️ Planificación de comidas | 🎯 Objetivos nutricionales | ⏰ Horarios optimizados | 🛡️ Gestión de restricciones
                </small>
              </div>
            </div>
          </div>
          
          <NutritionalCardSimple
            dietPlan={editingPlan || undefined}
            patient={editingPlan ? patients.find(p => p.id === editingPlan.patient_id) || patients[0] : patients[0]}
            clinicalRecord={editingPlan ? clinicalRecords.find(r => r.patient?.id === editingPlan.patient_id) : undefined}
            mode={editingPlan ? 'edit' : 'create'}
            onSave={editingPlan ? handleUpdateDietPlan : handleCreateDietPlan}
            onClose={() => {
              setShowPlanModal(false);
              setEditingPlan(null);
            }}
            isLoading={loading}
          />
        </Modal.Body>
      </Modal>

      {/* Modal para ver detalles del plan */}
      <Modal
        show={showPlanDetail}
        onHide={() => setShowPlanDetail(false)}
        size="xl"
        centered
        className="diet-plan-detail-modal"
      >
        <Modal.Header closeButton className="border-0 pb-0">
          <Modal.Title className="d-flex align-items-center">
            <FileText size={20} className="me-2 text-primary" />
            Detalles del Plan Nutricional
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="pt-0">
          {selectedPlan && (
            <DietPlanViewer
              plan={selectedPlan}
              onClose={() => setShowPlanDetail(false)}
              onEdit={() => {
                setShowPlanDetail(false);
                setEditingPlan(selectedPlan);
                setShowPlanModal(true);
              }}
              onDownload={() => handleDownloadPDF(selectedPlan)}
            />
          )}
        </Modal.Body>
      </Modal>

      {/* Modal for AI Generation */}
      {showAIModal && (
        <Modal show={showAIModal} onHide={() => setShowAIModal(false)} centered>
          <Modal.Header closeButton>
            <Modal.Title>Generar Plan con IA</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <div className="alert alert-warning mb-0">
              <i className="fas fa-robot me-2"></i>
              La generación automática de planes con IA estará disponible próximamente. ¡Estamos trabajando en ello!
            </div>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowAIModal(false)}>
              Cerrar
            </Button>
          </Modal.Footer>
        </Modal>
      )}
    </div>
  );
};

export default DietPlansPage; 