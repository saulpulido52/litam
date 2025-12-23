/**
 * 🛡️ MIDDLEWARE DE RESILENCIA PARA MILES DE USUARIOS CONCURRENTES
 * 
 * Este middleware implementa estrategias críticas de fallback y resilencia
 * para mantener el sistema funcionando bajo alta carga.
 */

import { Request, Response, NextFunction } from 'express';
import { AppDataSource } from '../database/data-source';

// **CIRCUIT BREAKER PATTERN PARA BASE DE DATOS**
class CircuitBreaker {
    private failures = 0;
    private successCount = 0;
    private lastFailTime = 0;
    private state: 'CLOSED' | 'OPEN' | 'HALF_OPEN' = 'CLOSED';
    
    constructor(
        private failureThreshold = 5,           // 5 fallos consecutivos
        private resetTimeout = 60000,           // 1 minuto de timeout
        private successThreshold = 3            // 3 éxitos para cerrar
    ) {}
    
    async execute<T>(operation: () => Promise<T>): Promise<T> {
        if (this.state === 'OPEN') {
            if (Date.now() - this.lastFailTime > this.resetTimeout) {
                this.state = 'HALF_OPEN';
                this.successCount = 0;
            } else {
                throw new Error('Circuit breaker is OPEN - service temporarily unavailable');
            }
        }
        
        try {
            const result = await operation();
            this.onSuccess();
            return result;
        } catch (error) {
            this.onFailure();
            throw error;
        }
    }
    
    private onSuccess() {
        this.failures = 0;
        if (this.state === 'HALF_OPEN') {
            this.successCount++;
            if (this.successCount >= this.successThreshold) {
                this.state = 'CLOSED';
            }
        }
    }
    
    private onFailure() {
        this.failures++;
        this.lastFailTime = Date.now();
        if (this.failures >= this.failureThreshold) {
            this.state = 'OPEN';
        }
    }
    
    getState() {
        return {
            state: this.state,
            failures: this.failures,
            successCount: this.successCount
        };
    }
}

// **INSTANCIAS DE CIRCUIT BREAKERS**
const dbCircuitBreaker = new CircuitBreaker(5, 60000, 3);
const externalApiCircuitBreaker = new CircuitBreaker(3, 30000, 2);

// **HEALTH CHECK CON FALLBACK**
export const healthCheckMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    if (req.path === '/api/health' || req.path === '/health') {
        try {
            // **CHECK BÁSICO DE BASE DE DATOS CON CIRCUIT BREAKER**
            const dbStatus = await dbCircuitBreaker.execute(async () => {
                const result = await AppDataSource.query('SELECT 1');
                return result ? 'healthy' : 'unhealthy';
            });
            
            // **MÉTRICAS DE SISTEMA**
            const systemMetrics = {
                timestamp: new Date().toISOString(),
                database: {
                    status: dbStatus,
                    circuitBreaker: dbCircuitBreaker.getState()
                },
                memory: {
                    used: process.memoryUsage().heapUsed / 1024 / 1024,
                    total: process.memoryUsage().heapTotal / 1024 / 1024,
                    limit: process.memoryUsage().rss / 1024 / 1024
                },
                uptime: process.uptime(),
                nodeVersion: process.version,
                environment: process.env.NODE_ENV,
                // **MÉTRICAS ESPECÍFICAS PARA ALTA CONCURRENCIA**
                connections: {
                    active: AppDataSource.isInitialized ? 1 : 0,
                    waiting: 0 // Simplificado por compatibilidad TypeORM
                }
            };
            
            res.status(200).json({
                status: 'success',
                message: 'Sistema operativo',
                data: systemMetrics
            });
            
        } catch (error) {
            console.error('❌ Health check failed:', error);
            
            // **RESPUESTA DE FALLBACK**
            res.status(503).json({
                status: 'error',
                message: 'Servicio temporalmente no disponible',
                data: {
                    timestamp: new Date().toISOString(),
                    database: {
                        status: 'unhealthy',
                        circuitBreaker: dbCircuitBreaker.getState()
                    },
                    fallback: true
                }
            });
        }
        return;
    }
    
    next();
};

