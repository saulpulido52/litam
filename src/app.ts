// src/app.ts
import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import authRoutes from '@/modules/auth/auth.routes';
import userRoutes from '@/modules/users/users.routes';
import patientRoutes from '@/modules/patients/patient.routes';
import nutritionistRoutes from '@/modules/nutritionists/nutritionist.routes';
import relationRoutes from '@/modules/relations/relation.routes';
import foodRoutes from '@/modules/foods/food.routes';
import dietPlanRoutes from '@/modules/diet_plans/diet_plan.routes';
import appointmentRoutes from '@/modules/appointments/appointment.routes';
import progressTrackingRoutes from '@/modules/progress_tracking/progress_tracking.routes';
import subscriptionRoutes from '@/modules/subscriptions/subscription.routes';
import educationalContentRoutes from '@/modules/educational_content/educational_content.routes';
import adminRoutes from '@/modules/admin/admin.routes';
import messagingRoutes from '@/modules/messaging/message.routes';
import clinicalRecordRoutes from '@/modules/clinical_records/clinical_record.routes';
import { AppError } from '@/utils/app.error';

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

// *** CONFIGURACIÓN DE SEGURIDAD PARA MÚLTIPLES USUARIOS ***

// Helmet para seguridad HTTP
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
    }
}));

// Compresión para mejorar rendimiento con múltiples usuarios
app.use(compression());

// Rate limiting general - 100 requests por 15 minutos por IP
const generalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 100, // máximo 100 requests por ventana de tiempo
    message: {
        error: 'Demasiadas peticiones desde esta IP, por favor intenta de nuevo en 15 minutos.',
        code: 'RATE_LIMIT_EXCEEDED'
    },
    standardHeaders: true,
    legacyHeaders: false,
});

// Rate limiting estricto para autenticación - 5 intentos por 15 minutos
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 5, // máximo 5 intentos de login por ventana de tiempo
    message: {
        error: 'Demasiados intentos de inicio de sesión, por favor intenta de nuevo en 15 minutos.',
        code: 'AUTH_RATE_LIMIT_EXCEEDED'
    },
    skipSuccessfulRequests: true,
});

// Aplicar rate limiting general
app.use('/api/', generalLimiter);

// Configurar CORS optimizado para múltiples usuarios
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
    maxAge: 86400 // Cache preflight requests por 24 horas
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

// Middleware de logging para debugging con múltiples usuarios
app.use((req: Request, res: Response, next: NextFunction) => {
    const timestamp = new Date().toISOString();
    const userId = req.headers['x-user-id'] || 'anonymous';
    console.log(`[${timestamp}] ${req.method} ${req.path} - User: ${userId} - IP: ${req.ip}`);
    next();
});

// Endpoint de health check
app.get('/api/health', (req: Request, res: Response) => {
    res.status(200).json({ 
        status: 'UP', 
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development',
        uptime: process.uptime()
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

// Manejo de rutas no encontradas
app.all('*', (req: Request, res: Response, next: NextFunction) => {
    next(new AppError(`No se puede encontrar ${req.originalUrl} en este servidor!`, 404));
});

// Middleware global de manejo de errores optimizado para múltiples usuarios
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
    let statusCode = 500;
    let message = 'Algo salió muy mal!';
    let status = 'error';

    // Log del error para debugging
    const timestamp = new Date().toISOString();
    const userId = req.headers['x-user-id'] || 'anonymous';
    console.error(`[${timestamp}] ERROR - User: ${userId} - IP: ${req.ip} - ${err.message}`);

    if (err instanceof AppError) {
        statusCode = err.statusCode;
        message = err.message;
        status = err.status;
    } else {
        // Log errores no controlados
        console.error('ERROR (No AppError):', err);
        
        // En producción, no exponer detalles internos del error
        if (process.env.NODE_ENV === 'production') {
            message = 'Error interno del servidor';
        } else {
            message = err.message;
        }
    }

    res.status(statusCode).json({
        status: status,
        message: message,
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
});

export default app;