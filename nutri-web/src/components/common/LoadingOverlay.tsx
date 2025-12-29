import React from 'react';

interface LoadingOverlayProps {
    isVisible: boolean;
    message?: string;
}

const LoadingOverlay: React.FC<LoadingOverlayProps> = ({ isVisible, message = 'Cargando...' }) => {
    if (!isVisible) return null;

    return (
        <div
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100vw',
                height: '100vh',
                backgroundColor: 'rgba(255, 255, 255, 0.7)',
                backdropFilter: 'blur(5px)',
                zIndex: 9999,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.3s ease-in-out'
            }}
        >
            <div
                className="bg-white p-5 rounded-4 shadow-lg text-center"
                style={{
                    minWidth: '300px',
                    boxShadow: '0 10px 40px rgba(0,0,0,0.1)'
                }}
            >
                <div className="mb-4">
                    <div className="spinner-border text-primary" role="status" style={{ width: '3rem', height: '3rem' }}>
                        <span className="visually-hidden">Loading...</span>
                    </div>
                </div>
                <h5 className="fw-bold text-dark mb-2">{message}</h5>
                <p className="text-muted small mb-0">Por favor espere un momento...</p>
            </div>
        </div>
    );
};

export default LoadingOverlay;
