import React, { useState, useEffect } from 'react';
import { 
<<<<<<< HEAD
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
import { Button, Modal, Alert } from 'react-bootstrap';
import DietPlanViewer from '../components/DietPlanViewer';
=======
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
>>>>>>> nutri/main

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

<<<<<<< HEAD
const TempDietPlanCreator: React.FC<{
  patients: any[];
  onSubmit: (data: CreateDietPlanDto) => void;
  onCancel: () => void;
  onGenerateAI?: (data: GenerateAIDietDto) => void;
  loading?: boolean;
  initialData?: CreateDietPlanDto;
}> = ({ patients, onSubmit, onCancel, onGenerateAI, loading = false, initialData }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<CreateDietPlanDto>({
    patientId: '',
    name: '',
    description: '',
    startDate: '',
    endDate: '',
    dailyCaloriesTarget: 2000,
    dailyMacrosTarget: {
      protein: 150,
      carbohydrates: 200,
      fats: 67
    },
    notes: '',
    planType: 'weekly',
    planPeriod: 'weeks',
    totalPeriods: 1,
    pathologicalRestrictions: {
      medicalConditions: [],
      allergies: [],
      intolerances: [],
      medications: [],
      specialConsiderations: [],
      emergencyContacts: []
    },
    ...initialData
  });

  const steps = [
    { id: 1, title: 'Información Básica', icon: 'users' },
    { id: 2, title: 'Configuración de Tiempo', icon: 'clock' },
    { id: 3, title: 'Restricciones Patológicas', icon: 'shield' },
    { id: 4, title: 'Configuración de Comidas', icon: 'settings' },
    { id: 5, title: 'Objetivos Nutricionales', icon: 'target' },
    { id: 6, title: 'Revisión y Creación', icon: 'check' }
  ];

  const getPatientDisplayName = (patient: any) => {
    // Handle different patient data structures
    if (patient.user && patient.user.first_name) {
      return `${patient.user.first_name} ${patient.user.last_name || ''} - ${patient.user.email || ''}`;
    } else if (patient.first_name) {
      return `${patient.first_name} ${patient.last_name || ''} - ${patient.email || ''}`;
    } else {
      return `Paciente ${patient.id || 'Desconocido'}`;
    }
  };

  const validateForm = (): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];

    if (!formData.patientId) errors.push('Debe seleccionar un paciente');
    if (!formData.name) errors.push('Debe ingresar un nombre para el plan');
    if (!formData.startDate) errors.push('Debe seleccionar una fecha de inicio');

    return { isValid: errors.length === 0, errors };
  };

  const handleSubmit = () => {
    const validation = validateForm();
    if (!validation.isValid) {
      alert('Errores de validación:\n' + validation.errors.join('\n'));
      return;
    }

    onSubmit(formData);
  };

  const handleGenerateAI = () => {
    if (!onGenerateAI) return;
    
    const aiData: GenerateAIDietDto = {
      patientId: formData.patientId,
      name: formData.name,
      goal: 'weight_loss',
      startDate: formData.startDate,
      endDate: formData.endDate,
      planType: formData.planType,
      planPeriod: formData.planPeriod,
      totalPeriods: formData.totalPeriods,
      dailyCaloriesTarget: formData.dailyCaloriesTarget,
      dietaryRestrictions: formData.pathologicalRestrictions?.medicalConditions?.map(c => c.name) || [],
      allergies: formData.pathologicalRestrictions?.allergies?.map(a => a.allergen) || [],
      preferredFoods: [],
      dislikedFoods: [],
      notesForAI: formData.notes,
      customRequirements: []
    };

    onGenerateAI(aiData);
  };

  return (
    <div className="diet-plan-creator">
      <div className="card">
        <div className="card-header">
          <h5 className="mb-0">
            <Calendar size={20} className="me-2" />
            Crear Plan Nutricional
          </h5>
        </div>

        <div className="card-body">
          {/* Indicador de pasos */}
          <div className="progress-indicator mb-4">
            {/* Versión desktop */}
            <div className="d-none d-md-flex justify-content-between">
              {steps.map((step, index) => (
                <div key={step.id} className="d-flex align-items-center">
                  <div 
                    className={`step-circle ${currentStep === step.id ? 'active' : ''} ${
                      currentStep > step.id ? 'completed' : ''
                    }`}
                    onClick={() => setCurrentStep(step.id)}
                    style={{ cursor: 'pointer' }}
                  >
                    {currentStep > step.id ? (
                      <span>✓</span>
                    ) : (
                      <span>{step.id}</span>
                    )}
                  </div>
                  <div className="step-info ms-2">
                    <div className="step-title">{step.title}</div>
                  </div>
                  {index < steps.length - 1 && (
                    <div className={`step-line ${currentStep > step.id ? 'completed' : ''}`}></div>
                  )}
                </div>
              ))}
            </div>

            {/* Versión mobile */}
            <div className="d-md-none">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <div className="d-flex align-items-center">
                  <div 
                    className={`step-circle-mobile ${currentStep === 1 ? 'active' : ''} ${
                      currentStep > 1 ? 'completed' : ''
                    }`}
                    onClick={() => setCurrentStep(1)}
                  >
                    {currentStep > 1 ? '✓' : '1'}
                  </div>
                  <div className="step-line-mobile"></div>
                  <div 
                    className={`step-circle-mobile ${currentStep === 2 ? 'active' : ''} ${
                      currentStep > 2 ? 'completed' : ''
                    }`}
                    onClick={() => setCurrentStep(2)}
                  >
                    {currentStep > 2 ? '✓' : '2'}
                  </div>
                </div>
              </div>
              <div className="d-flex justify-content-between align-items-center mb-3">
                <div className="d-flex align-items-center">
                  <div 
                    className={`step-circle-mobile ${currentStep === 3 ? 'active' : ''} ${
                      currentStep > 3 ? 'completed' : ''
                    }`}
                    onClick={() => setCurrentStep(3)}
                  >
                    {currentStep > 3 ? '✓' : '3'}
                  </div>
                  <div className="step-line-mobile"></div>
                  <div 
                    className={`step-circle-mobile ${currentStep === 4 ? 'active' : ''} ${
                      currentStep > 4 ? 'completed' : ''
                    }`}
                    onClick={() => setCurrentStep(4)}
                  >
                    {currentStep > 4 ? '✓' : '4'}
                  </div>
                </div>
              </div>
              
              {/* Título del paso actual en mobile */}
              <div className="text-center">
                <h6 className="mb-0 text-primary fw-bold">
                  {steps[currentStep - 1]?.title}
                </h6>
                <small className="text-muted">
                  Paso {currentStep} de {steps.length}
                </small>
              </div>
            </div>
          </div>

          {/* Paso 1: Información Básica */}
          {currentStep === 1 && (
            <div className="step-content">
              <h6 className="mb-3">
                <Users size={16} className="me-2" />
                Información Básica del Plan
              </h6>
              
              <div className="row">
                <div className="col-md-6 mb-3">
                  <label className="form-label">Paciente *</label>
                  <select 
                    className="form-select"
                    value={formData.patientId}
                    onChange={(e) => setFormData({...formData, patientId: e.target.value})}
                    required
                  >
                    <option value="">Seleccionar paciente</option>
                    {patients.map((patient) => (
                      <option key={patient.id} value={patient.id}>
                        {getPatientDisplayName(patient)}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="col-md-6 mb-3">
                  <label className="form-label">Nombre del Plan *</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    placeholder="Ej: Plan de Equilibrio y Energía"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    required
                  />
                </div>
              </div>

              <div className="mb-3">
                <label className="form-label">Descripción</label>
                <textarea 
                  className="form-control" 
                  rows={3} 
                  placeholder="Describe el objetivo y características del plan..."
                  value={formData.description || ''}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                ></textarea>
              </div>

              <div className="row">
                <div className="col-md-6 mb-3">
                  <label className="form-label">Fecha de Inicio *</label>
                  <input 
                    type="date" 
                    className="form-control"
                    value={formData.startDate}
                    onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                    required
                  />
                </div>
                <div className="col-md-6 mb-3">
                  <label className="form-label">Fecha de Fin</label>
                  <input 
                    type="date" 
                    className="form-control"
                    value={formData.endDate}
                    onChange={(e) => setFormData({...formData, endDate: e.target.value})}
                  />
                  <small className="text-muted">Opcional - se calcula automáticamente</small>
                </div>
              </div>
            </div>
          )}

          {/* Paso 2: Configuración de Tiempo */}
          {currentStep === 2 && (
            <div className="step-content">
              <h6 className="mb-3">
                <Clock size={16} className="me-2" />
                Configuración de Tiempo
              </h6>
              
              <div className="row">
                <div className="col-md-4 mb-3">
                  <label className="form-label">Tipo de Plan</label>
                  <select 
                    className="form-select"
                    value={formData.planType}
                    onChange={(e) => setFormData({...formData, planType: e.target.value as PlanType})}
                  >
                    <option value="daily">Plan Diario</option>
                    <option value="weekly">Plan Semanal</option>
                    <option value="monthly">Plan Mensual</option>
                    <option value="custom">Plan Personalizado</option>
                    <option value="flexible">Plan Flexible</option>
                  </select>
                </div>
                <div className="col-md-4 mb-3">
                  <label className="form-label">Período</label>
                  <select 
                    className="form-select"
                    value={formData.planPeriod}
                    onChange={(e) => setFormData({...formData, planPeriod: e.target.value as PlanPeriod})}
                  >
                    <option value="days">Días</option>
                    <option value="weeks">Semanas</option>
                    <option value="months">Meses</option>
                    <option value="quarters">Trimestres</option>
                    <option value="years">Años</option>
                  </select>
                </div>
                <div className="col-md-4 mb-3">
                  <label className="form-label">Número de Períodos</label>
                  <input 
                    type="number" 
                    className="form-control" 
                    placeholder="1"
                    min="1"
                    value={formData.totalPeriods}
                    onChange={(e) => setFormData({...formData, totalPeriods: parseInt(e.target.value) || 1})}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Paso 3: Restricciones Patológicas */}
          {currentStep === 3 && (
            <div className="step-content">
              <h6 className="mb-3">
                <Shield size={16} className="me-2" />
                Restricciones Patológicas
              </h6>
              
              <div className="alert alert-info">
                <div className="d-flex align-items-center">
                  <Database className="me-2" size={20} />
                  <div>
                    <strong>Información:</strong> Las restricciones patológicas se extraen automáticamente del perfil del paciente y expedientes clínicos.
                    <br />
                    <small>Esta funcionalidad está en desarrollo.</small>
                  </div>
                </div>
              </div>

              <div className="alert alert-warning">
                <AlertTriangle className="me-2" size={16} />
                <strong>Nota:</strong> Por ahora, las restricciones patológicas se configurarán automáticamente al crear el plan.
              </div>
            </div>
          )}

          {/* Paso 4: Configuración de Comidas */}
          {currentStep === 4 && (
            <div className="step-content">
              <h6 className="mb-3">
                <Settings size={16} className="me-2" />
                Configuración de Comidas
              </h6>
              
              <div className="alert alert-info">
                <div className="d-flex align-items-center">
                  <Settings className="me-2" size={20} />
                  <div>
                    <strong>Configuración automática:</strong> Las comidas se configurarán automáticamente según el tipo de plan seleccionado.
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Paso 5: Objetivos Nutricionales */}
          {currentStep === 5 && (
            <div className="step-content">
              <h6 className="mb-3">
                <Target size={16} className="me-2" />
                Objetivos Nutricionales
              </h6>
              
              <div className="row">
                <div className="col-md-6 mb-3">
                  <label className="form-label">Calorías Diarias Objetivo</label>
                  <input 
                    type="number" 
                    className="form-control"
                    placeholder="2000"
                    value={formData.dailyCaloriesTarget}
                    onChange={(e) => setFormData({...formData, dailyCaloriesTarget: parseInt(e.target.value) || 2000})}
                  />
                </div>
                <div className="col-md-6 mb-3">
                  <label className="form-label">Proteínas (g)</label>
                  <input 
                    type="number" 
                    className="form-control"
                    placeholder="150"
                    value={formData.dailyMacrosTarget?.protein}
                    onChange={(e) => setFormData({
                      ...formData, 
                      dailyMacrosTarget: {
                        ...formData.dailyMacrosTarget,
                        protein: parseInt(e.target.value) || 150
                      }
                    })}
                  />
                </div>
              </div>

              <div className="row">
                <div className="col-md-6 mb-3">
                  <label className="form-label">Carbohidratos (g)</label>
                  <input 
                    type="number" 
                    className="form-control"
                    placeholder="200"
                    value={formData.dailyMacrosTarget?.carbohydrates}
                    onChange={(e) => setFormData({
                      ...formData, 
                      dailyMacrosTarget: {
                        ...formData.dailyMacrosTarget,
                        carbohydrates: parseInt(e.target.value) || 200
                      }
                    })}
                  />
                </div>
                <div className="col-md-6 mb-3">
                  <label className="form-label">Grasas (g)</label>
                  <input 
                    type="number" 
                    className="form-control"
                    placeholder="67"
                    value={formData.dailyMacrosTarget?.fats}
                    onChange={(e) => setFormData({
                      ...formData, 
                      dailyMacrosTarget: {
                        ...formData.dailyMacrosTarget,
                        fats: parseInt(e.target.value) || 67
                      }
                    })}
                  />
                </div>
              </div>

              <div className="mb-3">
                <label className="form-label">Notas Adicionales</label>
                <textarea 
                  className="form-control" 
                  rows={3} 
                  placeholder="Notas adicionales sobre el plan..."
                  value={formData.notes || ''}
                  onChange={(e) => setFormData({...formData, notes: e.target.value})}
                ></textarea>
              </div>
            </div>
          )}

          {/* Paso 6: Revisión y Creación */}
          {currentStep === 6 && (
            <div className="step-content">
              <h6 className="mb-3">
                <Eye size={16} className="me-2" />
                Revisión y Creación
              </h6>
              
              <div className="alert alert-success">
                <div className="d-flex align-items-center">
                  <CheckCircle className="me-2" size={20} />
                  <div>
                    <strong>Plan listo para crear:</strong> Revisa la información antes de proceder.
                  </div>
                </div>
              </div>

              <div className="row">
                <div className="col-md-6">
                  <h6>Información del Plan</h6>
                  <ul className="list-unstyled">
                    <li><strong>Nombre:</strong> {formData.name}</li>
                    <li><strong>Tipo:</strong> {formData.planType}</li>
                    <li><strong>Período:</strong> {formData.planPeriod}</li>
                    <li><strong>Duración:</strong> {formData.totalPeriods} períodos</li>
                    <li><strong>Calorías objetivo:</strong> {formData.dailyCaloriesTarget} kcal</li>
                  </ul>
                </div>
                <div className="col-md-6">
                  <h6>Macronutrientes</h6>
                  <ul className="list-unstyled">
                    <li><strong>Proteínas:</strong> {formData.dailyMacrosTarget?.protein}g</li>
                    <li><strong>Carbohidratos:</strong> {formData.dailyMacrosTarget?.carbohydrates}g</li>
                    <li><strong>Grasas:</strong> {formData.dailyMacrosTarget?.fats}g</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Navegación */}
          <div className="d-flex flex-column flex-md-row justify-content-between align-items-center mt-4 gap-3">
            <div className="d-flex justify-content-center w-100 w-md-auto">
              {currentStep > 1 && (
                <button
                  type="button"
                  className="btn btn-outline-secondary"
                  onClick={() => setCurrentStep(currentStep - 1)}
                >
                  <i className="fas fa-arrow-left me-2"></i>
                  Anterior
                </button>
              )}
            </div>
            
            <div className="d-flex flex-column flex-sm-row gap-2 w-100 w-md-auto">
              {currentStep < steps.length && (
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => setCurrentStep(currentStep + 1)}
                >
                  Siguiente
                  <i className="fas fa-arrow-right ms-2"></i>
                </button>
              )}
              
              {currentStep === steps.length && (
                <>
                  {onGenerateAI && (
                    <button
                      type="button"
                      className="btn btn-outline-success"
                      onClick={handleGenerateAI}
                      disabled={loading}
                    >
                      <Sparkles size={16} className="me-1" />
                      <span className="d-none d-sm-inline">Generar con IA</span>
                      <span className="d-sm-none">IA</span>
                    </button>
                  )}
                  <button
                    type="button"
                    className="btn btn-success"
                    onClick={handleSubmit}
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                        <span className="d-none d-sm-inline">Creando...</span>
                        <span className="d-sm-none">Creando</span>
                      </>
                    ) : (
                      <>
                        <Calendar size={16} className="me-1" />
                        <span className="d-none d-sm-inline">Crear Plan</span>
                        <span className="d-sm-none">Crear</span>
                      </>
                    )}
                  </button>
                </>
              )}
              
              <button
                type="button"
                className="btn btn-outline-danger"
                onClick={onCancel}
                disabled={loading}
              >
                <X size={16} className="me-1" />
                <span className="d-none d-sm-inline">Cancelar</span>
                <span className="d-sm-none">Cancelar</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .diet-plan-creator {
          max-width: 100%;
        }
        .progress-indicator {
          background: #fff;
          padding: 1.5rem;
          border-radius: 1rem;
          border: 1px solid #dee2e6;
          box-shadow: none;
        }
        /* Desktop styles */
        .step-circle {
          width: 45px;
          height: 45px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #fff;
          border: 2px solid #dee2e6;
          font-weight: bold;
          color: #495057;
          transition: all 0.3s ease;
          box-shadow: none;
        }
        .step-circle.active {
          border-color: #212529;
          color: #212529;
          background: #fff;
        }
        .step-circle.completed {
          border-color: #dee2e6;
          color: #212529;
          background: #fff;
        }
        .step-info {
          min-width: 140px;
        }
        .step-title {
          font-weight: 600;
          font-size: 0.9rem;
          color: #495057;
          white-space: nowrap;
        }
        .step-line {
          width: 80px;
          height: 2px;
          background: #dee2e6;
          margin: 0 1rem;
          transition: background 0.3s ease;
          border-radius: 2px;
        }
        .step-line.completed {
          background: #dee2e6;
        }
        /* Mobile styles */
        .step-circle-mobile {
          width: 35px;
          height: 35px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #fff;
          border: 2px solid #dee2e6;
          font-weight: bold;
          color: #495057;
          transition: all 0.3s ease;
          font-size: 0.8rem;
          cursor: pointer;
        }
        .step-circle-mobile.active {
          border-color: #212529;
          color: #212529;
          background: #fff;
          transform: scale(1.1);
        }
        .step-circle-mobile.completed {
          border-color: #dee2e6;
          color: #212529;
          background: #fff;
        }
        .step-line-mobile {
          width: 40px;
          height: 2px;
          background: #dee2e6;
          margin: 0 0.5rem;
          border-radius: 1px;
        }
        .step-content {
          min-height: 350px;
          padding: 1rem 0;
        }
        .form-control, .form-select {
          border-radius: 0.5rem;
          border: 1.5px solid #e9ecef;
          background: #fff;
          color: #212529;
          transition: all 0.3s ease;
          padding: 0.75rem 1rem;
        }
        .form-control:focus, .form-select:focus {
          border-color: #212529;
          box-shadow: none;
          background: #fff;
          color: #212529;
        }
        .btn {
          border-radius: 0.5rem;
          padding: 0.75rem 1.5rem;
          font-weight: 600;
          transition: all 0.3s ease;
          border: none;
        }
        .btn-primary, .btn-success, .btn-outline-secondary, .btn-outline-danger, .btn-outline-success {
          background: #fff;
          color: #212529;
          border: 1.5px solid #dee2e6;
        }
        .btn:hover {
          background: #f8f9fa;
          color: #212529;
        }
        .card {
          border-radius: 1rem;
          border: 1px solid #dee2e6;
          background: #fff;
          color: #212529;
          box-shadow: none;
        }
        .card-header {
          background: #fff;
          border-bottom: 1px solid #dee2e6;
          border-radius: 1rem 1rem 0 0 !important;
          padding: 1.25rem 1.5rem;
        }
        .card-body {
          padding: 1.5rem;
        }
        .alert {
          border-radius: 0.75rem;
          border: none;
          padding: 1rem 1.25rem;
          background: #f8f9fa;
          color: #495057;
        }
        @media (max-width: 768px) {
          .progress-indicator {
            padding: 1rem;
            border-radius: 0.75rem;
          }
          .step-circle {
            width: 40px;
            height: 40px;
            font-size: 0.9rem;
          }
          .step-info {
            min-width: 120px;
          }
          .step-title {
            font-size: 0.8rem;
          }
          .step-line {
            width: 60px;
            margin: 0 0.75rem;
          }
          .step-content {
            min-height: 300px;
            padding: 0.75rem 0;
          }
          .card-body {
            padding: 1rem;
          }
          .btn {
            padding: 0.6rem 1.2rem;
            font-size: 0.9rem;
          }
          .form-control, .form-select {
            padding: 0.6rem 0.8rem;
            font-size: 0.9rem;
          }
        }
        @media (max-width: 576px) {
          .progress-indicator {
            padding: 0.75rem;
          }
          .step-content {
            min-height: 250px;
          }
          .card-body {
            padding: 0.75rem;
          }
          .btn {
            padding: 0.5rem 1rem;
            font-size: 0.85rem;
          }
          .form-control, .form-select {
            padding: 0.5rem 0.75rem;
            font-size: 0.85rem;
          }
          .step-circle-mobile {
            width: 30px;
            height: 30px;
            font-size: 0.75rem;
          }
          .step-line-mobile {
            width: 30px;
            margin: 0 0.25rem;
          }
        }
        .step-content {
          animation: fadeInUp 0.3s ease-out;
        }
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .step-circle:focus,
        .step-circle-mobile:focus,
        .btn:focus,
        .form-control:focus,
        .form-select:focus {
          outline: 2px solid #212529;
          outline-offset: 2px;
        }
      `}</style>
    </div>
  );
};
=======
// Tarjetas Nutricionales implementadas y funcionales
// Uso temporal de DietPlanQuickCreate como interfaz mientras se integran completamente
>>>>>>> nutri/main

const DietPlansPage: React.FC = () => {
  const {
    dietPlans,
    loading,
    error,
    stats,
    fetchAllDietPlans,
    createDietPlan,
<<<<<<< HEAD
    generateDietPlanWithAI,
    updateDietPlan,
    deleteDietPlan,
=======
    updateDietPlan,
    deleteDietPlan,
    refreshStats,
>>>>>>> nutri/main
    clearError,
    setError
  } = useDietPlans();
  
  const { patients } = usePatients();
<<<<<<< HEAD
=======
  const [allClinicalRecords, setAllClinicalRecords] = useState<any[]>([]);
>>>>>>> nutri/main
  
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
<<<<<<< HEAD

  // Load all diet plans for the nutritionist on mount
  useEffect(() => {
    fetchAllDietPlans();
  }, [fetchAllDietPlans]);
=======
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
>>>>>>> nutri/main

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

<<<<<<< HEAD
  const filteredRecipes = recipes.filter(recipe => {
    const searchTermLower = searchTerm.toLowerCase();
    const recipeName = (recipe.name ?? '').toLowerCase();
    const recipeCategory = (recipe.category ?? '').toLowerCase();
    
    return recipeName.includes(searchTermLower) ||
           recipeCategory.includes(searchTermLower);
  });
=======
  // const filteredRecipes = recipes.filter(recipe => {
  //   const searchTermLower = searchTerm.toLowerCase();
  //   const recipeName = (recipe.name ?? '').toLowerCase();
  //   const recipeCategory = (recipe.category ?? '').toLowerCase();
    
  //   return recipeName.includes(searchTermLower) ||
  //          recipeCategory.includes(searchTermLower);
  // });
>>>>>>> nutri/main

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

<<<<<<< HEAD
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

=======
>>>>>>> nutri/main
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

<<<<<<< HEAD
  const handleUpdateDietPlan = async () => {
    if (!editingPlan) return;
    
    try {
      const validation = validateDietPlanData(editingPlan);
=======
  const handleUpdateDietPlan = async (formData: CreateDietPlanDto) => {
    if (!editingPlan) return;
    
    try {
      const validation = validateDietPlanData(formData);
>>>>>>> nutri/main
      if (!validation.isValid) {
        setError('Errores de validación:\n' + validation.errors.join('\n'));
        return;
      }

<<<<<<< HEAD
      await updateDietPlan(editingPlan.id, editingPlan);
      setEditingPlan(null);
=======
      await updateDietPlan(editingPlan.id, formData);
      setEditingPlan(null);
      setShowPlanModal(false);
>>>>>>> nutri/main
      clearError();
    } catch (error: any) {
      setError(error.message || 'Error al actualizar el plan de dieta');
    }
  };

<<<<<<< HEAD
  const handleDeletePlan = async (planId: string) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este plan?')) {
      try {
        await deleteDietPlan(planId);
        clearError();
      } catch (error: any) {
=======
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
>>>>>>> nutri/main
        setError(error.message || 'Error al eliminar el plan');
      }
    }
  };

<<<<<<< HEAD
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
=======
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
>>>>>>> nutri/main
  };

  const handleEditPlan = (plan: DietPlan) => {
    setEditingPlan(plan);
    setShowPlanModal(true);
  };

  const handleViewPlan = (plan: DietPlan) => {
    setSelectedPlan(plan);
    setShowPlanDetail(true);
  };

<<<<<<< HEAD
=======
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

>>>>>>> nutri/main
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
<<<<<<< HEAD
                <strong>Información:</strong> Puedes crear, editar, eliminar y descargar planes de dieta. 
                <span className="d-none d-md-inline"> La generación automática con IA estará disponible próximamente.</span>
                <span className="d-md-none"> IA próximamente.</span>
                <span className="d-none d-lg-inline"> Gestión de recetas y plantillas: en desarrollo.</span>
=======
                <strong>¡Nuevas funcionalidades implementadas!</strong> 
                <span className="d-none d-md-inline"> Gestión completa de recetas, plantillas predefinidas y actualización en tiempo real.</span>
                <span className="d-md-none"> Recetas y plantillas disponibles.</span>
                <span className="d-none d-lg-inline"> La generación automática con IA estará disponible próximamente.</span>
>>>>>>> nutri/main
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
<<<<<<< HEAD
                <button className="btn btn-sm btn-outline-secondary">
                  <Download size={16} className="me-1" />
                  <span className="d-none d-sm-inline">Exportar</span>
                </button>
                <button className="btn btn-sm btn-outline-primary">
=======
                <button 
                  className="btn btn-sm btn-outline-primary"
                  onClick={handleRefreshData}
                  disabled={loading}
                >
>>>>>>> nutri/main
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
<<<<<<< HEAD
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
=======
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
>>>>>>> nutri/main
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
<<<<<<< HEAD
                            className="btn btn-sm btn-outline-success flex-fill"
                            onClick={() => handleDownloadPDF(plan)}
                          >
                            <Download size={14} className="me-1" />
=======
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
>>>>>>> nutri/main
                            PDF
                          </button>
                          <button
                            className="btn btn-sm btn-outline-danger"
<<<<<<< HEAD
                            onClick={() => handleDeletePlan(plan.id)}
=======
                            onClick={(e) => handleDeletePlan(plan.id, e)}
                            type="button"
                            title="Eliminar plan"
>>>>>>> nutri/main
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
<<<<<<< HEAD
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
=======
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
>>>>>>> nutri/main
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
<<<<<<< HEAD
          <TempDietPlanCreator
            patients={patients}
            onSubmit={editingPlan ? handleUpdateDietPlan : handleCreateDietPlan}
            onCancel={() => {
              setShowPlanModal(false);
              setEditingPlan(null);
            }}
            onGenerateAI={handleGenerateAIPlan}
            loading={loading}
            initialData={editingPlan ? transformDietPlanToFormData(editingPlan) : undefined}
=======
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
>>>>>>> nutri/main
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
<<<<<<< HEAD
=======

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
>>>>>>> nutri/main
    </div>
  );
};

export default DietPlansPage; 