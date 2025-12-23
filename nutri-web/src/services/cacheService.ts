/**
 * Servicio de caché para optimizar las llamadas a la API
 * Implementa cache en memoria con TTL (Time To Live) configurable
 */

interface CacheItem<T> {
  data: T;
  timestamp: number;
  ttl: number; // Time to live en milisegundos
}

type CacheKey = string;

class CacheService {
  private cache = new Map<CacheKey, CacheItem<any>>();
  
  // TTL por defecto: 5 minutos
  private readonly DEFAULT_TTL = 5 * 60 * 1000;

  /**
   * Obtener un valor del caché
   */
  get<T>(key: CacheKey): T | null {
    const item = this.cache.get(key);
    
    if (!item) {
      return null;
    }

    // Verificar si el item ha expirado
    const now = Date.now();
    if (now - item.timestamp > item.ttl) {
      this.cache.delete(key);
      return null;
    }

    return item.data as T;
  }

  /**
   * Almacenar un valor en el caché
   */
  set<T>(key: CacheKey, data: T, ttl?: number): void {
    const item: CacheItem<T> = {
      data,
      timestamp: Date.now(),
      ttl: ttl || this.DEFAULT_TTL
    };

    this.cache.set(key, item);
  }

  /**
   * Verificar si una clave existe y no ha expirado
   */
  has(key: CacheKey): boolean {
    return this.get(key) !== null;
  }

  /**
   * Eliminar una clave específica del caché
   */
  delete(key: CacheKey): boolean {
    return this.cache.delete(key);
  }

  /**
   * Limpiar todo el caché
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * Limpiar entradas expiradas
   */
  cleanup(): void {
    const now = Date.now();
    
    for (const [key, item] of this.cache.entries()) {
      if (now - item.timestamp > item.ttl) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * Obtener estadísticas del caché
   */
  getStats() {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys())
    };
  }

  /**
   * Wrapper para cachear llamadas a funciones asíncronas
   */
  async memoize<T>(
    key: CacheKey,
    asyncFunction: () => Promise<T>,
    ttl?: number
  ): Promise<T> {
    // Verificar si ya existe en caché
    const cached = this.get<T>(key);
    if (cached !== null) {
      console.log(`🎯 Cache HIT para: ${key}`);
      return cached;
    }

    console.log(`📡 Cache MISS para: ${key} - Cargando...`);
    
    try {
      // Ejecutar la función y cachear el resultado
      const result = await asyncFunction();
      this.set(key, result, ttl);
      return result;
    } catch (error) {
      console.error(`❌ Error al cargar datos para cache key: ${key}`, error);
      throw error;
    }
  }

  /**
   * Invalidar caché por patrón
   */
  invalidatePattern(pattern: string): number {
    let deletedCount = 0;
    
    for (const key of this.cache.keys()) {
      if (key.includes(pattern)) {
        this.cache.delete(key);
        deletedCount++;
      }
    }
    
    console.log(`🗑️ Invalidadas ${deletedCount} entradas de caché con patrón: ${pattern}`);
    return deletedCount;
  }

  /**
   * Precarga de datos
   */
  async preload<T>(
    key: CacheKey,
    asyncFunction: () => Promise<T>,
    ttl?: number
  ): Promise<void> {
    try {
      const result = await asyncFunction();
      this.set(key, result, ttl);
      console.log(`⚡ Precargado en caché: ${key}`);
    } catch (error) {
      console.error(`❌ Error al precargar: ${key}`, error);
    }
  }
}

// Instancia singleton del servicio de caché
export const cacheService = new CacheService();

// Claves de caché predefinidas para los diferentes tipos de datos
export const CACHE_KEYS = {
  // Alimentos
  FOODS_ALL: 'foods:all',
  FOODS_BY_CATEGORY: (category: string) => `foods:category:${category}`,
  FOOD_BY_ID: (id: string) => `food:${id}`,

  // Recetas
  RECIPES_ALL: 'recipes:all',
  RECIPES_BY_TAG: (tag: string) => `recipes:tag:${tag}`,
  RECIPE_BY_ID: (id: string) => `recipe:${id}`,

  // Planes de dieta
  DIET_PLANS_NUTRITIONIST: (nutritionistId: string) => `diet_plans:nutritionist:${nutritionistId}`,
  DIET_PLAN_BY_ID: (id: string) => `diet_plan:${id}`,
  DIET_PLANS_PATIENT: (patientId: string) => `diet_plans:patient:${patientId}`,

  // Pacientes
  PATIENTS_NUTRITIONIST: (nutritionistId: string) => `patients:nutritionist:${nutritionistId}`,
  PATIENT_BY_ID: (id: string) => `patient:${id}`,

  // Dashboard
  DASHBOARD_STATS: (nutritionistId: string) => `dashboard:stats:${nutritionistId}`,

  // Configuraciones del usuario
  USER_PREFERENCES: (userId: string) => `user:preferences:${userId}`} as const;

// TTL específicos para diferentes tipos de datos (en milisegundos)
export const CACHE_TTL = {
  VERY_SHORT: 1 * 60 * 1000,      // 1 minuto
  SHORT: 5 * 60 * 1000,           // 5 minutos
  MEDIUM: 15 * 60 * 1000,         // 15 minutos
  LONG: 60 * 60 * 1000,           // 1 hora
  VERY_LONG: 24 * 60 * 60 * 1000, // 24 horas
} as const; 