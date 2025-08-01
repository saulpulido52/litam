import { useState, useEffect, useCallback, useMemo } from 'react';
import { templateService } from '../services/templateService';
import type { 
    WeeklyPlanTemplate, 
    TemplateFilters, 
    CreateTemplateDto, 
    ApplyTemplateDto 
} from '../types/template';
import { useDebounce } from '../utils/optimizationUtils';

interface UseTemplatesReturn {
    // Estado
    templates: WeeklyPlanTemplate[];
    selectedTemplate: WeeklyPlanTemplate | null;
    loading: boolean;
    error: string | null;
    total: number;
    hasMore: boolean;

    // Acciones
    loadTemplates: (filters?: TemplateFilters) => Promise<void>;
    loadMoreTemplates: () => Promise<void>;
    getTemplateById: (id: string) => Promise<WeeklyPlanTemplate>;
    createTemplate: (data: CreateTemplateDto) => Promise<WeeklyPlanTemplate>;
    updateTemplate: (id: string, data: Partial<CreateTemplateDto>) => Promise<WeeklyPlanTemplate>;
    deleteTemplate: (id: string) => Promise<void>;
    applyTemplate: (data: ApplyTemplateDto) => Promise<any>;
    searchTemplates: (query: string) => void;
    clearError: () => void;
    selectTemplate: (template: WeeklyPlanTemplate | null) => void;
}

const TEMPLATES_PER_PAGE = 12;

