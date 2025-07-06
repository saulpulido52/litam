import React, { useState } from 'react';
import { Card, Button, Badge, Modal, Form, Row, Col } from 'react-bootstrap';
import { 
  MdAdd, 
  MdEdit, 
  MdDelete, 
  MdVisibility,
  MdSearch,
  MdFilterList,
  MdSort,
  MdPerson,
  MdCalendarToday,
  MdDescription,
  MdStickyNote2
} from 'react-icons/md';
import { FaUserMd } from 'react-icons/fa';
import { HiOutlineDocumentText } from 'react-icons/hi';
import type { ClinicalRecord } from '../../types/clinical-record';

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


      {/* Lista de expedientes */}
      {sortedRecords.length === 0 ? (
        <div className="text-center py-5">
          <HiOutlineDocumentText className="text-muted mb-3" size={48} />
          <h4 className="text-muted mb-3">
            {filterBy ? 'No se encontraron expedientes' : 'No hay expedientes clínicos'}
          </h4>
          <p className="text-muted">
            {filterBy 
              ? 'Intenta con otros términos de búsqueda'
              : 'Los expedientes clínicos aparecerán aquí una vez que se creen'
            }
          </p>
        </div>
      ) : (
        <Row>
          {sortedRecords.map((record) => (
            <Col key={record.id} lg={6} md={12} className="mb-3">
              <Card className="h-100 patient-card">
                <Card.Body>
                  <div className="d-flex justify-content-between align-items-start mb-3">
                    <div className="d-flex align-items-center">
                      <div className="patient-avatar me-3">
                        <FaUserMd size={32} />
                      </div>
                      <div>
                        <h6 className="mb-0 fw-bold">
                          {record.expedient_number && (
                            <Badge bg="primary" className="me-2">
                              {record.expedient_number}
                            </Badge>
                          )}
                          Expediente Clínico
                        </h6>
                        <small className="text-muted d-flex align-items-center">
                          <MdCalendarToday size={14} className="me-1" />
                          {formatDate(record.record_date)}
                        </small>
                      </div>
                    </div>
                    <Badge 
                      bg="info"
                      className="patient-status-badge"
                    >
                      {new Date(record.updated_at).toLocaleDateString('es-MX')}
                    </Badge>
                  </div>
                  
                  <div className="patient-info mb-3">
                    <div className="patient-info-item">
                      <div className="info-icon-wrapper">
                        <FaUserMd className="info-icon" />
                      </div>
                      <small className="info-text">
                        Dr./Dra. {record.nutritionist.first_name} {record.nutritionist.last_name}
                      </small>
                    </div>
                    
                    {record.consultation_reason && (
                      <div className="patient-info-item">
                        <div className="info-icon-wrapper">
                          <MdDescription className="info-icon" />
                        </div>
                        <small className="info-text">
                          {record.consultation_reason.length > 50
                            ? `${record.consultation_reason.substring(0, 50)}...`
                            : record.consultation_reason
                          }
                        </small>
                      </div>
                    )}
                    
                    {record.anthropometric_measurements?.current_weight_kg && (
                      <div className="patient-info-item">
                        <div className="info-icon-wrapper">
                          <MdPerson className="info-icon" />
                        </div>
                        <small className="info-text">
                          Peso: {record.anthropometric_measurements.current_weight_kg}kg
                        </small>
                      </div>
                    )}
                    
                    {record.evolution_and_follow_up_notes && (
                      <div className="patient-info-item">
                        <div className="info-icon-wrapper">
                          <MdStickyNote2 className="info-icon" />
                        </div>
                        <small className="info-text">
                          {record.evolution_and_follow_up_notes.length > 60
                            ? `${record.evolution_and_follow_up_notes.substring(0, 60)}...`
                            : record.evolution_and_follow_up_notes
                          }
                        </small>
                      </div>
                    )}
                  </div>
                  
                  <div className="patient-actions">
                    <div className="action-buttons">
                      <Button 
                        variant="primary" 
                        size="sm"
                        className="action-btn primary-btn"
                        onClick={() => onViewRecord(record)}
                      >
                        <MdVisibility className="btn-icon" />
                        <span>Ver Detalles</span>
                      </Button>
                      
                      <div className="secondary-actions">
                        {canEdit && (
                          <Button 
                            variant="outline-primary" 
                            size="sm"
                            className="action-btn secondary-btn"
                            onClick={() => onEditRecord(record)}
                          >
                            <MdEdit className="btn-icon" />
                            <span>Editar</span>
                          </Button>
                        )}
                      </div>
                      
                      {canDelete && (
                        <Button 
                          variant="outline-danger" 
                          size="sm"
                          className="action-btn danger-btn"
                          onClick={() => onDeleteRecord(record)}
                        >
                          <MdDelete className="btn-icon" />
                          <span>Eliminar</span>
                        </Button>
                      )}
                    </div>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      )}

      {/* Información adicional */}
      <div className="mt-3">
        <small className="text-muted">
          <MdSearch className="me-1" />
          Mostrando {sortedRecords.length} de {records.length} expedientes
          {filterBy && ` (filtrados por "${filterBy}")`}
        </small>
      </div>
    </div>
  );
};

export default ClinicalRecordsList; 