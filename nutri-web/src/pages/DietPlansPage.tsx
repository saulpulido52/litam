import React, { useState, useEffect } from 'react';
import {
  Plus,
  Search,
  Calendar,
  Target,
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
import { Button, Modal, Alert } from 'react-bootstrap';
import DietPlanViewer from '../components/DietPlans/DietPlanViewer';
import NutritionalCardSimple from '../components/DietPlans/NutritionalCardSimple';
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

    // Modern badge with soft background
    // Adjust specific colors manually for better contrast if needed
    let finalClass = config.class;

    // Map to soft colors
    if (status === 'active') finalClass = 'bg-success bg-opacity-10 text-success';
    else if (status === 'draft') finalClass = 'bg-secondary bg-opacity-10 text-secondary';
    else if (status === 'completed') finalClass = 'bg-info bg-opacity-10 text-info';
    else if (status === 'pending_review') finalClass = 'bg-warning bg-opacity-10 text-warning';
    else if (status === 'archived') finalClass = 'bg-dark bg-opacity-10 text-dark';
    else if (status === 'cancelled') finalClass = 'bg-danger bg-opacity-10 text-danger';

    return (
      <span className={`badge ${finalClass} px-3 py-2 rounded-pill fw-medium border border-0`} title={`Estado: ${config.text}`}>
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

    // Modern soft badges
    let finalClass = config.class;
    if (finalClass.includes('bg-primary')) finalClass = 'bg-primary bg-opacity-10 text-primary';
    else if (finalClass.includes('bg-success')) finalClass = 'bg-success bg-opacity-10 text-success';
    else if (finalClass.includes('bg-info')) finalClass = 'bg-info bg-opacity-10 text-info';
    else if (finalClass.includes('bg-warning')) finalClass = 'bg-warning bg-opacity-10 text-warning';
    else if (finalClass.includes('bg-purple')) finalClass = 'bg-purple bg-opacity-10 text-purple';

    return <span className={`badge ${finalClass} px-3 py-2 rounded-pill border border-0 fw-normal`}>{config.text}</span>;
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
      }

      console.log('💾 Guardando plan editado:', formData);

      await updateDietPlan(editingPlan.id, formData);

      // Recargar datos para asegurar consistencia
      await fetchAllDietPlans();
      await refreshStats();

      setEditingPlan(null);
      setShowPlanModal(false);
      clearError();
    } catch (error: any) {
      setError(error.message || 'Error al actualizar el plan de dieta');
    } finally {
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
      } finally {
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
      <div className="row mb-5 g-4">
        <div className="col-12 col-md-6 col-lg-3">
          <div className="card h-100 border-0 shadow-sm overflow-hidden" style={{ borderRadius: '16px' }}>
            <div className="card-body p-4 position-relative">
              <div className="d-flex align-items-center justify-content-between mb-3">
                <div className="p-3 bg-primary bg-opacity-10 rounded-4">
                  <FileText className="text-primary" size={24} />
                </div>
                <span className="badge bg-primary bg-opacity-10 text-primary px-3 py-2 rounded-pill">Total</span>
              </div>
              <div>
                <h2 className="display-6 fw-bold mb-1 text-dark">{stats.total}</h2>
                <p className="text-muted mb-0 small fw-medium">Planes creados</p>
              </div>
              <div className="position-absolute bottom-0 end-0 p-3 opacity-10">
                <FileText size={80} className="text-primary" />
              </div>
            </div>
          </div>
        </div>

        <div className="col-12 col-md-6 col-lg-3">
          <div className="card h-100 border-0 shadow-sm overflow-hidden" style={{ borderRadius: '16px' }}>
            <div className="card-body p-4 position-relative">
              <div className="d-flex align-items-center justify-content-between mb-3">
                <div className="p-3 bg-success bg-opacity-10 rounded-4">
                  <Target className="text-success" size={24} />
                </div>
                <span className="badge bg-success bg-opacity-10 text-success px-3 py-2 rounded-pill">Activos</span>
              </div>
              <div>
                <h2 className="display-6 fw-bold mb-1 text-dark">{stats.active}</h2>
                <p className="text-muted mb-0 small fw-medium">Planes en curso</p>
              </div>
              <div className="position-absolute bottom-0 end-0 p-3 opacity-10">
                <Target size={80} className="text-success" />
              </div>
            </div>
          </div>
        </div>

        <div className="col-12 col-md-6 col-lg-3">
          <div className="card h-100 border-0 shadow-sm overflow-hidden" style={{ borderRadius: '16px' }}>
            <div className="card-body p-4 position-relative">
              <div className="d-flex align-items-center justify-content-between mb-3">
                <div className="p-3 bg-info bg-opacity-10 rounded-4">
                  <Calendar className="text-info" size={24} />
                </div>
                <span className="badge bg-info bg-opacity-10 text-info px-3 py-2 rounded-pill">Completados</span>
              </div>
              <div>
                <h2 className="display-6 fw-bold mb-1 text-dark">{stats.completed}</h2>
                <p className="text-muted mb-0 small fw-medium">Planes finalizados</p>
              </div>
              <div className="position-absolute bottom-0 end-0 p-3 opacity-10">
                <Calendar size={80} className="text-info" />
              </div>
            </div>
          </div>
        </div>

        <div className="col-12 col-md-6 col-lg-3">
          <div className="card h-100 border-0 shadow-sm overflow-hidden" style={{ borderRadius: '16px' }}>
            <div className="card-body p-4 position-relative">
              <div className="d-flex align-items-center justify-content-between mb-3">
                <div className="p-3 bg-warning bg-opacity-10 rounded-4">
                  <Utensils className="text-warning" size={24} />
                </div>
                <span className="badge bg-warning bg-opacity-10 text-warning px-3 py-2 rounded-pill">Recetas</span>
              </div>
              <div>
                <h2 className="display-6 fw-bold mb-1 text-dark">{recipes.length}</h2>
                <p className="text-muted mb-0 small fw-medium">Biblioteca</p>
              </div>
              <div className="position-absolute bottom-0 end-0 p-3 opacity-10">
                <Utensils size={80} className="text-warning" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="d-flex justify-content-center mb-4">
        <div className="bg-white p-1 rounded-pill shadow-sm d-inline-flex">
          <button
            className={`btn rounded-pill px-4 py-2 fw-medium transition-all ${activeTab === 'plans' ? 'btn-primary shadow-sm' : 'btn-light bg-transparent text-muted'}`}
            onClick={() => setActiveTab('plans')}
            style={{ minWidth: '120px' }}
          >
            <FileText size={18} className="me-2 mb-1" />
            Planes
          </button>
          <button
            className={`btn rounded-pill px-4 py-2 fw-medium transition-all ${activeTab === 'recipes' ? 'btn-primary shadow-sm' : 'btn-light bg-transparent text-muted'}`}
            onClick={() => setActiveTab('recipes')}
            style={{ minWidth: '120px' }}
          >
            <Target size={18} className="me-2 mb-1" />
            Recetas
          </button>
          <button
            className={`btn rounded-pill px-4 py-2 fw-medium transition-all ${activeTab === 'templates' ? 'btn-primary shadow-sm' : 'btn-light bg-transparent text-muted'}`}
            onClick={() => setActiveTab('templates')}
            style={{ minWidth: '120px' }}
          >
            <Copy size={18} className="me-2 mb-1" />
            Plantillas
          </button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="row mb-4 align-items-center g-3">
        <div className="col-12 col-md-6 mb-2 mb-md-0">
          <div className="input-group shadow-sm rounded-4 overflow-hidden border-0">
            <span className="input-group-text bg-white border-0 ps-3">
              <Search size={18} className="text-muted" />
            </span>
            <input
              type="text"
              className="form-control border-0 py-3 bg-white"
              placeholder={activeTab === 'plans' ? "Buscar por nombre, paciente o descripción..." : "Buscar recetas..."}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ boxShadow: 'none' }}
            />
          </div>
        </div>
        {activeTab === 'plans' && (
          <>
            <div className="col-6 col-md-3">
              <div className="shadow-sm rounded-4 overflow-hidden bg-white">
                <select
                  className="form-select border-0 py-3 bg-white"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  style={{ boxShadow: 'none', cursor: 'pointer' }}
                >
                  <option value="all">Todos los estados</option>
                  <option value="active">🟢 Activos</option>
                  <option value="completed">🏁 Completados</option>
                  <option value="draft">📝 Borradores</option>
                  <option value="cancelled">❌ Cancelados</option>
                </select>
              </div>
            </div>
            <div className="col-6 col-md-3">
              <div className="shadow-sm rounded-4 overflow-hidden bg-white">
                <select
                  className="form-select border-0 py-3 bg-white"
                  value={planTypeFilter}
                  onChange={(e) => setPlanTypeFilter(e.target.value)}
                  style={{ boxShadow: 'none', cursor: 'pointer' }}
                >
                  <option value="all">Todos los tipos</option>
                  <option value="daily">📅 Diarios</option>
                  <option value="weekly">📅 Semanales</option>
                  <option value="monthly">📅 Mensuales</option>
                  <option value="custom">👤 Personalizados</option>
                  <option value="flexible">⚖️ Flexibles</option>
                </select>
              </div>
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
                    <table className="table table-hover align-middle mb-0">
                      <thead className="bg-light">
                        <tr>
                          <th className="py-3 ps-4 border-0 rounded-start-3 text-secondary small fw-bold text-uppercase">Plan</th>
                          <th className="py-3 border-0 text-secondary small fw-bold text-uppercase">Paciente</th>
                          <th className="py-3 border-0 text-secondary small fw-bold text-uppercase">Tipo</th>
                          <th className="py-3 border-0 text-secondary small fw-bold text-uppercase">Estado</th>
                          <th className="py-3 border-0 text-secondary small fw-bold text-uppercase">Duración</th>
                          <th className="py-3 border-0 text-secondary small fw-bold text-uppercase">Calorías</th>
                          <th className="py-3 pe-4 border-0 rounded-end-3 text-secondary small fw-bold text-uppercase text-end">Acciones</th>
                        </tr>
                      </thead>
                      <tbody className="border-top-0">
                        {filteredPlans.map((plan) => (
                          <tr key={plan.id} className="position-relative">
                            <td className="ps-4 py-3 border-bottom-0">
                              <div className="d-flex align-items-center">
                                <div className="bg-primary bg-opacity-10 p-2 rounded-3 me-3">
                                  <FileText className="text-primary" size={20} />
                                </div>
                                <div>
                                  <h6 className="mb-0 fw-bold text-dark">{plan.name}</h6>
                                  {plan.description && (
                                    <div className="text-muted small text-truncate" style={{ maxWidth: '200px' }}>{plan.description}</div>
                                  )}
                                </div>
                              </div>
                            </td>
                            <td className="py-3 border-bottom-0">
                              <div className="d-flex align-items-center">
                                <div className="avatar-circle bg-light text-primary rounded-circle d-flex align-items-center justify-content-center me-2" style={{ width: '32px', height: '32px', fontSize: '12px' }}>
                                  {getPatientName(plan).charAt(0)}
                                </div>
                                <span className="fw-medium">{getPatientName(plan)}</span>
                              </div>
                            </td>
                            <td className="py-3 border-bottom-0">{getPlanTypeBadge(plan.plan_type)}</td>
                            <td className="py-3 border-bottom-0">{getStatusBadge(plan.status)}</td>
                            <td className="py-3 border-bottom-0 text-muted">
                              {calculatePlanDuration(plan.start_date, plan.end_date)}
                            </td>
                            <td className="py-3 border-bottom-0">
                              <span className="fw-mono text-dark">{formatCalories(plan.target_calories)}</span>
                            </td>
                            <td className="pe-4 py-3 border-bottom-0 text-end">
                              <div className="d-flex justify-content-end gap-2">
                                <button
                                  className="btn btn-light btn-sm rounded-circle shadow-sm hover-primary"
                                  onClick={() => handleViewPlan(plan)}
                                  title="Ver detalles"
                                  style={{ width: '32px', height: '32px', padding: 0 }}
                                >
                                  <Eye size={16} className="text-muted" />
                                </button>
                                <button
                                  className="btn btn-light btn-sm rounded-circle shadow-sm hover-primary"
                                  onClick={() => handleEditPlan(plan)}
                                  title="Editar plan"
                                  style={{ width: '32px', height: '32px', padding: 0 }}
                                >
                                  <Edit size={16} className="text-muted" />
                                </button>
                                <button
                                  className="btn btn-light btn-sm rounded-circle shadow-sm hover-primary"
                                  onClick={() => handleOpenMealPlanner(plan)}
                                  title="Planificar comidas"
                                  style={{ width: '32px', height: '32px', padding: 0 }}
                                >
                                  <Utensils size={16} className="text-muted" />
                                </button>
                                <button
                                  className="btn btn-light btn-sm rounded-circle shadow-sm hover-primary"
                                  onClick={() => handleDownloadPDF(plan)}
                                  title="Descargar PDF"
                                  disabled={pdfLoading}
                                  style={{ width: '32px', height: '32px', padding: 0 }}
                                >
                                  {pdfLoading ? (
                                    <div className="spinner-border spinner-border-sm" role="status" style={{ width: '12px', height: '12px' }}></div>
                                  ) : (
                                    <Download size={16} className="text-muted" />
                                  )}
                                </button>
                                <button
                                  className="btn btn-light btn-sm rounded-circle shadow-sm hover-danger"
                                  onClick={(e) => handleDeletePlan(plan.id, e)}
                                  title="Eliminar plan"
                                  type="button"
                                  style={{ width: '32px', height: '32px', padding: 0 }}
                                >
                                  <Trash2 size={16} className="text-danger" />
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
                    <div key={plan.id} className="card border-0 shadow-sm rounded-4 mb-3 overflow-hidden">
                      <div className="card-body p-4">
                        <div className="d-flex justify-content-between align-items-start mb-3">
                          <div className="d-flex align-items-center">
                            <div className="bg-primary bg-opacity-10 p-2 rounded-3 me-3">
                              <FileText className="text-primary" size={20} />
                            </div>
                            <div>
                              <h6 className="mb-0 fw-bold text-dark">{plan.name}</h6>
                              {plan.description && (
                                <p className="text-muted small mb-0 text-truncate" style={{ maxWidth: '180px' }}>{plan.description}</p>
                              )}
                            </div>
                          </div>
                          {getStatusBadge(plan.status)}
                        </div>

                        <div className="row g-3 mb-4">
                          <div className="col-6">
                            <small className="text-muted d-block small text-uppercase fw-bold mb-1">Paciente</small>
                            <div className="d-flex align-items-center">
                              <div className="avatar-circle bg-light text-primary rounded-circle d-flex align-items-center justify-content-center me-2" style={{ width: '24px', height: '24px', fontSize: '10px' }}>
                                {getPatientName(plan).charAt(0)}
                              </div>
                              <span className="fw-medium small">{getPatientName(plan)}</span>
                            </div>
                          </div>
                          <div className="col-6">
                            <small className="text-muted d-block small text-uppercase fw-bold mb-1">Tipo</small>
                            {getPlanTypeBadge(plan.plan_type)}
                          </div>
                          <div className="col-6">
                            <small className="text-muted d-block small text-uppercase fw-bold mb-1">Duración</small>
                            <span className="fw-medium small">{calculatePlanDuration(plan.start_date, plan.end_date)}</span>
                          </div>
                          <div className="col-6">
                            <small className="text-muted d-block small text-uppercase fw-bold mb-1">Calorías</small>
                            <span className="fw-mono small text-dark">{formatCalories(plan.target_calories)}</span>
                          </div>
                        </div>

                        <div className="d-flex gap-2">
                          <button
                            className="btn btn-outline-primary btn-sm flex-fill rounded-pill"
                            onClick={() => handleViewPlan(plan)}
                          >
                            <Eye size={14} className="me-1" />
                            Ver
                          </button>
                          <button
                            className="btn btn-outline-secondary btn-sm flex-fill rounded-pill"
                            onClick={() => handleEditPlan(plan)}
                          >
                            <Edit size={14} className="me-1" />
                            Editar
                          </button>
                          <button
                            className="btn btn-outline-info btn-sm flex-fill rounded-pill"
                            onClick={() => handleOpenMealPlanner(plan)}
                          >
                            <Utensils size={14} className="me-1" />
                            Planificar
                          </button>
                          <button
                            className="btn btn-outline-danger btn-sm rounded-circle shadow-sm"
                            onClick={(e) => handleDeletePlan(plan.id, e)}
                            type="button"
                            title="Eliminar plan"
                            style={{ width: '32px', height: '32px', padding: 0 }}
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
                handleEditPlan(selectedPlan); // Switch to edit mode
                setShowPlanDetail(false);
              }}
              onDownload={() => handleDownloadPDF(selectedPlan)}
              patients={patients}
              clinicalRecords={allClinicalRecords}
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