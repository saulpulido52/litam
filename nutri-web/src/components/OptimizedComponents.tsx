// @jsxImportSource react
// Este comentario fuerza el modo JSX correcto para TypeScript y soluciona errores con hooks genéricos
import React, { useCallback, useMemo, useState, useEffect } from 'react';

// Componente optimizado para formularios
export const OptimizedFormField = React.memo(({
  label,
  type = 'text',
  value,
  onChange,
  error,
  required = false,
  placeholder,
  id,
  name,
  disabled = false,
  className = '',
  ...props
}: {
  label: string;
  type?: string;
  value: string | number;
  onChange: (value: string | number) => void;
  error?: string;
  required?: boolean;
  placeholder?: string;
  id: string;
  name: string;
  disabled?: boolean;
  className?: string;
}) => {
  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = type === 'number' ? Number(e.target.value) : e.target.value;
    onChange(newValue);
  }, [onChange, type]);

  const fieldId = useMemo(() => id || name, [id, name]);

  return (
    <div className={`form-group ${className}`}>
      <label className="form-label" htmlFor={fieldId}>
        {label} {required && <span className="text-danger">*</span>}
      </label>
      <input
        type={type}
        className={`form-control ${error ? 'is-invalid' : ''}`}
        id={fieldId}
        name={name}
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        disabled={disabled}
        required={required}
        {...props}
      />
      {error && <div className="invalid-feedback">{error}</div>}
    </div>
  );
});

// Componente optimizado para botones
export const OptimizedButton = React.memo(({
  children,
  onClick,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  className = '',
  type = 'button',
  ...props
}: {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  className?: string;
  type?: 'button' | 'submit' | 'reset';
}) => {
  const handleClick = useCallback(() => {
    if (!disabled && !loading && onClick) {
      onClick();
    }
  }, [onClick, disabled, loading]);

  const buttonClasses = useMemo(() => {
    const baseClass = `btn btn-${variant} btn-${size}`;
    const loadingClass = loading ? 'disabled' : '';
    return `${baseClass} ${loadingClass} ${className}`.trim();
  }, [variant, size, loading, className]);

  return (
    <button
      type={type}
      className={buttonClasses}
      onClick={handleClick}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true" />
      )}
      {children}
    </button>
  );
});

// Componente optimizado para cards
export const OptimizedCard = React.memo(({
  title,
  children,
  footer,
  className = '',
  headerActions,
  collapsible = false,
  defaultCollapsed = false,
  ...props
}: {
  title?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
  headerActions?: React.ReactNode;
  collapsible?: boolean;
  defaultCollapsed?: boolean;
}) => {
  const [isCollapsed, setIsCollapsed] = useState(defaultCollapsed);

  const toggleCollapse = useCallback(() => {
    setIsCollapsed(prev => !prev);
  }, []);

  const cardClasses = useMemo(() => {
    return `card ${className}`.trim();
  }, [className]);

  return (
    <div className={cardClasses} {...props}>
      {(title || headerActions) && (
        <div className="card-header d-flex justify-content-between align-items-center">
          <h6 className="mb-0">
            {collapsible && (
              <button
                type="button"
                className="btn btn-link btn-sm p-0 me-2"
                onClick={toggleCollapse}
              >
                {isCollapsed ? '▶' : '▼'}
              </button>
            )}
            {title}
          </h6>
          {headerActions && (
            <div className="card-header-actions">
              {headerActions}
            </div>
          )}
        </div>
      )}
      {(!collapsible || !isCollapsed) && (
        <div className="card-body">
          {children}
        </div>
      )}
      {footer && (
        <div className="card-footer">
          {footer}
        </div>
      )}
    </div>
  );
});

// Hook optimizado para formularios
export const useOptimizedForm = <T extends Record<string, any>>(initialData: T) => {
  const [formData, setFormData] = useState<T>(initialData);
  const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({});
  const [isDirty, setIsDirty] = useState(false);

  const updateField = useCallback((field: keyof T, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setIsDirty(true);
    
    // Limpiar error del campo si existe
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  }, [errors]);

  const updateFields = useCallback((updates: Partial<T>) => {
    setFormData(prev => ({ ...prev, ...updates }));
    setIsDirty(true);
  }, []);

  const setError = useCallback((field: keyof T, error: string) => {
    setErrors(prev => ({ ...prev, [field]: error }));
  }, []);

  const clearErrors = useCallback(() => {
    setErrors({});
  }, []);

  const reset = useCallback(() => {
    setFormData(initialData);
    setErrors({});
    setIsDirty(false);
  }, [initialData]);

  const isValid = useMemo(() => {
    return Object.keys(errors).length === 0;
  }, [errors]);

  return {
    formData,
    errors,
    isDirty,
    isValid,
    updateField,
    updateFields,
    setError,
    clearErrors,
    reset
  };
};

