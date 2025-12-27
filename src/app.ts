// src/app.ts
import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import authRoutes from './modules/auth/auth.routes';
import userRoutes from './modules/users/users.routes';
import patientRoutes from './modules/patients/patient.routes';
import nutritionistRoutes from './modules/nutritionists/nutritionist.routes';
import nutritionistRegistrationRoutes from './modules/nutritionists/nutritionist-registration.routes';
import relationRoutes from './modules/relations/relation.routes';
import foodRoutes from './modules/foods/food.routes';
import recipeRoutes from './modules/foods/recipe.routes';
import dietPlanRoutes from './modules/diet_plans/diet_plan.routes';
import reportsRoutes from './modules/reports/reports.routes';
import appointmentRoutes from './modules/appointments/appointment.routes';
import progressTrackingRoutes from './modules/progress_tracking/progress_tracking.routes';
import subscriptionRoutes from './modules/subscriptions/subscription.routes';
import educationalContentRoutes from './modules/educational_content/educational_content.routes';
import adminRoutes from './modules/admin/admin.routes';
import messagingRoutes from './modules/messaging/message.routes';
import clinicalRecordRoutes from './modules/clinical_records/clinical_record.routes';
import dashboardRoutes from './modules/dashboard/dashboard.routes';
import calendarRoutes from './modules/calendar/calendar.routes';
import monetizationRoutes from './modules/monetization/monetization.routes';
import templateRoutes from './modules/templates/weekly-plan-template.routes';
import growthChartsRoutes from './modules/growth_charts/growth_charts.routes';
import growthAlertsRoutes from './modules/growth_charts/growth_alerts.routes';
import pdfExportRoutes from './modules/growth_charts/pdf_export.routes';
import clinicalIntegrationRoutes from './modules/growth_charts/clinical_integration.routes';
import emailRoutes from './modules/email/email.routes';
import notificationsRoutes from './modules/notifications/notifications.routes';
import { AppError } from './utils/app.error';
import { resilienceMiddleware } from './middleware/resilience.middleware';
import { mobileOptimizationMiddleware, mobileMetricsMiddleware } from './middleware/mobile-optimization.middleware';

// Extensión de tipos para Request
declare global {
    namespace Express {
        interface Request {
            rawBody?: Buffer;
            user?: any; // Para soporte de autenticación (temporalmente any para compatibilidad)
        }
    }
}

dotenv.config();

const app: Application = express();

// *** CONFIGURACIÓN DE SEGURIDAD Y ACCESIBILIDAD PARA MÚLTIPLES USUARIOS ***

// Helmet para seguridad HTTP con configuración mejorada
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'", "https://cdn.jsdelivr.net", "https://cdnjs.cloudflare.com"],
            scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'", "https://cdn.jsdelivr.net", "https://cdnjs.cloudflare.com"],
            imgSrc: ["'self'", "data:", "https:"],
            connectSrc: ["'self'", "ws:", "wss:"],
            fontSrc: ["'self'", "https://cdn.jsdelivr.net", "https://cdnjs.cloudflare.com"],
            objectSrc: ["'none'"],
            mediaSrc: ["'self'"]
        }
    },
    // Headers adicionales para accesibilidad y compatibilidad
    crossOriginEmbedderPolicy: false,
    crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// **HEADERS OPTIMIZADOS PARA CDN Y CACHING AGRESIVO**
