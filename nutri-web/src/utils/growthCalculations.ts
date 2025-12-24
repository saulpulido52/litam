// Cálculos de percentiles usando método LMS (Lambda-Mu-Sigma)
// Datos WHO (0-5 años) y CDC (5-18 años)

export interface LMSData {
    age: number; // meses
    L: number;
    M: number;
    S: number;
}

export type MetricType = 'weight' | 'height';
export type Standard = 'WHO' | 'CDC';

// ============================================
// PESO-PARA-EDAD (Weight-for-Age)
// ============================================

// WHO Peso-Edad Niños (0-60 meses)
export const WHO_WEIGHT_FOR_AGE_BOYS: LMSData[] = [
    { age: 0, L: 0.3487, M: 3.3464, S: 0.14602 },
    { age: 1, L: 0.2297, M: 4.4709, S: 0.13395 },
    { age: 2, L: 0.1970, M: 5.5675, S: 0.12385 },
    { age: 3, L: 0.1738, M: 6.3762, S: 0.11727 },
    { age: 6, L: 0.1395, M: 7.9340, S: 0.11316 },
    { age: 12, L: 0.1515, M: 9.6479, S: 0.11727 },
    { age: 18, L: 0.1600, M: 10.9473, S: 0.12153 },
    { age: 24, L: 0.1649, M: 12.1515, S: 0.12555 },
    { age: 36, L: 0.1738, M: 14.3309, S: 0.13301 },
    { age: 48, L: 0.1777, M: 16.3388, S: 0.13987 },
    { age: 60, L: 0.1780, M: 18.2697, S: 0.14638 }
];

export const WHO_WEIGHT_FOR_AGE_GIRLS: LMSData[] = [
    { age: 0, L: 0.3809, M: 3.2322, S: 0.14171 },
    { age: 1, L: 0.1714, M: 4.1873, S: 0.13724 },
    { age: 2, L: 0.0962, M: 5.1282, S: 0.13000 },
    { age: 3, L: 0.0402, M: 5.8458, S: 0.12619 },
    { age: 6, L: -0.0430, M: 7.2115, S: 0.12274 },
    { age: 12, L: 0.0097, M: 8.9481, S: 0.12634 },
    { age: 18, L: 0.0600, M: 10.2051, S: 0.13043 },
    { age: 24, L: 0.0941, M: 11.2873, S: 0.13449 },
    { age: 36, L: 0.1453, M: 13.4515, S: 0.14214 },
    { age: 48, L: 0.1777, M: 15.4235, S: 0.14930 },
    { age: 60, L: 0.1947, M: 17.3677, S: 0.15615 }
];

// CDC Peso-Edad Niños (60-216 meses / 5-18 años)
export const CDC_WEIGHT_FOR_AGE_BOYS: LMSData[] = [
    { age: 60, L: -1.5, M: 18.4, S: 0.12 },
    { age: 72, L: -1.6, M: 20.7, S: 0.13 },
    { age: 84, L: -1.7, M: 23.1, S: 0.14 },
    { age: 96, L: -1.8, M: 25.6, S: 0.15 },
    { age: 108, L: -1.9, M: 28.4, S: 0.16 },
    { age: 120, L: -2.0, M: 32.5, S: 0.17 },
    { age: 132, L: -2.1, M: 36.9, S: 0.18 },
    { age: 144, L: -2.2, M: 41.7, S: 0.19 },
    { age: 156, L: -2.3, M: 47.0, S: 0.19 },
    { age: 168, L: -2.4, M: 52.6, S: 0.20 },
    { age: 180, L: -2.5, M: 57.8, S: 0.20 },
    { age: 192, L: -2.6, M: 62.1, S: 0.21 },
    { age: 204, L: -2.6, M: 65.3, S: 0.21 },
    { age: 216, L: -2.7, M: 68.0, S: 0.21 }
];

export const CDC_WEIGHT_FOR_AGE_GIRLS: LMSData[] = [
    { age: 60, L: -1.4, M: 17.9, S: 0.13 },
    { age: 72, L: -1.5, M: 20.0, S: 0.14 },
    { age: 84, L: -1.6, M: 22.4, S: 0.15 },
    { age: 96, L: -1.7, M: 25.2, S: 0.16 },
    { age: 108, L: -1.8, M: 28.5, S: 0.17 },
    { age: 120, L: -1.9, M: 32.4, S: 0.18 },
    { age: 132, L: -2.0, M: 36.9, S: 0.19 },
    { age: 144, L: -2.1, M: 41.5, S: 0.19 },
    { age: 156, L: -2.2, M: 46.0, S: 0.20 },
    { age: 168, L: -2.2, M: 50.2, S: 0.20 },
    { age: 180, L: -2.3, M: 53.7, S: 0.21 },
    { age: 192, L: -2.3, M: 56.4, S: 0.21 },
    { age: 204, L: -2.3, M: 58.3, S: 0.21 },
    { age: 216, L: -2.3, M: 59.5, S: 0.21 }
];

// ============================================
// TALLA-PARA-EDAD (Height-for-Age)
// ============================================

