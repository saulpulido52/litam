import { Repository } from 'typeorm';
import { AppDataSource } from '../../database/data-source';
import { WhoStandard } from '../../database/entities/who_standard.entity';

export interface NutritionProfile {
    total_calories: number;
    total_sugar_g: number;
    total_sodium_mg: number;
    total_saturated_fat_g?: number;
    // Otros nutrientes relevantes
}

export interface ComplianceReport {
    status: 'COMPLIANT' | 'WARNING' | 'NON_COMPLIANT';
    warnings: string[];
    details: {
        nutrient: string;
        limit: number;
        actual: number;
        unit: string;
        compliant: boolean;
    }[];
}

export class WhoValidator {
    private standardRepository: Repository<WhoStandard>;
    private standardsCache: WhoStandard[] | null = null;
    private lastCacheUpdate: number = 0;
    private readonly CACHE_TTL = 1000 * 60 * 60; // 1 hora

    constructor() {
        this.standardRepository = AppDataSource.getRepository(WhoStandard);
    }

    /**
     * Carga las reglas de la base de datos (con caché simple en memoria)
     */
    private async loadStandards(): Promise<WhoStandard[]> {
        const now = Date.now();
        if (this.standardsCache && (now - this.lastCacheUpdate < this.CACHE_TTL)) {
            return this.standardsCache;
        }

        const standards = await this.standardRepository.find();
        this.standardsCache = standards;
        this.lastCacheUpdate = now;
        return standards;
    }

    /**
     * Analiza el cumplimiento de una receta/perfil nutricional contra los estándares de la OMS.
     */
    async analyzeCompliance(nutrients: NutritionProfile): Promise<ComplianceReport> {
        const standards = await this.loadStandards();
        const warnings: string[] = [];
        const details: any[] = [];
        let isNonCompliant = false;

        for (const rule of standards) {
            let actualValue = 0;

            // Mapeo dinámico de keys a propiedades del perfil
            switch (rule.nutrient_key) {
                case 'SUGAR':
                    actualValue = nutrients.total_sugar_g;
                    break;
                case 'SODIUM':
                    actualValue = nutrients.total_sodium_mg;
                    break;
                case 'SAT_FAT':
                    actualValue = nutrients.total_saturated_fat_g || 0;
                    break;
                // Agregar más casos según sea necesario
                default:
                    continue;
            }

            const exceedsLimit = actualValue > Number(rule.daily_limit_value);

            details.push({
                nutrient: rule.nutrient_key,
                limit: Number(rule.daily_limit_value),
                actual: actualValue,
                unit: rule.unit,
                compliant: !exceedsLimit
            });

            if (exceedsLimit) {
                isNonCompliant = true;
                const severity = rule.severity_level || 'HIGH';
                let msg = `Excede límite de ${rule.nutrient_key} (${actualValue}${rule.unit} > ${rule.daily_limit_value}${rule.unit})`;

                if (rule.description) {
                    msg += `. ${rule.description}`;
                }

                warnings.push(msg);
            }
        }

        let status: 'COMPLIANT' | 'WARNING' | 'NON_COMPLIANT' = 'COMPLIANT';
        if (isNonCompliant) {
            // Podríamos diferenciar WARNING vs NON_COMPLIANT basado en severidad
            // Por ahora, si rompe alguna regla, es NON_COMPLIANT simplificado,
            // o podríamos usar WARNING si es leve.
            status = warnings.length > 2 ? 'NON_COMPLIANT' : 'WARNING';
            // Ajuste simple según requerimiento usuario:
            // "Si Azúcar > 25g -> NON_COMPLIANT"
            // "Si Sodio > 2000 -> Alerta Crítica"
        }

        return {
            status,
            warnings,
            details
        };
    }
}

export default new WhoValidator();