app.use((req: Request, res: Response, next: NextFunction) => {
    // Headers de seguridad
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');

    // Headers para compatibilidad con navegadores y CDN
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, X-User-ID, X-Platform, X-Device-ID');

    // **CONFIGURACIÓN DE CACHE INTELIGENTE PARA MILES DE USUARIOS**
    const userAgent = req.get('User-Agent') || '';
    const path = req.path;
    const method = req.method;

    // **CACHE AGRESIVO PARA RECURSOS ESTÁTICOS**
    if (path.includes('/assets/') || path.includes('/images/') || path.includes('/css/') || path.includes('/js/')) {
        res.setHeader('Cache-Control', 'public, max-age=31536000, immutable'); // 1 año
        res.setHeader('Expires', new Date(Date.now() + 31536000000).toUTCString());
    }
    // **CACHE PARA APIs DE DATOS PÚBLICOS (nutriólogos info, etc.)**
    else if (method === 'GET' && (path.includes('/api/nutritionists/public') || path.includes('/api/public/'))) {
        res.setHeader('Cache-Control', 'public, max-age=1800, s-maxage=3600'); // 30min client, 1h CDN
        res.setHeader('Vary', 'Accept-Encoding, User-Agent');
    }
    // **CACHE PARA DATOS DE PERFIL (menos frecuentes cambios)**
    else if (method === 'GET' && path.includes('/api/profile/')) {
        res.setHeader('Cache-Control', 'private, max-age=300'); // 5 minutos para perfil
    }
    // **CACHE PARA DATOS MÉDICOS (muy corto por privacidad)**
    else if (path.includes('/api/patients/') || path.includes('/api/appointments/')) {
        res.setHeader('Cache-Control', 'private, max-age=60'); // 1 minuto máximo
        res.setHeader('Pragma', 'no-cache');
    }
    // **SIN CACHE PARA APIS DINÁMICAS Y SENSIBLES**
    else if (path.includes('/api/auth/') || path.includes('/api/admin/') || method !== 'GET') {
        res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
        res.setHeader('Pragma', 'no-cache');
        res.setHeader('Expires', '0');
    }
    // **CACHE MODERADO PARA APIS GENERALES**
    else {
        res.setHeader('Cache-Control', 'private, max-age=180'); // 3 minutos por defecto
    }

    // **HEADERS ESPECÍFICOS PARA MÓVILES**
    if (userAgent.includes('Mobile') || userAgent.includes('Android') || userAgent.includes('iOS')) {
        res.setHeader('X-Mobile-Optimized', 'true');
        res.setHeader('X-Compression', 'gzip, br'); // Compresión preferida para móviles

        // Cache más agresivo para móviles (redes lentas)
        if (method === 'GET' && !path.includes('/api/auth/')) {
            const currentCache = res.getHeader('Cache-Control') as string;
            if (currentCache && !currentCache.includes('no-cache')) {
                // Duplicar el tiempo de cache para móviles
                const maxAgeMatch = currentCache.match(/max-age=(\d+)/);
                if (maxAgeMatch) {
                    const newMaxAge = Math.min(parseInt(maxAgeMatch[1]) * 2, 3600); // Max 1 hora
                    res.setHeader('Cache-Control', currentCache.replace(/max-age=\d+/, `max-age=${newMaxAge}`));
                }
            }
        }
    }

    // **HEADERS PARA CDN (Cloudflare, etc.)**
    if (process.env.NODE_ENV === 'production') {
        res.setHeader('CF-Cache-Status', 'DYNAMIC'); // Cloudflare
        res.setHeader('X-Served-By', 'nutri-backend');
        res.setHeader('X-Cache-Tags', `path:${path.split('/')[2] || 'general'}`);
    }

    next();
});

// Compresión para mejorar rendimiento con múltiples usuarios
app.use(compression());

// **MIDDLEWARE DE RESILENCIA PARA MILES DE USUARIOS**
app.use(resilienceMiddleware);

// **OPTIMIZACIONES ESPECÍFICAS PARA MÓVILES**
app.use(mobileOptimizationMiddleware);

// **MÉTRICAS PARA MÓVILES**
app.use(mobileMetricsMiddleware);

// **RATE LIMITING INTELIGENTE PARA MILES DE USUARIOS CONCURRENTES**

// **LIMITER PARA NUTRIÓLOGOS WEB (Mayor capacidad)**
const nutritionistLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: process.env.NODE_ENV === 'production' ? 500 : 1000, // 500 req/15min para nutriólogos
    message: {
        error: 'Límite de requests excedido para profesionales. Intenta en 15 minutos.',
        code: 'NUTRITIONIST_RATE_LIMIT_EXCEEDED',
        userType: 'nutritionist'
    },
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: (req: Request) => {
        const realIp = getRealIP(req);
        const userType = req.headers['x-user-type'] || 'web';
        return `nutritionist:${realIp}:${userType}`;
    },
    skip: skipHealthChecks
});

