import React, { useState } from 'react';
import { Card, Button, Row, Col, Nav, Badge, Alert } from 'react-bootstrap';
import { 
  MdEdit, 
  MdDelete, 
  MdVisibility,
  MdPerson,
  MdDescription,
  MdFilterList,
  MdCalendarToday
} from 'react-icons/md';
import { 
  FaUserMd, 
  FaStethoscope, 
  FaCalendarCheck, 
  FaHeartbeat,
  FaLaptopMedical,
  FaExclamationTriangle
} from 'react-icons/fa';
import { HiOutlineDocumentText } from 'react-icons/hi';
import type { ClinicalRecord, TipoExpediente } from '../../types/clinical-record';

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
  canDelete = true}) => {
  const [filterBy] = useState('');
  const [tipoFilter, setTipoFilter] = useState<TipoExpediente | 'todos'>('todos');

  // Utilidades para tipos de expedientes
  const getTipoDisplayName = (tipo: TipoExpediente | undefined) => {
    const nombres: { [key in TipoExpediente]: string } = {
      'inicial': 'Inicial',
      'seguimiento': 'Seguimiento',
      'urgencia': 'Urgencia',
      'control': 'Control',
      'pre_operatorio': 'Pre-operatorio',
      'post_operatorio': 'Post-operatorio',
      'consulta_especialidad': 'Especialidad',
      'anual': 'Anual',
      'telehealth': 'Telemedicina'
    };
    return tipo ? nombres[tipo] : 'Sin clasificar';
  };

  const getTipoBadgeColor = (tipo: TipoExpediente | undefined) => {
    const colores: { [key in TipoExpediente]: string } = {
      'inicial': 'primary',
      'seguimiento': 'success',
      'urgencia': 'danger',
      'control': 'warning',
      'pre_operatorio': 'info',
      'post_operatorio': 'secondary',
      'consulta_especialidad': 'purple',
      'anual': 'info',
      'telehealth': 'dark'
    };
    return tipo ? colores[tipo] : 'light';
  };

  const getTipoIcon = (tipo: TipoExpediente | undefined) => {
    const iconos: { [key in TipoExpediente]: React.ReactNode } = {
      'inicial': <FaUserMd className="me-1" />,
      'seguimiento': <FaStethoscope className="me-1" />,
      'urgencia': <FaExclamationTriangle className="me-1" />,
      'control': <FaCalendarCheck className="me-1" />,
      'pre_operatorio': <FaHeartbeat className="me-1" />,
      'post_operatorio': <FaHeartbeat className="me-1" />,
      'consulta_especialidad': <FaUserMd className="me-1" />,
      'anual': <FaCalendarCheck className="me-1" />,
      'telehealth': <FaLaptopMedical className="me-1" />
    };
    return tipo ? iconos[tipo] : <HiOutlineDocumentText className="me-1" />;
  };

  // Obtener estadísticas por tipo
  const getTypeStats = () => {
    const stats = records.reduce((acc, record) => {
      const tipo = record.tipo_expediente || 'sin_clasificar';
      acc[tipo] = (acc[tipo] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    return stats;
  };

  const typeStats = getTypeStats();

  // Filtrar expedientes
  const filteredRecords = records.filter(record => {
    // Filtro por tipo
    if (tipoFilter !== 'todos' && record.tipo_expediente !== tipoFilter) {
      return false;
    }

    // Filtro por búsqueda de texto
    if (!filterBy) return true;
    const searchTerm = filterBy.toLowerCase();
    return (
      record.consultation_reason?.toLowerCase().includes(searchTerm) ||
      record.nutritional_diagnosis?.toLowerCase().includes(searchTerm) ||
      record.expedient_number?.toLowerCase().includes(searchTerm) ||
      `${record.nutritionist.first_name} ${record.nutritionist.last_name}`.toLowerCase().includes(searchTerm)
    );
  });

  // Ordenar expedientes por fecha (más recientes primero)
  const sortedRecords = [...filteredRecords].sort((a, b) => {
    return new Date(b.record_date).getTime() - new Date(a.record_date).getTime();
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-MX', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'});
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
      {/* Filtros por tipo */}
      <Card className="mb-3">
        <Card.Header className="bg-light">
          <div className="d-flex align-items-center">
            <MdFilterList className="me-2" />
            <strong>Filtrar por Tipo de Expediente</strong>
          </div>
        </Card.Header>
        <Card.Body>
          <Nav variant="pills" className="flex-wrap">
            <Nav.Item className="me-2 mb-2">
              <Nav.Link 
                active={tipoFilter === 'todos'} 
                onClick={() => setTipoFilter('todos')}
                className="d-flex align-items-center"
              >
                <HiOutlineDocumentText className="me-1" />
                Todos 
                <Badge bg="secondary" className="ms-2">{records.length}</Badge>
              </Nav.Link>
            </Nav.Item>
            
            {/* Mostrar solo tipos que existen en los registros */}
            {Object.entries(typeStats).map(([tipo, count]) => {
              if (tipo === 'sin_clasificar') return null;
              
              return (
                <Nav.Item key={tipo} className="me-2 mb-2">
                  <Nav.Link 
                    active={tipoFilter === tipo} 
                    onClick={() => setTipoFilter(tipo as TipoExpediente)}
                    className="d-flex align-items-center"
                  >
                    {getTipoIcon(tipo as TipoExpediente)}
                    {getTipoDisplayName(tipo as TipoExpediente)}
                    <Badge bg={getTipoBadgeColor(tipo as TipoExpediente)} className="ms-2">
                      {count}
                    </Badge>
                  </Nav.Link>
                </Nav.Item>
              );
            })}
          </Nav>
        </Card.Body>
      </Card>

      {/* Indicador de filtro activo */}
      {tipoFilter !== 'todos' && (
        <div className="mb-3">
          <Alert variant="info" className="d-flex align-items-center justify-content-between">
            <div>
              <strong>Filtro activo:</strong> Mostrando solo expedientes de tipo "{getTipoDisplayName(tipoFilter as TipoExpediente)}"
            </div>
            <Button 
              variant="outline-secondary" 
              size="sm" 
              onClick={() => setTipoFilter('todos')}
            >
              Limpiar filtro
            </Button>
          </Alert>
        </div>
      )}

      {/* Lista de expedientes */}
      {sortedRecords.length === 0 ? (
        <div className="text-center py-5">
          <HiOutlineDocumentText className="text-muted mb-3" size={48} />
          <h4 className="text-muted mb-3">
            {tipoFilter !== 'todos' 
              ? `No hay expedientes de tipo "${getTipoDisplayName(tipoFilter as TipoExpediente)}"` 
              : filterBy 
                ? 'No se encontraron expedientes' 
                : 'No hay expedientes clínicos'
            }
          </h4>
          <p className="text-muted">
            {tipoFilter !== 'todos' 
              ? 'Selecciona "Todos" para ver todos los expedientes disponibles'
              : filterBy 
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
                        <div className="avatar-circle bg-primary text-white d-flex align-items-center justify-content-center">
                          <MdPerson size={20} />
                        </div>
                      </div>
                      <div>
                        <h6 className="mb-1">
                          {record.patient.first_name} {record.patient.last_name}
                        </h6>
                        <div className="d-flex align-items-center text-muted small">
                          <MdCalendarToday className="me-1" size={14} />
                          {formatDate(record.record_date)}
                        </div>
                      </div>
                    </div>
                    
                    {/* Badge de tipo de expediente */}
                    <Badge 
                      bg={getTipoBadgeColor(record.tipo_expediente)} 
                      className="d-flex align-items-center"
                    >
                      {getTipoIcon(record.tipo_expediente)}
                      {getTipoDisplayName(record.tipo_expediente)}
                    </Badge>
                  </div>

                  {/* Información del expediente */}
                  <div className="mb-3">
                    {record.expedient_number && (
                      <div className="text-muted small mb-1">
                        <strong>Número:</strong> {record.expedient_number}
                      </div>
                    )}
                    
                    {record.consultation_reason && (
                      <div className="mb-2">
                        <div className="d-flex align-items-start">
                          <MdDescription className="me-2 mt-1 text-muted" size={16} />
                          <div>
                            <small className="text-muted d-block">Motivo de consulta:</small>
                            <span className="text-dark">
                              {record.consultation_reason.length > 100 
                                ? `${record.consultation_reason.substring(0, 100)}...` 
                                : record.consultation_reason
                              }
                            </span>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="text-muted small">
                      <FaUserMd className="me-1" />
                      <strong>Nutriólogo:</strong> {record.nutritionist.first_name} {record.nutritionist.last_name}
                    </div>
                  </div>

                  {/* Acciones */}
                  <div className="d-flex gap-2 justify-content-end">
                    <Button 
                      variant="outline-primary" 
                      size="sm" 
                      onClick={() => onViewRecord(record)}
                    >
                      <MdVisibility className="me-1" />
                      Ver
                    </Button>
                    
                    {canEdit && (
                      <Button 
                        variant="outline-warning" 
                        size="sm" 
                        onClick={() => onEditRecord(record)}
                      >
                        <MdEdit className="me-1" />
                        Editar
                      </Button>
                    )}
                    
                    {canDelete && (
                      <Button 
                        variant="outline-danger" 
                        size="sm" 
                        onClick={() => onDeleteRecord(record)}
                      >
                        <MdDelete className="me-1" />
                        Eliminar
                      </Button>
                    )}
                  </div>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      )}
    </div>
  );
};

export default ClinicalRecordsList; 