// **MIDDLEWARE DE TIMEOUT PARA REQUESTS**
export const timeoutMiddleware = (timeout: number = 30000) => {
    return (req: Request, res: Response, next: NextFunction) => {
        // **TIMEOUT MÁS AGRESIVO PARA MÓVILES**
        const userAgent = req.get('User-Agent') || '';
        const isMobile = userAgent.includes('Mobile') || userAgent.includes('Android') || userAgent.includes('iOS');
        const finalTimeout = isMobile ? Math.min(timeout, 20000) : timeout; // 20s max para móviles
        
        const timer = setTimeout(() => {
            if (!res.headersSent) {
                res.status(408).json({
                    status: 'error',
                    message: 'Request timeout - el servidor tardó demasiado en responder',
                    code: 'REQUEST_TIMEOUT',
                    suggestion: isMobile ? 'Verifica tu conexión e intenta nuevamente' : 'Intenta nuevamente en unos momentos'
                });
            }
        }, finalTimeout);
        
        // Limpiar timeout cuando la respuesta se envíe
        res.on('finish', () => {
            clearTimeout(timer);
        });
        
        res.on('close', () => {
            clearTimeout(timer);
        });
        
        next();
    };
};

// **MIDDLEWARE DE GRACEFUL DEGRADATION**
export const gracefulDegradationMiddleware = (req: Request, res: Response, next: NextFunction) => {
    // **DESHABILITADO EN DESARROLLO PARA MEJOR EXPERIENCIA**
    if (process.env.NODE_ENV === 'development') {
        return next();
    }
    
    // **DETECTAR SOBRECARGA DEL SISTEMA (SOLO EN PRODUCCIÓN)**
    const memoryUsage = process.memoryUsage();
    const memoryUsagePercent = (memoryUsage.heapUsed / memoryUsage.heapTotal) * 100;
    const cpuLoadHigh = process.cpuUsage().system > 2000000; // 2 segundos de CPU (más permisivo)
    
    // **ACTIVAR MODO DEGRADADO SOLO BAJO CARGA EXTREMA**
    if (memoryUsagePercent > 95 || cpuLoadHigh) {
        console.warn(`⚠️ Sistema bajo carga extrema: Memoria ${memoryUsagePercent.toFixed(1)}%`);
        
        // **RESPUESTAS SIMPLIFICADAS PARA CIERTOS ENDPOINTS**
        if (req.path.includes('/api/dashboard/') || req.path.includes('/api/reports/')) {
            return res.status(503).json({
                status: 'degraded',
                message: 'Servicio en modo simplificado debido a alta demanda',
                code: 'GRACEFUL_DEGRADATION',
                fallback: {
                    message: 'Los reportes detallados están temporalmente no disponibles',
                    basicData: {
                        timestamp: new Date().toISOString(),
                        status: 'degraded_mode'
                    }
                }
            });
        }
        
        // **CACHE MÁS AGRESIVO EN MODO DEGRADADO**
        if (req.method === 'GET') {
            res.setHeader('Cache-Control', 'public, max-age=600'); // 10 minutos
        }
    }
    
    next();
};

// **MIDDLEWARE DE RETRY AUTOMÁTICO - SIMPLIFICADO PARA DESARROLLO**
export const retryMiddleware = (req: Request, res: Response, next: NextFunction) => {
    // Para desarrollo, simplemente pasamos al siguiente middleware
    // El retry se puede implementar más adelante cuando sea necesario
    next();
};

// **MIDDLEWARE DE MONITOREO DE PERFORMANCE**
export const performanceMonitoringMiddleware = (req: Request, res: Response, next: NextFunction) => {
    const startTime = Date.now();
    
    res.on('finish', () => {
        const duration = Date.now() - startTime;
        const userAgent = req.get('User-Agent') || '';
        const isMobile = userAgent.includes('Mobile') || userAgent.includes('Android') || userAgent.includes('iOS');
        
        // **LOG REQUESTS LENTOS**
        const slowThreshold = isMobile ? 3000 : 5000; // 3s móvil, 5s web
        if (duration > slowThreshold) {
            console.warn(`🐌 Slow request detected:`, {
                method: req.method,
                path: req.path,
                duration: `${duration}ms`,
                userAgent: isMobile ? 'mobile' : 'web',
                statusCode: res.statusCode,
                ip: req.ip
            });
        }
        
        // **MÉTRICAS PARA MONITOREO EXTERNO**
        if (process.env.NODE_ENV === 'production') {
            // Aquí podrías enviar métricas a servicios como DataDog, New Relic, etc.
            console.log(`📊 Request metrics:`, {
                path: req.path,
                method: req.method,
                duration,
                status: res.statusCode,
                userType: isMobile ? 'mobile' : 'web'
            });
        }
    });
    
    next();
};

// **MIDDLEWARE COMBINADO DE RESILENCIA**
export const resilienceMiddleware = [
    timeoutMiddleware(30000),
    gracefulDegradationMiddleware,
    performanceMonitoringMiddleware,
    healthCheckMiddleware
];

export {
    CircuitBreaker,
    dbCircuitBreaker,
    externalApiCircuitBreaker
};