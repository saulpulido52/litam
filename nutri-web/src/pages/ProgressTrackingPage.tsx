import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Scale, Target, Calendar, Plus, User, ArrowLeft, BarChart3 } from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';
import WeightEvolutionChart from '../components/ProgressCharts/WeightEvolutionChart';
import BodyCompositionChart from '../components/ProgressCharts/BodyCompositionChart';
import MeasurementsChart from '../components/ProgressCharts/MeasurementsChart';
import ProgressMetrics from '../components/ProgressCharts/ProgressMetrics';
import { usePatients } from '../hooks/usePatients';

interface ProgressEntry {
  id: number;
  patient_name: string;
  patient_id: number;
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
  const [activeTab, setActiveTab] = useState<'overview' | 'charts' | 'history'>('overview');

  useEffect(() => {
    const patientId = searchParams.get('patient');
    if (patientId) {
      setSelectedPatient(patientId);
      console.log('🎯 Paciente seleccionado desde URL:', patientId);
    }
  }, [searchParams]);

  useEffect(() => {
    const mockProgress: ProgressEntry[] = [
      {
        id: 1,
        patient_name: 'María González',
        patient_id: 1,
        date: '2024-12-01',
        weight: 72,
        body_fat: 28,
        muscle_mass: 45,
        waist: 85,
        notes: 'Excelente progreso, se siente con más energía'
      },
      {
        id: 2,
        patient_name: 'María González',
        patient_id: 1,
        date: '2024-12-15',
        weight: 70,
        body_fat: 26,
        muscle_mass: 46,
        waist: 82,
        notes: 'Continúa con buen progreso, cumpliendo con el plan'
      },
      {
        id: 3,
        patient_name: 'Carlos Ruiz',
        patient_id: 2,
        date: '2024-12-05',
        weight: 87,
        body_fat: 22,
        muscle_mass: 52,
        waist: 95,
        notes: 'Ganando masa muscular, reduciendo grasa corporal'
      },
      {
        id: 4,
        patient_name: 'María González',
        patient_id: 1,
        date: '2024-12-30',
        weight: 68,
        body_fat: 24,
        muscle_mass: 47,
        waist: 80,
        notes: 'Meta de peso casi alcanzada, excelente trabajo'
      }
    ];
    setProgressEntries(mockProgress);
  }, []);

  const filteredEntries = selectedPatient 
    ? progressEntries.filter(entry => entry.patient_id === Number(selectedPatient))
    : progressEntries;

  const getProgressTrend = (currentValue: number, previousValue?: number) => {
    if (!previousValue) return null;
    const change = currentValue - previousValue;
    return change > 0 ? 'up' : change < 0 ? 'down' : 'stable';
  };

  const calculateBMI = (weight: number, height: number) => {
    const bmi = weight / ((height / 100) ** 2);
    return (bmi || 0).toFixed(1);
  };

  const selectedPatientData = patients.find(p => p.id.toString() === selectedPatient);
  const selectedPatientEntries = filteredEntries.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  const latestEntry = selectedPatientEntries[0];
  const previousEntry = selectedPatientEntries[1];

  // Preparar datos para los gráficos
  const weightChartData = filteredEntries.map(entry => ({
    date: entry.date,
    weight: entry.weight,
    targetWeight: selectedPatientData?.profile?.target_weight
  }));

  const bodyCompositionData = filteredEntries.map(entry => ({
    date: entry.date,
    bodyFat: entry.body_fat,
    muscleMass: entry.muscle_mass,
    weight: entry.weight
  }));

  const measurementsData = filteredEntries.map(entry => ({
    date: entry.date,
    waist: entry.waist,
    hip: entry.waist * 1.1, // Simulado
    chest: entry.waist * 1.05, // Simulado
    arm: entry.waist * 0.35, // Simulado
    thigh: entry.waist * 0.6 // Simulado
  }));

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
      </ul>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <>
          {/* Progress Metrics Dashboard */}
          {selectedPatient && selectedPatientData && latestEntry && (
            <div className="row mb-4">
              <div className="col-12">
                <ProgressMetrics
                  patientName={selectedPatientData.first_name}
                  currentWeight={latestEntry.weight}
                  targetWeight={selectedPatientData.profile?.target_weight ?? 0}
                  initialWeight={selectedPatientData.profile?.current_weight ?? 0}
                  currentBodyFat={latestEntry.body_fat}
                  initialBodyFat={28} // Simulado - en producción vendría de la primera medición
                  currentMuscleMass={latestEntry.muscle_mass}
                  initialMuscleMass={42} // Simulado - en producción vendría de la primera medición
                  height={selectedPatientData.profile?.height ?? 170}
                  daysInProgram={30} // Simulado - en producción se calcularía
                  totalMeasurements={filteredEntries.length}
                />
              </div>
            </div>
          )}

