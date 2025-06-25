import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  FileText, 
  Target, 
  Copy, 
  User, 
  Eye, 
  Edit, 
  Trash2, 
  Download, 
  PlusCircle, 
  Calendar, 
  Clock,
  Sparkles
} from 'lucide-react';
import type { DietPlan, CreateDietPlanDto, GenerateAIDietDto } from '../types/diet';
import { useDietPlans } from '../hooks/useDietPlans';
import { usePatients } from '../hooks/usePatients';
import { Button, Modal, Alert } from 'react-bootstrap';

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
  const { 
    dietPlans, 
    loading, 
    error, 
    stats, 
    fetchAllDietPlans,
    createDietPlan, 
    updateDietPlan,
    deleteDietPlan,
    addWeekToPlan,
    clearError,
    setError
  } = useDietPlans();
  
  const { patients } = usePatients();
  
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [activeTab, setActiveTab] = useState<'plans' | 'recipes' | 'templates'>('plans');
  const [showPlanModal, setShowPlanModal] = useState(false);
  const [showAIModal, setShowAIModal] = useState(false);
  const [showPlanDetail, setShowPlanDetail] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<DietPlan | null>(null);
  const [editingPlan, setEditingPlan] = useState<DietPlan | null>(null);

  // Form state for new diet plan
  const [newPlanData, setNewPlanData] = useState<CreateDietPlanDto>({
    patientId: '',
    name: '',
    description: '',
    startDate: '',
    endDate: '',
    dailyCaloriesTarget: 0,
    dailyMacrosTarget: {
      protein: 0,
      carbohydrates: 0,
      fats: 0
    },
    notes: '',
    isWeeklyPlan: true,
    totalWeeks: 1,
    weeklyPlans: []
  });

  // Form state for AI generation
  const [aiPlanData, setAiPlanData] = useState<GenerateAIDietDto>({
    patientId: '',
    name: '',
    goal: 'weight_loss',
    startDate: '',
    endDate: '',
    totalWeeks: 1,
    dailyCaloriesTarget: 0,
    dietaryRestrictions: [],
    allergies: [],
    preferredFoods: [],
    dislikedFoods: [],
    notesForAI: ''
  });

  // Load all diet plans for the nutritionist on mount
  useEffect(() => {
    fetchAllDietPlans();
  }, [fetchAllDietPlans]);

  // Mock recipes data
  useEffect(() => {
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
    setRecipes(mockRecipes);
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
    return matchesSearch && matchesStatus;
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

  // === VALIDACIONES Y TRANSFORMACIONES ROBUSTAS ===
  
  // Validar datos antes de enviar (similar a expedientes clínicos)
  const validateDietPlanData = (data: any): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];

    // Validaciones básicas
    if (!data.patientId) {
      errors.push('El paciente es requerido');
    }

    if (!data.name || data.name.trim().length < 2) {
      errors.push('El nombre del plan debe tener al menos 2 caracteres');
    }

    if (!data.startDate) {
      errors.push('La fecha de inicio es requerida');
    }

    if (!data.endDate) {
      errors.push('La fecha de fin es requerida');
    }

    // Validar fechas
    if (data.startDate && data.endDate) {
      const startDate = new Date(data.startDate);
      const endDate = new Date(data.endDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (startDate < today) {
        errors.push('La fecha de inicio no puede ser anterior a hoy');
      }

      if (endDate <= startDate) {
        errors.push('La fecha de fin debe ser posterior a la fecha de inicio');
      }

      // Validar que no sea más de 1 año
      const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      if (diffDays > 365) {
        errors.push('El plan no puede durar más de 1 año');
      }
    }

    // Validar calorías
    if (data.dailyCaloriesTarget !== undefined && data.dailyCaloriesTarget !== null) {
      if (data.dailyCaloriesTarget < 800 || data.dailyCaloriesTarget > 5000) {
        errors.push('Las calorías diarias deben estar entre 800 y 5000 kcal');
      }
    }

    // Validar macros si se proporcionan
    if (data.dailyMacrosTarget) {
      const { protein, carbohydrates, fats } = data.dailyMacrosTarget;
      
      if (protein !== undefined && (protein < 0 || protein > 500)) {
        errors.push('Las proteínas deben estar entre 0 y 500g');
      }
      
      if (carbohydrates !== undefined && (carbohydrates < 0 || carbohydrates > 1000)) {
        errors.push('Los carbohidratos deben estar entre 0 y 1000g');
      }
      
      if (fats !== undefined && (fats < 0 || fats > 200)) {
        errors.push('Las grasas deben estar entre 0 y 200g');
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  };

  // Transformar datos de manera segura antes de enviar
  const transformDietPlanData = (formData: any): CreateDietPlanDto => {
    // Limpiar y validar datos
    const cleanedData = {
      patientId: formData.patientId?.trim(),
      name: formData.name?.trim(),
      description: formData.description?.trim() || undefined,
      startDate: formData.startDate,
      endDate: formData.endDate,
      dailyCaloriesTarget: formData.dailyCaloriesTarget ? Number(formData.dailyCaloriesTarget) : undefined,
      dailyMacrosTarget: formData.dailyMacrosTarget ? {
        protein: formData.dailyMacrosTarget.protein ? Number(formData.dailyMacrosTarget.protein) : undefined,
        carbohydrates: formData.dailyMacrosTarget.carbohydrates ? Number(formData.dailyMacrosTarget.carbohydrates) : undefined,
        fats: formData.dailyMacrosTarget.fats ? Number(formData.dailyMacrosTarget.fats) : undefined,
      } : undefined,
      notes: formData.notes?.trim() || undefined,
      isWeeklyPlan: Boolean(formData.isWeeklyPlan),
      totalWeeks: formData.totalWeeks ? Number(formData.totalWeeks) : undefined,
    };

    // Calcular macros si faltan pero hay calorías
    if (cleanedData.dailyCaloriesTarget && !cleanedData.dailyMacrosTarget) {
      const calories = cleanedData.dailyCaloriesTarget;
      cleanedData.dailyMacrosTarget = {
        protein: Math.round(calories * 0.25 / 4), // 25% de proteínas
        carbohydrates: Math.round(calories * 0.50 / 4), // 50% de carbohidratos
        fats: Math.round(calories * 0.25 / 9), // 25% de grasas
      };
    }

    return cleanedData;
  };

  // === MANEJO DE ERRORES MEJORADO ===
  
  const handleCreateDietPlan = async () => {
    try {
      // Validar datos antes de enviar
      const validation = validateDietPlanData(newPlanData);
      if (!validation.isValid) {
        setError(`Errores de validación: ${validation.errors.join(', ')}`);
        return;
      }

      // Transformar datos de manera segura
      const transformedData = transformDietPlanData(newPlanData);
      
      console.log('🟢 DEBUG - Datos transformados:', transformedData);

      // Crear el plan
      await createDietPlan(transformedData);
      
      // Limpiar formulario y cerrar modal
      setNewPlanData({
        patientId: '',
        name: '',
        description: '',
        startDate: '',
        endDate: '',
        dailyCaloriesTarget: 0,
        dailyMacrosTarget: { protein: 0, carbohydrates: 0, fats: 0 },
        notes: '',
        isWeeklyPlan: false,
        totalWeeks: 1,
      });
      setShowPlanModal(false);
      
      // Mostrar mensaje de éxito
      alert('Plan de dieta creado exitosamente');
      
    } catch (error: any) {
      console.error('🔴 Error creando plan de dieta:', error);
      
      // Manejo específico de errores
      let errorMessage = 'Error al crear el plan de dieta';
      
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setError(errorMessage);
      
      // Mostrar error al usuario
      alert(`Error: ${errorMessage}`);
    }
  };

  const handleUpdateDietPlan = async () => {
    if (!editingPlan) return;
    
    try {
      // Validar datos antes de enviar
      const validation = validateDietPlanData(newPlanData);
      if (!validation.isValid) {
        setError(`Errores de validación: ${validation.errors.join(', ')}`);
        return;
      }

      // Transformar datos de manera segura
      const transformedData = transformDietPlanData(newPlanData);
      
      // Actualizar el plan
      await updateDietPlan(editingPlan.id, transformedData);
      
      // Limpiar y cerrar modal
      setEditingPlan(null);
      setShowPlanModal(false);
      
      // Mostrar mensaje de éxito
      alert('Plan de dieta actualizado exitosamente');
      
    } catch (error: any) {
      console.error('🔴 Error actualizando plan de dieta:', error);
      
      let errorMessage = 'Error al actualizar el plan de dieta';
      
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setError(errorMessage);
      alert(`Error: ${errorMessage}`);
    }
  };

  const handleDeletePlan = async (planId: string) => {
    if (!window.confirm('¿Estás seguro de que quieres eliminar este plan de dieta? Esta acción no se puede deshacer.')) {
      return;
    }

    try {
      await deleteDietPlan(planId);
      alert('Plan de dieta eliminado exitosamente');
    } catch (error: any) {
      console.error('🔴 Error eliminando plan de dieta:', error);
      
      let errorMessage = 'Error al eliminar el plan de dieta';
      
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      alert(`Error: ${errorMessage}`);
    }
  };

  const handleAddWeek = async (planId: string) => {
    try {
      const plan = safeDietPlans.find(p => p.id === planId);
      if (!plan) {
        alert('Plan no encontrado');
        return;
      }

      const currentWeeks = plan.total_weeks || 1;
      const newWeekNumber = currentWeeks + 1;
      
      // Calcular fechas para la nueva semana
      const lastWeekEndDate = plan.weekly_plans?.[currentWeeks - 1]?.end_date || plan.end_date;
      const newWeekStartDate = new Date(lastWeekEndDate || plan.end_date || '');
      newWeekStartDate.setDate(newWeekStartDate.getDate() + 1);
      
      const newWeekEndDate = new Date(newWeekStartDate);
      newWeekEndDate.setDate(newWeekEndDate.getDate() + 6);

      const weekData = {
        weekNumber: newWeekNumber,
        startDate: newWeekStartDate.toISOString().split('T')[0],
        endDate: newWeekEndDate.toISOString().split('T')[0],
        dailyCaloriesTarget: plan.target_calories || 2000,
        dailyMacrosTarget: {
          protein: plan.target_protein || 150,
          carbohydrates: plan.target_carbs || 200,
          fats: plan.target_fats || 50,
        },
        meals: [],
        notes: `Semana ${newWeekNumber} agregada automáticamente`,
      };

      await addWeekToPlan(planId, weekData);
      alert('Semana agregada exitosamente');
      
    } catch (error: any) {
      console.error('🔴 Error agregando semana:', error);
      
      let errorMessage = 'Error al agregar la semana';
      
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      alert(`Error: ${errorMessage}`);
    }
  };

  // === FUNCIONES DESHABILITADAS ===
  
  const handleGenerateAIPlan = async () => {
    try {
      if (!aiPlanData.patientId || !aiPlanData.name || !aiPlanData.startDate || !aiPlanData.endDate) {
        setError('Por favor completa todos los campos obligatorios');
        return;
      }

      const generatedPlan = await createDietPlan(aiPlanData);
      
      // Cerrar modal y mostrar éxito
      setShowAIModal(false);
      setAiPlanData({
        patientId: '',
        name: '',
        goal: 'weight_loss',
        startDate: '',
        endDate: '',
        totalWeeks: 1,
        dailyCaloriesTarget: 0,
        dietaryRestrictions: [],
        allergies: [],
        preferredFoods: [],
        dislikedFoods: [],
        notesForAI: ''
      });
      
      // Mostrar mensaje de éxito
      alert('Plan generado con IA exitosamente. Revisa y ajusta según sea necesario.');
    } catch (error) {
      console.error('Error generating AI plan:', error);
      setError('Error al generar el plan con IA. Intenta nuevamente.');
    }
  };

  const handleDownloadPDF = async (plan: DietPlan) => {
    try {
      // Crear contenido del PDF
      const content = `
        PLAN NUTRICIONAL SEMANAL
        
        Nombre: ${plan.name}
        Paciente: ${getPatientName(plan)}
        Duración: ${calculatePlanDuration(plan.start_date, plan.end_date)}
        Calorías diarias: ${formatCalories(plan.target_calories)}
        
        Macros objetivo:
        - Proteínas: ${plan.target_protein || 'N/A'}g
        - Carbohidratos: ${plan.target_carbs || 'N/A'}g
        - Grasas: ${plan.target_fats || 'N/A'}g
        
        Notas: ${plan.notes || 'Sin notas adicionales'}
        
        Estado: ${plan.status}
        Creado: ${formatDate(plan.created_at)}
      `;
      
      // Crear blob y descargar
      const blob = new Blob([content], { type: 'text/plain' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `plan-nutricional-${plan.name.replace(/\s+/g, '-').toLowerCase()}.txt`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      alert('Plan descargado exitosamente');
    } catch (error) {
      console.error('Error downloading plan:', error);
      alert('Error al descargar el plan. Intenta nuevamente.');
    }
  };

  const handleEditPlan = (plan: DietPlan) => {
    setEditingPlan(plan);
    setNewPlanData({
      patientId: plan.patient_id || '',
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
      })) || []
    });
  };

  return (
    <div className="container-fluid py-4">
      {/* Header */}
      <div className="row mb-4">
        <div className="col-md-8">
          <h1 className="h2 mb-1">Planes Nutricionales Semanales</h1>
          <p className="text-muted">Crea y gestiona planes de alimentación semanales personalizados</p>
        </div>
        <div className="col-md-4 text-end">
          <div className="d-flex gap-2">
            <button
              className="btn btn-primary"
              onClick={() => setShowPlanModal(true)}
            >
              <Plus className="me-2" size={16} />
              Nuevo Plan
            </button>
            
            <Button
              variant="outline-primary"
              className="me-2"
              disabled
              title="La generación automática con IA estará disponible próximamente."
            >
              <i className="fas fa-robot me-1"></i> Generar con IA (próximamente)
            </Button>
          </div>
        </div>
      </div>

      {/* Info Alert */}
      <div className="row mb-4">
        <div className="col-12">
          <Alert variant="info" className="mb-3">
            <i className="fas fa-info-circle me-2"></i>
            Puedes crear, editar, eliminar y descargar planes de dieta. <b>La generación automática con IA estará disponible próximamente.</b> Gestión de recetas y plantillas: en desarrollo.
          </Alert>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="alert alert-danger alert-dismissible fade show" role="alert">
          <strong>Error:</strong> {error}
          <button type="button" className="btn-close" onClick={clearError}></button>
        </div>
      )}

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
                  <h5 className="mb-0">{stats.total}</h5>
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
                  <h5 className="mb-0">{stats.active}</h5>
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
                  <h5 className="mb-0">{stats.completed}</h5>
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
            Planes Semanales
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
              <option value="cancelled">Cancelados</option>
            </select>
          </div>
        )}
      </div>

      {/* Content based on active tab */}
      {activeTab === 'plans' && (
        <div className="card border-0 shadow-sm">
          <div className="card-header bg-white">
            <h5 className="card-title mb-0">Planes Nutricionales Semanales</h5>
          </div>
          <div className="card-body p-0">
            {loading ? (
              <div className="text-center py-5">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Cargando...</span>
                </div>
                <p className="mt-2 text-muted">Cargando planes nutricionales...</p>
              </div>
            ) : filteredPlans.length === 0 ? (
              <div className="text-center py-5">
                <FileText size={48} className="text-muted mb-3" />
                <h5 className="text-muted">No se encontraron planes</h5>
                <p className="text-muted">Crea tu primer plan nutricional semanal</p>
              </div>
            ) : (
              <div className="table-responsive">
                <table className="table table-hover mb-0">
                  <thead className="table-light">
                    <tr>
                      <th>Plan</th>
                      <th>Paciente</th>
                      <th>Duración</th>
                      <th>Semanas</th>
                      <th>Calorías/día</th>
                      <th>Macros (P/C/G)</th>
                      <th>Estado</th>
                      <th>Creado</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredPlans
                      .filter(plan => plan.id) // Filtrar planes sin ID
                      .map((plan, index) => (
                      <tr key={plan.id || `plan-${index}`}>
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
                            <span>{getPatientName(plan)}</span>
                          </div>
                        </td>
                        <td>
                          <span className="fw-medium">
                            {calculatePlanDuration(plan.start_date, plan.end_date)}
                          </span>
                        </td>
                        <td>
                          <span className="fw-medium text-info">
                            {plan.total_weeks || 1} semana{(plan.total_weeks || 1) !== 1 ? 's' : ''}
                          </span>
                        </td>
                        <td>
                          <span className="fw-medium text-success">{formatCalories(plan.target_calories)}</span>
                        </td>
                        <td>
                          <div className="small">
                            {plan.target_protein && plan.target_carbs && plan.target_fats ? (
                              <>
                                <span className="badge bg-primary me-1">{plan.target_protein}g P</span>
                                <span className="badge bg-warning me-1">{plan.target_carbs}g C</span>
                                <span className="badge bg-info">{plan.target_fats}g G</span>
                              </>
                            ) : (
                              <span className="text-muted">N/A</span>
                            )}
                          </div>
                        </td>
                        <td>{getStatusBadge(plan.status)}</td>
                        <td>
                          <div className="fw-medium">
                            {formatDate(plan.created_at)}
                          </div>
                        </td>
                        <td>
                          <div className="btn-group btn-group-sm">
                            <button 
                              className="btn btn-outline-info"
                              onClick={() => {
                                setSelectedPlan(plan);
                                setShowPlanDetail(true);
                              }}
                              title="Ver detalles"
                            >
                              <Eye size={14} />
                            </button>
                            <button 
                              className="btn btn-outline-primary"
                              onClick={() => handleEditPlan(plan)}
                              title="Editar plan"
                            >
                              <Edit size={14} />
                            </button>
                            <button 
                              className="btn btn-outline-success"
                              onClick={() => handleAddWeek(plan.id)}
                              title="Agregar semana"
                            >
                              <PlusCircle size={14} />
                            </button>
                            <button 
                              className="btn btn-outline-warning"
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

      {/* Modal for New Plan */}
      {showPlanModal && (
        <div className="modal fade show d-block" tabIndex={-1} style={{backgroundColor: 'rgba(0,0,0,0.5)'}}>
          <div className="modal-dialog modal-xl">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Nuevo Plan Nutricional Semanal</h5>
                <button type="button" className="btn-close" onClick={() => setShowPlanModal(false)}></button>
              </div>
              <div className="modal-body">
                <form>
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Paciente *</label>
                      <select 
                        className="form-select"
                        value={newPlanData.patientId}
                        onChange={(e) => setNewPlanData({...newPlanData, patientId: e.target.value})}
                        required
                      >
                        <option value="">Seleccionar paciente...</option>
                        {patients.map(patient => (
                          <option key={patient.id} value={patient.id}>
                            {patient.first_name} {patient.last_name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Nombre del plan *</label>
                      <input 
                        type="text" 
                        className="form-control" 
                        placeholder="Ej: Plan de pérdida de peso - Semana 1"
                        value={newPlanData.name}
                        onChange={(e) => setNewPlanData({...newPlanData, name: e.target.value})}
                        required
                      />
                    </div>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Descripción</label>
                    <textarea 
                      className="form-control" 
                      rows={2} 
                      placeholder="Describe el objetivo del plan..."
                      value={newPlanData.description || ''}
                      onChange={(e) => setNewPlanData({...newPlanData, description: e.target.value})}
                    ></textarea>
                  </div>
                  <div className="row">
                    <div className="col-md-3 mb-3">
                      <label className="form-label">Fecha de inicio *</label>
                      <input 
                        type="date" 
                        className="form-control"
                        value={newPlanData.startDate}
                        onChange={(e) => setNewPlanData({...newPlanData, startDate: e.target.value})}
                        required
                      />
                    </div>
                    <div className="col-md-3 mb-3">
                      <label className="form-label">Fecha de fin *</label>
                      <input 
                        type="date" 
                        className="form-control"
                        value={newPlanData.endDate}
                        onChange={(e) => setNewPlanData({...newPlanData, endDate: e.target.value})}
                        required
                      />
                    </div>
                    <div className="col-md-3 mb-3">
                      <label className="form-label">Número de semanas</label>
                      <input 
                        type="number" 
                        className="form-control" 
                        placeholder="1"
                        min="1"
                        max="12"
                        value={newPlanData.totalWeeks || 1}
                        onChange={(e) => setNewPlanData({...newPlanData, totalWeeks: parseInt(e.target.value) || 1})}
                      />
                    </div>
                    <div className="col-md-3 mb-3">
                      <label className="form-label">Calorías por día</label>
                      <input 
                        type="number" 
                        className="form-control" 
                        placeholder="1500"
                        value={newPlanData.dailyCaloriesTarget || ''}
                        onChange={(e) => setNewPlanData({...newPlanData, dailyCaloriesTarget: parseInt(e.target.value) || 0})}
                      />
                    </div>
                  </div>
                  <div className="row">
                    <div className="col-md-4 mb-3">
                      <label className="form-label">Proteínas (g)</label>
                      <input 
                        type="number" 
                        className="form-control" 
                        placeholder="120"
                        value={newPlanData.dailyMacrosTarget?.protein || ''}
                        onChange={(e) => setNewPlanData({
                          ...newPlanData, 
                          dailyMacrosTarget: {
                            ...newPlanData.dailyMacrosTarget,
                            protein: parseInt(e.target.value) || 0
                          }
                        })}
                      />
                    </div>
                    <div className="col-md-4 mb-3">
                      <label className="form-label">Carbohidratos (g)</label>
                      <input 
                        type="number" 
                        className="form-control" 
                        placeholder="150"
                        value={newPlanData.dailyMacrosTarget?.carbohydrates || ''}
                        onChange={(e) => setNewPlanData({
                          ...newPlanData, 
                          dailyMacrosTarget: {
                            ...newPlanData.dailyMacrosTarget,
                            carbohydrates: parseInt(e.target.value) || 0
                          }
                        })}
                      />
                    </div>
                    <div className="col-md-4 mb-3">
                      <label className="form-label">Grasas (g)</label>
                      <input 
                        type="number" 
                        className="form-control" 
                        placeholder="50"
                        value={newPlanData.dailyMacrosTarget?.fats || ''}
                        onChange={(e) => setNewPlanData({
                          ...newPlanData, 
                          dailyMacrosTarget: {
                            ...newPlanData.dailyMacrosTarget,
                            fats: parseInt(e.target.value) || 0
                          }
                        })}
                      />
                    </div>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Notas adicionales</label>
                    <textarea 
                      className="form-control" 
                      rows={3} 
                      placeholder="Información adicional sobre el plan..."
                      value={newPlanData.notes || ''}
                      onChange={(e) => setNewPlanData({...newPlanData, notes: e.target.value})}
                    ></textarea>
                  </div>
                </form>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowPlanModal(false)}>
                  Cancelar
                </button>
                <button type="button" className="btn btn-outline-success me-2" disabled title="La generación automática con IA estará disponible próximamente.">
                  <Sparkles size={16} className="me-1" />
                  Generar con IA
                </button>
                <button type="button" className="btn btn-primary" onClick={handleCreateDietPlan}>
                  <Calendar size={16} className="me-1" />
                  Crear Plan Semanal
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
                <h5 className="modal-title">Detalle del Plan Semanal</h5>
                <button type="button" className="btn-close" onClick={() => setShowPlanDetail(false)}></button>
              </div>
              <div className="modal-body">
                <div className="row">
                  <div className="col-md-8">
                    <h4>{selectedPlan.name}</h4>
                    <p className="text-muted">{selectedPlan.description}</p>
                    <div className="mb-3">
                      <strong>Paciente:</strong> {getPatientName(selectedPlan)}
                    </div>
                    <div className="mb-3">
                      <strong>Duración:</strong> {calculatePlanDuration(selectedPlan.start_date, selectedPlan.end_date)}
                    </div>
                      <div className="mb-3">
                      <strong>Semanas:</strong> {selectedPlan.total_weeks || 1} semana{(selectedPlan.total_weeks || 1) !== 1 ? 's' : ''}
                      </div>
                    <div className="mb-3">
                      <strong>Notas:</strong>
                      <p className="text-muted">{selectedPlan.notes || 'Sin notas'}</p>
                    </div>
                  </div>
                  <div className="col-md-4">
                    <div className="card">
                      <div className="card-body">
                        <h6 className="card-title">Información Nutricional</h6>
                        <div className="mb-2">
                          <strong>Calorías diarias:</strong>
                          <span className="float-end">{formatCalories(selectedPlan.target_calories)}</span>
                        </div>
                        <div className="mb-2">
                          <strong>Proteínas:</strong>
                          <span className="float-end">{selectedPlan.target_protein ? `${selectedPlan.target_protein}g` : 'N/A'}</span>
                        </div>
                        <div className="mb-2">
                          <strong>Carbohidratos:</strong>
                          <span className="float-end">{selectedPlan.target_carbs ? `${selectedPlan.target_carbs}g` : 'N/A'}</span>
                        </div>
                        <div className="mb-2">
                          <strong>Grasas:</strong>
                          <span className="float-end">{selectedPlan.target_fats ? `${selectedPlan.target_fats}g` : 'N/A'}</span>
                        </div>
                        <hr />
                        <div className="mb-2">
                          <strong>Estado:</strong>
                          <span className="float-end">{getStatusBadge(selectedPlan.status)}</span>
                        </div>
                        <div className="mb-2">
                          <strong>Creado:</strong>
                          <span className="float-end">
                            {formatDate(selectedPlan.created_at)}
                          </span>
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
                <button type="button" className="btn btn-outline-success" onClick={() => handleDownloadPDF(selectedPlan)}>
                  <Download size={16} className="me-1" />
                  Descargar PDF
                </button>
                <button type="button" className="btn btn-primary" onClick={() => handleEditPlan(selectedPlan)}>
                  <Edit size={16} className="me-1" />
                  Editar Plan
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal for Editing Plan */}
      {showPlanModal && editingPlan && (
        <div className="modal fade show d-block" tabIndex={-1} style={{backgroundColor: 'rgba(0,0,0,0.5)'}}>
          <div className="modal-dialog modal-xl">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Editar Plan Nutricional</h5>
                <button type="button" className="btn-close" onClick={() => setShowPlanModal(false)}></button>
              </div>
              <div className="modal-body">
                <form>
                <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Paciente *</label>
                      <select 
                        className="form-select"
                        value={newPlanData.patientId}
                        onChange={(e) => setNewPlanData({...newPlanData, patientId: e.target.value})}
                        required
                      >
                        <option value="">Seleccionar paciente...</option>
                        {patients.map(patient => (
                          <option key={patient.id} value={patient.id}>
                            {patient.first_name} {patient.last_name}
                          </option>
                        ))}
                      </select>
                      </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Nombre del plan *</label>
                      <input 
                        type="text" 
                        className="form-control" 
                        placeholder="Ej: Plan de pérdida de peso - Semana 1"
                        value={newPlanData.name}
                        onChange={(e) => setNewPlanData({...newPlanData, name: e.target.value})}
                        required
                      />
                          </div>
                          </div>
                  <div className="mb-3">
                    <label className="form-label">Descripción</label>
                    <textarea 
                      className="form-control" 
                      rows={2} 
                      placeholder="Describe el objetivo del plan..."
                      value={newPlanData.description || ''}
                      onChange={(e) => setNewPlanData({...newPlanData, description: e.target.value})}
                    ></textarea>
                          </div>
                  <div className="row">
                    <div className="col-md-3 mb-3">
                      <label className="form-label">Fecha de inicio *</label>
                      <input 
                        type="date" 
                        className="form-control"
                        value={newPlanData.startDate}
                        onChange={(e) => setNewPlanData({...newPlanData, startDate: e.target.value})}
                        required
                      />
                    </div>
                    <div className="col-md-3 mb-3">
                      <label className="form-label">Fecha de fin *</label>
                      <input 
                        type="date" 
                        className="form-control"
                        value={newPlanData.endDate}
                        onChange={(e) => setNewPlanData({...newPlanData, endDate: e.target.value})}
                        required
                      />
                    </div>
                    <div className="col-md-3 mb-3">
                      <label className="form-label">Número de semanas</label>
                      <input 
                        type="number" 
                        className="form-control" 
                        placeholder="1"
                        min="1"
                        max="12"
                        value={newPlanData.totalWeeks || 1}
                        onChange={(e) => setNewPlanData({...newPlanData, totalWeeks: parseInt(e.target.value) || 1})}
                      />
                    </div>
                    <div className="col-md-3 mb-3">
                      <label className="form-label">Calorías por día</label>
                      <input 
                        type="number" 
                        className="form-control" 
                        placeholder="1500"
                        value={newPlanData.dailyCaloriesTarget || ''}
                        onChange={(e) => setNewPlanData({...newPlanData, dailyCaloriesTarget: parseInt(e.target.value) || 0})}
                      />
                    </div>
                  </div>
                  <div className="row">
                    <div className="col-md-4 mb-3">
                      <label className="form-label">Proteínas (g)</label>
                      <input 
                        type="number" 
                        className="form-control" 
                        placeholder="120"
                        value={newPlanData.dailyMacrosTarget?.protein || ''}
                        onChange={(e) => setNewPlanData({
                          ...newPlanData, 
                          dailyMacrosTarget: {
                            ...newPlanData.dailyMacrosTarget,
                            protein: parseInt(e.target.value) || 0
                          }
                        })}
                      />
                    </div>
                    <div className="col-md-4 mb-3">
                      <label className="form-label">Carbohidratos (g)</label>
                      <input 
                        type="number" 
                        className="form-control" 
                        placeholder="150"
                        value={newPlanData.dailyMacrosTarget?.carbohydrates || ''}
                        onChange={(e) => setNewPlanData({
                          ...newPlanData, 
                          dailyMacrosTarget: {
                            ...newPlanData.dailyMacrosTarget,
                            carbohydrates: parseInt(e.target.value) || 0
                          }
                        })}
                      />
                    </div>
                    <div className="col-md-4 mb-3">
                      <label className="form-label">Grasas (g)</label>
                      <input 
                        type="number" 
                        className="form-control" 
                        placeholder="50"
                        value={newPlanData.dailyMacrosTarget?.fats || ''}
                        onChange={(e) => setNewPlanData({
                          ...newPlanData, 
                          dailyMacrosTarget: {
                            ...newPlanData.dailyMacrosTarget,
                            fats: parseInt(e.target.value) || 0
                          }
                        })}
                      />
                    </div>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Notas adicionales</label>
                    <textarea 
                      className="form-control" 
                      rows={3} 
                      placeholder="Información adicional sobre el plan..."
                      value={newPlanData.notes || ''}
                      onChange={(e) => setNewPlanData({...newPlanData, notes: e.target.value})}
                    ></textarea>
                  </div>
                </form>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowPlanModal(false)}>
                  Cancelar
                </button>
                <button type="button" className="btn btn-primary" onClick={handleUpdateDietPlan}>
                  <Edit size={16} className="me-1" />
                  Actualizar Plan
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

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