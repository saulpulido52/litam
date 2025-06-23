import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Scale, Target, Calendar, Plus, User, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

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

interface Patient {
  id: number;
  name: string;
  initial_weight: number;
  target_weight: number;
  height: number;
}

const ProgressTrackingPage: React.FC = () => {
  const [progressEntries, setProgressEntries] = useState<ProgressEntry[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<number | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [patients] = useState<Patient[]>([
    { id: 1, name: 'María González', initial_weight: 75, target_weight: 65, height: 165 },
    { id: 2, name: 'Carlos Ruiz', initial_weight: 90, target_weight: 80, height: 175 },
    { id: 3, name: 'Ana López', initial_weight: 58, target_weight: 62, height: 160 }
  ]);

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
      }
    ];
    setProgressEntries(mockProgress);
  }, []);

  const filteredEntries = selectedPatient 
    ? progressEntries.filter(entry => entry.patient_id === selectedPatient)
    : progressEntries;

  const getProgressTrend = (currentValue: number, previousValue?: number) => {
    if (!previousValue) return null;
    const change = currentValue - previousValue;
    return change > 0 ? 'up' : change < 0 ? 'down' : 'stable';
  };

  const calculateBMI = (weight: number, height: number) => {
    return (weight / ((height / 100) ** 2)).toFixed(1);
  };

  const selectedPatientData = patients.find(p => p.id === selectedPatient);
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
              <p className="text-muted mb-0">Monitorea el progreso de tus pacientes</p>
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
            onChange={(e) => setSelectedPatient(e.target.value ? Number(e.target.value) : null)}
          >
            <option value="">Todos los pacientes</option>
            {patients.map(patient => (
              <option key={patient.id} value={patient.id}>
                {patient.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Progress Overview */}
      {selectedPatient && selectedPatientData && latestEntry && (
        <div className="row mb-4">
          <div className="col-12">
            <div className="card border-0 shadow-sm">
              <div className="card-header bg-primary text-white">
                <h5 className="mb-0">
                  <User size={20} className="me-2" />
                  Resumen de Progreso - {selectedPatientData.name}
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
                              <TrendingDown size={16} /> -{(previousEntry.weight - latestEntry.weight).toFixed(1)} kg
                            </span>
                          ) : getProgressTrend(latestEntry.weight, previousEntry.weight) === 'up' ? (
                            <span className="text-danger">
                              <TrendingUp size={16} /> +{(latestEntry.weight - previousEntry.weight).toFixed(1)} kg
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
                      <h4 className="mb-1">{selectedPatientData.target_weight} kg</h4>
                      <small className="text-muted">Peso Meta</small>
                      <div className="mt-1">
                        <span className="text-info">
                          {(latestEntry.weight - selectedPatientData.target_weight).toFixed(1)} kg restantes
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-3">
                    <div className="text-center">
                      <h4 className="mb-1 text-info">{calculateBMI(latestEntry.weight, selectedPatientData.height)}</h4>
                      <small className="text-muted">IMC Actual</small>
                      <div className="mt-1">
                        <span className="badge bg-light text-dark">
                          {Number(calculateBMI(latestEntry.weight, selectedPatientData.height)) < 25 ? 'Normal' : 'Sobrepeso'}
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
                              <TrendingDown size={16} /> -{(previousEntry.body_fat - latestEntry.body_fat).toFixed(1)}%
                            </span>
                          ) : (
                            <span className="text-danger">
                              <TrendingUp size={16} /> +{(latestEntry.body_fat - previousEntry.body_fat).toFixed(1)}%
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

      {/* Add Progress Modal */}
      {showAddModal && selectedPatientData && (
        <div className="modal fade show d-block" tabIndex={-1} style={{backgroundColor: 'rgba(0,0,0,0.5)'}}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Registrar Progreso - {selectedPatientData.name}</h5>
                <button type="button" className="btn-close" onClick={() => setShowAddModal(false)}></button>
              </div>
              <div className="modal-body">
                <form>
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Fecha</label>
                      <input type="date" className="form-control" defaultValue={new Date().toISOString().split('T')[0]} />
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Peso (kg)</label>
                      <input type="number" className="form-control" step="0.1" placeholder="70.5" />
                    </div>
                  </div>
                  <div className="row">
                    <div className="col-md-4 mb-3">
                      <label className="form-label">Grasa Corporal (%)</label>
                      <input type="number" className="form-control" step="0.1" placeholder="25.5" />
                    </div>
                    <div className="col-md-4 mb-3">
                      <label className="form-label">Masa Muscular (kg)</label>
                      <input type="number" className="form-control" step="0.1" placeholder="45.2" />
                    </div>
                    <div className="col-md-4 mb-3">
                      <label className="form-label">Cintura (cm)</label>
                      <input type="number" className="form-control" step="0.1" placeholder="85.0" />
                    </div>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Notas del Progreso</label>
                    <textarea 
                      className="form-control" 
                      rows={3}
                      placeholder="Observaciones sobre el progreso del paciente..."
                    ></textarea>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Fotos de Progreso (Opcional)</label>
                    <input type="file" className="form-control" multiple accept="image/*" />
                    <small className="text-muted">Puedes subir múltiples fotos para documentar el progreso visual</small>
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