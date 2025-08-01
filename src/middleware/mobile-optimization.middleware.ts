/**
 * 📱 OPTIMIZACIONES ESPECÍFICAS PARA PACIENTES MÓVILES
 * 
 * Middleware especializado para reducir latency y mejorar experiencia
 * en conexiones móviles lentas (3G, 4G limitado, etc.)
 */

import { Request, Response, NextFunction } from 'express';
import compression from 'compression';

// **DETECCIÓN INTELIGENTE DE DISPOSITIVOS MÓVILES**
export const detectMobileMiddleware = (req: Request, res: Response, next: NextFunction) => {
    const userAgent = req.get('User-Agent') || '';
    const isMobile = userAgent.includes('Mobile') || 
                    userAgent.includes('Android') || 
                    userAgent.includes('iOS') ||
                    req.headers['x-platform'] === 'mobile';
    
    // **DETECTAR TIPO DE CONEXIÓN**
    const connectionType = req.headers['x-connection-type'] as string || 'unknown';
    const isSlowConnection = connectionType.includes('2g') || 
                           connectionType.includes('slow') ||
                           req.headers['save-data'] === 'on'; // Chrome's Save-Data API
    
    // **AGREGAR INFORMACIÓN AL REQUEST**
    (req as any).deviceInfo = {
        isMobile,
        isSlowConnection,
        connectionType,
        userAgent: userAgent.substring(0, 100) // Limitar para logging
    };
    
    next();
};

// **COMPRESIÓN AGRESIVA PARA MÓVILES - SIMPLIFICADA**
export const mobileCompressionMiddleware = compression({
    // **COMPRESIÓN AGRESIVA ESTÁNDAR**
    level: 9, // Máxima compresión por defecto
    threshold: 512, // Comprimir archivos > 512 bytes
    
    // **COMPRESIÓN PREFERIDA PARA MÓVILES**
    filter: (req: Request, res: Response) => {
        const deviceInfo = (req as any).deviceInfo;
        
        // Siempre comprimir para móviles
        if (deviceInfo?.isMobile) {
            return true;
        }
        
        // Usar lógica estándar para web
        return compression.filter(req, res);
    }
});

// **OPTIMIZACIÓN DE RESPONSES PARA MÓVILES**
export const mobileResponseOptimizationMiddleware = (req: Request, res: Response, next: NextFunction) => {
    const deviceInfo = (req as any).deviceInfo;
    
    if (deviceInfo?.isMobile) {
        // **INTERCEPTAR JSON RESPONSES PARA OPTIMIZAR**
        const originalJson = res.json;
        res.json = function(obj: any) {
            // **REDUCIR PAYLOAD PARA MÓVILES**
            if (obj && typeof obj === 'object') {
                obj = optimizePayloadForMobile(obj, deviceInfo.isSlowConnection);
            }
            
            // **HEADERS ESPECÍFICOS PARA MÓVILES**
            res.setHeader('X-Mobile-Optimized', 'true');
            res.setHeader('X-Response-Optimized', 'payload-reduced');
            
            return originalJson.call(this, obj);
        };
    }
    
    next();
};

// **FUNCIÓN PARA OPTIMIZAR PAYLOADS**
function optimizePayloadForMobile(obj: any, isSlowConnection: boolean): any {
    if (!obj || typeof obj !== 'object') return obj;
    
    // **CREAR COPIA PARA NO MUTAR ORIGINAL**
    const optimized = Array.isArray(obj) ? [...obj] : { ...obj };
    
    // **OPTIMIZACIONES PARA CONEXIONES LENTAS**
    if (isSlowConnection) {
        // Remover campos no esenciales
        delete optimized.metadata;
        delete optimized.debug;
        delete optimized.extended_info;
        
        // Reducir arrays grandes
        if (Array.isArray(optimized.data) && optimized.data.length > 20) {
            optimized.data = optimized.data.slice(0, 20);
            optimized.truncated = true;
            optimized.total_available = obj.data?.length || 0;
        }
    }
    
    // **OPTIMIZACIONES GENERALES PARA MÓVILES**
    if (optimized.patients && Array.isArray(optimized.patients)) {
        optimized.patients = optimized.patients.map((patient: any) => ({
            id: patient.id,
            first_name: patient.first_name,
            last_name: patient.last_name,
            email: patient.email,
            phone: patient.phone,
            // Remover campos pesados para listados
            // medical_conditions, allergies, etc. se cargan bajo demanda
        }));
    }
    
    if (optimized.appointments && Array.isArray(optimized.appointments)) {
        optimized.appointments = optimized.appointments.map((apt: any) => ({
            id: apt.id,
            start_time: apt.start_time,
            end_time: apt.end_time,
            status: apt.status,
            patient: apt.patient ? {
                id: apt.patient.id,
                first_name: apt.patient.first_name,
                last_name: apt.patient.last_name
            } : null
        }));
    }
    
    return optimized;
}

