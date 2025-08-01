/**
 * 🚀 OPTIMIZACIONES DE IMPORTACIONES PARA VERCEL
 * 
 * Este archivo centraliza las importaciones más pesadas y las optimiza
 * para reducir el bundle size y mejorar el performance en Vercel.
 */

import React from 'react';

// **LAZY LOADING DE ICONOS PESADOS**
// En lugar de importar todas las iconos de lucide-react de una vez,
// solo importar las que realmente se necesitan

export const lazyImportIcon = (iconName: string) => {
  return import('lucide-react').then(module => module[iconName as keyof typeof module]);
};

// **BOOTSTRAP COMPONENTS OPTIMIZADOS**
// Importar solo los componentes necesarios en cada página
export { 
  Container, 
  Row, 
  Col, 
  Card, 
  Button,
  Modal,
  Table,
  Nav,
  Tabs,
  Tab
} from 'react-bootstrap';

// **RECHARTS OPTIMIZADO - Solo importar cuando sea necesario**
export const lazyImportChart = async (chartType: 'line' | 'bar' | 'pie' | 'area') => {
  switch (chartType) {
    case 'line':
      return import('recharts').then(module => ({
        LineChart: module.LineChart,
        Line: module.Line,
        XAxis: module.XAxis,
        YAxis: module.YAxis,
        CartesianGrid: module.CartesianGrid,
        Tooltip: module.Tooltip,
        Legend: module.Legend,
        ResponsiveContainer: module.ResponsiveContainer
      }));
    case 'bar':
      return import('recharts').then(module => ({
        BarChart: module.BarChart,
        Bar: module.Bar,
        XAxis: module.XAxis,
        YAxis: module.YAxis,
        CartesianGrid: module.CartesianGrid,
        Tooltip: module.Tooltip,
        Legend: module.Legend,
        ResponsiveContainer: module.ResponsiveContainer
      }));
    case 'pie':
      return import('recharts').then(module => ({
        PieChart: module.PieChart,
        Pie: module.Pie,
        Cell: module.Cell,
        Tooltip: module.Tooltip,
        Legend: module.Legend,
        ResponsiveContainer: module.ResponsiveContainer
      }));
    case 'area':
      return import('recharts').then(module => ({
        AreaChart: module.AreaChart,
        Area: module.Area,
        XAxis: module.XAxis,
        YAxis: module.YAxis,
        CartesianGrid: module.CartesianGrid,
        Tooltip: module.Tooltip,
        Legend: module.Legend,
        ResponsiveContainer: module.ResponsiveContainer
      }));
    default:
      throw new Error(`Chart type ${chartType} not supported`);
  }
};

// **REACT ICONS OPTIMIZADOS**
// Crear lazy loaders para react-icons más pesados
export const lazyImportReactIcon = async (iconSet: 'fa' | 'md', iconName: string) => {
  switch (iconSet) {
    case 'fa':
      return import('react-icons/fa').then(module => module[iconName as keyof typeof module]);
    case 'md':
      return import('react-icons/md').then(module => module[iconName as keyof typeof module]);
    default:
      throw new Error(`Icon set ${iconSet} not supported`);
  }
};

// **SERVICIOS OPTIMIZADOS**
// Lazy loading para servicios pesados
export const lazyImportService = async (serviceName: string) => {
  switch (serviceName) {
    case 'profileService':
      return import('../services/profileService').then(module => module.default);
    case 'patientService':
      return import('../services/patientsService').then(module => module.default);
    case 'dietPlanService':
      return import('../services/dietPlanService').then(module => module.default);
    // appointmentService no está disponible
    case 'messagingService':
      return import('../services/messagingService').then(module => module.default);
    default:
      throw new Error(`Service ${serviceName} not found`);
  }
};

// **UTILIDADES DE PERFORMANCE**
export const preloadCriticalServices = () => {
  // Precargar servicios críticos en background
  if (typeof window !== 'undefined') {
    // Solo en el cliente
    setTimeout(() => {
      import('../services/api');
      import('../services/authService');
    }, 1000);
  }
};

// **OPTIMIZACIÓN DE BUNDLE SPLITTING**
export const componentLazyImport = <T extends React.ComponentType<any>>(
  importFunc: () => Promise<{ default: T }>
) => {
  return React.lazy(importFunc);
};

// **PRELOAD DE RECURSOS CRÍTICOS**
export const preloadCriticalResources = () => {
  if (typeof document !== 'undefined') {
    // Preload critical CSS
    const linkElement = document.createElement('link');
    linkElement.rel = 'preload';
    linkElement.href = '/critical.css';
    linkElement.as = 'style';
    document.head.appendChild(linkElement);
    
    // Prefetch non-critical resources
    setTimeout(() => {
      const prefetchLink = document.createElement('link');
      prefetchLink.rel = 'prefetch';
      prefetchLink.href = '/non-critical.css';
      document.head.appendChild(prefetchLink);
    }, 2000);
  }
};

// **CACHE DE IMPORTACIONES DINÁMICAS**
const importCache = new Map<string, Promise<any>>();

export const cachedImport = <T>(key: string, importFunc: () => Promise<T>): Promise<T> => {
  if (importCache.has(key)) {
    return importCache.get(key)!;
  }
  
  const importPromise = importFunc();
  importCache.set(key, importPromise);
  
  // Limpiar cache después de un tiempo para evitar memory leaks
  setTimeout(() => {
    importCache.delete(key);
  }, 5 * 60 * 1000); // 5 minutos
  
  return importPromise;
};

export default {
  lazyImportIcon,
  lazyImportChart,
  lazyImportReactIcon,
  lazyImportService,
  preloadCriticalServices,
  preloadCriticalResources,
  cachedImport
};