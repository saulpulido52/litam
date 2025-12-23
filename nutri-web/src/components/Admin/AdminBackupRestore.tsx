import React, { useState, useEffect } from 'react';
import { 
    Card, 
    Button, 
    Table, 
    Modal,
    Row,
    Col,
    Badge,
    Alert,
    Spinner,
    Form,
    ProgressBar
} from 'react-bootstrap';

interface BackupInfo {
    id: string;
    filename: string;
    size: number;
    createdAt: string;
    type: 'full' | 'incremental' | 'differential';
    status: 'completed' | 'failed' | 'in_progress';
    description?: string;
    checksum: string;
}

interface RestoreInfo {
    id: string;
    backupId: string;
    status: 'completed' | 'failed' | 'in_progress';
    startedAt: string;
    completedAt?: string;
    progress: number;
    error?: string;
}

const AdminBackupRestore: React.FC = () => {
    const [backups, setBackups] = useState<BackupInfo[]>([]);
    const [restores, setRestores] = useState<RestoreInfo[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showCreateBackup, setShowCreateBackup] = useState(false);
    const [showRestoreModal, setShowRestoreModal] = useState(false);
    const [selectedBackup, setSelectedBackup] = useState<BackupInfo | null>(null);
    const [backupProgress, setBackupProgress] = useState(0);
    const [restoreProgress, setRestoreProgress] = useState(0);
    const [backupType, setBackupType] = useState<'full' | 'incremental' | 'differential'>('full');
    const [backupDescription, setBackupDescription] = useState('');

    useEffect(() => {
        loadBackups();
        loadRestores();
    }, []);

    const loadBackups = async () => {
        setLoading(true);
        try {
            // Simulación de datos - en producción esto vendría del backend
            const mockBackups: BackupInfo[] = [
                {
                    id: '1',
                    filename: 'backup_full_2025-07-09_02-00-00.sql',
                    size: 1024 * 1024 * 50, // 50MB
                    createdAt: new Date().toISOString(),
                    type: 'full',
                    status: 'completed',
                    description: 'Backup completo del sistema',
                    checksum: 'a1b2c3d4e5f6...'
                },
                {
                    id: '2',
                    filename: 'backup_incremental_2025-07-09_01-00-00.sql',
                    size: 1024 * 1024 * 5, // 5MB
                    createdAt: new Date(Date.now() - 3600000).toISOString(),
                    type: 'incremental',
                    status: 'completed',
                    description: 'Backup incremental',
                    checksum: 'f6e5d4c3b2a1...'
                },
                {
                    id: '3',
                    filename: 'backup_full_2025-07-08_02-00-00.sql',
                    size: 1024 * 1024 * 48, // 48MB
                    createdAt: new Date(Date.now() - 86400000).toISOString(),
                    type: 'full',
                    status: 'completed',
                    description: 'Backup completo anterior',
                    checksum: '123456789abc...'
                }
            ];

            setBackups(mockBackups);
        } catch (err: any) {
            setError(err.message || 'Error al cargar backups');
        } finally {
            setLoading(false);
        }
    };

    const loadRestores = async () => {
        try {
            // Simulación de datos
            const mockRestores: RestoreInfo[] = [
                {
                    id: '1',
                    backupId: '2',
                    status: 'completed',
                    startedAt: new Date(Date.now() - 1800000).toISOString(),
                    completedAt: new Date(Date.now() - 1700000).toISOString(),
                    progress: 100
                }
            ];

            setRestores(mockRestores);
        } catch (err: any) {
            console.error('Error cargando restores:', err);
        }
    };

    const createBackup = async () => {
        setLoading(true);
        setBackupProgress(0);
        
        try {
            // Simular progreso de backup
            const interval = setInterval(() => {
                setBackupProgress(prev => {
                    if (prev >= 100) {
                        clearInterval(interval);
                        setShowCreateBackup(false);
                        loadBackups();
                        return 100;
                    }
                    return prev + 10;
                });
            }, 500);

            // En producción, esto sería una llamada al API
            await new Promise(resolve => setTimeout(resolve, 5000));
            
        } catch (err: any) {
            setError(err.message || 'Error al crear backup');
        } finally {
            setLoading(false);
        }
    };

    const restoreBackup = async (_backupId: string) => {
        setLoading(true);
        setRestoreProgress(0);
        
        try {
            // Simular progreso de restauración
            const interval = setInterval(() => {
                setRestoreProgress(prev => {
                    if (prev >= 100) {
                        clearInterval(interval);
                        setShowRestoreModal(false);
                        loadRestores();
                        return 100;
                    }
                    return prev + 5;
                });
            }, 300);

            // En producción, esto sería una llamada al API
            await new Promise(resolve => setTimeout(resolve, 10000));
            
        } catch (err: any) {
            setError(err.message || 'Error al restaurar backup');
        } finally {
            setLoading(false);
        }
    };

    const downloadBackup = async (backupId: string) => {
        try {
            // En producción, esto descargaría el archivo del servidor
            console.log(`Descargando backup ${backupId}`);
            // Simular descarga
            await new Promise(resolve => setTimeout(resolve, 2000));
        } catch (err: any) {
            setError(err.message || 'Error al descargar backup');
        }
    };

    const deleteBackup = async (backupId: string) => {
        if (window.confirm('¿Estás seguro de que quieres eliminar este backup?')) {
            try {
                // En producción, esto eliminaría el backup del servidor
                setBackups(prev => prev.filter(b => b.id !== backupId));
            } catch (err: any) {
                setError(err.message || 'Error al eliminar backup');
            }
        }
    };

    const formatBytes = (bytes: number) => {
        const sizes = ['B', 'KB', 'MB', 'GB'];
        if (bytes === 0) return '0 B';
        const i = Math.floor(Math.log(bytes) / Math.log(1024));
        return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleString('es-ES');
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'completed':
                return <Badge bg="success">Completado</Badge>;
            case 'failed':
                return <Badge bg="danger">Fallido</Badge>;
            case 'in_progress':
                return <Badge bg="warning">En Progreso</Badge>;
            default:
                return <Badge bg="secondary">{status}</Badge>;
        }
    };

    const getTypeBadge = (type: string) => {
        switch (type) {
            case 'full':
                return <Badge bg="primary">Completo</Badge>;
            case 'incremental':
                return <Badge bg="info">Incremental</Badge>;
            case 'differential':
                return <Badge bg="secondary">Diferencial</Badge>;
            default:
                return <Badge bg="secondary">{type}</Badge>;
        }
    };

    return (
        <div className="admin-backup-restore">
            <Row>
                <Col md={8}>
                    <Card>
                        <Card.Header className="d-flex justify-content-between align-items-center">
                            <h5 className="mb-0">
                                <i className="fas fa-database me-2"></i>
                                Backups del Sistema
                            </h5>
                            <Button
                                variant="primary"
                                size="sm"
                                onClick={() => setShowCreateBackup(true)}
                                disabled={loading}
                            >
                                <i className="fas fa-plus me-1"></i>
                                Crear Backup
                            </Button>
                        </Card.Header>
                        <Card.Body>
                            {error && (
                                <Alert variant="danger">
                                    <i className="fas fa-exclamation-triangle me-2"></i>
                                    {error}
                                </Alert>
                            )}

                            {loading ? (
                                <div className="text-center py-4">
                                    <Spinner animation="border" />
                                    <p className="mt-2">Cargando backups...</p>
                                </div>
                            ) : (
                                <Table responsive>
                                    <thead>
                                        <tr>
                                            <th>Archivo</th>
                                            <th>Tipo</th>
                                            <th>Tamaño</th>
                                            <th>Fecha</th>
                                            <th>Estado</th>
                                            <th>Acciones</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {backups.map((backup) => (
                                            <tr key={backup.id}>
                                                <td>
                                                    <div>
                                                        <strong>{backup.filename}</strong>
                                                        {backup.description && (
                                                            <>
                                                                <br />
                                                                <small className="text-muted">
                                                                    {backup.description}
                                                                </small>
                                                            </>
                                                        )}
                                                    </div>
                                                </td>
                                                <td>{getTypeBadge(backup.type)}</td>
                                                <td>{formatBytes(backup.size)}</td>
                                                <td>{formatDate(backup.createdAt)}</td>
                                                <td>{getStatusBadge(backup.status)}</td>
                                                <td>
                                                    <div className="btn-group" role="group">
                                                        <Button
                                                            variant="outline-primary"
                                                            size="sm"
                                                            onClick={() => downloadBackup(backup.id)}
                                                            title="Descargar"
                                                        >
                                                            <i className="fas fa-download"></i>
                                                        </Button>
                                                        <Button
                                                            variant="outline-warning"
                                                            size="sm"
                                                            onClick={() => {
                                                                setSelectedBackup(backup);
                                                                setShowRestoreModal(true);
                                                            }}
                                                            title="Restaurar"
                                                        >
                                                            <i className="fas fa-undo"></i>
                                                        </Button>
                                                        <Button
                                                            variant="outline-danger"
                                                            size="sm"
                                                            onClick={() => deleteBackup(backup.id)}
                                                            title="Eliminar"
                                                        >
                                                            <i className="fas fa-trash"></i>
                                                        </Button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </Table>
                            )}
                        </Card.Body>
                    </Card>
                </Col>

                <Col md={4}>
                    <Card>
                        <Card.Header>
                            <h6 className="mb-0">
                                <i className="fas fa-history me-2"></i>
                                Historial de Restauraciones
                            </h6>
                        </Card.Header>
                        <Card.Body>
                            {restores.length === 0 ? (
                                <p className="text-muted text-center">No hay restauraciones recientes</p>
                            ) : (
                                <div>
                                    {restores.map((restore) => (
                                        <div key={restore.id} className="mb-3 p-2 border rounded">
                                            <div className="d-flex justify-content-between">
                                                <small>Backup ID: {restore.backupId}</small>
                                                {getStatusBadge(restore.status)}
                                            </div>
                                            <small className="text-muted">
                                                {formatDate(restore.startedAt)}
                                            </small>
                                            {restore.progress < 100 && (
                                                <ProgressBar 
                                                    now={restore.progress} 
                                                    className="mt-1"
                                                />
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </Card.Body>
                    </Card>

                    <Card className="mt-3">
                        <Card.Header>
                            <h6 className="mb-0">
                                <i className="fas fa-info-circle me-2"></i>
                                Información de Backups
                            </h6>
                        </Card.Header>
                        <Card.Body>
                            <div className="mb-2">
                                <small><strong>Backups Totales:</strong> {backups.length}</small>
                            </div>
                            <div className="mb-2">
                                <small><strong>Espacio Total:</strong> {formatBytes(backups.reduce((sum, b) => sum + b.size, 0))}</small>
                            </div>
                            <div className="mb-2">
                                <small><strong>Último Backup:</strong> {backups.length > 0 ? formatDate(backups[0].createdAt) : 'N/A'}</small>
                            </div>
                            <div>
                                <small><strong>Estado:</strong> {backups.some(b => b.status === 'in_progress') ? 'Backup en progreso' : 'Sistema estable'}</small>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            {/* Modal Crear Backup */}
            <Modal show={showCreateBackup} onHide={() => setShowCreateBackup(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>
                        <i className="fas fa-plus me-2"></i>
                        Crear Nuevo Backup
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <Form.Group className="mb-3">
                            <Form.Label>Tipo de Backup</Form.Label>
                            <Form.Select
                                value={backupType}
                                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setBackupType(e.target.value as any)}
                            >
                                <option value="full">Completo</option>
                                <option value="incremental">Incremental</option>
                                <option value="differential">Diferencial</option>
                            </Form.Select>
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Descripción (opcional)</Form.Label>
                            <Form.Control
                                as="textarea"
                                rows={3}
                                value={backupDescription}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setBackupDescription(e.target.value)}
                                placeholder="Descripción del backup..."
                            />
                        </Form.Group>
                        {backupProgress > 0 && (
                            <div className="mb-3">
                                <div className="d-flex justify-content-between mb-1">
                                    <small>Progreso</small>
                                    <small>{backupProgress}%</small>
                                </div>
                                <ProgressBar now={backupProgress} />
                            </div>
                        )}
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowCreateBackup(false)}>
                        Cancelar
                    </Button>
                    <Button 
                        variant="primary" 
                        onClick={createBackup}
                        disabled={loading}
                    >
                        {loading ? (
                            <>
                                <Spinner animation="border" size="sm" className="me-2" />
                                Creando...
                            </>
                        ) : (
                            'Crear Backup'
                        )}
                    </Button>
                </Modal.Footer>
            </Modal>

            {/* Modal Restaurar Backup */}
            <Modal show={showRestoreModal} onHide={() => setShowRestoreModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>
                        <i className="fas fa-undo me-2"></i>
                        Restaurar Backup
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {selectedBackup && (
                        <div>
                            <Alert variant="warning">
                                <i className="fas fa-exclamation-triangle me-2"></i>
                                <strong>¡Advertencia!</strong> Esta acción restaurará la base de datos al estado del backup seleccionado. 
                                Todos los datos posteriores al backup se perderán.
                            </Alert>
                            <div className="mb-3">
                                <strong>Backup a restaurar:</strong>
                                <br />
                                <small>{selectedBackup.filename}</small>
                                <br />
                                <small className="text-muted">
                                    Creado: {formatDate(selectedBackup.createdAt)}
                                </small>
                            </div>
                            {restoreProgress > 0 && (
                                <div className="mb-3">
                                    <div className="d-flex justify-content-between mb-1">
                                        <small>Progreso de Restauración</small>
                                        <small>{restoreProgress}%</small>
                                    </div>
                                    <ProgressBar now={restoreProgress} />
                                </div>
                            )}
                        </div>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowRestoreModal(false)}>
                        Cancelar
                    </Button>
                    <Button 
                        variant="warning" 
                        onClick={() => selectedBackup && restoreBackup(selectedBackup.id)}
                        disabled={loading}
                    >
                        {loading ? (
                            <>
                                <Spinner animation="border" size="sm" className="me-2" />
                                Restaurando...
                            </>
                        ) : (
                            'Confirmar Restauración'
                        )}
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
};

export default AdminBackupRestore; 