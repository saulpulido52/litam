/**
 * Utility functions to clear stale data and cache
 */

export const clearStaleData = () => {
  console.log('🧹 Clearing stale data and cache...');
  
  // Clear localStorage
  const keysToRemove = [
    'patients_cache',
    'patients_last_fetch',
    'auth_token',
    'user_data',
    'current_patient',
    'last_visited_patient',
    'navigation_history',
    'react-query-cache',
    'vite-cache'
  ];
  
  keysToRemove.forEach(key => {
    if (localStorage.getItem(key)) {
      console.log(`🗑️ Removing localStorage key: ${key}`);
      localStorage.removeItem(key);
    }
  });
  
  // Clear sessionStorage
  const sessionKeysToRemove = [
    'current_patient_id',
    'last_patient_id',
    'navigation_state',
    'form_data',
    'react-router-location'
  ];
  
  sessionKeysToRemove.forEach(key => {
    if (sessionStorage.getItem(key)) {
      console.log(`🗑️ Removing sessionStorage key: ${key}`);
      sessionStorage.removeItem(key);
    }
  });

  // Clear any cached API responses
  if ('caches' in window) {
    caches.keys().then(cacheNames => {
      cacheNames.forEach(cacheName => {
        if (cacheName.includes('api') || cacheName.includes('patients')) {
          console.log(`🗑️ Deleting cache: ${cacheName}`);
          caches.delete(cacheName);
        }
      });
    });
  }

  console.log('✅ Cache cleared successfully');
};

export const validateCurrentUrl = (): boolean => {
  const currentUrl = window.location.href;
  console.log('🔍 Validating current URL:', currentUrl);
  
  // Verificar si la URL contiene un patient ID inválido
  const invalidPatientIds = [
    '73a9ef86-60fc-4b3a-b8a0-8b87998b86a8',
    // Agregar otros IDs inválidos aquí si es necesario
  ];
  
  const hasInvalidPatientId = invalidPatientIds.some(id => 
    currentUrl.includes(id)
  );
  
  if (hasInvalidPatientId) {
    console.log('⚠️ URL contains invalid patient ID, redirecting to patients page');
    return false;
  }
  
  return true;
};

export const forceRedirectToPatients = () => {
  console.log('🔄 Forcing redirect to patients page...');
  
  // Limpiar datos obsoletos
  clearStaleData();
  
  // Redirigir a la página de pacientes
  window.location.href = '/patients';
};

export const clearBrowserHistory = () => {
  console.log('🧹 Clearing browser history...');
  
  // Limpiar el historial del navegador
  if (window.history && window.history.replaceState) {
    // Reemplazar la entrada actual con una URL limpia
    window.history.replaceState(null, '', '/patients');
    
    // Limpiar entradas adicionales del historial
    try {
      window.history.pushState(null, '', '/patients');
      window.history.replaceState(null, '', '/patients');
    } catch (error) {
      console.log('⚠️ Could not clear browser history:', error);
    }
  }
};

export const clearAndReload = () => {
  console.log('🔄 Clearing cache and reloading page...');
  
  // Clear all caches
  clearStaleData();
  
  // Force page reload
  window.location.reload();
};

export const validatePatientId = (patientId: string): boolean => {
  // Check if it's a valid UUID format
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  
  if (!uuidRegex.test(patientId)) {
    console.error('❌ Invalid patient ID format:', patientId);
    return false;
  }
  
  // Check against known invalid IDs
  const invalidPatientIds = [
    '73a9ef86-60fc-4b3a-b8a0-8b87998b86a8',
    // Add other known invalid IDs here
  ];
  
  if (invalidPatientIds.includes(patientId)) {
    console.error('❌ Known invalid patient ID:', patientId);
    return false;
  }
  
  return true;
}; 