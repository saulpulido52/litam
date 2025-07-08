import React, { useState, useEffect } from 'react';
import { useAppointments } from '../hooks/useAppointments';
import { useAuth } from '../hooks/useAuth';

const DebugAppointments: React.FC = () => {
  const { appointments, loading, error, loadAppointments } = useAppointments();
  const { user, isAuthenticated } = useAuth();
  const [debugInfo, setDebugInfo] = useState<any>({});

  useEffect(() => {
    const gatherDebugInfo = async () => {
      const info = {
        user: user ? {
          id: user.id,
          email: user.email,
          role: user.role?.name
        } : null,
        isAuthenticated,
        token: localStorage.getItem('access_token') ? 'Presente' : 'Ausente',
        appointmentsCount: appointments.length,
        loading,
        error,
        backendUrl: import.meta.env.VITE_API_URL || 'http://localhost:4000/api'
      };
      
      setDebugInfo(info);
    };

    gatherDebugInfo();
  }, [user, isAuthenticated, appointments, loading, error]);

  const testAppointments = async () => {
    try {
      console.log('🧪 Testing appointments connection...');
      await loadAppointments();
      console.log('✅ Appointments loaded successfully');
    } catch (error) {
      console.error('❌ Error testing appointments:', error);
    }
  };

  const handleLogin = async () => {
    try {
      const response = await fetch('http://localhost:4000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: 'nutri.admin@sistema.com',
          password: 'nutri123'
        })
      });

      const data = await response.json();
      if (data.status === 'success') {
        localStorage.setItem('access_token', data.data.token);
        localStorage.setItem('user', JSON.stringify(data.data.user));
        window.location.reload();
      }
    } catch (error) {
      console.error('Error logging in:', error);
    }
  };

  return (
    <div className="card">
      <div className="card-header">
        <h5>🔍 Debug Appointments</h5>
      </div>
      <div className="card-body">
        <div className="row">
          <div className="col-md-6">
            <h6>Estado de Autenticación</h6>
            <ul className="list-unstyled">
              <li>Usuario: {debugInfo.user ? `${debugInfo.user.email} (${debugInfo.user.role})` : 'No autenticado'}</li>
              <li>Autenticado: {debugInfo.isAuthenticated ? '✅ Sí' : '❌ No'}</li>
              <li>Token: {debugInfo.token}</li>
            </ul>
          </div>
          <div className="col-md-6">
            <h6>Estado de Citas</h6>
            <ul className="list-unstyled">
              <li>Citas cargadas: {debugInfo.appointmentsCount}</li>
              <li>Cargando: {loading ? '✅ Sí' : '❌ No'}</li>
              <li>Error: {error || 'Ninguno'}</li>
              <li>Backend URL: {debugInfo.backendUrl}</li>
            </ul>
          </div>
        </div>
        
        <div className="mt-3">
          <button 
            className="btn btn-primary me-2"
            onClick={testAppointments}
            disabled={loading}
          >
            🧪 Probar Conexión
          </button>
          <button 
            className="btn btn-secondary"
            onClick={handleLogin}
          >
            🔑 Login de Prueba
          </button>
        </div>

        {appointments.length > 0 && (
          <div className="mt-3">
            <h6>Primeras 3 citas:</h6>
            <ul className="list-unstyled">
              {appointments.slice(0, 3).map((apt, index) => (
                <li key={apt.id}>
                  {index + 1}. {apt.patient?.first_name} {apt.patient?.last_name} - {new Date(apt.start_time).toLocaleDateString()}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default DebugAppointments;