// **LIMITER PARA PACIENTES MÓVIL (Optimizado para conexiones lentas)**
const patientMobileLimiter = rateLimit({
    windowMs: 10 * 60 * 1000, // 10 minutos - ventana más corta para móviles
    max: process.env.NODE_ENV === 'production' ? 300 : 500, // 300 req/10min para pacientes móvil
    message: {
        error: 'Límite de requests excedido. Intenta en unos minutos.',
        code: 'PATIENT_RATE_LIMIT_EXCEEDED',
        userType: 'patient_mobile'
    },
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: (req: Request) => {
        const realIp = getRealIP(req);
        const deviceId = req.headers['x-device-id'] || 'unknown';
        return `patient_mobile:${realIp}:${deviceId}`;
    },
    skip: skipHealthChecks
});

// **LIMITER GENERAL (Fallback para requests no clasificados)**
const generalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: process.env.NODE_ENV === 'production' ? 400 : 1000, // Balance entre web y móvil
    message: {
        error: 'Demasiadas peticiones desde esta IP, por favor intenta de nuevo más tarde.',
        code: 'GENERAL_RATE_LIMIT_EXCEEDED'
    },
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: getRealIP,
    skip: skipHealthChecks,
    handler: (req: Request, res: Response) => {
        const retryAfter = process.env.NODE_ENV === 'production' ? 15 * 60 : 5 * 60;
        res.status(429).json({
            status: 'error',
            message: 'Demasiadas peticiones desde esta IP, por favor intenta de nuevo más tarde.',
            code: 'GENERAL_RATE_LIMIT_EXCEEDED',
            retryAfter: retryAfter,
            suggestion: 'Considera usar la app móvil para mejor rendimiento'
        });
    }
});

// **UTILIDADES HELPER PARA RATE LIMITING**
function getRealIP(req: Request): string {
    const realIp = req.headers['x-real-ip'] as string ||
        req.headers['x-forwarded-for'] as string ||
        req.headers['cf-connecting-ip'] as string || // Cloudflare
        req.ip ||
        req.connection.remoteAddress ||
        'unknown';

    return Array.isArray(realIp) ? realIp[0] : realIp.split(',')[0].trim();
}

function skipHealthChecks(req: Request): boolean {
    if (process.env.NODE_ENV !== 'production') {
        const ip = req.ip || req.connection.remoteAddress || '';
        if (ip.includes('127.0.0.1') || ip.includes('::1') || ip.includes('localhost')) {
            return true;
        }
    }

    // Rutas que no necesitan rate limiting
    const skipPaths = [
        '/api/health',
        '/health',
        '/api/status',
        '/metrics'
    ];

    return skipPaths.includes(req.path);
}

// **MIDDLEWARE INTELIGENTE DE RATE LIMITING**
const intelligentRateLimit = (req: Request, res: Response, next: NextFunction) => {
    const userAgent = req.get('User-Agent') || '';
    const userType = req.headers['x-user-type'] as string;
    const path = req.path;

    // Determinar qué limiter usar
    if (userType === 'nutritionist' || path.includes('/admin/') || path.includes('/dashboard/')) {
        return nutritionistLimiter(req, res, next);
    }

    // Detectar clientes móviles
    if (userAgent.includes('Mobile') || userAgent.includes('Android') || userAgent.includes('iOS') ||
        req.headers['x-platform'] === 'mobile') {
        return patientMobileLimiter(req, res, next);
    }

    // Fallback a general limiter
    return generalLimiter(req, res, next);
};

