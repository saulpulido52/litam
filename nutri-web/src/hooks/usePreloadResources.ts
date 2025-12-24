/**
 * 🚀 Hook para precargar recursos críticos y mejorar LCP
 * 
 * Este hook optimiza el rendimiento precargando recursos que
 * se necesitarán inmediatamente después del renderizado inicial.
 */

import { useEffect } from 'react';

interface PreloadOptions {
  fonts?: string[];
  images?: string[];
  scripts?: string[];
  styles?: string[];
}

export const usePreloadResources = (options: PreloadOptions = {}) => {
  useEffect(() => {
    const { fonts = [], images = [], scripts = [], styles = [] } = options;

    // 🎨 Precargar fuentes críticas
    fonts.forEach(fontUrl => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'font';
      link.type = 'font/woff2';
      link.href = fontUrl;
      link.crossOrigin = 'anonymous';
      document.head.appendChild(link);
    });

    // 🖼️ Precargar imágenes críticas
    images.forEach(imageUrl => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'image';
      link.href = imageUrl;
      document.head.appendChild(link);
    });

    // 📜 Precargar scripts críticos
    scripts.forEach(scriptUrl => {
      const link = document.createElement('link');
      link.rel = 'modulepreload';
      link.href = scriptUrl;
      document.head.appendChild(link);
    });

    // 🎨 Precargar estilos críticos
    styles.forEach(styleUrl => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'style';
      link.href = styleUrl;
      document.head.appendChild(link);
    });

    // 🧹 Cleanup: remover preloads después de 5 segundos
    const cleanup = setTimeout(() => {
      document.querySelectorAll('link[rel="preload"], link[rel="modulepreload"]').forEach(link => {
        if (link.getAttribute('data-preload') !== 'keep') {
          link.remove();
        }
      });
    }, 5000);

    return () => clearTimeout(cleanup);
  }, [options]);
};

// 🎯 Hook específico para la página de expedientes clínicos
export const useClinicalRecordsPreload = () => {
  usePreloadResources({
    // Precargar componentes que se usan frecuentemente
    scripts: [
      '/src/components/ClinicalRecords/ClinicalRecordsList.tsx',
      '/src/components/ClinicalRecords/ClinicalRecordForm.tsx'
    ],

    // Precargar iconos críticos
    images: [
      // Bootstrap icons que se usan en la interfaz
    ]
  });

  // 📡 Prefetch de datos comunes
  useEffect(() => {
    // DNS prefetch para APIs externas
    const envUrl = import.meta.env.VITE_API_URL;
    const apiUrl = envUrl || (import.meta.env.MODE === 'production'
      ? 'https://litam.onrender.com'
      : 'http://localhost:4000');

    const dnsPrefetch = document.createElement('link');
    dnsPrefetch.rel = 'dns-prefetch';
    dnsPrefetch.href = apiUrl;
    document.head.appendChild(dnsPrefetch);

    return () => dnsPrefetch.remove();
  }, []);
};

// 🌐 Resource hints adicionales para performance
export const addResourceHints = () => {
  // 🔗 Preconectar a dominios críticos
  const envUrl = import.meta.env.VITE_API_URL;
  const apiUrl = envUrl || (import.meta.env.MODE === 'production'
    ? 'https://litam.onrender.com'
    : 'http://localhost:4000');

  const preconnectDomains = [
    apiUrl,
    'https://cdn.jsdelivr.net', // Para iconos de React Icons
  ];

  preconnectDomains.forEach(domain => {
    const link = document.createElement('link');
    link.rel = 'preconnect';
    link.href = domain;
    link.crossOrigin = 'anonymous';
    document.head.appendChild(link);
  });
};