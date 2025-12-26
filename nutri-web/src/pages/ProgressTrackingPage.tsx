import React, { useState, useEffect } from 'react';
import { TrendingUp, Scale, Target, Calendar, Plus, ArrowLeft, BarChart3, User, Activity, Flame } from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';
import EnhancedEvolutionChart from '../components/ProgressCharts/EnhancedEvolutionChart';
// import ProgressMetrics from '../components/ProgressCharts/ProgressMetrics'; // Unused
import { usePatients } from '../hooks/usePatients';
import patientsService from '../services/patientsService';
import { MetricCard } from '../components/Progress/MetricCard';
import { BeforeAfterCard } from '../components/Progress/BeforeAfterCard';
import { SimpleGoal } from '../components/Progress/SimpleGoal';
import { PhotoComparison } from '../components/Progress/PhotoComparison';
import { InsightsPanel } from '../components/Progress/InsightsPanel';
import '../styles/progress-modern.css';

interface ProgressEntry {
  id: string;
  patient_name: string;
  patient_id: string;
  date: string;
  weight: number;
  body_fat: number;
  muscle_mass: number;
  waist: number;
  notes: string;
  progress_photos?: string[];
}

const ProgressTrackingPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const { patients } = usePatients();
  const [progressEntries, setProgressEntries] = useState<ProgressEntry[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'charts' | 'history' | 'analysis'>('overview');
  const [loading, setLoading] = useState(false);
  const [analysisData, setAnalysisData] = useState<any>(null);
  const [autoGenerating, setAutoGenerating] = useState(false);

  useEffect(() => {
    const patientId = searchParams.get('patient');
    if (patientId) {
      setSelectedPatient(patientId);
      console.log('🎯 Paciente seleccionado desde URL:', patientId);
    }
  }, [searchParams]);

  // Función auxiliar para obtener el nombre del paciente
  const getPatientName = (patientId: string): string => {
    const patient = patients.find(p => p.id === patientId);
    return patient ? `${patient.first_name} ${patient.last_name}` : 'Paciente';
  };

  // Cargar datos cuando se selecciona un paciente
  useEffect(() => {
    // Función para cargar datos de progreso reales
    const loadProgressData = async () => {
      if (!selectedPatient) return;

      setLoading(true);
      try {
        console.log('📊 Cargando datos de progreso para paciente:', selectedPatient);
        const progressData = await patientsService.getPatientProgress(selectedPatient);

        // Transformar datos de la API al formato esperado por el componente
        const transformedEntries: ProgressEntry[] = progressData.map((progress: any) => ({
          id: progress.id,
          patient_name: getPatientName(selectedPatient),
          patient_id: selectedPatient,
          date: progress.date,
          weight: progress.weight || 0,
          body_fat: progress.body_fat_percentage || 0,
          muscle_mass: progress.muscle_mass_percentage || 0,
          waist: progress.measurements?.waist || 0,
          notes: progress.notes || '',
          progress_photos: progress.photos || []
        }));

        setProgressEntries(transformedEntries);
        console.log('✅ Datos de progreso cargados:', transformedEntries);
      } catch (error) {
        console.error('❌ Error al cargar datos de progreso:', error);
        // En caso de error, mostrar array vacío en lugar de datos ficticios
        setProgressEntries([]);
      } finally {
        setLoading(false);
      }
    };

    if (selectedPatient && patients.length > 0) {
      loadProgressData();
    }
  }, [selectedPatient, patients]);

  // --- NUEVA FUNCIÓN PARA GENERAR ANÁLISIS AUTOMÁTICO ---
  const generateAutomaticProgress = async () => {
    if (!selectedPatient) return;

    setAutoGenerating(true);
    try {
      console.log('🤖 Generando análisis automático de progreso...');
      const result = await patientsService.generateAutomaticProgress(selectedPatient);

      console.log('✅ Análisis automático generado:', result);

      // Validar que la respuesta tenga la estructura correcta
      if (!result || typeof result !== 'object') {
        throw new Error('Respuesta inválida del servidor');
      }

      // Establecer datos de análisis
      setAnalysisData(result.analysis || {});

      // Actualizar los datos de progreso con los nuevos logs generados (si existen)
      if (result.logs && Array.isArray(result.logs) && result.logs.length > 0) {
        const transformedEntries: ProgressEntry[] = result.logs.map((progress: any) => ({
          id: progress.id || `temp-${Date.now()}`,
          patient_name: getPatientName(selectedPatient),
          patient_id: selectedPatient,
          date: progress.date || new Date().toISOString().split('T')[0],
          weight: progress.weight || 0,
          body_fat: progress.body_fat_percentage || 0,
          muscle_mass: progress.muscle_mass_percentage || 0,
          waist: progress.measurements?.waist || 0,
          notes: progress.notes || 'Generado automáticamente',
          progress_photos: progress.photos || []
        }));

        setProgressEntries(transformedEntries);
        console.log('📊 Datos de progreso actualizados:', transformedEntries);
      } else {
        console.log('ℹ️ No se generaron nuevos logs de progreso');
      }

      setActiveTab('analysis'); // Cambiar a la pestaña de análisis

      // Mostrar notificación de éxito
      const basedOnInfo = result.basedOn || {};
      alert(`✅ Análisis automático generado exitosamente!\n\nBasado en:\n- ${basedOnInfo.clinicalRecords || 0} expedientes clínicos\n- Plan activo: ${basedOnInfo.activePlan || 'Ninguno'}`);

    } catch (error: any) {
      console.error('❌ Error al generar análisis automático:', error);
      const errorMessage = error?.message || 'Error desconocido';
      alert(`❌ Error al generar el análisis automático: ${errorMessage}\n\nVerifique que el paciente tenga expedientes clínicos.`);
    } finally {
      setAutoGenerating(false);
    }
  };

  // Cargar análisis si existe
  const loadAnalysis = async () => {
    if (!selectedPatient) return;

    try {
      const analysis = await patientsService.getProgressAnalysis(selectedPatient);
      setAnalysisData(analysis);
    } catch (error) {
      console.error('Error al cargar análisis:', error);
    }
  };

  // Cargar análisis cuando se selecciona la pestaña
  useEffect(() => {
    if (activeTab === 'analysis' && selectedPatient && !analysisData) {
      loadAnalysis();
    }
  }, [activeTab, selectedPatient]);

  // --- NUEVO: Generar análisis automáticamente al entrar a la página ---
  useEffect(() => {
    const autoGenerateAnalysis = async () => {
      if (selectedPatient && !analysisData && !autoGenerating) {
        console.log('🔄 Generando análisis automático al cargar la página...');
        await generateAutomaticProgress();
      }
    };

    // Pequeño delay para asegurar que los datos estén cargados
    const timer = setTimeout(autoGenerateAnalysis, 1000);
    return () => clearTimeout(timer);
  }, [selectedPatient, analysisData, autoGenerating]);

  const filteredEntries = selectedPatient
    ? progressEntries.filter(entry => entry.patient_id === selectedPatient)
    : progressEntries;



  const calculateBMI = (weight: number, height: number) => {
    const bmi = weight / ((height / 100) ** 2);
    return (bmi || 0).toFixed(1);
  };

  const selectedPatientData = patients.find(p => p.id.toString() === selectedPatient);
  const selectedPatientEntries = filteredEntries.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  const latestEntry = selectedPatientEntries[0];
  const previousEntry = selectedPatientEntries[1];

  return (
    <div className="container-fluid py-4">
      {/* Header */}
      <div className="row mb-4">
        <div className="col-md-8">
          <div className="d-flex align-items-center mb-2">
            <Link to="/dashboard" className="btn btn-outline-secondary me-3 d-md-none">
              <ArrowLeft size={18} />
            </Link>
            <div>
              <h1 className="h2 mb-1">Seguimiento de Progreso</h1>
              <p className="text-muted mb-0">Monitorea el progreso de tus pacientes con gráficos avanzados</p>
            </div>
          </div>
        </div>
        <div className="col-md-4 text-end">
          <div className="d-flex gap-2 justify-content-end">
            <button
              className="btn btn-primary"
              onClick={() => setShowAddModal(true)}
              disabled={!selectedPatient}
            >
              <Plus size={18} className="me-2" />
              Registrar Progreso
            </button>
          </div>
        </div>
      </div>

      {/* Patient Selector */}
      <div className="row mb-4">
        <div className="col-md-6">
          <label className="form-label">Seleccionar Paciente</label>
          <select
            className="form-select"
            value={selectedPatient || ''}
            onChange={(e) => setSelectedPatient(e.target.value)}
          >
            <option value="">Todos los pacientes</option>
            {patients.map(patient => (
              <option key={patient.id} value={patient.id.toString()}>
                {patient.first_name} {patient.last_name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Tabs */}
      <ul className="nav nav-tabs mb-4">
        <li className="nav-item">
          <button
            className={`nav-link ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            <Scale size={18} className="me-2" />
            Resumen General
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link ${activeTab === 'charts' ? 'active' : ''}`}
            onClick={() => setActiveTab('charts')}
          >
            <BarChart3 size={18} className="me-2" />
            Gráficos Avanzados
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link ${activeTab === 'history' ? 'active' : ''}`}
            onClick={() => setActiveTab('history')}
          >
            <Calendar size={18} className="me-2" />
            Historial Completo
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link ${activeTab === 'analysis' ? 'active' : ''}`}
            onClick={() => setActiveTab('analysis')}
          >
            <Target size={18} className="me-2" />
            Análisis Inteligente
          </button>
        </li>
      </ul>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <>
          {/* Modern Metric Cards */}
          {selectedPatient && selectedPatientData && latestEntry && (
            <>
              <div className="row mb-4 g-3">
                <div className="col-md-3">
                  <MetricCard
                    title="Peso Actual"
                    value={latestEntry.weight}
                    unit="kg"
                    change={previousEntry ? latestEntry.weight - previousEntry.weight : undefined}
                    icon={<Scale size={40} />}
                    gradient="weight"
                    isPositiveGood={false}
                  />
                </div>
                <div className="col-md-3">
                  <MetricCard
                    title="Grasa Corporal"
                    value={latestEntry.body_fat}
                    unit="%"
                    change={previousEntry ? latestEntry.body_fat - previousEntry.body_fat : undefined}
                    icon={<Flame size={40} />}
                    gradient="fat"
                    isPositiveGood={false}
                  />
                </div>
                <div className="col-md-3">
                  <MetricCard
                    title="Masa Muscular"
                    value={latestEntry.muscle_mass}
                    unit="kg"
                    change={previousEntry ? latestEntry.muscle_mass - previousEntry.muscle_mass : undefined}
                    icon={<Activity size={40} />}
                    gradient="muscle"
                    isPositiveGood={true}
                  />
                </div>
                <div className="col-md-3">
                  <MetricCard
                    title="IMC"
                    value={selectedPatientData.profile ? calculateBMI(latestEntry.weight, selectedPatientData.profile.height || 170) : '-'}
                    unit=""
                    icon={<Target size={40} />}
                    gradient="bmi"
                  />
                </div>
              </div>

              {/* Goal Card */}
              <div className="row mb-4">
                <div className="col-12">
                  <SimpleGoal
                    currentWeight={latestEntry.weight}
                    initialWeight={filteredEntries.length > 0 ? filteredEntries[filteredEntries.length - 1].weight : latestEntry.weight}
                    patientId={selectedPatient}
                  />
                </div>
              </div>

              {/* Before/After Comparison */}
              {filteredEntries.length >= 2 && (
                <div className="row mb-4">
                  <div className="col-12">
                    <BeforeAfterCard
                      firstMeasurement={{
                        weight: filteredEntries[filteredEntries.length - 1].weight,
                        body_fat: filteredEntries[filteredEntries.length - 1].body_fat,
                        muscle_mass: filteredEntries[filteredEntries.length - 1].muscle_mass,
                        date: filteredEntries[filteredEntries.length - 1].date
                      }}
                      latestMeasurement={{
                        weight: latestEntry.weight,
                        body_fat: latestEntry.body_fat,
                        muscle_mass: latestEntry.muscle_mass,
                        date: latestEntry.date
                      }}
                    />
                  </div>
                </div>
              )}

              {/* Photo Comparison */}
              <div className="row mb-4">
                <div className="col-12">
                  <PhotoComparison patientId={selectedPatient} />
                </div>
              </div>

              {/* Insights Panel */}
              <div className="row mb-4">
                <div className="col-12">
                  <InsightsPanel
                    entries={filteredEntries}
                    patientName={`${selectedPatientData.first_name} ${selectedPatientData.last_name}`}
                  />
                </div>
              </div>
            </>
          )}

          {/* Progress Entries Table */}
          <div className="card border-0 shadow-sm">
            <div className="card-header bg-white">
              <h5 className="card-title mb-0">Historial de Progreso</h5>
            </div>
            <div className="card-body p-0">
              {filteredEntries.length === 0 ? (
                <div className="text-center py-5">
                  <TrendingUp size={48} className="text-muted mb-3" />
                  <h5 className="text-muted">No hay registros de progreso</h5>
                  <p className="text-muted">
                    {selectedPatient ? 'Registra el primer progreso para este paciente' : 'Selecciona un paciente para ver su progreso'}
                  </p>
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover mb-0">
                    <thead className="table-light">
                      <tr>
                        <th>Fecha</th>
                        <th>Paciente</th>
                        <th>Peso (kg)</th>
                        <th>Grasa (%)</th>
                        <th>Músculo (kg)</th>
                        <th>Cintura (cm)</th>
                        <th>Notas</th>
                        <th>Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredEntries.map((entry) => (
                        <tr key={entry.id}>
                          <td>
                            <div className="d-flex align-items-center">
                              <Calendar size={16} className="me-2 text-muted" />
                              <span>{new Date(entry.date).toLocaleDateString('es-ES')}</span>
                            </div>
                          </td>
                          <td>
                            <div className="d-flex align-items-center">
                              <div className="bg-primary bg-opacity-10 rounded-circle p-2 me-2">
                                <User size={14} className="text-primary" />
                              </div>
                              <span>{entry.patient_name}</span>
                            </div>
                          </td>
                          <td>
                            <span className="fw-medium">{entry.weight}</span>
                          </td>
                          <td>
                            <span className="fw-medium text-warning">{entry.body_fat}%</span>
                          </td>
                          <td>
                            <span className="fw-medium text-success">{entry.muscle_mass}</span>
                          </td>
                          <td>
                            <span className="fw-medium">{entry.waist}</span>
                          </td>
                          <td>
                            <small className="text-muted">{entry.notes}</small>
                          </td>
                          <td>
                            <div className="btn-group btn-group-sm">
                              <button className="btn btn-outline-primary" title="Editar">
                                <Plus size={14} />
                              </button>
                              <button className="btn btn-outline-danger" title="Eliminar">
                                <Target size={14} />
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
        </>
      )}

      {activeTab === 'charts' && (
        <div className="row">
          <div className="col-12 mb-4">
            {selectedPatient && selectedPatientData ? (
              <EnhancedEvolutionChart
                data={filteredEntries}
                patientName={`${selectedPatientData.first_name} ${selectedPatientData.last_name}`}
              />
            ) : (
              <div className="text-center py-5">
                <BarChart3 size={48} className="text-muted mb-3" />
                <h5 className="text-muted">Selecciona un paciente</h5>
                <p className="text-muted">Para ver los gráficos de progreso, selecciona un paciente de la lista</p>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'history' && (
        <div className="card border-0 shadow-sm">
          <div className="card-header bg-white">
            <h5 className="card-title mb-0">Historial Completo de Progreso</h5>
          </div>
          <div className="card-body p-0">
            {filteredEntries.length === 0 ? (
              <div className="text-center py-5">
                <Calendar size={48} className="text-muted mb-3" />
                <h5 className="text-muted">No hay historial disponible</h5>
                <p className="text-muted">
                  {selectedPatient ? 'Registra el primer progreso para este paciente' : 'Selecciona un paciente para ver su historial'}
                </p>
              </div>
            ) : (
              <div className="table-responsive">
                <table className="table table-hover mb-0">
                  <thead className="table-light">
                    <tr>
                      <th>Fecha</th>
                      <th>Paciente</th>
                      <th>Peso (kg)</th>
                      <th>Grasa (%)</th>
                      <th>Músculo (kg)</th>
                      <th>Cintura (cm)</th>
                      <th>IMC</th>
                      <th>Notas</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredEntries.map((entry) => (
                      <tr key={entry.id}>
                        <td>
                          <div className="d-flex align-items-center">
                            <Calendar size={16} className="me-2 text-muted" />
                            <span>{new Date(entry.date).toLocaleDateString('es-ES')}</span>
                          </div>
                        </td>
                        <td>
                          <div className="d-flex align-items-center">
                            <div className="bg-primary bg-opacity-10 rounded-circle p-2 me-2">
                              <User size={14} className="text-primary" />
                            </div>
                            <span>{entry.patient_name}</span>
                          </div>
                        </td>
                        <td>
                          <span className="fw-medium">{entry.weight}</span>
                        </td>
                        <td>
                          <span className="fw-medium text-warning">{entry.body_fat}%</span>
                        </td>
                        <td>
                          <span className="fw-medium text-success">{entry.muscle_mass}</span>
                        </td>
                        <td>
                          <span className="fw-medium">{entry.waist}</span>
                        </td>
                        <td>
                          <span className="fw-medium text-info">
                            {selectedPatientData && selectedPatientData.profile
                              ? calculateBMI(Number(entry?.weight ?? 0), Number(selectedPatientData.profile.height) || 1)
                              : '-'}
                          </span>
                        </td>
                        <td>
                          <small className="text-muted">{entry.notes}</small>
                        </td>
                        <td>
                          <div className="btn-group btn-group-sm">
                            <button className="btn btn-outline-primary" title="Editar">
                              <Plus size={14} />
                            </button>
                            <button className="btn btn-outline-danger" title="Eliminar">
                              <Target size={14} />
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

      {activeTab === 'analysis' && (
        <div className="card border-0 shadow-sm">
          <div className="card-header bg-white">
            <h5 className="card-title mb-0">Análisis Inteligente de Progreso</h5>
          </div>
          <div className="card-body p-0">
            {loading ? (
              <div className="text-center py-5">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Cargando...</span>
                </div>
                <h5 className="text-muted">Generando análisis...</h5>
                <p className="text-muted">
                  Estamos analizando los datos de progreso del paciente para generar un informe detallado.
                </p>
              </div>
            ) : analysisData && Object.keys(analysisData).length > 0 ? (
              <div className="p-4">
                <h4 className="mb-3">Análisis de Progreso - {selectedPatientData?.first_name} {selectedPatientData?.last_name}</h4>

                {/* Análisis de Peso */}
                {analysisData.weightProgress && (
                  <div className="row mb-4">
                    <div className="col-md-6">
                      <div className="card">
                        <div className="card-header">
                          <h5 className="card-title mb-0">📊 Análisis de Peso</h5>
                        </div>
                        <div className="card-body">
                          <p><strong>Peso Actual:</strong> {analysisData.weightProgress.currentWeight ? `${analysisData.weightProgress.currentWeight} kg` : 'No disponible'}</p>
                          <p><strong>Peso Anterior:</strong> {analysisData.weightProgress.previousWeight ? `${analysisData.weightProgress.previousWeight} kg` : 'No disponible'}</p>
                          <p><strong>Cambio:</strong> {analysisData.weightProgress.weightChange ? `${analysisData.weightProgress.weightChange > 0 ? '+' : ''}${Number(analysisData.weightProgress.weightChange).toFixed(1)} kg` : 'Sin cambios'}</p>
                          <p><strong>Tendencia:</strong>
                            <span className={`badge ms-2 ${analysisData.weightProgress.trend === 'improving' ? 'bg-success' :
                              analysisData.weightProgress.trend === 'concerning' ? 'bg-danger' : 'bg-secondary'
                              }`}>
                              {analysisData.weightProgress.trend === 'improving' ? '↗ Mejorando' :
                                analysisData.weightProgress.trend === 'concerning' ? '↗ Preocupante' : '→ Estable'}
                            </span>
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="card">
                        <div className="card-header">
                          <h5 className="card-title mb-0">📏 Medidas Antropométricas</h5>
                        </div>
                        <div className="card-body">
                          <p><strong>IMC Actual:</strong> {analysisData.anthropometricProgress?.bmiCurrent ? Number(analysisData.anthropometricProgress.bmiCurrent).toFixed(1) : 'No disponible'}</p>
                          <p><strong>IMC Anterior:</strong> {analysisData.anthropometricProgress?.bmiPrevious ? Number(analysisData.anthropometricProgress.bmiPrevious).toFixed(1) : 'No disponible'}</p>
                          <p><strong>Cambio Cintura:</strong> {analysisData.anthropometricProgress?.waistChange ? `${analysisData.anthropometricProgress.waistChange > 0 ? '+' : ''}${Number(analysisData.anthropometricProgress.waistChange).toFixed(1)} cm` : 'Sin cambios'}</p>
                          <p><strong>Composición Corporal:</strong>
                            <span className={`badge ms-2 ${analysisData.anthropometricProgress?.bodyCompositionTrend === 'improving' ? 'bg-success' :
                              analysisData.anthropometricProgress?.bodyCompositionTrend === 'concerning' ? 'bg-danger' : 'bg-secondary'
                              }`}>
                              {analysisData.anthropometricProgress?.bodyCompositionTrend === 'improving' ? '↗ Mejorando' :
                                analysisData.anthropometricProgress?.bodyCompositionTrend === 'concerning' ? '↗ Preocupante' : '→ Estable'}
                            </span>
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Análisis del Plan */}
                {analysisData.dietPlanAdherence && (
                  <div className="row mb-4">
                    <div className="col-12">
                      <div className="card">
                        <div className="card-header">
                          <h5 className="card-title mb-0">🍎 Adherencia al Plan Nutricional</h5>
                        </div>
                        <div className="card-body">
                          <p><strong>Plan Actual:</strong> {analysisData.dietPlanAdherence.currentPlan?.name || 'Sin plan activo'}</p>
                          <p><strong>Duración del Plan:</strong> {analysisData.dietPlanAdherence.planDuration || 0} días</p>
                          <p><strong>Progreso Esperado:</strong> {analysisData.dietPlanAdherence.expectedProgress}</p>
                          <p><strong>Estado:</strong>
                            <span className={`badge ms-2 ${analysisData.dietPlanAdherence.actualVsExpected === 'on_track' ? 'bg-success' :
                              analysisData.dietPlanAdherence.actualVsExpected === 'ahead' ? 'bg-info' : 'bg-warning'
                              }`}>
                              {analysisData.dietPlanAdherence.actualVsExpected === 'on_track' ? '✅ En meta' :
                                analysisData.dietPlanAdherence.actualVsExpected === 'ahead' ? '🚀 Adelantado' : '⚠️ Atrasado'}
                            </span>
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Recomendaciones */}
                {analysisData.recommendations && (
                  <div className="row mb-4">
                    <div className="col-12">
                      <div className="card">
                        <div className="card-header">
                          <h5 className="card-title mb-0">💡 Recomendaciones</h5>
                        </div>
                        <div className="card-body">
                          {analysisData.recommendations.positiveFactors && analysisData.recommendations.positiveFactors.length > 0 && (
                            <div className="mb-3">
                              <h6 className="text-success">✅ Factores Positivos</h6>
                              <ul className="list-unstyled">
                                {analysisData.recommendations.positiveFactors.map((factor: string, index: number) => (
                                  <li key={index} className="text-success">• {factor}</li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {analysisData.recommendations.concernFlags && analysisData.recommendations.concernFlags.length > 0 && (
                            <div className="mb-3">
                              <h6 className="text-warning">⚠️ Áreas de Atención</h6>
                              <ul className="list-unstyled">
                                {analysisData.recommendations.concernFlags.map((flag: string, index: number) => (
                                  <li key={index} className="text-warning">• {flag}</li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {analysisData.recommendations.suggestedChanges && analysisData.recommendations.suggestedChanges.length > 0 && (
                            <div className="mb-3">
                              <h6 className="text-info">🔄 Cambios Sugeridos</h6>
                              <ul className="list-unstyled">
                                {analysisData.recommendations.suggestedChanges.map((change: string, index: number) => (
                                  <li key={index} className="text-info">• {change}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Timeline de Datos */}
                {analysisData.timelineData && analysisData.timelineData.length > 0 && (
                  <div className="row">
                    <div className="col-12">
                      <div className="card">
                        <div className="card-header">
                          <h5 className="card-title mb-0">📈 Historial de Progreso</h5>
                        </div>
                        <div className="card-body">
                          <div className="table-responsive">
                            <table className="table table-hover mb-0">
                              <thead className="table-light">
                                <tr>
                                  <th>Fecha</th>
                                  <th>Peso (kg)</th>
                                  <th>IMC</th>
                                  <th>Cintura (cm)</th>
                                  <th>Plan Activo</th>
                                  <th>Notas</th>
                                </tr>
                              </thead>
                              <tbody>
                                {analysisData.timelineData.map((entry: any, index: number) => (
                                  <tr key={index}>
                                    <td>{new Date(entry.date).toLocaleDateString('es-ES')}</td>
                                    <td>{entry.weight ? Number(entry.weight).toFixed(1) : '-'}</td>
                                    <td>{entry.bmi ? Number(entry.bmi).toFixed(1) : '-'}</td>
                                    <td>{entry.waist ? Number(entry.waist).toFixed(1) : '-'}</td>
                                    <td>
                                      <span className={`badge ${entry.planActive ? 'bg-success' : 'bg-secondary'}`}>
                                        {entry.planActive ? 'Sí' : 'No'}
                                      </span>
                                    </td>
                                    <td><small>{entry.notes}</small></td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-5">
                <Target size={48} className="text-muted mb-3" />
                <h5 className="text-muted">No hay análisis disponible</h5>
                <p className="text-muted">
                  {selectedPatient ? 'El análisis se generará automáticamente al seleccionar un paciente.' : 'Selecciona un paciente para generar un análisis automático.'}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Add Progress Modal */}
      {showAddModal && selectedPatientData && (
        <div className="modal fade show d-block" tabIndex={-1} style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Registrar Progreso - {selectedPatientData.first_name} {selectedPatientData.last_name}</h5>
                <button type="button" className="btn-close" onClick={() => setShowAddModal(false)}></button>
              </div>
              <div className="modal-body">
                <form>
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label" htmlFor="progress-date">Fecha</label>
                      <input
                        type="date"
                        className="form-control"
                        id="progress-date"
                        name="progress-date"
                        defaultValue={new Date().toISOString().split('T')[0]}
                      />
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label" htmlFor="progress-weight">Peso (kg)</label>
                      <input
                        type="number"
                        className="form-control"
                        id="progress-weight"
                        name="progress-weight"
                        step="0.1"
                        placeholder="70.5"
                      />
                    </div>
                  </div>
                  <div className="row">
                    <div className="col-md-4 mb-3">
                      <label className="form-label" htmlFor="progress-body-fat">Grasa Corporal (%)</label>
                      <input
                        type="number"
                        className="form-control"
                        id="progress-body-fat"
                        name="progress-body-fat"
                        step="0.1"
                        placeholder="25.5"
                      />
                    </div>
                    <div className="col-md-4 mb-3">
                      <label className="form-label" htmlFor="progress-muscle-mass">Masa Muscular (kg)</label>
                      <input
                        type="number"
                        className="form-control"
                        id="progress-muscle-mass"
                        name="progress-muscle-mass"
                        step="0.1"
                        placeholder="45.2"
                      />
                    </div>
                    <div className="col-md-4 mb-3">
                      <label className="form-label" htmlFor="progress-waist">Cintura (cm)</label>
                      <input
                        type="number"
                        className="form-control"
                        id="progress-waist"
                        name="progress-waist"
                        step="0.1"
                        placeholder="85.0"
                      />
                    </div>
                  </div>
                  <div className="mb-3">
                    <label className="form-label" htmlFor="progress-notes">Notas del Progreso</label>
                    <textarea
                      className="form-control"
                      id="progress-notes"
                      name="progress-notes"
                      rows={3}
                      placeholder="Describe el progreso del paciente..."
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label" htmlFor="progress-photos">Fotos de Progreso (Opcional)</label>
                    <input
                      type="file"
                      className="form-control"
                      id="progress-photos"
                      name="progress-photos"
                      multiple
                      accept="image/*"
                    />
                  </div>
                </form>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowAddModal(false)}>
                  Cancelar
                </button>
                <button type="button" className="btn btn-primary">
                  <Plus size={16} className="me-2" />
                  Registrar Progreso
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProgressTrackingPage; 