// **RATE LIMITING PARA AUTENTICACIÓN - OPTIMIZADO PARA SUPABASE**
const authLimiter = rateLimit({
    windowMs: process.env.NODE_ENV === 'production' ? 15 * 60 * 1000 : 5 * 60 * 1000,
    max: process.env.NODE_ENV === 'production' ? 10 : 50, // Más permisivo en prod (UX mejor)
    message: {
        error: 'Demasiados intentos de inicio de sesión, por favor intenta de nuevo en unos minutos.',
        code: 'AUTH_RATE_LIMIT_EXCEEDED'
    },
    skipSuccessfulRequests: true,

    // **MISMA CONFIGURACIÓN DE IP QUE GENERAL LIMITER**
    keyGenerator: (req: Request) => {
        const realIp = req.headers['x-real-ip'] as string ||
            req.headers['x-forwarded-for'] as string ||
            req.ip ||
            req.connection.remoteAddress ||
            'unknown';
        return Array.isArray(realIp) ? realIp[0] : realIp.split(',')[0].trim();
    },

    skip: (req: Request) => {
        if (process.env.NODE_ENV !== 'production') {
            const ip = req.ip || req.connection.remoteAddress || '';
            return ip.includes('127.0.0.1') || ip.includes('::1') || ip.includes('localhost');
        }
        return false;
    },

    handler: (req: Request, res: Response) => {
        const retryAfter = process.env.NODE_ENV === 'production' ? 15 * 60 : 5 * 60;
        res.status(429).json({
            status: 'error',
            message: 'Demasiados intentos de inicio de sesión, por favor intenta de nuevo en unos minutos.',
            code: 'AUTH_RATE_LIMIT_EXCEEDED',
            retryAfter: retryAfter,
            // Información adicional para debugging en desarrollo
            ...(process.env.NODE_ENV === 'development' && {
                debug: {
                    ip: req.ip,
                    headers: req.headers
                }
            })
        });
    }
});

// **APLICAR RATE LIMITING INTELIGENTE**
app.use('/api/', intelligentRateLimit);

// **CONFIGURACIÓN CORS OPTIMIZADA PARA VERCEL Y PRODUCCIÓN**
app.use(cors({
    origin: function (origin, callback) {
        // Permitir requests sin origin (mobile apps, postman, etc.)
        if (!origin) return callback(null, true);

        // **CONFIGURACIÓN FLEXIBLE PARA DESARROLLO Y PRODUCCIÓN**
        const allowedOrigins = [
            // Desarrollo local
            'http://localhost:5000',
            'http://localhost:5001',
            'http://localhost:3000',
            'http://127.0.0.1:5000',
            'http://127.0.0.1:5001',
            'http://127.0.0.1:3000',
            // Default Vite port
            'http://localhost:5173',
            'http://127.0.0.1:5173',

            // **DOMINIOS DE PRODUCCIÓN**
            'https://litam.vercel.app', // <-- DOMINIO PRINCIPAL

            // Agregar otros dominios
            ...(process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : []),

            // Dominios de Vercel (patrones automáticos)
            ...(process.env.VERCEL_URL ? [
                `https://${process.env.VERCEL_URL}`,
                `https://${process.env.VERCEL_URL.replace('https://', '')}`
            ] : [])
        ];

        // **VERIFICACIÓN FLEXIBLE PARA VERCEL**
        const isAllowed = allowedOrigins.some(allowedOrigin => {
            // Exact match
            if (origin === allowedOrigin) return true;

            // Vercel preview URLs (nutri-*.vercel.app)
            if (process.env.NODE_ENV !== 'development' &&
                origin.match(/https:\/\/nutri-[a-z0-9-]+\.vercel\.app$/)) {
                return true;
            }

            // Custom domain patterns
            if (process.env.FRONTEND_DOMAIN &&
                origin.includes(process.env.FRONTEND_DOMAIN)) {
                return true;
            }

            return false;
        });

        if (isAllowed) {
            callback(null, true);
        } else {
            console.warn(`🚫 CORS: Origin no permitido: ${origin}`);
            // En desarrollo, ser más permisivo
            if (process.env.NODE_ENV === 'development') {
                callback(null, true);
            } else {
                callback(new Error('No permitido por CORS'));
            }
        }
    },

    // **CONFIGURACIONES OPTIMIZADAS PARA VERCEL**
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS', 'HEAD'],
    allowedHeaders: [
        'Content-Type',
        'Authorization',
        'X-Requested-With',
        'X-User-ID',
        'X-Vercel-Forwarded-For', // Headers específicos de Vercel
        'X-Real-IP',
        'Accept',
        'Origin',
        'Referer'
    ],
    exposedHeaders: ['X-Total-Count', 'X-Page-Count'], // Para paginación
    maxAge: process.env.NODE_ENV === 'production' ? 86400 : 3600, // 24h en prod, 1h en dev
    preflightContinue: false,
    optionsSuccessStatus: 204
}));

