import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vite.dev/config/
export default defineConfig(({ mode }) => ({
  plugins: [
    react({
      // Optimizaciones para React en producción
      babel: {
        plugins: mode === 'production' ? [
          // ['babel-plugin-transform-remove-console', { exclude: ['error', 'warn'] }]
        ] : []
      }
    })
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },

  // **OPTIMIZACIONES PARA MILES DE USUARIOS EN VERCEL**c
  build: {
    // Optimización del bundle para escala masiva
    target: 'es2020',
    minify: 'terser',
    sourcemap: mode === 'development',

    // **CHUNKING AGRESIVO PARA MILES DE USUARIOS**
    rollupOptions: {
      output: {
        manualChunks: {
          // **SEPARACIÓN ULTRA-GRANULAR PARA CACHING**
          'react-core': ['react', 'react-dom'],
          'react-router': ['react-router-dom'],
          'ui-bootstrap': ['react-bootstrap'],
          'ui-bootstrap-css': ['bootstrap'],
          'charts': ['recharts'],
          'http-client': ['axios'],
          'date-utils': ['date-fns'],
          'validation': ['zod'],
          'icons-lucide': ['lucide-react'],
          'icons-react': ['react-icons'],
          'query-client': ['@tanstack/react-query'],
          'forms': ['react-hook-form'],
          // **CHUNKS ESPECÍFICOS POR FUNCIONALIDAD**
          'patient-features': [
            './src/pages/PatientsPage',
            './src/services/patientsService',
            './src/hooks/usePatients'
          ],
          'appointment-features': [
            './src/pages/AppointmentsPage',
            './src/pages/CalendarPage',
            './src/services/appointmentsService'
          ],
          'diet-features': [
            './src/pages/DietPlansPage',
            './src/services/dietPlansService'
          ],
          'admin-features': [
            './src/pages/admin/AdminDashboard',
            './src/pages/admin/AdminUsers'
          ]
        },

        // **NOMBRES OPTIMIZADOS PARA CDN CACHING**
        chunkFileNames: 'js/[name]-[hash].js',
        entryFileNames: 'js/[name]-[hash].js',
        assetFileNames: (assetInfo) => {
          if (!assetInfo.name) return 'assets/[name]-[hash].[ext]';

          const info = assetInfo.name.split('.');
          const ext = info[info.length - 1];
          if (/png|jpe?g|svg|gif|tiff|bmp|ico/i.test(ext)) {
            return `images/[name]-[hash].[ext]`;
          }
          if (/css/i.test(ext)) {
            return `css/[name]-[hash].[ext]`;
          }
          return `assets/[name]-[hash].[ext]`;
        }
      },

      // **TREE-SHAKING AGRESIVO**
      treeshake: {
        moduleSideEffects: false,
        propertyReadSideEffects: false,
        unknownGlobalSideEffects: false,
        preset: 'recommended'
      },

      // **OPTIMIZACIONES PARA MÓVILES**
      external: mode === 'production' ? [
        // Externalizar bibliotecas que se pueden cargar desde CDN
      ] : []
    },

    // **CONFIGURACIONES PARA ALTA ESCALA**
    chunkSizeWarningLimit: 500, // 500KB - más estricto para móviles
    assetsInlineLimit: 2048, // 2KB - menos inline para mejor caching

    // **CSS OPTIMIZADO PARA MÓVILES**
    cssCodeSplit: true,
    cssMinify: 'lightningcss',

    // **CONFIGURACIONES ADICIONALES PARA PERFORMANCE**
    reportCompressedSize: false, // Mejora velocidad de build
    write: true
  },

  // **OPTIMIZACIONES DE PERFORMANCE**
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      'react-bootstrap',
      'axios',
      'zod'
    ],
    exclude: ['lucide-react'] // Lazy load iconos
  },

  server: {
    port: 5000,
    host: true,
    // Solo proxies en desarrollo
    ...(mode === 'development' && {
      proxy: {
        '/api': {
          target: process.env.VITE_API_URL || 'http://localhost:4000',
          changeOrigin: true,
          secure: false,
        },
        '/uploads': {
          target: process.env.VITE_API_URL || 'http://localhost:4000',
          changeOrigin: true,
          secure: false,
        },
        '/generated-pdfs': {
          target: process.env.VITE_API_URL || 'http://localhost:4000',
          changeOrigin: true,
          secure: false,
        },
      }
    })
  },

  // **VARIABLES DE ENTORNO OPTIMIZADAS**
  define: {
    'import.meta.env.VITE_API_URL': JSON.stringify(
      (mode === 'production' ? 'https://litam.onrender.com/api' : '/api')  // ← USAR PROXY EN DESARROLLO
    ),
    'import.meta.env.VITE_APP_NAME': JSON.stringify('Litam - Dashboard Nutriólogo'),
    'import.meta.env.VITE_APP_VERSION': JSON.stringify('1.0.0'),
    'import.meta.env.VITE_NODE_ENV': JSON.stringify(mode),
    // Remover console.logs en producción
    ...(mode === 'production' && {
      'console.log': 'undefined',
      'console.debug': 'undefined',
      'console.info': 'undefined'
    })
  },

  // **CONFIGURACIONES ESPECÍFICAS PARA VERCEL**
  ...(mode === 'production' && {
    base: '/',
    publicDir: 'public',

    // Preload optimizations
    experimental: {
      renderBuiltUrl(filename, { hostType }) {
        if (hostType === 'js') {
          return { js: `/_next/static/chunks/${filename}` }
        } else {
          return { relative: true }
        }
      }
    }
  })
}))
