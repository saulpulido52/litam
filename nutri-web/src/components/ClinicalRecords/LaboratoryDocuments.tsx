import React, { useState, useEffect } from 'react';
import {
  Button,
  Card,
  Modal,
  Container,
  Row,
  Col,
  Form,
  ProgressBar,
  Alert,
  ListGroup,
  Badge
} from 'react-bootstrap';
import {
  CloudUpload,
  Trash2,
  Download,
  Calendar,
  FileDown,
  FileText
} from 'lucide-react';
import { clinicalRecordsService } from '../../services/clinicalRecordsService';

interface LaboratoryDocument {
  id: string;
  filename: string;
  original_name: string;
  file_url: string;
  file_size: number;
  upload_date: Date;
  uploaded_by: 'patient' | 'nutritionist';
  description?: string;
  lab_date?: Date;
}

interface LaboratoryDocumentsProps {
  recordId: string;
  documents: LaboratoryDocument[];
  onDocumentsChange: () => void;
  canUpload?: boolean;
  canDelete?: boolean;
}

const LaboratoryDocuments: React.FC<LaboratoryDocumentsProps> = ({
  recordId,
  documents,
  onDocumentsChange,
  canUpload = true,
  canDelete = false
}) => {
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [description, setDescription] = useState('');
  const [labDate, setLabDate] = useState('');
  const [uploading, setUploading] = useState(false);
  const [generatingPDF, setGeneratingPDF] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Limpiar mensajes después de un tiempo
  useEffect(() => {
    if (error || success) {
      const timer = setTimeout(() => {
        setError(null);
        setSuccess(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, success]);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type !== 'application/pdf') {
        setError('Solo se permiten archivos PDF');
        return;
      }
      if (file.size > 5 * 1024 * 1024) { // 5MB
        setError('El archivo es demasiado grande. Máximo 5MB');
        return;
      }
      setSelectedFile(file);
      setError(null);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setUploading(true);
    setError(null);

    try {
      const result = await clinicalRecordsService.uploadLaboratoryDocument(
        recordId,
        selectedFile,
        description,
        labDate
      );

      setSuccess('Documento de laboratorio subido exitosamente');

      // Show preview of uploaded file if URL is available
      if (result?.data?.file_url) {
        window.open(result.data.file_url, '_blank');
      }

      setUploadDialogOpen(false);
      setSelectedFile(null);
      setDescription('');
      setLabDate('');
      onDocumentsChange();
    } catch (error: any) {
      setError(error.message);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (documentId: string, filename: string) => {
    if (!window.confirm(`¿Estás seguro de que quieres eliminar ${filename}?`)) {
      return;
    }

    try {
      await clinicalRecordsService.deleteLaboratoryDocument(recordId, documentId);
      setSuccess('Documento eliminado exitosamente');
      onDocumentsChange();
    } catch (error: any) {
      setError(error.message);
    }
  };

  const handleGenerateExpedientePDF = async () => {
    setGeneratingPDF(true);
    setError(null);

    try {
      // Usar el servicio para generar el PDF
      const pdfBlob = await clinicalRecordsService.generateExpedientePDF(recordId);

      // Crear URL temporal para el blob
      const pdfUrl = window.URL.createObjectURL(pdfBlob);

      // Nombre del archivo
      const filename = `expediente_${recordId}_${Date.now()}.pdf`;

      setSuccess('PDF del expediente generado exitosamente');

      // Abrir el PDF en nueva ventana
      window.open(pdfUrl, '_blank');

      // También crear enlace de descarga
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

    } catch (error: any) {
      console.error('Error generating PDF:', error);
      setError(error.message);
    } finally {
      setGeneratingPDF(false);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const resetModal = () => {
    setUploadDialogOpen(false);
    setSelectedFile(null);
    setDescription('');
    setLabDate('');
    setError(null);
  };

  return (
    <Container>
      {/* Mensajes de estado */}
      {error && (
        <Alert variant="danger" dismissible onClose={() => setError(null)} className="mb-3">
          {error}
        </Alert>
      )}
      {success && (
        <Alert variant="success" dismissible onClose={() => setSuccess(null)} className="mb-3">
          {success}
        </Alert>
      )}

      {/* Header con botones de acción */}
      <Row className="mb-4">
        <Col>
          <div className="d-flex justify-content-between align-items-center">
            <h4>
              <FileText className="me-2" size={24} />
              Documentos de Laboratorio
            </h4>
            <div>
              {canUpload && (
                <Button
                  variant="primary"
                  onClick={() => setUploadDialogOpen(true)}
                  className="me-2"
                  disabled={uploading}
                >
                  <CloudUpload size={16} className="me-1" />
                  Subir PDF
                </Button>
              )}
              <Button
                variant="outline-primary"
                onClick={handleGenerateExpedientePDF}
                disabled={generatingPDF}
              >
                <FileDown size={16} className="me-1" />
                {generatingPDF ? 'Generando...' : 'Generar Expediente PDF'}
              </Button>
            </div>
          </div>
        </Col>
      </Row>

      {generatingPDF && (
        <ProgressBar animated now={100} className="mb-3" />
      )}

      {/* Lista de documentos */}
      <Card>
        <Card.Body>
          {documents.length === 0 ? (
            <div className="text-center py-5">
              <FileText size={48} className="text-muted mb-3" />
              <p className="text-muted">No hay documentos de laboratorio</p>
            </div>
          ) : (
            <ListGroup variant="flush">
              {documents.map((doc) => (
                <ListGroup.Item key={doc.id}>
                  <Row className="align-items-center">
                    <Col md={1}>
                      <FileText size={24} className="text-danger" />
                    </Col>
                    <Col md={7}>
                      <div>
                        <strong>{doc.original_name}</strong>
                        <div className="mt-2">
                          <Badge
                            bg={doc.uploaded_by === 'patient' ? 'primary' : 'secondary'}
                            className="me-2"
                          >
                            {doc.uploaded_by === 'patient' ? 'Paciente' : 'Nutriólogo'}
                          </Badge>
                          <Badge bg="light" text="dark" className="me-2">
                            {formatFileSize(doc.file_size)}
                          </Badge>
                          {doc.lab_date && (
                            <Badge bg="info" className="me-2">
                              <Calendar size={12} className="me-1" />
                              Lab: {new Date(doc.lab_date).toLocaleDateString('es-ES')}
                            </Badge>
                          )}
                        </div>
                        {doc.description && (
                          <div className="text-muted mt-2">
                            {doc.description}
                          </div>
                        )}
                        <small className="text-muted">
                          Subido el {formatDate(doc.upload_date)}
                        </small>
                      </div>
                    </Col>
                    <Col md={4} className="text-end">
                      <Button
                        variant="outline-primary"
                        size="sm"
                        onClick={() => {
                          // Create a temporary link to download the file
                          const link = document.createElement('a');
                          link.href = doc.file_url;
                          link.download = doc.original_name;
                          link.target = '_blank';
                          link.rel = 'noopener noreferrer';
                          document.body.appendChild(link);
                          link.click();
                          document.body.removeChild(link);
                        }}
                        className="me-2"
                      >
                        <Download size={14} className="me-1" />
                        Descargar
                      </Button>
                      {canDelete && (
                        <Button
                          variant="outline-danger"
                          size="sm"
                          onClick={() => handleDelete(doc.id, doc.original_name)}
                        >
                          <Trash2 size={14} />
                        </Button>
                      )}
                    </Col>
                  </Row>
                </ListGroup.Item>
              ))}
            </ListGroup>
          )}
        </Card.Body>
      </Card>

      {/* Modal para subir documento */}
      <Modal show={uploadDialogOpen} onHide={resetModal} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            <FileText className="me-2" size={20} />
            Subir Documento de Laboratorio
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {/* Selector de archivo */}
          <Form.Group className="mb-3">
            <Form.Label>Seleccionar archivo PDF</Form.Label>
            <Form.Control
              type="file"
              accept=".pdf"
              onChange={handleFileSelect}
            />
            <Form.Text className="text-muted">
              Solo se permiten archivos PDF. Tamaño máximo: 5MB
            </Form.Text>
          </Form.Group>

          {selectedFile && (
            <Alert variant="info" className="mb-3">
              <strong>Archivo seleccionado:</strong> {selectedFile.name} ({formatFileSize(selectedFile.size)})
            </Alert>
          )}

          {/* Descripción */}
          <Form.Group className="mb-3">
            <Form.Label>Descripción (opcional)</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Ej: Análisis de sangre completo, perfil lipídico, etc."
            />
          </Form.Group>

          {/* Fecha del laboratorio */}
          <Form.Group className="mb-3">
            <Form.Label>Fecha del laboratorio (opcional)</Form.Label>
            <Form.Control
              type="date"
              value={labDate}
              onChange={(e) => setLabDate(e.target.value)}
              max={new Date().toISOString().split('T')[0]}
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={resetModal}>
            Cancelar
          </Button>
          <Button
            variant="primary"
            onClick={handleUpload}
            disabled={!selectedFile || uploading}
          >
            {uploading ? (
              <>
                <ProgressBar
                  animated
                  now={100}
                  style={{ width: '20px', height: '4px', marginRight: '8px' }}
                />
                Subiendo...
              </>
            ) : (
              <>
                <CloudUpload size={16} className="me-1" />
                Subir Documento
              </>
            )}
          </Button>
        </Modal.Footer>
        {uploading && (
          <ProgressBar animated now={100} />
        )}
      </Modal>
    </Container>
  );
};

export default LaboratoryDocuments; 