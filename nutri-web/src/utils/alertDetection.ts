// Sistema de detección y gestión de alertas de crecimiento pediátrico

export type AlertSeverity = 'critical' | 'warning' | 'normal';
export type AlertType = 'low_percentile' | 'high_percentile' | 'rapid_change' | 'normal';

export interface GrowthAlert {
    id: string;
    patientId: string;
    patientName: string;
    severity: AlertSeverity;
    type: AlertType;
    message: string;
    percentile: number;
    measurement: {
        weight: number;
        age: number; // en meses
        date: Date;
    };
    isAcknowledged: boolean;
    createdAt: Date;
}

/**
 * Detecta alertas basadas en percentiles
 */
export function detectPercentileAlert(
    percentile: number,
    patientId: string,
    patientName: string,
    weight: number,
    ageMonths: number
): GrowthAlert | null {
    let severity: AlertSeverity;
    let type: AlertType;
    let message: string;

    // Bajo peso
    if (percentile < 3) {
        severity = 'critical';
        type = 'low_percentile';
        message = `Bajo peso severo (P${percentile.toFixed(1)})`;
    } else if (percentile < 10) {
        severity = 'warning';
        type = 'low_percentile';
        message = `Bajo peso (P${percentile.toFixed(1)})`;
    }
    // Sobrepeso/Obesidad
    else if (percentile > 97) {
        severity = 'critical';
        type = 'high_percentile';
        message = `Obesidad (P${percentile.toFixed(1)})`;
    } else if (percentile > 90) {
        severity = 'warning';
        type = 'high_percentile';
        message = `Sobrepeso (P${percentile.toFixed(1)})`;
    }
    // Normal
    else {
        return null; // No generar alerta para rangos normales
    }

    return {
        id: `alert-${patientId}-${Date.now()}`,
        patientId,
        patientName,
        severity,
        type,
        message,
        percentile,
        measurement: {
            weight,
            age: ageMonths,
            date: new Date()
        },
        isAcknowledged: false,
        createdAt: new Date()
    };
}

/**
 * Obtiene el color del badge según la severidad
 */
export function getAlertColor(severity: AlertSeverity): string {
    switch (severity) {
        case 'critical':
            return 'danger';
        case 'warning':
            return 'warning';
        case 'normal':
            return 'success';
    }
}

/**
 * Obtiene el icono según la severidad
 */
export function getAlertIcon(severity: AlertSeverity): string {
    switch (severity) {
        case 'critical':
            return 'exclamation-triangle-fill';
        case 'warning':
            return 'exclamation-circle-fill';
        case 'normal':
            return 'check-circle-fill';
    }
}

/**
 * Gestión de alertas en localStorage
 */
const STORAGE_KEY = 'growthAlerts';

export function saveAlert(alert: GrowthAlert): void {
    const alerts = getStoredAlerts();

    // Evitar duplicados - reemplazar alerta existente del mismo paciente
    const filteredAlerts = alerts.filter(a => a.patientId !== alert.patientId);
    filteredAlerts.push(alert);

    localStorage.setItem(STORAGE_KEY, JSON.stringify(filteredAlerts));
}

export function getStoredAlerts(): GrowthAlert[] {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];

    try {
        const alerts = JSON.parse(stored);
        // Convertir fechas de string a Date
        return alerts.map((a: any) => ({
            ...a,
            createdAt: new Date(a.createdAt),
            measurement: {
                ...a.measurement,
                date: new Date(a.measurement.date)
            }
        }));
    } catch {
        return [];
    }
}

export function getActiveAlerts(): GrowthAlert[] {
    return getStoredAlerts().filter(a => !a.isAcknowledged);
}

export function getAlertsByPatient(patientId: string): GrowthAlert[] {
    return getStoredAlerts().filter(a => a.patientId === patientId);
}

export function acknowledgeAlert(alertId: string): void {
    const alerts = getStoredAlerts();
    const updated = alerts.map(a =>
        a.id === alertId ? { ...a, isAcknowledged: true } : a
    );
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
}

export function deleteAlert(alertId: string): void {
    const alerts = getStoredAlerts();
    const filtered = alerts.filter(a => a.id !== alertId);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
}

export function clearAllAlerts(): void {
    localStorage.removeItem(STORAGE_KEY);
}

/**
 * Obtiene estadísticas de alertas
 */
export function getAlertStats(): {
    total: number;
    critical: number;
    warning: number;
    unacknowledged: number;
} {
    const alerts = getStoredAlerts();
    const active = getActiveAlerts();

    return {
        total: alerts.length,
        critical: alerts.filter(a => a.severity === 'critical').length,
        warning: alerts.filter(a => a.severity === 'warning').length,
        unacknowledged: active.length
    };
}
