import React, { useState } from 'react';
import type { ClinicalRecord } from '../../types';
import LaboratoryDocuments from './LaboratoryDocuments';
import DrugNutrientInteractions from './DrugNutrientInteractions';
import GrowthChartsPDFExport from '../GrowthCharts/GrowthChartsPDFExport';

// Import new sub-components
import InfoGeneral from './DetailSections/InfoGeneral';
import HistoriaClinica from './DetailSections/HistoriaClinica';
import ProblemasActuales from './DetailSections/ProblemasActuales';
import EstiloVida from './DetailSections/EstiloVida';
import Antropometria from './DetailSections/Antropometria';
import HistoriaDietetica from './DetailSections/HistoriaDietetica';
import DiagnosticoPlan from './DetailSections/DiagnosticoPlan';

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
  canDelete = true }) => {
  const [activeTab, setActiveTab] = useState('basic');

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-MX', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('es-MX', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
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
            {/* Mostrar pestaña de Crecimiento Pediátrico solo para pacientes ≤ 18 años */}
            {record.patient.age !== undefined && record.patient.age <= 18 && (
              <li className="nav-item" role="presentation">
                <button
                  className={`nav-link ${activeTab === 'growth' ? 'active' : ''}`}
                  onClick={() => setActiveTab('growth')}
                >
                  <i className="fas fa-chart-line me-1"></i>Crecimiento Pediátrico
                </button>
              </li>
            )}
          </ul>

          {/* Contenido de las pestañas */}
          <div className="tab-content">
            {activeTab === 'basic' && <InfoGeneral record={record} />}
            {activeTab === 'diseases' && <HistoriaClinica record={record} />}
            {activeTab === 'problems' && <ProblemasActuales record={record} />}
            {activeTab === 'lifestyle' && <EstiloVida record={record} />}
            {activeTab === 'measurements' && <Antropometria record={record} />}
            {activeTab === 'dietary' && <HistoriaDietetica record={record} />}
            {activeTab === 'diagnosis' && <DiagnosticoPlan record={record} />}

            {/* Pestaña: Documentos de Laboratorio (Existing sub-component) */}
            {activeTab === 'laboratory' && (
              <div className="tab-pane fade show active">
                <LaboratoryDocuments
                  recordId={record.id}
                  documents={record.laboratory_documents || []}
                  onDocumentsChange={() => {
                    // Trigger refresh of the record
                    window.location.reload();
                  }}
                  canUpload={canEdit}
                  canDelete={canDelete}
                />
              </div>
            )}

            {/* Pestaña: Interacciones Fármaco-Nutriente (Existing sub-component) */}
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
                    window.location.reload();
                  }}
                  canEdit={canEdit}
                />
              </div>
            )}

            {/* Pestaña: Crecimiento Pediátrico (Existing sub-component) */}
            {activeTab === 'growth' && (
              <div className="tab-pane fade show active">
                <div className="alert alert-info mb-3">
                  <i className="fas fa-info-circle me-2"></i>
                  <strong>Análisis de Crecimiento Pediátrico</strong>
                  <p className="mb-1 mt-2">
                    Esta sección permite generar reportes de crecimiento pediátrico basados en las mediciones
                    antropométricas registradas en el expediente clínico del paciente.
                  </p>
                  <p className="mb-0">
                    <small>
                      <strong>Nota:</strong> Esta funcionalidad está disponible para pacientes de 0 a 18 años.
                    </small>
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