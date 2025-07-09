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
import relationRoutes from './modules/relations/relation.routes';
import foodRoutes from './modules/foods/food.routes';
import dietPlanRoutes from './modules/diet_plans/diet_plan.routes';
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
import { AppError } from './utils/app.error';

// Extensión de tipos para Request
declare global {
    namespace Express {
        interface Request {
            rawBody?: Buffer;
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

// Headers adicionales para accesibilidad y compatibilidad
app.use((req: Request, res: Response, next: NextFunction) => {
    // Headers para accesibilidad
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    
    // Headers para compatibilidad con navegadores
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, X-User-ID');
    
    // Headers para mejorar la experiencia de usuario
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    
    next();
});

// Compresión para mejorar rendimiento con múltiples usuarios
app.use(compression());

// Rate limiting general - MÁS PERMISIVO EN DESARROLLO
const generalLimiter = rateLimit({
    windowMs: process.env.NODE_ENV === 'production' ? 15 * 60 * 1000 : 5 * 60 * 1000, // 15 min en prod, 5 min en dev
    max: process.env.NODE_ENV === 'production' ? 100 : 1000, // 100 en producción, 1000 en desarrollo
    message: {
        error: 'Demasiadas peticiones desde esta IP, por favor intenta de nuevo en 15 minutos.',
        code: 'RATE_LIMIT_EXCEEDED'
    },
    standardHeaders: true,
    legacyHeaders: false,
    // Saltar rate limiting para localhost en desarrollo
    skip: (req: Request) => {
        if (process.env.NODE_ENV !== 'production') {
            const ip = req.ip || req.connection.remoteAddress || '';
            return ip.includes('127.0.0.1') || ip.includes('::1') || ip.includes('localhost');
        }
        return false;
    },
    handler: (req: Request, res: Response) => {
        res.status(429).json({
            status: 'error',
            message: 'Demasiadas peticiones desde esta IP, por favor intenta de nuevo en 15 minutos.',
            code: 'RATE_LIMIT_EXCEEDED',
            retryAfter: Math.ceil(15 * 60 / 1000) // segundos
        });
    }
});

// Rate limiting para autenticación - RELAJADO PARA DESARROLLO
const authLimiter = rateLimit({
    windowMs: process.env.NODE_ENV === 'production' ? 15 * 60 * 1000 : 5 * 60 * 1000, // 15 min en prod, 5 min en dev
    max: process.env.NODE_ENV === 'production' ? 5 : 50, // 5 en producción, 50 en desarrollo
    message: {
        error: 'Demasiados intentos de inicio de sesión, por favor intenta de nuevo en unos minutos.',
        code: 'AUTH_RATE_LIMIT_EXCEEDED'
    },
    skipSuccessfulRequests: true,
    // En desarrollo, ser menos restrictivo
    skip: (req: Request) => {
        // Saltar rate limiting para localhost en desarrollo
        if (process.env.NODE_ENV !== 'production') {
            const ip = req.ip || req.connection.remoteAddress || '';
            return ip.includes('127.0.0.1') || ip.includes('::1') || ip.includes('localhost');
        }
        return false;
    },
    // Headers personalizados para accesibilidad
    handler: (req: Request, res: Response) => {
        const retryAfter = process.env.NODE_ENV === 'production' ? Math.ceil(15 * 60 / 1000) : Math.ceil(5 * 60 / 1000);
        res.status(429).json({
            status: 'error',
            message: 'Demasiados intentos de inicio de sesión, por favor intenta de nuevo en unos minutos.',
            code: 'AUTH_RATE_LIMIT_EXCEEDED',
            retryAfter: retryAfter
        });
    }
});

// Aplicar rate limiting general
app.use('/api/', generalLimiter);

// Configurar CORS optimizado para múltiples usuarios y accesibilidad
app.use(cors({
    origin: function (origin, callback) {
        // Permitir requests sin origin (mobile apps, postman, etc.)
        if (!origin) return callback(null, true);
        
        // Lista de orígenes permitidos (expandir según necesidades)
        const allowedOrigins = [
            'http://localhost:5000',
            'http://localhost:5001', // Puerto alternativo para frontend
            'http://localhost:3000',
            'http://127.0.0.1:5000',
            'http://127.0.0.1:5001', // Puerto alternativo para frontend
            'http://127.0.0.1:3000',
            // Añadir dominios de producción aquí cuando sea necesario
        ];
        
        if (allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            callback(new Error('No permitido por CORS'));
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'X-User-ID'],
    maxAge: 86400, // Cache preflight requests por 24 horas
    // Opciones adicionales para compatibilidad
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
app.use('/api/relations', relationRoutes);
app.use('/api/foods', foodRoutes);
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