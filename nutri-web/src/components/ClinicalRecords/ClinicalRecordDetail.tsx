import React, { useState } from 'react';
import type { ClinicalRecord } from '../../types';

interface ClinicalRecordDetailProps {
  record: ClinicalRecord;
  onEdit?: () => void;
  onDelete?: () => void;
  onClose?: () => void;
  canEdit?: boolean;
  canDelete?: boolean;
}

const ClinicalRecordDetail: React.FC<ClinicalRecordDetailProps> = ({
  record,
  onEdit,
  onDelete,
  onClose,
  canEdit = true,
  canDelete = true,
}) => {
  const [activeTab, setActiveTab] = useState('basic');

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-MX', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('es-MX', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const calculateBMI = (weight?: number, height?: number) => {
    if (!weight || !height || height === 0) return null;
    const bmi = weight / (height * height);
    return bmi.toFixed(1);
  };

  const getBMICategory = (bmi: number) => {
    if (bmi < 18.5) return 'Bajo peso';
    if (bmi < 25) return 'Normal';
    if (bmi < 30) return 'Sobrepeso';
    return 'Obesidad';
  };

  const renderProblemsList = (problems: any) => {
    if (!problems) return null;
    
    const problemLabels = {
      diarrhea: 'Diarrea',
      constipation: 'Estreñimiento',
      gastritis: 'Gastritis',
      ulcer: 'Úlcera',
      nausea: 'Náuseas',
      pyrosis: 'Pirosis',
      vomiting: 'Vómito',
      colitis: 'Colitis'
    };

    const activeProblems = Object.entries(problems)
      .filter(([key, value]) => value === true && problemLabels[key as keyof typeof problemLabels])
      .map(([key]) => problemLabels[key as keyof typeof problemLabels]);

    if (activeProblems.length === 0) return <span className="text-muted">Ninguno reportado</span>;
    
    return (
      <div className="d-flex flex-wrap gap-1">
        {activeProblems.map(problem => (
          <span key={problem} className="badge bg-warning text-dark">{problem}</span>
        ))}
      </div>
    );
  };

  const renderFoodList = (foods: string[] | undefined) => {
    if (!foods || foods.length === 0) return <span className="text-muted">No especificado</span>;
    return foods.join(', ');
  };

  return (
    <div className="clinical-record-detail">
      <div className="card">
        <div className="card-header d-flex justify-content-between align-items-center">
          <div>
            <h5 className="mb-1">
              <i className="fas fa-clipboard-list me-2"></i>
              Expediente Clínico
              {record.expedient_number && (
                <span className="badge bg-primary ms-2">{record.expedient_number}</span>
              )}
            </h5>
            <small className="text-muted">
              Fecha: {formatDate(record.record_date)} | 
              Última actualización: {formatDateTime(record.updated_at)}
            </small>
          </div>
          
          <div className="btn-group">
            {canEdit && onEdit && (
              <button className="btn btn-outline-primary btn-sm" onClick={onEdit}>
                <i className="fas fa-edit"></i> Editar
              </button>
            )}
            {canDelete && onDelete && (
              <button className="btn btn-outline-danger btn-sm" onClick={onDelete}>
                <i className="fas fa-trash"></i> Eliminar
              </button>
            )}
            {onClose && (
              <button className="btn btn-outline-secondary btn-sm" onClick={onClose}>
                <i className="fas fa-times"></i> Cerrar
              </button>
            )}
          </div>
        </div>

        <div className="card-body">
          {/* Información del paciente y nutriólogo */}
          <div className="row mb-4">
            <div className="col-md-6">
              <h6><i className="fas fa-user me-2"></i>Paciente</h6>
              <p className="mb-1">
                <strong>{record.patient.first_name} {record.patient.last_name}</strong>
              </p>
              <p className="text-muted small">
                {record.patient.email}
                {record.patient.age && ` • ${record.patient.age} años`}
                {record.patient.gender && ` • ${record.patient.gender === 'male' ? 'Masculino' : record.patient.gender === 'female' ? 'Femenino' : 'Otro'}`}
              </p>
            </div>
            <div className="col-md-6">
              <h6><i className="fas fa-user-md me-2"></i>Nutriólogo</h6>
              <p className="mb-1">
                <strong>Dr./Dra. {record.nutritionist.first_name} {record.nutritionist.last_name}</strong>
              </p>
              <p className="text-muted small">{record.nutritionist.email}</p>
            </div>
          </div>

          {/* Pestañas de navegación */}
          <ul className="nav nav-tabs mb-4" id="recordTabs" role="tablist">
            <li className="nav-item" role="presentation">
              <button
                className={`nav-link ${activeTab === 'basic' ? 'active' : ''}`}
                onClick={() => setActiveTab('basic')}
              >
                <i className="fas fa-info-circle me-1"></i>Datos Básicos
              </button>
            </li>
            <li className="nav-item" role="presentation">
              <button
                className={`nav-link ${activeTab === 'problems' ? 'active' : ''}`}
                onClick={() => setActiveTab('problems')}
              >
                <i className="fas fa-exclamation-triangle me-1"></i>Problemas
              </button>
            </li>
            <li className="nav-item" role="presentation">
              <button
                className={`nav-link ${activeTab === 'measurements' ? 'active' : ''}`}
                onClick={() => setActiveTab('measurements')}
              >
                <i className="fas fa-ruler me-1"></i>Mediciones
              </button>
            </li>
            <li className="nav-item" role="presentation">
              <button
                className={`nav-link ${activeTab === 'dietary' ? 'active' : ''}`}
                onClick={() => setActiveTab('dietary')}
              >
                <i className="fas fa-utensils me-1"></i>Historia Dietética
              </button>
            </li>
            <li className="nav-item" role="presentation">
              <button
                className={`nav-link ${activeTab === 'diagnosis' ? 'active' : ''}`}
                onClick={() => setActiveTab('diagnosis')}
              >
                <i className="fas fa-stethoscope me-1"></i>Diagnóstico
              </button>
            </li>
          </ul>

          {/* Contenido de las pestañas */}
          <div className="tab-content">
            {/* Pestaña: Datos Básicos */}
            {activeTab === 'basic' && (
              <div className="tab-pane fade show active">
                <div className="row">
                  <div className="col-md-6">
                    <h6><i className="fas fa-calendar me-2"></i>Información General</h6>
                    <table className="table table-sm">
                      <tbody>
                        <tr>
                          <td><strong>Fecha del Registro:</strong></td>
                          <td>{formatDate(record.record_date)}</td>
                        </tr>
                        <tr>
                          <td><strong>Número de Expediente:</strong></td>
                          <td>{record.expedient_number || 'No asignado'}</td>
                        </tr>
                        <tr>
                          <td><strong>Motivo de Consulta:</strong></td>
                          <td>{record.consultation_reason || 'No especificado'}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                  <div className="col-md-6">
                    <h6><i className="fas fa-clock me-2"></i>Información Temporal</h6>
                    <table className="table table-sm">
                      <tbody>
                        <tr>
                          <td><strong>Creado:</strong></td>
                          <td>{formatDateTime(record.created_at)}</td>
                        </tr>
                        <tr>
                          <td><strong>Última Actualización:</strong></td>
                          <td>{formatDateTime(record.updated_at)}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* Pestaña: Problemas Actuales */}
            {activeTab === 'problems' && (
              <div className="tab-pane fade show active">
                <h6><i className="fas fa-exclamation-triangle me-2"></i>Problemas Actuales</h6>
                
                {record.current_problems && (
                  <div className="row">
                    <div className="col-md-6">
                      <h6 className="text-primary">Problemas Gastrointestinales</h6>
                      {renderProblemsList(record.current_problems)}
                      
                      {record.current_problems.mouthMechanics && (
                        <div className="mt-3">
                          <strong>Mecánicos de la Boca:</strong>
                          <p className="text-muted">{record.current_problems.mouthMechanics}</p>
                        </div>
                      )}
                    </div>
                    <div className="col-md-6">
                      {record.current_problems.otherProblems && (
                        <div className="mb-3">
                          <strong>Otros Problemas:</strong>
                          <p className="text-muted">{record.current_problems.otherProblems}</p>
                        </div>
                      )}
                      
                      {record.current_problems.observations && (
                        <div>
                          <strong>Observaciones:</strong>
                          <p className="text-muted">{record.current_problems.observations}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Pestaña: Mediciones */}
            {activeTab === 'measurements' && (
              <div className="tab-pane fade show active">
                <h6><i className="fas fa-ruler me-2"></i>Mediciones Antropométricas</h6>
                
                {record.anthropometric_measurements && (
                  <div className="row">
                    <div className="col-md-6">
                      <h6 className="text-primary">Peso y Estatura</h6>
                      <table className="table table-sm">
                        <tbody>
                          <tr>
                            <td><strong>Peso Actual:</strong></td>
                            <td>{record.anthropometric_measurements.current_weight_kg} kg</td>
                          </tr>
                          <tr>
                            <td><strong>Peso Habitual:</strong></td>
                            <td>{record.anthropometric_measurements.habitual_weight_kg} kg</td>
                          </tr>
                          <tr>
                            <td><strong>Estatura:</strong></td>
                            <td>{record.anthropometric_measurements.height_m} m</td>
                          </tr>
                          <tr>
                            <td><strong>IMC:</strong></td>
                            <td>
                              {(() => {
                                const bmi = calculateBMI(
                                  record.anthropometric_measurements.current_weight_kg,
                                  record.anthropometric_measurements.height_m
                                );
                                if (bmi) {
                                  const category = getBMICategory(parseFloat(bmi));
                                  return (
                                    <span>
                                      {bmi} - <span className="badge bg-info">{category}</span>
                                    </span>
                                  );
                                }
                                return 'No calculable';
                              })()}
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                    <div className="col-md-6">
                      <h6 className="text-primary">Circunferencias</h6>
                      <table className="table table-sm">
                        <tbody>
                          <tr>
                            <td><strong>Cintura:</strong></td>
                            <td>{record.anthropometric_measurements.waist_circ_cm} cm</td>
                          </tr>
                          <tr>
                            <td><strong>Cadera:</strong></td>
                            <td>{record.anthropometric_measurements.hip_circ_cm} cm</td>
                          </tr>
                          {record.anthropometric_measurements.waist_circ_cm && record.anthropometric_measurements.hip_circ_cm && (
                            <tr>
                              <td><strong>Relación Cintura/Cadera:</strong></td>
                              <td>
                                {(record.anthropometric_measurements.waist_circ_cm / record.anthropometric_measurements.hip_circ_cm).toFixed(2)}
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {record.blood_pressure && (
                  <div className="mt-4">
                    <h6 className="text-primary">Presión Arterial</h6>
                    <table className="table table-sm">
                      <tbody>
                        <tr>
                          <td><strong>Conoce su presión arterial:</strong></td>
                          <td>
                            {record.blood_pressure.knows_bp ? (
                              <span className="badge bg-success">Sí</span>
                            ) : (
                              <span className="badge bg-secondary">No</span>
                            )}
                          </td>
                        </tr>
                        {record.blood_pressure.knows_bp && (
                          <>
                            <tr>
                              <td><strong>Sistólica:</strong></td>
                              <td>{record.blood_pressure.systolic} mmHg</td>
                            </tr>
                            <tr>
                              <td><strong>Diastólica:</strong></td>
                              <td>{record.blood_pressure.diastolic} mmHg</td>
                            </tr>
                            {record.blood_pressure.habitual_bp && (
                              <tr>
                                <td><strong>Presión Habitual:</strong></td>
                                <td>{record.blood_pressure.habitual_bp}</td>
                              </tr>
                            )}
                          </>
                        )}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* Pestaña: Historia Dietética */}
            {activeTab === 'dietary' && (
              <div className="tab-pane fade show active">
                <h6><i className="fas fa-utensils me-2"></i>Historia Dietética</h6>
                
                {record.dietary_history && (
                  <div className="row">
                    <div className="col-md-6">
                      <h6 className="text-primary">Orientación Nutricional</h6>
                      <table className="table table-sm">
                        <tbody>
                          <tr>
                            <td><strong>Ha recibido orientación:</strong></td>
                            <td>
                              {record.dietary_history.received_nutritional_guidance ? (
                                <span className="badge bg-success">Sí</span>
                              ) : (
                                <span className="badge bg-secondary">No</span>
                              )}
                            </td>
                          </tr>
                          {record.dietary_history.received_nutritional_guidance && (
                            <tr>
                              <td><strong>Cuándo:</strong></td>
                              <td>{record.dietary_history.when_received}</td>
                            </tr>
                          )}
                          <tr>
                            <td><strong>Nivel de Adherencia:</strong></td>
                            <td>{record.dietary_history.adherence_level || 'No especificado'}</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                    <div className="col-md-6">
                      <h6 className="text-primary">Suplementos</h6>
                      <table className="table table-sm">
                        <tbody>
                          <tr>
                            <td><strong>Toma suplementos:</strong></td>
                            <td>
                              {record.dietary_history.takes_supplements ? (
                                <span className="badge bg-success">Sí</span>
                              ) : (
                                <span className="badge bg-secondary">No</span>
                              )}
                            </td>
                          </tr>
                          {record.dietary_history.takes_supplements && (
                            <tr>
                              <td><strong>Detalles:</strong></td>
                              <td>{record.dietary_history.supplement_details}</td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                <div className="row mt-4">
                  <div className="col-md-4">
                    <h6 className="text-primary">Alimentos Preferidos</h6>
                    <p className="text-muted">{renderFoodList(record.dietary_history?.preferred_foods)}</p>
                  </div>
                  <div className="col-md-4">
                    <h6 className="text-primary">Alimentos que No Le Gustan</h6>
                    <p className="text-muted">{renderFoodList(record.dietary_history?.disliked_foods)}</p>
                  </div>
                  <div className="col-md-4">
                    <h6 className="text-primary">Alimentos que Causan Malestar</h6>
                    <p className="text-muted">{renderFoodList(record.dietary_history?.malestar_alergia_foods)}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Pestaña: Diagnóstico */}
            {activeTab === 'diagnosis' && (
              <div className="tab-pane fade show active">
                <div className="row">
                  <div className="col-md-6">
                    <h6><i className="fas fa-stethoscope me-2"></i>Diagnóstico Nutricional</h6>
                    {record.nutritional_diagnosis ? (
                      <div className="alert alert-info">
                        {record.nutritional_diagnosis}
                      </div>
                    ) : (
                      <p className="text-muted">No especificado</p>
                    )}
                  </div>
                  <div className="col-md-6">
                    <h6><i className="fas fa-clipboard-check me-2"></i>Plan y Manejo Nutricional</h6>
                    {record.nutritional_plan_and_management ? (
                      <div className="bg-light p-3 rounded">
                        {record.nutritional_plan_and_management}
                      </div>
                    ) : (
                      <p className="text-muted">No especificado</p>
                    )}
                  </div>
                </div>

                {record.evolution_and_follow_up_notes && (
                  <div className="mt-4">
                    <h6><i className="fas fa-sticky-note me-2"></i>Notas de Evolución y Seguimiento</h6>
                    <div className="bg-light p-3 rounded" style={{ whiteSpace: 'pre-wrap' }}>
                      {record.evolution_and_follow_up_notes}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <style>{`
        .nav-tabs .nav-link {
          color: #6c757d;
          border: none;
          border-bottom: 2px solid transparent;
        }
        
        .nav-tabs .nav-link.active {
          color: #007bff;
          border-bottom: 2px solid #007bff;
          background: none;
        }
        
        .nav-tabs .nav-link:hover {
          border-color: transparent;
          color: #007bff;
        }
        
        .table-sm td {
          padding: 0.5rem;
          vertical-align: middle;
        }
        
        .badge {
          font-size: 0.75rem;
        }
        
        /* Responsive adjustments */
        @media (max-width: 768px) {
          .card-header {
            padding: 1rem;
          }
          
          .card-header h5 {
            font-size: 1.1rem;
          }
          
          .card-header small {
            font-size: 0.8rem;
          }
          
          .btn-group {
            flex-direction: column;
            width: 100%;
          }
          
          .btn-group .btn {
            margin-bottom: 0.5rem;
            width: 100%;
          }
          
          .nav-tabs {
            flex-wrap: wrap;
          }
          
          .nav-tabs .nav-link {
            font-size: 0.8rem;
            padding: 0.5rem 0.75rem;
            white-space: nowrap;
          }
          
          .nav-tabs .nav-link i {
            display: none;
          }
          
          .table-sm td {
            padding: 0.4rem;
            font-size: 0.9rem;
          }
          
          .table-sm td strong {
            font-size: 0.85rem;
          }
          
          .badge {
            font-size: 0.7rem;
          }
          
          .card-body {
            padding: 1rem;
          }
          
          .row {
            margin-left: -0.5rem;
            margin-right: -0.5rem;
          }
          
          .col-md-6, .col-md-4 {
            padding-left: 0.5rem;
            padding-right: 0.5rem;
          }
        }
        
        @media (max-width: 576px) {
          .card-header {
            padding: 0.75rem;
          }
          
          .card-header h5 {
            font-size: 1rem;
          }
          
          .card-header small {
            font-size: 0.75rem;
          }
          
          .nav-tabs .nav-link {
            font-size: 0.75rem;
            padding: 0.4rem 0.5rem;
          }
          
          .table-sm td {
            padding: 0.3rem;
            font-size: 0.85rem;
          }
          
          .table-sm td strong {
            font-size: 0.8rem;
          }
          
          .badge {
            font-size: 0.65rem;
          }
          
          .card-body {
            padding: 0.75rem;
          }
          
          .row {
            margin-left: -0.25rem;
            margin-right: -0.25rem;
          }
          
          .col-md-6, .col-md-4 {
            padding-left: 0.25rem;
            padding-right: 0.25rem;
          }
          
          /* Stack patient and nutritionist info vertically on very small screens */
          .row.mb-4 .col-md-6 {
            margin-bottom: 1rem;
          }
          
          .row.mb-4 .col-md-6:last-child {
            margin-bottom: 0;
          }
        }
        
        /* Improve table responsiveness */
        @media (max-width: 768px) {
          .table-responsive {
            font-size: 0.9rem;
          }
          
          .table-responsive td {
            word-break: break-word;
          }
        }
        
        /* Better spacing for mobile */
        @media (max-width: 768px) {
          .mb-4 {
            margin-bottom: 1.5rem !important;
          }
          
          .mt-4 {
            margin-top: 1.5rem !important;
          }
          
          .mt-3 {
            margin-top: 1rem !important;
          }
          
          .mb-3 {
            margin-bottom: 1rem !important;
          }
        }
        
        /* Improve alert and text areas on mobile */
        @media (max-width: 768px) {
          .alert {
            font-size: 0.9rem;
            padding: 0.75rem;
          }
          
          .bg-light {
            font-size: 0.9rem;
            padding: 0.75rem !important;
          }
          
          .text-muted {
            font-size: 0.85rem;
          }
        }
      `}</style>
    </div>
  );
};

export default ClinicalRecordDetail; 