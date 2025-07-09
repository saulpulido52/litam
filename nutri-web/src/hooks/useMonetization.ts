import { useState, useEffect } from 'react';
import axios from 'axios';

interface MonetizationFeatures {
  canUseAI: boolean;
  canHaveUnlimitedPatients: boolean;
  canUseAIFoodScanning: boolean;
  canUseBarcodeScanning: boolean;
  shouldShowAds: boolean;
  canUseSmartShoppingList: boolean;
  canUseAdvancedTracking: boolean;
  canUseDeviceIntegration: boolean;
}

export const useMonetization = (userId?: string) => {
  const [features, setFeatures] = useState<MonetizationFeatures>({
    canUseAI: true, // TEMPORALMENTE ACTIVADO PARA DESARROLLO
    canHaveUnlimitedPatients: true, // TEMPORALMENTE ACTIVADO PARA DESARROLLO
    canUseAIFoodScanning: true, // TEMPORALMENTE ACTIVADO PARA DESARROLLO
    canUseBarcodeScanning: true, // TEMPORALMENTE ACTIVADO PARA DESARROLLO
    shouldShowAds: false, // TEMPORALMENTE DESACTIVADO PARA DESARROLLO
    canUseSmartShoppingList: true, // TEMPORALMENTE ACTIVADO PARA DESARROLLO
    canUseAdvancedTracking: true, // TEMPORALMENTE ACTIVADO PARA DESARROLLO
    canUseDeviceIntegration: true, // TEMPORALMENTE ACTIVADO PARA DESARROLLO
  });
  const [loading, setLoading] = useState(false); // Cambiado a false para desarrollo

  useEffect(() => {
    // TODO: Activar validaciones cuando el modelo de negocio esté listo
    // Por ahora, todas las funcionalidades están habilitadas para desarrollo
    console.log('🔧 Monetización desactivada temporalmente para desarrollo');
  }, [userId]);

  return { features, loading };
}; 