// Cálculos de percentiles usando método LMS (Lambda-Mu-Sigma)
// Datos aproximados de WHO para peso-edad (0-5 años)

export interface LMSData {
    age: number; // meses
    L: number;
    M: number;
    S: number;
}

// Datos WHO simplificados para Peso-Edad (niños)
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

export function calculateWeightForAgePercentile(
    ageMonths: number,
    weight: number,
    gender: 'male' | 'female'
): { percentile: number; zScore: number; interpretation: string } {
    const data = gender === 'male' ? WHO_WEIGHT_FOR_AGE_BOYS : WHO_WEIGHT_FOR_AGE_GIRLS;
    const lms = interpolateLMS(ageMonths, data);

    const zScore = calculateZScore(weight, lms.L, lms.M, lms.S);
    const percentile = zScoreToPercentile(zScore);

    let interpretation = '';
    if (percentile < 3) {
        interpretation = 'Bajo peso severo';
    } else if (percentile < 10) {
        interpretation = 'Bajo peso';
    } else if (percentile < 25) {
        interpretation = 'Peso bajo-normal';
    } else if (percentile <= 75) {
        interpretation = 'Peso normal';
    } else if (percentile <= 90) {
        interpretation = 'Peso alto-normal';
    } else if (percentile <= 97) {
        interpretation = 'Sobrepeso';
    } else {
        interpretation = 'Obesidad';
    }

    return { percentile, zScore, interpretation };
}

export function generatePercentileCurves(gender: 'male' | 'female', maxAge: number = 60) {
    const data = gender === 'male' ? WHO_WEIGHT_FOR_AGE_BOYS : WHO_WEIGHT_FOR_AGE_GIRLS;
    const curves: any[] = [];
    const percentiles = [3, 10, 25, 50, 75, 90, 97];

    for (let age = 0; age <= maxAge; age++) {
        const lms = interpolateLMS(age, data);
        const point: any = { age };

        percentiles.forEach(p => {
            const zScore = percentileToZScore(p);
            const weight = lms.M * Math.pow(1 + lms.L * lms.S * zScore, 1 / lms.L);
            point[`p${p}`] = weight;
        });

        curves.push(point);
    }

    return curves;
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
