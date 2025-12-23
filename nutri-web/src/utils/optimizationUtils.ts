/**
 * Utilidades básicas para optimizar el rendimiento de la aplicación
 */

import { useCallback, useRef, useState, useEffect } from 'react';

// **OPTIMIZACIÓN**: Función debounce para optimizar búsquedas
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout>;
  
  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// **OPTIMIZACIÓN**: Hook para debounce de valores
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

// **OPTIMIZACIÓN**: Hook para memoización de cálculos pesados
export function useMemoizedCalculation<T>(
  calculation: () => T,
  dependencies: any[]
): T {
  const [result, setResult] = useState<T>(() => calculation());
  const prevDeps = useRef(dependencies);

  useEffect(() => {
    const hasChanged = dependencies.some(
      (dep, index) => dep !== prevDeps.current[index]
    );

    if (hasChanged) {
      setResult(calculation());
      prevDeps.current = dependencies;
    }
  }, dependencies);

  return result;
}

// **OPTIMIZACIÓN**: Hook para optimizar re-renders de componentes
export function useStableCallback<T extends (...args: any[]) => any>(
  callback: T
): T {
  const callbackRef = useRef<T>(callback);
  callbackRef.current = callback;

  return useCallback(
    ((...args: Parameters<T>) => callbackRef.current(...args)) as T,
    []
  );
}

// **OPTIMIZACIÓN**: Gestión eficiente del estado de carga
export function useLoadingState() {
  const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>({});

  const setLoading = useCallback((key: string, isLoading: boolean) => {
    setLoadingStates(prev => ({
      ...prev,
      [key]: isLoading
    }));
  }, []);

  const isLoading = useCallback((key: string) => {
    return loadingStates[key] || false;
  }, [loadingStates]);

  const isAnyLoading = useCallback(() => {
    return Object.values(loadingStates).some(Boolean);
  }, [loadingStates]);

  return { setLoading, isLoading, isAnyLoading };
} 