// **PRELOAD HINTS PARA MÓVILES**
export const mobilePreloadMiddleware = (req: Request, res: Response, next: NextFunction) => {
    const deviceInfo = (req as any).deviceInfo;
    
    // **PRELOADS DESHABILITADOS TEMPORALMENTE**
    // Los preloads HTML no pueden enviar headers de Authorization,
    // causando errores 401 en endpoints protegidos
    if (deviceInfo?.isMobile && req.method === 'GET') {
        // **SOLO PRELOAD DE RECURSOS ESTÁTICOS (NO APIs PROTEGIDAS)**
        if (req.path === '/' || req.path === '/dashboard') {
            res.setHeader('Link', [
                '</css/dashboard-modern.css>; rel=preload; as=style',
                '</js/bootstrap.bundle.min.js>; rel=preload; as=script'
            ].join(', '));
        }
        
        // **NO MÁS PRELOADS DE APIs PROTEGIDAS**
        // Comentado para evitar errores 401:
        // '</api/patients/stats/summary>; rel=preload; as=fetch',
        // '</api/appointments/my-appointments>; rel=preload; as=fetch'
    }
    
    next();
};

// **MIDDLEWARE DE TIMEOUT ESPECÍFICO PARA MÓVILES**
export const mobileTimeoutMiddleware = (req: Request, res: Response, next: NextFunction) => {
    const deviceInfo = (req as any).deviceInfo;
    
    if (deviceInfo?.isMobile) {
        const timeout = deviceInfo.isSlowConnection ? 15000 : 20000; // 15s para 2G/3G, 20s para 4G
        
        const timer = setTimeout(() => {
            if (!res.headersSent) {
                res.status(408).json({
                    status: 'error',
                    message: 'Tiempo de espera agotado. Verifica tu conexión e intenta nuevamente.',
                    code: 'MOBILE_TIMEOUT',
                    optimized: true,
                    suggestion: 'Intenta cambiar a WiFi si es posible'
                });
            }
        }, timeout);
        
        res.on('finish', () => clearTimeout(timer));
        res.on('close', () => clearTimeout(timer));
    }
    
    next();
};

// **MIDDLEWARE DE LAZY LOADING PARA MÓVILES**
export const mobileLazyLoadingMiddleware = (req: Request, res: Response, next: NextFunction) => {
    const deviceInfo = (req as any).deviceInfo;
    
    if (deviceInfo?.isMobile && req.method === 'GET') {
        // **INTERCEPTAR RESPONSES PARA AGREGAR LAZY LOADING**
        const originalJson = res.json;
        res.json = function(obj: any) {
            if (obj && obj.data && Array.isArray(obj.data)) {
                // **PAGINACIÓN AUTOMÁTICA PARA MÓVILES**
                const page = parseInt(req.query.page as string) || 1;
                const limit = deviceInfo.isSlowConnection ? 10 : 20; // Menos items para conexiones lentas
                
                if (!req.query.limit) {
                    const startIndex = (page - 1) * limit;
                    const endIndex = startIndex + limit;
                    
                    obj.data = obj.data.slice(startIndex, endIndex);
                    obj.pagination = {
                        page,
                        limit,
                        total: obj.total || obj.data.length,
                        hasMore: endIndex < (obj.total || obj.data.length)
                    };
                    obj.mobile_optimized = true;
                }
            }
            
            return originalJson.call(this, obj);
        };
    }
    
    next();
};

// **MIDDLEWARE COMBINADO DE OPTIMIZACIÓN MÓVIL**
export const mobileOptimizationMiddleware = [
    detectMobileMiddleware,
    mobileCompressionMiddleware,
    mobileTimeoutMiddleware,
    mobilePreloadMiddleware,
    mobileResponseOptimizationMiddleware,
    mobileLazyLoadingMiddleware
];

// **MIDDLEWARE DE MÉTRICAS MÓVILES**
export const mobileMetricsMiddleware = (req: Request, res: Response, next: NextFunction) => {
    const deviceInfo = (req as any).deviceInfo;
    
    if (deviceInfo?.isMobile) {
        const startTime = Date.now();
        
        res.on('finish', () => {
            const duration = Date.now() - startTime;
            const payloadSize = res.get('Content-Length') || 0;
            
            // **LOG MÉTRICAS MÓVILES**
            console.log(`📱 Mobile request metrics:`, {
                path: req.path,
                duration: `${duration}ms`,
                payloadSize: `${payloadSize} bytes`,
                connectionType: deviceInfo.connectionType,
                isSlowConnection: deviceInfo.isSlowConnection,
                statusCode: res.statusCode
            });
            
            // **ALERTAS PARA REQUESTS LENTOS EN MÓVILES**
            if (duration > 5000) { // 5 segundos
                console.warn(`🐌 Slow mobile request detected:`, {
                    path: req.path,
                    duration: `${duration}ms`,
                    connectionType: deviceInfo.connectionType
                });
            }
        });
    }
    
    next();
};

export default mobileOptimizationMiddleware;