// WHO Talla-Edad Niños (0-60 meses)
export const WHO_HEIGHT_FOR_AGE_BOYS: LMSData[] = [
    { age: 0, L: 1, M: 49.9, S: 0.03795 },
    { age: 1, L: 1, M: 54.7, S: 0.03557 },
    { age: 2, L: 1, M: 58.4, S: 0.03424 },
    { age: 3, L: 1, M: 61.4, S: 0.03486 },
    { age: 6, L: 1, M: 67.6, S: 0.03449 },
    { age: 12, L: 1, M: 75.7, S: 0.03502 },
    { age: 18, L: 1, M: 82.3, S: 0.03579 },
    { age: 24, L: 1, M: 87.1, S: 0.03647 },
    { age: 36, L: 1, M: 96.1, S: 0.03777 },
    { age: 48, L: 1, M: 103.3, S: 0.03883 },
    { age: 60, L: 1, M: 109.9, S: 0.03975 }
];

export const WHO_HEIGHT_FOR_AGE_GIRLS: LMSData[] = [
    { age: 0, L: 1, M: 49.1, S: 0.03790 },
    { age: 1, L: 1, M: 53.7, S: 0.03560 },
    { age: 2, L: 1, M: 57.1, S: 0.03431 },
    { age: 3, L: 1, M: 59.8, S: 0.03500 },
    { age: 6, L: 1, M: 65.7, S: 0.03471 },
    { age: 12, L: 1, M: 74.0, S: 0.03522 },
    { age: 18, L: 1, M: 80.7, S: 0.03596 },
    { age: 24, L: 1, M: 86.4, S: 0.03666 },
    { age: 36, L: 1, M: 95.1, S: 0.03789 },
    { age: 48, L: 1, M: 102.7, S: 0.03897 },
    { age: 60, L: 1, M: 109.4, S: 0.03989 }
];

// CDC Talla-Edad Niños (60-216 meses / 5-18 años)
export const CDC_HEIGHT_FOR_AGE_BOYS: LMSData[] = [
    { age: 60, L: 1, M: 109.2, S: 0.0395 },
    { age: 72, L: 1, M: 115.5, S: 0.0405 },
    { age: 84, L: 1, M: 121.9, S: 0.0415 },
    { age: 96, L: 1, M: 128.0, S: 0.0425 },
    { age: 108, L: 1, M: 133.8, S: 0.0435 },
    { age: 120, L: 1, M: 139.4, S: 0.0445 },
    { age: 132, L: 1, M: 145.2, S: 0.0455 },
    { age: 144, L: 1, M: 151.8, S: 0.0465 },
    { age: 156, L: 1, M: 159.4, S: 0.0475 },
    { age: 168, L: 1, M: 166.7, S: 0.0480 },
    { age: 180, L: 1, M: 172.3, S: 0.0485 },
    { age: 192, L: 1, M: 175.8, S: 0.0488 },
    { age: 204, L: 1, M: 177.6, S: 0.0490 },
    { age: 216, L: 1, M: 178.5, S: 0.0491 }
];

export const CDC_HEIGHT_FOR_AGE_GIRLS: LMSData[] = [
    { age: 60, L: 1, M: 108.9, S: 0.0398 },
    { age: 72, L: 1, M: 115.0, S: 0.0408 },
    { age: 84, L: 1, M: 121.3, S: 0.0418 },
    { age: 96, L: 1, M: 127.5, S: 0.0428 },
    { age: 108, L: 1, M: 133.6, S: 0.0438 },
    { age: 120, L: 1, M: 139.8, S: 0.0448 },
    { age: 132, L: 1, M: 146.8, S: 0.0458 },
    { age: 144, L: 1, M: 154.7, S: 0.0465 },
    { age: 156, L: 1, M: 160.9, S: 0.0470 },
    { age: 168, L: 1, M: 163.2, S: 0.0472 },
    { age: 180, L: 1, M: 163.7, S: 0.0473 },
    { age: 192, L: 1, M: 163.8, S: 0.0473 },
    { age: 204, L: 1, M: 163.8, S: 0.0473 },
    { age: 216, L: 1, M: 163.8, S: 0.0473 }
];

// ============================================
// FUNCIONES AUXILIARES
// ============================================

export function calculateZScore(value: number, L: number, M: number, S: number): number {
    if (L !== 0) {
        return (Math.pow(value / M, L) - 1) / (L * S);
    } else {
        return Math.log(value / M) / S;
    }
}

export function zScoreToPercentile(zScore: number): number {
    const cdf = (x: number): number => {
        const t = 1 / (1 + 0.2316419 * Math.abs(x));
        const d = 0.3989423 * Math.exp(-x * x / 2);
        const p = d * t * (0.3193815 + t * (-0.3565638 + t * (1.781478 + t * (-1.821256 + t * 1.330274))));
        return x > 0 ? 1 - p : p;
    };
    return cdf(zScore) * 100;
}

