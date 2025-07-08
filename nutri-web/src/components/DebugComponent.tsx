import React, { useState, useEffect } from 'react';
import { useAppointments } from '../hooks/useAppointments';
import { useAuth } from '../hooks/useAuth';

const DebugComponent: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const { appointments, loading, error, loadAppointments } = useAppointments();
  const [debugInfo, setDebugInfo] = useState<any>({});

  useEffect(() => {
    setDebugInfo({
      timestamp: new Date().toISOString(),
      userAuthenticated: isAuthenticated,
      userId: user?.id,
      userEmail: user?.email,
      appointmentsCount: appointments.length,
      appointments: appointments,
      loading: loading,
      error: error,
      localStorage: {
        accessToken: localStorage.getItem('access_token') ? 'Present' : 'Not found',
        user: localStorage.getItem('user') ? 'Present' : 'Not found'
      }
    });
  }, [user, isAuthenticated, appointments, loading, error]);

  const handleForceLoad = () => {
    console.log('🔄 Force loading appointments...');
    loadAppointments();
  };

  return (
    <div style={{ 
      position: 'fixed', 
      top: '10px', 
      right: '10px', 
      background: 'rgba(0,0,0,0.8)', 
      color: 'white', 
      padding: '15px', 
      borderRadius: '8px', 
      zIndex: 9999,
      maxWidth: '400px',
      fontSize: '12px',
      maxHeight: '80vh',
      overflow: 'auto'
    }}>
      <h5>🔍 Debug Info</h5>
      <button onClick={handleForceLoad} style={{ marginBottom: '10px' }}>
        🔄 Force Load Appointments
      </button>
      <pre>{JSON.stringify(debugInfo, null, 2)}</pre>
    </div>
  );
};

export default DebugComponent;
