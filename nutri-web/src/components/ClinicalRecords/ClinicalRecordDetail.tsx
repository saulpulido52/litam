import React, { useState } from 'react';
import type { ClinicalRecord } from '../../types';
import LaboratoryDocuments from './LaboratoryDocuments';
import DrugNutrientInteractions from './DrugNutrientInteractions';
import GrowthChartsPDFExport from '../GrowthCharts/GrowthChartsPDFExport';

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
  canDelete = true}) => {
  const [activeTab, setActiveTab] = useState('basic');

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-MX', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'});
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('es-MX', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'});
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
                className={`nav-link ${activeTab === 'diseases' ? 'active' : ''}`}
                onClick={() => setActiveTab('diseases')}
              >
                <i className="fas fa-heartbeat me-1"></i>Enfermedades
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
                className={`nav-link ${activeTab === 'lifestyle' ? 'active' : ''}`}
                onClick={() => setActiveTab('lifestyle')}
              >
                <i className="fas fa-running me-1"></i>Estilo de Vida
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
            <li className="nav-item" role="presentation">
              <button
                className={`nav-link ${activeTab === 'laboratory' ? 'active' : ''}`}
                onClick={() => setActiveTab('laboratory')}
              >
                <i className="fas fa-file-pdf me-1"></i>Laboratorios
              </button>
            </li>
            <li className="nav-item" role="presentation">
              <button
                className={`nav-link ${activeTab === 'interactions' ? 'active' : ''}`}
                onClick={() => setActiveTab('interactions')}
              >
                <i className="fas fa-pills me-1"></i>Fármaco-Nutriente
              </button>
            </li>
            <li className="nav-item" role="presentation">
              <button
                className={`nav-link ${activeTab === 'growth' ? 'active' : ''}`}
                onClick={() => setActiveTab('growth')}
              >
                <i className="fas fa-chart-line me-1"></i>Crecimiento Pediátrico
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
                        {record.general_appearance && (
                          <tr>
                            <td><strong>Apariencia General:</strong></td>
                            <td>{record.general_appearance}</td>
                          </tr>
                        )}
                        {record.gynecological_aspects && (
                          <tr>
                            <td><strong>Aspectos Ginecológicos:</strong></td>
                            <td>{record.gynecological_aspects}</td>
                          </tr>
                        )}
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
                    
                    {record.daily_activities && (
                      <div className="mt-3">
                        <h6><i className="fas fa-calendar-day me-2"></i>Actividades Diarias</h6>
                        <div className="bg-light p-2 rounded">
                          {record.daily_activities.wake_up && <p><strong>Despertar:</strong> {record.daily_activities.wake_up}</p>}
                          {record.daily_activities.breakfast && <p><strong>Desayuno:</strong> {record.daily_activities.breakfast}</p>}
                          {record.daily_activities.lunch && <p><strong>Comida:</strong> {record.daily_activities.lunch}</p>}
                          {record.daily_activities.dinner && <p><strong>Cena:</strong> {record.daily_activities.dinner}</p>}
                          {record.daily_activities.sleep && <p><strong>Dormir:</strong> {record.daily_activities.sleep}</p>}
                          {record.daily_activities.other_hours && record.daily_activities.other_hours.length > 0 && (
                            <div>
                              <strong>Otras actividades:</strong>
                              <ul>
                                {record.daily_activities.other_hours.map((activity, index) => (
                                  <li key={index}>{activity.hour}: {activity.activity}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Pestaña: Enfermedades Diagnosticadas */}
            {activeTab === 'diseases' && (
              <div className="tab-pane fade show active">
                <h6><i className="fas fa-heartbeat me-2"></i>Enfermedades Diagnosticadas</h6>
                
                {record.diagnosed_diseases && (
                  <div className="row">
                    <div className="col-md-6">
                      <h6 className="text-primary">Enfermedades Actuales</h6>
                      <table className="table table-sm">
                        <tbody>
                          <tr>
                            <td><strong>¿Padece alguna enfermedad?</strong></td>
                            <td>
                              {record.diagnosed_diseases.has_disease ? (
                                <span className="badge bg-warning">Sí</span>
                              ) : (
                                <span className="badge bg-success">No</span>
                              )}
                            </td>
                          </tr>
                          {record.diagnosed_diseases.has_disease && (
                            <>
                              {record.diagnosed_diseases.disease_name && (
                                <tr>
                                  <td><strong>Enfermedad:</strong></td>
                                  <td>{record.diagnosed_diseases.disease_name}</td>
                                </tr>
                              )}
                              {record.diagnosed_diseases.since_when && (
                                <tr>
                                  <td><strong>¿Desde cuándo?</strong></td>
                                  <td>{record.diagnosed_diseases.since_when}</td>
                                </tr>
                              )}
                            </>
                          )}
                          <tr>
                            <td><strong>¿Toma medicamentos?</strong></td>
                            <td>
                              {record.diagnosed_diseases.takes_medication ? (
                                <span className="badge bg-info">Sí</span>
                              ) : (
                                <span className="badge bg-secondary">No</span>
                              )}
                            </td>
                          </tr>
                                                     {record.diagnosed_diseases.takes_medication && record.diagnosed_diseases.medications_list && (
                             <tr>
                               <td><strong>Medicamentos:</strong></td>
                               <td>
                                 <div className="d-flex flex-wrap gap-1">
                                   {record.diagnosed_diseases.medications_list.map((med, index) => (
                                     <span key={index} className="badge bg-light text-dark">
                                       {med}
                                     </span>
                                   ))}
                                 </div>
                               </td>
                             </tr>
                           )}
                        </tbody>
                      </table>
                    </div>
                    <div className="col-md-6">
                      <h6 className="text-primary">Historial Médico</h6>
                      <table className="table table-sm">
                        <tbody>
                          <tr>
                            <td><strong>¿Enfermedad importante previa?</strong></td>
                            <td>
                              {record.diagnosed_diseases.has_important_disease ? (
                                <span className="badge bg-warning">Sí</span>
                              ) : (
                                <span className="badge bg-success">No</span>
                              )}
                            </td>
                          </tr>
                          {record.diagnosed_diseases.has_important_disease && record.diagnosed_diseases.important_disease_name && (
                            <tr>
                              <td><strong>Enfermedad importante:</strong></td>
                              <td>{record.diagnosed_diseases.important_disease_name}</td>
                            </tr>
                          )}
                          <tr>
                            <td><strong>¿Tratamiento especial?</strong></td>
                            <td>
                              {record.diagnosed_diseases.takes_special_treatment ? (
                                <span className="badge bg-info">Sí</span>
                              ) : (
                                <span className="badge bg-secondary">No</span>
                              )}
                            </td>
                          </tr>
                          {record.diagnosed_diseases.takes_special_treatment && record.diagnosed_diseases.special_treatment_details && (
                            <tr>
                              <td><strong>Detalles del tratamiento:</strong></td>
                              <td>{record.diagnosed_diseases.special_treatment_details}</td>
                            </tr>
                          )}
                          <tr>
                            <td><strong>¿Ha tenido cirugías?</strong></td>
                            <td>
                              {record.diagnosed_diseases.has_surgery ? (
                                <span className="badge bg-warning">Sí</span>
                              ) : (
                                <span className="badge bg-success">No</span>
                              )}
                            </td>
                          </tr>
                          {record.diagnosed_diseases.has_surgery && record.diagnosed_diseases.surgery_details && (
                            <tr>
                              <td><strong>Detalles de cirugías:</strong></td>
                              <td>{record.diagnosed_diseases.surgery_details}</td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* Historia Familiar */}
                {record.family_medical_history && (
                  <div className="mt-4">
                    <h6 className="text-primary">Antecedentes Familiares</h6>
                    <div className="row">
                      <div className="col-md-6">
                        <div className="d-flex flex-wrap gap-2">
                          {record.family_medical_history.obesity && <span className="badge bg-warning">Obesidad</span>}
                          {record.family_medical_history.diabetes && <span className="badge bg-danger">Diabetes</span>}
                          {record.family_medical_history.hta && <span className="badge bg-info">Hipertensión</span>}
                          {record.family_medical_history.cancer && <span className="badge bg-dark">Cáncer</span>}
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="d-flex flex-wrap gap-2">
                          {record.family_medical_history.hypo_hyperthyroidism && <span className="badge bg-primary">Tiroides</span>}
                          {record.family_medical_history.dyslipidemia && <span className="badge bg-secondary">Dislipidemia</span>}
                        </div>
                        {record.family_medical_history.other_history && (
                          <div className="mt-2">
                            <strong>Otros:</strong> {record.family_medical_history.other_history}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Pestaña: Estilo de Vida */}
            {activeTab === 'lifestyle' && (
              <div className="tab-pane fade show active">
                <h6><i className="fas fa-running me-2"></i>Estilo de Vida</h6>
                
                <div className="row">
                  <div className="col-md-6">
                    {/* Ejercicio Físico */}
                    {record.physical_exercise && (
                      <div className="mb-4">
                        <h6 className="text-primary">Ejercicio Físico</h6>
                        <table className="table table-sm">
                          <tbody>
                            <tr>
                              <td><strong>¿Realiza ejercicio?</strong></td>
                              <td>
                                {record.physical_exercise.performs_exercise ? (
                                  <span className="badge bg-success">Sí</span>
                                ) : (
                                  <span className="badge bg-secondary">No</span>
                                )}
                              </td>
                            </tr>
                            {record.physical_exercise.performs_exercise && (
                              <>
                                {record.physical_exercise.type && (
                                  <tr>
                                    <td><strong>Tipo de ejercicio:</strong></td>
                                    <td>{record.physical_exercise.type}</td>
                                  </tr>
                                )}
                                {record.physical_exercise.frequency && (
                                  <tr>
                                    <td><strong>Frecuencia:</strong></td>
                                    <td>{record.physical_exercise.frequency}</td>
                                  </tr>
                                )}
                                {record.physical_exercise.duration && (
                                  <tr>
                                    <td><strong>Duración:</strong></td>
                                    <td>{record.physical_exercise.duration}</td>
                                  </tr>
                                )}
                                {record.physical_exercise.since_when && (
                                  <tr>
                                    <td><strong>¿Desde cuándo?</strong></td>
                                    <td>{record.physical_exercise.since_when}</td>
                                  </tr>
                                )}
                              </>
                            )}
                          </tbody>
                        </table>
                      </div>
                    )}
                    
                    {/* Nivel de Actividad */}
                    {record.activity_level_description && (
                      <div className="mb-3">
                        <h6 className="text-primary">Nivel de Actividad</h6>
                        <div className="bg-light p-3 rounded">
                          <p className="mb-0">{record.activity_level_description}</p>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className="col-md-6">
                    {/* Hábitos de Consumo */}
                    {record.consumption_habits && (
                      <div className="mb-4">
                        <h6 className="text-primary">Hábitos de Consumo</h6>
                        <table className="table table-sm">
                          <tbody>
                            {record.consumption_habits.alcohol && (
                              <tr>
                                <td><strong>Alcohol:</strong></td>
                                <td>{record.consumption_habits.alcohol}</td>
                              </tr>
                            )}
                            {record.consumption_habits.tobacco && (
                              <tr>
                                <td><strong>Tabaco:</strong></td>
                                <td>{record.consumption_habits.tobacco}</td>
                              </tr>
                            )}
                            {record.consumption_habits.coffee && (
                              <tr>
                                <td><strong>Café:</strong></td>
                                <td>{record.consumption_habits.coffee}</td>
                              </tr>
                            )}
                            {record.consumption_habits.other_substances && (
                              <tr>
                                <td><strong>Otras sustancias:</strong></td>
                                <td>{record.consumption_habits.other_substances}</td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    )}
                    
                    {/* Consumo de agua */}
                    {record.water_consumption_liters && (
                      <div className="mb-3">
                        <h6 className="text-primary">Hidratación</h6>
                        <div className="bg-light p-3 rounded">
                          <p className="mb-0">
                            <strong>Consumo de agua:</strong> {record.water_consumption_liters} litros/día
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Frecuencia de Consumo de Grupos de Alimentos */}
                {record.food_group_consumption_frequency && (
                  <div className="mt-4">
                    <h6 className="text-primary">Frecuencia de Consumo de Grupos de Alimentos (Semanal)</h6>
                    <div className="row">
                      <div className="col-md-6">
                        <table className="table table-sm">
                          <tbody>
                            {record.food_group_consumption_frequency.vegetables && (
                              <tr>
                                <td><strong>Vegetales:</strong></td>
                                <td>{record.food_group_consumption_frequency.vegetables} veces/semana</td>
                              </tr>
                            )}
                            {record.food_group_consumption_frequency.fruits && (
                              <tr>
                                <td><strong>Frutas:</strong></td>
                                <td>{record.food_group_consumption_frequency.fruits} veces/semana</td>
                              </tr>
                            )}
                            {record.food_group_consumption_frequency.cereals && (
                              <tr>
                                <td><strong>Cereales:</strong></td>
                                <td>{record.food_group_consumption_frequency.cereals} veces/semana</td>
                              </tr>
                            )}
                            {record.food_group_consumption_frequency.legumes && (
                              <tr>
                                <td><strong>Leguminosas:</strong></td>
                                <td>{record.food_group_consumption_frequency.legumes} veces/semana</td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                      <div className="col-md-6">
                        <table className="table table-sm">
                          <tbody>
                            {record.food_group_consumption_frequency.animal_products && (
                              <tr>
                                <td><strong>Productos Animales:</strong></td>
                                <td>{record.food_group_consumption_frequency.animal_products} veces/semana</td>
                              </tr>
                            )}
                            {record.food_group_consumption_frequency.milk_products && (
                              <tr>
                                <td><strong>Lácteos:</strong></td>
                                <td>{record.food_group_consumption_frequency.milk_products} veces/semana</td>
                              </tr>
                            )}
                            {record.food_group_consumption_frequency.fats && (
                              <tr>
                                <td><strong>Grasas:</strong></td>
                                <td>{record.food_group_consumption_frequency.fats} veces/semana</td>
                              </tr>
                            )}
                            {record.food_group_consumption_frequency.sugars && (
                              <tr>
                                <td><strong>Azúcares:</strong></td>
                                <td>{record.food_group_consumption_frequency.sugars} veces/semana</td>
                              </tr>
                            )}
                            {record.food_group_consumption_frequency.alcohol && (
                              <tr>
                                <td><strong>Alcohol:</strong></td>
                                <td>{record.food_group_consumption_frequency.alcohol} veces/semana</td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                    
                    {record.food_group_consumption_frequency.other_frequency && record.food_group_consumption_frequency.other_frequency.length > 0 && (
                      <div className="mt-3">
                        <h6 className="text-primary">Otros Grupos de Alimentos</h6>
                        <div className="bg-light p-3 rounded">
                          {record.food_group_consumption_frequency.other_frequency.map((item, index) => (
                            <p key={index} className="mb-1">
                              <strong>{item.group}:</strong> {item.frequency} veces/semana
                            </p>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Registro Dietético Diario */}
                {record.daily_diet_record && (
                  <div className="mt-4">
                    <h6 className="text-primary">Recordatorio de 24 Horas</h6>
                    {record.daily_diet_record.time_intervals && record.daily_diet_record.time_intervals.length > 0 && (
                      <div className="table-responsive">
                        <table className="table table-sm">
                          <thead>
                            <tr>
                              <th>Hora</th>
                              <th>Alimentos</th>
                              <th>Cantidad</th>
                            </tr>
                          </thead>
                          <tbody>
                            {record.daily_diet_record.time_intervals.map((interval, index) => (
                              <tr key={index}>
                                <td>{interval.time}</td>
                                <td>{interval.foods}</td>
                                <td>{interval.quantity}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                    {record.daily_diet_record.estimated_kcal && (
                      <div className="mt-2">
                        <span className="badge bg-primary">
                          Calorías estimadas: {record.daily_diet_record.estimated_kcal} kcal
                        </span>
                      </div>
                    )}
                  </div>
                )}
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
                      
                      {record.current_problems.mouth_mechanics && (
                        <div className="mt-3">
                          <strong>Mecánicos de la Boca:</strong>
                          <p className="text-muted">{record.current_problems.mouth_mechanics}</p>
                          <small className="text-muted">Ej: Dificultad para masticar, problemas dentales...</small>
                        </div>
                      )}
                    </div>
                    <div className="col-md-6">
                      {record.current_problems.other_problems && (
                        <div className="mb-3">
                          <strong>Otros Problemas:</strong>
                          <p className="text-muted">{record.current_problems.other_problems}</p>
                          <small className="text-muted">Describe otros problemas...</small>
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
                          {record.anthropometric_measurements.waist_circ_cm && (
                            <tr>
                              <td><strong>Cintura:</strong></td>
                              <td>{record.anthropometric_measurements.waist_circ_cm} cm</td>
                            </tr>
                          )}
                          {record.anthropometric_measurements.hip_circ_cm && (
                            <tr>
                              <td><strong>Cadera:</strong></td>
                              <td>{record.anthropometric_measurements.hip_circ_cm} cm</td>
                            </tr>
                          )}
                          {record.anthropometric_measurements.abdominal_circ_cm && (
                            <tr>
                              <td><strong>Abdominal:</strong></td>
                              <td>{record.anthropometric_measurements.abdominal_circ_cm} cm</td>
                            </tr>
                          )}
                          {record.anthropometric_measurements.arm_circ_cm && (
                            <tr>
                              <td><strong>Brazo:</strong></td>
                              <td>{record.anthropometric_measurements.arm_circ_cm} cm</td>
                            </tr>
                          )}
                          {record.anthropometric_measurements.calf_circ_cm && (
                            <tr>
                              <td><strong>Pantorrilla:</strong></td>
                              <td>{record.anthropometric_measurements.calf_circ_cm} cm</td>
                            </tr>
                          )}
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

                {/* Evaluaciones Antropométricas */}
                {record.anthropometric_evaluations && (
                  <div className="row mt-4">
                    <div className="col-md-6">
                      <h6 className="text-primary">Análisis de Composición Corporal</h6>
                      <table className="table table-sm">
                        <tbody>
                          {record.anthropometric_evaluations.total_muscle_mass_kg && (
                            <tr>
                              <td><strong>Masa Muscular Total:</strong></td>
                              <td>{record.anthropometric_evaluations.total_muscle_mass_kg} kg</td>
                            </tr>
                          )}
                          {record.anthropometric_evaluations.body_fat_percentage && (
                            <tr>
                              <td><strong>Grasa Corporal:</strong></td>
                              <td>{record.anthropometric_evaluations.body_fat_percentage}%</td>
                            </tr>
                          )}
                          {record.anthropometric_evaluations.total_body_fat_kg && (
                            <tr>
                              <td><strong>Grasa Corporal Total:</strong></td>
                              <td>{record.anthropometric_evaluations.total_body_fat_kg} kg</td>
                            </tr>
                          )}
                          {record.anthropometric_evaluations.fat_free_mass_kg && (
                            <tr>
                              <td><strong>Masa Libre de Grasa:</strong></td>
                              <td>{record.anthropometric_evaluations.fat_free_mass_kg} kg</td>
                            </tr>
                          )}
                          {record.anthropometric_evaluations.ideal_weight_kg && (
                            <tr>
                              <td><strong>Peso Ideal:</strong></td>
                              <td>{record.anthropometric_evaluations.ideal_weight_kg} kg</td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                    <div className="col-md-6">
                      <h6 className="text-primary">Evaluaciones Adicionales</h6>
                      <table className="table table-sm">
                        <tbody>
                          {record.anthropometric_evaluations.total_body_water_liters && (
                            <tr>
                              <td><strong>Agua Corporal Total:</strong></td>
                              <td>{record.anthropometric_evaluations.total_body_water_liters} litros</td>
                            </tr>
                          )}
                          {record.anthropometric_evaluations.imc_kg_t2 && (
                            <tr>
                              <td><strong>IMC:</strong></td>
                              <td>{record.anthropometric_evaluations.imc_kg_t2} kg/m²</td>
                            </tr>
                          )}
                          {record.anthropometric_evaluations.waist_hip_ratio_cm && (
                            <tr>
                              <td><strong>Relación Cintura/Cadera:</strong></td>
                              <td>{record.anthropometric_evaluations.waist_hip_ratio_cm}</td>
                            </tr>
                          )}
                          {record.anthropometric_evaluations.arm_muscle_area_cm2 && (
                            <tr>
                              <td><strong>Área Muscular del Brazo:</strong></td>
                              <td>{record.anthropometric_evaluations.arm_muscle_area_cm2} cm²</td>
                            </tr>
                          )}
                          {record.anthropometric_evaluations.complexion && (
                            <tr>
                              <td><strong>Complexión:</strong></td>
                              <td>{record.anthropometric_evaluations.complexion}</td>
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
                    <div className="row">
                      <div className="col-md-6">
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
                                {record.blood_pressure.systolic !== undefined && record.blood_pressure.diastolic !== undefined && (
                                  <tr>
                                    <td><strong>Presión Arterial:</strong></td>
                                    <td>
                                      <span className={`badge ${
                                        record.blood_pressure.systolic >= 140 || record.blood_pressure.diastolic >= 90 
                                          ? 'bg-danger' 
                                          : record.blood_pressure.systolic >= 120 || record.blood_pressure.diastolic >= 80
                                          ? 'bg-warning' 
                                          : 'bg-success'
                                      }`}>
                                        {record.blood_pressure.systolic}/{record.blood_pressure.diastolic} mmHg
                                      </span>
                                    </td>
                                  </tr>
                                )}
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
                      <div className="col-md-6">
                        {record.nutritional_diagnosis && (
                          <div>
                            <h6 className="text-primary">Diagnóstico Nutricional</h6>
                            <div className="bg-light p-3 rounded">
                              <p className="mb-0">{record.nutritional_diagnosis}</p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
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

            {/* Pestaña: Documentos de Laboratorio */}
            {activeTab === 'laboratory' && (
              <div className="tab-pane fade show active">
                <LaboratoryDocuments
                  recordId={record.id}
                  documents={record.laboratory_documents || []}
                  onDocumentsChange={() => {
                    // Trigger refresh of the record
                    window.location.reload(); // Simple refresh, can be improved with proper state management
                  }}
                  canUpload={canEdit}
                  canDelete={canDelete}
                />
              </div>
            )}

            {/* Pestaña: Interacciones Fármaco-Nutriente */}
            {activeTab === 'interactions' && (
              <div className="tab-pane fade show active">
                <DrugNutrientInteractions
                  recordId={record.id}
                  interactions={record.drug_nutrient_interactions || []}
                  medications={(record.diagnosed_diseases?.medications_list || []).map((med, index) => ({
                    id: `med_${index}`,
                    name: med,
                    generic_name: undefined,
                    dosage: undefined,
                    frequency: undefined
                  }))}
                  onInteractionsChange={() => {
                    // Trigger refresh of the record
                    window.location.reload(); // Simple refresh, can be improved with proper state management
                  }}
                  canEdit={canEdit}
                />
              </div>
            )}

            {/* Pestaña: Crecimiento Pediátrico */}
            {activeTab === 'growth' && (
              <div className="tab-pane fade show active">
                <div className="alert alert-info mb-3">
                  <i className="fas fa-info-circle me-2"></i>
                  <strong>Análisis de Crecimiento Pediátrico</strong>
                  <p className="mb-1 mt-2">
                    Esta sección permite generar reportes de crecimiento pediátrico basados en las mediciones 
                    antropométricas registradas en el expediente clínico del paciente.
                  </p>
                  {record.patient.age && (
                    <p className="mb-0">
                      <small>
                        Edad del paciente: {record.patient.age} años
                      </small>
                    </p>
                  )}
                </div>
                
                <GrowthChartsPDFExport 
                  patientId={record.patient.id}
                  patientName={`${record.patient.first_name} ${record.patient.last_name}`}
                />
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