function interpolateLMS(age: number, data: LMSData[]): LMSData {
    if (age <= data[0].age) return data[0];
    if (age >= data[data.length - 1].age) return data[data.length - 1];

    for (let i = 0; i < data.length - 1; i++) {
        if (age >= data[i].age && age <= data[i + 1].age) {
            const t = (age - data[i].age) / (data[i + 1].age - data[i].age);
            return {
                age,
                L: data[i].L + t * (data[i + 1].L - data[i].L),
                M: data[i].M + t * (data[i + 1].M - data[i].M),
                S: data[i].S + t * (data[i + 1].S - data[i].S)
            };
        }
    }
    return data[0];
}

function percentileToZScore(percentile: number): number {
    const p = percentile / 100;
    if (p <= 0 || p >= 1) return 0;

    const t = Math.sqrt(-2 * Math.log(Math.min(p, 1 - p)));
    const c0 = 2.515517;
    const c1 = 0.802853;
    const c2 = 0.010328;
    const d1 = 1.432788;
    const d2 = 0.189269;
    const d3 = 0.001308;

    const z = t - (c0 + c1 * t + c2 * t * t) / (1 + d1 * t + d2 * t * t + d3 * t * t * t);

    return p < 0.5 ? -z : z;
}

// ============================================
// FUNCIONES PRINCIPALES
// ============================================

function selectStandard(ageMonths: number): Standard {
    // WHO: 0-60 meses (0-5 años)
    // CDC: 61-216 meses (5-18 años)
    return ageMonths <= 60 ? 'WHO' : 'CDC';
}

function getLMSData(metric: MetricType, standard: Standard, gender: 'male' | 'female'): LMSData[] {
    if (metric === 'weight') {
        if (standard === 'WHO') {
            return gender === 'male' ? WHO_WEIGHT_FOR_AGE_BOYS : WHO_WEIGHT_FOR_AGE_GIRLS;
        } else {
            return gender === 'male' ? CDC_WEIGHT_FOR_AGE_BOYS : CDC_WEIGHT_FOR_AGE_GIRLS;
        }
    } else { // height
        if (standard === 'WHO') {
            return gender === 'male' ? WHO_HEIGHT_FOR_AGE_BOYS : WHO_HEIGHT_FOR_AGE_GIRLS;
        } else {
            return gender === 'male' ? CDC_HEIGHT_FOR_AGE_BOYS : CDC_HEIGHT_FOR_AGE_GIRLS;
        }
    }
}

function interpretPercentile(percentile: number, metric: MetricType): string {
    if (metric === 'weight') {
        if (percentile < 3) return 'Bajo peso severo';
        if (percentile < 10) return 'Bajo peso';
        if (percentile < 25) return 'Peso bajo-normal';
        if (percentile <= 75) return 'Peso normal';
        if (percentile <= 90) return 'Peso alto-normal';
        if (percentile <= 97) return 'Sobrepeso';
        return 'Obesidad';
    } else { // height
        if (percentile < 3) return 'Talla muy baja';
        if (percentile < 10) return 'Talla baja';
        if (percentile < 25) return 'Talla bajo-normal';
        if (percentile <= 75) return 'Talla normal';
        if (percentile <= 90) return 'Talla alto-normal';
        if (percentile <= 97) return 'Talla alta';
        return 'Talla muy alta';
    }
}

export function calculatePercentile(
    ageMonths: number,
    value: number,
    gender: 'male' | 'female',
    metric: MetricType
): {
    percentile: number;
    zScore: number;
    interpretation: string;
    standard: Standard;
} {
    const standard = selectStandard(ageMonths);
    const lmsData = getLMSData(metric, standard, gender);
    const lms = interpolateLMS(ageMonths, lmsData);

    const zScore = calculateZScore(value, lms.L, lms.M, lms.S);
    const percentile = zScoreToPercentile(zScore);
    const interpretation = interpretPercentile(percentile, metric);

    return { percentile, zScore, interpretation, standard };
}

// Mantener compatibilidad con código existente
export function calculateWeightForAgePercentile(
    ageMonths: number,
    weight: number,
    gender: 'male' | 'female'
): { percentile: number; zScore: number; interpretation: string } {
    const result = calculatePercentile(ageMonths, weight, gender, 'weight');
    return {
        percentile: result.percentile,
        zScore: result.zScore,
        interpretation: result.interpretation
    };
}

export function generatePercentileCurves(
    gender: 'male' | 'female',
    metric: MetricType = 'weight',
    maxAge: number = 216
) {
    const curves: any[] = [];
    const percentiles = [3, 10, 25, 50, 75, 90, 97];

    for (let age = 0; age <= maxAge; age++) {
        const standard = selectStandard(age);
        const lmsData = getLMSData(metric, standard, gender);
        const lms = interpolateLMS(age, lmsData);
        const point: any = { age };

        percentiles.forEach(p => {
            const zScore = percentileToZScore(p);
            const value = lms.M * Math.pow(1 + lms.L * lms.S * zScore, 1 / lms.L);
            point[`p${p}`] = value;
        });

        curves.push(point);
    }

    return curves;
}