// Middleware para parsing de JSON con límite de tamaño para múltiples usuarios
app.use(express.json({
    limit: '10mb', // Límite de 10MB para archivos grandes (fotos de progreso, etc.)
    verify: (req: any, res, buf) => {
        // Verificación adicional si es necesario - almacenar raw body si es necesario
        req.rawBody = buf;
    }
}));
app.use(express.urlencoded({
    extended: true,
    limit: '10mb'
}));

// Middleware de logging para debugging con múltiples usuarios (mejorado para accesibilidad)
app.use((req: Request, res: Response, next: NextFunction) => {
    const timestamp = new Date().toISOString();
    const userAgent = req.get('User-Agent') || 'Unknown';
    const ip = req.ip || req.connection.remoteAddress || 'Unknown';

    // Log básico al inicio - el userId se mostrará en logs específicos después de auth
    console.log(`[${timestamp}] ${req.method} ${req.path} - IP: ${ip} - UA: ${userAgent.substring(0, 100)}`);

    // Agregar información de accesibilidad al request
    req.headers['x-request-timestamp'] = timestamp;
    req.headers['x-client-ip'] = ip;

    next();
});

// Servir archivos estáticos - PDFs generados y documentos de laboratorio
app.use('/generated-pdfs', express.static('generated-pdfs', {
    setHeaders: (res, path) => {
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'inline'); // Para mostrar en el navegador en lugar de descargar
    }
}));

app.use('/uploads', express.static('uploads', {
    setHeaders: (res, path) => {
        if (path.endsWith('.pdf')) {
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', 'inline');
        }
    }
}));

// Endpoint de health check mejorado
app.get('/api/health', (req: Request, res: Response) => {
    res.status(200).json({
        status: 'UP',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development',
        uptime: process.uptime(),
        version: process.env.npm_package_version || '1.0.0',
        // Información adicional para accesibilidad
        endpoints: {
            auth: '/api/auth',
            users: '/api/users',
            patients: '/api/patients',
            clinicalRecords: '/api/clinical-records',
            dietPlans: '/api/diet-plans'
        }
    });
});

// Endpoint de información de accesibilidad
app.get('/api/accessibility', (req: Request, res: Response) => {
    res.status(200).json({
        status: 'success',
        accessibility: {
            supported: true,
            features: [
                'WCAG 2.1 AA compliant',
                'Screen reader friendly',
                'Keyboard navigation support',
                'High contrast support',
                'Responsive design'
            ],
            contact: {
                support: 'support@nutriplatform.com',
                accessibility: 'accessibility@nutriplatform.com'
            }
        }
    });
});

// *** RUTAS DE LA API ***

// Aplicar rate limiting específico a rutas de autenticación
app.use('/api/auth', authLimiter, authRoutes);

