import React, { useState } from 'react';
import type { ClinicalRecord } from '../../types';

interface ClinicalRecordsListProps {
  records: ClinicalRecord[];
  loading: boolean;
  onViewRecord: (record: ClinicalRecord) => void;
  onEditRecord: (record: ClinicalRecord) => void;
  onDeleteRecord: (record: ClinicalRecord) => void;
  canEdit?: boolean;
  canDelete?: boolean;
}

const ClinicalRecordsList: React.FC<ClinicalRecordsListProps> = ({
  records,
  loading,
  onViewRecord,
  onEditRecord,
  onDeleteRecord,
  canEdit = true,
  canDelete = true,
}) => {
  const [sortBy, setSortBy] = useState<'date' | 'nutritionist'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [filterBy, setFilterBy] = useState('');

  // Filtrar expedientes
  const filteredRecords = records.filter(record => {
    if (!filterBy) return true;
    const searchTerm = filterBy.toLowerCase();
    return (
      record.consultation_reason?.toLowerCase().includes(searchTerm) ||
      record.nutritional_diagnosis?.toLowerCase().includes(searchTerm) ||
      record.expedient_number?.toLowerCase().includes(searchTerm) ||
      `${record.nutritionist.first_name} ${record.nutritionist.last_name}`.toLowerCase().includes(searchTerm)
    );
  });

  // Ordenar expedientes
  const sortedRecords = [...filteredRecords].sort((a, b) => {
    let comparison = 0;
    
    if (sortBy === 'date') {
      comparison = new Date(a.record_date).getTime() - new Date(b.record_date).getTime();
    } else if (sortBy === 'nutritionist') {
      const nameA = `${a.nutritionist.first_name} ${a.nutritionist.last_name}`;
      const nameB = `${b.nutritionist.first_name} ${b.nutritionist.last_name}`;
      comparison = nameA.localeCompare(nameB);
    }
    
    return sortOrder === 'asc' ? comparison : -comparison;
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-MX', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getRecordSummary = (record: ClinicalRecord) => {
    const parts: string[] = [];
    
    if (record.consultation_reason) {
      parts.push(record.consultation_reason);
    }
    
    if (record.nutritional_diagnosis) {
      parts.push(`Dx: ${record.nutritional_diagnosis}`);
    }

    if (record.anthropometric_measurements?.current_weight_kg) {
      parts.push(`Peso: ${record.anthropometric_measurements.current_weight_kg}kg`);
    }

    return parts.join(' • ') || 'Sin resumen disponible';
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '200px' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Cargando expedientes...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="clinical-records-list">
      {/* Filtros y ordenamiento */}
      <div className="row mb-4">
        <div className="col-md-6">
          <input
            type="text"
            className="form-control"
            placeholder="Buscar expedientes..."
            value={filterBy}
            onChange={(e) => setFilterBy(e.target.value)}
          />
        </div>
        <div className="col-md-3">
          <select
            className="form-select"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'date' | 'nutritionist')}
          >
            <option value="date">Ordenar por fecha</option>
            <option value="nutritionist">Ordenar por nutriólogo</option>
          </select>
        </div>
        <div className="col-md-3">
          <select
            className="form-select"
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value as 'asc' | 'desc')}
          >
            <option value="desc">Más recientes primero</option>
            <option value="asc">Más antiguos primero</option>
          </select>
        </div>
      </div>

      {/* Lista de expedientes */}
      {sortedRecords.length === 0 ? (
        <div className="text-center py-4">
          <i className="fas fa-clipboard-list fa-3x text-muted mb-3"></i>
          <h5 className="text-muted">
            {filterBy ? 'No se encontraron expedientes' : 'No hay expedientes clínicos'}
          </h5>
          <p className="text-muted">
            {filterBy 
              ? 'Intenta con otros términos de búsqueda'
              : 'Los expedientes clínicos aparecerán aquí una vez que se creen'
            }
          </p>
        </div>
      ) : (
        <div className="row">
          {sortedRecords.map((record) => (
            <div key={record.id} className="col-12 mb-3">
              <div className="card h-100 shadow-sm">
                <div className="card-body">
                  <div className="row">
                    <div className="col-md-8">
                      <div className="d-flex justify-content-between align-items-start mb-2">
                        <h6 className="card-title mb-1">
                          {record.expedient_number && (
                            <span className="badge bg-primary me-2">
                              {record.expedient_number}
                            </span>
                          )}
                          Expediente - {formatDate(record.record_date)}
                        </h6>
                        <small className="text-muted">
                          {new Date(record.updated_at).toLocaleString('es-MX')}
                        </small>
                      </div>
                      
                      <p className="card-text text-muted small mb-2">
                        <i className="fas fa-user-md me-1"></i>
                        Dr./Dra. {record.nutritionist.first_name} {record.nutritionist.last_name}
                      </p>
                      
                      <p className="card-text">
                        {getRecordSummary(record)}
                      </p>

                      {record.evolution_and_follow_up_notes && (
                        <div className="mt-2">
                          <small className="text-muted">
                            <i className="fas fa-sticky-note me-1"></i>
                            {record.evolution_and_follow_up_notes.length > 100
                              ? `${record.evolution_and_follow_up_notes.substring(0, 100)}...`
                              : record.evolution_and_follow_up_notes
                            }
                          </small>
                        </div>
                      )}
                    </div>
                    
                    <div className="col-md-4 text-end">
                      <div className="btn-group-vertical" role="group">
                        <button
                          className="btn btn-outline-primary btn-sm"
                          onClick={() => onViewRecord(record)}
                          title="Ver expediente completo"
                        >
                          <i className="fas fa-eye me-1"></i>
                          Ver
                        </button>
                        
                        {canEdit && (
                          <button
                            className="btn btn-outline-secondary btn-sm"
                            onClick={() => onEditRecord(record)}
                            title="Editar expediente"
                          >
                            <i className="fas fa-edit me-1"></i>
                            Editar
                          </button>
                        )}
                        
                        {canDelete && (
                          <button
                            className="btn btn-outline-danger btn-sm"
                            onClick={() => onDeleteRecord(record)}
                            title="Eliminar expediente"
                          >
                            <i className="fas fa-trash me-1"></i>
                            Eliminar
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Información adicional */}
      <div className="mt-3">
        <small className="text-muted">
          <i className="fas fa-info-circle me-1"></i>
          Mostrando {sortedRecords.length} de {records.length} expedientes
          {filterBy && ` (filtrados por "${filterBy}")`}
        </small>
      </div>
    </div>
  );
};

export default ClinicalRecordsList; 