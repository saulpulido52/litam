import React, { useState, useEffect } from 'react';
import { Card, Button, Alert, Badge, Form, Spinner } from 'react-bootstrap';
import { Calendar, RefreshCw, Settings, AlertCircle } from 'lucide-react';

interface GoogleCalendarConfigProps {
    onConfigChange?: (config: any) => void;
    className?: string;
}

interface CalendarInfo {
    id: string;
    summary: string;
    primary: boolean;
}

interface SyncStatus {
    isConnected: boolean;
    isTokenExpired: boolean;
    googleEmail: string | null;
    calendarSyncEnabled: boolean;
    lastSync: string | null;
    authProvider: string;
}

const GoogleCalendarConfig: React.FC<GoogleCalendarConfigProps> = ({ 
    className = '' 
}) => {
    const [syncStatus, setSyncStatus] = useState<SyncStatus | null>(null);
    const [calendars, setCalendars] = useState<CalendarInfo[]>([]);
    const [selectedCalendar, setSelectedCalendar] = useState<string>('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    useEffect(() => {
        loadSyncStatus();
        loadCalendars();
    }, []);

    const loadSyncStatus = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) return;

            const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';
    const response = await fetch(`${apiUrl}/auth/google/status`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`}});

            if (response.ok) {
                const data = await response.json();
                setSyncStatus(data.data);
            }
        } catch (error) {
            console.error('Error loading sync status:', error);
        }
    };

    const loadCalendars = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) return;

            const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';
    const response = await fetch(`${apiUrl}/calendar/google/calendars`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`}});

            if (response.ok) {
                const data = await response.json();
                setCalendars(data.data.calendars);
            }
        } catch (error) {
            console.error('Error loading calendars:', error);
        }
    };

    const handleSetPrimaryCalendar = async () => {
        if (!selectedCalendar) {
            setError('Por favor selecciona un calendario');
            return;
        }

        setIsLoading(true);
        setError(null);
        setSuccess(null);

        try {
            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error('No hay token de autenticación');
            }

            const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';
    const response = await fetch(`${apiUrl}/calendar/google/primary-calendar`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`},
                body: JSON.stringify({ calendarId: selectedCalendar })});

            if (!response.ok) {
                throw new Error('Error al configurar calendario principal');
            }

            setSuccess('Calendario principal configurado exitosamente');
            loadSyncStatus();
        } catch (error) {
            console.error('Error setting primary calendar:', error);
            setError(error instanceof Error ? error.message : 'Error desconocido');
        } finally {
            setIsLoading(false);
        }
    };

    const handleToggleSync = async (enabled: boolean) => {
        setIsLoading(true);
        setError(null);
        setSuccess(null);

        try {
            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error('No hay token de autenticación');
            }

            const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';
    const response = await fetch(`${apiUrl}/calendar/google/toggle-sync`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`},
                body: JSON.stringify({ enabled })});

            if (!response.ok) {
                throw new Error('Error al cambiar estado de sincronización');
            }

            setSuccess(`Sincronización ${enabled ? 'habilitada' : 'deshabilitada'} exitosamente`);
            loadSyncStatus();
        } catch (error) {
            console.error('Error toggling sync:', error);
            setError(error instanceof Error ? error.message : 'Error desconocido');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSyncToGoogle = async () => {
        setIsLoading(true);
        setError(null);
        setSuccess(null);

        try {
            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error('No hay token de autenticación');
            }

            const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';
    const response = await fetch(`${apiUrl}/calendar/google/sync-to-calendar`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`}});

            if (!response.ok) {
                throw new Error('Error al sincronizar citas con Google Calendar');
            }

            const data = await response.json();
            setSuccess(`Sincronización completada: ${data.data.created} creados, ${data.data.updated} actualizados`);
            loadSyncStatus();
        } catch (error) {
            console.error('Error syncing to Google Calendar:', error);
            setError(error instanceof Error ? error.message : 'Error desconocido');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSyncFromGoogle = async () => {
        setIsLoading(true);
        setError(null);
        setSuccess(null);

        try {
            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error('No hay token de autenticación');
            }

            const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';
    const response = await fetch(`${apiUrl}/calendar/google/sync-from-calendar`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`}});

            if (!response.ok) {
                throw new Error('Error al sincronizar desde Google Calendar');
            }

            const data = await response.json();
            setSuccess(`Sincronización completada: ${data.data.imported} importados, ${data.data.updated} actualizados`);
            loadSyncStatus();
        } catch (error) {
            console.error('Error syncing from Google Calendar:', error);
            setError(error instanceof Error ? error.message : 'Error desconocido');
        } finally {
            setIsLoading(false);
        }
    };

    if (!syncStatus) {
        return (
            <Card className={`google-calendar-config ${className}`}>
                <Card.Body className="text-center">
                    <Spinner animation="border" />
                    <p className="mt-2">Cargando configuración...</p>
                </Card.Body>
            </Card>
        );
    }

    return (
        <Card className={`google-calendar-config ${className}`}>
            <Card.Header>
                <div className="d-flex align-items-center">
                    <Calendar size={20} className="me-2" />
                    <h6 className="mb-0">Configuración de Google Calendar</h6>
                </div>
            </Card.Header>
            <Card.Body>
                {error && (
                    <Alert variant="danger" dismissible onClose={() => setError(null)}>
                        {error}
                    </Alert>
                )}

                {success && (
                    <Alert variant="success" dismissible onClose={() => setSuccess(null)}>
                        {success}
                    </Alert>
                )}

                {/* Estado de conexión */}
                <div className="mb-4">
                    <h6>Estado de Conexión</h6>
                    <div className="d-flex align-items-center mb-2">
                        <Badge 
                            bg={syncStatus.isConnected ? 'success' : 'secondary'}
                            className="me-2"
                        >
                            {syncStatus.isConnected ? 'Conectado' : 'Desconectado'}
                        </Badge>
                        {syncStatus.isTokenExpired && (
                            <Badge bg="warning" className="me-2">
                                Token Expirado
                            </Badge>
                        )}
                    </div>
                    {syncStatus.googleEmail && (
                        <small className="text-muted">
                            Email: {syncStatus.googleEmail}
                        </small>
                    )}
                </div>

                {syncStatus.isConnected && (
                    <>
                        {/* Configuración de calendario */}
                        <div className="mb-4">
                            <h6>Calendario Principal</h6>
                            <Form.Select
                                value={selectedCalendar}
                                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setSelectedCalendar(e.target.value)}
                                className="mb-2"
                            >
                                <option value="">Seleccionar calendario...</option>
                                {calendars.map((calendar) => (
                                    <option key={calendar.id} value={calendar.id}>
                                        {calendar.summary} {calendar.primary && '(Principal)'}
                                    </option>
                                ))}
                            </Form.Select>
                            <Button
                                variant="outline-primary"
                                onClick={handleSetPrimaryCalendar}
                                disabled={!selectedCalendar || isLoading}
                                size="sm"
                            >
                                {isLoading ? (
                                    <>
                                        <Spinner animation="border" size="sm" className="me-1" />
                                        Configurando...
                                    </>
                                ) : (
                                    <>
                                        <Settings size={14} className="me-1" />
                                        Configurar como Principal
                                    </>
                                )}
                            </Button>
                        </div>

                        {/* Sincronización */}
                        <div className="mb-4">
                            <h6>Sincronización Automática</h6>
                            <div className="d-flex align-items-center mb-2">
                                <Form.Check
                                    type="switch"
                                    id="sync-switch"
                                    checked={syncStatus.calendarSyncEnabled}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleToggleSync(e.target.checked)}
                                    disabled={isLoading}
                                />
                                <label htmlFor="sync-switch" className="ms-2">
                                    Habilitar sincronización automática
                                </label>
                            </div>
                            {syncStatus.lastSync && (
                                <small className="text-muted">
                                    Última sincronización: {new Date(syncStatus.lastSync).toLocaleString()}
                                </small>
                            )}
                        </div>

                        {/* Sincronización manual */}
                        <div className="mb-3">
                            <h6>Sincronización Manual</h6>
                            <div className="d-flex gap-2">
                                <Button
                                    variant="outline-success"
                                    onClick={handleSyncToGoogle}
                                    disabled={isLoading}
                                    size="sm"
                                >
                                    {isLoading ? (
                                        <>
                                            <Spinner animation="border" size="sm" className="me-1" />
                                            Sincronizando...
                                        </>
                                    ) : (
                                        <>
                                            <RefreshCw size={14} className="me-1" />
                                            Sincronizar a Google
                                        </>
                                    )}
                                </Button>
                                <Button
                                    variant="outline-info"
                                    onClick={handleSyncFromGoogle}
                                    disabled={isLoading}
                                    size="sm"
                                >
                                    {isLoading ? (
                                        <>
                                            <Spinner animation="border" size="sm" className="me-1" />
                                            Sincronizando...
                                        </>
                                    ) : (
                                        <>
                                            <RefreshCw size={14} className="me-1" />
                                            Sincronizar desde Google
                                        </>
                                    )}
                                </Button>
                            </div>
                        </div>
                    </>
                )}

                {!syncStatus.isConnected && (
                    <div className="text-center">
                        <AlertCircle size={48} className="text-muted mb-3" />
                        <p className="text-muted">
                            No tienes una cuenta de Google conectada.
                            <br />
                            Conecta tu cuenta para habilitar la sincronización de calendario.
                        </p>
                    </div>
                )}
            </Card.Body>
        </Card>
    );
};

export default GoogleCalendarConfig; 