// Rutas principales
app.use('/api/users', userRoutes);
app.use('/api/patients', patientRoutes);
app.use('/api/nutritionists', nutritionistRoutes);
app.use('/api/nutritionists', nutritionistRegistrationRoutes);
app.use('/api/relations', relationRoutes);
app.use('/api/foods', foodRoutes);
app.use('/api/recipes', recipeRoutes);
app.use('/api/diet-plans', dietPlanRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/progress-tracking', progressTrackingRoutes);
app.use('/api/subscriptions', subscriptionRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/educational-content', educationalContentRoutes);
app.use('/api/messages', messagingRoutes);
app.use('/api/clinical-records', clinicalRecordRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/calendar', calendarRoutes);
app.use('/api/monetization', monetizationRoutes);
app.use('/api/templates', templateRoutes);
app.use('/api/growth-charts', growthChartsRoutes);
app.use('/api/growth-charts/alerts', growthAlertsRoutes);
app.use('/api/growth-charts/export', pdfExportRoutes);
app.use('/api/growth-charts/clinical-integration', clinicalIntegrationRoutes);
app.use('/api/email', emailRoutes);
app.use('/api/notifications', notificationsRoutes);

// Manejo de rutas no encontradas con mejor información de accesibilidad
app.all('*', (req: Request, res: Response, next: NextFunction) => {
    const error = new AppError(`No se puede encontrar ${req.originalUrl} en este servidor!`, 404);
    error.isOperational = true;
    next(error);
});

// Middleware global de manejo de errores optimizado para múltiples usuarios y accesibilidad
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
    let statusCode = 500;
    let message = 'Algo salió muy mal!';
    let status = 'error';
    let errorCode = 'INTERNAL_SERVER_ERROR';

    // Log del error para debugging (mejorado para no exponer información sensible)
    const timestamp = new Date().toISOString();
    const userId = (req as any).user?.id || 'anonymous';
    const ip = req.ip || req.connection.remoteAddress || 'Unknown';

    console.error(`[${timestamp}] ERROR - User: ${userId} - IP: ${ip} - ${err.message}`);

    if (err instanceof AppError) {
        statusCode = err.statusCode;
        message = err.message;
        status = err.status;
        errorCode = err.errorCode || 'APP_ERROR';
    } else {
        // Log errores no controlados
        console.error('ERROR (No AppError):', err);

        // En producción, no exponer detalles internos del error
        if (process.env.NODE_ENV === 'production') {
            message = 'Error interno del servidor';
            errorCode = 'INTERNAL_SERVER_ERROR';
        } else {
            message = err.message;
            errorCode = 'UNKNOWN_ERROR';
        }
    }

    // Respuesta mejorada con información de accesibilidad
    const errorResponse = {
        status: status,
        message: message,
        errorCode: errorCode,
        timestamp: timestamp,
        path: req.originalUrl,
        method: req.method,
        // Información adicional para accesibilidad
        suggestions: getErrorSuggestions(errorCode),
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    };

    res.status(statusCode).json(errorResponse);
});

// Función para obtener sugerencias de error para accesibilidad
function getErrorSuggestions(errorCode: string): string[] {
    const suggestions: { [key: string]: string[] } = {
        'RATE_LIMIT_EXCEEDED': [
            'Espera unos minutos antes de intentar nuevamente',
            'Reduce la frecuencia de tus peticiones',
            'Contacta soporte si necesitas un límite mayor'
        ],
        'AUTH_RATE_LIMIT_EXCEEDED': [
            'Espera 15 minutos antes de intentar iniciar sesión nuevamente',
            'Verifica que tu contraseña sea correcta',
            'Usa la función "Olvidé mi contraseña" si es necesario'
        ],
        'UNAUTHORIZED': [
            'Inicia sesión para acceder a este recurso',
            'Verifica que tu sesión no haya expirado',
            'Contacta soporte si el problema persiste'
        ],
        'FORBIDDEN': [
            'No tienes permisos para realizar esta acción',
            'Contacta a tu administrador si necesitas acceso',
            'Verifica que estés usando la cuenta correcta'
        ],
        'NOT_FOUND': [
            'Verifica que la URL sea correcta',
            'Usa la navegación del sitio para encontrar el recurso',
            'Contacta soporte si crees que esto es un error'
        ],
        'VALIDATION_ERROR': [
            'Verifica que todos los campos requeridos estén completos',
            'Asegúrate de que los datos tengan el formato correcto',
            'Revisa los mensajes de error específicos'
        ],
        'INTERNAL_SERVER_ERROR': [
            'Intenta nuevamente en unos momentos',
            'Si el problema persiste, contacta soporte',
            'Verifica tu conexión a internet'
        ]
    };

    return suggestions[errorCode] || [
        'Intenta nuevamente',
        'Contacta soporte si el problema persiste'
    ];
}

export default app;