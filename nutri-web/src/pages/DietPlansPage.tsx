import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Calendar, 
  Target, 
  Clock,
  Edit,
  Trash2,
  Download,
  Copy,
  RefreshCw,
  Utensils,
  Filter,
  FileText,
  Eye
} from 'lucide-react';
import RecipeLibrary from '../components/RecipeBook/RecipeLibrary';
import type { DietPlan, CreateDietPlanDto, PlanType } from '../types/diet';
import { useDietPlans } from '../hooks/useDietPlans';
import { usePatients } from '../hooks/usePatients';
import { clinicalRecordsService } from '../services/clinicalRecordsService';
import { Button, Modal, Alert} from 'react-bootstrap';
import DietPlanViewer from '../components/DietPlanViewer';
import NutritionalCardSimple from '../components/NutritionalCardSimple';
import MealPlanner from '../components/MealPlanner';
import DietPlanService from '../services/dietPlanService';

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
    updateDietPlan,
    deleteDietPlan,
    refreshStats,
    clearError,
    setError
  } = useDietPlans();
  
  const { patients } = usePatients();
  const [allClinicalRecords, setAllClinicalRecords] = useState<any[]>([]);
  
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
  const [showMealPlanner, setShowMealPlanner] = useState(false);
  const [selectedPlanForMeals, setSelectedPlanForMeals] = useState<DietPlan | null>(null);
  // Estados de recetas manejados por RecipeLibrary
  const [pdfLoading, setPdfLoading] = useState(false);

  // Load all diet plans and clinical records for the nutritionist on mount
  useEffect(() => {
    fetchAllDietPlans();
    if (patients.length > 0) {
      loadAllClinicalRecords();
    }
  }, [fetchAllDietPlans, patients.length]);

  // Load clinical records for all patients
  const loadAllClinicalRecords = async () => {
    try {
      console.log('🔄 Cargando expedientes clínicos para todos los pacientes...');
      const allRecords: any[] = [];
      
      // Cargar expedientes para todos los pacientes secuencialmente
      for (const patient of patients) {
        try {
          console.log(`📋 Cargando expedientes para paciente: ${patient.first_name} ${patient.last_name} (${patient.email})`);
          const patientRecords = await clinicalRecordsService.getPatientRecords(patient.id);
          console.log(`✅ Expedientes encontrados para ${patient.first_name}: ${patientRecords.length}`);
          
          // Agregar los expedientes a la lista acumulativa
          allRecords.push(...patientRecords);
        } catch (error) {
          console.warn(`⚠️ Error cargando expedientes para paciente ${patient.first_name}:`, error);
        }
      }
      
      console.log(`📊 Total de expedientes clínicos cargados: ${allRecords.length}`);
      setAllClinicalRecords(allRecords);
      
      // Debug: Mostrar información detallada de los expedientes cargados
      allRecords.forEach((record, index) => {
        console.log(`📋 Expediente ${index + 1}:`, {
          patient: `${record.patient?.first_name} ${record.patient?.last_name}`,
          email: record.patient?.email,
          date: record.record_date,
          diagnosis: record.nutritional_diagnosis,
          allergies: record.pathological_antecedents?.allergies
        });
      });
      
    } catch (error) {
      console.error('❌ Error loading clinical records:', error);
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

  // const filteredRecipes = recipes.filter(recipe => {
  //   const searchTermLower = searchTerm.toLowerCase();
  //   const recipeName = (recipe.name ?? '').toLowerCase();
  //   const recipeCategory = (recipe.category ?? '').toLowerCase();
    
  //   return recipeName.includes(searchTermLower) ||
  //          recipeCategory.includes(searchTermLower);
  // });

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

  const handleDeletePlan = async (planId: string, event?: React.MouseEvent) => {
    // Registrar llamada para debugging
    console.log('🗑️ handleDeletePlan llamado con planId:', planId);
    console.trace('Origen de la llamada de eliminación');
    
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    
    if (window.confirm('¿Estás seguro de que quieres eliminar este plan?')) {
      try {
        console.log('🔄 Eliminando plan:', planId);
        await deleteDietPlan(planId);
        
        // Recargar todos los datos relacionados
        await Promise.all([
          fetchAllDietPlans(),
          refreshStats(),
          patients.length > 0 ? loadAllClinicalRecords() : Promise.resolve()
        ]);
        
        console.log('✅ Plan eliminado exitosamente:', planId);
        
        // Limpiar cualquier plan seleccionado si era el eliminado
        if (selectedPlan?.id === planId) {
          setSelectedPlan(null);
        }
        if (editingPlan?.id === planId) {
          setEditingPlan(null);
        }
        if (selectedPlanForMeals?.id === planId) {
          setSelectedPlanForMeals(null);
        }
        
        clearError();
        console.log('✅ Plan eliminado y datos recargados exitosamente');
      } catch (error: any) {
        console.error('❌ Error eliminando plan:', error);
        setError(error.message || 'Error al eliminar el plan');
      }
    }
  };

  const handleDownloadPDF = async (plan: DietPlan) => {
    try {
      setPdfLoading(true);
      clearError();
      
      console.log('📄 Descargando PDF del planificador de comidas para plan:', plan.id);
      
      // Usar el servicio para descargar el PDF
      const pdfBlob = await DietPlanService.downloadMealPlannerPDF(plan.id);
      
      // Crear URL temporal para el blob
      const pdfUrl = window.URL.createObjectURL(pdfBlob);
      
      // Nombre del archivo
      const filename = `planificador-comidas_${plan.name.replace(/\s+/g, '-')}_${new Date().toISOString().split('T')[0]}.pdf`;
      
      // Crear enlace de descarga
      const link = document.createElement('a');
      link.href = pdfUrl;
      link.download = filename;
      link.style.display = 'none';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Limpiar URL temporal después de un tiempo
      setTimeout(() => {
        window.URL.revokeObjectURL(pdfUrl);
      }, 10000);
      
      console.log('✅ PDF del planificador de comidas descargado exitosamente');
      
    } catch (error: any) {
      console.error('❌ Error descargando PDF:', error);
      setError(error.message || 'Error al descargar el PDF del planificador de comidas');
    } finally {
      setPdfLoading(false);
    }
  };

  const handleEditPlan = (plan: DietPlan) => {
    setEditingPlan(plan);
    setShowPlanModal(true);
  };

  const handleViewPlan = (plan: DietPlan) => {
    setSelectedPlan(plan);
    setShowPlanDetail(true);
  };

  const handleOpenMealPlanner = (plan: DietPlan) => {
    setSelectedPlanForMeals(plan);
    setShowMealPlanner(true);
  };

  const handleSaveMealPlan = async (weeklyPlans: any[]) => {
    try {
      console.log('🍽️ Guardando plan de comidas:', weeklyPlans);
      
      if (selectedPlanForMeals) {
        // Actualizar el plan en el backend
        const updatedPlan = await updateDietPlan(selectedPlanForMeals.id, {
          weeklyPlans: weeklyPlans
        });
        
        console.log('✅ Plan actualizado en backend:', updatedPlan);
        
        // Actualizar el estado local del plan seleccionado
        if (selectedPlan) {
          setSelectedPlan(updatedPlan);
        }
        
        // Cerrar el modal y limpiar
        setShowMealPlanner(false);
        setSelectedPlanForMeals(null);
        
        // Mostrar mensaje de éxito
        alert('✅ Plan de comidas guardado exitosamente. Los cambios se han aplicado al plan nutricional.');
        
        // Recargar los datos para asegurar sincronización
        await fetchAllDietPlans();
        
      }
    } catch (error: any) {
      console.error('❌ Error guardando plan de comidas:', error);
      setError(error.message || 'Error al guardar el plan de comidas');
    }
  };



  const handleRefreshData = async () => {
    try {
      await fetchAllDietPlans();
      if (patients.length > 0) {
        await loadAllClinicalRecords();
      }
      console.log('✅ Datos actualizados exitosamente');
    } catch (error) {
      console.error('❌ Error actualizando datos:', error);
      setError('Error al actualizar los datos');
    }
  };

  // Funciones de recetas ahora manejadas por RecipeLibrary

  // const handleSaveRecipe = (recipeData: Recipe) => {
  //   if (editingRecipe) {
  //     // Actualizar receta existente
  //     setRecipes(recipes.map(r => r.id === editingRecipe.id ? recipeData : r));
  //     setEditingRecipe(null);
  //   } else {
  //     // Crear nueva receta
  //     const newRecipe = {
  //       ...recipeData,
  //       id: Date.now() // ID temporal
  //     };
  //     setRecipes([...recipes, newRecipe]);
  //   }
  //   setShowRecipeModal(false);
  // };

  // const handleDeleteRecipe = (recipeId: number) => {
  //   if (window.confirm('¿Estás seguro de que quieres eliminar esta receta?')) {
  //     setRecipes(recipes.filter(r => r.id !== recipeId));
  //   }
  // };

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
                <strong>¡Nuevas funcionalidades implementadas!</strong> 
                <span className="d-none d-md-inline"> Gestión completa de recetas, plantillas predefinidas y actualización en tiempo real.</span>
                <span className="d-md-none"> Recetas y plantillas disponibles.</span>
                <span className="d-none d-lg-inline"> La generación automática con IA estará disponible próximamente.</span>
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
                <button 
                  className="btn btn-sm btn-outline-primary"
                  onClick={handleRefreshData}
                  disabled={loading}
                >
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
                              className="btn btn-outline-info"
                              onClick={() => handleOpenMealPlanner(plan)}
                              title="Planificar comidas"
                            >
                              <Utensils size={14} />
                            </button>
                            <button 
                              className="btn btn-outline-success"
                              onClick={() => handleDownloadPDF(plan)}
                              title="Descargar PDF del Planificador de Comidas"
                              disabled={pdfLoading}
                            >
                              {pdfLoading ? (
                                <div className="spinner-border spinner-border-sm" role="status">
                                  <span className="visually-hidden">Descargando...</span>
                                </div>
                              ) : (
                                <Download size={14} />
                              )}
                            </button>
                            <button 
                              className="btn btn-outline-danger"
                              onClick={(e) => handleDeletePlan(plan.id, e)}
                              title="Eliminar plan"
                              type="button"
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
                            className="btn btn-sm btn-outline-info flex-fill"
                            onClick={() => handleOpenMealPlanner(plan)}
                          >
                            <Utensils size={14} className="me-1" />
                            Planificar comidas
                          </button>
                          <button
                            className="btn btn-sm btn-outline-success flex-fill"
                            onClick={() => handleDownloadPDF(plan)}
                            disabled={pdfLoading}
                            title="Descargar PDF del Planificador de Comidas"
                          >
                            {pdfLoading ? (
                              <div className="spinner-border spinner-border-sm me-1" role="status">
                                <span className="visually-hidden">Descargando...</span>
                              </div>
                            ) : (
                              <Download size={14} className="me-1" />
                            )}
                            PDF
                          </button>
                          <button
                            className="btn btn-sm btn-outline-danger"
                            onClick={(e) => handleDeletePlan(plan.id, e)}
                            type="button"
                            title="Eliminar plan"
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
        <RecipeLibrary
          showPatientTools={false}
          onRecipeSelect={(recipe) => {
            console.log('Receta seleccionada para plan de dieta:', recipe);
            // Aquí se puede integrar con el MealPlanner o crear plan automáticamente
          }}
        />
      )}

      {activeTab === 'templates' && (
        <div className="card border-0 shadow-sm">
          <div className="card-header bg-white">
            <div className="d-flex justify-content-between align-items-center">
              <h5 className="mb-0">
                <Copy size={18} className="me-2" />
                Plantillas de Planes Nutricionales
              </h5>
              <button 
                className="btn btn-primary btn-sm"
                onClick={() => setShowPlanModal(true)}
              >
                <Plus size={16} className="me-1" />
                Usar Plantilla
              </button>
            </div>
          </div>
          <div className="card-body">
            <div className="row">
              {[
                {
                  id: 1,
                  name: 'Plan de Pérdida de Peso',
                  description: 'Plan equilibrado para pérdida de peso saludable',
                  category: 'Pérdida de peso',
                  duration: '4 semanas',
                  calories: '1500-1800',
                  macros: { protein: 30, carbs: 40, fats: 30 },
                  tags: ['pérdida de peso', 'equilibrado', 'sostenible']
                },
                {
                  id: 2,
                  name: 'Plan de Ganancia Muscular',
                  description: 'Plan alto en proteínas para desarrollo muscular',
                  category: 'Ganancia muscular',
                  duration: '8 semanas',
                  calories: '2500-3000',
                  macros: { protein: 40, carbs: 35, fats: 25 },
                  tags: ['ganancia muscular', 'alto en proteínas', 'fuerza']
                },
                {
                  id: 3,
                  name: 'Plan Vegetariano',
                  description: 'Plan completo para dietas vegetarianas',
                  category: 'Vegetariano',
                  duration: '4 semanas',
                  calories: '1800-2200',
                  macros: { protein: 25, carbs: 45, fats: 30 },
                  tags: ['vegetariano', 'sostenible', 'completo']
                },
                {
                  id: 4,
                  name: 'Plan de Mantenimiento',
                  description: 'Plan para mantener peso y salud general',
                  category: 'Mantenimiento',
                  duration: '4 semanas',
                  calories: '2000-2200',
                  macros: { protein: 25, carbs: 50, fats: 25 },
                  tags: ['mantenimiento', 'equilibrado', 'salud']
                }
              ].map((template) => (
                <div key={template.id} className="col-md-6 col-lg-3 mb-4">
                  <div className="card border-0 shadow-sm h-100">
                    <div className="card-body">
                      <h6 className="card-title">{template.name}</h6>
                      <p className="card-text text-muted small">{template.description}</p>
                      <div className="mb-3">
                        <div className="row text-center">
                          <div className="col-4">
                            <small className="text-muted">Duración</small>
                            <div className="fw-medium">{template.duration}</div>
                          </div>
                          <div className="col-4">
                            <small className="text-muted">Calorías</small>
                            <div className="fw-medium">{template.calories}</div>
                          </div>
                          <div className="col-4">
                            <small className="text-muted">Categoría</small>
                            <div className="fw-medium">{template.category}</div>
                          </div>
                        </div>
                      </div>
                      <div className="mb-3">
                        {template.tags.map((tag, index) => (
                          <span key={index} className="badge bg-light text-dark me-1 mb-1">
                            {tag}
                          </span>
                        ))}
                      </div>
                      <button 
                        className="btn btn-outline-primary btn-sm w-100"
                        onClick={() => {
                          // Implementar lógica para usar plantilla
                          console.log('Usando plantilla:', template);
                          alert(`Plantilla "${template.name}" seleccionada`);
                        }}
                      >
                        <Copy size={14} className="me-1" />
                        Usar Plantilla
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
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
            patients={patients}
            clinicalRecords={allClinicalRecords}
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

      {/* Modal del Planificador de Comidas */}
      {selectedPlanForMeals && (
        <MealPlanner
          weeklyPlans={selectedPlanForMeals.weekly_plans || [] as any}
          dietPlan={selectedPlanForMeals}
          onSave={handleSaveMealPlan}
          onClose={() => {
            setShowMealPlanner(false);
            setSelectedPlanForMeals(null);
          }}
          isOpen={showMealPlanner}
        />
      )}

      {/* Modal de recetas ahora manejado por RecipeLibrary */}
    </div>
  );
};

export default DietPlansPage; 