          {/* Progress Overview */}
          {selectedPatient && selectedPatientData && latestEntry && (
            <div className="row mb-4">
              <div className="col-12">
                <div className="card border-0 shadow-sm">
                  <div className="card-header bg-primary text-white">
                    <h5 className="mb-0">
                      <User size={20} className="me-2" />
                      Resumen de Progreso - {selectedPatientData.first_name} {selectedPatientData.last_name}
                    </h5>
                  </div>
                  <div className="card-body">
                    <div className="row">
                      <div className="col-md-3">
                        <div className="text-center">
                          <Scale size={32} className="text-primary mb-2" />
                          <h4 className="mb-1">{latestEntry.weight} kg</h4>
                          <small className="text-muted">Peso Actual</small>
                          {previousEntry && (
                            <div className="mt-1">
                              {getProgressTrend(latestEntry.weight, previousEntry.weight) === 'down' ? (
                                <span className="text-success">
                                  <TrendingDown size={16} /> -{((previousEntry.weight - latestEntry.weight) || 0).toFixed(1)} kg
                                </span>
                              ) : getProgressTrend(latestEntry.weight, previousEntry.weight) === 'up' ? (
                                <span className="text-danger">
                                  <TrendingUp size={16} /> +{((latestEntry.weight - previousEntry.weight) || 0).toFixed(1)} kg
                                </span>
                              ) : (
                                <span className="text-muted">Sin cambios</span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="col-md-3">
                        <div className="text-center">
                          <Target size={32} className="text-success mb-2" />
                          <h4 className="mb-1">{selectedPatientData.profile?.target_weight ?? '-'} kg</h4>
                          <small className="text-muted">Peso Meta</small>
                          <div className="mt-1">
                            <span className="text-info">
                              {selectedPatientData.profile?.target_weight !== undefined && latestEntry.weight !== undefined
                                ? ((latestEntry.weight - selectedPatientData.profile.target_weight) || 0).toFixed(1)
                                : '-'} kg restantes
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="col-md-3">
                        <div className="text-center">
                          <h4 className="mb-1 text-info">{selectedPatientData && selectedPatientData.profile
                            ? calculateBMI(Number(latestEntry?.weight ?? 0), Number(selectedPatientData.profile.height) || 1)
                            : '-'}</h4>
                          <small className="text-muted">IMC Actual</small>
                          <div className="mt-1">
                            <span className="badge bg-light text-dark">
                              {selectedPatientData && selectedPatientData.profile && Number(calculateBMI(Number(latestEntry?.weight ?? 0), Number(selectedPatientData.profile.height) || 1)) < 25 ? 'Normal' : 'Sobrepeso'}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="col-md-3">
                        <div className="text-center">
                          <h4 className="mb-1 text-warning">{latestEntry.body_fat}%</h4>
                          <small className="text-muted">Grasa Corporal</small>
                          {previousEntry && (
                            <div className="mt-1">
                              {getProgressTrend(latestEntry.body_fat, previousEntry.body_fat) === 'down' ? (
                                <span className="text-success">
                                  <TrendingDown size={16} /> -{((previousEntry.body_fat - latestEntry.body_fat) || 0).toFixed(1)}%
                                </span>
                              ) : (
                                <span className="text-danger">
                                  <TrendingUp size={16} /> +{((latestEntry.body_fat - previousEntry.body_fat) || 0).toFixed(1)}%
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
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
              <>
                <WeightEvolutionChart 
                  data={weightChartData}
                  patientName={selectedPatientData.first_name}
                  targetWeight={selectedPatientData.profile?.target_weight ?? 0}
                  height={selectedPatientData.profile?.height ?? 170}
                />
              </>
            ) : (
              <div className="text-center py-5">
                <BarChart3 size={48} className="text-muted mb-3" />
                <h5 className="text-muted">Selecciona un paciente</h5>
                <p className="text-muted">Para ver los gráficos de progreso, selecciona un paciente de la lista</p>
              </div>
            )}
          </div>
          
          {selectedPatient && selectedPatientData && (
            <>
              <div className="col-md-6 mb-4">
                <BodyCompositionChart 
                  data={bodyCompositionData}
                  patientName={selectedPatientData.first_name}
                />
              </div>
              <div className="col-md-6 mb-4">
                <MeasurementsChart 
                  data={measurementsData}
                  patientName={selectedPatientData.first_name}
                />
              </div>
            </>
          )}
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

      {/* Add Progress Modal */}
      {showAddModal && selectedPatientData && (
        <div className="modal fade show d-block" tabIndex={-1} style={{backgroundColor: 'rgba(0,0,0,0.5)'}}>
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