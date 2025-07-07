import React, { useState, useEffect } from 'react';
import { Button, Alert, Spinner } from 'react-bootstrap';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';

interface GoogleAuthProps {
    onSuccess?: (user: any) => void;
    onError?: (error: string) => void;
    variant?: 'login' | 'connect';
    className?: string;
}

const GoogleAuth: React.FC<GoogleAuthProps> = ({ 
    onSuccess, 
    onError, 
    variant = 'login',
    className = '' 
}) => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { login } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        // Manejar callback de Google OAuth
        const urlParams = new URLSearchParams(window.location.search);
        const token = urlParams.get('token');
        const userParam = urlParams.get('user');
        const errorParam = urlParams.get('error');

        if (token && userParam) {
            try {
                const user = JSON.parse(decodeURIComponent(userParam));
                
                // Guardar token y usuario en localStorage
                localStorage.setItem('token', token);
                localStorage.setItem('user', JSON.stringify(user));
                
                // Limpiar URL
                window.history.replaceState({}, document.title, window.location.pathname);
                
                if (onSuccess) {
                    onSuccess(user);
                } else {
                    // Redirigir al dashboard
                    navigate('/dashboard');
                }
            } catch (error) {
                console.error('Error parsing user data:', error);
                setError('Error al procesar la autenticación con Google');
            }
        } else if (errorParam) {
            setError(decodeURIComponent(errorParam));
        }
    }, [navigate, onSuccess]);

    const handleGoogleLogin = async () => {
        setIsLoading(true);
        setError(null);

        try {
            // Obtener URL de autorización de Google
            const response = await fetch('http://localhost:4000/api/auth/google/init', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error('Error al iniciar autenticación con Google');
            }

            const data = await response.json();
            
            // Redirigir a Google OAuth
            window.location.href = data.data.authUrl;
        } catch (error) {
            console.error('Error initiating Google auth:', error);
            const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
            setError(errorMessage);
            if (onError) {
                onError(errorMessage);
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleDisconnectGoogle = async () => {
        setIsLoading(true);
        setError(null);

        try {
            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error('No hay token de autenticación');
            }

            const response = await fetch('http://localhost:4000/api/auth/google/disconnect', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                throw new Error('Error al desconectar cuenta de Google');
            }

            // Limpiar datos de Google del localStorage
            const user = JSON.parse(localStorage.getItem('user') || '{}');
            delete user.google_id;
            delete user.google_email;
            localStorage.setItem('user', JSON.stringify(user));

            if (onSuccess) {
                onSuccess(user);
            }
        } catch (error) {
            console.error('Error disconnecting Google:', error);
            const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
            setError(errorMessage);
            if (onError) {
                onError(errorMessage);
            }
        } finally {
            setIsLoading(false);
        }
    };

    const getGoogleConnectionStatus = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                return null;
            }

            const response = await fetch('http://localhost:4000/api/auth/google/status', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                throw new Error('Error al obtener estado de conexión con Google');
            }

            const data = await response.json();
            return data.data;
        } catch (error) {
            console.error('Error getting Google connection status:', error);
            return null;
        }
    };

    useEffect(() => {
        if (variant === 'connect') {
            getGoogleConnectionStatus().then(status => {
                if (status?.isConnected) {
                    // Usuario ya está conectado con Google
                    setError('Ya tienes una cuenta de Google conectada');
                }
            });
        }
    }, [variant]);

    return (
        <div className={`google-auth ${className}`}>
            {error && (
                <Alert variant="danger" dismissible onClose={() => setError(null)}>
                    {error}
                </Alert>
            )}

            {variant === 'login' ? (
                <Button
                    variant="outline-primary"
                    onClick={handleGoogleLogin}
                    disabled={isLoading}
                    className="w-100"
                >
                    {isLoading ? (
                        <>
                            <Spinner animation="border" size="sm" className="me-2" />
                            Conectando con Google...
                        </>
                    ) : (
                        <>
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="16"
                                height="16"
                                viewBox="0 0 24 24"
                                className="me-2"
                                fill="currentColor"
                            >
                                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                            </svg>
                            Continuar con Google
                        </>
                    )}
                </Button>
            ) : (
                <Button
                    variant="outline-danger"
                    onClick={handleDisconnectGoogle}
                    disabled={isLoading}
                    className="w-100"
                >
                    {isLoading ? (
                        <>
                            <Spinner animation="border" size="sm" className="me-2" />
                            Desconectando...
                        </>
                    ) : (
                        <>
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="16"
                                height="16"
                                viewBox="0 0 24 24"
                                className="me-2"
                                fill="currentColor"
                            >
                                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                            </svg>
                            Desconectar Google
                        </>
                    )}
                </Button>
            )}
        </div>
    );
};

export default GoogleAuth; 