export const useTemplates = (): UseTemplatesReturn => {
    // **ESTADO OPTIMIZADO**
    const [templates, setTemplates] = useState<WeeklyPlanTemplate[]>([]);
    const [selectedTemplate, setSelectedTemplate] = useState<WeeklyPlanTemplate | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [total, setTotal] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [currentFilters, setCurrentFilters] = useState<TemplateFilters>({});
    const [searchQuery, setSearchQuery] = useState('');

    // **DEBOUNCE** para búsquedas optimizadas
    const debouncedSearchQuery = useDebounce(searchQuery, 300);

    // **COMPUTED PROPERTIES**
    const hasMore = useMemo(() => {
        return templates.length < total;
    }, [templates.length, total]);

    // **FUNCIÓN PRINCIPAL**: Cargar plantillas
    const loadTemplates = useCallback(async (filters: TemplateFilters = {}) => {
        try {
            setLoading(true);
            setError(null);
            
            const finalFilters = {
                ...filters,
                page: 1,
                limit: TEMPLATES_PER_PAGE,
                ...(debouncedSearchQuery && { search: debouncedSearchQuery })
            };

            console.log('🔍 Cargando plantillas con filtros:', finalFilters);
            
            const response = await templateService.getTemplates(finalFilters);
            
            setTemplates(response.data);
            setTotal(response.pagination?.total || 0);
            setCurrentPage(1);
            setCurrentFilters(finalFilters);
            
            console.log(`✅ Cargadas ${response.data.length} plantillas de ${response.pagination?.total || 0} total`);
        } catch (err: any) {
            console.error('❌ Error cargando plantillas:', err);
            setError(err.message || 'Error al cargar las plantillas');
            setTemplates([]);
            setTotal(0);
        } finally {
            setLoading(false);
        }
    }, [debouncedSearchQuery]);

    // **PAGINACIÓN**: Cargar más plantillas
    const loadMoreTemplates = useCallback(async () => {
        if (!hasMore || loading) return;

        try {
            setLoading(true);
            
            const nextPage = currentPage + 1;
            const filters = {
                ...currentFilters,
                page: nextPage,
                limit: TEMPLATES_PER_PAGE
            };

            console.log(`📄 Cargando página ${nextPage} de plantillas`);
            
            const response = await templateService.getTemplates(filters);
            
            setTemplates(prev => [...prev, ...response.data]);
            setCurrentPage(nextPage);
            
            console.log(`✅ Agregadas ${response.data.length} plantillas más`);
        } catch (err: any) {
            console.error('❌ Error cargando más plantillas:', err);
            setError(err.message || 'Error al cargar más plantillas');
        } finally {
            setLoading(false);
        }
    }, [hasMore, loading, currentPage, currentFilters]);

    // **OBTENER PLANTILLA ESPECÍFICA**
    const getTemplateById = useCallback(async (id: string): Promise<WeeklyPlanTemplate> => {
        try {
            setLoading(true);
            setError(null);
            
            console.log(`🔍 Obteniendo plantilla ${id}`);
            
            const template = await templateService.getTemplateById(id);
            // setSelectedTemplate(template);
            
            console.log(`✅ Plantilla ${id} obtenida:`, template);
            return template as unknown as WeeklyPlanTemplate;
        } catch (err: any) {
            console.error(`❌ Error obteniendo plantilla ${id}:`, err);
            setError(err.message || 'Error al obtener la plantilla');
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    // **CREAR PLANTILLA**
    const createTemplate = useCallback(async (data: CreateTemplateDto): Promise<WeeklyPlanTemplate> => {
        try {
            setLoading(true);
            setError(null);
            
            console.log('📝 Creando nueva plantilla:', data.name);
            
            const newTemplate = await templateService.createTemplate(data);
            
            // Agregar al inicio de la lista local
            setTemplates(prev => [newTemplate as unknown as WeeklyPlanTemplate, ...prev]);
            setTotal(prev => prev + 1);
            
            console.log(`✅ Plantilla creada exitosamente`);
            return newTemplate as unknown as WeeklyPlanTemplate;
        } catch (err: any) {
            console.error('❌ Error creando plantilla:', err);
            setError(err.message || 'Error al crear la plantilla');
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    // **ACTUALIZAR PLANTILLA**
    const updateTemplate = useCallback(async (id: string, data: Partial<CreateTemplateDto>): Promise<WeeklyPlanTemplate> => {
        try {
            setLoading(true);
            setError(null);
            
            console.log(`📝 Actualizando plantilla ${id}`);
            
            const updatedTemplate = await templateService.updateTemplate(id, data);
            
            // Actualizar en la lista local
            setTemplates(prev => prev.map(t => t.id === id ? updatedTemplate as unknown as WeeklyPlanTemplate : t));
            
            // Actualizar seleccionada si coincide
            if (selectedTemplate?.id === id) {
                // setSelectedTemplate(updatedTemplate);
            }
            
            console.log(`✅ Plantilla ${id} actualizada exitosamente`);
            return updatedTemplate as unknown as WeeklyPlanTemplate;
        } catch (err: any) {
            console.error(`❌ Error actualizando plantilla ${id}:`, err);
            setError(err.message || 'Error al actualizar la plantilla');
            throw err;
        } finally {
            setLoading(false);
        }
    }, [selectedTemplate]);

    // **ELIMINAR PLANTILLA**
    const deleteTemplate = useCallback(async (id: string): Promise<void> => {
        try {
            setLoading(true);
            setError(null);
            
            console.log(`🗑️ Eliminando plantilla ${id}`);
            
            await templateService.deleteTemplate(id);
            
            // Remover de la lista local
            setTemplates(prev => prev.filter(t => t.id !== id));
            setTotal(prev => Math.max(0, prev - 1));
            
            // Limpiar selección si coincide
            if (selectedTemplate?.id === id) {
                setSelectedTemplate(null);
            }
            
            console.log(`✅ Plantilla ${id} eliminada exitosamente`);
        } catch (err: any) {
            console.error(`❌ Error eliminando plantilla ${id}:`, err);
            setError(err.message || 'Error al eliminar la plantilla');
            throw err;
        } finally {
            setLoading(false);
        }
    }, [selectedTemplate]);

    // **APLICAR PLANTILLA**
    const applyTemplate = useCallback(async (data: ApplyTemplateDto): Promise<any> => {
        try {
            setLoading(true);
            setError(null);
            
            console.log(`🎯 Aplicando plantilla ${data.templateId} al plan de dieta ${data.dietPlanId}`);
            
            const result = await templateService.applyTemplate(data);
            
            // Incrementar contador de uso local
            setTemplates(prev => prev.map(t => 
                t.id === data.templateId 
                    ? { ...t, usageCount: (t.usageCount || 0) + 1 }
                    : t
            ));
            
            console.log(`✅ Plantilla aplicada exitosamente: ${result.data?.mealsCreated || 0} comidas creadas`);
            return result;
        } catch (err: any) {
            console.error('❌ Error aplicando plantilla:', err);
            setError(err.message || 'Error al aplicar la plantilla');
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    // **BÚSQUEDA OPTIMIZADA**
    const searchTemplates = useCallback((query: string) => {
        console.log(`🔍 Búsqueda actualizada: "${query}"`);
        setSearchQuery(query);
        // El efecto de debouncedSearchQuery se encargará de recargar
    }, []);

    // **FUNCIONES DE UTILIDAD**
    const clearError = useCallback(() => {
        setError(null);
    }, []);

    const selectTemplate = useCallback((template: WeeklyPlanTemplate | null) => {
        setSelectedTemplate(template);
    }, []);

    // **EFECTO**: Recargar cuando cambie la búsqueda
    useEffect(() => {
        if (debouncedSearchQuery !== searchQuery) return; // Evitar recarga prematura
        
        loadTemplates(currentFilters);
    }, [debouncedSearchQuery]); // Solo cuando termine el debounce

    // **CARGAR INICIAL**
    useEffect(() => {
        loadTemplates();
    }, []); // Solo al montar

    return {
        // Estado
        templates,
        selectedTemplate,
        loading,
        error,
        total,
        hasMore,

        // Acciones
        loadTemplates,
        loadMoreTemplates,
        getTemplateById,
        createTemplate,
        updateTemplate,
        deleteTemplate,
        applyTemplate,
        searchTemplates,
        clearError,
        selectTemplate
    };
}; 