// Hook optimizado para loading states
export const useOptimizedLoading = () => {
  const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>({});

  const setLoading = useCallback((key: string, isLoading: boolean) => {
    setLoadingStates(prev => ({ ...prev, [key]: isLoading }));
  }, []);

  const isLoading = useCallback((key: string) => {
    return loadingStates[key] || false;
  }, [loadingStates]);

  const isAnyLoading = useMemo(() => {
    return Object.values(loadingStates).some(Boolean);
  }, [loadingStates]);

  return {
    setLoading,
    isLoading,
    isAnyLoading
  };
};

// Hook optimizado para debouncing
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

// Hook optimizado para infinite scroll
export const useInfiniteScroll = (
  loadMore: () => Promise<void>,
  hasMore: boolean,
  threshold = 100
) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleScroll = useCallback(async () => {
    if (isLoading || !hasMore) return;

    const scrollTop = window.pageYOffset;
    const windowHeight = window.innerHeight;
    const documentHeight = document.documentElement.scrollHeight;

    if (scrollTop + windowHeight >= documentHeight - threshold) {
      setIsLoading(true);
      try {
        await loadMore();
      } finally {
        setIsLoading(false);
      }
    }
  }, [loadMore, hasMore, isLoading, threshold]);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  return { isLoading };
};

// Componente optimizado para listas virtuales
export const OptimizedVirtualList = React.memo(({
  items,
  renderItem,
  itemHeight = 50,
  containerHeight = 400,
  overscan = 5,
  ...props
}: {
  items: any[];
  renderItem: (item: any, index: number) => React.ReactNode;
  itemHeight: number;
  containerHeight: number;
  overscan?: number;
}) => {
  const [scrollTop, setScrollTop] = useState(0);

  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop);
  }, []);

  const visibleRange = useMemo(() => {
    const start = Math.floor(scrollTop / itemHeight);
    const end = Math.min(
      start + Math.ceil(containerHeight / itemHeight) + overscan,
      items.length
    );
    return { start: Math.max(0, start - overscan), end };
  }, [scrollTop, itemHeight, containerHeight, overscan, items.length]);

  const visibleItems = useMemo(() => {
    return items.slice(visibleRange.start, visibleRange.end);
  }, [items, visibleRange]);

  const totalHeight = items.length * itemHeight;
  const offsetY = visibleRange.start * itemHeight;

  return (
    <div
      style={{ height: containerHeight, overflow: 'auto' }}
      onScroll={handleScroll}
      {...props}
    >
      <div style={{ height: totalHeight, position: 'relative' }}>
        <div style={{ transform: `translateY(${offsetY}px)` }}>
          {visibleItems.map((item, index) => (
            <div key={visibleRange.start + index} style={{ height: itemHeight }}>
              {renderItem(item, visibleRange.start + index)}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
});

// Componente optimizado para modales
export const OptimizedModal = React.memo(({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  backdrop = true,
  keyboard = true,
  className = '',
  ...props
}: {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  backdrop?: boolean;
  keyboard?: boolean;
  className?: string;
}) => {
  const handleBackdropClick = useCallback((e: React.MouseEvent) => {
    if (backdrop && e.target === e.currentTarget) {
      onClose();
    }
  }, [backdrop, onClose]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (keyboard && e.key === 'Escape') {
      onClose();
    }
  }, [keyboard, onClose]);

  useEffect(() => {
    if (isOpen && keyboard) {
      document.addEventListener('keydown', handleKeyDown as any);
      return () => document.removeEventListener('keydown', handleKeyDown as any);
    }
  }, [isOpen, keyboard, handleKeyDown]);

  if (!isOpen) return null;

  return (
    <div
      className={`modal fade show d-block ${className}`}
      style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
      onClick={handleBackdropClick}
      onKeyDown={handleKeyDown}
      tabIndex={-1}
      {...props}
    >
      <div className={`modal-dialog modal-${size}`}>
        <div className="modal-content">
          {title && (
            <div className="modal-header">
              <h5 className="modal-title">{title}</h5>
              <button
                type="button"
                className="btn-close"
                onClick={onClose}
                aria-label="Close"
              />
            </div>
          )}
          <div className="modal-body">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}); 